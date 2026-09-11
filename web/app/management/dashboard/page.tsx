"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { AiReportDisplayCard } from "@/components/ai-report-card";
import { DEMO_REPORTS } from "@/lib/demo-data";
import { FinancialExposureBarChart, MinimalSparklineChart } from "@/components/charts/minimal-charts";
import Link from "next/link";
import { useState } from "react";

export default function ManagementDashboardPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(DEMO_REPORTS.management);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [approvedBudget, setApprovedBudget] = useState(false);

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
      setReportData(data.finding.ai_reports.management);
    } catch (err: any) {
      setErrorMsg(err?.message || "Generation error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardShell roleName="Management" navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#08090a] text-[#f7f8f8] overflow-y-auto">
        
        {/* Top Navigation Banner - Linear Minimal Palette */}
        <div className="flex flex-col px-8 pt-6 pb-4 border-b border-[#232529] shrink-0 bg-[#0c0d0e]/90 backdrop-blur z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#1e2025] border border-[#2b2d31] text-[#8a8f98] text-[11px] font-mono uppercase rounded">
                  Executive Management Desk
                </span>
                <span className="text-[12px] text-[#62666d]">· CISO Cyber Risk Economics War Room</span>
              </div>
              <h1 className="text-[18px] font-semibold text-[#f7f8f8] tracking-tight mt-1">
                CISO Cyber Risk Economics & Board Decision Brief
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
                    Generating CISO Briefing...
                  </>
                ) : (
                  "⚡ Run AI Executive Briefing"
                )}
              </button>
              <Link
                href="/management/escalations"
                className="px-3 py-1.5 bg-[#ff5555] hover:bg-[#e04444] text-[12.5px] font-medium text-[#ffffff] rounded-md transition-colors shadow-sm"
              >
                War Room Desk
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Stats Row */}
        <div className="px-8 py-5 grid grid-cols-4 gap-3.5">
          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Breach Loss Avoided</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#2ea043]">₹72,00,000</span>
              <MinimalSparklineChart data={[10, 25, 45, 60, 72]} color="#2ea043" />
            </div>
            <span className="text-[11px] text-[#2ea043] mt-2">Saved via 30-min containment</span>
          </div>

          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Expected Annual Loss (EAL)</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#ff5555]">₹38.4L</span>
              <span className="text-[11px] font-mono text-[#ff5555]">Unmitigated</span>
            </div>
            <span className="text-[11px] text-[#8a8f98] mt-2">Without CI/CD Supply Firewall</span>
          </div>

          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Return on Investment (ROSI)</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#828fff]">1,436%</span>
              <span className="text-[11px] text-[#828fff]">ROI</span>
            </div>
            <span className="text-[11px] text-[#2ea043] mt-2">₹35.9L Net Annual Savings</span>
          </div>

          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Active War Room Escalations</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#ff5555]">1</span>
              <span className="text-[11px] text-[#ff5555] font-mono">INC-2026-8891</span>
            </div>
            <span className="text-[11px] text-[#8a8f98] mt-2">Requires CISO Sign-off</span>
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
            <AiReportDisplayCard report={reportData} roleTitle="Executive Management" />
          </div>
        )}

        {/* FAIR Financial Loss Chart & Board Approval Desk */}
        <div className="px-8 pb-10 grid grid-cols-3 gap-5">
          
          {/* FAIR Financial Exposure Chart Card */}
          <div className="col-span-2">
            <FinancialExposureBarChart />
          </div>

          {/* CISO Board Approval & Links Panel */}
          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-[#f7f8f8] mb-3">
                CISO Board Decision Desk
              </h3>
              
              <div className="p-3 bg-[#121316] border border-[#232529] rounded mb-3">
                <span className="text-[10.5px] text-[#8a8f98] uppercase tracking-wider block font-semibold mb-1">
                  Budget Allocation Request
                </span>
                <p className="text-[12.5px] font-medium text-[#f7f8f8]">
                  Approve ₹2,50,000 for CI/CD Dependency Firewall
                </p>
                <p className="text-[11.5px] text-[#2ea043] mt-0.5">
                  Eliminates ₹38.4L in Expected Annual Loss
                </p>
                <button
                  onClick={() => setApprovedBudget(true)}
                  disabled={approvedBudget}
                  className={`w-full mt-2.5 py-1.5 text-[12px] font-semibold rounded transition-colors ${
                    approvedBudget
                      ? "bg-[#2ea043]/20 border border-[#2ea043]/40 text-[#2ea043]"
                      : "bg-[#f7f8f8] hover:bg-[#e0e0e0] text-[#0c0d0e]"
                  }`}
                >
                  {approvedBudget ? "✓ Approved by CISO" : "Approve ₹2.5L Budget Allocation"}
                </button>
              </div>

              <div className="space-y-2">
                <Link
                  href="/management/escalations"
                  className="block p-2.5 bg-[#121316] hover:bg-[#18191c] border border-[#232529] rounded text-[12.5px] text-[#f7f8f8] transition-colors"
                >
                  🚨 Active Escalation Desk
                </Link>
                <Link
                  href="/management/investment"
                  className="block p-2.5 bg-[#121316] hover:bg-[#18191c] border border-[#232529] rounded text-[12.5px] text-[#f7f8f8] transition-colors"
                >
                  💰 Business Impact & Security ROI Scorecard
                </Link>
              </div>
            </div>

            <div className="p-3 bg-[#121316] border border-[#232529] rounded text-[11.5px] text-[#8a8f98] mt-3">
              <strong className="text-[#f7f8f8]">CISO Summary:</strong> Incident #INC-2026-8891 contained with 0 customer data exfiltration. CI/CD security investment yields 1,436% ROSI.
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
