// Korean translations — stub (copy of English, to be translated)
import { en } from "./en";
import type { Translations } from "./en";

export const ko: Translations = {
  ...en,
  nav: {
    we: "우리",
    services: "서비스",
    results: "성과",
    cta: "시작하기",
  },
  hero: {
    ...en.hero,
    staticText: "당신의 브랜드를",
    cyclingWords: ["포효하라", "두드러져라", "기억에 남아라", "매력적으로", "더 많이 팔아라", "지배하라"],
    subtitle:
      "우리는 브랜드를 디자인하고, 웹사이트를 구축하며, 당신의 비즈니스가 무시할 수 없도록 만드는 콘텐츠를 제작합니다.",
    ctaStart: "시작하기",
    ctaStartOpening: "WhatsApp 열기…",
    ctaWork: "작업물 보기",
    stats: { clients: "클라이언트", industries: "업종", yearsExp: "년 경력" },
    trustText: "50개 이상의 스타트업 및 글로벌 브랜드, 20개 이상의 업종에서 신뢰받고 있습니다.",
    badges: {
      brands: ["브랜드", "성장"],
      experience: ["고객", "경험"],
      countries: "국가",
    },
  },
};
