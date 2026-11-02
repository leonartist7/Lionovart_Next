/**
 * Isolated invite redemption regression checks. The real TS implementation is
 * loaded with mocked Firebase Admin and Next boundaries, never live users.
 * Firestore's real optimistic transaction retry behavior is not tested here.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");
const root = path.resolve(__dirname, "../..");
const roles = ["viewer", "collaborator", "approver", "client_owner", "agency"];

function load(relative, mocks) {
  const filename = path.resolve(root, relative);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename, reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  assert.equal(output.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error).length ?? 0, 0, "Syntax: " + relative);
  const module = { exports: {} };
  vm.runInThisContext("(function(require,module,exports){\n" + output.outputText + "\n})", { filename })(
    name => {
      if (!Object.hasOwn(mocks, name)) throw new Error("Unexpected import " + name + " in " + relative);
      return mocks[name];
    }, module, module.exports,
  );
  return module.exports;
}

function fakeDb() {
  const records = { invites: new Map(), workspaces: new Map() };
  let queue = Promise.resolve();
  let reads = 0;
  let writes = 0;
  function ref(group, id) { return { group, id }; }
  function snap(target) {
    reads++;
    const row = records[target.group].get(target.id);
    return { id: target.id, exists: !!row, data: () => row ? structuredClone(row) : undefined };
  }
  return {
    records,
    stats: () => ({ reads, writes }),
    collection(group) {
      assert.ok(group === "invites" || group === "workspaces");
      return {
        doc(id) { return ref(group, id); },
        where(field, op, value) {
          assert.equal(group, "invites");
          assert.equal(field, "tokenHash");
          assert.equal(op, "==");
          return { limit(n) {
            assert.equal(n, 1);
            return { async get() {
              const found = [...records.invites].filter(([, row]) => row.tokenHash === value).slice(0, 1);
              return { empty: found.length === 0, docs: found.map(([id, data]) => ({
                id, data: () => structuredClone(data),
              })) };
            } };
          } };
        },
      };
    },
    async runTransaction(fn) {
      let release;
      const previous = queue;
      queue = new Promise(resolve => { release = resolve; });
      await previous;
      const staged = [];
      const tx = {
        get: async target => snap(target),
        update: (target, patch) => staged.push({ target, patch }),
      };
      try {
        const result = await fn(tx);
        for (const { target, patch } of staged) {
          const row = records[target.group].get(target.id);
          if (!row) throw new Error("Attempted to update a missing fixture");
          for (const [key, value] of Object.entries(patch)) {
            if (key.startsWith("members.")) {
              row.members = row.members || {};
              row.members[key.slice("members.".length)] = structuredClone(value);
            } else if (key === "memberUids" && value && value.arrayUnion) {
              row.memberUids = [...new Set([...(row.memberUids || []), value.arrayUnion])];
            } else row[key] = value;
          }
          writes++;
        }
        return result;
      } finally { release(); }
    },
  };
}
function fixture() {
  const db = fakeDb();
  const invites = load("src/lib/portal/invites.ts", {
    "server-only": {}, "node:crypto": crypto,
    "firebase-admin/firestore": { FieldValue: { arrayUnion: uid => ({ arrayUnion: uid }) } },
    "@/lib/firebase-admin": { adminDb: db },
    "@/lib/portal/types": {
      PORTAL_ROLES: roles, roleAtLeast: (a, b) => roles.indexOf(a) >= roles.indexOf(b),
    },
  });
  const token = "A".repeat(43);
  const base = {
    workspaceId: "alpha", workspaceName: "Alpha", email: "client@example.test",
    role: "viewer", tokenHash: invites.hashInviteToken(token),
    expiresAt: new Date(Date.now() + 86400000).toISOString(), createdBy: "staff",
    createdAt: new Date().toISOString(),
  };
  db.records.workspaces.set("alpha", { name: "Alpha", members: {}, memberUids: [] });
  db.records.invites.set("invite-1", { ...base });
  const redeem = (overrides = {}) => invites.redeemInviteAtomically({
    inviteId: "invite-1", token, uid: "user-1", email: "client@example.test", name: "Client",
    ...overrides,
  });
  return { db, invites, base, token, redeem };
}

test("valid invitation is redeemed exactly once and stored with the matching member UID", async () => {
  const h = fixture();
  assert.equal((await h.invites.findInviteByToken(h.token)).ok, true);
  assert.deepEqual(await h.redeem(), { ok: true });
  assert.deepEqual(await h.redeem(), { ok: false, reason: "already_accepted" });
  assert.equal(h.db.records.workspaces.get("alpha").members["user-1"].role, "viewer");
  assert.deepEqual(h.db.records.workspaces.get("alpha").memberUids, ["user-1"]);
  assert.equal(h.db.records.invites.get("invite-1").acceptedBy, "user-1");
  assert.equal(h.db.stats().writes, 2);
});

test("simultaneous attempts cannot both consume the same invitation in serializable transaction fixture", async () => {
  const h = fixture();
  const results = await Promise.all([h.redeem(), h.redeem()]);
  assert.equal(results.filter(x => x.ok).length, 1);
  assert.equal(results.filter(x => x.reason === "already_accepted").length, 1);
  assert.equal(h.db.stats().writes, 2);
});

test("invalid, expired and malformed-date tokens cannot create membership", async () => {
  for (const expiresAt of [new Date(Date.now() - 10000).toISOString(), "not-a-date"]) {
    const h = fixture();
    h.db.records.invites.get("invite-1").expiresAt = expiresAt;
    assert.deepEqual(await h.redeem(), { ok: false, reason: "expired" });
    assert.deepEqual(await h.invites.findInviteByToken(h.token), { ok: false, reason: "expired" });
    assert.equal(h.db.stats().writes, 0);
  }
});

test("wrong email, wrong token and missing workspace fail closed", async () => {
  const h = fixture();
  assert.deepEqual(await h.redeem({ email: "other@example.test" }), { ok: false, reason: "email_mismatch" });
  assert.deepEqual(await h.redeem({ token: "B".repeat(43) }), { ok: false, reason: "not_found" });
  h.db.records.workspaces.delete("alpha");
  assert.deepEqual(await h.redeem(), { ok: false, reason: "not_found" });
  assert.equal(h.db.stats().writes, 0);
});

test("pre-lookup followed by another redemption cannot grant a replay", async () => {
  const h = fixture();
  const preview = await h.invites.findInviteByToken(h.token);
  assert.equal(preview.ok, true);
  assert.deepEqual(await h.redeem({ uid: "user-2" }), { ok: true });
  assert.deepEqual(await h.redeem({ uid: "user-1" }), { ok: false, reason: "already_accepted" });
  assert.equal(h.db.records.workspaces.get("alpha").members["user-1"], undefined);
});

test("a lower-privilege invite does not downgrade an existing workspace owner", async () => {
  const h = fixture();
  const existing = { role: "client_owner", email: "client@example.test", name: "Owner", addedAt: "2025-01-01T00:00:00.000Z" };
  h.db.records.workspaces.get("alpha").members["user-1"] = existing;
  h.db.records.workspaces.get("alpha").memberUids.push("user-1");
  assert.deepEqual(await h.redeem(), { ok: true });
  assert.deepEqual(h.db.records.workspaces.get("alpha").members["user-1"], existing);
});

test("an explicitly higher-role invite can upgrade an existing viewer", async () => {
  const h = fixture();
  h.db.records.invites.get("invite-1").role = "approver";
  h.db.records.workspaces.get("alpha").members["user-1"] = {
    role: "viewer", email: "client@example.test", name: "Client", addedAt: "2025-01-01T00:00:00.000Z",
  };
  assert.deepEqual(await h.redeem(), { ok: true });
  assert.equal(h.db.records.workspaces.get("alpha").members["user-1"].role, "approver");
});

test("invalid stored roles cannot grant agency access", async () => {
  for (const role of ["agency", "superadmin"]) {
    const h = fixture();
    h.db.records.invites.get("invite-1").role = role;
    assert.deepEqual(await h.redeem(), { ok: false, reason: "not_found" });
    assert.equal(h.db.stats().writes, 0);
  }
});

test("malformed or oversized bearer links are rejected before database lookup", async () => {
  const h = fixture();
  const before = h.db.stats().reads;
  assert.deepEqual(await h.invites.findInviteByToken("x".repeat(30000)), { ok: false, reason: "not_found" });
  assert.deepEqual(await h.redeem({ token: "short" }), { ok: false, reason: "not_found" });
  assert.equal(h.db.stats().reads, before);
});

test("session creation denies unverified email before inviting or issuing a cookie", async () => {
  const h = fixture();
  let lookups = 0;
  let cookies = 0;
  const ResponseMock = class {
    static json(body, opts = {}) {
      return { status: opts.status || 200, body, cookies: { set: () => { cookies++; } } };
    }
  };
  const session = load("src/app/api/portal/session/route.ts", {
    "next/server": { NextResponse: ResponseMock },
    "@/lib/firebase-admin": {
      adminDb: h.db,
      adminAuth: { verifyIdToken: async () => ({
        uid: "unverified-1", email: "client@example.test", email_verified: false,
      }), createSessionCookie: async () => { throw new Error("Must not make cookie"); } },
    },
    "@/lib/rate-limit": { rateLimitOk: () => true },
    "@/lib/admin-auth": { isAllowlistedEmail: () => false },
    "@/lib/portal-auth": { PORTAL_SESSION_COOKIE: "lv_portal_session", PORTAL_SESSION_TTL_MS: 10000 },
    "@/lib/portal/invites": {
      findInviteByToken: async () => { lookups++; return { ok: true }; },
      redeemInviteAtomically: async () => { throw new Error("Must not redeem"); },
      describeInviteError: () => "Invalid",
    },
  });
  const result = await session.POST({
    headers: { get: () => null },
    json: async () => ({ idToken: "mock", inviteToken: h.token }),
  });
  assert.equal(result.status, 403);
  assert.match(result.body.error, /verify/i);
  assert.equal(lookups, 0);
  assert.equal(cookies, 0);
});
