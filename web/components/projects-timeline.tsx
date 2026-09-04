"use client";

import React from "react";
import { DashboardShell } from "@/components/dashboard-shell";

type Milestone = {
  label: string;
  position: number;
  color: string;
};

type Dependency = {
  toId: string;
};

type Project = {
  id: string;
  title: string;
  icon: React.ReactNode;
  alert?: boolean;
  left: number;
  width: number;
  bgClasses: string;
  milestones: Milestone[];
  dependencies?: Dependency[];
};

const PROJECTS: Project[] = [
  {
    id: "ui-refresh",
    title: "UI Refresh",
    icon: <svg className="w-4 h-4 text-[#56ccf2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/></svg>,
    left: 15,
    width: 40,
    bgClasses: "bg-gradient-to-r from-[#262729] to-[#3b2323] border border-[#2b2c2e]",
    milestones: [
      { label: "Core screens", position: 30, color: "#858688" },
      { label: "Polish", position: 70, color: "#eb5757" },
    ],
  },
  {
    id: "split-fares",
    title: "Split fares",
    icon: <svg className="w-4 h-4 text-[#2ea043]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>,
    left: 2,
    width: 65,
    bgClasses: "bg-gradient-to-r from-[#262729] to-[#3b2323] border border-[#2b2c2e]",
    milestones: [
      { label: "Internal", position: 20, color: "#858688" },
      { label: "Public beta", position: 75, color: "#858688" },
    ],
  },
  {
    id: "onboarding",
    title: "Onboarding improvements",
    icon: <svg className="w-4 h-4 text-[#2ea043]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    left: 25,
    width: 50,
    bgClasses: "bg-gradient-to-r from-[#262729] to-[#203247] border border-[#2b2c2e] border-r-blue-500/30 border-r-2 border-dashed",
    milestones: [
      { label: "Sign up", position: 15, color: "#858688" },
      { label: "Wallet", position: 45, color: "#858688" },
      { label: "First ride", position: 75, color: "#858688" },
    ],
  },
  {
    id: "japan",
    title: "Japan localization",
    icon: <svg className="w-4 h-4 text-[#eb5757]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    alert: true,
    left: 10,
    width: 42,
    bgClasses: "bg-[#262729] border border-[#2b2c2e]",
    milestones: [
      { label: "App translation", position: 30, color: "#858688" },
      { label: "Support translation", position: 80, color: "#858688" },
    ],
    dependencies: [{ toId: "tokyo" }]
  },
  {
    id: "tokyo",
    title: "Tokyo launch",
    icon: <svg className="w-4 h-4 text-[#eb5757]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>,
    alert: true,
    left: 65,
    width: 25,
    bgClasses: "bg-[#262729] border border-[#2b2c2e]",
    milestones: [
      { label: "Beta", position: 40, color: "#858688" },
    ],
  },
];

