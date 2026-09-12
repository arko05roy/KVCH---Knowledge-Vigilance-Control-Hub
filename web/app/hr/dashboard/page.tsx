"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { AiReportDisplayCard } from "@/components/ai-report-card";
import { DEMO_REPORTS } from "@/lib/demo-data";
import { ComplianceFrameworkChart, MinimalSparklineChart } from "@/components/charts/minimal-charts";
import Link from "next/link";
import { useState } from "react";

export default function HrDashboardPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<unknown>(DEMO_REPORTS.hr);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateAiReport = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/demo/seed-finding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Unapproved External File Transfer & VPN Interface Breach",
          severity: "high",
          category: "vpn_crypto_analyzer"
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate AI report");
      }
      setReportData(data.finding.ai_reports.hr);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error?.message || "Generation error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardShell roleName="HR" navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#08090a] text-[#f7f8f8] overflow-y-auto">
        
        {/* Top Navigation Banner - Linear Minimal Palette */}
        <div className="flex flex-col px-8 pt-6 pb-4 border-b border-[#232529] shrink-0 bg-[#0c0d0e]/90 backdrop-blur z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#1e2025] border border-[#2b2d31] text-[#8a8f98] text-[11px] font-mono uppercase rounded">
                  HR & Compliance Governance
                </span>
                <span className="text-[12px] text-[#62666d]">· Insider Risk & Regulatory Audit</span>
              </div>
              <h1 className="text-[18px] font-semibold text-[#f7f8f8] tracking-tight mt-1">
                HR Access Governance & Regulatory Audit Center
              </h1>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleGenerateAiReport}
                disabled={isGenerating}
                className="px-3 py-1.5 bg-[#1e2025] hover:bg-[#282a30] text-[12.5px] font-medium text-[#f7f8f8] rounded-md border border-[#2b2d31] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Running Audit...
                  </>
                ) : (
                  "⚡ Run AI Compliance Audit"
                )}
              </button>
              <Link
                href="/hr/policies"
                className="px-3 py-1.5 bg-[#f7f8f8] hover:bg-[#e0e0e0] text-[12.5px] font-medium text-[#0c0d0e] rounded-md transition-colors"
              >
                Manage Policies
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Stats Row */}
        <div className="px-8 py-5 grid grid-cols-4 gap-3.5">
          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Policy Compliance Rate</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#f2c94c]">78.4%</span>
              <MinimalSparklineChart data={[95, 92, 88, 84, 80, 78]} color="#f2c94c" />
            </div>
            <span className="text-[11px] text-[#ff5555] mt-2">ISO 27001 Audit Deficient</span>
          </div>

          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Committer Accountability</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#f7f8f8]">EMP-4029</span>
              <span className="text-[11px] font-mono text-[#828fff]">Rohit D.</span>
            </div>
            <span className="text-[11px] text-[#8a8f98] mt-2">Git Commit 7a8f9c1b (PR #4)</span>
          </div>

          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Policy Deficiencies</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#ff5555]">3</span>
              <span className="text-[11px] text-[#ff5555]">Critical</span>
            </div>
            <span className="text-[11px] text-[#ff5555] mt-2">EP-SEC-09 Lockfile Breach</span>
          </div>

          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Security Training Status</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#2ea043]">142/145</span>
              <span className="text-[11px] text-[#2ea043]">97.9%</span>
            </div>
            <span className="text-[11px] text-[#8a8f98] mt-2">Web Engineering Team due</span>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-8 mb-4 p-3 bg-[#1e1416] border border-[#3c1e22] rounded-lg text-[#ff5555] text-[12.5px]">
            <strong>AI Generation Error:</strong> {errorMsg}
          </div>
        )}

        {/* Preloaded / Live AI Report Card */}
        {reportData && (
          <div className="px-8 mb-6">
            <AiReportDisplayCard report={reportData} roleTitle="HR & Compliance" />
          </div>
        )}

        {/* HR Attribution Matrix & Regulatory Radar Charts */}
        <div className="px-8 pb-10 grid grid-cols-3 gap-5">
          
          {/* Committer Attribution Matrix Card */}
          <div className="col-span-2 bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#232529] pb-3">
              <h3 className="text-[14px] font-semibold text-[#f7f8f8]">
                Code Attribution & Employee Accountability Matrix (#INC-2026-8891)
              </h3>
              <span className="text-[11px] text-[#ff5555] font-mono">Unreviewed PR Merge</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[12.5px]">
              <div className="bg-[#121316] border border-[#232529] p-3 rounded space-y-1">
                <span className="text-[10.5px] text-[#8a8f98] uppercase tracking-wider block">Employee Profile</span>
                <p className="font-semibold text-[#f7f8f8]">Rohit Debnath (Senior Frontend Engineer)</p>
                <p className="text-[11.5px] text-[#8a8f98]">ID: EMP-4029 · Department: Core Product Web</p>
              </div>

              <div className="bg-[#121316] border border-[#232529] p-3 rounded space-y-1">
                <span className="text-[10.5px] text-[#8a8f98] uppercase tracking-wider block">Git Commit & PR Origin</span>
                <p className="font-semibold text-[#f7f8f8]">PR #4 (arko05roy/rohit/threat-extensions)</p>
                <p className="text-[11.5px] text-[#8a8f98]">Commit: <code className="text-[#828fff]">7a8f9c1b3d2e1f4a</code></p>
              </div>
            </div>

            {/* Compliance Radar Chart Component */}
            <ComplianceFrameworkChart />
          </div>

          {/* HR Quick Actions & Policy Shortcuts */}
          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-[#f7f8f8] mb-3">
                HR Compliance Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/hr/policies"
                  className="block p-2.5 bg-[#121316] hover:bg-[#18191c] border border-[#232529] rounded text-[12.5px] text-[#f7f8f8] transition-colors"
                >
                  📜 Enforce GPG Commit Signing Policy
                </Link>
                <Link
                  href="/hr/patterns"
                  className="block p-2.5 bg-[#121316] hover:bg-[#18191c] border border-[#232529] rounded text-[12.5px] text-[#f7f8f8] transition-colors"
                >
                  🔍 Insider Anomaly Pattern Analysis
                </Link>
                <Link
                  href="/hr/pulse"
                  className="block p-2.5 bg-[#121316] hover:bg-[#18191c] border border-[#232529] rounded text-[12.5px] text-[#f7f8f8] transition-colors"
                >
                  📊 Engineering Security Culture Pulse
                </Link>
              </div>
            </div>

            <div className="p-3 bg-[#121316] border border-[#232529] rounded text-[11.5px] text-[#8a8f98] mt-3">
              <strong className="text-[#f7f8f8]">Governance Note:</strong> Policy EP-SEC-09 requires 2-person security review on all package.json updates.
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
