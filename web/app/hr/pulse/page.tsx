import { DashboardShell } from "@/components/dashboard-shell";

export default function HrPulsePage() {
  return (
    <DashboardShell roleName="HR" navItems={[]} hideHeader>
      <div className="flex flex-col h-full w-full bg-[#111213] text-[#e8e8e8] overflow-hidden">
        <div className="flex flex-col px-8 pt-5 pb-3 border-b border-[#2b2c2e] shrink-0 bg-[#111213] z-10">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-[14px] font-medium text-[#e8e8e8]">Pulse Feed</h2>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-8 flex justify-center">
          <div className="w-full max-w-[680px] flex flex-col">
            <div className="flex items-center gap-4 mb-8 text-[12px] font-medium text-[#858688]">
              <span>Compliance Feed</span>
              <div className="flex-1 h-[1px] bg-[#1e1f21]"></div>
            </div>
            <div className="group relative flex flex-col mb-12">
               <h3 className="text-[16px] font-medium text-[#e8e8e8] mb-2">Q3 Security Policy Update</h3>
               <p className="text-[14.5px] leading-[1.6] text-[#a1a3a6]">
                 Policy compliance sign-off mandatory for all remote contractors.
               </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
