import { DashboardShell } from "@/components/dashboard-shell";

export default function ReviewsPage() {
  return (
    <DashboardShell roleName="Intern" navItems={[]} hideHeader>
      <div className="flex h-full w-full bg-[#1a1b1d] text-[#e8e8e8]">
        
        {/* Left Pane (List) */}
        <div className="w-[320px] flex-shrink-0 border-r border-[#2b2c2e] flex flex-col">
          {/* Left Pane Header */}
          <div className="h-[52px] flex items-center px-4 border-b border-[#2b2c2e] shrink-0">
            <h2 className="text-[14px] font-medium text-[#e8e8e8]">Reviews</h2>
          </div>
          
          {/* Filters */}
          <div className="px-4 py-3 flex gap-2 border-b border-transparent">
            <button className="px-3 py-1.5 bg-[#262729] rounded-full text-[13px] text-[#e8e8e8]">For me</button>
            <button className="px-3 py-1.5 text-[#a1a3a6] hover:bg-[#262729] rounded-full text-[13px] transition-colors">Created</button>
          </div>
          
          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {/* Group: Needs your review */}
            <div className="px-4 py-2 text-[12px] font-medium text-[#858688] flex items-center gap-1.5 mt-2 cursor-pointer hover:text-[#c4c5c7]">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11V7a5 5 0 0 1 10 0v4"/><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/></svg>
              Needs your review <span className="ml-1 text-[#5e6ad2]">3</span>
              <span className="text-[10px] ml-1">▼</span>
            </div>
            
            {/* Item 1 - Active */}
            <div className="px-4 py-3 bg-[#262729]/80 border-l-[3px] border-[#2ea043] cursor-pointer">
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-[13.5px] font-medium text-[#e8e8e8] truncate">Improve vehicle sync state handling</span>
                <svg className="text-[#2ea043] w-4 h-4 ml-2 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              </div>
              <div className="flex justify-between items-center text-[12px] text-[#858688]">
                <span className="flex items-center gap-1.5"><span className="text-[#2ea043]">Waiting for your review</span></span>
                <span className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#c4c5c7] flex items-center justify-center overflow-hidden"><svg viewBox="0 0 24 24" fill="none" stroke="#111213" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg></div>
                  1h
                </span>
              </div>
            </div>

            {/* Item 2 */}
            <div className="px-4 py-3 border-l-[3px] border-transparent hover:bg-[#262729]/50 cursor-pointer transition-colors border-b border-[#2b2c2e]/50">
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-[13.5px] font-medium text-[#e8e8e8] truncate">Refactor notification model and captur...</span>
                <svg className="text-[#2ea043] w-4 h-4 ml-2 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              </div>
              <div className="flex justify-between items-center text-[12px] text-[#858688]">
                <span className="flex items-center gap-1.5"><span className="text-[#2ea043]">Waiting for your review</span></span>
                <span className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#c4c5c7] flex items-center justify-center overflow-hidden"><svg viewBox="0 0 24 24" fill="none" stroke="#111213" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg></div>
                  1h
                </span>
              </div>
            </div>

            {/* Item 3 */}
            <div className="px-4 py-3 border-l-[3px] border-transparent hover:bg-[#262729]/50 cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-[13.5px] font-medium text-[#e8e8e8] truncate">Prevent duplicate trip creation</span>
                <svg className="text-[#2ea043] w-4 h-4 ml-2 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              </div>
              <div className="flex justify-between items-center text-[12px] text-[#858688]">
                <span className="flex items-center gap-1.5"><span className="text-[#2ea043]">Waiting for your review</span></span>
                <span className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#c4c5c7] flex items-center justify-center overflow-hidden"><svg viewBox="0 0 24 24" fill="none" stroke="#111213" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg></div>
                  2h
                </span>
              </div>
            </div>

            {/* Group: You're reviewing */}
            <div className="px-4 py-2 text-[12px] font-medium text-[#858688] flex items-center gap-1.5 mt-4 cursor-pointer hover:text-[#c4c5c7]">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              You're reviewing <span className="ml-1 text-[#858688]">2</span>
              <span className="text-[10px] ml-1">▼</span>
            </div>

            {/* Item 4 */}
            <div className="px-4 py-3 border-l-[3px] border-transparent hover:bg-[#262729]/50 cursor-pointer transition-colors border-b border-[#2b2c2e]/50">
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-[13.5px] font-medium text-[#e8e8e8] truncate">Add high contrast theme to Rider app</span>
                <svg className="text-[#2ea043] w-4 h-4 ml-2 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              </div>
              <div className="flex justify-between items-center text-[12px] text-[#858688]">
                <span className="flex items-center gap-1.5"><span>In Review</span></span>
                <span className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#c4c5c7] flex items-center justify-center overflow-hidden"><svg viewBox="0 0 24 24" fill="none" stroke="#111213" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg></div>
                  4h
                </span>
              </div>
            </div>

            {/* Item 5 */}
            <div className="px-4 py-3 border-l-[3px] border-transparent hover:bg-[#262729]/50 cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-[13.5px] font-medium text-[#e8e8e8] truncate">Fix overflow on header</span>
                <svg className="text-[#2ea043] w-4 h-4 ml-2 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              </div>
              <div className="flex justify-between items-center text-[12px] text-[#858688]">
                <span className="flex items-center gap-1.5"><span className="text-[#eb5757]">You requested changes</span></span>
                <span className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#c4c5c7] flex items-center justify-center overflow-hidden"><svg viewBox="0 0 24 24" fill="none" stroke="#111213" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg></div>
                  1d
                </span>
              </div>
            </div>

            {/* Group: Completed */}
            <div className="px-4 py-2 text-[12px] font-medium text-[#858688] flex items-center gap-1.5 mt-4 cursor-pointer hover:text-[#c4c5c7]">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Completed <span className="ml-1 text-[#858688]">1473</span>
              <span className="text-[10px] ml-1">▶</span>
            </div>

          </div>
        </div>

        {/* Right Pane (Code Diff) */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Right Pane Header */}
          <div className="h-[52px] flex items-center justify-between px-6 border-b border-[#2b2c2e] shrink-0">
            <div className="flex items-center gap-2 text-[14px] text-[#e8e8e8] truncate">
              <span className="text-[#2ea043]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              </span>
              <span className="text-[#858688] font-medium">DRV-8467</span>
              <span className="text-[#858688]">&gt;</span>
              <span className="text-[#2ea043] ml-1"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></span>
              <span className="font-medium truncate ml-1">Improve vehicle sync state handling</span>
              <span className="text-[#2ea043] text-[13px] font-mono ml-2">+18</span>
              <span className="text-[#eb5757] text-[13px] font-mono">-11</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="text-[#858688] hover:text-[#e8e8e8] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
              <button className="text-[#858688] hover:text-[#e8e8e8] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
              <div className="w-[1px] h-4 bg-[#2b2c2e] mx-1"></div>
              <button className="text-[#858688] hover:text-[#e8e8e8] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>
              <button className="text-[#858688] hover:text-[#e8e8e8] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></button>
              <button className="text-[#858688] hover:text-[#e8e8e8] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="15" y2="9"/><line x1="9" x2="15" y1="9" y2="15"/></svg></button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 py-3 border-b border-[#2b2c2e] flex items-center justify-between text-[13px] shrink-0">
            <div className="flex items-center gap-6">
              <button className="text-[#858688] hover:text-[#e8e8e8] transition-colors font-medium">Activity</button>
              <button className="text-[#858688] hover:text-[#e8e8e8] transition-colors font-medium">Guide</button>
              <button className="text-[#e8e8e8] bg-[#262729] px-3 py-1.5 rounded-full font-medium">Diff</button>
            </div>
            
            <div className="flex items-center gap-3 text-[#858688]">
              <button className="flex items-center gap-1.5 hover:text-[#e8e8e8] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                Preview
              </button>
              <button className="hover:text-[#e8e8e8] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </button>
            </div>
          </div>

          {/* Diff Content */}
          <div className="flex-1 overflow-auto bg-[#1a1b1d] p-0 text-[13px] font-mono leading-[22px]">
            {/* File Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#2b2c2e] sticky top-0 bg-[#1a1b1d]/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#858688]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <span className="font-medium text-[#e8e8e8] font-sans">HomeScreen.tsx</span>
                <span className="text-[#858688] font-sans ml-2">kinetic-ios/src/screens/Home/HomeScreen.tsx</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#2ea043]">+4</span>
                  <span className="text-[#eb5757]">-4</span>
                </div>
                <div className="flex items-center gap-2 font-sans text-[#858688]">
                  <div className="w-4 h-4 rounded-full border border-[#858688]"></div>
                  Reviewed
                </div>
              </div>
            </div>

            {/* Diff Lines */}
            <div className="py-2">
              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">1</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]"><span className="text-[#eb5757]">import</span> React <span className="text-[#eb5757]">from</span> <span className="text-[#2ea043]">'react'</span></div>
              </div>
              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">2</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]"><span className="text-[#eb5757]">import</span> {'{'} View, ActivityIndicator {'}'} <span className="text-[#eb5757]">from</span> <span className="text-[#2ea043]">'react-native'</span></div>
              </div>
              
              {/* Removed line */}
              <div className="flex group bg-[#eb5757]/10 hover:bg-[#eb5757]/20">
                <div className="w-12 text-right pr-4 text-[#eb5757] select-none opacity-80">3</div>
                <div className="w-6 text-center text-[#eb5757] select-none font-bold">-</div>
                <div className="flex-1 pl-4 whitespace-pre text-[#e8e8e8]"><span className="text-[#eb5757]">import</span> {'{'} <span className="text-[#c4c5c7]">useVehicleState</span> {'}'} <span className="text-[#eb5757]">from</span> <span className="text-[#2ea043]">'@hooks/useVehicleState'</span></div>
              </div>
              
              {/* Added line */}
              <div className="flex group bg-[#2ea043]/10 hover:bg-[#2ea043]/20">
                <div className="w-12 text-right pr-4 text-[#2ea043] select-none opacity-80">3</div>
                <div className="w-6 text-center text-[#2ea043] select-none font-bold">+</div>
                <div className="flex-1 pl-4 whitespace-pre text-[#e8e8e8]"><span className="text-[#eb5757]">import</span> {'{'} <span className="text-[#c4c5c7]">useVehicleState</span>, <span className="text-[#2ea043] bg-[#2ea043]/20 px-1 rounded-sm">SyncStatus</span> {'}'} <span className="text-[#eb5757]">from</span> <span className="text-[#2ea043]">'@hooks/useVehicleState'</span></div>
              </div>

              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">4</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]"><span className="text-[#eb5757]">import</span> {'{'} Dashboard {'}'} <span className="text-[#eb5757]">from</span> <span className="text-[#2ea043]">'@components/Dashboard'</span></div>
              </div>
              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">5</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]"><span className="text-[#eb5757]">import</span> {'{'} EmptyState {'}'} <span className="text-[#eb5757]">from</span> <span className="text-[#2ea043]">'@components/EmptyState'</span></div>
              </div>
              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">6</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]"></div>
              </div>
              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">7</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]"><span className="text-[#eb5757]">export const</span> <span className="text-[#5e6ad2]">HomeScreen</span> = () =&gt; {'{'}</div>
              </div>

              {/* Removed line */}
              <div className="flex group bg-[#eb5757]/10 hover:bg-[#eb5757]/20">
                <div className="w-12 text-right pr-4 text-[#eb5757] select-none opacity-80">8</div>
                <div className="w-6 text-center text-[#eb5757] select-none font-bold">-</div>
                <div className="flex-1 pl-4 whitespace-pre text-[#e8e8e8]">  <span className="text-[#eb5757]">const</span> {'{'} vehicleState, <span className="text-[#eb5757] bg-[#eb5757]/20 px-1 rounded-sm">isFullySynced</span> {'}'} = <span className="text-[#5e6ad2]">useVehicleState</span>()</div>
              </div>

              {/* Added line */}
              <div className="flex group bg-[#2ea043]/10 hover:bg-[#2ea043]/20">
                <div className="w-12 text-right pr-4 text-[#2ea043] select-none opacity-80">8</div>
                <div className="w-6 text-center text-[#2ea043] select-none font-bold">+</div>
                <div className="flex-1 pl-4 whitespace-pre text-[#e8e8e8]">  <span className="text-[#eb5757]">const</span> {'{'} vehicleState, <span className="text-[#2ea043] bg-[#2ea043]/20 px-1 rounded-sm">syncStatus</span> {'}'} = <span className="text-[#5e6ad2]">useVehicleState</span>()</div>
              </div>

              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">9</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]"></div>
              </div>

              {/* Removed line */}
              <div className="flex group bg-[#eb5757]/10 hover:bg-[#eb5757]/20">
                <div className="w-12 text-right pr-4 text-[#eb5757] select-none opacity-80">10</div>
                <div className="w-6 text-center text-[#eb5757] select-none font-bold">-</div>
                <div className="flex-1 pl-4 whitespace-pre text-[#e8e8e8]">  <span className="text-[#eb5757]">if</span> (!<span className="text-[#eb5757] bg-[#eb5757]/20 px-1 rounded-sm">isFullySynced</span>) {'{'}</div>
              </div>

              {/* Added line */}
              <div className="flex group bg-[#2ea043]/10 hover:bg-[#2ea043]/20">
                <div className="w-12 text-right pr-4 text-[#2ea043] select-none opacity-80">10</div>
                <div className="w-6 text-center text-[#2ea043] select-none font-bold">+</div>
                <div className="flex-1 pl-4 whitespace-pre text-[#e8e8e8]">  <span className="text-[#eb5757]">if</span> (<span className="text-[#2ea043] bg-[#2ea043]/20 px-1 rounded-sm">syncStatus === SyncStatus.PENDING</span>) {'{'}</div>
              </div>

              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">11</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]">    <span className="text-[#eb5757]">return</span> &lt;<span className="text-[#5e6ad2]">ActivityIndicator</span> size=<span className="text-[#2ea043]">"large"</span> /&gt;</div>
              </div>
              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">12</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]">  {'}'}</div>
              </div>
              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">13</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]">  <span className="text-[#eb5757]">if</span> (!vehicleState) {'{'}</div>
              </div>
              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">14</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]">    <span className="text-[#eb5757]">return</span> <span className="text-[#eb5757]">null</span></div>
              </div>
              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">15</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]">  {'}'}</div>
              </div>
              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">16</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]">  <span className="text-[#eb5757]">return</span> (</div>
              </div>
              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">17</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]">    &lt;<span className="text-[#5e6ad2]">View</span>&gt;</div>
              </div>

              {/* Removed line */}
              <div className="flex group bg-[#eb5757]/10 hover:bg-[#eb5757]/20">
                <div className="w-12 text-right pr-4 text-[#eb5757] select-none opacity-80">18</div>
                <div className="w-6 text-center text-[#eb5757] select-none font-bold">-</div>
                <div className="flex-1 pl-4 whitespace-pre text-[#e8e8e8]">      &lt;<span className="text-[#5e6ad2]">Dashboard</span> state={'{'}vehicleState{'}'} /&gt;</div>
              </div>

              {/* Added line */}
              <div className="flex group bg-[#2ea043]/10 hover:bg-[#2ea043]/20">
                <div className="w-12 text-right pr-4 text-[#2ea043] select-none opacity-80">18</div>
                <div className="w-6 text-center text-[#2ea043] select-none font-bold">+</div>
                <div className="flex-1 pl-4 whitespace-pre text-[#e8e8e8]">      &lt;<span className="text-[#5e6ad2]">Dashboard</span> state={'{'}vehicleState{'}'} <span className="text-[#2ea043] bg-[#2ea043]/20 px-1 rounded-sm">syncStatus={'{'}syncStatus{'}'}</span> /&gt;</div>
              </div>

              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">19</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]">    &lt;/<span className="text-[#5e6ad2]">View</span>&gt;</div>
              </div>
              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">20</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]">  )</div>
              </div>
              <div className="flex group hover:bg-[#262729]/50">
                <div className="w-12 text-right pr-4 text-[#858688] select-none opacity-50">21</div>
                <div className="w-6 text-center select-none"></div>
                <div className="flex-1 pl-4 whitespace-pre text-[#c4c5c7]">{'}'}</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
