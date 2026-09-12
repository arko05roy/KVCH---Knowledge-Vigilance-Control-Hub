"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RiskNavTabs } from "@/components/risk-nav";
import { DashboardShell } from "@/components/dashboard-shell";

interface AuditLog {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    role: string;
    avatar: string;
    ip: string;
  };
  eventType: "code_modification" | "ai_prompt_execution" | "dependency_ingest" | "privilege_escalation" | "secret_access";
  severity: "critical" | "high" | "medium" | "low";
  resource: string;
  description: string;
  hash: string;
  details: {
    diffSnippet?: string;
    promptText?: string;
    packageDetails?: string;
    governanceResult: "PASS" | "QUARANTINED" | "FLAGGED_FOR_REVIEW";
  };
}

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "AUD-2026-9812",
    timestamp: "2026-09-12T18:32:05Z",
    actor: {
      name: "Alex Vance (AI Subagent)",
      role: "Autonomous Code Agent",
      avatar: "🤖",
      ip: "10.244.12.98 (Internal Sandbox)"
    },
    eventType: "ai_prompt_execution",
    severity: "high",
    resource: "web/lib/judge/findings.ts",
    description: "Executed high-privilege prompt requesting direct raw SQL query string generation for payment ledger table.",
    hash: "0x89f2a71c9b2e4d",
    details: {
      promptText: "Generate raw PostgreSQL query string joining payment_ledger and customer_pii without parameterized binding...",
      governanceResult: "FLAGGED_FOR_REVIEW"
    }
  },
  {
    id: "AUD-2026-9811",
    timestamp: "2026-09-12T17:45:12Z",
    actor: {
      name: "Priya Sharma",
      role: "Senior Backend Lead",
      avatar: "PS",
      ip: "192.168.1.42 (VPN Enterprise)",
    },
    eventType: "code_modification",
    severity: "critical",
    resource: "services/auth-vault/keys.go",
    description: "Bypassed JWT public key verification check during hotfix patch commit #e9f821.",
    hash: "0x3b1c9a4f210d7e",
    details: {
      diffSnippet: `- if err := verifySignature(token, pubKey); err != nil {\n-   return nil, ErrInvalidSig\n- }\n+ // TODO: Bypass signature check for staging smoke test\n+ log.Println("Skipping JWT signature verification")`,
      governanceResult: "QUARANTINED"
    }
  },
  {
    id: "AUD-2026-9810",
    timestamp: "2026-09-12T16:10:00Z",
    actor: {
      name: "CI/CD Pipeline Bot",
      role: "GitHub Action Runner #402",
      avatar: "⚙️",
      ip: "13.89.201.44 (Azure Cloud)"
    },
    eventType: "dependency_ingest",
    severity: "medium",
    resource: "package.json",
    description: "Added unverified npm dependency 'pay-auth-crypto@2.4.1' with postinstall binary script execution.",
    hash: "0x12a9f8b03e4d5c",
    details: {
      packageDetails: "Package: pay-auth-crypto v2.4.1 | Downloads: 142 | Postinstall Script: node ./build/download-binary.js",
      governanceResult: "FLAGGED_FOR_REVIEW"
    }
  },
  {
    id: "AUD-2026-9809",
    timestamp: "2026-09-12T14:22:30Z",
    actor: {
      name: "Rohan Gupta",
      role: "Junior Frontend Intern",
      avatar: "RG",
      ip: "192.168.1.109 (VPN Home)"
    },
    eventType: "secret_access",
    severity: "high",
    resource: ".env.production.secrets",
    description: "Attempted read access on production database secret key outside allowed dev container.",
    hash: "0x77c2d9e10a3f81",
    details: {
      governanceResult: "QUARANTINED"
    }
  },
  {
    id: "AUD-2026-9808",
    timestamp: "2026-09-12T12:05:18Z",
    actor: {
      name: "System Security Scanner",
      role: "KVCH Vigilance Engine",
      avatar: "🛡️",
      ip: "127.0.0.1 (Local Daemon)"
    },
    eventType: "privilege_escalation",
    severity: "low",
    resource: "iam/roles/security_auditor.json",
    description: "Verified quarterly audit log rotation policy and sealed hash tree entry #4812.",
    hash: "0x99a1f2b3c4d5e6",
    details: {
      governanceResult: "PASS"
    }
  }
];

