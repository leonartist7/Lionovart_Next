import { NextRequest, NextResponse } from "next/server";
import { rateLimitOk } from "@/lib/rate-limit";
import { describeInviteError, findInviteByToken } from "@/lib/portal/invites";

/**
 * Lets the join page show who the invitation is for *before* asking anyone to
 * sign in — "You're invited to Northwind's workspace, sign in as jo@…".
 *
 * Returns only what the recipient already has in their inbox, and takes the
 * token in the body rather than the query string so it stays out of server
 * access logs.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimitOk(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let token: string | undefined;
  try {
    ({ token } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const lookup = await findInviteByToken(token);
  if (!lookup.ok) {
    return NextResponse.json(
      { error: describeInviteError(lookup.reason), reason: lookup.reason },
      { status: 404 },
    );
  }

  return NextResponse.json({
    workspaceName: lookup.invite.workspaceName,
    email: lookup.invite.email,
    role: lookup.invite.role,
  });
}