export function ProjectsTimelinePage({ roleName }: { roleName: string }) {
  
  const renderDependencies = () => {
    const paths: React.ReactNode[] = [];
    
    PROJECTS.forEach((p, idx) => {
      if (p.dependencies) {
        p.dependencies.forEach(dep => {
          const targetIdx = PROJECTS.findIndex(t => t.id === dep.toId);
          if (targetIdx !== -1) {
            const targetP = PROJECTS[targetIdx];
            
            const startX = p.left + p.width;
            const startY = 96 + (idx * 112) + 44; 
            
            const endX = targetP.left;
            const endY = 96 + (targetIdx * 112) + 44;
            
            const cp1X = startX + 5;
            const cp1Y = startY;
            const cp2X = endX - 5;
            const cp2Y = endY;
            
            paths.push(
              <path 
                key={`${p.id}-${dep.toId}`}
                d={`M ${startX}% ${startY} C ${cp1X}% ${cp1Y}, ${cp2X}% ${cp2Y}, ${endX}% ${endY}`}
                fill="none" 
                stroke="#5c5d5f" 
                strokeWidth="1.5" 
              />
            );
          }
        });
      }
    });
    
    if (paths.length === 0) return null;
    
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ strokeDasharray: "4 4" }}>
        {paths}
      </svg>
    );
  };

  return (
    <DashboardShell roleName={roleName} navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#111213] text-[#e8e8e8] overflow-hidden">
        
        {/* Header Area */}
        <div className="flex flex-col px-8 pt-5 pb-4 border-b border-[#2b2c2e] shrink-0 bg-[#111213] z-20 sticky top-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[14px] font-medium text-[#e8e8e8]">Projects</h2>
            <button className="text-[#858688] hover:text-[#e8e8e8] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center text-[13px]">
              <button className="px-3 py-1.5 bg-[#262729] rounded-full font-medium text-[#e8e8e8]">All projects</button>
              
              <button className="px-3 py-1.5 text-[#858688] hover:text-[#c4c5c7] hover:bg-[#1a1b1d] rounded-full transition-colors flex items-center gap-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                My projects
              </button>

              <button className="px-3 py-1.5 text-[#858688] hover:text-[#c4c5c7] hover:bg-[#1a1b1d] rounded-full transition-colors flex items-center gap-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
                All initiatives
              </button>

              <button className="px-3 py-1.5 text-[#56ccf2] hover:bg-[#1a1b1d] rounded-full transition-colors flex items-center gap-2 border border-[#2b2c2e]">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Roadmap timeline
              </button>

              <button className="px-3 py-1.5 text-[#858688] hover:text-[#c4c5c7] transition-colors ml-2">
                15 more...
              </button>
            </div>
            
            <div className="flex gap-2 text-[#858688]">
              <button className="w-8 h-8 rounded-full border border-[#2b2c2e] flex items-center justify-center hover:text-[#e8e8e8] hover:bg-[#1a1b1d] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg></button>
              <button className="w-8 h-8 rounded-full border border-[#2b2c2e] flex items-center justify-center hover:text-[#e8e8e8] hover:bg-[#1a1b1d] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12H3"/><path d="M21 6H3"/><path d="M21 18H3"/></svg></button>
              <button className="w-8 h-8 rounded-full border border-[#2b2c2e] flex items-center justify-center hover:text-[#e8e8e8] hover:bg-[#1a1b1d] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg></button>
            </div>
          </div>
        </div>

        {/* Timeline Area */}
        <div className="flex-1 overflow-auto relative">
          <div className="min-w-[1200px] h-full relative font-mono text-[11px] text-[#858688]">
            
            {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none flex">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-1 border-r border-[#2b2c2e]/40 h-full relative flex flex-col">
                  {/* Month Label */}
                  <div className="h-10 flex items-center justify-center font-medium tracking-widest text-[#a1a3a6]">
                    {['MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'][i]}
                  </div>
                  {/* Dates */}
                  <div className="flex h-8 items-center text-[#5c5d5f]">
                    <div className="flex-1 text-center">{[13, 1, 6, 3, 7, 4][i]}</div>
                    <div className="flex-1 text-center">{[20, 8, 13, 10, 14, 11][i]}</div>
                    <div className="flex-1 text-center">{[27, 15, 20, 17, 21, 18][i]}</div>
                    <div className="flex-1 text-center">{[4, 22, 27, 24, 28, 25][i]}</div>
                  </div>
                  {/* Vertical lines for dates */}
                  <div className="absolute inset-0 top-18 flex">
                     <div className="flex-1 border-r border-[#2b2c2e]/20 border-dashed"></div>
                     <div className="flex-1 border-r border-[#2b2c2e]/20 border-dashed"></div>
                     <div className="flex-1 border-r border-[#2b2c2e]/20 border-dashed"></div>
                     <div className="flex-1"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline Bars */}
            <div className="relative pt-24 font-sans px-4 h-[1000px]">
              {renderDependencies()}

              {PROJECTS.map((project) => (
                <div key={project.id} className="relative h-24 mb-4 z-10">
                  <div 
                    className="absolute" 
                    style={{ left: `${project.left}%`, width: `${project.width}%` }}
                  >
                    <div className="flex items-center gap-1.5 mb-2 pl-2">
                      {project.icon}
                      <span className="text-[13px] font-medium text-[#e8e8e8]">{project.title}</span>
                      {project.alert && (
                        <span className="bg-[#eb5757] text-[#111213] text-[10px] px-1 font-bold rounded-sm">!</span>
                      )}
                      <svg className="w-3.5 h-3.5 text-[#5c5d5f] ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>
                    </div>
                    
                    <div className={`h-6 rounded-md relative flex items-center ${project.bgClasses}`}>
                      {/* Milestones */}
                      {project.milestones.map((ms, idx) => (
                        <div 
                          key={idx} 
                          className="absolute flex flex-col items-center gap-1.5 top-1/2 -translate-y-1/2 -translate-x-1/2"
                          style={{ left: `${ms.position}%` }}
                        >
                          <div 
                            className="w-2 h-2 rotate-45 border" 
                            style={{ borderColor: ms.color, backgroundColor: ms.color === '#858688' ? '#1a1b1d' : ms.color }}
                          ></div>
                          <span className="absolute top-4 text-[#858688] text-[11px] whitespace-nowrap mt-1">{ms.label}</span>
                        </div>
                      ))}
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
