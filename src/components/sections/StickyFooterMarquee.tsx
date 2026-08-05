export default function StickyFooterMarquee() {
  return (
    <div
      id="footer-marquee"
      aria-hidden="true"
      className="pointer-events-none relative z-0 w-full overflow-hidden py-[clamp(1rem,2.2vw,1.5rem)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/75 to-transparent"
      />
      <div className="relative z-10 flex w-full justify-center whitespace-nowrap">
        <span className="select-none px-4 font-clash text-[clamp(3.25rem,11vw,9rem)] font-bold uppercase leading-[0.82] tracking-[-0.045em] text-white sm:px-6">
          LIONOVART®
        </span>
      </div>
    </div>
  );
}
