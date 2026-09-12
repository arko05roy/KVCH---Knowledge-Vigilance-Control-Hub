import "server-only";
import type { PrismaClient, ZkJobStatus, ZkClaimStatus, Prisma } from "@prisma/client";
import { assertJobTransition, assertClaimTransition } from "./lifecycle";

export class ZkRepository {
  constructor(readonly db: PrismaClient) {}

  // ---- registrations -------------------------------------------------------

  upsertCircuitVersion(input: {
    circuitId: string;
    name: string;
    artifactDigest: string;
    vkDigest: string;
    proofFlavor: string;
  }) {
    return this.db.zkCircuitVersion.upsert({
      where: { circuitId: input.circuitId },
      update: { artifactDigest: input.artifactDigest, vkDigest: input.vkDigest },
      create: input,
    });
  }

  upsertPolicyVersion(input: {
    policyId: string;
    policyDigest: string;
    codebookDigest: string;
    sourceDigest?: string;
    auditDigest?: string;
    containerDigest?: string;
  }) {
    return this.db.zkPolicyVersion.upsert({
      where: { policyId: input.policyId },
      update: { policyDigest: input.policyDigest },
      create: input,
    });
  }

  upsertInputBundle(input: {
    companyId: string;
    adapterKey: string;
    adapterVersion: string;
    envelopeDigest: string;
    envelopeRef: string;
    schemaVersion: string;
  }) {
    return this.db.zkInputBundle.upsert({
      where: {
        companyId_envelopeDigest: {
          companyId: input.companyId,
          envelopeDigest: input.envelopeDigest,
        },
      },
      update: {},
      create: input,
    });
  }

  // ---- proof jobs ------------------------------------------------------------

  createProofJob(input: {
    companyId: string;
    claimKind: string;
    idempotencyKey: string;
    inputBundleId: string;
    circuitVersionId: string;
    policyVersionId: string;
    expectedDigest?: string;
  }) {
    return this.db.zkProofJob.create({ data: input });
  }

  findProofJobByIdempotency(key: string) {
    return this.db.zkProofJob.findUnique({ where: { idempotencyKey: key } });
  }

  getProofJob(id: string) {
    return this.db.zkProofJob.findUnique({
      where: { id },
      include: { bundle: true, attestations: true, claim: true, endorsement: true },
    });
  }

  /** Transition guard via updateMany on the expected current status. */
  async transitionJob(id: string, from: ZkJobStatus, to: ZkJobStatus, extra: Prisma.ZkProofJobUpdateInput = {}) {
    assertJobTransition(from, to);
    const r = await this.db.zkProofJob.updateMany({
      where: { id, status: from },
      data: { status: to, ...extra },
    });
    if (r.count !== 1) throw new Error(`job ${id} not in status ${from}`);
  }

  async failJob(id: string, errorCode: string, errorDetail: string) {
    await this.db.zkProofJob.update({
      where: { id },
      data: { status: "failed", errorCode, errorDetail: errorDetail.slice(0, 4000), finishedAt: new Date() },
    });
  }

  saveBundle(jobId: string, bundleDigest: string, refDigest: string, body: unknown, byteSize: number) {
    return this.db.zkProofBundle.upsert({
      where: { jobId },
      update: { bundleDigest, refDigest, body: body as Prisma.InputJsonValue, byteSize },
      create: { jobId, bundleDigest, refDigest, body: body as Prisma.InputJsonValue, byteSize },
    });
  }

  saveAttestation(jobId: string, claimId: string, a: {
    verifier: string; decision: number; reasonCode: number;
    nonce: string; issuedAt: bigint; deadline: bigint; signature: string; digest: string;
  }) {
    return this.db.zkVerifierAttestation.upsert({
      where: { jobId_verifier: { jobId, verifier: a.verifier } },
      update: { signature: a.signature, nonce: a.nonce, issuedAt: a.issuedAt, deadline: a.deadline, digest: a.digest },
      create: { jobId, claimId, ...a },
    });
  }

  attestationsForJob(jobId: string) {
    return this.db.zkVerifierAttestation.findMany({ where: { jobId } });
  }

  // ---- claims -----------------------------------------------------------------

  createClaim(input: {
    claimId: string; jobId: string; companyId: string; claimSeriesId: string;
    claimVersion: number; issuerCompanyCode: bigint; bundleDigest: string;
    publicInputDigest: string; disclosureNullifier: string; councilSetId: bigint;
    expiryEpoch: bigint; txHash: string | null; blockNumber: bigint | null;
  }) {
    return this.db.zkClaim.create({ data: input });
  }

  getClaim(claimId: string) {
    return this.db.zkClaim.findUnique({
      where: { claimId },
      include: { endorsements: true, disputes: true, job: { include: { bundle: true, attestations: true } } },
    });
  }

  listClaims(companyId?: string) {
    return this.db.zkClaim.findMany({
      where: companyId ? { companyId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { endorsements: true },
    });
  }

  async transitionClaim(claimId: string, to: ZkClaimStatus, extra: Prisma.ZkClaimUpdateInput = {}) {
    const cur = await this.db.zkClaim.findUnique({ where: { claimId }, select: { status: true } });
    if (!cur) throw new Error(`unknown claim ${claimId}`);
    if (cur.status === to) return;
    assertClaimTransition(cur.status, to);
    await this.db.zkClaim.update({ where: { claimId }, data: { status: to, ...extra } });
  }

  // ---- endorsements -------------------------------------------------------------

  createEndorsement(input: {
    endorsementId: string; jobId: string; targetClaimId: string;
    endorserCompanyCode: bigint; endorsementNullifier: string; matchBandCode: number;
    bundleDigest: string; txHash: string | null;
  }) {
    return this.db.zkEndorsement.create({ data: input });
  }

  endorsementsForClaim(targetClaimId: string) {
    return this.db.zkEndorsement.findMany({ where: { targetClaimId }, orderBy: { createdAt: "desc" } });
  }

  // ---- chain events / indexer ----------------------------------------------------

  recordChainEvent(e: {
    chainId: number; contractAddress: string; eventName: string;
    txHash: string; logIndex: number; blockNumber: bigint; blockHash: string; payload: unknown;
  }) {
    return this.db.zkChainEvent.upsert({
      where: {
        chainId_txHash_logIndex: { chainId: e.chainId, txHash: e.txHash, logIndex: e.logIndex },
      },
      update: {},
      create: { ...e, payload: e.payload as Prisma.InputJsonValue },
    });
  }

  getCursor(chainId: number) {
    return this.db.zkIndexerCursor.upsert({
      where: { id: `zk-${chainId}` },
      update: {},
      create: { id: `zk-${chainId}`, chainId },
    });
  }

  setCursor(id: string, lastBlock: bigint) {
    return this.db.zkIndexerCursor.update({ where: { id }, data: { lastBlock } });
  }

  pendingChainClaims() {
    return this.db.zkClaim.findMany({
      where: { chainStatus: "pending", status: { in: ["pending", "anchored"] } },
      take: 200,
    });
  }
}
