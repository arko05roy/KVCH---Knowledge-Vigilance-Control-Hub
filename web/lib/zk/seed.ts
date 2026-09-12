import "server-only";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import type { ZkConfig } from "./config";
import type { ZkRepository } from "./repository";
import { loadDeployment } from "../ledger/client";

const sha256 = (buf: Buffer) => "0x" + createHash("sha256").update(buf).digest("hex");

/** Registers the deployed circuit/policy/input-bundle metadata idempotently.
 *  Values come from the deployment manifest + pinned artifacts — the same
 *  digests the contracts enforce on-chain. */
export async function seedZkRegistry(repo: ZkRepository, config: ZkConfig): Promise<void> {
  const deployment = loadDeployment(config);
  const env = Object.fromEntries(
    readFileSync(config.verifierKeysFile, "utf8")
      .split("\n")
      .filter((l) => l.includes("="))
      .map((l) => l.split("=")),
  );

  await repo.upsertCircuitVersion({
    circuitId: deployment.ids.circuitId,
    name: "threat_eligibility",
    artifactDigest: env.ARTIFACT_DIGEST ?? sha256(readFileSync(path.join(config.zkWorkspaceDir, "target/threat_eligibility.json"))),
    vkDigest: env.VK_DIGEST ?? sha256(readFileSync(path.join(config.zkWorkspaceDir, "target/threat_eligibility/vk"))),
    proofFlavor: "ultrahonk:noir-recursive-no-zk",
  });
  if (deployment.ids.circuitId2 && deployment.ids.circuitId2 !== "0x" + "0".repeat(64)) {
    await repo.upsertCircuitVersion({
      circuitId: deployment.ids.circuitId2,
      name: "peer_endorsement",
      artifactDigest: env.ARTIFACT_DIGEST_2 ?? sha256(readFileSync(path.join(config.zkWorkspaceDir, "target/peer_endorsement.json"))),
      vkDigest: env.VK_DIGEST_2 ?? sha256(readFileSync(path.join(config.zkWorkspaceDir, "target/peer_endorsement/vk"))),
      proofFlavor: "ultrahonk:noir-recursive-no-zk",
    });
  }
  const policyDigest =
    env.POLICY_DIGEST ??
    sha256(readFileSync(path.join(config.zkWorkspaceDir, "manifests/predicate-semantics.v1.json")));
  await repo.upsertPolicyVersion({
    policyId: deployment.ids.policyId,
    policyDigest,
    codebookDigest: env.CODEBOOK_DIGEST ?? policyDigest,
  });
}
