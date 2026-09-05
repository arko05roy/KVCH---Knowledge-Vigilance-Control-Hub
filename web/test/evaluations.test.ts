import assert from "node:assert/strict";
import test from "node:test";
import type { EvaluationPersistence, JudgeExecutor } from "../lib/extensions/evaluations";
import { EvaluationService } from "../lib/extensions/evaluations";
import type { JudgeResult } from "../lib/judge/kernel";

const successful: JudgeResult = {
  adapter: { key: "typescript/node", version: "1" },
  phases: ["install", "build", "run"].map((phase) => ({
    phase: phase as "install" | "build" | "run",
    result: { command: phase, exitCode: 0, durationMs: 1, stdout: "", stderr: "", stdoutTruncated: false, stderrTruncated: false, timedOut: false },
  })),
  findings: [],
};

class MemoryEvaluationPersistence implements EvaluationPersistence {
  readonly finishCalls: Parameters<EvaluationPersistence["finishEvaluation"]>[0][] = [];
  async getArtifactForEvaluation(artifactId: string) { return artifactId === "known" ? { id: artifactId, sha256: "a".repeat(64), storageKey: "artifacts/company_1/" + "a".repeat(64) + ".kvch.tgz" } : null; }
  async startEvaluation() { return { id: "evaluation-1" }; }
  async finishEvaluation(input: Parameters<EvaluationPersistence["finishEvaluation"]>[0]) { this.finishCalls.push(input); }
}

test("evaluation persists a passing preflight and makes the artifact deployable", async () => {
  const persistence = new MemoryEvaluationPersistence();
  const judge: JudgeExecutor = { execute: async () => successful };
  await new EvaluationService(persistence, judge).evaluate("known");
  assert.equal(persistence.finishCalls[0]?.status, "passed");
  assert.equal(persistence.finishCalls[0]?.artifactState, "deployable");
  assert.equal(persistence.finishCalls[0]?.adapterKey, "typescript/node");
});

test("evaluation stores output violations as failed evidence", async () => {
  const persistence = new MemoryEvaluationPersistence();
  const judge: JudgeExecutor = { execute: async () => ({ ...successful, failureReason: "Evaluation run emitted output", phases: successful.phases.map((entry, index) => index === 2 ? { ...entry, result: { ...entry.result, stdout: "unexpected" } } : entry) }) };
  await new EvaluationService(persistence, judge).evaluate("known");
  assert.equal(persistence.finishCalls[0]?.status, "failed");
  assert.equal(persistence.finishCalls[0]?.artifactState, "evaluation_failed");
  assert.equal(persistence.finishCalls[0]?.stdout, "unexpected");
});

test("unsupported runtime and judge exceptions cannot become deployable", async () => {
  const unsupported = new MemoryEvaluationPersistence();
  await new EvaluationService(unsupported, { execute: async () => ({ adapter: null, phases: [], findings: [], failureReason: "runtime_unsupported" }) }).evaluate("known");
  assert.equal(unsupported.finishCalls[0]?.artifactState, "runtime_unsupported");
  const failed = new MemoryEvaluationPersistence();
  await new EvaluationService(failed, { execute: async () => { throw new Error("storage unavailable"); } }).evaluate("known");
  assert.equal(failed.finishCalls[0]?.artifactState, "evaluation_failed");
  assert.match(String((failed.finishCalls[0]?.commandResults as { failureReason?: string }).failureReason), /storage unavailable/);
});
