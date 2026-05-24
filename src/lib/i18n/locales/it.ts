// Italian translations — stub (copy of English, to be translated)
import { en } from "./en";
import type { Translations } from "./en";

export const it: Translations = {
  ...en,
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
