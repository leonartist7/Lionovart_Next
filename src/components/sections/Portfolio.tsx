"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";

// --- Data Structure ---
// Layout (12-col grid, 2 explicit rows):
//
//  [  Card 1 — 4col×2row tall  ] [  Card 2 — 4col×1row  ] [  Card 3 — 4col×2row tall  ]
//  [  Card 1 — continues       ] [  Card 4 — 4col×1row  ] [  Card 3 — continues       ]
//  [  Card 5 — 12col×1row wide bottom banner  ]
//
const PROJECTS = [
  {
    id: 1,
    title: "Alture Brand Identity",
    description: "Full rebrand — logo system, typography, color palette",
    metric: "3x",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&q=80",
    gridClasses: "col-span-1 md:col-span-3 md:row-span-2 lg:col-span-4 lg:row-span-2",
  },
  {
    id: 2,
    title: "Nova Web Design",
    description: "Premium SaaS landing page with motion design",
    metric: "150%",
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80",
    gridClasses: "col-span-1 md:col-span-3 md:row-span-1 lg:col-span-4 lg:row-span-1",
  },
  {
    id: 3,
    title: "Fluora Campaign",
    description: "Social media & video production campaign",
    metric: "10k+",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&q=80",
    gridClasses: "col-span-1 md:col-span-3 md:row-span-2 lg:col-span-4 lg:row-span-2",
  },
  {
    id: 4,
    title: "Arpeggio Music App",
    description: "UI/UX design & interactive prototype",
    metric: "4.9",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    gridClasses: "col-span-1 md:col-span-3 md:row-span-1 lg:col-span-4 lg:row-span-1",
  },
  {
    id: 5,
    title: "LionNova Branding",
    description: "Brand strategy, logo, and style guide",
    metric: "Top 10",
    image: "https://images.unsplash.com/photo-1634942537034-2531766767d1?w=800&q=80",
    gridClasses: "col-span-1 md:col-span-6 md:row-span-1 lg:col-span-12 lg:row-span-1",
  },
];

// --- Subcomponents ---

