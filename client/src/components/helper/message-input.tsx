import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface MessageInputProps {
  onSend: (content: string) => Promise<unknown> | void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function MessageInput({
  onSend,
  placeholder = "Написать сообщение...",
  className = "",
  autoFocus = false,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = value.trim();
    if (!content || sending) return;

    setSending(true);
    setValue("");
    await onSend(content);
    setSending(false);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-1.5", className)}>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={sending}
        autoFocus={autoFocus}
        className="flex-1 rounded-full text-xs py-2 px-3"
      />
      <Button
        type="submit"
        variant="primary"
        size="sm"
        disabled={!value.trim() || sending}
        className="rounded-full font-black text-xs"
      >
        +
      </Button>
    </form>
  );
}
