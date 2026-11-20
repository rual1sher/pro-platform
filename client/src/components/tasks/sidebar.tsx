import { useState } from "react";
import { useTask } from "../../store/task.store";
import { useAuth } from "../../store/auth.store";
import { update } from "../../service/task.service";
import { computeTaskStats } from "../helper/task-stats";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  Users,
  ChevronDown,
  Plus,
} from "lucide-react";
import type { ITaskResponce } from "../../types";
import { Button } from "../ui/button";

interface SidebarProps {
  onOpenCreateOrg: () => void;
  onOpenMembers: () => void;
  onOpenCreateTask: () => void;
}

export function Sidebar({
  onOpenCreateOrg,
  onOpenMembers,
  onOpenCreateTask,
}: SidebarProps) {
  const { tasks, updateTaskInStore } = useTask();
  const { activeOrg, organizations, setActiveOrgById } = useAuth();

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());
  const [orgsDropdownOpen, setOrgsDropdownOpen] = useState(false);

  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const daysOfWeek = ["П", "В", "С", "Ч", "П", "С", "В"];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const toggleTaskDone = async (task: ITaskResponce) => {
    const isDone = String(task.order ?? task.status) === "2";
    const newStatus = isDone ? "1" : "2";
    updateTaskInStore(task.id, { order: newStatus, status: newStatus });
    await update(task.id, { order: newStatus, status: newStatus });
  };

  const {
    inProgress: inProgressCount,
    done: doneCount,
    pending: pendingCount,
    rejected: rejectedCount,
    inProgressPct,
    donePct,
    pendingPct,
    rejectedPct,
  } = computeTaskStats(tasks);

  return (
    <aside className="w-full lg:w-[310px] shrink-0 space-y-4">
      {/* 1. Mini Calendar Widget */}
      <div className="bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-[30px] p-5 shadow-lg border border-[var(--border-light)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-[var(--text-primary)] tracking-wide">
            {monthNames[month]} {year}
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="dark"
              size="sm"
              onClick={prevMonth}
              className="w-7 h-7 p-0 rounded-full flex items-center justify-center text-[var(--brand-primary)]"
            >
              <ChevronLeft size={15} />
            </Button>
            <Button
              variant="dark"
              size="sm"
              onClick={nextMonth}
              className="w-7 h-7 p-0 rounded-full flex items-center justify-center text-[var(--brand-primary)]"
            >
              <ChevronRight size={15} />
            </Button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-[var(--brand-secondary)] mb-2">
          {daysOfWeek.map((day, idx) => (
            <div key={idx} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 text-center text-xs gap-y-1.5">
          {calendarDays.map((d, idx) => {
            if (d === null) {
              return (
                <div key={idx} className="py-1 text-transparent">
                  -
                </div>
              );
            }

            const isSelected = d === selectedDay;
            const isToday =
              d === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(d)}
                className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--brand-primary)] text-[var(--bg-main)] shadow-sm font-black scale-105"
                    : isToday
                      ? "border border-[var(--brand-secondary)] text-[var(--brand-secondary)]"
                      : "text-[var(--text-primary)]/80 hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Upcoming tasks / Активные задачи */}
      <div className="bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-[30px] p-5 shadow-lg border border-[var(--border-light)]">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-bold text-sm text-[var(--text-primary)] tracking-wide">
            Активные задачи
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenCreateTask}
            className="text-xs font-semibold text-[var(--brand-primary)] hover:opacity-80 flex items-center gap-1 p-1 h-auto"
          >
            <Plus size={13} />
            <span>Новая</span>
          </Button>
        </div>

        <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
          {tasks.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] py-3 text-center">
              Задач пока нет
            </p>
          ) : (
            tasks.slice(0, 4).map((task) => {
              const isDone = String(task.order ?? task.status) === "2";
              return (
                <div
                  key={task.id}
                  onClick={() => toggleTaskDone(task)}
                  className="flex items-start gap-2.5 p-2 rounded-xl bg-[var(--bg-overlay)] hover:opacity-90 border border-[var(--border-light)] cursor-pointer transition-all group"
                >
                  <div
                    className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center transition-colors shrink-0 ${
                      isDone
                        ? "bg-[var(--status-success)] text-[var(--bg-main)]"
                        : "border border-[var(--brand-primary)]/60 group-hover:border-[var(--brand-primary)]"
                    }`}
                  >
                    {isDone && <Check size={12} strokeWidth={3} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium truncate ${
                        isDone
                          ? "line-through text-[var(--text-disabled)]"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      {task.title}
                    </p>
                    <span className="text-[10px] text-[var(--brand-secondary)] block mt-0.5">
                      {task.dueDate || task.date || "Сегодня"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Task breakdown / Статистика задач */}
      <div className="bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-[30px] p-5 shadow-lg border border-[var(--border-light)]">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-bold text-sm text-[var(--text-primary)] tracking-wide">
            Статистика задач
          </h3>
          <span className="text-xs font-bold text-[var(--brand-primary)]">
            {tasks.length} всего
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* В работе */}
          <div>
            <div className="flex justify-between text-[var(--text-primary)] mb-1 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--status-info)]"></span>В
                работе
              </span>
              <span className="text-[var(--status-info)] font-bold">
                {inProgressCount} ({inProgressPct}%)
              </span>
            </div>
            <div className="w-full bg-[var(--bg-overlay)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--status-info)] h-full rounded-full transition-all duration-300"
                style={{ width: `${inProgressPct}%` }}
              ></div>
            </div>
          </div>

          {/* Готово */}
          <div>
            <div className="flex justify-between text-[var(--text-primary)] mb-1 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--status-success)]"></span>
                Готово
              </span>
              <span className="text-[var(--status-success)] font-bold">
                {doneCount} ({donePct}%)
              </span>
            </div>
            <div className="w-full bg-[var(--bg-overlay)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--status-success)] h-full rounded-full transition-all duration-300"
                style={{ width: `${donePct}%` }}
              ></div>
            </div>
          </div>

          {/* Ожидает */}
          <div>
            <div className="flex justify-between text-[var(--text-primary)] mb-1 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--text-disabled)]"></span>
                Ожидает
              </span>
              <span className="text-[var(--text-secondary)] font-bold">
                {pendingCount} ({pendingPct}%)
              </span>
            </div>
            <div className="w-full bg-[var(--bg-overlay)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[var(--text-disabled)] h-full rounded-full transition-all duration-300"
                style={{ width: `${pendingPct}%` }}
              ></div>
            </div>
          </div>

          {/* Отклонено */}
          {rejectedCount > 0 && (
            <div>
              <div className="flex justify-between text-[var(--text-primary)] mb-1 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--status-error)]"></span>
                  Отклонено
                </span>
                <span className="text-[var(--status-error)] font-bold">
                  {rejectedCount} ({rejectedPct}%)
                </span>
              </div>
              <div className="w-full bg-[var(--bg-overlay)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--status-error)] h-full rounded-full transition-all duration-300"
                  style={{ width: `${rejectedPct}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. My workspaces / Мои организации */}
      <div className="bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-[30px] p-5 shadow-lg border border-[var(--border-light)]">
        <div
          onClick={() => setOrgsDropdownOpen(!orgsDropdownOpen)}
          className="flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--brand-primary)] text-[var(--bg-main)] flex items-center justify-center font-bold text-xs shadow-sm">
              <Building2 size={16} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-xs text-[var(--text-primary)] truncate max-w-[150px]">
                {activeOrg?.name || "Организация"}
              </h3>
              <p className="text-[10px] text-[var(--brand-secondary)]">
                {activeOrg?.role === "OWNER"
                  ? "Владелец"
                  : activeOrg?.role === "ADMIN"
                    ? "Админ"
                    : "Участник"}
              </p>
            </div>
          </div>

          <ChevronDown
            size={16}
            className={`text-[var(--text-secondary)] transition-transform duration-200 ${
              orgsDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {orgsDropdownOpen && (
          <div className="mt-3 pt-3 border-t border-[var(--border-light)] space-y-2">
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setActiveOrgById(org.id);
                    setOrgsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    org.id === activeOrg?.id
                      ? "bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] font-bold"
                      : "text-[var(--text-primary)]/80 hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span className="truncate">{org.name}</span>
                  {org.id === activeOrg?.id && <Check size={12} />}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-1 border-t border-[var(--border-light)]">
              <Button
                variant="dark"
                size="sm"
                onClick={onOpenMembers}
                className="flex-1 text-[var(--brand-secondary)] text-[11px] font-semibold py-1.5 px-2 flex items-center justify-center gap-1"
              >
                <Users size={12} />
                <span>Команда</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenCreateOrg}
                className="flex-1 text-[11px] font-bold py-1.5 px-2 flex items-center justify-center gap-1"
              >
                <Plus size={12} />
                <span>Создать</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
