export interface NetworkFlow {
  src_ip: string;
  dst_ip: string;
  dst_port: number;
  protocol: string;
  bytes_sent: number;
  bytes_received: number;
  connection_duration_sec: number;
}

export interface ProcessContext {
  pid: number;
  name: string;
  path: string;
  parent_pid: number;
  parent_name: string;
  is_signed: boolean;
  signature_signer?: string | null;
  sha256: string;
}

export interface AssetContext {
  hostname: string;
  environment: string;
  asset_criticality: "Tier-1" | "Tier-2" | "Tier-3";
  owner_dept: string;
  auto_isolate_confidence_threshold: number; // e.g. 90 for Tier-1, 85 for Tier-2
}

export interface UserContext {
  username: string;
  is_service_account: boolean;
  privilege_level: "Standard_User" | "Elevated_Admin" | "Domain_Admin" | "System_Service";
  is_work_hours: boolean;
}

export interface ThreatIntelContext {
  is_known_c2: boolean;
  c2_family?: string | null;
  reputation_score: number; // -100 to +100
}

export interface HistoricalBaselineContext {
  first_seen_destination: boolean;
  destination_frequency_30d: number;
  process_network_behavior_anomaly: boolean;
}

export interface CrossHostCorrelationContext {
  same_destination_host_count_10min: number;
  same_binary_hash_host_count_10min: number;
  fleet_wide_first_seen: boolean;
  correlated_entity_alert_ids: string[];
}

export interface AnalystFeedbackContext {
  similar_past_verdicts_30d: number;
  similar_past_disposition: "TRUE_POSITIVE" | "FALSE_POSITIVE" | "NEEDS_CONTEXT" | "NONE";
  feedback_confidence_adjustment: string;
}

export interface TelemetryIntegrity {
  event_signature_valid: boolean;
  collector_agent_heartbeat_status: "HEALTHY" | "DEGRADED" | "SILENCED";
  sanitization_applied: boolean;
  fields_sanitized: string[];
}

// Full Fused Context Vector JSON (Matching Section 4.1)
export interface FusedContextVector {
  timestamp: string;
  scenario_type: string;
  network: NetworkFlow;
  process: ProcessContext;
  asset: AssetContext;
  user_context: UserContext;
  threat_intel: ThreatIntelContext;
  historical_baseline: HistoricalBaselineContext;
  cross_host_correlation: CrossHostCorrelationContext;
  analyst_feedback_context: AnalystFeedbackContext;
  telemetry_integrity: TelemetryIntegrity;
}

export interface EvidenceRef {
  field: string;
  value: string;
  weight: number; // 0.0 to 1.0
}

export interface SecondaryValidationResult {
  false_positive_case_strength: "WEAK" | "MODERATE" | "STRONG";
  counter_argument: string;
  recommendation: "UPHOLD_CRITICAL" | "DOWNGRADE_TO_HIGH" | "REQUEST_MORE_CONTEXT";
}

export type ThreatClassification =
  | "REVERSE_SHELL"
  | "LEGIT_REMOTE_MGMT"
  | "EDR_AGENT"
  | "DATA_EXFILTRATION"
  | "SCHEDULED_BACKUP"
  | "SIEM_LOG_FORWARD"
  | "CREDENTIAL_STEALER"
  | "PASSWORD_MANAGER"
  | "BROWSER_SYNC"
  | "AGENT_SILENCED"
  | "UNKNOWN";

export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";

export interface SoarActionExecution {
  action_type: "AUTO_ISOLATE" | "QUARANTINE_THROTTLE" | "LOG_ONLY";
  action_description: string;
  status: "EXECUTED" | "QUEUED" | "SKIPPED_ASSET_THRESHOLD";
  executed_at: string;
}

export interface DetectionVerdict {
  threat_identified: boolean;
  threat_classification: ThreatClassification;
  severity: SeverityLevel;
  confidence_score: number; // 0 to 100
  primary_differentiators: string[];
  evidence_refs: EvidenceRef[];
  ai_reasoning_summary: string;
  mitre_attack_technique: string;
  recommended_soc_action: string;
  model_version: string;
  prompt_version: string;
  routing_stage: "STAGE_1_FAST_HEURISTIC" | "STAGE_2_DEEP_AI_REASONING";
  skipped_llm: boolean;
  requires_secondary_validation: boolean;
  secondary_validation?: SecondaryValidationResult;
  soar_action: SoarActionExecution;
}

export interface AnalystFeedbackRecord {
  id: string;
  timestamp: string;
  scenario_id: string;
  threat_classification: ThreatClassification;
  asset_tier: string;
  disposition: "CONFIRMED_TRUE_POSITIVE" | "FALSE_POSITIVE" | "NEEDS_CONTEXT";
  primary_differentiators: string[];
  analyst_notes?: string;
}
