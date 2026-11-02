/** Regression: retained client state must not survive workspace/access/snapshot changes. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'src/components/portal/ConnectionsHub.tsx'), 'utf8');
const panel = Symbol('ResourceLinksPanel');
const notificationPanel = Symbol('NotificationHistoryPanel');
const jsx = (type, props, key) => ({ type, props, key });
const mocks = {
  'react/jsx-runtime': { jsx, jsxs: jsx },
  'next/link': { default: 'a' },
  'lucide-react': new Proxy({}, { get: (_target, key) => String(key) }),
  './CalendarExportButton': { CalendarExportButton: Symbol('CalendarExportButton') },
  './ResourceLinksPanel': { ResourceLinksPanel: panel },
  './NotificationHistoryPanel': { NotificationHistoryPanel: notificationPanel },
};
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
} }).outputText;
const loaded = { exports: {} };
vm.runInThisContext(`(function(require,module,exports){${compiled}\n})`)(id => {
  if (!(id in mocks)) throw new Error(`Unexpected import: ${id}`);
  return mocks[id];
}, loaded, loaded.exports);
function findPanel(node) {
  if (!node || typeof node !== 'object') return undefined;
  if (node.type === panel) return node;
  const children = node.props?.children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = findPanel(child);
    if (found) return found;
  }
}
const link = { id: 'one', label: 'Design', provider: 'Figma', url: 'https://www.figma.com/design/a', visibility: 'internal', createdAt: '2026-11-02T00:00:00Z' };
function key(props = {}) {
  return findPanel(loaded.exports.ConnectionsHub({ workspaceSlug: 'a', canManage: true, links: [link], ...props })).key;
}
test('resource panel remounts when workspace or viewer authority changes', () => {
  assert.notEqual(key(), key({ workspaceSlug: 'b' }));
  assert.notEqual(key(), key({ canManage: false, links: [] }));
  assert.notEqual(key({ demoView: 'studio' }), key({ demoView: 'client', canManage: false, links: [] }));
});
test('server data changes replace stale local state; equivalent snapshots stay stable', () => {
  assert.equal(key(), key({ links: [{ ...link }] }));
  assert.notEqual(key(), key({ links: [] }));
  assert.notEqual(key(), key({ links: [{ ...link, visibility: 'shared' }] }));
  assert.notEqual(key(), key({ links: [{ ...link, label: 'Renamed design' }] }));
});

function includesComponent(node, target) {
  if (!node || typeof node !== 'object') return false;
  if (node.type === target) return true;
  const children = node.props?.children;
  return (Array.isArray(children) ? children : [children]).some(child => includesComponent(child, target));
}
test('Studio outbox diagnostics never render for client mode, even with injected data', () => {
  const extra = { history: { entries: [{ recipient: 'private', status: 'failed' }] } };
  assert.equal(includesComponent(loaded.exports.ConnectionsHub({
    workspaceSlug: 'alpha', links: [], canManage: false, ...extra,
  }), notificationPanel), false);
  assert.equal(includesComponent(loaded.exports.ConnectionsHub({
    workspaceSlug: 'alpha', links: [], canManage: true, ...extra,
  }), notificationPanel), true);
});
