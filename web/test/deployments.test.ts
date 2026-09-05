import assert from "node:assert/strict";
import test from "node:test";
import type { DeploymentPersistence } from "../lib/extensions/deployments";
import { DeploymentService } from "../lib/extensions/deployments";
import type { ExtensionManifest } from "@arko05roy/kvch-extension";

const manifest = { deployment: { schedule: "*/5 * * * *" } } as ExtensionManifest;

class MemoryDeployments implements DeploymentPersistence {
  state: "deployable" | "evaluation_failed" = "deployable";
  input?: { artifactId: string; schedule: string; nextRunAt: Date };
  async getArtifactForDeployment() { return { id: "artifact-1", state: this.state, manifest }; }
  async createDeployment(input: { artifactId: string; schedule: string; nextRunAt: Date }) { this.input = input; return { deployment: { id: "deployment-1", schedule: input.schedule, nextRunAt: input.nextRunAt }, created: true }; }
}

test("deployment reads the immutable artifact schedule and calculates a future due time", async () => {
  const persistence = new MemoryDeployments();
  const result = await new DeploymentService(persistence).create("artifact-1", new Date("2026-09-05T10:01:00Z"));
  assert.equal(result.deployment.schedule, "*/5 * * * *");
  assert.equal(persistence.input?.nextRunAt.toISOString(), "2026-09-05T10:05:00.000Z");
});

test("deployment rejects an artifact that did not pass evaluation", async () => {
  const persistence = new MemoryDeployments();
  persistence.state = "evaluation_failed";
  await assert.rejects(() => new DeploymentService(persistence).create("artifact-1"), /deployable/);
});
