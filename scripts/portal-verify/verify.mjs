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
const AGENCY_MARKERS = [
  "Add a milestone",
  "Add a project",
  "Add a task",
  "Internal only",
  "Request approval",
  "New post",
  "Generate ideas",
  "Generate an image",
];

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

/* ── board: fractional-index reorder, agency-only mutation, visibility ── */
if (run("board")) {
  console.log("\n── board ──");
  const fx = await setupWorkspace("Verify Board");
  const projApi = `${BASE}/api/portal/${fx.slug}/projects`;

  const project = (
    await (
      await fetch(projApi, {
        method: "POST",
        headers: J(fx.agencyCookie),
        body: JSON.stringify({ name: "Board Check", kind: "web" }),
      })
    ).json()
  ).project;
  const api = `${projApi}/${project.id}/tasks`;

  const createdRes = await fetch(api, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ title: "Design system", column: "backlog" }),
  });
  const task = (await createdRes.json()).task;
  check("agency creates a task", createdRes.status === 201, `id=${task?.id}`);

  const clientCreate = await fetch(api, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ title: "Client attempt" }),
  });
  check("client cannot create a task", clientCreate.status === 403, `${clientCreate.status}`);

  const clientMove = await fetch(`${api}/${task.id}`, {
    method: "PATCH",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ column: "in_progress" }),
  });
  check("client PATCH on a task is 403", clientMove.status === 403, `${clientMove.status}`);

  // Internal tasks: absent from the client's list JSON and the client's
  // rendered board HTML — never confirmed-but-hidden.
  const internal = (
    await (
      await fetch(api, {
        method: "POST",
        headers: J(fx.agencyCookie),
        body: JSON.stringify({ title: "INTERNAL budget note", visibility: "internal" }),
      })
    ).json()
  ).task;

  const clientList = await (await fetch(api, { headers: J(fx.clientCookie) })).json();
  check(
    "internal task hidden from client list",
    !clientList.tasks.some((t) => t.id === internal.id),
    `client sees ${clientList.tasks.length}`,
  );

  const boardPath = `/portal/${fx.slug}/projects/${project.id}/board`;
  const clientBoard = await pageSource(boardPath, fx.clientCookie);
  const agencyBoard = await pageSource(boardPath, fx.agencyCookie);
  check("internal task absent from client board HTML", !clientBoard.html.includes("INTERNAL budget note"));
  check("internal task present on agency board HTML", agencyBoard.html.includes("INTERNAL budget note"));
  check("agency-only board controls absent from client HTML", !clientBoard.html.includes("Add a task"));
  check("agency-only board controls present for agency", agencyBoard.html.includes("Add a task"));

  // Order persists after reload: three tasks in one column, insert the third
  // between the first two, then re-fetch and confirm the sequence held.
  const seeded = [];
  for (const title of ["Card A", "Card B", "Card C"]) {
    const r = await fetch(api, {
      method: "POST",
      headers: J(fx.agencyCookie),
      body: JSON.stringify({ title, column: "review" }),
    });
    seeded.push((await r.json()).task);
  }
  const [cardA, cardB, cardC] = seeded;

  const moveRes = await fetch(`${api}/${cardC.id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ column: "review", prevTaskId: cardA.id, nextTaskId: cardB.id }),
  });
  check("move between two tasks succeeds", moveRes.status === 200, `${moveRes.status}`);

  const afterMove = await (await fetch(api, { headers: J(fx.agencyCookie) })).json();
  const reviewOrder = afterMove.tasks
    .filter((t) => t.column === "review")
    .sort((x, y) => x.order - y.order)
    .map((t) => t.title);
  check(
    "reorder persists after reload (A, C, B)",
    JSON.stringify(reviewOrder) === JSON.stringify(["Card A", "Card C", "Card B"]),
    reviewOrder.join(", "),
  );

  // "Keyboard reorder": there's no headless browser here, so this exercises
  // the exact PATCH contract KanbanBoard's ArrowUp/ArrowDown handler fires for
  // a single-slot move — the endpoint contract is what's under test, the
  // arrow key is just one caller of it.
  const keyboardMove = await fetch(`${api}/${cardB.id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ column: "review", prevTaskId: cardA.id, nextTaskId: cardC.id }),
  });
  check("keyboard-style single-slot move succeeds", keyboardMove.status === 200, `${keyboardMove.status}`);
  const afterKeyboard = await (await fetch(api, { headers: J(fx.agencyCookie) })).json();
  const orderAfterKeyboard = afterKeyboard.tasks
    .filter((t) => t.column === "review")
    .sort((x, y) => x.order - y.order)
    .map((t) => t.title);
  check(
    "keyboard-style move persists after reload (A, B, C)",
    JSON.stringify(orderAfterKeyboard) === JSON.stringify(["Card A", "Card B", "Card C"]),
    orderAfterKeyboard.join(", "),
  );

  // The hard part: repeated midpoint inserts between the same fixed pair
  // eventually collapse float precision — moveTask must detect that and
  // rebalance the column rather than silently producing duplicate orders.
  const edgeA = (
    await (
      await fetch(api, {
        method: "POST",
        headers: J(fx.agencyCookie),
        body: JSON.stringify({ title: "Edge A", column: "approved" }),
      })
    ).json()
  ).task;
  const edgeB = (
    await (
      await fetch(api, {
        method: "POST",
        headers: J(fx.agencyCookie),
        body: JSON.stringify({ title: "Edge B", column: "approved" }),
      })
    ).json()
  ).task;

  let left = edgeA;
  let right = edgeB;
  for (let i = 0; i < 60; i++) {
    const inserted = (
      await (
        await fetch(api, {
          method: "POST",
          headers: J(fx.agencyCookie),
          body: JSON.stringify({ title: `Insert ${i}`, column: "approved" }),
        })
      ).json()
    ).task;
    const moved = await fetch(`${api}/${inserted.id}`, {
      method: "PATCH",
      headers: J(fx.agencyCookie),
      body: JSON.stringify({ column: "approved", prevTaskId: left.id, nextTaskId: right.id }),
    });
    if (!moved.ok) break;
    right = inserted;
  }

  const approved = (await (await fetch(api, { headers: J(fx.agencyCookie) })).json()).tasks.filter(
    (t) => t.column === "approved",
  );
  const orders = approved.map((t) => t.order);
  check(
    "62 midpoint inserts between the same pair rebalance instead of colliding",
    approved.length === 62 && new Set(orders).size === orders.length,
    `${approved.length} tasks, ${new Set(orders).size} distinct orders`,
  );
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

