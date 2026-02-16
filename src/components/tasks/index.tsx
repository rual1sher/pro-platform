import { useEffect, useState } from "react";
import { findAll } from "../../service/task.service";
import type { IUser } from "../../types/type";
import { TaskColumn } from "./column";
import { useAuth } from "../../store/auth.store";
import { useTask } from "../../store/task.store";

export function TasksComponent() {
  const [loading, setLoading] = useState(true);

  const { tasks, setTasks } = useTask();
  const { user } = useAuth();

  useEffect(() => {
    const loadTasks = async (user: IUser) => {
      const data = await findAll({ user_id: user.id });
      setTasks(data);

      setLoading(false);
    };

    user && loadTasks(user);
  }, [user]);

  const columns = [
    { id: "0", title: "Ожидает", color: "bg-gray-400" },
    { id: "1", title: "В работе", color: "bg-blue-500" },
    { id: "2", title: "Готово", color: "bg-green-500" },
    { id: "3", title: "Отклонено", color: "bg-red-500" },
  ];

  const getTasksByOrder = (order: string) => {
    return tasks.filter((task) => task.order === order);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <TaskColumn
          key={column.id}
          title={column.title}
          color={column.color}
          tasks={getTasksByOrder(column.id)}
        />
      ))}
    </div>
  );
}
