"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { AiReportDisplayCard } from "@/components/ai-report-card";
import { DEMO_REPORTS } from "@/lib/demo-data";
import { MinimalSparklineChart } from "@/components/charts/minimal-charts";
import { CodeDiffViewer } from "@/components/code-diff-viewer";
import { TelemetryLogStream } from "@/components/telemetry-log-stream";
import Link from "next/link";
import { useState } from "react";

export default function SrDevDashboardPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<unknown>(DEMO_REPORTS.srDev);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

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
      setReportData(data.finding.ai_reports.srDev);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error?.message || "Generation error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardShell roleName="Sr. Dev" navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#08090a] text-[#f7f8f8] overflow-y-auto">
        
        {/* Top Header Banner - Linear Minimal Palette */}
        <div className="flex flex-col px-8 pt-6 pb-4 border-b border-[#232529] shrink-0 bg-[#0c0d0e]/90 backdrop-blur z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#1e2025] border border-[#2b2d31] text-[#8a8f98] text-[11px] font-mono uppercase rounded">
                  Senior Dev SOC Plane
                </span>
                <span className="text-[12px] text-[#62666d]">· Real-Time Extension Control & Technical Containment</span>
              </div>
              <h1 className="text-[18px] font-semibold text-[#f7f8f8] tracking-tight mt-1">
                Senior Security Operations & Containment Workbench
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
                    Calling Groq AI Key Pool...
                  </>
                ) : (
                  "⚡ Run AI Technical Report"
                )}
              </button>
              <Link
                href="/extensions"
                className="px-3 py-1.5 bg-[#f7f8f8] hover:bg-[#e0e0e0] text-[12.5px] font-medium text-[#0c0d0e] rounded-md transition-colors"
              >
                + Upload Extension
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Stats Row */}
        <div className="px-8 py-5 grid grid-cols-4 gap-3.5">
          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Active Threat Extensions</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#f7f8f8]">8/8</span>
              <MinimalSparklineChart data={[5, 6, 8, 7, 8, 8, 8]} color="#828fff" />
            </div>
            <span className="text-[11px] text-[#2ea043] mt-2">All EDR extension engines active</span>
          </div>

          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Active C2 Connection</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#ff5555]">1</span>
              <span className="text-[11px] font-mono text-[#ff5555]">PID 14209</span>
            </div>
            <span className="text-[11px] text-[#ff5555] mt-2 font-mono">185.220.101.5:443 (Reverse Shell)</span>
          </div>

          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Groq Key Pool Health</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#2ea043]">4/4</span>
              <span className="text-[11px] text-[#2ea043]">Round-Robin</span>
            </div>
            <span className="text-[11px] text-[#8a8f98] mt-2">Automatic 429 failover active</span>
          </div>

          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Incident Severity Score</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#ff5555]">92</span>
              <span className="text-[11px] font-mono text-[#ff5555]">CRITICAL</span>
            </div>
            <span className="text-[11px] text-[#ff5555] mt-2 font-mono">Port 5432 Exposed</span>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-8 mb-4 p-3 bg-[#1e1416] border border-[#3c1e22] rounded-lg text-[#ff5555] text-[12.5px]">
            <strong>AI Generation Error:</strong> {errorMsg}
          </div>
        )}

        {/* Live EDR Telemetry Log Stream Section (15-20 logs, 4 Malicious highlighted in Red) */}
        <div className="px-8 mb-6">
          <TelemetryLogStream />
        </div>

        {/* Technical AI Report Card */}
        {reportData && (
          <div className="px-8 mb-6">
            <AiReportDisplayCard report={reportData} roleTitle="Senior Developer" />
          </div>
        )}

        {/* Technical Containment Workbench & IDE Diff View */}
        <div className="px-8 pb-10 grid grid-cols-3 gap-5">
          
          {/* Containment Terminal & Code Diffs */}
          <div className="col-span-2 bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#232529] pb-3">
              <h3 className="text-[14px] font-semibold text-[#f7f8f8]">
                Technical Forensic Workbench & One-Touch Shell Actions
              </h3>
              <span className="text-[11px] text-[#2ea043] font-mono">Real-Time Telemetry</span>
            </div>

            {/* Terminal Command 1: Kill PID */}
            <div className="bg-[#08090a] border border-[#232529] rounded p-3 font-mono text-[12px]">
              <div className="flex items-center justify-between text-[#8a8f98] mb-1">
                <span>Command 1: Terminate Malicious C2 Reverse Shell Process</span>
                <button
                  onClick={() => copyToClipboard("sudo kill -9 14209", "cmd1")}
                  className="text-[11px] text-[#828fff] hover:underline"
                >
                  {copiedCmd === "cmd1" ? "✓ Copied!" : "Copy Command"}
                </button>
              </div>
              <code className="text-[#f7f8f8] block bg-[#121316] p-2 rounded border border-[#232529]">
                sudo kill -9 14209
              </code>
            </div>

            {/* Terminal Command 2: Egress Firewall */}
            <div className="bg-[#08090a] border border-[#232529] rounded p-3 font-mono text-[12px]">
              <div className="flex items-center justify-between text-[#8a8f98] mb-1">
                <span>Command 2: Block Outbound C2 Traffic (iptables)</span>
                <button
                  onClick={() => copyToClipboard("sudo iptables -A OUTPUT -d 185.220.101.5 -j DROP", "cmd2")}
                  className="text-[11px] text-[#828fff] hover:underline"
                >
                  {copiedCmd === "cmd2" ? "✓ Copied!" : "Copy Command"}
                </button>
              </div>
              <code className="text-[#f7f8f8] block bg-[#121316] p-2 rounded border border-[#232529]">
                sudo iptables -A OUTPUT -d 185.220.101.5 -j DROP
              </code>
            </div>

            {/* IDE-Grade Code Patch Diff Component */}
            <CodeDiffViewer
              filename="3. Immediate Code & Patch Diff ( /etc/postgresql/15/main/postgresql.conf & package.json )"
              codeString={`--- a/etc/postgresql/15/main/postgresql.conf
+++ b/etc/postgresql/15/main/postgresql.conf
-listen_addresses = '*'
+listen_addresses = 'localhost, 10.0.4.15'

--- a/web/package.json
+++ b/web/package.json
- "@kvch-internal/crypto-utils": "^1.4.2",
+ "@kvch-internal/crypto-utils": "1.4.1",`}
            />
          </div>

          {/* SOC Shortcuts Panel */}
          <div className="bg-[#0c0d0e] border border-[#232529] rounded-lg p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-[#f7f8f8] mb-3">
                SOC Actions & Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/sr-dev/incidents"
                  className="block p-2.5 bg-[#121316] hover:bg-[#18191c] border border-[#232529] rounded text-[12.5px] text-[#f7f8f8] transition-colors"
                >
                  🚨 Active Incident Queue (#INC-2026-8891)
                </Link>
                <Link
                  href="/sr-dev/approvals"
                  className="block p-2.5 bg-[#121316] hover:bg-[#18191c] border border-[#232529] rounded text-[12.5px] text-[#f7f8f8] transition-colors"
                >
                  🛡️ Review Patch Approvals (3 Pending)
                </Link>
                <Link
                  href="/sr-dev/custom-extensions"
                  className="block p-2.5 bg-[#121316] hover:bg-[#18191c] border border-[#232529] rounded text-[12.5px] text-[#f7f8f8] transition-colors"
                >
                  🧩 Custom Extensions AI Generator
                </Link>
              </div>
            </div>

            <div className="p-3 bg-[#121316] border border-[#232529] rounded text-[11.5px] text-[#ff5555] mt-3">
              <strong>Containment Alert:</strong> Port 5432 is currently exposed externally. Execute socket binding patch immediately.
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
