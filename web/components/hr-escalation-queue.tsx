"use client";

import React, { useState, useEffect } from "react";
import { InternEscalation } from "@/lib/escalation-store";

export function HrEscalationQueue() {
  const [interns, setInterns] = useState<InternEscalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchEscalations = async () => {
    try {
      const res = await fetch("/api/hr/escalations");
      const data = await res.json();
      if (data.success) {
        setInterns(data.interns.filter((i: InternEscalation) => i.escalationStatus !== "UNESCALATED"));
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
    // Poll every 5s for real-time sync with Senior Dev actions
    const interval = setInterval(fetchEscalations, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id: string, resolution: "OFFBOARDED" | "TRAINING_ENROLLED" | "DISMISSED", internName: string) => {
    setResolvingId(id);
    setNotice(null);

    try {
      const res = await fetch("/api/hr/escalations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, resolution }),
      });

      const data = await res.json();
      if (data.success) {
        setInterns((prev) =>
          prev.map((i) => (i.id === id ? data.intern : i))
        );

        if (resolution === "OFFBOARDED") {
          setNotice(`🚨 HR Action Executed: ${internName}'s SSO tokens suspended, Git access revoked, and offboarding checklist initiated.`);
        } else if (resolution === "TRAINING_ENROLLED") {
          setNotice(`📚 HR Action Executed: ${internName} enrolled in Mandatory ISO 27001 & Secure Coding module. Staging permissions restricted.`);
        } else {
          setNotice(`↩️ Case dismissed with internal mentorship warning for ${internName}.`);
        }
      }
    } catch (err: any) {
      setNotice(`Failed to resolve: ${err.message}`);
    } finally {
      setResolvingId(null);
    }
  };

  if (interns.length === 0) {
    return (
      <div className="rounded-2xl border border-[#23252a] bg-[#0c0d0e] p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1f2125] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#2ea043]" />
            <h3 className="text-[14.5px] font-bold text-[#f7f8f8] tracking-tight">
              Engineering Escalation &amp; Disciplinary Review Queue
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#2ea043] bg-[#2ea043]/10 border border-[#2ea043]/30 px-2 py-0.5 rounded-full">
            0 Pending Cases
          </span>
        </div>
        <p className="text-[12px] text-[#8a8f98]">
          No active disciplinary escalations from Senior Engineering leads. When a lead flags an intern or junior developer for policy violations, cases will appear here for executive HR review.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#ff5555]/30 bg-[#0f0b0d] p-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ff5555]/20 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5555] animate-ping" />
            <h3 className="text-[15px] font-bold text-[#f7f8f8] tracking-tight">
              Engineering Escalation &amp; Disciplinary Review Queue
            </h3>
            <span className="text-[11px] font-mono text-[#ff5555] bg-[#ff5555]/15 border border-[#ff5555]/40 px-2.5 py-0.5 rounded-full font-bold ml-1">
              {interns.filter((i) => i.escalationStatus === "PENDING_HR_REVIEW").length} Action Required
            </span>
          </div>
          <p className="text-[12px] text-[#8a8f98] mt-0.5">
            Cases escalated directly from Senior Developer leads requiring HR disciplinary determination (Termination / Retraining)
          </p>
        </div>
      </div>

      {notice && (
        <div className="mb-4 p-3 rounded-xl bg-[#1c1417] border border-[#ff5555]/40 text-[#ff7b72] text-[12px] font-mono flex items-center justify-between animate-fadeIn">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-[#8a8f98] hover:text-[#f7f8f8] text-xs">✕</button>
        </div>
      )}

      <div className="space-y-4">
        {interns.map((intern) => {
          const isPending = intern.escalationStatus === "PENDING_HR_REVIEW";
          const isOffboarded = intern.escalationStatus === "OFFBOARDED";
          const isTraining = intern.escalationStatus === "TRAINING_ENROLLED";
          const isActing = resolvingId === intern.id;

          return (
            <div
              key={intern.id}
              className={`rounded-xl border p-4.5 transition-all duration-200 ${
                isOffboarded
                  ? "border-[#ef4444]/40 bg-[#160a0d] opacity-80"
                  : isTraining
                  ? "border-[#828fff]/40 bg-[#0e121a]"
                  : "border-[#ff5555]/50 bg-[#170e10] shadow-lg shadow-red-500/5 ring-1 ring-red-500/20"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5 mb-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold text-xs font-mono">
                    {intern.internName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#f7f8f8] text-[13.5px]">{intern.internName}</span>
                      <span className="text-[11px] font-mono text-[#8a8f98]">({intern.internId})</span>
                      <span className="text-[10.5px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[#d0d6e0]">
                        {intern.team}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8a8f98]">{intern.role}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-[#ff5555] bg-[#ff5555]/10 border border-[#ff5555]/30 px-2 py-0.5 rounded-full">
                    Risk Score: {intern.riskScore}/100
                  </span>
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border ${
                      isOffboarded
                        ? "text-[#ff5555] bg-[#ff5555]/20 border-[#ff5555]/50"
                        : isTraining
                        ? "text-[#10b981] bg-[#10b981]/20 border-[#10b981]/50"
                        : "text-[#f59e0b] bg-[#f59e0b]/20 border-[#f59e0b]/50 animate-pulse"
                    }`}
                  >
                    {isOffboarded ? "✓ OFFBOARDED / TERMINATED" : isTraining ? "✓ ENROLLED IN TRAINING" : "⏳ PENDING HR ACTION"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-[12px] mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-[#8a8f98] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Lead Engineer Request:</span>
                  <strong className="text-[#f7f8f8]">
                    {intern.escalatedAction === "FIRE_REVIEW" ? "Immediate Employment Termination & Access Revocation" : "Mandatory 14-Day Compliance Retraining"}
                  </strong>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[#8a8f98] font-semibold text-[11px] uppercase tracking-wider whitespace-nowrap">Violation Description:</span>
                  <span className="text-[#d0d6e0]">{intern.flaggedViolation}</span>
                </div>
                <div className="flex items-baseline gap-2 text-[11px] font-mono text-[#8a8f98]">
                  <span>Escalated by:</span>
                  <span className="text-[#828fff]">{intern.escalatedBy || "Senior Lead Engineer"}</span>
                  {intern.escalatedAt && (
                    <span>· {new Date(intern.escalatedAt).toLocaleTimeString()}</span>
                  )}
                </div>
              </div>

              {isPending && (
                <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] text-[#ff7b72] font-mono">
                    ⚠️ Choose HR Disciplinary Outcome:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleResolve(intern.id, "OFFBOARDED", intern.internName)}
                      disabled={isActing}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#ef4444] text-white hover:bg-[#dc2626] transition-all active:scale-95 shadow-md shadow-red-500/20"
                    >
                      {isActing ? "Processing..." : "🚨 Confirm Immediate Termination (Fire)"}
                    </button>
                    <button
                      onClick={() => handleResolve(intern.id, "TRAINING_ENROLLED", intern.internName)}
                      disabled={isActing}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#1e2330] text-[#828fff] border border-[#3b4360] hover:bg-[#282d3e] transition-all active:scale-95"
                    >
                      {isActing ? "Processing..." : "📚 Approve 14-Day Mandatory Retraining"}
                    </button>
                    <button
                      onClick={() => handleResolve(intern.id, "DISMISSED", intern.internName)}
                      disabled={isActing}
                      className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg text-[#8a8f98] hover:text-[#f7f8f8] border border-transparent hover:border-[#2f3238] transition-all"
                    >
                      Dismiss Warning
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
