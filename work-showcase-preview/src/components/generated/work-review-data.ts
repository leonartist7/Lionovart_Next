import numbers from './work-review-ids.json';
import { works } from './work-data';

export type ReviewDecision = 'keep' | 'improve' | 'archive';
export type ReviewDecisions = Partial<Record<string, ReviewDecision>>;
export const reviewChoices: { value: ReviewDecision; label: string; description: string }[] = [
  { value: 'keep', label: 'Keep', description: 'Belongs in the public gallery.' },
  { value: 'improve', label: 'Improve preview', description: 'Keep the work; reconsider its presentation.' },
  { value: 'archive', label: 'Archive', description: 'Exclude later; preserve the asset.' },
];
export const reviewStorageKey = 'lionovart.work-review.v1';
const reviewNumbers: Record<string, number> = numbers;
const assetIds = new Set(works.map(work => work.assetId));
export const reviewNumber = (assetId: string) => String(reviewNumbers[assetId] ?? '—').padStart(2, '0');

export function isLocalReviewUrl(url: URL): boolean {
  return (url.protocol === 'file:' || (['http:', 'https:'].includes(url.protocol)
    && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))
    && url.searchParams.get('review') === '1';
}
export function readReviewMode(): boolean {
  return typeof window !== 'undefined' && isLocalReviewUrl(new URL(window.location.href));
}
export function parseReview(raw: string | null): ReviewDecisions {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1
      || !('decisions' in data) || !data.decisions || typeof data.decisions !== 'object' || Array.isArray(data.decisions)) return {};
    return Object.fromEntries(Object.entries(data.decisions).filter(([id, value]) =>
      assetIds.has(id) && reviewChoices.some(choice => choice.value === value))) as ReviewDecisions;
  } catch { return {}; }
}
export function formatReview(decisions: ReviewDecisions): string {
  const ordered = [...works].sort((a,b) => (reviewNumbers[a.assetId] ?? Infinity) - (reviewNumbers[b.assetId] ?? Infinity));
  const reviewed = ordered.filter(work => decisions[work.assetId]).length;
  const groups = [...reviewChoices.map(choice => ({ value: choice.value as ReviewDecision | undefined, label: choice.label })),
    { value: undefined, label: 'Not reviewed' }];
  return ['LIONOVART — Work gallery review', reviewed + ' of ' + works.length + ' reviewed',
    'Marks are recommendations only; no media has been removed.',
    ...groups.map(group => {
      const selected = ordered.filter(work => decisions[work.assetId] === group.value);
      return '\n' + group.label + '\n' + (selected.length ? selected.map(work =>
        '#' + reviewNumber(work.assetId) + ' — ' + work.name).join('\n') : 'None');
    })].join('\n');
}
