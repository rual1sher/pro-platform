import type { ITaskResponce } from "../../types/type";
import { RemoveTask } from "./functions/remove";
import { Update } from "./functions/update";

export function TaskItem({ task }: { task: ITaskResponce }) {
  const getPriorityColor = (priority: string) => {
    if (priority === "2") return "bg-red-500/20 text-red-400 border-red-500/30";
    if (priority === "1")
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-green-500/20 text-green-400 border-green-500/30";
  };

  const getPriorityText = (priority: string) => {
    if (priority === "2") return "Высокий";
    if (priority === "1") return "Средний";
    return "Низкий";
  };

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-all">
      <div className="flex items-center justify-between mb-2 gap-2">
        <h3 className="text-gray-100 font-medium">{task.title}</h3>
        <span className="flex items-center gap-1">
          <RemoveTask id={task.id} />
          <Update id={task.id} order={task.order} />
        </span>
      </div>
      {task.description && (
        <p className="text-sm text-gray-400 mb-3">{task.description}</p>
      )}
      <div className="flex items-center justify-between">
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.preority)}`}
        >
          {getPriorityText(task.preority)}
        </span>
        {task.date && (
          <span className="text-gray-400 text-sm">{task.date}</span>
        )}
      </div>
    </div>
  );
}
