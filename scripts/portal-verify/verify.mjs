/**
 * Portal verification suite.
 *
 *   node scripts/portal-verify/verify.mjs          # everything built so far
 *   node scripts/portal-verify/verify.mjs auth     # one section
 *
 * Exits non-zero on any failure, so it works as a gate before pushing.
 *
 * The load-bearing tests are the "absence from source" ones. The portal's
 * security model is that a client's browser never RECEIVES agency controls or
 * internal projects — not that they're hidden. That distinction is invisible to
 * a screenshot, so it is asserted against raw HTML here. If you add a surface
 * with agency-only controls, add its marker to AGENCY_MARKERS below.
 */
import { createHmac } from "node:crypto";
import {
  BASE,
  J,
  check,
  cookieFrom,
  createInvite,
  idTokenFor,
  pageSource,
  setupWorkspace,
  summary,
} from "./harness.mjs";

/** Strings that must appear for agency and never for a client. */
const AGENCY_MARKERS = ["Add a milestone", "Add a project", "Request approval"];

const only = process.argv[2];
const run = (name) => !only || only === name;

/* ── auth: invites, sessions, isolation ──────────────────────────── */
if (run("auth")) {
  console.log("\n── auth ──");
  const fx = await setupWorkspace("Verify Auth");

  // A forwarded invite is useless to anyone but its recipient. Needs a fresh
  // invite: the fixture's own has already been redeemed, and "already used"
  // (400) would short-circuit the email-mismatch check we're testing.
  const freshToken = await createInvite(fx, "intended@example.com");
  const wrongToken = await idTokenFor("wrong@example.com", "Wrong Person");
  const wrong = await fetch(`${BASE}/api/portal/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: wrongToken, inviteToken: freshToken }),
  });
  check("forwarded invite rejected", wrong.status === 403, `${wrong.status}`);

  const fx2 = await setupWorkspace("Verify Auth 2");

  // An invite is single use.
  const clientToken = await idTokenFor(fx.clientEmail, "Test Client");
  const replay = await fetch(`${BASE}/api/portal/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: clientToken, inviteToken: fx.inviteToken }),
  });
  check("invite replay rejected", replay.status === 400, `${replay.status}`);

  // No public signup.
  const strangerToken = await idTokenFor("stranger@example.com", "Stranger");
  const stranger = await fetch(`${BASE}/api/portal/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: strangerToken }),
  });
  check("stranger without invite rejected", stranger.status === 403, `${stranger.status}`);

  // A client of one workspace cannot reach another.
  const foreign = await pageSource(`/portal/${fx2.slug}`, fx.clientCookie);
  check("foreign workspace 404s", foreign.status === 404, `${foreign.status}`);

  const anon = await fetch(`${BASE}/api/portal/workspaces`, { method: "POST" });
  check("unauthenticated workspace create is 401", anon.status === 401, `${anon.status}`);
}

/* ── projects: roles, derived progress, internal visibility ──────── */
if (run("projects")) {
  console.log("\n── projects ──");
  const fx = await setupWorkspace("Verify Projects");
  const api = `${BASE}/api/portal/${fx.slug}/projects`;

  const created = await fetch(api, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ name: "Brand Identity System", kind: "brand" }),
  });
  const project = (await created.json()).project;
  check("agency creates a project", created.status === 201, `id=${project?.id}`);

  const clientCreate = await fetch(api, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ name: "Client attempt", kind: "web" }),
  });
  check("client cannot create a project", clientCreate.status === 403, `${clientCreate.status}`);

  // Derived progress: four milestones, mark one done, expect 25%.
  const mApi = `${api}/${project.id}/milestones`;
  const made = [];
  for (const title of ["Discovery", "Concepts", "Refinement", "Handover"]) {
    const r = await fetch(mApi, {
      method: "POST",
      headers: J(fx.agencyCookie),
      body: JSON.stringify({ title }),
    });
    made.push((await r.json()).milestone);
  }
  await fetch(`${mApi}/${made[0].id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ status: "done" }),
  });
  const got = await (await fetch(`${api}/${project.id}`, { headers: J(fx.agencyCookie) })).json();
  check("progress derives from milestones (1/4)", got.project.progress === 25, `${got.project.progress}%`);

  const clientPatch = await fetch(`${mApi}/${made[1].id}`, {
    method: "PATCH",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ status: "done" }),
  });
  check("client cannot change a milestone", clientPatch.status === 403, `${clientPatch.status}`);

  // Internal projects: absent from the client's list, HTML and direct URL.
  const internal = (
    await (
      await fetch(api, {
        method: "POST",
        headers: J(fx.agencyCookie),
        body: JSON.stringify({
          name: "INTERNAL Margin Review",
          kind: "brand",
          visibility: "internal",
        }),
      })
    ).json()
  ).project;

  const clientList = await (await fetch(api, { headers: J(fx.clientCookie) })).json();
  check(
    "internal project hidden from client list",
    !clientList.projects.some((p) => p.id === internal.id),
    `client sees ${clientList.projects.length}`,
  );

  const directHit = await fetch(`${api}/${internal.id}`, { headers: J(fx.clientCookie) });
  check("internal project by direct id 404s for client", directHit.status === 404, `${directHit.status}`);

  const listPage = await pageSource(`/portal/${fx.slug}/projects`, fx.clientCookie);
  check("internal project name absent from client HTML", !listPage.html.includes("INTERNAL Margin Review"));
  check("client still sees their own project", listPage.html.includes("Brand Identity System"));
}

