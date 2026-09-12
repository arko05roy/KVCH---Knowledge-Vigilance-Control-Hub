import {
  NetworkFlow,
  ProcessContext,
  AssetContext,
  UserContext,
  ThreatIntelContext,
  HistoricalBaselineContext,
  CrossHostCorrelationContext,
  AnalystFeedbackContext,
  TelemetryIntegrity,
  FusedContextVector,
} from "./types";
import { sanitizeObjectFields } from "./sanitizer";

/**
 * Context Fusion & Enrichment Hub (Section 2 & 3)
 * Joins raw telemetry with Asset DB, Threat Intel, Historical Baseline, and Cert Validator.
 */

// Simulated backend Threat Intel feed database
const KNOWN_C2_IPS = new Set([
  "185.220.101.5", // Tor Exit / Bulletproof C2
  "194.26.29.112", // Cobalt Strike Malleable C2
  "45.154.255.88", // Lumma Stealer Gateway
  "103.145.22.4",  // RedLine Panel
]);

const KNOWN_TRUSTED_DOMAINS = new Set([
  "accounts.google.com",
  "sync.google.com",
  "api.bitwarden.com",
  "vault.1password.com",
  "c2.kvch.internal",
  "splunk-indexer.company.local",
  "backup.company.local",
  "net.anydesk.com",
]);

export function fuseContextVector(params: {
  scenario_type?: string;
  network: NetworkFlow;
  process: ProcessContext;
  asset?: Partial<AssetContext>;
  user?: Partial<UserContext>;
  cross_host?: Partial<CrossHostCorrelationContext>;
  feedback?: Partial<AnalystFeedbackContext>;
  last_heartbeat_sec?: number;
}): FusedContextVector {
  const { network, process } = params;

  // 1. Asset DB Enrichment
  const asset: AssetContext = {
    hostname: params.asset?.hostname || "prod-app-server-01",
    environment: params.asset?.environment || "Production",
    asset_criticality: params.asset?.asset_criticality || "Tier-1",
    owner_dept: params.asset?.owner_dept || "Core Banking Infra",
    auto_isolate_confidence_threshold:
      params.asset?.auto_isolate_confidence_threshold ??
      (params.asset?.asset_criticality === "Tier-1" ? 90 : 85),
  };

  // 2. User Context Enrichment
  const user_context: UserContext = {
    username: params.user?.username || "john",
    is_service_account: params.user?.is_service_account ?? false,
    privilege_level: params.user?.privilege_level || "Standard_User",
    is_work_hours: params.user?.is_work_hours ?? false,
  };

  // 3. Threat Intel Lookup
  const isC2 = KNOWN_C2_IPS.has(network.dst_ip);
  const threat_intel: ThreatIntelContext = {
    is_known_c2: isC2,
    c2_family: isC2 ? "TorExitNode / Bulletproof C2" : null,
    reputation_score: isC2 ? -95 : 85,
  };

  // 4. Historical Baseline Engine (30-day deviation check)
  const isFirstSeen = isC2 || network.dst_ip.startsWith("185.") || network.dst_ip.startsWith("45.");
  const historical_baseline: HistoricalBaselineContext = {
    first_seen_destination: isFirstSeen,
    destination_frequency_30d: isFirstSeen ? 0 : 482,
    process_network_behavior_anomaly: !process.is_signed || isFirstSeen,
  };

  // 5. Cross-Host Correlation
  const cross_host_correlation: CrossHostCorrelationContext = {
    same_destination_host_count_10min: params.cross_host?.same_destination_host_count_10min ?? (isC2 ? 3 : 1),
    same_binary_hash_host_count_10min: params.cross_host?.same_binary_hash_host_count_10min ?? 1,
    fleet_wide_first_seen: isFirstSeen,
    correlated_entity_alert_ids: params.cross_host?.correlated_entity_alert_ids ?? (isC2 ? ["ALT-88213", "ALT-88214"] : []),
  };

  // 6. Analyst Feedback Context
  const analyst_feedback_context: AnalystFeedbackContext = {
    similar_past_verdicts_30d: params.feedback?.similar_past_verdicts_30d ?? (isC2 ? 2 : 0),
    similar_past_disposition: params.feedback?.similar_past_disposition ?? (isC2 ? "TRUE_POSITIVE" : "NONE"),
    feedback_confidence_adjustment: params.feedback?.feedback_confidence_adjustment ?? (isC2 ? "+5" : "0"),
  };

  // 7. Telemetry Integrity & Sanitization
  const rawVector = {
    timestamp: new Date().toISOString(),
    scenario_type: params.scenario_type || "network_socket_443",
    network,
    process,
    asset,
    user_context,
    threat_intel,
    historical_baseline,
    cross_host_correlation,
    analyst_feedback_context,
    telemetry_integrity: {
      event_signature_valid: true,
      collector_agent_heartbeat_status: (params.last_heartbeat_sec && params.last_heartbeat_sec > 120 ? "SILENCED" : "HEALTHY") as any,
      sanitization_applied: true,
      fields_sanitized: [] as string[],
    },
  };

  // Sanitize attacker-controlled strings
  const { sanitizedObj, modifiedFields } = sanitizeObjectFields(rawVector, [
    "process.path",
    "process.parent_name",
    "user_context.username",
  ]);

  sanitizedObj.telemetry_integrity.fields_sanitized = modifiedFields;
  return sanitizedObj as FusedContextVector;
}