/* ── assetgate: a file inherits its project's visibility ──────────── */
if (run("assetgate")) {
  console.log("\n── assetgate ──");
  const fx = await setupWorkspace("Verify Asset Gate");
  const ws = `${BASE}/api/portal/${fx.slug}`;
  const projects = `${ws}/projects`;

  const mkProject = async (name, visibility) =>
    (
      await (
        await fetch(projects, {
          method: "POST",
          headers: J(fx.agencyCookie),
          body: JSON.stringify({ name, kind: "brand", visibility }),
        })
      ).json()
    ).project;

  /** Signs + confirms a v1 upload; returns the confirm response so rejections are observable. */
  const upload = async (cookie, name, projectId) => {
    const signed = await (
      await fetch(`${ws}/assets/sign-upload`, {
        method: "POST",
        headers: J(cookie),
        body: JSON.stringify({ name, mime: "image/png", sizeBytes: 30_000 }),
      })
    ).json();
    const res = await fetch(`${ws}/assets/${signed.assetId}/versions`, {
      method: "POST",
      headers: J(cookie),
      body: JSON.stringify({
        version: signed.version,
        storagePath: signed.storagePath,
        name,
        mime: "image/png",
        sizeBytes: 30_000,
        ...(projectId ? { projectId } : {}),
      }),
    });
    return { id: signed.assetId, status: res.status, signed };
  };

  const internalProject = await mkProject("INTERNAL Margin Review", "internal");
  const clientProject = await mkProject("Brand Identity", "client");

  const secret = await upload(fx.agencyCookie, "INTERNAL-margins.png", internalProject.id);
  const shared = await upload(fx.agencyCookie, "shared-concept.png", clientProject.id);
  const loose = await upload(fx.clientCookie, "client-reference.png"); // no project

  /* list */
  const agencyList = (await (await fetch(`${ws}/assets`, { headers: J(fx.agencyCookie) })).json()).assets;
  const clientList = (await (await fetch(`${ws}/assets`, { headers: J(fx.clientCookie) })).json()).assets;
  check("agency sees every file", [secret, shared, loose].every((a) => agencyList.some((x) => x.id === a.id)));
  check(
    "internal project's file absent from the client's list API",
    !clientList.some((a) => a.id === secret.id),
    `client sees ${clientList.length} of ${agencyList.length}`,
  );
  check(
    "a client still sees client-project and project-less files",
    clientList.some((a) => a.id === shared.id) && clientList.some((a) => a.id === loose.id),
  );

  /* direct reads — 404, never 403 (a 403 confirms the file exists) */
  const direct = await fetch(`${ws}/assets/${secret.id}`, { headers: J(fx.clientCookie) });
  check("internal file by direct id 404s for a client", direct.status === 404, `${direct.status}`);
  const versions = await fetch(`${ws}/assets/${secret.id}/versions`, { headers: J(fx.clientCookie) });
  check("its version history 404s too (storage paths included)", versions.status === 404, `${versions.status}`);
  const okDirect = await fetch(`${ws}/assets/${shared.id}`, { headers: J(fx.clientCookie) });
  check("a visible file still opens for a client", okDirect.status === 200, `${okDirect.status}`);
  const agencyDirect = await fetch(`${ws}/assets/${secret.id}`, { headers: J(fx.agencyCookie) });
  check("agency can open the internal file", agencyDirect.status === 200, `${agencyDirect.status}`);

  /* pages: absence from source, not hidden */
  const clientGrid = await pageSource(`/portal/${fx.slug}/assets`, fx.clientCookie);
  check(
    "internal file's name ABSENT from the client's Files HTML",
    !clientGrid.html.includes("INTERNAL-margins.png") && !clientGrid.html.includes(secret.id),
  );
  const agencyGrid = await pageSource(`/portal/${fx.slug}/assets`, fx.agencyCookie);
  check("internal file's name present for agency", agencyGrid.html.includes("INTERNAL-margins.png"));
  const clientPage = await pageSource(`/portal/${fx.slug}/assets/${secret.id}`, fx.clientCookie);
  check("internal file's page 404s for a client", clientPage.status === 404, `${clientPage.status}`);

  /* writes: a file you can't see is a file you can't touch */
  const ghost = await fetch(`${ws}/assets/sign-upload`, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ assetId: "doesNotExist0123456789", name: "x.png", mime: "image/png", sizeBytes: 100 }),
  });
  const hidden = await fetch(`${ws}/assets/sign-upload`, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ assetId: secret.id, name: "x.png", mime: "image/png", sizeBytes: 100 }),
  });
  check(
    "adding a version to a hidden file is indistinguishable from a missing one",
    hidden.status === ghost.status && (await hidden.text()) === (await ghost.text()),
    `hidden=${hidden.status} missing=${ghost.status}`,
  );

  const v2 = await fetch(`${ws}/assets/${secret.id}/versions`, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({
      version: 2,
      storagePath: "portal/x/assets/y/v2/x.png",
      name: "x.png",
      mime: "image/png",
      sizeBytes: 100,
    }),
  });
  const after = (await (await fetch(`${ws}/assets/${secret.id}`, { headers: J(fx.agencyCookie) })).json()).asset;
  check(
    "a client cannot confirm a version onto a hidden file",
    v2.status >= 400 && after.currentVersion === 1,
    `status=${v2.status} currentVersion=${after.currentVersion}`,
  );

  const attach = await upload(fx.clientCookie, "sneaky.png", internalProject.id);
  check(
    "a client cannot attach an upload to a project they can't see",
    attach.status >= 400,
    `${attach.status}`,
  );
  const bogus = await upload(fx.agencyCookie, "orphan.png", "noSuchProject0123456789");
  check("a file can't be attached to a project that doesn't exist", bogus.status >= 400, `${bogus.status}`);

  /* approvals: the queue labels each request with the file's name */
  const req = await fetch(`${ws}/approvals`, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ targetType: "asset", targetId: secret.id, versionId: 1 }),
  });
  const approvalId = (await req.json()).approval?.id;
  const clientQueue = (await (await fetch(`${ws}/approvals`, { headers: J(fx.clientCookie) })).json()).approvals;
  check(
    "an approval on an internal file is absent from the client's queue",
    !clientQueue.some((a) => a.id === approvalId || a.targetLabel === "INTERNAL-margins.png"),
    JSON.stringify(clientQueue.map((a) => a.targetLabel)),
  );
  const agencyQueue = (await (await fetch(`${ws}/approvals`, { headers: J(fx.agencyCookie) })).json()).approvals;
  check("…and present for the studio", agencyQueue.some((a) => a.id === approvalId));

  /* fail closed: a file whose project is gone is hidden, not exposed */
  const doomed = await mkProject("Doomed", "client");
  const orphan = await upload(fx.agencyCookie, "orphaned.png", doomed.id);
  await fetch(`${projects}/${doomed.id}`, { method: "DELETE", headers: J(fx.agencyCookie) });
  const orphanList = (await (await fetch(`${ws}/assets`, { headers: J(fx.clientCookie) })).json()).assets;
  check(
    "a file whose project was deleted fails closed for a client",
    !orphanList.some((a) => a.id === orphan.id),
  );
}

