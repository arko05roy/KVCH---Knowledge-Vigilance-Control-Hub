import { access, lstat, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { CronExpressionParser } from "cron-parser";
import { parseDocument } from "yaml";
import { ExtensionValidationError } from "./errors.js";
import { MANIFEST_SCHEMA_VERSION } from "./types.js";
import type { ExtensionManifest, ManifestContractItem, ValidationIssue, ValidationResult } from "./types.js";

const COMMAND_NAMES = ["install", "run", "test", "build", "package"] as const;
const INTERFACE_MODES = new Set(["event", "cli", "service", "library"]);
const EXTENSION_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER = /^(0|[1-9]\d*)(?:\.(0|[1-9]\d*)){1,2}(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function addIssue(issues: ValidationIssue[], path: string, message: string): void {
  issues.push({ path, message });
}

function requireString(value: unknown, field: string, issues: ValidationIssue[]): string | undefined {
  if (typeof value !== "string" || value.trim().length === 0) {
    addIssue(issues, field, "must be a non-empty string");
    return undefined;
  }
  return value;
}

function requireStringArray(value: unknown, field: string, issues: ValidationIssue[]): string[] | undefined {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim().length === 0)) {
    addIssue(issues, field, "must be an array of non-empty strings");
    return undefined;
  }
  return value;
}

function validateContractItems(value: unknown, field: string, issues: ValidationIssue[]): ManifestContractItem[] | undefined {
  if (!Array.isArray(value)) {
    addIssue(issues, field, "must be an array of { name, description } objects");
    return undefined;
  }
  const items: ManifestContractItem[] = [];
  value.forEach((item, index) => {
    if (!isRecord(item)) {
      addIssue(issues, `${field}[${index}]`, "must be an object");
      return;
    }
    const name = requireString(item.name, `${field}[${index}].name`, issues);
    const description = requireString(item.description, `${field}[${index}].description`, issues);
    if (name && description) items.push({ name, description });
  });
  return items;
}

function safeRelativePath(value: string): boolean {
  return !path.isAbsolute(value) && value.split(/[\\/]/).every((part) => part !== "..") && value.length > 0;
}

function validateDeploymentSchedule(value: unknown, issues: ValidationIssue[]): ExtensionManifest["deployment"] | undefined {
  if (!isRecord(value)) {
    addIssue(issues, "deployment", "must define a five-field cron schedule");
    return undefined;
  }
  const schedule = requireString(value.schedule, "deployment.schedule", issues);
  if (!schedule) return undefined;
  if (schedule.trim().split(/\s+/).length !== 5) {
    addIssue(issues, "deployment.schedule", "must be a five-field cron expression (minute hour day-of-month month day-of-week)");
    return undefined;
  }
  try {
    CronExpressionParser.parse(schedule);
  } catch {
    addIssue(issues, "deployment.schedule", "must be a valid five-field cron expression");
    return undefined;
  }
  return { schedule };
}

