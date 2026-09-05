import assert from "node:assert/strict";
import test from "node:test";
import type { DeploymentControlPersistence } from "../lib/extensions/deployment-control";
import { DeploymentControlService } from "../lib/extensions/deployment-control";

class MemoryControl implements DeploymentControlPersistence {
  input?: Parameters<DeploymentControlPersistence["setDeploymentStatus"]>[0];
  async setDeploymentStatus(input: Parameters<DeploymentControlPersistence["setDeploymentStatus"]>[0]) { this.input = input; return { id: input.deploymentId, status: input.status, nextRunAt: input.nextRunAt }; }
}

test("resume schedules the next future cron occurrence and pause clears it", async () => {
  const persistence = new MemoryControl();
  const service = new DeploymentControlService(persistence);
  await service.pause("artifact-1", "deployment-1");
  assert.equal(persistence.input?.status, "paused");
  assert.equal(persistence.input?.nextRunAt, null);
  await service.resume("artifact-1", "deployment-1", "*/5 * * * *", new Date("2026-09-05T10:01:00Z"));
  assert.equal(persistence.input?.status, "active");
  assert.equal((persistence.input?.nextRunAt as Date | null | undefined)?.toISOString(), "2026-09-05T10:05:00.000Z");
});
