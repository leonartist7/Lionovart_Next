"use client";

export default function StickyFooterMarquee() {
  return (
    <div className="sticky bottom-0 z-0 w-full overflow-hidden bg-brand-red py-6 pointer-events-none">
      <div className="flex w-full justify-center whitespace-nowrap">
        <span className="px-6 text-[3.5rem] sm:text-[6rem] md:text-[9rem] font-bold uppercase font-clash text-white select-none">
          LIONOVART®
        </span>
      </div>
    </div>
  );
}
