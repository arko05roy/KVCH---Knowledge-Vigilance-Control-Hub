import { createHash } from "node:crypto";
import { readdir, lstat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { parseDocument } from "yaml";
import { ArtifactFormatError, ExtensionValidationError } from "./errors.js";
import { getHardwareFingerprint, signHardwareFingerprint } from "./hardware.js";
import { readValidatedManifest, validateManifestData } from "./manifest.js";
import type { ArtifactFile, ArtifactInspection, CryptographicHardwareBinding, ExtensionManifest } from "./types.js";

const BLOCK_SIZE = 512;
const ARTIFACT_EXCLUSIONS = new Set([".git", "node_modules", "dist", ".DS_Store"]);
const MAX_ARTIFACT_BYTES = 100 * 1024 * 1024;
const MAX_FILES = 10_000;

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function writeString(target: Buffer, value: string, offset: number, length: number): void {
  const encoded = Buffer.from(value, "utf8");
  if (encoded.length > length) throw new ArtifactFormatError(`artifact path is too long: ${value}`);
  encoded.copy(target, offset);
}

function writeOctal(target: Buffer, value: number, offset: number, length: number): void {
  const encoded = value.toString(8).padStart(length - 1, "0");
  writeString(target, encoded, offset, length - 1);
  target[offset + length - 1] = 0;
}

function splitTarPath(relativePath: string): { name: string; prefix: string } {
  if (Buffer.byteLength(relativePath) <= 100) return { name: relativePath, prefix: "" };
  const slash = relativePath.lastIndexOf("/");
  if (slash > 0 && Buffer.byteLength(relativePath.slice(0, slash)) <= 155 && Buffer.byteLength(relativePath.slice(slash + 1)) <= 100) {
    return { prefix: relativePath.slice(0, slash), name: relativePath.slice(slash + 1) };
  }
  throw new ArtifactFormatError(`artifact path cannot be represented in ustar: ${relativePath}`);
}

function tarHeader(relativePath: string, size: number, executable: boolean): Buffer {
  const header = Buffer.alloc(BLOCK_SIZE);
  const { name, prefix } = splitTarPath(relativePath);
  writeString(header, name, 0, 100);
  writeOctal(header, executable ? 0o755 : 0o644, 100, 8);
  writeOctal(header, 0, 108, 8);
  writeOctal(header, 0, 116, 8);
  writeOctal(header, size, 124, 12);
  writeOctal(header, 0, 136, 12);
  header.fill(0x20, 148, 156);
  header[156] = "0".charCodeAt(0);
  writeString(header, "ustar", 257, 6);
  writeString(header, "00", 263, 2);
  writeString(header, prefix, 345, 155);
  let checksum = 0;
  for (const byte of header) checksum += byte;
  writeOctal(header, checksum, 148, 8);
  return header;
}

function padded(size: number): number {
  return Math.ceil(size / BLOCK_SIZE) * BLOCK_SIZE;
}

function safeArtifactPath(value: string): boolean {
  return value.length > 0 && !value.startsWith("/") && !value.split("/").some((part) => part === "" || part === "." || part === "..");
}

async function listPackageFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  async function walk(relative = ""): Promise<void> {
    const absolute = path.join(root, relative);
    const entries = await readdir(absolute, { withFileTypes: true });
    for (const entry of entries) {
      if (ARTIFACT_EXCLUSIONS.has(entry.name)) continue;
      const child = relative ? `${relative}/${entry.name}` : entry.name;
      const childPath = path.join(root, child);
      const metadata = await lstat(childPath);
      if (metadata.isSymbolicLink()) throw new ArtifactFormatError(`symbolic links are not allowed in artifacts: ${child}`);
      if (metadata.isDirectory()) await walk(child);
      else if (metadata.isFile()) files.push(child);
      else throw new ArtifactFormatError(`unsupported filesystem entry in artifact: ${child}`);
    }
  }
  await walk();
  return files.sort((left, right) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
}

export async function createArtifact(folder: string): Promise<Buffer> {
  const root = path.resolve(folder);
  await readValidatedManifest(root);
  const files = await listPackageFiles(root);
  if (files.length > MAX_FILES) throw new ArtifactFormatError(`package has more than ${MAX_FILES} files`);

  const packageFiles = files.filter((f) => f !== ".kvch-hardware-print");
  const fileDataList: Array<{ relativePath: string; bytes: Buffer; executable: boolean }> = [];
  const hasher = createHash("sha256");

  for (const relativePath of packageFiles) {
    const absolutePath = path.join(root, relativePath);
    const bytes = await readFile(absolutePath);
    const metadata = await lstat(absolutePath);
    const executable = (metadata.mode & 0o111) !== 0;
    fileDataList.push({ relativePath, bytes, executable });
    hasher.update(relativePath);
    hasher.update(bytes);
  }

  const payloadHash = hasher.digest("hex");
  const { fingerprint, telemetry } = getHardwareFingerprint();
  const signature = signHardwareFingerprint(fingerprint, payloadHash);

  const binding: CryptographicHardwareBinding = {
    hardwareFingerprint: fingerprint,
    signature,
    artifactSha256: payloadHash,
    telemetry,
  };

  const bindingBytes = Buffer.from(JSON.stringify(binding, null, 2), "utf8");

  const allEntries = [
    { relativePath: ".kvch-hardware-print", bytes: bindingBytes, executable: false },
    ...fileDataList,
  ].sort((a, b) => Buffer.compare(Buffer.from(a.relativePath), Buffer.from(b.relativePath)));

  const parts: Buffer[] = [];
  for (const entry of allEntries) {
    parts.push(tarHeader(entry.relativePath, entry.bytes.length, entry.executable), entry.bytes);
    const padding = padded(entry.bytes.length) - entry.bytes.length;
    if (padding) parts.push(Buffer.alloc(padding));
  }
  parts.push(Buffer.alloc(BLOCK_SIZE * 2));
  // Node's gzip encoder writes a zero MTIME by default, preserving reproducibility.
  return gzipSync(Buffer.concat(parts), { level: 9 });
}

export async function packExtension(folder: string, outputFile: string): Promise<{ sha256: string; size: number }> {
  const artifact = await createArtifact(folder);
  await writeFile(outputFile, artifact, { flag: "w" });
  return { sha256: sha256(artifact), size: artifact.length };
}

function readNullTerminated(buffer: Buffer, offset: number, length: number): string {
  const end = buffer.indexOf(0, offset);
  return buffer.subarray(offset, end === -1 || end > offset + length ? offset + length : end).toString("utf8");
}

function readOctal(buffer: Buffer, offset: number, length: number): number {
  const raw = readNullTerminated(buffer, offset, length).trim();
  if (!/^[0-7]*$/.test(raw)) throw new ArtifactFormatError("invalid tar numeric field");
  return raw.length ? Number.parseInt(raw, 8) : 0;
}

function isZeroBlock(buffer: Buffer, offset: number): boolean {
  for (let index = offset; index < offset + BLOCK_SIZE; index += 1) if (buffer[index] !== 0) return false;
  return true;
}

function validateTarChecksum(header: Buffer): void {
  const recorded = readOctal(header, 148, 8);
  let actual = 0;
  for (let index = 0; index < BLOCK_SIZE; index += 1) actual += index >= 148 && index < 156 ? 0x20 : header[index];
  if (recorded !== actual) throw new ArtifactFormatError("invalid tar header checksum");
}

function unpackArtifact(artifact: Buffer): Map<string, Buffer> {
  let tar: Buffer;
  try {
    tar = gunzipSync(artifact, { maxOutputLength: MAX_ARTIFACT_BYTES });
  } catch {
    throw new ArtifactFormatError("artifact must be a valid gzip-compressed tar file");
  }
  const files = new Map<string, Buffer>();
  let offset = 0;
  while (offset + BLOCK_SIZE <= tar.length && !isZeroBlock(tar, offset)) {
    const header = tar.subarray(offset, offset + BLOCK_SIZE);
    validateTarChecksum(header);
    const name = readNullTerminated(header, 0, 100);
    const prefix = readNullTerminated(header, 345, 155);
    const artifactPath = prefix ? `${prefix}/${name}` : name;
    const type = String.fromCharCode(header[156] || "0".charCodeAt(0));
    const size = readOctal(header, 124, 12);
    if (!safeArtifactPath(artifactPath) || type !== "0" || size < 0 || offset + BLOCK_SIZE + padded(size) > tar.length) {
      throw new ArtifactFormatError("artifact has an invalid or unsafe tar entry");
    }
    if (files.has(artifactPath)) throw new ArtifactFormatError(`artifact contains duplicate path: ${artifactPath}`);
    if (files.size >= MAX_FILES) throw new ArtifactFormatError(`artifact has more than ${MAX_FILES} files`);
    files.set(artifactPath, Buffer.from(tar.subarray(offset + BLOCK_SIZE, offset + BLOCK_SIZE + size)));
    offset += BLOCK_SIZE + padded(size);
  }
  if (files.size === 0) throw new ArtifactFormatError("artifact contains no files");
  return files;
}

export function inspectArtifactBytes(artifact: Buffer): ArtifactInspection {
  const files = unpackArtifact(artifact);
  const manifestBytes = files.get("extension.yaml");
  if (!manifestBytes) throw new ArtifactFormatError("artifact is missing extension.yaml");
  const document = parseDocument(manifestBytes.toString("utf8"));
  if (document.errors.length) throw new ArtifactFormatError(`artifact manifest is invalid YAML: ${document.errors[0].message}`);
  const validation = validateManifestData(document.toJS());
  if (!validation.valid || !validation.manifest) throw new ExtensionValidationError(validation.issues);
  const entrypoint = validation.manifest.implementation.entrypoint;
  if (!files.has(entrypoint)) throw new ArtifactFormatError(`artifact manifest entrypoint is missing: ${entrypoint}`);
  if (!files.has("README.md") || ![...files.keys()].some((file) => file.startsWith("src/"))) {
    throw new ArtifactFormatError("artifact is missing the required README.md or src/ directory contents");
  }

  let hardwareBinding: CryptographicHardwareBinding | undefined;
  const bindingBytes = files.get(".kvch-hardware-print");
  if (bindingBytes) {
    try {
      hardwareBinding = JSON.parse(bindingBytes.toString("utf8")) as CryptographicHardwareBinding;
    } catch {
      throw new ArtifactFormatError("artifact contains malformed .kvch-hardware-print metadata");
    }
  }

  const listedFiles: ArtifactFile[] = [...files.entries()].map(([filePath, content]) => ({ path: filePath, size: content.length, sha256: sha256(content) }));
  return {
    format: "kvch-extension-artifact/v1",
    manifest: validation.manifest,
    files: listedFiles,
    artifactSha256: sha256(artifact),
    hardwareBinding,
  };
}

export async function inspectArtifact(artifactFile: string): Promise<ArtifactInspection> {
  return inspectArtifactBytes(await readFile(artifactFile));
}

export async function hashArtifact(artifactFile: string): Promise<string> {
  return sha256(await readFile(artifactFile));
}
