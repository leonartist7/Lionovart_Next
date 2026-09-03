export default function AboutPaintTransition() {
  return (
    <div
      aria-hidden="true"
      className="relative isolate -mt-px overflow-hidden bg-[#0b0b0b]"
    >
      <div
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#f7f4ef] sm:aspect-[1916/821]"
      >
        <picture>
          <source
            media="(min-width: 640px)"
            srcSet="/images/process-impasto-transition.webp"
            width={1916}
            height={821}
          />
          {/* Portrait source keeps the original tear crop on phones. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/monochrome_diagonal_impasto_swirl.webp"
            alt=""
            width={941}
            height={1672}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "center 41%" }}
          />
        </picture>

        {/* The asset already contains paper at the top and slab at the bottom;
            these short blends only erase the last visible seam against the
            surrounding sections. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[20%] bg-gradient-to-b from-[#f7f4ef] via-[#f7f4ef]/72 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[24%] bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/72 to-transparent" />
      </div>

      <div className="h-6 bg-[#0b0b0b] sm:h-10" />
    </div>
  );
}
