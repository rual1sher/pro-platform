import { useEffect, useState } from "react";
import { findAll, update } from "../../service/task.service";
import type { ITaskResponce, IUser } from "../../types/type";
import { Column } from "./column";
import { useAuth } from "../../store/auth.store";
import { DragDropProvider } from "@dnd-kit/react";
import { TaskItem } from "./items";
import { useTask } from "../../store/task.store";

export function TasksComponent() {
  const [loading, setLoading] = useState(true);
  const [itemOrder, setItemOrder] = useState<ITaskResponce[]>([]);
  const { user } = useAuth();
  const { tasks } = useTask();

  const loadTasks = async (user: IUser) => {
    const tasks = await findAll({ user_id: user.id });
    setItemOrder(tasks);

    setLoading(false);
  };

  useEffect(() => {
    console.log("asd");

    user && loadTasks(user);
  }, [user, tasks]);

  const columns = [
    { id: "0", title: "Ожидает", color: "bg-gray-400" },
    { id: "1", title: "В работе", color: "bg-blue-500" },
    { id: "2", title: "Готово", color: "bg-green-500" },
    { id: "3", title: "Отклонено", color: "bg-red-500" },
  ];

  const getTasksByOrder = (order: string) => {
    return itemOrder.filter((task) => task.order === order);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Загрузка...</div>
      </div>
    );
  }

  const updateTasks = async (id: number, newOrder: string) => {
    setItemOrder((prev) =>
      prev.map((t) => (t.id === id ? { ...t, order: newOrder } : t)),
    );

    try {
      const updated = await update(id, { order: newOrder });
      setItemOrder((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (error) {
      console.error("Ошибка обновления задачи:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
      <DragDropProvider
        onDragEnd={(e) => {
          const id = Number(e.operation.source?.id) as number | undefined;
          const order = e.operation.target?.id as string | undefined;
          if (id && order) {
            updateTasks(id, order);
          }
        }}
      >
        {columns.map((column) => (
          <Column
            key={column.id}
            id={column.id}
            count={getTasksByOrder(column.id).length}
            title={column.title}
            color={column.color}
          >
            {getTasksByOrder(column.id).map((t) => (
              <TaskItem task={t} key={t.id} />
            ))}
          </Column>
        ))}
      </DragDropProvider>
    </div>
  );
}