/* ── collaboration: threads, pins, resolve, internal visibility ───── */
if (run("collaboration")) {
  console.log("\n── collaboration ──");
  const fx = await setupWorkspace("Verify Collaboration");
  const threads = `${BASE}/api/portal/${fx.slug}/threads`;
  const sign = `${BASE}/api/portal/${fx.slug}/assets/sign-upload`;

  /** Signs + confirms an upload, optionally attaching it to a project. */
  const uploadAs = async (cookie, name, projectId) => {
    const signed = await (
      await fetch(sign, {
        method: "POST",
        headers: J(cookie),
        body: JSON.stringify({ name, mime: "image/png", sizeBytes: 30_000 }),
      })
    ).json();
    await fetch(`${BASE}/api/portal/${fx.slug}/assets/${signed.assetId}/versions`, {
      method: "POST",
      headers: J(cookie),
      body: JSON.stringify({
        version: signed.version,
        storagePath: signed.storagePath,
        name,
        mime: "image/png",
        sizeBytes: 30_000,
        ...(projectId ? { projectId } : {}),
      }),
    });
    return signed.assetId;
  };

  const assetId = await uploadAs(fx.agencyCookie, "concept.png");

  // A client raising feedback is the whole point of the feature.
  const opened = await fetch(threads, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ targetType: "asset", targetId: assetId, body: "The spacing feels tight." }),
  });
  const clientThread = (await opened.json()).thread;
  check("client can open a thread", opened.status === 201, `${opened.status}`);
  check("the thread carries its first comment", clientThread?.comments?.length === 1);

  /* Pin coordinates: normalized against the rendered image box, and stored
     exactly as measured. Deliberately awkward floats — a server that rounded,
     clamped or re-derived them would land the pin somewhere else. */
  const PIN = { x: 0.1234567890123, y: 0.9876543210987 };
  const pinned = await fetch(threads, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({
      targetType: "asset",
      targetId: assetId,
      versionId: 1,
      pin: PIN,
      body: "This corner is the problem.",
    }),
  });
  const pinThread = (await pinned.json()).thread;
  check("client can drop a pin", pinned.status === 201, `${pinned.status}`);

  const reread = await (
    await fetch(`${threads}?targetType=asset&targetId=${assetId}`, { headers: J(fx.clientCookie) })
  ).json();
  const roundTripped = reread.threads.find((t) => t.id === pinThread.id);
  check(
    "pin coordinates survive a round trip unchanged",
    roundTripped?.pin?.x === PIN.x && roundTripped?.pin?.y === PIN.y,
    JSON.stringify(roundTripped?.pin),
  );
  check("a pin is tied to its version", roundTripped?.versionId === 1, `v${roundTripped?.versionId}`);

  // v2 does not inherit v1's pins: the same query at v2 finds none of them.
  const v2Pins = reread.threads.filter((t) => t.pin && t.versionId === 2);
  check("v2 does not inherit v1's pins", v2Pins.length === 0, `${v2Pins.length} carried over`);

  const offBox = await fetch(threads, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({
      targetType: "asset",
      targetId: assetId,
      versionId: 1,
      pin: { x: 640, y: 480 }, // viewport pixels, not normalized
      body: "wrong space",
    }),
  });
  check("a pin outside 0–1 is rejected", offBox.status === 400, `${offBox.status}`);

  const versionless = await fetch(threads, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({
      targetType: "asset",
      targetId: assetId,
      pin: { x: 0.5, y: 0.5 },
      body: "which version?",
    }),
  });
  check("a pin without a version is rejected", versionless.status === 400, `${versionless.status}`);

  /* Comments: anyone in the workspace may reply; nobody edits anyone else's. */
  const replied = await fetch(`${threads}/${clientThread.id}/comments`, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ body: "Opening it up by 8px in the next round." }),
  });
  const agencyComment = (await replied.json()).comment;
  check("agency can reply on a client's thread", replied.status === 201, `${replied.status}`);

  const emptyComment = await fetch(`${threads}/${clientThread.id}/comments`, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ body: "   " }),
  });
  check("an empty comment is rejected", emptyComment.status === 400, `${emptyComment.status}`);

  const stealDelete = await fetch(
    `${threads}/${clientThread.id}/comments/${agencyComment.id}`,
    { method: "DELETE", headers: J(fx.clientCookie) },
  );
  check(
    "client cannot delete another author's comment",
    stealDelete.status === 403,
    `${stealDelete.status}`,
  );

  const ownDelete = await fetch(
    `${threads}/${pinThread.id}/comments/${pinThread.comments[0].id}`,
    { method: "DELETE", headers: J(fx.clientCookie) },
  );
  check("client can delete their own comment", ownDelete.status === 200, `${ownDelete.status}`);
  check(
    "the thread goes with its last comment",
    (await ownDelete.json()).threadDeleted === true,
  );

  /* Resolve / unresolve — the author or the studio, and it toggles back. */
  const resolved = await fetch(`${threads}/${clientThread.id}`, {
    method: "PATCH",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ resolved: true }),
  });
  check("the author can resolve their thread", (await resolved.json()).thread?.status === "resolved");

  const reopened = await fetch(`${threads}/${clientThread.id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ resolved: false }),
  });
  const reopenedThread = (await reopened.json()).thread;
  check("agency can reopen it", reopenedThread?.status === "open", `${reopenedThread?.status}`);
  check("reopening clears the resolver", !reopenedThread?.resolvedBy);

  const agencyThread = (
    await (
      await fetch(threads, {
        method: "POST",
        headers: J(fx.agencyCookie),
        body: JSON.stringify({
          targetType: "asset",
          targetId: assetId,
          body: "Studio question for the client.",
        }),
      })
    ).json()
  ).thread;
  const strangerResolve = await fetch(`${threads}/${agencyThread.id}`, {
    method: "PATCH",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ resolved: true }),
  });
  check(
    "a client cannot close someone else's thread",
    strangerResolve.status === 403,
    `${strangerResolve.status}`,
  );

  /* The `since` cursor — the realtime path, polled, never a held stream.
     A quiet poll costs the caller nothing but still reports every live id, so
     a thread deleted on someone else's screen disappears from this one. */
  const settled = await (
    await fetch(`${threads}?targetType=asset&targetId=${assetId}`, { headers: J(fx.clientCookie) })
  ).json();
  const cursor = settled.cursor;

  const quiet = await (
    await fetch(
      `${threads}?targetType=asset&targetId=${assetId}&since=${encodeURIComponent(cursor)}`,
      { headers: J(fx.clientCookie) },
    )
  ).json();
  check(
    "a quiet poll returns no threads but every live id",
    quiet.threads.length === 0 && quiet.ids.length === settled.ids.length,
    `${quiet.threads.length} changed of ${quiet.ids.length}`,
  );

  await fetch(`${threads}/${agencyThread.id}/comments`, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ body: "Answering the studio." }),
  });
  const moved = await (
    await fetch(
      `${threads}?targetType=asset&targetId=${assetId}&since=${encodeURIComponent(cursor)}`,
      { headers: J(fx.clientCookie) },
    )
  ).json();
  check(
    "since= returns only the thread that changed",
    moved.threads.length === 1 && moved.threads[0].id === agencyThread.id,
    `${moved.threads.length} changed`,
  );
  check(
    "the cursor advances past the change it reported",
    moved.cursor > cursor,
    `${moved.cursor} > ${cursor}`,
  );

  /* Internal visibility: a thread on an internal project's asset is ABSENT
     for a client — not hidden, and a 404 rather than a 403 on write, so the
     portal never confirms the internal record exists. */
  const internalProject = (
    await (
      await fetch(`${BASE}/api/portal/${fx.slug}/projects`, {
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

  const internalAsset = await uploadAs(fx.agencyCookie, "margins.png", internalProject.id);
  const SECRET = "INTERNAL NOTE margin is under water";
  await fetch(threads, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ targetType: "asset", targetId: internalAsset, body: SECRET }),
  });

  const agencySees = await (
    await fetch(`${threads}?targetType=asset&targetId=${internalAsset}`, {
      headers: J(fx.agencyCookie),
    })
  ).json();
  check("agency sees the internal thread", agencySees.threads.length === 1, `${agencySees.threads.length}`);

  const clientSees = await (
    await fetch(`${threads}?targetType=asset&targetId=${internalAsset}`, {
      headers: J(fx.clientCookie),
    })
  ).json();
  check(
    "internal-asset thread hidden from the client API",
    clientSees.threads.length === 0 && clientSees.ids.length === 0,
    `${clientSees.threads.length}`,
  );

  const clientHtml = await pageSource(`/portal/${fx.slug}/assets/${internalAsset}`, fx.clientCookie);
  check("internal-asset thread ABSENT from client HTML", !clientHtml.html.includes(SECRET));

  const agencyHtml = await pageSource(`/portal/${fx.slug}/assets/${internalAsset}`, fx.agencyCookie);
  check("internal-asset thread present for agency", agencyHtml.html.includes(SECRET));

  const clientWrite = await fetch(threads, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ targetType: "asset", targetId: internalAsset, body: "poke" }),
  });
  check(
    "commenting on an internal asset 404s for a client (never 403)",
    clientWrite.status === 404,
    `${clientWrite.status}`,
  );

  // The client's own asset still carries its conversation into the page.
  const ownHtml = await pageSource(`/portal/${fx.slug}/assets/${assetId}`, fx.clientCookie);
  check("the client's own thread renders on their page", ownHtml.html.includes("The spacing feels tight."));

  const anon = await fetch(threads);
  check("unauthenticated cannot list threads", anon.status === 401, `${anon.status}`);

  /* Firestore does not cascade: deleting a file must take its conversation
     with it, or the threads outlive the thing they were about. */
  const doomed = await uploadAs(fx.agencyCookie, "doomed.png");
  await fetch(threads, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ targetType: "asset", targetId: doomed, body: "Note on a file about to go." }),
  });
  await fetch(`${BASE}/api/portal/${fx.slug}/assets/${doomed}`, {
    method: "DELETE",
    headers: J(fx.agencyCookie),
  });
  const orphans = await (
    await fetch(`${threads}?targetType=asset&targetId=${doomed}`, { headers: J(fx.agencyCookie) })
  ).json();
  check(
    "deleting a file takes its threads with it",
    orphans.threads.length === 0 && orphans.ids.length === 0,
    `${orphans.ids.length} orphaned`,
  );

  /* ── notifications: who gets told, and who must not be ──────────── */
  // The outbox (workspaces/{ws}/notifications) records every decision whether
  // or not mail went out, so this asserts on WHO WOULD BE TOLD — meaningful
  // even with no RESEND_API_KEY, where every send reports "unconfigured".
  const { initializeApp: initApp } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");
  const db = getFirestore(initApp({ projectId: "lionovart-dev" }, "verify-notify-" + Date.now()));
  const outbox = async () =>
    (await db.collection("workspaces").doc(fx.workspace.id).collection("notifications").get()).docs.map(
      (d) => d.data(),
    );
  const forAsset = async (id) => (await outbox()).filter((r) => r.targetId === id);
  const STUDIO = "leonartist.cs@gmail.com";
  const told = (r) => r.status === "sent" || r.status === "unconfigured";

  const post = (cookie, payload) =>
    fetch(threads, { method: "POST", headers: J(cookie), body: JSON.stringify(payload) });

  const noteAsset = await uploadAs(fx.agencyCookie, "notify.png");

  const first = await post(fx.clientCookie, {
    targetType: "asset",
    targetId: noteAsset,
    body: "First thought on the notify file.",
  });
  const firstThread = (await first.json()).thread;
  let rows = await forAsset(noteAsset);
  check(
    "a client's comment tells the studio",
    rows.some((r) => r.recipientEmail === STUDIO && told(r) && r.kind === "thread"),
    JSON.stringify(rows.map((r) => [r.recipientEmail, r.status])),
  );
  check(
    "the author is never told about their own comment",
    !rows.some((r) => r.recipientEmail === fx.clientEmail.toLowerCase()),
  );

  await post(fx.clientCookie, {
    targetType: "asset",
    targetId: noteAsset,
    body: "Second thought, seconds later.",
  });
  rows = await forAsset(noteAsset);
  const studioRows = rows.filter((r) => r.recipientEmail === STUDIO);
  check(
    "a burst is throttled to one email per person per file",
    studioRows.filter(told).length === 1 && studioRows.some((r) => r.status === "throttled"),
    JSON.stringify(studioRows.map((r) => r.status)),
  );

  const studioReply = await fetch(`${threads}/${firstThread.id}/comments`, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ body: "Noted — on it." }),
  });
  rows = await forAsset(noteAsset);
  check(
    "a studio reply tells the client",
    studioReply.status === 201 &&
      rows.some((r) => r.recipientEmail === fx.clientEmail.toLowerCase() && told(r) && r.kind === "reply"),
    JSON.stringify(rows.map((r) => [r.recipientEmail, r.kind, r.status])),
  );
  check(
    "the studio is not mailed its own reply",
    rows.filter((r) => r.recipientEmail === STUDIO && r.kind === "reply").length === 0,
  );

  // The point of the gate: an email is a way to leak an internal conversation
  // as surely as a page is. The positive control above proves the dispatcher
  // is alive in this very run, so an empty result here means "gated", not "broken".
  const internalNote = await uploadAs(fx.agencyCookie, "internal-notes.png", internalProject.id);
  for (let i = 0; i < 4; i++) {
    await post(fx.agencyCookie, {
      targetType: "asset",
      targetId: internalNote,
      body: `Internal margin note ${i + 1}`,
    });
  }
  rows = await forAsset(internalNote);
  check(
    "a studio comment on an internal file is never mailed to the client",
    rows.filter((r) => r.recipientEmail === fx.clientEmail.toLowerCase()).length === 0,
    `${rows.length} rows`,
  );

  /* ── open-comment count on the Files grid ───────────────────────── */
  // One tile's chip, read out of the raw HTML by slicing that asset's own <a>.
  const chipFor = (html, id) => {
    const at = html.indexOf(`/assets/${id}"`);
    if (at === -1) return 0;
    const tile = html.slice(at, html.indexOf("</a>", at));
    const m = tile.match(/>(\d+) open comments?</);
    return m ? Number(m[1]) : 0;
  };
  const filesAsAgency = (await pageSource(`/portal/${fx.slug}/assets`, fx.agencyCookie)).html;
  const filesAsClient = (await pageSource(`/portal/${fx.slug}/assets`, fx.clientCookie)).html;

  check(
    "the Files grid counts open comments on a tile",
    chipFor(filesAsAgency, noteAsset) === 2 && chipFor(filesAsClient, noteAsset) === 2,
    `agency=${chipFor(filesAsAgency, noteAsset)} client=${chipFor(filesAsClient, noteAsset)}`,
  );
  check(
    "an internal file's count is visible to the studio",
    chipFor(filesAsAgency, internalNote) === 4,
    `${chipFor(filesAsAgency, internalNote)}`,
  );
  check(
    "an internal file's count never reaches the client",
    chipFor(filesAsClient, internalNote) === 0,
    `${chipFor(filesAsClient, internalNote)}`,
  );

  await fetch(`${threads}/${firstThread.id}`, {
    method: "PATCH",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ resolved: true }),
  });
  const afterResolve = (await pageSource(`/portal/${fx.slug}/assets`, fx.clientCookie)).html;
  check(
    "resolving a thread lowers the count",
    chipFor(afterResolve, noteAsset) === 1,
    `${chipFor(afterResolve, noteAsset)}`,
  );

  // A pin on a superseded version is feedback on a design that was replaced:
  // the tile must only promise what the file page will actually show.
  const versioned = await uploadAs(fx.agencyCookie, "versioned.png");
  await post(fx.clientCookie, { targetType: "asset", targetId: versioned, body: "General note." });
  await post(fx.clientCookie, {
    targetType: "asset",
    targetId: versioned,
    versionId: 1,
    pin: { x: 0.3, y: 0.3 },
    body: "Pin on v1.",
  });
  const beforeV2 = (await pageSource(`/portal/${fx.slug}/assets`, fx.clientCookie)).html;
  const v2 = await (
    await fetch(sign, {
      method: "POST",
      headers: J(fx.agencyCookie),
      body: JSON.stringify({ assetId: versioned, name: "versioned.png", mime: "image/png", sizeBytes: 30_000 }),
    })
  ).json();
  await fetch(`${BASE}/api/portal/${fx.slug}/assets/${versioned}/versions`, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({
      version: v2.version,
      storagePath: v2.storagePath,
      name: "versioned.png",
      mime: "image/png",
      sizeBytes: 30_000,
    }),
  });
  const afterV2 = (await pageSource(`/portal/${fx.slug}/assets`, fx.clientCookie)).html;
  check(
    "a pin on a superseded version drops out of the count",
    chipFor(beforeV2, versioned) === 2 && chipFor(afterV2, versioned) === 1,
    `before=${chipFor(beforeV2, versioned)} after=${chipFor(afterV2, versioned)}`,
  );

  // The design preview renders the same components against fixtures.
  const preview = await fetch(`${BASE}/portal/demo/assets/logo-mark`);
  const previewHtml = await preview.text();
  check(
    "demo file page renders its pinned threads",
    preview.status === 200 && previewHtml.includes("The leaf still reads as a feather"),
    `${preview.status}`,
  );
}

