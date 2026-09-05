import "server-only";
import { createHash } from "node:crypto";
import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export interface StoredArtifact {
  key: string;
  sha256: string;
  size: number;
}

export interface ArtifactStorage {
  put(companyId: string, source: Readable): Promise<StoredArtifact>;
  read(key: string): Promise<Buffer>;
  remove(key: string): Promise<void>;
}

function assertCompanyId(companyId: string): void {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(companyId)) throw new Error("Invalid company ID for artifact storage");
}

function assertKey(key: string): void {
  if (!/^artifacts\/[A-Za-z0-9_-]+\/[a-f0-9]{64}\.kvch\.tgz$/.test(key)) throw new Error("Invalid artifact storage key");
}

export class LocalArtifactStorage implements ArtifactStorage {
  constructor(private readonly root: string) {}

  private destination(key: string): string {
    assertKey(key);
    return path.join(this.root, ...key.split("/"));
  }

  async put(companyId: string, source: Readable): Promise<StoredArtifact> {
    assertCompanyId(companyId);
    await fs.mkdir(this.root, { recursive: true, mode: 0o700 });
    const staging = path.join(this.root, `.upload-${crypto.randomUUID()}`);
    const output = await fs.open(staging, "wx", 0o600);
    const hash = createHash("sha256");
    let size = 0;
    const sink = output.createWriteStream();
    source.on("data", (chunk: Buffer) => {
      const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      hash.update(bytes);
      size += bytes.byteLength;
    });
    try {
      await pipeline(source, sink);
      const sha256 = hash.digest("hex");
      const key = `artifacts/${companyId}/${sha256}.kvch.tgz`;
      const target = this.destination(key);
      await fs.mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
      try {
        await fs.link(staging, target);
      } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      }
      return { key, sha256, size };
    } finally {
      await output.close().catch(() => undefined);
      await fs.rm(staging, { force: true });
    }
  }

  async read(key: string): Promise<Buffer> {
    return fs.readFile(this.destination(key));
  }

  async remove(key: string): Promise<void> {
    await fs.rm(this.destination(key), { force: true });
  }

  stream(key: string): Readable {
    return createReadStream(this.destination(key));
  }
}
