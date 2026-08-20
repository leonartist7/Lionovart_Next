// Italian translations — stub (copy of English, to be translated)
import { en } from "./en";
import type { Translations } from "./en";

export const it: Translations = {
  ...en,
  bridge: {
    line1: "Nessuno vede le ore dietro al brand.",
    line2: "Noi sì.",
    accent: "Le abbiamo vissute.",
    body: "Per questo non partiamo da una proposta, ma da ciò che hai già costruito.",
  },

  vow: {
    line1: "Più di un'agenzia.",
    line2: "La partnership che",
    accent: "costruisce la tua eredità.",
    body: "Non prendiamo clienti. Prendiamo parte a ciò che stai costruendo.",
  },
  footer: {
    ...en.footer,
    explore: "Esplora",
    services: "Servizi",
    about: "Chi siamo",
    whyUs: "Perché noi",
    howWeWork: "Come lavoriamo",
    results: "Risultati",
    whatsapp: "WhatsApp",
  },
  whatWeDo: {
    eyebrow: "Cosa Facciamo",
    statement: "Rendiamo i brand impossibili da ignorare.",
    trust: [
      "+20 Brand nel Branco del Leone",
      "Presenti su 3 Continenti",
      "9 Lingue, Un Unico Standard",
    ],
    disciplines: [
      {
        label: "Guidare",
        kicker: "Brand & Marketing",
        body: "Identità e marketing che ti rendono la scelta ovvia — e quella che la gente ricorda.",
      },
      {
        label: "Innovare",
        kicker: "IA & Automazione",
        body: "Sistemi su misura e agenti vocali 24/7 che ti restituiscono tempo e moltiplicano i guadagni.",
      },
      {
        label: "Creare",
        kicker: "Contenuti & Arte",
        body: "Video e design da Hollywood — creatività premium accessibile ai brand ambiziosi.",
      },
    ],
  },
  nav: {
    we: "Chi Siamo",
    services: "Servizi",
    results: "Risultati",
    cta: "Inizia Ora",
  },
  testimonials: {
    ...en.testimonials,
    eyebrow: "Testimonianze dei Clienti",
    heading: "Più Risultati di Successo.",
  },
  hero: {
    ...en.hero,
    staticText: ["RENDIAMO", "LA TUA MARCA"],
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
