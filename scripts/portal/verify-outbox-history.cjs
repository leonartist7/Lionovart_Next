/**
 * Workspace-scoped, read-only outbox projection and Studio-page access tests.
 * Uses fake Firestore and Auth boundaries: not deployed rules or E2E mail.
 * Run: node scripts/portal/verify-outbox-history.cjs
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "../..");

function load(relative, mocks) {
  const full = path.resolve(root, relative);
  const output = ts.transpileModule(fs.readFileSync(full, "utf8"), {
    fileName: full,
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  assert.equal(output.diagnostics?.filter(issue => issue.category === ts.DiagnosticCategory.Error).length ?? 0, 0, `Syntax: ${relative}`);
  const mod = { exports: {} };
  vm.runInThisContext(`(function(require, module, exports) {${output.outputText}\n})`, { filename: full })(
    id => { if (!Object.hasOwn(mocks, id)) throw new Error(`Unexpected import ${id} in ${relative}`); return mocks[id]; },
    mod, mod.exports,
  );
  return mod.exports;
}

function fakeDb(workspaces) {
  const queryLog = [];
  return {
    queryLog,
    collection(name) {
      assert.equal(name, "workspaces");
      return {
        doc(workspace) {
          return {
            collection(name) {
              assert.equal(name, "notifications");
              const records = workspaces[workspace] ?? [];
              return {
                doc(id) {
                  return { get: async () => {
                    const found = records.find(row => row.id === id);
                    return { id, exists: Boolean(found), data: () => found?.data };
                  } };
                },
                orderBy(field, order) {
                  assert.equal(field, "createdAt");
                  assert.equal(order, "desc");
                  let cursor;
                  let pageSize;
                  const query = {
                    startAfter(anchor) { cursor = anchor.id; return query; },
                    limit(value) { pageSize = value; return query; },
                    async get() {
                      queryLog.push({ workspace, cursor, pageSize });
                      const ordered = [...records].sort((a, b) => b.data.createdAt.localeCompare(a.data.createdAt) || b.id.localeCompare(a.id));
                      const start = cursor ? ordered.findIndex(row => row.id === cursor) + 1 : 0;
                      return { docs: ordered.slice(start, start + pageSize).map(row => ({ id: row.id, data: () => row.data })) };
                    },
                  };
                  return query;
                },
              };
            },
          };
        },
      };
    },
  };
}
const rows = Array.from({ length: 13 }, (_, index) => ({
  id: `a-${String(index).padStart(2, "0")}`,
  data: {
    status: index % 2 ? "sent" : "failed",
    recipientEmail: `user${index}@example.test`,
    subject: "SECRET subject never to render",
    error: "Authorization: Bearer SECRET",
    body: "SECRET body",
    kind: "reply",
    createdAt: new Date(Date.UTC(2026, 10, 2, 0, index)).toISOString(),
  },
}));
const db = fakeDb({ alpha: rows, beta: [{ id: "beta-only", data: {
  status: "sent", recipientEmail: "client@private.test", kind: "pin", createdAt: "2026-11-02T01:00:00.000Z",
} }] });
const history = load("src/lib/portal/outbox-history.ts", {
  "server-only": {},
  "@/lib/firebase-admin": { adminDb: db },
});

test("history page is bounded and uses a same-workspace snapshot cursor", async () => {
  const first = await history.listNotificationHistory("alpha");
  assert.equal(first.entries.length, 10);
  assert.equal(first.nextCursor, "a-03");
  const older = await history.listNotificationHistory("alpha", first.nextCursor);
  assert.equal(older.entries.length, 3);
  assert.equal(older.nextCursor, undefined);
  assert.equal(first.entries[0].createdAt, rows[12].data.createdAt);
  assert.equal(older.entries[0].createdAt, rows[2].data.createdAt);
  assert.deepEqual(db.queryLog.slice(0, 2).map(row => row.pageSize), [11, 11]);
});
test("outbox projection excludes raw emails, content, provider errors and subjects", async () => {
  const first = await history.listNotificationHistory("alpha");
  const text = JSON.stringify(first);
  assert.ok(!text.includes("SECRET"));
  assert.ok(!text.includes("user12@example.test"));
  assert.ok(text.includes("u***@example.test"));
  assert.equal(first.entries[0].activity, "File reply");
});
test("unknown status, invalid data and suspicious recipient never become a delivered claim", () => {
  const projected = history.projectDeliveryHistory({
    status: "delivered", kind: "<script>", recipientEmail: "user@example.test?token=SECRET",
    createdAt: "not a date", error: "SECRET",
  });
  assert.deepEqual(projected, { status: "unknown", activity: "File activity", recipient: "Recipient hidden", createdAt: null });
});
test("foreign-workspace and malformed cursors fail without a cross-workspace read", async () => {
  await assert.rejects(() => history.listNotificationHistory("alpha", "beta-only"), history.InvalidOutboxCursor);
  await assert.rejects(() => history.listNotificationHistory("alpha", "../beta"), history.InvalidOutboxCursor);
  const other = await history.listNotificationHistory("beta");
  assert.equal(other.entries.length, 1);
  assert.equal(other.entries[0].recipient, "c***@private.test");
});
test("empty outbox is a valid read-only result", async () => {
  const result = await history.listNotificationHistory("empty");
  assert.deepEqual(result, { entries: [] });
});

function pageHarness() {
  let token = "staff";
  let historyReads = 0;
  let activityReads = 0;
  let linkReads = 0;
  const fakeHistory = { entries: [{ recipient: "u***@example.test", activity: "File reply", status: "sent", createdAt: null }] };
  const mocks = {
    "next/headers": { cookies: async () => ({ get: () => ({ value: token }) }) },
    "next/navigation": { redirect: () => { throw new Error("redirect"); }, notFound: () => { throw new Error("notFound"); } },
    "react/jsx-runtime": { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    "@/components/portal/ConnectionsHub": { ConnectionsHub: () => null },
    "@/lib/portal-auth": {
      PORTAL_SESSION_COOKIE: "lv_portal_session",
      getPortalSession: async cookie => cookie === "expired" ? null : { uid: cookie },
      getWorkspaceAccessBySlug: async (session, slug) => slug === "alpha" ? {
        workspace: { id: "alpha", slug }, membership: { role: session.uid === "staff" ? "agency" : "viewer" },
      } : null,
    },
    "@/lib/firebase-admin": { adminStorage: undefined },
    "@/lib/portal/resource-links-store": { listResourceLinks: async () => { linkReads++; return []; } },
    "@/lib/portal/outbox-history": { listNotificationHistory: async () => { historyReads++; return fakeHistory; } },
    "@/lib/portal/visible-file-activity": { listVisibleFileActivity: async () => { activityReads++; return []; } },
  };
  const page = load("src/app/(app)/portal/(secure)/[workspace]/connections/page.tsx", mocks).default;
  const render = (slug = "alpha", outboxAfter) => page({
    params: Promise.resolve({ workspace: slug }), searchParams: Promise.resolve({ outboxAfter }),
  });
  return { render, setToken: value => { token = value; }, counts: () => ({ historyReads, linkReads, activityReads }), fakeHistory };
}
test("client page never loads Studio outbox even with a forged cursor", async () => {
  const h = pageHarness(); h.setToken("client");
  const rendered = await h.render("alpha", "a-01");
  assert.equal(rendered.props.canManage, false);
  assert.equal(rendered.props.history, undefined);
  assert.equal(h.counts().historyReads, 0);
  assert.equal(h.counts().activityReads, 1, "authorized client receives visibility-filtered activity");
});
test("Studio page reads only its authorized workspace history", async () => {
  const h = pageHarness();
  const rendered = await h.render("alpha", "a-01");
  assert.equal(rendered.props.canManage, true);
  assert.deepEqual(rendered.props.history, h.fakeHistory);
  assert.equal(h.counts().historyReads, 1);
});
test("expired session and unknown workspace never reach the outbox", async () => {
  const h = pageHarness(); h.setToken("expired");
  await assert.rejects(() => h.render(), /redirect/);
  h.setToken("staff");
  await assert.rejects(() => h.render("other"), /notFound/);
  assert.equal(h.counts().historyReads, 0);
  assert.equal(h.counts().activityReads, 0, "revoked session cannot query activity");
});

/* Recent client file-activity checks use mocked Firestore and an existing-asset
 * visibility decision. No real rules, browser, or customer data is exercised. */
