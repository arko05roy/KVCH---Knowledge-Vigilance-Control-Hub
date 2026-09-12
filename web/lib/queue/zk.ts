import "server-only";
import type { PgBoss } from "pg-boss";
import { prisma } from "../db/client";
import type { ZkConfig } from "../zk/config";
import { ZkRepository } from "../zk/repository";
import { runProveStage, runAttestStage, runPublishStage } from "../zk/orchestrator";
import { indexChainEvents } from "../ledger/indexer";

export const ZK_PROVE_JOB = "zk-prove";
export const ZK_ATTEST_JOB = "zk-attest";
export const ZK_PUBLISH_JOB = "zk-publish";
export const ZK_INDEX_JOB = "zk-index";

export async function enqueueZkProof(boss: PgBoss, jobId: string): Promise<void> {
  await boss.send(ZK_PROVE_JOB, { jobId }, { singletonKey: `prove:${jobId}` });
}

export async function registerZkWorkers(boss: PgBoss, config: ZkConfig): Promise<void> {
  const repo = new ZkRepository(prisma);

  await boss.work<{ jobId: string }>(ZK_PROVE_JOB, async ([job]) => {
    const jobId = job?.data?.jobId;
    if (typeof jobId !== "string") throw new Error("invalid zk-prove payload");
    await runProveStage(repo, config, jobId);
    await boss.send(ZK_ATTEST_JOB, { jobId }, { singletonKey: `attest:${jobId}` });
  });

  await boss.work<{ jobId: string }>(ZK_ATTEST_JOB, async ([job]) => {
    const jobId = job?.data?.jobId;
    if (typeof jobId !== "string") throw new Error("invalid zk-attest payload");
    await runAttestStage(repo, config, jobId);
    await boss.send(ZK_PUBLISH_JOB, { jobId }, { singletonKey: `publish:${jobId}` });
  });

  await boss.work<{ jobId: string }>(ZK_PUBLISH_JOB, async ([job]) => {
    const jobId = job?.data?.jobId;
    if (typeof jobId !== "string") throw new Error("invalid zk-publish payload");
    await runPublishStage(repo, config, jobId);
  });

  await boss.work(ZK_INDEX_JOB, async () => {
    const r = await indexChainEvents(repo, config);
    if (r.events > 0) console.info(`zk indexer: ${r.events} events through block ${r.toBlock}`);
  });
}
