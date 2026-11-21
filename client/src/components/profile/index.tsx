import { Building2, Mail, Plus, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { findAll } from "../../service/task.service";
import { useAuth } from "../../store/auth.store";
import type { ITaskResponce } from "../../types";
import { CreateOrgModal } from "../organization/org-modal";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Владелец",
  ADMIN: "Админ",
  MEMBER: "Участник",
};

export function ProfileComponent() {
  const navigate = useNavigate();
  const { user, organizations, setActiveOrgById } = useAuth();
  const [recentTasks, setRecentTasks] = useState<ITaskResponce[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRecentTasks() {
      if (!user || organizations.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);

      const perOrgTasks = await Promise.all(
        organizations.map((org) =>
          findAll({ organizationId: org.id, assigneeId: user.id }),
        ),
      );

      const merged = perOrgTasks
        .flat()
        .sort((a, b) => {
          const da = new Date(a.createdAt || 0).getTime();
          const db = new Date(b.createdAt || 0).getTime();
          return db - da;
        })
        .slice(0, 5);

      if (isMounted) {
        setRecentTasks(merged);
        setLoading(false);
      }
    }

    loadRecentTasks();
    return () => {
      isMounted = false;
    };
  }, [user?.id, organizations]);

  if (!user) return null;

  const initials = user.name ? user.name.substring(0, 1).toUpperCase() : "U";

  return (
    <div className="space-y-5 p-3 sm:p-4">
      {/* User card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-5 flex items-center gap-4 shadow-xs">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover ring-1 ring-[var(--border-light)]"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[var(--brand-primary)] text-[var(--bg-main)] flex items-center justify-center text-lg font-medium">
            {initials}
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            {user.name}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-normal flex items-center gap-1.5 mt-0.5">
            <Mail size={13} />
            {user.email}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[3fr_2fr] gap-4 items-start">
        {/* Recent tasks across all orgs */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-4 space-y-3 shadow-xs">
          <h2 className="text-xs font-semibold text-[var(--text-primary)] pb-2 border-b border-[var(--border-light)]">
            Последние задачи по всем организациям
          </h2>

          {loading ? (
            <p className="text-xs text-[var(--text-secondary)] py-6 text-center">
              Загрузка...
            </p>
          ) : recentTasks.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] py-6 text-center">
              У вас пока нет назначенных задач
            </p>
          ) : (
            <div className="space-y-1.5">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[var(--bg-overlay)]/60 hover:bg-[var(--bg-overlay)] border border-[var(--border-light)] cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 truncate">
                        {task.description}
                      </p>
                    )}
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                      {task.dueDate || task.date}
                    </p>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--bg-overlay)] text-[var(--brand-secondary)] border border-[var(--brand-secondary)]/30 shrink-0">
                    {task.organizationId
                      ? organizations.find((o) => o.id === task.organizationId)?.name
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Organizations list */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-light)]">
            <h2 className="text-xs font-semibold text-[var(--text-primary)]">
              Мои организации
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreateOrgOpen(true)}
              className="text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] p-0.5 h-auto text-xs font-medium"
            >
              <Plus size={13} />
              Создать
            </Button>
          </div>

          {organizations.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] py-6 text-center">
              Вы пока не состоите ни в одной организации
            </p>
          ) : (
            <div className="space-y-2">
              {organizations.map((org) => (
                <Button
                  key={org.id}
                  variant="dark"
                  onClick={() => {
                    setActiveOrgById(org.id);
                    navigate(`/organizations/${org.id}`);
                  }}
                  className="w-full justify-between gap-3 p-2.5 rounded-lg text-left h-auto font-normal hover:bg-[var(--border-light)]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[var(--brand-primary)] text-[var(--bg-main)] flex items-center justify-center shrink-0">
                      <Building2 size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                        {org.name}
                      </p>
                      <p className="text-[10px] text-[var(--text-secondary)]">
                        {org.memberCount ?? 0} участников • {org.taskCount ?? 0} задач
                      </p>
                    </div>
                  </div>
                  {org.role && (
                    <Badge variant="default" className="text-[10px] px-2 py-0.5 shrink-0">
                      <ShieldCheck size={11} />
                      {ROLE_LABEL[org.role] || org.role}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateOrgModal isOpen={createOrgOpen} onClose={() => setCreateOrgOpen(false)} />
    </div>
  );
}
