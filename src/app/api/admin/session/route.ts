import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { rateLimitOk } from "@/lib/rate-limit";
import { ADMIN_SESSION_COOKIE, isAllowlistedEmail } from "@/lib/admin-auth";

const SESSION_TTL_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimitOk(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!adminAuth) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  let idToken: string | undefined;
  try {
    ({ idToken } = await req.json());
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

  if (!isAllowlistedEmail(decoded.email)) {
    return NextResponse.json({ error: "This account doesn't have console access." }, { status: 403 });
  }

  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_TTL_MS });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
