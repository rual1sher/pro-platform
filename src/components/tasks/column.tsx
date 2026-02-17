import type { ITaskResponce } from "../../types/type";
import { TaskItem } from "./items";

export function TaskColumn({
  title,
  tasks,
  color,
}: {
  title: string;
  tasks: ITaskResponce[];
  color: string;
}) {
  return (
    <div className="flex-1 md:min-w-90 overflow-auto">
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
          <span className="bg-gray-700/50 text-gray-400 text-xs px-2 py-1 rounded-full ml-auto">
            {tasks.length}
          </span>
        </div>
        <div className="space-y-3 h-125 md:h-170 overflow-auto">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Нет задач
            </div>
          ) : (
            tasks.map((task) => <TaskItem key={task.id} task={task} />)
          )}
        </div>
      </div>
    </div>
  );
}
