import { useEffect, useRef } from "react";
import { MessageCircle, Building2 } from "lucide-react";
import { useAuth } from "../../../store/auth.store";
import { useChat } from "../../../store/chat.store";
import { getOrgChatMessages, sendOrgChatMessage, removeChatMessage } from "../../../service/chat.service";
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
      <div className="py-24 text-center text-xs font-bold text-[#9E9E9E] bg-[#1E1E1E] rounded-[28px] border border-[#2C2C2C]">
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
    <div className="flex flex-col bg-[#1E1E1E] border border-[#2C2C2C] rounded-[28px] shadow-sm h-[75vh]">
      <div className="flex items-center gap-2.5 p-4 border-b border-[#2C2C2C]">
        <div className="w-9 h-9 rounded-2xl bg-[#BB86FC] text-[#121212] flex items-center justify-center shrink-0">
          <MessageCircle size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-black text-[#E3E3E3] leading-tight">Общий чат команды</h2>
          <span className="inline-flex items-center gap-1 text-[11px] text-[#03DAC6] font-bold">
            <Building2 size={11} />
            {activeOrg.name}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} currentUserId={user?.id} emptyText="Пока нет сообщений — напишите первым" onDelete={handleDelete} />
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-[#2C2C2C]">
        <MessageInput onSend={handleSend} placeholder="Написать в чат команды..." autoFocus />
      </div>
    </div>
  );
}
