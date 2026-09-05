import "server-only";
import type { Prisma, RunStatus } from "@prisma/client";
import type { JudgeArtifact, JudgeResult } from "../judge/kernel";
import type { FindingEnvelope } from "../judge/findings";

export interface RunPersistence {
  getDeploymentForRun(deploymentId: string): Promise<(JudgeArtifact & { id: string; artifactId: string; active: boolean }) | null>;
  startRun(input: { deploymentId: string; artifactId: string; dueAt: Date }): Promise<{ id: string; execute: boolean }>;
  finishRun(input: {
    runId: string;
    artifactId: string;
    status: RunStatus;
    exitCode: number | null;
    commandResults: Prisma.InputJsonValue;
    stdout: string | null;
    stderr: string | null;
    findings: FindingEnvelope[];
  }): Promise<void>;
}

export interface RunJudgeExecutor { execute(artifact: JudgeArtifact, mode: "run"): Promise<JudgeResult>; }

function evidence(result: JudgeResult): Prisma.InputJsonObject {
  return { failureReason: result.failureReason ?? null, phases: result.phases.map(({ phase, result: process }) => ({ phase, ...process })) };
}

export class ExtensionRunService {
  constructor(private readonly persistence: RunPersistence, private readonly judge: RunJudgeExecutor) {}

  async run(deploymentId: string, dueAt: Date): Promise<void> {
    const deployment = await this.persistence.getDeploymentForRun(deploymentId);
    if (!deployment) throw new Error(`Deployment not found: ${deploymentId}`);
    if (!deployment.active) return;
    const run = await this.persistence.startRun({ deploymentId, artifactId: deployment.artifactId, dueAt });
    if (!run.execute) return;
    let result: JudgeResult;
    try { result = await this.judge.execute(deployment, "run"); }
    catch (error) { result = { adapter: null, phases: [], findings: [], failureReason: error instanceof Error ? error.message : "Judge run failed" }; }
    const process = result.phases.at(-1)?.result;
    const status: RunStatus = result.failureReason ? "failed" : result.findings.length ? "finding" : "healthy";
    await this.persistence.finishRun({
      runId: run.id, artifactId: deployment.artifactId, status, exitCode: process?.exitCode ?? null,
      commandResults: evidence(result), stdout: process?.stdout ?? null, stderr: process?.stderr ?? null, findings: status === "finding" ? result.findings : [],
    });
  }
}
