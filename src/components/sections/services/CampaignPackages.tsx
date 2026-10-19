"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "@/i18n/navigation";

const offers = [
  {en: ["Campaign Launch", "One idea. A focused launch.", "For a product, an announcement or an offer ready for its moment.", ["Campaign concept and main visual", "Short motion piece", "Agreed channel adaptations", "Creative handover"]], fr: ["Campagne de lancement", "Une idée. Un lancement ciblé.", "Pour un produit, une annonce ou une offre prête à être révélée.", ["Concept de campagne et visuel principal", "Courte animation", "Déclinaisons pour les supports convenus", "Livraison des contenus"]]},
  {en: ["Seasonal Campaign", "Make the occasion count.", "A connected campaign for the season that matters to your business.", ["Seasonal concept and promotional assets", "Content and rollout calendar", "Optional campaign landing page", "Optional print or window creative"]], fr: ["Campagne saisonnière", "Faites de ce moment le vôtre.", "Une campagne cohérente pour la saison qui compte pour votre entreprise.", ["Concept saisonnier et supports promotionnels", "Calendrier de contenus et de diffusion", "Page de campagne en option", "Créations imprimées ou en vitrine en option"]]},
  {en: ["Monthly Content Studio", "Consistency, with character.", "An ongoing creative partner for a brand that always has something to say.", ["Monthly creative planning", "Defined production allowance", "Social, promotional and motion assets", "Scheduled delivery and review"]], fr: ["Studio de contenu mensuel", "De la régularité et du caractère.", "Un partenaire créatif au quotidien pour une marque qui a toujours quelque chose à raconter.", ["Planification créative mensuelle", "Volume de production défini", "Contenus sociaux, promotionnels et animés", "Livraisons et validations planifiées"]]},
] as const;

export default function CampaignPackages() {
  const { locale } = useLanguage();
  const fr = locale === "fr";
  return <section className="mx-auto max-w-[1400px] px-6 pb-24 pt-8 text-white md:px-10" aria-labelledby="campaign-packages-title">
    <p className="text-[11px] uppercase tracking-[.24em] text-[#c7a768]">{fr ? "Trois façons de créer ensemble" : "Three ways to create together"}</p>
    <h2 id="campaign-packages-title" className="mb-12 mt-5 font-clash text-[clamp(2rem,5vw,4.5rem)] font-medium leading-none tracking-tight">{fr ? "Un grand moment. Ou chaque mois." : "A big moment. Or your every month."}</h2>
    <div className="divide-y divide-white/15 border-y border-white/15">
      {offers.map((offer, i) => { const [name, tag, description, items] = fr ? offer.fr : offer.en;
        return <article key={offer.en[0]} className="grid gap-7 py-9 lg:grid-cols-[1.1fr_1fr_auto] lg:gap-12">
          <div><p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[#c7a768]">0{i+1} / {tag}</p><h3 className="font-clash text-3xl font-medium leading-tight">{name}</h3><p className="mt-4 max-w-[44ch] text-sm leading-relaxed text-white/60">{description}</p></div>
          <ul className="space-y-3 text-sm text-white/75">{items.map(item=><li key={item} className="flex gap-3"><span aria-hidden="true" className="text-[#c7a768]">↗</span>{item}</li>)}</ul>
          <Link href="/call" className="flex min-h-11 items-center justify-between gap-6 self-end border-b border-[#c7a768] py-3 text-sm text-[#e6d5ad] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c7a768]">{fr ? "Parlons de votre projet" : "Discuss your project"}<span aria-hidden="true">↗</span></Link>
        </article>;
      })}
    </div>
    <p className="mt-6 max-w-3xl text-xs leading-relaxed text-white/50">{fr ? "Chaque proposition précise les livrables, les révisions, les délais et le tarif. Publication, achat média, matériel et production physique font l’objet d’un devis distinct." : "Every proposal defines deliverables, revisions, timing and price. Publishing, advertising spend, hardware and physical production are scoped separately."}</p>
  </section>;
}
