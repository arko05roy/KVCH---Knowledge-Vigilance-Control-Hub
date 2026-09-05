"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { AiReportDisplayCard } from "@/components/ai-report-card";
import Link from "next/link";
import { useState } from "react";

export default function SrDevDashboardPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [liveReport, setLiveReport] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateAiReport = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/demo/seed-finding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Discovered Open PostgreSQL Port 5432 & Unencrypted Socket Listener",
          severity: "high",
          category: "attack_surface_scan"
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate AI report");
      }
      setLiveReport(data.finding.ai_reports.srDev);
    } catch (err: any) {
      setErrorMsg(err?.message || "Generation error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardShell roleName="Sr. Dev" navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#111213] text-[#e8e8e8] overflow-y-auto">
        
        {/* Header Banner */}
        <div className="flex flex-col px-8 pt-6 pb-4 border-b border-[#2b2c2e] shrink-0 bg-[#111213] z-10">
          <div className="flex items-center justify-between">
             <div>
               <h1 className="text-[20px] font-semibold text-[#fff] tracking-tight">Senior Developer Security Operations</h1>
               <p className="text-[13px] text-[#858688] mt-1">KVCH Central Control Plane · Real-Time Threat & Extension Engine</p>
             </div>
             <div className="flex items-center gap-3">
                <button 
                  onClick={handleGenerateAiReport}
                  disabled={isGenerating}
                  className="px-3.5 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-[13px] font-medium text-[#fff] rounded-md transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Generating AI Report (Groq Pool)...
                    </>
                  ) : (
                    "⚡ Test Live AI Report Generation"
                  )}
                </button>
                <Link href="/extensions" className="px-3.5 py-1.5 bg-[#fff] hover:bg-[#e0e0e0] text-[13px] font-medium text-[#111213] rounded-md transition-colors shadow-sm">
                  + Upload Extension
                </Link>
             </div>
          </div>
        </div>

        {/* Overview Stats Row */}
        <div className="px-8 py-6 grid grid-cols-4 gap-4">
          <div className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[12px] font-medium text-[#858688]">Security Posture Score</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[28px] font-semibold text-[#2ea043]">94</span>
              <span className="text-[12px] text-[#858688]">/ 100 (Optimal)</span>
            </div>
            <span className="text-[11px] text-[#2ea043] mt-2 flex items-center gap-1">↑ +2.4% from last week</span>
          </div>

          <div className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[12px] font-medium text-[#858688]">Active Threat Extensions</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[28px] font-semibold text-[#fff]">5</span>
              <span className="text-[12px] text-[#858688]">Scheduled</span>
            </div>
            <span className="text-[11px] text-[#858688] mt-2">Next scan in 14m</span>
          </div>

          <div className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[12px] font-medium text-[#858688]">Groq Key Pool Status</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[28px] font-semibold text-[#2ea043]">4/4</span>
              <span className="text-[12px] text-[#858688]">Active Keys</span>
            </div>
            <span className="text-[11px] text-[#2ea043] mt-2">Round-Robin Fallback Enabled</span>
          </div>

          <div className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[12px] font-medium text-[#858688]">Open Incidents</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[28px] font-semibold text-[#ff5555]">1</span>
              <span className="text-[12px] text-[#858688]">High Severity</span>
            </div>
            <span className="text-[11px] text-[#ff5555] mt-2">Port 5432 Listener</span>
          </div>
        </div>

        {/* Live AI Generated Report Modal / Display Box */}
        {errorMsg && (
          <div className="mx-8 mb-6 p-4 bg-[#ff5555]/10 border border-[#ff5555]/30 rounded-xl text-[#ff5555] text-[13px]">
            <strong>AI Generation Error:</strong> {errorMsg}
          </div>
        )}

        {liveReport && (
          <AiReportDisplayCard report={liveReport} roleTitle="Senior Developer" />
        )}

        {/* Main Grid Section */}
        <div className="px-8 pb-12 grid grid-cols-3 gap-6">
          
          {/* Recent Findings Stream */}
          <div className="col-span-2 bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#fff]">Live Security Finding Envelopes (`kvch.finding/v1`)</h3>
              <span className="text-[12px] text-[#858688]">Updated 2m ago</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-[#111213] border border-[#262729] rounded-lg flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-[#ff5555]/10 text-[#ff5555] text-[11px] font-medium rounded border border-[#ff5555]/20">HIGH</span>
                    <span className="text-[13.5px] font-medium text-[#fff]">Discovered 2 open listening ports on host MacBook-Air.lan</span>
                  </div>
                  <p className="text-[12.5px] text-[#858688]">Extension: <code className="text-[#c4c5c7]">attack-surface-scanner</code> · Observed on 192.168.31.204</p>
                </div>
                <Link href="/sr-dev/incidents" className="text-[12px] text-[#858688] hover:text-[#fff] transition-colors">Details →</Link>
              </div>

              <div className="p-3.5 bg-[#111213] border border-[#262729] rounded-lg flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-[#2ea043]/10 text-[#2ea043] text-[11px] font-medium rounded border border-[#2ea043]/20">INFO</span>
                    <span className="text-[13.5px] font-medium text-[#fff]">WireGuard VPN interface audit passed cipher suite validation</span>
                  </div>
                  <p className="text-[12.5px] text-[#858688]">Extension: <code className="text-[#c4c5c7]">vpn-crypto-analyzer</code> · Interface utun3</p>
                </div>
                <span className="text-[12px] text-[#858688]">Passed</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-5 flex flex-col">
            <h3 className="text-[15px] font-semibold text-[#fff] mb-4">Quick Developer Actions</h3>
            <div className="space-y-2.5">
              <button 
                onClick={handleGenerateAiReport}
                disabled={isGenerating}
                className="w-full p-3 bg-[#2563eb]/20 hover:bg-[#2563eb]/30 rounded-lg text-left transition-colors flex items-center justify-between text-[13px] text-[#93c5fd] border border-[#2563eb]/40"
              >
                <span>Trigger Groq AI Report</span>
                <span className="text-[11px]">Key Pool Active</span>
              </button>

              <Link href="/sr-dev/approvals" className="w-full p-3 bg-[#262729] hover:bg-[#323438] rounded-lg text-left transition-colors flex items-center justify-between text-[13px] text-[#e8e8e8] border border-[#3b3c3e]">
                <span>Review Patch Approvals</span>
                <span className="text-[#858688]">3 pending</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
