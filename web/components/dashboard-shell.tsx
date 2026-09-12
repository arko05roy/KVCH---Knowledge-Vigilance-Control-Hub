"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface RoleNavConfig {
  top: NavItem[];
  sections: NavSection[];
}

// The navigation configuration for each role based on KVCH context
const ROLE_NAVS: Record<string, RoleNavConfig> = {
  "Intern": {
    top: [
      { label: "Dashboard", href: "/intern/dashboard", icon: <DashboardIcon /> },
      { label: "Pulse", href: "/intern/pulse", icon: <PulseIcon /> },
      { label: "Inbox", href: "/intern/inbox", icon: <InboxIcon /> },
      { label: "My issues", href: "/intern/issues", icon: <IssuesIcon /> },
      { label: "Reviews", href: "/intern/reviews", icon: <ReviewsIcon /> },
    ],
    sections: [
      {
        title: "Workspace",
        items: [
          { label: "Initiatives", href: "/intern/initiatives", icon: <InitiativesIcon /> },
          { label: "Projects", href: "/intern/projects", icon: <ProjectsIcon /> },
          { label: "My Tasks", href: "/intern/tasks", icon: <TasksIcon /> },
          { label: "Marketplace", href: "/intern/marketplace", icon: <MarketplaceIcon /> },
        ]
      }
    ]
  },
  "Sr. Dev": {
    top: [
      { label: "Dashboard", href: "/sr-dev/dashboard", icon: <DashboardIcon /> },
      { label: "Pulse", href: "/sr-dev/pulse", icon: <PulseIcon /> },
      { label: "Inbox", href: "/sr-dev/inbox", icon: <InboxIcon /> },
      { label: "My issues", href: "/sr-dev/issues", icon: <IssuesIcon /> },
      { label: "Reviews", href: "/sr-dev/reviews", icon: <ReviewsIcon /> },
    ],
    sections: [
      {
        title: "Workspace",
        items: [
          { label: "Initiatives", href: "/sr-dev/initiatives", icon: <InitiativesIcon /> },
          { label: "Projects", href: "/sr-dev/projects", icon: <ProjectsIcon /> },
          { label: "Approval Queue", href: "/sr-dev/approvals", icon: <TasksIcon /> },
          { label: "Team Incidents", href: "/sr-dev/incidents", icon: <IncidentsIcon /> },
          { label: "Marketplace", href: "/sr-dev/marketplace", icon: <MarketplaceIcon /> },
          { label: "Custom Extensions", href: "/sr-dev/custom-extensions", icon: <ExtensionsIcon /> },
        ]
      }
    ]
  },
  "HR": {
    top: [
      { label: "Dashboard", href: "/hr/dashboard", icon: <DashboardIcon /> },
      { label: "Pulse", href: "/hr/pulse", icon: <PulseIcon /> },
      { label: "Inbox", href: "/hr/inbox", icon: <InboxIcon /> },
    ],
    sections: [
      {
        title: "Workspace",
        items: [
          { label: "Pattern Analysis", href: "/hr/patterns", icon: <ChartIcon /> },
          { label: "Policies", href: "/hr/policies", icon: <PolicyIcon /> },
        ]
      }
    ]
  },
  "Management": {
    top: [
      { label: "Dashboard", href: "/management/dashboard", icon: <DashboardIcon /> },
      { label: "Pulse", href: "/management/pulse", icon: <PulseIcon /> },
      { label: "Inbox", href: "/management/inbox", icon: <InboxIcon /> },
    ],
    sections: [
      {
        title: "Workspace",
        items: [
          { label: "Escalations", href: "/management/escalations", icon: <AlertIcon /> },
          { label: "Business Impact", href: "/management/investment", icon: <ChartIcon /> },
          { label: "ZK Network", href: "/zk", icon: <ShieldIcon /> },
        ]
      }
    ]
  },
  "Risk Intelligence": {
    top: [
      { label: "Dashboard", href: "/risk-intelligence", icon: <DashboardIcon /> },
      { label: "Threat Monitor", href: "/risk-intelligence/threats", icon: <AlertIcon /> },
      { label: "Forensic Audits", href: "/risk-intelligence/audits", icon: <IncidentsIcon /> },
      { label: "Compliance Scorecard", href: "/risk-intelligence/compliance", icon: <ChartIcon /> },
      { label: "Security Guardrails", href: "/risk-intelligence/policies", icon: <PolicyIcon /> },
    ],
    sections: []
  }
};

