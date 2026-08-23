import type { Locale } from "@/lib/i18n";

export type FounderMarket =
  | "calgary"
  | "alberta"
  | "canada"
  | "grenoble"
  | "france"
  | "global";

export interface GeoHint {
  city?: string | null;
  region?: string | null;
  countryCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

const MARKET_PATHS: Record<string, FounderMarket> = {
  calgary: "calgary",
  alberta: "alberta",
  canada: "canada",
  grenoble: "grenoble",
  france: "france",
};

const FOUNDER_MARKETS: FounderMarket[] = [
  "calgary",
  "alberta",
  "canada",
  "grenoble",
  "france",
  "global",
];

const CANADIAN_TIMEZONES = new Set([
  "America/St_Johns",
  "America/Halifax",
  "America/Glace_Bay",
  "America/Moncton",
  "America/Goose_Bay",
  "America/Toronto",
  "America/Iqaluit",
  "America/Winnipeg",
  "America/Regina",
  "America/Swift_Current",
  "America/Edmonton",
  "America/Vancouver",
  "America/Whitehorse",
  "America/Dawson",
  "America/Yellowknife",
  "America/Inuvik",
  "America/Cambridge_Bay",
  "America/Rankin_Inlet",
]);

const MARKET_LABELS: Record<Locale, Record<FounderMarket, string>> = {
  en: {
    calgary: "CALGARY FOUNDERS",
    alberta: "ALBERTA FOUNDERS",
    canada: "CANADIAN FOUNDERS",
    grenoble: "GRENOBLE FOUNDERS",
    france: "FRANCE FOUNDERS",
    global: "AMBITIOUS FOUNDERS",
  },
  fr: {
    calgary: "FONDATEURS DE CALGARY",
    alberta: "FONDATEURS DE L’ALBERTA",
    canada: "FONDATEURS AU CANADA",
    grenoble: "FONDATEURS DE GRENOBLE",
    france: "FONDATEURS EN FRANCE",
    global: "FONDATEURS AMBITIEUX",
  },
  es: {
    calgary: "FUNDADORES DE CALGARY",
    alberta: "FUNDADORES DE ALBERTA",
    canada: "FUNDADORES DE CANADÁ",
    grenoble: "FUNDADORES DE GRENOBLE",
    france: "FUNDADORES DE FRANCIA",
    global: "FUNDADORES AMBICIOSOS",
  },
  it: {
    calgary: "FOUNDER DI CALGARY",
    alberta: "FOUNDER DELL’ALBERTA",
    canada: "FOUNDER IN CANADA",
    grenoble: "FOUNDER DI GRENOBLE",
    france: "FOUNDER IN FRANCIA",
    global: "FOUNDER AMBIZIOSI",
  },
  ja: {
    calgary: "[TODO: translate] calgary",
    alberta: "[TODO: translate] alberta",
    canada: "[TODO: translate] canada",
    grenoble: "[TODO: translate] grenoble",
    france: "[TODO: translate] france",
    global: "[TODO: translate] global",
  },
  ko: {
    calgary: "캘거리 창업가",
    alberta: "앨버타 창업가",
    canada: "캐나다 창업가",
    grenoble: "그르노블 창업가",
    france: "프랑스 창업가",
    global: "야심 찬 창업가",
  },
};

const MOBILE_MARKET_LABELS: Record<Locale, Record<FounderMarket, string>> = {
  en: {
    calgary: "CALGARY",
    alberta: "ALBERTA",
    canada: "CANADA",
    grenoble: "GRENOBLE",
    france: "FRANCE",
    global: "FOUNDERS",
  },
  fr: {
    calgary: "CALGARY",
    alberta: "ALBERTA",
    canada: "CANADA",
    grenoble: "GRENOBLE",
    france: "FRANCE",
    global: "FONDATEURS",
  },
  es: {
    calgary: "CALGARY",
    alberta: "ALBERTA",
    canada: "CANADÁ",
    grenoble: "GRENOBLE",
    france: "FRANCIA",
    global: "FUNDADORES",
  },
  it: {
    calgary: "CALGARY",
    alberta: "ALBERTA",
    canada: "CANADA",
    grenoble: "GRENOBLE",
    france: "FRANCIA",
    global: "FOUNDER",
  },
  ja: {
    calgary: "[TODO: translate] calgary",
    alberta: "[TODO: translate] alberta",
    canada: "[TODO: translate] canada",
    grenoble: "[TODO: translate] grenoble",
    france: "[TODO: translate] france",
    global: "[TODO: translate] global",
  },
  ko: {
    calgary: "캘거리",
    alberta: "앨버타",
    canada: "캐나다",
    grenoble: "그르노블",
    france: "프랑스",
    global: "창업가",
  },
};

const OFFER_COPY: Record<
  Locale,
  { desktop: string; mobile: string; cta: string; aria: string }
> = {
  en: {
    desktop: "5 COMPLIMENTARY BRAND & GROWTH BLUEPRINTS THIS MONTH",
    mobile: "5 FREE BLUEPRINTS",
    cta: "CLAIM YOURS",
    aria: "Claim your complimentary Brand and Growth Blueprint",
  },
  fr: {
    desktop: "5 BILANS DE MARQUE ET DE CROISSANCE OFFERTS CE MOIS-CI",
    mobile: "5 BILANS OFFERTS",
    cta: "RÉSERVEZ LE VÔTRE",
    aria: "Réserver votre bilan de marque et de croissance offert",
  },
  es: {
    desktop: "5 PLANES DE MARCA Y CRECIMIENTO GRATIS ESTE MES",
    mobile: "5 PLANES GRATIS",
    cta: "SOLICITA EL TUYO",
    aria: "Solicita tu plan de marca y crecimiento gratuito",
  },
  it: {
    desktop: "5 PIANI GRATUITI DI BRAND E CRESCITA QUESTO MESE",
    mobile: "5 PIANI GRATUITI",
    cta: "RICHIEDI IL TUO",
    aria: "Richiedi il tuo piano gratuito di brand e crescita",
  },
  ja: {
    desktop: "[TODO: translate] desktop",
    mobile: "[TODO: translate] mobile",
    cta: "[TODO: translate] cta",
    aria: "[TODO: translate] aria",
  },
  ko: {
    desktop: "이번 달 무료 브랜드·성장 청사진 5개",
    mobile: "무료 청사진 5개",
    cta: "신청하기",
    aria: "무료 브랜드 및 성장 청사진 신청하기",
  },
};

function normalize(value?: string | null) {
  return value?.trim().toLocaleLowerCase("en") ?? "";
}

function distanceKm(
  latitude: number,
  longitude: number,
  targetLatitude: number,
  targetLongitude: number
) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latitudeDelta = radians(targetLatitude - latitude);
  const longitudeDelta = radians(targetLongitude - longitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latitude)) *
      Math.cos(radians(targetLatitude)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function marketFromPath(pathname: string): FounderMarket | null {
  const firstSegment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return firstSegment ? MARKET_PATHS[firstSegment] ?? null : null;
}

export function isFounderMarket(value: string | null): value is FounderMarket {
  return value !== null && FOUNDER_MARKETS.includes(value as FounderMarket);
}

export function marketFromGeo(hint: GeoHint): FounderMarket | null {
  const city = normalize(hint.city);
  const region = normalize(hint.region);
  const country = normalize(hint.countryCode).toUpperCase();
  const hasCoordinates =
    typeof hint.latitude === "number" && typeof hint.longitude === "number";

  if (
    city.includes("calgary") ||
    (hasCoordinates && distanceKm(hint.latitude!, hint.longitude!, 51.0447, -114.0719) <= 90)
  ) {
    return "calgary";
  }

  if (
    city.includes("grenoble") ||
    (hasCoordinates && distanceKm(hint.latitude!, hint.longitude!, 45.1885, 5.7245) <= 90)
  ) {
    return "grenoble";
  }

  if (country === "CA") {
    return region.includes("alberta") || region === "ab" ? "alberta" : "canada";
  }

  if (country === "FR") return "france";
  return null;
}

export function marketFromTimezone(timezone: string): FounderMarket {
  if (timezone === "America/Edmonton") return "alberta";
  if (timezone === "Europe/Paris") return "france";
  if (CANADIAN_TIMEZONES.has(timezone)) return "canada";
  return "global";
}

export function founderOfferCopy(locale: Locale, market: FounderMarket) {
  return {
    market: MARKET_LABELS[locale][market],
    marketMobile: MOBILE_MARKET_LABELS[locale][market],
    ...OFFER_COPY[locale],
  };
}
