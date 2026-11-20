import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { findAll } from "../../service/task.service";
import { useAuth } from "../../store/auth.store";
import type { ITaskResponce } from "../../types";
import { computeTaskStats } from "../helper/task-stats";
import { CreateTaskModal } from "../tasks/functions/create";
import { Button } from "../ui/button";
import { WorkloadOverview } from "./stat-cards";

type TaskFilterTab = "my" | "priority" | "done";

export function DashboardComponent() {
  const navigate = useNavigate();
  const { user, activeOrg } = useAuth();
  const [tasks, setTasks] = useState<ITaskResponce[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TaskFilterTab>("my");
  const [createOpen, setCreateOpen] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!activeOrg) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await findAll({ organizationId: activeOrg.id });
    setTasks(data || []);
    setLoading(false);
  }, [activeOrg]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);

  // 1. My open tasks
  const myOpenTasks = useMemo(() => {
    return tasks.filter((t) => {
      const isMyTask = Number(t.assigneeId) === Number(user?.id);
      const isNotDone = String(t.order ?? t.status) !== "2";
      return isMyTask && isNotDone;
    });
  }, [tasks, user?.id]);

  // 2. High priority open tasks across project
  const priorityTasks = useMemo(() => {
    return [...tasks]
      .filter((t) => String(t.order ?? t.status) !== "2")
      .sort((a, b) => {
        const pa = Number(a.priority ?? a.preority ?? 0);
        const pb = Number(b.priority ?? b.preority ?? 0);
        return pb - pa;
      })
      .slice(0, 6);
  }, [tasks]);

  // 3. Recently completed tasks
  const recentDoneTasks = useMemo(() => {
    return tasks.filter((t) => String(t.order ?? t.status) === "2").slice(0, 6);
  }, [tasks]);

  const displayedTasks = useMemo(() => {
    if (activeTab === "my") return myOpenTasks;
    if (activeTab === "priority") return priorityTasks;
    return recentDoneTasks;
  }, [activeTab, myOpenTasks, priorityTasks, recentDoneTasks]);

  if (!activeOrg) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-[var(--text-secondary)] text-sm font-medium">
          У вас пока нет активной организации.
        </p>
        <Button variant="primary" size="sm" onClick={() => navigate("/profile")}>
          Создать организацию
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-light)]">
        <div className="w-6 h-6 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[var(--text-secondary)] text-xs font-normal">
          Загрузка задач проекта...
        </p>
      </div>
    );
  }

  const firstName = user?.name?.trim().split(" ")[0] || "коллега";

  return (
    <div className="space-y-5">
      {/* 1. Header with greeting and primary actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-light)]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            С возвращением, {firstName} 👋
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Рабочее пространство{" "}
            <span className="text-[var(--text-primary)] font-medium">
              {activeOrg.name}
            </span>{" "}
            •{" "}
            {myOpenTasks.length > 0 ? (
              <span>
                У вас{" "}
                <strong className="text-[var(--brand-primary)] font-semibold">
                  {myOpenTasks.length}
                </strong>{" "}
                {myOpenTasks.length === 1
                  ? "активная задача"
                  : myOpenTasks.length < 5
                    ? "активные задачи"
                    : "активных задач"}
              </span>
            ) : (
              <span>Все назначенные вам задачи завершены</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="dark"
            size="sm"
            onClick={() => navigate("/tasks")}
            className="gap-1.5"
          >
            Доска задач
            <ArrowRight size={13} strokeWidth={1.75} />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="gap-1.5"
          >
            <Plus size={14} strokeWidth={2} />
            Новая задача
          </Button>
        </div>
      </div>

      {/* 2. Unified Sprint/Cycle Workload Overview */}
      <WorkloadOverview stats={stats} />

      {/* 3. Main Workspace Grid */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4 items-start">
        {/* Left Column: Focus Tasks with Tabs */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.03)] space-y-3">
          {/* Tab Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-2.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("my")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeTab === "my"
                    ? "bg-[var(--bg-overlay)] text-[var(--text-primary)] font-semibold shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Мои задачи ({myOpenTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("priority")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeTab === "priority"
                    ? "bg-[var(--bg-overlay)] text-[var(--text-primary)] font-semibold shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Приоритетные ({priorityTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("done")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeTab === "done"
                    ? "bg-[var(--bg-overlay)] text-[var(--text-primary)] font-semibold shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Готово ({recentDoneTasks.length})
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/tasks")}
              className="text-xs text-[var(--brand-primary)] hover:opacity-80 p-1 h-auto"
            >
              Все <ArrowRight size={12} strokeWidth={1.75} />
            </Button>
          </div>

          {/* Task List */}
          {displayedTasks.length === 0 ? (
            <div className="py-12 text-center space-y-1.5">
              <p className="text-xs font-medium text-[var(--text-primary)]">
                {activeTab === "my"
                  ? "Нет задач, назначенных на вас"
                  : activeTab === "priority"
                    ? "Нет открытых задач с высоким приоритетом"
                    : "Пока нет завершённых задач"}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {activeTab === "my"
                  ? "Создайте задачу или назначьте существующую на доске."
                  : "Все тикеты находятся в штатном режиме."}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {displayedTasks.map((task) => {
                const isTaskDone = String(task.order ?? task.status) === "2";
                const isTaskInProgress = String(task.order ?? task.status) === "1";
                const priorityNum = Number(task.priority ?? task.preority ?? 1);
                const isHigh = priorityNum === 2;

                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="group flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[var(--bg-overlay)]/60 hover:bg-[var(--bg-overlay)] border border-[var(--border-light)] hover:border-white/15 cursor-pointer transition-all duration-150"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Linear-style status glyph */}
                      <div className="shrink-0">
                        {isTaskDone ? (
                          <CheckCircle2
                            size={15}
                            strokeWidth={2}
                            className="text-[var(--status-success)]"
                          />
                        ) : isTaskInProgress ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--status-info)] border-r-transparent animate-spin" />
                        ) : (
                          <Circle
                            size={14}
                            strokeWidth={1.5}
                            className="text-[var(--text-disabled)]"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`text-xs font-medium text-[var(--text-primary)] truncate ${
                            isTaskDone ? "line-through text-[var(--text-disabled)]" : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--text-secondary)]">
                          <span>{task.assignee?.name || "Без исполнителя"}</span>
                          {task.dueDate && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock size={10} strokeWidth={1.5} />
                                {task.dueDate}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isHigh ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--status-error)]/15 text-[var(--status-error)] border border-[var(--status-error)]/30">
                          <Flame size={10} strokeWidth={2} />
                          Важная
                        </span>
                      ) : (
                        <span className="text-[10px] font-normal text-[var(--text-disabled)] px-1.5 py-0.5 rounded border border-[var(--border-light)]">
                          P{priorityNum}
                        </span>
                      )}
                      <ArrowRight
                        size={13}
                        strokeWidth={1.75}
                        className="text-[var(--text-disabled)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Workspace Hub & Team Collaboration */}
        <div className="space-y-4">
          {/* Workspace summary card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.03)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Команда
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30">
                {activeOrg.role === "OWNER" || activeOrg.role === "owner"
                  ? "Владелец"
                  : "Участник"}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {activeOrg.name}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Единое пространство проектов, задач и сообщений.
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--border-light)] grid grid-cols-2 gap-2">
              <Button
                variant="dark"
                size="sm"
                onClick={() => navigate("/chat")}
                className="gap-1.5 justify-center w-full"
              >
                <MessageSquare size={13} strokeWidth={1.75} />
                Чат команды
              </Button>
              <Button
                variant="dark"
                size="sm"
                onClick={() => navigate(`/organizations/${activeOrg.id}`)}
                className="gap-1.5 justify-center w-full"
              >
                <Users size={13} strokeWidth={1.75} />
                Участники
              </Button>
            </div>
          </div>

          {/* Quick tips & shortcuts */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.03)] space-y-2">
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              Быстрый доступ
            </span>
            <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center justify-between py-1 border-b border-[var(--border-light)]/60">
                <span>Канбан-доска</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-overlay)] border border-[var(--border-light)] text-[10px] font-mono text-[var(--text-primary)]">
                  /tasks
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[var(--border-light)]/60">
                <span>Командный чат</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-overlay)] border border-[var(--border-light)] text-[10px] font-mono text-[var(--text-primary)]">
                  /chat
                </kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Настройки организации</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-overlay)] border border-[var(--border-light)] text-[10px] font-mono text-[var(--text-primary)]">
                  /org
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Task */}
      <CreateTaskModal
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          loadTasks();
        }}
      />
    </div>
  );
}
