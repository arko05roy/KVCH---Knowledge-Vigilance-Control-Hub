import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

/** Finalized consortium claim feed — anchored claims only, minimized fields. */
export async function GET() {
  const claims = await prisma.zkClaim.findMany({
    where: { status: { in: ["anchored", "revoked", "superseded"] } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { endorsements: true },
  });
  return NextResponse.json({
    claims: claims.map((c) => ({
      claimId: c.claimId,
      status: c.status,
      issuerCompanyCode: c.issuerCompanyCode.toString(),
      claimSeriesId: c.claimSeriesId,
      claimVersion: c.claimVersion,
      expiryEpoch: c.expiryEpoch.toString(),
      anchoredAt: c.anchoredAt,
      txHash: c.txHash,
      endorsementCount: c.endorsements.length,
    })),
  });
}
