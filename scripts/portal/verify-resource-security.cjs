/**
 * Isolated authorization/storage integration harness. Runs the real portal auth,
 * resource handlers, validation and Firestore store against fake Auth/Firestore.
 * Does NOT prove deployed Firestore security rules, session cookies, or browsers.
 * Run: node scripts/portal/verify-resource-security.cjs
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const file = path.join(root, 'src/app/(app)/portal/(secure)/[workspace]/connections/resources/route.ts');
class NextResponse extends Response {
  static json(body, init) { return new NextResponse(JSON.stringify(body), { ...init, headers: { 'content-type': 'application/json', ...init?.headers } }); }
}
const ROLE_ORDER = ['viewer', 'collaborator', 'approver', 'client_owner', 'agency'];

class FakeFirestore {
  constructor() { this.workspaces = new Map(); this.docs = new Map(); this.audit = []; this.seq = 0; this.transactions = 0; this.serial = Promise.resolve(); }
  workspace(id, slug, members = {}) {
    this.workspaces.set(id, { id, name: id, slug, status: 'active', createdAt: '2026-11-01', members, memberUids: Object.keys(members) });
    return this;
  }
  collection(name) { return new CollectionRef(this, name); }
  async runTransaction(callback) {
    // Deterministic serializable fixture: concurrent writes cannot overwrite
    // one another. It models the atomic outcome, not emulator transaction retries.
    const result = this.serial.then(async () => {
      const pending = [];
      const tx = {
        get: async ref => ({ exists: this.docs.has(ref.path), data: () => structuredClone(this.docs.get(ref.path)) }),
        set: (ref, data) => pending.push({ path: ref.path, data: structuredClone(data) }),
      };
      this.transactions++;
      const value = await callback(tx);
      for (const write of pending) {
        this.docs.set(write.path, write.data);
        if (write.path.includes('/audit/')) this.audit.push({ path: write.path, ...write.data });
      }
      return value;
    });
    this.serial = result.catch(() => {});
    return result;
  }
  links(id) { return this.docs.get(`workspaces/${id}/connections/resources`)?.links ?? []; }
}
class CollectionRef {
  constructor(db, path) { this.db = db; this.path = path; }
  doc(id) { return new DocumentRef(this.db, `${this.path}/${id || `fake-${++this.db.seq}`}`); }
  where(field, op, value) {
    assert.equal(this.path, 'workspaces'); assert.equal(field, 'slug'); assert.equal(op, '==');
    return { limit: limit => ({ get: async () => {
      assert.equal(limit, 1);
      const matches = [...this.db.workspaces.values()].filter(w => w.slug === value).slice(0, limit);
      return { empty: matches.length === 0, docs: matches.map(w => ({ id: w.id, data: () => structuredClone(w) })) };
    } }) };
  }
}
class DocumentRef {
  constructor(db, path) { this.db = db; this.path = path; }
  collection(name) { return new CollectionRef(this.db, `${this.path}/${name}`); }
  async get() { return { exists: this.db.docs.has(this.path), data: () => structuredClone(this.db.docs.get(this.path)) }; }
}
function setup() {
  const db = new FakeFirestore()
    .workspace('alpha-id', 'alpha', { 'client-alpha': { role: 'viewer', email: 'a@example.test' } })
    .workspace('beta-id', 'beta', { 'client-beta': { role: 'collaborator', email: 'b@example.test' } });
  const checks = [];
  const auth = { async verifySessionCookie(token, checkRevoked) {
    checks.push([token, checkRevoked]);
    if (token === 'revoked' || token === 'expired') throw new Error('session invalid');
    if (token === 'client-alpha') return { uid: token, email: 'a@example.test' };
    if (token === 'client-beta') return { uid: token, email: 'b@example.test' };
    if (token === 'staff') return { uid: 'agency-staff', email: 'staff@lionovart.test' };
    throw new Error('unknown session');
  } };
  const mocks = {
    'server-only': {},
    'next/server': { NextRequest: Request, NextResponse },
    '@/lib/firebase-admin': { adminDb: db, adminAuth: auth },
    '@/lib/admin-auth': { isAllowlistedEmail: email => email === 'staff@lionovart.test' },
    '@/lib/portal/types': { roleAtLeast: (role, min) => ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(min) },
  };
  const cache = new Map();
  function load(rel) {
    const full = path.resolve(root, rel);
    if (cache.has(full)) return cache.get(full).exports;
    const source = fs.readFileSync(full, 'utf8');
    const transformed = ts.transpileModule(source, {
      fileName: full,
      reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    });
    assert.equal(transformed.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error).length ?? 0, 0, `Syntax: ${rel}`);
    const module = { exports: {} };
    cache.set(full, module);
    function localRequire(id) {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      if (id.startsWith('@/')) return load(`src/${id.slice(2)}.ts`);
      if (id.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(full), `${id}.ts`)));
      return require(id);
    }
    vm.runInThisContext(`(function(require,module,exports){${transformed.outputText}\n})`, { filename: full })(localRequire, module, module.exports);
    return module.exports;
  }
  return { db, checks, auth: load('src/lib/portal-auth.ts'), store: load('src/lib/portal/resource-links-store.ts'), route: load(path.relative(root, file)) };
}
const input = { label: 'Design handoff', url: 'https://www.figma.com/design/project-v1', visibility: 'internal' };
function request(token, slug, { method = 'POST', body = input, query = '', origin = 'https://portal.example' } = {}) {
  const req = new Request(`https://portal.example/portal/${slug}/connections/resources${query}`, {
    method, headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(body),
  });
  req.cookies = { get: name => name === 'lv_portal_session' && token ? { value: token } : undefined };
  return req;
}
function context(slug) { return { params: Promise.resolve({ workspace: slug }) }; }
function auditFor(db, id) { return db.audit.filter(item => item.path.startsWith(`workspaces/${id}/`)); }

test('revoked/expired/unknown sessions fail before any resource writes', async () => {
  const { route, db, checks } = setup();
  for (const token of [null, 'revoked', 'expired', 'unknown']) {
    const response = await route.POST(request(token, 'alpha'), context('alpha'));
    assert.equal(response.status, 401, `session ${token}`);
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.equal(db.transactions, 0);
  }
  assert.ok(checks.length >= 3);
  assert.ok(checks.every(([, revoked]) => revoked === true), 'every session verification checks revocation');
});

test('client roles cannot create/delete internal or shared resources by forging view', async () => {
  const { route, db } = setup();
  for (const token of ['client-alpha', 'client-beta']) {
    for (const slug of ['alpha', 'beta']) {
      for (const method of ['POST', 'DELETE']) {
        const result = await route[method](request(token, slug, { method, body: method === 'POST' ? { ...input, visibility: 'shared' } : { id: 'a'.repeat(64) }, query: '?view=studio' }), context(slug));
        assert.ok([403, 404].includes(result.status), `${token}/${slug} ${method} ${result.status}`);
      }
    }
  }
  assert.equal(db.transactions, 0);
  assert.equal(db.docs.size, 0);
});

test('authorized staff write resolves actual workspace by slug; requested IDs are ignored', async () => {
  const { route, db } = setup();
  const response = await route.POST(request('staff', 'alpha', { body: { ...input, workspaceId: 'beta-id', actorUid: 'client-beta' } }), context('alpha'));
  assert.equal(response.status, 201);
  assert.equal(db.links('alpha-id').length, 1);
  assert.deepEqual(db.links('beta-id'), []);
  assert.equal(db.links('alpha-id')[0].visibility, 'internal');
  assert.deepEqual(auditFor(db, 'alpha-id').map(x => [x.action, x.actorUid]), [['created', 'agency-staff']]);
  assert.deepEqual(auditFor(db, 'beta-id'), []);
  assert.equal(response.headers.get('vary'), 'Cookie');
});

test('a nonmember never learns whether another workspace slug exists', async () => {
  const { route, db } = setup();
  for (const slug of ['beta', 'does-not-exist']) {
    const result = await route.POST(request('client-alpha', slug), context(slug));
    assert.equal(result.status, 404);
    assert.equal((await result.json()).error, 'Not found');
  }
  assert.equal(db.transactions, 0);
});

test('internal links are excluded from client projection even after a shared write', async () => {
  const { route, db, store } = setup();
  const staff = 'staff';
  assert.equal((await route.POST(request(staff, 'alpha'), context('alpha'))).status, 201);
  assert.equal((await route.POST(request(staff, 'alpha', { body: { ...input, label: 'Approved preview', url: 'https://preview.vercel.app/demo', visibility: 'shared' } }), context('alpha'))).status, 201);
  assert.deepEqual((await store.listResourceLinks('alpha-id', false)).map(x => x.label), ['Approved preview']);
  assert.equal((await store.listResourceLinks('alpha-id', true)).length, 2);
  assert.deepEqual(await store.listResourceLinks('beta-id', false), []);
  assert.equal(db.audit.length, 2);
});

test('concurrent duplicate submissions create exactly one link and one audit', async () => {
  const { store, db } = setup();
  const validated = { ...input, provider: 'Figma' };
  const results = await Promise.allSettled([store.addResourceLink('alpha-id', 'agency-staff', validated), store.addResourceLink('alpha-id', 'agency-staff', validated)]);
  assert.deepEqual(results.map(r => r.status).sort(), ['fulfilled', 'rejected']);
  assert.equal(results.find(r => r.status === 'rejected').reason.constructor.name, 'ResourceLinkConflict');
  assert.equal(db.links('alpha-id').length, 1);
  assert.equal(auditFor(db, 'alpha-id').length, 1);
});

test('concurrent different resources preserve both updates and isolate workspaces', async () => {
  const { store, db } = setup();
  await Promise.all([
    store.addResourceLink('alpha-id', 'agency-staff', { ...input, provider: 'Figma' }),
    store.addResourceLink('alpha-id', 'agency-staff', { ...input, provider: 'Vercel', url: 'https://preview.vercel.app/portal' }),
    store.addResourceLink('beta-id', 'agency-staff', { ...input, provider: 'GitHub', url: 'https://github.com/example/repo' }),
  ]);
  assert.equal(db.links('alpha-id').length, 2);
  assert.equal(db.links('beta-id').length, 1);
  assert.equal(auditFor(db, 'alpha-id').length, 2);
  assert.equal(auditFor(db, 'beta-id').length, 1);
});

test('deletion writes audit atomically and cannot affect another workspace', async () => {
  const { route, db } = setup();
  const a = await route.POST(request('staff', 'alpha'), context('alpha'));
  const b = await route.POST(request('staff', 'beta'), context('beta'));
  const id = (await a.json()).link.id;
  assert.equal((await b.json()).link.id, id, 'same URL has same ID, workspace still isolates storage');
  assert.equal((await route.DELETE(request('staff', 'alpha', { method: 'DELETE', body: { id } }), context('alpha'))).status, 200);
  assert.equal(db.links('alpha-id').length, 0);
  assert.equal(db.links('beta-id').length, 1);
  assert.deepEqual(auditFor(db, 'alpha-id').map(x => x.action), ['created', 'removed']);
  assert.deepEqual(auditFor(db, 'beta-id').map(x => x.action), ['created']);
  const repeat = await route.DELETE(request('staff', 'alpha', { method: 'DELETE', body: { id } }), context('alpha'));
  assert.equal(repeat.status, 409);
  assert.equal(auditFor(db, 'alpha-id').length, 2, 'failed transaction must not append an audit');
});
