import { publishedWorks, approvedTagAssignments, type Work } from './work-data';
import { reviewNumber, isLocalPreviewUrl } from './work-review-data';
import { normalizeServiceTags, serviceTags, serviceTagLabel } from './work-services';
export type TagAssignment = { services: string[]; status: Work['status']; confirmed: boolean };
export type TagAssignments = Partial<Record<string, TagAssignment>>;
export const tagStorageKey = 'lionovart.work-tags.v1';
const knownIds = new Set(publishedWorks.map(work => work.assetId));
const allowedTags = new Set(serviceTags.map(tag => tag.value));
export function readTagMode(): boolean {
  if (typeof window === 'undefined') return false;
  const url = new URL(window.location.href);
  return isLocalPreviewUrl(url) && url.searchParams.get('review') === 'tags';
}
export function defaultTags(work: Work): TagAssignment {
  return { services: normalizeServiceTags(work.services), status: work.status, confirmed: Boolean(approvedTagAssignments[work.assetId]) };
}
export function parseTags(raw: string | null): TagAssignments {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1 ||
      !('assignments' in data) || !data.assignments || typeof data.assignments !== 'object' || Array.isArray(data.assignments)) return {};
    const valid: TagAssignments = {};
    for (const [id,value] of Object.entries(data.assignments)) {
      if (!knownIds.has(id) || !value || typeof value !== 'object' || !('services' in value) ||
        !Array.isArray(value.services) || !value.services.every((tag: unknown) => typeof tag === 'string' && allowedTags.has(tag)) ||
        !('status' in value) || (value.status !== 'client' && value.status !== 'concept') ||
        !('confirmed' in value) || typeof value.confirmed !== 'boolean') continue;
      valid[id] = { services: [...new Set(value.services)] as string[], status: value.status, confirmed: value.confirmed };
    }
    return valid;
  } catch { return {}; }
}
export function formatTagReview(assignments: TagAssignments): string {
  const ordered = [...publishedWorks].sort((a,b)=>Number(reviewNumber(a.assetId))-Number(reviewNumber(b.assetId)));
  const confirmed = ordered.filter(work=>(assignments[work.assetId] ?? defaultTags(work)).confirmed).length;
  const lines = (work: Work) => {
    const draft = assignments[work.assetId] ?? defaultTags(work);
    return '#' + reviewNumber(work.assetId) + ' — ' + work.name + '\nStatus: ' +
      (draft.status === 'concept' ? 'Concept' : 'Client work') + '\nTags: ' +
      (draft.services.map(serviceTagLabel).join(' · ') || 'None');
  };
  return ['LIONOVART — Work tag review', confirmed + ' of ' + publishedWorks.length + ' confirmed',
    'Current assignments with local review edits. New edits are not published automatically.',
    ...[true,false].map(complete => {
      const group = ordered.filter(work=>Boolean((assignments[work.assetId] ?? defaultTags(work)).confirmed) === complete);
      return '\n' + (complete ? 'Confirmed' : 'Not confirmed') + '\n' + (group.length ? group.map(lines).join('\n\n') : 'None');
    })].join('\n');
}
