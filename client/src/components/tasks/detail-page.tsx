import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  CircleDot,
  Clock,
  Edit2,
  Flag,
  Link2,
  Lock,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  User,
  UserCog,
  UserMinus,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  createTaskMessage,
  getTaskMessages,
  removeMessage,
} from "../../service/message.service";
import { getOrganizationMembers } from "../../service/organization.service";
import { remove, update, updateStatus } from "../../service/task.service";
import { useAuth } from "../../store/auth.store";
import { useMessages } from "../../store/message.store";
import { useTask } from "../../store/task.store";
import type { ITaskResponce } from "../../types";
import { ConfirmModal } from "../helper/confirm-modal";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { EditTaskModal } from "./functions/edit";

// Polling interval for comments
const COMMENTS_POLL_MS = 5000;

interface TaskDetailProps {
  task: ITaskResponce;
  onBack: () => void;
}

function parseDueDate(str?: string): Date | null {
  if (!str) return null;
  const parts = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (parts) {
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10) - 1;
    const year = parseInt(parts[3], 10);
    return new Date(year, month, day);
  }
  const isoParts = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoParts) {
    const year = parseInt(isoParts[1], 10);
    const month = parseInt(isoParts[2], 10) - 1;
    const day = parseInt(isoParts[3], 10);
    return new Date(year, month, day);
  }
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value?: string): string {
  if (!value) return "Не указан";
  const d = parseDueDate(value);
  if (!d) return value;
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCommentTime(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const timeStr = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  if (isToday) {
    return `сегодня в ${timeStr}`;
  }
  return `${d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}, ${timeStr}`;
}

function getDueStatus(dueDateString?: string, isDone?: boolean) {
  if (!dueDateString || isDone) return null;
  const due = parseDueDate(dueDateString);
  if (!due) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Просрочено (${Math.abs(diffDays)} дн.)`,
      variant: "destructive" as const,
    };
  }
  if (diffDays === 0) {
    return {
      label: "Сегодня",
      variant: "warning" as const,
    };
  }
  if (diffDays === 1) {
    return {
      label: "Завтра",
      variant: "warning" as const,
    };
  }
  return {
    label: `Через ${diffDays} дн.`,
    variant: "secondary" as const,
  };
}

export function TaskDetailComponent({ task, onBack }: TaskDetailProps) {
  const { tasks, members, setMembers, updateTaskInStore, removeTaskFromStore } =
    useTask();
  const { user, organizations, activeOrg } = useAuth();
  const { messagesByTask, setTaskMessages, addTaskMessage, removeTaskMessage } =
    useMessages();

  // Fresh live task reference from store
  const liveTask = tasks.find((t) => t.id === task.id) || task;
  const comments = messagesByTask[liveTask.id] || [];

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Inline editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(liveTask.title || "");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(liveTask.description || "");
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [dueDateInput, setDueDateInput] = useState("");

  // Comment input state
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Focus comment textarea when submitting finishes
  useEffect(() => {
    if (!submittingComment) {
      commentInputRef.current?.focus();
    }
  }, [submittingComment]);

  // Sync inputs with live task changes
  useEffect(() => {
    setTitleValue(liveTask.title || "");
  }, [liveTask.title]);

  useEffect(() => {
    setDescValue(liveTask.description || "");
  }, [liveTask.description]);

  // Load team members if not yet present
  useEffect(() => {
    if (liveTask.organizationId && members.length === 0) {
      getOrganizationMembers(liveTask.organizationId).then((fetched) => {
        if (fetched) setMembers(fetched);
      });
    }
  }, [liveTask.organizationId, members.length, setMembers]);

  // Fetch comments and poll
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const data = await getTaskMessages(liveTask.id);
      if (!cancelled) setTaskMessages(liveTask.id, data);
    };

    load();
    const interval = setInterval(load, COMMENTS_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [liveTask.id, setTaskMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [comments.length]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Ссылка на задачу скопирована в буфер обмена");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Не удалось скопировать ссылку");
    }
  };

  const handleSaveTitle = async () => {
    const trimmed = titleValue.trim();
    if (!trimmed) return;
    const updated = await update(liveTask.id, { title: trimmed });
    if (updated) {
      updateTaskInStore(liveTask.id, updated);
    }
    setIsEditingTitle(false);
  };

  const handleSaveDesc = async () => {
    const updated = await update(liveTask.id, { description: descValue });
    if (updated) {
      updateTaskInStore(liveTask.id, updated);
    }
    setIsEditingDesc(false);
  };

  const handleSaveDueDate = async () => {
    const payload = {
      dueDate: dueDateInput,
      date: dueDateInput,
    };
    const updated = await update(liveTask.id, payload);
    if (updated) {
      updateTaskInStore(liveTask.id, updated);
    }
    setIsEditingDueDate(false);
  };

  const isDone = String(liveTask.order ?? liveTask.status) === "2";

  // RBAC checks
  const isOwner =
    activeOrg?.role === "OWNER" ||
    activeOrg?.role === "ADMIN" ||
    liveTask.creatorId === user?.id;
  const isAssignee = (liveTask.assigneeId ?? liveTask.user_id) === user?.id;
  const canChangeStatus = isOwner || isAssignee;
  const canFullEdit = isOwner;

  const handleToggleStatus = async () => {
    if (!canChangeStatus) {
      toast.warning("Вы не можете менять статус чужой задачи");
      return;
    }
    const nextStatus = isDone ? "1" : "2";
    updateTaskInStore(liveTask.id, { order: nextStatus, status: nextStatus });
    await updateStatus(liveTask.id, nextStatus);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!canChangeStatus) {
      toast.warning("Вы не можете менять статус чужой задачи");
      return;
    }
    updateTaskInStore(liveTask.id, { order: newStatus, status: newStatus });
    await updateStatus(liveTask.id, newStatus);
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!canFullEdit) {
      toast.warning("Только владелец может изменять приоритет задачи");
      return;
    }
    updateTaskInStore(liveTask.id, { priority: newPriority, preority: newPriority });
    await update(liveTask.id, { priority: newPriority, preority: newPriority });
  };

  const handleAssigneeChange = async (val: string) => {
    if (!canFullEdit) {
      toast.warning("Только владелец может назначать исполнителя");
      return;
    }
    const newAssigneeId = val === "none" ? null : Number(val);
    const payload = {
      assigneeId: newAssigneeId as any,
      user_id: newAssigneeId as any,
    };
    const updated = await update(liveTask.id, payload);
    if (updated) {
      updateTaskInStore(liveTask.id, updated);
    }
  };

  const handleDelete = async () => {
    setDeleteConfirmOpen(false);
    removeTaskFromStore(liveTask.id);
    await remove(liveTask.id);
    onBack();
  };

  const handleSendComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || submittingComment) return;
    setSubmittingComment(true);
    try {
      const created = await createTaskMessage(liveTask.id, { content: trimmed });
      if (created) {
        addTaskMessage(liveTask.id, created);
        setCommentText("");
      }
    } finally {
      setSubmittingComment(false);
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 0);
    }
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const handleDeleteComment = async (id: number) => {
    const ok = await removeMessage(id);
    if (ok) removeTaskMessage(liveTask.id, id);
  };

  // Status mapping
  const statusVal = String(liveTask.order ?? liveTask.status ?? "0");

  // Priority mapping
  const rawPriority = String(liveTask.priority ?? liveTask.preority ?? "1");
  const currentPriority =
    rawPriority === "2" || rawPriority === "3" ? "2" : rawPriority === "0" ? "0" : "1";

  // Assignee mapping
  const currentAssigneeVal =
    liveTask.assigneeId || liveTask.user_id
      ? String(liveTask.assigneeId || liveTask.user_id)
      : "none";

  const hasAssigneeInMembers = members.some(
    (m) => m.userId === (liveTask.assigneeId || liveTask.user_id),
  );

  const orgName =
    organizations.find((o) => o.id === liveTask.organizationId)?.name || "—";

  const dueStatus = getDueStatus(liveTask.dueDate || liveTask.date, isDone);

  // Status badge element
  const statusBadge = isDone ? (
    <Badge variant="success" className="gap-1 px-2 py-0.5 text-xs">
      <CheckCircle2 size={12} />
      <span>Готово</span>
    </Badge>
  ) : statusVal === "1" ? (
    <Badge
      variant="default"
      className="gap-1 px-2 py-0.5 text-xs bg-[var(--status-info)]/20 text-[var(--status-info)] border-[var(--status-info)]/40"
    >
      <Clock size={12} />
      <span>В работе</span>
    </Badge>
  ) : statusVal === "3" ? (
    <Badge variant="destructive" className="gap-1 px-2 py-0.5 text-xs">
      <XCircle size={12} />
      <span>Отклонено</span>
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-xs">
      <CircleDot size={12} />
      <span>Ожидает</span>
    </Badge>
  );

  // Priority badge element
  const priorityBadge =
    currentPriority === "2" ? (
      <Badge variant="destructive" className="gap-1 px-2 py-0.5 text-xs">
        <AlertCircle size={12} />
        <span>Высокий</span>
      </Badge>
    ) : currentPriority === "1" ? (
      <Badge variant="warning" className="gap-1 px-2 py-0.5 text-xs">
        <Flag size={12} />
        <span>Средний</span>
      </Badge>
    ) : (
      <Badge variant="success" className="gap-1 px-2 py-0.5 text-xs">
        <Flag size={12} />
        <span>Низкий</span>
      </Badge>
    );

  return (
    <div className="space-y-5 p-3 sm:p-4">
      {/* 1. Header Bar: Navigation, Badges, and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-light)]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-1 h-8 gap-1.5 text-xs rounded-lg"
          >
            <ArrowLeft size={14} />
            <span>Назад к задачам</span>
          </Button>

          <span className="text-[var(--border-light)] font-light">/</span>

          <span className="text-xs font-mono text-[var(--text-disabled)] font-medium">
            #{liveTask.id}
          </span>

          <div className="flex items-center gap-1.5 ml-1">
            {statusBadge}
            {priorityBadge}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="dark"
            size="sm"
            onClick={handleCopyLink}
            className="gap-1.5 text-xs h-8 px-2.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title="Скопировать ссылку на задачу"
          >
            {copied ? (
              <Check size={13} className="text-[var(--status-success)]" />
            ) : (
              <Link2 size={13} />
            )}
            <span>{copied ? "Скопировано!" : "Копировать ссылку"}</span>
          </Button>

          {canFullEdit && (
            <Button
              variant="dark"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="gap-1.5 text-xs h-8 px-2.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              title="Редактировать параметры задачи (Владелец)"
            >
              <Edit2 size={13} />
              <span>Редактировать</span>
            </Button>
          )}

          {canFullEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="gap-1.5 text-xs h-8 px-2.5 rounded-lg text-[var(--status-error)] hover:bg-[var(--status-error)]/10"
              title="Удалить задачу (Владелец)"
            >
              <Trash2 size={13} />
              <span>Удалить</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Split Layout: Main Left Column + Right Sticky Sidebar */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* LEFT COLUMN: Title, Description, Quick Status, Comments */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {/* Main Task Header Card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-5 md:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveTitle();
                        if (e.key === "Escape") setIsEditingTitle(false);
                      }}
                      className="text-lg md:text-xl font-bold py-1.5 px-3 rounded-lg"
                      autoFocus
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveTitle}
                      className="h-9 px-3 rounded-lg shrink-0"
                    >
                      <Check size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingTitle(false)}
                      className="h-9 px-3 rounded-lg shrink-0"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="group flex items-start gap-2.5">
                    <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-tight leading-snug break-words">
                      {liveTask.title}
                    </h1>
                    {canFullEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingTitle(true)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 h-auto rounded-md text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-opacity shrink-0 mt-0.5"
                        title="Переименовать задачу (Владелец)"
                      >
                        <Edit2 size={13} />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {canChangeStatus && (
                <div className="shrink-0">
                  {isDone ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleStatus}
                      className="gap-2 text-xs font-semibold rounded-lg text-[var(--status-success)] border-[var(--status-success)]/40 hover:bg-[var(--status-success)]/10"
                    >
                      <RotateCcw size={13} />
                      <span>Возобновить задачу</span>
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleToggleStatus}
                      className="gap-2 text-xs font-semibold rounded-lg"
                    >
                      <CheckCircle2 size={14} />
                      <span>Завершить задачу</span>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Description Block */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Описание
                </span>
                {!isEditingDesc && canFullEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingDesc(true)}
                    className="h-6 px-2 text-[11px] text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] gap-1"
                  >
                    <Edit2 size={11} />
                    <span>
                      {liveTask.description ? "Редактировать" : "Добавить описание"}
                    </span>
                  </Button>
                )}
              </div>

              {isEditingDesc ? (
                <div className="space-y-2">
                  <Textarea
                    value={descValue}
                    onChange={(e) => setDescValue(e.target.value)}
                    rows={5}
                    placeholder="Добавьте подробное описание задачи..."
                    className="text-sm rounded-lg"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDesc(false)}
                      className="text-xs"
                    >
                      Отмена
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveDesc}
                      className="text-xs"
                    >
                      Сохранить
                    </Button>
                  </div>
                </div>
              ) : liveTask.description ? (
                <div className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap rounded-lg p-3.5 bg-[var(--bg-overlay)] border border-[var(--border-light)] font-normal">
                  {liveTask.description}
                </div>
              ) : (
                <div
                  onClick={() => {
                    if (canFullEdit) setIsEditingDesc(true);
                  }}
                  className={`text-xs italic text-[var(--text-disabled)] rounded-lg p-4 bg-[var(--bg-overlay)]/40 border border-dashed border-[var(--border-light)] ${
                    canFullEdit
                      ? "cursor-pointer hover:border-[var(--brand-primary)]/40 hover:bg-[var(--bg-overlay)]"
                      : ""
                  } transition-colors`}
                >
                  {canFullEdit
                    ? "Описание не указано. Нажмите здесь, чтобы добавить подробности задачи..."
                    : "Описание не указано"}
                </div>
              )}
            </div>
          </div>

          {/* Activity & Comments Section */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-5 md:p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-[var(--brand-primary)]" />
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Обсуждение и комментарии
                </h2>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0.2">
                  {comments.length}
                </Badge>
              </div>
              <span className="text-[11px] text-[var(--text-disabled)]">
                Живое обновление каждые 5 сек
              </span>
            </div>

            {/* Stream: Creation event + comments container with stable fixed height */}
            <div className="h-[360px] overflow-y-auto overflow-x-hidden pr-2 space-y-3.5">
              {/* Creation event */}
              <div className="flex items-center gap-3 py-1.5 px-3 rounded-lg bg-[var(--bg-overlay)]/40 border border-[var(--border-light)]/60 text-xs text-[var(--text-secondary)]">
                <div className="w-5 h-5 rounded-full bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                  <Sparkles size={11} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {liveTask.creator ? liveTask.creator.name : "Пользователь"}
                  </span>
                  <span> создал(а) эту задачу • </span>
                  <span className="text-[var(--text-disabled)] font-mono">
                    #{liveTask.id}
                  </span>
                </div>
                <span className="text-[11px] text-[var(--text-disabled)] shrink-0">
                  {formatCommentTime(liveTask.createdAt)}
                </span>
              </div>

              {/* Comments list */}
              {comments.length === 0 ? (
                <div className="h-[280px] flex flex-col items-center justify-center text-center space-y-1.5 select-none">
                  <MessageSquare
                    size={28}
                    className="mx-auto text-[var(--text-disabled)] opacity-40"
                  />
                  <p className="text-xs font-medium text-[var(--text-secondary)]">
                    Пока нет комментариев
                  </p>
                  <p className="text-[11px] text-[var(--text-disabled)] max-w-xs">
                    Задайте вопрос команде или оставьте обновление по задаче
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {comments.map((m) => {
                    const isOwn = m.authorId === user?.id;
                    return (
                      <div key={m.id} className="flex items-start gap-3 group">
                        <Avatar className="w-7 h-7 shrink-0 ring-1 ring-[var(--border-light)] mt-0.5">
                          {m.author.avatar && (
                            <AvatarImage src={m.author.avatar} alt={m.author.name} />
                          )}
                          <AvatarFallback className="text-[10px] bg-[var(--brand-primary)] text-[var(--bg-main)]">
                            {m.author.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 bg-[var(--bg-overlay)] border border-[var(--border-light)] rounded-xl px-3.5 py-2.5">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                                {isOwn ? "Вы" : m.author.name}
                              </span>
                              <span className="text-[10px] text-[var(--text-disabled)]">
                                {formatCommentTime(m.createdAt)}
                              </span>
                            </div>

                            {isOwn && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(m.id)}
                                title="Удалить комментарий"
                                className="opacity-0 group-hover:opacity-100 text-[var(--status-error)] hover:bg-[var(--status-error)]/10 p-1 h-auto transition-opacity"
                              >
                                <Trash2 size={12} />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap break-words">
                            {m.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Comment input box */}
            <div className="pt-2 border-t border-[var(--border-light)]">
              <div className="bg-[var(--bg-overlay)] border border-[var(--border-light)] rounded-xl p-3 focus-within:border-[var(--brand-primary)]/80 focus-within:ring-1 focus-within:ring-[var(--brand-primary)]/30 transition-all">
                <Textarea
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleCommentKeyDown}
                  placeholder="Написать комментарий... (Enter для отправки, Shift+Enter для новой строки)"
                  rows={3}
                  disabled={submittingComment}
                  className="border-0 bg-transparent p-0 text-xs sm:text-sm placeholder-[var(--text-disabled)] focus:ring-0 shadow-none resize-none"
                />
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-[var(--border-light)]/40">
                  <span className="text-[11px] text-[var(--text-disabled)] hidden sm:inline">
                    <kbd className="px-1 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-light)] font-mono text-[10px]">
                      Enter
                    </kbd>{" "}
                    для отправки,{" "}
                    <kbd className="px-1 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-light)] font-mono text-[10px]">
                      Shift + Enter
                    </kbd>{" "}
                    для новой строки
                  </span>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!commentText.trim() || submittingComment}
                    onClick={handleSendComment}
                    className="gap-1.5 text-xs font-semibold rounded-lg ml-auto px-3.5 h-8"
                  >
                    <Send size={12} />
                    <span>{submittingComment ? "Отправка..." : "Отправить"}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Direct Interactive Selectors & Metadata */}
        <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-4 self-start space-y-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-light)]">
              <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Свойства задачи
              </h3>
              <span className="text-[10px] font-mono text-[var(--text-disabled)]">
                ID: {liveTask.id}
              </span>
            </div>

            {/* Permission banner */}
            {!isOwner && isAssignee && (
              <div className="p-2.5 rounded-lg bg-[var(--status-info)]/10 border border-[var(--status-info)]/20 text-xs text-[var(--status-info)] flex items-center gap-2">
                <CheckCircle2 size={13} className="shrink-0" />
                <span>
                  Вы исполнитель: можете менять статус и общаться в чате задачи.
                </span>
              </div>
            )}
            {!isOwner && !isAssignee && (
              <div className="p-2.5 rounded-lg bg-[var(--bg-overlay)] border border-[var(--border-light)] text-xs text-[var(--text-secondary)] flex items-center gap-2">
                <Lock size={13} className="text-[var(--text-disabled)] shrink-0" />
                <span>Задача другого сотрудника (только просмотр и чат).</span>
              </div>
            )}

            {/* Status selector */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
                <CheckCircle2 size={13} className="text-[var(--brand-primary)]" />
                <span>Статус</span>
              </div>
              <Select
                value={statusVal}
                onValueChange={handleStatusChange}
                disabled={!canChangeStatus}
              >
                <SelectTrigger
                  className={`h-9 py-1 px-2.5 text-xs rounded-lg bg-[var(--bg-overlay)] border-[var(--border-light)] ${canChangeStatus ? "hover:border-white/20" : "opacity-60 cursor-not-allowed"}`}
                >
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--text-secondary)] shrink-0" />
                      <span>Ожидает</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--status-info)] shrink-0" />
                      <span>В работе</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--status-success)] shrink-0" />
                      <span>Готово</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--status-error)] shrink-0" />
                      <span>Отклонено</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority selector */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
                <Flag size={13} className="text-[var(--brand-primary)]" />
                <span>Приоритет {!canFullEdit && "(только владелец)"}</span>
              </div>
              <Select
                value={currentPriority}
                onValueChange={handlePriorityChange}
                disabled={!canFullEdit}
              >
                <SelectTrigger
                  className={`h-9 py-1 px-2.5 text-xs rounded-lg bg-[var(--bg-overlay)] border-[var(--border-light)] ${canFullEdit ? "hover:border-white/20" : "opacity-60 cursor-not-allowed"}`}
                >
                  <SelectValue placeholder="Выберите приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--status-error)] shrink-0" />
                      <span>Высокий</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--status-warning)] shrink-0" />
                      <span>Средний</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--status-success)] shrink-0" />
                      <span>Низкий</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee selector */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
                <User size={13} className="text-[var(--brand-primary)]" />
                <span>Исполнитель {!canFullEdit && "(только владелец)"}</span>
              </div>
              <Select
                value={currentAssigneeVal}
                onValueChange={handleAssigneeChange}
                disabled={!canFullEdit}
              >
                <SelectTrigger
                  className={`h-9 py-1 px-2.5 text-xs rounded-lg bg-[var(--bg-overlay)] border-[var(--border-light)] ${canFullEdit ? "hover:border-white/20" : "opacity-60 cursor-not-allowed"}`}
                >
                  <SelectValue placeholder="Выберите исполнителя" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center gap-2 text-[var(--text-disabled)]">
                      <UserMinus size={13} />
                      <span>Не назначен</span>
                    </div>
                  </SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.userId} value={String(m.userId)}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-4 h-4 shrink-0">
                          {m.avatar && <AvatarImage src={m.avatar} alt={m.name} />}
                          <AvatarFallback className="text-[8px] bg-[var(--brand-primary)] text-[var(--bg-main)]">
                            {m.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{m.name}</span>
                        <span className="text-[10px] text-[var(--text-disabled)] ml-1">
                          ({m.role === "OWNER" ? "Владелец" : "Воркер"})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                  {!hasAssigneeInMembers && liveTask.assignee && (
                    <SelectItem value={String(liveTask.assignee.id)}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-4 h-4 shrink-0">
                          {liveTask.assignee.avatar && (
                            <AvatarImage
                              src={liveTask.assignee.avatar}
                              alt={liveTask.assignee.name}
                            />
                          )}
                          <AvatarFallback className="text-[8px] bg-[var(--brand-primary)] text-[var(--bg-main)]">
                            {liveTask.assignee.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{liveTask.assignee.name}</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Due date row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
                  <CalendarIcon size={13} className="text-[var(--brand-primary)]" />
                  <span>Дедлайн</span>
                </div>
                {!isEditingDueDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDueDateInput(liveTask.dueDate || liveTask.date || "");
                      setIsEditingDueDate(true);
                    }}
                    className="h-6 px-1.5 text-[11px] text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] gap-1"
                  >
                    <Edit2 size={11} />
                    <span>
                      {liveTask.dueDate || liveTask.date ? "Изменить" : "Указать"}
                    </span>
                  </Button>
                )}
              </div>

              {isEditingDueDate ? (
                <div className="flex items-center gap-1.5 pt-1">
                  <Input
                    type="text"
                    placeholder="ДД.ММ.ГГГГ"
                    value={dueDateInput}
                    onChange={(e) => setDueDateInput(e.target.value)}
                    className="h-8 py-1 px-2 text-xs rounded-lg flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveDueDate();
                      if (e.key === "Escape") setIsEditingDueDate(false);
                    }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveDueDate}
                    className="h-8 px-2 text-xs rounded-lg shrink-0"
                    title="Сохранить дату"
                  >
                    <Check size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingDueDate(false)}
                    className="h-8 px-2 text-xs rounded-lg shrink-0"
                    title="Отмена"
                  >
                    <X size={13} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-[var(--bg-overlay)] border border-[var(--border-light)] rounded-lg px-2.5 py-2">
                  <span className="text-xs font-medium text-[var(--text-primary)]">
                    {formatDate(liveTask.dueDate || liveTask.date)}
                  </span>
                  {dueStatus && (
                    <Badge
                      variant={dueStatus.variant}
                      className="text-[10px] px-1.5 py-0.5"
                    >
                      {dueStatus.label}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-[var(--border-light)] pt-3 space-y-3">
              {/* Organization */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <Building2 size={13} />
                  <span>Организация</span>
                </span>
                <span className="font-medium text-[var(--text-primary)] truncate max-w-[150px]">
                  {orgName}
                </span>
              </div>

              {/* Creator / Reporter */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <UserCog size={13} />
                  <span>Постановщик</span>
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Avatar className="w-4 h-4 shrink-0">
                    <AvatarFallback className="text-[8px] bg-[var(--brand-secondary)] text-[var(--bg-main)]">
                      {(liveTask.creator ? liveTask.creator.name : "—")
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-[var(--text-primary)] truncate max-w-[120px]">
                    {liveTask.creator ? liveTask.creator.name : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="border-t border-[var(--border-light)] pt-3 space-y-2 text-[11px] text-[var(--text-disabled)]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  <span>Создана:</span>
                </span>
                <span className="text-[var(--text-secondary)]">
                  {formatDateTime(liveTask.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  <span>Обновлена:</span>
                </span>
                <span className="text-[var(--text-secondary)]">
                  {formatDateTime(liveTask.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditTaskModal
        task={liveTask}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Удалить задачу?"
        message="Действие необратимо: задача и все комментарии к ней будут удалены навсегда."
        confirmLabel="Удалить"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
