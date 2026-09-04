const fs = require('fs');
const path = require('path');

const roles = {
  'intern': {
    name: 'Intern',
    pages: [
      { path: 'tasks', title: 'My Tasks', desc: 'Assigned PRs and learning feedback.' },
      { path: 'extensions', title: 'Approved Extensions', desc: 'PR Assistant, Code Review Explainer, Test Generator.' }
    ]
  },
  'sr-dev': {
    name: 'Sr. Dev',
    pages: [
      { path: 'approvals', title: 'Approval Queue', desc: 'Pending holds requiring technical review.' },
      { path: 'incidents', title: 'Team Incidents', desc: 'Active technical responses and root-cause analysis.' }
    ]
  },
  'hr': {
    name: 'HR',
    pages: [
      { path: 'patterns', title: 'Pattern Analysis', desc: 'Training-gap signals and staffing bottlenecks.' },
      { path: 'policies', title: 'Policy Enforcement', desc: 'Role-based compliance and policy search.' }
    ]
  },
  'management': {
    name: 'Management',
    pages: [
      { path: 'escalations', title: 'Ultimate Escalations', desc: 'Break-glass releases and critical incidents.' },
      { path: 'investment', title: 'Business Impact', desc: 'Financial exposure ranges and control trends.' }
    ]
  }
};

const baseDir = path.join(__dirname, 'web/app');

for (const [roleKey, roleData] of Object.entries(roles)) {
  for (const page of roleData.pages) {
    const dir = path.join(baseDir, roleKey, page.path);
    fs.mkdirSync(dir, { recursive: true });
    
    const content = `import { DashboardShell } from "@/components/dashboard-shell";

export default function ${page.path.charAt(0).toUpperCase() + page.path.slice(1)}Page() {
  return (
    <DashboardShell roleName="${roleData.name}" navItems={[]}>
      <div className="flex flex-col h-full text-[#e8e8e8]">
        <div className="w-full sticky top-0 bg-[#1a1b1d]/95 backdrop-blur-md z-10 border-b border-transparent">
          <div className="px-8 py-4 flex items-center gap-3 text-[13px] font-medium">
            <h2 className="text-[15px] font-medium text-[#e8e8e8]">${page.title}</h2>
          </div>
        </div>

        <div className="max-w-4xl px-8 pt-4 pb-20 flex-1">
          <div className="sticky top-[60px] bg-[#1a1b1d]/95 backdrop-blur-md z-10 py-2 border-b border-[#2b2c2e] mb-6">
            <h3 className="text-[13px] font-medium text-[#858688]">Overview</h3>
          </div>

          <div className="space-y-6">
            <div className="group flex flex-col relative border-b border-[#2b2c2e] pb-6 last:border-0">
              <h4 className="text-[15px] font-medium text-[#e8e8e8] mb-2">${page.desc}</h4>
              <p className="text-[14px] leading-relaxed text-[#c4c5c7] mb-4">
                This section is under construction. It will contain the detailed views for ${page.title.toLowerCase()} as defined in the KVCH Internal Workbench context.
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
}
console.log('Pages generated successfully.');
