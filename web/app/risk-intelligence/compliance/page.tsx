"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RiskNavTabs } from "@/components/risk-nav";
import { DashboardShell } from "@/components/dashboard-shell";

interface Framework {
  id: string;
  name: string;
  score: number;
  totalControls: number;
  passedControls: number;
  failedControls: number;
  status: "COMPLIANT" | "NEEDS_ATTENTION" | "NON_COMPLIANT";
}

const MOCK_FRAMEWORKS: Framework[] = [
  { id: "SOC2", name: "SOC 2 Type II (Trust Services Criteria)", score: 94, totalControls: 64, passedControls: 60, failedControls: 4, status: "COMPLIANT" },
  { id: "ISO27001", name: "ISO / IEC 27001:2022 Security Standard", score: 88, totalControls: 93, passedControls: 82, failedControls: 11, status: "NEEDS_ATTENTION" },
  { id: "GDPR", name: "GDPR Data Protection & Privacy Rule", score: 98, totalControls: 40, passedControls: 39, failedControls: 1, status: "COMPLIANT" },
  { id: "NIST", name: "NIST SP 800-53 Rev. 5 Cybersecurity Control", score: 82, totalControls: 118, passedControls: 97, failedControls: 21, status: "NEEDS_ATTENTION" },
];

interface FailedControl {
  id: string;
  framework: string;
  controlTitle: string;
  affectedAsset: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  slaDaysRemaining: number;
}

const INITIAL_FAILED_CONTROLS: FailedControl[] = [
  {
    id: "CTL-SOC2-CC6.1",
    framework: "SOC2",
    controlTitle: "Privileged PAM Credential Rotation Enforcement (<30 Days)",
    affectedAsset: "ASSET-CORE-DB-01",
    severity: "CRITICAL",
    slaDaysRemaining: 2
  },
  {
    id: "CTL-ISO-A.12.6.1",
    framework: "ISO27001",
    controlTitle: "Management of Technical Vulnerabilities (CVE-2026-3891 Unpatched)",
    affectedAsset: "ASSET-PAY-API-01",
    severity: "CRITICAL",
    slaDaysRemaining: 1
  },
  {
    id: "CTL-NIST-AC-2",
    framework: "NIST",
    controlTitle: "Account Management & Inactive Intern Key Revocation",
    affectedAsset: "IAM-SERVICE-ACCOUNTS",
    severity: "HIGH",
    slaDaysRemaining: 5
  },
  {
    id: "CTL-GDPR-ART32",
    framework: "GDPR",
    controlTitle: "Encryption of Personal Data at Rest (Column Masking Missing)",
    affectedAsset: "TABLE-CUSTOMER-PROFILE",
    severity: "MEDIUM",
    slaDaysRemaining: 12
  }
];

