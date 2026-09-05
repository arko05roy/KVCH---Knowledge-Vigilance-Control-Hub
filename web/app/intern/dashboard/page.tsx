"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { AiReportDisplayCard } from "@/components/ai-report-card";
import Link from "next/link";
import { useState } from "react";

export default function InternDashboardPage() {
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
          title: "Verify Unencrypted Local Socket Listener & WHOIS Anomaly",
          severity: "medium",
          category: "phishing_hunter"
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate AI report");
      }
      setLiveReport(data.finding.ai_reports.intern);
    } catch (err: any) {
      setErrorMsg(err?.message || "Generation error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardShell roleName="Intern" navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#111213] text-[#e8e8e8] overflow-y-auto">
        <div className="flex flex-col px-8 pt-6 pb-4 border-b border-[#2b2c2e] shrink-0 bg-[#111213] z-10">
          <div className="flex items-center justify-between">
             <div>
               <h1 className="text-[20px] font-semibold text-[#fff] tracking-tight">Cyber Intern Workspace & Triage</h1>
               <p className="text-[13px] text-[#858688] mt-1">Guided Alert Investigation · Fix Lab & Mentorship</p>
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
                      Generating AI Triage Notes...
                    </>
                  ) : (
                    "⚡ Test Live AI Triage Report"
                  )}
               </button>
               <Link href="/intern/tasks" className="px-3.5 py-1.5 bg-[#fff] hover:bg-[#e0e0e0] text-[13px] font-medium text-[#111213] rounded-md transition-colors shadow-sm">
                 View Assigned Tasks
               </Link>
             </div>
          </div>
        </div>

        <div className="px-8 py-6 grid grid-cols-4 gap-4">
          <div className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[12px] font-medium text-[#858688]">Assigned Triage Alerts</span>
            <span className="text-[28px] font-semibold text-[#fff] mt-2">4</span>
            <span className="text-[11px] text-[#2ea043] mt-2">2 verified today</span>
          </div>
          <div className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[12px] font-medium text-[#858688]">Interactive Fix Lab Tasks</span>
            <span className="text-[28px] font-semibold text-[#f2c94c] mt-2">3</span>
            <span className="text-[11px] text-[#858688] mt-2">SQLi & XSS remediation</span>
          </div>
          <div className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[12px] font-medium text-[#858688]">Code Reviews Pending</span>
            <span className="text-[28px] font-semibold text-[#fff] mt-2">2</span>
            <span className="text-[11px] text-[#858688] mt-2">Awaiting Sr. Dev review</span>
          </div>
          <div className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[12px] font-medium text-[#858688]">Completed Modules</span>
            <span className="text-[28px] font-semibold text-[#2ea043] mt-2">12</span>
            <span className="text-[11px] text-[#2ea043] mt-2">100% pass rate</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-8 mb-6 p-4 bg-[#ff5555]/10 border border-[#ff5555]/30 rounded-xl text-[#ff5555] text-[13px]">
            <strong>AI Generation Error:</strong> {errorMsg}
          </div>
        )}

        {liveReport && (
          <AiReportDisplayCard report={liveReport} roleTitle="Cyber Intern" />
        )}

        <div className="px-8 pb-12 grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-5 flex flex-col">
            <h3 className="text-[15px] font-semibold text-[#fff] mb-4">Assigned Alerts for Initial Triage</h3>
            <div className="space-y-3">
              <div className="p-3.5 bg-[#111213] border border-[#262729] rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-[13.5px] font-medium text-[#fff]">Verify domain WHOIS MX record anomaly</h4>
                  <p className="text-[12px] text-[#858688]">Extension: phishing-hunter · Target: example.com</p>
                </div>
                <button onClick={handleGenerateAiReport} className="text-[12px] text-[#38bdf8] hover:underline">Start AI Triage →</button>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-5 flex flex-col">
            <h3 className="text-[15px] font-semibold text-[#fff] mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/intern/tasks" className="block p-3 bg-[#262729] hover:bg-[#323438] rounded-lg text-[13px] text-[#e8e8e8]">My Triage Tasks</Link>
              <Link href="/intern/reviews" className="block p-3 bg-[#262729] hover:bg-[#323438] rounded-lg text-[13px] text-[#e8e8e8]">Mentorship Reviews</Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
