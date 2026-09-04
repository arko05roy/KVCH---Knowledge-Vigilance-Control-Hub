import { DashboardShell } from "@/components/dashboard-shell";

export default function InboxPage() {
  return (
    <DashboardShell roleName="HR" navItems={[]} hideHeader>
      <div className="flex h-full w-full bg-[#1a1b1d] text-[#e8e8e8]">
        
        {/* Left Pane (List) */}
        <div className="w-[320px] flex-shrink-0 border-r border-[#2b2c2e] flex flex-col">
          {/* Header */}
          <div className="h-[52px] flex items-center px-4 shrink-0">
            <h2 className="text-[14px] font-medium text-[#e8e8e8]">Inbox</h2>
          </div>
          
          {/* Filters */}
          <div className="px-4 py-1 flex gap-2">
            <button className="px-3 py-1.5 bg-[#262729] rounded-full text-[13px] text-[#e8e8e8] font-medium">All</button>
            <button className="px-3 py-1.5 text-[#858688] hover:bg-[#262729] rounded-full text-[13px] transition-colors">Unread</button>
            <button className="px-3 py-1.5 text-[#858688] hover:bg-[#262729] rounded-full text-[13px] transition-colors">Snoozed</button>
          </div>
          
          {/* List */}
          <div className="flex-1 overflow-y-auto mt-2">
            
            {/* Active Item */}
            <div className="px-4 py-3 bg-[#262729]/50 flex gap-3 cursor-pointer border-l-[3px] border-[#e8e8e8]">
              <div className="relative shrink-0 pt-0.5">
                <div className="w-6 h-6 rounded-full bg-[#858688] flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#111213" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#ff4500] rounded-full flex items-center justify-center border border-[#1a1b1d]">
                   <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <span className="text-[13px] font-medium text-[#e8e8e8] truncate">MOB-3902 App freezes on...</span>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                    <svg className="w-3.5 h-3.5 text-[#858688]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                    <span className="text-[11px] text-[#858688]">5m</span>
                  </div>
                </div>
                <div className="text-[13px] text-[#858688] truncate pr-4">Nan added issue to Mobile triage</div>
              </div>
            </div>

            {/* Unread Item */}
            <div className="px-4 py-3 hover:bg-[#262729]/30 flex gap-3 cursor-pointer border-l-[3px] border-transparent transition-colors">
              <div className="relative shrink-0 pt-0.5">
                <div className="w-6 h-6 rounded-full bg-[#c4c5c7] flex items-center justify-center overflow-hidden border border-[#2b2c2e] bg-[#111213]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#e8e8e8" strokeWidth="2" className="w-3.5 h-3.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <span className="text-[13px] font-medium text-[#e8e8e8] truncate flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2] inline-block mr-1.5 shrink-0"></span>
                    ENG-2002 Fix delayed UI...
                  </span>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                    <svg className="w-3.5 h-3.5 text-[#5e6ad2]" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4" stroke="#111213" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-[11px] text-[#858688]">8m</span>
                  </div>
                </div>
                <div className="text-[13px] text-[#858688] truncate pr-4 ml-3">Linear finished: Fix delayed UI</div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="px-4 py-3 hover:bg-[#262729]/30 flex gap-3 cursor-pointer border-l-[3px] border-transparent transition-colors">
              <div className="relative shrink-0 pt-0.5">
                <div className="w-6 h-6 rounded-full bg-[#858688] flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#111213" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#2ea043] rounded-full flex items-center justify-center border border-[#1a1b1d]">
                   <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <span className="text-[13px] font-medium text-[#e8e8e8] truncate">Infra stability</span>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                    <svg className="w-3.5 h-3.5 text-[#858688]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
                    <span className="text-[11px] text-[#858688]">4h</span>
                  </div>
                </div>
                <div className="text-[13px] text-[#858688] truncate pr-4">New initiative update by Mingjie</div>
              </div>
            </div>

            {/* Item 4 */}
            <div className="px-4 py-3 hover:bg-[#262729]/30 flex gap-3 cursor-pointer border-l-[3px] border-transparent transition-colors">
              <div className="relative shrink-0 pt-0.5">
                <div className="w-6 h-6 rounded-full bg-[#858688] flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#111213" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <span className="text-[13px] font-medium text-[#e8e8e8] truncate">Car-to-app synchronization</span>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                    <svg className="w-3.5 h-3.5 text-[#f2c94c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v10l5 5"/></svg>
                    <span className="text-[11px] text-[#858688]">1d</span>
                  </div>
                </div>
                <div className="text-[13px] text-[#858688] truncate pr-4">Added you as project member</div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Pane (Detail) */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#161718] border-l border-transparent">
          
          {/* Detail Header */}
          <div className="h-[52px] flex items-center justify-between px-6 border-b border-[#2b2c2e] shrink-0 bg-[#1a1b1d]/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2 text-[13px] text-[#e8e8e8] truncate">
              <svg className="text-[#eb5757] w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
              <span className="text-[#858688] font-mono shrink-0">DRV-5428</span>
              <span className="font-medium truncate ml-1">App freezes on splash screen</span>
              <button className="ml-1 text-[#858688] hover:text-[#e8e8e8] transition-colors"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
              <button className="text-[#858688] hover:text-[#e8e8e8] transition-colors"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
            </div>
            <div className="flex items-center gap-3 text-[#858688]">
              <button className="hover:text-[#e8e8e8] transition-colors w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#262729]"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
              <button className="hover:text-[#e8e8e8] transition-colors w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#262729]"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></button>
              <div className="w-[1px] h-3.5 bg-[#2b2c2e]"></div>
              <button className="hover:text-[#e8e8e8] transition-colors w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#262729]"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>
              <button className="hover:text-[#e8e8e8] transition-colors w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#262729]"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></button>
              <button className="hover:text-[#e8e8e8] transition-colors w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#262729]"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="15" y2="9"/><line x1="9" x2="15" y1="9" y2="15"/></svg></button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto px-10 py-10">
            <div className="max-w-3xl mx-auto">
              
              <h1 className="text-[22px] font-medium text-[#e8e8e8] mb-4">App freezes on splash screen</h1>
              
              <div className="text-[15px] text-[#a1a3a6] mb-8 leading-[1.6]">
                <p className="mb-4">After launch, the splash screen remains visible indefinitely with no change in state.<br/>The app does not progress to the homescreen.</p>
              </div>

              {/* Triage Intelligence Box */}
              <div className="border border-[#2b2c2e] rounded-lg p-5 bg-[#1a1b1d] mb-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-[13px] font-medium text-[#e8e8e8]">
                    <svg className="w-4 h-4 text-[#c4c5c7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    Triage Intelligence
                  </div>
                  <button className="text-[#858688] hover:text-[#e8e8e8]"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
                </div>
                
                <div className="grid grid-cols-[100px_1fr] gap-y-4 text-[13px] items-center">
                  <div className="text-[#858688]">Suggestions</div>
                  <div className="flex gap-2 items-center">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#262729] border border-[#2b2c2e] text-[#e8e8e8] cursor-pointer hover:bg-[#2b2c2e] transition-colors"><div className="w-1.5 h-1.5 rounded-full bg-[#56ccf2]"/> emil</span>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#262729] border border-[#2b2c2e] text-[#e8e8e8] cursor-pointer hover:bg-[#2b2c2e] transition-colors"><div className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2]"/> iOS</span>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#262729] border border-[#2b2c2e] text-[#e8e8e8] cursor-pointer hover:bg-[#2b2c2e] transition-colors"><div className="w-1.5 h-1.5 rounded-full bg-[#eb5757]"/> Bug <svg className="w-3 h-3 text-[#858688] ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></span>
                  </div>
                  
                  <div className="text-[#858688]">Duplicate</div>
                  <div className="flex gap-2 items-center text-[#e8e8e8] cursor-pointer group">
                    <svg className="text-[#f2c94c] w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v10l5 5"/></svg>
                    <span className="font-mono text-[#858688]">ENG-1998</span>
                    <span className="text-[#a1a3a6] group-hover:text-[#e8e8e8] transition-colors">Loading spinner keeps running on startup</span>
                  </div>
                </div>
              </div>

              {/* Activity Section */}
              <h3 className="text-[14px] font-medium text-[#e8e8e8] mb-4">Activity</h3>
              <div className="space-y-4 mb-8 text-[13px] ml-1 border-l border-[#2b2c2e] pl-5 relative">
                
                <div className="flex items-start gap-3 text-[#a1a3a6] relative">
                  <div className="absolute -left-[27px] bg-[#161718] w-4 h-4 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-[#858688]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg>
                  </div>
                  <p>Linear created the issue via Slack on behalf of Nan <span className="text-[#5c5d5f] ml-1">· 2min ago</span></p>
                </div>

                <div className="flex items-start gap-3 text-[#a1a3a6] relative">
                  <div className="absolute -left-[27px] bg-[#161718] w-4 h-4 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-[#858688]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.22l-5.36 5.36"/></svg>
                  </div>
                  <p>Triage Intelligence added the label <span className="text-[#e8e8e8] bg-[#262729] px-1.5 py-0.5 rounded-sm">Bug</span> <span className="text-[#5c5d5f] ml-1">· 2min ago</span></p>
                </div>

                <div className="flex items-start gap-3 text-[#a1a3a6] relative">
                  <div className="absolute -left-[27px] bg-[#161718] w-4 h-4 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-[#858688]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>
                  </div>
                  <p>Linear notified Karri <span className="text-[#5c5d5f] ml-1">· 1min ago</span></p>
                </div>

              </div>

              {/* Comment Box */}
              <div className="border border-[#2b2c2e] rounded-lg p-3 bg-[#1a1b1d] flex flex-col h-28 focus-within:border-[#5e6ad2] transition-colors relative shadow-sm">
                <textarea 
                  placeholder="Leave a comment..." 
                  className="bg-transparent border-none outline-none text-[14px] text-[#e8e8e8] placeholder-[#5c5d5f] resize-none flex-1 w-full" 
                />
                <div className="flex justify-end gap-2 text-[#858688] mt-2 border-t border-transparent pt-2">
                  <button className="hover:text-[#e8e8e8] p-1.5 rounded-md hover:bg-[#262729] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>
                  <button className="bg-[#2b2c2e] text-[#e8e8e8] hover:bg-[#363739] p-1.5 px-3 rounded-md transition-colors text-[13px] font-medium flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}
