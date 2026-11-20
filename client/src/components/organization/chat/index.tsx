import {
  ArrowDown,
  Building2,
  CheckCircle2,
  MessageCircle,
  Search,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getOrgChatMessages,
  removeChatMessage,
  sendOrgChatMessage,
} from "../../../service/chat.service";
import { getOrganizationMembers } from "../../../service/organization.service";
import { useAuth } from "../../../store/auth.store";
import { useChat } from "../../../store/chat.store";
import type { IOrganizationMember } from "../../../types";
import { MessageInput, type IReplyPreview } from "../../helper/message-input";
import { MessageList } from "../../helper/message-list";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

// Polling interval for org chat (resource budget v1)
const CHAT_POLL_MS = 4000;

function getMembersNoun(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return "участников";
  if (mod10 === 1) return "участник";
  if (mod10 >= 2 && mod10 <= 4) return "участника";
  return "участников";
}

function getRoleLabel(role?: string) {
  switch (role) {
    case "OWNER":
      return { label: "Владелец", variant: "default" as const };
    case "ADMIN":
      return { label: "Администратор", variant: "accent" as const };
    case "MEMBER":
      return { label: "Участник", variant: "secondary" as const };
    default:
      return { label: "Участник", variant: "secondary" as const };
  }
}

export function OrgChat() {
  const { user, activeOrg } = useAuth();
  const { messages, setChat, addMessage, removeMessage } = useChat();

  const [members, setMembers] = useState<IOrganizationMember[]>([]);
  const [membersOpen, setMembersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyTo, setReplyTo] = useState<IReplyPreview | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeOrgId = activeOrg?.id;

  // Load chat messages and poll
  useEffect(() => {
    if (!activeOrgId) return;

    let cancelled = false;
    const load = async () => {
      const data = await getOrgChatMessages(activeOrgId);
      if (!cancelled) setChat(activeOrgId, data);
    };

    load();
    const interval = setInterval(load, CHAT_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeOrgId, setChat]);

  // Load organization members
  useEffect(() => {
    if (!activeOrgId) return;
    let cancelled = false;
    getOrganizationMembers(activeOrgId).then((data) => {
      if (!cancelled) setMembers(data);
    });
    return () => {
      cancelled = true;
    };
  }, [activeOrgId]);

  // Handle auto-scroll to bottom on message updates
  useEffect(() => {
    if (!showScrollBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages.length, showScrollBottom]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(distanceFromBottom > 130);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setShowScrollBottom(false);
  };

  if (!activeOrg) {
    return (
      <div className="py-24 text-center text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] rounded-xl border border-[var(--border-light)]">
        Выберите или создайте организацию, чтобы открыть общий чат команды
      </div>
    );
  }

  const handleSend = async (content: string) => {
    const created = await sendOrgChatMessage(activeOrg.id, { content });
    if (created) {
      addMessage(created);
      setReplyTo(null);
      setTimeout(scrollToBottom, 50);
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await removeChatMessage(id);
    if (ok) removeMessage(id);
  };

  // Real-time filtering without manual useMemo (React compiler handles optimization)
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const displayedMessages = trimmedQuery
    ? messages.filter(
        (m) =>
          m.content.toLowerCase().includes(trimmedQuery) ||
          m.author.name.toLowerCase().includes(trimmedQuery),
      )
    : messages;

  const currentUserRole =
    members.find((m) => m.userId === user?.id)?.role || activeOrg.role;

  return (
    <div className="relative flex flex-col bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-xl shadow-xs h-[calc(100vh-100px)] min-h-[520px] overflow-hidden">
      {/* CHAT HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-b border-[var(--border-light)] bg-[var(--bg-surface)] shrink-0 z-10">
        {/* Left: icon, title, org name and count */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)] text-[var(--bg-main)] flex items-center justify-center shrink-0 shadow-xs">
            <MessageCircle size={16} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] leading-tight truncate">
                Чат команды
              </h2>
              <Badge
                variant="outline"
                className="text-[10px] py-0 px-1.5 text-[var(--text-secondary)] font-normal"
              >
                {members.length} {getMembersNoun(members.length)}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--brand-secondary)] font-medium truncate mt-0.5">
              <Building2 size={11} strokeWidth={1.5} className="shrink-0" />
              <span className="truncate">{activeOrg.name}</span>
            </div>
          </div>
        </div>

        {/* Right: Search input, message counter, members toggle */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Search bar inside chat */}
          <div className="relative w-40 sm:w-56">
            <Input
              type="text"
              placeholder="Поиск сообщений..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-7 pr-6 text-xs rounded-lg py-1 bg-[var(--bg-overlay)] border-[var(--border-light)]"
            />
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 text-[var(--text-disabled)] hover:text-[var(--text-secondary)] rounded-full"
                title="Очистить поиск"
              >
                <X size={11} />
              </Button>
            )}
          </div>

          {/* Messages count indicator */}
          <Badge
            variant="secondary"
            className="hidden sm:inline-flex text-[10px] px-2 py-1 font-mono tracking-tight"
            title="Всего сообщений в чате"
          >
            {searchQuery
              ? `${displayedMessages.length} из ${messages.length}`
              : `${messages.length} сообщ.`}
          </Badge>

          {/* Members toggle button */}
          <Button
            type="button"
            variant={membersOpen ? "primary" : "dark"}
            size="sm"
            onClick={() => setMembersOpen((prev) => !prev)}
            className="h-8 px-2.5 rounded-lg text-xs gap-1.5 shrink-0"
            title={membersOpen ? "Скрыть участников" : "Список участников"}
          >
            <Users size={13} />
            <span className="hidden sm:inline">Участники</span>
            <span className="text-[10px] px-1 py-0 rounded-sm font-semibold opacity-80">
              {members.length}
            </span>
          </Button>
        </div>
      </div>

      {/* CHAT BODY (Feed + Collapsible Members Drawer) */}
      <div className="relative flex-1 flex min-h-0 overflow-hidden">
        {/* Messages Feed Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {searchQuery && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-overlay)] border border-[var(--border-light)] rounded-lg text-xs text-[var(--text-secondary)]">
              <span>
                Результаты поиска по запросу «
                <span className="text-[var(--brand-primary)] font-medium">
                  {searchQuery}
                </span>
                »: {displayedMessages.length}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="h-5 px-1.5 text-[10px] text-[var(--text-disabled)] hover:text-[var(--text-primary)]"
              >
                Сбросить
              </Button>
            </div>
          )}

          <MessageList
            messages={displayedMessages}
            currentUserId={user?.id}
            emptyText={
              searchQuery
                ? `По запросу «${searchQuery}» ничего не найдено`
                : "В чате команды пока нет сообщений"
            }
            onDelete={handleDelete}
            onReply={(m) => {
              setReplyTo({
                id: m.id,
                authorName: m.author.name,
                content: m.content,
              });
            }}
            members={members}
            userRole={currentUserRole}
            onSelectStarter={(text) => setInputValue(text)}
            showStarters={!searchQuery}
          />
          <div ref={bottomRef} />
        </div>

        {/* Floating "Scroll to bottom" button */}
        {showScrollBottom && (
          <Button
            type="button"
            variant="dark"
            size="sm"
            onClick={scrollToBottom}
            className="absolute bottom-4 right-6 z-20 shadow-lg border border-[var(--brand-primary)]/40 bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] gap-1.5 text-xs py-1.5 px-3 rounded-full animate-bounce"
          >
            <ArrowDown size={13} className="text-[var(--brand-primary)]" />
            <span>К новым сообщениям</span>
          </Button>
        )}

        {/* COLLAPSIBLE MEMBERS SIDEBAR */}
        {membersOpen && (
          <div className="absolute inset-y-0 right-0 z-30 w-72 md:relative md:z-auto bg-[var(--bg-surface)] border-l border-[var(--border-light)] flex flex-col shadow-xl md:shadow-none animate-in slide-in-from-right duration-200">
            {/* Sidebar header */}
            <div className="flex items-center justify-between p-3.5 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-[var(--brand-primary)]" />
                <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                  Участники команды
                </h3>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                  {members.length}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMembersOpen(false)}
                className="h-6 w-6 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md"
                title="Закрыть панель"
              >
                <X size={13} />
              </Button>
            </div>

            {/* Members list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {members.map((m) => {
                const isCurrentUser = m.userId === user?.id;
                const roleBadge = getRoleLabel(m.role);

                return (
                  <div
                    key={m.id}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border transition-colors ${
                      isCurrentUser
                        ? "bg-[var(--brand-primary)]/5 border-[var(--brand-primary)]/30"
                        : "bg-[var(--bg-overlay)]/60 border-[var(--border-light)] hover:border-[var(--border-light)]/80"
                    }`}
                  >
                    {/* Avatar with online dot */}
                    <div className="relative shrink-0">
                      <Avatar className="w-8 h-8 ring-1 ring-[var(--border-light)]">
                        {m.avatar ? <AvatarImage src={m.avatar} alt={m.name} /> : null}
                        <AvatarFallback className="text-[11px] font-semibold">
                          {m.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Active / Online status dot */}
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--status-success)] ring-2 ring-[var(--bg-surface)]"
                        title="В сети"
                      />
                    </div>

                    {/* Member details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                          {m.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] text-[var(--brand-primary)] font-semibold shrink-0">
                            (Вы)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          variant={roleBadge.variant}
                          className="text-[9px] py-0 px-1.5 h-4 font-normal"
                        >
                          {roleBadge.label}
                        </Badge>
                        <span className="text-[10px] text-[var(--text-disabled)] truncate">
                          {m.email}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {members.length === 0 && (
                <div className="py-8 text-center text-xs text-[var(--text-disabled)]">
                  Участники пока не добавлены
                </div>
              )}
            </div>

            {/* Sidebar footer status */}
            <div className="p-3 border-t border-[var(--border-light)] bg-[var(--bg-overlay)]/30 text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
              <CheckCircle2 size={13} className="text-[var(--status-success)] shrink-0" />
              <span>Все участники имеют доступ к чату</span>
            </div>
          </div>
        )}
      </div>

      {/* CHAT INPUT AREA */}
      <div className="p-3 border-t border-[var(--border-light)] bg-[var(--bg-surface)] shrink-0 z-10">
        <MessageInput
          onSend={handleSend}
          placeholder="Написать в чат команды..."
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          value={inputValue}
          onChange={setInputValue}
          autoFocus
        />
      </div>
    </div>
  );
}
