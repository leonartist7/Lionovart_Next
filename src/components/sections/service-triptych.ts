/** Three stable exhibits per service; index 1 is the opening hero. */
type Exhibit = { en: string; fr: string; es: string; slug?: string; tint: string };
export const SERVICE_TRIPTYCH: Record<string, readonly [Exhibit, Exhibit, Exhibit]> = {
  branding: [
    { en: 'Graphic Design', fr: 'Design graphique', es: 'Diseño gráfico', slug: 'oma', tint: '#b79869' },
    { en: 'Brand Identity', fr: 'Identité de marque', es: 'Identidad de marca', slug: 'rakbank', tint: '#bf635d' },
    { en: 'Packaging & Print', fr: 'Packaging & print', es: 'Packaging e impresión', slug: 'soda-bold', tint: '#d8a150' },
  ],
  web: [
    { en: 'Apps & Platforms', fr: 'Apps & plateformes', es: 'Apps y plataformas', slug: 'coffeeshop-app-03', tint: '#b59871' },
    { en: 'Websites', fr: 'Sites web', es: 'Sitios web', slug: 'home-interior', tint: '#ba625e' },
    { en: 'E-Commerce', fr: 'E-commerce', es: 'E-commerce', slug: 'perfum-elegant', tint: '#b59ab4' },
  ],
  'content-studio': [
    { en: 'Promotional Films', fr: 'Films promotionnels', es: 'Videos promocionales', slug: 'perfum-elegant', tint: '#b59ab4' },
    { en: 'Seasonal Campaigns', fr: 'Campagnes saisonnières', es: 'Campañas de temporada', slug: 'soda-bold', tint: '#d8a150' },
    { en: 'Content Calendar', fr: 'Calendrier éditorial', es: 'Calendario de contenido', slug: 'stormlikes', tint: '#918ac1' },
  ],
  print: [
    { en: 'Signage & Displays', fr: 'Signalétique', es: 'Señalética y displays', slug: 'oma', tint: '#b79869' },
    { en: 'Events & Spaces', fr: 'Événements & espaces', es: 'Eventos y espacios', slug: 'lsi-asia-25', tint: '#879dad' },
    { en: 'Spatial Branding', fr: 'Identité des lieux', es: 'Identidad de espacios', slug: 'rakbank', tint: '#bf635d' },
  ],
  'smart-systems': [
    { en: 'Workflow Automation', fr: 'Automatisation', es: 'Automatización', slug: 'energy-command-hitech', tint: '#80a599' },
    { en: 'Custom AOS', fr: 'AOS sur mesure', es: 'AOS a medida', slug: 'vantra-facility-os-hitech', tint: '#879dad' },
    { en: 'Business Platforms', fr: 'Plateformes métier', es: 'Plataformas de negocio', slug: 'platform-smart', tint: '#958ab4' },
  ],
  led: [
    { en: 'Retail Windows', fr: 'Vitrines commerciales', es: 'Escaparates', tint: '#ad9e7c' },
    { en: 'Transparent LED', fr: 'LED transparent', es: 'LED transparente', tint: '#88a7b4' },
    { en: 'Event Installations', fr: 'Installations événementielles', es: 'Instalaciones para eventos', tint: '#b59ab4' },
  ],
};

export const serviceExhibits = (service: string) => SERVICE_TRIPTYCH[service] ?? SERVICE_TRIPTYCH.branding;
export const exhibitLabel = (exhibit: Exhibit, locale: string) => locale === 'fr' ? exhibit.fr : locale === 'es' ? exhibit.es : exhibit.en;
export function exhibitPosition(index: number, selected: number) {
  const delta = (index - selected + 3) % 3;
  return delta === 0 ? 'center' : delta === 1 ? 'right' : 'left';
}
