/**
 * KVCH Client Telemetry Collector & Threat Detection Extension
 * Captures Process Lineage, Parent PID, Code Signing, and Network Sockets
 * for Multi-Dimensional Context Fusion & AI Reasoning.
 */

export interface TelemetryPacket {
  timestamp: string;
  scenario_type: 'network_socket_443' | 'file_io' | 'process_spawn';
  network: {
    src_ip: string;
    dst_ip: string;
    dst_port: number;
    protocol: string;
    domain?: string;
    bytes_out?: number;
    bytes_in?: number;
    duration_sec?: number;
  };
  process: {
    pid: number;
    name: string;
    path: string;
    parent_pid: number;
    parent_name: string;
    is_signed: boolean;
    signer?: string | null;
    sha256?: string;
  };
  asset: {
    hostname: string;
    tier: 'Tier-1' | 'Tier-2' | 'End-User';
    environment: 'Production' | 'Staging' | 'Corporate';
  };
  user_context: {
    username: string;
    is_service_account: boolean;
    is_work_hours: boolean;
    timestamp?: string;
  };
  threat_intel?: {
    is_known_c2?: boolean;
    c2_type?: string;
    vendor_whitelisted?: boolean;
    reputation_score?: number;
    malware_family?: string;
    destination_type?: string;
  };
  historical_baseline?: {
    first_seen_destination?: boolean;
    anomalous_for_host?: boolean;
    expected_match?: boolean;
    cron_frequency?: string;
    historical_avg_upload_mb?: number;
    current_upload_mb?: number;
    unauthorized_browser_db_access?: boolean;
  };
  file_io?: {
    accessed_sqlite?: string[];
    clipboard_hook?: boolean;
  };
  data_profile?: {
    accessed_file?: string;
    sensitivity?: 'HIGH_PII' | 'FINANCIAL' | 'CONFIDENTIAL' | 'INTERNAL';
    destination?: string;
    encryption?: string;
  };
}

export interface ThreatVerdict {
  threat_identified: boolean;
  threat_classification: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  confidence_score: number;
  mitre_attack_technique: string;
  primary_differentiators: string[];
  ai_reasoning_summary: string;
  recommended_soar_action: string;
}

export interface AnalysisResponse {
  success: boolean;
  timestamp: string;
  verdict: ThreatVerdict;
  input_telemetry_summary: Record<string, any>;
}

export class KVCHThreatDetectorClient {
  private backendUrl: string;

  constructor(backendUrl = 'http://localhost:5000') {
    this.backendUrl = backendUrl;
  }

  /**
   * Dispatches fused client telemetry to the KVCH Backend Correlation Engine
   */
  async analyze(telemetry: TelemetryPacket): Promise<AnalysisResponse> {
    try {
      const response = await fetch(`${this.backendUrl}/api/kvch/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telemetry)
      });

      if (!response.ok) {
        throw new Error(`KVCH Backend returned HTTP ${response.status}`);
      }

      return (await response.json()) as AnalysisResponse;
    } catch (err: any) {
      console.error('[KVCH Extension] Telemetry analysis failed:', err);
      throw err;
    }
  }

  /**
   * Fetches scenario presets catalog for testing and live demonstrations
   */
  async getScenarios(): Promise<Record<string, TelemetryPacket>> {
    const response = await fetch(`${this.backendUrl}/api/kvch/scenarios`);
    const data = await response.json();
    return data.scenarios;
  }
}
