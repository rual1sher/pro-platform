import { useState } from "react";
import { useNavigate } from "react-router";
import type { ITaskResponce } from "../../types";
import { EditTaskModal } from "./functions/edit";
import { useDraggable } from "@dnd-kit/react";
import { Clock, GripVertical, Edit2 } from "lucide-react";
import { Button } from "../ui/button";

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
        <div
          onClick={() => navigate(`/tasks/${task.id}`)}
          className={`group rounded-xl p-3.5 transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-[0.99] relative bg-[var(--bg-overlay)]/90 border ${
            isHighPriority
              ? "border-[var(--priority-high)]/50 hover:border-[var(--priority-high)]"
              : "border-[var(--border-light)] hover:border-white/20"
          }`}
        >
          {/* Header Row: Priority tag & action buttons */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {isHighPriority ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--priority-high)]/15 text-[var(--priority-high)] border border-[var(--priority-high)]/30">
                  ★ Важная
                </span>
              ) : priority === "1" ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--priority-medium)]/15 text-[var(--priority-medium)] border border-[var(--priority-medium)]/30">
                  Средний
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--priority-low)]/15 text-[var(--priority-low)] border border-[var(--priority-low)]/30">
                  Низкий
                </span>
              )}

              {isDone && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--status-success)]/15 text-[var(--status-success)] border border-[var(--status-success)]/30">
                  ✓ Выполнено
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditOpen(true);
                }}
                title="Редактировать задачу"
                className="p-1 h-auto text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-md transition-colors"
              >
                <Edit2 size={13} strokeWidth={1.5} />
              </Button>
              <div
                title="Перетащить карточку"
                className="cursor-grab active:cursor-grabbing p-1 text-[var(--text-disabled)] hover:text-[var(--text-primary)] transition-colors"
              >
                <GripVertical size={14} strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <h4
            className={`font-medium text-sm text-[var(--text-primary)] leading-snug tracking-tight mb-1 ${
              isDone ? "line-through text-[var(--text-disabled)]" : ""
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2.5 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Footer: Date & Assignee Avatar Stack */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-light)] mt-1">
            {/* Time / Due Date */}
            <div className="flex items-center gap-1 text-[11px] font-normal text-[var(--text-secondary)]">
              <Clock
                size={12}
                strokeWidth={1.5}
                className="text-[var(--text-secondary)]"
              />
              <span>{task.dueDate || task.date || "09:00 - 11:00"}</span>
            </div>

            {/* Overlapping Avatar stack */}
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {task.assignee?.avatar ? (
                <img
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  title={task.assignee.name}
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-[var(--bg-overlay)]"
                />
              ) : (
                <div
                  title={task.assignee ? task.assignee.name : "Без исполнителя"}
                  className="w-6 h-6 rounded-full bg-[var(--brand-primary)] text-[var(--bg-main)] ring-2 ring-[var(--bg-overlay)] flex items-center justify-center text-[10px] font-semibold"
                >
                  {task.assignee ? task.assignee.name.substring(0, 1) : "?"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <EditTaskModal task={task} isOpen={editOpen} onClose={() => setEditOpen(false)} />
    </>
  );
}
