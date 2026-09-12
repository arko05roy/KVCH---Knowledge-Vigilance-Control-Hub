"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RiskNavTabs } from "@/components/risk-nav";
import { DashboardShell } from "@/components/dashboard-shell";

interface GuardrailPolicy {
  id: string;
  name: string;
  category: "PR Review" | "Secret Scanning" | "Dependency Audit" | "Access Control" | "AI Execution";
  description: string;
  mode: "ENFORCE" | "AUDIT" | "DISABLED";
  severityOnTrigger: "BLOCK_PR" | "QUARANTINE" | "WARN_DEV";
  enforcedRepositories: string;
  lastTriggered: string;
}

const INITIAL_POLICIES: GuardrailPolicy[] = [
  {
    id: "POL-001",
    name: "Block Commit on Hardcoded Secret / API Key Exposure",
    category: "Secret Scanning",
    description: "Scans code diffs for AWS keys, JWT private keys, and API tokens before git push succeeds.",
    mode: "ENFORCE",
    severityOnTrigger: "BLOCK_PR",
    enforcedRepositories: "All 18 Repositories",
    lastTriggered: "2 minutes ago"
  },
  {
    id: "POL-002",
    name: "Mandatory Senior Dev Sign-off on High-Risk Infrastructure Files",
    category: "PR Review",
    description: "Requires explicit signoff from a Senior Dev when editing Terraform, Auth, or DB schemas.",
    mode: "ENFORCE",
    severityOnTrigger: "BLOCK_PR",
    enforcedRepositories: "Core Banking & Payment Repos",
    lastTriggered: "3 hours ago"
  },
  {
    id: "POL-003",
    name: "Quarantine Unverified NPM Dependencies with Postinstall Scripts",
    category: "Dependency Audit",
    description: "Blocks automated installation of packages with fewer than 10,000 monthly downloads.",
    mode: "ENFORCE",
    severityOnTrigger: "QUARANTINE",
    enforcedRepositories: "All Frontend & Node Services",
    lastTriggered: "14 minutes ago"
  },
  {
    id: "POL-004",
    name: "AI Prompt PII & Raw SQL Query String Prevention",
    category: "AI Execution",
    description: "Inspects subagent prompts for unmasked PII or direct unparameterized query generation requests.",
    mode: "AUDIT",
    severityOnTrigger: "WARN_DEV",
    enforcedRepositories: "AI Subagent Runtime Environment",
    lastTriggered: "45 minutes ago"
  },
  {
    id: "POL-005",
    name: "Privileged PAM Credential Max Lifetime Enforcement (30 Days)",
    category: "Access Control",
    description: "Automatically invalidates PAM credentials and database access keys that exceed 30-day age.",
    mode: "ENFORCE",
    severityOnTrigger: "QUARANTINE",
    enforcedRepositories: "Production Database Cluster",
    lastTriggered: "1 day ago"
  }
];

