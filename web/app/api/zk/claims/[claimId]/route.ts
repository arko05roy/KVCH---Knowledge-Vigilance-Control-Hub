import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { ZkRepository } from "@/lib/zk/repository";

export async function GET(_request: Request, { params }: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await params;
  const claim = await new ZkRepository(prisma).getClaim(claimId);
  if (!claim) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({
    claim: JSON.parse(
      JSON.stringify(claim, (_k, v) => (typeof v === "bigint" ? v.toString() : v)),
    ),
  });
}
