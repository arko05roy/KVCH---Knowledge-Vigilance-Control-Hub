import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import test from "node:test";
import { tmpdir } from "node:os";
import path from "node:path";
import { createArtifact, inspectArtifactBytes, packExtension } from "./artifact.js";
import { ExtensionValidationError } from "./errors.js";
import { validateExtension } from "./manifest.js";

const fixture = (name: string) => path.join(process.cwd(), "test", "fixtures", name);

test("validates both TypeScript and Python standalone packages", async () => {
  const typescript = await validateExtension(fixture("typescript-extension"));
  const python = await validateExtension(fixture("python-extension"));
  assert.equal(typescript.valid, true);
  assert.equal(typescript.manifest?.implementation.language, "typescript");
  assert.equal(typescript.manifest?.deployment.schedule, "*/5 * * * *");
  assert.equal(python.valid, true);
  assert.equal(python.manifest?.implementation.language, "python");
  assert.equal(python.manifest?.deployment.schedule, "*/10 * * * *");
});

test("reports specific invalid manifest failures", async () => {
  const result = await validateExtension(fixture("invalid-manifest"));
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.path === "id"));
  assert.ok(result.issues.some((issue) => issue.path === "implementation.entrypoint"));
  assert.ok(result.issues.some((issue) => issue.path === "commands.run"));
  assert.ok(result.issues.some((issue) => issue.path === "runtime_compatibility.credentials"));
  assert.ok(result.issues.some((issue) => issue.path === "deployment.schedule"));
});

test("packing is byte deterministic and inspection does not execute package code", async () => {
  const root = fixture("typescript-extension");
  const first = await createArtifact(root);
  const second = await createArtifact(root);
  assert.deepEqual(first, second);
  const inspected = inspectArtifactBytes(first);
  assert.equal(inspected.manifest.id, "repository-secret-monitor");
  assert.equal(inspected.manifest.deployment.schedule, "*/5 * * * *");
  assert.ok(inspected.files.some((file) => file.path === "src/index.ts"));
  assert.ok(!inspected.files.some((file) => file.path.startsWith("node_modules/")));
});

test("a changed source produces a different artifact hash", async () => {
  const temp = await mkdtemp(path.join(tmpdir(), "kvch-bridge-"));
  try {
    const artifactPath = path.join(temp, "extension.kvch.tgz");
    const original = await packExtension(fixture("typescript-extension"), artifactPath);
    const originalSource = await readFile(path.join(fixture("typescript-extension"), "src/index.ts"), "utf8");
    const copied = path.join(temp, "extension");
    const { cp } = await import("node:fs/promises");
    await cp(fixture("typescript-extension"), copied, { recursive: true });
    await writeFile(path.join(copied, "src/index.ts"), `${originalSource}\nexport const artifactChange = true;\n`);
    const changed = await packExtension(copied, path.join(temp, "changed.kvch.tgz"));
    assert.notEqual(changed.sha256, original.sha256);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test("artifact inspection rejects a malformed archive", () => {
  assert.throws(() => inspectArtifactBytes(Buffer.from("not an artifact")), /gzip-compressed tar/);
});