/* ── content: composer, per-platform rules, approval reuse ───────── */
if (run("content")) {
  console.log("\n── content ──");
  const fx = await setupWorkspace("Verify Content");
  const api = `${BASE}/api/portal/${fx.slug}/content`;

  const clientCreate = await fetch(api, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ state: "draft", caption: "Client attempt", platforms: ["x"] }),
  });
  check("client cannot create a post", clientCreate.status === 403, `${clientCreate.status}`);

  // ── Per-platform validation is enforced server-side, not just in the form.
  const longCaption = "a".repeat(300);
  const overLength = (
    await (
      await fetch(api, {
        method: "POST",
        headers: J(fx.agencyCookie),
        body: JSON.stringify({ state: "draft", caption: longCaption, platforms: ["x"] }),
      })
    ).json()
  ).post;

  const overSubmit = await fetch(`${api}/${overLength.id}/submit`, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: "{}",
  });
  const overBody = await overSubmit.json();
  check(
    "an over-length caption is rejected before a client sees it",
    overSubmit.status === 422 &&
      overBody.validation?.issues?.some((i) => i.severity === "error" && i.platform === "x"),
    `${overSubmit.status} ${JSON.stringify(overBody.error ?? "")}`,
  );
  check(
    "a rejected submission leaves the post in draft",
    (await (await fetch(`${api}/${overLength.id}`, { headers: J(fx.agencyCookie) })).json()).post
      .state === "draft",
  );

  // Hashtags count toward the limit — a caption that fits alone can still fail.
  const tagged = (
    await (
      await fetch(api, {
        method: "POST",
        headers: J(fx.agencyCookie),
        body: JSON.stringify({
          state: "draft",
          caption: "b".repeat(275),
          hashtags: ["#StudioLife"],
          platforms: ["x"],
        }),
      })
    ).json()
  ).post;
  const taggedSubmit = await fetch(`${api}/${tagged.id}/submit`, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: "{}",
  });
  check(
    "hashtags count toward the character limit",
    taggedSubmit.status === 422,
    `${taggedSubmit.status}`,
  );

  // ── A real, valid post.
  const post = (
    await (
      await fetch(api, {
        method: "POST",
        headers: J(fx.agencyCookie),
        body: JSON.stringify({
          state: "draft",
          caption: "The new cups arrived.",
          hashtags: ["#Packaging"],
          platforms: ["linkedin"],
        }),
      })
    ).json()
  ).post;
  check("agency creates a draft", Boolean(post?.id), `id=${post?.id}`);

  // Drafts are studio-only: absent from the client's list, page and direct URL.
  const clientList = await (await fetch(api, { headers: J(fx.clientCookie) })).json();
  check(
    "a draft is absent from the client's pipeline",
    !clientList.posts?.some((p) => p.id === post.id),
    `count=${clientList.posts?.length}`,
  );
  const clientDirect = await fetch(`${api}/${post.id}`, { headers: J(fx.clientCookie) });
  check("a client hitting a draft's URL gets 404, not 403", clientDirect.status === 404, `${clientDirect.status}`);
  const clientPage = await pageSource(`/portal/${fx.slug}/content/${post.id}`, fx.clientCookie);
  check("a draft's page 404s for a client", clientPage.status === 404, `${clientPage.status}`);

  // ── The approval-owned edges cannot be taken from the content API at all.
  const directApprove = await fetch(`${api}/${post.id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ state: "approved" }),
  });
  check(
    "a post cannot be approved through the content API",
    directApprove.status === 409,
    `${directApprove.status}`,
  );

  const submit = await fetch(`${api}/${post.id}/submit`, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: "{}",
  });
  const submitBody = await submit.json();
  check("a valid draft goes to review", submit.status === 201 && submitBody.post.state === "in_review", `${submit.status}`);

  // The approval it created is a row in the real approvals collection, reached
  // through the existing queue — not a parallel one built for Content.
  const queue = await (
    await fetch(`${BASE}/api/portal/${fx.slug}/approvals`, { headers: J(fx.clientCookie) })
  ).json();
  const queued = queue.approvals?.filter((a) => a.targetType === "post" && a.targetId === post.id) ?? [];
  check(
    "submitting creates exactly one row in the real approvals queue",
    queued.length === 1 && queued[0].id === submitBody.approvalId,
    `rows=${queued.length}`,
  );
  check(
    "the queue row carries the post's caption, not a placeholder",
    queued[0]?.targetLabel === "The new cups arrived.",
    `${queued[0]?.targetLabel}`,
  );

  // A post in review can't be edited under the client who is deciding on it.
  const editInReview = await fetch(`${api}/${post.id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ caption: "Changed while they were looking at it" }),
  });
  check("a post in review can't be edited", editInReview.status === 409, `${editInReview.status}`);

  // ── The decision goes through the Approvals primitive, and moves the post.
  const decide = await fetch(`${BASE}/api/portal/${fx.slug}/approvals/${submitBody.approvalId}`, {
    method: "PATCH",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ state: "approved" }),
  });
  check("the client decides through Approvals", decide.status === 200, `${decide.status}`);
  const afterDecision = await (await fetch(`${api}/${post.id}`, { headers: J(fx.agencyCookie) })).json();
  check(
    "the approval decision moves the post to approved",
    afterDecision.post.state === "approved",
    `${afterDecision.post.state}`,
  );

  // ── Scheduling is agency-only and needs a real future time.
  const clientSchedule = await fetch(`${api}/${post.id}`, {
    method: "PATCH",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ state: "scheduled" }),
  });
  check("client cannot schedule a post", clientSchedule.status === 403, `${clientSchedule.status}`);

  const noDate = await fetch(`${api}/${post.id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ state: "scheduled" }),
  });
  check("scheduling without a date is rejected", noDate.status === 400, `${noDate.status}`);

  // Rescheduling an approved post is allowed; rewriting its caption is not.
  // The client approved what it says, not when it goes out.
  const editApproved = await fetch(`${api}/${post.id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ caption: "Rewritten after approval" }),
  });
  check("an approved post's caption can't be edited", editApproved.status === 409, `${editApproved.status}`);

  const setDate = await fetch(`${api}/${post.id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ scheduledFor: new Date(Date.now() + 3 * 86_400_000).toISOString() }),
  });
  check("an approved post can be given a date", setDate.status === 200, `${setDate.status}`);

  const pastDate = await fetch(`${api}/${post.id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ scheduledFor: new Date(Date.now() - 86_400_000).toISOString() }),
  });
  await pastDate.json().catch(() => ({}));
  const pastSchedule = await fetch(`${api}/${post.id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ state: "scheduled" }),
  });
  check("a time in the past can't be scheduled", pastSchedule.status === 400, `${pastSchedule.status}`);

  await fetch(`${api}/${post.id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ scheduledFor: new Date(Date.now() + 3 * 86_400_000).toISOString() }),
  });
  const scheduled = await fetch(`${api}/${post.id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ state: "scheduled" }),
  });
  check("agency schedules an approved post", scheduled.status === 200, `${scheduled.status}`);

  // ── Publishing: validated for real, confirmed explicitly, append-only.
  const publishApi = `${api}/${post.id}/publish`;
  const unconfirmed = await fetch(publishApi, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ platforms: ["linkedin"] }),
  });
  check("publishing without confirmation is rejected", unconfirmed.status === 400, `${unconfirmed.status}`);

  const clientPublish = await fetch(publishApi, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ confirmed: true, platforms: ["linkedin"] }),
  });
  check("client cannot mark a post as posted", clientPublish.status === 403, `${clientPublish.status}`);

  const published = await fetch(publishApi, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ confirmed: true, platforms: ["linkedin"], urls: { linkedin: "https://example.com/a" } }),
  });
  const publishedBody = await published.json();
  check(
    "agency records a post as published",
    published.status === 200 && publishedBody.post.state === "published",
    `${published.status} ${publishedBody.post?.state}`,
  );
  const firstRecord = publishedBody.post.publishResults.linkedin;

  const rePublish = await fetch(publishApi, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ confirmed: true, platforms: ["linkedin"], urls: { linkedin: "https://example.com/rewritten" } }),
  });
  const rePublished = (await rePublish.json()).post;
  check(
    "a recorded publish is never rewritten by a later one",
    rePublished.publishResults.linkedin.at === firstRecord.at &&
      rePublished.publishResults.linkedin.url === firstRecord.url,
    JSON.stringify(rePublished.publishResults.linkedin),
  );

  const editPublished = await fetch(`${api}/${post.id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ caption: "Rewriting history" }),
  });
  check("a published post can't be edited", editPublished.status === 409, `${editPublished.status}`);

  const movePublished = await fetch(`${api}/${post.id}`, {
    method: "PATCH",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ state: "draft" }),
  });
  check("a published post can't be moved back", movePublished.status === 409, `${movePublished.status}`);

  const deletePublished = await fetch(`${api}/${post.id}`, {
    method: "DELETE",
    headers: J(fx.agencyCookie),
  });
  check("a published post can't be deleted", deletePublished.status === 409, `${deletePublished.status}`);

  // ── Agency controls never reach a client's browser.
  const contentAsClient = await pageSource(`/portal/${fx.slug}/content`, fx.clientCookie);
  const contentAsAgency = await pageSource(`/portal/${fx.slug}/content`, fx.agencyCookie);
  const contentMarkers = ["New post", "Generate ideas", "Generate an image"];
  const leaked = contentMarkers.filter((m) => contentAsClient.html.includes(m));
  check("content authoring controls ABSENT from client page source", leaked.length === 0, `leaked:[${leaked}]`);
  check(
    "content authoring controls present for agency",
    contentMarkers.every((m) => contentAsAgency.html.includes(m)),
  );
  check(
    "a draft's caption never reaches the client's content page",
    !contentAsClient.html.includes("Where the beans come from"),
  );

  // ── The AI surfaces are agency-only and degrade honestly without a key.
  const clientIdeas = await fetch(`${api}/ai/ideas`, {
    method: "POST",
    headers: J(fx.clientCookie),
    body: JSON.stringify({ platforms: ["instagram"] }),
  });
  check("client cannot generate ideas", clientIdeas.status === 403, `${clientIdeas.status}`);

  const noKeyIdeas = await fetch(`${api}/ai/ideas`, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ platforms: ["instagram"] }),
  });
  const noKeyBody = await noKeyIdeas.json().catch(() => ({}));
  check(
    "without an API key idea generation fails honestly",
    noKeyIdeas.status === 503 && typeof noKeyBody.error === "string",
    JSON.stringify(noKeyBody),
  );

  const noSubject = await fetch(`${api}/ai/image`, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ template: "square" }),
  });
  check("image generation needs a subject", noSubject.status === 400, `${noSubject.status}`);

  const badTemplate = await fetch(`${api}/ai/image`, {
    method: "POST",
    headers: J(fx.agencyCookie),
    body: JSON.stringify({ subject: "proofs drying", template: "billboard" }),
  });
  check("an unknown image template is rejected", badTemplate.status === 400, `${badTemplate.status}`);

  // ── A scheduled post lands on the calendar it was promised to.
  const calendar = await pageSource(`/portal/${fx.slug}/calendar`, fx.agencyCookie);
  check("a scheduled post appears on the calendar", calendar.html.includes("The new cups arrived."));
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

  const demoContent = await fetch(`${BASE}/portal/demo/content`);
  const demoContentHtml = await demoContent.text();
  check("demo content page loads", demoContent.status === 200, `${demoContent.status}`);
  check(
    "demo client view has no drafts in the pipeline",
    !demoContentHtml.includes("Where the beans come from"),
  );
  const demoContentStudio = await (await fetch(`${BASE}/portal/demo/content?view=studio`)).text();
  check(
    "demo studio view shows drafts",
    demoContentStudio.includes("Where the beans come from"),
  );
  const demoDraftDirect = await fetch(`${BASE}/portal/demo/content/post-draft-origin`);
  check("demo draft 404s in client view", demoDraftDirect.status === 404, `${demoDraftDirect.status}`);
}


