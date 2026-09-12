"use client";

import React, { useState } from "react";

interface TimelineStep {
  time: string;
  extension: string;
  name: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "RESOLVED";
  indicator: string;
  detail: string;
  commandSnippet?: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    time: "T+05m",
    extension: "attack-surface-scanner",
    name: "Perimeter Recon",
    severity: "HIGH",
    indicator: "0.0.0.0:5432 & Port 445 Open",
    detail: "PostgreSQL listening on wildcard interface without mTLS. Missing HSTS headers on dev ingress.",
    commandSnippet: "netstat -tulpn | grep 5432",
  },
  {
    time: "T+18m",
    extension: "edgeguard-sentinel",
    name: "Edge CDN Probe",
    severity: "MEDIUM",
    indicator: "Origin IP 10.0.4.15 Leaked",
    detail: "Direct origin IP exposed via cf-connecting-ip header mismatch, bypassing Cloudflare edge WAF rules.",
    commandSnippet: "curl -H 'cf-connecting-ip: 10.0.4.15' http://auth.kvch.internal",
  },
  {
    time: "T+29m",
    extension: "phishing-hunter",
    name: "DNS Hijack",
    severity: "HIGH",
    indicator: "Rogue /etc/hosts Entry",
    detail: "Tampering detected mapping internal Single Sign-On (auth.kvch.internal) to rogue C2 IP 185.220.101.5.",
    commandSnippet: "grep auth.kvch.internal /etc/hosts",
  },
  {
    time: "T+38m",
    extension: "supply-chain-auditor",
    name: "Supply Chain",
    severity: "CRITICAL",
    indicator: "Typosquat npm Package in PR #4",
    detail: "@kvch-internal/crypto-utils@1.4.2 injected via unreviewed PR #4. Malicious postinstall curl | sh hook.",
    commandSnippet: "npm audit --audit-level=critical",
  },
  {
    time: "T+54m",
    extension: "malware-analyzer",
    name: "Entropy Dropper",
    severity: "CRITICAL",
    indicator: "Packed Dropper (H = 7.942)",
    detail: "/tmp/.system_daemon Mach-O binary analyzed. Shannon entropy exceeds 7.2. Matched YARA MALW_JS_REVERSE_SHELL.",
    commandSnippet: "yara -m rules.yar /tmp/.system_daemon",
  },
  {
    time: "T+67m",
    extension: "threat-hunter-3000",
    name: "C2 Reverse Shell",
    severity: "CRITICAL",
    indicator: "Reverse Shell (PID 14209)",
    detail: "Rogue Node process established outbound TCP socket to 185.220.101.5:443 masquerading as HTTPS.",
    commandSnippet: "lsof -i :443 | grep 14209",
  },
  {
    time: "T+72m",
    extension: "threat-hunter-3000",
    name: "Autostart Plist",
    severity: "HIGH",
    indicator: "com.apple.sync.plist Created",
    detail: "LaunchAgent persistence plist created in ~/Library/LaunchAgents/ to respawn reverse shell on reboot.",
    commandSnippet: "cat ~/Library/LaunchAgents/com.apple.sync.plist",
  },
  {
    time: "T+82m",
    extension: "cookie-xss-auditor",
    name: "DOM XSS Harvest",
    severity: "HIGH",
    indicator: "location.hash JWT Sink",
    detail: "DOM XSS sink in dashboard-shell.tsx exposed session JWT tokens due to missing HttpOnly/Secure flags.",
    commandSnippet: "grep -rn 'location.hash' web/components/",
  },
  {
    time: "T+91m",
    extension: "credential-exposure-auditor",
    name: "Secret Scraping",
    severity: "CRITICAL",
    indicator: "AWS/Stripe & Crypto Clipper",
    detail: "Scraped plaintext AWS_SECRET_ACCESS_KEY from uncommitted .env. Active clipboard address swapper.",
    commandSnippet: "git secrets --scan",
  },
  {
    time: "T+102m",
    extension: "vpn-crypto-analyzer",
    name: "VPN DNS Leak",
    severity: "HIGH",
    indicator: "tun0 Split-Tunnel Leak",
    detail: "Split-tunnel DNS leak bypassed WireGuard tunnel to foreign resolver. Active crypto wallet memory probe.",
    commandSnippet: "resolvectl status tun0",
  },
  {
    time: "T+111m",
    extension: "aegisdb-zerotrust",
    name: "Exfil Block",
    severity: "CRITICAL",
    indicator: "Dump Halted / Socket Severed",
    detail: "Intercepted unpaginated SELECT * FROM users, salaries, private_keys. AST Engine severed socket FD 42 in 3.8ms!",
    commandSnippet: "aegisdb-cli --audit-log --last-severed",
  },
  {
    time: "T+118m",
    extension: "edr-daemon",
    name: "SOAR Isolation",
    severity: "RESOLVED",
    indicator: "nftables Drop & Host Restored",
    detail: "Automated SOAR playbook executed: PID 14209 killed, C2 IP dropped via nftables, persistence removed, clean state.",
    commandSnippet: "sudo nft list table inet kvch_quarantine",
  },
];

