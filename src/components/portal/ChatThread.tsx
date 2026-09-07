"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { formatTime } from "@/lib/portal/format";
import type { PortalMessage } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

const POLL_MS = 4000;

/**
 * The workspace's one message thread. A message the current viewer authored
 * sits on the right regardless of role, matching how every chat app already
 * reads — an agency reply looks the same to the client as an iMessage they
 * sent looks to them.
 */
export function ChatThread({
  workspaceSlug,
  initialMessages,
  currentUid,
  canSend,
  whatsappConnected,
  demo = false,
}: {
  workspaceSlug: string;
  initialMessages: PortalMessage[];
  currentUid: string;
  canSend: boolean;
  whatsappConnected: boolean;
  demo?: boolean;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  // Cursor polling, not a held connection — see PORTAL_HANDOFF.md §6 on why
  // (the site runs on both Cloud Run and Vercel; a held SSE stream behaves
  // differently on each). Paused while the tab is hidden.
  useEffect(() => {
    if (demo) return;
    const poll = async () => {
      if (document.visibilityState !== "visible") return;
      const res = await fetch(`/api/portal/${workspaceSlug}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages);
    };
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [workspaceSlug, demo]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || demo) return;

    setError(null);
    setSending(true);
    const res = await fetch(`/api/portal/${workspaceSlug}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setSending(false);

    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Couldn't send that.");
      return;
    }

    const { message } = await res.json();
    setMessages((prev) => [...prev, message]);
    setDraft("");
  }

  return (
    <div className="flex flex-col">
      {messages.length === 0 ? (
        <p className="text-muted-foreground max-w-xl text-[15px] leading-relaxed">
          Nothing here yet. Send a message and the studio will see it right away.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} mine={m.authorUid === currentUid} />
          ))}
        </div>
      )}
      <div ref={bottomRef} />

      {canSend && (
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
            placeholder={demo ? "Sending is off in the preview" : "Write a message…"}
            disabled={demo || sending}
            rows={2}
            className="resize-none border-none px-1 shadow-none focus-visible:ring-0"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              {whatsappConnected ? "Replies reach the client on WhatsApp too." : "WhatsApp isn't connected yet."}
            </p>
            <button
              type="submit"
              disabled={demo || sending || !draft.trim()}
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
      )}
    </div>
  );
}

function MessageBubble({ message, mine }: { message: PortalMessage; mine: boolean }) {
  const senderLabel =
    message.authorName ?? (message.channel === "whatsapp" ? "Client · via WhatsApp" : "Client");

  return (
    <div className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
      {!mine && <p className="text-muted-foreground mb-1 px-1 text-xs">{senderLabel}</p>}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed sm:max-w-[70%]",
          mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        {message.mediaUrl && (
          // Plain img: a short-lived signed URL, not something next/image's
          // remote-pattern allowlist should have to know about.
          <img
            src={message.mediaUrl}
            alt=""
            loading="lazy"
            className="mb-2 max-h-64 w-full max-w-xs rounded-lg object-cover"
          />
        )}
        {message.body && <p className="whitespace-pre-wrap">{message.body}</p>}
      </div>
      <div className="mt-1 flex items-center gap-1.5 px-1">
        <span className="text-muted-foreground text-[11px] tabular-nums">{formatTime(message.createdAt)}</span>
        {message.status === "failed" && <span className="text-destructive text-[11px]">Not delivered</span>}
      </div>
    </div>
  );
}
