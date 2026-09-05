import { DashboardShell } from "@/components/dashboard-shell";

export default function SrDevPulsePage() {
  return (
    <DashboardShell roleName="Sr. Dev" navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#111213] text-[#e8e8e8] overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col px-8 pt-5 pb-3 border-b border-[#2b2c2e] shrink-0 bg-[#111213] z-10">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-[14px] font-medium text-[#e8e8e8]">Pulse Feed</h2>
             <div className="flex items-center gap-4 text-[#858688]">
                <button className="hover:text-[#e8e8e8] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></button>
                <button className="hover:text-[#e8e8e8] transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
             </div>
          </div>
          
          <div className="flex gap-2 items-center">
            <button className="px-3 py-1 bg-[#262729] rounded-full text-[13px] font-medium text-[#e8e8e8] border border-[#2b2c2e]">For me</button>
            <button className="px-3 py-1 text-[#858688] hover:text-[#c4c5c7] hover:bg-[#1a1b1d] rounded-full text-[13px] transition-colors">Popular</button>
            <button className="px-3 py-1 text-[#858688] hover:text-[#c4c5c7] hover:bg-[#1a1b1d] rounded-full text-[13px] transition-colors">Recent</button>
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
                 <h3 className="text-[16px] font-medium text-[#e8e8e8]">Core Performance & Threat Scanning</h3>
               </div>
               <div className="flex items-center gap-2 text-[13px] mb-4">
                 <span className="flex items-center gap-1.5 text-[#2ea043] font-medium">
                   <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                   Scan Completed
                 </span>
                 <div className="flex items-center gap-1.5 text-[#858688] ml-2">
                   <span className="text-[#c4c5c7]">attack-surface-scanner</span>
                   <span>·</span>
                   <span>2 hours ago</span>
                 </div>
               </div>
               <p className="text-[14.5px] leading-[1.6] text-[#a1a3a6] mb-4">
                 Active network scan completed across 192.168.31.204. Discovered 2 open ports (5432 PostgreSQL, 445 SMB) with clean SSL configuration.
               </p>
            </div>

            {/* Post 2 */}
            <div className="group relative flex flex-col mb-12">
               <div className="flex items-start justify-between mb-2">
                 <h3 className="text-[16px] font-medium text-[#e8e8e8]">VPN Cryptography Evaluation</h3>
               </div>
               <div className="flex items-center gap-2 text-[13px] mb-4">
                 <span className="flex items-center gap-1.5 text-[#f2c94c] font-medium">
                   <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
                   Notice
                 </span>
                 <div className="flex items-center gap-1.5 text-[#858688] ml-2">
                   <span className="text-[#c4c5c7]">vpn-crypto-analyzer</span>
                   <span>·</span>
                   <span>6 hours ago</span>
                 </div>
               </div>
               <p className="text-[14.5px] leading-[1.6] text-[#a1a3a6] mb-4">
                 Audited active WireGuard interfaces. AES-GCM cipher suite verified. Zero unencrypted fallback sockets detected.
               </p>
            </div>

          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
