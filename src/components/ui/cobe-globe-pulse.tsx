"use client";

interface PulseMarker {
  id: string;
  location: [number, number];
  delay: number;
}

interface GlobePulseProps {
  markers?: PulseMarker[];
  className?: string;
  speed?: number;
}

const defaultMarkers: PulseMarker[] = [
  { id: "calgary", location: [51.05, -114.07], delay: 0 },
  { id: "london", location: [51.51, -0.13], delay: 0.5 },
  { id: "milan", location: [45.46, 9.19], delay: 1 },
  { id: "seoul", location: [37.57, 126.98], delay: 1.5 },
];

/*
 * Lightweight replacement for the former COBE/WebGL globe.
 * This section is decorative proof-of-reach, so a static SVG gives us the
 * same visual read with no canvas, GPU context, resize loop or RAF work.
 */
export function GlobePulse({
  markers = defaultMarkers,
  className = "",
}: GlobePulseProps) {
  const markerPositions = [
    { x: 118, y: 135 },
    { x: 202, y: 116 },
    { x: 224, y: 151 },
    { x: 288, y: 171 },
  ];

  return (
    <div
      className={`relative aspect-square select-none ${className}`}
      aria-label="Globe showing Lionovart's international client reach"
      role="img"
    >
      <svg
        viewBox="0 0 400 400"
        className="h-full w-full"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id="lionovart-globe-fill" cx="36%" cy="28%" r="76%">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="58%" stopColor="#111111" />
            <stop offset="100%" stopColor="#080808" />
          </radialGradient>
          <radialGradient id="lionovart-globe-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <clipPath id="lionovart-globe-clip">
            <circle cx="200" cy="200" r="145" />
          </clipPath>
        </defs>

        <circle cx="200" cy="200" r="157" fill="url(#lionovart-globe-glow)" />
        <circle
          cx="200"
          cy="200"
          r="145"
          fill="url(#lionovart-globe-fill)"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1.2"
        />

        <g
          clipPath="url(#lionovart-globe-clip)"
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1"
        >
          <ellipse cx="200" cy="200" rx="112" ry="145" />
          <ellipse cx="200" cy="200" rx="58" ry="145" />
          <ellipse cx="200" cy="200" rx="18" ry="145" />
          <ellipse cx="200" cy="200" rx="145" ry="112" />
          <ellipse cx="200" cy="200" rx="145" ry="64" />
          <ellipse cx="200" cy="200" rx="145" ry="26" />
          <path d="M55 200H345" />
          <path d="M200 55V345" opacity="0.35" />
        </g>

        <g>
          {markers.slice(0, markerPositions.length).map((marker, index) => {
            const position = markerPositions[index];
            if (!position) return null;
            return (
              <g key={marker.id}>
                <circle
                  cx={position.x}
                  cy={position.y}
                  r="10"
                  fill="none"
                  stroke="#e5192a"
                  strokeOpacity="0.34"
                  strokeWidth="1"
                />
                <circle cx={position.x} cy={position.y} r="4.2" fill="#e5192a" />
                <circle cx={position.x} cy={position.y} r="1.6" fill="#ffffff" />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