/* ── upload integrity and content/thread visibility across features ── */
if (run("integration")) {
  console.log("\n── integration ──");
  const fx = await setupWorkspace("Verify Integration");
  const api = `${BASE}/api/portal/${fx.slug}`;
  const request = (path, method, cookie, body) => fetch(api + path, {
    method, headers: J(cookie), ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const sign = async (name, assetId) => (await request("/assets/sign-upload", "POST", fx.agencyCookie,
    { name, assetId, mime: "image/png", sizeBytes: 1000 })).json();
  const confirm = (signed, cookie = fx.agencyCookie, extras = {}) =>
    request(`/assets/${signed.assetId}/versions`, "POST", cookie, {
      version: signed.version, storagePath: signed.storagePath,
      name: "original.png", mime: "image/png", sizeBytes: 1000, ...extras,
    });
  const first = await sign("original.png");
  const concurrent = await Promise.all([confirm(first), confirm(first)]);
  check("concurrent first confirmations create exactly one asset", concurrent.filter((r) => r.status === 201).length === 1);
  const original = await (await request(`/assets/${first.assetId}`, "GET", fx.agencyCookie)).json();
  const replay = await confirm(first, fx.clientCookie, { note: "overwrite attempt" });
  check("version one replay is rejected", replay.status === 400);
  const afterReplay = await (await request(`/assets/${first.assetId}`, "GET", fx.agencyCookie)).json();
  check("replay preserves asset and version history", JSON.stringify(original) === JSON.stringify(afterReplay));
  const second = await sign("original.png", first.assetId);
  const secondRace = await Promise.all([confirm(second), confirm(second)]);
  check("concurrent next versions append exactly once", secondRace.filter((r) => r.status === 201).length === 1);
  const history = await (await request(`/assets/${first.assetId}`, "GET", fx.agencyCookie)).json();
  check("history remains append-only and advances to version two", history.asset.currentVersion === 2 && history.versions.length === 2 && history.versions.find((v) => v.n === 1).createdAt === original.versions[0].createdAt);
  const skipped = await confirm({ ...second, version: 4, storagePath: second.storagePath.replace("/v2/", "/v4/") });
  check("skipping versions is rejected", skipped.status === 400);
  const project = (await (await request("/projects", "POST", fx.agencyCookie,
    { name: "INTERNAL Integration", kind: "brand", visibility: "internal" })).json()).project;
  const hidden = await sign("original.png");
  await confirm(hidden, fx.agencyCookie, { projectId: project.id });
  const hiddenBefore = await (await request(`/assets/${hidden.assetId}`, "GET", fx.agencyCookie)).json();
  const overwriteHidden = await confirm(hidden, fx.clientCookie);
  const hiddenAfter = await (await request(`/assets/${hidden.assetId}`, "GET", fx.agencyCookie)).json();
  check("version one cannot turn an internal file public", overwriteHidden.status === 400 && JSON.stringify(hiddenBefore) === JSON.stringify(hiddenAfter));
  const hiddenClient = await request(`/assets/${hidden.assetId}`, "GET", fx.clientCookie);
  check("internal file remains absent after overwrite attempt", hiddenClient.status === 404);

  const draft = (await (await request("/content", "POST", fx.agencyCookie,
    { state: "draft", caption: "Internal draft for integration.", platforms: ["linkedin"], assetIds: [hidden.assetId] })).json()).post;
  const studioThread = (await (await request("/threads", "POST", fx.agencyCookie,
    { targetType: "post", targetId: draft.id, body: "PRIVATE DRAFT THREAD" })).json()).thread;
  check("studio can discuss a draft", Boolean(studioThread?.id));
  const clientThread = await request(`/threads/${studioThread.id}`, "PATCH", fx.clientCookie, { resolved: true });
  check("draft thread is absent by direct client URL", clientThread.status === 404);
  const clientFeed = await (await request(`/threads?targetType=post&targetId=${draft.id}`, "GET", fx.clientCookie)).json();
  check("draft comments and ids are absent from client feed", !JSON.stringify(clientFeed).includes("PRIVATE DRAFT THREAD") && !JSON.stringify(clientFeed).includes(studioThread.id));
  const clientCreate = await request("/threads", "POST", fx.clientCookie,
    { targetType: "post", targetId: draft.id, body: "guessing a draft id" });
  check("client cannot create a thread against a draft", clientCreate.status === 404);
  const submitHidden = await request(`/content/${draft.id}/submit`, "POST", fx.agencyCookie, {});
  check("review refuses internal attachments", submitHidden.status === 422);
  await request(`/content/${draft.id}`, "PATCH", fx.agencyCookie, { assetIds: [] });
  const submitVisible = await request(`/content/${draft.id}/submit`, "POST", fx.agencyCookie, {});
  check("review accepts the corrected draft", submitVisible.status === 201);
  const reviewedThread = await (await request(`/threads?targetType=post&targetId=${draft.id}`, "GET", fx.clientCookie)).json();
  check("post thread becomes visible when the post enters review", reviewedThread.ids?.includes(studioThread.id));
}

process.exit(summary() > 0 ? 1 : 0);
