import "server-only";
import { createHash } from "node:crypto";
import { adminDb } from "@/lib/firebase-admin";
import { SITE_URL } from "@/lib/seo/config";
import { renderActivityEmail, type ActivityKind } from "@/lib/portal/activity-email";
import { getAsset } from "@/lib/portal/assets";
import { getPortalMailer } from "@/lib/portal/providers/email";
import { buildVisibilityGate } from "@/lib/portal/threads";
import { roleAtLeast, type PortalRole, type Thread, type Workspace } from "@/lib/portal/types";

/**
 * Tells people when someone comments on a file.
 *
 * Every decision lands in an **outbox** — `workspaces/{ws}/notifications` —
 * whether or not an email actually went out. That one collection is the audit
 * trail ("did the client get told?"), and what
 * `verify.mjs` asserts against. Per-recipient/file claims serialize sends.
 *
 * Who is told is decided by who can SEE the thread, not by who is in the
 * workspace: recipients go through the same visibility gate `listThreads`
 * uses. A studio comment on an `internal` project's file is never mailed to a
 * client, and an email is a way to leak that as surely as a page is.
 */

/** One email per person per file in this window — a review session isn't 8 emails. */
export const THROTTLE_MS = 5 * 60 * 1000;

type Status = "sent" | "unconfigured" | "failed" | "throttled";

/** Statuses that count as "already told them recently" — a failed send must be retried, not throttled. */
const COUNTS_AS_TOLD: Status[] = ["sent", "unconfigured"];

function outboxRef(workspaceId: string) {
  if (!adminDb) throw new Error("Firestore is not configured");
  return adminDb.collection("workspaces").doc(workspaceId).collection("notifications");
}

/**
 * The studio's addresses. Mirrors `getAllowlist` in `@/lib/admin-auth` (not
 * exported from there, and that file is outside the portal's territory) —
 * same env var, same default, so "agency" means the same people in both.
 */
function studioEmails(): string[] {
  const raw = process.env.NOVA_ADMIN_EMAILS || "leonartist.cs@gmail.com";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

interface Recipient {
  email: string;
  role: PortalRole;
}

/**
 * Everyone who should hear about this, before the visibility gate.
 *
 * Clients are notified at `collaborator` and above — people who can reply. A
 * `viewer` can read a thread but not answer it, and mail they can't act on is
 * the kind that gets filtered. The studio is notified only when a *client*
 * speaks: the studio's own comments don't need to be mailed back to the studio.
 */
function candidates(workspace: Workspace, actor: { uid: string; isAgency: boolean }): Recipient[] {
  const out = new Map<string, Recipient>();

  for (const [uid, m] of Object.entries(workspace.members ?? {})) {
    if (uid === actor.uid || !m.email) continue;
    if (!roleAtLeast(m.role, "collaborator")) continue;
    out.set(m.email.toLowerCase(), { email: m.email.toLowerCase(), role: m.role });
  }

  if (!actor.isAgency) {
    for (const email of studioEmails()) {
      if (!out.has(email)) out.set(email, { email, role: "agency" });
    }
  }
  return [...out.values()];
}

export interface ThreadActivity {
  workspace: Workspace;
  thread: Pick<Thread, "id" | "targetType" | "targetId" | "versionId" | "pin">;
  commentId: string;
  /** `pin` — a new pinned thread; `thread` — a new general one; `reply` — a comment on an existing one. */
  kind: ActivityKind;
  body: string;
  actor: { uid: string; name: string; isAgency: boolean };
}

/**
 * Never throws and never blocks the caller on anything but the sends
 * themselves: a comment must not fail because a mail server was slow. It is
 * awaited by the route rather than deferred with `after()` on purpose — Cloud
 * Run throttles CPU once the response is sent, so deferred work can be starved
 * there while working fine on Vercel, the same split-host trap
 * PORTAL_HANDOFF.md §6 rules out for held SSE.
 */
export async function notifyThreadActivity(activity: ThreadActivity): Promise<void> {
  try {
    await dispatch(activity);
  } catch (err) {
    console.error("[portal-notify] dispatch failed:", err);
  }
}

async function dispatch({ workspace, thread, commentId, kind, body, actor }: ThreadActivity) {
  if (!adminDb) return;
  // Only files have a page to link to. Task/post/project threads have no UI
  // yet, so there is nothing to send someone to.
  if (thread.targetType !== "asset") return;

  const asset = await getAsset(workspace.id, thread.targetId, "agency");
  if (!asset) return;

  // One gate for every non-agency recipient: it turns only on whether the
  // viewer is agency, never on which client role they hold.
  const clientGate = await buildVisibilityGate(workspace.id, "collaborator", [thread]);
  const visible = candidates(workspace, actor).filter((r) => r.role === "agency" || clientGate(thread));
  if (visible.length === 0) return;

  const query = thread.versionId ? `?v=${thread.versionId}` : "";
  const url = `${SITE_URL}/portal/${workspace.slug}/assets/${asset.id}${query}#thread-${thread.id}`;
  const mail = renderActivityEmail({
    actorName: actor.name,
    workspaceName: workspace.name,
    assetName: asset.name,
    kind,
    excerpt: body,
    url,
  });

  const mailer = getPortalMailer();
  const now = Date.now();

  await Promise.all(
    visible.map(async (r) => {
      const entry = outboxRef(workspace.id).doc();
      const claimId = createHash("sha256").update(JSON.stringify([r.email, asset.id])).digest("hex");
      const claimRef = adminDb!.collection("workspaces").doc(workspace.id).collection("notificationClaims").doc(claimId);
      const claimed = await adminDb!.runTransaction(async (tx) => {
        const claim = await tx.get(claimRef);
        if (now - Number(claim.data()?.at ?? 0) < THROTTLE_MS) return false;
        const prior = await tx.get(outboxRef(workspace.id).where("recipientEmail", "==", r.email).where("targetId", "==", asset.id));
        if (prior.docs.some((doc) => COUNTS_AS_TOLD.includes(doc.data().status) && now - Date.parse(doc.data().createdAt) < THROTTLE_MS)) return false;
        tx.set(claimRef, { at: now, owner: entry.id });
        return true;
      });

      let status: Status = "throttled";
      let error: string | undefined;
      if (claimed) {
        const result = await mailer.send({ to: r.email, ...mail });
        status = result.ok ? "sent" : result.unconfigured ? "unconfigured" : "failed";
        if (!result.ok && !result.unconfigured) error = result.error;
      }

      await entry.create({
        recipientEmail: r.email,
        recipientRole: r.role,
        targetType: thread.targetType,
        targetId: asset.id,
        threadId: thread.id,
        commentId,
        kind,
        actorUid: actor.uid,
        subject: mail.subject,
        status,
        ...(error ? { error } : {}),
        createdAt: new Date(now).toISOString(),
      });
      if (claimed && status === "failed") {
        await adminDb!.runTransaction(async (tx) => {
          const claim = await tx.get(claimRef);
          if (claim.data()?.owner === entry.id) tx.delete(claimRef);
        });
      }

    }),
  );
}
