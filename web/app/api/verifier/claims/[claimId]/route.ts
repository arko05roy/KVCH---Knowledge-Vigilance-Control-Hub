import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { ZkRepository } from "@/lib/zk/repository";
import { readZkConfig } from "@/lib/zk/config";
import { loadDeployment, ledgerClient, loadContractAbi } from "@/lib/ledger/client";

/** Audience-safe verification view: minimized publics + quorum + anchor
 *  state. Never returns witness material — circuits only disclose bands,
 *  commitments and identifiers by construction. */
export async function GET(_request: Request, { params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  const repo = new ZkRepository(prisma);
  const claim = await repo.getClaim(claimId);
  if (!claim) return NextResponse.json({ error: "not found" }, { status: 404 });

  const zkConfig = readZkConfig();
  const deployment = loadDeployment(zkConfig);
  const client = ledgerClient(zkConfig);

  let onChainActive: boolean | null = null;
  let endorsementCountOnChain: number | null = null;
  try {
    const abi = loadContractAbi(zkConfig, "ClaimAttestationRegistry");
    onChainActive = (await client.readContract({
      address: deployment.contracts.ClaimAttestationRegistry,
      abi,
      functionName: "isClaimActive",
      args: [claimId],
    })) as boolean;
    const eAbi = loadContractAbi(zkConfig, "EndorsementRegistry");
    endorsementCountOnChain = Number(
      (await client.readContract({
        address: deployment.contracts.EndorsementRegistry,
        abi: eAbi,
        functionName: "endorsementCount",
        args: [claimId],
      })) as bigint,
    );
  } catch {
    onChainActive = null;
  }

  const named =
    (claim.job?.bundle?.body as { publicInputs?: { named?: Record<string, string> } } | null)
      ?.publicInputs?.named ?? {};
  const attestations = claim.job?.attestations ?? [];

  return NextResponse.json({
    claimId: claim.claimId,
    status: claim.status,
    chainStatus: claim.chainStatus,
    onChainActive,
    anchoredAt: claim.anchoredAt,
    txHash: claim.txHash,
    expiryEpoch: claim.expiryEpoch.toString(),
    issuerCompanyCode: claim.issuerCompanyCode.toString(),
    disclosed: {
      claimSeriesId: claim.claimSeriesId,
      claimVersion: claim.claimVersion,
      severityBandCode: named.severity_band_code ?? null,
      confidenceBandCode: named.confidence_band_code ?? null,
      claimFamilyCode: named.claim_family_code ?? null,
      sectorCode: named.sector_code ?? null,
      observedEpoch: named.observed_epoch ?? null,
      validFromEpoch: named.valid_from_epoch ?? null,
      expiryEpochCircuit: named.expiry_epoch ?? null,
      publicInputDigest: claim.publicInputDigest,
      bundleDigest: claim.bundleDigest,
      disclosureNullifier: claim.disclosureNullifier,
    },
    quorum: {
      attestationCount: attestations.length,
      verifiers: attestations.map((a) => a.verifier),
      decision: attestations.every((a) => a.decision === 1) ? "approve" : "mixed",
    },
    endorsements: {
      count: claim.endorsements.length,
      onChainCount: endorsementCountOnChain,
      endorserCompanyCodes: claim.endorsements.map((e) => e.endorserCompanyCode.toString()),
    },
    note: "Chain state reflects M-of-N verifier-council signatures. The UltraHonk proof is verified off-chain inside verifier nodes; it attests consistency with signed inputs — not real-world truth.",
  });
}
