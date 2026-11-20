import { useState } from "react";
import { Container } from "../../components/helper/container";
import { TasksComponent } from "../../components/tasks";
import { CreateOrgModal, MembersModal } from "../../components/organization/org-modal";
import { CreateTaskModal } from "../../components/tasks/functions/create";
import { useAuthGuard } from "../../components/helper/use-auth-guard";
import { AuthLoading } from "../../components/helper/auth-loading";

export function TasksPage() {
  const { checking } = useAuthGuard();

  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  if (checking) {
    return <AuthLoading />;
  }

  return (
    <div className="w-full text-[var(--text-primary)] pb-12 pt-4">
      <Container className="py-2">
        {/* Full-width Kanban Canvas (Linear/Jira style) */}
        <main className="w-full min-w-0">
          <TasksComponent />
        </main>
      </Container>

      {/* Organization, Members and Create Task Modals */}
      <CreateOrgModal isOpen={createOrgOpen} onClose={() => setCreateOrgOpen(false)} />
      <MembersModal isOpen={membersOpen} onClose={() => setMembersOpen(false)} />
      <CreateTaskModal isOpen={createTaskOpen} onClose={() => setCreateTaskOpen(false)} />
    </div>
  );
}
