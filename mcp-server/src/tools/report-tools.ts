import fs from "node:fs";
import path from "node:path";
import { generateHostFingerprint } from "../fingerprint/signer.js";
import { globalVault } from "../store/memory-vault.js";

const WORKSPACE_DIR = process.env.KVCH_WORKSPACE || path.resolve(process.cwd(), "..");

export interface GetSecurityReportsParams {
  role?: "sr-dev" | "intern" | "hr" | "management" | "all";
  fingerprintPrefix?: string;
  format?: "markdown" | "json";
}

export function handleGetSecurityReports(params: GetSecurityReportsParams) {
  const currentFp = generateHostFingerprint();
  const callerFp = params.fingerprintPrefix || currentFp.prefix;

  // Enforce prefix verification: caller must present the same signature prefix
  if (callerFp !== currentFp.prefix) {
    return {
      success: false,
      error: "403 FORBIDDEN: Fingerprint prefix mismatch. Only requests attested by the local host hardware profile can retrieve reports.",
      expectedPrefix: currentFp.prefix,
      providedPrefix: callerFp,
    };
  }

  const reportsDir = path.join(WORKSPACE_DIR, "final reports");
  if (!fs.existsSync(reportsDir)) {
    return {
      success: false,
      error: "Final reports directory not found at /final reports",
      attestationPrefix: currentFp.prefix,
    };
  }

  const role = params.role || "all";
  const format = params.format || "markdown";

  const fileMap: Record<string, { md: string; json: string }> = {
    "sr-dev": { md: "sr_dev_report.md", json: "sr_dev_report.json" },
    "intern": { md: "intern_report.md", json: "intern_report.json" },
    "hr": { md: "hr_report.md", json: "hr_report.json" },
    "management": { md: "management_report.md", json: "management_report.json" },
  };

  if (role === "all") {
    const masterFile = path.join(reportsDir, "sandbox_120min_attack_simulation_master_report.md");
    const jsonFile = path.join(reportsDir, "full_multi_role_report.json");

    const content = format === "json" && fs.existsSync(jsonFile)
      ? JSON.parse(fs.readFileSync(jsonFile, "utf-8"))
      : fs.existsSync(masterFile)
      ? fs.readFileSync(masterFile, "utf-8")
      : "Reports pending generation.";

    // Register retrieval event in vault
    globalVault.store("last_report_retrieval", "audit", { role: "all", format }, currentFp.prefix);

    return {
      success: true,
      role: "all",
      format,
      content,
      attestationPrefix: currentFp.prefix,
    };
  }

  const target = fileMap[role];
  if (!target) {
    return {
      success: false,
      error: `Invalid role: ${role}`,
      attestationPrefix: currentFp.prefix,
    };
  }

  const targetFile = path.join(reportsDir, format === "json" ? target.json : target.md);
  if (!fs.existsSync(targetFile)) {
    return {
      success: false,
      error: `Report file not found: ${targetFile}`,
      attestationPrefix: currentFp.prefix,
    };
  }

  const fileContent = fs.readFileSync(targetFile, "utf-8");
  const parsed = format === "json" ? JSON.parse(fileContent) : fileContent;

  return {
    success: true,
    role,
    format,
    content: parsed,
    attestationPrefix: currentFp.prefix,
  };
}
