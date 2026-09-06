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
import {
  BASE,
  J,
  check,
  createInvite,
  idTokenFor,
  pageSource,
  setupWorkspace,
  summary,
} from "./harness.mjs";

/** Strings that must appear for agency and never for a client. */
const AGENCY_MARKERS = ["Add a milestone", "Add a project"];

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
}

process.exit(summary() > 0 ? 1 : 0);
