import { useState } from "react";
import { AuthLoading } from "../../components/helper/auth-loading";
import { useAuthGuard } from "../../components/helper/use-auth-guard";
import { CreateOrgModal, MembersModal } from "../../components/organization/org-modal";
import { TasksComponent } from "../../components/tasks";
import { CreateTaskModal } from "../../components/tasks/functions/create";

export function TasksPage() {
  const { checking } = useAuthGuard();

  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  if (checking) {
    return <AuthLoading />;
  }

  return (
    <div className="w-full min-w-0 p-3 sm:p-4 text-[var(--text-primary)]">
      {/* Full-width Kanban Canvas (Linear/Jira style) */}
      <main className="w-full min-w-0">
        <TasksComponent />
      </main>

      {/* Organization, Members and Create Task Modals */}
      <CreateOrgModal isOpen={createOrgOpen} onClose={() => setCreateOrgOpen(false)} />
      <MembersModal isOpen={membersOpen} onClose={() => setMembersOpen(false)} />
      <CreateTaskModal isOpen={createTaskOpen} onClose={() => setCreateTaskOpen(false)} />
    </div>
  );
}
