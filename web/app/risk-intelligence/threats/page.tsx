"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RiskNavTabs } from "@/components/risk-nav";
import { DashboardShell } from "@/components/dashboard-shell";

interface ThreatAlert {
  id: string;
  title: string;
  category: "Secret Leak" | "Rogue Package" | "Abnormal Churn" | "API Abuse" | "Access Anomaly";
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  detectedAt: string;
  affectedAsset: string;
  cveOrRule: string;
  status: "ACTIVE" | "MITIGATED" | "QUARANTINED";
  impactScore: number;
  remediationAction: string;
}

const INITIAL_THREATS: ThreatAlert[] = [
  {
    id: "THREAT-9941",
    title: "AWS Master Secret Key Exposed in Pull Request #142",
    category: "Secret Leak",
    severity: "CRITICAL",
    detectedAt: "2 minutes ago",
    affectedAsset: "SVC-PAYMENTS-API",
    cveOrRule: "RULE-SECRET-LEAK-01",
    status: "ACTIVE",
    impactScore: 9.6,
    remediationAction: "Auto-Revoke Key & Block PR"
  },
  {
    id: "THREAT-9940",
    title: "Malicious NPM Dependency 'pay-auth-crypto' Attempting Outbound Connection",
    category: "Rogue Package",
    severity: "CRITICAL",
    detectedAt: "14 minutes ago",
    affectedAsset: "ASSET-PAY-API-01",
    cveOrRule: "CVE-2026-3891",
    status: "ACTIVE",
    impactScore: 9.8,
    remediationAction: "Isolate Package & Freeze Build Pipeline"
  },
  {
    id: "THREAT-9939",
    title: "Unusual Code Churn (+14,000 lines added in single commit by automated bot)",
    category: "Abnormal Churn",
    severity: "HIGH",
    detectedAt: "45 minutes ago",
    affectedAsset: "REPOS-CORE-LEDGER",
    cveOrRule: "RULE-CHURN-ANOMALY",
    status: "QUARANTINED",
    impactScore: 8.4,
    remediationAction: "Rollback Commit & Request Human Verification"
  },
  {
    id: "THREAT-9938",
    title: "Rate Limit Exceeded on Payment Webhook Endpoint without Valid Signature",
    category: "API Abuse",
    severity: "MEDIUM",
    detectedAt: "1 hour ago",
    affectedAsset: "ASSET-WEBHOOK-GW",
    cveOrRule: "RULE-[#WAF-RATE-LIMIT]",
    status: "MITIGATED",
    impactScore: 6.2,
    remediationAction: "Apply IP Ban & Rate Limit"
  }
];

