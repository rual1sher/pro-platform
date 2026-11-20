import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Building2, Mail, Plus, ShieldCheck } from "lucide-react";
import { useAuth } from "../../store/auth.store";
import { findAll } from "../../service/task.service";
import { CreateOrgModal } from "../organization/org-modal";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { ITaskResponce } from "../../types";

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
    <div className="space-y-5">
      {/* User card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-[28px] p-6 flex items-center gap-4">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-[var(--brand-primary)]"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[var(--brand-primary)] text-[var(--bg-main)] ring-2 ring-[var(--brand-secondary)] flex items-center justify-center text-xl font-black">
            {initials}
          </div>
        )}
        <div>
          <h1 className="text-xl font-black text-[var(--text-primary)]">{user.name}</h1>
          <p className="text-xs text-[var(--text-secondary)] font-semibold flex items-center gap-1.5 mt-1">
            <Mail size={13} />
            {user.email}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[3fr_2fr] gap-4">
        {/* Recent tasks across all orgs */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-[28px] p-5 space-y-3">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
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
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--bg-overlay)] hover:bg-[var(--border-light)] border border-[var(--border-light)] cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">
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
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--bg-overlay)] text-[var(--brand-secondary)] border border-[var(--brand-secondary)]/30 shrink-0">
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
        <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-[28px] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Мои организации
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreateOrgOpen(true)}
              className="text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] p-1 h-auto font-bold"
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
                  className="w-full justify-between gap-3 p-3 rounded-xl text-left h-auto font-normal hover:bg-[var(--border-light)]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[var(--brand-primary)] text-[var(--bg-main)] flex items-center justify-center shrink-0">
                      <Building2 size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">
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
