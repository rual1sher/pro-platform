import React, { useEffect, useRef, useState } from "react";
import { CornerDownLeft, Reply, Send, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export interface IReplyPreview {
  id: number;
  authorName: string;
  content: string;
}

export interface MessageInputProps {
  onSend: (content: string) => Promise<unknown> | void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  replyTo?: IReplyPreview | null;
  onCancelReply?: () => void;
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  placeholder = "Написать сообщение...",
  className = "",
  autoFocus = false,
  replyTo = null,
  onCancelReply,
  value: propValue,
  onChange: propOnChange,
  disabled = false,
}: MessageInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isControlled = propValue !== undefined;
  const value = isControlled ? propValue : internalValue;

  const updateValue = (nextVal: string) => {
    if (!isControlled) {
      setInternalValue(nextVal);
    }
    propOnChange?.(nextVal);
  };

  // Auto-resize textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 120);
    el.style.height = `${Math.max(nextHeight, 38)}px`;
  }, [value]);

  // Focus textarea when replying
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = value.trim();
    if (!content || sending || disabled) return;

    // If replying, prepend quote block
    let finalPayload = content;
    if (replyTo) {
      const cleanQuotedText = replyTo.content.replace(/^> .*\n/, "").trim();
      const firstLineQuote = cleanQuotedText.split("\n")[0].slice(0, 120);
      finalPayload = `> ${replyTo.authorName}: ${firstLineQuote}\n${content}`;
    }

    setSending(true);
    updateValue("");
    if (onCancelReply) {
      onCancelReply();
    }

    try {
      await onSend(finalPayload);
    } finally {
      setSending(false);
      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    updateValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  };

  const hasText = value.trim().length > 0;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* Reply quote preview */}
      {replyTo && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-overlay)] border border-[var(--brand-primary)]/30 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Reply size={13} className="text-[var(--brand-primary)] shrink-0" />
            <span className="font-semibold text-[var(--brand-primary)] text-[11px] shrink-0">
              В ответ {replyTo.authorName}:
            </span>
            <span className="text-[var(--text-secondary)] text-[11px] truncate">
              {replyTo.content.replace(/^> .*\n/, "")}
            </span>
          </div>
          {onCancelReply && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancelReply}
              className="h-6 w-6 p-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md shrink-0"
              title="Отменить ответ"
            >
              <X size={12} />
            </Button>
          )}
        </div>
      )}

      {/* Main input box */}
      <div className="relative flex items-end gap-2 bg-[var(--bg-overlay)] border border-[var(--border-light)] focus-within:border-[var(--brand-primary)] focus-within:ring-1 focus-within:ring-[var(--brand-primary)]/40 rounded-xl p-1.5 transition-all">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => updateValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled || sending}
          rows={1}
          className="flex-1 bg-transparent border-none focus:ring-0 shadow-none px-2 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-disabled)] leading-relaxed resize-none min-h-[36px]"
        />

        <div className="flex items-center gap-1 shrink-0 pb-0.5 pr-0.5">
          {hasText && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              title="Очистить поле"
              className="h-7 w-7 p-0 text-[var(--text-disabled)] hover:text-[var(--text-secondary)] rounded-md"
            >
              <X size={13} />
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleSubmit()}
            disabled={!hasText || sending || disabled}
            className="h-7 px-2.5 rounded-lg text-xs font-semibold gap-1 shrink-0"
            title="Отправить (Enter)"
          >
            <Send size={12} strokeWidth={2.2} />
            <span className="hidden sm:inline">Отправить</span>
          </Button>
        </div>
      </div>

      {/* Hints and helper info */}
      <div className="flex items-center justify-between px-1 text-[10px] text-[var(--text-disabled)]">
        <span className="inline-flex items-center gap-1">
          <CornerDownLeft size={10} />
          <span>Enter — отправить, Shift+Enter — перенос строки</span>
        </span>
        {value.length > 0 && <span>{value.length} / 4000</span>}
      </div>
    </div>
  );
}
