import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import test from "node:test";
import { packExtension } from "@arko05roy/kvch-extension";
import { ArtifactIntakeService, type ArtifactPersistence, type StoredArtifactRecord } from "../lib/extensions/artifacts";
import { LocalArtifactStorage } from "../lib/storage/artifacts";

class MemoryPersistence implements ArtifactPersistence {
  readonly records = new Map<string, StoredArtifactRecord>();

  async createArtifact(input: Parameters<ArtifactPersistence["createArtifact"]>[0]) {
    const key = input.companyId + ":" + input.sha256;
    const existing = this.records.get(key);
    if (existing) return { artifact: existing, created: false };
    const artifact = { id: "artifact-" + (this.records.size + 1), sha256: input.sha256, storageKey: input.storageKey, state: input.state };
    this.records.set(key, artifact);
    return { artifact, created: true };
  }
}

test("intake stores first, inspects stored bytes, and resolves a duplicate company hash", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "kvch-intake-"));
  try {
    const fixture = path.resolve("test/fixtures/judge/node");
    const packed = path.join(root, "fixture.kvch.tgz");
    await packExtension(fixture, packed);
    const bytes = await readFile(packed);
    const persistence = new MemoryPersistence();
    const service = new ArtifactIntakeService(new LocalArtifactStorage(path.join(root, "store")), persistence);
    const first = await service.intake("company_1", Readable.from(bytes));
    const duplicate = await service.intake("company_1", Readable.from(bytes));
    assert.equal(first.created, true);
    assert.equal(duplicate.created, false);
    assert.equal(first.artifact.id, duplicate.artifact.id);
    assert.equal(first.artifact.state, "uploaded");
    assert.equal(persistence.records.size, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("intake removes invalid bytes after stored-byte inspection fails", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "kvch-intake-"));
  try {
    const storage = new LocalArtifactStorage(path.join(root, "store"));
    const service = new ArtifactIntakeService(storage, new MemoryPersistence());
    await assert.rejects(() => service.intake("company_1", Readable.from(Buffer.from("not an artifact"))), /gzip/);
    assert.deepEqual(await (await import("node:fs/promises")).readdir(path.join(root, "store", "artifacts", "company_1")), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
