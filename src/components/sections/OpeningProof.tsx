"use client";
import { useLionJourney } from "./lion-journey/LionJourney";

const COUNTRIES = [["kr", "South Korea"], ["ca", "Canada"], ["it", "Italy"], ["ch", "Switzerland"], ["fr", "France"], ["es", "Spain"], ["gb", "United Kingdom"]];
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
export default function OpeningProof() {
  const journey = useLionJourney();
  return <div ref={journey?.proof} className="lion-proof opening-proof" aria-label="Our work across borders">
    <Laurel>PROVEN<br />RESULTS</Laurel>
    <div className="opening-flags"><div>{COUNTRIES.map(([code, name]) =>
      // eslint-disable-next-line @next/next/no-img-element
      <img key={code} src={`https://flagcdn.com/w40/${code}.png`} alt={name} width={24} height={17} loading="lazy" />
    )}</div><p>Across borders. In good company.</p></div>
    <Laurel>CREATIVE<br />EXCELLENCE</Laurel>
  </div>;
}
