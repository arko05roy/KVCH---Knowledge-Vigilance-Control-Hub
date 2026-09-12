"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { AiReportDisplayCard } from "@/components/ai-report-card";
import { DEMO_REPORTS } from "@/lib/demo-data";
import { MinimalSparklineChart } from "@/components/charts/minimal-charts";
import { TelemetryLogStream } from "@/components/telemetry-log-stream";
import Link from "next/link";
import { useState } from "react";

export default function InternDashboardPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(DEMO_REPORTS.intern);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Interactive Checklist State
  const [checklist, setChecklist] = useState({
    processCheck: true,
    socketMatch: true,
    hashQuery: false,
    lockfileAudit: false,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerateAiReport = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/demo/seed-finding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Verify Unencrypted Local Socket Listener & WHOIS Anomaly",
          severity: "medium",
          category: "phishing_hunter"
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate AI report");
      }
      setReportData(data.finding.ai_reports.intern);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error?.message || "Generation error");
    } finally {
      setIsGenerating(false);
    }
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <DashboardShell roleName="Intern" navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#08090a] text-[#f7f8f8] overflow-y-auto">
        
        {/* Top Header Banner - Linear Minimal Palette */}
        <div className="flex flex-col px-8 pt-6 pb-4 border-b border-[#232529] shrink-0 bg-[#0c0d0e]/90 backdrop-blur z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#1e2025] border border-[#2b2d31] text-[#8a8f98] text-[11px] font-mono uppercase rounded">
                  Cyber Intern Desk
                </span>
                <span className="text-[12px] text-[#62666d]">· Triage & Mentorship Workspace</span>
              </div>
              <h1 className="text-[18px] font-semibold text-[#f7f8f8] tracking-tight mt-1">
                Junior Security Analyst Triage Workspace
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
                    Generating AI Notes...
                  </>
                ) : (
                  "⚡ Run AI Triage Walkthrough"
                )}
              </button>
              <Link
                href="/intern/tasks"
                className="px-3 py-1.5 bg-[#f7f8f8] hover:bg-[#e0e0e0] text-[12.5px] font-medium text-[#0c0d0e] rounded-md transition-colors"
              >
                View Triage Tasks
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Stats Row */}
        <div className="px-8 py-5 grid grid-cols-4 gap-3.5">
          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Assigned Triage Alerts</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#f7f8f8]">4</span>
              <MinimalSparklineChart data={[2, 3, 1, 4, 3, 5, 4]} color="#828fff" />
            </div>
            <span className="text-[11px] text-[#2ea043] mt-2 flex items-center gap-1">✓ 2 verified today</span>
          </div>

          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Verification Checklist</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#f2c94c]">{completedCount}/4</span>
              <span className="text-[11px] font-mono text-[#8a8f98]">{Math.round((completedCount / 4) * 100)}% done</span>
            </div>
            <div className="w-full bg-[#18191c] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-[#f2c94c] transition-all duration-300"
                style={{ width: `${(completedCount / 4) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Fix Lab Modules Completed</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#2ea043]">12/12</span>
              <span className="text-[11px] text-[#2ea043] font-mono">100% Pass</span>
            </div>
            <span className="text-[11px] text-[#8a8f98] mt-2">SQLi, XSS, Supply Chain</span>
          </div>

          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Triage Difficulty Score</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#ff5555]">78</span>
              <span className="text-[11px] font-mono text-[#ff5555]">HIGH</span>
            </div>
            <span className="text-[11px] text-[#8a8f98] mt-2">Incident #INC-2026-8891</span>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-8 mb-4 p-3 bg-[#1e1416] border border-[#3c1e22] rounded-lg text-[#ff5555] text-[12.5px]">
            <strong>AI Generation Error:</strong> {errorMsg}
          </div>
        )}

        {/* Live EDR Telemetry Log Stream Section (15 logs, 4 Malicious highlighted in Red) */}
        <div className="px-8 mb-6">
          <TelemetryLogStream />
        </div>

        {/* AI Triage Intelligence Report Card (Zero Monetary Values for Intern) */}
        {reportData && (
          <div className="px-8 mb-6">
            <AiReportDisplayCard report={reportData} roleTitle="Cyber Intern" />
          </div>
        )}

        {/* Intern Interactive Triage Workbench & Navigation */}
        <div className="px-8 pb-10 grid grid-cols-3 gap-5">
          
          {/* Interactive Checklist Workbench */}
          <div className="col-span-2 bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-[#232529] pb-3 mb-3">
              <h3 className="text-[14px] font-semibold text-[#f7f8f8]">
                Interactive Incident Triage Checklist (#INC-2026-8891)
              </h3>
              <span className="text-[11px] text-[#8a8f98] font-mono">Guided Step-by-Step</span>
            </div>

            <div className="space-y-2.5">
              <label
                onClick={() => toggleCheck("processCheck")}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                  checklist.processCheck
                    ? "bg-[#121316] border-[#2b2d31] text-[#f7f8f8]"
                    : "bg-[#08090a] border-[#232529] text-[#8a8f98]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.processCheck}
                  onChange={() => {}}
                  className="mt-0.5 accent-[#2ea043]"
                />
                <div>
                  <h4 className="text-[13px] font-medium text-[#f7f8f8]">
                    Step 1: Check Process List for Suspicious Node Workers
                  </h4>
                  <p className="text-[11.5px] text-[#8a8f98] mt-0.5">
                    Command: <code className="text-[#828fff]">ps aux | grep node</code> · Target script: <code className="text-[#d0d6e0]">dist/telemetry_worker.js</code>
                  </p>
                </div>
              </label>

              <label
                onClick={() => toggleCheck("socketMatch")}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                  checklist.socketMatch
                    ? "bg-[#121316] border-[#2b2d31] text-[#f7f8f8]"
                    : "bg-[#08090a] border-[#232529] text-[#8a8f98]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.socketMatch}
                  onChange={() => {}}
                  className="mt-0.5 accent-[#2ea043]"
                />
                <div>
                  <h4 className="text-[13px] font-medium text-[#f7f8f8]">
                    Step 2: Match Active Socket Connections to Foreign C2 IP
                  </h4>
                  <p className="text-[11.5px] text-[#8a8f98] mt-0.5">
                    Command: <code className="text-[#828fff]">lsof -i :443</code> · Foreign Target: <code className="text-[#ff5555]">185.220.101.5:443</code>
                  </p>
                </div>
              </label>

              <label
                onClick={() => toggleCheck("hashQuery")}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                  checklist.hashQuery
                    ? "bg-[#121316] border-[#2b2d31] text-[#f7f8f8]"
                    : "bg-[#08090a] border-[#232529] text-[#8a8f98]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.hashQuery}
                  onChange={() => {}}
                  className="mt-0.5 accent-[#2ea043]"
                />
                <div>
                  <h4 className="text-[13px] font-medium text-[#f7f8f8]">
                    Step 3: Query SHA-256 Binary Hash in Threat Intelligence Feed
                  </h4>
                  <p className="text-[11.5px] text-[#8a8f98] mt-0.5">
                    Hash: <code className="text-[#d0d6e0]">e3b0c44298fc...7852b855</code> · Rule match: <code className="text-[#f2c94c]">MALW_JS_REVERSE_SHELL</code>
                  </p>
                </div>
              </label>

              <label
                onClick={() => toggleCheck("lockfileAudit")}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                  checklist.lockfileAudit
                    ? "bg-[#121316] border-[#2b2d31] text-[#f7f8f8]"
                    : "bg-[#08090a] border-[#232529] text-[#8a8f98]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.lockfileAudit}
                  onChange={() => {}}
                  className="mt-0.5 accent-[#2ea043]"
                />
                <div>
                  <h4 className="text-[13px] font-medium text-[#f7f8f8]">
                    Step 4: Inspect npm Lockfile for Registry Tarball Anomaly
                  </h4>
                  <p className="text-[11.5px] text-[#8a8f98] mt-0.5">
                    File: <code className="text-[#828fff]">package-lock.json</code> · Package: <code className="text-[#ff5555]">@kvch-internal/crypto-utils@1.4.2</code>
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Quick Mentorship Links */}
          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-[#f7f8f8] mb-3">
                Intern Workspace Shortcuts
              </h3>
              <div className="space-y-2">
                <Link
                  href="/intern/tasks"
                  className="block p-2.5 bg-[#121316] hover:bg-[#18191c] border border-[#232529] rounded text-[12.5px] text-[#f7f8f8] transition-colors"
                >
                  📋 My Triage Task Queue
                </Link>
                <Link
                  href="/intern/reviews"
                  className="block p-2.5 bg-[#121316] hover:bg-[#18191c] border border-[#232529] rounded text-[12.5px] text-[#f7f8f8] transition-colors"
                >
                  🎓 Sr. Dev Mentorship Reviews
                </Link>
                <Link
                  href="/intern/initiatives"
                  className="block p-2.5 bg-[#121316] hover:bg-[#18191c] border border-[#232529] rounded text-[12.5px] text-[#f7f8f8] transition-colors"
                >
                  🚀 Security Training Modules
                </Link>
              </div>
            </div>

            <div className="p-3 bg-[#121316] border border-[#232529] rounded text-[11.5px] text-[#8a8f98] mt-3">
              <strong className="text-[#f7f8f8]">Mentorship Tip:</strong> Always attach SHA-256 binary hash proof before requesting Senior Dev sign-off.
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
