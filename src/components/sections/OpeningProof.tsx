"use client";

import { usePublicCopy } from "@/hooks/usePublicCopy";
import HeroClientProof from "./HeroClientProof";
import { useLionJourney } from "./lion-journey/LionJourney";

function Laurel({ children }: { children: React.ReactNode }) {
  return <div className="opening-laurel">
    {/* Existing brand artwork is decorative; the promise stays live text. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="https://res.cloudinary.com/dgio9uutc/image/upload/v1787020265/Laurel-L_vxtg55.webp" alt="" width={30} height={78} loading="lazy" />
    <span>{children}</span>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="https://res.cloudinary.com/dgio9uutc/image/upload/v1787020265/Laurel-R_kj7isz.webp" alt="" width={30} height={78} loading="lazy" />
  </div>;
}
export default function OpeningProof({ standalone = true }: { standalone?: boolean }) {
  const tr = usePublicCopy();
  const journey = useLionJourney();
  return <div ref={standalone ? journey?.proof : undefined} className="lion-proof opening-proof" aria-label={tr("Our work across borders")}>
    <Laurel>{tr("PROVEN")}<br />{tr("RESULTS")}</Laurel>
    <HeroClientProof linked={standalone} />
    <Laurel>{tr("CREATIVE")}<br />{tr("EXCELLENCE")}</Laurel>

  </div>;
}
