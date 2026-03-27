"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

export type Project = {
  id: string;
  image: string;
  title: string;
  description: string;
  metric: string;
};

interface ExpandableBentoGridProps {
  projects: Project[];
}

// -----------------------------------------------------------------------------
// Interactive 3D Card
// -----------------------------------------------------------------------------
function BentoCard({
  project,
  index,
  onClick,
}: {
  project: Project;
  index: number;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  // Grid spans
  let colSpan = "lg:col-span-4";
  if (index === 0) colSpan = "lg:col-span-6";
  else if (index === 1 || index === 2) colSpan = "lg:col-span-3";
  else if (index === 6) colSpan = "lg:col-span-12";

  let mdSpan = "md:col-span-3";
  if (index === 6) mdSpan = "md:col-span-6";

  const spanClass = `col-span-1 row-span-2 ${mdSpan} ${colSpan}`;

  return (
    <motion.div
      layoutId={`card-container-${project.id}`}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      initial={{ y: 150, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        bounce: 0.3,
        duration: 0.8,
        delay: index * 0.1,
      }}
      className={`relative w-full h-full rounded-[24px] cursor-pointer touch-none select-none ${spanClass}`}
      onContextMenu={(e) => e.preventDefault()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      animate={{
        scale: isHovered ? 1.03 : 1,
        boxShadow: isHovered
          ? "0 20px 40px -15px rgba(229, 25, 42, 1), 0 0 15px -5px rgba(229, 25, 42, 0.8)"
          : "0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 0px 0px rgba(229, 25, 42, 0)",
      }}
    >
      <div className="relative w-full h-full overflow-hidden rounded-[24px] bg-[#111]">
        {/* Background Image */}
        <motion.img
          layoutId={`card-image-${project.id}`}
          src={project.image}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 z-10 transition-opacity duration-500 ease-out flex flex-col justify-end p-6 md:p-8"
          style={{
            background:
              "linear-gradient(to top, rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 0, 0.85) 25%, rgba(0, 0, 0, 0.5) 50%, transparent 100%)",
            opacity: isHovered ? 0.85 : 1,
          }}
        >
          <motion.div
            layoutId={`card-text-container-${project.id}`}
            className="flex flex-col items-start justify-end"
          >
            <motion.div
              layoutId={`card-metric-${project.id}`}
              className="text-[#e5192a] text-[2.5rem] font-[800] leading-none mb-2"
              style={{ textShadow: "0px 4px 10px rgba(0,0,0,0.5)" }}
            >
              {project.metric}
            </motion.div>
            <motion.div
              layoutId={`card-title-${project.id}`}
              className="text-white font-bold text-[1.1rem] leading-tight mb-1"
            >
              {project.title}
            </motion.div>
            <motion.div
              layoutId={`card-desc-${project.id}`}
              className="text-white/85 text-[0.85rem] leading-snug line-clamp-2"
            >
              {project.description}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Slideshow Modal
// -----------------------------------------------------------------------------
function SlideshowModal({
  projects,
  activeIndex,
  onClose,
  onChangeIndex,
}: {
  projects: Project[];
  activeIndex: number;
  onClose: () => void;
  onChangeIndex: (i: number) => void;
}) {
  const activeProject = projects[activeIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChangeIndex((activeIndex + 1) % projects.length);
      if (e.key === "ArrowLeft") onChangeIndex((activeIndex - 1 + projects.length) % projects.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, projects.length, onClose, onChangeIndex]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-8"
      onClick={onClose}
    >
      {/* Modal Container */}
      <motion.div
        layoutId={`card-container-${activeProject.id}`}
        className="relative w-full max-w-[1000px] bg-[#111] rounded-[24px] overflow-hidden flex flex-col lg:flex-row h-[80vh] lg:h-[600px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Image (55%) */}
        <div className="relative w-full lg:w-[55%] h-1/2 lg:h-full">
          <motion.img
            layoutId={`card-image-${activeProject.id}`}
            src={activeProject.image}
            alt={activeProject.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Close Button on Mobile */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* Right: Details (45%) */}
        <div className="relative w-full lg:w-[45%] h-1/2 lg:h-full flex flex-col p-6 md:p-10 justify-between bg-[#0a0a0a]">
          {/* Close Button on Desktop */}
          <button
            onClick={onClose}
            className="hidden lg:flex absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm items-center justify-center text-white"
          >
            ✕
          </button>

          <motion.div
            layoutId={`card-text-container-${activeProject.id}`}
            className="flex flex-col mt-4 lg:mt-10"
          >
            <motion.div
              layoutId={`card-metric-${activeProject.id}`}
              className="text-[#e5192a] text-[3.5rem] lg:text-[4.5rem] font-[800] leading-none mb-4"
              style={{ textShadow: "0px 4px 15px rgba(229,25,42,0.3)" }}
            >
              {activeProject.metric}
            </motion.div>
            <motion.div
              layoutId={`card-title-${activeProject.id}`}
              className="text-white font-bold text-[1.8rem] lg:text-[2.2rem] leading-tight mb-4"
            >
              {activeProject.title}
            </motion.div>
            <motion.div
              layoutId={`card-desc-${activeProject.id}`}
              className="text-white/80 text-[1rem] leading-relaxed"
            >
              {activeProject.description}
            </motion.div>
          </motion.div>

          {/* Slideshow Dock */}
          <div className="mt-8 flex items-center gap-3">
            {projects.map((p, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={p.id}
                  onClick={() => onChangeIndex(i)}
                  className="group outline-none"
                >
                  <motion.div
                    className="rounded-full"
                    animate={{
                      width: isActive ? 12 : 10,
                      height: isActive ? 12 : 10,
                      backgroundColor: isActive ? "#e5192a" : "rgba(255,255,255,0.2)",
                      boxShadow: isActive ? "0 0 10px 2px rgba(229,25,42,0.6)" : "0 0 0px 0px rgba(0,0,0,0)",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// -----------------------------------------------------------------------------
// Main Grid Component
// -----------------------------------------------------------------------------
export default function ExpandableBentoGrid({ projects }: ExpandableBentoGridProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 auto-rows-[150px] md:auto-rows-[180px] gap-[14px]">
        {projects.map((project, idx) => (
          <BentoCard
            key={project.id}
            project={project}
            index={idx}
            onClick={() => setActiveIdx(idx)}
          />
        ))}
      </div>

      <AnimatePresence>
        {activeIdx !== null && (
          <SlideshowModal
            projects={projects}
            activeIndex={activeIdx}
            onClose={() => setActiveIdx(null)}
            onChangeIndex={(i) => setActiveIdx(i)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
