"use client";

import { useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatTurn {
  role: "user" | "model";
  text: string;
}

/**
 * A read-only chat over one workspace's own data. Distinct from `ChatThread`
 * on purpose — this streams a single Gemini reply per turn rather than
 * polling a persisted thread, and has no media or delivery-status concerns.
 */
export function AssistantPanel({ workspaceSlug, demo = false }: { workspaceSlug: string; demo?: boolean }) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const message = draft.trim();
    if (!message || sending) return;

    if (demo) {
      setTurns((t) => [
        ...t,
        { role: "user", text: message },
        { role: "model", text: "The assistant is off in this preview — it needs a real workspace to read from." },
      ]);
      setDraft("");
      return;
    }

    setError(null);
    setSending(true);
    const history = turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] }));
    setTurns((t) => [...t, { role: "user", text: message }, { role: "model", text: "" }]);
    setDraft("");

    try {
      const res = await fetch(`/api/portal/${workspaceSlug}/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });

      if (!res.ok || !res.body) {
        const failure = await res.json().catch(() => ({}));
        throw new Error(failure.error ?? "The assistant couldn't respond.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";
        for (const chunk of chunks) {
          if (!chunk.startsWith("data: ")) continue;
          const event = JSON.parse(chunk.slice(6));
          if (event.type === "text") {
            setTurns((t) => {
              const next = [...t];
              next[next.length - 1] = { role: "model", text: next[next.length - 1].text + event.content };
              return next;
            });
            bottomRef.current?.scrollIntoView({ block: "end" });
          } else if (event.type === "error") {
            throw new Error(event.message);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The assistant couldn't respond.");
      setTurns((t) => t.slice(0, -1));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col">
      {turns.length === 0 ? (
        <p className="text-muted-foreground max-w-xl text-[15px] leading-relaxed">
          Ask about progress, recent files, or anything discussed in Messages. It only reads this
          workspace — it can't approve work, post content, or send messages for you.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {turns.map((t, i) => (
            <div key={i} className={cn("flex flex-col", t.role === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed sm:max-w-[70%]",
                  t.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                )}
              >
                <p className="whitespace-pre-wrap">{t.text || "…"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div ref={bottomRef} />

      <form
        onSubmit={send}
        className="border-border bg-card sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] mt-6 rounded-2xl border p-3 shadow-lg md:bottom-4"
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(e);
            }
          }}
          placeholder="Ask about this workspace…"
          disabled={sending}
          rows={2}
          className="resize-none border-none px-1 shadow-none focus-visible:ring-0"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs">Reads this workspace only — nothing it says is published anywhere.</p>
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            aria-label="Send"
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
          <p role="alert" className="text-destructive mt-2 text-xs">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
