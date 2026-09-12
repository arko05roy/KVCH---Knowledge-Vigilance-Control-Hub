import "server-only";

export interface ActiveResponsePayload {
  incident_type: "SERVER_FAIL" | "GATEWAY_FAIL" | "DDOS_ATTACK" | "DB_OUTAGE" | "CDN_ORIGIN_FAIL";
  target_layer: "HOST_OS" | "API_GATEWAY" | "DATABASE" | "CDN_EDGE" | "APPLICATION";
  action_id: string;
  action_name: string;
  command: string;
  differentiation_reason: string;
  recovery_time_est: string;
  status: "PENDING" | "EXECUTING" | "EXECUTED" | "FAILED";
  auto_executable: boolean;
  executed_at?: string;
  output?: string;
}

export interface FindingEnvelope {
  schema_version: "kvch.finding/v1";
  observed_at: string;
  severity: string;
  category: string;
  title: string;
  summary: string;
  resource: Record<string, unknown>;
  evidence: unknown[];
  indicators: unknown[];
  baseline: Record<string, unknown>;
  recommended_actions: unknown[];
  active_response?: ActiveResponsePayload;
  details: Record<string, unknown>;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function string(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseFindingsJsonl(stdout: string): FindingEnvelope[] {
  const findings: FindingEnvelope[] = [];
  for (const [index, line] of stdout.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    let parsed: unknown;
    try { parsed = JSON.parse(line); } catch { throw new Error(`Finding output line ${index + 1} is not valid JSON`); }
    if (!record(parsed) || parsed.schema_version !== "kvch.finding/v1" || !string(parsed.observed_at) || Number.isNaN(Date.parse(parsed.observed_at)) || !string(parsed.severity) || !string(parsed.category) || !string(parsed.title) || !string(parsed.summary) || !record(parsed.resource) || !Array.isArray(parsed.evidence) || !Array.isArray(parsed.indicators) || !record(parsed.baseline) || !Array.isArray(parsed.recommended_actions) || !record(parsed.details)) {
      throw new Error(`Finding output line ${index + 1} is not a valid kvch.finding/v1 envelope`);
    }
    findings.push(parsed as unknown as FindingEnvelope);
  }
  return findings;
}
