import "server-only";
import type { PgBoss } from "pg-boss";
import type { KvchConfig } from "../config";
import { prisma } from "../db/client";
import { ExtensionRepository } from "../db/extensions";
import { ExtensionRunService } from "../extensions/runs";
import { KvchJudge } from "../judge/kernel";
import { LocalArtifactStorage } from "../storage/artifacts";
import { RUN_DEPLOYMENT_JOB } from "./boss";

export interface RunDeploymentJob { deploymentId: string; dueAt: string; }

export async function enqueueDeploymentRun(boss: PgBoss, input: { deploymentId: string; dueAt: Date }): Promise<void> {
  await boss.send(RUN_DEPLOYMENT_JOB, { deploymentId: input.deploymentId, dueAt: input.dueAt.toISOString() }, {
    startAfter: input.dueAt,
    singletonKey: `${input.deploymentId}:${input.dueAt.toISOString()}`,
  });
}

export async function registerRunWorker(boss: PgBoss, config: KvchConfig): Promise<void> {
  const service = new ExtensionRunService(
    new ExtensionRepository(prisma),
    new KvchJudge(new LocalArtifactStorage(config.artifactStorageDir), config),
  );
  await boss.work<RunDeploymentJob>(RUN_DEPLOYMENT_JOB, async ([job]) => {
    if (!job || typeof job.data?.deploymentId !== "string" || typeof job.data.dueAt !== "string") throw new Error("Invalid run-deployment job payload");
    const dueAt = new Date(job.data.dueAt);
    if (Number.isNaN(dueAt.getTime())) throw new Error("Invalid run-deployment due time");
    await service.run(job.data.deploymentId, dueAt);
  });
}
