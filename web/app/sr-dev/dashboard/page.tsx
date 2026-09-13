"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { AiReportDisplayCard } from "@/components/ai-report-card";
import { DEMO_REPORTS } from "@/lib/demo-data";
import { MinimalSparklineChart } from "@/components/charts/minimal-charts";
import { AttackSurfaceExposureChart } from "@/components/charts/dashboard-charts";
import { CodeDiffViewer } from "@/components/code-diff-viewer";
import { TelemetryLogStream, SAMPLE_TELEMETRY_LOGS, TelemetryLogEntry } from "@/components/telemetry-log-stream";
import { SandboxRunBanner } from "@/components/sandbox-run-banner";
import { AttackProgressionTimeline } from "@/components/attack-progression-timeline";
import { InternOversightConsole } from "@/components/intern-oversight-console";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

export default function SrDevDashboardPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(DEMO_REPORTS.srDev);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // 10-Second Auto-Stream & Telemetry State
  const [autoRun, setAutoRun] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [logs, setLogs] = useState<TelemetryLogEntry[]>(SAMPLE_TELEMETRY_LOGS);
  const [pulseCount, setPulseCount] = useState(0);

  // Interactive Containment State
  const [containmentExecuted, setContainmentExecuted] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  useEffect(() => {
    setReportData((prev: any) => ({
      ...prev,
      generatedAt: new Date().toISOString(),
    }));
  }, []);

  const handleExecuteContainment = () => {
    setContainmentExecuted(true);
    setStatusNotice("🛡️ Technical Containment Executed: Malicious process PID 14209 terminated & IP 185.220.101.5 blocked via iptables.");
  };

  const handleGenerateAiReport = useCallback(async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0] + "." + String(now.getMilliseconds()).padStart(3, "0");

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
      setPulseCount((prev) => prev + 1);

      // Prepend fresh log entry to telemetry stream
      const newLog: TelemetryLogEntry = {
        id: `log-live-${Date.now()}`,
        timestamp: timeStr,
        level: "CRITICAL",
        extension: "attack-surface-scanner",
        message: `⚡ 10s AI SOC Pulse #${pulseCount + 1}: Analyzed port 5432 binding baseline deviation on localhost`,
        isMalicious: true,
      };

      setLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 25)]);
      setStatusNotice(`⚡ [${timeStr.split(".")[0]}] Sovereign Ollama AI: Technical Security Report Auto-Synthesized (Pulse #${pulseCount + 1})`);
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
              <Link
                href="/extensions"
                className="px-3 py-1.5 bg-[#f7f8f8] hover:bg-[#e0e0e0] text-[12.5px] font-medium text-[#0c0d0e] rounded-md transition-all hover-lift active:scale-95"
              >
                + Upload Extension
              </Link>
            </div>
          </div>
        </div>

        {/* Live 120-Minute Sandbox Attack Run Banner */}
        <SandboxRunBanner
          role="srDev"
          roleTitle="Senior Developer"
          reportMarkdownFile="sr_dev_report.md"
          reportJsonFile="sr_dev_report.json"
        />

        {/* Live Status Toast Banner */}
        {statusNotice && (
          <div className="mx-8 mt-4 p-3 bg-[#121f17] border border-[#2ea043]/40 rounded-lg text-[#2ea043] text-[12.5px] flex items-center justify-between animate-fadeIn">
            <span>{statusNotice}</span>
            <button onClick={() => setStatusNotice(null)} className="text-[#8a8f98] hover:text-[#f7f8f8] text-xs">✕</button>
          </div>
        )}

        {/* Overview Stats Row with microinteractions */}
        <div className="px-8 py-5 grid grid-cols-4 gap-3.5">
          <div className="bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-200 hover-lift rounded-lg p-4 flex flex-col justify-between cursor-default">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Active Threat Extensions</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#f7f8f8]">10/10</span>
              <MinimalSparklineChart data={[6, 7, 8, 9, 10, 10, 10]} color="#828fff" />
            </div>
            <span className="text-[11px] text-[#2ea043] mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ea043] animate-pulse"></span>
              All 10 EDR extension engines active
            </span>
          </div>

          <div className="bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-200 hover-lift rounded-lg p-4 flex flex-col justify-between cursor-default">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Active C2 Connection</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-[24px] font-semibold ${containmentExecuted ? "text-[#2ea043]" : "text-[#ff5555]"}`}>
                {containmentExecuted ? "0" : "1"}
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                containmentExecuted ? "text-[#2ea043] bg-[#2ea043]/10 border-[#2ea043]/30" : "text-[#ff5555] bg-[#ff5555]/10 border-[#ff5555]/30"
              }`}>
                {containmentExecuted ? "CONTAINED" : "PID 14209"}
              </span>
            </div>
            <span className={`text-[11px] font-mono mt-2 ${containmentExecuted ? "text-[#2ea043]" : "text-[#ff5555]"}`}>
              {containmentExecuted ? "Outbound Traffic Blocked" : "185.220.101.5:443 (Reverse Shell)"}
            </span>
          </div>

          <div className="bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-200 hover-lift rounded-lg p-4 flex flex-col justify-between cursor-default">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Ollama AI Local Engine</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-[24px] font-semibold text-[#2ea043]">ONLINE</span>
              <span className="text-[11px] text-[#2ea043] font-mono">100% Air-Gapped</span>
            </div>
            <span className="text-[11px] text-[#8a8f98] mt-2">qwen2.5-coder:7b active</span>
          </div>

          <div className="bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-200 hover-lift rounded-lg p-4 flex flex-col justify-between cursor-default">
            <span className="text-[11.5px] font-medium text-[#8a8f98]">Incident Severity Score</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-[24px] font-semibold ${containmentExecuted ? "text-[#2ea043]" : "text-[#ff5555]"}`}>
                {containmentExecuted ? "14" : "92"}
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                containmentExecuted ? "text-[#2ea043] bg-[#2ea043]/10 border-[#2ea043]/30" : "text-[#ff5555] bg-[#ff5555]/10 border-[#ff5555]/30"
              }`}>
                {containmentExecuted ? "LOW" : "CRITICAL"}
              </span>
            </div>
            <span className={`text-[11px] font-mono mt-2 ${containmentExecuted ? "text-[#2ea043]" : "text-[#ff5555]"}`}>
              {containmentExecuted ? "Remediated & Isolated" : "Port 5432 Exposed"}
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mx-8 mb-4 p-3 bg-[#1e1416] border border-[#3c1e22] rounded-lg text-[#ff5555] text-[12.5px] animate-fadeIn">
            <strong>AI Generation Error:</strong> {errorMsg}
          </div>
        )}

        {/* Interactive 120-Minute Attack Progression Timeline across 10 Engines */}
        <div className="px-8 mb-6 animate-fadeIn">
          <AttackProgressionTimeline />
        </div>

        {/* Real-Time Attack Surface Exposure & Port Binding Map Chart */}
        <div className="px-8 mb-6 animate-fadeIn">
          <AttackSurfaceExposureChart />
        </div>

        {/* Live EDR Telemetry Log Stream Section (15-20 logs, 4 Malicious highlighted in Red) */}
        <div className="px-8 mb-6 animate-fadeIn">
          <TelemetryLogStream logs={logs} />
        </div>

        {/* Technical AI Report Card */}
        {reportData && (
          <div className="px-8 mb-6 animate-fadeIn">
            <AiReportDisplayCard report={reportData} roleTitle="Senior Developer" />
          </div>
        )}

        {/* Junior Engineer & Intern Activity Surveillance (Mentor & Escalation Console) */}
        <div className="px-8 mb-6 animate-fadeIn">
          <InternOversightConsole />
        </div>

        {/* Technical Containment Workbench & IDE Diff View */}
        <div className="px-8 pb-10 grid grid-cols-3 gap-5">
          
          {/* Containment Terminal & Code Diffs */}
          <div className="col-span-2 bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-200 rounded-lg p-4 flex flex-col space-y-3.5 hover-lift">
            <div className="flex items-center justify-between border-b border-[#232529] pb-3">
              <h3 className="text-[14px] font-semibold text-[#f7f8f8]">
                Technical Forensic Workbench & One-Touch Shell Actions
              </h3>
              <span className="text-[11px] text-[#2ea043] font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2ea043] animate-pulse"></span>
                Real-Time Telemetry
              </span>
            </div>

            {/* Terminal Command 1: Kill PID */}
            <div className="bg-[#08090a] border border-[#232529] hover:border-[#34373c] transition-colors rounded p-3 font-mono text-[12px]">
              <div className="flex items-center justify-between text-[#8a8f98] mb-1">
                <span>Command 1: Terminate Malicious C2 Reverse Shell Process</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExecuteContainment}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded transition-all active:scale-95 ${
                      containmentExecuted
                        ? "text-[#2ea043] bg-[#2ea043]/15 border border-[#2ea043]/40 shadow-sm"
                        : "text-[#2ea043] bg-[#2ea043]/10 border border-[#2ea043]/30 hover:bg-[#2ea043]/20"
                    }`}
                  >
                    {containmentExecuted ? "✓ Executed & Isolated" : "⚡ Run Shell Containment"}
                  </button>
                  <button
                    onClick={() => copyToClipboard("sudo kill -9 14209", "cmd1")}
                    className="text-[11px] text-[#828fff] hover:underline active:scale-95 transition-transform"
                  >
                    {copiedCmd === "cmd1" ? "✓ Copied!" : "Copy Command"}
                  </button>
                </div>
              </div>
              <code className="text-[#f7f8f8] block bg-[#121316] p-2 rounded border border-[#232529]">
                sudo kill -9 14209
              </code>
            </div>

            {/* Terminal Command 2: Egress Firewall */}
            <div className="bg-[#08090a] border border-[#232529] hover:border-[#34373c] transition-colors rounded p-3 font-mono text-[12px]">
              <div className="flex items-center justify-between text-[#8a8f98] mb-1">
                <span>Command 2: Block Outbound C2 Traffic (iptables)</span>
                <button
                  onClick={() => copyToClipboard("sudo iptables -A OUTPUT -d 185.220.101.5 -j DROP", "cmd2")}
                  className="text-[11px] text-[#828fff] hover:underline active:scale-95 transition-transform"
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
          <div className="bg-[#0c0d0e] border border-[#232529] hover:border-[#34373c] transition-all duration-200 rounded-lg p-4 flex flex-col justify-between hover-lift">
            <div>
              <h3 className="text-[14px] font-semibold text-[#f7f8f8] mb-3">
                SOC Actions & Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/sr-dev/incidents"
                  className="block p-2.5 bg-[#121316] hover:bg-[#18191c] border border-[#232529] hover:border-[#34373c] rounded text-[12.5px] text-[#f7f8f8] transition-all active:scale-[0.98]"
                >
                  🚨 Active Incident Queue (#INC-2026-8891)
                </Link>
                <Link
                  href="/sr-dev/approvals"
                  className="block p-2.5 bg-[#121316] hover:bg-[#18191c] border border-[#232529] hover:border-[#34373c] rounded text-[12.5px] text-[#f7f8f8] transition-all active:scale-[0.98]"
                >
                  🛡️ Review Patch Approvals (3 Pending)
                </Link>
                <Link
                  href="/sr-dev/custom-extensions"
                  className="block p-2.5 bg-[#121316] hover:bg-[#18191c] border border-[#232529] hover:border-[#34373c] rounded text-[12.5px] text-[#f7f8f8] transition-all active:scale-[0.98]"
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
