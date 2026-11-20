import { ArrowRight, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { findAll } from "../../service/task.service";
import { useAuth } from "../../store/auth.store";
import type { ITaskResponce } from "../../types";
import { computeTaskStats } from "../helper/task-stats";
import { Button } from "../ui/button";
import { STAT_CARDS, StatCards } from "./stat-cards";

export function DashboardComponent() {
  const navigate = useNavigate();
  const { activeOrg } = useAuth();
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
      <div className="py-16 text-center text-[var(--text-secondary)] text-sm font-bold">
        У вас пока нет организации — создайте её на странице профиля.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[var(--bg-surface)] rounded-[28px] border border-[var(--border-light)]">
        <div className="w-8 h-8 border-3 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[var(--text-primary)] text-xs font-bold">
          Загрузка прогресса...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <StatCards stats={stats} />

      <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
        {/* Priority tasks */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-[28px] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              Приоритетные задачи
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/tasks")}
              className="text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 p-1 h-auto"
            >
              Все задачи <ArrowRight size={13} />
            </Button>
          </div>

          {priorityTasks.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] py-6 text-center">
              Нет открытых задач — можно выдохнуть 🎉
            </p>
          ) : (
            <div className="space-y-2">
              {priorityTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--bg-overlay)] hover:opacity-90 border border-[var(--border-light)] cursor-pointer transition-colors"
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
                      {task.assignee?.name || "Без исполнителя"} •{" "}
                      {task.dueDate || task.date}
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 shrink-0">
                    P{task.priority ?? task.preority ?? "1"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress breakdown */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-[28px] p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Прогресс</h2>
            <span className="text-xs font-bold text-[var(--brand-primary)]">
              {stats.total} всего
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {STAT_CARDS.map((card) => (
              <div key={card.key}>
                <div className="flex justify-between text-[var(--text-primary)] mb-1 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${card.dot}`}></span>
                    {card.label}
                  </span>
                  <span className="font-bold" style={{ color: card.color }}>
                    {stats[card.key]} ({stats[`${card.key}Pct` as const]}%)
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-overlay)] h-1.5 rounded-full overflow-hidden">
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
            className="w-full text-xs font-bold text-[var(--brand-secondary)] hover:opacity-80 gap-1.5 pt-2 border-t border-[var(--border-light)] rounded-none h-auto"
          >
            <Users size={13} />
            Профиль организации
          </Button>
        </div>
      </div>
    </div>
  );
}
