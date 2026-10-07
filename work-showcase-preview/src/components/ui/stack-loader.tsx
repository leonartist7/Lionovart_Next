"use client";

// Adapted from the supplied Hyperiux Vault stack-loader: stack → spread → reveal.
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/dist/SplitText';
import './stack-loader.css';

gsap.registerPlugin(SplitText);

interface StackLoaderProps {
  children?: ReactNode;
  active: boolean;
  images: string[];
  onComplete: () => void;
  imageSize?: number;
  duration?: number;
  fadeOutDuration?: number;
  backgroundColor?: string;
}
const clamp = (value: number, min: number, max: number, fallback: number) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export default function StackLoader({ children, active, images, onComplete, imageSize = 1, duration = 1, fadeOutDuration = .45, backgroundColor = '#F5F0EB' }: StackLoaderProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLParagraphElement>(null);
  const rightRef = useRef<HTMLParagraphElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const skipRef = useRef<(() => void) | null>(null);
  const completeRef = useRef(onComplete);
  const safeSize = clamp(imageSize, .5, 2.5, 1);
  const safeDuration = clamp(duration, .25, 3, 1);
  const safeFade = clamp(fadeOutDuration, .1, 3, .45);
  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const stack = stackRef.current;
    if (!active || !root || !stack) return;
    let finished = false;
    let timeline: gsap.core.Timeline | undefined;
    const splits: SplitText[] = [];
    const overflow = document.body.style.overflow;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finish = () => {
      if (finished) return;
      finished = true;
      timeline?.kill();
      completeRef.current();
    };
    skipRef.current = finish;
    document.body.style.overflow = 'hidden';
    root.focus({ preventScroll: true });
    const preferenceChanged = () => { if (media.matches) finish(); };
    media.addEventListener('change', preferenceChanged);
    const failOpen = window.setTimeout(finish, Math.min(12000, safeDuration * 4500 + 1500));
    let preparationTimer = 0;
    const context = gsap.context(() => {
      gsap.set(stack, { xPercent: -50, yPercent: 450, opacity: 0 });
      gsap.set(imageRefs.current.filter(Boolean), { opacity: 0 });
    }, root);

    const begin = () => {
      window.clearTimeout(preparationTimer);
      if (finished) return;
      if (media.matches) { finish(); return; }
      try {
        context.add(() => {
          const frames = imageRefs.current.filter((frame): frame is HTMLDivElement => Boolean(frame));
          if (!frames.length || !leftRef.current || !rightRef.current) { finish(); return; }
          const left = SplitText.create(leftRef.current, { type: 'words' });
          const right = SplitText.create(rightRef.current, { type: 'words' });
          splits.push(left, right);
          const words = [...left.words, ...right.words];
          gsap.set(words, { rotateX: 90, opacity: 0, transformPerspective: 1000, transformOrigin: '50% 100%' });
          gsap.set([leftRef.current, rightRef.current], { opacity: 1 });
          gsap.set(frames, { zIndex: index => index });
          timeline = gsap.timeline({ onComplete: finish, defaults: { ease: 'power3.inOut' } });
          timeline.timeScale(1 / safeDuration);
          timeline.to(stack, { yPercent: -50, opacity: 1, duration: .4, ease: 'power3.out' })
            .to(frames, { opacity: 1, duration: .35 }, '<')
            .to(words, { rotateX: 0, opacity: 1, duration: .5, stagger: .06, ease: 'power3.out' }, '<+.25')
            .to(frames, { scale: index => 1 + index * .15, yPercent: index => -index * 20, duration: .7, stagger: { each: .015, from: 'end' }, onStart: () => { root.dataset.phase = 'stack'; } }, '<+.1')
            .to(frames, { scale: 1, yPercent: index => -110 * (frames.length - 1) / 2 + index * 110, duration: .85, stagger: { each: .015, from: 'end' }, onStart: () => { root.dataset.phase = 'spread'; } }, '+=.15')
            .to(words, { opacity: 0, rotateX: 90, transformOrigin: '50% 0%', duration: .4, stagger: .04 }, '<+.4')
            .to(frames, { opacity: 0, duration: safeFade, stagger: { each: .045, from: 'end' } }, '<+.55')
            .to(root, { opacity: 0, duration: safeFade, ease: 'power3.out', onStart: () => { root.dataset.phase = 'reveal'; } }, '<+.25');
        });
      } catch { finish(); }
    };
    const ready = Promise.all([
      document.fonts.ready,
      ...Array.from(root.querySelectorAll('img')).map(image => image.decode().catch(() => undefined))
    ]);
    const deadline = new Promise<void>(resolve => { preparationTimer = window.setTimeout(resolve, 800); });
    void Promise.race([ready, deadline]).then(begin, finish);
    return () => {
      finished = true;
      window.clearTimeout(preparationTimer);
      window.clearTimeout(failOpen);
      timeline?.kill();
      splits.forEach(split => split.revert());
      context.revert();
      media.removeEventListener('change', preferenceChanged);
      document.body.style.overflow = overflow;
      skipRef.current = null;
    };
  }, [active, images, safeDuration, safeFade]);

  return <>
    <div className="lv-loader-content" inert={active} aria-hidden={active || undefined} aria-busy={active}>{children}</div>
    {active && <section ref={rootRef} tabIndex={-1} className="lv-stack-loader" data-phase="prepare" style={{ backgroundColor }} role="dialog" aria-modal="true" aria-label="LIONOVART work intro" onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); skipRef.current?.(); }
      if (event.key === 'Tab') { event.preventDefault(); rootRef.current?.querySelector<HTMLButtonElement>('button')?.focus(); }
    }}>
      <p className="lv-sr-only" role="status">Loading work.</p>
      <button className="lv-loader-skip" type="button" onClick={() => skipRef.current?.()}>Skip intro <span aria-hidden="true">↗</span></button>
      <p ref={leftRef} className="lv-loader-left" aria-hidden="true">YOUR STORY.</p>
      <div ref={stackRef} className="lv-loader-stack" aria-hidden="true" style={{ width: `clamp(64px,${6.5 * safeSize}vw,112px)`, height: `clamp(64px,${6.5 * safeSize}vw,112px)` }}>
        {images.map((image, index) => <div key={`${image}-${index}`} ref={element => { imageRefs.current[index] = element; }} className="lv-loader-frame"><img src={image} alt="" width={400} height={400} decoding="async" onError={event => { event.currentTarget.style.visibility = 'hidden'; }} /></div>)}
      </div>
      <p ref={rightRef} className="lv-loader-right" aria-hidden="true">Our direction.</p>
      <div className="lv-loader-signature" aria-hidden="true"><span>LIONÖVART<sup>®</sup></span><small>WORK</small></div>
    </section>}
  </>;
}
