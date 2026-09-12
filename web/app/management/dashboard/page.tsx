"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { AiReportDisplayCard } from "@/components/ai-report-card";
import { DEMO_REPORTS } from "@/lib/demo-data";
import {
  FinancialExposureBarChart,
  MinimalSparklineChart,
  SemiCircleGaugeChart
} from "@/components/charts/minimal-charts";
import Link from "next/link";
import { useState } from "react";

export default function ManagementDashboardPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(DEMO_REPORTS.management);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [approvedBudget, setApprovedBudget] = useState(false);
  const [activeRange, setActiveRange] = useState("1W");

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
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error?.message || "Generation error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardShell roleName="Management" navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#08090a] text-[#f7f8f8] overflow-y-auto selection:bg-[#828fff]/30">
        
        {/* Top Navigation Banner - Glassmorphic Executive Header */}
        <div className="flex flex-col px-8 pt-6 pb-4 border-b border-[#232529] shrink-0 bg-[#0c0d0e]/90 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#1a1c22] border border-[#2b2d32] text-[#8a8f98] text-[11px] font-mono uppercase tracking-wider rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff5555] animate-pulse"></span>
                  Executive Management Desk
                </span>
                <span className="text-[12px] text-[#62666d]">· CISO Cyber Risk Economics War Room</span>
              </div>
              <h1 className="text-[20px] font-extrabold text-[#f7f8f8] tracking-tight mt-1">
                CISO Cyber Risk Economics & Board Decision Brief
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Pills */}
              <div className="hidden lg:flex items-center gap-1 bg-[#14161a] border border-[#232529] p-1 rounded-full">
                {["1D", "1W", "1M", "1Y", "ALL"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setActiveRange(r)}
                    className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-full transition-all ${
                      activeRange === r
                        ? "bg-[#282a30] text-[#f7f8f8] border border-[#383b42] shadow-sm"
                        : "text-[#8a8f98] hover:text-[#d0d6e0]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateAiReport}
                disabled={isGenerating}
                className="px-4 py-2 bg-[#1e2026] hover:bg-[#282a32] text-[12.5px] font-semibold text-[#f7f8f8] rounded-xl border border-[#2e3138] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Generating CISO Briefing...
                  </>
                ) : (
                  <>
                    <span className="text-[#828fff]">⚡</span> Run AI Executive Briefing
                  </>
                )}
              </button>

              <Link
                href="/management/escalations"
                className="px-4 py-2 bg-[#ff5555] hover:bg-[#e04444] text-[12.5px] font-bold text-[#ffffff] rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-[#ff5555]/20"
              >
                War Room Desk
              </Link>
            </div>
          </div>
        </div>

        {/* Top Metric Cards - Award-Winning Fintech Pill Layout */}
        <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Neon Highlight Card (Breach Loss Avoided) */}
          <div className="bg-gradient-to-br from-[#0f1f14] to-[#0c0d0e] border border-[#2ea043]/40 hover:border-[#2ea043]/80 transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-[#2ea043]/5 group">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#2ea043]">Breach Loss Avoided</span>
              <span className="px-2 py-0.5 text-[10.5px] font-bold font-mono text-[#2ea043] bg-[#2ea043]/10 rounded-full border border-[#2ea043]/30 flex items-center gap-1">
                <span>▲</span> 45.2%
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[32px] font-extrabold text-[#f7f8f8] tracking-tight group-hover:scale-105 transition-transform block">
                ₹72,00,000
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#2ea043] mt-2.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ea043]"></span> Saved via 30-min automated containment
            </span>
          </div>

          {/* Card 2: Expected Annual Loss (EAL) */}
          <div className="bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#8a8f98]">Expected Annual Loss (EAL)</span>
              <span className="px-2 py-0.5 text-[10.5px] font-bold font-mono text-[#ff5555] bg-[#ff5555]/10 rounded-full border border-[#ff5555]/30">
                Unmitigated
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[32px] font-extrabold text-[#ff5555] tracking-tight block">
                ₹38.4L
              </span>
            </div>
            <span className="text-[11px] text-[#8a8f98] font-medium mt-2.5 truncate">
              Without CI/CD Supply Chain Firewall
            </span>
          </div>

          {/* Card 3: Return on Security Investment (ROSI) */}
          <div className="bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#8a8f98]">Return on Investment (ROSI)</span>
              <span className="px-2 py-0.5 text-[10.5px] font-bold text-[#828fff] bg-[#828fff]/10 rounded-full border border-[#828fff]/30">
                1,436% ROI
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[32px] font-extrabold text-[#828fff] tracking-tight block">
                1,436%
              </span>
            </div>
            <span className="text-[11px] text-[#2ea043] font-semibold mt-2.5">
              ₹35.9L Net Annual Savings
            </span>
          </div>

          {/* Card 4: War Room Escalations */}
          <div className="bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#8a8f98]">Active Escalations</span>
              <span className="px-2 py-0.5 text-[10.5px] font-mono font-bold text-[#ff5555] bg-[#ff5555]/10 rounded-full border border-[#ff5555]/30">
                INC-2026-8891
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[32px] font-extrabold text-[#ff5555] tracking-tight block">
                1
              </span>
            </div>
            <span className="text-[11px] text-[#ff5555] font-medium mt-2.5">
              Requires CISO Executive Sign-off
            </span>
          </div>

        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-8 mb-4 p-4 bg-[#1e1416] border border-[#ff5555]/40 rounded-xl text-[#ff5555] text-[12.5px] shadow-lg">
            <strong>AI Generation Error:</strong> {errorMsg}
          </div>
        )}

        {/* Live AI Executive Briefing Card */}
        {reportData && (
          <div className="px-8 mb-6">
            <AiReportDisplayCard report={reportData} roleTitle="Executive Management" />
          </div>
        )}

        {/* FAIR Financial Loss Chart & Semi-Circle Risk Gauge & CISO Decision Desk */}
        <div className="px-8 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Interactive Semi-Circle Risk Gauge */}
          <div className="lg:col-span-1">
            <SemiCircleGaugeChart
              value={82}
              max={100}
              title="CISO Executive Cyber Risk Index"
              statusLabel="CRITICAL FINANCIAL RISK"
              history={[
                { label: "Prev Quarter", score: 78 },
                { label: "30-Day Avg", score: 62 },
                { label: "Target", score: 25 }
              ]}
            />
          </div>

          {/* FAIR Financial Exposure Chart Card */}
          <div className="lg:col-span-2">
            <FinancialExposureBarChart />
          </div>

        </div>

        {/* CISO Board Decision Desk & Shortcuts Row */}
        <div className="px-8 pb-12">
          <div className="bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-300 rounded-2xl p-6 shadow-xl grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            <div className="lg:col-span-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#828fff]/10 border border-[#828fff]/30 text-[#828fff] text-[11px] font-mono font-bold uppercase rounded-full">
                  CISO Board Approval Desk
                </span>
                <span className="text-[12px] text-[#8a8f98]">· 0-1 Knapsack MILP Optimized Action</span>
              </div>
              <h3 className="text-[16px] font-bold text-[#f7f8f8] tracking-tight">
                Approve ₹2,50,000 Security Investment for CI/CD Supply Chain Firewall
              </h3>
              <p className="text-[12.5px] text-[#8a8f98] leading-relaxed">
                Implementing automated AST dependency scanning and branch protection policy eliminates <strong className="text-[#2ea043]">₹38.4L in Expected Annual Loss (EAL)</strong> with 1,436% Return on Security Investment.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => setApprovedBudget(true)}
                disabled={approvedBudget}
                className={`w-full py-3 text-[13px] font-bold rounded-xl transition-all duration-300 shadow-md ${
                  approvedBudget
                    ? "bg-[#2ea043]/20 border border-[#2ea043]/50 text-[#2ea043] shadow-[#2ea043]/10"
                    : "bg-[#f7f8f8] hover:bg-[#e0e0e0] text-[#0c0d0e] hover:shadow-xl cursor-pointer"
                }`}
              >
                {approvedBudget ? "✓ Approved & Funded by CISO" : "Approve ₹2.5L Budget Allocation"}
              </button>

              <div className="flex items-center gap-3">
                <Link
                  href="/management/escalations"
                  className="flex-1 py-2 text-center bg-[#14161a] hover:bg-[#1c1e24] border border-[#232529] rounded-xl text-[12px] font-semibold text-[#f7f8f8] transition-colors"
                >
                  🚨 Active Escalations
                </Link>
                <Link
                  href="/management/investment"
                  className="flex-1 py-2 text-center bg-[#14161a] hover:bg-[#1c1e24] border border-[#232529] rounded-xl text-[12px] font-semibold text-[#828fff] transition-colors"
                >
                  💰 ROI Scorecard
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardShell>
  );
}

