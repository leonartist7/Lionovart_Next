'use client';

import { useEffect, useRef, useState } from 'react';

type Diagnostics = Record<string, string>;
const button = { minHeight: 44, padding: '8px 12px', border: '1px solid #aa9b82', borderRadius: 6 };

/** Same-origin review harness. Resizing preserves the live document and selected experience. */
export default function ServicesWorldReview() {
  const [size, setSize] = useState<[number, number]>([390, 844]);
  const [available, setAvailable] = useState(1100);
  const [backend, setBackend] = useState('auto');
  const [revision, setRevision] = useState(0);
  const [diagnostics, setDiagnostics] = useState<Diagnostics>({ status: 'Waiting for homepage' });
  const iframe = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const sync = () => setAvailable(innerWidth - 32); sync();
    window.addEventListener('resize', sync); return () => window.removeEventListener('resize', sync);
  }, []);
  useEffect(() => {
    const poll = () => {
      const doc = iframe.current?.contentDocument;
      const root = doc?.querySelector<HTMLElement>('[data-service-world]');
      const canvas = root?.querySelector('canvas');
      if (!root) { setDiagnostics({ status: 'Waiting for homepage' }); return; }
      const stage = root.querySelector<HTMLElement>('[data-world-service]');
      setDiagnostics({
        status: root.dataset.worldStatus ?? 'waiting', reason: root.dataset.worldError ?? '',
        visible: root.dataset.worldVisible ?? '', motion: root.dataset.worldMotion ?? '',
        service: stage?.dataset.worldService ?? '',
        ...(root.dataset.worldReady === 'true' ? canvas?.dataset : {}),
      } as Diagnostics);
    };
    const interval = window.setInterval(poll, 1000);
    return () => clearInterval(interval);
  }, []);
  const command = (name: 'retry' | 'fail') => {
    iframe.current?.contentWindow?.dispatchEvent(new Event(`lionovart:world-${name}`));
  };
  const seek = (selector: string, progress?: number) => {
    const view = iframe.current?.contentWindow, doc = iframe.current?.contentDocument;
    const element = doc?.querySelector(selector);
    if (!view || !element) return;
    const rect = element.getBoundingClientRect();
    const y = view.scrollY + rect.top + (progress === undefined ? 0 : -view.innerHeight + (rect.height + view.innerHeight) * progress);
    view.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
  };
  const seekBridge = (progress: number) => {
    const view = iframe.current?.contentWindow, doc = iframe.current?.contentDocument;
    const gallery = doc?.querySelector('[data-gallery-runway]');
    if (!view || !gallery) return;
    const rect = gallery.getBoundingClientRect();
    view.scrollTo({ top: view.scrollY + rect.top - view.innerHeight * 1.1 * (1 - progress), behavior: 'instant' });
  };
  const scale = Math.min(1, available / size[0]);
  const seekGallery = (progress: number) => {
    const view = iframe.current?.contentWindow, doc = iframe.current?.contentDocument;
    const element = doc?.querySelector('[data-gallery-runway]');
    if (!view || !element) return;
    const rect = element.getBoundingClientRect();
    view.scrollTo({ top: view.scrollY + rect.top + progress * (rect.height - view.innerHeight * .85), behavior: 'instant' });
  };
  return <main style={{ background: '#ddd7cc', minHeight: '100vh', padding: 16, color: '#211e18', fontFamily: 'sans-serif' }}>
    <header style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
      <strong style={{ marginRight: 16 }}>Phase 3 / device review</strong>
      {([['Small phone', 320, 568], ['Phone', 390, 844], ['Tablet', 768, 1024], ['Desktop', 1440, 900], ['Landscape', 844, 390]] as const).map(([label, w, h]) =>
        <button key={label} onClick={() => setSize([w, h])} aria-pressed={size[0] === w} style={{ ...button, background: size[0] === w ? '#d3b779' : '#fff8' }}>{label}</button>)}
      <select aria-label="Renderer" value={backend} onChange={e => setBackend(e.target.value)} style={{ minHeight: 44 }}>
        <option value="auto">Automatic renderer</option><option value="webgl">WebGL 2</option><option value="poster">Poster fallback</option>
      </select>
      <button style={button} onClick={() => setRevision(value => value + 1)}>Reload homepage</button>
      <span>{size[0]} × {size[1]} CSS px</span>
    </header>
    <nav aria-label="Journey review" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
      <button style={button} onClick={() => seek('#imagine')}>Split cards</button>
      {[0, .2, .28, .35, .42, .55, .7, .78, .85, .9].map(p => <button key={p} style={button} onClick={() => seek('[data-card-exit]', p)}>Handoff {Math.round(p * 100)}%</button>)}
      {([['Services','[data-services-runway]'],['Selected work','[data-gallery]'],['Partnership','#partnership'],['About','#about']] as const).map(([label,selector]) => <button key={label} style={button} onClick={() => seek(selector)}>{label}</button>)}
      {[0, .3, .5, .7, 1].map(p => <button key={`bridge-${p}`} style={button} onClick={() => seekBridge(p)}>Work arrival {Math.round(p * 100)}%</button>)}
      {[0, .25, .5, .75, .92].map(p => <button key={`gallery-${p}`} style={button} onClick={() => seekGallery(p)}>Gallery {Math.round(p * 100)}%</button>)}
    </nav>
    <details style={{ marginBottom: 12, maxWidth: 1440, fontSize: 13 }} open>
      <summary>Renderer diagnostics · resizing keeps the current selection</summary>
      <p style={{ margin: '8px 0' }}>Status: <strong>{diagnostics.status}</strong>{diagnostics.reason && ` — ${diagnostics.reason}`} · Motion: {diagnostics.motion || 'waiting'} · World visible: {diagnostics.visible || 'waiting'}</p>
      {diagnostics.backend && <p style={{ margin: '8px 0' }}>{diagnostics.backend} · {diagnostics.exhibit}/{diagnostics.variant} · DPR {diagnostics.dpr} ({diagnostics.quality}) · {diagnostics.calls} draw calls · {diagnostics.triangles} triangles · {diagnostics.textures} textures<br />
        Consecutive frame intervals: p50 {diagnostics.p50} / p95 {diagnostics.p95} ms ({diagnostics.samples} samples, rolling 180). Latest CPU submit: {diagnostics.cpuSubmitMs} ms. These are not GPU timings.</p>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={button} onClick={() => command('fail')}>Simulate renderer failure</button>
        <button style={button} onClick={() => command('retry')}>Retry renderer</button>
        <span style={{ alignSelf: 'center' }}>Simulation tests fallback recovery; actual context loss and physical-device performance still need hardware checks.</span>
      </div>
    </details>
    <div style={{ width: size[0] * scale, height: size[1] * scale, margin: '0 auto', overflow: 'hidden', boxShadow: '0 10px 60px #0002' }}>
      <iframe ref={iframe} key={`${backend}-${revision}`} title="Homepage viewport preview" src={`/?world=${backend}&worldReview=1#services`} width={size[0]} height={size[1]}
        style={{ width: size[0], height: size[1], border: 0, transform: `scale(${scale})`, transformOrigin: 'top left', background: '#f7f4ef' }} />
    </div>
  </main>;
}
