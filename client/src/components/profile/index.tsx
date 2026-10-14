import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Building2, Mail, Plus, ShieldCheck } from "lucide-react";
import { useAuth } from "../../store/auth.store";
import { findAll } from "../../service/task.service";
import { CreateOrgModal } from "../organization/org-modal";
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
          findAll({ organizationId: org.id, assigneeId: user.id })
        )
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
      <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[28px] p-6 flex items-center gap-4">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-[#BB86FC]"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#BB86FC] text-[#121212] ring-2 ring-[#03DAC6] flex items-center justify-center text-xl font-black">
            {initials}
          </div>
        )}
        <div>
          <h1 className="text-xl font-black text-[#E3E3E3]">{user.name}</h1>
          <p className="text-xs text-[#9E9E9E] font-semibold flex items-center gap-1.5 mt-1">
            <Mail size={13} />
            {user.email}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[3fr_2fr] gap-4">
        {/* Recent tasks across all orgs */}
        <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[28px] p-5 space-y-3">
          <h2 className="text-sm font-bold text-[#E3E3E3]">
            Последние задачи по всем организациям
          </h2>

          {loading ? (
            <p className="text-xs text-[#9E9E9E] py-6 text-center">Загрузка...</p>
          ) : recentTasks.length === 0 ? (
            <p className="text-xs text-[#9E9E9E] py-6 text-center">
              У вас пока нет назначенных задач
            </p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#252525] hover:bg-[#2c2c2c] border border-[#2C2C2C] cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#E3E3E3] truncate">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-[10px] text-[#9E9E9E] mt-0.5 truncate">
                        {task.description}
                      </p>
                    )}
                    <p className="text-[10px] text-[#9E9E9E] mt-0.5">
                      {task.dueDate || task.date}
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#252525] text-[#03DAC6] border border-[#03DAC6]/30 shrink-0">
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
        <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[28px] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#E3E3E3]">Мои организации</h2>
            <button
              onClick={() => setCreateOrgOpen(true)}
              className="text-xs font-bold text-[#BB86FC] hover:text-[#a871ea] flex items-center gap-1"
            >
              <Plus size={13} />
              Создать
            </button>
          </div>

          {organizations.length === 0 ? (
            <p className="text-xs text-[#9E9E9E] py-6 text-center">
              Вы пока не состоите ни в одной организации
            </p>
          ) : (
            <div className="space-y-2">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setActiveOrgById(org.id);
                    navigate(`/organizations/${org.id}`);
                  }}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-[#252525] hover:bg-[#2c2c2c] border border-[#2C2C2C] transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#BB86FC] text-[#121212] flex items-center justify-center shrink-0">
                      <Building2 size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#E3E3E3] truncate">
                        {org.name}
                      </p>
                      <p className="text-[10px] text-[#9E9E9E]">
                        {org.memberCount ?? 0} участников • {org.taskCount ?? 0} задач
                      </p>
                    </div>
                  </div>
                  {org.role && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#BB86FC]/15 text-[#BB86FC] border border-[#BB86FC]/30 flex items-center gap-1 shrink-0">
                      <ShieldCheck size={11} />
                      {ROLE_LABEL[org.role] || org.role}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateOrgModal isOpen={createOrgOpen} onClose={() => setCreateOrgOpen(false)} />
    </div>
  );
}
