// Italian translations — stub (copy of English, to be translated)
import { en } from "./en";
import type { Translations } from "./en";

export const it: Translations = {
  ...en,
  nav: {
    we: "Chi Siamo",
    services: "Servizi",
    results: "Risultati",
    cta: "Inizia Ora",
  },
  hero: {
    ...en.hero,
    staticText: "FAI DELLA TUA MARCA",
    cyclingWords: ["RUGGIRE", "DISTINGUERTI", "MEMORABILE", "MAGNETICA", "VENDERE DI PIÙ", "DOMINARE"],
    subtitle:
      "Progettiamo brand, costruiamo siti web e produciamo contenuti per rendere la tua azienda impossibile da ignorare.",
    ctaStart: "Inizia Ora",
    ctaStartOpening: "Apertura WhatsApp…",
    ctaWork: "Guarda i Nostri Lavori",
    stats: { clients: "Clienti", industries: "Settori", yearsExp: "Anni di Esp." },
    trustText: "Scelti da oltre 50 startup e marchi globali, in più di 20 settori.",
    badges: {
      brands: ["Brand", "elevati"],
      experience: ["Esperienza", "Cliente"],
      countries: "Paesi",
    },
  },
};
