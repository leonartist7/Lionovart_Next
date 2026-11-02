import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { rateLimitOk } from "@/lib/rate-limit";
import { isAllowlistedEmail } from "@/lib/admin-auth";
import {
  PORTAL_SESSION_COOKIE,
  PORTAL_SESSION_TTL_MS,
} from "@/lib/portal-auth";
import { describeInviteError, findInviteByToken, redeemInviteAtomically } from "@/lib/portal/invites";

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
    // An unverified email on an otherwise valid Firebase ID token must not
    // claim a bearer invite addressed to that email.
    if (decoded.email_verified !== true) {
      return NextResponse.json(
        { error: "Verify your email address before accepting an invitation." },
        { status: 403 },
      );
    }
    const lookup = await findInviteByToken(inviteToken);
    if (!lookup.ok) {
      return NextResponse.json(
        { error: describeInviteError(lookup.reason) },
        { status: 400 },
      );
    }
    if (lookup.invite.email !== email) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address. Sign in with the invited address." },
        { status: 403 },
      );
    }

    // The preview lookup is not a claim. The transaction re-checks the live
    // token, expiry, address and membership before atomically burning the link.
    const result = await redeemInviteAtomically({
      inviteId: lookup.invite.id,
      token: inviteToken,
      uid: decoded.uid,
      email,
      name,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason === "email_mismatch"
          ? "This invitation was sent to a different email address. Sign in with the invited address."
          : describeInviteError(result.reason) },
        { status: result.reason === "email_mismatch" ? 403 : 400 },
      );
    }
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
