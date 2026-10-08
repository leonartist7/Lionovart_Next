import { useCallback, useEffect, useState } from 'react';
import { publishedWorks, type Work } from './work-data';
import { reviewNumber } from './work-review-data';
import { serviceTags } from './work-services';
import { ReviewSummary } from './WorkReview';
import { defaultTags, formatTagReview, parseTags, readTagMode, tagStorageKey,
  type TagAssignment, type TagAssignments } from './work-tag-review-data';

type State = { assignments: TagAssignments; unsaved: boolean };
function loadTags(): State {
  if (!readTagMode()) return { assignments: {}, unsaved: false };
  try { return { assignments: parseTags(window.localStorage.getItem(tagStorageKey)), unsaved: false }; }
  catch { return { assignments: {}, unsaved: true }; }
}
export function useWorkTagReview() {
  const [enabled, setEnabled] = useState(readTagMode);
  const [state, setState] = useState<State>(loadTags);
  useEffect(() => {
    const pop = () => { const active = readTagMode(); setEnabled(active); if (active) setState(loadTags()); };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  const change = useCallback((work: Work, next: Partial<TagAssignment>) => {
    if (!enabled) return;
    const current = state.assignments[work.assetId] ?? defaultTags(work);
    const assignments = { ...state.assignments, [work.assetId]: { ...current, ...next } };
    let unsaved = false;
    try { window.localStorage.setItem(tagStorageKey, JSON.stringify({ version: 1, assignments })); }
    catch { unsaved = true; }
    setState({ assignments, unsaved });
  }, [enabled, state.assignments]);
  const exit = useCallback(() => {
    const url = new URL(window.location.href); url.searchParams.delete('review');
    try { window.history.replaceState({}, '', url); } catch { /* Exit still works locally. */ }
    setEnabled(false);
  }, []);
  return { enabled, assignments: state.assignments, unsaved: state.unsaved, change, exit };
}
export function TagCardControls({ work, assignment, change }: {
  work: Work; assignment: TagAssignment; change: (work: Work, next: Partial<TagAssignment>) => void;
}) {
  const number = reviewNumber(work.assetId);
  return <div className="lv-review-card lv-tag-review-card" data-review-number={number}>
    <div className="lv-review-card-heading"><strong><span>#{number}</span> {work.name}</strong>
      <span className="lv-review-decision" aria-live="polite">{assignment.confirmed ? 'Confirmed' : 'Not confirmed'}</span></div>
    <div className="lv-tag-status">
      <label className="lv-tag-choice"><input type="checkbox" checked={assignment.status === 'concept'} aria-label={'Concept #' + number + ' — ' + work.name}
        onChange={event => change(work,{status:event.target.checked ? 'concept' : 'client',confirmed:false})} /><span>Concept</span></label>
      <span>{assignment.status === 'concept' ? 'Concept example' : 'Client work'}</span>
    </div>
    <div className="lv-tag-choices" role="group" aria-label={'Service tags #' + number + ' — ' + work.name}>
      {serviceTags.map(tag => <label key={tag.value} className="lv-tag-choice"><input type="checkbox"
        checked={assignment.services.includes(tag.value)} aria-label={tag.label + ' #' + number + ' — ' + work.name}
        onChange={event => change(work,{ services:event.target.checked ? [...assignment.services,tag.value] : assignment.services.filter(id=>id!==tag.value),confirmed:false })} /><span>{tag.label}</span></label>)}
    </div>
    <button className="lv-confirm-tags" type="button" aria-pressed={assignment.confirmed} aria-label={'Confirm tags #' + number + ' — ' + work.name}
      onClick={() => change(work,{confirmed:!assignment.confirmed})}>{assignment.confirmed ? 'Tags confirmed ✓' : 'Confirm tags'}</button>
  </div>;
}
export function TagReviewToolbar({ assignments, unsaved, exit }: {
  assignments: TagAssignments; unsaved: boolean; exit: () => void;
}) {
  const confirmed = publishedWorks.filter(work=>(assignments[work.assetId] ?? defaultTags(work)).confirmed).length;
  return <ReviewSummary title="Tag review" progress={confirmed + ' of ' + publishedWorks.length + ' confirmed'}
    text={formatTagReview(assignments)} unsaved={unsaved} exit={exit}>
    Select all relevant tags, then confirm. Concept describes status; the other tags describe the work. Public assignments stay unchanged until you send the review.
  </ReviewSummary>;
}
