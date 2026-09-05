"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { AiReportDisplayCard } from "@/components/ai-report-card";
import Link from "next/link";
import { useState } from "react";

export default function ManagementDashboardPage() {
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
          title: "Critical Attack Surface Finding: PostgreSQL Listener & Exposed SMB",
          severity: "high",
          category: "attack_surface_scanner"
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate AI report");
      }
      setLiveReport(data.finding.ai_reports.management);
    } catch (err: any) {
      setErrorMsg(err?.message || "Generation error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardShell roleName="Management" navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#111213] text-[#e8e8e8] overflow-y-auto">
        <div className="flex flex-col px-8 pt-6 pb-4 border-b border-[#2b2c2e] shrink-0 bg-[#111213] z-10">
          <div className="flex items-center justify-between">
             <div>
               <h1 className="text-[20px] font-semibold text-[#fff] tracking-tight">Executive Management & CISO War Room</h1>
               <p className="text-[13px] text-[#858688] mt-1">Enterprise Risk Scorecard · Crisis Escalations · Compliance & ROI</p>
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
                      Generating CISO Briefing...
                    </>
                  ) : (
                    "⚡ Test Live AI Executive Briefing"
                  )}
               </button>
               <Link href="/management/escalations" className="px-3.5 py-1.5 bg-[#ff5555] hover:bg-[#e04444] text-[13px] font-medium text-[#fff] rounded-md transition-colors shadow-sm">
                 War Room Desk
               </Link>
             </div>
          </div>
        </div>

        <div className="px-8 py-6 grid grid-cols-4 gap-4">
          <div className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[12px] font-medium text-[#858688]">Enterprise Cyber Posture</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-[28px] font-semibold text-[#2ea043]">A+</span>
              <span className="text-[12px] text-[#858688]">Low Exposure</span>
            </div>
            <span className="text-[11px] text-[#2ea043] mt-2">Zero unmitigated criticals</span>
          </div>
          <div className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[12px] font-medium text-[#858688]">Active Escalations</span>
            <span className="text-[28px] font-semibold text-[#ff5555] mt-2">1</span>
            <span className="text-[11px] text-[#ff5555] mt-2">Requires CISO approval</span>
          </div>
          <div className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[12px] font-medium text-[#858688]">SOC 2 & ISO 27001 Readiness</span>
            <span className="text-[28px] font-semibold text-[#2ea043] mt-2">96%</span>
            <span className="text-[11px] text-[#2ea043] mt-2">Audit ready</span>
          </div>
          <div className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[12px] font-medium text-[#858688]">Security Tooling ROI</span>
            <span className="text-[28px] font-semibold text-[#fff] mt-2">4.2x</span>
            <span className="text-[11px] text-[#2ea043] mt-2">Risk reduction efficiency</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-8 mb-6 p-4 bg-[#ff5555]/10 border border-[#ff5555]/30 rounded-xl text-[#ff5555] text-[13px]">
            <strong>AI Generation Error:</strong> {errorMsg}
          </div>
        )}

        {liveReport && (
          <AiReportDisplayCard report={liveReport} roleTitle="Executive Management" />
        )}

        <div className="px-8 pb-12 grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-5 flex flex-col">
            <h3 className="text-[15px] font-semibold text-[#fff] mb-4">Executive Briefing & Strategic Alerts</h3>
            <div className="space-y-3">
              <div className="p-3.5 bg-[#111213] border border-[#262729] rounded-lg flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-[#ff5555]/10 text-[#ff5555] text-[11px] font-medium rounded border border-[#ff5555]/20">CRISIS</span>
                    <h4 className="text-[13.5px] font-medium text-[#fff]">PostgreSQL Port Listener Finding Escalated</h4>
                  </div>
                  <p className="text-[12px] text-[#858688]">Impact: Internal Database binding on 192.168.31.204</p>
                </div>
                <Link href="/management/escalations" className="text-[12px] text-[#ff5555] hover:underline font-medium">Review →</Link>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-5 flex flex-col">
            <h3 className="text-[15px] font-semibold text-[#fff] mb-4">Management Controls</h3>
            <div className="space-y-2">
              <Link href="/management/escalations" className="block p-3 bg-[#262729] hover:bg-[#323438] rounded-lg text-[13px] text-[#e8e8e8]">Escalation Desk</Link>
              <Link href="/management/investment" className="block p-3 bg-[#262729] hover:bg-[#323438] rounded-lg text-[13px] text-[#e8e8e8]">Business Impact & ROI</Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
