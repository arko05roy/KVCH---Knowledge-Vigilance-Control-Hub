import "server-only";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ZkConfig } from "./config";
import type { ZkRepository } from "./repository";
import { runPipeline, ZkPipelineError } from "./runner";

const CIRCUIT_BY_KIND: Record<string, string> = {
  threat: "threat_eligibility",
  risk: "stakeholder_risk_band",
  endorsement: "peer_endorsement",
  inclusion: "evidence_inclusion",
};

function verifierKeys(config: ZkConfig): string[] {
  const raw = readFileSync(config.verifierKeysFile, "utf8");
  const env = Object.fromEntries(
    raw
      .split("\n")
      .filter((l) => l.includes("="))
      .map((l) => l.split("=")),
  );
  return [1, 2, 3, 4]
    .slice(0, config.verifierCount)
    .map((i) => env[`VERIFIER_KEY_${i}`])
    .filter(Boolean);
}

/** prove + bundle stage: runs the circuit fixture and writes the bundle. */
export async function runProveStage(repo: ZkRepository, config: ZkConfig, jobId: string): Promise<void> {
  const job = await repo.getProofJob(jobId);
  if (!job) throw new Error(`job ${jobId} not found`);
  const circuit = CIRCUIT_BY_KIND[job.claimKind];
  if (!circuit) throw new Error(`unknown claim kind ${job.claimKind}`);

  await repo.transitionJob(jobId, "queued", "proving");
  try {
    await runPipeline(config, ["prove", "--circuit", circuit]);
    await repo.transitionJob(jobId, "proving", "verifying");

    const bundle = await runPipeline<{
      ok: boolean; bundlePath: string; bundleDigest: string; bundleRefDigest: string;
      artifactDigest: string; vkDigest: string; policyDigest: string;
      named: Record<string, string>;
    }>(config, ["bundle", "--circuit", circuit]);

    const body = JSON.parse(readFileSync(bundle.bundlePath, "utf8"));
    await repo.saveBundle(jobId, bundle.bundleDigest, bundle.bundleRefDigest, body, body.proof.byteLength);
    await repo.db.zkProofJob.update({ where: { id: jobId }, data: { bundleDigest: bundle.bundleDigest } });
    await repo.transitionJob(jobId, "verifying", "attestating");
  } catch (e) {
    await repo.failJob(
      jobId,
      e instanceof ZkPipelineError ? e.code : "STAGE_ERROR",
      e instanceof Error ? `${e.message}\n${e instanceof ZkPipelineError ? e.stderr : ""}` : String(e),
    );
    throw e;
  }
}

/** attest stage: N independent verifier attestations over the bundle. */
export async function runAttestStage(repo: ZkRepository, config: ZkConfig, jobId: string): Promise<void> {
  const job = await repo.getProofJob(jobId);
  if (!job?.bundle) throw new Error(`job ${jobId} has no bundle`);
  const circuit = CIRCUIT_BY_KIND[job.claimKind];
  const mode = job.claimKind === "endorsement" ? "endorsement" : "claim";

  try {
    const keys = verifierKeys(config);
    const results: unknown[] = [];
    for (const key of keys) {
      const r = await runPipeline<{
        ok: boolean;
        attestation: {
          verifier: string; decision: number; reasonCode: number;
          nonce: string; issuedAt: number; deadline: number; signature: string;
        };
        domain: unknown; types: unknown; primaryType: string; message: Record<string, unknown>;
      }>(config, [
        "attest",
        "--circuit", circuit,
        "--mode", mode,
        "--deployment", config.deploymentManifest,
        "--key", key,
      ]);
      const claimId =
        mode === "endorsement"
          ? String(r.message.targetClaimId ?? "")
          : String(r.message.claimId ?? "");
      await repo.saveAttestation(jobId, claimId, {
        verifier: r.attestation.verifier,
        decision: r.attestation.decision,
        reasonCode: r.attestation.reasonCode,
        nonce: String(r.attestation.nonce),
        issuedAt: BigInt(r.attestation.issuedAt),
        deadline: BigInt(r.attestation.deadline),
        signature: r.attestation.signature,
        digest: "",
      });
      results.push(r);
    }
    // Persist the aggregated attestation set for the publish stage.
    const dir = path.join(config.zkWorkspaceDir, "bundles");
    const attsFile = path.join(dir, `${jobId}.atts.json`);
    writeFileSync(
      attsFile,
      JSON.stringify(results, (_k, v) => (typeof v === "bigint" ? `0xBI${v.toString(10)}` : v)),
    );
    await repo.db.zkProofJob.update({
      where: { id: jobId },
      data: { expectedDigest: attsFile },
    });
    await repo.transitionJob(jobId, "attestating", "publishing");
  } catch (e) {
    await repo.failJob(
      jobId,
      e instanceof ZkPipelineError ? e.code : "STAGE_ERROR",
      e instanceof Error ? `${e.message}\n${e instanceof ZkPipelineError ? e.stderr : ""}` : String(e),
    );
    throw e;
  }
}

/** Decodes the pipeline's BigInt encoding (`0xBI<decimal>`) plus plain values. */
const dec = (v: unknown): string =>
  typeof v === "string" && v.startsWith("0xBI") ? v.slice(4) : String(v ?? "0");