export default function RiskThreatsPage() {
  const [threats, setThreats] = useState<ThreatAlert[]>(INITIAL_THREATS);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleRemediate = (id: string, actionName: string) => {
    setThreats((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "MITIGATED" } : t))
    );
    setActionNotice(`Executed action: '${actionName}' for threat ${id}. Threat mitigated successfully.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const filteredThreats = threats.filter((t) =>
    filterSeverity === "ALL" ? true : t.severity === filterSeverity
  );

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
                  <span className="text-[13px] font-semibold text-[#5e6ad2] tracking-wide uppercase">Real-Time Threat Stream</span>
                  <span className="text-[#8a8f98] text-[12px]">·</span>
                  <span className="text-[12px] text-[#e5484d] flex items-center gap-1 font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#e5484d] animate-ping" /> Active Defense Shield Online
                  </span>
                </div>
                <h1 className="text-lg font-semibold text-[#f7f8f8] leading-tight">
                  Secret Leaks, Malicious Code Churn & rogue API Excursions
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold bg-[#e5484d]/15 text-[#e5484d] border border-[#e5484d]/40 hover:bg-[#e5484d]/25 transition-colors flex items-center gap-1.5">
                ⚡ Freeze All High-Risk Pipelines
              </button>
            </div>
          </div>
        </header>

        {/* Sub Navigation */}
        <RiskNavTabs />

        {/* Main Body */}
        <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
          {actionNotice && (
            <div className="mb-6 p-3 rounded-lg bg-[#27a644]/15 border border-[#27a644]/40 text-[#27a644] text-[13px] flex items-center justify-between">
              <span>✓ {actionNotice}</span>
            </div>
          )}

          {/* Top Threat Overview Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-5 rounded-xl bg-[#0f1011] border border-[#23252a] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[#8a8f98] font-medium uppercase tracking-wider">Active Threat Index</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#e5484d]/20 text-[#e5484d]">HIGH RISK</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#f7f8f8]">8.9</span>
                <span className="text-xs text-[#8a8f98]">/ 10.0</span>
              </div>
              <div className="w-full bg-[#1e2025] h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-gradient-to-r from-[#f5a623] to-[#e5484d] h-full w-[89%]" />
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0f1011] border border-[#23252a] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[#8a8f98] font-medium uppercase tracking-wider">Active Critical Alarms</span>
                <span className="text-xs text-[#e5484d] font-mono">2 Require Immediate Action</span>
              </div>
              <div className="text-3xl font-extrabold text-[#e5484d] font-mono">
                {threats.filter((t) => t.status === "ACTIVE" && t.severity === "CRITICAL").length}
              </div>
              <div className="text-xs text-[#8a8f98] mt-2">Automated response playbooks queued</div>
            </div>

            <div className="p-5 rounded-xl bg-[#0f1011] border border-[#23252a] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] text-[#8a8f98] font-medium uppercase tracking-wider">Mean Time to Quarantine</span>
                <span className="text-xs text-[#27a644] font-mono">↓ 42% faster</span>
              </div>
              <div className="text-3xl font-extrabold text-[#5e6ad2] font-mono">1.8 min</div>
              <div className="text-xs text-[#8a8f98] mt-2">Powered by KVCH Vigilance Engine</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                    filterSeverity === sev
                      ? "bg-[#5e6ad2] text-white"
                      : "bg-[#141516] text-[#8a8f98] border border-[#23252a] hover:text-[#d0d6e0]"
                  }`}
                >
                  {sev === "ALL" ? "All Alarms" : `${sev} Severity`}
                </button>
              ))}
            </div>

            <span className="text-[12px] text-[#8a8f98] font-mono">
              Showing {filteredThreats.length} threat signals
            </span>
          </div>

          {/* Threat Stream List */}
          <div className="space-y-4">
            {filteredThreats.map((threat) => (
              <div
                key={threat.id}
                className={`p-5 rounded-xl border transition-all ${
                  threat.status === "ACTIVE"
                    ? "bg-[#0f1011] border-[#e5484d]/40 shadow-[0_0_15px_rgba(229,72,77,0.1)]"
                    : "bg-[#0c0d0e] border-[#23252a] opacity-80"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-lg font-bold ${
                        threat.severity === "CRITICAL"
                          ? "bg-[#e5484d]/20 text-[#e5484d] border border-[#e5484d]/40"
                          : "bg-[#f5a623]/20 text-[#f5a623] border border-[#f5a623]/40"
                      }`}
                    >
                      !
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold text-[#5e6ad2]">{threat.id}</span>
                        <span className="text-[#8a8f98] text-xs">·</span>
                        <span className="text-xs font-mono text-[#8a8f98]">{threat.detectedAt}</span>
                        <span className="text-[#8a8f98] text-xs">·</span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-[#141516] text-[#d0d6e0] border border-[#23252a]">
                          {threat.category}
                        </span>
                      </div>

                      <h2 className="text-base font-semibold text-[#f7f8f8]">{threat.title}</h2>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#8a8f98]">
                        <span>Asset: <code className="text-[#f7f8f8]">{threat.affectedAsset}</code></span>
                        <span>Rule: <code className="text-[#5e6ad2]">{threat.cveOrRule}</code></span>
                        <span>Impact Score: <span className="text-[#e5484d] font-bold">{threat.impactScore} / 10</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {threat.status === "ACTIVE" ? (
                      <button
                        onClick={() => handleRemediate(threat.id, threat.remediationAction)}
                        className="px-4 py-2 rounded-md text-[13px] font-semibold bg-[#e5484d] hover:bg-[#c93b40] text-white shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        ⚡ {threat.remediationAction}
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-md text-[12px] font-semibold bg-[#27a644]/20 text-[#27a644] border border-[#27a644]/40">
                        ✓ Mitigated
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </DashboardShell>
  );
}
