"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { AssetViewer } from "@/components/portal/AssetViewer";
import { CommentComposer } from "@/components/portal/CommentComposer";
import { PinchZoomImage, type ImagePin } from "@/components/portal/PinchZoomImage";
import { ThreadPanel } from "@/components/portal/ThreadPanel";
import type { ThreadFeed, ThreadWithComments } from "@/lib/portal/threads";
import type { AnnotationPin, AssetKind } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

/**
 * ~3.5s while the tab is visible, paused when it isn't. Cursor polling, not a
 * held SSE stream — PORTAL_HANDOFF.md §6: this app runs on Cloud Run *and*
 * Vercel, and a held connection behaves differently on each. Same shape
 * `ChatThread` already uses for Messages.
 */
const POLL_MS = 3500;

/**
 * A file, its pins, and the conversation about it.
 *
 * Owns the polled thread state so a pin marker and its thread card can never
 * disagree: everything the panel or the image does goes through here.
 *
 * Pins are scoped to the version on screen — **v2 does not inherit v1's
 * feedback**, because a note about a corner that no longer exists is worse
 * than no note. General comments (no pin) belong to the file and follow it
 * across versions.
 */
export function AssetCollaboration({
  workspaceSlug,
  assetId,
  assetName,
  assetKind,
  viewUrl,
  activeVersion,
  initialThreads,
  initialCursor,
  currentUid,
  isAgency,
  canComment,
  demo = false,
}: {
  workspaceSlug: string;
  assetId: string;
  assetName: string;
  assetKind: AssetKind;
  viewUrl: string;
  activeVersion: number;
  initialThreads: ThreadWithComments[];
  initialCursor: string;
  currentUid: string;
  isAgency: boolean;
  canComment: boolean;
  demo?: boolean;
}) {
  const [threads, setThreads] = useState(initialThreads);
  const [annotating, setAnnotating] = useState(false);
  const [draftPin, setDraftPin] = useState<AnnotationPin | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const cursor = useRef(initialCursor);

  const base = `/api/portal/${workspaceSlug}/threads`;

  /* ── Realtime ────────────────────────────────────────────────── */

  useEffect(() => {
    if (demo) return;

    const poll = async () => {
      if (document.visibilityState !== "visible") return;

      // Anything created locally after this request left is newer than
      // whatever comes back — keep it rather than blinking it out of
      // existence until the next poll catches up.
      const startedAt = new Date().toISOString();
      const params = new URLSearchParams({ targetType: "asset", targetId: assetId });
      if (cursor.current) params.set("since", cursor.current);

      const res = await fetch(`${base}?${params}`);
      if (!res.ok) return;
      const feed: ThreadFeed = await res.json();
      if (feed.cursor) cursor.current = feed.cursor;

      const live = new Set(feed.ids);
      setThreads((prev) => {
        const merged = new Map(
          prev.filter((t) => live.has(t.id) || t.createdAt > startedAt).map((t) => [t.id, t]),
        );
        for (const t of feed.threads) merged.set(t.id, t);
        return [...merged.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      });
    };

    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [base, assetId, demo]);

  /* ── Writes ──────────────────────────────────────────────────── */

  const fail = async (res: Response, fallback: string): Promise<string> =>
    ((await res.json().catch(() => ({}))) as { error?: string }).error ?? fallback;

  const upsert = useCallback((thread: ThreadWithComments) => {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== thread.id).concat(thread);
      return next.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    });
  }, []);

  const createThread = useCallback(
    async (body: string, pin?: AnnotationPin): Promise<string | null> => {
      if (demo) {
        // The preview never reaches the database; the banner says so. Echoing
        // the note back is the honest way to show how the interaction feels.
        const now = new Date().toISOString();
        const id = `demo-${now}`;
        upsert({
          id,
          targetType: "asset",
          targetId: assetId,
          ...(pin ? { pin, versionId: activeVersion } : {}),
          status: "open",
          createdBy: currentUid,
          createdAt: now,
          lastMessageAt: now,
          updatedAt: now,
          participants: [currentUid],
          comments: [{ id: `${id}-c`, body, authorUid: currentUid, authorName: "You", createdAt: now }],
        });
        setDraftPin(null);
        return null;
      }

      const res = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "asset",
          targetId: assetId,
          ...(pin ? { pin, versionId: activeVersion } : {}),
          body,
        }),
      });
      if (!res.ok) return fail(res, "Couldn't post that comment.");

      const { thread } = (await res.json()) as { thread: ThreadWithComments };
      upsert(thread);
      setDraftPin(null);
      setActiveThreadId(thread.id);
      return null;
    },
    [base, assetId, activeVersion, currentUid, demo, upsert],
  );

  const reply = useCallback(
    async (threadId: string, body: string): Promise<string | null> => {
      const now = new Date().toISOString();
      const local = (authorName: string) =>
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  lastMessageAt: now,
                  updatedAt: now,
                  comments: [
                    ...t.comments,
                    { id: `local-${now}`, body, authorUid: currentUid, authorName, createdAt: now },
                  ],
                }
              : t,
          ),
        );

      if (demo) {
        local("You");
        return null;
      }

      const res = await fetch(`${base}/${threadId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) return fail(res, "Couldn't post that reply.");

      const { comment } = (await res.json()) as { comment: ThreadWithComments["comments"][number] };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                lastMessageAt: comment.createdAt,
                updatedAt: comment.createdAt,
                comments: [...t.comments, comment],
              }
            : t,
        ),
      );
      return null;
    },
    [base, currentUid, demo],
  );

  const resolve = useCallback(
    async (threadId: string, resolved: boolean): Promise<string | null> => {
      const apply = () =>
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  status: resolved ? ("resolved" as const) : ("open" as const),
                  updatedAt: new Date().toISOString(),
                }
              : t,
          ),
        );

      if (demo) {
        apply();
        return null;
      }

      const res = await fetch(`${base}/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved }),
      });
      if (!res.ok) return fail(res, "Couldn't update that thread.");
      apply();
      return null;
    },
    [base, demo],
  );

  const removeComment = useCallback(
    async (threadId: string, commentId: string): Promise<string | null> => {
      const apply = () =>
        setThreads((prev) =>
          prev
            .map((t) =>
              t.id === threadId
                ? { ...t, comments: t.comments.filter((c) => c.id !== commentId) }
                : t,
            )
            .filter((t) => t.comments.length > 0),
        );

      if (demo) {
        apply();
        return null;
      }

      const res = await fetch(`${base}/${threadId}/comments/${commentId}`, { method: "DELETE" });
      if (!res.ok) return fail(res, "Couldn't delete that comment.");
      apply();
      return null;
    },
    [base, demo],
  );

  /* ── Derived view ────────────────────────────────────────────── */

  const { pinThreads, panelThreads, pinNumbers, strandedPins } = useMemo(() => {
    // One ordering rule, applied here rather than trusted from the props: a
    // pin's number is its creation order, and a number that renumbers itself
    // after someone adds a pin makes every earlier reference to "pin 2" wrong.
    const ordered = [...threads].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const pinned = ordered.filter((t) => t.pin && t.versionId === activeVersion);
    const general = ordered.filter((t) => !t.pin);
    const numbers = new Map(pinned.map((t, i) => [t.id, i + 1]));
    return {
      pinThreads: pinned,
      panelThreads: [...pinned, ...general],
      pinNumbers: numbers,
      strandedPins: ordered.filter((t) => t.pin && t.versionId !== activeVersion).length,
    };
  }, [threads, activeVersion]);

  const pins: ImagePin[] = pinThreads.map((t) => ({
    id: t.id,
    x: t.pin!.x,
    y: t.pin!.y,
    label: String(pinNumbers.get(t.id)),
    resolved: t.status === "resolved",
  }));

  const isImage = assetKind === "image";
  const canPin = isImage && canComment;

  function selectPin(threadId: string) {
    setActiveThreadId(threadId);
    document.getElementById(`thread-${threadId}`)?.scrollIntoView({ block: "center" });
  }

  return (
    <>
      <section className="mt-7">
        {isImage ? (
          <PinchZoomImage
            src={viewUrl}
            alt={assetName}
            pins={pins}
            annotating={annotating}
            draftPin={draftPin}
            activePinId={activeThreadId}
            onPinDrop={(pin) => {
              setDraftPin(pin);
              setActiveThreadId(null);
            }}
            onPinSelect={selectPin}
          />
        ) : (
          <AssetViewer kind={assetKind} url={viewUrl} name={assetName} />
        )}

        {canPin && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              // Commits on pointer-down, like every other pressable surface in
              // the portal (PORTAL_DESIGN § Motion).
              onPointerDown={() => {
                setAnnotating((on) => !on);
                setDraftPin(null);
              }}
              aria-pressed={annotating}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-medium",
                "transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.985]",
                "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
                annotating
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40",
              )}
            >
              {annotating ? <X size={15} aria-hidden="true" /> : <MapPin size={15} aria-hidden="true" />}
              {annotating ? "Done pinning" : "Add a pin"}
            </button>
            <p className="text-muted-foreground text-xs">
              {annotating
                ? "Touch the spot you mean. Pins stay with version " + activeVersion + "."
                : strandedPins > 0
                  ? `${strandedPins} pin${strandedPins === 1 ? "" : "s"} on other versions.`
                  : "Pinch to zoom, double-tap to fit."}
            </p>
          </div>
        )}

        {draftPin && canPin && (
          <CommentComposer
            className="mt-3"
            placeholder="What should change here?"
            submitLabel="Post pinned comment"
            autoFocus
            onCancel={() => setDraftPin(null)}
            onSubmit={(body) => createThread(body, draftPin)}
          />
        )}
      </section>

      <section aria-labelledby="asset-comments" className="mt-8">
        <ThreadPanel
          threads={panelThreads}
          pinNumbers={pinNumbers}
          currentUid={currentUid}
          isAgency={isAgency}
          canComment={canComment}
          activeThreadId={activeThreadId}
          onSelect={setActiveThreadId}
          onCreate={(body) => createThread(body)}
          onReply={reply}
          onResolve={resolve}
          onDeleteComment={removeComment}
          emptyHint={
            canPin
              ? "No comments yet. Add a pin to mark a spot on the design, or leave a note below."
              : "No comments on this file yet."
          }
        />
      </section>
    </>
  );
}
