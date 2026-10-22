/** Static field shared by the outgoing card and its incoming service media.
 * Only the alpha threshold changes; no clock or render loop runs at rest. */
export default function HandoffDissolveFilter({ id, seed, incoming = false }: { id: string; seed: number; incoming?: boolean }) {
  return (
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter id={id} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".012 .024" numOctaves="2" seed={seed} result="flow" />
            <feColorMatrix in="flow" type="luminanceToAlpha" result="field" />
            <feComponentTransfer in="field" result="remaining">
              <feFuncA type="linear" slope="12" intercept="1" data-dissolve-cutoff={incoming ? undefined : 'surface'} data-service-merge-cutoff={incoming ? 'surface' : undefined} />
            </feComponentTransfer>
            <feComponentTransfer in="field" result="halo">
              <feFuncA type="linear" slope="12" intercept="1.24" data-dissolve-cutoff={incoming ? undefined : 'edge'} data-service-merge-cutoff={incoming ? 'edge' : undefined} />
            </feComponentTransfer>
            <feComposite in="halo" in2="remaining" operator="arithmetic" k2="1" k3="-1" result="rim" />
            <feComposite in="rim" in2="SourceAlpha" operator="in" result="boundedRim" />
            <feGaussianBlur in="boundedRim" stdDeviation=".7" result="softRim" />
            <feFlood floodColor="#ede5d7" floodOpacity=".45" result="light" />
            <feComposite in="light" in2="softRim" operator="in" result="litRim" />
            <feComposite in="SourceGraphic" in2="remaining" operator="in" result="dissolved" />
            <feMerge><feMergeNode in="dissolved" /><feMergeNode in="litRim" /></feMerge>
          </filter>
        </defs>
      </svg>
  );
}
