import { Trash2 } from "lucide-react";
import type { IMessage } from "../../types";
import { Button } from "../ui/button";

interface MessageListProps {
  messages: IMessage[];
  currentUserId?: number;
  emptyText: string;
  onDelete?: (id: number) => void;
  className?: string;
}

function formatTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export function MessageList({
  messages,
  currentUserId,
  emptyText,
  onDelete,
  className = "",
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div
        className={`py-6 text-center text-xs text-[var(--text-secondary)] ${className}`}
      >
        {emptyText}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {messages.map((m) => {
        const isOwn = m.authorId === currentUserId;
        return (
          <div key={m.id} className="flex items-start gap-2 group">
            {m.author.avatar ? (
              <img
                src={m.author.avatar}
                alt={m.author.name}
                className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-[var(--border-light)]"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[var(--brand-primary)] text-[var(--bg-main)] font-black text-[11px] flex items-center justify-center shrink-0">
                {m.author.name.substring(0, 1).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0 bg-[var(--bg-overlay)] border border-[var(--border-light)] rounded-2xl px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[var(--text-primary)] truncate">
                  {isOwn ? "Вы" : m.author.name}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-[var(--text-disabled)]">
                    {formatTime(m.createdAt)}
                  </span>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(m.id)}
                      title="Удалить сообщение"
                      className="opacity-0 group-hover:opacity-100 text-[var(--status-error)] hover:bg-[var(--status-error)]/10 rounded-full p-1 h-auto transition-opacity"
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed break-words">
                {m.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
