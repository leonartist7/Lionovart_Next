import { useCallback, useEffect, useRef, useState } from 'react';
import { works } from './work-data';
import { formatReview, parseReview, readReviewMode, reviewChoices, reviewNumber, reviewStorageKey,
  type ReviewDecision, type ReviewDecisions } from './work-review-data';

type ReviewState = { decisions: ReviewDecisions; unsaved: boolean };
function loadReview(): ReviewState {
  if (!readReviewMode()) return { decisions: {}, unsaved: false };
  try { return { decisions: parseReview(window.localStorage.getItem(reviewStorageKey)), unsaved: false }; }
  catch { return { decisions: {}, unsaved: true }; }
}
export function useWorkReview() {
  const [enabled, setEnabled] = useState(readReviewMode);
  const [state, setState] = useState<ReviewState>(loadReview);
  useEffect(() => {
    const pop = () => { const active = readReviewMode(); setEnabled(active); if (active) setState(loadReview()); };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  const toggle = useCallback((assetId: string, choice: ReviewDecision) => {
    if (!enabled) return;
    const next = { ...state.decisions };
    if (next[assetId] === choice) delete next[assetId]; else next[assetId] = choice;
    let unsaved = false;
    try { window.localStorage.setItem(reviewStorageKey, JSON.stringify({ version: 1, decisions: next })); }
    catch { unsaved = true; }
    setState({ decisions: next, unsaved });
  }, [enabled, state.decisions]);
  const exit = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('review');
    try { window.history.replaceState({}, '', url); } catch { /* Exit still works in restricted file previews. */ }
    setEnabled(false);
  }, []);
  return { enabled, decisions: state.decisions, unsaved: state.unsaved, toggle, exit };
}
export function ReviewCardControls({ assetId, name, decision, toggle }: {
  assetId: string; name: string; decision?: ReviewDecision;
  toggle: (assetId: string, choice: ReviewDecision) => void;
}) {
  const number = reviewNumber(assetId);
  return <div className="lv-review-card" data-review-number={number}>
    <div className="lv-review-card-heading"><strong><span>#{number}</span> {name}</strong>
      <span className="lv-review-decision" aria-live="polite">{reviewChoices.find(choice => choice.value === decision)?.label ?? 'Not reviewed'}</span></div>
    <div className="lv-review-choices" role="group" aria-label={'Review #' + number + ' — ' + name}>
      {reviewChoices.map(choice => <button key={choice.value} type="button" aria-pressed={decision === choice.value}
        aria-label={choice.label + ' #' + number + ' — ' + name} title={choice.description}
        onClick={() => toggle(assetId, choice.value)}>{choice.label}</button>)}
    </div>
  </div>;
}
export function ReviewToolbar({ decisions, unsaved, exit }: {
  decisions: ReviewDecisions; unsaved: boolean; exit: () => void;
}) {
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'manual'>('idle');
  const [fallbackText, setFallbackText] = useState('');
  const [copiedText, setCopiedText] = useState('');
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const reviewed = works.filter(work => decisions[work.assetId]).length;
  const text = formatReview(decisions);
  async function copy() {
    if (copyState === 'copying') return;
    const snapshot = text;
    setCopyState('copying');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(snapshot);
      if (mounted.current) { setFallbackText(''); setCopiedText(snapshot); setCopyState('copied'); }
    } catch { if (mounted.current) { setFallbackText(snapshot); setCopyState('manual'); } }
  }
  return <aside className="lv-review-toolbar" aria-label="Local gallery review">
    <div className="lv-review-toolbar-heading"><div><strong>Gallery review</strong>
      <span role="status" aria-live="polite">{reviewed} of {works.length} reviewed</span></div>
      <div className="lv-review-actions"><button type="button" onClick={() => void copy()} disabled={copyState === 'copying'}>Copy review</button>
        <button type="button" onClick={exit}>Exit review</button></div></div>
    <p>Tap a choice again to clear it. Nothing is removed yet.{!unsaved && ' Saved in this browser.'}</p>
    {unsaved && <p className="lv-review-notice" role="status">Browser saving is unavailable. Copy your review before leaving.</p>}
    <span className="lv-sr-only" role="status" aria-live="polite">{copyState === 'copied' && copiedText === text ? 'Review copied. Paste it into the chat.' : copyState === 'manual' ? 'Automatic copying is unavailable. Select and copy the review below.' : ''}</span>
    {copyState === 'copied' && copiedText === text && <p className="lv-review-feedback">Review copied. Paste it into this chat.</p>}
    {fallbackText && <div className="lv-review-copy-fallback"><label htmlFor="lv-review-copy-text">Select and copy your review</label>
      <textarea id="lv-review-copy-text" value={text} readOnly onFocus={event => event.currentTarget.select()} rows={8} />
      <button type="button" onClick={() => { setFallbackText(''); setCopyState('idle'); }}>Close copy text</button></div>}
  </aside>;
}
