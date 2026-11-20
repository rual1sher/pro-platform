import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Building2, Calendar, Shield, User, Users } from "lucide-react";
import { useAuth } from "../../../store/auth.store";
import { useTask } from "../../../store/task.store";
import { findAll } from "../../../service/task.service";
import { getOrganizationMembers } from "../../../service/organization.service";
import { computeTaskStats } from "../../helper/task-stats";
import { Button } from "../../ui/button";
import { MembersModal } from "../org-modal";
import { WorkloadOverview } from "../../dashboard/stat-cards";
import type { ITaskResponce } from "../../../types";

interface OrgProfileProps {
  organizationId: number;
}

export function OrgProfileComponent({ organizationId }: OrgProfileProps) {
  const navigate = useNavigate();
  const { user, organizations, setActiveOrgById } = useAuth();
  const { members, setMembers } = useTask();
  const [tasks, setTasks] = useState<ITaskResponce[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersOpen, setMembersOpen] = useState(false);

  const org = organizations.find((o) => o.id === organizationId);

  useEffect(() => {
    setActiveOrgById(organizationId);
  }, [organizationId]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      const [fetchedTasks, fetchedMembers] = await Promise.all([
        findAll({ organizationId }),
        getOrganizationMembers(organizationId),
      ]);
      if (isMounted) {
        setTasks(fetchedTasks || []);
        setMembers(fetchedMembers || []);
        setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [organizationId]);

  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);
  const canManage = org?.role === "OWNER" || org?.role === "ADMIN";

  if (!org) {
    return (
      <div className="py-16 text-center text-[var(--text-secondary)] text-sm font-bold">
        Организация не найдена или вы не состоите в ней.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)] text-[var(--bg-main)] flex items-center justify-center shrink-0">
            <Building2 size={20} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              {org.name}
            </h1>
            {org.description && (
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {org.description}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="dark"
          size="sm"
          onClick={() => {
            setActiveOrgById(org.id);
            navigate("/tasks");
          }}
          className="gap-1.5"
        >
          <Calendar size={14} strokeWidth={1.75} />
          Задачи организации
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)]">
          <div className="w-6 h-6 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--text-secondary)] text-xs font-normal">
            Загрузка данных организации...
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4 items-start">
          {/* Progress Overview */}
          <WorkloadOverview stats={stats} />

          {/* Members */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-light)]">
              <h2 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <Users size={14} className="text-[var(--brand-secondary)]" />
                Участники ({members.length})
              </h2>
              {canManage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMembersOpen(true)}
                  className="text-xs font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] p-0.5 h-auto"
                >
                  Управление
                </Button>
              )}
            </div>

            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {members.map((m) => {
                const isOwner = m.role === "OWNER";
                const isCurrentUser = m.userId === user?.id;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-overlay)]/60 border border-[var(--border-light)]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {m.avatar ? (
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-[var(--border-light)] shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[var(--brand-primary)] text-[var(--bg-main)] flex items-center justify-center font-medium text-xs shrink-0">
                          {m.name.substring(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                          {m.name}
                          {isCurrentUser && (
                            <span className="text-[var(--brand-primary)]"> (Вы)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-light)] flex items-center gap-1 shrink-0">
                      {isOwner ? <Shield size={10} /> : <User size={10} />}
                      {isOwner ? "Владелец" : m.role === "ADMIN" ? "Админ" : "Воркер"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <MembersModal isOpen={membersOpen} onClose={() => setMembersOpen(false)} />
    </div>
  );
}