function BentoCard({
  project,
  index,
  onClick,
}: {
  project: (typeof PROJECTS)[0];
  index: number;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  // Max 4 degrees rotation
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={`relative ${project.gridClasses}`}
      style={{ perspective: 1200 }}
      // Scroll Entrance Animation
      initial={{ opacity: 0, y: 150 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: (index % 3) * 0.1, // Organic stagger by column index
      }}
    >
      <motion.div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative flex h-full w-full cursor-pointer flex-col justify-end overflow-hidden rounded-[20px] bg-[#161616] min-h-[280px] md:min-h-0"
        style={{
          rotateX,
          rotateY,
        }}
        animate={{
          scale: isHovered ? 1.03 : 1,
          boxShadow: isHovered
            ? "0 20px 48px -12px rgba(240, 201, 23, 0.55), 0 0 20px -4px rgba(240, 201, 23, 0.35), inset 0 0 40px rgba(240, 201, 23, 0.07)"
            : "0 0 0 0 rgba(240, 201, 23, 0)",
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // Beautiful Expo Out ease
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${project.image})` }}
        />

        {/* Predominant Fade Overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-500 ease-[0.16,1,0.3,1]"
          style={{
            background:
              "linear-gradient(to top, rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 0, 0.85) 25%, rgba(0, 0, 0, 0.5) 50%, transparent 100%)",
            opacity: isHovered ? 0.85 : 1,
          }}
        />

        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-end p-6 md:p-8">
          <span
            className="mb-1 text-[2.5rem] font-[800] leading-none text-[#e5192a]"
            style={{ textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
          >
            {project.metric}
          </span>
          <h3 className="mb-1 text-[1.1rem] font-bold text-white">
            {project.title}
          </h3>
          <p className="text-[0.85rem] text-white/85">{project.description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Main Component ---

export default function Portfolio() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const activeProject = activeIdx !== null ? PROJECTS[activeIdx] : null;

  const handleClose = () => setActiveIdx(null);

  const handleNext = useCallback(() => {
    if (activeIdx !== null) {
      setActiveIdx((activeIdx + 1) % PROJECTS.length);
    }
  }, [activeIdx]);

  const handlePrev = useCallback(() => {
    if (activeIdx !== null) {
      setActiveIdx((activeIdx - 1 + PROJECTS.length) % PROJECTS.length);
    }
  }, [activeIdx]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIdx === null) return;
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIdx, handleNext, handlePrev]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (activeIdx !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeIdx]);

  return (
    <section id="work" className="bg-[#F5F0EB] py-[80px] md:py-[120px]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <motion.p
            className="mb-4 text-[13px] font-semibold uppercase tracking-[0.2em] text-brand-red"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            Selected Work
          </motion.p>
          <motion.h2
            className="text-[2.2rem] font-bold uppercase leading-none tracking-tight text-[#111111] sm:text-[3rem] md:text-[4.5rem]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Built for <span className="text-brand-red">Impact</span>
          </motion.h2>
        </div>

        {/* CSS Grid
            Desktop (lg): 12 cols, 3 rows — [270px tall] [270px tall] [200px wide banner]
            Tablet (md):  6 cols,  auto rows
            Mobile:       1 col,   auto rows
        */}
        <div className="
          grid gap-5
          grid-cols-1
          md:grid-cols-6 md:grid-rows-[280px_280px_220px]
          lg:grid-cols-12 lg:grid-rows-[270px_270px_200px]
        ">
          {PROJECTS.map((project, idx) => (
            <BentoCard
              key={project.id}
              project={project}
              index={idx}
              onClick={() => setActiveIdx(idx)}
            />
          ))}
        </div>
      </div>

      {/* Interactive Slideshow Modal */}
      <AnimatePresence>
        {activeProject && activeIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md md:p-8"
            onClick={handleClose}
          >
            {/* Left Arrow (Outside Modal Container) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 top-1/2 z-[60] -translate-y-1/2 p-4 text-white/50 transition-all hover:scale-110 hover:text-white md:left-8"
              aria-label="Previous project"
            >
              <svg
                className="h-10 w-10 md:h-14 md:w-14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow (Outside Modal Container) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 top-1/2 z-[60] -translate-y-1/2 p-4 text-white/50 transition-all hover:scale-110 hover:text-white md:right-8"
              aria-label="Next project"
            >
              <svg
                className="h-10 w-10 md:h-14 md:w-14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Modal Container */}
            <motion.div
              className="relative flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[24px] bg-[#0a0a0a] shadow-2xl md:h-[600px] md:flex-row"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()} // Prevent close on modal click
            >
              {/* Left: Image Container */}
              <div className="relative h-[300px] w-full md:h-full md:w-[55%]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeProject.id}
                    src={activeProject.image}
                    alt={activeProject.title}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
              </div>

              {/* Right: Details Column */}
              <div className="flex w-full flex-col justify-between p-8 md:w-[45%] md:p-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProject.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="mb-4 block text-[3.5rem] font-[800] leading-none text-brand-red md:text-[4.5rem]">
                      {activeProject.metric}
                    </span>
                    <h3 className="mb-4 text-[1.8rem] font-bold uppercase tracking-tight text-white md:text-[2.2rem]">
                      {activeProject.title}
                    </h3>
                    <p className="text-[1rem] leading-relaxed text-white/70">
                      {activeProject.description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Slideshow Image Dock */}
                <div className="mt-12 flex flex-wrap items-center gap-3 md:gap-4">
                  {PROJECTS.map((proj, dotIdx) => {
                    const isActive = dotIdx === activeIdx;
                    return (
                      <button
                        key={dotIdx}
                        onClick={() => setActiveIdx(dotIdx)}
                        className={`relative h-10 w-10 overflow-hidden rounded-full transition-all duration-500 ease-[0.16,1,0.3,1] md:h-12 md:w-12 ${
                          isActive
                            ? "scale-110 shadow-[0_0_15px_rgba(229,25,42,0.8)] ring-2 ring-brand-red ring-offset-2 ring-offset-[#0a0a0a]"
                            : "opacity-40 hover:scale-105 hover:opacity-100"
                        }`}
                        aria-label={`View project ${proj.title}`}
                      >
                        <img
                          src={proj.image}
                          alt={`Thumbnail for ${proj.title}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label="Close modal"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}