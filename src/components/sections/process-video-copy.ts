import type { Locale } from "@/lib/i18n";

type FilmCopy = {
  stages: [string, string, string, string];
  play: string; pause: string; replay: string; mute: string; unmute: string;
  film: string; unavailable: string; retry: string; blocked: string; transcript: string;
};

export const PROCESS_FILM_COPY: Record<Locale, FilmCopy> = {
  en: {
    stages: ["Clarify", "Elevate", "Create", "Rise & Optimize"],
    play: "Play", pause: "Pause", replay: "Replay", mute: "Mute", unmute: "Sound on",
    film: "Our process in 15 seconds", transcript: "Read the film · English",
    unavailable: "The film couldn’t load. You can still explore the four steps below.",
    retry: "Try again", blocked: "Select Play to watch the film.",
  },
  fr: {
    stages: ["Clarifier", "Élever", "Créer", "Grandir & optimiser"],
    play: "Lire", pause: "Pause", replay: "Revoir", mute: "Couper le son", unmute: "Activer le son",
    film: "Notre méthode en 15 secondes", transcript: "Lire le texte du film · Anglais",
    unavailable: "Le film n’a pas pu être chargé. Découvrez les quatre étapes ci-dessous.",
    retry: "Réessayer", blocked: "Sélectionnez Lire pour regarder le film.",
  },
  es: {
    stages: ["Aclarar", "Elevar", "Crear", "Crecer y optimizar"],
    play: "Reproducir", pause: "Pausar", replay: "Volver a ver", mute: "Silenciar", unmute: "Activar sonido",
    film: "Nuestro proceso en 15 segundos", transcript: "Leer el vídeo · Inglés",
    unavailable: "No se pudo cargar el vídeo. Puedes explorar las cuatro etapas a continuación.",
    retry: "Reintentar", blocked: "Selecciona Reproducir para ver el vídeo.",
  },
  it: {
    stages: ["Chiarire", "Elevare", "Creare", "Crescere e ottimizzare"],
    play: "Riproduci", pause: "Pausa", replay: "Riguarda", mute: "Disattiva audio", unmute: "Attiva audio",
    film: "Il nostro processo in 15 secondi", transcript: "Leggi il video · Inglese",
    unavailable: "Impossibile caricare il video. Puoi esplorare le quattro fasi qui sotto.",
    retry: "Riprova", blocked: "Seleziona Riproduci per guardare il video.",
  },
  ja: {
    stages: ["明確にする", "高める", "創る", "成長と最適化"],
    play: "再生", pause: "一時停止", replay: "もう一度見る", mute: "消音", unmute: "音声をオン",
    film: "15秒で見る私たちのプロセス", transcript: "映像のテキストを読む · 英語",
    unavailable: "動画を読み込めませんでした。以下の4つのステップをご覧ください。",
    retry: "再試行", blocked: "再生を選択して動画をご覧ください。",
  },
  ko: {
    stages: ["명확하게", "높이기", "창조하기", "성장과 최적화"],
    play: "재생", pause: "일시 정지", replay: "다시 보기", mute: "음소거", unmute: "소리 켜기",
    film: "15초로 보는 우리의 프로세스", transcript: "영상 텍스트 읽기 · 영어",
    unavailable: "영상을 불러오지 못했습니다. 아래에서 네 단계를 살펴보세요.",
    retry: "다시 시도", blocked: "재생을 선택해 영상을 시청하세요.",
  },
};