function fileActivityHarness(rows, access = {}) {
  const queryLog = [];
  const assetReads = [];
  const fakeDb = { collection(name) {
    assert.equal(name, "workspaces");
    return { doc(workspace) { return { collection(child) {
      assert.equal(child, "threads");
      return { orderBy(field, direction) {
        assert.equal(field, "updatedAt");
        assert.equal(direction, "desc");
        return { limit(n) {
          assert.equal(n, 60);
          return { async get() {
            queryLog.push(workspace);
            return { docs: rows.slice(0, n).map(row => ({ id: row.id, data: () => row.data })) };
          } };
        } };
      } };
    } }; } };
  } };
  const activity = load("src/lib/portal/visible-file-activity.ts", {
    "server-only": {},
    "@/lib/firebase-admin": { adminDb: fakeDb },
    "@/lib/portal/assets": { getAsset: async (ws, id, role) => {
      assetReads.push([ws, id, role]);
      const name = access[`${ws}:${role}:${id}`];
      return name ? { id, name } : null;
    } },
  });
  return { activity, queryLog, assetReads };
}
const at = "2026-11-02T03:00:00.000Z";
function feedbackRow(id, targetId, extra = {}) {
  return { id, data: {
    targetType: "asset", targetId, status: "open", updatedAt: at,
    body: "Private comment body", authorUid: "secret-user",
    recipientEmail: "private@example.test", ...extra,
  } };
}
test("recent file activity reuses existing role-based asset visibility per workspace", async () => {
  const h = fileActivityHarness([
    feedbackRow("thread-public", "public"), feedbackRow("thread-internal", "internal"),
    feedbackRow("thread-deleted", "deleted"),
  ], { "alpha:viewer:public": "Approved artwork", "alpha:agency:public": "Approved artwork",
       "alpha:agency:internal": "Internal strategy" });
  const client = await h.activity.listVisibleFileActivity("alpha", "viewer");
  assert.deepEqual(client.map(x => x.assetName), ["Approved artwork"]);
  const studio = await h.activity.listVisibleFileActivity("alpha", "agency");
  assert.deepEqual(studio.map(x => x.assetName), ["Approved artwork", "Internal strategy"]);
  assert.deepEqual(await h.activity.listVisibleFileActivity("beta", "viewer"), []);
  assert.ok(h.queryLog.every(ws => ["alpha", "beta"].includes(ws)));
  assert.ok(h.assetReads.some(([ws, ,role]) => ws === "alpha" && role === "viewer"));
});
test("activity cards contain no authors, raw comments, recipient emails or provider data", async () => {
  const h = fileActivityHarness([feedbackRow("pin-one", "public", {
    status: "resolved", pin: { x: 0.5, y: 0.3 }, error: "SECRET token",
  })], { "alpha:viewer:public": "Preview.png" });
  const [item] = await h.activity.listVisibleFileActivity("alpha", "viewer");
  assert.deepEqual(item, {
    assetId: "public", threadId: "pin-one", assetName: "Preview.png",
    kind: "Pinned feedback", status: "resolved", updatedAt: at,
  });
  const json = JSON.stringify(item);
  for (const word of ["Private comment", "secret-user", "private@example.test", "SECRET"]) {
    assert.ok(!json.includes(word));
  }
});
test("activity skips non-file, malformed, deleted, or hidden discussions", async () => {
  const h = fileActivityHarness([
    feedbackRow("project-thread", "public", { targetType: "project" }),
    feedbackRow("bad-date", "public", { updatedAt: "invalid" }),
    feedbackRow("bad-status", "public", { status: "invalid" }),
    feedbackRow("bad/id", "public"), feedbackRow("good-thread", "public"),
    feedbackRow("gone-thread", "deleted"),
  ], { "alpha:viewer:public": "Public file" });
  assert.deepEqual((await h.activity.listVisibleFileActivity("alpha", "viewer")).map(x => x.threadId), ["good-thread"]);
  assert.equal(h.assetReads.length, 2);
});
test("activity limits the query window and returned records and caches asset permissions", async () => {
  const rows = Array.from({ length: 90 }, (_, n) => feedbackRow(`thread-${n}`, "public"));
  const h = fileActivityHarness(rows, { "alpha:viewer:public": "Public file" });
  const list = await h.activity.listVisibleFileActivity("alpha", "viewer");
  assert.equal(list.length, 8);
  assert.equal(h.queryLog.length, 1);
  assert.equal(h.assetReads.length, 1);
});
test("unavailable activity storage is an error, not a misleading empty inbox", async () => {
  const activity = load("src/lib/portal/visible-file-activity.ts", {
    "server-only": {},
    "@/lib/firebase-admin": { adminDb: null },
    "@/lib/portal/assets": { getAsset: async () => null },
  });
  await assert.rejects(() => activity.listVisibleFileActivity("alpha", "viewer"), /unavailable/);
});
