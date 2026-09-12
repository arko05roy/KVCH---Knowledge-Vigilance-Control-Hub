"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { useState } from "react";

interface TeamPattern {
  teamName: string;
  memberCount: number;
  afterHoursCommitRatio: number; // e.g. 18%
  burnoutRiskLevel: "LOW" | "MODERATE" | "HIGH";
  trainingNeed: string;
  collaborationScore: number;
  recommendation: string;
}

const MOCK_PATTERNS: TeamPattern[] = [
  {
    teamName: "Core Backend & Auth Services",
    memberCount: 8,
    afterHoursCommitRatio: 28,
    burnoutRiskLevel: "HIGH",
    trainingNeed: "Async Event-Driven Architecture & Vault PAM Tokenization",
    collaborationScore: 92,
    recommendation: "Rebalance sprint workload & enforce weekend commit pauses."
  },
  {
    teamName: "Payment Gateway & Checkout UI",
    memberCount: 12,
    afterHoursCommitRatio: 14,
    burnoutRiskLevel: "MODERATE",
    trainingNeed: "PostgreSQL Query Tuning & Rate Limiting Guardrails",
    collaborationScore: 88,
    recommendation: "Schedule technical mentor workshop on database indexing."
  },
  {
    teamName: "Mobile Apps (iOS & Android)",
    memberCount: 6,
    afterHoursCommitRatio: 6,
    burnoutRiskLevel: "LOW",
    trainingNeed: "Automated Integration Testing & CI/CD Pipeline Triggers",
    collaborationScore: 95,
    recommendation: "Optimal workload distribution. Maintain current rhythm."
  }
];

export default function PatternsPage() {
  const [patterns] = useState<TeamPattern[]>(MOCK_PATTERNS);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const triggerCheckIn = (teamName: string) => {
    setActionNotice(`HR 1-on-1 workload review scheduled for ${teamName}. Workload balance email sent.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <DashboardShell roleName="HR" navItems={[]} hideHeader>
      <div className="flex flex-col h-full bg-[#111213] text-[#e8e8e8] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="w-full sticky top-0 bg-[#1a1b1d]/95 backdrop-blur-md z-10 border-b border-[#2b2c2e] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5e6ad2]" />
            <h1 className="text-[15px] font-medium text-[#e8e8e8]">Organizational Work Pattern & Burnout Risk Analysis</h1>
            <span className="text-xs text-[#858688] font-mono">(Real-time Developer Health Signals)</span>
          </div>

          <button className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#5e6ad2] text-white hover:bg-[#4d59c2] transition-colors">
            📊 Export Organizational Report
          </button>
        </div>

        {/* Body */}
        <div className="max-w-6xl w-full mx-auto px-8 py-6 space-y-6">
          {actionNotice && (
            <div className="p-3 rounded-lg bg-[#2ea043]/15 border border-[#2ea043]/40 text-[#2ea043] text-[13px]">
              ✓ {actionNotice}
            </div>
          )}

          {/* Key HR Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e]">
              <span className="text-[12px] text-[#858688] uppercase font-medium">Org Burnout Risk Index</span>
              <div className="text-2xl font-bold text-[#f2c94c] mt-1 font-mono">Moderate (16%)</div>
              <span className="text-[11px] text-[#858688] mt-1 inline-block">1 Team requires workload rebalancing</span>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e]">
              <span className="text-[12px] text-[#858688] uppercase font-medium">After-Hours Commits</span>
              <div className="text-2xl font-bold text-[#eb5757] mt-1 font-mono">16.4%</div>
              <span className="text-[11px] text-[#858688] mt-1 inline-block">Spike detected in Core Backend</span>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e]">
              <span className="text-[12px] text-[#858688] uppercase font-medium">Cross-Team Collaboration</span>
              <div className="text-2xl font-bold text-[#2ea043] mt-1 font-mono">91.6%</div>
              <span className="text-[11px] text-[#2ea043] mt-1 inline-block">High peer review engagement</span>
            </div>
          </div>

          {/* Team Work Pattern Cards */}
          <div className="space-y-4">
            {patterns.map((pt, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e] hover:border-[#5e6ad2]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[15px] text-[#e8e8e8]">{pt.teamName}</span>
                    <span className="text-[#858688] text-xs">·</span>
                    <span className="text-xs text-[#858688]">{pt.memberCount} Engineers</span>
                    <span className="text-[#858688] text-xs">·</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        pt.burnoutRiskLevel === "HIGH"
                          ? "bg-[#eb5757]/20 text-[#eb5757]"
                          : pt.burnoutRiskLevel === "MODERATE"
                          ? "bg-[#f2c94c]/20 text-[#f2c94c]"
                          : "bg-[#2ea043]/20 text-[#2ea043]"
                      }`}
                    >
                      {pt.burnoutRiskLevel} RISK
                    </span>
                  </div>

                  <p className="text-[13px] text-[#c4c5c7]">
                    Recommended Action: <strong>{pt.recommendation}</strong>
                  </p>

                  <div className="p-2.5 rounded bg-[#111213] border border-[#2b2c2e] text-xs text-[#858688]">
                    <span>Identified Skill Gap: <strong className="text-[#5e6ad2]">{pt.trainingNeed}</strong></span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#858688]">
                    <span>After-Hours Commits: <strong className="text-[#eb5757]">{pt.afterHoursCommitRatio}%</strong></span>
                    <span>Collaboration Index: <strong className="text-[#2ea043]">{pt.collaborationScore}%</strong></span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => triggerCheckIn(pt.teamName)}
                    className="px-4 py-2 rounded-md text-xs font-semibold bg-[#5e6ad2] text-white hover:bg-[#4d59c2] transition-colors"
                  >
                    💬 Schedule Team Check-in
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
