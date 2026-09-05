import assert from "node:assert/strict";
import test from "node:test";
import type { RunPersistence, RunJudgeExecutor } from "../lib/extensions/runs";
import { ExtensionRunService } from "../lib/extensions/runs";
import type { JudgeResult } from "../lib/judge/kernel";

const processResult = { command: "run", exitCode: 0, durationMs: 1, stdout: "", stderr: "", stdoutTruncated: false, stderrTruncated: false, timedOut: false };
const base: JudgeResult = { adapter: { key: "typescript/node", version: "1" }, phases: [{ phase: "run", result: processResult }], findings: [] };

class MemoryRuns implements RunPersistence {
  active = true;
  execute = true;
  finished: Parameters<RunPersistence["finishRun"]>[0][] = [];
  async getDeploymentForRun() { return { id: "deployment-1", artifactId: "artifact-1", sha256: "a".repeat(64), storageKey: "artifacts/company_1/" + "a".repeat(64) + ".kvch.tgz", active: this.active }; }
  async startRun() { return { id: "run-1", execute: this.execute }; }
  async finishRun(input: Parameters<RunPersistence["finishRun"]>[0]) { this.finished.push(input); }
}

test("normal silent run becomes healthy", async () => {
  const persistence = new MemoryRuns();
  const judge: RunJudgeExecutor = { execute: async () => base };
  await new ExtensionRunService(persistence, judge).run("deployment-1", new Date());
  assert.equal(persistence.finished[0]?.status, "healthy");
  assert.equal(persistence.finished[0]?.findings.length, 0);
});

test("valid Judge findings persist as findings and failures do not", async () => {
  const persistence = new MemoryRuns();
  const finding = { schema_version: "kvch.finding/v1" as const, observed_at: "2026-09-05T10:00:00Z", severity: "high", category: "fixture", title: "Concern", summary: "Synthetic", resource: {}, evidence: [], indicators: [], baseline: {}, recommended_actions: [], details: {} };
  await new ExtensionRunService(persistence, { execute: async () => ({ ...base, findings: [finding] }) }).run("deployment-1", new Date());
  assert.equal(persistence.finished[0]?.status, "finding");
  assert.equal(persistence.finished[0]?.findings.length, 1);
  const failed = new MemoryRuns();
  await new ExtensionRunService(failed, { execute: async () => ({ ...base, failureReason: "invalid JSONL" }) }).run("deployment-1", new Date());
  assert.equal(failed.finished[0]?.status, "failed");
  assert.equal(failed.finished[0]?.findings.length, 0);
});

test("inactive deployments and already completed durable runs do not execute", async () => {
  const inactive = new MemoryRuns(); inactive.active = false;
  let calls = 0;
  await new ExtensionRunService(inactive, { execute: async () => { calls += 1; return base; } }).run("deployment-1", new Date());
  assert.equal(calls, 0);
  const duplicate = new MemoryRuns(); duplicate.execute = false;
  await new ExtensionRunService(duplicate, { execute: async () => { calls += 1; return base; } }).run("deployment-1", new Date());
  assert.equal(duplicate.finished.length, 0);
});
