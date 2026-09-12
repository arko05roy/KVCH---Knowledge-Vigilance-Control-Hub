"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export const RISK_NAV_ITEMS = [
  { label: "Overview & Monte Carlo", href: "/risk-intelligence" },
  { label: "Threat Monitor", href: "/risk-intelligence/threats", badge: "Live" },
  { label: "Forensic Audits", href: "/risk-intelligence/audits" },
  { label: "Compliance Scorecard", href: "/risk-intelligence/compliance" },
  { label: "Security Guardrails", href: "/risk-intelligence/policies" },
];

export function RiskNavTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-[#23252a] bg-[#0b0c0d] px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-none pt-2">
        {RISK_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-[#5e6ad2] text-[#f7f8f8] bg-[#141516]/50 rounded-t-md"
                  : "border-transparent text-[#8a8f98] hover:text-[#d0d6e0] hover:border-[#34343a]"
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-[#27a644]/20 text-[#27a644] border border-[#27a644]/30 animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
