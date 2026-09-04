import type { ValidationIssue } from "./types.js";

export class ExtensionValidationError extends Error {
  constructor(public readonly issues: ValidationIssue[]) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join("\n"));
    this.name = "ExtensionValidationError";
  }
}

export class ArtifactFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArtifactFormatError";
  }
}
