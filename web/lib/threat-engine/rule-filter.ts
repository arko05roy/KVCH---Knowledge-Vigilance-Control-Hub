import { FusedContextVector, ThreatClassification, SeverityLevel, EvidenceRef } from "./types";

/**
 * Fast Heuristic Triaging Engine (Stage 1 — RuleFilter)
 * Performs deterministic scoring and extracts concrete evidence refs from telemetry.
 */

export interface Stage1HeuristicResult {
  isAmbiguousOrHighRisk: boolean;
  canSkipLLM: boolean;
  provisionalClassification: ThreatClassification;
  provisionalSeverity: SeverityLevel;
  provisionalConfidence: number;
  primaryDifferentiators: string[];
  evidenceRefs: EvidenceRef[];
}

export function evaluateStage1Heuristics(vector: FusedContextVector): Stage1HeuristicResult {
  const diffs: string[] = [];
  const evidence: EvidenceRef[] = [];
  let score = 0; // 0 (definitely benign) to 100 (definitely malicious)

  const { network, process, asset, user_context, threat_intel, historical_baseline, cross_host_correlation, telemetry_integrity } = vector;

  // 1. Digital Signature Check (High Weight)
  if (!process.is_signed) {
    score += 35;
    diffs.push(`Unsigned binary '${process.name}' executing outside Program Files`);
    evidence.push({ field: "process.is_signed", value: "false (Unsigned)", weight: 0.9 });
  } else {
    diffs.push(`Verified digital signature: '${process.signature_signer || "Trusted Vendor"}'`);
    evidence.push({ field: "process.is_signed", value: `true (${process.signature_signer})`, weight: 0.85 });
  }

  // 2. Parent Process Lineage Check
  const suspiciousParents = ["cmd.exe", "powershell.exe", "npm.cmd", "sh", "bash", "curl.exe", "rundll32.exe"];
  if (suspiciousParents.some((p) => process.parent_name.toLowerCase().includes(p))) {
    score += 25;
    diffs.push(`Anomalous parent process lineage: '${process.parent_name}' (PID ${process.parent_pid}) spawned '${process.name}'`);
    evidence.push({ field: "process.parent_name", value: `${process.parent_name} -> ${process.name}`, weight: 0.85 });
  }

  // 3. File Path Anomaly
  if (process.path.toLowerCase().includes("temp") || process.path.toLowerCase().includes("appdata")) {
    score += 20;
    diffs.push(`Executing from temporary directory: '${process.path}'`);
    evidence.push({ field: "process.path", value: process.path, weight: 0.75 });
  }

  // 4. Threat Intel Destination Check
  if (threat_intel.is_known_c2) {
    score += 40;
    diffs.push(`Destination IP '${network.dst_ip}' flagged in Threat Intel feed (${threat_intel.c2_family})`);
    evidence.push({ field: "threat_intel.is_known_c2", value: `${network.dst_ip} (${threat_intel.c2_family})`, weight: 0.95 });
  }

  // 5. Baseline Destination & Schedule Check
  if (historical_baseline.first_seen_destination) {
    score += 15;
    diffs.push(`First-seen external destination across 30-day host baseline`);
    evidence.push({ field: "historical_baseline.first_seen_destination", value: "true (0 prior connections)", weight: 0.65 });
  }

  if (!user_context.is_work_hours && !user_context.is_service_account) {
    score += 10;
    diffs.push(`Off-hours interactive execution by standard user '${user_context.username}'`);
    evidence.push({ field: "user_context.is_work_hours", value: "false (Off-hours)", weight: 0.55 });
  }

  // 6. Cross-Host Correlation (Lateral movement / C2 beacon)
  if (cross_host_correlation.same_destination_host_count_10min >= 3) {
    score += 25;
    diffs.push(`Cross-host correlation alert: ${cross_host_correlation.same_destination_host_count_10min} hosts connected to '${network.dst_ip}' in 10m`);
    evidence.push({
      field: "cross_host_correlation.same_destination_host_count_10min",
      value: `${cross_host_correlation.same_destination_host_count_10min} hosts active`,
      weight: 0.8,
    });
  }

  // 7. Agent Heartbeat / Integrity Check
  if (telemetry_integrity.collector_agent_heartbeat_status === "SILENCED") {
    score += 50;
    diffs.push(`CRITICAL: Endpoint collector agent was silenced/killed`);
    evidence.push({ field: "telemetry_integrity.collector_agent_heartbeat_status", value: "SILENCED", weight: 0.99 });
  }

  // Determine Classification & Severity
  let classification: ThreatClassification = "UNKNOWN";
  let severity: SeverityLevel = "INFORMATIONAL";

  if (score >= 70) {
    severity = score >= 85 ? "CRITICAL" : "HIGH";
    if (network.bytes_sent > 5000000) {
      classification = "DATA_EXFILTRATION";
    } else if (process.name.includes("node") || process.name.includes("powershell") || process.name.includes("python")) {
      classification = "REVERSE_SHELL";
    } else if (process.path.includes("Temp") || !process.is_signed) {
      classification = "CREDENTIAL_STEALER";
    }
  } else if (score >= 40) {
    severity = "MEDIUM";
    classification = "UNKNOWN";
  } else {
    severity = "INFORMATIONAL";
    if (process.name.includes("AnyDesk") || process.name.includes("TeamViewer")) {
      classification = "LEGIT_REMOTE_MGMT";
    } else if (process.name.includes("kvch") || process.name.includes("osquery")) {
      classification = "EDR_AGENT";
    } else if (process.name.includes("postgres") || process.name.includes("backup")) {
      classification = "SCHEDULED_BACKUP";
    } else if (process.name.includes("splunk") || process.name.includes("fluentd")) {
      classification = "SIEM_LOG_FORWARD";
    } else if (process.name.includes("Bitwarden") || process.name.includes("1Password")) {
      classification = "PASSWORD_MANAGER";
    } else if (process.name.includes("chrome") || process.name.includes("edge")) {
      classification = "BROWSER_SYNC";
    }
  }

  // Confidence Router conditions:
  // Skip LLM if signed binary + known good destination + score < 30
  const canSkipLLM = process.is_signed && !threat_intel.is_known_c2 && score < 30;
  const isAmbiguousOrHighRisk = score >= 30;

  return {
    isAmbiguousOrHighRisk,
    canSkipLLM,
    provisionalClassification: classification,
    provisionalSeverity: severity,
    provisionalConfidence: Math.min(99, Math.max(10, score)),
    primaryDifferentiators: diffs,
    evidenceRefs: evidence,
  };
}
