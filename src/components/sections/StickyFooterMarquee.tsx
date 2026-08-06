export default function StickyFooterMarquee({ goldHorizon = false }: { goldHorizon?: boolean }) {
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
      {goldHorizon && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[clamp(3.5rem,8vw,5.5rem)] overflow-hidden"
        >
          <div className="absolute inset-x-0 bottom-[-65%] h-[165%] bg-[radial-gradient(ellipse_42%_100%_at_50%_100%,rgba(240,201,23,0.2)_0%,rgba(240,201,23,0.06)_42%,transparent_74%)]" />
          <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/80 to-transparent" />
        </div>
      )}
      <div className="relative z-10 flex w-full justify-center whitespace-nowrap">
        <span className="select-none px-4 font-clash text-[clamp(3.25rem,11vw,9rem)] font-bold uppercase leading-[0.82] tracking-[-0.045em] text-white sm:px-6">
          LIONOVART®
        </span>
      </div>
    </div>
  );
}
