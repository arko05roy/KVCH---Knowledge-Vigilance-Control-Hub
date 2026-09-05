import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { packExtension } from "@arko05roy/kvch-extension";
import { inspectStoredArtifact } from "../lib/extensions/inspect";
import { selectAdapter } from "../lib/judge/adapters";

for (const language of ["node", "python"] as const) {
  test(language + ": published packer and hosted lifecycle", async () => {
    const workspace = await mkdtemp(path.join(tmpdir(), "kvch-contract-"));
    try {
      const file = path.join(workspace, "fixture.kvch.tgz");
      const fixture = path.resolve("test/fixtures/judge", language);
      const packed = await packExtension(fixture, file);
      const bytes = await readFile(file);
      const artifact = inspectStoredArtifact(bytes);
      assert.equal(artifact.sha256, createHash("sha256").update(bytes).digest("hex"));
      assert.equal(artifact.sha256, packed.sha256);
      assert.equal(artifact.manifest.deployment.schedule, "*/5 * * * *");
      assert.equal(artifact.adapter?.key, language === "node" ? "typescript/node" : "python/python3");
      assert.equal(artifact.adapter?.version, "1");
      assert.equal(artifact.state, "uploaded");
      // Only extract our known safe fixture; this is not an upload extractor.
      execFileSync("tar", ["-xzf", file, "-C", workspace]);
      for (const phase of ["install", "build"] as const) {
        execFileSync("/bin/sh", ["-c", artifact.manifest.commands[phase]], { cwd: workspace, timeout: 10000 });
      }
      const run = (evaluation: boolean) => execFileSync("/bin/sh", ["-c", artifact.manifest.commands.run], {
        cwd: workspace, timeout: 10000, encoding: "utf8", input: "{}",
        env: { ...process.env, KVCH_EVALUATION: evaluation ? "1" : "0" },
      });
      assert.equal(run(true), "");
      const findings = run(false).trim().split("\n").map((line) => JSON.parse(line));
      assert.equal(findings.length, 2);
      assert.ok(findings.every((finding) => finding.schema_version === "kvch.finding/v1" && finding.details.synthetic));
      assert.equal(selectAdapter({ ...artifact.manifest, implementation: { ...artifact.manifest.implementation, runtime: "browser" } }), null);
      assert.equal(selectAdapter({ ...artifact.manifest, implementation: { ...artifact.manifest.implementation, language: "ruby" } }), null);
      const repeat = path.join(workspace, "repeat.kvch.tgz");
      await packExtension(fixture, repeat);
      assert.deepEqual(await readFile(repeat), bytes);
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });
}

test("invalid archive is rejected during inspection", () => {
  assert.throws(() => inspectStoredArtifact(Buffer.from("not an archive")), /gzip/);
});
