export { ArtifactFormatError, ExtensionValidationError } from "./errors.js";
export { createArtifact, hashArtifact, inspectArtifact, inspectArtifactBytes, packExtension } from "./artifact.js";
export { readValidatedManifest, validateExtension, validateManifestData } from "./manifest.js";
export { getHardwareFingerprint, signHardwareFingerprint, verifyHardwareSignature, verifyHardwareProfile } from "./hardware.js";
export { MANIFEST_SCHEMA_VERSION } from "./types.js";
export type { ArtifactFile, ArtifactInspection, CryptographicHardwareBinding, ExtensionManifest, HardwareTelemetry, RuntimeAdapter, ValidationIssue, ValidationResult } from "./types.js";