export default function RiskPoliciesPage() {
  const [policies, setPolicies] = useState<GuardrailPolicy[]>(INITIAL_POLICIES);
  const [editingPolicy, setEditingPolicy] = useState<GuardrailPolicy | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<string | null>(null);

  const togglePolicyMode = (id: string) => {
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextMode: GuardrailPolicy["mode"] =
            p.mode === "ENFORCE" ? "AUDIT" : p.mode === "AUDIT" ? "DISABLED" : "ENFORCE";
          return { ...p, mode: nextMode };
        }
        return p;
      })
    );
  };

  const handleSimulateRule = () => {
    setSimulating(true);
    setSimResult(null);
    setTimeout(() => {
      setSimulating(false);
      setSimResult("✓ Policy Engine Evaluation Passed: 45 commits evaluated, 2 violations successfully caught in ENFORCE mode.");
    }, 1500);
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
                  <span className="text-[13px] font-semibold text-[#5e6ad2] tracking-wide uppercase">Guardrail Policy Engine</span>
                  <span className="text-[#8a8f98] text-[12px]">·</span>
                  <span className="text-[12px] text-[#27a644] font-mono">Active Policy Shield</span>
                </div>
                <h1 className="text-lg font-semibold text-[#f7f8f8] leading-tight">
                  Security Rules, PR Review Gates & Autonomous AI Constraints
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSimulateRule}
                disabled={simulating}
                className="px-3.5 py-1.5 rounded-md text-[13px] font-medium bg-[#141516] text-[#f7f8f8] border border-[#23252a] hover:bg-[#1f2125] transition-colors"
              >
                {simulating ? "Evaluating..." : "⚡ Run Policy Simulator"}
              </button>
              <button
                onClick={() => setShowNewModal(true)}
                className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold bg-[#5e6ad2] hover:bg-[#4d59c2] text-white shadow-sm transition-colors flex items-center gap-1.5"
              >
                + Create Guardrail Rule
              </button>
            </div>
          </div>
        </header>

        {/* Sub Navigation */}
        <RiskNavTabs />

        {/* Main Content */}
        <main className="max-w-7xl w-full mx-auto px-6 py-8 flex-1">
          {simResult && (
            <div className="mb-6 p-3 rounded-lg bg-[#27a644]/15 border border-[#27a644]/40 text-[#27a644] text-[13px] flex items-center justify-between">
              <span>{simResult}</span>
            </div>
          )}

          {/* Engine Summary Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-5 rounded-xl bg-[#0f1011] border border-[#23252a]">
              <span className="text-[12px] text-[#8a8f98] font-medium uppercase tracking-wider">Active Enforced Policies</span>
              <div className="text-3xl font-extrabold text-[#27a644] mt-1 font-mono">
                {policies.filter((p) => p.mode === "ENFORCE").length}
              </div>
              <span className="text-xs text-[#8a8f98] mt-1 inline-block">Blocking high-risk commits instantly</span>
            </div>

            <div className="p-5 rounded-xl bg-[#0f1011] border border-[#23252a]">
              <span className="text-[12px] text-[#8a8f98] font-medium uppercase tracking-wider">Audit Mode Rules</span>
              <div className="text-3xl font-extrabold text-[#f5a623] mt-1 font-mono">
                {policies.filter((p) => p.mode === "AUDIT").length}
              </div>
              <span className="text-xs text-[#8a8f98] mt-1 inline-block">Logging events without blocking</span>
            </div>

            <div className="p-5 rounded-xl bg-[#0f1011] border border-[#23252a]">
              <span className="text-[12px] text-[#8a8f98] font-medium uppercase tracking-wider">Policy Triggers (24h)</span>
              <div className="text-3xl font-extrabold text-[#5e6ad2] mt-1 font-mono">18 Triggers</div>
              <span className="text-xs text-[#8a8f98] mt-1 inline-block">Zero security regressions introduced</span>
            </div>
          </div>

          {/* Policy List */}
          <div className="space-y-4">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="p-5 rounded-xl bg-[#0f1011] border border-[#23252a] hover:border-[#34343a] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#5e6ad2]">{policy.id}</span>
                    <span className="text-[#8a8f98] text-xs">·</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-[#141516] text-[#d0d6e0] border border-[#23252a]">
                      {policy.category}
                    </span>
                    <span className="text-[#8a8f98] text-xs">·</span>
                    <span className="text-xs text-[#8a8f98]">Repositories: {policy.enforcedRepositories}</span>
                  </div>

                  <h3 className="text-base font-semibold text-[#f7f8f8]">{policy.name}</h3>
                  <p className="text-xs text-[#8a8f98] mt-1">{policy.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Mode Toggle Button */}
                  <button
                    onClick={() => togglePolicyMode(policy.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                      policy.mode === "ENFORCE"
                        ? "bg-[#27a644]/20 text-[#27a644] border-[#27a644]/40 hover:bg-[#27a644]/30"
                        : policy.mode === "AUDIT"
                        ? "bg-[#f5a623]/20 text-[#f5a623] border-[#f5a623]/40 hover:bg-[#f5a623]/30"
                        : "bg-[#18191a] text-[#8a8f98] border-[#23252a] hover:text-[#d0d6e0]"
                    }`}
                  >
                    MODE: {policy.mode}
                  </button>

                  <span className="px-2.5 py-1 rounded text-[11px] font-mono bg-[#141516] text-[#8a8f98] border border-[#23252a]">
                    Action: <strong className="text-[#f7f8f8]">{policy.severityOnTrigger}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal for creating rule */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1011] border border-[#23252a] rounded-xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#f7f8f8]">Create Guardrail Rule</h2>
            <p className="text-xs text-[#8a8f98]">Define automated security constraints for commits, PRs, and AI subagents.</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#8a8f98] block mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Block unencrypted TLS connections in Production"
                  className="w-full bg-[#141516] border border-[#23252a] rounded-lg px-3 py-2 text-xs text-[#f7f8f8] outline-none focus:border-[#5e6ad2]"
                />
              </div>

              <div>
                <label className="text-xs text-[#8a8f98] block mb-1">Category</label>
                <select className="w-full bg-[#141516] border border-[#23252a] rounded-lg px-3 py-2 text-xs text-[#f7f8f8] outline-none cursor-pointer">
                  <option>PR Review</option>
                  <option>Secret Scanning</option>
                  <option>Dependency Audit</option>
                  <option>Access Control</option>
                  <option>AI Execution</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#8a8f98] block mb-1">Rule Action Mode</label>
                <select className="w-full bg-[#141516] border border-[#23252a] rounded-lg px-3 py-2 text-xs text-[#f7f8f8] outline-none cursor-pointer">
                  <option>ENFORCE (Block Commit / PR)</option>
                  <option>AUDIT (Log Event Only)</option>
                  <option>DISABLED</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#23252a]">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-md text-xs bg-[#141516] text-[#8a8f98] hover:text-[#f7f8f8]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowNewModal(false);
                }}
                className="px-4 py-2 rounded-md text-xs font-semibold bg-[#5e6ad2] text-white hover:bg-[#4d59c2]"
              >
                Save & Deploy Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
