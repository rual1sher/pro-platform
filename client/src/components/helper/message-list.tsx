import { useState } from "react";
import {
  Check,
  CheckCheck,
  Copy,
  MessageCircle,
  Reply,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { IMessage, IOrganizationMember } from "../../types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ConfirmModal } from "./confirm-modal";

interface MessageListProps {
  messages: IMessage[];
  currentUserId?: number;
  emptyText?: string;
  onDelete?: (id: number) => void;
  className?: string;
  onReply?: (message: IMessage) => void;
  members?: IOrganizationMember[];
  userRole?: string;
  onSelectStarter?: (text: string) => void;
  showStarters?: boolean;
}

interface ParsedMessage {
  quoteAuthor: string | null;
  quoteText: string | null;
  body: string;
}

function parseMessageContent(raw: string): ParsedMessage {
  if (raw.startsWith("> ")) {
    const newlineIndex = raw.indexOf("\n");
    if (newlineIndex !== -1) {
      const quoteHeader = raw.slice(2, newlineIndex).trim();
      const body = raw.slice(newlineIndex + 1).trim();
      const colonIndex = quoteHeader.indexOf(":");
      if (colonIndex > 0 && colonIndex < 40) {
        return {
          quoteAuthor: quoteHeader.slice(0, colonIndex).trim(),
          quoteText: quoteHeader.slice(colonIndex + 1).trim(),
          body,
        };
      }
      return {
        quoteAuthor: null,
        quoteText: quoteHeader,
        body,
      };
    }
  }
  return { quoteAuthor: null, quoteText: null, body: raw };
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function formatDateSeparator(iso: string): string {
  const date = new Date(iso);
  const now = new Date();

  if (isSameDay(date, now)) {
    return "Сегодня";
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return "Вчера";
  }

  const isCurrentYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    ...(isCurrentYear ? {} : { year: "numeric" }),
  });
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatFullDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMemberRoleBadge(role?: string) {
  switch (role) {
    case "OWNER":
      return { label: "Владелец", variant: "default" as const };
    case "ADMIN":
      return { label: "Админ", variant: "accent" as const };
    case "MEMBER":
      return { label: "Участник", variant: "secondary" as const };
    default:
      return null;
  }
}

const DEFAULT_STARTERS = [
  "👋 Всем привет! Подключаюсь к работе.",
  "🚀 Обсудим текущий спринт и задачи?",
  "📌 Напоминание: дейли синхронизация сегодня.",
  "💡 Есть предложение по оптимизации процессов.",
];

export function MessageList({
  messages,
  currentUserId,
  emptyText = "Пока нет сообщений",
  onDelete,
  className = "",
  onReply,
  members = [],
  userRole,
  onSelectStarter,
  showStarters = true,
}: MessageListProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IMessage | null>(null);

  const handleCopy = (m: IMessage, cleanText: string) => {
    navigator.clipboard.writeText(cleanText);
    setCopiedId(m.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === m.id ? null : prev));
    }, 2000);
  };

  if (messages.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
      >
        <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center mb-3">
          <MessageCircle size={24} strokeWidth={1.75} />
        </div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
          {emptyText}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-6 leading-relaxed">
          Начните диалог, делитесь новостями или координируйте задачи вместе с командой.
        </p>

        {showStarters && onSelectStarter && (
          <div className="w-full max-w-md space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[var(--text-disabled)] mb-2">
              <Sparkles size={12} className="text-[var(--brand-primary)]" />
              <span>Быстрый старт диалога:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEFAULT_STARTERS.map((text, idx) => (
                <Button
                  key={idx}
                  type="button"
                  variant="dark"
                  size="sm"
                  onClick={() => onSelectStarter(text)}
                  className="text-left text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] justify-start h-auto py-2 px-3 rounded-lg border border-[var(--border-light)] hover:border-[var(--brand-primary)]/40 transition-all leading-snug"
                >
                  <span className="truncate">{text}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Group messages by date
  const groups: { dateLabel: string; items: IMessage[] }[] = [];
  messages.forEach((m) => {
    const label = formatDateSeparator(m.createdAt);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.dateLabel === label) {
      lastGroup.items.push(m);
    } else {
      groups.push({ dateLabel: label, items: [m] });
    }
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {groups.map((group, groupIdx) => (
        <div key={groupIdx} className="space-y-3">
          {/* Date separator badge */}
          <div className="flex items-center justify-center my-3 select-none">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-overlay)] text-[var(--text-secondary)] border border-[var(--border-light)] shadow-xs">
              {group.dateLabel}
            </span>
          </div>

          {/* Messages in this date bucket */}
          <div className="space-y-2.5">
            {group.items.map((m) => {
              const isOwn = m.authorId === currentUserId;
              const parsed = parseMessageContent(m.content);
              const authorMember = members.find((mem) => mem.userId === m.authorId);
              const roleInfo = getMemberRoleBadge(authorMember?.role);

              const canDelete = isOwn || userRole === "OWNER" || userRole === "ADMIN";

              return (
                <div
                  key={m.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} group/msg relative`}
                >
                  <div
                    className={`flex items-start gap-2.5 max-w-[88%] sm:max-w-[78%] md:max-w-[70%] ${
                      isOwn ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Teammate avatar (shown on the left) */}
                    {!isOwn && (
                      <Avatar className="w-8 h-8 shrink-0 ring-1 ring-[var(--border-light)] mt-0.5">
                        {m.author.avatar ? (
                          <AvatarImage src={m.author.avatar} alt={m.author.name} />
                        ) : null}
                        <AvatarFallback className="text-[11px] font-semibold">
                          {m.author.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`space-y-1 min-w-0 ${isOwn ? "items-end" : "items-start"}`}
                    >
                      {/* Teammate sender header */}
                      {!isOwn && (
                        <div className="flex items-center gap-1.5 px-0.5 select-none">
                          <span className="text-[11px] font-semibold text-[var(--text-primary)] truncate max-w-[160px]">
                            {m.author.name}
                          </span>
                          {roleInfo && (
                            <Badge
                              variant={roleInfo.variant}
                              className="text-[9px] py-0 px-1.5 h-3.5"
                            >
                              {roleInfo.label}
                            </Badge>
                          )}
                          <span
                            className="text-[10px] text-[var(--text-disabled)] ml-0.5"
                            title={formatFullDateTime(m.createdAt)}
                          >
                            {formatTime(m.createdAt)}
                          </span>
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className={`relative px-3.5 py-2.5 rounded-xl transition-all ${
                          isOwn
                            ? "bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 rounded-tr-xs"
                            : "bg-[var(--bg-overlay)] border border-[var(--border-light)] rounded-tl-xs"
                        }`}
                      >
                        {/* Quoted block if message was a reply */}
                        {parsed.quoteText && (
                          <div className="mb-2 pl-2.5 py-1 border-l-2 border-[var(--brand-primary)] bg-[var(--bg-main)]/50 rounded-r-md text-[11px]">
                            {parsed.quoteAuthor && (
                              <div className="font-semibold text-[var(--brand-primary)] text-[10px]">
                                {parsed.quoteAuthor}
                              </div>
                            )}
                            <div className="text-[var(--text-secondary)] line-clamp-2 italic">
                              {parsed.quoteText}
                            </div>
                          </div>
                        )}

                        {/* Message body */}
                        <p className="text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap break-words">
                          {parsed.body}
                        </p>

                        {/* Bottom timestamp and status for own messages */}
                        {isOwn && (
                          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[var(--text-secondary)] select-none">
                            <span title={formatFullDateTime(m.createdAt)}>
                              {formatTime(m.createdAt)}
                            </span>
                            <span title="Отправлено">
                              <CheckCheck
                                size={12}
                                className="text-[var(--brand-primary)] shrink-0"
                              />
                            </span>
                          </div>
                        )}

                        {/* Floating actions menu on hover */}
                        <div
                          className={`absolute -top-3.5 ${
                            isOwn ? "left-2" : "right-2"
                          } hidden group-hover/msg:flex items-center gap-0.5 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-lg p-0.5 shadow-md z-10 transition-opacity`}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(m, parsed.body)}
                            className="h-6 w-6 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md"
                            title="Скопировать текст"
                          >
                            {copiedId === m.id ? (
                              <Check size={12} className="text-[var(--status-success)]" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </Button>

                          {onReply && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onReply(m)}
                              className="h-6 w-6 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md"
                              title="Ответить на сообщение"
                            >
                              <Reply size={12} />
                            </Button>
                          )}

                          {canDelete && onDelete && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(m)}
                              className="h-6 w-6 p-0 text-[var(--status-error)] hover:bg-[var(--status-error)]/10 rounded-md"
                              title="Удалить сообщение"
                            >
                              <Trash2 size={12} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Confirmation modal for message deletion */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Удалить сообщение?"
        message="Сообщение будет безвозвратно удалено для всех участников команды."
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget && onDelete) {
            onDelete(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
