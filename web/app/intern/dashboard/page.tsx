import { DashboardShell } from "@/components/dashboard-shell";

export default function PulsePage() {
  return (
    <DashboardShell roleName="Intern" navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#111213] text-[#e8e8e8] overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col px-8 pt-5 pb-3 border-b border-[#2b2c2e] shrink-0 bg-[#111213] z-10">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-[14px] font-medium text-[#e8e8e8]">Pulse</h2>
             <div className="flex items-center gap-4 text-[#858688]">
                <button className="hover:text-[#e8e8e8] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>
                <button className="hover:text-[#e8e8e8] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
             </div>
          </div>
          
          <div className="flex gap-2 items-center">
            <button className="px-3 py-1 bg-[#262729] rounded-full text-[13px] font-medium text-[#e8e8e8] border border-[#2b2c2e]">For me</button>
            <button className="px-3 py-1 text-[#858688] hover:text-[#c4c5c7] hover:bg-[#1a1b1d] rounded-full text-[13px] transition-colors">Popular</button>
            <button className="px-3 py-1 text-[#858688] hover:text-[#c4c5c7] hover:bg-[#1a1b1d] rounded-full text-[13px] transition-colors">Recent</button>
            <button className="w-6 h-6 ml-2 rounded-md flex items-center justify-center text-[#858688] hover:text-[#e8e8e8] hover:bg-[#1a1b1d] transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 pb-32 flex justify-center">
          <div className="w-full max-w-[680px] flex flex-col">
            
            {/* Today Separator */}
            <div className="flex items-center gap-4 mb-8 text-[12px] font-medium text-[#858688]">
              <span>Today</span>
              <div className="flex-1 h-[1px] bg-[#1e1f21]"></div>
            </div>

            {/* Post 1 */}
            <div className="group relative flex flex-col mb-12">
               <div className="flex items-start justify-between mb-2">
                 <h3 className="text-[16px] font-medium text-[#e8e8e8]">Core performance</h3>
                 <button className="text-[#858688] hover:text-[#e8e8e8] opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
               </div>
               
               <div className="flex items-center gap-2 text-[13px] mb-4">
                 <span className="flex items-center gap-1.5 text-[#2ea043] font-medium">
                   <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                   Project on track
                 </span>
                 <div className="flex items-center gap-1.5 text-[#858688] ml-2">
                   <div className="w-4 h-4 rounded-full bg-[#c4c5c7] flex items-center justify-center overflow-hidden"><svg viewBox="0 0 24 24" fill="none" stroke="#111213" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg></div>
                   <span className="text-[#c4c5c7]">julian</span>
                   <span>·</span>
                   <span>3 hours ago</span>
                 </div>
               </div>

               <p className="text-[14.5px] leading-[1.6] text-[#a1a3a6] mb-4">
                 Consistent progress improving launch times and overall responsiveness in the rider app. Early results are positive and we're focused on validating impact as changes roll out more broadly.
               </p>

               <div className="flex items-center gap-2 mt-1">
                 <button className="h-7 w-7 rounded-full flex items-center justify-center text-[#858688] hover:text-[#e8e8e8] hover:bg-[#262729] transition-colors border border-transparent hover:border-[#2b2c2e]">
                   <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                 </button>
                 <div className="flex gap-1.5">
                   <button className="h-7 px-2.5 rounded-full flex items-center gap-1.5 bg-[#262729] hover:bg-[#363739] transition-colors text-[12px] font-medium text-[#c4c5c7] border border-[#2b2c2e]">
                     <span>🔥</span> <span>2</span>
                   </button>
                   <button className="h-7 px-2.5 rounded-full flex items-center gap-1.5 bg-[#262729] hover:bg-[#363739] transition-colors text-[12px] font-medium text-[#c4c5c7] border border-[#2b2c2e]">
                     <span>👀</span> <span>1</span>
                   </button>
                 </div>
                 <button className="h-7 w-7 rounded-full flex items-center justify-center text-[#858688] hover:text-[#e8e8e8] hover:bg-[#262729] transition-colors ml-1 border border-transparent hover:border-[#2b2c2e]">
                   <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                 </button>
               </div>
            </div>

            {/* Post 2 */}
            <div className="group relative flex flex-col mb-12">
               <div className="flex items-start justify-between mb-2">
                 <h3 className="text-[16px] font-medium text-[#e8e8e8]">Vehicle state experience</h3>
                 <button className="text-[#858688] hover:text-[#e8e8e8] opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
               </div>
               
               <div className="flex items-center gap-2 text-[13px] mb-4">
                 <span className="flex items-center gap-1.5 text-[#f2c94c] font-medium">
                   <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
                   Project at risk
                 </span>
                 <div className="flex items-center gap-1.5 text-[#858688] ml-2">
                   <div className="w-4 h-4 rounded-full bg-[#c4c5c7] flex items-center justify-center overflow-hidden"><svg viewBox="0 0 24 24" fill="none" stroke="#111213" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg></div>
                   <span className="text-[#c4c5c7]">romain</span>
                   <span>·</span>
                   <span>12 hours ago</span>
                 </div>
               </div>

               <div className="text-[14.5px] leading-[1.6] text-[#a1a3a6] mb-4 pl-1">
                 <ul className="list-disc pl-4 space-y-2">
                   <li>Delays in autonomy state updates are impacting validation and rider experience</li>
                   <li>Additional edge cases surfaced around stale or out-of-order vehicle data</li>
                 </ul>
               </div>

               <div className="flex items-center gap-2 mt-1">
                 <button className="h-7 w-7 rounded-full flex items-center justify-center text-[#858688] hover:text-[#e8e8e8] hover:bg-[#262729] transition-colors border border-transparent hover:border-[#2b2c2e]">
                   <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                 </button>
                 <button className="h-7 w-7 rounded-full flex items-center justify-center text-[#858688] hover:text-[#e8e8e8] hover:bg-[#262729] transition-colors ml-1 border border-transparent hover:border-[#2b2c2e]">
                   <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                 </button>
               </div>
            </div>

            {/* Post 3 */}
            <div className="group relative flex flex-col mb-12">
               <div className="flex items-start justify-between mb-2">
                 <h3 className="text-[16px] font-medium text-[#e8e8e8]">Tokyo Launch</h3>
                 <button className="text-[#858688] hover:text-[#e8e8e8] opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
               </div>
               
               <div className="flex items-center gap-2 text-[13px] mb-4">
                 <span className="flex items-center gap-1.5 text-[#2ea043] font-medium">
                   <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                   Project on track
                 </span>
                 <div className="flex items-center gap-1.5 text-[#858688] ml-2">
                   <div className="w-4 h-4 rounded-full bg-[#c4c5c7] flex items-center justify-center overflow-hidden"><svg viewBox="0 0 24 24" fill="none" stroke="#111213" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg></div>
                   <span className="text-[#c4c5c7]">yann</span>
                   <span>·</span>
                   <span>1 day ago</span>
                 </div>
               </div>

               <p className="text-[14.5px] leading-[1.6] text-[#a1a3a6] mb-4">
                 Japan expansion is progressing as planned with ongoing coordination with local regulators.
               </p>

               <div className="flex items-center gap-2 mt-1">
                 <button className="h-7 w-7 rounded-full flex items-center justify-center text-[#858688] hover:text-[#e8e8e8] hover:bg-[#262729] transition-colors border border-transparent hover:border-[#2b2c2e]">
                   <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                 </button>
                 <div className="flex gap-1.5">
                   <button className="h-7 px-2.5 rounded-full flex items-center gap-1.5 bg-[#262729] hover:bg-[#363739] transition-colors text-[12px] font-medium text-[#c4c5c7] border border-[#2b2c2e]">
                     <span>🙌</span> <span>6</span>
                   </button>
                 </div>
                 <button className="h-7 w-7 rounded-full flex items-center justify-center text-[#858688] hover:text-[#e8e8e8] hover:bg-[#262729] transition-colors ml-1 border border-transparent hover:border-[#2b2c2e]">
                   <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                 </button>
               </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
