#!/usr/bin/env node
import { resolve } from "node:path";
import { ArtifactFormatError, ExtensionValidationError, hashArtifact, inspectArtifact, packExtension, validateExtension } from "./index.js";

function usage(): string {
  return [
    "Usage:",
    "  kvch-extension validate <extension-folder>",
    "  kvch-extension pack <extension-folder> --output <artifact-file>",
    "  kvch-extension inspect <artifact-file>",
    "  kvch-extension hash <artifact-file>",
  ].join("\n");
}

function fail(message: string): never {
  process.stderr.write(`Error: ${message}\n`);
  process.exitCode = 1;
  throw new Error("CLI_EXIT");
}

async function run(): Promise<void> {
  const [command, target, ...options] = process.argv.slice(2);
  if (!command || command === "--help" || command === "-h") {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  if (!target) fail(`${command} requires a path.\n${usage()}`);

  if (command === "validate") {
    if (options.length) fail(`validate does not accept additional options.\n${usage()}`);
    const result = await validateExtension(target);
    if (!result.valid) {
      process.stderr.write(`Extension validation failed:\n${result.issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n")}\n`);
      process.exitCode = 1;
      return;
    }
    const manifest = result.manifest;
    if (!manifest) fail("validation returned no manifest");
    process.stdout.write(`Valid KVCH extension: ${manifest.id}@${manifest.version}\n`);
    return;
  }

  if (command === "pack") {
    if (options.length !== 2 || options[0] !== "--output" || !options[1]) fail(`pack requires --output <artifact-file>.\n${usage()}`);
    const output = resolve(options[1]);
    const packed = await packExtension(target, output);
    const inspected = await inspectArtifact(output);
    process.stdout.write(`Packed ${output}\nSHA-256: ${packed.sha256}\nSize: ${packed.size} bytes\n`);
    if (inspected.hardwareBinding) {
      process.stdout.write(`Hardware Fingerprint: ${inspected.hardwareBinding.hardwareFingerprint}\nSignature: ${inspected.hardwareBinding.signature}\n`);
    }
    return;
  }

  if (command === "inspect") {
    if (options.length) fail(`inspect does not accept additional options.\n${usage()}`);
    process.stdout.write(`${JSON.stringify(await inspectArtifact(target), null, 2)}\n`);
    return;
  }

  if (command === "hash") {
    if (options.length) fail(`hash does not accept additional options.\n${usage()}`);
    process.stdout.write(`${await hashArtifact(target)}\n`);
    return;
  }
  fail(`unknown command: ${command}\n${usage()}`);
}

run().catch((error: unknown) => {
  if (error instanceof ExtensionValidationError || error instanceof ArtifactFormatError) {
    process.stderr.write(`Error: ${error.message}\n`);
    process.exitCode = 1;
    return;
  }
  if (error instanceof Error && error.message === "CLI_EXIT") return;
  process.stderr.write(`Unexpected error: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
