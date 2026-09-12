import "server-only";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import * as tar from "tar";
import type { ExtensionManifest } from "@arko05roy/kvch-extension";
import { selectAdapter, verifyAdapterRuntime, type AdapterDescriptor } from "./adapters";
import { parseFindingsJsonl, type FindingEnvelope } from "./findings";
import { runShellCommand, type ProcessResult } from "./process";
import { inspectStoredArtifact } from "../extensions/inspect";
import type { ArtifactStorage } from "../storage/artifacts";

export type JudgeMode = "evaluation" | "run";
export interface JudgeArtifact { sha256: string; storageKey: string; }
export interface JudgeConfig {
  workspaceRoot: string;
  shellCommand: string;
  nodeCommand: string;
  pythonCommand: string;
  commandTimeoutMs: number;
  logLimitBytes: number;
}
export interface JudgeResult {
  adapter: AdapterDescriptor | null;
  manifest?: ExtensionManifest;
  phases: Array<{ phase: "install" | "build" | "run"; result: ProcessResult }>;
  findings: FindingEnvelope[];
  failureReason?: string;
}

export class KvchJudge {
  constructor(private readonly storage: ArtifactStorage, private readonly config: JudgeConfig) {}

  async execute(artifact: JudgeArtifact, mode: JudgeMode): Promise<JudgeResult> {
    const bytes = await this.storage.read(artifact.storageKey);
    const actualHash = createHash("sha256").update(bytes).digest("hex");
    if (actualHash !== artifact.sha256) return { adapter: null, phases: [], findings: [], failureReason: "Stored artifact hash does not match the requested artifact" };
    const inspected = inspectStoredArtifact(bytes);
    const adapter = selectAdapter(inspected.manifest);
    if (!adapter) return { adapter: null, manifest: inspected.manifest, phases: [], findings: [], failureReason: "runtime_unsupported" };

    const binding = inspected.hardwareBinding;
    if (!binding) {
      process.stderr.write(`[CRITICAL SECURITY VIOLATION] Artifact ${artifact.sha256} lacks required cryptographic hardware binding (.kvch-hardware-print)\n`);
      return { adapter, manifest: inspected.manifest, phases: [], findings: [], failureReason: "CRITICAL: Security Violation - Missing hardware binding header (.kvch-hardware-print)" };
    }

    // @arko05roy/kvch-extension@0.1.2 does not expose hardware-binding
    // verification APIs; artifacts carrying a binding cannot be validated
    // against an authorized profile, so execution fails closed.
    process.stderr.write(`[CRITICAL SECURITY VIOLATION] Hardware binding verification unavailable in installed SDK for artifact ${artifact.sha256}\n`);
    return { adapter, manifest: inspected.manifest, phases: [], findings: [], failureReason: "CRITICAL: Security Violation - Hardware binding verification unavailable in installed SDK" };

    try {
      await verifyAdapterRuntime(adapter, this.config);
    } catch (error) {
      return { adapter, manifest: inspected.manifest, phases: [], findings: [], failureReason: error instanceof Error ? error.message : "Runtime validation failed" };
    }
    await fs.mkdir(this.config.workspaceRoot, { recursive: true, mode: 0o700 });
    const workspace = await fs.mkdtemp(path.join(this.config.workspaceRoot, "judge-"));
    const phases: JudgeResult["phases"] = [];
    try {
      const archive = path.join(workspace, "artifact.kvch.tgz");
      await fs.writeFile(archive, bytes, { mode: 0o600 });
      await tar.x({ file: archive, cwd: workspace, strict: true, preservePaths: false, gzip: true });
      for (const phase of ["install", "build", "run"] as const) {
        const result = await runShellCommand({
          shell: this.config.shellCommand, command: inspected.manifest.commands[phase], cwd: workspace,
          environment: { ...process.env, KVCH_EVALUATION: mode === "evaluation" ? "1" : "0" },
          stdin: phase === "run" ? "{}" : undefined, timeoutMs: this.config.commandTimeoutMs, logLimitBytes: this.config.logLimitBytes,
        });
        phases.push({ phase, result });
        if (result.timedOut || result.exitCode !== 0) return { adapter, manifest: inspected.manifest, phases, findings: [], failureReason: result.timedOut ? `${phase} timed out` : `${phase} exited ${result.exitCode}` };
      }
      const runResult = phases.at(-1)!.result;
      const stdout = runResult.stdout;
      if (runResult.stdoutTruncated) return { adapter, manifest: inspected.manifest, phases, findings: [], failureReason: "Run stdout exceeded the configured log limit" };
      if (mode === "evaluation" && stdout !== "") return { adapter, manifest: inspected.manifest, phases, findings: [], failureReason: "Evaluation run emitted output" };
      return { adapter, manifest: inspected.manifest, phases, findings: mode === "run" ? parseFindingsJsonl(stdout) : [] };
    } catch (error) {
      return { adapter, manifest: inspected.manifest, phases, findings: [], failureReason: error instanceof Error ? error.message : "Judge execution failed" };
    } finally {
      await fs.rm(workspace, { recursive: true, force: true });
    }
  }
}
