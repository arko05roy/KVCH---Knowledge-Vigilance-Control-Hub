import "server-only";
import type { ArtifactState, EvaluationStatus, Prisma } from "@prisma/client";
import type { JudgeArtifact, JudgeResult } from "../judge/kernel";

export interface EvaluationPersistence {
  getArtifactForEvaluation(artifactId: string): Promise<(JudgeArtifact & { id: string }) | null>;
  startEvaluation(artifactId: string): Promise<{ id: string }>;
  finishEvaluation(input: {
    evaluationId: string;
    artifactId: string;
    status: EvaluationStatus;
    artifactState: ArtifactState;
    adapterKey: string | null;
    adapterVersion: string | null;
    commandResults: Prisma.InputJsonValue;
    stdout: string | null;
    stderr: string | null;
  }): Promise<void>;
}

export interface JudgeExecutor {
  execute(artifact: JudgeArtifact, mode: "evaluation"): Promise<JudgeResult>;
}

function evidence(result: JudgeResult): Prisma.InputJsonObject {
  return {
    failureReason: result.failureReason ?? null,
    phases: result.phases.map(({ phase, result: process }) => ({ phase, ...process })),
  };
}

function finalLogs(result: JudgeResult) {
  const run = result.phases.at(-1)?.result;
  return { stdout: run?.stdout ?? null, stderr: run?.stderr ?? null };
}

export class EvaluationService {
  constructor(private readonly persistence: EvaluationPersistence, private readonly judge: JudgeExecutor) {}

  async evaluate(artifactId: string): Promise<void> {
    const artifact = await this.persistence.getArtifactForEvaluation(artifactId);
    if (!artifact) throw new Error(`Artifact not found for evaluation: ${artifactId}`);
    const evaluation = await this.persistence.startEvaluation(artifact.id);
    let result: JudgeResult;
    try {
      result = await this.judge.execute(artifact, "evaluation");
    } catch (error) {
      result = { adapter: null, phases: [], findings: [], failureReason: error instanceof Error ? error.message : "Judge evaluation failed" };
    }
    const passed = !result.failureReason && result.phases.length === 3 && result.phases.every(({ result: process }) => process.exitCode === 0 && !process.timedOut) && result.phases.at(-1)?.result.stdout === "";
    const runtimeUnsupported = result.failureReason === "runtime_unsupported";
    const logs = finalLogs(result);
    await this.persistence.finishEvaluation({
      evaluationId: evaluation.id,
      artifactId: artifact.id,
      status: passed ? "passed" : "failed",
      artifactState: passed ? "deployable" : runtimeUnsupported ? "runtime_unsupported" : "evaluation_failed",
      adapterKey: result.adapter?.key ?? null,
      adapterVersion: result.adapter?.version ?? null,
      commandResults: evidence(result),
      stdout: logs.stdout,
      stderr: logs.stderr,
    });
  }
}
