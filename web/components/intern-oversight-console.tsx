"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { InternEscalation } from "@/lib/escalation-store";

export function InternOversightConsole() {
  const [interns, setInterns] = useState<InternEscalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>("INT-881");

  const fetchInterns = async () => {
    try {
      const res = await fetch("/api/hr/escalations");
      const data = await res.json();
      if (data.success) {
        setInterns(data.interns);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  const handleEscalate = async (id: string, action: "FIRE_REVIEW" | "MANDATORY_TRAINING", internName: string) => {
    setActingId(id);
    setActionSuccessNotice(null);

    try {
      const res = await fetch("/api/hr/escalations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      const data = await res.json();
      if (data.success) {
        setInterns((prev) =>
          prev.map((i) => (i.id === id ? data.intern : i))
        );

        if (action === "FIRE_REVIEW") {
          setActionSuccessNotice(`🚨 Escalated to HR Dashboard: ${internName} flagged for Immediate Termination / Offboarding Review. HR Director notified.`);
        } else {
          setActionSuccessNotice(`📚 Escalated to HR Dashboard: ${internName} assigned to Mandatory 14-Day Security Retraining. Staging deploy permissions revoked.`);
        }
      }
    } catch (err: any) {
      setActionSuccessNotice(`Failed to escalate: ${err.message}`);
    } finally {
      setActingId(null);
    }
  };

  const handleReset = async () => {
    await fetch("/api/hr/escalations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reset: true }),
    });
    fetchInterns();
    setActionSuccessNotice("Escalation records reset to initial baseline.");
  };

  const pendingHrCount = interns.filter((i) => i.escalationStatus === "PENDING_HR_REVIEW").length;

  return (
    <div className="w-full rounded-2xl border border-[#23252a] bg-[#0c0d0e] p-6 shadow-2xl hover:border-[#34373c] transition-all hover-lift">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2125] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5555] animate-pulse" />
            <h3 className="text-[15px] font-bold text-[#f7f8f8] tracking-tight">
              Junior Engineer &amp; Intern Activity Oversight Console
            </h3>
            <span className="text-[10.5px] font-mono text-[#8a8f98] bg-[#16171b] border border-[#262830] px-2 py-0.5 rounded-full ml-1">
              3 Supervised Committer Profiles
            </span>
          </div>
          <p className="text-[12px] text-[#8a8f98] mt-0.5">
            Automated code-attribution vigilance, sandbox traps, and senior engineer disciplinary escalation to HR
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingHrCount > 0 && (
            <Link
              href="/hr/dashboard"
              className="text-[11px] font-mono text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-semibold hover:bg-[#f59e0b]/20 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-ping" />
              {pendingHrCount} Case(s) in HR Queue ➔
            </Link>
          )}

          <button
            onClick={handleReset}
            className="text-[11px] font-mono text-[#8a8f98] hover:text-[#d0d6e0] px-2 py-1 rounded border border-[#23252a] hover:border-[#34373c] transition-colors"
            title="Reset demo intern status"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionSuccessNotice && (
        <div className="mb-4 p-3.5 rounded-xl bg-[#141820] border border-[#2b3a55] text-[#828fff] text-[12px] font-mono flex items-center justify-between animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-base">⚡</span>
            <span>{actionSuccessNotice}</span>
          </div>
          <button
            onClick={() => setActionSuccessNotice(null)}
            className="text-[#8a8f98] hover:text-[#f7f8f8] text-xs px-1.5 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Interns List */}
      <div className="space-y-4">
        {interns.map((intern) => {
          const isCritical = intern.riskScore >= 70;
          const isWarning = intern.riskScore >= 30 && intern.riskScore < 70;
          const isEscalated = intern.escalationStatus !== "UNESCALATED";
          const isActing = actingId === intern.id;

          return (
            <div
              key={intern.id}
              className={`rounded-xl border p-4.5 transition-all duration-200 relative overflow-hidden ${
                isCritical
                  ? isEscalated
                    ? "border-[#ef4444]/60 bg-[#160e10] shadow-md shadow-red-500/5"
                    : "border-[#ef4444]/40 bg-[#120b0d] hover:border-[#ef4444]/70"
                  : isWarning
                  ? "border-[#f59e0b]/30 bg-[#13110c] hover:border-[#f59e0b]/60"
                  : "border-[#1e2025] bg-[#0e1013] hover:border-[#2b2d35]"
              }`}
            >
              {/* Header inside card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs font-mono border ${
                      isCritical
                        ? "bg-red-500/20 text-red-400 border-red-500/30"
                        : isWarning
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {intern.internName.split(" ").map((n) => n[0]).join("")}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#f7f8f8] text-[13.5px]">{intern.internName}</span>
                      <span className="text-[11px] font-mono text-[#8a8f98]">({intern.internId})</span>
                      <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[#d0d6e0]">
                        {intern.team}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#8a8f98] mt-0.5">{intern.role}</p>
                  </div>
                </div>

                {/* Risk Score Pill & Escalation Status */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isCritical
                        ? "text-[#ff5555] bg-[#ff5555]/10 border-[#ff5555]/30 animate-pulse"
                        : isWarning
                        ? "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30"
                        : "text-[#2ea043] bg-[#2ea043]/10 border-[#2ea043]/30"
                    }`}
                  >
                    Risk Score: {intern.riskScore}/100
                  </span>

                  {isEscalated && (
                    <span
                      className={`text-[10.5px] font-mono px-2.5 py-0.5 rounded-md font-bold border ${
                        intern.escalatedAction === "FIRE_REVIEW"
                          ? "text-[#ff5555] bg-[#ff5555]/15 border-[#ff5555]/40"
                          : "text-[#828fff] bg-[#828fff]/15 border-[#828fff]/40"
                      }`}
                    >
                      {intern.escalationStatus === "PENDING_HR_REVIEW"
                        ? `⏳ HR Review Pending (${intern.escalatedAction === "FIRE_REVIEW" ? "Termination" : "Retraining"})`
                        : intern.escalationStatus === "OFFBOARDED"
                        ? "🚨 HR Action: Terminated & SSO Revoked"
                        : intern.escalationStatus === "TRAINING_ENROLLED"
                        ? "📚 HR Action: Retraining Enrolled"
                        : "✓ Resolved"}
                    </span>
                  )}
                </div>
              </div>

              {/* Flagged Violation Description */}
              <div className="space-y-2 mb-3">
                <div className="flex items-start justify-between gap-2 text-[12px]">
                  <div className="space-y-1">
                    <span className="text-[11px] text-[#8a8f98] font-semibold uppercase tracking-wider block">
                      Flagged Security Deviation:
                    </span>
                    <p className="text-[#e2e8f0] font-medium leading-relaxed">
                      {intern.flaggedViolation}
                    </p>
                  </div>
                  <span className="text-[10.5px] font-mono text-[#8a8f98] whitespace-nowrap bg-black/40 px-2 py-0.5 rounded border border-white/5">
                    Sensor: {intern.flaggedExtension}
                  </span>
                </div>

                {/* Evidence Code Snippet Expandable */}
                {intern.evidenceCode && (
                  <div>
                    <button
                      onClick={() => setExpandedCodeId(expandedCodeId === intern.id ? null : intern.id)}
                      className="text-[11px] font-mono text-[#828fff] hover:underline flex items-center gap-1 mt-1"
                    >
                      <span>{expandedCodeId === intern.id ? "▼ Hide" : "▶ Inspect"} Forensic Evidence &amp; Diff</span>
                    </button>

                    {expandedCodeId === intern.id && (
                      <pre className="mt-1.5 p-2.5 rounded-lg bg-[#08090b] border border-[#23252a] text-[#ff7b72] text-[11px] font-mono overflow-x-auto">
                        <code>{intern.evidenceCode}</code>
                      </pre>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons Toolbar */}
              <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[11px] text-[#8a8f98] font-mono">
                  {intern.escalatedBy ? `Escalated by: ${intern.escalatedBy}` : "Supervisor Action Required"}
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Fire / Immediate Offboarding Escalation */}
                  <button
                    onClick={() => handleEscalate(intern.id, "FIRE_REVIEW", intern.internName)}
                    disabled={isActing || (isEscalated && intern.escalatedAction === "FIRE_REVIEW")}
                    className={`text-[11.5px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 ${
                      isEscalated && intern.escalatedAction === "FIRE_REVIEW"
                        ? "bg-[#ff5555]/20 text-[#ff5555] border border-[#ff5555]/40 cursor-default"
                        : "bg-[#ff5555] text-white hover:bg-[#dc2626] shadow-md shadow-red-500/20"
                    }`}
                  >
                    {isActing ? "Submitting..." : isEscalated && intern.escalatedAction === "FIRE_REVIEW" ? "✓ Escalated to HR (Termination)" : "🚨 Escalate to HR: Termination Review (Fire)"}
                  </button>

                  {/* Mandatory Retraining Escalation */}
                  <button
                    onClick={() => handleEscalate(intern.id, "MANDATORY_TRAINING", intern.internName)}
                    disabled={isActing || (isEscalated && intern.escalatedAction === "MANDATORY_TRAINING")}
                    className={`text-[11.5px] font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 ${
                      isEscalated && intern.escalatedAction === "MANDATORY_TRAINING"
                        ? "bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40 cursor-default"
                        : "bg-[#1f2330] text-[#828fff] border border-[#3b4360] hover:bg-[#282d3e] hover:border-[#525f88]"
                    }`}
                  >
                    {isActing ? "Submitting..." : isEscalated && intern.escalatedAction === "MANDATORY_TRAINING" ? "✓ Escalated to HR (Retraining)" : "📚 Escalate to HR: Mandatory Retraining"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
