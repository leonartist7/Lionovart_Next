'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScenePortal, usePinnedScene } from './PinnedScene';
import { cardHandoff } from '../card-handoff';
import { galleryLayout, galleryRingDiameter } from '../gallery-layout';
import { doorwayZoom, serviceGalleryHandoff } from '../service-gallery-handoff';
import styles from './ServicePortal.module.css';

const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** One opaque service disc lifts, turns to the viewer and passes around its iris. */
export default function ServicePortal() {
  const scene = usePinnedScene();
  const { locale } = useLanguage();
  const [origin, setOrigin] = useState<'center' | 'above' | 'below'>('below');
  const switchOrigin = () => setOrigin(value => value === 'center' ? 'above' : value === 'above' ? 'below' : 'center');
  const pedestal = useRef<HTMLDivElement>(null), ring = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLButtonElement>(null), fill = useRef<HTMLSpanElement>(null);
  const invitation = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const target = scene?.target, node = ring.current;
    if (!target || !node) return;
    const world = target.closest('[data-service-world]');
    const gallery = world?.querySelector<HTMLElement>('[data-gallery-runway]');
    const anchor = world?.querySelector<HTMLElement>('[data-service-podium-anchor]');
    const exit = world?.querySelector<HTMLElement>('[data-card-exit]');
    if (!gallery || !anchor) return;
    let frame = 0, disposed = false, dirty = true, reads = 0;
    let geometry = { h:innerHeight, w:innerWidth, diameter:1, top:0, exitTop:0, exitHeight:1,
      anchorX:0, anchorY:0, anchorWidth:1, angle:0, rem:16 };
    const sync = () => {
      frame = 0;
      if (document.hidden) return;
      if (dirty) {
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const h = innerHeight, w = document.documentElement.clientWidth;
        const g = gallery.getBoundingClientRect(), a = anchor.getBoundingClientRect(), e = exit?.getBoundingClientRect();
        const diameter = galleryRingDiameter(galleryLayout(innerWidth,h,w,rem));
        geometry = { h,w,diameter,rem,top:scrollY+g.top,exitTop:scrollY+(e?.top ?? 0),exitHeight:e?.height ?? 1,
          anchorX:a.x+a.width/2,anchorY:a.y+a.height/2,anchorWidth:a.width,
          angle:Math.acos(Math.min(1,a.height/Math.max(1,a.width)))*180/Math.PI };
        node.style.width = `${diameter}px`;
        if (pedestal.current) pedestal.current.style.width = `${diameter}px`;
        node.dataset.geometryReads = String(++reads);
        dirty = false;
      }
      const {h,w,diameter,top,exitTop,exitHeight,anchorX,anchorY,anchorWidth,angle,rem} = geometry;
      const handoff = serviceGalleryHandoff(top-scrollY,h);
      const opening = exit ? cardHandoff(exitTop-scrollY,exitHeight,h).serviceCopy : 1;
      const centered = origin === 'center', fromBelow = origin === 'below';
      const visible = opening > .001 && handoff.progress < .999;
      node.style.visibility = visible ? 'visible' : 'hidden';
      if (face.current) {
        const interactive = visible && opening > .95 && handoff.progress < .60;
        face.current.disabled = !interactive;
        face.current.style.pointerEvents = interactive ? 'auto' : 'none';
      }
      if (!visible) { if(pedestal.current)pedestal.current.style.visibility='hidden'; return; }
      const lift = handoff.podiumLift, pass = handoff.portalPass;
      const door = Math.min(w*.84,h*.70);
      const x = mix(anchorX,w/2,lift);
      const y = mix(fromBelow ? anchorY : Math.max(3.75*rem,h*.08),h*.48,lift);
      const size = mix(mix(anchorWidth,door,lift),diameter,pass);
      const zoom = doorwayZoom(handoff.progress);
      // Both entrance paths advance in positive depth as the aperture opens.
      node.style.transform = centered
        ? `translate3d(${w/2}px,${h*.48}px,${zoom.z}px) translate(-50%,-50%) scale(${zoom.size})`
        : `translate3d(${x}px,${y}px,${850*pass}px) translate(-50%,-50%) scale(${size/diameter})`;
      node.style.opacity = '1';
      node.dataset.portalProgress = handoff.progress.toFixed(3);
      if (face.current) face.current.style.transform = `rotateX(${centered ? 0 : (fromBelow ? 1 : -1)*angle*(1-handoff.podiumFace)}deg)`;
      if (pedestal.current) {
        const shown = centered && zoom.pedestal > .001;
        pedestal.current.style.visibility = shown ? 'visible' : 'hidden';
        if(shown) {
          pedestal.current.style.transform = `translate3d(${anchorX}px,${anchorY}px,0) translate(-50%,-50%) scale(${anchorWidth/diameter})`;
          const podiumFace=pedestal.current.firstElementChild as HTMLElement|null;
          if(podiumFace)podiumFace.style.transform=`rotateX(${angle}deg)`;
        }
      }
      if (fill.current) {
        const hole = handoff.portalOpen*72;
        fill.current.style.maskImage = hole<=0 ? 'none' : `radial-gradient(circle at 50% 50%,transparent ${hole}%,#000 ${hole+.45}%)`;
        fill.current.dataset.iris = handoff.portalOpen.toFixed(3);
      }
      if (invitation.current) {
        invitation.current.style.setProperty('--invitation-lead',String(handoff.step));
        invitation.current.style.setProperty('--invitation-work',String(handoff.title));
        const shown=Math.max(handoff.step,handoff.title)>.001;
        invitation.current.style.visibility=shown?'visible':'hidden';
        invitation.current.setAttribute('aria-hidden',String(!shown));
      }
    };
    const schedule = () => { if (!disposed && !frame) frame=requestAnimationFrame(sync); };
    const refresh = () => { dirty=true; schedule(); };
    const resize = new ResizeObserver(refresh);
    resize.observe(gallery); resize.observe(anchor); if(world)resize.observe(world);
    const mutations = new MutationObserver(refresh);
    if (world) mutations.observe(world,{childList:true,subtree:true});
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',refresh);
    window.addEventListener('lionovart:story-layout',refresh);
    world?.addEventListener('load',refresh,true);
    document.addEventListener('visibilitychange',schedule);
    void document.fonts.ready.then(refresh); sync();
    return () => {
      disposed=true;cancelAnimationFrame(frame);resize.disconnect();mutations.disconnect();
      window.removeEventListener('scroll',schedule);window.removeEventListener('resize',refresh);
      window.removeEventListener('lionovart:story-layout',refresh);world?.removeEventListener('load',refresh,true);
      document.removeEventListener('visibilitychange',schedule);
    };
  },[scene?.target,origin,locale]);
  if (!scene?.target) return null;
  return <ScenePortal><div className={styles.space} data-service-portal data-scroll-title-skip>
    <div ref={pedestal} className={styles.carrier} data-service-pedestal aria-hidden="true"><span className={styles.ring}><span className={styles.fill}/></span></div>
    <div ref={ring} className={styles.carrier} data-service-podium data-disc-origin={origin}>
      <button ref={face} type="button" className={styles.ring} onClick={switchOrigin}
        aria-label={locale==='fr'?'Changer l’entrée du cercle':'Change the circle entrance'}>
        <span ref={fill} className={styles.fill}/>
        <span ref={invitation} className={styles.invitation} data-gallery-title aria-hidden="true">
          <span className={styles.invitationLead} data-invitation-lead>{locale==='fr'?'Entrez dans l’univers':'Step inside'}</span>
          <span role="heading" aria-level={2} id="selected-work-heading" className={styles.invitationWork} data-invitation-work>{locale==='fr'?'de nos réalisations':'our selected work'}</span>
        </span>
      </button>
    </div>
  </div></ScenePortal>;
}
