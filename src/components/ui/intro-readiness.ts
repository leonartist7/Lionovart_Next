/** Only critical, visible content participates; slow analytics and 3D never block entry. */
export async function waitForIntroContent(signal: AbortSignal) {
  const home = location.pathname === "/";
  const nodes = await new Promise<HTMLElement[]>((resolve, reject) => {
    const observer = new MutationObserver(check);
    function cleanup() { observer.disconnect(); signal.removeEventListener("abort", cancel); }
    function cancel() { cleanup(); reject(signal.reason); }
    function check() {
      const header = document.querySelector<HTMLElement>('[data-intro-header-mounted]');
      const hero = document.querySelector<HTMLElement>('[data-intro-hero-mounted]');
      const main = document.querySelector<HTMLElement>('main');
      if (home ? header && hero : main) { cleanup(); resolve(home ? [header!, hero!] : [main!]); }
    }
    signal.addEventListener("abort", cancel, { once: true });
    observer.observe(document.body, { subtree: true, attributes: true, childList: true, attributeFilter: ['data-intro-header-mounted', 'data-intro-hero-mounted'] });
    if (signal.aborted) cancel(); else check();
  });
  const images = [...document.querySelectorAll<HTMLImageElement>(home ? '[data-nav-logo], [data-lion-poster] img' : '[data-nav-logo]')];
  await Promise.all([
    ...nodes.map(node => {
      const style = getComputedStyle(node.querySelector('h1') ?? node);
      return document.fonts.load(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`).catch(() => []);
    }),
    ...images.map(img => img.decode()),
  ]);
  // A font request settling can invalidate layout. Measure on two successive paints.
  for (let i = 0; i < 2; i++) {
    await new Promise<void>((resolve, reject) => {
      if (signal.aborted) { reject(signal.reason); return; }
      const cancel = () => { cancelAnimationFrame(frame); reject(signal.reason); };
      const frame = requestAnimationFrame(() => {
        signal.removeEventListener('abort', cancel);
        nodes.forEach(node => node.getBoundingClientRect());
        resolve();
      });
      signal.addEventListener('abort', cancel, { once: true });
    });
  }
}
