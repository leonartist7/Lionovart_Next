/** Run from the repository: node scripts/portal/verify-connections.cjs.
 * Pure logic and real route handlers with mocked auth/database boundaries.
 * This is not an emulator, browser, provider, or production-health test.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
function load(file, mocks = {}) {
  const full = path.resolve(root, file);
  const source = fs.readFileSync(full, 'utf8');
  const result = ts.transpileModule(source, { fileName: full, reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } });
  assert.equal(result.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error).length ?? 0, 0, `Syntax: ${file}`);
  const module = { exports: {} };
  const localRequire = id => {
    if (id in mocks) return mocks[id];
    if (id.startsWith('@/')) return load('src/' + id.slice(2) + '.ts', mocks);
    if (id.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(full), id + '.ts')), mocks);
    return require(id);
  };
  vm.runInThisContext(`(function(require,module,exports){${result.outputText}\n})`, { filename: full })(localRequire, module, module.exports);
  return module.exports;
}
const calendar = load('src/lib/portal/calendar-export.ts');
const resources = load('src/lib/portal/resource-links.ts');
const privateResponse = load('src/lib/portal/private-response.ts');
const generatedAt = new Date('2026-11-02T00:00:00Z');
const options = { workspaceId: 'ws-one', workspaceName: 'LIONOVART', generatedAt };
const item = { id: 'm1', kind: 'milestone', projectId: 'p1', date: '2026-12-31', title: 'Launch' };
const render = (items, overrides = {}) => calendar.renderCalendarExport(items, { ...options, ...overrides });
const unfold = text => text.replace(/\r\n /g, '');
const input = { label: 'Brand files', url: 'https://drive.google.com/drive/folders/abc', visibility: 'shared' };
const record = (visibility, id) => ({ ...resources.validateResourceLink({ ...input, visibility }), id, createdAt: generatedAt.toISOString() });

test('all-day deadlines retain dates and exclusive next-day ends across years', () => {
  const result = render([item]);
  assert.equal(result.exported, 1); assert.equal(result.skipped, 0);
  assert.match(result.content, /DTSTART;VALUE=DATE:20261231\r\nDTEND;VALUE=DATE:20270101/);
  assert.ok(result.content.endsWith('END:VCALENDAR\r\n'));
});
test('offset timestamps convert to UTC without invented durations', () => {
  const text = render([{ ...item, kind: 'post', date: '2026-11-02T09:15:00+01:00' }]).content;
  assert.match(text, /DTSTART:20261102T081500Z/); assert.doesNotMatch(text, /DTEND|DURATION/);
});
test('invalid, ambiguous, overflow and impossible dates are explicitly counted', () => {
  const dates = ['bad', '2026-02-30', '2026-11-02T09:00', '2026-11-02T24:00:00Z', '2026-11-02T10:60:00Z', '2026-11-02T10:00:60Z', '2026-11-02T10:00:00+99:00', '0000-01-01', '9999-12-31'];
  const result = render(dates.map((date, i) => ({ ...item, id: String(i), date })));
  assert.equal(result.exported, 0); assert.equal(result.skipped, dates.length);
});
test('leap-day validation and exclusive end are correct', () => {
  assert.equal(render([{ ...item, date: '2028-02-29' }]).exported, 1);
  assert.equal(render([{ ...item, date: '2027-02-29' }]).skipped, 1);
  assert.match(render([{ ...item, date: '2028-02-29' }]).content, /DTEND;VALUE=DATE:20280301/);
});
test('UTF-8 folding never splits characters or exceeds 75 octets', () => {
  const text = 'SUMMARY:' + 'été 🎨 東京 '.repeat(90);
  const folded = calendar.foldCalendarLine(text);
  for (const line of folded.split('\r\n')) assert.ok(Buffer.byteLength(line, 'utf8') <= 75);
  assert.equal(unfold(folded), text); assert.doesNotMatch(folded, /�/);
});
test('untrusted titles cannot inject calendar properties or attendees', () => {
  const text = render([{ ...item, title: 'Hello, world;\\\r\nATTENDEE:bad@example.com\u0000' }]).content;
  assert.doesNotMatch(text, /\r\nATTENDEE:/);
  assert.match(unfold(text), /Hello\\, world\\;/); assert.doesNotMatch(text, /\u0000/);
});
test('stable UIDs isolate workspaces and projects; duplicate events omitted', () => {
  const uid = text => unfold(text).match(/UID:([^\r]+)/)[1];
  assert.equal(uid(render([item]).content), uid(render([item], { generatedAt: new Date('2027-01-01') }).content));
  assert.notEqual(uid(render([item]).content), uid(render([item], { workspaceId: 'ws-two' }).content));
  assert.equal(render([item, item]).skipped, 1);
  assert.equal(render([item, { ...item, projectId: 'p2' }]).exported, 2);
});
test('empty export is valid and contains no invitations or alarms', () => {
  const result = render([]); assert.equal(result.exported, 0);
  assert.doesNotMatch(result.content, /BEGIN:VEVENT|METHOD:|ATTENDEE:|BEGIN:VALARM/);
});
test('supported provider URLs are classified without fetching them', () => {
  const cases = [['https://drive.google.com/file/d/a/view', 'Google Drive'], ['https://docs.google.com/document/d/a', 'Google Drive'], ['https://www.figma.com/design/abc?node-id=1-2', 'Figma'], ['https://team.notion.site/abc', 'Notion'], ['https://github.com/leonartist7/Lionovart_Next', 'GitHub'], ['https://preview.vercel.app/portal', 'Vercel']];
  for (const [url, provider] of cases) assert.equal(resources.validateResourceLink({ ...input, url }).provider, provider);
});
test('unsafe protocols, credentials, lookalike domains and token URLs are rejected', () => {
  const urls = ['javascript:alert(1)', 'http://github.com/a/b', 'https://user:pass@github.com/a', 'https://github.com.evil.test/a', 'https://github.com:8443/a', 'https://localhost/a', 'https://127.0.0.1/a', 'https://evilvercel.app/a', 'https://vercel.app.evil.test/a', 'https://github.com/a?access_token=secret', 'https://test.vercel.app/?x-vercel-protection-bypass=secret', 'https://test.vercel.app/?_vercel_share=secret', 'https://github.com/a#token=secret', 'https://github.com/a\r\n'];
  for (const url of urls) assert.throws(() => resources.validateResourceLink({ ...input, url }), undefined, url);
});
test('names and visibility are validated; supplied provider identity is ignored', () => {
  for (const override of [{ label: '' }, { label: 'x'.repeat(81) }, { label: 'hello\nworld' }, { visibility: 'public' }]) assert.throws(() => resources.validateResourceLink({ ...input, ...override }));
  assert.equal(resources.validateResourceLink({ ...input, provider: 'Fake' }).provider, 'Google Drive');
});
test('clients never receive internal or malformed resource records', () => {
  const records = [record('shared', 'a'), record('internal', 'b'), { ...record('shared', 'c'), visibility: 'unknown' }, { ...record('shared', 'd'), url: 'javascript:alert(1)' }];
  assert.deepEqual(resources.visibleResourceLinks(records, false).map(x => x.id), ['a']);
  assert.deepEqual(resources.visibleResourceLinks(records, true).map(x => x.id), ['a', 'b']);
  assert.deepEqual(resources.visibleResourceLinks(null, false), []);
});
function writeRequest(body = input, extra = {}) {
  return new Request('https://portal.example/portal/workspace/connections/resources?view=studio', {
    method: 'POST', headers: { origin: 'https://portal.example', 'content-type': 'application/json', ...extra }, body: JSON.stringify(body),
  });
}
test('writes require same origin and reject cross-site and missing-origin requests', () => {
  assert.equal(resources.isSameOriginWrite(writeRequest()), true);
  assert.equal(resources.isSameOriginWrite(writeRequest(input, { origin: 'https://evil.test' })), false);
  assert.equal(resources.isSameOriginWrite(writeRequest(input, { 'sec-fetch-site': 'cross-site' })), false);
  assert.equal(resources.isSameOriginWrite(new Request('https://portal.example')), false);
});
test('JSON bodies enforce real byte limits and media type', async () => {
  assert.deepEqual(await resources.readResourceBody(writeRequest()), input);
  await assert.rejects(resources.readResourceBody(writeRequest({ huge: 'x'.repeat(9000) })), /too large/);
  await assert.rejects(resources.readResourceBody(writeRequest(input, { 'content-type': 'text/plain' })), /JSON/);
  await assert.rejects(resources.readResourceBody(new Request('https://portal.example', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{bad' })), /invalid JSON/);
});
test('private responses are non-cacheable and do not send referrers', () => {
  const response = privateResponse.privatePortalResponse(Response.json({ error: 'No' }, { status: 401 }));
  assert.equal(response.status, 401); assert.match(response.headers.get('cache-control'), /private, no-store/);
  assert.equal(response.headers.get('vary'), 'Cookie'); assert.equal(response.headers.get('x-content-type-options'), 'nosniff'); assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
});
class NextResponse extends Response { static json(body, init) { return new NextResponse(JSON.stringify(body), init); } }
const calendarRoute = 'src/app/(app)/portal/(secure)/[workspace]/calendar/export/route.ts';
const resourceRoute = 'src/app/(app)/portal/(secure)/[workspace]/connections/resources/route.ts';
const context = { params: Promise.resolve({ workspace: 'client-slug' }) };
test('calendar route refuses unauthenticated export before any data read', async () => {
  let reads = 0;
  const route = load(calendarRoute, { 'next/server': { NextResponse }, '@/lib/portal-auth': { requireWorkspace: async () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }, '@/lib/portal/calendar': { listCalendarItems: async () => { reads++; return []; } } });
  const response = await route.GET(new Request('https://portal.example?view=studio'), context);
  assert.equal(response.status, 401); assert.equal(reads, 0); assert.match(response.headers.get('cache-control'), /no-store/);
});
test('calendar route uses verified workspace and role, ignoring a forged studio query', async () => {
  let actual;
  const route = load(calendarRoute, { 'next/server': { NextResponse }, '@/lib/portal-auth': { requireWorkspace: async (_req, slug) => { assert.equal(slug, 'client-slug'); return { workspace: { id: 'verified-id', name: 'Client' }, membership: { role: 'viewer' } }; } }, '@/lib/portal/calendar': { listCalendarItems: async (id, role) => { actual = [id, role]; return [item]; } } });
  const response = await route.GET(new Request('https://portal.example?view=studio&workspaceId=other'), context);
  assert.deepEqual(actual, ['verified-id', 'viewer']); assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/calendar/); assert.equal(response.headers.get('x-calendar-exported'), '1');
});
test('calendar data failures are safe 503 responses, not leaked errors', async () => {
  const route = load(calendarRoute, { 'next/server': { NextResponse }, '@/lib/portal-auth': { requireWorkspace: async () => { throw new Error('secret'); } }, '@/lib/portal/calendar': {} });
  const response = await route.GET(new Request('https://portal.example'), context);
  assert.equal(response.status, 503); assert.doesNotMatch(await response.text(), /secret/); assert.match(response.headers.get('cache-control'), /no-store/);
});
function resourceMocks(access) {
  const calls = [];
  class Conflict extends Error {}
  return { calls, mocks: { 'next/server': { NextResponse }, '@/lib/portal-auth': { requireWorkspace: async (_req, slug, minimum) => { calls.push(['guard', slug, minimum]); return access; } }, '@/lib/portal/resource-links-store': {
    ResourceLinkConflict: Conflict,
    addResourceLink: async (...args) => { calls.push(['add', ...args]); return { ...args[2], id: 'a'.repeat(64), createdAt: generatedAt.toISOString() }; },
    removeResourceLink: async (...args) => { calls.push(['remove', ...args]); },
  } } };
}
test('client cannot mutate resources even with a studio query parameter', async () => {
  const { calls, mocks } = resourceMocks(NextResponse.json({ error: 'Forbidden' }, { status: 403 }));
  const response = await load(resourceRoute, mocks).POST(writeRequest(), context);
  assert.equal(response.status, 403); assert.deepEqual(calls, [['guard', 'client-slug', 'agency']]);
});
test('cross-site resource write never reaches authentication or persistence', async () => {
  const { calls, mocks } = resourceMocks(null);
  const response = await load(resourceRoute, mocks).POST(writeRequest(input, { origin: 'https://evil.test' }), context);
  assert.equal(response.status, 403); assert.deepEqual(calls, []);
});
test('authorized creation uses verified identity; request cannot choose another workspace', async () => {
  const { calls, mocks } = resourceMocks({ workspace: { id: 'actual-workspace' }, session: { uid: 'actual-user' } });
  const response = await load(resourceRoute, mocks).POST(writeRequest({ ...input, workspaceId: 'other', actorUid: 'other' }), context);
  assert.equal(response.status, 201); assert.equal(calls[1][1], 'actual-workspace'); assert.equal(calls[1][2], 'actual-user');
  assert.equal(calls[1][3].provider, 'Google Drive'); assert.equal(calls[1][3].workspaceId, undefined);
});
test('invalid resources and delete IDs never reach persistence', async () => {
  for (const [method, body] of [['POST', { ...input, url: 'https://evil.test' }], ['DELETE', { id: '../../another-workspace' }]]) {
    const { calls, mocks } = resourceMocks({ workspace: { id: 'actual' }, session: { uid: 'user' } });
    const response = await load(resourceRoute, mocks)[method](writeRequest(body), context);
    assert.equal(response.status, 400); assert.equal(calls.length, 1);
  }
});
test('navigation preserves the five mobile tabs and adds a secondary Connections section', () => {
  const nav = load('src/lib/portal/nav.ts', { 'lucide-react': {} });
  assert.equal(nav.PORTAL_NAV.filter(item => item.primary).length, 5);
  assert.ok(nav.visibleNavIds([], false).includes('connections'));
  assert.ok(!nav.visibleNavIds([], false).includes('content'));
  assert.ok(nav.visibleNavIds([], true).includes('content'));
  assert.equal(nav.navHref('demo', 'connections'), '/portal/demo/connections');
});
test('public connections demo does not inspect server configuration or real data', () => {
  const source = fs.readFileSync(path.join(root, 'src/app/(app)/portal/demo/connections/page.tsx'), 'utf8');
  assert.doesNotMatch(source, /process\.env|firebase-admin|resource-links-store|listResourceLinks/);
  assert.match(source, /links=\{\[\]\}/);
});
