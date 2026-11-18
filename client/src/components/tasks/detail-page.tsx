import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { ITaskResponce } from "../../types";
import {
  ArrowLeft,
  Building2,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Edit2,
  Flag,
  MessageSquare,
  Trash2,
  User,
  UserCog,
} from "lucide-react";
import { update, remove } from "../../service/task.service";
import { getTaskMessages, createTaskMessage, removeMessage } from "../../service/message.service";
import { useTask } from "../../store/task.store";
import { useAuth } from "../../store/auth.store";
import { useMessages } from "../../store/message.store";
import { MessageList } from "../helper/message-list";
import { MessageInput } from "../helper/message-input";
import { ConfirmModal } from "../helper/confirm-modal";
import { EditTaskModal } from "./functions/edit";
import { Button } from "../ui/button";

// How often to re-fetch comments while the page is open. Deliberately plain
// polling instead of a WebSocket — see AGENTS.md section 6 (resource budget).
const COMMENTS_POLL_MS = 5000;

interface TaskDetailProps {
  task: ITaskResponce;
  onBack: () => void;
}

function DetailField({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 bg-[#252525] border border-[#2C2C2C] rounded-xl p-3">
      <div className="w-7 h-7 rounded-lg bg-[#1E1E1E] text-[#BB86FC] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-[#9E9E9E] uppercase tracking-wider">
          {label}
        </p>
        <div className="text-xs font-bold text-[#E3E3E3] mt-0.5 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

export function TaskDetailComponent({ task, onBack }: TaskDetailProps) {
  const { updateTaskInStore, removeTaskFromStore } = useTask();
  const { user, organizations } = useAuth();
  const { messagesByTask, setTaskMessages, addTaskMessage, removeTaskMessage } = useMessages();
  const comments = messagesByTask[task.id] || [];
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await getTaskMessages(task.id);
      if (!cancelled) setTaskMessages(task.id, data);
    };

    load();
    const interval = setInterval(load, COMMENTS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [task.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [comments.length]);

  const handleSendComment = async (content: string) => {
    const created = await createTaskMessage(task.id, { content });
    if (created) addTaskMessage(task.id, created);
  };

  const handleDeleteComment = async (id: number) => {
    const ok = await removeMessage(id);
    if (ok) removeTaskMessage(task.id, id);
  };

  const isDone = String(task.order ?? task.status) === "2";

  const handleToggleStatus = async () => {
    const nextStatus = isDone ? "1" : "2";
    updateTaskInStore(task.id, { order: nextStatus, status: nextStatus });
    await update(task.id, { order: nextStatus, status: nextStatus });
  };

  const handleDelete = async () => {
    setDeleteConfirmOpen(false);
    removeTaskFromStore(task.id);
    await remove(task.id);
    onBack();
  };

  const priorityLabel =
    String(task.priority ?? task.preority) === "2"
      ? "🔴 Высокий"
      : String(task.priority ?? task.preority) === "1"
      ? "🟡 Средний"
      : "🟢 Низкий";

  const statusLabel =
    String(task.order ?? task.status) === "2"
      ? "Готово"
      : String(task.order ?? task.status) === "1"
      ? "В работе"
      : String(task.order ?? task.status) === "3"
      ? "Отклонено"
      : "Ожидает";

  const orgName = organizations.find((o) => o.id === task.organizationId)?.name || "—";

  const formatDateTime = (value?: string) =>
    value
      ? new Date(value).toLocaleString("ru-RU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="text-[#9E9E9E] hover:text-[#E3E3E3] p-0 h-auto gap-1.5"
      >
        <ArrowLeft size={15} />
        Назад к задачам
      </Button>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* LEFT: Settings / details */}
        <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-4xl p-6 md:p-8 space-y-5 text-[#E3E3E3]">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold text-[#E3E3E3] leading-tight">
              {task.title}
            </h1>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditOpen(true)}
                title="Редактировать"
                className="w-8 h-8 p-0 rounded-full text-[#9E9E9E] hover:text-[#BB86FC] hover:bg-[#252525]"
              >
                <Edit2 size={15} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                title="Удалить"
                className="w-8 h-8 p-0 rounded-full text-[#CF6679] hover:bg-[#CF6679]/10"
              >
                <Trash2 size={15} />
              </Button>
            </div>
          </div>

          <p className="text-xs text-[#9E9E9E] leading-relaxed bg-[#252525] border border-[#2C2C2C] rounded-xl p-3">
            {task.description || "Описание не указано"}
          </p>

          <div>
            <p className="text-[10px] font-black text-[#9E9E9E] uppercase tracking-wider mb-2">
              Настройки задачи
            </p>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <DetailField
                icon={<CheckCircle2 size={14} />}
                label="Статус"
                value={statusLabel}
              />
              <DetailField
                icon={<Flag size={14} />}
                label="Приоритет"
                value={priorityLabel}
              />
              <DetailField
                icon={<User size={14} />}
                label="Исполнитель"
                value={task.assignee ? task.assignee.name : "Не назначен"}
              />
              <DetailField
                icon={<UserCog size={14} />}
                label="Постановщик"
                value={task.creator ? task.creator.name : "—"}
              />
              <DetailField
                icon={<Building2 size={14} />}
                label="Организация"
                value={orgName}
              />
              <DetailField
                icon={<CalendarIcon size={14} />}
                label="Дедлайн"
                value={task.dueDate || task.date || "Не указан"}
              />
              <DetailField
                icon={<Clock size={14} />}
                label="Создана"
                value={formatDateTime(task.createdAt)}
              />
              <DetailField
                icon={<Clock size={14} />}
                label="Обновлена"
                value={formatDateTime(task.updatedAt)}
              />
            </div>
          </div>

          <Button
            variant={isDone ? "success" : "primary"}
            onClick={handleToggleStatus}
            className="w-full py-3 rounded-full font-black text-xs h-auto shadow-md"
          >
            <CheckCircle2 size={15} />
            <span>{isDone ? "Задача выполнена! Вернуть в работу" : "Отметить выполненной"}</span>
          </Button>
        </div>

        {/* RIGHT: Chat / comments */}
        <div className="bg-[#1E1E1E] border border-[#2C2C2C] rounded-4xl h-170 p-5 md:p-6 space-y-3 text-[#E3E3E3] flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#9E9E9E]">
            <MessageSquare size={12} />
            <span>Комментарии ({comments.length})</span>
          </div>

          <MessageList
            messages={comments}
            className="h-full"
            currentUserId={user?.id}
            emptyText="Пока нет комментариев"
            onDelete={handleDeleteComment}
          />
          <div ref={bottomRef} />

          <MessageInput onSend={handleSendComment} placeholder="Написать комментарий..." autoFocus />
        </div>
      </div>

      <EditTaskModal task={task} isOpen={editOpen} onClose={() => setEditOpen(false)} />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Удалить задачу?"
        message="Действие необратимо: задача и все комментарии к ней будут удалены."
        confirmLabel="Удалить"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
