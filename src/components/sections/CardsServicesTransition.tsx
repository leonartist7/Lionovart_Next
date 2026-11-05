'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScenePortal, usePinnedScene } from './service-world/PinnedScene';
import { STORY_STATIC_QUERY } from './gallery-layout';
import { cardBridgeFrame, type BridgeFrame } from './card-bridge';
import { cardReadingStack, cardTransportRect, type CardRect } from './card-transport';
import { serviceGalleryHandoff } from './service-gallery-handoff';
import { cardHandoff } from './card-handoff';
import { cardLettering, cardTailOpacity } from './card-lettering';
import styles from './ScreeningRoom.module.css';

export default function CardsServicesTransition({ children }: { children: ReactNode }) {
  const scene = usePinnedScene();
  const intro = useRef<HTMLDivElement>(null), exit = useRef<HTMLDivElement>(null);
  const message = useRef<HTMLDivElement>(null);
  const { locale } = useLanguage();
  const readingPose = useRef<number | null>(null), restorePose = useRef<number | null>(null), pendingPose = useRef<number | null>(null);
  const restoringFlow = useRef(false);
  // A short landscape viewport switches to the existing reading-flow layout.
  // Keep the same narrative beat across that ownership change.
  useEffect(() => {
    const remember = () => {
      // Use the last reading state, rather than post-resize geometry: the
      // phone film reflows before the layout-change event is dispatched.
      restorePose.current ??= readingPose.current;
    };
    window.addEventListener('lionovart:story-layout-will-change', remember);
    return () => window.removeEventListener('lionovart:story-layout-will-change', remember);
  }, [scene?.staticLayout]);
  useEffect(() => {
    const remembered = restorePose.current;
    if (remembered === null) return;
    restorePose.current = null;
    if (!scene?.staticLayout) pendingPose.current = remembered;
    restoringFlow.current = !!scene?.staticLayout;
    let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(() => {
      const runway = exit.current, copy = message.current;
      if (!runway || !copy) return;
      const bounds = runway.getBoundingClientRect();
      const top = scene?.staticLayout
        ? scrollY + copy.getBoundingClientRect().top - 64
        : scrollY + bounds.top - innerHeight + remembered * (bounds.height + innerHeight);
      window.scrollTo({ top, behavior:'instant' });
      restoringFlow.current = false;
    }); });
    return () => { cancelAnimationFrame(frame); restoringFlow.current = false; };
  }, [scene?.staticLayout]);
  useEffect(() => {
    const node = (scene?.target?.querySelector('[data-scene-opening]') ?? intro.current) as HTMLElement | null, runway = exit.current, copy = message.current;
    if (!node || !runway || !copy) return;
    const world = node.closest('[data-service-world]');
    const ambient = node.querySelector<HTMLElement>('[data-opening-ambient]');
    const media = matchMedia(STORY_STATIC_QUERY);
    let frame = 0, dirty = true;
    let sources: { node:HTMLElement; base:BridgeFrame; reading:CardRect; unit:number; objectWidth:number }[] = [];
    const mix = (a:number,b:number,p:number) => a+(b-a)*p;
    const rect = (node:Element):CardRect => { const r=node.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,width:r.width,height:r.height}; };
    const clear = (pane:HTMLElement) => {
      for(const key of ['x','y','scale','depth','material','benefit','object','object-width','object-height','object-right','object-top','white','identity','assembly','tail','corner','art-x','art-y','art-scale']) pane.style.removeProperty(`--handoff-${key}`);
      pane.style.removeProperty('z-index');
      for(const key of ['size','scale-x','offset-x','x','y']) pane.style.removeProperty(`--identity-${key}`);
      const face=pane.querySelector<HTMLElement>('[data-handoff-surface] > div');
      if(face)face.inert=false;
    };
    const sync = () => {
      frame = 0;
      const isStatic = scene?.staticLayout ?? media.matches;
      let bounds = runway.getBoundingClientRect();
      if (!isStatic && pendingPose.current !== null) {
        const target = scrollY + bounds.top - innerHeight + pendingPose.current * (bounds.height + innerHeight);
        if (Math.abs(target-scrollY) > 1) {
          // Refit after the existing film/card measurements reflow. An ordinary
          // scroll frame relinquishes this bookmark immediately.
          if (dirty) { window.scrollTo({top:target,behavior:'instant'}); bounds=runway.getBoundingClientRect(); }
          else pendingPose.current = null;
        }
      }
      const pose = cardHandoff(bounds.top, bounds.height, innerHeight);
      if (!isStatic && restorePose.current === null && pendingPose.current === null) readingPose.current = pose.progress > .02 && pose.progress < .995 ? pose.progress : null;
      const gallery = world?.querySelector('[data-gallery-runway]')?.getBoundingClientRect();
      const remaining = gallery ? serviceGalleryHandoff(gallery.top,innerHeight).services : 1;
      node.style.opacity = isStatic ? '1' : String(remaining);
      // This copy lives in its own scene portal: settle it even when a fast
      // scroll skips directly past the card owner into the doorway.
      copy.style.visibility = isStatic || Math.max(pose.copy, pose.brand) > .001 ? 'visible' : 'hidden';
      for (const beat of ['lead', 'main', 'necessity', 'brand'] as const) {
        const element = copy.querySelector<HTMLElement>(`[data-brand-beat=${beat}]`);
        if (!element) continue;
        const presence = isStatic ? 1 : pose[beat];
        element.style.opacity = String(presence);
        element.setAttribute('aria-hidden', String(presence === 0));
      }
      copy.style.setProperty('--claim-rewrite',String(isStatic ? 1 : pose.claim));
      copy.style.setProperty('--claim-strike',String(isStatic ? 1 : pose.strike));
      copy.querySelector('[data-brand-optional]')?.setAttribute('aria-hidden',String(isStatic || pose.claim >= .999));
      const letteringLayer=scene?.target?.querySelector<HTMLElement>('[data-card-lettering-layer]');
      const identities=[...(letteringLayer?.querySelectorAll<HTMLElement>('[data-card-identity]') ?? [])];
      if(letteringLayer) letteringLayer.style.opacity=String(isStatic || node.querySelector('[data-film-active=true]') ? 0 : remaining);
      const placeIdentity=(index:number,desired:CardRect,assembly:number,units:number[])=>{
        const identity=identities[index]; if(!identity || !letteringLayer)return;
        const lettering=cardLettering(desired.width,desired.height,units,index,assembly,innerWidth<768);
        const origin=letteringLayer.getBoundingClientRect();
        identity.style.left=`${desired.x-desired.width/2+lettering.x-origin.left}px`;
        identity.style.top=`${desired.y-desired.height/2+lettering.y-origin.top-lettering.size/2}px`;
        identity.style.fontSize=`${lettering.size}px`;
        identity.style.opacity=String(pose.identity);
        return lettering;
      };
      // Once the doorway owns the scene, retire card measurement and writes.
      if (!isStatic && remaining <= .001) { node.inert = true; return; }
      node.dataset.cardHandoffActive = String(!isStatic && pose.white > 0);
      node.dataset.cardReadingInteractive = String(isStatic || pose.benefit > .1);
      node.style.removeProperty('--handoff-scale'); node.style.removeProperty('--handoff-y');
      const services = world?.querySelector<HTMLElement>('[data-services-stage]');
      services?.style.setProperty('--service-opening-copy', String(isStatic ? 1 : pose.serviceCopy));
      services?.style.setProperty('--service-opening-expertise', String(isStatic ? 1 : pose.expertise));
      services?.style.setProperty('--service-opening-sides','1');
      const panes = [...node.querySelectorAll<HTMLElement>('[data-persistent-card]')];
      const targets = [...(services?.querySelectorAll<HTMLElement>('[data-service-card-target]') ?? [])];
      const portrait = innerWidth < 768;
      // Cache the paper's original well: only its clip expands, never a new face.
      panes.forEach(pane=>{
        const paper=pane.querySelector<HTMLElement>('[data-benefit-paper]');
        const well=pane.querySelector<HTMLElement>('[data-benefit-well]');
        const card=pane.querySelector<HTMLElement>('[data-benefit-card]');
        if(!paper||!well||!card||(!dirty&&paper.style.getPropertyValue('--benefit-paper-top')))return;
        const w=well.getBoundingClientRect(),c=card.getBoundingClientRect();
        paper.style.setProperty('--benefit-paper-top',`${Math.max(0,(w.top-c.top)/Math.max(1,c.height))*100}%`);
        paper.style.setProperty('--benefit-paper-left',`${Math.max(0,(w.left-c.left)/Math.max(1,c.width))*100}%`);
      });
      if (isStatic || pose.progress < (portrait ? .001 : .50) || panes.length !== 3 || targets.length !== 3) {
        panes.forEach((pane,index) => {
          clear(pane);
          placeIdentity(index,rect(pane),0,[]);
          identities[index]?.style.setProperty('--handoff-tail','1');
          const slot=pane.querySelector<HTMLElement>('[data-persistent-service-slot]');
          if(slot){slot.style.opacity='0';slot.inert=true;}
        });
        dirty = true;
      } else {
        if (dirty || sources.some((source,index)=>source.node!==panes[index])) {
          panes.forEach(clear);
          const pointer=node.querySelector<HTMLElement>('[data-opening-pointer]');
          const savedPointer=pointer?.style.transform;
          if(pointer) pointer.style.transform='none';
          sources = panes.map((pane,index) => {
            const r=rect(pane), style=getComputedStyle(pane), matrix=new DOMMatrixReadOnly(style.transform);
            // offsetWidth/Height round fractional CSS pixels and misalign the
            // independently transported baselines, especially in a phone stack.
            const parentX=r.width/Math.max(1,parseFloat(style.width)||pane.offsetWidth);
            const parentY=r.height/Math.max(1,parseFloat(style.height)||pane.offsetHeight);
            // Measure each surviving segment once, with the actual loaded font.
            // Absolute tails do not alter the advance or move the segment origin.
            const identity=identities[index];
            if(identity)identity.style.fontSize='50px';
            // The absolute label's advance includes the font's trailing tracking;
            // an inline child rect can be shorter by several pixels on tablets.
            const unit=(identity?.getBoundingClientRect().width ?? 100)/50;
            const object=pane.querySelector<HTMLElement>('[data-floating-card-object]');
            const objectWidth=object ? parseFloat(getComputedStyle(object).width) : 48;
            return {node:pane,base:{...r,parentX,parentY,motionX:matrix.m41,motionY:matrix.m42},reading:r,unit,objectWidth};
          });
          if(pointer) pointer.style.transform=savedPointer ?? '';
          if (portrait) {
            const statement=copy.querySelector<HTMLElement>('[data-brand-statement]');
            const fitted=cardReadingStack(sources.map(source=>source.base),statement?.offsetTop ?? innerHeight*.78,innerWidth);
            sources.forEach((source,index)=>{source.reading=fitted[index];});
          }
          if(sources.some(({base})=>base.width<=1||base.height<=1)) return;
          dirty = false;
        }
        // Read all live target geometry before writing any frame. These targets
        // never paint artwork; the original three opening panes are the cards.
        const destination = targets.map(target => ({
          rect:rect(target.querySelector('[data-service-frame-target]')!),
          opacity:Number(getComputedStyle(target).opacity), selected:target.dataset.position==='center',
        }));
        const center = destination.find(target=>target.selected) ?? destination[1];
        const reading=sources.map(({base,reading})=>({
          x:mix(base.x,reading.x,pose.reading),y:mix(base.y,reading.y,pose.reading),
          width:mix(base.width,reading.width,pose.reading),height:mix(base.height,reading.height,pose.reading),
        }));
        const leader=reading[portrait ? 0 : 1];
        const units=sources.map(source=>source.unit);
        const desiredFrames=reading.map((source,index)=>cardTransportRect(source,leader,destination[index].rect,center.rect,index,destination[index].selected,pose));
        const letters=desiredFrames.map((desired,index)=>cardLettering(desired.width,desired.height,units,index,pose.assembly,portrait));
        sources.forEach(({node:pane,base,objectWidth},index)=>{
          const target=destination[index];
          const desired=desiredFrames[index];
          const fitted=cardBridgeFrame(base,desired,1,1,false);
          pane.style.setProperty('--handoff-x',`${fitted.x}px`);
          pane.style.setProperty('--handoff-y',`${fitted.y}px`);
          pane.style.setProperty('--handoff-scale',`${fitted.sx} ${fitted.sy}`);
          pane.style.setProperty('--handoff-depth',String(1+((target.selected?1:target.opacity)-1)*pose.spread));
          pane.style.setProperty('--handoff-material',String((1-pose.serviceReveal) * (index===2 ? 1 : pose.material)));
          pane.style.setProperty('--handoff-white',String(pose.white));
          pane.style.setProperty('--handoff-assembly',String(pose.assembly));
          pane.style.setProperty('--handoff-identity',String(pose.identity));
          const lettering=letters[index];
          placeIdentity(index,desired,pose.assembly,units);
          if(index<2){
            const next=desiredFrames[index+1],nextLetter=letters[index+1];
            const tailX=desired.x-desired.width/2+lettering.x+units[index]*lettering.size;
            const nextX=next.x-next.width/2+nextLetter.x;
            const tailY=desired.y-desired.height/2+lettering.y;
            const nextY=next.y-next.height/2+nextLetter.y;
            identities[index]?.style.setProperty('--handoff-tail',String(cardTailOpacity(Math.hypot(tailX-nextX,tailY-nextY),lettering.size,pose.assembly)));
          }
          const identityX = Math.max(.01,base.parentX*fitted.sx), identityY = Math.max(.01,base.parentY*fitted.sy);
          pane.style.setProperty('--identity-size',`${lettering.size/identityY}px`);
          pane.style.setProperty('--identity-scale-x',String(identityY/identityX));
          pane.style.setProperty('--identity-x',`${lettering.x/identityX}px`);
          pane.style.setProperty('--identity-y',`${lettering.y/identityY}px`);
          pane.style.setProperty('--handoff-benefit',String(pose.benefit));
          const naturalObject=objectWidth*base.parentY*Math.min(desired.width/base.width,desired.height/base.height);
          const objectSize=mix(naturalObject,Math.min(104,desired.width*(portrait ? .23 : .09),desired.height*.36),pose.assembly);
          const gap=Math.max(6,desired.width*.018);
          const groupLeft=portrait ? desired.width*.08 : desired.width*.92-3*objectSize-2*gap;
          const objectRight=mix(10,desired.width-groupLeft-index*(objectSize+gap)-objectSize,pose.assembly);
          pane.style.setProperty('--handoff-object',String(pose.objects));
          pane.style.setProperty('--handoff-object-width',`${objectSize/identityX}px`);
          pane.style.setProperty('--handoff-object-height',`${objectSize/identityY}px`);
          pane.style.setProperty('--handoff-object-right',`${objectRight/identityX}px`);
          pane.style.setProperty('--handoff-object-top',`${mix(10,Math.max(8,desired.height*.055),pose.assembly)/identityY}px`);
          // No rear card may share the selected card's stacking level.
          pane.style.zIndex=String(pose.spread>.01?(target.selected?10:2-index):(3-index));
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
      node.style.setProperty('--handoff-ambient', String(isStatic ? 1 : 1-pose.white));
      if (ambient) ambient.style.visibility = !isStatic && pose.white >= .999 ? 'hidden' : '';
      node.style.setProperty('--handoff-proof', String(isStatic ? 1 : pose.proof));
      // Keep the reading face clickable through its transport and hold.
      // It retires only once no painted content remains.
      node.inert = !isStatic && remaining < .001;
      node.querySelectorAll<HTMLElement>('.opening-proof-stage').forEach(proof=>{proof.inert=!isStatic&&pose.proof<.01;});
      node.style.setProperty('--handoff-sculpture', String(isStatic ? 1 : pose.sculpture));
      node.style.setProperty('--handoff-lift', `${isStatic ? 0 : -24 * pose.focus}px`);
      const pointerPlane = node.querySelector<HTMLElement>('[data-opening-pointer]');
      if (pointerPlane) pointerPlane.style.setProperty('--handoff-pointer', String(isStatic ? 0 : pose.pointer));
      runway.dataset.handoffProgress = pose.progress.toFixed(3);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const scrolling = () => {
      if (scene?.staticLayout && media.matches && !restoringFlow.current) {
        const bounds = copy.getBoundingClientRect();
        if (bounds.bottom <= 0 || bounds.top >= innerHeight) readingPose.current = null;
      }
      schedule();
    };
    const resize = () => {
      if (!scene?.staticLayout && media.matches) restorePose.current ??= readingPose.current;
      dirty=true; schedule();
    };
    const observer = new ResizeObserver(resize); observer.observe(node);
    const replacements = new MutationObserver(() => { dirty=true; schedule(); });
    if (world) replacements.observe(world, { childList: true, subtree: true });
    const parentGeometry = new MutationObserver(resize);
    const group=node.querySelector('.opening-card-morph');
    if(group)parentGeometry.observe(group,{attributes:true,attributeFilter:['style']});
    const geometry = new ResizeObserver(resize);
    node.querySelectorAll('[data-persistent-card]').forEach(pane=>geometry.observe(pane));
    world?.querySelectorAll('[data-service-frame-target]').forEach(target=>geometry.observe(target));
    window.addEventListener('scroll', scrolling, { passive: true }); window.addEventListener('resize', resize);
    window.addEventListener('lionovart:service-pose',schedule);
    media.addEventListener('change', resize); document.fonts.addEventListener('loadingdone',resize); void document.fonts.ready.then(resize); sync();
    return () => {
      world?.querySelector<HTMLElement>('[data-services-stage]')?.style.removeProperty('--service-opening-copy');
      world?.querySelector<HTMLElement>('[data-services-stage]')?.style.removeProperty('--service-opening-expertise');
      world?.querySelector<HTMLElement>('[data-services-stage]')?.style.removeProperty('--service-opening-sides');
      sources.forEach(({node:pane})=>clear(pane));
      node.style.opacity = ''; node.inert = false; delete node.dataset.cardHandoffActive; delete node.dataset.cardReadingInteractive;
      node.style.removeProperty('--handoff-ambient'); if(ambient)ambient.style.visibility='';
      cancelAnimationFrame(frame); observer.disconnect(); geometry.disconnect(); parentGeometry.disconnect(); replacements.disconnect();
      window.removeEventListener('scroll', scrolling); window.removeEventListener('resize', resize);
      window.removeEventListener('lionovart:service-pose',schedule);media.removeEventListener('change', resize); document.fonts.removeEventListener('loadingdone',resize);
    };
  }, [scene?.target, scene?.staticLayout, scene?.cardSlots]);
  return <div className={styles.cardTransition} data-card-transition data-scroll-manual>
    <div ref={intro} className={styles.cardIntro}>{children}</div>
    <ScenePortal><div ref={message} className={styles.shapingMessage} data-shaping-message data-scroll-title-skip>
      <div className={styles.brandStatement} data-brand-statement>
        <p data-brand-beat="lead">{locale === 'fr' ? 'Pour mener le changement,' : 'To lead today,'}</p>
        <h2><span data-brand-beat="main">
          <span className={styles.innovation}>{locale === 'fr' ? 'L’innovation' : 'Innovation'}</span>{' '}
          <span className={styles.claimSwap}>
            <span className={styles.optional} data-brand-optional>{locale === 'fr' ? 'n’est pas une option.' : 'isn’t optional.'}</span>
            <span className={styles.claimStroke} data-brand-strike aria-hidden="true" />
            <span data-brand-beat="necessity" className={styles.necessity}>{locale === 'fr' ? 'est une nécessité.' : 'it’s a necessity.'}</span>
          </span>
        </span></h2>
      </div>
    </div></ScenePortal>
    <div ref={exit} className={styles.cardExit} data-card-exit aria-hidden="true" />
  </div>;
}



