import { initializeKvchDirectories, readKvchConfig } from "../lib/config";
import { createBoss } from "../lib/queue/boss";
import { registerDispatchWorker } from "../lib/queue/dispatch";
import { registerEvaluationWorker } from "../lib/queue/evaluate";
import { registerRunWorker } from "../lib/queue/runs";
import { assertDatabaseHealthy } from "../lib/queue/health";

const config = readKvchConfig();
await initializeKvchDirectories(config);
await assertDatabaseHealthy();
const boss = await createBoss(config);

await registerEvaluationWorker(boss, config);
await registerRunWorker(boss, config);
await registerDispatchWorker(boss);

process.once("SIGINT", () => void boss.stop());
process.once("SIGTERM", () => void boss.stop());
console.info("KVCH worker ready; evaluation and deployment-run jobs are active.");
