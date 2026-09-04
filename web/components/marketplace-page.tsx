"use client";

import React from "react";
import { DashboardShell } from "@/components/dashboard-shell";

const PLUGINS = [
  {
    id: "web-scraper",
    name: "Web Scraper",
    description: "Extract data from websites and structured sources with ease.",
    category: "Productivity",
    color: "#9b51e0",
    bgClass: "bg-[#9b51e0]/10",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
  },
  {
    id: "db-connector",
    name: "Database Connector",
    description: "Connect and interact with your databases seamlessly.",
    category: "Integrations",
    color: "#2ea043",
    bgClass: "bg-[#2ea043]/10",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
  },
  {
    id: "slack-notifier",
    name: "Slack Notifier",
    description: "Send notifications and updates directly to Slack channels.",
    category: "Integrations",
    color: "#f2994a",
    bgClass: "bg-[#f2994a]/10",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> // close enough
  },
  {
    id: "calendar-assistant",
    name: "Calendar Assistant",
    description: "Schedule meetings, manage events, and sync with calendars.",
    category: "Productivity",
    color: "#2f80ed",
    bgClass: "bg-[#2f80ed]/10",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  },
  {
    id: "doc-summarizer",
    name: "Doc Summarizer",
    description: "Summarize long documents and extract key insights instantly.",
    category: "AI Tools",
    color: "#f2c94c",
    bgClass: "bg-[#f2c94c]/10",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  },
  {
    id: "analytics-tracker",
    name: "Analytics Tracker",
    description: "Track metrics and visualize performance in real-time.",
    category: "Utilities",
    color: "#56ccf2",
    bgClass: "bg-[#56ccf2]/10",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  },
  {
    id: "email-automation",
    name: "Email Automation",
    description: "Automate email workflows and manage your inbox efficiently.",
    category: "Productivity",
    color: "#eb5757",
    bgClass: "bg-[#eb5757]/10",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  },
  {
    id: "github-sync",
    name: "GitHub Sync",
    description: "Sync issues, pull requests, and code updates automatically.",
    category: "Integrations",
    color: "#9b51e0",
    bgClass: "bg-[#9b51e0]/10",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
  },
  {
    id: "translator",
    name: "Translator",
    description: "Translate text across multiple languages instantly.",
    category: "AI Tools",
    color: "#2f80ed",
    bgClass: "bg-[#2f80ed]/10",
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> // close enough
  }
];

export function MarketplacePage({ roleName }: { roleName: string }) {
  return (
    <DashboardShell roleName={roleName} navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#111213] text-[#e8e8e8] overflow-y-auto">
        
        <div className="px-12 pt-16 pb-12 max-w-[1200px] w-full mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-[28px] font-semibold text-[#e8e8e8] tracking-tight mb-2">Agentic plugins. Limitless possibilities.</h1>
            <p className="text-[#858688] text-[15px] max-w-[500px] leading-relaxed">
              Extend your agents with powerful plugins built by our community.<br/>
              Automate workflows, connect tools, and boost productivity.
            </p>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-1 items-center text-[13px] font-medium">
              <button className="px-4 py-2 bg-[#262729] rounded-full text-[#e8e8e8]">All plugins</button>
              <button className="px-4 py-2 text-[#858688] hover:text-[#c4c5c7] transition-colors">Productivity</button>
              <button className="px-4 py-2 text-[#858688] hover:text-[#c4c5c7] transition-colors">Integrations</button>
              <button className="px-4 py-2 text-[#858688] hover:text-[#c4c5c7] transition-colors">AI Tools</button>
              <button className="px-4 py-2 text-[#858688] hover:text-[#c4c5c7] transition-colors">Utilities</button>
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search plugins..." 
                className="bg-transparent border border-[#2b2c2e] rounded-md pl-4 pr-10 py-1.5 text-[13px] text-[#e8e8e8] placeholder-[#5c5d5f] focus:outline-none focus:border-[#5e6ad2] transition-colors w-64"
              />
              <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#5c5d5f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PLUGINS.map(plugin => (
              <div key={plugin.id} className="bg-[#161718] border border-[#2b2c2e] rounded-xl flex flex-col group hover:border-[#424345] transition-colors">
                
                <div className="flex items-start p-5 flex-1 gap-4">
                  <div className={`w-12 h-12 rounded-lg flex flex-shrink-0 items-center justify-center ${plugin.bgClass}`} style={{ color: plugin.color }}>
                    {plugin.icon}
                  </div>
                  
                  <div className="flex flex-col">
                    <h3 className="text-[15px] font-medium text-[#e8e8e8] mb-1">{plugin.name}</h3>
                    <p className="text-[13px] text-[#858688] leading-snug mb-3">
                      {plugin.description}
                    </p>
                    <span className="text-[11px] font-medium" style={{ color: plugin.color }}>
                      {plugin.category}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#2b2c2e] flex items-center justify-between px-5 py-3 text-[#858688] hover:text-[#e8e8e8] cursor-pointer hover:bg-[#1a1b1d] rounded-b-xl transition-colors">
                  <span className="text-[13px] font-medium">Add plugin</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>

              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-[13px] text-[#858688]">
            Can&apos;t find what you&apos;re looking for? <a href="#" className="text-[#2f80ed] hover:underline ml-1 inline-flex items-center gap-1">Request a plugin <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}
