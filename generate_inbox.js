const fs = require('fs');
const path = require('path');

const roles = {
  'intern': { name: 'Intern' },
  'sr-dev': { name: 'Sr. Dev' },
  'hr': { name: 'HR' },
  'management': { name: 'Management' }
};

const baseDir = path.join(__dirname, 'web/app');

for (const [roleKey, roleData] of Object.entries(roles)) {
  const dir = path.join(baseDir, roleKey, 'inbox');
  fs.mkdirSync(dir, { recursive: true });
  
  const content = `import { DashboardShell } from "@/components/dashboard-shell";

export default function InboxPage() {
  return (
    <DashboardShell roleName="${roleData.name}" navItems={[]}>
      <div className="flex flex-col h-full text-[#e8e8e8]">
        <div className="w-full sticky top-0 bg-[#1a1b1d]/95 backdrop-blur-md z-10 border-b border-transparent">
          <div className="px-8 py-4 flex items-center gap-3 text-[13px] font-medium">
            <h2 className="text-[15px] font-medium text-[#e8e8e8]">Inbox</h2>
          </div>
        </div>

        <div className="max-w-4xl px-8 pt-4 pb-20 flex-1">
          <div className="sticky top-[60px] bg-[#1a1b1d]/95 backdrop-blur-md z-10 py-2 border-b border-[#2b2c2e] mb-6">
            <h3 className="text-[13px] font-medium text-[#858688]">Notifications</h3>
          </div>

          <div className="space-y-6">
            <div className="group flex flex-col relative border-b border-[#2b2c2e] pb-6 last:border-0">
              <h4 className="text-[15px] font-medium text-[#e8e8e8] mb-2">No new notifications</h4>
              <p className="text-[14px] leading-relaxed text-[#c4c5c7] mb-4">
                You're all caught up! New alerts and updates will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
`;
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
}
console.log('Inbox pages generated successfully.');
