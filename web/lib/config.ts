import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

export interface KvchConfig {
  databaseUrl: string;
  artifactStorageDir: string;
  workspaceRoot: string;
  nodeCommand: string;
  pythonCommand: string;
  shellCommand: string;
  commandTimeoutMs: number;
  logLimitBytes: number;
}

type Environment = Record<string, string | undefined>;

function required(environment: Environment, key: string): string {
  const value = environment[key]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function positiveInteger(environment: Environment, key: string): number {
  const raw = required(environment, key);
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`${key} must be a positive integer`);
  return value;
}

function absoluteDirectory(environment: Environment, key: string): string {
  const value = required(environment, key);
  if (!path.isAbsolute(value)) throw new Error(`${key} must be an absolute path`);
  return path.resolve(value);
}

export function readKvchConfig(environment: Environment = process.env): KvchConfig {
  const databaseUrl = required(environment, "DATABASE_URL");
  try {
    const parsed = new URL(databaseUrl);
    if (!["postgres:", "postgresql:"].includes(parsed.protocol)) throw new Error();
  } catch {
    throw new Error("DATABASE_URL must be a PostgreSQL connection URL");
  }
  const artifactStorageDir = absoluteDirectory(environment, "KVCH_ARTIFACT_STORAGE_DIR");
  const workspaceRoot = absoluteDirectory(environment, "KVCH_WORKSPACE_ROOT");
  if (artifactStorageDir === workspaceRoot) throw new Error("KVCH_ARTIFACT_STORAGE_DIR and KVCH_WORKSPACE_ROOT must differ");
  return {
    databaseUrl,
    artifactStorageDir,
    workspaceRoot,
    nodeCommand: required(environment, "KVCH_NODE_COMMAND"),
    pythonCommand: required(environment, "KVCH_PYTHON_COMMAND"),
    shellCommand: required(environment, "KVCH_SHELL_COMMAND"),
    commandTimeoutMs: positiveInteger(environment, "KVCH_COMMAND_TIMEOUT_MS"),
    logLimitBytes: positiveInteger(environment, "KVCH_LOG_LIMIT_BYTES"),
  };
}

/** Creates only configured service directories, never an inferred fallback path. */
export async function initializeKvchDirectories(config: Pick<KvchConfig, "artifactStorageDir" | "workspaceRoot">): Promise<void> {
  await Promise.all([
    fs.mkdir(config.artifactStorageDir, { recursive: true, mode: 0o700 }),
    fs.mkdir(config.workspaceRoot, { recursive: true, mode: 0o700 }),
  ]);
}
