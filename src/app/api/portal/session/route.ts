import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { rateLimitOk } from "@/lib/rate-limit";
import { isAllowlistedEmail } from "@/lib/admin-auth";
import {
  PORTAL_SESSION_COOKIE,
  PORTAL_SESSION_TTL_MS,
} from "@/lib/portal-auth";
import { describeInviteError, findInviteByToken } from "@/lib/portal/invites";
import type { Membership } from "@/lib/portal/types";

/**
 * POST — exchange a Firebase idToken (Google or email-link sign-in) for a
 * portal session cookie.
 *
 * An `inviteToken` may accompany it. When present the invite is redeemed in the
 * same request: membership is written and the invite burned, so a link can
 * never be used twice.
 *
 * Callers with no invite must already be a member of at least one workspace —
 * there is no public signup.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimitOk(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!adminAuth || !adminDb) {
    return NextResponse.json(
      { error: "The portal isn't configured for this environment." },
      { status: 503 },
    );
  }

  let idToken: string | undefined;
  let inviteToken: string | undefined;
  try {
    ({ idToken, inviteToken } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const email = decoded.email?.toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: "That sign-in method didn't provide an email address." },
      { status: 400 },
    );
  }

  const name =
    (decoded.name as string | undefined)?.trim() || email.split("@")[0];
  const isAgency = isAllowlistedEmail(email);

  // ── Redeem an invite, when one came with the request ──────────────
  if (inviteToken) {
    const lookup = await findInviteByToken(inviteToken);
    if (!lookup.ok) {
      return NextResponse.json(
        { error: describeInviteError(lookup.reason) },
        { status: 400 },
      );
    }

    // The invite is bound to an address, so a forwarded link is useless to
    // anyone else. Both providers we accept give a provider-verified email.
    if (lookup.invite.email !== email) {
      return NextResponse.json(
        {
          error: `This invitation was sent to ${lookup.invite.email}. Sign in with that address.`,
        },
        { status: 403 },
      );
    }

    const membership: Membership = {
      role: lookup.invite.role,
      email,
      name,
      addedAt: new Date().toISOString(),
    };

    const workspaceRef = adminDb
      .collection("workspaces")
      .doc(lookup.invite.workspaceId);
    const inviteRef = adminDb.collection("invites").doc(lookup.invite.id);

    // One batch: membership and the burn either both land or neither does, so
    // a crash can't leave a spent invite that granted nothing.
    const batch = adminDb.batch();
    batch.update(workspaceRef, {
      [`members.${decoded.uid}`]: membership,
      memberUids: FieldValue.arrayUnion(decoded.uid),
    });
    batch.update(inviteRef, {
      acceptedAt: new Date().toISOString(),
      acceptedBy: decoded.uid,
    });
    await batch.commit();
  }

  // ── Upsert the portal user record ─────────────────────────────────
  const userRef = adminDb.collection("portal_users").doc(decoded.uid);
  const nowIso = new Date().toISOString();
  await userRef.set(
    {
      email,
      name,
      photoUrl: (decoded.picture as string | undefined) ?? null,
      lastSeenAt: nowIso,
      createdAt: nowIso,
    },
    { merge: true },
  );

  // ── No invite? Then they must already belong somewhere ────────────
  if (!inviteToken && !isAgency) {
    const existing = await adminDb
      .collection("workspaces")
      .where("memberUids", "array-contains", decoded.uid)
      .limit(1)
      .get();

    if (existing.empty) {
      return NextResponse.json(
        {
          error:
            "This account doesn't have portal access yet. Ask LIONOVART for an invitation.",
        },
        { status: 403 },
      );
    }
  }

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: PORTAL_SESSION_TTL_MS,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(PORTAL_SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PORTAL_SESSION_TTL_MS / 1000,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PORTAL_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
