import { Trash2 } from "lucide-react";
import type { IMessage } from "../../types";

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

export function MessageList({ messages, currentUserId, emptyText, onDelete, className = "" }: MessageListProps) {
  if (messages.length === 0) {
    return <div className={`py-6 text-center text-xs text-[#9E9E9E] ${className}`} >{emptyText}</div>;
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
                className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-[#2C2C2C]"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#BB86FC] text-[#121212] font-black text-[11px] flex items-center justify-center shrink-0">
                {m.author.name.substring(0, 1).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0 bg-[#252525] border border-[#2C2C2C] rounded-2xl px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#E3E3E3] truncate">
                  {isOwn ? "Вы" : m.author.name}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-[#616161]">{formatTime(m.createdAt)}</span>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(m.id)}
                      title="Удалить сообщение"
                      className="opacity-0 group-hover:opacity-100 text-[#CF6679] hover:bg-[#CF6679]/10 rounded-full p-0.5 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-[#E3E3E3] leading-relaxed break-words">{m.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
