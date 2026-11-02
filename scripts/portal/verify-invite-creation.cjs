/** Actual invitation handler + input helpers, with isolated auth/Firestore/mail boundaries. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "../..");
const roles = ["viewer", "collaborator", "approver", "client_owner", "agency"];
function load(relative, mocks = {}) {
  const filename = path.resolve(root, relative);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    fileName: filename, reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  });
  assert.equal(output.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error).length ?? 0, 0);
  const module = { exports: {} };
  vm.runInThisContext("(function(require,module,exports){\n" + output.outputText + "\n})", { filename })(name => {
    if (!Object.hasOwn(mocks, name)) throw new Error("Unexpected import: " + name);
    return mocks[name];
  }, module, module.exports);
  return module.exports;
}
const validation = load("src/lib/portal/invite-request.ts", { "@/lib/portal/types": { PORTAL_ROLES: roles } });
const resource = load("src/lib/portal/resource-links.ts");
const privacy = load("src/lib/portal/private-response.ts");
const valid = { workspaceId: "alpha", email: "fixture@example.test", role: "viewer" };
const envKeys = ["PORTAL_BASE", "VERCEL_URL", "VERCEL_ENV", "NODE_ENV"];
class NextResponseMock extends Response {
  static json(body, options) { return new NextResponseMock(JSON.stringify(body), options); }
}
function fixture(t, options = {}) {
  const old = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
  for (const key of envKeys) delete process.env[key];
  Object.assign(process.env, { NODE_ENV: "production", PORTAL_BASE: "https://portal.example.test" }, options.env);
  t.after(() => { for (const key of envKeys) {
    if (old[key] === undefined) delete process.env[key]; else process.env[key] = old[key];
  } });
  const counts = { reads: 0, writes: 0, sends: 0 };
  const calls = [];
  const db = { collection(group) {
    return {
      doc(id) { return { async get() {
        counts.reads++;
        assert.equal(group, "workspaces"); assert.equal(id, "alpha");
        if (options.readError) throw new Error("sensitive-backend-error");
        return { exists: !options.missing, data: () => ({ name: "Sample" }) };
      } }; },
      where(field, op, id) { return { async get() {
        counts.reads++;
        assert.equal(group, "invites"); assert.equal(field, "workspaceId"); assert.equal(op, "=="); assert.equal(id, "alpha");
        if (options.readError) throw new Error("sensitive-backend-error");
        return { docs: [{ id: "invite-fixture", data: () => ({ ...valid, tokenHash: "secret-hash" }) }] };
      } }; },
    };
  } };
  const route = load("src/app/api/portal/invites/route.ts", {
    "next/server": { NextResponse: NextResponseMock },
    "@/lib/firebase-admin": { adminDb: options.noDb ? null : db },
    "@/lib/admin-auth": { requireAdmin: async () => options.denied
      ? NextResponseMock.json({ error: "Unauthorized" }, { status: 401 }) : { email: "staff@example.test" } },
    "@/lib/portal/invites": { createInvite: async input => {
      counts.writes++; calls.push(input);
      if (options.writeError) throw new Error("sensitive-backend-error");
      return { invite: { id: "invite-fixture", ...input, tokenHash: "secret-hash", expiresAt: "2026-11-16T00:00:00.000Z" }, token: "fixture-token" };
    } },
    "@/lib/email": { sendPortalInviteEmail: async args => {
      counts.sends++; calls.push(args);
      if (options.sendThrows) throw new Error("sensitive-provider-error");
      return options.emailed === true;
    } },
    "@/lib/portal/resource-links": resource,
    "@/lib/portal/private-response": privacy,
    "@/lib/portal/invite-request": validation,
  });
  return { route, counts, calls };
}
function request(body = valid, headers = {}, raw = false, url = "https://preview.example.test/api/portal/invites") {
  const req = new Request(url, {
    method: "POST", headers: { origin: new URL(url).origin, "content-type": "application/json", ...headers },
    body: raw ? body : JSON.stringify(body),
  });
  req.nextUrl = new URL(req.url);
  return req;
}
function privateResponse(res) {
  assert.match(res.headers.get("cache-control"), /private, no-store/);
  assert.equal(res.headers.get("referrer-policy"), "no-referrer");
  assert.equal(res.headers.get("vary"), "Cookie");
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
}
function untouched(h) { assert.deepEqual(h.counts, { reads: 0, writes: 0, sends: 0 }); }

test("invite creation: authenticates before consuming a body or accessing storage", async t => {
  const h = fixture(t, { denied: true });
  const req = request("{", {}, true);
  const res = await h.route.POST(req);
  assert.equal(res.status, 401); assert.equal(req.bodyUsed, false); privateResponse(res); untouched(h);
});
test("invite creation: missing, cross-site and mismatched origins are rejected", async t => {
  const h = fixture(t);
  for (const headers of [{ origin: "https://other.example.test" }, { "sec-fetch-site": "cross-site" }, { origin: "null" }]) {
    const res = await h.route.POST(request(valid, headers));
    assert.equal(res.status, 403); privateResponse(res);
  }
  const req = request(); req.headers.delete("origin");
  assert.equal((await h.route.POST(req)).status, 403); untouched(h);
});
test("invite creation: malformed JSON, scalars, null and arrays are safe 400s", async t => {
  const h = fixture(t);
  for (const raw of ["{", "null", "[]", '"text"', "42", "true"]) {
    const res = await h.route.POST(request(raw, {}, true));
    assert.equal(res.status, 400); privateResponse(res);
  }
  untouched(h);
});
test("invite creation: wrong field types and invalid roles never reach Firestore", async t => {
  const h = fixture(t);
  for (const patch of [{ workspaceId: 42 }, { email: [] }, { email: {} }, { role: null }, { role: "agency" }, { role: "owner" }, { role: {} }]) {
    assert.equal((await h.route.POST(request({ ...valid, ...patch }))).status, 400);
  }
  untouched(h);
});
test("invite creation: document paths, reserved IDs and oversized UTF-8 IDs are rejected", async t => {
  const h = fixture(t);
  for (const workspaceId of ["", ".", "..", "alpha/nested/other", "__reserved__", "x\u0000y", "é".repeat(751)]) {
    assert.equal((await h.route.POST(request({ ...valid, workspaceId }))).status, 400);
  }
  untouched(h);
});
test("invite creation: malformed, control-bearing and overlength email values are rejected", async t => {
  const h = fixture(t);
  for (const email of ["bad", "a@b", "a b@example.test", "a@example.test\r\nBcc:x", "a".repeat(255) + "@example.test"]) {
    assert.equal((await h.route.POST(request({ ...valid, email }))).status, 400);
  }
  untouched(h);
});
test("invite creation: byte limit is enforced despite forged Content-Length", async t => {
  const h = fixture(t);
  const res = await h.route.POST(request({ ...valid, padding: "é".repeat(5000) }, { "content-length": "1" }));
  assert.equal(res.status, 400); untouched(h);
});
test("invite creation: non-JSON and invalid UTF-8 bodies are rejected", async t => {
  const h = fixture(t);
  assert.equal((await h.route.POST(request(valid, { "content-type": "text/plain" }))).status, 400);
  assert.equal((await h.route.POST(request(new Uint8Array([0xc3, 0x28]), {}, true))).status, 400);
  untouched(h);
});
test("invite creation: trusted origin ignores forged host and forwarded headers", async t => {
  const h = fixture(t);
  const res = await h.route.POST(request({ workspaceId: " alpha ", email: " Fixture@Example.Test ", createdBy: "attacker" }, {
    host: "evil.example.test", "x-forwarded-host": "evil.example.test", "x-forwarded-proto": "http",
  }, false, "https://untrusted-request.example.test/api/portal/invites"));
  assert.equal(res.status, 201); privateResponse(res);
  const body = await res.json();
  assert.equal(body.joinUrl, "https://portal.example.test/portal/join?token=fixture-token");
  assert.equal(body.invite.tokenHash, undefined);
  assert.equal(h.calls[0].createdBy, "staff@example.test");
  assert.equal(h.calls[0].email, valid.email); assert.equal(h.calls[0].role, "client_owner");
  assert.deepEqual(h.counts, { reads: 1, writes: 1, sends: 1 });
});
test("invite creation: a preview never inherits a production invitation origin", async t => {
  const h = fixture(t, { env: { VERCEL_ENV: "preview", VERCEL_URL: "fixture-preview.vercel.app" } });
  const body = await (await h.route.POST(request())).json();
  assert.equal(body.joinUrl, "https://fixture-preview.vercel.app/portal/join?token=fixture-token");
});
test("invite creation: missing trusted origin fails before issuing a token", async t => {
  const h = fixture(t, { env: { PORTAL_BASE: "" } });
  const res = await h.route.POST(request());
  assert.equal(res.status, 503); privateResponse(res); untouched(h);
});
test("invite creation: unconfigured preview cannot fall back to production PORTAL_BASE", async t => {
  const h = fixture(t, { env: { VERCEL_ENV: "preview" } });
  assert.equal((await h.route.POST(request())).status, 503); untouched(h);
});
test("invite origin: rejects credentials, path, query, fragment and insecure production URLs", () => {
  for (const base of ["https://u:p@example.test", "https://example.test/portal", "https://example.test?token=x", "https://example.test#fragment", "http://example.test", "http://localhost:3000", "not a URL"]) {
    assert.throws(() => validation.resolveInviteOrigin({ PORTAL_BASE: base, NODE_ENV: "production" }));
  }
  assert.equal(validation.resolveInviteOrigin({ PORTAL_BASE: "http://localhost:3000", NODE_ENV: "development" }), "http://localhost:3000");
  assert.equal(validation.resolveInviteOrigin({ VERCEL_URL: "fixture.vercel.app", NODE_ENV: "production" }), "https://fixture.vercel.app");
});
test("invite creation: missing database and workspace prevent writes and mail", async t => {
  const h = fixture(t, { missing: true });
  assert.equal((await h.route.POST(request())).status, 404);
  assert.deepEqual(h.counts, { reads: 1, writes: 0, sends: 0 });
});
test("invite creation: missing database returns private 503", async t => {
  const h = fixture(t, { noDb: true });
  const res = await h.route.POST(request()); assert.equal(res.status, 503); privateResponse(res); untouched(h);
});
test("invite creation: storage errors are redacted and do not send mail", async t => {
  const h = fixture(t, { writeError: true });
  const res = await h.route.POST(request()); assert.equal(res.status, 503); privateResponse(res);
  const body = await res.text(); assert.doesNotMatch(body, /sensitive|fixture-token/); assert.match(body, /history/);
  assert.equal(h.counts.sends, 0);
});
test("invite creation: rejected or thrown mail retains manual-copy fallback without retry", async t => {
  const h = fixture(t, { sendThrows: true });
  const res = await h.route.POST(request()); assert.equal(res.status, 201); privateResponse(res);
  const body = await res.json(); assert.equal(body.emailed, false); assert.ok(body.joinUrl); assert.equal(h.counts.sends, 1);
});
test("invite creation: accepted mail omits bearer link and token hash from response", async t => {
  const h = fixture(t, { emailed: true });
  const res = await h.route.POST(request()); assert.equal(res.status, 201); privateResponse(res);
  const body = await res.json(); assert.equal(body.emailed, true); assert.equal(body.joinUrl, undefined); assert.equal(body.invite.tokenHash, undefined);
});
test("invite history: retains agency gate and removes token hashes with private headers", async t => {
  const h = fixture(t);
  const res = await h.route.GET({ nextUrl: new URL("https://portal.example.test/api/portal/invites?workspaceId=alpha") });
  assert.equal(res.status, 200); privateResponse(res);
  assert.equal((await res.json()).invites[0].tokenHash, undefined);
  assert.equal(h.counts.writes, 0); assert.equal(h.counts.sends, 0);
});
test("invite history: unauthorized caller never queries Firestore", async t => {
  const h = fixture(t, { denied: true });
  const res = await h.route.GET({}); assert.equal(res.status, 401); privateResponse(res); untouched(h);
});
test("invite history: invalid workspace is rejected and backend errors are redacted", async t => {
  const h = fixture(t, { readError: true });
  const invalid = await h.route.GET({ nextUrl: new URL("https://portal.example.test/api/portal/invites?workspaceId=../bad") });
  assert.equal(invalid.status, 400); untouched(h);
  const res = await h.route.GET({ nextUrl: new URL("https://portal.example.test/api/portal/invites?workspaceId=alpha") });
  assert.equal(res.status, 503); privateResponse(res); assert.doesNotMatch(await res.text(), /sensitive/);
});

/** Execute only the actual fixture configuration statements, never their SDK imports or network code. */
function fixtureStatement(relative, name) {
  const filename = path.resolve(root, relative);
  const source = ts.createSourceFile(filename, fs.readFileSync(filename, "utf8"), ts.ScriptTarget.ES2022, true, ts.ScriptKind.JS);
  const statement = source.statements.find(s => ts.isVariableStatement(s)
    && s.declarationList.declarations.some(d => ts.isIdentifier(d.name) && d.name.text === name));
  assert.ok(statement, "Missing fixture configuration: " + name);
  return statement.getText(source).replace(/^export\s+/, "");
}
test("emulator harness: authenticated JSON writes carry the browser's same-origin header", () => {
  const J = vm.runInNewContext(fixtureStatement("scripts/portal-verify/harness.mjs", "J") + "\nJ;", {
    BASE: "http://localhost:3000", URL,
  });
  const headers = J("fixture-cookie");
  assert.equal(headers.Origin, "http://localhost:3000");
  assert.equal(headers.Cookie, "fixture-cookie");
  assert.equal(headers["Content-Type"], "application/json");
});
test("emulator runner: HTTPS invitation origin is isolated from the HTTP client and mail is disabled", () => {
  let captured;
  const parentEnv = { PORTAL_BASE: "http://localhost:3000", RESEND_API_KEY: "fake-must-not-escape", VERCEL_ENV: "preview", VERCEL_URL: "unrelated.example.test" };
  vm.runInNewContext(fixtureStatement("scripts/verify-integrated-runtime.mjs", "server"), {
    process: { execPath: "fixture-node", env: parentEnv },
    spawn: (executable, args, options) => { captured = { executable, args, options }; return {}; },
  });
  assert.equal(captured.executable, "fixture-node");
  assert.equal(captured.args[0], "server.js");
  assert.equal(captured.options.env.NODE_ENV, "production");
  assert.equal(validation.resolveInviteOrigin(captured.options.env), "https://portal-fixture.example.test");
  assert.equal(captured.options.env.RESEND_API_KEY, "");
  assert.equal(parentEnv.PORTAL_BASE, "http://localhost:3000");
  assert.equal(parentEnv.RESEND_API_KEY, "fake-must-not-escape");
});
