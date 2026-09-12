"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { useState } from "react";

interface Incident {
  id: string;
  title: string;
  severity: "SEV-1" | "SEV-2" | "SEV-3";
  service: string;
  status: "INVESTIGATING" | "IDENTIFIED" | "MONITORING" | "RESOLVED";
  commander: string;
  durationMinutes: number;
  rootCauseSummary: string;
  impactedUsers: number;
  timeStarted: string;
}

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "INC-2026-041",
    title: "PostgreSQL Connection Pool Exhaustion on Core Ledger Cluster",
    severity: "SEV-1",
    service: "services/core-ledger-db",
    status: "INVESTIGATING",
    commander: "Priya Sharma (Sr. Dev)",
    durationMinutes: 24,
    rootCauseSummary: "Unindexed subquery inside payment retry cron job causing open transaction leaks under high load.",
    impactedUsers: 14200,
    timeStarted: "24 minutes ago"
  },
  {
    id: "INC-2026-040",
    title: "Latency Spike (>4,500ms) on Webhook Signature Verification Endpoint",
    severity: "SEV-2",
    service: "gateways/merchant-webhook",
    status: "IDENTIFIED",
    commander: "Alex Vance (AI Sentinel)",
    durationMinutes: 85,
    rootCauseSummary: "Third-party HSM cert authority timeout triggering unhandled fallback retries.",
    impactedUsers: 3400,
    timeStarted: "1 hour 25 mins ago"
  },
  {
    id: "INC-2026-039",
    title: "Redis Cache Eviction Surge during Marketing Flash Campaign",
    severity: "SEV-3",
    service: "cache/redis-cluster-04",
    status: "RESOLVED",
    commander: "David Chen",
    durationMinutes: 42,
    rootCauseSummary: "Maxmemory limit hit; automatically expanded cluster node capacity to 64GB.",
    impactedUsers: 650,
    timeStarted: "5 hours ago"
  }
];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [selectedSev, setSelectedSev] = useState<string>("ALL");
  const [resolvedNotice, setResolvedNotice] = useState<string | null>(null);

  const handleResolve = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: "RESOLVED" } : inc))
    );
    setResolvedNotice(`Incident ${id} marked as RESOLVED. Post-mortem RCA document generated.`);
    setTimeout(() => setResolvedNotice(null), 4000);
  };

  const filteredIncidents = incidents.filter((inc) =>
    selectedSev === "ALL" ? true : inc.severity === selectedSev
  );

  return (
    <DashboardShell roleName="Sr. Dev" navItems={[]} hideHeader>
      <div className="flex flex-col h-full bg-[#111213] text-[#e8e8e8] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="w-full sticky top-0 bg-[#1a1b1d]/95 backdrop-blur-md z-10 border-b border-[#2b2c2e] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#eb5757] animate-ping" />
            <h1 className="text-[15px] font-medium text-[#e8e8e8]">Team Incident Command & Root-Cause Analysis</h1>
            <span className="text-xs text-[#858688] font-mono">
              ({incidents.filter((i) => i.status !== "RESOLVED").length} Active Outages)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#eb5757] text-white hover:bg-[#c93b40] transition-colors flex items-center gap-1">
              🚨 Declare New SEV-1 Incident
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="max-w-6xl w-full mx-auto px-8 py-6 space-y-6">
          {resolvedNotice && (
            <div className="p-3 rounded-lg bg-[#2ea043]/15 border border-[#2ea043]/40 text-[#2ea043] text-[13px]">
              ✓ {resolvedNotice}
            </div>
          )}

          {/* Incident Telemetry Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e]">
              <span className="text-[12px] text-[#858688] uppercase font-medium">Active SEV-1 Incident SLA</span>
              <div className="text-2xl font-bold text-[#eb5757] mt-1 font-mono">24m 12s</div>
              <span className="text-[11px] text-[#858688] mt-1 inline-block">MTTR Goal: &lt; 30 mins</span>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e]">
              <span className="text-[12px] text-[#858688] uppercase font-medium">System Availability (30d)</span>
              <div className="text-2xl font-bold text-[#2ea043] mt-1 font-mono">99.98%</div>
              <span className="text-[11px] text-[#2ea043] mt-1 inline-block">Within SLA Threshold</span>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e]">
              <span className="text-[12px] text-[#858688] uppercase font-medium">Impacted Users Currently</span>
              <div className="text-2xl font-bold text-[#f2c94c] mt-1 font-mono">17,600</div>
              <span className="text-[11px] text-[#858688] mt-1 inline-block">Traffic rerouted to secondary pods</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-[#1a1b1d] border border-[#2b2c2e] p-3 rounded-xl">
            <div className="flex items-center gap-2">
              {["ALL", "SEV-1", "SEV-2", "SEV-3"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSev(s)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                    selectedSev === s
                      ? "bg-[#5e6ad2] text-white"
                      : "bg-[#262729] text-[#858688] hover:text-[#e8e8e8]"
                  }`}
                >
                  {s === "ALL" ? "All Severity Levels" : s}
                </button>
              ))}
            </div>

            <span className="text-xs text-[#858688] font-mono">
              Showing {filteredIncidents.length} active telemetry logs
            </span>
          </div>

          {/* Incident Stream Cards */}
          <div className="space-y-4">
            {filteredIncidents.map((inc) => (
              <div
                key={inc.id}
                className={`p-5 rounded-xl border transition-all ${
                  inc.severity === "SEV-1" && inc.status !== "RESOLVED"
                    ? "bg-[#1a1b1d] border-[#eb5757]/40 shadow-[0_0_15px_rgba(235,87,87,0.1)]"
                    : "bg-[#141516] border-[#2b2c2e]"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          inc.severity === "SEV-1"
                            ? "bg-[#eb5757] text-white"
                            : inc.severity === "SEV-2"
                            ? "bg-[#f2c94c] text-black"
                            : "bg-[#262729] text-[#c4c5c7]"
                        }`}
                      >
                        {inc.severity}
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#5e6ad2]">{inc.id}</span>
                      <span className="text-[#858688] text-xs">·</span>
                      <span className="font-mono text-xs text-[#858688]">{inc.service}</span>
                      <span className="text-[#858688] text-xs">·</span>
                      <span className="text-xs text-[#858688]">{inc.timeStarted}</span>
                    </div>

                    <h2 className="text-[15px] font-semibold text-[#e8e8e8]">{inc.title}</h2>

                    <div className="p-3 rounded bg-[#111213] border border-[#2b2c2e]">
                      <span className="text-xs text-[#858688] font-mono block mb-1 uppercase">Root Cause Analysis (RCA):</span>
                      <p className="text-[13px] text-[#c4c5c7] leading-relaxed">{inc.rootCauseSummary}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#858688]">
                      <span>Incident Commander: <strong className="text-[#e8e8e8]">{inc.commander}</strong></span>
                      <span>Impacted Users: <strong className="text-[#eb5757]">{inc.impactedUsers.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {inc.status !== "RESOLVED" ? (
                      <button
                        onClick={() => handleResolve(inc.id)}
                        className="px-4 py-2 rounded-md text-xs font-semibold bg-[#2ea043] hover:bg-[#258537] text-white shadow-sm transition-colors flex items-center gap-1"
                      >
                        ✓ Resolve Incident
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded text-xs font-semibold bg-[#2ea043]/20 text-[#2ea043] border border-[#2ea043]/40 font-mono">
                        ✓ RESOLVED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
