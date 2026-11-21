import { DragDropProvider } from "@dnd-kit/react";
import { Building2, Filter, Search, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getOrganizationMembers } from "../../service/organization.service";
import { findAll, updateStatus, bulkReorder } from "../../service/task.service";
import type { ITaskResponce } from "../../types";
import { useAuth } from "../../store/auth.store";
import { useTask } from "../../store/task.store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Column } from "./column";
import { CreateTask } from "./functions/create";
import { TaskItem } from "./items";

export function TasksComponent() {
  const [loading, setLoading] = useState(true);
  const [activeViewTab, setActiveViewTab] = useState<"board" | "list">("board");

  const { user, activeOrg } = useAuth();
  const {
    tasks,
    setTasks,
    updateTaskInStore,
    members,
    setMembers,
    selectedWorkerFilter,
    setSelectedWorkerFilter,
    selectedPriorityFilter,
    setSelectedPriorityFilter,
    searchQuery,
    setSearchQuery,
  } = useTask();

  // Load tasks and organization members whenever activeOrg changes
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!activeOrg) return;
      setLoading(true);

      try {
        const [fetchedTasks, fetchedMembers] = await Promise.all([
          findAll({ organizationId: activeOrg.id }),
          getOrganizationMembers(activeOrg.id),
        ]);

        if (isMounted) {
          setTasks(fetchedTasks || []);
          setMembers(fetchedMembers || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeOrg?.id]);

  // Ролевой дефолт: Owner/Admin видят все таски организации, обычный воркер — только свои.
  // Срабатывает только при смене организации, поэтому не перетирает ручной выбор в дропдауне.
  useEffect(() => {
    if (activeOrg && user && activeOrg.role === "MEMBER") {
      setSelectedWorkerFilter(user.id);
    } else {
      setSelectedWorkerFilter(null);
    }
  }, [activeOrg?.id]);

  // Columns definition (matching the day strip in the mockup)
  const columns = [
    { id: "0", title: "Ожидает", color: "bg-[var(--text-disabled)]" },
    { id: "1", title: "В работе", color: "bg-[var(--status-info)]" },
    { id: "2", title: "Готово", color: "bg-[var(--status-success)]" },
    { id: "3", title: "Отклонено", color: "bg-[var(--status-error)]" },
  ];

  // Drag and Drop reordering and status update
  const handleDragEnd = async (e: any) => {
    if (e.canceled) return;
    const sourceId = Number(e.operation.source?.id) as number | undefined;
    const targetId = String(e.operation.target?.id || "");

    if (!sourceId || !targetId) return;

    const draggedTask = tasks.find((t) => t.id === sourceId);
    if (!draggedTask) return;

    // RBAC: Только владелец организации или сам исполнитель может менять статус / позицию
    const isOwner =
      activeOrg?.role === "OWNER" ||
      activeOrg?.role === "ADMIN" ||
      draggedTask.creatorId === user?.id;
    const isAssignee = (draggedTask.assigneeId ?? draggedTask.user_id) === user?.id;

    if (!isOwner && !isAssignee) {
      toast.warning(
        "Вы можете перемещать только свои задачи. Чужие задачи может перемещать только владелец.",
      );
      return;
    }

    const currentStatus = String(draggedTask.order ?? draggedTask.status ?? "0");

    // Case 1: Бросили на другую задачу (занимают места друг друга)
    if (targetId.startsWith("task-")) {
      const targetTaskId = Number(targetId.replace("task-", ""));
      if (targetTaskId === sourceId) return;

      const targetTask = tasks.find((t) => t.id === targetTaskId);
      if (!targetTask) return;

      const targetStatus = String(targetTask.order ?? targetTask.status ?? "0");

      if (currentStatus === targetStatus) {
        // --- ДВИЖЕНИЕ ВНУТРИ ТОЙ ЖЕ СЕКЦИИ (SWAP / REORDER) ---
        const columnTasks = getTasksByOrder(currentStatus);
        const sourceIndex = columnTasks.findIndex((t) => t.id === sourceId);
        const targetIndex = columnTasks.findIndex((t) => t.id === targetTaskId);

        if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex)
          return;

        const reordered = [...columnTasks];
        const [movedItem] = reordered.splice(sourceIndex, 1);
        reordered.splice(targetIndex, 0, movedItem);

        // Каждая задача занимает строго своё место: 1, 2, 3...
        const updates = reordered.map((item, idx) => ({
          id: item.id,
          position: idx + 1,
        }));

        updates.forEach((u) => {
          updateTaskInStore(u.id, { position: u.position });
        });

        try {
          await bulkReorder(updates);
        } catch (error) {
          console.error("Ошибка сохранения позиций задач:", error);
        }
      } else {
        // --- ПЕРЕМЕЩЕНИЕ В ДРУГУЮ СЕКЦИЮ НА МЕСТО ЗАДАЧИ ---
        const targetColumnTasks = getTasksByOrder(targetStatus);
        const targetIndex = targetColumnTasks.findIndex((t) => t.id === targetTaskId);
        const insertIndex = targetIndex === -1 ? targetColumnTasks.length : targetIndex;

        const updatedTargetList = [...targetColumnTasks];
        updatedTargetList.splice(insertIndex, 0, {
          ...draggedTask,
          order: targetStatus,
          status: targetStatus,
        });

        const targetUpdates = updatedTargetList.map((item, idx) => ({
          id: item.id,
          position: idx + 1,
          ...(item.id === sourceId ? { status: targetStatus } : {}),
        }));

        updateTaskInStore(sourceId, {
          order: targetStatus,
          status: targetStatus,
          position: insertIndex + 1,
        });
        targetUpdates.forEach((u) => {
          updateTaskInStore(u.id, { position: u.position });
        });

        try {
          await bulkReorder(targetUpdates);
        } catch (error) {
          console.error("Ошибка перемещения задачи в другую колонку:", error);
        }
      }
      return;
    }

    // Case 2: Бросили на контейнер колонки
    const newStatus = targetId.startsWith("column-")
      ? targetId.replace("column-", "")
      : targetId;

    if (["0", "1", "2", "3"].includes(newStatus)) {
      if (newStatus === currentStatus) {
        // Бросили в ту же колонку в свободную область -> в конец
        const columnTasks = getTasksByOrder(currentStatus);
        const sourceIndex = columnTasks.findIndex((t) => t.id === sourceId);
        if (sourceIndex === -1 || sourceIndex === columnTasks.length - 1) return;

        const reordered = [...columnTasks];
        const [movedItem] = reordered.splice(sourceIndex, 1);
        reordered.push(movedItem);

        const updates = reordered.map((item, idx) => ({
          id: item.id,
          position: idx + 1,
        }));

        updates.forEach((u) => updateTaskInStore(u.id, { position: u.position }));

        try {
          await bulkReorder(updates);
        } catch (error) {
          console.error("Ошибка сохранения позиций задач:", error);
        }
      } else {
        // Перемещение в другую колонку
        const targetColumnTasks = getTasksByOrder(newStatus);
        const nextPosition = targetColumnTasks.length + 1;

        updateTaskInStore(sourceId, {
          order: newStatus,
          status: newStatus,
          position: nextPosition,
        });

        try {
          const updated = await updateStatus(sourceId, newStatus, nextPosition);
          if (updated) {
            updateTaskInStore(sourceId, updated);
          }
        } catch (error) {
          console.error("Ошибка сохранения статуса задачи:", error);
        }
      }
    }
  };

  // Reorder task within section (1, 2, 3...)
  const handleMoveTask = async (
    task: ITaskResponce,
    direction: "up" | "down",
    columnTasks: ITaskResponce[],
  ) => {
    const currentIndex = columnTasks.findIndex((t) => t.id === task.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= columnTasks.length) return;

    const reordered = [...columnTasks];
    const [movedItem] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    const updates = reordered.map((item, idx) => ({
      id: item.id,
      position: idx + 1,
    }));

    updates.forEach((u) => {
      updateTaskInStore(u.id, { position: u.position });
    });

    try {
      await bulkReorder(updates);
    } catch (error) {
      console.error("Ошибка смены позиции задачи:", error);
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Worker filter
      if (selectedWorkerFilter !== null) {
        if (selectedWorkerFilter === -1) {
          if (task.assigneeId || task.user_id) return false;
        } else {
          const workerId = task.assigneeId || task.user_id;
          if (workerId !== selectedWorkerFilter) return false;
        }
      }

      // Priority filter
      if (selectedPriorityFilter !== null) {
        const p = String(task.priority ?? task.preority ?? "1");
        if (p !== selectedPriorityFilter) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchDesc = (task.description || "").toLowerCase().includes(query);
        const matchWorker = (task.assignee?.name || "").toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchWorker) return false;
      }

      return true;
    });
  }, [tasks, selectedWorkerFilter, selectedPriorityFilter, searchQuery]);

  // Tasks sorted by explicit position inside the section (1, 2, 3...)
  const getTasksByOrder = (statusVal: string) => {
    return filteredTasks
      .filter((task) => String(task.order ?? task.status ?? "0") === statusVal)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  };

  const currentPeriod = useMemo(() => {
    const now = new Date();
    const month = now.toLocaleString("ru-RU", { month: "long" });
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${now.getFullYear()}`;
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)]">
        <div className="w-8 h-8 border-3 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[var(--text-primary)] text-xs font-bold">Загрузка задач...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Header Bar: Dynamic Period / Board title + View tabs + Action button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-light)] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
              Доска задач
            </h2>
            {activeOrg && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] text-[11px] font-medium">
                <Building2 size={11} />
                {activeOrg.name}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {filteredTasks.length}{" "}
            {filteredTasks.length === 1
              ? "задача"
              : filteredTasks.length < 5
                ? "задачи"
                : "задач"}{" "}
            • {currentPeriod}
          </p>
        </div>

        {/* Right side: View tabs & New Task button */}
        <div className="flex items-center gap-2.5">
          {/* View tabs pill */}
          <div className="flex items-center bg-[var(--bg-overlay)] p-0.5 rounded-lg border border-[var(--border-light)] shadow-xs">
            <button
              type="button"
              onClick={() => setActiveViewTab("board")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeViewTab === "board"
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Доска
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab("list")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeViewTab === "list"
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Список
            </button>
          </div>

          <CreateTask />
        </div>
      </div>

      {/* 2. Filters & Search Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-light)]">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          />
          <Input
            type="text"
            placeholder="Поиск задач или исполнителей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs py-1.5 rounded-lg font-normal"
          />
        </div>

        {/* Worker & Priority Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Worker Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-[var(--brand-secondary)]" />
            <select
              value={selectedWorkerFilter === null ? "" : selectedWorkerFilter}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedWorkerFilter(val === "" ? null : Number(val));
              }}
              className="px-2.5 py-1.5 bg-[var(--bg-overlay)] border border-[var(--border-light)] rounded-lg text-xs text-[var(--text-primary)] font-normal focus:outline-none focus:border-[var(--brand-primary)]"
            >
              <option value="">Все воркеры</option>
              {user && <option value={user.id}>Мои задачи ({user.name})</option>}
              <option disabled>──────────</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.name}
                </option>
              ))}
              <option value="-1">Без исполнителя</option>
            </select>
          </div>

          {/* Priority Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-[var(--brand-primary)]" />
            <select
              value={selectedPriorityFilter === null ? "" : selectedPriorityFilter}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedPriorityFilter(val === "" ? null : val);
              }}
              className="px-2.5 py-1.5 bg-[var(--bg-overlay)] border border-[var(--border-light)] rounded-lg text-xs text-[var(--text-primary)] font-normal focus:outline-none focus:border-[var(--brand-primary)]"
            >
              <option value="">Все приоритеты</option>
              <option value="2">🔴 Высокий (Важные)</option>
              <option value="1">🟡 Средний</option>
              <option value="0">🟢 Низкий</option>
            </select>
          </div>

          {/* Reset button */}
          {(selectedWorkerFilter !== null ||
            selectedPriorityFilter !== null ||
            searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedWorkerFilter(null);
                setSelectedPriorityFilter(null);
                setSearchQuery("");
              }}
              className="text-[11px] font-bold text-[var(--brand-secondary)] hover:bg-[var(--bg-overlay)] px-2 py-1 rounded-lg gap-1 h-auto"
            >
              <X size={12} />
              <span>Сброс</span>
            </Button>
          )}
        </div>
      </div>

      {/* 3. Board or List View */}
      {activeViewTab === "board" ? (
        <div className="overflow-x-auto pb-4">
          <DragDropProvider onDragEnd={handleDragEnd}>
            <div className="flex gap-3.5 min-w-[960px]">
              {columns.map((column) => {
                const columnTasks = getTasksByOrder(column.id);
                return (
                  <Column
                    key={column.id}
                    id={column.id}
                    count={columnTasks.length}
                    title={column.title}
                    color={column.color}
                  >
                    {columnTasks.map((t, idx) => (
                      <TaskItem
                        task={t}
                        key={t.id}
                        index={idx}
                        isFirst={idx === 0}
                        isLast={idx === columnTasks.length - 1}
                        onMoveUp={() => handleMoveTask(t, "up", columnTasks)}
                        onMoveDown={() => handleMoveTask(t, "down", columnTasks)}
                      />
                    ))}
                  </Column>
                );
              })}
            </div>
          </DragDropProvider>
        </div>
      ) : (
        /* List View alternative */
        <div className="space-y-2 bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-light)]">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-secondary)] text-xs font-bold">
              Нет задач для отображения
            </div>
          ) : (
            filteredTasks.map((t) => <TaskItem task={t} key={t.id} />)
          )}
        </div>
      )}
    </div>
  );
}
