import "server-only";
import type { ArtifactState, EvaluationStatus, Prisma, PrismaClient } from "@prisma/client";
import type { ExtensionManifest } from "@arko05roy/kvch-extension";
import type { ArtifactPersistence } from "../extensions/artifacts";
import type { EvaluationPersistence } from "../extensions/evaluations";
import type { DeploymentPersistence } from "../extensions/deployments";
import type { RunPersistence } from "../extensions/runs";
import type { DeploymentControlPersistence } from "../extensions/deployment-control";
import type { FindingEnvelope } from "../judge/findings";

export class ExtensionRepository implements ArtifactPersistence, EvaluationPersistence, DeploymentPersistence, RunPersistence, DeploymentControlPersistence {
  constructor(private readonly db: PrismaClient) {}

  async findArtifact(companyId: string, artifactId: string) {
    return this.db.artifact.findFirst({
      where: { id: artifactId, companyId },
      include: {
        extension: true,
        evaluations: { orderBy: { createdAt: "desc" } },
        deployments: { orderBy: { createdAt: "desc" }, include: { runs: { orderBy: { dueAt: "desc" }, take: 20, include: { findings: true } } } },
        findings: { orderBy: { observedAt: "desc" }, take: 50 },
      },
    });
  }

  async findArtifactByHash(companyId: string, sha256: string) {
    return this.db.artifact.findUnique({ where: { companyId_sha256: { companyId, sha256 } } });
  }

