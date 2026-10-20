'use client';

import { useEffect, useRef } from 'react';
import type { ShaderMount } from '@paper-design/shaders';
import styles from './ServiceWorld.module.css';

/** One persistent, low-resolution light field. The CSS room is the fallback. */
export default function AtelierLight() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = host.current;
    const world = mount?.closest<HTMLElement>('[data-service-world]');
    if (!mount || !world) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let shader: ShaderMount | undefined;
    let disposed = false, loading = false, failed = false;
    const stop = () => { failed = true; mount.dataset.lightState = 'fallback'; shader?.setSpeed(0); };
    const sync = () => {
      if (disposed) return;
      const visible = world.dataset.worldVisible === 'true' && !document.hidden;
      const lit = Number(world.style.getPropertyValue('--world-light')) > .05;
      const allowed = visible && lit && !motion.matches && !connection?.saveData;
      const moving = allowed && world.dataset.worldMotion !== 'paused';
      if (shader) { shader.setSpeed(moving && !failed ? .035 : 0); mount.dataset.lightState = motion.matches ? 'fallback' : failed ? 'fallback' : 'ready'; return; }
      if (!allowed || loading || failed) return;
      loading = true;
      void import('@paper-design/shaders').then(({ ShaderMount, meshGradientFragmentShader, getShaderColorFromString, ShaderFitOptions }) => {
        if (disposed) return;
        try {
          const colors = ['#faf9f6', '#e9e5de', '#f7f5ef', '#ddd4c3'].map(getShaderColorFromString);
          shader = new ShaderMount(mount, meshGradientFragmentShader, {
            u_colors: colors, u_colorsCount: colors.length, u_distortion: .22, u_swirl: .1,
            u_grainMixer: .06, u_grainOverlay: .018, u_fit: ShaderFitOptions.cover,
            u_scale: 1.25, u_rotation: 0, u_originX: .5, u_originY: .5,
            u_offsetX: 0, u_offsetY: 0, u_worldWidth: 0, u_worldHeight: 0,
          }, { alpha: false, antialias: false, powerPreference: 'low-power' }, 0, 12000, 1, innerWidth < 768 ? 260_000 : 600_000);
          shader.canvasElement.addEventListener('webglcontextlost', stop);
          sync();
        } catch { stop(); }
      }).catch(stop);
    };
    const observer = new MutationObserver(sync);
    observer.observe(world, { attributes: true, attributeFilter: ['data-world-visible', 'data-world-motion', 'style'] });
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    sync();
    return () => {
      disposed = true; observer.disconnect();
      document.removeEventListener('visibilitychange', sync); motion.removeEventListener('change', sync);
      shader?.canvasElement.removeEventListener('webglcontextlost', stop);
      shader?.dispose();
    };
  }, []);
  return <div ref={host} className={styles.atelierLight} data-atelier-light data-light-state="fallback" aria-hidden="true" />;
}
