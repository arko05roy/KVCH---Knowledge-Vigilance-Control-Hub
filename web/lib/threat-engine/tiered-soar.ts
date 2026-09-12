import { AssetContext, SoarActionExecution, SeverityLevel } from "./types";

/**
 * Tiered Confidence-to-Action Mapping & SOAR Policy Enforcer (Section 8)
 *
 * Tiers:
 * 0–59%: Log to SIEM only.
 * 60–84%: Quarantine / Sandbox / Throttle process.
 * >= 85%: Auto-Isolate host / Kill PID (Checked against asset.auto_isolate_confidence_threshold).
 */

export function executeTieredSoarPolicy(params: {
  confidence_score: number;
  severity: SeverityLevel;
  asset: AssetContext;
  process_name: string;
  pid: number;
}): SoarActionExecution {
  const { confidence_score, severity, asset, process_name, pid } = params;
  const timestamp = new Date().toISOString();

  // Tier 1: Low Confidence (<60%) or Informational
  if (confidence_score < 60 || severity === "INFORMATIONAL" || severity === "LOW") {
    return {
      action_type: "LOG_ONLY",
      action_description: `Dispatched to SIEM indexer and logged on dashboard. No active host disruption taken.`,
      status: "EXECUTED",
      executed_at: timestamp,
    };
  }

  // Tier 2: Medium Confidence (60% - 84%) or High Severity
  if (confidence_score < asset.auto_isolate_confidence_threshold) {
    return {
      action_type: "QUARANTINE_THROTTLE",
      action_description: `Process '${process_name}' (PID: ${pid}) throttled to 10kbps and moved to memory sandbox pending analyst disposition.`,
      status: "EXECUTED",
      executed_at: timestamp,
    };
  }

  // Tier 3: High Confidence (>= threshold, e.g. 90% for Tier-1 asset, 85% for standard)
  if (confidence_score >= asset.auto_isolate_confidence_threshold && severity === "CRITICAL") {
    return {
      action_type: "AUTO_ISOLATE",
      action_description: `CRITICAL THREAT: Auto-isolated host '${asset.hostname}' (${asset.asset_criticality}) from subnet. Terminated malicious process PID: ${pid} ('${process_name}').`,
      status: "EXECUTED",
      executed_at: timestamp,
    };
  }

  return {
    action_type: "QUARANTINE_THROTTLE",
    action_description: `Asset-Tier Guardrail: '${asset.hostname}' is ${asset.asset_criticality} (Threshold ${asset.auto_isolate_confidence_threshold}%). Confidence ${confidence_score}% below threshold for full host drop. Quarantining PID ${pid}.`,
    status: "SKIPPED_ASSET_THRESHOLD",
    executed_at: timestamp,
  };
}
