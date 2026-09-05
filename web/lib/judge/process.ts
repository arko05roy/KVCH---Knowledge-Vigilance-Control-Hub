import "server-only";
import { spawn } from "node:child_process";

export interface ProcessResult {
  command: string;
  exitCode: number | null;
  durationMs: number;
  stdout: string;
  stderr: string;
  stdoutTruncated: boolean;
  stderrTruncated: boolean;
  timedOut: boolean;
}

function boundedCollector(limit: number) {
  const chunks: Buffer[] = [];
  let length = 0;
  let truncated = false;
  return {
    add(chunk: Buffer) {
      const remaining = limit - length;
      if (remaining <= 0) { truncated = true; return; }
      const stored = chunk.subarray(0, remaining);
      chunks.push(stored);
      length += stored.length;
      if (stored.length < chunk.length) truncated = true;
    },
    read() { return { value: Buffer.concat(chunks).toString("utf8"), truncated }; },
  };
}

export async function runShellCommand(input: {
  shell: string;
  command: string;
  cwd: string;
  environment: NodeJS.ProcessEnv;
  stdin?: string;
  timeoutMs: number;
  logLimitBytes: number;
}): Promise<ProcessResult> {
  const started = performance.now();
  const stdout = boundedCollector(input.logLimitBytes);
  const stderr = boundedCollector(input.logLimitBytes);
  return new Promise((resolve, reject) => {
    const child = spawn(input.shell, ["-c", input.command], {
      cwd: input.cwd, env: input.environment, stdio: ["pipe", "pipe", "pipe"], detached: process.platform !== "win32",
    });
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      if (process.platform !== "win32" && child.pid) process.kill(-child.pid, "SIGKILL");
      else child.kill("SIGKILL");
    }, input.timeoutMs);
    child.once("error", (error) => { clearTimeout(timer); reject(error); });
    child.stdout.on("data", (chunk: Buffer) => stdout.add(Buffer.from(chunk)));
    child.stderr.on("data", (chunk: Buffer) => stderr.add(Buffer.from(chunk)));
    child.once("close", (exitCode) => {
      clearTimeout(timer);
      const capturedOut = stdout.read();
      const capturedErr = stderr.read();
      resolve({ command: input.command, exitCode, durationMs: Math.round(performance.now() - started), stdout: capturedOut.value, stderr: capturedErr.value, stdoutTruncated: capturedOut.truncated, stderrTruncated: capturedErr.truncated, timedOut });
    });
    child.stdin.end(input.stdin);
  });
}
