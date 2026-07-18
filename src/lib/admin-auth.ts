import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export const ADMIN_SESSION_COOKIE = "nova_admin_session";

function getAllowlist(): string[] {
  const raw = process.env.NOVA_ADMIN_EMAILS || "leonartist.cs@gmail.com";
  return raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function isAllowlistedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAllowlist().includes(email.toLowerCase());
}

export interface AdminSession {
  email: string;
}

/** Verifies a session cookie value → allowlisted admin session, or null. */
export async function getAdminSession(cookieValue: string | undefined | null): Promise<AdminSession | null> {
  if (!adminAuth || !cookieValue) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookieValue, true);
    if (!isAllowlistedEmail(decoded.email)) return null;
    return { email: decoded.email as string };
  } catch {
    return null;
  }
}

/**
 * Use at the top of every /api/admin/* route:
 *   const session = await requireAdmin(req);
 *   if (session instanceof NextResponse) return session;
 */
export async function requireAdmin(req: NextRequest): Promise<AdminSession | NextResponse> {
  const cookieValue = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await getAdminSession(cookieValue);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
