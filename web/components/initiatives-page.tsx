"use client";

import React from "react";
import { DashboardShell } from "@/components/dashboard-shell";

const INITIATIVES_DATA = [
  {
    id: "core-product",
    name: "Core product",
    icon: <svg className="w-4 h-4 text-[#56ccf2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    iconBg: "bg-[#56ccf2]/10",
    target: "2026",
    health: "On track",
    projects: "23 / 102",
    activeProjects: [{ color: "#2ea043", count: 28 }, { color: "#f2c94c", count: 8 }, { color: "#858688", count: 4 }],
    activity: "up",
    children: [
      {
        id: "infra",
        name: "Infra stability",
        icon: <svg className="w-4 h-4 text-[#56ccf2]" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="7" width="20" height="10" rx="2" ry="2"/><path d="M6 12h12M6 15h12M12 4v3M12 17v3"/></svg>,
        target: "2026",
        health: "On track",
        projects: "41 / 193",
        activeProjects: [{ color: "#2ea043", count: 83 }, { color: "#f2c94c", count: 12 }],
        activity: "up",
      },
      {
        id: "autonomous",
        name: "Autonomous systems",
        icon: <svg className="w-4 h-4 text-[#56ccf2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
        target: "2026",
        health: "At risk",
        projects: "51 / 205",
        activeProjects: [{ color: "#2ea043", count: 98 }, { color: "#858688", count: 10 }, { color: "#858688", count: 24 }],
        activity: "up",
        children: [
          {
            id: "vehicle-intel",
            name: "Vehicle intelligence",
            description: "Prediction and decision-making systems",
            icon: <svg className="w-4 h-4 text-[#56ccf2]" viewBox="0 0 24 24" fill="currentColor"><path d="M9 18h6v2H9zM12 2a6 6 0 0 0-6 6c0 2.21 1.2 4.13 3 5.19V16h6v-2.81c1.8-1.06 3-2.98 3-5.19a6 6 0 0 0-6-6z"/></svg>,
            target: "Q3 2026",
            health: "Off track",
            projects: "12 / 85",
            activeProjects: [{ color: "#2ea043", count: 12 }, { color: "#f2c94c", count: 35 }],
            activity: "dash",
          },
          {
            id: "safety",
            name: "Safety & reliability",
            description: "Validation, monitoring, and failure handling",
            icon: <svg className="w-4 h-4 text-[#56ccf2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
            target: "H1 2026",
            health: "On track",
            projects: "22 / 65",
            activeProjects: [{ color: "#2ea043", count: 24 }, { color: "#f2c94c", count: 24 }],
            activity: "up",
          },
        ]
      },
      {
        id: "mobile-apps",
        name: "Mobile apps",
        icon: <svg className="w-4 h-4 text-[#56ccf2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
        target: "Q1 2026",
        health: "On track",
        projects: "8 / 127",
        activeProjects: [{ color: "#2ea043", count: 79 }],
        activity: "dash",
      },
    ]
  },
  {
    id: "apac",
    name: "APAC Expansion",
    icon: <svg className="w-4 h-4 text-[#eb5757]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
    iconBg: "bg-[#eb5757]/10",
    target: "2026",
    health: "On track",
    projects: "14 / 32",
    activeProjects: [{ color: "#2ea043", count: 22 }, { color: "#f2c94c", count: 2 }],
    activity: "up",
    children: [
      {
        id: "japan",
        name: "Japan Launch",
        icon: <svg className="w-4 h-4 text-[#eb5757]" viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
        target: "Q2 2026",
        health: "On track",
        projects: "2 / 15",
        activeProjects: [{ color: "#2ea043", count: 9 }, { color: "#f2c94c", count: 2 }],
        activity: "up",
      },
      {
        id: "localization",
        name: "Localization efforts",
        icon: <svg className="w-4 h-4 text-[#eb5757]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
        target: "H2 2026",
        health: "At risk",
        projects: "4 / 18",
        activeProjects: [{ color: "#2ea043", count: 6 }, { color: "#f2c94c", count: 1 }, { color: "#858688", count: 2 }],
        activity: "up",
      },
    ]
  }
];

export function InitiativesPage({ roleName }: { roleName: string }) {
  
  const renderHealth = (health: string) => {
    switch(health) {
      case 'On track':
        return <span className="flex items-center gap-1.5 text-[#2ea043]"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> {health}</span>;
      case 'At risk':
        return <span className="flex items-center gap-1.5 text-[#f2c94c]"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg> {health}</span>;
      case 'Off track':
        return <span className="flex items-center gap-1.5 text-[#eb5757]"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg> {health}</span>;
      default:
        return <span>{health}</span>;
    }
  };

  const renderActivity = (activity: string) => {
    if (activity === 'up') return <svg className="w-4 h-4 text-[#2ea043]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15"/><polyline points="18 10 12 4 6 10" className="opacity-50"/></svg>;
    if (activity === 'dash') return <span className="text-[#858688]">—</span>;
    return null;
  };

  const renderRow = (item: any, depth = 0, isLastChild = false, parentLines: boolean[] = []) => {
    const isTopLevel = depth === 0;
    
    return (
      <React.Fragment key={item.id}>
        <div className="group flex items-center h-[56px] text-[13px] border-b border-[#2b2c2e]/40 hover:bg-[#1a1b1d]/50 transition-colors cursor-pointer relative">
          
          {/* Tree Lines */}
          <div className="absolute left-0 top-0 bottom-0 pointer-events-none" style={{ width: `${depth * 28 + 24}px` }}>
            {parentLines.map((hasLine, i) => (
              hasLine ? <div key={i} className="absolute w-[1px] bg-[#2b2c2e]" style={{ left: `${i * 28 + 27}px`, top: 0, bottom: 0 }} /> : null
            ))}
            
            {depth > 0 && (
              <>
                <div className="absolute w-[1px] bg-[#2b2c2e]" style={{ left: `${(depth - 1) * 28 + 27}px`, top: 0, bottom: isLastChild && !item.children ? '50%' : 0 }} />
                <div className="absolute h-[1px] bg-[#2b2c2e]" style={{ left: `${(depth - 1) * 28 + 27}px`, top: '50%', width: '12px' }} />
              </>
            )}
          </div>

          <div className="flex-[3] flex items-center min-w-0" style={{ paddingLeft: `${depth * 28 + 16}px` }}>
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <div className={`w-6 h-6 rounded-md flex flex-shrink-0 items-center justify-center relative z-10 ${isTopLevel ? item.iconBg : 'bg-transparent'} ${!isTopLevel && 'ml-4'}`}>
                {item.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`truncate ${isTopLevel ? 'font-medium text-[#e8e8e8]' : 'text-[#c4c5c7]'}`}>{item.name}</span>
                {item.description && <span className="text-[12px] text-[#858688] truncate">{item.description}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex-1 text-[#a1a3a6]">{item.target}</div>
          <div className="flex-1 font-medium">{renderHealth(item.health)}</div>
          
          <div className="flex-1 flex items-center gap-1.5 text-[#c4c5c7]">
            <svg className="w-[15px] h-[15px] text-[#5e6ad2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            {item.projects}
          </div>
          
          <div className="flex-[1.2] flex flex-wrap items-center gap-2">
            {item.activeProjects.map((ap: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5 text-[#a1a3a6]">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ap.color }} />
                <span>{ap.count}</span>
              </div>
            ))}
          </div>
          
          <div className="w-16 flex items-center pr-4">
            {renderActivity(item.activity)}
          </div>
        </div>

        {item.children && item.children.map((child: any, index: number) => 
          renderRow(
            child, 
            depth + 1, 
            index === item.children.length - 1, 
            [...parentLines, index !== item.children.length - 1]
          )
        )}
      </React.Fragment>
    );
  };

  return (
    <DashboardShell roleName={roleName} navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#111213] text-[#e8e8e8] overflow-hidden">
        
        {/* Header Area */}
        <div className="flex flex-col px-8 pt-5 pb-4 shrink-0 bg-[#111213] z-20 sticky top-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[14px] font-medium text-[#e8e8e8]">Initiatives</h2>
            <button className="text-[#858688] hover:text-[#e8e8e8] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
          </div>
          
          <div className="flex gap-2 items-center text-[13px]">
            <button className="px-3 py-1.5 bg-[#262729] rounded-full font-medium text-[#e8e8e8]">Active</button>
            <button className="px-3 py-1.5 text-[#858688] hover:bg-[#1a1b1d] rounded-full transition-colors">Planned</button>
            <button className="px-3 py-1.5 text-[#858688] hover:bg-[#1a1b1d] rounded-full transition-colors">All initiatives</button>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto px-8 pb-10">
          <div className="min-w-[900px]">
            
            {/* Table Header */}
            <div className="flex items-center text-[12px] font-medium text-[#858688] pb-3 border-b border-[#2b2c2e]">
              <div className="flex-[3] pl-4">Name</div>
              <div className="flex-1">Target</div>
              <div className="flex-1">Health</div>
              <div className="flex-1">Projects</div>
              <div className="flex-[1.2]">Active projects</div>
              <div className="w-16">Activity</div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col">
              {INITIATIVES_DATA.map((item, index) => renderRow(item, 0, index === INITIATIVES_DATA.length - 1, []))}
            </div>

          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
