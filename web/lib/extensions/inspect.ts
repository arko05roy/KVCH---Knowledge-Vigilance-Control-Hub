import "server-only";
import { inspectArtifactBytes } from "@arko05roy/kvch-extension";
import { selectAdapter } from "../judge/adapters";

/** Call with bytes reread from storage; never accepts client-supplied metadata.
 * Inspection validates archive contents and manifest without running commands.
 * This function does not persist an artifact or establish storage authority.
 */
export function inspectStoredArtifact(bytes: Buffer) {
  const inspection = inspectArtifactBytes(bytes);
  const adapter = selectAdapter(inspection.manifest);
  return {
    sha256: inspection.artifactSha256,
    size: bytes.byteLength,
    manifest: inspection.manifest,
    hardwareBinding: inspection.hardwareBinding,
    adapter,
    state: adapter ? "uploaded" as const : "runtime_unsupported" as const,
  };
}
