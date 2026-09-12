"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { useState } from "react";

interface HRPolicy {
  id: string;
  title: string;
  category: "IP Protection" | "Security Training" | "Remote Work" | "Code Ethics";
  acknowledgmentRate: number;
  unacknowledgedCount: number;
  lastUpdated: string;
  status: "ACTIVE" | "REVISION_REQUIRED";
  summary: string;
}

const MOCK_HR_POLICIES: HRPolicy[] = [
  {
    id: "HRP-101",
    title: "Enterprise IP Protection & Proprietary Code Handling Policy",
    category: "IP Protection",
    acknowledgmentRate: 98,
    unacknowledgedCount: 3,
    lastUpdated: "2026-08-15",
    status: "ACTIVE",
    summary: "Strict guidelines prohibiting export of enterprise source code to unauthorized personal AI models or public repositories."
  },
  {
    id: "HRP-102",
    title: "Mandatory Quarterly Cybersecurity & Threat Vigilance Certification",
    category: "Security Training",
    acknowledgmentRate: 92,
    unacknowledgedCount: 11,
    lastUpdated: "2026-09-01",
    status: "ACTIVE",
    summary: "Quarterly training covering phishing defense, PAM secret rotation, and social engineering vigilance."
  },
  {
    id: "HRP-103",
    title: "Zero Trust Remote Access & Encrypted VPN Hardware Guidelines",
    category: "Remote Work",
    acknowledgmentRate: 100,
    unacknowledgedCount: 0,
    lastUpdated: "2026-07-20",
    status: "ACTIVE",
    summary: "Requires hardware token MFA and KVCH VPN connection for all remote engineering activities."
  },
  {
    id: "HRP-104",
    title: "Autonomous AI Coding Agent Oversight & Pair-Programming Charter",
    category: "Code Ethics",
    acknowledgmentRate: 86,
    unacknowledgedCount: 19,
    lastUpdated: "2026-09-10",
    status: "REVISION_REQUIRED",
    summary: "Mandating human senior dev sign-off on all AI-generated database schema changes and authentication logic."
  }
];

export default function PoliciesPage() {
  const [policies] = useState<HRPolicy[]>(MOCK_HR_POLICIES);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const triggerRemindAll = (id: string, title: string) => {
    setNotice(`Automated reminder notification sent to unacknowledged employees for policy '${title}'.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const filtered = policies.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardShell roleName="HR" navItems={[]} hideHeader>
      <div className="flex flex-col h-full bg-[#111213] text-[#e8e8e8] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="w-full sticky top-0 bg-[#1a1b1d]/95 backdrop-blur-md z-10 border-b border-[#2b2c2e] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ea043]" />
            <h1 className="text-[15px] font-medium text-[#e8e8e8]">Enterprise HR Policy & Governance Compliance</h1>
            <span className="text-xs text-[#858688] font-mono">(94.2% Overall Acknowledgment Rate)</span>
          </div>

          <button className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#5e6ad2] text-white hover:bg-[#4d59c2] transition-colors">
            + Publish New Policy Document
          </button>
        </div>

        {/* Body */}
        <div className="max-w-6xl w-full mx-auto px-8 py-6 space-y-6">
          {notice && (
            <div className="p-3 rounded-lg bg-[#2ea043]/15 border border-[#2ea043]/40 text-[#2ea043] text-[13px]">
              ✓ {notice}
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center gap-2 bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl px-4 py-2">
            <svg className="w-4 h-4 text-[#858688]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search policies by title, category, or policy ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-[13px] text-[#e8e8e8] placeholder-[#5c5d5f] outline-none w-full"
            />
          </div>

          {/* Policy Cards */}
          <div className="space-y-4">
            {filtered.map((policy) => (
              <div
                key={policy.id}
                className="p-5 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e] hover:border-[#5e6ad2]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#5e6ad2]">{policy.id}</span>
                    <span className="text-[#858688] text-xs">·</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#262729] text-[#c4c5c7]">
                      {policy.category}
                    </span>
                    <span className="text-[#858688] text-xs">·</span>
                    <span className="text-xs text-[#858688]">Updated: {policy.lastUpdated}</span>
                  </div>

                  <h3 className="text-[15px] font-semibold text-[#e8e8e8]">{policy.title}</h3>
                  <p className="text-[13px] text-[#858688]">{policy.summary}</p>

                  <div className="flex items-center gap-4 text-xs text-[#858688] pt-1">
                    <span>Acknowledgment Rate: <strong className="text-[#2ea043]">{policy.acknowledgmentRate}%</strong></span>
                    <span>Pending Signatures: <strong className="text-[#f2c94c]">{policy.unacknowledgedCount} Employees</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {policy.unacknowledgedCount > 0 && (
                    <button
                      onClick={() => triggerRemindAll(policy.id, policy.title)}
                      className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-[#262729] hover:bg-[#5e6ad2]/20 hover:text-[#5e6ad2] text-[#c4c5c7] border border-[#2b2c2e] transition-colors"
                    >
                      🔔 Send Reminder
                    </button>
                  )}
                  <button className="px-4 py-1.5 rounded-md text-xs font-semibold bg-[#141516] text-[#e8e8e8] border border-[#2b2c2e] hover:bg-[#262729] transition-colors">
                    📄 View Policy PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