/* ── gating: agency controls must never reach a client ───────────── */
if (run("gating")) {
  console.log("\n── gating (absence from source) ──");
  const fx = await setupWorkspace("Verify Gating");
  const api = `${BASE}/api/portal/${fx.slug}/projects`;

  const project = (
    await (
      await fetch(api, {
        method: "POST",
        headers: J(fx.agencyCookie),
        body: JSON.stringify({ name: "Gating Check", kind: "web" }),
      })
    ).json()
  ).project;

  const path = `/portal/${fx.slug}/projects/${project.id}`;
  const asClient = await pageSource(path, fx.clientCookie);
  const asAgency = await pageSource(path, fx.agencyCookie);

  const leaked = AGENCY_MARKERS.filter((m) => asClient.html.includes(m));
  const present = AGENCY_MARKERS.filter((m) => asAgency.html.includes(m));

  check("agency controls ABSENT from client page source", leaked.length === 0, `leaked:[${leaked}]`);
  check("agency controls present for agency", present.length > 0, `found:[${present}]`);
}

/* ── nav: sections a client has no use for are absent ────────────── */
if (run("nav")) {
  console.log("\n── adaptive nav ──");
  const fx = await setupWorkspace("Verify Nav");
  const api = `${BASE}/api/portal/${fx.slug}/projects`;

  // A brand-only engagement: Content is irrelevant to this client.
  await fetch(api, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ name: "Identity", kind: "brand" }),
  });

  const brandOnly = await pageSource(`/portal/${fx.slug}`, fx.clientCookie);
  check("Content tab absent for a brand-only client", !brandOnly.html.includes(">Content</span>"));
  check("core tabs still present", brandOnly.html.includes(">Projects</span>"));

  // Agency always sees everything — they set the engagement up.
  const asAgency = await pageSource(`/portal/${fx.slug}`, fx.agencyCookie);
  check("Content tab present for agency", asAgency.html.includes(">Content</span>"));

  // Add a content project and it becomes relevant to the client too.
  await fetch(api, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ name: "Social", kind: "content" }),
  });
  const withContent = await pageSource(`/portal/${fx.slug}`, fx.clientCookie);
  check("Content tab appears once a content project exists", withContent.html.includes(">Content</span>"));
}

