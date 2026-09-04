import { DashboardShell } from "@/components/dashboard-shell";

export default function IssuesPage() {
  return (
    <DashboardShell roleName="Intern" navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#111213] text-[#e8e8e8]">
        
        {/* Header */}
        <div className="flex flex-col px-8 py-5 border-b border-[#2b2c2e] shrink-0 sticky top-0 bg-[#111213]/95 backdrop-blur-md z-10">
          <h2 className="text-[15px] font-medium text-[#e8e8e8] mb-4">My issues</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-[#262729] rounded-full text-[13px] font-medium text-[#e8e8e8]">Assigned</button>
              <button className="px-3 py-1.5 text-[#858688] hover:text-[#c4c5c7] hover:bg-[#1a1b1d] rounded-full text-[13px] transition-colors">Created</button>
              <button className="px-3 py-1.5 text-[#858688] hover:text-[#c4c5c7] hover:bg-[#1a1b1d] rounded-full text-[13px] transition-colors">Subscribed</button>
              <button className="px-3 py-1.5 text-[#858688] hover:text-[#c4c5c7] hover:bg-[#1a1b1d] rounded-full text-[13px] transition-colors">Activity</button>
            </div>
            
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full border border-[#2b2c2e] flex items-center justify-center text-[#858688] hover:text-[#e8e8e8] hover:bg-[#1a1b1d] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              </button>
              <button className="w-8 h-8 rounded-full border border-[#2b2c2e] flex items-center justify-center text-[#858688] hover:text-[#e8e8e8] hover:bg-[#1a1b1d] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12H3"/><path d="M21 6H3"/><path d="M21 18H3"/></svg>
              </button>
              <button className="w-8 h-8 rounded-full border border-[#2b2c2e] flex items-center justify-center text-[#858688] hover:text-[#e8e8e8] hover:bg-[#1a1b1d] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
              </button>
              <button className="w-8 h-8 rounded-full border border-[#2b2c2e] flex items-center justify-center text-[#858688] hover:text-[#e8e8e8] hover:bg-[#1a1b1d] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-6 py-2 pb-20">
          
          {/* Group: In Review */}
          <div className="mb-6">
            <div className="flex items-center gap-2 py-2 group cursor-pointer text-[#858688] hover:text-[#c4c5c7]">
              <span className="text-[10px]">▼</span>
              <svg className="text-[#2ea043] w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
              <span className="text-[13px] font-medium text-[#e8e8e8]">In Review</span>
              <span className="text-[13px]">3</span>
            </div>
            
            <div className="flex flex-col">
              <IssueRow 
                id="ENG-2498" 
                status="review" 
                title="Replace isFullySynced with a sync status" 
                pr="#54910" 
                tags={[{ label: "iOS", color: "#f2c94c" }]}
                date="Oct 9"
              />
              <IssueRow 
                id="ENG-2380" 
                status="review" 
                title="Show a stale data banner while syncing" 
                pr="#55167" 
                tags={[{ label: "Reliability", color: "#5e6ad2" }]}
                date="Oct 9"
              />
              <IssueRow 
                id="ENG-2039" 
                status="review" 
                title="Pass sync status to the dashboard" 
                pr="#55209" 
                tags={[{ label: "Bug", color: "#eb5757" }, { label: "Reliability", color: "#5e6ad2" }]}
                date="Oct 8"
                isMuted
              />
            </div>
          </div>

          {/* Group: In Progress */}
          <div className="mb-6">
            <div className="flex items-center gap-2 py-2 group cursor-pointer text-[#858688] hover:text-[#c4c5c7]">
              <span className="text-[10px]">▼</span>
              <svg className="text-[#f2c94c] w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v10l5 5"/></svg>
              <span className="text-[13px] font-medium text-[#e8e8e8]">In Progress</span>
              <span className="text-[13px]">4</span>
            </div>
            
            <div className="flex flex-col">
              <IssueRow 
                id="ENG-2076" 
                status="progress" 
                title="Reduce ETA jitter" 
                pr="#55423" 
                tags={[{ label: "Performance", color: "#2ea043" }, { label: "Working...", avatar: true }]}
                date="Oct 6"
              />
              <IssueRow 
                id="ENG-2108" 
                status="progress" 
                title="Handle GPS dropouts gracefully" 
                pr="#55409" 
                tags={[{ label: "Maps", color: "#f2c94c" }, { label: "Working...", avatar: true }]}
                date="Oct 2"
              />
              <IssueRow 
                id="ENG-2143" 
                status="progress" 
                title="Optimize map tile loading on initial app open" 
                tags={[{ label: "Maps", color: "#f2c94c" }]}
                date="Oct 7"
              />
              <IssueRow 
                id="ENG-2187" 
                status="progress" 
                title="Prevent duplicate ride requests on poor networks" 
                tags={[{ label: "Bug", color: "#eb5757" }, { label: "Working...", avatar: true }]}
                date="Oct 5"
                isMuted
              />
            </div>
          </div>

          {/* Group: Todo */}
          <div className="mb-6">
            <div className="flex items-center gap-2 py-2 group cursor-pointer text-[#858688] hover:text-[#c4c5c7]">
              <span className="text-[10px]">▼</span>
              <svg className="text-[#858688] w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
              <span className="text-[13px] font-medium text-[#e8e8e8]">Todo</span>
              <span className="text-[13px]">4</span>
            </div>
            
            <div className="flex flex-col">
              <IssueRow 
                id="ENG-2254" 
                status="todo" 
                title="Reduce unnecessary map re-rendering on home screen" 
                tags={[{ label: "Maps", color: "#f2c94c" }]}
                date="Oct 10"
              />
              <IssueRow 
                id="ENG-2291" 
                status="todo" 
                title="Clean up deprecated APIs used by the rider app" 
                tags={[{ label: "API", color: "#5e6ad2" }]}
                date="Oct 9"
              />
              <IssueRow 
                id="ENG-2327" 
                status="todo" 
                title="Speed up CI pipelines for mobile builds" 
                tags={[{ label: "Performance", color: "#2ea043" }]}
                date="Oct 9"
              />
              <IssueRow 
                id="ENG-2358" 
                status="todo" 
                title="Reduce flakiness in mobile UI tests" 
                tags={[{ label: "Reliability", color: "#5e6ad2" }]}
                date="Oct 4"
              />
            </div>
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}

function IssueRow({ 
  id, 
  status, 
  title, 
  pr, 
  tags, 
  date,
  isMuted = false 
}: { 
  id: string, 
  status: 'review' | 'progress' | 'todo', 
  title: string, 
  pr?: string, 
  tags?: { label: string, color?: string, avatar?: boolean }[], 
  date: string,
  isMuted?: boolean 
}) {
  return (
    <div className="group flex items-center justify-between py-2.5 px-2 hover:bg-[#1a1b1d] rounded-md cursor-pointer transition-colors border-b border-[#2b2c2e]/40 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <svg className="w-3.5 h-3.5 text-[#424345] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>
        <span className={`text-[13px] font-mono shrink-0 w-20 ${isMuted ? 'text-[#424345]' : 'text-[#858688]'}`}>{id}</span>
        
        {status === 'review' && <svg className="text-[#2ea043] w-[15px] h-[15px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>}
        {status === 'progress' && <svg className="text-[#f2c94c] w-[15px] h-[15px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v10l5 5"/></svg>}
        {status === 'todo' && <svg className="text-[#858688] w-[15px] h-[15px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>}
        
        <span className={`text-[13.5px] font-medium truncate ${isMuted ? 'text-[#858688]' : 'text-[#e8e8e8]'}`}>{title}</span>
      </div>
      
      <div className="flex items-center gap-3 shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity lg:opacity-100">
        {pr && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#2b2c2e] text-[#858688] text-[12px]">
            <svg className="w-3 h-3 text-[#2ea043]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            <span>{pr}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {tags?.map((tag, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#2b2c2e] text-[12px] text-[#858688]">
              {tag.color && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />}
              {tag.avatar && (
                <div className="flex -space-x-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#e8e8e8] border border-[#111213]"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#858688] border border-[#111213]"></div>
                </div>
              )}
              <span>{tag.label}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-3 w-[72px] justify-end">
          <div className="w-4 h-4 rounded-full bg-[#c4c5c7] flex items-center justify-center overflow-hidden shrink-0"><svg viewBox="0 0 24 24" fill="none" stroke="#111213" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/></svg></div>
          <span className="text-[12px] text-[#858688] w-10 text-right">{date}</span>
        </div>
      </div>
    </div>
  );
}
