"use client";

/**
 * Dark "cinema" proof band for /services/web — the page's single tonal break.
 * A near-black section with an auto-scrolling strip of REAL client faces + one-
 * line outcomes. Breaks the all-white rhythm (Von Restorff), adds consensus
 * proof ("businesses like mine hired them"), and makes the next white section pop.
 *
 * Faces = real photos in /public/images/Testimonials; quotes condensed from the
 * en.ts reviews. Marquee reuses animate-marquee-left; pause on hover.
 */

const FACES = [
  { img: "/images/Testimonials/Canada/Mateo-Ecommerce-M.jpg", outcome: "Conversion rate nearly doubled.", name: "Mateo", biz: "E-commerce · Canada" },
  { img: "/images/Testimonials/Spain/Pablo-hotel-M.jpg", outcome: "Direct bookings up 60%+.", name: "Pablo", biz: "Boutique hotel · Spain" },
  { img: "/images/Testimonials/Italy/Defne-Realestate.jpg", outcome: "Leads qualified overnight.", name: "Defne", biz: "Lumina Realty · Italy" },
  { img: "/images/Testimonials/UK/Ben-Saasfounder.jpg", outcome: "Closed our seed round.", name: "Ben", biz: "SaaS founder · UK" },
  { img: "/images/Testimonials/UK/Dan-Clinic-M.jpg", outcome: "Trusted before they walk in.", name: "Dan", biz: "Dental clinic · UK" },
  { img: "/images/Testimonials/Spain/Sergio-photographer-M.jpg", outcome: "Enquiries tripled.", name: "Sergio", biz: "Photographer · Spain" },
  { img: "/images/Testimonials/Spain/Manu-Realestate-M.jpg", outcome: "Evenings back, calendar full.", name: "Manu", biz: "Costa Realty · Spain" },
  { img: "/images/Testimonials/France/Mathilde-coffee.jpg", outcome: "Saturdays are packed now.", name: "Mathilde", biz: "Café · France" },
];

function FaceCard({ f }: { f: (typeof FACES)[number] }) {
  return (
    <figure className="w-[260px] shrink-0 md:w-[300px]">
      <div className="overflow-hidden rounded-2xl">
        <img src={f.img} alt={f.name} className="aspect-[4/5] w-full object-cover" loading="lazy" />
      </div>
      <figcaption className="mt-4">
        <p className="font-clash text-[17px] font-semibold leading-snug text-white md:text-[19px]">
          &ldquo;{f.outcome}&rdquo;
        </p>
        <p className="mt-2 flex items-center gap-2 text-[12px] uppercase tracking-[0.14em] text-white/55">
          <span className="h-px w-5 bg-brand-red" />
          {f.name} &middot; {f.biz}
        </p>
      </figcaption>
    </figure>
  );
}

export default function WebProofStrip() {
  const track = [...FACES, ...FACES];
  return (
    <section className="overflow-hidden bg-[#0a0a0a] py-24 md:py-32">
      <div className="mx-auto mb-12 max-w-[1400px] px-6 md:mb-16 md:px-10">
        <p className="mb-5 text-[11px] uppercase tracking-[0.3em] text-brand-red">Proof</p>
        <h2
          className="font-clash font-semibold uppercase leading-[0.95] tracking-tight text-white"
          style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
        >
          Real businesses. <span className="text-white/45">Real results.</span>
        </h2>
      </div>

      <div className="group relative">
        <div className="flex w-max gap-6 animate-marquee-left group-hover:[animation-play-state:paused]">
          {track.map((f, i) => (
            <FaceCard key={i} f={f} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0a0a0a] to-transparent md:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent md:w-32" />
      </div>
    </section>
  );
}
