import "server-only";
import { CronExpressionParser } from "cron-parser";
import type { PgBoss } from "pg-boss";
import { prisma } from "../db/client";
import { DISPATCH_DUE_DEPLOYMENTS_JOB } from "./boss";
import { enqueueDeploymentRun } from "./runs";

export async function dispatchDueDeployments(boss: PgBoss, now = new Date()): Promise<void> {
  const due = await prisma.deployment.findMany({ where: { status: "active", nextRunAt: { lte: now } }, select: { id: true, schedule: true, nextRunAt: true } });
  for (const deployment of due) {
    if (!deployment.nextRunAt) continue;
    const dueAt = deployment.nextRunAt;
    const nextRunAt = CronExpressionParser.parse(deployment.schedule, { currentDate: dueAt }).next().toDate();
    const claimed = await prisma.deployment.updateMany({
      where: { id: deployment.id, status: "active", nextRunAt: dueAt },
      data: { nextRunAt },
    });
    if (claimed.count) await enqueueDeploymentRun(boss, { deploymentId: deployment.id, dueAt });
  }
}

export async function registerDispatchWorker(boss: PgBoss): Promise<void> {
  await boss.work(DISPATCH_DUE_DEPLOYMENTS_JOB, async () => dispatchDueDeployments(boss));
}
