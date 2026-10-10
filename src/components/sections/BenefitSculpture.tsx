"use client";

import { useId } from "react";

/** Lightweight dimensional symbols: value, time and recognition. */
export default function BenefitSculpture({ kind }: { kind: number }) {
  const id = useId().replace(/:/g, "");
  const paint = (name: string) => `url(#${id}-${name})`;
  return <svg viewBox="0 0 240 240" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={id + "-metal"} x1="30" y1="40" x2="202" y2="196" gradientUnits="userSpaceOnUse">
        <stop stopColor="#80541b" /><stop offset=".22" stopColor="#f8dc89" /><stop offset=".43" stopColor="#fff5c5" /><stop offset=".59" stopColor="#b17b28" /><stop offset=".82" stopColor="#e8ba57" /><stop offset="1" stopColor="#694116" />
      </linearGradient>
      <linearGradient id={id + "-bright"} x1="67" y1="49" x2="166" y2="163" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fffce4" /><stop offset=".45" stopColor="#f9d87c" /><stop offset="1" stopColor="#bd842e" />
      </linearGradient>
      <linearGradient id={id + "-shade"} x1="59" y1="83" x2="170" y2="203" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ad7022" /><stop offset="1" stopColor="#49250f" />
      </linearGradient>
      <linearGradient id={id + "-glass"} x1="78" y1="72" x2="166" y2="160" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fff8d7" stopOpacity=".45" /><stop offset=".4" stopColor="#ffe7ab" stopOpacity=".06" /><stop offset="1" stopColor="#ebcb87" stopOpacity=".27" />
      </linearGradient>
      <linearGradient id={id + "-red"} x1="65" y1="145" x2="111" y2="202" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff6d63" /><stop offset=".55" stopColor="#f51b2c" /><stop offset="1" stopColor="#8f0719" />
      </linearGradient>
    </defs>
    {kind === 0 ? <g>
      <path d="M42 92 83 49H166L205 92 125 208Z" fill={paint("shade")} />
      <path d="m35 81 41-43h83l39 43-80 116Z" fill={paint("metal")} stroke="#f6d58a" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M35 81h163M76 38l-6 43 48 116 47-116-6-43M76 38l42 43 41-43" stroke="#fff0b0" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m35 81 41-43-6 43Z" fill="#b57a28" />
      <path d="m76 38 42 43H70Z" fill="#fff1b4" />
      <path d="m118 81 41-43 6 43Z" fill="#cf973a" />
      <path d="m165 81 33 0-80 116Z" fill="#8c541c" />
      <path d="M70 81h95l-47 116Z" fill={paint("bright")} />
      <path d="m118 81 0 116L70 81Z" fill="#fff4bd" fillOpacity=".33" />
      <path d="m43 79 35-35m-3 40 39 97" stroke="white" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" />
    </g> : kind === 1 ? <g>
      <path d="M73 55h94v20c0 24-15 34-32 45 17 11 32 22 32 45v20H73v-20c0-23 15-34 32-45-17-11-32-21-32-45Z" fill={paint("glass")} stroke="#e3c483" strokeWidth="2" />
      <path d="M84 64v14c0 19 13 28 27 37m45 59v-10c0-18-14-29-27-36" stroke="#fff7dc" strokeOpacity=".72" strokeWidth="3" strokeLinecap="round" />
      <path d="M83 78h74c-2 16-16 24-37 40-20-16-34-24-37-40Z" fill={paint("bright")} />
      <path d="M82 177c8-13 24-21 38-39 14 18 30 26 38 39Z" fill={paint("metal")} />
      <path d="M120 117v23" stroke="#ffdc83" strokeWidth="2" strokeLinecap="round" />
      <rect x="59" y="54" width="11" height="132" rx="5.5" fill={paint("metal")} />
      <rect x="170" y="54" width="11" height="132" rx="5.5" fill={paint("metal")} />
      <path d="M60 41h120a9 9 0 0 1 0 18H60a9 9 0 0 1 0-18Z" fill={paint("metal")} stroke="#e4bd70" />
      <path d="M60 181h120a9 9 0 0 1 0 18H60a9 9 0 0 1 0-18Z" fill={paint("metal")} stroke="#e4bd70" />
      <path d="M62 45h112M62 184h112" stroke="#fff4bd" strokeWidth="2" strokeLinecap="round" />
    </g> : <g>
      <path d="m90 128 25 8-8 60c-1 7-6 10-12 7l-15-7c-4-2-6-7-5-12Z" fill={paint("shade")} />
      <path d="m81 128 25 8-8 60c-1 7-6 10-12 7l-15-7c-4-2-6-7-5-12Z" fill={paint("red")} stroke="#ffb099" strokeWidth="1" />
      <path d="M72 154h29m-31 12h29m-31 12h29" stroke="#8d1420" strokeWidth="2" />
      <path d="M53 94h38l85-44v119l-85-39H53Z" fill={paint("metal")} stroke="#efcc80" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m90 94 86-44v17l-85 39Z" fill="#fff2b4" fillOpacity=".7" />
      <path d="m91 119 85 36v14l-85-39Z" fill="#81501b" />
      <rect x="42" y="90" width="24" height="45" rx="10" fill={paint("metal")} stroke="#efd392" />
      <ellipse cx="176" cy="108" rx="28" ry="62" fill={paint("metal")} stroke="#ffe8a4" strokeWidth="2" />
      <ellipse cx="178" cy="108" rx="20" ry="51" fill="#2c2118" />
      <ellipse cx="182" cy="108" rx="12" ry="42" fill="#0f0e0d" />
      <path d="M170 63c-15 19-20 61-6 88" stroke="#fff7d5" strokeWidth="2" strokeLinecap="round" />
    </g>}
  </svg>;
}
