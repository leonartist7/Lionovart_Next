import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'framer-motion';
import JellyRadio from './JellyRadio';
import StackLoader from '../ui/stack-loader';
import { works, publishedWorks } from './work-data';
import { ReviewCardControls, ReviewToolbar, useWorkReview } from './WorkReview';
import type { ReviewDecision } from './work-review-data';
import { TagCardControls, TagReviewToolbar, useWorkTagReview } from './WorkTagReview';
import { defaultTags, type TagAssignment } from './work-tag-review-data';
import { serviceOptions as services, serviceTagLabel, normalizeServiceTags } from './work-services';
import { industries, campaigns, styles, allWork, matchesWork, type WorkSelection } from './work-filters';
import { resultStories } from './results-data';
const portrait = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/458193568318758912/458193568318758913/97cd9378d892502216fde4a099a1cb6e884fb439d8e71511821ac3cff223343b.avif";
import './LIONOVARTWorkProspectJourney.css';
import './ResultsJourney.css';
import '../ui/gooey-glass/gooey-glass.css';
import './WorkReview.css';
const labelFor = serviceTagLabel;
const email = 'connect@lionovart.com';
// Saved file previews return to the canonical site; hosted Work pages use their own homepage.
const homepageUrl = typeof window !== 'undefined' && window.location.protocol === 'file:' ? 'https://lionovart.com/' : '/';
// Replace with the owner's public Google Calendar appointment link when supplied.
const bookingUrl: string | null = null;
const whatsapp = (message: string) => `https://wa.me/15878974772?text=${encodeURIComponent(message)}`;
type Work = typeof works[number];
type Selection = WorkSelection;
const selectionKey = (value: Selection) => [value.industry,value.style,value.campaign,value.service,value.limit].join('|');
function readSelection(): Selection {
  if (typeof window === 'undefined') return { ...allWork };
  const query = new URLSearchParams(window.location.search);
  const industry = query.get('industry') === 'consumer' ? 'fashion' : query.get('industry');
  return {
    industry: industries.some(i => i.value === industry) ? industry! : '',
    service: services.some(s => s.value === query.get('service')) ? query.get('service')! : '',
    campaign: campaigns.some(c => c.value === query.get('campaign')) ? query.get('campaign')! : '',
    style: styles.some(s => s.value === query.get('style')) ? query.get('style')! : '',
    limit: Math.max(12, Math.min(works.length + 12, Number(query.get('show')) || 12))
  };
}
function Arrow({
  diagonal = true
}: {
  diagonal?: boolean;
}) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="lv-arrow"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h16m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function Chips({
  items,
  value,
  change,
  title
}: {
  items: typeof industries;
  value: string;
  change: (v: string) => void;
  title: string;
}) {
  return <JellyRadio items={items} value={value} onChange={change} ariaLabel={title} chipColor="transparent" activeColor="#0D0D0D" textColor="#3d3730" activeTextColor="#FFFFFF" size="md" gap={12} radius={24} swell={0.025} barge={6} shrink={0.02} jelly={0.5} bounce={0.08} stagger={22} stiffness={380} wrap />;
}
function WorkCard({work,playbackEnabled,review,decision,toggleReview,tagAssignment,changeTags}: {work:Work;playbackEnabled:boolean;review:boolean;decision?:ReviewDecision;toggleReview:(assetId:string,choice:ReviewDecision)=>void;tagAssignment?:TagAssignment;changeTags:(work:Work,next:Partial<TagAssignment>)=>void}) {
  return <article className="lv-work" data-work={work.slug} data-asset-id={work.assetId} data-public-id={work.publicId} data-media-kind={work.media.kind} data-status={tagAssignment?.status ?? work.status} data-fit={work.fit} data-review={review || Boolean(tagAssignment) || undefined} tabIndex={-1} aria-label={`${work.name}, ${(tagAssignment?.status ?? work.status) === 'concept' ? 'concept' : 'client work'}: ${(tagAssignment?.services ?? normalizeServiceTags(work.services)).map(labelFor).join(', ')}`}>
    <div className="lv-work-frame">
    {work.media.kind === 'video' ? <VideoMedia work={work} playbackEnabled={playbackEnabled} /> : <ImageMedia work={work} />}
    {(tagAssignment?.status ?? work.status) === 'concept' && <span className="lv-work-kind">Concept</span>}
    <ul className="lv-service-labels" aria-label="Services">{(tagAssignment?.services ?? normalizeServiceTags(work.services)).map(id => <li key={id}>{labelFor(id)}</li>)}</ul>
    </div>
    {tagAssignment && <TagCardControls work={work} assignment={tagAssignment} change={changeTags} />}
    {review && <ReviewCardControls assetId={work.assetId} name={work.name} decision={decision} toggle={toggleReview} />}
  </article>;
}
function ImageMedia({work}: {work:Work}) {
  if (work.media.kind !== 'image') return null;
  const src = work.media.src;
  const rendition = (width:number) => src.replace('/image/upload/',`/image/upload/w_${width},c_limit,q_auto,f_auto/`);
  const widths = [...new Set([320,480,640,960,1280,1600,work.width].filter(width => width <= work.width && width <= 1600))].sort((a,b)=>a-b);
  return <img className="lv-work-image" src={rendition(Math.min(960,work.width))} srcSet={widths.map(width=>`${rendition(width)} ${width}w`).join(', ')} sizes="(max-width:360px) calc(100vw - 32px), (max-width:760px) calc(100vw - 40px), (max-width:1440px) calc((100vw - 136px) / 2), 652px" alt={`${work.name} work preview`} width={work.width} height={work.height} loading="lazy" decoding="async" />;
}
function VideoMedia({
  work, playbackEnabled
}: {
  work: Work; playbackEnabled: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [failed, setFailed] = useState(false);
  const [renditionWidth, setRenditionWidth] = useState<number | null>(null);
  const [originalRendition, setOriginalRendition] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new ResizeObserver(() => {
      const width = video.getBoundingClientRect().width;
      if (!width) return;
      const pixels = width * Math.min(window.devicePixelRatio || 1, 2);
      const target = [480, 640, 960, 1280].find(size => size >= pixels) ?? 1280;
      const requested = Boolean(video.getAttribute('src'));
      // Unopened cards adapt to resizing; an existing stream keeps its position and buffer.
      setRenditionWidth(current => current && requested ? current : target);
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    update();
    visibility();
    media.addEventListener('change', update);
    document.addEventListener('visibilitychange', visibility);
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) setLoaded(true);
    }, {
      threshold: 0.15
    });
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (playbackEnabled && renditionWidth && !reduced && inView && !hidden && loaded && !failed) void video.play().catch(() => {/* Retain the poster if the browser blocks playback. */});else video.pause();
    return () => video.pause();
  }, [playbackEnabled, renditionWidth, originalRendition, reduced, inView, hidden, loaded, failed]);
  if (work.media.kind !== 'video') return null;
  const media = work.media;
  return <video ref={ref} src={playbackEnabled && renditionWidth && loaded && !failed ? originalRendition ? media.originalSrc : media.src.replace('w_1600,',`w_${renditionWidth},`) : undefined} poster={work.poster} muted loop playsInline autoPlay={Boolean(playbackEnabled && renditionWidth && !reduced && inView && !hidden && !failed)} preload="none" aria-label={`${work.name} work preview`} onError={() => { if (!originalRendition) setOriginalRendition(true); else setFailed(true); }} />;
}
type FilterCategory = 'industry' | 'style' | 'campaign';
const filterCategories: { id: FilterCategory; label: string; items: typeof industries }[] = [
  { id: 'industry', label: 'Industry', items: industries },
  { id: 'style', label: 'Style', items: styles },
  { id: 'campaign', label: 'Campaign', items: campaigns }
];
function DockChoices({ category, selection, change, reduced }: {
  category: FilterCategory; selection: Selection; change: (next: Partial<Selection>) => void; reduced: boolean;
}) {
  const present = useIsPresent();
  const current = filterCategories.find(item => item.id === category)!;
  return <motion.div className={`lv-choice-page lv-${category === 'industry' ? 'industries' : `${category}-options`}`} data-exiting={!present || undefined} aria-hidden={!present} inert={!present} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .32, ease: [.4,0,.2,1] }}>
    <Chips title={`${current.label} choices`} items={current.items} value={selection[category]} change={value => change({ [category]: value, limit: 12 })} />
    {selection.service && <div className="lv-legacy-service"><span>{labelFor(selection.service)}</span><button type="button" aria-label={`Remove service filter: ${labelFor(selection.service)}`} onClick={() => { change({service:'',limit:12}); document.getElementById(`lv-dock-tab-${category}`)?.focus({preventScroll:true}); }}>×</button></div>}
  </motion.div>;
}
function FilterDock({ selection, change }: {
  selection: Selection; change: (next: Partial<Selection>) => void;
}) {
  const [category, setCategory] = useState<FilterCategory | null>(null);
  const [lastCategory, setLastCategory] = useState<FilterCategory>('industry');
  const [contentHeight, setContentHeight] = useState(0);
  const reduced = Boolean(useReducedMotion());
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const current = category ?? lastCategory;
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(() => setContentHeight(Math.ceil(content.getBoundingClientRect().height)));
    observer.observe(content);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!category) return;
    const outside = (event: MouseEvent) => {
      if (event.target instanceof Node && ref.current && !event.composedPath().includes(ref.current)) {
        setCategory(null);
        if (!(event.target instanceof Element && event.target.closest('button,a,input,textarea,select'))) document.getElementById(`lv-dock-tab-${category}`)?.focus({preventScroll:true});
      }
    };
    document.addEventListener('click', outside);
    return () => document.removeEventListener('click', outside);
  }, [category]);
  function open(next: FilterCategory) { setLastCategory(next); setCategory(next); }
  function close() { setCategory(null); document.getElementById(`lv-dock-tab-${current}`)?.focus({preventScroll:true}); }
  return <div ref={ref} className="lv-filter-dock" data-expanded={Boolean(category)} role="group" aria-label="Gallery filters" onKeyDown={event => { if (event.key === 'Escape' && category) { event.preventDefault(); close(); } }}>
    <div className="lv-dock-tabs" role="tablist" aria-label="Filter categories">
      {filterCategories.map((item,index) => <div className="lv-dock-category" key={item.id}>
        {category === item.id && <motion.span className="lv-gooey-highlight" layoutId="lv-dock-glass-selection" aria-hidden="true" initial={{opacity:0}} animate={{opacity:1}} transition={reduced ? {duration:0} : {type:'spring',stiffness:230,damping:29,mass:.8}} />}
        <button id={`lv-dock-tab-${item.id}`} className="lv-dock-toggle" type="button" role="tab" aria-selected={category === item.id} aria-expanded={category === item.id} aria-controls="lv-dock-choices" tabIndex={current === item.id ? 0 : -1} onClick={() => category === item.id ? close() : open(item.id)} onKeyDown={event => {
          let next = index;
          if (event.key === 'ArrowRight') next = (index+1)%filterCategories.length;
          else if (event.key === 'ArrowLeft') next = (index+filterCategories.length-1)%filterCategories.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = filterCategories.length-1;
          else return;
          event.preventDefault(); open(filterCategories[next].id);
          document.getElementById(`lv-dock-tab-${filterCategories[next].id}`)?.focus();
        }}><span>{item.label}</span></button>
        {selection[item.id] && <button className="lv-dock-remove" type="button" aria-label={`Remove ${item.id} filter: ${item.items.find(i=>i.value===selection[item.id])?.label}`} onClick={() => { change({[item.id]:'',limit:12}); document.getElementById(`lv-dock-tab-${item.id}`)?.focus({preventScroll:true}); }}>×</button>}
      </div>)}
    </div>
    <motion.div className="lv-dock-expansion" aria-hidden={!category} inert={!category} animate={{height:category ? contentHeight : 0,opacity:category ? 1 : 0}} initial={false} transition={{height:{duration:reduced ? 0 : .38,ease:[.4,0,.2,1]},opacity:{duration:reduced ? 0 : .32,ease:[.4,0,.2,1]}}}>
      <div ref={contentRef} className="lv-dock-content" id="lv-dock-choices" role="tabpanel" aria-labelledby={`lv-dock-tab-${current}`}>
        <AnimatePresence initial={false}><DockChoices key={current} category={current} selection={selection} change={change} reduced={reduced} /></AnimatePresence>
      </div>
    </motion.div>
  </div>;
}
function Panel({
  children,
  title,
  close
}: {
  children: ReactNode;
  title: string;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return <dialog className="lv-panel" ref={ref} aria-labelledby="lv-panel-title" onCancel={event => {
    event.preventDefault();
    close();
  }} onClick={event => {
    if (event.target === event.currentTarget) {
      const r = event.currentTarget.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
    }
  }}>
    <div className="lv-panel-heading"><h2 id="lv-panel-title">{title}</h2><button type="button" className="lv-close" aria-label="Close panel" onClick={close}>×</button></div>{children}
  </dialog>;
}
function Ribbons() {
  return <svg className="lv-ribbons" aria-hidden="true" viewBox="0 0 1440 700" preserveAspectRatio="none" fill="none">
    <defs><linearGradient id="lv-metal" x1="0" y1="0" x2="400" y2="700" gradientUnits="userSpaceOnUse"><stop stopColor="#382716" /><stop offset=".23" stopColor="#d8a04b" /><stop offset=".33" stopColor="#fff3d6" /><stop offset=".36" stopColor="#674c2e" /><stop offset=".6" stopColor="#0d0d0d" /><stop offset=".82" stopColor="#dab67a" /><stop offset=".9" stopColor="#faf1dc" /><stop offset="1" stopColor="#42321f" /></linearGradient><linearGradient id="lv-silver"><stop stopColor="#262524" /><stop offset=".5" stopColor="#faf5e9" /><stop offset=".57" stopColor="#b2a799" /><stop offset="1" stopColor="#1c1a17" /></linearGradient></defs>
    <g opacity=".9"><path d="M-100-40C280 100-100 360 290 770" stroke="url(#lv-metal)" strokeWidth="42" /><path d="M-90-60C330 100-55 360 330 770" stroke="url(#lv-silver)" strokeWidth="9" /><path d="M-50-50C210 190-45 400 300 770" stroke="url(#lv-metal)" strokeWidth="2" /><path d="M-120-50C240 210-75 420 245 770" stroke="#E5192A" strokeWidth="1.5" /><path d="M-40-50C290 170-25 410 360 770" stroke="url(#lv-metal)" strokeWidth="1" /></g>
    <g transform="translate(1440 0) scale(-1 1)" opacity=".9"><path d="M-100-40C280 100-100 360 290 770" stroke="url(#lv-metal)" strokeWidth="42" /><path d="M-90-60C330 100-55 360 330 770" stroke="url(#lv-silver)" strokeWidth="9" /><path d="M-50-50C210 190-45 400 300 770" stroke="url(#lv-metal)" strokeWidth="2" /><path d="M-120-50C240 210-75 420 245 770" stroke="#E5192A" strokeWidth="1.5" /></g>
  </svg>;
}
function CallAction({ compact = false, final = false }: { compact?: boolean; final?: boolean }) {
  const className = `lv-cta${compact ? ' lv-cta-small' : ''}`;
  return bookingUrl ? <a className={className} href={bookingUrl} target="_blank" rel="noopener noreferrer">Book a call <Arrow /></a> : final ? <button className={className} type="button" disabled>Book a call <Arrow /></button> : <a className={className} href="#lv-closing">Book a call <Arrow /></a>;
}
function AuditRequest() {
  const [website, setWebsite] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'saved'>('idle');
  const [error, setError] = useState('');
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    setError('');
    let url: URL;
    try {
      const value = website.trim();
      url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
      if (!/^https?:$/.test(url.protocol) || !url.hostname.includes('.') || url.username || url.password) throw new Error();
    } catch { setError('Enter your website, like yourbrand.com.'); return; }
    const emailAddress = contact.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) { setError('Enter the email where you’d like to receive your audit.'); return; }
    setStatus('sending');
    const request = new AbortController();
    requestRef.current = request;
    try {
      const response = await fetch('/api/strategist/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(15000)]),
        body: JSON.stringify({ name: url.hostname, website_url: url.toString(), contact: emailAddress, contact_type: 'email', source: 'work_audit', project_summary: 'Personal brand audit requested. Leonardo will review the website and email the audit.' })
      });
      const data = await response.json();
      if (!response.ok || data.saved !== true) throw new Error();
      setStatus('saved');
    } catch {
      if (request.signal.aborted) return;
      setStatus('idle'); setError('Your request wasn’t saved. Please try again.');
    }
  }
  return status === 'saved' ? <div className="lv-audit-confirmation" role="status"><strong>Your request is in.</strong><p>I’ll review your website and email you the audit.</p></div> : <form className="lv-audit-form" onSubmit={submit} noValidate aria-busy={status === 'sending'}>
    <label htmlFor="lv-audit-website">Your website<input id="lv-audit-website" name="website" type="text" inputMode="url" autoComplete="url" autoCapitalize="none" spellCheck={false} maxLength={2048} value={website} onChange={event => { setWebsite(event.target.value); setError(''); }} placeholder="yourbrand.com" disabled={status === 'sending'} /></label>
    <label htmlFor="lv-audit-email">Your email<input id="lv-audit-email" name="email" type="email" autoComplete="email" maxLength={254} value={contact} onChange={event => { setContact(event.target.value); setError(''); }} placeholder="you@yourbrand.com" disabled={status === 'sending'} /></label>
    <button className="lv-cta" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Get my brand audit'}<Arrow /></button>
    {error && <p className="lv-audit-error" role="alert">{error}</p>}
  </form>;
}
function ClientResults({ industry, campaign }: { industry: string; campaign: string }) {
  const relevant = resultStories.filter(story => story.industry === industry);
  const others = resultStories.filter(story => story.industry !== industry);
  const stories = (industry ? [...relevant, ...others] : resultStories).slice(0, 3);
  const label = industries.find(item => item.value === industry)?.label;
  return <section id="lv-results" className="lv-results lv-wrap" aria-labelledby="lv-results-title">
    <div className="lv-results-heading">
      <div><h2 id="lv-results-title">THE WORK.<br /><em>What it changed.</em></h2></div>
      <div className="lv-results-intro"><p>Clients describe what changed after their website, brand or booking system went live.</p></div>
    </div>
    <div className="lv-result-grid">{stories.map((story, index) => <article key={story.id} className={`lv-result-card${index === 0 ? ' lv-result-featured' : ''}`} aria-labelledby={`result-${story.id}`}>
      <div className="lv-result-top"><span>{story.sector}</span><img src={story.image} alt="" width="48" height="48" loading="lazy" /></div>
      <div className="lv-result-outcome"><span className="lv-result-metric" data-long={story.metric.length > 9 || undefined}>{story.metric}</span><h3 id={`result-${story.id}`}>{story.outcome}</h3><p>{story.period}</p></div>
      <dl className="lv-result-detail">{story.challenge && <div><dt>The starting point</dt><dd>{story.challenge}</dd></div>}<div><dt>What we delivered</dt><dd>{story.response}</dd></div></dl>
      <figure className="lv-result-quote"><blockquote>“{story.quote}”</blockquote><figcaption><strong>{story.author}</strong><span>{story.role}</span></figcaption></figure>
    </article>)}</div>
    <div className="lv-results-followup"><p className="lv-results-note">{campaign ? 'Client-reported results from our wider work.' : industry && relevant.length ? `${label} stories first. Results reported by the clients shown.` : 'Results reported by the clients shown, from projects across the studio.'}</p><CallAction /></div>
  </section>;
}
export const LIONOVARTWorkProspectJourney = () => {
  const review = useWorkReview();
  const tags = useWorkTagReview();
  const catalogue = review.enabled ? works : publishedWorks;
  const [selection, setSelection] = useState<Selection>(readSelection);
  const [displaySelection, setDisplaySelection] = useState<Selection>(readSelection);
  const displayedRef = useRef(displaySelection);
  const transitioningRef = useRef(false);
  const filteringSessionRef = useRef(false);
  const galleryAnimationRef = useRef<Animation | null>(null);
  const [pageFloor, setPageFloor] = useState(0);
  const reduced = Boolean(useReducedMotion());
  const [introActive, setIntroActive] = useState(() => typeof window === 'undefined' || !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const finishIntro = useCallback(() => setIntroActive(false), []);
  const introImages = useMemo(() => {
    const relevant = catalogue.filter(work => matchesWork(work, selection));
    const chosen = new Set(relevant.map(work => work.slug));
    return [...relevant, ...catalogue.filter(work => !chosen.has(work.slug))].slice(0, 5).map(work => work.poster);
  }, [selection, catalogue]);
  const [panel, setPanel] = useState<'enquiry' | null>(null);
  const [includeContext, setIncludeContext] = useState(true);
  const [emailPrepared, setEmailPrepared] = useState(false);
  const [message, setMessage] = useState('');
  const galleryRef = useRef<HTMLElement>(null);
  const galleryContentRef = useRef<HTMLDivElement>(null);
  const galleryEndRef = useRef<HTMLDivElement>(null);
  const [dockVisible, setDockVisible] = useState(false);
  const matches = catalogue.filter(work => matchesWork(work, displaySelection));
  const industryLabel = industries.find(i => i.value === selection.industry)?.label ?? 'All industries';
  const campaignLabel = campaigns.find(c => c.value === selection.campaign)?.label ?? 'All';
  const displayCampaignLabel = campaigns.find(c => c.value === displaySelection.campaign)?.label ?? 'All';
  const styleLabel = styles.find(s => s.value === selection.style)?.label ?? 'All styles';
  const hasFilters = Boolean(selection.industry || selection.service || selection.campaign || selection.style);
  const browsingContext = [selection.industry ? industryLabel : '', selection.campaign ? campaignLabel : '', selection.style ? styleLabel : '', selection.service ? labelFor(selection.service) : ''].filter(Boolean).join(' · ');
  useEffect(() => {
    const pop = () => setSelection(readSelection());
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (transitioningRef.current || filteringSessionRef.current) return;
      // Release any protection against browser scroll clamping as the visitor scrolls up.
      setPageFloor(floor => Math.min(floor, window.scrollY + window.innerHeight));
      const headerBottom = document.querySelector('.lv-header')?.getBoundingClientRect().bottom ?? 0;
      setDockVisible(Boolean(galleryRef.current && galleryEndRef.current && galleryRef.current.getBoundingClientRect().top < window.innerHeight && galleryEndRef.current.getBoundingClientRect().top > headerBottom + 32));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const onScroll = () => { if (!transitioningRef.current) filteringSessionRef.current = false; schedule(); };
    const observer = new ResizeObserver(schedule);
    const gallery = document.getElementById('lv-work');
    if (gallery) observer.observe(gallery);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', schedule);
    measure();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', schedule); };
  }, []);
  useLayoutEffect(() => {
    const element = galleryContentRef.current;
    if (!element) return;
    const opacity = getComputedStyle(element).opacity;
    galleryAnimationRef.current?.cancel();
    element.style.opacity = opacity;
    let cancelled = false;
    const same = selectionKey(selection) === selectionKey(displayedRef.current);
    if (reduced) {
      element.style.opacity = '1';
      element.style.minHeight = '';
      transitioningRef.current = false;
      if (!same) queueMicrotask(() => { if (!cancelled) setDisplaySelection(selection); });
      return () => { cancelled = true; };
    }
    if (same) {
      element.style.minHeight = '';
      if (opacity === '1' && !transitioningRef.current) return;
      const animation = element.animate([{opacity},{opacity:1}],{duration:320,easing:'ease',fill:'forwards'});
      galleryAnimationRef.current = animation;
      void animation.finished.then(() => {
        if (cancelled) return;
        element.style.opacity = '1'; animation.cancel();
        transitioningRef.current = false;
      }).catch(() => {});
    } else {
      transitioningRef.current = true;
      element.style.minHeight = `${element.getBoundingClientRect().height}px`;
      const animation = element.animate([{opacity},{opacity:0}],{duration:220,easing:'ease',fill:'forwards'});
      galleryAnimationRef.current = animation;
      void animation.finished.then(() => {
        if (cancelled) return;
        element.style.opacity = '0'; animation.cancel();
        setDisplaySelection(selection);
      }).catch(() => {});
    }
    return () => { cancelled = true; element.style.opacity = getComputedStyle(element).opacity; galleryAnimationRef.current?.cancel(); };
  }, [selection, reduced]);
  useLayoutEffect(() => {
    displayedRef.current = displaySelection;
    const element = galleryContentRef.current;
    if (!element || !transitioningRef.current) return;
    element.style.minHeight = '';
    element.style.opacity = reduced ? '1' : '0';
    if (reduced) { transitioningRef.current = false; return; }
    const animation = element.animate([{opacity:0},{opacity:1}],{duration:320,easing:'ease',fill:'forwards'});
    galleryAnimationRef.current = animation;
    let cancelled = false;
    void animation.finished.then(() => {
      if (cancelled) return;
      element.style.opacity = '1'; animation.cancel();
      transitioningRef.current = false;
    }).catch(() => {});
    return () => { cancelled = true; element.style.opacity = getComputedStyle(element).opacity; animation.cancel(); };
  }, [displaySelection, reduced]);
  function update(next: Partial<Selection>) {
    filteringSessionRef.current = true;
    // Keep scrollY stable even when a short result set would shrink the document.
    setPageFloor(window.scrollY + window.innerHeight);
    const value = {
      ...selection,
      ...next
    };
    setSelection(value);
    const url = new URL(window.location.href);
    for (const [key, val] of [['industry', value.industry], ['service', value.service], ['campaign', value.campaign], ['style', value.style], ['show', value.limit > 12 ? String(value.limit) : '']]) {
      if (val) url.searchParams.set(key, val);else url.searchParams.delete(key);
    }
    try {
      window.history.replaceState(null, '', url);
    } catch {/* Filters remain usable in restricted preview hosts. */}
  }
  function enquire() {
    setIncludeContext(true);
    setEmailPrepared(false);
    setPanel('enquiry');
  }
  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const context = includeContext && hasFilters ? `\nInterested in: ${browsingContext}\n` : '';
    const body = `Hi Leonardo,\n\nI'm ${String(data.get('name'))}.\n${context}\n${String(data.get('message'))}\n\nReply to: ${String(data.get('email'))}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent('Let’s create something — project enquiry')}&body=${encodeURIComponent(body)}`;
    setEmailPrepared(true);
  }
  return <div className="lv-page" data-review-mode={review.enabled || tags.enabled || undefined} style={{minHeight:pageFloor || undefined}}>
    <StackLoader active={introActive} images={introImages} onComplete={finishIntro}>
    <a className="lv-skip" href="#lv-work">Skip to work</a>
    <header className="lv-header">
      <a className="lv-home-link" href={homepageUrl} aria-label="LIONOVART — Back to website"><span className="lv-wordmark">LIONÖVART<span>®</span></span><span className="lv-home-label"><span aria-hidden="true">←</span> Back to website</span></a>
      <nav aria-label="Main navigation"><a className="lv-nav-current" href="#lv-work">Work</a><a href="#lv-results">Results</a><a href="#lv-approach">Work with us</a></nav>
      <CallAction compact />
    </header>
    <main id="lv-top">
      <section className="lv-intro lv-wrap" aria-labelledby="lv-title">
        <h1 id="lv-title"><span className="lv-title-main">YOUR STORY. YOUR VISION.</span><span className="lv-title-response"><span className="lv-title-trust">THEIR TRUST.</span> <em className="lv-title-direction">Our direction</em></span></h1>
      </section>
      <section ref={galleryRef} id="lv-work" className="lv-gallery lv-wrap" aria-label="Work gallery">
        {tags.enabled && <TagReviewToolbar assignments={tags.assignments} unsaved={tags.unsaved} exit={tags.exit} />}
        {review.enabled && <ReviewToolbar decisions={review.decisions} unsaved={review.unsaved} exit={review.exit} />}
        <p className="lv-sr-only" role="status" aria-live="polite">{matches.length} works. {browsingContext || 'All work'}.</p>
        <div ref={galleryContentRef} className="lv-gallery-content" aria-busy={selectionKey(selection) !== selectionKey(displaySelection)} inert={selectionKey(selection) !== selectionKey(displaySelection)}>
        {matches.length > 0 ? <><div className="lv-grid">{matches.slice(0, displaySelection.limit).map(work => <WorkCard key={work.slug} work={work} playbackEnabled={!introActive} review={review.enabled} decision={review.decisions[work.assetId]} toggleReview={review.toggle} tagAssignment={tags.enabled ? tags.assignments[work.assetId] ?? defaultTags(work) : undefined} changeTags={tags.change} />)}</div>{displaySelection.limit < matches.length && <button className="lv-more" onClick={() => update({
            limit: selection.limit + 12
          })}>More work <span>+</span></button>}</> : <div className="lv-empty" tabIndex={-1}><span className="lv-empty-symbol">↗</span><h2>{displaySelection.campaign ? <>{displayCampaignLabel}<br /><em>for your world.</em></> : <>Room for <em>your world.</em></>}</h2><p>{displaySelection.campaign ? <>No {displayCampaignLabel} work is published in this selection yet.<br />Explore other work or tell us about your campaign.</> : <>There isn’t a published example in this selection yet.<br />Explore the full collection, or tell us what you have in mind.</>}</p><div>{displaySelection.campaign && <button className="lv-cta" onClick={() => update({campaign:'',limit:12})}>View all campaigns <Arrow diagonal={false} /></button>}<button className={displaySelection.campaign ? 'lv-text-link' : 'lv-cta'} onClick={() => update(allWork)}>Explore all work <Arrow diagonal={false} /></button><button className="lv-text-link" onClick={enquire}>{displaySelection.campaign ? 'Discuss your campaign' : 'Discuss your project'} <Arrow /></button></div></div>}
        </div>
        <div ref={galleryEndRef} className="lv-gallery-end"><a className="lv-text-link" href="#lv-results">Client results <span aria-hidden="true">↓</span></a></div>
      </section>
      <ClientResults industry={displaySelection.industry} campaign={displaySelection.campaign} />
      <section id="lv-approach" className="lv-studio lv-wrap" aria-labelledby="lv-studio-title">
        <div className="lv-portrait"><img src={portrait} alt="Leonardo, founder of Lionovart" loading="lazy" /><div><strong>Leonardo</strong><span>FOUNDER & CREATIVE DIRECTOR</span></div></div>
        <div className="lv-studio-copy"><h2 id="lv-studio-title">WORK WITH<br /><em>Leonardo.</em></h2><p>I’m Leonardo, founder of LIONOVART. I’ll be your first point of contact.</p>
          <ol className="lv-call-steps">
            <li><span>01</span><div><h3>Start with your business.</h3><p>What you sell, who you want to reach and what isn’t working yet.</p></div></li>
            <li><span>02</span><div><h3>Set the priority.</h3><p>We’ll discuss whether you need a new identity, a website, content or a combination.</p></div></li>
            <li><span>03</span><div><h3>Make your next move.</h3><p>You’ll receive a proposal with the deliverables, timing and price before the work starts.</p></div></li>
          </ol>
        </div>
      </section>
      <section id="lv-closing" className="lv-closing" aria-labelledby="lv-closing-title"><Ribbons /><div className="lv-closing-content"><h2 id="lv-closing-title">LET’S START<br /><em>with your brand.</em></h2><p>Book a call, or send your website for a brand audit.</p><div className="lv-conversion-options"><div className="lv-conversion-card"><h3>A call with Leonardo.</h3><p>Choose a time to talk through your project.</p><CallAction final /></div><div className="lv-conversion-card"><h3>Your brand audit.</h3><p>I’ll review your website and brand, then email you the audit.</p><AuditRequest /></div></div></div></section>
    </main>
    <footer className="lv-footer"><a className="lv-wordmark" href={homepageUrl} aria-label="LIONOVART homepage">LIONÖVART<span>®</span></a><a href={`mailto:${email}`}>{email} <Arrow /></a><p>Independent thinking. Connected design.</p><a href="#lv-top">Back to top ↑</a></footer>
    {dockVisible && !panel && <FilterDock selection={selection} change={update} />}
    {panel === 'enquiry' && <Panel title="What do you have in mind?" close={() => setPanel(null)}><p className="lv-panel-intro">A new brand, a fresh direction, a better digital experience. Tell Leonardo a little about it.</p><form onSubmit={prepareEmail}>
      {includeContext && hasFilters && <div className="lv-context"><span>Interested in {browsingContext}</span><button type="button" aria-label="Remove browsing context" onClick={() => setIncludeContext(false)}>×</button></div>}
      <div className="lv-form-row"><label>Your name<input name="name" autoComplete="name" required placeholder="Alex" maxLength={100} /></label><label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@yourbrand.com" maxLength={200} /></label></div>
      <label>A little about your project<textarea name="message" value={message} onChange={e => setMessage(e.target.value)} required rows={4} maxLength={3000} placeholder="What are you building, and what would you love to change?" /></label>
      <button className="lv-cta lv-form-submit" type="submit">Continue in email <Arrow /></button><p className="lv-email-note" role="status">{emailPrepared ? 'Your email draft is ready to open. Send it from your email app, or use WhatsApp below.' : 'Opens a draft in your email app. You review and send it.'}</p>
    </form><div className="lv-contact-alternatives"><a href={whatsapp(`Hi Leonardo, I’d love to discuss a project.${message ? ` ${message}` : ''}`)} target="_blank" rel="noreferrer">Message on WhatsApp <Arrow /></a><a href={`mailto:${email}?subject=Let%E2%80%99s%20schedule%20a%20call`}>Request a call <Arrow /></a></div></Panel>}
    </StackLoader>
  </div>;
};
