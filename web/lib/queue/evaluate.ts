import "server-only";
import type { PgBoss } from "pg-boss";
import type { KvchConfig } from "../config";
import { ExtensionRepository } from "../db/extensions";
import { EvaluationService } from "../extensions/evaluations";
import { KvchJudge } from "../judge/kernel";
import { LocalArtifactStorage } from "../storage/artifacts";
import { prisma } from "../db/client";
import { EVALUATE_ARTIFACT_JOB } from "./boss";

export interface EvaluateArtifactJob { artifactId: string; }

export async function enqueueEvaluation(boss: PgBoss, artifactId: string): Promise<void> {
  await boss.send(EVALUATE_ARTIFACT_JOB, { artifactId });
}

export async function registerEvaluationWorker(boss: PgBoss, config: KvchConfig): Promise<void> {
  const repository = new ExtensionRepository(prisma);
  const judge = new KvchJudge(new LocalArtifactStorage(config.artifactStorageDir, config.maxArtifactBytes), config);
  const service = new EvaluationService(repository, judge);
  await boss.work<EvaluateArtifactJob>(EVALUATE_ARTIFACT_JOB, async ([job]) => {
    if (!job || typeof job.data?.artifactId !== "string") throw new Error("Invalid evaluate-artifact job payload");
    await service.evaluate(job.data.artifactId);
  });
}
