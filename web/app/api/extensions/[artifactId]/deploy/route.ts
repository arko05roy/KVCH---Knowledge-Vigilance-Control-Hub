import { NextResponse } from "next/server";
import { requireCompanyId } from "@/lib/auth/company";
import { prisma } from "@/lib/db/client";
import { ExtensionRepository } from "@/lib/db/extensions";
import { DeploymentService } from "@/lib/extensions/deployments";

export async function POST(_: Request, { params }: { params: Promise<{ artifactId: string }> }) {
  try {
    const artifact = await new ExtensionRepository(prisma).findArtifact(requireCompanyId(), (await params).artifactId);
    if (!artifact) return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
    const deployment = await new DeploymentService(new ExtensionRepository(prisma)).create(artifact.id);
    return NextResponse.json({ deployment }, { status: deployment.created ? 201 : 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed" }, { status: 400 });
  }
}
