"use client";

import React, { useState } from "react";

export interface TelemetryLogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "DEBUG" | "TRACE" | "ALERT" | "CRITICAL";
  extension: string;
  message: string;
  isMalicious: boolean;
}

export const SAMPLE_TELEMETRY_LOGS: TelemetryLogEntry[] = [
  // --- PHASE 1: RECONNAISSANCE, PERIMETER PROBING & WAF EVASION (16:00 - 16:20) ---
  {
    id: "log-01",
    timestamp: "16:02:11.412",
    level: "INFO",
    extension: "attack-surface-scanner",
    message: "[T+02m] Subnet discovery initiated on 192.168.0.0/24 (VLAN-12 Staging Sandbox). Interface: en0.",
    isMalicious: false,
  },
  {
    id: "log-02",
    timestamp: "16:05:44.209",
    level: "ALERT",
    extension: "attack-surface-scanner",
    message: "[T+05m] EXPOSED SOCKET DETECTED: PostgreSQL TCP 0.0.0.0:5432 and SMB 445 open to LAN without mTLS or IP-binding baseline.",
    isMalicious: true,
  },
  {
    id: "log-03",
    timestamp: "16:11:15.882",
    level: "DEBUG",
    extension: "edgeguard-sentinel",
    message: "[T+11m] Non-destructive micro-fuzzing loop executed on staging edge proxy /api/v1/health (120 payload variations).",
    isMalicious: false,
  },
  {
    id: "log-04",
    timestamp: "16:18:29.103",
    level: "CRITICAL",
    extension: "edgeguard-sentinel",
    message: "[T+18m] ORIGIN IP LEAK & WAF BYPASS: Direct origin IPv4 10.0.4.15 exposed via cf-connecting-ip mismatch on staging endpoint.",
    isMalicious: true,
  },

  // --- PHASE 2: PHISHING, DNS REDIRECT & SUPPLY CHAIN POISONING (16:20 - 16:45) ---
  {
    id: "log-05",
    timestamp: "16:24:08.551",
    level: "DEBUG",
    extension: "phishing-hunter",
    message: "[T+24m] Host resolver inspection: Audited /etc/hosts, system DNS cache, and Chrome profile extensions.",
    isMalicious: false,
  },
  {
    id: "log-06",
    timestamp: "16:29:41.312",
    level: "CRITICAL",
    extension: "phishing-hunter",
    message: "[T+29m] HOST FILE HIJACK: Tamper detected mapping auth.kvch.internal to rogue proxy 185.220.101.5 (Homograph spoofing).",
    isMalicious: true,
  },
  {
    id: "log-07",
    timestamp: "16:34:12.714",
    level: "INFO",
    extension: "supply-chain-auditor",
    message: "[T+34m] Inspected package.json, package-lock.json (348 dependencies resolved against npmjs.org).",
    isMalicious: false,
  },
  {
    id: "log-08",
    timestamp: "16:38:55.901",
    level: "CRITICAL",
    extension: "supply-chain-auditor",
    message: "[T+38m] TYPOSQUATTED DEPENDENCY INJECTION: @kvch-internal/crypto-utils@1.4.2 detected with base64 postinstall curl|sh payload.",
    isMalicious: true,
  },
  {
    id: "log-09",
    timestamp: "16:42:04.119",
    level: "ALERT",
    extension: "pr-assistant",
    message: "[T+42m] CODE GOVERNANCE VIOLATION: PR #4 ('implemented ml model') merged by committer EMP-4029 without mandatory 2-person security review.",
    isMalicious: true,
  },

  // --- PHASE 3: MALWARE DROP, ENTROPY & PERSISTENCE BACKDOOR (16:45 - 17:15) ---
  {
    id: "log-10",
    timestamp: "16:49:18.420",
    level: "INFO",
    extension: "malware-analyzer",
    message: "[T+49m] Periodic temporary directory scan: Crawling /tmp, ~/Downloads, and system launch daemons.",
    isMalicious: false,
  },
  {
    id: "log-11",
    timestamp: "16:54:33.804",
    level: "CRITICAL",
    extension: "malware-analyzer",
    message: "[T+54m] HIGH ENTROPY BINARY DETECTED: /tmp/.system_daemon (H=7.942 > threshold 7.2). Matches YARA rule MALW_JS_REVERSE_SHELL.",
    isMalicious: true,
  },
  {
    id: "log-12",
    timestamp: "17:01:45.612",
    level: "DEBUG",
    extension: "threat-hunter-3000",
    message: "[T+61m] Process tree enumeration: 184 active PIDs, 14 LaunchAgent plists verified under /Library/LaunchAgents.",
    isMalicious: false,
  },
  {
    id: "log-13",
    timestamp: "17:07:22.910",
    level: "CRITICAL",
    extension: "threat-hunter-3000",
    message: "[T+67m] ACTIVE REVERSE TCP SHELL: Process node (PID 14209) established outbound TLS connection to C2 IP 185.220.101.5:443.",
    isMalicious: true,
  },
  {
    id: "log-14",
    timestamp: "17:12:08.150",
    level: "ALERT",
    extension: "threat-hunter-3000",
    message: "[T+72m] PERSISTENCE MECHANISM DETECTED: Unauthorized plist ~/Library/LaunchAgents/com.apple.sync.plist created pointing to /tmp/.system_daemon.",
    isMalicious: true,
  },

  // --- PHASE 4: SESSION EXTRACTION & CREDENTIAL THEFT (17:15 - 17:35) ---
  {
    id: "log-15",
    timestamp: "17:18:44.205",
    level: "TRACE",
    extension: "cookie-xss-auditor",
    message: "[T+78m] Client DOM and SQLite3 cookie store inspection completed across *.kvch.internal.",
    isMalicious: false,
  },
  {
    id: "log-16",
    timestamp: "17:22:19.891",
    level: "CRITICAL",
    extension: "cookie-xss-auditor",
    message: "[T+82m] DOM XSS INJECTION & SESSION HIJACK: location.hash evaluated into innerHTML on /sr-dev/dashboard; admin JWT token extracted.",
    isMalicious: true,
  },
  {
    id: "log-17",
    timestamp: "17:27:31.412",
    level: "INFO",
    extension: "credential-exposure-auditor",
    message: "[T+87m] Automated Git repository and process memory scan for exposed secrets.",
    isMalicious: false,
  },
  {
    id: "log-18",
    timestamp: "17:31:54.670",
    level: "CRITICAL",
    extension: "credential-exposure-auditor",
    message: "[T+91m] SECRET EXPOSURE & CLIPBOARD CLIPPER: AWS Secret Key & Stripe API key leaked in .env; clipboard address 0x71C... replaced with attacker wallet.",
    isMalicious: true,
  },

  // --- PHASE 5: VPN LEAK & CRYPTO PROCESS HOOK (17:35 - 17:50) ---
  {
    id: "log-19",
    timestamp: "17:37:12.115",
    level: "DEBUG",
    extension: "vpn-crypto-analyzer",
    message: "[T+97m] WireGuard utun3 tunnel integrity check: Handshake OK, ChaCha20-Poly1305 active.",
    isMalicious: false,
  },
  {
    id: "log-20",
    timestamp: "17:42:05.441",
    level: "ALERT",
    extension: "vpn-crypto-analyzer",
    message: "[T+102m] SPLIT-TUNNEL DNS LEAK: Plaintext UDP 53 DNS queries bypassing utun3 tunnel to untrusted foreign resolver 185.220.101.5.",
    isMalicious: true,
  },
  {
    id: "log-21",
    timestamp: "17:46:28.914",
    level: "ALERT",
    extension: "vpn-crypto-analyzer",
    message: "[T+106m] CRYPTO WALLET HOOK: Unauthorized memory read probe detected on MetaMask & Ledger Live desktop processes.",
    isMalicious: true,
  },

  // --- PHASE 6: DATABASE AST EXFILTRATION & AUTOMATED SOAR CONTAINMENT (17:50 - 18:00) ---
  {
    id: "log-22",
    timestamp: "17:51:14.301",
    level: "CRITICAL",
    extension: "aegisdb-zerotrust",
    message: "[T+111m] UNPAGINATED MASS EXFILTRATION QUERY: AST violation SELECT * FROM users, salaries, private_keys on port 5432.",
    isMalicious: true,
  },
  {
    id: "log-23",
    timestamp: "17:52:03.882",
    level: "ALERT",
    extension: "aegisdb-zerotrust",
    message: "[T+112m] ACTIVE SOCKET NEUTRALIZATION: Terminated socket FD 42; injected synthetic zero-entropy payload to disrupt exfiltration stream.",
    isMalicious: false,
  },
  {
    id: "log-24",
    timestamp: "17:54:19.002",
    level: "CRITICAL",
    extension: "edr-daemon",
    message: "[T+114m] 2-HOUR CAMPAIGN CORRELATION: Correlated 10 extension events into unified finding envelope #INC-2026-8891 (Severity: CRITICAL / Score: 92).",
    isMalicious: true,
  },
  {
    id: "log-25",
    timestamp: "17:58:30.512",
    level: "INFO",
    extension: "edr-daemon",
    message: "[T+118m] AUTOMATED SOAR ISOLATION: Host prod-db-primary-01 isolated via nftables; C2 IP blocked; generated 4-role AI executive reports.",
    isMalicious: false,
  },
];