/* ── assets: sign-upload validation, roles, confirm integrity ────── */
if (run("assets")) {
  console.log("\n── assets ──");
  const fx = await setupWorkspace("Verify Assets");
  const sign = `${BASE}/api/portal/${fx.slug}/assets/sign-upload`;

  const badMime = await fetch(sign, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ name: "virus.exe", mime: "application/x-msdownload", sizeBytes: 1000 }),
  });
  check("disallowed mime rejected", badMime.status === 400, `${badMime.status}`);

  const tooBig = await fetch(sign, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ name: "big.png", mime: "image/png", sizeBytes: 26 * 1024 * 1024 }),
  });
  check("oversize file rejected", tooBig.status === 400, `${tooBig.status}`);

  // A client (role client_owner) can upload their own material.
  const signed = await (
    await fetch(sign, {
      method: "POST",
      headers: J(fx.clientCookie),
      body: JSON.stringify({ name: "reference.png", mime: "image/png", sizeBytes: 50_000 }),
    })
  ).json();
  check("client can request an upload", Boolean(signed.uploadUrl), JSON.stringify(signed));

  // Confirm without ever PUTting bytes: the mocked-upload path under the
  // emulators trusts this (no Storage emulator is wired up), but a real
  // deployment's `objectExists` check is what this same call exercises there.
  const confirmed = await (
    await fetch(`${BASE}/api/portal/${fx.slug}/assets/${signed.assetId}/versions`, {
      method: "POST",
      headers: J(fx.clientCookie),
      body: JSON.stringify({
        version: signed.version,
        storagePath: signed.storagePath,
        name: "reference.png",
        mime: "image/png",
        sizeBytes: 50_000,
      }),
    })
  ).json();
  check("upload confirms into an asset", confirmed.asset?.id === signed.assetId, JSON.stringify(confirmed));

  const list = await (
    await fetch(`${BASE}/api/portal/${fx.slug}/assets`, { headers: J(fx.clientCookie) })
  ).json();
  check("asset appears in the list", list.assets.some((a) => a.id === signed.assetId));

  // Delete is agency-only.
  const clientDelete = await fetch(`${BASE}/api/portal/${fx.slug}/assets/${signed.assetId}`, {
    method: "DELETE",
    headers: J(fx.clientCookie),
  });
  check("client cannot delete a file", clientDelete.status === 403, `${clientDelete.status}`);

  const agencyDelete = await fetch(`${BASE}/api/portal/${fx.slug}/assets/${signed.assetId}`, {
    method: "DELETE",
    headers: J(fx.agencyCookie),
  });
  check("agency can delete a file", agencyDelete.status === 200, `${agencyDelete.status}`);

  const afterDelete = await fetch(`${BASE}/api/portal/${fx.slug}/assets/${signed.assetId}`, {
    headers: J(fx.agencyCookie),
  });
  check("deleted file 404s", afterDelete.status === 404, `${afterDelete.status}`);

  // Delete markup itself must never reach a client's page source.
  const uploaded2 = await (
    await fetch(sign, {
      method: "POST",
      headers: J(fx.agencyCookie),
      body: JSON.stringify({ name: "logo.png", mime: "image/png", sizeBytes: 20_000 }),
    })
  ).json();
  await fetch(`${BASE}/api/portal/${fx.slug}/assets/${uploaded2.assetId}/versions`, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({
      version: 1,
      storagePath: uploaded2.storagePath,
      name: "logo.png",
      mime: "image/png",
      sizeBytes: 20_000,
    }),
  });
  const gridAsClient = await pageSource(`/portal/${fx.slug}/assets/${uploaded2.assetId}`, fx.clientCookie);
  check(
    "delete control absent from client HTML",
    !gridAsClient.html.includes("aria-label=\"Delete logo.png\""),
  );
  const gridAsAgency = await pageSource(`/portal/${fx.slug}/assets/${uploaded2.assetId}`, fx.agencyCookie);
  check(
    "delete control present for agency",
    gridAsAgency.html.includes("Delete"),
  );
}

