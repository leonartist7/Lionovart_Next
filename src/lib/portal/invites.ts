import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { PORTAL_ROLES, roleAtLeast, type Invite, type Membership, type PortalRole } from "@/lib/portal/types";

const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const INVITE_TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

/**
 * Invite tokens are single-use bearer secrets that travel through email, so the
 * database only ever stores their SHA-256 hash. A leaked Firestore export
 * therefore cannot be used to join a workspace.
 */

export function generateInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Constant-time compare so a hash can't be recovered by timing the lookup. */
function hashesMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export interface CreateInviteInput {
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: PortalRole;
  createdBy: string;
}

export interface CreatedInvite {
  invite: Invite;
  /** The raw token — exists only in memory and in the outgoing email. */
  token: string;
}

export async function createInvite(
  input: CreateInviteInput,
): Promise<CreatedInvite> {
  if (!adminDb) throw new Error("Firestore is not configured");

  const token = generateInviteToken();
  const now = new Date();

  const doc = {
    workspaceId: input.workspaceId,
    workspaceName: input.workspaceName,
    email: input.email.trim().toLowerCase(),
    role: input.role,
    tokenHash: hashInviteToken(token),
    expiresAt: new Date(now.getTime() + INVITE_TTL_MS).toISOString(),
    createdBy: input.createdBy,
    createdAt: now.toISOString(),
  };

  const ref = await adminDb.collection("invites").add(doc);
  return { invite: { id: ref.id, ...doc }, token };
}

export type InviteLookupError =
  | "not_found"
  | "expired"
  | "already_accepted";

export type InviteLookup =
  | { ok: true; invite: Invite }
  | { ok: false; reason: InviteLookupError };

/**
 * Resolves a raw token to its invite. Every failure mode is reported distinctly
 * so the join page can say what actually went wrong ("this link expired")
 * rather than a useless generic error.
 */
export async function findInviteByToken(
  token: string,
): Promise<InviteLookup> {
  if (!adminDb || typeof token !== "string" || !INVITE_TOKEN_RE.test(token)) {
    return { ok: false, reason: "not_found" };
  }

  const tokenHash = hashInviteToken(token);
  const snap = await adminDb
    .collection("invites")
    .where("tokenHash", "==", tokenHash)
    .limit(1)
    .get();

  if (snap.empty) return { ok: false, reason: "not_found" };

  const doc = snap.docs[0];
  const invite = { id: doc.id, ...doc.data() } as Invite;

  // Re-verify in constant time: the equality query above already matched, but
  // this keeps the comparison explicit if the lookup strategy ever changes.
  if (typeof invite.tokenHash !== "string" || !hashesMatch(invite.tokenHash, tokenHash)) {
    return { ok: false, reason: "not_found" };
  }
  if (invite.acceptedAt) return { ok: false, reason: "already_accepted" };
  const expiresAt = Date.parse(invite.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, invite };
}


export type InviteRedemption =
  | { ok: true }
  | { ok: false; reason: InviteLookupError | "email_mismatch" };

/**
 * A preview lookup can race a second sign-in or an expiring invitation.
 * Re-read BOTH documents inside a Firestore transaction before granting access.
 * Firestore retries a transaction if its read documents were modified.
 */
export async function redeemInviteAtomically(input: {
  inviteId: string;
  token: string;
  uid: string;
  email: string;
  name: string;
}): Promise<InviteRedemption> {
  if (!adminDb) throw new Error("Firestore is not configured");
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(input.inviteId) ||
      typeof input.token !== "string" || !INVITE_TOKEN_RE.test(input.token) ||
      !input.uid || !input.email) {
    return { ok: false, reason: "not_found" };
  }
  const tokenHash = hashInviteToken(input.token);
  const inviteRef = adminDb.collection("invites").doc(input.inviteId);
  return adminDb.runTransaction(async transaction => {
    const snapshot = await transaction.get(inviteRef);
    if (!snapshot.exists) return { ok: false, reason: "not_found" };
    const invite = snapshot.data() as Invite;
    if (typeof invite.tokenHash !== "string" || !hashesMatch(invite.tokenHash, tokenHash)) {
      return { ok: false, reason: "not_found" };
    }
    if (invite.acceptedAt) return { ok: false, reason: "already_accepted" };
    const expiresAt = Date.parse(invite.expiresAt);
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return { ok: false, reason: "expired" };
    }
    if (invite.email !== input.email) return { ok: false, reason: "email_mismatch" };
    if (!PORTAL_ROLES.includes(invite.role) || invite.role === "agency" ||
        typeof invite.workspaceId !== "string" ||
        !/^[A-Za-z0-9_-]{1,128}$/.test(invite.workspaceId)) {
      return { ok: false, reason: "not_found" };
    }
    const workspaceRef = adminDb.collection("workspaces").doc(invite.workspaceId);
    const workspace = await transaction.get(workspaceRef);
    if (!workspace.exists) return { ok: false, reason: "not_found" };
    const existing = (workspace.data()?.members as Record<string, Membership> | undefined)?.[input.uid];
    // An older/lower-role invite must never demote an existing member.
    const keepExisting = existing && PORTAL_ROLES.includes(existing.role) &&
      roleAtLeast(existing.role, invite.role);
    const at = new Date().toISOString();
    const membership: Membership = keepExisting ? existing : {
      role: invite.role, email: input.email, name: input.name, addedAt: at,
    };
    transaction.update(workspaceRef, {
      [`members.${input.uid}`]: membership,
      memberUids: FieldValue.arrayUnion(input.uid),
    });
    transaction.update(inviteRef, { acceptedAt: at, acceptedBy: input.uid });
    return { ok: true };
  });
}

export function describeInviteError(reason: InviteLookupError): string {
  switch (reason) {
    case "expired":
      return "This invitation has expired. Ask LIONOVART to send a new one.";
    case "already_accepted":
      return "This invitation has already been used. Sign in instead.";
    default:
      return "This invitation link isn't valid.";
  }
}
