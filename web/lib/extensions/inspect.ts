import "server-only";
import { inspectArtifactBytes } from "@arko05roy/kvch-extension";
import { selectAdapter } from "../judge/adapters";

/** Hardware-binding material the judge requires before execution. The
 *  installed @arko05roy/kvch-extension@0.1.2 SDK does not expose it, so
 *  inspection always yields null here; kept as a named type so the judge
 *  path stays typed for a future SDK that carries the binding. */
export interface HardwareBinding {
  hardwareFingerprint: string;
  artifactSha256: string;
  signature: string;
}

/** Call with bytes reread from storage; never accepts client-supplied metadata.
 * Inspection validates archive contents and manifest without running commands.
 * This function does not persist an artifact or establish storage authority.
 */
export function inspectStoredArtifact(bytes: Buffer) {
  const inspection = inspectArtifactBytes(bytes);
  const adapter = selectAdapter(inspection.manifest);
  const hardwareBinding: HardwareBinding | null = null;
  return {
    sha256: inspection.artifactSha256,
    size: bytes.byteLength,
    manifest: inspection.manifest,
    hardwareBinding,
    adapter,
    state: adapter ? "uploaded" as const : "runtime_unsupported" as const,
  };
}
