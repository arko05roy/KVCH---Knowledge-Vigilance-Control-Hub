import { NextResponse } from "next/server";
import { requireCompanyId } from "@/lib/auth/company";
import { readKvchConfig } from "@/lib/config";
import { prisma } from "@/lib/db/client";
import { ExtensionRepository } from "@/lib/db/extensions";
import { createBoss } from "@/lib/queue/boss";
import { enqueueEvaluation } from "@/lib/queue/evaluate";

export async function POST(_: Request, { params }: { params: Promise<{ artifactId: string }> }) {
  try {
    const artifact = await new ExtensionRepository(prisma).findArtifact(requireCompanyId(), (await params).artifactId);
    if (!artifact) return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
    const config = readKvchConfig();
    const boss = await createBoss(config);
    try { await enqueueEvaluation(boss, artifact.id); } finally { await boss.stop(); }
    return NextResponse.json({ accepted: true }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed" }, { status: 400 });
  }
}
