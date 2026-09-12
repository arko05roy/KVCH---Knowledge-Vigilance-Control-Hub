import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db/client";
import { ZkRepository } from "@/lib/zk/repository";
import { readZkConfig } from "@/lib/zk/config";
import { loadDeployment } from "@/lib/ledger/client";
import { createBoss, ZK_PROVE_JOB } from "@/lib/queue/boss";
import { readKvchConfig } from "@/lib/config";

const CIRCUIT_BY_KIND: Record<string, string> = {
  threat: "threat_eligibility",
  risk: "stakeholder_risk_band",
  endorsement: "peer_endorsement",
  inclusion: "evidence_inclusion",
};

/** POST /api/zk/proof-jobs — create a proof job for a claim kind.
 *  Accepts registered identifiers only; witness material is assembled inside
 *  the prover boundary (pilot: deterministic fixtures), never uploaded here. */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const claimKind = String(body.claimKind ?? "");
    const companyId = String(body.companyId ?? process.env.KVCH_DEVELOPMENT_COMPANY_ID ?? "local_company");
    if (!CIRCUIT_BY_KIND[claimKind]) {
      return NextResponse.json({ error: `unknown claimKind ${claimKind}` }, { status: 400 });
    }

    const zkConfig = readZkConfig();
    const repo = new ZkRepository(prisma);
    const deployment = loadDeployment(zkConfig);

    const idempotencyKey = String(
      body.idempotencyKey ?? `manual:${companyId}:${claimKind}:${Date.now()}`,
    );
    const existing = await repo.findProofJobByIdempotency(idempotencyKey);
    if (existing) return NextResponse.json({ job: existing, deduplicated: true });

    // Pilot boundary: the "input bundle" registered here is a digest of the
    // deterministic fixture identity, not uploaded witness JSON.
    const envelopeDigest =
      "0x" + createHash("sha256").update(`fixture:${claimKind}:v1`).digest("hex");
    const inputBundle = await repo.upsertInputBundle({
      companyId,
      adapterKey: `fixture.${claimKind}`,
      adapterVersion: "1.0.0",
      envelopeDigest,
      envelopeRef: `fixtures/${CIRCUIT_BY_KIND[claimKind]}.input.json`,
      schemaVersion: "kvch.zk.predicate-semantics/1.0.0",
    });

    const circuitId = claimKind === "endorsement" ? deployment.ids.circuitId2 : deployment.ids.circuitId;
    const circuit = await prisma.zkCircuitVersion.findUnique({ where: { circuitId } });
    const policy = await prisma.zkPolicyVersion.findUnique({ where: { policyId: deployment.ids.policyId } });
    if (!circuit || !policy) {
      return NextResponse.json(
        { error: "circuit/policy not registered — start the worker once to seed the registry" },
        { status: 409 },
      );
    }

    const job = await repo.createProofJob({
      companyId,
      claimKind,
      idempotencyKey,
      inputBundleId: inputBundle.id,
      circuitVersionId: circuit.id,
      policyVersionId: policy.id,
    });

    const boss = await createBoss(readKvchConfig());
    try {
      await boss.send(ZK_PROVE_JOB, { jobId: job.id }, { singletonKey: `prove:${job.id}` });
    } finally {
      await boss.stop();
    }
    return NextResponse.json({ job }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

/** GET /api/zk/proof-jobs — recent jobs. */
export async function GET() {
  const jobs = await prisma.zkProofJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, companyId: true, claimKind: true, status: true,
      bundleDigest: true, errorCode: true, createdAt: true, finishedAt: true,
    },
  });
  return NextResponse.json({ jobs });
}
