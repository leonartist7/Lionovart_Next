/**
 * Shared helpers for portal verification against the Firebase emulators.
 *
 * The portal's security model is "the client never receives it" rather than
 * "the client can't see it", which is invisible to eyeballing — so every phase
 * asserts it mechanically instead. These helpers exist so a new session never
 * has to rebuild the setup.
 *
 * Prerequisites (see PORTAL_HANDOFF.md):
 *   npx firebase emulators:start --only auth,firestore --project lionovart-dev
 *   npm run dev
 */

export const BASE = process.env.PORTAL_BASE ?? "http://localhost:3000";
export const AGENCY_EMAIL = "leonartist.cs@gmail.com"; // must match NOVA_ADMIN_EMAILS

process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
// The sandbox proxy blocks localhost otherwise.
process.env.NO_PROXY = "*";
process.env.no_proxy = "*";

const { initializeApp } = await import("firebase-admin/app");
const { getAuth } = await import("firebase-admin/auth");

const app = initializeApp({ projectId: "lionovart-dev" }, "verify-" + Date.now());
const auth = getAuth(app);

/** Mints a real ID token via the Auth emulator's REST endpoint. */
export async function idTokenFor(email, name) {
  let user;
  try {
    user = await auth.getUserByEmail(email);
  } catch {
    user = await auth.createUser({ email, emailVerified: true, displayName: name });
  }
  const customToken = await auth.createCustomToken(user.uid);
  const res = await fetch(
    `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=demo-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    },
  );
  const data = await res.json();
  if (!data.idToken) throw new Error("no idToken: " + JSON.stringify(data));
  return data.idToken;
}

export function cookieFrom(res, name) {
  const hit = (res.headers.getSetCookie?.() ?? []).find((c) => c.startsWith(name + "="));
  return hit ? hit.split(";")[0].slice(name.length + 1) : null;
}

/** Headers for an authenticated JSON request. */
export const J = (cookie) => ({ "Content-Type": "application/json", Cookie: cookie });

/* ── Assertions ──────────────────────────────────────────────────── */

let pass = 0;
let fail = 0;

export function check(label, ok, detail = "") {
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  → " + detail : ""}`);
}

export function summary() {
  console.log(`\n${pass} passed, ${fail} failed`);
  return fail;
}

/* ── Fixture: a workspace with an agency session and an invited client ── */

/**
 * Builds an isolated fixture so suites never collide. Returns everything a
 * suite needs: the slug plus both session cookies.
 */
export async function setupWorkspace(name = "Verify " + Date.now()) {
  const agencyIdToken = await idTokenFor(AGENCY_EMAIL, "Leon");

  // Nova console session — required to create workspaces and invites.
  const adminRes = await fetch(`${BASE}/api/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: agencyIdToken }),
  });
  const adminCookie = `nova_admin_session=${cookieFrom(adminRes, "nova_admin_session")}`;

  const wsRes = await fetch(`${BASE}/api/portal/workspaces`, {
    method: "POST",
    headers: J(adminCookie),
    body: JSON.stringify({ name, clientCompany: "Verification Co." }),
  });
  const workspace = (await wsRes.json()).workspace;

  const clientEmail = `client-${Date.now()}@example.com`;
  const invRes = await fetch(`${BASE}/api/portal/invites`, {
    method: "POST",
    headers: J(adminCookie),
    body: JSON.stringify({ workspaceId: workspace.id, email: clientEmail, role: "client_owner" }),
  });
  const inviteToken = new URL((await invRes.json()).joinUrl).searchParams.get("token");

  const clientIdToken = await idTokenFor(clientEmail, "Test Client");
  const clientRes = await fetch(`${BASE}/api/portal/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: clientIdToken, inviteToken }),
  });
  const clientCookie = `lv_portal_session=${cookieFrom(clientRes, "lv_portal_session")}`;

  // Agency needs a PORTAL session too — the console cookie is a different one.
  const agencyRes = await fetch(`${BASE}/api/portal/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: agencyIdToken }),
  });
  const agencyCookie = `lv_portal_session=${cookieFrom(agencyRes, "lv_portal_session")}`;

  return {
    workspace,
    slug: workspace.slug,
    adminCookie,
    clientCookie,
    agencyCookie,
    clientEmail,
    inviteToken,
  };
}

/**
 * Mints an extra, unredeemed invite for a workspace.
 *
 * `setupWorkspace` redeems the invite it creates, so any test about invite
 * redemption itself needs a fresh one — otherwise the route reports
 * "already used" before it ever reaches the check under test.
 */
export async function createInvite(fx, email, role = "client_owner") {
  const res = await fetch(`${BASE}/api/portal/invites`, {
    method: "POST",
    headers: J(fx.adminCookie),
    body: JSON.stringify({ workspaceId: fx.workspace.id, email, role }),
  });
  const body = await res.json();
  return new URL(body.joinUrl).searchParams.get("token");
}

/** Fetches a page's raw HTML as a given session — for absence-from-source checks. */
export async function pageSource(path, cookie) {
  const res = await fetch(BASE + path, { headers: { Cookie: cookie } });
  return { status: res.status, html: await res.text() };
}
