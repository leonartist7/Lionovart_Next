export default function PartnershipCircle() {
  return (
    <section
      id="one-partnership"
      aria-labelledby="one-partnership-title"
      className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#090909] px-5 py-20 text-white sm:px-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[104svh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red sm:w-[116svh] lg:w-[min(90vw,132svh)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(255,255,255,0.09),transparent_28%),radial-gradient(circle_at_50%_52%,transparent_42%,rgba(0,0,0,0.16)_100%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1180px] flex-col items-center text-center">
        <div className="mb-5 flex items-center gap-3 sm:mb-6">
          <span className="h-px w-8 bg-white/65 sm:w-11" />
          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.3em] text-white/65 sm:text-[9px]">
            Everything, handled
          </span>
          <span className="h-px w-8 bg-white/65 sm:w-11" />
        </div>

        <h2
          id="one-partnership-title"
          className="max-w-[8.5ch] text-balance font-clash text-[clamp(4rem,15vw,10rem)] font-semibold uppercase leading-[0.72] tracking-[-0.075em] text-white"
        >
          One partnership.
        </h2>

        <p className="mt-7 max-w-[42ch] text-pretty font-body text-[14px] leading-[1.65] text-white/78 sm:mt-8 sm:text-[17px] lg:text-[18px]">
          Brand, digital, content, systems and growth working as one — less for you to coordinate, more momentum for the brand.
        </p>

        <a
          href="#closing-cta"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 py-3.5 font-clash text-[11px] font-bold uppercase tracking-[0.14em] text-brand-red transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-brand-red motion-reduce:transition-none"
        >
          Start your brand
        </a>
      </div>
    </section>
  );
}