/* ── approvals: the "what needs me" queue ─────────────────────────── */
if (run("approvals")) {
  console.log("\n── approvals ──");
  const fx = await setupWorkspace("Verify Approvals");
  const api = `${BASE}/api/portal/${fx.slug}/approvals`;

  // Seed a milestone to approve.
  const projApi = `${BASE}/api/portal/${fx.slug}/projects`;
  const project = (
    await (
      await fetch(projApi, {
        method: "POST",
        headers: J(fx.agencyCookie),
        body: JSON.stringify({ name: "Brand Identity System", kind: "brand" }),
      })
    ).json()
  ).project;
  const milestone = (
    await (
      await fetch(`${projApi}/${project.id}/milestones`, {
        method: "POST",
        headers: J(fx.agencyCookie),
        body: JSON.stringify({ title: "Refinement round" }),
      })
    ).json()
  ).milestone;

  const clientCreate = await fetch(api, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ targetType: "milestone", targetId: milestone.id }),
  });
  check("client cannot request an approval", clientCreate.status === 403, `${clientCreate.status}`);

  const created = await fetch(api, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ targetType: "milestone", targetId: milestone.id }),
  });
  const approval = (await created.json()).approval;
  check("agency requests an approval", created.status === 201, `id=${approval?.id}`);

  // client_owner (the default fixture role, ≥ approver) sees the queue.
  const clientList = await (await fetch(api, { headers: J(fx.clientCookie) })).json();
  check(
    "the queue shows the pending approval",
    clientList.approvals?.some((a) => a.id === approval.id),
    `count=${clientList.approvals?.length}`,
  );

  // A collaborator (below approver) sees the queue but not the decide buttons.
  const collabEmail = `collab-${Date.now()}@example.com`;
  const collabToken = await createInvite(fx, collabEmail, "collaborator");
  const collabIdToken = await idTokenFor(collabEmail, "Collaborator Only");
  const collabSessionRes = await fetch(`${BASE}/api/portal/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: collabIdToken, inviteToken: collabToken }),
  });
  const collabCookie = `lv_portal_session=${cookieFrom(collabSessionRes, "lv_portal_session")}`;

  const collabList = await fetch(api, { headers: J(collabCookie) });
  check("collaborator can still read the queue", collabList.status === 200, `${collabList.status}`);

  const collabPage = await pageSource(`/portal/${fx.slug}/approvals`, collabCookie);
  const clientPage = await pageSource(`/portal/${fx.slug}/approvals`, fx.clientCookie);
  check(
    "decide buttons absent for a collaborator",
    !collabPage.html.includes("Request changes"),
  );
  check(
    "decide buttons present for client_owner (≥ approver)",
    clientPage.html.includes("Request changes"),
  );

  const agencyPage = await pageSource(`/portal/${fx.slug}/approvals`, fx.agencyCookie);
  check("Request approval control present for agency", agencyPage.html.includes("Request approval"));
  check(
    "Request approval control absent from client HTML",
    !clientPage.html.includes("Request approval"),
  );

  const collabDecide = await fetch(`${api}/${approval.id}`, {
    method: "PATCH",
    headers: J(collabCookie),
    body: JSON.stringify({ state: "approved" }),
  });
  check("collaborator cannot decide", collabDecide.status === 403, `${collabDecide.status}`);

  const noNote = await fetch(`${api}/${approval.id}`, {
    method: "PATCH",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ state: "changes_requested" }),
  });
  check("request changes without a note is rejected", noNote.status === 400, `${noNote.status}`);

  const decided = await fetch(`${api}/${approval.id}`, {
    method: "PATCH",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ state: "changes_requested", note: "Please tighten the leaf angle." }),
  });
  const decidedBody = await decided.json();
  check(
    "request changes with a note is recorded",
    decided.status === 200 && decidedBody.approval?.decidedBy && decidedBody.approval?.decidedAt,
    JSON.stringify(decidedBody),
  );

  const redecide = await fetch(`${api}/${approval.id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ state: "approved" }),
  });
  check("a decided approval cannot be re-decided", redecide.status === 409, `${redecide.status}`);

  // Overview's "awaiting you" slot wires to the same query.
  const secondMilestone = (
    await (
      await fetch(`${projApi}/${project.id}/milestones`, {
        method: "POST",
        headers: J(fx.agencyCookie),
        body: JSON.stringify({ title: "Handover" }),
      })
    ).json()
  ).milestone;
  await fetch(api, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ targetType: "milestone", targetId: secondMilestone.id }),
  });
  const overview = await pageSource(`/portal/${fx.slug}`, fx.clientCookie);
  check("Overview shows the pending approval under Awaiting you", overview.html.includes("Handover"));
}