/** publish stage: header → on-chain check → submit (or adopt) → records.
 *  Idempotent: a claim already anchored on-chain is adopted instead of
 *  resubmitted, so retries after a partially successful attempt succeed. */
export async function runPublishStage(repo: ZkRepository, config: ZkConfig, jobId: string): Promise<void> {
  const job = await repo.getProofJob(jobId);
  if (!job?.bundle) throw new Error(`job ${jobId} has no bundle`);
  const circuit = CIRCUIT_BY_KIND[job.claimKind];
  const mode = job.claimKind === "endorsement" ? "endorsement" : "claim";
  if (!config.publisherKey) throw new Error("ZK_PUBLISHER_KEY not configured");

  const bundleFile = path.join(config.zkWorkspaceDir, `bundles/${circuit}.bundle.json`);
  const attsFile = job.expectedDigest;
  if (!attsFile) throw new Error(`job ${jobId} missing attestation file`);
  const named = (job.bundle.body as { publicInputs: { named: Record<string, string> } }).publicInputs.named;

  try {
    const hr = await runPipeline<{ ok: boolean; header: Record<string, unknown> }>(config, [
      "header", "--mode", mode,
      "--deployment", config.deploymentManifest,
      "--bundle-file", bundleFile,
    ]);
    const header = hr.header;
    const entityId = String(mode === "claim" ? header.claimId : header.endorsementId);

    let txHash: string | null = null;
    let blockNumber: bigint | null = null;
    let adopted = false;

    if (mode === "claim") {
      const cr = await runPipeline<{ ok: boolean; active: boolean }>(config, [
        "claim", "--deployment", config.deploymentManifest,
        "--rpc", config.rpcUrl, "--chain-id", String(config.chainId),
        "--claim-id", entityId,
      ]);
      adopted = cr.active;
    }

    if (!adopted) {
      try {
        const r = await runPipeline<{
          ok: boolean; txHash: string; blockNumber: number; status: string;
        }>(config, [
          "publish",
          "--mode", mode,
          "--deployment", config.deploymentManifest,
          "--rpc", config.rpcUrl,
          "--chain-id", String(config.chainId),
          "--key", config.publisherKey,
          "--bundle-file", bundleFile,
          "--atts-file", attsFile,
        ]);
        txHash = r.txHash;
        blockNumber = BigInt(r.blockNumber);
      } catch (e) {
        // The tx may have landed before the error surfaced (retry race) —
        // adopt the on-chain record instead of failing the job.
        const exists =
          mode === "claim" &&
          (await runPipeline<{ ok: boolean; active: boolean }>(config, [
            "claim", "--deployment", config.deploymentManifest,
            "--rpc", config.rpcUrl, "--chain-id", String(config.chainId),
            "--claim-id", entityId,
          ]).then((c) => c.active).catch(() => false));
        if (!exists) throw e;
        adopted = true;
      }
    }

    if (mode === "claim") {
      const existing = await repo.getClaim(entityId);
      if (!existing) {
        await repo.createClaim({
          claimId: entityId,
          jobId,
          companyId: job.companyId,
          claimSeriesId: String(named.claim_series_id ?? "0x"),
          claimVersion: Number(named.claim_version ?? 1),
          issuerCompanyCode: BigInt(dec(named.issuer_company_code)),
          bundleDigest: job.bundle.bundleDigest,
          publicInputDigest: String(named.public_input_digest ?? "0x"),
          disclosureNullifier: String(named.disclosure_nullifier ?? "0x"),
          councilSetId: BigInt(dec(header.councilSetId)),
          expiryEpoch: BigInt(dec(header.expiryEpoch)),
          txHash,
          blockNumber,
        });
      }
      const row = await repo.getClaim(entityId);
      if (row && row.status === "pending") {
        await repo.transitionClaim(entityId, "anchored", {
          chainStatus: "confirmed",
          anchoredAt: new Date(),
        });
      } else if (row) {
        await repo.db.zkClaim.update({ where: { claimId: entityId }, data: { chainStatus: "confirmed" } });
      }
    } else {
      const existing = await repo.db.zkEndorsement.findUnique({ where: { endorsementId: entityId } });
      if (!existing) {
        await repo.createEndorsement({
          endorsementId: entityId,
          jobId,
          targetClaimId: String(header.targetClaimId),
          endorserCompanyCode: BigInt(dec(named.endorser_company_code)),
          endorsementNullifier: String(named.endorsement_nullifier ?? "0x"),
          matchBandCode: Number(named.match_class_code ?? 0),
          bundleDigest: job.bundle.bundleDigest,
          txHash,
        });
      }
    }
    await repo.transitionJob(jobId, "publishing", "submitted");
    await repo.transitionJob(jobId, "submitted", "anchored");
  } catch (e) {
    await repo.failJob(
      jobId,
      e instanceof ZkPipelineError ? e.code : "STAGE_ERROR",
      e instanceof Error ? `${e.message}\n${e instanceof ZkPipelineError ? e.stderr : ""}` : String(e),
    );
    throw e;
  }
}
