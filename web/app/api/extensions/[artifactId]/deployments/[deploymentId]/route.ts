import { NextResponse } from "next/server";
import { requireCompanyId } from "@/lib/auth/company";
import { prisma } from "@/lib/db/client";
import { ExtensionRepository } from "@/lib/db/extensions";
import { DeploymentControlService } from "@/lib/extensions/deployment-control";

export async function POST(request: Request, { params }: { params: Promise<{ artifactId: string; deploymentId: string }> }) {
  try {
    const { artifactId, deploymentId } = await params;
    const artifact = await new ExtensionRepository(prisma).findArtifact(requireCompanyId(), artifactId);
    if (!artifact) return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
    const deployment = artifact.deployments.find((item) => item.id === deploymentId);
    if (!deployment) return NextResponse.json({ error: "Deployment not found" }, { status: 404 });
    const action = (await request.json() as { action?: string }).action;
    const service = new DeploymentControlService(new ExtensionRepository(prisma));
    const changed = action === "pause" ? await service.pause(artifact.id, deploymentId) : action === "resume" ? await service.resume(artifact.id, deploymentId, deployment.schedule) : null;
    return changed ? NextResponse.json({ deployment: changed }) : NextResponse.json({ error: "Action must be pause or resume" }, { status: 400 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed" }, { status: 400 }); }
}
