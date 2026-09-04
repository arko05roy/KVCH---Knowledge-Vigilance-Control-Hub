import { DashboardShell } from "@/components/dashboard-shell";

export default function ApprovalsPage() {
  return (
    <DashboardShell roleName="Sr. Dev" navItems={[]}>
      <div className="flex flex-col h-full text-[#e8e8e8]">
        <div className="w-full sticky top-0 bg-[#1a1b1d]/95 backdrop-blur-md z-10 border-b border-transparent">
          <div className="px-8 py-4 flex items-center gap-3 text-[13px] font-medium">
            <h2 className="text-[15px] font-medium text-[#e8e8e8]">Approval Queue</h2>
          </div>
        </div>

        <div className="max-w-4xl px-8 pt-4 pb-20 flex-1">
          <div className="sticky top-[60px] bg-[#1a1b1d]/95 backdrop-blur-md z-10 py-2 border-b border-[#2b2c2e] mb-6">
            <h3 className="text-[13px] font-medium text-[#858688]">Overview</h3>
          </div>

          <div className="space-y-6">
            <div className="group flex flex-col relative border-b border-[#2b2c2e] pb-6 last:border-0">
              <h4 className="text-[15px] font-medium text-[#e8e8e8] mb-2">Pending holds requiring technical review.</h4>
              <p className="text-[14px] leading-relaxed text-[#c4c5c7] mb-4">
                This section is under construction. It will contain the detailed views for approval queue as defined in the KVCH Internal Workbench context.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
