import "server-only";
import { PgBoss } from "pg-boss";
import type { KvchConfig } from "../config";

export const EVALUATE_ARTIFACT_JOB = "evaluate-artifact";
export const RUN_DEPLOYMENT_JOB = "run-deployment";
export const DISPATCH_DUE_DEPLOYMENTS_JOB = "dispatch-due-deployments";

export async function createBoss(config: Pick<KvchConfig, "databaseUrl">): Promise<PgBoss> {
  const boss = new PgBoss({ connectionString: config.databaseUrl });
  await boss.start();
  await Promise.all([boss.createQueue(EVALUATE_ARTIFACT_JOB), boss.createQueue(RUN_DEPLOYMENT_JOB), boss.createQueue(DISPATCH_DUE_DEPLOYMENTS_JOB)]);
  await boss.schedule(DISPATCH_DUE_DEPLOYMENTS_JOB, "* * * * *");
  return boss;
}