/* ── calendar: read-only agenda + month grid ──────────────────────── */
if (run("calendar")) {
  console.log("\n── calendar ──");
  const fx = await setupWorkspace("Verify Calendar");
  const api = `${BASE}/api/portal/${fx.slug}/projects`;

  const dueAt = new Date(Date.now() + 5 * 86_400_000).toISOString();
  const project = (
    await (
      await fetch(api, {
        method: "POST",
        headers: J(fx.agencyCookie),
        body: JSON.stringify({ name: "Website Build", kind: "web", dueAt }),
      })
    ).json()
  ).project;

  const milestoneDueAt = new Date(Date.now() + 2 * 86_400_000).toISOString();
  await fetch(`${api}/${project.id}/milestones`, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ title: "QA pass", dueAt: milestoneDueAt }),
  });

  const page = await pageSource(`/portal/${fx.slug}/calendar`, fx.clientCookie);
  check("calendar shows a project's due date", page.html.includes("Website Build"));
  check("calendar shows a milestone's due date", page.html.includes("QA pass"));

  // Internal-visibility parity with Projects: hidden from a client's calendar.
  const internalDueAt = new Date(Date.now() + 3 * 86_400_000).toISOString();
  await fetch(api, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ name: "INTERNAL Margin Review", kind: "brand", visibility: "internal", dueAt: internalDueAt }),
  });
  const pageAfter = await pageSource(`/portal/${fx.slug}/calendar`, fx.clientCookie);
  check(
    "internal project's due date absent from client calendar",
    !pageAfter.html.includes("INTERNAL Margin Review"),
  );
}