  async listArtifacts(companyId: string) {
    return this.db.artifact.findMany({
      where: { companyId },
      include: {
        extension: true,
        evaluations: { orderBy: { createdAt: "desc" }, take: 1 },
        deployments: { where: { status: { in: ["active", "paused"] } }, orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getArtifactForEvaluation(artifactId: string) {
    return this.db.artifact.findUnique({
      where: { id: artifactId },
      select: { id: true, sha256: true, storageKey: true },
    });
  }

  async startEvaluation(artifactId: string) {
    return this.db.$transaction(async (tx) => {
      await tx.artifact.update({ where: { id: artifactId }, data: { state: "evaluating" } });
      return tx.evaluation.create({ data: { artifactId, status: "running", startedAt: new Date() } });
    });
  }

  async finishEvaluation(input: {
    evaluationId: string;
    artifactId: string;
    status: EvaluationStatus;
    artifactState: ArtifactState;
    adapterKey: string | null;
    adapterVersion: string | null;
    commandResults: Prisma.InputJsonValue;
    stdout: string | null;
    stderr: string | null;
  }) {
    await this.db.$transaction([
      this.db.evaluation.update({
        where: { id: input.evaluationId },
        data: {
          status: input.status, adapterKey: input.adapterKey, adapterVersion: input.adapterVersion,
          commandResults: input.commandResults, stdout: input.stdout, stderr: input.stderr, finishedAt: new Date(),
        },
      }),
      this.db.artifact.update({ where: { id: input.artifactId }, data: { state: input.artifactState } }),
    ]);
  }

  async getArtifactForDeployment(artifactId: string) {
    const artifact = await this.db.artifact.findUnique({ where: { id: artifactId }, select: { id: true, state: true, manifest: true } });
    if (!artifact) return null;
    return { id: artifact.id, state: artifact.state, manifest: artifact.manifest as unknown as ExtensionManifest };
  }

  async createDeployment(input: { artifactId: string; schedule: string; nextRunAt: Date }) {
    return this.db.$transaction(async (tx) => {
      const existing = await tx.deployment.findFirst({ where: { artifactId: input.artifactId, status: "active" } });
      if (existing) return { deployment: existing, created: false };
      const deployment = await tx.deployment.create({ data: { artifactId: input.artifactId, schedule: input.schedule, nextRunAt: input.nextRunAt } });
      return { deployment, created: true };
    });
  }

  async setDeploymentStatus(input: { artifactId: string; deploymentId: string; status: "active" | "paused" | "failed"; nextRunAt: Date | null }) {
    const updated = await this.db.deployment.updateMany({ where: { id: input.deploymentId, artifactId: input.artifactId }, data: { status: input.status, nextRunAt: input.nextRunAt } });
    if (!updated.count) return null;
    return this.db.deployment.findUnique({ where: { id: input.deploymentId }, select: { id: true, status: true, nextRunAt: true } });
  }

  async getDeploymentForRun(deploymentId: string) {
    const deployment = await this.db.deployment.findUnique({
      where: { id: deploymentId },
      include: { artifact: { select: { id: true, sha256: true, storageKey: true } } },
    });
    if (!deployment) return null;
    return { id: deployment.id, artifactId: deployment.artifactId, sha256: deployment.artifact.sha256, storageKey: deployment.artifact.storageKey, active: deployment.status === "active" };
  }

  async startRun(input: { deploymentId: string; artifactId: string; dueAt: Date }) {
    return this.db.$transaction(async (tx) => {
      const existing = await tx.scheduledExtensionRun.findUnique({ where: { deploymentId_dueAt: { deploymentId: input.deploymentId, dueAt: input.dueAt } } });
      if (existing) {
        if (["healthy", "finding", "failed"].includes(existing.status)) return { id: existing.id, execute: false };
        await tx.scheduledExtensionRun.update({ where: { id: existing.id }, data: { status: "running", startedAt: new Date() } });
        return { id: existing.id, execute: true };
      }
      const run = await tx.scheduledExtensionRun.create({ data: { deploymentId: input.deploymentId, artifactId: input.artifactId, dueAt: input.dueAt, status: "running", startedAt: new Date() } });
      return { id: run.id, execute: true };
    });
  }

  async finishRun(input: {
    runId: string;
    artifactId: string;
    status: "healthy" | "finding" | "failed";
    exitCode: number | null;
    commandResults: Prisma.InputJsonValue;
    stdout: string | null;
    stderr: string | null;
    findings: FindingEnvelope[];
  }) {
    await this.db.$transaction(async (tx) => {
      const changed = await tx.scheduledExtensionRun.updateMany({
        where: { id: input.runId, status: { in: ["queued", "running"] } },
        data: { status: input.status, exitCode: input.exitCode, commandResults: input.commandResults, stdout: input.stdout, stderr: input.stderr, finishedAt: new Date() },
      });
      if (!changed.count || input.status !== "finding") return;
      await tx.finding.createMany({ data: input.findings.map((finding) => ({
        runId: input.runId, artifactId: input.artifactId, envelope: finding as unknown as Prisma.InputJsonObject,
        severity: finding.severity, category: finding.category, title: finding.title, observedAt: new Date(finding.observed_at),
      })) });
    });
  }

  async createArtifact(input: {
    companyId: string;
    sha256: string;
    storageKey: string;
    size: number;
    manifest: ExtensionManifest;
    adapterKey: string | null;
    state: ArtifactState;
  }) {
    return this.db.$transaction(async (tx) => {
      const existing = await tx.artifact.findUnique({ where: { companyId_sha256: { companyId: input.companyId, sha256: input.sha256 } } });
      if (existing) return { artifact: existing, created: false };
      const extension = await tx.extension.upsert({
        where: { companyId_manifestId: { companyId: input.companyId, manifestId: input.manifest.id } },
        create: { companyId: input.companyId, manifestId: input.manifest.id, name: input.manifest.name },
        update: { name: input.manifest.name },
      });
      const artifact = await tx.artifact.create({
        data: {
          extensionId: extension.id, companyId: input.companyId, sha256: input.sha256, storageKey: input.storageKey,
          size: input.size, manifest: input.manifest as unknown as Prisma.InputJsonObject, adapterKey: input.adapterKey, state: input.state,
        },
      });
      return { artifact, created: true };
    });
  }
}