export function validateManifestData(value: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!isRecord(value)) {
    return { valid: false, issues: [{ path: "manifest", message: "must be a YAML mapping" }] };
  }

  const schemaVersion = requireString(value.schema_version, "schema_version", issues);
  if (schemaVersion && schemaVersion !== MANIFEST_SCHEMA_VERSION) {
    addIssue(issues, "schema_version", `must equal ${MANIFEST_SCHEMA_VERSION}`);
  }
  const id = requireString(value.id, "id", issues);
  if (id && !EXTENSION_ID.test(id)) addIssue(issues, "id", "must be lowercase kebab-case");
  const name = requireString(value.name, "name", issues);
  const version = requireString(value.version, "version", issues);
  if (version && !SEMVER.test(version)) addIssue(issues, "version", "must be a semantic version such as 1.0.0");
  const description = requireString(value.description, "description", issues);

  const implementation = value.implementation;
  let implementationResult: ExtensionManifest["implementation"] | undefined;
  if (!isRecord(implementation)) {
    addIssue(issues, "implementation", "must be an object");
  } else {
    const language = requireString(implementation.language, "implementation.language", issues);
    const runtime = requireString(implementation.runtime, "implementation.runtime", issues);
    const packageManager = requireString(implementation.package_manager, "implementation.package_manager", issues);
    const entrypoint = requireString(implementation.entrypoint, "implementation.entrypoint", issues);
    if (entrypoint && !safeRelativePath(entrypoint)) addIssue(issues, "implementation.entrypoint", "must be a relative path inside the extension folder");
    if (language && runtime && packageManager && entrypoint && safeRelativePath(entrypoint)) {
      implementationResult = { language, runtime, package_manager: packageManager, entrypoint };
    }
  }

  const commands = value.commands;
  const commandResult = {} as ExtensionManifest["commands"];
  if (!isRecord(commands)) {
    addIssue(issues, "commands", "must define install, run, test, build, and package commands");
  } else {
    for (const commandName of COMMAND_NAMES) {
      const command = requireString(commands[commandName], `commands.${commandName}`, issues);
      if (command && /[\u0000\r\n]/.test(command)) addIssue(issues, `commands.${commandName}`, "must be a single shell command");
      else if (command) commandResult[commandName] = command;
    }
  }

  const extensionInterface = value.interface;
  let interfaceResult: ExtensionManifest["interface"] | undefined;
  if (!isRecord(extensionInterface)) {
    addIssue(issues, "interface", "must be an object");
  } else {
    const mode = requireString(extensionInterface.mode, "interface.mode", issues);
    if (mode && !INTERFACE_MODES.has(mode)) addIssue(issues, "interface.mode", "must be event, cli, service, or library");
    const inputs = validateContractItems(extensionInterface.inputs, "interface.inputs", issues);
    const outputs = validateContractItems(extensionInterface.outputs, "interface.outputs", issues);
    if (mode && INTERFACE_MODES.has(mode) && inputs && outputs) {
      interfaceResult = { mode: mode as ExtensionManifest["interface"]["mode"], inputs, outputs };
    }
  }

  const behavior = value.behavior;
  let behaviorResult: ExtensionManifest["behavior"] | undefined;
  if (!isRecord(behavior)) addIssue(issues, "behavior", "must be an object");
  else {
    const normal = requireString(behavior.normal, "behavior.normal", issues);
    const concern = requireString(behavior.concern, "behavior.concern", issues);
    const edgeCases = requireStringArray(behavior.edge_cases, "behavior.edge_cases", issues);
    if (normal && concern && edgeCases) behaviorResult = { normal, concern, edge_cases: edgeCases };
  }

  const dependencies = value.dependencies;
  let dependenciesResult: ExtensionManifest["dependencies"] | undefined;
  if (!isRecord(dependencies)) addIssue(issues, "dependencies", "must be an object");
  else {
    const runtime = requireStringArray(dependencies.runtime, "dependencies.runtime", issues);
    const system = requireStringArray(dependencies.system, "dependencies.system", issues);
    const configuration = requireStringArray(dependencies.configuration, "dependencies.configuration", issues);
    if (runtime && system && configuration) dependenciesResult = { runtime, system, configuration };
  }

  const compatibility = value.runtime_compatibility;
  let compatibilityResult: ExtensionManifest["runtime_compatibility"] | undefined;
  if (!isRecord(compatibility)) addIssue(issues, "runtime_compatibility", "must be an object");
  else {
    const gracefulStop = compatibility.supports_graceful_stop;
    if (typeof gracefulStop !== "boolean") addIssue(issues, "runtime_compatibility.supports_graceful_stop", "must be a boolean");
    const boundaries = requireStringArray(compatibility.operation_boundaries, "runtime_compatibility.operation_boundaries", issues);
    const credentials = compatibility.credentials;
    if (credentials !== "injected_at_runtime") {
      addIssue(issues, "runtime_compatibility.credentials", "must be injected_at_runtime; credentials cannot be embedded in an artifact");
    }
    if (typeof gracefulStop === "boolean" && boundaries && credentials === "injected_at_runtime") {
      compatibilityResult = { supports_graceful_stop: gracefulStop, operation_boundaries: boundaries, credentials };
    }
  }

  const deploymentResult = validateDeploymentSchedule(value.deployment, issues);

  if (issues.length || !schemaVersion || !id || !name || !version || !description || !implementationResult || !interfaceResult || !behaviorResult || !dependenciesResult || !compatibilityResult || !deploymentResult || COMMAND_NAMES.some((name) => !commandResult[name])) {
    return { valid: false, issues };
  }
  return {
    valid: true,
    manifest: {
      schema_version: MANIFEST_SCHEMA_VERSION,
      id,
      name,
      version,
      description,
      implementation: implementationResult,
      commands: commandResult,
      interface: interfaceResult,
      behavior: behaviorResult,
      dependencies: dependenciesResult,
      runtime_compatibility: compatibilityResult,
      deployment: deploymentResult,
    },
    issues: [],
  };
}

