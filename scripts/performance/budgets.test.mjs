import test from 'node:test';
import assert from 'node:assert/strict';
import { assessSummary, budgets } from './budgets.mjs';
const fixture = () => ({ runs: [{ url: 'preview', runtimeError: null }], summaries: [{ url: 'preview', validRuns: 3, median: { ...budgets, lcpMs: 5100, tbtMs: 940, cls: .033 } }] });
test('budgets accept the recorded transfer ceilings', () => assert.deepEqual(assessSummary(fixture()), { failures: [], warnings: [] }));
test('early movie or oversized image/total transfer fails the delivery gate', () => {
  for (const key of Object.keys(budgets)) {
    const data = fixture(); data.summaries[0].median[key]++;
    assert.ok(assessSummary(data).failures.some(message => message.includes(key)));
  }
});
test('missing evidence, invalid byte counts and incomplete runs cannot pass', () => {
  assert.ok(assessSummary({}).failures.length);
  for (const value of [undefined, -1, null]) {
    const data = fixture(); data.summaries[0].median.imageTransferBytes = value;
    assert.ok(assessSummary(data).failures.length);
  }
  const data = fixture(); data.summaries[0].validRuns = 2;
  assert.ok(assessSummary(data).failures.length);
  data.summaries[0].validRuns = 3; data.runs[0].runtimeError = { code: 'FAILED_DOCUMENT_REQUEST' };
  assert.ok(assessSummary(data).failures.length);
});
test('host-sensitive timing regressions are reported as advisory', () => {
  const data = fixture(); data.summaries[0].median.lcpMs = 7000;
  assert.equal(assessSummary(data).failures.length, 0);
  assert.equal(assessSummary(data).warnings.length, 1);
});