export function TelemetryLogStream({ logs }: { logs?: TelemetryLogEntry[] }) {
  const [filter, setFilter] = useState<"ALL" | "MALICIOUS" | "BENIGN">("ALL");
  const [search, setSearch] = useState("");

  const activeLogs = logs && logs.length > 0 ? logs : SAMPLE_TELEMETRY_LOGS;

  const filteredLogs = activeLogs.filter((log) => {
    if (filter === "MALICIOUS" && !log.isMalicious) return false;
    if (filter === "BENIGN" && log.isMalicious) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && !log.extension.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const maliciousCount = activeLogs.filter((l) => l.isMalicious).length;

  return (
    <div className="w-full bg-[#08090a] border border-[#232529] rounded-xl overflow-hidden font-mono text-[12px] my-4 shadow-lg">
      
      {/* Log Header & Filters */}
      <div className="px-4 py-3 bg-[#0c0d0e] border-b border-[#232529] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2ea043] animate-pulse" />
          <span className="text-[13px] font-semibold text-[#f7f8f8] tracking-tight">
            24/7 EDR Telemetry Log Stream
          </span>
          <span className="text-[11px] text-[#ff5555] bg-[#ff5555]/10 border border-[#ff5555]/30 px-2 py-0.5 rounded font-mono">
            {maliciousCount} Malicious Flagged (Red)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-2.5 py-1 bg-[#121316] border border-[#232529] rounded text-[11.5px] text-[#f7f8f8] placeholder-[#62666d] focus:outline-none focus:border-[#5e6ad2]"
          />

          {/* Filter Pills */}
          <div className="flex bg-[#121316] border border-[#232529] rounded p-0.5">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filter === "ALL" ? "bg-[#1e2025] text-[#f7f8f8]" : "text-[#8a8f98] hover:text-[#f7f8f8]"
              }`}
            >
              All ({activeLogs.length})
            </button>
            <button
              onClick={() => setFilter("MALICIOUS")}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filter === "MALICIOUS" ? "bg-[#ff5555]/20 text-[#ff6b6b]" : "text-[#8a8f98] hover:text-[#ff5555]"
              }`}
            >
              Malicious ({maliciousCount})
            </button>
            <button
              onClick={() => setFilter("BENIGN")}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filter === "BENIGN" ? "bg-[#1e2025] text-[#f7f8f8]" : "text-[#8a8f98] hover:text-[#f7f8f8]"
              }`}
            >
              Benign
            </button>
          </div>
        </div>
      </div>

      {/* Log Entries Viewport */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#18191c]/50 p-1">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className={`flex items-start gap-3 px-3.5 py-2 transition-colors ${
              log.isMalicious
                ? "bg-[#251014] border-l-4 border-l-[#ff5555] text-[#ff6b6b]"
                : "hover:bg-[#121316] text-[#8a8f98]"
            }`}
          >
            {/* Timestamp */}
            <span className="text-[#62666d] select-none text-[11px] font-mono shrink-0">
              [{log.timestamp}]
            </span>

            {/* Level Tag */}
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono uppercase shrink-0 ${
                log.isMalicious
                  ? "bg-[#ff5555] text-[#ffffff]"
                  : log.level === "INFO"
                  ? "bg-[#1e2025] text-[#828fff]"
                  : "bg-[#121316] text-[#8a8f98]"
              }`}
            >
              {log.level}
            </span>

            {/* Extension Engine */}
            <span className="text-[#8a8f98] font-mono shrink-0 text-[11px]">
              [{log.extension}]
            </span>

            {/* Log Message */}
            <span
              className={`flex-1 leading-relaxed ${
                log.isMalicious ? "font-semibold text-[#ff8080]" : "text-[#d0d6e0]"
              }`}
            >
              {log.message}
            </span>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="p-6 text-center text-[#62666d] text-[12px]">
            No matching telemetry logs found.
          </div>
        )}
      </div>

    </div>
  );
}
