// Spanish translations — stub (copy of English, to be translated)
import { en } from "./en";
import type { Translations } from "./en";

export const es: Translations = {
  ...en,
  nav: {
    we: "Nosotros",
    services: "Servicios",
    results: "Resultados",
    cta: "Comenzar",
  },
  hero: {
    ...en.hero,
    staticText: "HAZ QUE TU MARCA",
    cyclingWords: ["RUGIR", "DESTACAR", "MEMORABLE", "MAGNÉTICA", "VENDER MÁS", "DOMINAR"],
    subtitle:
      "Diseñamos marcas, construimos sitios web y producimos contenido para que tu negocio sea imposible de ignorar.",
    ctaStart: "Comenzar",
    ctaStartOpening: "Abriendo WhatsApp…",
    ctaWork: "Ver Nuestro Trabajo",
    stats: { clients: "Clientes", industries: "Industrias", yearsExp: "Años de Exp." },
    trustText: "Con la confianza de más de 50 startups y marcas globales, en más de 20 industrias.",
    badges: {
      brands: ["Marcas", "elevadas"],
      experience: ["Experiencia", "del Cliente"],
      countries: "Países",
    },
  },
};
