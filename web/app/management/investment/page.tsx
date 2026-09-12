"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { useState } from "react";

interface InvestmentCategory {
  category: string;
  allocatedINR: number;
  percentage: number;
  description: string;
  roiMultiplier: string;
  status: "OPTIMAL" | "OVERBUDGET" | "UNDERINVESTED";
}

const INITIAL_INVESTMENTS: InvestmentCategory[] = [
  {
    category: "New Product Innovation (R&D)",
    allocatedINR: 45000000,
    percentage: 45,
    description: "AI-driven merchant checkout & instant settlement features.",
    roiMultiplier: "3.4x ARR Impact",
    status: "OPTIMAL"
  },
  {
    category: "Technical Debt & Refactoring",
    allocatedINR: 25000000,
    percentage: 25,
    description: "PostgreSQL index optimization, legacy monolith decoupling & test suite speedups.",
    roiMultiplier: "2.1x Risk Reduction",
    status: "OPTIMAL"
  },
  {
    category: "Cyber Vigilance & Risk Shielding",
    allocatedINR: 20000000,
    percentage: 20,
    description: "PAM credential automation, Zero Trust bastions & threat hunting engines.",
    roiMultiplier: "4.8x Incident Savings",
    status: "OPTIMAL"
  },
  {
    category: "Developer Experience (DevEx)",
    allocatedINR: 10000000,
    percentage: 10,
    description: "CI/CD pipeline speed, localized preview environments & AI agent tooling.",
    roiMultiplier: "1.8x Velocity Boost",
    status: "UNDERINVESTED"
  }
];

export default function InvestmentPage() {
  const [investments, setInvestments] = useState<InvestmentCategory[]>(INITIAL_INVESTMENTS);

  const formatINR = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  return (
    <DashboardShell roleName="Management" navItems={[]} hideHeader>
      <div className="flex flex-col h-full bg-[#111213] text-[#e8e8e8] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="w-full sticky top-0 bg-[#1a1b1d]/95 backdrop-blur-md z-10 border-b border-[#2b2c2e] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5e6ad2]" />
            <h1 className="text-[15px] font-medium text-[#e8e8e8]">Business Impact & Engineering Capital Investment</h1>
            <span className="text-xs text-[#858688] font-mono">(FY26 Q3 Budget Allocation)</span>
          </div>

          <button className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#5e6ad2] text-white hover:bg-[#4d59c2] transition-colors">
            📊 Export Financial Board Deck
          </button>
        </div>

        {/* Body */}
        <div className="max-w-6xl w-full mx-auto px-8 py-6 space-y-6">
          
          {/* Executive Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e]">
              <span className="text-[12px] text-[#858688] uppercase font-medium">Total Engineering Budget</span>
              <div className="text-2xl font-bold text-[#f7f8f8] mt-1 font-mono">₹10.00 Cr</div>
              <span className="text-[11px] text-[#2ea043] mt-1 inline-block">100% Allocated</span>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e]">
              <span className="text-[12px] text-[#858688] uppercase font-medium">Expected ARR Lift</span>
              <div className="text-2xl font-bold text-[#2ea043] mt-1 font-mono">+ ₹15.2 Cr</div>
              <span className="text-[11px] text-[#858688] mt-1 inline-block">Direct feature return</span>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e]">
              <span className="text-[12px] text-[#858688] uppercase font-medium">Loss Avoided (EAL)</span>
              <div className="text-2xl font-bold text-[#5e6ad2] mt-1 font-mono">₹8.4 Cr</div>
              <span className="text-[11px] text-[#858688] mt-1 inline-block">Via Monte Carlo Risk Control</span>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1b1d] border border-[#2b2c2e]">
              <span className="text-[12px] text-[#858688] uppercase font-medium">Tech Debt Paydown Ratio</span>
              <div className="text-2xl font-bold text-[#f2c94c] mt-1 font-mono">25.0%</div>
              <span className="text-[11px] text-[#858688] mt-1 inline-block">Healthy benchmark ratio</span>
            </div>
          </div>

          {/* Capital Distribution Table */}
          <div className="rounded-xl border border-[#2b2c2e] bg-[#1a1b1d] overflow-hidden">
            <div className="p-4 border-b border-[#2b2c2e] flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#e8e8e8]">Resource & Capital Distribution Breakdown</h2>
              <span className="text-xs text-[#858688] font-mono">Q3 Portfolio Strategy</span>
            </div>

            <div className="divide-y divide-[#2b2c2e]">
              {investments.map((inv, idx) => (
                <div key={idx} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#141516] transition-colors">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[15px] text-[#e8e8e8]">{inv.category}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          inv.status === "OPTIMAL"
                            ? "bg-[#2ea043]/20 text-[#2ea043]"
                            : "bg-[#f2c94c]/20 text-[#f2c94c]"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>

                    <p className="text-[13px] text-[#858688]">{inv.description}</p>

                    {/* Progress bar */}
                    <div className="w-full bg-[#111213] h-2 rounded-full overflow-hidden max-w-md mt-2">
                      <div className="bg-[#5e6ad2] h-full rounded-full" style={{ width: `${inv.percentage}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 font-mono text-right">
                    <div>
                      <div className="text-base font-bold text-[#e8e8e8]">{formatINR(inv.allocatedINR)}</div>
                      <div className="text-xs text-[#858688]">{inv.percentage}% of total budget</div>
                    </div>

                    <div className="pl-4 border-l border-[#2b2c2e]">
                      <div className="text-xs font-semibold text-[#2ea043]">{inv.roiMultiplier}</div>
                      <div className="text-[11px] text-[#858688]">Calculated Return</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
