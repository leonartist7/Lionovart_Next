'use client';

import { useEffect, useState, type RefObject } from 'react';
import { galleryLayout, storyGalleryFits, STORY_STATIC_QUERY } from '../gallery-layout';

/** Measure only on layout/content changes, never on a scroll or pointer frame. */
export function useStoryLayout(host: RefObject<HTMLDivElement | null>) {
  const [layout, setLayout] = useState({ enabled: false, reason: 'pending' });
  useEffect(() => {
    const world = host.current?.closest<HTMLElement>('[data-service-world]');
    if (!world) return;
    const preference = matchMedia(STORY_STATIC_QUERY);
    let frame = 0, disposed = false, failedKey = '', currentEnabled = false;
    const probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true'); probe.inert = true;
    probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none;contain:strict';
    probe.dataset.storyFitProbe = '';
    world.append(probe);
    const measure = () => {
      frame = 0;
      if (disposed) return;
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const geometry = galleryLayout(innerWidth, innerHeight, document.documentElement.clientWidth, rem);
      const tags = [...world.querySelectorAll<HTMLElement>('[data-work-tags]')];
      const copy = world.querySelector<HTMLElement>('[data-service-copy]');
      const statement = world.querySelector<HTMLElement>('[data-brand-statement]');
      const type = tags[0]?.firstElementChild;
      const typeStyle = type ? getComputedStyle(type) : null;
      // A failing layout stays in flow until its actual environment changes.
      // Switching DOM owners must not cause an observer/pinning oscillation.
      const key = [innerWidth, innerHeight, rem, document.documentElement.lang,
        copy?.textContent, statement?.textContent, tags.map(tag => tag.textContent).join('|'),
        typeStyle?.fontSize, typeStyle?.lineHeight, typeStyle?.letterSpacing, typeStyle?.wordSpacing].join('/');
      let reason = preference.matches ? 'preference-or-height' : failedKey === key ? 'content-fit' : '';
      if (!reason) {
        let captionHeight = 0;
        for (const tag of tags) {
          const sample = tag.cloneNode(true) as HTMLElement;
          sample.removeAttribute('data-work-tags');
          sample.style.width = `${geometry.captionWidth}px`;
          probe.replaceChildren(sample);
          captionHeight = Math.max(captionHeight, sample.offsetHeight);
        }
        probe.replaceChildren();
        // Reserve the full navigation height even when it is temporarily hidden.
        const nav = document.querySelector<HTMLElement>('[data-nav-state]');
        const navHeight = Math.max(3.5 * rem, nav?.offsetHeight ?? 0);
        const galleryFits = !tags.length || storyGalleryFits({ height: innerHeight,
          center: innerHeight * geometry.panelTop / 100, separation: geometry.y,
          cardHeight: geometry.panelWidth * (geometry.vertical ? .75 : 11 / 16),
          captionHeight, rem, navHeight });
        const media = world.querySelector<HTMLElement>('[data-service-media]');
        const serviceFits = !copy || !media || copy.offsetHeight + media.offsetHeight + 2 * rem <= innerHeight - navHeight - 6 * rem;
        const narrativeFits = !statement || statement.offsetHeight + 16 * rem <= innerHeight - navHeight - 3 * rem;
        if (!galleryFits || !serviceFits || !narrativeFits) { reason = 'content-fit'; failedKey = key; }
      }
      const next = { enabled: !reason, reason: reason || 'animated' };
      if (next.enabled !== currentEnabled) {
        window.dispatchEvent(new Event('lionovart:story-layout-will-change'));
        currentEnabled = next.enabled;
      }
      setLayout(previous => previous.enabled === next.enabled && previous.reason === next.reason ? previous : next);
    };
    const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(measure); };
    const resize = new ResizeObserver(schedule);
    resize.observe(document.documentElement);
    const observed = new Set<Element>();
    const watchContent = () => {
      const next = new Set(world.querySelectorAll('[data-work-tags], [data-service-copy], [data-brand-statement]'));
      for (const node of observed) if (!next.has(node)) { resize.unobserve(node); observed.delete(node); }
      for (const node of next) if (!observed.has(node)) { observed.add(node); resize.observe(node); }
    };
    const mutations = new MutationObserver(records => {
      if (records.every(record => probe.contains(record.target) || record.target === probe)) return;
      watchContent(); schedule();
    });
    mutations.observe(world, { childList: true, subtree: true, characterData: true });
    const rootStyle = new MutationObserver(schedule);
    rootStyle.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class', 'lang'] });
    watchContent();
    preference.addEventListener('change', schedule);
    window.addEventListener('resize', schedule);
    const fontsReady = () => { failedKey = ''; schedule(); };
    document.fonts.addEventListener('loadingdone', fontsReady);
    void document.fonts.ready.then(fontsReady); schedule();
    return () => {
      disposed = true; cancelAnimationFrame(frame); resize.disconnect(); mutations.disconnect(); rootStyle.disconnect(); probe.remove();
      preference.removeEventListener('change', schedule); window.removeEventListener('resize', schedule);
      document.fonts.removeEventListener('loadingdone', fontsReady);
    };
  }, [host]);
  return layout;
}
