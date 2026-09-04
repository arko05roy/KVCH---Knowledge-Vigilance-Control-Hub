export const MANIFEST_SCHEMA_VERSION = "kvch.extension-package/v1";

export type ExtensionInterfaceMode = "event" | "cli" | "service" | "library";

export interface ExtensionManifest {
  schema_version: typeof MANIFEST_SCHEMA_VERSION;
  id: string;
  name: string;
  version: string;
  description: string;
  implementation: {
    language: string;
    runtime: string;
    package_manager: string;
    entrypoint: string;
  };
  commands: Record<"install" | "run" | "test" | "build" | "package", string>;
  interface: {
    mode: ExtensionInterfaceMode;
    inputs: ManifestContractItem[];
    outputs: ManifestContractItem[];
  };
  behavior: {
    normal: string;
    concern: string;
    edge_cases: string[];
  };
  dependencies: {
    runtime: string[];
    system: string[];
    configuration: string[];
  };
  runtime_compatibility: {
    supports_graceful_stop: boolean;
    operation_boundaries: string[];
    credentials: "injected_at_runtime";
  };
}

export interface ManifestContractItem {
  name: string;
  description: string;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  manifest?: ExtensionManifest;
  issues: ValidationIssue[];
}

export interface ArtifactFile {
  path: string;
  size: number;
  sha256: string;
}

export interface ArtifactInspection {
  format: "kvch-extension-artifact/v1";
  manifest: ExtensionManifest;
  files: ArtifactFile[];
  artifactSha256: string;
}

export interface RuntimeAdapter<Input = unknown, Output = unknown> {
  key: string;
  validateDependencies(manifest: ExtensionManifest): Promise<ValidationIssue[]>;
  identifyLoadedArtifact(input: Input): Promise<string>;
  invoke(input: Input): Promise<Output>;
}