export function AttackProgressionTimeline() {
  const [selectedStep, setSelectedStep] = useState<TimelineStep>(TIMELINE_STEPS[10]); // Default to AegisDB halt step

  const getBadgeColor = (severity: TimelineStep["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-[#ff5555]/15 text-[#ff5555] border-[#ff5555]/30";
      case "HIGH":
        return "bg-[#ff9900]/15 text-[#ff9900] border-[#ff9900]/30";
      case "MEDIUM":
        return "bg-[#f2c94c]/15 text-[#f2c94c] border-[#f2c94c]/30";
      case "RESOLVED":
        return "bg-[#2ea043]/15 text-[#2ea043] border-[#2ea043]/30";
      default:
        return "bg-[#5e6ad2]/15 text-[#828fff] border-[#5e6ad2]/30";
    }
  };

  return (
    <div className="bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all rounded-2xl p-5 flex flex-col space-y-4 shadow-xl">
      
      <div className="flex items-center justify-between border-b border-[#232529] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5e6ad2] animate-pulse" />
          <h3 className="text-[14px] font-semibold text-[#f7f8f8] tracking-tight">
            120-Minute Attack Lifecycle & 10 Modular Defense Engines Progression
          </h3>
        </div>
        <span className="text-[11.5px] font-mono text-[#8a8f98]">
          Click any phase node to inspect telemetry
        </span>
      </div>

      {/* Horizontal Scrollable Timeline Track */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {TIMELINE_STEPS.map((step, idx) => {
          const isSelected = selectedStep.time === step.time;
          return (
            <button
              key={step.time}
              onClick={() => setSelectedStep(step)}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all shrink-0 min-w-[140px] cursor-pointer active:scale-95 ${
                isSelected
                  ? "bg-[#181a20] border-[#5e6ad2] shadow-md shadow-[#5e6ad2]/10"
                  : "bg-[#121316] border-[#232529] hover:border-[#2f323a]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10.5px] font-mono font-bold text-[#828fff]">
                  {step.time}
                </span>
                <span
                  className={`px-1.5 py-0.2 text-[9.5px] font-mono rounded border uppercase ${getBadgeColor(
                    step.severity
                  )}`}
                >
                  {step.severity === "RESOLVED" ? "CLEAN" : step.severity}
                </span>
              </div>
              <span className="text-[12px] font-semibold text-[#f7f8f8] mt-1 truncate w-full">
                {step.name}
              </span>
              <span className="text-[10px] text-[#8a8f98] font-mono truncate w-full mt-0.5">
                {step.extension}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Step Expanded Telemetry Panel */}
      <div className="bg-[#121316] border border-[#232529] p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[11.5px] font-mono font-bold text-[#828fff] px-2 py-0.5 bg-[#828fff]/10 rounded border border-[#828fff]/25">
              {selectedStep.time}
            </span>
            <span className="text-[13px] font-semibold text-[#f7f8f8]">
              {selectedStep.extension}
            </span>
            <span className="text-[#3a3d45]">·</span>
            <span className="text-[12px] font-mono text-[#f2c94c]">
              {selectedStep.indicator}
            </span>
          </div>
          <p className="text-[12.5px] text-[#d0d6e0] leading-relaxed">
            {selectedStep.detail}
          </p>
        </div>

        {selectedStep.commandSnippet && (
          <div className="shrink-0 bg-[#08090a] border border-[#232529] p-2.5 rounded-lg font-mono text-[11.5px] text-[#828fff] max-w-sm overflow-x-auto">
            <span className="text-[9.5px] uppercase text-[#8a8f98] block mb-0.5">Verification Command</span>
            <code>{selectedStep.commandSnippet}</code>
          </div>
        )}
      </div>

    </div>
  );
}
