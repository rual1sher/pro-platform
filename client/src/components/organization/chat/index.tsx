import { useEffect, useRef } from "react";
import { MessageCircle, Building2 } from "lucide-react";
import { useAuth } from "../../../store/auth.store";
import { useChat } from "../../../store/chat.store";
import {
  getOrgChatMessages,
  sendOrgChatMessage,
  removeChatMessage,
} from "../../../service/chat.service";
import { MessageList } from "../../helper/message-list";
import { MessageInput } from "../../helper/message-input";

// Deliberate polling instead of WebSocket for v1 — see AGENTS.md section 6 (resource budget).
const CHAT_POLL_MS = 4000;

export function OrgChat() {
  const { user, activeOrg } = useAuth();
  const { messages, setChat, addMessage, removeMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeOrg) return;

    let cancelled = false;
    const load = async () => {
      const data = await getOrgChatMessages(activeOrg.id);
      if (!cancelled) setChat(activeOrg.id, data);
    };

    load();
    const interval = setInterval(load, CHAT_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeOrg?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  if (!activeOrg) {
    return (
      <div className="py-24 text-center text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)]">
        Выберите или создайте организацию, чтобы открыть общий чат команды
      </div>
    );
  }

  const handleSend = async (content: string) => {
    const created = await sendOrgChatMessage(activeOrg.id, { content });
    if (created) addMessage(created);
  };

  const handleDelete = async (id: number) => {
    const ok = await removeChatMessage(id);
    if (ok) removeMessage(id);
  };

  return (
    <div className="flex flex-col bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl shadow-xs h-[calc(100vh-100px)] min-h-[500px]">
      <div className="flex items-center gap-2.5 p-3.5 border-b border-[var(--border-light)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)] text-[var(--bg-main)] flex items-center justify-center shrink-0">
          <MessageCircle size={16} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
            Общий чат команды
          </h2>
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--brand-secondary)] font-medium">
            <Building2 size={11} strokeWidth={1.5} />
            {activeOrg.name}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <MessageList
          messages={messages}
          currentUserId={user?.id}
          emptyText="Пока нет сообщений — напишите первым"
          onDelete={handleDelete}
        />
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-[var(--border-light)]">
        <MessageInput
          onSend={handleSend}
          placeholder="Написать в чат команды..."
          autoFocus
        />
      </div>
    </div>
  );
}