export function DashboardShell({
  children,
  roleName,
  hideHeader = false,
}: {
  children: React.ReactNode;
  roleName: string;
  navItems?: { label: string; href: string; active?: boolean }[];
  hideHeader?: boolean;
}) {
  const pathname = usePathname();
  const navConfig = ROLE_NAVS[roleName] || { top: [], sections: [] };

  return (
    <div className="flex h-screen bg-[#111213] text-[#e8e8e8] overflow-hidden font-sans antialiased text-[14px]">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#111213] flex flex-col flex-shrink-0 border-r border-[#1e1f21] pt-3 pb-3">
        <div className="px-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-[#1a1b1d] px-2 py-1 -ml-2 rounded-md transition-colors">
            <div className="w-[18px] h-[18px] rounded-[4px] bg-white flex items-center justify-center shrink-0">
               <svg viewBox="0 0 24 24" fill="none" stroke="#111213" strokeWidth="3" className="w-3 h-3">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5z" />
               </svg>
            </div>
            <span className="font-medium text-[14px]">KVCH <span className="text-[#858688] text-[12px] ml-1">▼</span></span>
          </div>
          <div className="flex items-center gap-2 text-[#858688]">
            <button className="hover:text-[#e8e8e8] transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <button className="hover:text-[#e8e8e8] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {/* Top Nav */}
          <div className="space-y-[2px] mb-6">
            {navConfig.top.map((item, idx) => (
              <SidebarItem
                key={idx}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={pathname === item.href || pathname.startsWith(item.href + "/")}
              />
            ))}
          </div>

          {/* Dynamic Sections based on role */}
          {navConfig.sections.map((section, sIdx) => (
            <div key={sIdx} className="mb-6">
              <div className="px-3 mb-1 text-[12px] font-medium text-[#858688] flex items-center justify-between group cursor-pointer hover:text-[#c4c5c7]">
                {section.title} <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">▼</span>
              </div>
              <div className="space-y-[2px]">
                {section.items.map((item, idx) => (
                  <SidebarItem
                    key={idx}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={pathname === item.href || pathname.startsWith(item.href + "/")}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area - Inset card style */}
      <main className="flex-1 bg-[#111213] p-3 pl-0 overflow-hidden flex">
        <div className="flex-1 bg-[#1a1b1d] border border-[#2b2c2e] rounded-[10px] overflow-hidden flex flex-col relative shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          {!hideHeader && (
            <header className="h-[52px] border-b border-[#2b2c2e] flex items-center justify-between px-6 shrink-0 bg-[#1a1b1d]/90 backdrop-blur-sm z-10">
              <h1 className="text-[14px] font-medium text-[#e8e8e8]">Pulse</h1>
              <div className="flex items-center gap-4 text-[#858688]">
                <button className="hover:text-[#e8e8e8] transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                </button>
                 <button className="hover:text-[#e8e8e8] transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </button>
              </div>
            </header>
          )}

          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, href, active }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-1.5 rounded-[6px] cursor-pointer transition-colors ${active ? 'bg-[#262729] text-[#e8e8e8]' : 'text-[#a1a3a6] hover:bg-[#1f2022] hover:text-[#e8e8e8]'}`}>
      <div className={`${active ? 'text-[#e8e8e8]' : 'text-[#858688]'}`}>{icon}</div>
      <span className="text-[13.5px] font-medium">{label}</span>
    </Link>
  );
}

// Icons
function DashboardIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function PulseIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
}
function InboxIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
}
function TasksIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;
}
export function ExtensionsIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-8"/><path d="M12 12 8 8"/><path d="M12 12l4-4"/><path d="M20 20v-8"/><path d="M20 12l-4-4"/><path d="M20 12l4-4"/></svg>;
}
function IncidentsIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
}
function ChartIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>;
}
function PolicyIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>;
}
function ShieldIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>;
}
function AlertIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}
function ReviewsIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-8"/><path d="M12 12 8 8"/><path d="M12 12l4-4"/><path d="M20 20v-8"/><path d="M20 12l-4-4"/><path d="M20 12l4-4"/></svg>;
}
function IssuesIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;
}
function ProjectsIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
}
function InitiativesIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>;
}
function MarketplaceIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
}
