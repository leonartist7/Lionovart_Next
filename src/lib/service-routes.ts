/**
 * Single source of truth for service-page routes. Used by the homepage Services
 * section, the Navbar expertise menu, and the /services overview. Localized
 * titles let the nav resolve a route in any language. `ready` gates linking so
 * we never link to a page that isn't built yet (others fall back to in-page scroll).
 */

export interface ServiceRoute {
  id: string;
  href: string;
  name: string; // English display name
  titles: string[]; // localized titles (en/es/fr) for nav lookup
  blurb: string;
  signature: string; // one line describing the page's idea (for the overview)
  ready: boolean; // is the page built?
}

export const SERVICE_ROUTES: ServiceRoute[] = [
  {
    id: "brand",
    href: "/services/brand",
    name: "Brand Identity & Strategy",
    titles: ["Brand Identity & Strategy", "Identidad de Marca y Estrategia", "Image de Marque & Identité"],
    blurb: "Logo systems, strategy, type, color, and voice that make you the obvious premium choice.",
    signature: "A mark that builds itself.",
    ready: true,
  },
  {
    id: "web",
    href: "/services/web",
    name: "Web & App Development",
    titles: ["Web & App Development", "Desarrollo Web y de Apps", "Développement Web & App"],
    blurb: "Fast, conversion-focused sites and apps that turn visitors into booked calls.",
    signature: "A site that builds itself.",
    ready: true,
  },
  {
    id: "content-studio",
    href: "/services/content-studio",
    name: "Content Studio",
    titles: ["Content Studio", "Estudio de Contenido", "Studio de Contenu"],
    blurb: "Brand films, reels, and social content, made and run end to end.",
    signature: "Content that won't be ignored.",
    ready: true,
  },
  {
    id: "print",
    href: "/services/print",
    name: "Print & Physical Branding",
    titles: ["Print & Physical Branding", "Branding Físico e Impresión", "Impression & Marque Physique"],
    blurb: "Cards, packaging, signage, and physical brand experiences.",
    signature: "Presence beyond the screen.",
    ready: false,
  },
  {
    id: "ai",
    href: "/services/ai",
    name: "Smart Systems & AI",
    titles: ["Smart Systems & AI", "Sistemas Inteligentes e IA", "Systèmes Intelligents & IA"],
    blurb: "Voice agents, automation, and workflows that run and convert 24/7.",
    signature: "Your business, always on.",
    ready: true,
  },
  {
    id: "growth",
    href: "/services/growth",
    name: "Growth Marketing",
    titles: ["Growth Marketing", "Marketing de Crecimiento", "Marketing de Croissance"],
    blurb: "SEO, local search, ads, and analytics that put you where buyers look.",
    signature: "Found first, chosen first.",
    ready: false,
  },
];

/** Resolve a route href from a (possibly localized) service title. Ready pages only. */
export function hrefForTitle(title: string): string | null {
  const t = title.trim().toLowerCase();
  const match = SERVICE_ROUTES.find((s) => s.titles.some((x) => x.toLowerCase() === t));
  return match && match.ready ? match.href : null;
}
