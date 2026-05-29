"use client";

import HeroFxFrameScrub from "@/components/preview/HeroFxFrameScrub";
import HeroFxLoopedBg from "@/components/preview/HeroFxLoopedBg";
import HeroFxParallaxZoom from "@/components/preview/HeroFxParallaxZoom";

const VIDEOS = {
  scrub: "https://res.cloudinary.com/dgio9uutc/video/upload/v1779845599/Footage_02_chsoa3.mp4",
  loop: "https://res.cloudinary.com/dgio9uutc/video/upload/v1779845553/Footage_05_yalbaj.mp4",
  parallax: "https://res.cloudinary.com/dgio9uutc/video/upload/v1779845634/Footage_07_o3rfbu.mp4",
};

export default function HeroFxPreviewPage() {
  return (
    <main className="bg-black text-white">
      {/* Fixed jump-nav so user can A/B techniques quickly */}
      <nav className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/60 px-3 py-2 ring-1 ring-white/15 backdrop-blur-md">
        <ul className="flex items-center gap-1 text-[11px] uppercase tracking-widest">
          <li><a href="#scrub" className="px-2 py-1 text-white/70 hover:text-white">Scrub</a></li>
          <li className="text-white/20">·</li>
          <li><a href="#loop" className="px-2 py-1 text-white/70 hover:text-white">Loop</a></li>
          <li className="text-white/20">·</li>
          <li><a href="#parallax" className="px-2 py-1 text-white/70 hover:text-white">Parallax</a></li>
        </ul>
      </nav>

      <div id="scrub">
        <HeroFxFrameScrub src={VIDEOS.scrub} />
      </div>

      <div id="loop">
        <HeroFxLoopedBg src={VIDEOS.loop} />
      </div>

      <div id="parallax">
        <HeroFxParallaxZoom src={VIDEOS.parallax} />
      </div>

      <section className="flex h-screen w-full items-center justify-center bg-bg-dark px-6 text-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">End of preview</p>
          <h3 className="mt-4 font-clash text-3xl font-bold">Pick a favorite</h3>
          <p className="mt-3 max-w-md text-sm text-white/60">
            Once you decide on a technique, we port it into the real hero flow (replacing or
            extending VideoCurtainReveal + HeroRevealWrapper).
          </p>
        </div>
      </section>
    </main>
  );
}