/* ── messages: the portal ⇄ WhatsApp bridge ───────────────────────── */
if (run("messages")) {
  console.log("\n── messages ──");
  const fx = await setupWorkspace("Verify Messages");
  const api = `${BASE}/api/portal/${fx.slug}/messages`;

  const anonGet = await fetch(api);
  check("unauthenticated cannot read the thread", anonGet.status === 401, `${anonGet.status}`);

  // A client's message already lands where the studio reads it.
  const clientSend = await fetch(api, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ body: "Can we push the deadline a week?" }),
  });
  const clientMsg = (await clientSend.json()).message;
  check("client can send a message", clientSend.status === 201, `${clientSend.status}`);
  check(
    "client message is channel:portal, direction:in",
    clientMsg?.channel === "portal" && clientMsg?.direction === "in",
    JSON.stringify(clientMsg),
  );

  // No WhatsApp number connected yet — an agency reply also stays in the portal.
  const agencyReply = await fetch(api, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ body: "Sure, next Friday works." }),
  });
  const agencyMsg = (await agencyReply.json()).message;
  check(
    "agency reply stays portal-only with no WhatsApp number set",
    agencyMsg?.channel === "portal" && agencyMsg?.status === "sent",
    JSON.stringify(agencyMsg),
  );

  const thread = await (await fetch(api, { headers: J(fx.clientCookie) })).json();
  check("both messages appear in the thread", thread.messages.length === 2, `${thread.messages.length}`);

  // A viewer-role member can read the thread but not send into it.
  const viewerEmail = `viewer-${Date.now()}@example.com`;
  const viewerInviteToken = await createInvite(fx, viewerEmail, "viewer");
  const viewerIdToken = await idTokenFor(viewerEmail, "Viewer Only");
  const viewerSessionRes = await fetch(`${BASE}/api/portal/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: viewerIdToken, inviteToken: viewerInviteToken }),
  });
  const viewerCookie = `lv_portal_session=${cookieFrom(viewerSessionRes, "lv_portal_session")}`;

  const viewerSend = await fetch(api, { method: "POST", headers: J(viewerCookie), body: JSON.stringify({ body: "trying" }) });
  check("viewer role cannot send a message", viewerSend.status === 403, `${viewerSend.status}`);
  const viewerRead = await fetch(api, { headers: J(viewerCookie) });
  check("viewer role can still read the thread", viewerRead.status === 200, `${viewerRead.status}`);

  // A workspace with a WhatsApp number connected: an agency reply relays out.
  // Unique per run — the Firestore emulator persists across verify.mjs runs,
  // and a repeated number would let `findWorkspaceByWhatsappNumber`'s
  // `.limit(1)` match an earlier run's workspace instead of this one's.
  const waNumber = `1555${Date.now()}`.slice(0, 11);
  const waWs = (
    await (
      await fetch(`${BASE}/api/portal/workspaces`, {
        method: "POST",
        headers: J(fx.adminCookie),
        body: JSON.stringify({ name: "Verify WA Bridge", whatsappNumber: waNumber }),
      })
    ).json()
  ).workspace;
  const waApi = `${BASE}/api/portal/${waWs.slug}/messages`;

  const waReply = await fetch(waApi, {
    method: "POST",
    headers: J(fx.agencyCookie), // agency has implicit access to every workspace
    body: JSON.stringify({ body: "Files are on their way." }),
  });
  const waMsg = (await waReply.json()).message;
  check(
    "agency reply relays to WhatsApp when a number is connected",
    waMsg?.channel === "whatsapp" && waMsg?.direction === "out",
    JSON.stringify(waMsg),
  );
  check(
    "mock driver reports delivery",
    waMsg?.status === "sent" && waMsg?.waMessageId?.startsWith("mock-"),
    JSON.stringify(waMsg),
  );

  /* ── webhook: signature-verified inbound delivery ──────────────── */
  const secret = "dev-test-secret"; // matches .env.local's WHATSAPP_APP_SECRET
  const payload = JSON.stringify({
    entry: [
      { changes: [{ value: { messages: [{ from: waNumber, id: "wamid.verify-1", type: "text", text: { body: "Here's the updated logo" } }] } }] },
    ],
  });
  const goodSig = "sha256=" + createHmac("sha256", secret).update(payload).digest("hex");
  const webhookUrl = `${BASE}/api/webhooks/whatsapp`;

  const badSig = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hub-signature-256": "sha256=deadbeef" },
    body: payload,
  });
  check("webhook rejects a bad signature", badSig.status === 403, `${badSig.status}`);

  const accepted = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hub-signature-256": goodSig },
    body: payload,
  });
  check("webhook accepts a correctly signed payload", accepted.status === 200, `${accepted.status}`);

  const afterWebhook = await (await fetch(waApi, { headers: J(fx.agencyCookie) })).json();
  check(
    "inbound message lands in the right workspace's thread",
    afterWebhook.messages.some((m) => m.waMessageId === "wamid.verify-1" && m.direction === "in"),
    JSON.stringify(afterWebhook.messages.map((m) => m.waMessageId)),
  );

  const fxThread = await (await fetch(api, { headers: J(fx.agencyCookie) })).json();
  check(
    "it does not leak into a different workspace's thread",
    !fxThread.messages.some((m) => m.waMessageId === "wamid.verify-1"),
  );

  // Meta redelivers on anything but a fast 200 — must not duplicate.
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hub-signature-256": goodSig },
    body: payload,
  });
  const afterRetry = await (await fetch(waApi, { headers: J(fx.agencyCookie) })).json();
  const dupes = afterRetry.messages.filter((m) => m.waMessageId === "wamid.verify-1").length;
  check("a redelivered webhook does not duplicate the message", dupes === 1, `${dupes}`);

  const verifyOk = await fetch(
    `${webhookUrl}?hub.mode=subscribe&hub.verify_token=dev-test-verify-token&hub.challenge=echo-me`,
  );
  check(
    "GET handshake echoes the challenge for the right token",
    verifyOk.status === 200 && (await verifyOk.text()) === "echo-me",
  );
  const verifyBad = await fetch(`${webhookUrl}?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=echo-me`);
  check("GET handshake rejects a wrong verify token", verifyBad.status === 403, `${verifyBad.status}`);
}

/* ── assistant: the read-only workspace agent ────────────────────── */
if (run("assistant")) {
  console.log("\n── assistant ──");
  const fx = await setupWorkspace("Verify Assistant");
  const api = `${BASE}/api/portal/${fx.slug}/assistant`;

  const anon = await fetch(api, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "What's the status?" }),
  });
  check("unauthenticated cannot reach the assistant", anon.status === 401, `${anon.status}`);

  const foreign = await fetch(`${BASE}/api/portal/nonexistent-workspace/assistant`, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ message: "hi" }),
  });
  check("unknown workspace 404s", foreign.status === 404, `${foreign.status}`);

  const empty = await fetch(api, { method: "POST", headers: J(fx.clientCookie), body: JSON.stringify({ message: "  " }) });
  check("an empty message is rejected", empty.status === 400, `${empty.status}`);

  // No GEMINI_API_KEY in this environment — proves the route degrades
  // honestly instead of crashing when the AI provider isn't configured.
  const noKey = await fetch(api, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ message: "What's the status of my project?" }),
  });
  const noKeyBody = await noKey.json().catch(() => ({}));
  check(
    "without an API key it fails honestly, not a 500 crash page",
    noKey.status === 500 && typeof noKeyBody.error === "string",
    JSON.stringify(noKeyBody),
  );
}

/* ── demo: the unauthenticated design preview ────────────────────── */
if (run("demo")) {
  console.log("\n── demo (design preview) ──");

  // No cookie at all: the preview must work before auth exists.
  const anonClient = await fetch(`${BASE}/portal/demo`);
  const anonHtml = await anonClient.text();
  check("demo opens with no session", anonClient.status === 200, `${anonClient.status}`);
  check("demo says it is sample data", anonHtml.includes("Design preview"));

  // The client/studio split is mirrored, so the preview can't teach the wrong
  // thing about what a client sees.
  const studio = await (await fetch(`${BASE}/portal/demo?view=studio`)).text();
  check(
    "internal project hidden in demo client view",
    !anonHtml.includes("Scope &amp; margin review") && !anonHtml.includes("Scope & margin review"),
  );
  check(
    "internal project shown in demo studio view",
    studio.includes("Scope &amp; margin review") || studio.includes("Scope & margin review"),
  );

  const internalDirect = await fetch(`${BASE}/portal/demo/projects/internal-margin`);
  check("demo internal project 404s in client view", internalDirect.status === 404, `${internalDirect.status}`);

  const demoMessages = await fetch(`${BASE}/portal/demo/messages`);
  check("demo messages page loads", demoMessages.status === 200, `${demoMessages.status}`);

  const demoAssistant = await fetch(`${BASE}/portal/demo/assistant`);
  check("demo assistant page loads", demoAssistant.status === 200, `${demoAssistant.status}`);

  const demoApprovals = await fetch(`${BASE}/portal/demo/approvals`);
  check("demo approvals page loads", demoApprovals.status === 200, `${demoApprovals.status}`);

  const demoCalendar = await fetch(`${BASE}/portal/demo/calendar`);
  check("demo calendar page loads", demoCalendar.status === 200, `${demoCalendar.status}`);
}

process.exit(summary() > 0 ? 1 : 0);
