import { NextResponse } from "next/server";
import { requireCompanyId } from "@/lib/auth/company";
import { prisma } from "@/lib/db/client";
import { ExtensionRepository } from "@/lib/db/extensions";

export async function GET(_: Request, { params }: { params: Promise<{ artifactId: string }> }) {
  try {
    const artifact = await new ExtensionRepository(prisma).findArtifact(requireCompanyId(), (await params).artifactId);
    return artifact ? NextResponse.json({ artifact }) : NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed" }, { status: 500 });
  }
}
