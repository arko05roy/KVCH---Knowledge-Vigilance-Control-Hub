import { DashboardShell } from "@/components/dashboard-shell";
import { KanbanBoard } from "@/components/kanban-board";

export default function TasksPage() {
  return (
    <DashboardShell roleName="Intern" navItems={[]} hideHeader>
      <KanbanBoard />
    </DashboardShell>
  );
}
