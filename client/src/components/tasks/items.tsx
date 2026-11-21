import { useState } from "react";
import { useNavigate } from "react-router";
import type { ITaskResponce } from "../../types";
import { EditTaskModal } from "./functions/edit";
import { useDraggable, useDroppable } from "@dnd-kit/react";
import { Clock, GripVertical, Edit2, Lock, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../store/auth.store";

interface TaskItemProps {
  task: ITaskResponce;
  index?: number;
  isFirst?: boolean;
  isLast?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function TaskItem({
  task,
  index,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: TaskItemProps) {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const { user, activeOrg } = useAuth();

  // Role & Permissions check:
  // - Владелец/Админ организации или Создатель задачи может всё
  // - Исполнитель (получатель задачи) может менять статус, позицию и комментировать
  // - Другие сотрудники не могут изменять чужие задачи
  const isOwner =
    activeOrg?.role === "OWNER" ||
    activeOrg?.role === "ADMIN" ||
    task.creatorId === user?.id;

  const isAssignee = (task.assigneeId ?? task.user_id) === user?.id;
  const canEdit = isOwner;
  const canChangeStatus = isOwner || isAssignee;

  // Drop target (позволяет бросать другие задачи на эту задачу, чтобы они менялись местами)
  const { ref: droppableRef, isDropTarget } = useDroppable({
    id: `task-${task.id}`,
    collisionPriority: 3,
    data: {
      taskId: task.id,
      status: String(task.order ?? task.status ?? "0"),
    },
  });

  const { ref: draggableRef, isDragging } = useDraggable({
    id: task.id,
    disabled: !canChangeStatus,
  });

  const priority = String(task.priority ?? task.preority ?? "1");
  const isHighPriority = priority === "2";
  const isDone = String(task.order ?? task.status) === "2";

  // Display order / position rank (1, 2, 3...)
  const displayRank =
    index !== undefined
      ? index + 1
      : task.position && task.position > 0
        ? task.position
        : 1;

  return (
    <>
      <div ref={droppableRef} className="not-first:pt-3">
        <div
          ref={draggableRef}
          onClick={() => navigate(`/tasks/${task.id}`)}
          className={`group rounded-xl p-3.5 transition-all duration-150 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-[0.99] relative bg-[var(--bg-overlay)]/90 border ${
            isDropTarget
              ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/40 scale-[1.01]"
              : isHighPriority
                ? "border-[var(--priority-high)]/50 hover:border-[var(--priority-high)]"
                : "border-[var(--border-light)] hover:border-white/20"
          } ${isDragging ? "opacity-30 scale-95" : ""}`}
        >
          {/* Header Row: Position rank + Priority tag & action buttons */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Order / Position Badge (1, 2, 3...) */}
              <span
                title={`Позиция в секции: #${displayRank}`}
                className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--bg-surface)] text-[var(--text-disabled)] border border-[var(--border-light)]"
              >
                #{displayRank}
              </span>

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

            {/* Actions: Reorder up/down + Edit (Owner only) + Drag handle */}
            <div className="flex items-center gap-0.5">
              {/* If user is neither owner nor assignee, show lock badge */}
              {!canChangeStatus && (
                <div
                  title="Задача другого сотрудника (только просмотр)"
                  className="p-1 text-[var(--text-disabled)]"
                >
                  <Lock size={13} strokeWidth={1.5} />
                </div>
              )}

              {/* Reorder Up/Down buttons (available to Owner or Assignee) */}
              {canChangeStatus && (onMoveUp || onMoveDown) && (
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {onMoveUp && !isFirst && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp();
                      }}
                      title="Переместить выше (#1, #2...)"
                      className="p-0.5 w-6 h-6 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                    >
                      <ChevronUp size={14} />
                    </Button>
                  )}
                  {onMoveDown && !isLast && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown();
                      }}
                      title="Переместить ниже (#1, #2...)"
                      className="p-0.5 w-6 h-6 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                    >
                      <ChevronDown size={14} />
                    </Button>
                  )}
                </div>
              )}

              {/* Full Edit button (Только Владелец!) */}
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditOpen(true);
                  }}
                  title="Редактировать параметры задачи (Владелец)"
                  className="opacity-0 group-hover:opacity-100 p-1 w-6 h-6 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-md transition-opacity"
                >
                  <Edit2 size={12} strokeWidth={1.5} />
                </Button>
              )}

              {/* Drag Handle (Владелец или Исполнитель) */}
              {canChangeStatus && (
                <div
                  title="Перетащить карточку"
                  className="cursor-grab active:cursor-grabbing p-1 text-[var(--text-disabled)] hover:text-[var(--text-primary)] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <GripVertical size={14} strokeWidth={1.5} />
                </div>
              )}
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

            {/* Overlapping Avatar stack with worker name */}
            <div className="flex items-center gap-1.5">
              {task.assignee?.name && (
                <span className="text-[11px] text-[var(--text-secondary)] max-w-[100px] truncate hidden sm:inline">
                  {isAssignee ? "Вы" : task.assignee.name}
                </span>
              )}
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

      {/* Edit modal (Только для владельца) */}
      {canEdit && (
        <EditTaskModal task={task} isOpen={editOpen} onClose={() => setEditOpen(false)} />
      )}
    </>
  );
}