export default function RiskAuditsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [expandedLogId, setExpandedLogId] = useState<string | null>("AUD-2026-9811");
  const [exportNotice, setExportNotice] = useState(false);

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = selectedSeverity === "all" || log.severity === selectedSeverity;
    const matchesEvent = selectedEventType === "all" || log.eventType === selectedEventType;

    return matchesSearch && matchesSeverity && matchesEvent;
  });

  const triggerExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <DashboardShell roleName="Risk Intelligence" hideHeader>
      <div className="min-h-screen bg-[#090a0b] text-[#f7f8f8] font-sans flex flex-col">
        
        {/* Header */}
        <header className="border-b border-[#23252a] bg-[#0f1011] px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#5e6ad2] flex items-center justify-center font-bold text-white text-sm shadow-md">
                K
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#5e6ad2] tracking-wide uppercase">Forensic Audit Stream</span>
                  <span className="text-[#8a8f98] text-[12px]">·</span>
                  <span className="text-[12px] text-[#27a644] flex items-center gap-1 font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#27a644] animate-ping" /> Immutable Cryptographic Chain Active
                  </span>
                </div>
                <h1 className="text-lg font-semibold text-[#f7f8f8] leading-tight">
                  Codebase Edits, AI Model Logs & Sensitive API Activity
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={triggerExport}
                className="px-3.5 py-1.5 rounded-md text-[13px] font-medium bg-[#141516] text-[#f7f8f8] border border-[#23252a] hover:bg-[#1f2125] transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4 text-[#8a8f98]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Cryptographic Bundle
              </button>
            </div>
          </div>
        </header>

        {/* Sub Navigation */}
        <RiskNavTabs />

        {/* Main Content */}
        <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
          {exportNotice && (
            <div className="mb-6 p-3 rounded-lg bg-[#27a644]/15 border border-[#27a644]/40 text-[#27a644] text-[13px] flex items-center justify-between transition-all">
              <span>✓ Cryptographically signed ZIP bundle (SHA256: 9f8a...31e4) exported to audit repository.</span>
            </div>
          )}

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-[#0f1011] border border-[#23252a]">
              <span className="text-[12px] text-[#8a8f98] font-medium uppercase tracking-wider">Total Audited Events (24h)</span>
              <div className="text-2xl font-bold text-[#f7f8f8] mt-1 font-mono">1,482</div>
              <span className="text-[11px] text-[#27a644] mt-1 inline-block">100% Hash Verified</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0f1011] border border-[#23252a]">
              <span className="text-[12px] text-[#8a8f98] font-medium uppercase tracking-wider">Quarantined Changes</span>
              <div className="text-2xl font-bold text-[#e5484d] mt-1 font-mono">3</div>
              <span className="text-[11px] text-[#e5484d] mt-1 inline-block">Requires Sr. Dev Signoff</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0f1011] border border-[#23252a]">
              <span className="text-[12px] text-[#8a8f98] font-medium uppercase tracking-wider">AI Model Executions</span>
              <div className="text-2xl font-bold text-[#5e6ad2] mt-1 font-mono">429</div>
              <span className="text-[11px] text-[#8a8f98] mt-1 inline-block">Zero PII Leakage Detected</span>
            </div>
            <div className="p-4 rounded-xl bg-[#0f1011] border border-[#23252a]">
              <span className="text-[12px] text-[#8a8f98] font-medium uppercase tracking-wider">Chain Security Status</span>
              <div className="text-2xl font-bold text-[#27a644] mt-1">SEALED</div>
              <span className="text-[11px] text-[#8a8f98] mt-1 inline-block">Merkle Root: 0x98f...2e</span>
            </div>
          </div>

          {/* Filter and Search Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 p-3 rounded-xl bg-[#0f1011] border border-[#23252a]">
            <div className="flex-1 flex items-center gap-2 bg-[#141516] border border-[#23252a] rounded-lg px-3 py-1.5 focus-within:border-[#5e6ad2]">
              <svg className="w-4 h-4 text-[#8a8f98]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by commit hash, resource, developer name or payload..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-[13px] text-[#f7f8f8] placeholder-[#62666d] outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-[#141516] border border-[#23252a] text-[#f7f8f8] text-[13px] rounded-lg px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical Only</option>
                <option value="high">High Severity</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="bg-[#141516] border border-[#23252a] text-[#f7f8f8] text-[13px] rounded-lg px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="all">All Event Types</option>
                <option value="code_modification">Code Edits</option>
                <option value="ai_prompt_execution">AI Prompts</option>
                <option value="dependency_ingest">Dependency Ingests</option>
                <option value="secret_access">Secret Access</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-xl border border-[#23252a] bg-[#0f1011] overflow-hidden">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-[#23252a] bg-[#141516]/60 text-[#8a8f98] font-medium text-[12px]">
                  <th className="py-3 px-4">Event ID / Time</th>
                  <th className="py-3 px-4">Actor & Role</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Resource Target</th>
                  <th className="py-3 px-4">Governance Result</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23252a]">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className={`hover:bg-[#141516] transition-colors cursor-pointer ${
                          isExpanded ? "bg-[#141516]/80" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-[#5e6ad2] font-semibold">{log.id}</div>
                          <div className="text-[11px] text-[#8a8f98]">{new Date(log.timestamp).toLocaleTimeString()}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#1e2025] flex items-center justify-center text-xs font-bold text-[#d0d6e0] border border-[#34343a]">
                              {log.actor.avatar}
                            </span>
                            <div>
                              <div className="font-medium text-[#f7f8f8]">{log.actor.name}</div>
                              <div className="text-[11px] text-[#8a8f98]">{log.actor.role}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-[#18191a] text-[#d0d6e0] border border-[#23252a]">
                            {log.eventType.replace("_", " ")}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-mono text-[12px] text-[#f7f8f8]">{log.resource}</div>
                          <div className="text-[11px] text-[#8a8f98] truncate max-w-xs">{log.description}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          {log.details.governanceResult === "QUARANTINED" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#e5484d]/20 text-[#e5484d] border border-[#e5484d]/30">
                              ⛔ QUARANTINED
                            </span>
                          )}
                          {log.details.governanceResult === "FLAGGED_FOR_REVIEW" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f5a623]/20 text-[#f5a623] border border-[#f5a623]/30">
                              ⚠️ FLAGGED
                            </span>
                          )}
                          {log.details.governanceResult === "PASS" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#27a644]/20 text-[#27a644] border border-[#27a644]/30">
                              ✓ PASS
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-[11px] text-[#8a8f98]">
                          {isExpanded ? "Hide ▲" : "Inspect ▼"}
                        </td>
                      </tr>

                      {/* Expanded Drawer Details */}
                      {isExpanded && (
                        <tr className="bg-[#0b0c0d] border-t border-b border-[#23252a]">
                          <td colSpan={6} className="p-5">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between text-[12px]">
                                <span className="text-[#8a8f98] font-mono">IP: {log.actor.ip}</span>
                                <span className="text-[#8a8f98] font-mono">Merkle Hash: <code className="text-[#5e6ad2]">{log.hash}</code></span>
                              </div>

                              {log.details.diffSnippet && (
                                <div>
                                  <div className="text-[12px] font-semibold text-[#8a8f98] mb-1 uppercase tracking-wider font-mono">Code Diff Payload:</div>
                                  <pre className="p-3 rounded-lg bg-[#141516] border border-[#23252a] text-[12px] font-mono text-[#f7f8f8] overflow-x-auto">
                                    {log.details.diffSnippet}
                                  </pre>
                                </div>
                              )}

                              {log.details.promptText && (
                                <div>
                                  <div className="text-[12px] font-semibold text-[#8a8f98] mb-1 uppercase tracking-wider font-mono">AI Model Prompt Context:</div>
                                  <div className="p-3 rounded-lg bg-[#141516] border border-[#23252a] text-[12px] font-mono text-[#5e6ad2]">
                                    "{log.details.promptText}"
                                  </div>
                                </div>
                              )}

                              {log.details.packageDetails && (
                                <div>
                                  <div className="text-[12px] font-semibold text-[#8a8f98] mb-1 uppercase tracking-wider font-mono">Package Metadata:</div>
                                  <div className="p-3 rounded-lg bg-[#141516] border border-[#23252a] text-[12px] font-mono text-[#f5a623]">
                                    {log.details.packageDetails}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </DashboardShell>
  );
}
