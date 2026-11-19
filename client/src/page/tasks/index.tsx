import { useState } from "react";
import { Container } from "../../components/helper/container";
import { TasksComponent } from "../../components/tasks";
import { Sidebar } from "../../components/tasks/sidebar";
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
    <div className="w-full text-[#E3E3E3] pb-12 pt-4">
      <Container className="py-2">
        {/* Responsive Layout: Left Sidebar + Main Kanban Canvas */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Sidebar (Mini Calendar, Upcoming tasks, Time breakdown, Workspaces) */}
          <Sidebar
            onOpenCreateOrg={() => setCreateOrgOpen(true)}
            onOpenMembers={() => setMembersOpen(true)}
            onOpenCreateTask={() => setCreateTaskOpen(true)}
          />

          {/* Main Content Area (Month Header, Kanban Columns, Cards) */}
          <main className="flex-1 w-full min-w-0">
            <TasksComponent />
          </main>
        </div>
      </Container>

      {/* Organization, Members and Create Task Modals */}
      <CreateOrgModal isOpen={createOrgOpen} onClose={() => setCreateOrgOpen(false)} />
      <MembersModal isOpen={membersOpen} onClose={() => setMembersOpen(false)} />
      <CreateTaskModal isOpen={createTaskOpen} onClose={() => setCreateTaskOpen(false)} />
    </div>
  );
}
