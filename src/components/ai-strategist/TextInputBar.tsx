"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Send } from "lucide-react";

export function TextInputBar({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea up to ~5 lines
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handleSubmit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2 px-4 py-3 border-t border-white/[0.08] bg-white/[0.02] shrink-0">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        rows={1}
        placeholder="Type your message…"
        disabled={disabled}
        className={[
          "flex-1 resize-none overflow-hidden",
          "bg-white/[0.05] border border-white/[0.08] rounded-2xl",
          "px-4 py-2.5 text-sm text-white/90 placeholder:text-white/35",
          "focus:outline-none focus:border-white/20",
          "max-h-[120px] disabled:opacity-40",
        ].join(" ")}
        aria-label="Message Nova"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className={[
          "w-10 h-10 shrink-0 rounded-full bg-brand-red text-white",
          "flex items-center justify-center",
          "hover:bg-brand-red/90 transition-colors",
          "disabled:opacity-30 disabled:cursor-not-allowed",
        ].join(" ")}
        aria-label="Send"
      >
        <Send size={16} />
      </button>
    </div>
  );
}
