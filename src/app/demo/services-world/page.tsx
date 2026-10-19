'use client';

import { useEffect, useState } from 'react';

/** Review-only viewport harness: CSS media queries run at the iframe's real dimensions. */
export default function ServicesWorldReview() {
  const [size, setSize] = useState<[number, number]>([390, 844]);
  const [available, setAvailable] = useState(1100);
  const [backend, setBackend] = useState('auto');
  useEffect(() => {
    const sync = () => setAvailable(innerWidth - 32); sync();
    window.addEventListener('resize', sync); return () => window.removeEventListener('resize', sync);
  }, []);
  const scale = Math.min(1, available / size[0]);
  return <main style={{ background: '#ddd7cc', minHeight: '100vh', padding: 16, color: '#211e18', fontFamily: 'sans-serif' }}>
    <title>Services world — viewport review</title>
    <meta name="robots" content="noindex,nofollow" />
    <header style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
      <strong style={{ marginRight: 16 }}>Phase 1 / viewport review</strong>
      {([['Small phone', 320, 568], ['Phone', 390, 844], ['Tablet', 768, 1024], ['Desktop', 1440, 900], ['Landscape', 844, 390]] as const).map(([label, w, h]) =>
        <button key={label} onClick={() => setSize([w, h])} aria-pressed={size[0] === w} style={{ minHeight: 44, padding: '8px 12px', background: size[0] === w ? '#d3b779' : '#fff8', border: '1px solid #aa9b82', borderRadius: 6 }}>{label}</button>)}
      <select aria-label="Renderer" value={backend} onChange={e => setBackend(e.target.value)} style={{ minHeight: 44 }}>
        <option value="auto">Automatic renderer</option><option value="webgl">WebGL 2</option><option value="poster">Poster fallback</option>
      </select>
      <span>{size[0]} × {size[1]} CSS px</span>
    </header>
    <div style={{ width: size[0] * scale, height: size[1] * scale, margin: '0 auto', overflow: 'hidden', boxShadow: '0 10px 60px #0002' }}>
      <iframe key={backend + size.join('x')} title="Homepage viewport preview" src={`/?world=${backend}#services`} width={size[0]} height={size[1]}
        style={{ width: size[0], height: size[1], border: 0, transform: `scale(${scale})`, transformOrigin: 'top left', background: '#f7f4ef' }} />
    </div>
  </main>;
}