async function validatePackageCommands(root: string, manifest: ExtensionManifest, issues: ValidationIssue[]): Promise<void> {
  if (manifest.implementation.package_manager !== "npm") return;
  const packageJsonPath = path.join(root, "package.json");
  try {
    const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as { scripts?: Record<string, unknown> };
    for (const [name, command] of Object.entries(manifest.commands)) {
      const match = /^npm run ([A-Za-z0-9:_-]+)(?:\s|$)/.exec(command);
      if (match && typeof packageJson.scripts?.[match[1]] !== "string") {
        addIssue(issues, `commands.${name}`, `references npm script \"${match[1]}\", but package.json does not define it`);
      }
    }
  } catch {
    addIssue(issues, "package.json", "is required and must contain valid JSON when implementation.package_manager is npm");
  }
}

export async function validateExtension(folder: string): Promise<ValidationResult> {
  const root = path.resolve(folder);
  const issues: ValidationIssue[] = [];
  try {
    if (!(await stat(root)).isDirectory()) return { valid: false, issues: [{ path: "extension-folder", message: "must be a directory" }] };
  } catch {
    return { valid: false, issues: [{ path: "extension-folder", message: "does not exist" }] };
  }

  for (const required of ["extension.yaml", "README.md", "src"]) {
    try {
      const item = await stat(path.join(root, required));
      if (required === "src" ? !item.isDirectory() : !item.isFile()) addIssue(issues, required, required === "src" ? "must be a directory" : "must be a file");
    } catch {
      addIssue(issues, required, required === "src" ? "is required as the source directory" : "is required");
    }
  }

  let parsed: ValidationResult | undefined;
  try {
    const document = parseDocument(await readFile(path.join(root, "extension.yaml"), "utf8"));
    for (const error of document.errors) addIssue(issues, "extension.yaml", error.message);
    if (document.errors.length === 0) parsed = validateManifestData(document.toJS());
  } catch {
    addIssue(issues, "extension.yaml", "is required and must contain valid YAML");
  }
  if (!parsed) return { valid: false, issues };
  issues.push(...parsed.issues);
  if (parsed.manifest) {
    const entrypointPath = path.join(root, parsed.manifest.implementation.entrypoint);
    try {
      const entrypoint = await lstat(entrypointPath);
      if (!entrypoint.isFile() || entrypoint.isSymbolicLink()) addIssue(issues, "implementation.entrypoint", "must reference a regular file inside the extension folder");
    } catch {
      addIssue(issues, "implementation.entrypoint", `does not exist: ${parsed.manifest.implementation.entrypoint}`);
    }
    await validatePackageCommands(root, parsed.manifest, issues);
  }
  return issues.length ? { valid: false, issues } : parsed;
}

export async function readValidatedManifest(folder: string): Promise<ExtensionManifest> {
  const result = await validateExtension(folder);
  if (!result.valid || !result.manifest) throw new ExtensionValidationError(result.issues);
  return result.manifest;
}

export async function assertReadable(pathname: string): Promise<void> {
  await access(pathname);
}
