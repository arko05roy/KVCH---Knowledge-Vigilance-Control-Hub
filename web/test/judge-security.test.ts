import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import test from "node:test";
import { packExtension } from "@arko05roy/kvch-extension";
import { KvchJudge } from "../lib/judge/kernel";
import { LocalArtifactStorage } from "../lib/storage/artifacts";

test("Judge active rejection protocol: rejects artifact with invalid hardware signature or missing binding", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "kvch-security-"));
  const originalKey = process.env.KVCH_HARDWARE_SIGNING_KEY;
  try {
    const packagePath = path.join(root, "fixture.kvch.tgz");
    // Pack with a custom key
    process.env.KVCH_HARDWARE_SIGNING_KEY = "key-A-for-packaging";
    await packExtension(path.resolve("test/fixtures/judge/node"), packagePath);
    const bytes = await readFile(packagePath);

    const storage = new LocalArtifactStorage(path.join(root, "storage"));
    const stored = await storage.put("company_security", Readable.from(bytes));

    // Judge runs with a different key, causing signature verification to fail
    process.env.KVCH_HARDWARE_SIGNING_KEY = "key-B-for-verification";

    const judge = new KvchJudge(storage, {
      workspaceRoot: path.join(root, "workspaces"),
      shellCommand: "/bin/sh",
      nodeCommand: process.execPath,
      pythonCommand: "python3",
      commandTimeoutMs: 10_000,
      logLimitBytes: 64 * 1024,
    });

    const artifact = { sha256: stored.sha256, storageKey: stored.key };
    const result = await judge.execute(artifact, "evaluation");

    assert.ok(result.failureReason?.includes("Invalid hardware fingerprint signature"));
  } finally {
    if (originalKey !== undefined) {
      process.env.KVCH_HARDWARE_SIGNING_KEY = originalKey;
    } else {
      delete process.env.KVCH_HARDWARE_SIGNING_KEY;
    }
    await rm(root, { recursive: true, force: true });
  }
});

test("Judge active rejection protocol: rejects execution when hardware profile is unauthorized", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "kvch-security-"));
  const originalProfile = process.env.KVCH_AUTHORIZED_HARDWARE_PROFILES;
  try {
    process.env.KVCH_AUTHORIZED_HARDWARE_PROFILES = "kvch-hw-v1:unauthorized-hardware-id-12345";
    const packagePath = path.join(root, "fixture.kvch.tgz");
    await packExtension(path.resolve("test/fixtures/judge/node"), packagePath);
    const bytes = await readFile(packagePath);

    const storage = new LocalArtifactStorage(path.join(root, "storage"));
    const stored = await storage.put("company_security", Readable.from(bytes));

    const judge = new KvchJudge(storage, {
      workspaceRoot: path.join(root, "workspaces"),
      shellCommand: "/bin/sh",
      nodeCommand: process.execPath,
      pythonCommand: "python3",
      commandTimeoutMs: 10_000,
      logLimitBytes: 64 * 1024,
    });

    const artifact = { sha256: stored.sha256, storageKey: stored.key };
    const result = await judge.execute(artifact, "evaluation");

    assert.ok(result.failureReason?.includes("Unauthorized hardware profile"));
  } finally {
    if (originalProfile !== undefined) {
      process.env.KVCH_AUTHORIZED_HARDWARE_PROFILES = originalProfile;
    } else {
      delete process.env.KVCH_AUTHORIZED_HARDWARE_PROFILES;
    }
    await rm(root, { recursive: true, force: true });
  }
});
