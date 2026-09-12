"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { useState } from "react";

interface Escalation {
  id: string;
  title: string;
  department: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  impactINR: number;
  slaBreachHours: number;
  owner: string;
  blockerDescription: string;
  status: "OPEN_ESCALATION" | "EXEMPTION_GRANTED" | "RESOLVED";
}

const INITIAL_ESCALATIONS: Escalation[] = [
  {
    id: "ESC-901",
    title: "SLA Breach Warning: Payment Gateway API Rollout Delayed by 5 Days",
    department: "Digital Payments",
    severity: "CRITICAL",
    impactINR: 4500000,
    slaBreachHours: 12,
    owner: "Vikram Malhotra (Engineering VP)",
    blockerDescription: "Dependency on third-party HSM vendor certificate approval blocking Q3 release milestone.",
    status: "OPEN_ESCALATION"
  },
  {
    id: "ESC-902",
    title: "Inter-Team Blockage: Core Ledger Schema Change Awaiting Mobile Team PR Review",
    department: "Mobile & Core Engineering",
    severity: "HIGH",
    impactINR: 1800000,
    slaBreachHours: 36,
    owner: "Ananya Roy (Tech Lead)",
    blockerDescription: "Mobile iOS team delayed by 48 hours reviewing database migration specs for offline sync.",
    status: "OPEN_ESCALATION"
  },
  {
    id: "ESC-903",
    title: "Break-Glass Emergency Request: Temporary Memory Allocation Limit Bump",
    department: "Infrastructure Operations",
    severity: "MEDIUM",
    impactINR: 350000,
    slaBreachHours: 4,
    owner: "David Chen",
    blockerDescription: "Requires Director approval to override AWS cloud spend budget cap during unexpected load surge.",
    status: "EXEMPTION_GRANTED"
  }
];

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<Escalation[]>(INITIAL_ESCALATIONS);
  const [notice, setNotice] = useState<string | null>(null);

  const handleResolveEscalation = (id: string, action: "EXEMPTION_GRANTED" | "RESOLVED") => {
    setEscalations((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: action } : e))
    );
    setNotice(`Escalation ${id} updated to ${action}. Executive decision logged.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const formatINR = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  return (
    <DashboardShell roleName="Management" navItems={[]} hideHeader>
      <div className="flex flex-col h-full bg-[#111213] text-[#e8e8e8] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="w-full sticky top-0 bg-[#1a1b1d]/95 backdrop-blur-md z-10 border-b border-[#2b2c2e] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f2c94c] animate-ping" />
            <h1 className="text-[15px] font-medium text-[#e8e8e8]">Executive Escalation & Blocker Matrix</h1>
            <span className="text-xs text-[#858688] font-mono">
              ({escalations.filter((e) => e.status === "OPEN_ESCALATION").length} Active Blockers)
            </span>
          </div>

          <button className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#eb5757] text-white hover:bg-[#c93b40] transition-colors">
            + File Executive Escalation
          </button>
        </div>

        {/* Body */}
        <div className="max-w-6xl w-full mx-auto px-8 py-6 space-y-6">
          {notice && (
            <div className="p-3 rounded-lg bg-[#2ea043]/15 border border-[#2ea043]/40 text-[#2ea043] text-[13px]">
              ✓ {notice}
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e]">
              <span className="text-[12px] text-[#858688] uppercase font-medium">Total At-Risk Exposure</span>
              <div className="text-2xl font-bold text-[#eb5757] mt-1 font-mono">
                {formatINR(escalations.reduce((acc, e) => (e.status === "OPEN_ESCALATION" ? acc + e.impactINR : acc), 0))}
              </div>
              <span className="text-[11px] text-[#858688] mt-1 inline-block">Estimated business revenue impact</span>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e]">
              <span className="text-[12px] text-[#858688] uppercase font-medium">Average SLA Breach SLA</span>
              <div className="text-2xl font-bold text-[#f2c94c] mt-1 font-mono">24.0 Hours</div>
              <span className="text-[11px] text-[#858688] mt-1 inline-block">Director action required</span>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e]">
              <span className="text-[12px] text-[#858688] uppercase font-medium">Resolution Velocity</span>
              <div className="text-2xl font-bold text-[#2ea043] mt-1 font-mono">92% Resolved</div>
              <span className="text-[11px] text-[#2ea043] mt-1 inline-block">Sprint commitment on track</span>
            </div>
          </div>

          {/* Escalation Cards */}
          <div className="space-y-4">
            {escalations.map((esc) => (
              <div
                key={esc.id}
                className="p-5 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e] hover:border-[#5e6ad2]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#5e6ad2]">{esc.id}</span>
                    <span className="text-[#858688] text-xs">·</span>
                    <span className="text-xs text-[#858688]">{esc.department}</span>
                    <span className="text-[#858688] text-xs">·</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                        esc.severity === "CRITICAL"
                          ? "bg-[#eb5757]/20 text-[#eb5757]"
                          : "bg-[#f2c94c]/20 text-[#f2c94c]"
                      }`}
                    >
                      {esc.severity}
                    </span>
                  </div>

                  <h2 className="text-[15px] font-semibold text-[#e8e8e8]">{esc.title}</h2>
                  <p className="text-[13px] text-[#c4c5c7]">{esc.blockerDescription}</p>

                  <div className="flex items-center gap-4 text-xs text-[#858688] pt-1">
                    <span>Owner: <strong className="text-[#e8e8e8]">{esc.owner}</strong></span>
                    <span>Financial Risk: <strong className="text-[#eb5757]">{formatINR(esc.impactINR)}</strong></span>
                    <span>SLA Breach: <strong className="text-[#f2c94c]">{esc.slaBreachHours}h Remaining</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {esc.status === "OPEN_ESCALATION" ? (
                    <>
                      <button
                        onClick={() => handleResolveEscalation(esc.id, "EXEMPTION_GRANTED")}
                        className="px-3.5 py-1.5 rounded text-xs font-medium bg-[#262729] hover:bg-[#5e6ad2]/20 hover:text-[#5e6ad2] text-[#c4c5c7] border border-[#2b2c2e] transition-colors"
                      >
                        Grant Executive Exemption
                      </button>
                      <button
                        onClick={() => handleResolveEscalation(esc.id, "RESOLVED")}
                        className="px-4 py-1.5 rounded text-xs font-semibold bg-[#2ea043] text-white hover:bg-[#258537] transition-colors"
                      >
                        ✓ Mark Resolved
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-1.5 rounded text-xs font-semibold bg-[#2ea043]/20 text-[#2ea043] border border-[#2ea043]/40 font-mono">
                      ✓ {esc.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
