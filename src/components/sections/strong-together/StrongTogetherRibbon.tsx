"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap } from "gsap";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./StrongTogetherRibbon.module.css";

const COPIES = 16;
const SPACING = "\u00a0".repeat(6);

type Props = { active: boolean; reducedMotion: boolean };

export default function StrongTogetherRibbon({ active, reducedMotion }: Props) {
  const { t } = useLanguage();
  const phrases = t.marquee.items;
  const phraseKey = phrases.join("|");
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const measureRefs = useRef<(SVGTextElement | null)[]>([]);
  const unitMeasureRef = useRef<SVGTextElement>(null);
  const textPathRef = useRef<SVGTextPathElement>(null);
  const crownRefs = useRef<(SVGUseElement | null)[]>([]);
  const [size, setSize] = useState({ width: 1200, height: 360 });
  const [nearView, setNearView] = useState(false);
  const id = useId().replace(/:/g, "");
  const pathId = `strong-ribbon-path-${id}`;
  const crownId = `strong-ribbon-crown-${id}`;
  const fontSize = Math.max(23, Math.min(38, size.width * 0.034));
  const ribbonWidth = Math.max(48, Math.min(68, size.width * 0.061));
  const crownSize = fontSize;
  const curve = `M ${-size.width * 0.22} ${size.height * 0.91} Q ${size.width * 0.5} ${-size.height * 0.65} ${size.width * 1.22} ${size.height * 0.91}`;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      setSize((previous) =>
        Math.abs(previous.width - width) < 1 && Math.abs(previous.height - height) < 1
          ? previous
          : { width, height }
      );
    });
    observer.observe(root);
    const viewObserver = new IntersectionObserver(
      ([entry]) => setNearView(entry.isIntersecting),
      { rootMargin: "150px" }
    );
    viewObserver.observe(root);
    return () => {
      observer.disconnect();
      viewObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const path = pathRef.current;
    const textPath = textPathRef.current;
    const unitMeasure = unitMeasureRef.current;
    const measures = measureRefs.current.slice(0, phrases.length);
    if (!path || !textPath || !unitMeasure || measures.some((measure) => !measure) || !size.width) return;
    let disposed = false;
    let tween: gsap.core.Tween | undefined;

    const setPositions = (offset: number, widths: number[], unitWidth: number) => {
      textPath.setAttribute("startOffset", String(offset));
      const length = path.getTotalLength();
      const gap = (unitWidth - widths.reduce((sum, width) => sum + width, 0)) / widths.length;
      const starts = widths.map((_, index) => widths.slice(0, index).reduce((sum, width) => sum + width + gap, 0));
      crownRefs.current.forEach((crown, index) => {
        if (!crown) return;
        // SVG textPath spacing and symbol placement use different glyph bounds;
        // keep the crown toward the start of the reserved separator space.
        const phrase = index % widths.length;
        const cycle = Math.floor(index / widths.length);
        const distance = offset + cycle * unitWidth + starts[phrase] + widths[phrase] + gap * 0.12;
        if (distance < 0 || distance > length) {
          crown.style.visibility = "hidden";
          return;
        }
        crown.style.visibility = "visible";
        const point = path.getPointAtLength(distance);
        const before = path.getPointAtLength(Math.max(0, distance - 1));
        const after = path.getPointAtLength(Math.min(length, distance + 1));
        const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
        crown.setAttribute(
          "transform",
          `translate(${point.x} ${point.y}) rotate(${angle}) translate(${-crownSize / 2} ${-crownSize / 2}) scale(${crownSize / 512})`
        );
      });
    };

    const start = () => {
      if (disposed) return;
      tween?.kill();
      const widths = measures.map((measure) => measure?.getComputedTextLength() ?? 0);
      if (widths.some((width) => !width)) return;
      const unitWidth = unitMeasure.getComputedTextLength();
      const progress = { offset: reducedMotion ? -unitWidth * 0.25 : 0 };
      setPositions(progress.offset, widths, unitWidth);
      if (active && nearView && !reducedMotion) {
        tween = gsap.to(progress, {
          offset: -unitWidth,
          duration: unitWidth / 60,
          ease: "none",
          repeat: -1,
          onUpdate: () => setPositions(progress.offset, widths, unitWidth),
        });
      }
    };

    start();
    document.fonts?.ready.then(start);
    return () => {
      disposed = true;
      tween?.kill();
    };
  }, [active, nearView, reducedMotion, size, fontSize, crownSize, phraseKey, phrases]);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <svg ref={svgRef} className={styles.svg} viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none">
        <defs>
          <path id={pathId} ref={pathRef} data-ribbon-curve d={curve} />
          <symbol id={crownId} viewBox="0 0 512 512">
            <path d="m511.43 133.89-59.81 204.91-17.7 60.58h-355.84l-17.7-60.58-59.81-204.91a13.65 13.65 0 0 1 18.65-16.3l130.38 57.9 95.16-137.75a13.66 13.66 0 0 1 22.48 0l95.16 137.75 130.38-57.9a13.66 13.66 0 0 1 18.65 16.3z" fill="#ffb703" />
            <path d="m451.62 338.81-17.7 60.58h-355.84l-17.7-60.58z" fill="#f99300" />
            <path d="m511.43 133.89-59.81 204.91-17.7 60.58h-255.52c122.89-54.68 180-137 184-223.89l130.38-57.9a13.66 13.66 0 0 1 18.65 16.3z" fill="#f99300" />
            <path d="m488.83 419.58a60.59 60.59 0 0 1 -60.57 60.58h-344.52a60.58 60.58 0 0 1 0-121.16h344.52a63.11 63.11 0 0 1 8.3.56 60.58 60.58 0 0 1 52.27 60z" fill="#f99300" />
            <path d="m487.63 407.57a60.57 60.57 0 0 1 -59.37 48.56h-344.52a60.59 60.59 0 0 1 -59.37-48.56 60.59 60.59 0 0 1 59.37-48.57h344.52a60.57 60.57 0 0 1 59.37 48.57z" fill="#ffb703" />
            <path d="m488.83 419.58a60.59 60.59 0 0 1 -60.57 60.58h-344.52a60.55 60.55 0 0 1 -51.7-29c9.35.19 19.18.44 29.55.79 406.95 13.6 366.67-92.95 366.67-92.95l8.3.56a60.58 60.58 0 0 1 52.27 60z" fill="#f99300" />
            <g fill="none" stroke="#ffcc29" strokeLinecap="round" strokeWidth="16.84"><path d="m251.75 70.27-73.35 103.59"/><path d="m24.37 139.01 99.66 44.3"/><path d="m239.53 375.5h49.54"/><path d="m76.15 375.5h121.55"/></g>
          </symbol>
        </defs>
        <path d={curve} fill="none" stroke="#dc0f0f" strokeWidth={ribbonWidth} strokeLinecap="round" />
        {phrases.map((phrase, index) => <text key={`${phrase}-${index}`} ref={(element) => { measureRefs.current[index] = element; }} className={styles.measure} fontSize={fontSize} letterSpacing="2.2" fontWeight="800">{phrase}</text>)}
        <text ref={unitMeasureRef} className={styles.measure} fontSize={fontSize} letterSpacing="2.2" fontWeight="800">{phrases.map((phrase, index) => <tspan key={`${phrase}-${index}`}>{phrase}{SPACING}</tspan>)}</text>
        <text className={styles.label} fontSize={fontSize} letterSpacing="2.2" fontWeight="800" dy={fontSize * 0.32}>
          <textPath ref={textPathRef} href={`#${pathId}`}>{Array.from({ length: COPIES }, (_, cycle) => phrases.map((phrase, index) => <tspan key={`${cycle}-${index}`}>{phrase}{SPACING}</tspan>))}</textPath>
        </text>
        {Array.from({ length: COPIES * phrases.length }, (_, i) => <use key={i} ref={(el) => { crownRefs.current[i] = el; }} href={`#${crownId}`} />)}
      </svg>
    </div>
  );
}
