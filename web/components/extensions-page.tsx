"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";

const EXTENSIONS = [
  {
    id: "pr-assistant",
    name: "PR Assistant",
    description: "Automates pull request descriptions and flags missing tests or common anti-patterns before review.",
    icon: <svg className="w-5 h-5 text-[#5e6ad2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
    iconBg: "bg-[#5e6ad2]/10",
    author: "KVCH Security",
    installs: "1.2k"
  },
  {
    id: "code-review",
    name: "Code Review Explainer",
    description: "Analyzes feedback from senior engineers and provides step-by-step technical context to help you learn.",
    icon: <svg className="w-5 h-5 text-[#2ea043]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/></svg>,
    iconBg: "bg-[#2ea043]/10",
    author: "Core DX",
    installs: "854"
  },
  {
    id: "test-gen",
    name: "Test Generator",
    description: "Automatically scaffolds unit tests and integration mocks based on your function signatures and logic.",
    icon: <svg className="w-5 h-5 text-[#56ccf2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    iconBg: "bg-[#56ccf2]/10",
    author: "QA Systems",
    installs: "3.4k"
  },
  {
    id: "doc-builder",
    name: "Doc Builder",
    description: "Generates JSDoc/TSDoc comments and updates internal markdown wikis when you push new features.",
    icon: <svg className="w-5 h-5 text-[#f2c94c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    iconBg: "bg-[#f2c94c]/10",
    author: "Knowledge Team",
    installs: "412"
  },
  {
    id: "lint-fixer",
    name: "Lint Auto-Fixer",
    description: "Runs continuous background analysis and automatically pushes commits that fix standard style violations.",
    icon: <svg className="w-5 h-5 text-[#eb5757]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    iconBg: "bg-[#eb5757]/10",
    author: "Core DX",
    installs: "2.1k"
  },
  {
    id: "pattern-learner",
    name: "Pattern Learner",
    description: "Suggests internal codebase patterns (e.g. KVCH standard error handlers) directly inside your editor.",
    icon: <svg className="w-5 h-5 text-[#9b51e0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    iconBg: "bg-[#9b51e0]/10",
    author: "Architecture",
    installs: "589"
  }
];

export function ExtensionsPage({ roleName }: { roleName: string }) {
  const [installed, setInstalled] = useState<Record<string, boolean>>({ "pr-assistant": true });

  const toggleInstall = (id: string) => {
    setInstalled(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <DashboardShell roleName={roleName} navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#111213] text-[#e8e8e8] overflow-hidden">
        
        {/* Header Area */}
        <div className="flex flex-col px-8 pt-5 pb-4 border-b border-[#2b2c2e] shrink-0 bg-[#111213] z-20 sticky top-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[14px] font-medium text-[#e8e8e8]">Extensions Marketplace</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#858688]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  placeholder="Search extensions..." 
                  className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-md pl-9 pr-4 py-1.5 text-[12px] text-[#e8e8e8] placeholder-[#858688] focus:outline-none focus:border-[#5e6ad2] transition-colors w-64"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 items-center text-[13px]">
            <button className="px-3 py-1.5 bg-[#262729] rounded-full font-medium text-[#e8e8e8]">Discover</button>
            <button className="px-3 py-1.5 text-[#858688] hover:bg-[#1a1b1d] rounded-full transition-colors">Installed</button>
            <button className="px-3 py-1.5 text-[#858688] hover:bg-[#1a1b1d] rounded-full transition-colors">Updates available (1)</button>
          </div>
        </div>

        {/* Marketplace Grid */}
        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXTENSIONS.map(ext => (
              <div key={ext.id} className="bg-[#1a1b1d] border border-[#2b2c2e] rounded-xl p-5 flex flex-col hover:border-[#424345] transition-colors group">
                <div className="flex items-start justify-end mb-4">
                  <button 
                    onClick={() => toggleInstall(ext.id)}
                    className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
                      installed[ext.id] 
                        ? 'bg-[#262729] text-[#a1a3a6] hover:bg-[#2b2c2e]' 
                        : 'bg-[#5e6ad2] text-white hover:bg-[#4a55b8]'
                    }`}
                  >
                    {installed[ext.id] ? 'Installed' : 'Add plugin'}
                  </button>
                </div>
                
                <h3 className="text-[14px] font-medium text-[#e8e8e8] mb-1.5">{ext.name}</h3>
                <p className="text-[13px] text-[#858688] leading-relaxed mb-6 flex-1">
                  {ext.description}
                </p>
                
                <div className="flex items-center justify-between text-[11px] text-[#5c5d5f] pt-4 border-t border-[#2b2c2e]/50">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {ext.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    {ext.installs}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
