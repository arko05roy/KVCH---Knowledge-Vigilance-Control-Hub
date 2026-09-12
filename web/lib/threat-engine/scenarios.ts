import { FusedContextVector } from "./types";
import { fuseContextVector } from "./context-fusion";

export interface ScenarioDefinition {
  id: string;
  category: "SCENARIO_1_C2" | "SCENARIO_2_DATA_MOVEMENT" | "SCENARIO_3_CREDENTIAL_ACCESS";
  title: string;
  description: string;
  options: {
    key: string;
    label: string;
    expectedType: "MALICIOUS" | "BENIGN_ADMIN" | "BENIGN_SYSTEM";
    vector: FusedContextVector;
  }[];
}

export const THREAT_SCENARIOS: ScenarioDefinition[] = [
  {
    id: "SCENARIO-1-C2",
    category: "SCENARIO_1_C2",
    title: "Scenario 1: Command & Control (Port 443 Indistinguishability)",
    description: "Evaluates whether long-lived outbound TLS 443 traffic is a Reverse Shell, AnyDesk Remote Management, or KVCH Endpoint Agent.",
    options: [
      {
        key: "rev_shell",
        label: "🚨 Reverse Shell (Attacker C2)",
        expectedType: "MALICIOUS",
        vector: fuseContextVector({
          scenario_type: "c2_reverse_shell",
          network: {
            src_ip: "10.0.4.15",
            dst_ip: "185.220.101.5",
            dst_port: 443,
            protocol: "TLSv1.3",
            bytes_sent: 1420950,
            bytes_received: 89400,
            connection_duration_sec: 420,
          },
          process: {
            pid: 14209,
            name: "node.exe",
            path: "C:\\Users\\john\\AppData\\Local\\Temp\\npm-cache\\runner.exe",
            parent_pid: 1044,
            parent_name: "npm.cmd",
            is_signed: false,
            signature_signer: null,
            sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          },
          asset: {
            hostname: "prod-db-primary-01",
            environment: "Production",
            asset_criticality: "Tier-1",
            owner_dept: "Core Financial Database",
            auto_isolate_confidence_threshold: 90,
          },
          user: {
            username: "john",
            is_service_account: false,
            privilege_level: "Standard_User",
            is_work_hours: false,
          },
        }),
      },
      {
        key: "anydesk",
        label: "ℹ️ AnyDesk Remote Management (Approved Tool)",
        expectedType: "BENIGN_ADMIN",
        vector: fuseContextVector({
          scenario_type: "remote_management",
          network: {
            src_ip: "10.0.4.15",
            dst_ip: "198.51.100.44",
            dst_port: 443,
            protocol: "TLSv1.3",
            bytes_sent: 820000,
            bytes_received: 340000,
            connection_duration_sec: 900,
          },
          process: {
            pid: 4892,
            name: "AnyDesk.exe",
            path: "C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe",
            parent_pid: 904,
            parent_name: "explorer.exe",
            is_signed: true,
            signature_signer: "AnyDesk Software GmbH",
            sha256: "9a8f238b9c1d34e567f8a9012bc34de567890123456789abcdef0123456789ab",
          },
          asset: {
            hostname: "corp-workstation-08",
            environment: "Corporate",
            asset_criticality: "Tier-2",
            owner_dept: "IT Support Helpdesk",
            auto_isolate_confidence_threshold: 85,
          },
          user: {
            username: "admin_sarah",
            is_service_account: false,
            privilege_level: "Elevated_Admin",
            is_work_hours: true,
          },
        }),
      },
      {
        key: "kvch_agent",
        label: "🛡️ KVCH / Osquery Agent (System EDR Daemon)",
        expectedType: "BENIGN_SYSTEM",
        vector: fuseContextVector({
          scenario_type: "edr_telemetry_beacon",
          network: {
            src_ip: "10.0.4.15",
            dst_ip: "10.0.0.10",
            dst_port: 443,
            protocol: "TLSv1.3",
            bytes_sent: 45000,
            bytes_received: 12000,
            connection_duration_sec: 3600,
          },
          process: {
            pid: 612,
            name: "kvch-agent.exe",
            path: "C:\\Program Files\\KVCH\\Agent\\kvch-agent.exe",
            parent_pid: 4,
            parent_name: "services.exe",
            is_signed: true,
            signature_signer: "KVCH Security Inc.",
            sha256: "11223344556677889900aabbccddeeff00112233445566778899aabbccddeeff",
          },
          asset: {
            hostname: "prod-db-primary-01",
            environment: "Production",
            asset_criticality: "Tier-1",
            owner_dept: "Infrastructure",
            auto_isolate_confidence_threshold: 90,
          },
          user: {
            username: "SYSTEM",
            is_service_account: true,
            privilege_level: "System_Service",
            is_work_hours: true,
          },
        }),
      },
    ],
  },
  {
    id: "SCENARIO-2-DATA",
    category: "SCENARIO_2_DATA_MOVEMENT",
    title: "Scenario 2: Data Movement (Large Outbound Transfer over 443)",
    description: "Evaluates whether multi-gigabyte outbound TLS 443 traffic is Cloud Data Exfiltration, Scheduled Database Backup, or SIEM Log Ingestion.",
    options: [
      {
        key: "data_exfil",
        label: "🚨 Data Exfiltration (Public Cloud Drop)",
        expectedType: "MALICIOUS",
        vector: fuseContextVector({
          scenario_type: "data_exfiltration",
          network: {
            src_ip: "10.0.4.15",
            dst_ip: "185.220.101.5",
            dst_port: 443,
            protocol: "TLSv1.3",
            bytes_sent: 12400000000, // 12.4 GB
            bytes_received: 140000,
            connection_duration_sec: 1800,
          },
          process: {
            pid: 18492,
            name: "python.exe",
            path: "C:\\Users\\john\\AppData\\Local\\Temp\\exfil_script.py",
            parent_pid: 3201,
            parent_name: "cmd.exe",
            is_signed: false,
            signature_signer: null,
            sha256: "ff4433221100eeddccbbaa99887766554433221100eeddccbbaa998877665544",
          },
          asset: {
            hostname: "prod-db-primary-01",
            environment: "Production",
            asset_criticality: "Tier-1",
            owner_dept: "Core Financial Database",
            auto_isolate_confidence_threshold: 90,
          },
          user: {
            username: "john",
            is_service_account: false,
            privilege_level: "Standard_User",
            is_work_hours: false, // 2:13 AM
          },
        }),
      },
      {
        key: "db_backup",
        label: "ℹ️ Nightly DB Backup Routine (postgres_svc)",
        expectedType: "BENIGN_ADMIN",
        vector: fuseContextVector({
          scenario_type: "scheduled_backup",
          network: {
            src_ip: "10.0.4.15",
            dst_ip: "10.100.5.20", // internal S3 / backup host
            dst_port: 443,
            protocol: "TLSv1.3",
            bytes_sent: 18200000000, // 18.2 GB
            bytes_received: 200000,
            connection_duration_sec: 2400,
          },
          process: {
            pid: 2100,
            name: "pg_dump.exe",
            path: "C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe",
            parent_pid: 412,
            parent_name: "services.exe",
            is_signed: true,
            signature_signer: "PostgreSQL Global Development Group",
            sha256: "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20",
          },
          asset: {
            hostname: "prod-db-primary-01",
            environment: "Production",
            asset_criticality: "Tier-1",
            owner_dept: "Infrastructure",
            auto_isolate_confidence_threshold: 90,
          },
          user: {
            username: "postgres_svc",
            is_service_account: true,
            privilege_level: "System_Service",
            is_work_hours: false, // Scheduled 2 AM window
          },
        }),
      },
      {
        key: "siem_forwarder",
        label: "🛡️ SIEM Log Aggregator (Splunk Forwarder)",
        expectedType: "BENIGN_SYSTEM",
        vector: fuseContextVector({
          scenario_type: "siem_forwarding",
          network: {
            src_ip: "10.0.4.15",
            dst_ip: "10.50.2.10",
            dst_port: 443,
            protocol: "TLSv1.3",
            bytes_sent: 350000000,
            bytes_received: 42000000,
            connection_duration_sec: 86400,
          },
          process: {
            pid: 1404,
            name: "splunkd.exe",
            path: "C:\\Program Files\\SplunkUniversalForwarder\\bin\\splunkd.exe",
            parent_pid: 4,
            parent_name: "services.exe",
            is_signed: true,
            signature_signer: "Splunk Inc.",
            sha256: "abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
          },
          asset: {
            hostname: "prod-db-primary-01",
            environment: "Production",
            asset_criticality: "Tier-1",
            owner_dept: "Security Operations",
            auto_isolate_confidence_threshold: 90,
          },
          user: {
            username: "splunk_svc",
            is_service_account: true,
            privilege_level: "System_Service",
            is_work_hours: true,
          },
        }),
      },
    ],
  },
  {
    id: "SCENARIO-3-CREDS",
    category: "SCENARIO_3_CREDENTIAL_ACCESS",
    title: "Scenario 3: Credential Access & Password Sync (Encrypted Vaults)",
    description: "Evaluates whether browser key SQLite access is RedLine/Lumma Stealer, Bitwarden Password Sync, or Google Chrome Account Sync.",
    options: [
      {
        key: "redline_stealer",
        label: "🚨 RedLine / Lumma Stealer Malware",
        expectedType: "MALICIOUS",
        vector: fuseContextVector({
          scenario_type: "credential_stealer",
          network: {
            src_ip: "10.0.4.15",
            dst_ip: "185.220.101.5",
            dst_port: 443,
            protocol: "TLSv1.3",
            bytes_sent: 450000,
            bytes_received: 24000,
            connection_duration_sec: 15,
          },
          process: {
            pid: 29014,
            name: "stealer_payload.exe",
            path: "C:\\Users\\john\\AppData\\Local\\Temp\\stealer_payload.exe",
            parent_pid: 8812,
            parent_name: "powershell.exe",
            is_signed: false,
            signature_signer: null,
            sha256: "7766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa9988",
          },
          asset: {
            hostname: "corp-developer-laptop",
            environment: "Corporate",
            asset_criticality: "Tier-2",
            owner_dept: "Frontend Engineering",
            auto_isolate_confidence_threshold: 85,
          },
          user: {
            username: "john",
            is_service_account: false,
            privilege_level: "Standard_User",
            is_work_hours: false,
          },
        }),
      },
      {
        key: "bitwarden_sync",
        label: "ℹ️ Bitwarden Password Manager Sync",
        expectedType: "BENIGN_ADMIN",
        vector: fuseContextVector({
          scenario_type: "password_manager_sync",
          network: {
            src_ip: "10.0.4.15",
            dst_ip: "104.26.12.31", // Cloudflare / Bitwarden API
            dst_port: 443,
            protocol: "TLSv1.3",
            bytes_sent: 18000,
            bytes_received: 45000,
            connection_duration_sec: 3,
          },
          process: {
            pid: 9140,
            name: "Bitwarden.exe",
            path: "C:\\Program Files\\Bitwarden\\Bitwarden.exe",
            parent_pid: 904,
            parent_name: "explorer.exe",
            is_signed: true,
            signature_signer: "8bit Solutions LLC",
            sha256: "44556677889900112233445566778899aabbccddeeff00112233445566778899",
          },
          asset: {
            hostname: "corp-developer-laptop",
            environment: "Corporate",
            asset_criticality: "Tier-2",
            owner_dept: "Frontend Engineering",
            auto_isolate_confidence_threshold: 85,
          },
          user: {
            username: "john",
            is_service_account: false,
            privilege_level: "Standard_User",
            is_work_hours: true,
          },
        }),
      },
      {
        key: "chrome_sync",
        label: "🛡️ Google Chrome Account Profile Sync",
        expectedType: "BENIGN_SYSTEM",
        vector: fuseContextVector({
          scenario_type: "browser_profile_sync",
          network: {
            src_ip: "10.0.4.15",
            dst_ip: "142.250.190.46", // Google Sync
            dst_port: 443,
            protocol: "TLSv1.3",
            bytes_sent: 92000,
            bytes_received: 184000,
            connection_duration_sec: 600,
          },
          process: {
            pid: 11200,
            name: "chrome.exe",
            path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            parent_pid: 904,
            parent_name: "explorer.exe",
            is_signed: true,
            signature_signer: "Google LLC",
            sha256: "99887766554433221100ffeeddccbbaa99887766554433221100ffeeddccbbaa",
          },
          asset: {
            hostname: "corp-developer-laptop",
            environment: "Corporate",
            asset_criticality: "Tier-2",
            owner_dept: "Frontend Engineering",
            auto_isolate_confidence_threshold: 85,
          },
          user: {
            username: "john",
            is_service_account: false,
            privilege_level: "Standard_User",
            is_work_hours: true,
          },
        }),
      },
    ],
  },
];
