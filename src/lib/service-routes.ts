/** Canonical service URLs. Keep established paths when positioning changes. */
export interface ServiceRoute {
  id: string;
  href: string;
  name: string;
  titles: string[];
  blurb: string;
  signature: string;
  ready: boolean;
}
export const SERVICE_ROUTES: ServiceRoute[] = [
  {
    "id": "brand",
    "href": "/services/brand",
    "name": "Brand & Graphic Design",
    "titles": [
      "Brand & Graphic Design",
      "Identité & design graphique"
    ],
    "blurb": "Make your image reflect the quality of your business, from your identity to every printed and digital detail.",
    "signature": "An image that reflects your quality.",
    "ready": true
  },
  {
    "id": "web",
    "href": "/services/web",
    "name": "Digital Experiences",
    "titles": [
      "Digital Experiences",
      "Expériences digitales"
    ],
    "blurb": "Websites, apps and customer platforms that bring your brand to life and make the next step feel natural.",
    "signature": "Your brand, brought to life online.",
    "ready": true
  },
  {
    "id": "content-studio",
    "href": "/services/content-studio",
    "name": "Content & Campaigns",
    "titles": [
      "Content & Campaigns",
      "Contenus & campagnes"
    ],
    "blurb": "Seasonal, promotional and ongoing content that gives people a reason to notice you and take action.",
    "signature": "Creative for your next big moment.",
    "ready": true
  },
  {
    "id": "print",
    "href": "/services/print",
    "name": "Spaces & Events",
    "titles": [
      "Spaces & Events",
      "Espaces & événements"
    ],
    "blurb": "Bring your brand into the real world through events, signage, retail displays and memorable physical experiences.",
    "signature": "Presence beyond the screen.",
    "ready": true
  },
  {
    "id": "ai",
    "href": "/services/ai",
    "name": "Smart Business Systems",
    "titles": [
      "Smart Business Systems",
      "Systèmes métier intelligents"
    ],
    "blurb": "Custom AI-powered operating platforms that connect your tools, simplify daily work and give your team time back.",
    "signature": "More time for the work that matters.",
    "ready": true
  },
  {
    "id": "led",
    "href": "/services/led",
    "name": "Transparent LED Experiences",
    "titles": [
      "Transparent LED Experiences",
      "Expériences LED transparentes"
    ],
    "blurb": "Turn your windows into a moving brand experience with transparent LED displays and bespoke creative content.",
    "signature": "A new stage for your brand.",
    "ready": true
  }
];
export function hrefForTitle(title: string): string | null {
  const t = title.trim().toLowerCase();
  const match = SERVICE_ROUTES.find(s => s.titles.some(x => x.toLowerCase() === t));
  return match?.ready ? match.href : null;
}
