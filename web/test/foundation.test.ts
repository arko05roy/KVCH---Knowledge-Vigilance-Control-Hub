import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import test from "node:test";
import { readKvchConfig } from "../lib/config";
import { LocalArtifactStorage } from "../lib/storage/artifacts";

test("configuration requires explicit database, storage, workspace, runtime, and limits", () => {
  const root = path.join(tmpdir(), "kvch-config");
  const environment = {
    DATABASE_URL: "postgresql://user:password@localhost:5432/kvch",
    KVCH_ARTIFACT_STORAGE_DIR: path.join(root, "artifacts"),
    KVCH_WORKSPACE_ROOT: path.join(root, "workspaces"),
    KVCH_NODE_COMMAND: "node",
    KVCH_PYTHON_COMMAND: "python3",
    KVCH_SHELL_COMMAND: "/bin/sh",
    KVCH_COMMAND_TIMEOUT_MS: "60000",
    KVCH_LOG_LIMIT_BYTES: "1048576",
    KVCH_MAX_ARTIFACT_BYTES: "104857600",
  };
  assert.equal(readKvchConfig(environment).logLimitBytes, 1048576);
  assert.throws(() => readKvchConfig({ ...environment, KVCH_WORKSPACE_ROOT: environment.KVCH_ARTIFACT_STORAGE_DIR }), /must differ/);
  assert.throws(() => readKvchConfig({ ...environment, DATABASE_URL: "https://example.com" }), /PostgreSQL/);
  assert.throws(() => readKvchConfig({ ...environment, KVCH_LOG_LIMIT_BYTES: "zero" }), /positive integer/);
});

test("local storage writes, rereads, checksums, deduplicates, and removes only valid keys", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "kvch-storage-"));
  try {
    const storage = new LocalArtifactStorage(root);
    const first = await storage.put("company_1", Readable.from(Buffer.from("exact artifact bytes")));
    const second = await storage.put("company_1", Readable.from(Buffer.from("exact artifact bytes")));
    assert.equal(first.sha256, "334e3a1d10a0a00a0a6c77ce4272cff103dd46564b51cf3b36becf01571685ba");
    assert.deepEqual(second, first);
    assert.deepEqual(await storage.read(first.key), Buffer.from("exact artifact bytes"));
    await storage.remove(first.key);
    await assert.rejects(() => storage.read(first.key));
    await assert.rejects(() => storage.read("../escape"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
