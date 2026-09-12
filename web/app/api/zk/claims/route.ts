import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { ZkRepository } from "@/lib/zk/repository";

export async function GET(request: Request) {
  const companyId = new URL(request.url).searchParams.get("companyId") ?? undefined;
  const claims = await new ZkRepository(prisma).listClaims(companyId);
  return NextResponse.json({
    claims: JSON.parse(
      JSON.stringify(claims, (_k, v) => (typeof v === "bigint" ? v.toString() : v)),
    ),
  });
}
