import { useState } from "react";
import { useNavigate } from "react-router";
import type { ITaskResponce } from "../../types";
import { EditTaskModal } from "./functions/edit";
import { useDraggable } from "@dnd-kit/react";
import { Clock, GripVertical, Edit2 } from "lucide-react";

interface TaskItemProps {
  task: ITaskResponce;
}

export function TaskItem({ task }: TaskItemProps) {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const { ref } = useDraggable({
    id: task.id,
  });

  const priority = String(task.priority ?? task.preority ?? "1");
  const isHighPriority = priority === "2";
  const isDone = String(task.order ?? task.status) === "2";

  return (
    <>
      <div ref={ref} className="not-first:pt-3">
        {/* Card using #252525 (surfaceOverlay) with #2C2C2C border */}
        <div
          onClick={() => navigate(`/tasks/${task.id}`)}
          className={`group rounded-2xl p-4 transition-all duration-200 cursor-pointer hover:shadow-lg active:scale-99 relative bg-[#252525] border ${
            isHighPriority
              ? "border-[#FF5252]/60 hover:border-[#FF5252]"
              : "border-[#2C2C2C] hover:border-[#BB86FC]/60"
          }`}
        >
          {/* Header Row: Priority tag & action buttons */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {isHighPriority ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF5252]/20 text-[#FF5252] border border-[#FF5252]/40 shadow-xs">
                  ★ Важная
                </span>
              ) : priority === "1" ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFB74D]/20 text-[#FFB74D] border border-[#FFB74D]/40">
                  Средний
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#81C784]/20 text-[#81C784] border border-[#81C784]/40">
                  Низкий
                </span>
              )}

              {isDone && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/40">
                  ✓ Выполнено
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditOpen(true);
                }}
                title="Редактировать задачу"
                className="p-1 text-[#9E9E9E] hover:text-[#E3E3E3] hover:bg-[#1E1E1E] rounded-lg transition-colors"
              >
                <Edit2 size={13} />
              </button>
              <div
                title="Перетащить карточку"
                className="cursor-grab active:cursor-grabbing p-1 text-[#616161] hover:text-[#E3E3E3] transition-colors"
              >
                <GripVertical size={14} />
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <h4
            className={`font-bold text-sm text-[#E3E3E3] leading-snug mb-1 ${
              isDone ? "line-through text-[#616161]" : ""
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-[#9E9E9E] line-clamp-2 mb-3 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Footer: Date & Assignee Avatar Stack */}
          <div className="flex items-center justify-between pt-2 border-t border-[#2C2C2C] mt-1">
            {/* Time / Due Date */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#03DAC6]">
              <Clock size={12} className="text-[#03DAC6]" />
              <span>{task.dueDate || task.date || "09:00 - 11:00"}</span>
            </div>

            {/* Overlapping Avatar stack */}
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {task.assignee?.avatar ? (
                <img
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  title={task.assignee.name}
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-[#252525]"
                />
              ) : (
                <div
                  title={task.assignee ? task.assignee.name : "Без исполнителя"}
                  className="w-6 h-6 rounded-full bg-[#BB86FC] text-[#121212] ring-2 ring-[#252525] flex items-center justify-center text-[10px] font-black"
                >
                  {task.assignee ? task.assignee.name.substring(0, 1) : "?"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <EditTaskModal
        task={task}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}
