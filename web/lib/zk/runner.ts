import "server-only";
import { execFile } from "node:child_process";
import type { ZkConfig } from "./config";

export interface PipelineResult<T = unknown> {
  ok: boolean;
  data: T;
  stderr: string;
}

export class ZkPipelineError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly stderr: string,
  ) {
    super(message);
  }
}

/** Runs one pipeline.mjs subcommand and parses the single JSON stdout line.
 *  The prover/verifier/chain logic lives in zk/runtime — the web layer only
 *  orchestrates; private witness material never enters this process. */
export async function runPipeline<T = Record<string, unknown>>(
  config: Pick<ZkConfig, "pipelineScript" | "zkWorkspaceDir" | "commandTimeoutMs">,
  args: string[],
): Promise<T> {
  return new Promise((resolve, reject) => {
    execFile(
      "node",
      [config.pipelineScript, ...args],
      {
        cwd: config.zkWorkspaceDir,
        timeout: config.commandTimeoutMs,
        maxBuffer: 64 * 1024 * 1024,
        env: { ...process.env },
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new ZkPipelineError(
              `pipeline ${args[0]} failed: ${error.message}`,
              "PIPELINE_EXEC",
              stderr.slice(-4096),
            ),
          );
          return;
        }
        const line = stdout.trim().split("\n").pop();
        if (!line) {
          reject(new ZkPipelineError("pipeline produced no output", "PIPELINE_EMPTY", stderr.slice(-4096)));
          return;
        }
        try {
          const parsed = JSON.parse(line) as T & { ok?: boolean };
          resolve(parsed as T);
        } catch {
          reject(new ZkPipelineError("pipeline output is not JSON", "PIPELINE_PARSE", stdout.slice(-4096)));
        }
      },
    );
  });
}
