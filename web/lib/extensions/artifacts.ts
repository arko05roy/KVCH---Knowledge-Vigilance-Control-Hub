import "server-only";
import type { ArtifactState } from "@prisma/client";
import type { ExtensionManifest } from "@arko05roy/kvch-extension";
import { inspectStoredArtifact } from "./inspect";
import type { ArtifactStorage } from "../storage/artifacts";

export interface StoredArtifactRecord {
  id: string;
  sha256: string;
  storageKey: string;
  state: ArtifactState;
}

export interface ArtifactPersistence {
  createArtifact(input: {
    companyId: string;
    sha256: string;
    storageKey: string;
    size: number;
    manifest: ExtensionManifest;
    adapterKey: string | null;
    state: ArtifactState;
  }): Promise<{ artifact: StoredArtifactRecord; created: boolean }>;
}

export class ArtifactIntakeService {
  constructor(
    private readonly storage: ArtifactStorage,
    private readonly persistence: ArtifactPersistence,
  ) {}

  /**
   * `companyId` must come from server-verified identity, never request data.
   * Stored bytes are reread for inspection, so neither stream bytes nor caller
   * supplied manifest/runtime/hash can become authoritative.
   */
  async intake(companyId: string, upload: import("node:stream").Readable) {
    const stored = await this.storage.put(companyId, upload);
    try {
      const inspected = inspectStoredArtifact(await this.storage.read(stored.key));
      if (inspected.sha256 !== stored.sha256) throw new Error("Stored artifact checksum changed during intake");
      return await this.persistence.createArtifact({
        companyId,
        sha256: inspected.sha256,
        storageKey: stored.key,
        size: stored.size,
        manifest: inspected.manifest,
        adapterKey: inspected.adapter?.key ?? null,
        state: inspected.state,
      });
    } catch (error) {
      // No record points at rejected bytes. Removal remains storage-adapter-only.
      await this.storage.remove(stored.key).catch(() => undefined);
      throw error;
    }
  }
}
