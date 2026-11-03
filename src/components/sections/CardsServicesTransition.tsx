'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScenePortal, usePinnedScene } from './service-world/PinnedScene';
import { STORY_STATIC_QUERY } from './gallery-layout';
import { cardBridgeFrame, type BridgeFrame } from './card-bridge';
import { cardTransportRect, type CardRect } from './card-transport';
import { serviceGalleryHandoff } from './service-gallery-handoff';
import { cardHandoff } from './card-handoff';
import styles from './ScreeningRoom.module.css';

export default function CardsServicesTransition({ children }: { children: ReactNode }) {
  const scene = usePinnedScene();
  const intro = useRef<HTMLDivElement>(null), exit = useRef<HTMLDivElement>(null);
  const message = useRef<HTMLDivElement>(null);
  const { locale } = useLanguage();
  useEffect(() => {
    const node = (scene?.target?.querySelector('[data-scene-opening]') ?? intro.current) as HTMLElement | null, runway = exit.current, copy = message.current;
    if (!node || !runway || !copy) return;
    const world = node.closest('[data-service-world]');
    const media = matchMedia(STORY_STATIC_QUERY);
    let frame = 0, dirty = true;
    let sources: { node:HTMLElement; base:BridgeFrame }[] = [];
    const rect = (node:Element):CardRect => { const r=node.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,width:r.width,height:r.height}; };
    const clear = (pane:HTMLElement) => {
      for(const key of ['x','y','scale','depth','material','benefit','object']) pane.style.removeProperty(`--handoff-${key}`);
      pane.style.removeProperty('z-index');
    };
    const sync = () => {
      frame = 0;
      const isStatic = scene?.staticLayout ?? media.matches;
      const bounds = runway.getBoundingClientRect();
      const pose = cardHandoff(bounds.top, bounds.height, innerHeight);
      const gallery = world?.querySelector('[data-gallery-runway]')?.getBoundingClientRect();
      const remaining = gallery ? serviceGalleryHandoff(gallery.top,innerHeight).services : 1;
      node.style.opacity = isStatic ? '1' : String(remaining);
      node.dataset.cardHandoffActive = String(!isStatic && pose.progress > .46);
      node.style.removeProperty('--handoff-scale'); node.style.removeProperty('--handoff-y');
      const services = world?.querySelector<HTMLElement>('[data-services-stage]');
      services?.style.setProperty('--service-opening-copy', String(isStatic ? 1 : pose.serviceCopy));
      services?.style.setProperty('--service-opening-expertise', String(isStatic ? 1 : pose.expertise));
      services?.style.setProperty('--service-opening-sides','1');
      const panes = [...node.querySelectorAll<HTMLElement>('[data-persistent-card]')];
      const targets = [...(services?.querySelectorAll<HTMLElement>('[data-service-card-target]') ?? [])];
      if (isStatic || pose.progress < .50 || panes.length !== 3 || targets.length !== 3) {
        panes.forEach(pane => { clear(pane); const slot=pane.querySelector<HTMLElement>('[data-persistent-service-slot]'); if(slot){slot.style.opacity='0';slot.inert=true;} });
        dirty = true;
      } else {
        if (dirty || sources.some((source,index)=>source.node!==panes[index])) {
          panes.forEach(clear);
          sources = panes.map(pane => {
            const r=rect(pane), matrix=new DOMMatrixReadOnly(getComputedStyle(pane).transform);
            return {node:pane,base:{...r,parentX:r.width/Math.max(1,pane.offsetWidth),parentY:r.height/Math.max(1,pane.offsetHeight),motionX:matrix.m41,motionY:matrix.m42}};
          });
          dirty = false;
        }
        // Read all live target geometry before writing any frame. These targets
        // never paint artwork; the original three opening panes are the cards.
        const destination = targets.map(target => ({
          rect:rect(target.querySelector('[data-service-frame-target]')!),
          opacity:Number(getComputedStyle(target).opacity), selected:target.dataset.position==='center',
        }));
        const center = destination.find(target=>target.selected) ?? destination[1];
        sources.forEach(({node:pane,base},index)=>{
          const target=destination[index];
          const desired=cardTransportRect(base,sources[1].base,target.rect,center.rect,index,target.selected,pose);
          const fitted=cardBridgeFrame(base,desired,1,1,false);
          pane.style.setProperty('--handoff-x',`${fitted.x}px`);
          pane.style.setProperty('--handoff-y',`${fitted.y}px`);
          pane.style.setProperty('--handoff-scale',`${fitted.sx} ${fitted.sy}`);
          pane.style.setProperty('--handoff-depth',String(1+(target.opacity-1)*pose.spread));
          pane.style.setProperty('--handoff-material',String(1-pose.serviceReveal));
          pane.style.setProperty('--handoff-benefit',String(pose.benefit));
          pane.style.setProperty('--handoff-object',String(1-pose.gather));
          pane.style.zIndex=String(pose.reshape>.5?(target.selected?3:1):(index===1?3:1));
          const face=pane.querySelector<HTMLElement>('[data-handoff-surface] > div');
          if(face)face.inert=pose.benefit<.1;
          const slot=pane.querySelector<HTMLElement>('[data-persistent-service-slot]');
          if(slot){
            const totalX=base.parentX*fitted.sx,totalY=base.parentY*fitted.sy;
            slot.style.width=`${desired.width}px`;slot.style.height=`${desired.height}px`;
            slot.style.transform=`translate(-50%,-50%) scale(${1/totalX},${1/totalY})`;
            slot.style.opacity=String(pose.serviceReveal);
            const interactive=pose.serviceCopy>.8&&services?.dataset.chapterActive==='true';
            slot.inert=!interactive;slot.style.pointerEvents=interactive?'auto':'none';
          }
        });
      }
      node.style.setProperty('--handoff-proof', String(isStatic ? 1 : pose.proof));
      // Keep the reading face clickable through its transport and hold.
      // It retires only once no painted content remains.
      node.inert = !isStatic && remaining < .001;
      node.querySelectorAll<HTMLElement>('.opening-proof-stage').forEach(proof=>{proof.inert=!isStatic&&pose.proof<.01;});
      node.style.setProperty('--handoff-sculpture', String(isStatic ? 1 : pose.sculpture));
      node.style.setProperty('--handoff-lift', `${isStatic ? 0 : -24 * pose.focus}px`);
      copy.style.visibility = isStatic || Math.max(pose.copy, pose.brand) > .001 ? 'visible' : 'hidden';
      for (const beat of ['lead', 'main', 'necessity', 'brand'] as const) {
        const element = copy.querySelector<HTMLElement>(`[data-brand-beat=${beat}]`);
        if (!element) continue;
        const presence = isStatic ? 1 : pose[beat];
        element.style.opacity = String(presence);
        element.setAttribute('aria-hidden', String(presence === 0));
      }
      const pointerPlane = node.querySelector<HTMLElement>('[data-opening-pointer]');
      if (pointerPlane) pointerPlane.style.setProperty('--handoff-pointer', String(isStatic ? 0 : pose.pointer));
      runway.dataset.handoffProgress = pose.progress.toFixed(3);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const resize = () => { dirty=true; schedule(); };
    const observer = new ResizeObserver(resize); observer.observe(node);
    const replacements = new MutationObserver(() => { dirty=true; schedule(); });
    if (world) replacements.observe(world, { childList: true, subtree: true });
    const parentGeometry = new MutationObserver(resize);
    const group=node.querySelector('.opening-card-morph');
    if(group)parentGeometry.observe(group,{attributes:true,attributeFilter:['style']});
    const geometry = new ResizeObserver(resize);
    node.querySelectorAll('[data-persistent-card]').forEach(pane=>geometry.observe(pane));
    world?.querySelectorAll('[data-service-frame-target]').forEach(target=>geometry.observe(target));
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', resize);
    window.addEventListener('lionovart:service-pose',schedule);
    media.addEventListener('change', resize); void document.fonts.ready.then(resize); sync();
    return () => {
      world?.querySelector<HTMLElement>('[data-services-stage]')?.style.removeProperty('--service-opening-copy');
      world?.querySelector<HTMLElement>('[data-services-stage]')?.style.removeProperty('--service-opening-expertise');
      world?.querySelector<HTMLElement>('[data-services-stage]')?.style.removeProperty('--service-opening-sides');
      sources.forEach(({node:pane})=>clear(pane));
      node.style.opacity = ''; node.inert = false; delete node.dataset.cardHandoffActive;
      cancelAnimationFrame(frame); observer.disconnect(); geometry.disconnect(); parentGeometry.disconnect(); replacements.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', resize);
      window.removeEventListener('lionovart:service-pose',schedule);media.removeEventListener('change', resize);
    };
  }, [scene?.target, scene?.staticLayout, scene?.cardSlots]);
  return <div className={styles.cardTransition} data-card-transition data-scroll-manual>
    <div ref={intro} className={styles.cardIntro}>{children}</div>
    <ScenePortal><div ref={message} className={styles.shapingMessage} data-shaping-message data-scroll-title-skip>
      <div className={styles.brandStatement} data-brand-statement>
        <p data-brand-beat="lead">{locale === 'fr' ? 'Pour mener le changement,' : 'To lead today,'}</p>
        <h2><span data-brand-beat="main">{locale === 'fr' ? 'l’innovation n’est pas une option.' : 'innovation isn’t optional.'}</span>
          <span data-brand-beat="necessity" className={styles.necessity}>{locale === 'fr' ? 'C’est une nécessité.' : 'It’s a necessity.'}</span></h2>
      </div>
      <p data-brand-beat="brand" className={styles.brandSignature}>LIONOVART</p>
    </div></ScenePortal>
    <div ref={exit} className={styles.cardExit} data-card-exit aria-hidden="true" />
  </div>;
}
