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
  {
    id: "log-1",
    timestamp: "17:42:01.102",
    level: "INFO",
    extension: "attack-surface-scanner",
    message: "Initiated network subnet scan on 192.168.0.0/24 interface en0",
    isMalicious: false,
  },
  {
    id: "log-2",
    timestamp: "17:42:02.340",
    level: "DEBUG",
    extension: "vpn-crypto-analyzer",
    message: "WireGuard tunnel utun3 handshake OK. Cipher: ChaCha20-Poly1305 (256-bit)",
    isMalicious: false,
  },
  {
    id: "log-3",
    timestamp: "17:42:03.812",
    level: "CRITICAL",
    extension: "threat-hunter-3000",
    message: "REVERSE TCP SHELL DETECTED: Process node (PID 14209) initiated outbound TCP connection to C2 IP 185.220.101.5:443",
    isMalicious: true,
  },
  {
    id: "log-4",
    timestamp: "17:42:04.551",
    level: "TRACE",
    extension: "cookie-xss-auditor",
    message: "Audited 42 session cookies across *.kvch.internal. All HttpOnly & SameSite=Strict flags verified.",
    isMalicious: false,
  },
  {
    id: "log-5",
    timestamp: "17:42:05.902",
    level: "ALERT",
    extension: "malware-analyzer",
    message: "YARA MATCH DETECTED: Binary SHA-256 e3b0c44298fc... matches YARA rule 'MALW_JS_REVERSE_SHELL' (Entropy 7.91)",
    isMalicious: true,
  },
  {
    id: "log-6",
    timestamp: "17:42:07.119",
    level: "DEBUG",
    extension: "phishing-hunter",
    message: "WHOIS recon complete for example-internal.com. MX records clean, zero typosquat redirection detected.",
    isMalicious: false,
  },
  {
    id: "log-7",
    timestamp: "17:42:08.450",
    level: "INFO",
    extension: "credential-exposure-auditor",
    message: "Scanned environment memory heap. No raw unencrypted mnemonic seeds found in process space.",
    isMalicious: false,
  },
  {
    id: "log-8",
    timestamp: "17:42:09.914",
    level: "CRITICAL",
    extension: "attack-surface-scanner",
    message: "UNAUTHENTICATED DB LISTENER: PostgreSQL TCP port 5432 listening on 0.0.0.0 (Unrestricted external interface)",
    isMalicious: true,
  },
  {
    id: "log-9",
    timestamp: "17:42:11.003",
    level: "INFO",
    extension: "edr-daemon",
    message: "Constructed kvch.finding/v1 telemetry envelope for active EDR event stream",
    isMalicious: false,
  },
  {
    id: "log-10",
    timestamp: "17:42:12.388",
    level: "ALERT",
    extension: "supply-chain-auditor",
    message: "MALICIOUS NPM PACKAGE DETECTED: @kvch-internal/crypto-utils@1.4.2 contains unverified postinstall execution payload",
    isMalicious: true,
  },
  {
    id: "log-11",
    timestamp: "17:42:13.604",
    level: "DEBUG",
    extension: "threat-hunter-3000",
    message: "Verified /Library/LaunchAgents autostart directory. 14 daemon plists clean.",
    isMalicious: false,
  },
  {
    id: "log-12",
    timestamp: "17:42:15.112",
    level: "TRACE",
    extension: "vpn-crypto-analyzer",
    message: "DNS query resolution integrity check passed via 1.1.1.1 over TLS (DoT)",
    isMalicious: false,
  },
  {
    id: "log-13",
    timestamp: "17:42:16.450",
    level: "INFO",
    extension: "attack-surface-scanner",
    message: "Scanned local ports 80, 443, 3000, 5432, 8080. Total open listeners: 3",
    isMalicious: false,
  },
  {
    id: "log-14",
    timestamp: "17:42:17.890",
    level: "DEBUG",
    extension: "cookie-xss-auditor",
    message: "DOM XSS sink audit completed on /sr-dev/dashboard. Zero unescaped innerHTML injections found.",
    isMalicious: false,
  },
  {
    id: "log-15",
    timestamp: "17:42:19.201",
    level: "INFO",
    extension: "edr-daemon",
    message: "WebSocket telemetry gateway emitted 15 telemetry frames to ws://localhost:3000/api/ws",
    isMalicious: false,
  },
];

export function TelemetryLogStream() {
  const [filter, setFilter] = useState<"ALL" | "MALICIOUS" | "BENIGN">("ALL");
  const [search, setSearch] = useState("");

  const filteredLogs = SAMPLE_TELEMETRY_LOGS.filter((log) => {
    if (filter === "MALICIOUS" && !log.isMalicious) return false;
    if (filter === "BENIGN" && log.isMalicious) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && !log.extension.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const maliciousCount = SAMPLE_TELEMETRY_LOGS.filter((l) => l.isMalicious).length;

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
              All ({SAMPLE_TELEMETRY_LOGS.length})
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
