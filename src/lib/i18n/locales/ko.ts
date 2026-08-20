// Korean translations — stub (copy of English, to be translated)
import { en } from "./en";
import type { Translations } from "./en";

export const ko: Translations = {
  ...en,
  bridge: {
    line1: "브랜드 뒤의 시간은 아무도 보지 않습니다.",
    line2: "우리는 봅니다.",
    accent: "우리도 지나온 시간이니까요.",
    body: "그래서 제안서가 아니라, 이미 만들어 온 것에서 시작합니다.",
  },

  vow: {
    line1: "에이전시 그 이상.",
    line2: "당신의 유산을",
    accent: "함께 만드는 파트너십.",
    body: "우리는 클라이언트를 받지 않습니다. 당신이 만들어가는 것을 함께 만듭니다.",
  },
  footer: {
    ...en.footer,
    explore: "둘러보기",
    services: "서비스",
    about: "회사 소개",
    whyUs: "왜 Lionovart인가",
    howWeWork: "진행 방식",
    results: "성과",
    whatsapp: "WhatsApp",
  },
  whatWeDo: {
    eyebrow: "우리가 하는 일",
    statement: "브랜드를 무시할 수 없게 만듭니다.",
    trust: [
      "라이언 프라이드의 20+ 브랜드",
      "3개 대륙에서 신뢰받는",
      "9개 언어, 하나의 기준",
    ],
    disciplines: [
      {
        label: "리드",
        kicker: "브랜드 & 마케팅",
        body: "고객이 가장 먼저 떠올리고 기억하는 브랜드로 만드는 아이덴티티와 마케팅.",
      },
      {
        label: "혁신",
        kicker: "AI & 자동화",
        body: "맞춤형 시스템과 24/7 음성 에이전트로 시간을 되찾고 수익을 배가합니다.",
      },
      {
        label: "창작",
        kicker: "콘텐츠 & 크래프트",
        body: "할리우드급 영상과 디자인 — 야심 찬 브랜드를 위한 프리미엄 크리에이티브.",
      },
    ],
  },
  nav: {
    we: "우리",
    services: "서비스",
    results: "성과",
    cta: "시작하기",
  },
  testimonials: {
    ...en.testimonials,
    eyebrow: "고객 후기",
    heading: "더 많은 성공 사례.",
  },
  hero: {
    ...en.hero,
    staticText: ["우리는 만듭니다", "당신의 브랜드를"],
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
