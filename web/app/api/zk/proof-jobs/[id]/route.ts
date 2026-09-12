import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { ZkRepository } from "@/lib/zk/repository";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await new ZkRepository(prisma).getProofJob(id);
  if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({
    job: JSON.parse(
      JSON.stringify(job, (_k, v) => (typeof v === "bigint" ? v.toString() : v)),
    ),
  });
}
