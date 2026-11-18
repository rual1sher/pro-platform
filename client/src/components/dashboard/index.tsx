import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  Building2,
  Calendar,
  MessageCircle,
  Users,
} from "lucide-react";
import { useAuth } from "../../store/auth.store";
import { findAll } from "../../service/task.service";
import { computeTaskStats } from "../helper/task-stats";
import { Button } from "../ui/button";
import { StatCards, STAT_CARDS } from "./stat-cards";
import type { ITaskResponce } from "../../types";

export function DashboardComponent() {
  const navigate = useNavigate();
  const { user, activeOrg, organizations } = useAuth();
  const [tasks, setTasks] = useState<ITaskResponce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      if (!activeOrg) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await findAll({ organizationId: activeOrg.id });
      if (isMounted) {
        setTasks(data || []);
        setLoading(false);
      }
    }

    loadTasks();
    return () => {
      isMounted = false;
    };
  }, [activeOrg?.id]);

  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);

  const priorityTasks = useMemo(() => {
    return [...tasks]
      .filter((t) => String(t.order ?? t.status) !== "2")
      .sort((a, b) => {
        const pa = Number(a.priority ?? a.preority ?? 0);
        const pb = Number(b.priority ?? b.preority ?? 0);
        return pb - pa;
      })
      .slice(0, 5);
  }, [tasks]);

  if (!activeOrg) {
    return (
      <div className="py-16 text-center text-[#9E9E9E] text-sm font-bold">
        У вас пока нет организации — создайте её на странице профиля.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[28px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#E3E3E3]">
            Привет, {user?.name || "воркер"} 👋
          </h1>
          <p className="text-xs text-[#9E9E9E] font-semibold mt-1 flex items-center gap-1.5">
            <Building2 size={13} className="text-[#BB86FC]" />
            {activeOrg.name} • {organizations.length} организаций
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="dark" onClick={() => navigate("/tasks")}>
            <Calendar size={15} />
            Задачи
          </Button>
          <Button variant="primary" onClick={() => navigate("/chat")}>
            <MessageCircle size={15} />
            Чат команды
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#1E1E1E] rounded-[28px] border border-[#2C2C2C]">
          <div className="w-8 h-8 border-3 border-[#BB86FC] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#E3E3E3] text-xs font-bold">Загрузка прогресса...</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <StatCards stats={stats} />

          <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
            {/* Priority tasks */}
            <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[28px] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#E3E3E3]">
                  Приоритетные задачи
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/tasks")}
                  className="text-xs font-bold text-[#BB86FC] hover:text-[#a871ea] p-1 h-auto"
                >
                  Все задачи <ArrowRight size={13} />
                </Button>
              </div>

              {priorityTasks.length === 0 ? (
                <p className="text-xs text-[#9E9E9E] py-6 text-center">
                  Нет открытых задач — можно выдохнуть 🎉
                </p>
              ) : (
                <div className="space-y-2">
                  {priorityTasks.map((task) => (
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
                          {task.assignee?.name || "Без исполнителя"} • {task.dueDate || task.date}
                        </p>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#BB86FC]/15 text-[#BB86FC] border border-[#BB86FC]/30 shrink-0">
                        P{task.priority ?? task.preority ?? "1"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Progress breakdown */}
            <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-[28px] p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#E3E3E3]">Прогресс</h2>
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

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/organizations/${activeOrg.id}`)}
                className="w-full text-xs font-bold text-[#03DAC6] hover:text-[#02c0ae] gap-1.5 pt-2 border-t border-[#2C2C2C] rounded-none h-auto"
              >
                <Users size={13} />
                Профиль организации
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
