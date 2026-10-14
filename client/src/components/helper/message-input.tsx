import { useState } from "react";

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
    <form onSubmit={handleSubmit} className={`flex gap-1.5 ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={sending}
        autoFocus={autoFocus}
        className="flex-1 px-3 py-2 bg-[#252525] border border-[#2C2C2C] rounded-full text-xs text-[#E3E3E3] placeholder-[#616161] focus:outline-none focus:border-[#BB86FC] disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={!value.trim() || sending}
        className="px-4 py-2 bg-[#BB86FC] hover:bg-[#a871ea] disabled:opacity-30 text-[#121212] font-black text-xs rounded-full transition-colors"
      >
        +
      </button>
    </form>
  );
}
