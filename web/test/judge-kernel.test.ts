import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import test from "node:test";
import { packExtension } from "@arko05roy/kvch-extension";
import { parseFindingsJsonl } from "../lib/judge/findings";
import { KvchJudge } from "../lib/judge/kernel";
import { LocalArtifactStorage } from "../lib/storage/artifacts";

for (const language of ["node", "python"] as const) {
  test(language + ": Judge evaluates and runs an exact stored fixture then removes its workspace", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "kvch-kernel-"));
    try {
      const packagePath = path.join(root, "fixture.kvch.tgz");
      await packExtension(path.resolve("test/fixtures/judge", language), packagePath);
      const storage = new LocalArtifactStorage(path.join(root, "storage"));
      const stored = await storage.put("company_1", Readable.from(await readFile(packagePath)));
      const judge = new KvchJudge(storage, {
        workspaceRoot: path.join(root, "workspaces"), shellCommand: "/bin/sh", nodeCommand: process.execPath,
        pythonCommand: "python3", commandTimeoutMs: 10_000, logLimitBytes: 64 * 1024,
      });
      const artifact = { sha256: stored.sha256, storageKey: stored.key };
      const evaluation = await judge.execute(artifact, "evaluation");
      assert.equal(evaluation.failureReason, undefined);
      assert.deepEqual(evaluation.phases.map(({ phase }) => phase), ["install", "build", "run"]);
      assert.equal(evaluation.phases.at(-1)?.result.stdout, "");
      const run = await judge.execute(artifact, "run");
      assert.equal(run.failureReason, undefined);
      assert.equal(run.findings.length, 2);
      assert.deepEqual(await readdir(path.join(root, "workspaces")), []);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
}

test("Judge JSONL parser rejects malformed and incomplete records", () => {
  assert.throws(() => parseFindingsJsonl("not json\n"), /not valid JSON/);
  assert.throws(() => parseFindingsJsonl('{"schema_version":"kvch.finding/v1"}\n'), /valid kvch.finding/);
});

test("Judge refuses a missing configured runtime before creating a workspace", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "kvch-kernel-"));
  try {
    const archive = path.join(root, "fixture.kvch.tgz");
    await packExtension(path.resolve("test/fixtures/judge/node"), archive);
    const storage = new LocalArtifactStorage(path.join(root, "storage"));
    const stored = await storage.put("company_1", Readable.from(await readFile(archive)));
    const judge = new KvchJudge(storage, {
      workspaceRoot: path.join(root, "workspaces"), shellCommand: "/bin/sh", nodeCommand: "/missing/node",
      pythonCommand: "python3", commandTimeoutMs: 10_000, logLimitBytes: 64 * 1024,
    });
    const result = await judge.execute({ sha256: stored.sha256, storageKey: stored.key }, "evaluation");
    assert.match(result.failureReason ?? "", /executable is unavailable/);
    await assert.rejects(() => readdir(path.join(root, "workspaces")));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Judge refuses a stored artifact whose requested hash does not match", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "kvch-kernel-"));
  try {
    const archive = path.join(root, "fixture.kvch.tgz");
    await packExtension(path.resolve("test/fixtures/judge/node"), archive);
    const storage = new LocalArtifactStorage(path.join(root, "storage"));
    const stored = await storage.put("company_1", Readable.from(await readFile(archive)));
    const judge = new KvchJudge(storage, {
      workspaceRoot: path.join(root, "workspaces"), shellCommand: "/bin/sh", nodeCommand: process.execPath,
      pythonCommand: "python3", commandTimeoutMs: 10_000, logLimitBytes: 64 * 1024,
    });
    const result = await judge.execute({ sha256: "0".repeat(64), storageKey: stored.key }, "evaluation");
    assert.match(result.failureReason ?? "", /hash does not match/);
    await assert.rejects(() => readdir(path.join(root, "workspaces")));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
