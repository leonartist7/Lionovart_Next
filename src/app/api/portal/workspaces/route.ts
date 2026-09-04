import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-auth";
import type { Workspace } from "@/lib/portal/types";

/** URL-safe slug, used in portal paths instead of an opaque document id. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Appends -2, -3 … until the slug is free. */
async function uniqueSlug(base: string): Promise<string> {
  if (!adminDb) return base;
  let candidate = base || "workspace";
  for (let n = 2; n < 50; n++) {
    const clash = await adminDb
      .collection("workspaces")
      .where("slug", "==", candidate)
      .limit(1)
      .get();
    if (clash.empty) return candidate;
    candidate = `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

/** GET — every workspace, newest first. Agency-only. */
export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;
  if (!adminDb) {
    return NextResponse.json({ error: "Firestore not configured" }, { status: 503 });
  }

  const snap = await adminDb
    .collection("workspaces")
    .orderBy("createdAt", "desc")
    .get();

  return NextResponse.json({
    workspaces: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Workspace),
  });
}

/** POST — create a client workspace. Agency-only; clients never self-serve. */
export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;
  if (!adminDb) {
    return NextResponse.json({ error: "Firestore not configured" }, { status: 503 });
  }

  let body: {
    name?: string;
    clientCompany?: string;
    leadId?: string;
    whatsappNumber?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "A workspace name is required." }, { status: 400 });
  }

  const doc = {
    name,
    slug: await uniqueSlug(slugify(name)),
    clientCompany: body.clientCompany?.trim() || null,
    leadId: body.leadId?.trim() || null,
    whatsappNumber: body.whatsappNumber?.trim() || null,
    status: "active" as const,
    createdAt: new Date().toISOString(),
    // Agency staff get implicit access via the email allowlist, so a new
    // workspace legitimately starts with no members until a client is invited.
    members: {},
    memberUids: [],
  };

  const ref = await adminDb.collection("workspaces").add(doc);
  return NextResponse.json({ workspace: { id: ref.id, ...doc } }, { status: 201 });
}
