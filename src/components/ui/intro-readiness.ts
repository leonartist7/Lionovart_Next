/** The opening shell can use its designed fallbacks when a critical request fails. */
export async function waitForIntroContent(signal: AbortSignal, home = location.pathname === "/") {
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
  const images = [...document.querySelectorAll<HTMLImageElement>(
    home ? '[data-nav-logo] img, [data-intro-roar-poster], [data-hero-frame]' : '[data-nav-logo] img',
  )];
  await Promise.all([
    ...nodes.map(node => {
      const style = getComputedStyle(node.querySelector('h1') ?? node);
      return document.fonts.load(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`).catch(() => []);
    }),
    ...images.map(img => img.decode().catch(() => {})),
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

/** Give the live hero a short head start. The still rays and ROAR poster are ready
 * alternatives when the GPU or model cannot finish within that budget. */
export function waitForIntroGraphics(signal: AbortSignal, budget: number) {
  return new Promise<"live" | "fallback">((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new MutationObserver(check);
    function cleanup() {
      clearTimeout(timer);
      observer.disconnect();
      signal.removeEventListener("abort", cancel);
    }
    function cancel() { cleanup(); reject(signal.reason); }
    function check() {
      const rays = document.querySelector('[data-intro-rays]');
      const roar = document.querySelector('[data-intro-roar]');
      if (!rays || rays.getAttribute("data-intro-rays") === "pending" || roar?.getAttribute("data-intro-roar") === "pending") return;
      const fallback = rays.getAttribute("data-intro-rays") === "still" || roar?.getAttribute("data-intro-roar") === "still";
      cleanup();
      resolve(fallback ? "fallback" : "live");
    }
    if (signal.aborted) { cancel(); return; }
    signal.addEventListener("abort", cancel, { once: true });
    observer.observe(document.body, { subtree: true, attributes: true, childList: true, attributeFilter: ["data-intro-rays", "data-intro-roar"] });
    timer = setTimeout(() => { cleanup(); resolve("fallback"); }, Math.max(0, budget));
    check();
  });
}
