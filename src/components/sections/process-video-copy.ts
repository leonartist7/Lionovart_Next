import type { Locale } from "@/lib/i18n";

type FilmCopy = {
  stages: [string, string, string, string];
  film: string; unavailable: string;
};

export const PROCESS_FILM_COPY: Record<Locale, FilmCopy> = {
  en: {
    stages: ["Clarify", "Elevate", "Create", "Rise & Optimize"],
    film: "Our process in 15 seconds",
    unavailable: "The film couldn’t load. You can still explore the four steps below.",
  },
  fr: {
    stages: ["Clarifier", "Élever", "Créer", "Grandir & optimiser"],
    film: "Notre méthode en 15 secondes",
    unavailable: "Le film n’a pas pu être chargé. Découvrez les quatre étapes ci-dessous.",
  },
  es: {
    stages: ["Aclarar", "Elevar", "Crear", "Crecer y optimizar"],
    film: "Nuestro proceso en 15 segundos",
    unavailable: "No se pudo cargar el vídeo. Puedes explorar las cuatro etapas a continuación.",
  },
  it: {
    stages: ["Chiarire", "Elevare", "Creare", "Crescere e ottimizzare"],
    film: "Il nostro processo in 15 secondi",
    unavailable: "Impossibile caricare il video. Puoi esplorare le quattro fasi qui sotto.",
  },
  ja: {
    stages: ["明確にする", "高める", "創る", "成長と最適化"],
    film: "15秒で見る私たちのプロセス",
    unavailable: "動画を読み込めませんでした。以下の4つのステップをご覧ください。",
  },
  ko: {
    stages: ["명확하게", "높이기", "창조하기", "성장과 최적화"],
    film: "15초로 보는 우리의 프로세스",
    unavailable: "영상을 불러오지 못했습니다. 아래에서 네 단계를 살펴보세요.",
  },
};
