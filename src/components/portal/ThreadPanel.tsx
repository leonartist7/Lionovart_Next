"use client";

import { useState } from "react";
import { Check, RotateCcw, Trash2 } from "lucide-react";
import { CommentComposer } from "@/components/portal/CommentComposer";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/portal/format";
import type { ThreadWithComments } from "@/lib/portal/threads";
import { cn } from "@/lib/utils";

/**
 * The conversation list beside a file.
 *
 * Presentational: every write goes back up to the owner (`AssetCollaboration`),
 * which holds the polled state, so there is one source of truth for a thread
 * whether it changed here or on someone else's screen three seconds ago.
 *
 * Resolved threads collapse behind a count rather than filling the panel —
 * "the studio never looks busy" (PORTAL_DESIGN). They are never deleted; a
 * resolved note is the record of a decision.
 */
export function ThreadPanel({
  threads,
  pinNumbers,
  currentUid,
  isAgency,
  canComment,
  activeThreadId,
  onSelect,
  onCreate,
  onReply,
  onResolve,
  onDeleteComment,
  emptyHint,
}: {
  threads: ThreadWithComments[];
  pinNumbers: Map<string, number>;
  currentUid: string;
  isAgency: boolean;
  canComment: boolean;
  activeThreadId: string | null;
  onSelect: (threadId: string | null) => void;
  onCreate: (body: string) => Promise<string | null>;
  onReply: (threadId: string, body: string) => Promise<string | null>;
  onResolve: (threadId: string, resolved: boolean) => Promise<string | null>;
  onDeleteComment: (threadId: string, commentId: string) => Promise<string | null>;
  emptyHint?: string;
}) {
  const [showResolved, setShowResolved] = useState(false);

  const open = threads.filter((t) => t.status !== "resolved");
  const resolved = threads.filter((t) => t.status === "resolved");

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="asset-comments" className="text-muted-foreground text-sm font-medium">
          Comments
        </h2>
        {open.length > 0 && (
          <span className="text-muted-foreground text-xs tabular-nums">
            {open.length} open
          </span>
        )}
      </div>

      {threads.length === 0 ? (
        <p className="text-muted-foreground max-w-xl text-[15px] leading-relaxed">
          {emptyHint ?? "No comments on this file yet."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {open.map((thread) => (
            <li key={thread.id}>
              <ThreadCard
                thread={thread}
                pinNumber={pinNumbers.get(thread.id)}
                currentUid={currentUid}
                isAgency={isAgency}
                canComment={canComment}
                active={thread.id === activeThreadId}
                onSelect={onSelect}
                onReply={onReply}
                onResolve={onResolve}
                onDeleteComment={onDeleteComment}
              />
            </li>
          ))}
        </ul>
      )}

      {resolved.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowResolved((v) => !v)}
            aria-expanded={showResolved}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 -ml-1 rounded-lg px-1 py-1 text-sm transition-colors focus-visible:ring-3 focus-visible:outline-none"
          >
            {showResolved ? "Hide" : "Show"} {resolved.length} resolved
          </button>
          {showResolved && (
            <ul className="mt-3 flex flex-col gap-3">
              {resolved.map((thread) => (
                <li key={thread.id}>
                  <ThreadCard
                    thread={thread}
                    pinNumber={pinNumbers.get(thread.id)}
                    currentUid={currentUid}
                    isAgency={isAgency}
                    canComment={canComment}
                    active={thread.id === activeThreadId}
                    onSelect={onSelect}
                    onReply={onReply}
                    onResolve={onResolve}
                    onDeleteComment={onDeleteComment}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {canComment && (
        <CommentComposer
          className="mt-4"
          placeholder="Leave a comment on this file…"
          submitLabel="Post comment"
          onSubmit={onCreate}
        />
      )}
    </div>
  );
}

function ThreadCard({
  thread,
  pinNumber,
  currentUid,
  isAgency,
  canComment,
  active,
  onSelect,
  onReply,
  onResolve,
  onDeleteComment,
}: {
  thread: ThreadWithComments;
  pinNumber?: number;
  currentUid: string;
  isAgency: boolean;
  canComment: boolean;
  active: boolean;
  onSelect: (threadId: string | null) => void;
  onReply: (threadId: string, body: string) => Promise<string | null>;
  onResolve: (threadId: string, resolved: boolean) => Promise<string | null>;
  onDeleteComment: (threadId: string, commentId: string) => Promise<string | null>;
}) {
  const [replying, setReplying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isResolved = thread.status === "resolved";
  // Matches the server: only the person who raised it, or the studio, closes it.
  const canResolve = canComment && (isAgency || thread.createdBy === currentUid);

  async function toggleResolved() {
    setBusy(true);
    setError(await onResolve(thread.id, !isResolved));
    setBusy(false);
  }

  return (
    <article
      id={`thread-${thread.id}`}
      onPointerDown={() => onSelect(thread.id)}
      className={cn(
        "border-border bg-card rounded-2xl border p-4",
        "transition-[border-color,box-shadow] duration-150",
        active && "border-primary/40 ring-primary/20 ring-3",
      )}
    >
      <header className="mb-3 flex items-center gap-2">
        {pinNumber !== undefined ? (
          // Deliberately not red. The marker on the image is the signal — work
          // waiting on someone — and repeating that red on the card next to it
          // spends the accent twice for one piece of information.
          <span
            className={cn(
              "border-border grid size-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold tabular-nums",
              isResolved ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {pinNumber}
          </span>
        ) : null}
        <p className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
          {formatDate(thread.createdAt)}
        </p>
        {isResolved && <Badge variant="success">Resolved</Badge>}
      </header>

      <ul className="flex flex-col gap-3">
        {thread.comments.map((comment) => {
          const mine = comment.authorUid === currentUid;
          return (
            <li key={comment.id} className="group/comment">
              <div className="flex items-baseline gap-2">
                <p className="text-foreground text-sm font-medium">{comment.authorName}</p>
                <span className="text-muted-foreground text-[11px] tabular-nums">
                  {formatTime(comment.createdAt)}
                </span>
                {(mine || isAgency) && (
                  <button
                    type="button"
                    onClick={async () => {
                      setBusy(true);
                      setError(await onDeleteComment(thread.id, comment.id));
                      setBusy(false);
                    }}
                    disabled={busy}
                    aria-label={`Delete comment by ${comment.authorName}`}
                    className="text-muted-foreground hover:text-destructive focus-visible:ring-primary/50 ml-auto rounded-md p-1 transition-colors focus-visible:ring-3 focus-visible:outline-none disabled:opacity-40"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                )}
              </div>
              <p className="text-foreground mt-0.5 text-[15px] leading-relaxed whitespace-pre-wrap">
                {comment.body}
              </p>
            </li>
          );
        })}
      </ul>

      {canComment && (
        <div className="mt-3">
          {replying ? (
            <CommentComposer
              placeholder="Reply…"
              submitLabel="Post reply"
              autoFocus
              onCancel={() => setReplying(false)}
              onSubmit={async (body) => {
                const failure = await onReply(thread.id, body);
                if (!failure) setReplying(false);
                return failure;
              }}
            />
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setReplying(true)}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 -ml-1 rounded-lg px-2 py-1.5 text-sm transition-colors focus-visible:ring-3 focus-visible:outline-none"
              >
                Reply
              </button>
              {canResolve && (
                <button
                  type="button"
                  onClick={toggleResolved}
                  disabled={busy}
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors focus-visible:ring-3 focus-visible:outline-none disabled:opacity-40"
                >
                  {isResolved ? (
                    <>
                      <RotateCcw size={14} aria-hidden="true" /> Reopen
                    </>
                  ) : (
                    <>
                      <Check size={14} aria-hidden="true" /> Resolve
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="text-destructive mt-2 text-xs">
          {error}
        </p>
      )}
    </article>
  );
}
