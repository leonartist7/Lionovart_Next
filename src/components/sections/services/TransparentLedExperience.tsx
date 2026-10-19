"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "@/i18n/navigation";

export default function TransparentLedExperience() {
  const { locale } = useLanguage();
  const fr = locale === "fr";
  const [on, setOn] = useState(true);
  return <section className="mx-auto max-w-[1400px] px-6 pb-28 pt-40 text-white md:px-10 md:pt-48">
    <Link href="/services" className="text-xs text-white/60 hover:text-white">← {fr ? "Toutes les expertises" : "All services"}</Link>
    <p className="mb-6 mt-10 text-[11px] uppercase tracking-[.24em] text-[#c7a768]">{fr ? "Expériences LED transparentes" : "Transparent LED Experiences"}</p>
    <h1 className="font-clash text-[clamp(2.8rem,7vw,6rem)] font-medium leading-[.98] tracking-tight">{fr ? "Votre vitrine." : "Your window."}<br /><span className="text-[#d8b66e]">{fr ? "Une nouvelle dimension." : "A whole new dimension."}</span></h1>
    <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-white/15 bg-[#343d36]">
          <div className="absolute inset-[7%] grid grid-cols-3 gap-2 border-8 border-[#1c211d] bg-gradient-to-br from-[#647163] to-[#222d25]" aria-hidden="true">{[0,1,2].map(i=><div key={i} className="border-r-4 border-[#202820] bg-white/5" />)}</div>
          <Image src="/images/transparent-led-concept.svg" alt={fr ? "Simulation créative d’une vitrine LED transparente" : "Creative simulation of a transparent LED window"} fill sizes="(max-width: 1023px) 100vw, 60vw" className={`object-contain transition-opacity duration-500 motion-reduce:transition-none ${on ? "opacity-100" : "opacity-0"}`} />
        </div>
        <div className="mt-5 flex items-center justify-between gap-5"><button type="button" role="switch" aria-checked={on} onClick={()=>setOn(!on)} className="min-h-11 rounded-full border border-[#c7a768]/60 px-5 text-xs text-[#e6d5ad] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c7a768]">{fr ? "Affichage" : "Display"} : {on ? (fr ? "allumé" : "on") : (fr ? "éteint" : "off")}</button><span className="text-[10px] text-white/45">{fr ? "Simulation illustrative" : "Illustrative simulation"}</span></div>
      </div>
      <div><h2 className="font-clash text-3xl leading-tight">{fr ? "Un nouveau support pour votre histoire." : "A new stage for your story."}</h2><p className="mt-5 text-sm leading-7 text-white/65">{fr ? "Faites vivre vos surfaces vitrées avec des écrans LED transparents et des contenus créatifs sur mesure. De votre présence quotidienne à vos campagnes saisonnières, donnez une autre dimension à votre marque." : "Bring motion, colour and storytelling to glass surfaces with transparent LED displays and bespoke creative content. From everyday presence to seasonal campaigns, give your brand another dimension."}</p>
        <ul className="my-7 space-y-4 border-y border-white/15 py-6 text-sm text-white/80">{(fr ? ["Concept créatif adapté à votre espace", "Animations et vidéos conçues pour l’affichage", "Étude de faisabilité du site et du matériel", "Renouvellement des contenus au fil des saisons"] : ["Creative direction shaped around your space", "Bespoke motion and display-ready video", "Site and hardware feasibility assessment", "Seasonal creative refreshes"]).map(item=><li key={item}>↗ {item}</li>)}</ul>
        <Link href="/call" className="inline-flex min-h-11 items-center gap-8 border-b border-[#c7a768] py-3 text-sm text-[#e6d5ad]">{fr ? "Imaginons votre installation" : "Explore your installation"}<span aria-hidden="true">↗</span></Link>
        <p className="mt-6 text-xs leading-relaxed text-white/45">{fr ? "Compatibilité, transparence, luminosité et définition dépendent du matériel et du lieu. Matériel et installation sont chiffrés séparément après étude." : "Compatibility, transparency, brightness and resolution depend on the selected hardware and site. Hardware and installation are quoted separately after assessment."}</p>
      </div>
    </div>
  </section>;
}
