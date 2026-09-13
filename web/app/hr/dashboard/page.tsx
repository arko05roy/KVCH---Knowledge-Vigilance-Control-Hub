"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { AiReportDisplayCard } from "@/components/ai-report-card";
import { DEMO_REPORTS } from "@/lib/demo-data";
import {
  ComplianceFrameworkChart,
  MinimalSparklineChart,
  SemiCircleGaugeChart
} from "@/components/charts/minimal-charts";
import { PolicyViolationHeatmapChart } from "@/components/charts/dashboard-charts";
import { HrEscalationQueue } from "@/components/hr-escalation-queue";
import { SandboxRunBanner } from "@/components/sandbox-run-banner";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

export default function HrDashboardPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(DEMO_REPORTS.hr);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeRange, setActiveRange] = useState("1W");
  const [remediationEnforced, setRemediationEnforced] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  useEffect(() => {
    setReportData((prev: any) => ({
      ...prev,
      generatedAt: new Date().toISOString(),
    }));
  }, []);

  // 10-Second Auto-Stream State
  const [autoRun, setAutoRun] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [pulseCount, setPulseCount] = useState(0);

  // Range scaling map for HR policy compliance metrics
  const RANGE_METRICS: Record<string, { compliance: string; deficiencies: number; auditor: string }> = {
    "1D": { compliance: "92.1%", deficiencies: 1, auditor: "Automated Bot Scan" },
    "1W": { compliance: "78.4%", deficiencies: 4, auditor: "ISO 27001 Deficient" },
    "1M": { compliance: "84.5%", deficiencies: 8, auditor: "SEBI CSCRF Quarterly" },
    "1Y": { compliance: "91.0%", deficiencies: 12, auditor: "Annual Risk Audit" },
    "ALL": { compliance: "88.7%", deficiencies: 15, auditor: "Historical Baseline" },
  };

  const currentMetrics = RANGE_METRICS[activeRange] || RANGE_METRICS["1W"];

  const handleEnforceBaseline = () => {
    setRemediationEnforced((prev) => {
      const next = !prev;
      setStatusNotice(next
        ? "✓ Personnel Policy Enforced: ISO 27001 workstation security baseline applied to all committer profiles."
        : "Policy enforcement reset to default baseline.");
      return next;
    });
  };

  const handleGenerateAiReport = useCallback(async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];

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
      setPulseCount((prev) => prev + 1);
      setStatusNotice(`⚡ [${timeStr}] Sovereign Ollama AI: HR Audit Report Auto-Synthesized (Pulse #${pulseCount + 1})`);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error?.message || "Generation error");
    } finally {
      setIsGenerating(false);
      setCountdown(10);
    }
  }, [pulseCount]);

  // 10-Second Continuous Polling Loop
  useEffect(() => {
    if (!autoRun) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleGenerateAiReport();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRun, handleGenerateAiReport]);

  return (
    <DashboardShell roleName="HR" navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#08090a] text-[#f7f8f8] overflow-y-auto selection:bg-[#828fff]/30">

        {/* Top Navigation Banner - Glassmorphic Header */}
        <div className="flex flex-col px-8 pt-6 pb-4 border-b border-[#232529] shrink-0 bg-[#0c0d0e]/90 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#1a1c22] border border-[#2b2d32] text-[#8a8f98] text-[11px] font-mono uppercase tracking-wider rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2ea043] animate-pulse"></span>
                  HR & Personnel Governance
                </span>
                <span className="text-[12px] text-[#62666d]">· Insider Risk & Audit Control Desk</span>
              </div>
              <h1 className="text-[20px] font-extrabold text-[#f7f8f8] tracking-tight mt-1">
                Personnel Governance & Regulatory Audit Center
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Pills */}
              <div className="hidden lg:flex items-center gap-1 bg-[#14161a] border border-[#232529] p-1 rounded-full">
                {["1D", "1W", "1M", "1Y", "ALL"].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setActiveRange(r);
                      setStatusNotice(`HR Audit timeline switched to ${r}. Compliance score updated.`);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-full transition-all active:scale-95 ${activeRange === r
                        ? "bg-[#282a30] text-[#f7f8f8] border border-[#383b42] shadow-sm"
                        : "text-[#8a8f98] hover:text-[#d0d6e0]"
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <button
                onClick={handleEnforceBaseline}
                className={`px-4 py-2 text-[12.5px] font-bold rounded-xl transition-all shadow-md hover-lift active:scale-95 ${remediationEnforced ? "bg-[#2ea043] text-white" : "bg-[#f7f8f8] text-[#0c0d0e] hover:bg-[#e0e0e0]"
                  }`}
              >
                {remediationEnforced ? "✓ Baseline Enforced" : "Enforce Policy Baseline"}
              </button>
            </div>
          </div>
        </div>

        {/* Live 120-Minute Sandbox Attack Run Banner */}
        <SandboxRunBanner
          role="hr"
          roleTitle="HR & Compliance"
          reportMarkdownFile="hr_report.md"
          reportJsonFile="hr_report.json"
        />

        {/* Live Status Toast Banner */}
        {statusNotice && (
          <div className="mx-8 mt-4 p-3 bg-[#121f17] border border-[#2ea043]/40 rounded-lg text-[#2ea043] text-[12.5px] flex items-center justify-between animate-fadeIn">
            <span>{statusNotice}</span>
            <button onClick={() => setStatusNotice(null)} className="text-[#8a8f98] hover:text-[#f7f8f8] text-xs">✕</button>
          </div>
        )}

        {/* Top Metric Cards - Award-Winning Fintech Pill Layout */}
        <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Card 1: Neon Highlight Card */}
          <div className="bg-gradient-to-br from-[#1a1810] to-[#0c0d0e] border border-[#f2c94c]/40 hover:border-[#f2c94c]/80 transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-[#f2c94c]/5 group hover-lift cursor-default">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#f2c94c]">Policy Compliance ({activeRange})</span>
              <span className="px-2 py-0.5 text-[10.5px] font-bold font-mono text-[#f2c94c] bg-[#f2c94c]/10 rounded-full border border-[#f2c94c]/30 flex items-center gap-1">
                <span>▲</span> {remediationEnforced ? "98.6%" : currentMetrics.compliance}
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[32px] font-extrabold text-[#f7f8f8] tracking-tight group-hover:scale-105 transition-transform block">
                {remediationEnforced ? "98.6%" : currentMetrics.compliance}
              </span>
            </div>
            <span className={`text-[11px] font-medium mt-2.5 flex items-center gap-1 ${remediationEnforced ? "text-[#2ea043]" : "text-[#ff5555]"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${remediationEnforced ? "bg-[#2ea043]" : "bg-[#ff5555]"}`}></span>
              {remediationEnforced ? "ISO 27001 Audit Passed & Baseline Applied" : currentMetrics.auditor}
            </span>
          </div>

          {/* Card 2: Committer Accountability */}
          <div className="bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between shadow-xl hover-lift cursor-default">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#8a8f98]">Committer Accountability</span>
              <span className="px-2 py-0.5 text-[10.5px] font-mono font-semibold text-[#828fff] bg-[#828fff]/10 rounded-full border border-[#828fff]/20">
                Rohit D.
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[30px] font-extrabold text-[#f7f8f8] tracking-tight font-mono block">
                EMP-4029
              </span>
            </div>
            <span className="text-[11px] text-[#8a8f98] font-mono mt-2.5 truncate">
              Git Commit: <code className="text-[#828fff]">7a8f9c1b</code> (PR #4)
            </span>
          </div>

          {/* Card 3: Active Deficiencies */}
          <div className="bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between shadow-xl hover-lift cursor-default">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#8a8f98]">Policy Deficiencies</span>
              <span className="px-2 py-0.5 text-[10.5px] font-bold text-[#ff5555] bg-[#ff5555]/10 rounded-full border border-[#ff5555]/30">
                3 Critical
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[32px] font-extrabold text-[#ff5555] tracking-tight block">
                3
              </span>
            </div>
            <span className="text-[11px] text-[#ff5555] font-medium mt-2.5 truncate">
              EP-SEC-09 Lockfile Breach Active
            </span>
          </div>

          {/* Card 4: Training Completion Rate */}
          <div className="bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-300 rounded-2xl p-5 flex flex-col justify-between shadow-xl hover-lift cursor-default">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#8a8f98]">Security Training Status</span>
              <span className="px-2 py-0.5 text-[10.5px] font-bold text-[#2ea043] bg-[#2ea043]/10 rounded-full border border-[#2ea043]/30">
                97.9%
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[32px] font-extrabold text-[#2ea043] tracking-tight block">
                142<span className="text-[18px] text-[#8a8f98] font-normal">/145</span>
              </span>
            </div>
            <span className="text-[11px] text-[#8a8f98] mt-2.5">
              Web Engineering Team audit due
            </span>
          </div>

        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-8 mb-4 p-4 bg-[#1e1416] border border-[#ff5555]/40 rounded-xl text-[#ff5555] text-[12.5px] shadow-lg animate-fadeIn">
            <strong>AI Generation Error:</strong> {errorMsg}
          </div>
        )}

        {/* Live AI Report Card */}
        {reportData && (
          <div className="px-8 mb-6 animate-fadeIn">
            <AiReportDisplayCard report={reportData} roleTitle="HR & Compliance" />
          </div>
        )}

        {/* Engineering Escalation & Disciplinary Review Queue (Live from Senior Dev) */}
        <div className="px-8 mb-6 animate-fadeIn">
          <HrEscalationQueue />
        </div>

        {/* Interactive Policy Violation Activity Heatmap Chart */}
        <div className="px-8 mb-6 animate-fadeIn">
          <PolicyViolationHeatmapChart />
        </div>

        {/* Main Interactive Grid: Semi-Circle Gauge + Attribution Matrix + HR Shortcuts */}
        <div className="px-8 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Interactive Semi-Circle Risk & Compliance Gauge */}
          <div className="lg:col-span-1 hover-lift">
            <SemiCircleGaugeChart
              value={68}
              max={100}
              title="Insider Risk & Audit Index"
              statusLabel="HIGH RISK EXPOSURE"
              history={[
                { label: "Prev Audit", score: 70 },
                { label: "30-Day Avg", score: 50 },
                { label: "Target", score: 20 }
              ]}
            />
          </div>

          {/* Committer Attribution Matrix Card */}
          <div className="lg:col-span-2 bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-300 rounded-2xl p-5 flex flex-col space-y-4 shadow-xl hover-lift">
            <div className="flex items-center justify-between border-b border-[#1e2024] pb-3">
              <div>
                <h3 className="text-[15px] font-bold text-[#f7f8f8] tracking-tight">
                  Code Attribution & Employee Governance Matrix (#INC-2026-8891)
                </h3>
                <p className="text-[11.5px] text-[#8a8f98] mt-0.5">
                  Automated Git author verification and 2-person security review check
                </p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-bold text-[#ff5555] bg-[#ff5555]/10 border border-[#ff5555]/30 rounded-full font-mono">
                Unreviewed PR Merge
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[12.5px]">
              <div className="bg-[#121316] border border-[#232529] hover:border-[#2f3238] transition-colors p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] text-[#8a8f98] uppercase tracking-wider font-semibold block">Employee Profile</span>
                <p className="font-bold text-[#f7f8f8] text-[13.5px]">Rohit Debnath (Senior Frontend Engineer)</p>
                <p className="text-[11.5px] text-[#8a8f98]">ID: <span className="font-mono text-[#f7f8f8]">EMP-4029</span> · Team: Core Product Web</p>
                <div className="pt-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff5555]"></span>
                  <span className="text-[11px] text-[#ff5555] font-medium">Access Scope Suspended</span>
                </div>
              </div>

              <div className="bg-[#121316] border border-[#232529] hover:border-[#2f3238] transition-colors p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] text-[#8a8f98] uppercase tracking-wider font-semibold block">Git Commit & PR Origin</span>
                <p className="font-bold text-[#f7f8f8] text-[13.5px]">PR #4 (arko05roy/rohit/threat-extensions)</p>
                <p className="text-[11.5px] text-[#8a8f98]">Commit Hash: <code className="text-[#828fff] bg-[#828fff]/10 px-1.5 py-0.5 rounded font-mono">7a8f9c1b3d2e1f4a</code></p>
                <div className="pt-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f2c94c]"></span>
                  <span className="text-[11px] text-[#f2c94c] font-medium">Bypassed Mandatory Review</span>
                </div>
              </div>
            </div>

            {/* Compliance Radar / Progress Meters */}
            <ComplianceFrameworkChart />
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}

