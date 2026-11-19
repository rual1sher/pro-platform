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
import { STAT_CARDS } from "../../dashboard/stat-cards";
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
      <div className="py-16 text-center text-[#9E9E9E] text-sm font-bold">
        Организация не найдена или вы не состоите в ней.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[28px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#BB86FC] text-[#121212] flex items-center justify-center shrink-0">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#E3E3E3]">{org.name}</h1>
            {org.description && (
              <p className="text-xs text-[#9E9E9E] font-medium mt-0.5">
                {org.description}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="dark"
          onClick={() => {
            setActiveOrgById(org.id);
            navigate("/tasks");
          }}
        >
          <Calendar size={15} />
          Задачи организации
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#1E1E1E] rounded-[28px] border border-[#2C2C2C]">
          <div className="w-8 h-8 border-3 border-[#BB86FC] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#E3E3E3] text-xs font-bold">
            Загрузка данных организации...
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
          {/* Progress */}
          <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[28px] p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#E3E3E3]">Прогресс задач</h2>
              <span className="text-xs font-bold text-[#BB86FC]">
                {stats.total} всего
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {STAT_CARDS.map((card) => (
                <div key={card.key}>
                  <div className="flex justify-between text-[#E3E3E3] mb-1 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${card.dot}`}></span>
                      {card.label}
                    </span>
                    <span className="font-bold" style={{ color: card.color }}>
                      {stats[card.key]} ({stats[`${card.key}Pct` as const]}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#252525] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${stats[`${card.key}Pct` as const]}%`,
                        backgroundColor: card.color,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Members */}
          <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[28px] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#E3E3E3] flex items-center gap-1.5">
                <Users size={15} className="text-[#03DAC6]" />
                Участники ({members.length})
              </h2>
              {canManage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMembersOpen(true)}
                  className="text-xs font-bold text-[#BB86FC] hover:text-[#a871ea] p-1 h-auto"
                >
                  Управление
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {members.map((m) => {
                const isOwner = m.role === "OWNER";
                const isCurrentUser = m.userId === user?.id;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#252525] border border-[#2C2C2C]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {m.avatar ? (
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-[#BB86FC] shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#BB86FC] text-[#121212] flex items-center justify-center font-bold text-xs ring-2 ring-[#03DAC6] shrink-0">
                          {m.name.substring(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#E3E3E3] truncate">
                          {m.name}
                          {isCurrentUser && <span className="text-[#BB86FC]"> (Вы)</span>}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#1E1E1E] text-[#E3E3E3] border border-[#2C2C2C] flex items-center gap-1 shrink-0">
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
