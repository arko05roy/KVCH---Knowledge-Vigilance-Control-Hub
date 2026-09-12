import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { ZkRepository } from "@/lib/zk/repository";

/** Finalized consortium endorsement feed for a target claim. */
export async function GET(_request: Request, { params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  const endorsements = await new ZkRepository(prisma).endorsementsForClaim(claimId);
  return NextResponse.json({
    targetClaimId: claimId,
    count: endorsements.length,
    endorsements: endorsements.map((e) => ({
      endorsementId: e.endorsementId,
      endorserCompanyCode: e.endorserCompanyCode.toString(),
      matchBandCode: e.matchBandCode,
      bundleDigest: e.bundleDigest,
      txHash: e.txHash,
      chainStatus: e.chainStatus,
      createdAt: e.createdAt,
    })),
  });
}
