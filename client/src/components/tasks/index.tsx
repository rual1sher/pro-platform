import { useEffect, useState, useMemo } from "react";
import { findAll, update } from "../../service/task.service";
import { getOrganizationMembers } from "../../service/organization.service";
import { Column } from "./column";
import { useAuth } from "../../store/auth.store";
import { DragDropProvider } from "@dnd-kit/react";
import { TaskItem } from "./items";
import { useTask } from "../../store/task.store";
import { CreateTask } from "./functions/create";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search, Filter, Users, Building2, X } from "lucide-react";

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
    { id: "0", title: "Ожидает", color: "bg-[#757575]" },
    { id: "1", title: "В работе", color: "bg-[#2196F3]" },
    { id: "2", title: "Готово", color: "bg-[#4CAF50]" },
    { id: "3", title: "Отклонено", color: "bg-[#CF6679]" },
  ];

  // Drag and Drop status update
  const handleDragEnd = async (e: any) => {
    const id = Number(e.operation.source?.id) as number | undefined;
    const newOrder = e.operation.target?.id as string | undefined;

    if (id && newOrder && ["0", "1", "2", "3"].includes(newOrder)) {
      updateTaskInStore(id, { order: newOrder, status: newOrder });

      try {
        await update(id, { order: newOrder, status: newOrder });
      } catch (error) {
        console.error("Ошибка сохранения позиции:", error);
      }
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

  const getTasksByOrder = (order: string) => {
    return filteredTasks.filter(
      (task) => String(task.order ?? task.status ?? "0") === order,
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-[#1E1E1E] rounded-[28px] border border-[#2C2C2C]">
        <div className="w-8 h-8 border-3 border-[#BB86FC] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#E3E3E3] text-xs font-bold">Загрузка задач...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Header Bar: Month/Title + Month/Week/Day tabs + Action button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1E1E1E] p-4 rounded-[28px] border border-[#2C2C2C] shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-[#E3E3E3] tracking-tight">
              Сентябрь 2026
            </h2>
            {activeOrg && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#BB86FC]/15 border border-[#BB86FC]/30 text-[#BB86FC] text-[11px] font-extrabold">
                <Building2 size={12} />
                {activeOrg.name}
              </span>
            )}
          </div>
          <p className="text-xs text-[#9E9E9E] font-semibold mt-0.5">
            {filteredTasks.length} задач на доске команды
          </p>
        </div>

        {/* Right side: View tabs & New Task button */}
        <div className="flex items-center gap-2.5">
          {/* View tabs pill */}
          <div className="flex items-center bg-[#252525] p-1 rounded-full border border-[#2C2C2C] shadow-xs">
            <Button
              variant={activeViewTab === "board" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveViewTab("board")}
              className="px-3.5 py-1 text-xs font-bold rounded-full h-auto"
            >
              Доска
            </Button>
            <Button
              variant={activeViewTab === "list" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveViewTab("list")}
              className="px-3.5 py-1 text-xs font-bold rounded-full h-auto"
            >
              Список
            </Button>
          </div>

          <CreateTask />
        </div>
      </div>

      {/* 2. Filters & Search Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#1E1E1E] p-3 rounded-2xl border border-[#2C2C2C]">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E9E9E]"
          />
          <Input
            type="text"
            placeholder="Поиск задач или исполнителей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs py-1.5 rounded-xl font-medium"
          />
        </div>

        {/* Worker & Priority Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Worker Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-[#03DAC6]" />
            <select
              value={selectedWorkerFilter === null ? "" : selectedWorkerFilter}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedWorkerFilter(val === "" ? null : Number(val));
              }}
              className="px-2.5 py-1.5 bg-[#252525] border border-[#2C2C2C] rounded-xl text-xs text-[#E3E3E3] font-semibold focus:outline-none focus:border-[#BB86FC]"
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
            <Filter size={13} className="text-[#BB86FC]" />
            <select
              value={selectedPriorityFilter === null ? "" : selectedPriorityFilter}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedPriorityFilter(val === "" ? null : val);
              }}
              className="px-2.5 py-1.5 bg-[#252525] border border-[#2C2C2C] rounded-xl text-xs text-[#E3E3E3] font-semibold focus:outline-none focus:border-[#BB86FC]"
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
              className="text-[11px] font-bold text-[#03DAC6] hover:bg-[#252525] px-2 py-1 rounded-lg gap-1 h-auto"
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
                    {columnTasks.map((t) => (
                      <TaskItem task={t} key={t.id} />
                    ))}
                  </Column>
                );
              })}
            </div>
          </DragDropProvider>
        </div>
      ) : (
        /* List View alternative */
        <div className="space-y-2 bg-[#1E1E1E] p-4 rounded-[28px] border border-[#2C2C2C]">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-[#9E9E9E] text-xs font-bold">
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
