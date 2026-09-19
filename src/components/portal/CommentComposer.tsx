"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * The one place a comment gets written — a pin's first note, a reply, or a
 * general comment on a file. `onSubmit` returns an error string or null, so
 * the composer owns the pending state and the caller owns the request.
 *
 * ⌘/Ctrl+Enter sends; plain Enter adds a line. The opposite of `ChatThread`,
 * deliberately: a chat message is one line and a design note usually isn't.
 */
export function CommentComposer({
  placeholder,
  submitLabel,
  onSubmit,
  onCancel,
  autoFocus = false,
  disabled = false,
  className,
}: {
  placeholder: string;
  submitLabel: string;
  onSubmit: (body: string) => Promise<string | null>;
  onCancel?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const body = draft.trim();
    if (!body || sending || disabled) return;

    setError(null);
    setSending(true);
    const failure = await onSubmit(body);
    setSending(false);

    if (failure) {
      setError(failure);
      return;
    }
    setDraft("");
  }

  return (
    <form onSubmit={submit} className={cn("border-border bg-card rounded-xl border p-2", className)}>
      <Textarea
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            submit();
          }
          if (e.key === "Escape" && onCancel) onCancel();
        }}
        placeholder={placeholder}
        disabled={disabled || sending}
        rows={2}
        aria-label={submitLabel}
        className="min-h-14 resize-none border-none px-1.5 shadow-none focus-visible:ring-0"
      />
      <div className="mt-1.5 flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 rounded-lg px-2 py-1.5 text-sm transition-colors focus-visible:ring-3 focus-visible:outline-none"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={disabled || sending || !draft.trim()}
          aria-label={submitLabel}
          className={cn(
            "bg-primary text-primary-foreground grid size-9 shrink-0 place-items-center rounded-full",
            "transition-[transform,opacity] duration-150 active:scale-[0.94] disabled:opacity-40",
            "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
          )}
        >
          <ArrowUp size={17} aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p role="alert" className="text-destructive mt-1 px-1.5 pb-1 text-xs">
          {error}
        </p>
      )}
    </form>
  );
}
