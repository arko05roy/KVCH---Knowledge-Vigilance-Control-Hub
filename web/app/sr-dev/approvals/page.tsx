"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { useState } from "react";

interface ApprovalItem {
  id: string;
  title: string;
  author: { name: string; avatar: string; role: string };
  repo: string;
  prNumber: string;
  impactLevel: "HIGH_PRIVILEGE" | "PROD_DEPLOYMENT" | "SCHEMA_MIGRATION" | "SECURITY_OVERRIDE";
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  timeSubmitted: string;
  diffSummary: string;
  riskFlags: string[];
}

const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: "APR-8810",
    title: "Hotfix: Upgrade auth JWT verification & add multi-tenant org isolation",
    author: { name: "Priya Sharma", avatar: "PS", role: "Sr. Backend Lead" },
    repo: "services/auth-vault",
    prNumber: "PR #342",
    impactLevel: "HIGH_PRIVILEGE",
    status: "PENDING_REVIEW",
    timeSubmitted: "12 minutes ago",
    diffSummary: "+148 lines / -32 lines in core crypto verification path",
    riskFlags: ["Modifies Auth Middleware", "Requires Vault Token Refresh"]
  },
  {
    id: "APR-8809",
    title: "Production DB Migration: Column-level encryption on customer_pii table",
    author: { name: "Alex Vance (AI Subagent)", avatar: "🤖", role: "Database Bot" },
    repo: "databases/core-ledger",
    prNumber: "PR #190",
    impactLevel: "SCHEMA_MIGRATION",
    status: "PENDING_REVIEW",
    timeSubmitted: "45 minutes ago",
    diffSummary: "ALTER TABLE customer_pii ADD COLUMN encrypted_tax_id BYTEA",
    riskFlags: ["Lock Table Risk: Minimal", "Zero Downtime Required"]
  },
  {
    id: "APR-8808",
    title: "Emergency Break-Glass Override: Increase rate-limit on merchant webhook",
    author: { name: "David Chen", avatar: "DC", role: "DevOps Engineer" },
    repo: "gateways/merchant-webhook",
    prNumber: "PR #88",
    impactLevel: "SECURITY_OVERRIDE",
    status: "PENDING_REVIEW",
    timeSubmitted: "2 hours ago",
    diffSummary: "Rate limit expanded from 5,000 req/min to 50,000 req/min during Cyber Sale",
    riskFlags: ["Bypasses Standard WAF Threshold", "Expires in 24 Hours"]
  },
  {
    id: "APR-8807",
    title: "Deploy Payment Gateway Cluster v2.14.0 to APAC Production Region",
    author: { name: "Siddharth Rao", avatar: "SR", role: "Release Manager" },
    repo: "infra/k8s-manifests",
    prNumber: "PR #512",
    impactLevel: "PROD_DEPLOYMENT",
    status: "APPROVED",
    timeSubmitted: "4 hours ago",
    diffSummary: "Canary rollout configured across 4 Kubernetes clusters in ap-south-1",
    riskFlags: ["Canary Threshold: 5%", "Automated Rollback Enabled"]
  }
];

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [filterImpact, setFilterImpact] = useState<string>("ALL");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleAction = (id: string, newStatus: "APPROVED" | "REJECTED") => {
    setApprovals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    setActionNotice(`Approval item ${id} marked as ${newStatus}. Logged to immutable audit trail.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const filteredItems = approvals.filter((item) =>
    filterImpact === "ALL" ? true : item.impactLevel === filterImpact
  );

  return (
    <DashboardShell roleName="Sr. Dev" navItems={[]} hideHeader>
      <div className="flex flex-col h-full bg-[#111213] text-[#e8e8e8] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="w-full sticky top-0 bg-[#1a1b1d]/95 backdrop-blur-md z-10 border-b border-[#2b2c2e] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5e6ad2] animate-pulse" />
            <h1 className="text-[15px] font-medium text-[#e8e8e8]">Senior Developer Approval Queue</h1>
            <span className="text-xs text-[#858688] font-mono">
              ({approvals.filter((a) => a.status === "PENDING_REVIEW").length} Pending Gatekeeping Holds)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-[#5e6ad2]/15 text-[#5e6ad2] border border-[#5e6ad2]/30 text-xs font-mono">
              🛡️ Zero Trust Gatekeeper Active
            </span>
          </div>
        </div>

        {/* Body Container */}
        <div className="max-w-6xl w-full mx-auto px-8 py-6 space-y-6">
          {actionNotice && (
            <div className="p-3 rounded-lg bg-[#2ea043]/15 border border-[#2ea043]/40 text-[#2ea043] text-[13px] flex items-center justify-between">
              <span>✓ {actionNotice}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-[#1a1b1d] border border-[#2b2c2e] p-3 rounded-xl">
            <div className="flex items-center gap-2">
              {[
                { id: "ALL", label: "All Holds" },
                { id: "HIGH_PRIVILEGE", label: "High Privilege" },
                { id: "PROD_DEPLOYMENT", label: "Prod Deployments" },
                { id: "SCHEMA_MIGRATION", label: "Schema Migrations" },
                { id: "SECURITY_OVERRIDE", label: "Security Overrides" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterImpact(f.id)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                    filterImpact === f.id
                      ? "bg-[#5e6ad2] text-white"
                      : "bg-[#262729] text-[#858688] hover:text-[#e8e8e8]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-[12px] text-[#858688] font-mono">
              Showing {filteredItems.length} approval requests
            </span>
          </div>

          {/* Request Cards */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-xl border transition-all ${
                  item.status === "PENDING_REVIEW"
                    ? "bg-[#1a1b1d] border-[#2b2c2e] hover:border-[#5e6ad2]/50"
                    : "bg-[#141516] border-[#23252a] opacity-75"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#5e6ad2]">{item.id}</span>
                      <span className="text-[#858688] text-xs">·</span>
                      <span className="font-mono text-xs text-[#858688]">{item.prNumber}</span>
                      <span className="text-[#858688] text-xs">·</span>
                      <span className="font-mono text-xs text-[#c4c5c7]">{item.repo}</span>
                      <span className="text-[#858688] text-xs">·</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                          item.impactLevel === "HIGH_PRIVILEGE" || item.impactLevel === "SECURITY_OVERRIDE"
                            ? "bg-[#eb5757]/20 text-[#eb5757] border border-[#eb5757]/30"
                            : "bg-[#f2c94c]/20 text-[#f2c94c] border border-[#f2c94c]/30"
                        }`}
                      >
                        {item.impactLevel.replace("_", " ")}
                      </span>
                    </div>

                    <h3 className="text-[15px] font-semibold text-[#e8e8e8]">{item.title}</h3>

                    <div className="p-2.5 rounded bg-[#111213] border border-[#2b2c2e] font-mono text-[12px] text-[#c4c5c7]">
                      <code>{item.diffSummary}</code>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {item.riskFlags.map((flag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-[#262729] text-[#858688] border border-[#2b2c2e]">
                          ⚠️ {flag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <div className="text-right mr-2 hidden sm:block">
                      <div className="text-xs font-medium text-[#e8e8e8]">{item.author.name}</div>
                      <div className="text-[11px] text-[#858688]">{item.author.role}</div>
                    </div>

                    {item.status === "PENDING_REVIEW" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(item.id, "REJECTED")}
                          className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-[#262729] hover:bg-[#eb5757]/20 hover:text-[#eb5757] text-[#c4c5c7] border border-[#2b2c2e] transition-colors"
                        >
                          Reject Hold
                        </button>
                        <button
                          onClick={() => handleAction(item.id, "APPROVED")}
                          className="px-4 py-1.5 rounded-md text-xs font-semibold bg-[#5e6ad2] hover:bg-[#4d59c2] text-white shadow-sm transition-colors flex items-center gap-1"
                        >
                          ✓ Approve & Deploy
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold font-mono ${
                          item.status === "APPROVED"
                            ? "bg-[#2ea043]/20 text-[#2ea043] border border-[#2ea043]/40"
                            : "bg-[#eb5757]/20 text-[#eb5757] border border-[#eb5757]/40"
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