export default function RiskCompliancePage() {
  const [failedControls, setFailedControls] = useState<FailedControl[]>(INITIAL_FAILED_CONTROLS);
  const [remediatingId, setRemediatingId] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState(false);

  const handleFixControl = (id: string) => {
    setRemediatingId(id);
    setTimeout(() => {
      setFailedControls((prev) => prev.filter((c) => c.id !== id));
      setRemediatingId(null);
    }, 1200);
  };

  const handleDownloadPDF = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3000);
  };

  return (
    <DashboardShell roleName="Risk Intelligence" hideHeader>
      <div className="min-h-screen bg-[#090a0b] text-[#f7f8f8] font-sans flex flex-col">
        
        {/* Header */}
        <header className="border-b border-[#23252a] bg-[#0f1011] px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#5e6ad2] flex items-center justify-center font-bold text-white text-sm shadow-md">
                K
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#5e6ad2] tracking-wide uppercase">Continuous Compliance Engine</span>
                  <span className="text-[#8a8f98] text-[12px]">·</span>
                  <span className="text-[12px] text-[#27a644] font-mono">Real-time Automated Evaluation</span>
                </div>
                <h1 className="text-lg font-semibold text-[#f7f8f8] leading-tight">
                  SOC 2, ISO 27001, GDPR & NIST 800-53 Control Scorecards
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadPDF}
                className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold bg-[#5e6ad2] hover:bg-[#4d59c2] text-white shadow-sm transition-colors flex items-center gap-1.5"
              >
                📄 Generate Certified Auditor PDF
              </button>
            </div>
          </div>
        </header>

        {/* Sub Navigation */}
        <RiskNavTabs />

        {/* Main Body */}
        <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
          {downloadNotice && (
            <div className="mb-6 p-3 rounded-lg bg-[#5e6ad2]/15 border border-[#5e6ad2]/40 text-[#5e6ad2] text-[13px] flex items-center justify-between">
              <span>✓ Certified Compliance Readiness Assessment generated. Downloading report...</span>
            </div>
          )}

          {/* Framework Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {MOCK_FRAMEWORKS.map((fw) => (
              <div key={fw.id} className="p-5 rounded-xl bg-[#0f1011] border border-[#23252a] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#5e6ad2]">{fw.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        fw.status === "COMPLIANT"
                          ? "bg-[#27a644]/20 text-[#27a644] border border-[#27a644]/30"
                          : "bg-[#f5a623]/20 text-[#f5a623] border border-[#f5a623]/30"
                      }`}
                    >
                      {fw.status.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-[#f7f8f8] mb-4 h-10 line-clamp-2">{fw.name}</h3>

                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-3xl font-extrabold text-[#f7f8f8] font-mono">{fw.score}%</span>
                    <span className="text-xs text-[#8a8f98] font-mono">{fw.passedControls}/{fw.totalControls} Controls</span>
                  </div>

                  <div className="w-full bg-[#1e2025] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        fw.score >= 90 ? "bg-[#27a644]" : "bg-[#f5a623]"
                      }`}
                      style={{ width: `${fw.score}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1e2025] flex justify-between items-center text-[11px] text-[#8a8f98]">
                  <span>Failed Controls: <strong className="text-[#e5484d]">{fw.failedControls}</strong></span>
                  <span className="hover:text-[#5e6ad2] cursor-pointer">View Mapping →</span>
                </div>
              </div>
            ))}
          </div>

          {/* Control Failure Action Table */}
          <div className="rounded-xl border border-[#23252a] bg-[#0f1011] overflow-hidden">
            <div className="p-4 border-b border-[#23252a] bg-[#141516]/60 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#f7f8f8]">Active Control Failures & SLA Countdown</h2>
                <p className="text-xs text-[#8a8f98]">Resolving these failures immediately improves your organization's risk score.</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#e5484d]/15 text-[#e5484d] text-xs font-mono font-semibold">
                {failedControls.length} Open Violations
              </span>
            </div>

            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-[#23252a] text-[#8a8f98] font-medium text-[12px] bg-[#111213]">
                  <th className="py-3 px-4">Control ID</th>
                  <th className="py-3 px-4">Control Requirement</th>
                  <th className="py-3 px-4">Affected Asset</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">SLA Deadline</th>
                  <th className="py-3 px-4 text-right">Automated Fix</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23252a]">
                {failedControls.map((ctl) => (
                  <tr key={ctl.id} className="hover:bg-[#141516] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#5e6ad2]">{ctl.id}</td>

                    <td className="py-3.5 px-4 font-medium text-[#f7f8f8]">{ctl.controlTitle}</td>

                    <td className="py-3.5 px-4 font-mono text-xs text-[#d0d6e0]">{ctl.affectedAsset}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                          ctl.severity === "CRITICAL"
                            ? "bg-[#e5484d]/20 text-[#e5484d]"
                            : "bg-[#f5a623]/20 text-[#f5a623]"
                        }`}
                      >
                        {ctl.severity}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs">
                      <span className={ctl.slaDaysRemaining <= 2 ? "text-[#e5484d] font-bold" : "text-[#f5a623]"}>
                        ⏱ {ctl.slaDaysRemaining} Days Remaining
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleFixControl(ctl.id)}
                        disabled={remediatingId === ctl.id}
                        className="px-3 py-1.5 rounded text-xs font-semibold bg-[#5e6ad2] hover:bg-[#4d59c2] text-white transition-colors disabled:opacity-50"
                      >
                        {remediatingId === ctl.id ? "Applying Policy..." : "⚡ Auto-Remediate"}
                      </button>
                    </td>
                  </tr>
                ))}
                {failedControls.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#27a644] font-medium">
                      ✓ All framework controls are fully compliant! No active violations.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </DashboardShell>
  );
}
