"use client";

/**
 * "Selected builds" — auto-scroll marquee of site-screenshot cards for
 * /services/web. Two opposite-direction rows on black, browser-framed shots,
 * pause on hover, edge gradient masks. Reuses the marquee CSS already defined
 * for Testimonials (animate-marquee-left / -right). Swap for real client shots
 * later; placeholder set = the Cloudinary mockups.
 */

const SHOTS = [
  "https://res.cloudinary.com/dgio9uutc/image/upload/q_auto,w_900,c_limit/v1775277353/freepik_a-highly-polished-professional-uiux-website-homepage-mockup-for-a-modern-luxury-car-dealership.-clean-gridbased-layout-with-a-dark-theme-featuring-charcoal-grey-backgrounds-metallic-silve_0001_zglhcb.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/q_auto,w_900,c_limit/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_1_u6hnjz.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/q_auto,w_900,c_limit/v1775277354/freepik_from-this-brand-help-me-make-a-mockup-of-her-landing-page-keeping-the-visual-identity..-looking-very-premium-and-elegant-and-perfect_0001_2_cd1gee.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/q_auto,w_900,c_limit/v1775277380/freepik_from-this-brand-identity-help-me-make-a-mockup-of-her-landing-page..-looking-premium-and-elegant_0001_bnk4us.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/q_auto,w_900,c_limit/v1775277352/freepik__design-a-highly-polished-professional-corporate-we__1650_qukgx3.avif",
  "https://res.cloudinary.com/dgio9uutc/image/upload/q_auto,w_900,c_limit/v1775277351/Screenshots_2_apvmbr.avif",
];

function ShotCard({ src }: { src: string }) {
  return (
    <div className="w-[340px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0f0f0f] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] md:w-[420px]">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
      </div>
      <img src={src} alt="" className="aspect-[16/10] w-full object-cover object-top" loading="lazy" />
    </div>
  );
}

function Row({ direction }: { direction: "left" | "right" }) {
  const track = [...SHOTS, ...SHOTS];
  return (
    <div className="overflow-hidden">
      <div
        className={`flex w-max gap-6 ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        } group-hover:[animation-play-state:paused]`}
      >
        {track.map((src, i) => (
          <ShotCard key={i} src={src} />
        ))}
      </div>
    </div>
  );
}

export default function ExamplesMarquee() {
  return (
    <section className="bg-bg-dark py-24 md:py-32">
      <div className="mx-auto mb-12 max-w-[1400px] px-6 md:mb-16 md:px-10">
        <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-white/50">Selected builds</p>
        <h2
          className="font-clash font-semibold uppercase leading-[0.95] tracking-tight text-white"
          style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
        >
          See it <span className="text-brand-red">in the wild.</span>
        </h2>
      </div>

      {/* group enables hover-pause across both rows; edge gradients mask ends */}
      <div className="group relative">
        <div className="space-y-6">
          <Row direction="left" />
          <Row direction="right" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bg-dark to-transparent md:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bg-dark to-transparent md:w-32" />
      </div>
    </section>
  );
}
