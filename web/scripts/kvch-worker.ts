import { initializeKvchDirectories, readKvchConfig } from "../lib/config";
import { createBoss } from "../lib/queue/boss";
import { registerDispatchWorker } from "../lib/queue/dispatch";
import { registerEvaluationWorker } from "../lib/queue/evaluate";
import { registerRunWorker } from "../lib/queue/runs";
import { registerZkWorkers } from "../lib/queue/zk";
import { assertDatabaseHealthy } from "../lib/queue/health";
import { readZkConfig } from "../lib/zk/config";
import { seedZkRegistry } from "../lib/zk/seed";
import { ZkRepository } from "../lib/zk/repository";
import { prisma } from "../lib/db/client";

const config = readKvchConfig();
await initializeKvchDirectories(config);
await assertDatabaseHealthy();
const boss = await createBoss(config);

await registerEvaluationWorker(boss, config);
await registerRunWorker(boss, config);
await registerDispatchWorker(boss);

if (process.env.ZK_WORKSPACE_DIR) {
  const zkConfig = readZkConfig();
  await seedZkRegistry(new ZkRepository(prisma), zkConfig);
  await registerZkWorkers(boss, zkConfig);
  console.info("ZK workers active (prove/attest/publish/index).");
}

process.once("SIGINT", () => void boss.stop());
process.once("SIGTERM", () => void boss.stop());
console.info("KVCH worker ready; evaluation and deployment-run jobs are active.");
