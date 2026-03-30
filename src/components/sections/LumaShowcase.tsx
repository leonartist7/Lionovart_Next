"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface ServiceItem {
  id: string;
  label: string;
  shortLabel: string;
  accent: string;
  hookText: ReactNode;
  statValue: string;
  statLabel: string;
  leftVisual: { type: "image" | "video"; src: string; caption?: string };
  rightVisual: { type: "image" | "video"; src: string; caption?: string };
  audioId: string;
  hasCinematicHit?: boolean;
}

const SERVICES: ServiceItem[] = [
  {
    id: "default",
    label: "LIONOVART",
    shortLabel: "ALL",
    accent: "#e5192a",
    hookText: (
      <>
        We don&apos;t make videos.<br />
        We direct emotions.
      </>
    ),
    statValue: "30+",
    statLabel: "years combined experience",
    leftVisual: { type: "video", src: "https://cdn.pixabay.com/video/2020/05/24/40061-424855011_large.mp4", caption: "Short looping video reel" },
    rightVisual: { type: "image", src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070", caption: "Device mockup showing best website project" },
    audioId: "default",
  },
  {
    id: "branding",
    label: "BRANDING",
    shortLabel: "BRA",
    accent: "#f59e0b",
    hookText: (
      <>
        Your brand is the first thing<br />
        people judge — and the last<br />
        thing they forget.
      </>
    ),
    statValue: "3x",
    statLabel: "average perceived value increase after rebrand",
    leftVisual: { type: "image", src: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070", caption: "Brand identity spread" },
    rightVisual: { type: "image", src: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2071", caption: "Before → After comparison" },
    audioId: "branding",
  },
  {
    id: "web",
    label: "WEB / APP",
    shortLabel: "WEB",
    accent: "#10b981",
    hookText: (
      <>
        Websites built to perform.<br />
        Not just to impress.
      </>
    ),
    statValue: "150%",
    statLabel: "conversion lift on Nova redesign",
    leftVisual: { type: "video", src: "https://cdn.pixabay.com/video/2021/08/21/85842-591522026_large.mp4", caption: "Live website scroll recording" },
    rightVisual: { type: "image", src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070", caption: "Phone mockup + speed score" },
    audioId: "web",
  },
  {
    id: "av",
    label: "A/V PRODUCTION",
    shortLabel: "A/V",
    accent: "#e5192a",
    hookText: (
      <>
        We don&apos;t make videos.<br />
        We direct emotions.
      </>
    ),
    statValue: "10k+",
    statLabel: "social impressions on Fluora campaign",
    leftVisual: { type: "video", src: "https://cdn.pixabay.com/video/2020/02/26/32839-393275753_large.mp4", caption: "Video production reel clip" },
    rightVisual: { type: "image", src: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974", caption: "Social media results card" },
    audioId: "default",
    hasCinematicHit: true,
  },
  {
    id: "print",
    label: "PRINTING",
    shortLabel: "PRI",
    accent: "#f59e0b",
    hookText: (
      <>
        Every touchpoint is an emotion.<br />
        We compose them like a score —<br />
        nothing is accidental.
      </>
    ),
    statValue: "100%",
    statLabel: "brand consistency across all deliverables",
    leftVisual: { type: "image", src: "https://images.unsplash.com/photo-1616186637372-df7a6b28f804?q=80&w=2070", caption: "Print design spread" },
    rightVisual: { type: "image", src: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?q=80&w=2070", caption: "Physical product mockup" },
    audioId: "print",
  },
];

function getOrderedServices(centerIdx: number): ServiceItem[] {
  const n = SERVICES.length;
  return [
    SERVICES[(centerIdx - 2 + n) % n],
    SERVICES[(centerIdx - 1 + n) % n],
    SERVICES[centerIdx],
    SERVICES[(centerIdx + 1) % n],
    SERVICES[(centerIdx + 2) % n],
  ];
}

export default function LumaShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: "-20%", once: false });
  
  const [activeIndex, setActiveIndex] = useState(0); // State 0 is default
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [hasEntered, setHasEntered] = useState(false);

  const ordered = getOrderedServices(activeIndex);
  const active = SERVICES[activeIndex];

  const bassAudioRef = useRef<HTMLAudioElement | null>(null);
  const hitAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceoverRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const autoPlayDuration = 6000;
  const lastInteractionTime = useRef<number>(Date.now());
  const progressStartTime = useRef<number | null>(null);
  const reqRef = useRef<number>(0);

  // Initialize Audio
  useEffect(() => {
    if (typeof window !== "undefined") {
      bassAudioRef.current = new Audio("https://cdn.freesound.org/previews/415/415209_5121236-lq.mp3");
      hitAudioRef.current = new Audio("https://cdn.freesound.org/previews/336/336605_2865330-lq.mp3");
      
      const voices = ["default", "branding", "web", "print"];
      voices.forEach(v => {
        voiceoverRefs.current[v] = new Audio(`/sounds/${v}.mp3`);
      });
    }
  }, []);

  // Stop all active voiceovers
  const stopVoiceovers = () => {
    Object.values(voiceoverRefs.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  };

  // Handle entry audio
  useEffect(() => {
    if (isInView && !hasEntered) {
      setHasEntered(true);
      if (isSoundOn && bassAudioRef.current) {
        bassAudioRef.current.currentTime = 0;
        bassAudioRef.current.volume = 0.5;
        bassAudioRef.current.play().catch(() => {});
      }
    }
  }, [isInView, hasEntered, isSoundOn]);

  // Handle state audio
  useEffect(() => {
    if (!isSoundOn || !isInView) return;
    
    stopVoiceovers();
    const voice = voiceoverRefs.current[active.audioId];
    if (voice) {
      voice.currentTime = 0;
      voice.volume = 0.8;
      voice.play().catch(() => {});
    }

    if (active.hasCinematicHit && hitAudioRef.current) {
      hitAudioRef.current.currentTime = 0;
      hitAudioRef.current.volume = 0.6;
      hitAudioRef.current.play().catch(() => {});
    }
  }, [activeIndex, active, isSoundOn, isInView]);

  const toggleSound = () => {
    const newSoundState = !isSoundOn;
    setIsSoundOn(newSoundState);
    if (newSoundState) {
      if (bassAudioRef.current) {
        bassAudioRef.current.volume = 0.5;
        bassAudioRef.current.play().catch(() => {});
      }
      stopVoiceovers();
      const voice = voiceoverRefs.current[active.audioId];
      if (voice) {
        voice.currentTime = 0;
        voice.volume = 0.8;
        voice.play().catch(() => {});
      }
    } else {
      stopVoiceovers();
    }
  };

  const handlePillClick = (index: number) => {
    setActiveIndex(index);
    setIsAutoPlaying(false);
    lastInteractionTime.current = Date.now();
  };

  // Autoplay idle resume
  useEffect(() => {
    const idleCheckInterval = setInterval(() => {
      if (!isAutoPlaying && Date.now() - lastInteractionTime.current > 10000) {
        setIsAutoPlaying(true);
        progressStartTime.current = Date.now();
      }
    }, 1000);
    return () => clearInterval(idleCheckInterval);
  }, [isAutoPlaying]);

  // Autoplay loop
  useEffect(() => {
    if (!isAutoPlaying || !isInView) {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      setAutoPlayProgress(0);
      return;
    }

    if (!progressStartTime.current) progressStartTime.current = Date.now();

    const updateProgress = () => {
      if (!progressStartTime.current) return;
      const elapsed = Date.now() - progressStartTime.current;
      const progress = Math.min((elapsed / autoPlayDuration) * 100, 100);
      
      setAutoPlayProgress(progress);

      if (progress >= 100) {
        setActiveIndex((prev) => (prev + 1) % SERVICES.length);
        progressStartTime.current = Date.now();
      }
      
      reqRef.current = requestAnimationFrame(updateProgress);
    };

    reqRef.current = requestAnimationFrame(updateProgress);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isAutoPlaying, isInView, activeIndex]);

  return (
    <section ref={sectionRef} className="relative min-h-screen w-full overflow-hidden bg-[#0D0D0D]">
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pt-24 pb-12 md:pt-32 md:pb-24"
        initial={{ "--luma-accent": active.accent } as any}
        animate={{ "--luma-accent": active.accent } as any}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        {/* Glow Layer */}
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 z-[1] h-[55vh] w-[80vw] -translate-x-1/2 rounded-t-full blur-3xl opacity-70"
          style={{ background: "radial-gradient(ellipse at bottom, var(--luma-accent), transparent 70%)" }}
        />

        {/* Lion Cutout */}
        <img
          src="https://i.imgur.com/2PGbCnR.png"
          alt="Lion cutout"
          draggable={false}
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] mx-auto h-auto select-none object-contain w-[400px] md:w-[500px] lg:w-[600px] opacity-40 mix-blend-screen"
        />

        {/* ── 3-Column Guided Presentation Layout ── */}
        <div className="relative z-[5] mx-auto flex w-full max-w-[1400px] flex-col items-center justify-between px-4 md:flex-row md:px-6">
          
          {/* Left Visual Column */}
          <div className="relative hidden aspect-[4/5] w-[25%] overflow-hidden rounded-[20px] border border-white/10 bg-white/5 md:block">
            <AnimatePresence mode="wait">
              {active.leftVisual.type === "image" ? (
                <motion.img
                  key={`left-img-${active.id}`}
                  src={active.leftVisual.src}
                  alt={active.leftVisual.caption}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <motion.video
                  key={`left-vid-${active.id}`}
                  src={active.leftVisual.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </AnimatePresence>
            <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-white/80 backdrop-blur-md">
              {active.leftVisual.caption}
            </div>
          </div>

          {/* Center Column: Hook Text + Stat Card */}
          <div className="flex flex-1 flex-col items-center justify-center text-center pb-8 md:pb-16 z-10">
            {/* Hook Text */}
            <div className="relative h-[120px] w-full md:h-[160px]">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={`hook-${active.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center text-[28px] font-medium leading-[1.2] tracking-tight text-white sm:text-[36px] md:text-[44px]"
                >
                  <span className="max-w-[700px]">{active.hookText}</span>
                </motion.h2>
              </AnimatePresence>
            </div>

            {/* Stat Card */}
            <div className="relative mt-8 h-[90px] w-full max-w-[320px] overflow-hidden rounded-[16px] border border-white/10 bg-white/5 backdrop-blur-xl md:mt-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`stat-${active.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.8, ease: "easeInOut", delay: 0.1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center px-4"
                >
                  <div className="text-[28px] font-bold leading-none text-white" style={{ color: "var(--luma-accent)" }}>
                    {active.statValue}
                  </div>
                  <div className="mt-1 text-[11px] font-medium uppercase tracking-widest text-white/50">
                    {active.statLabel}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mobile Single Visual (Alternating) */}
            <div className="relative mt-8 aspect-[4/3] w-full max-w-[320px] overflow-hidden rounded-[16px] border border-white/10 bg-white/5 md:hidden">
              <AnimatePresence mode="wait">
                {activeIndex % 2 === 0 ? (
                  active.leftVisual.type === "image" ? (
                    <motion.img
                      key={`mob-left-img-${active.id}`}
                      src={active.leftVisual.src}
                      alt={active.leftVisual.caption}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <motion.video
                      key={`mob-left-vid-${active.id}`}
                      src={active.leftVisual.src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )
                ) : (
                  active.rightVisual.type === "image" ? (
                    <motion.img
                      key={`mob-right-img-${active.id}`}
                      src={active.rightVisual.src}
                      alt={active.rightVisual.caption}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <motion.video
                      key={`mob-right-vid-${active.id}`}
                      src={active.rightVisual.src}
                      autoPlay
                      muted
                      loop
                      playsInline
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Visual Column */}
          <div className="relative hidden aspect-[4/5] w-[25%] overflow-hidden rounded-[20px] border border-white/10 bg-white/5 md:block">
            <AnimatePresence mode="wait">
              {active.rightVisual.type === "image" ? (
                <motion.img
                  key={`right-img-${active.id}`}
                  src={active.rightVisual.src}
                  alt={active.rightVisual.caption}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <motion.video
                  key={`right-vid-${active.id}`}
                  src={active.rightVisual.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </AnimatePresence>
            <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-white/80 backdrop-blur-md">
              {active.rightVisual.caption}
            </div>
          </div>
        </div>

        {/* ── Pills Row ── */}
        <div className="absolute bottom-24 left-1/2 z-[20] flex -translate-x-1/2 items-center gap-2 md:bottom-12 md:gap-3">
          {ordered.map((item, i) => {
            const isCenter = i === 2;
            const expandedWidth = "clamp(120px, 18vw, 220px)";
            const pillSize = "clamp(40px, 4.2vw, 60px)";
            
            return (
              <div
                key={i}
                onClick={() => handlePillClick(SERVICES.findIndex((s) => s.id === item.id))}
                className="relative shrink-0 rounded-full transition-all duration-500 ease-in-out"
                style={{
                  width: isCenter ? expandedWidth : pillSize,
                  height: pillSize,
                  cursor: "pointer",
                }}
              >
                <div
                  className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full backdrop-blur-md transition-colors duration-500 ${isCenter ? "" : "border border-white/10 bg-white/20"}`}
                  style={{
                    backgroundColor: isCenter ? "var(--luma-accent)" : undefined,
                  }}
                  title={item.label}
                >
                  <AnimatePresence mode="wait">
                    {isCenter ? (
                      <motion.span
                        key={`center-${item.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="whitespace-nowrap px-3 text-[11px] font-bold uppercase tracking-wider text-white md:text-[12px]"
                      >
                        {item.label}
                      </motion.span>
                    ) : (
                      <motion.span
                        key={`side-${item.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-[10px] font-semibold uppercase tracking-wide text-white/70"
                      >
                        {item.shortLabel}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Auto-play Progress Bar */}
                {isCenter && (
                  <div className="absolute -bottom-3 left-0 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div 
                      className="h-full bg-white"
                      style={{ width: `${autoPlayProgress}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Audio Opt-In Button ── */}
        <button 
          onClick={toggleSound}
          className="absolute bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-white/70 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
        >
          {isSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="text-xs font-semibold uppercase tracking-wider">{isSoundOn ? "Sound On" : "Sound Off"}</span>
        </button>

        {/* ── Auto-cycle Indicator ── */}
        <AnimatePresence>
          {isAutoPlaying && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute left-1/2 top-4 z-[60] -translate-x-1/2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/50 backdrop-blur-sm"
            >
              Auto-Playing
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </section>
  );
}