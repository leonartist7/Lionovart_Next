"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, Check, Minus, Plus } from "lucide-react";
import { useLenis } from "lenis/react";
import { Link } from "@/i18n/navigation";
import { usePublicCopy } from "@/hooks/usePublicCopy";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { useLionJourney } from "./lion-journey/LionJourney";
import styles from "./PawRevealStack.module.css";
import BenefitSculpture from "./BenefitSculpture";

const PAW_IMAGE = "https://res.cloudinary.com/dgio9uutc/image/upload/f_auto,q_auto,w_320/v1775085187/Untitled_design_4_muu53f.png";
const CARD_SEAM_IMAGE = "https://res.cloudinary.com/dgio9uutc/image/upload/f_webp,q_auto,w_1200/v1791532132/sepW_1_put7gh.avif";
const EASE = [0.16, 1, 0.3, 1] as const;
const PULL_EASE = [0.32, 0.72, 0, 1] as const;
const PAW_TIMING = { enter: .45, pull: 1.2, return: 1.05, exit: .35 } as const;
const BENEFITS = [
  {
    title: "Look as good as your work.",
    body: "Let your image reflect the quality of your work.",
    detail: "Trust, before a word.",
    stat: { value: "46.1", unit: "%", label: "Credibility comments citing design", source: "https://credibility.stanford.edu/pdf/How_Do_People_Evaluate_a_Web_Site%27s_Credibility_v37.pdf", sourceLabel: "Study: Stanford / Consumer WebWatch", qualifier: null },
    points: ["Clear positioning", "An identity that reflects your quality"],
  },
  {
    title: "Less admin. More headspace.",
    body: "Let your systems handle the routine.",
    detail: "More time for what matters.",
    stat: { value: "15", unit: "h+", label: "Weekly time-saving target", source: null, sourceLabel: null, qualifier: null },
    points: ["Enquiries and follow-ups in one place", "Workflows built around your team"],
  },
  {
    title: "Be the name they remember.",
    body: "Bring your website, content and identity together.",
    detail: "Unmistakably you. Everywhere.",
    stat: { value: "33", unit: "%", label: "Potential revenue lift from consistency", source: "https://www.prnewswire.com/news-releases/study-finds-companies-with-consistent-branding-can-see-up-to-33-increase-in-revenue-300967219.html", sourceLabel: "Survey: Lucidpress (2019)", qualifier: "Up to" },
    points: ["A recognisable voice", "A consistent world, everywhere"],
  },
];
function BenefitCard({ item, index }: { item: typeof BENEFITS[number]; index: number }) {
  const tr = usePublicCopy();
  const reduced = useHydratedReducedMotion();
  const [phase, setPhase] = useState<"closed" | "revealing" | "open" | "closing">("closed");
  const lock = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const cover = useAnimation();
  const paw = useAnimation();
  const panelId = `imagine-result-${index}`;
  const open = phase === "open";
  const showBenefit = phase === "revealing" || open;
  const busy = phase === "revealing" || phase === "closing";

  const toggle = async (keyboard: boolean) => {
    if (lock.current) return;
    lock.current = true;
    const opening = phase === "closed";
    setPhase(opening ? "revealing" : "closing");
    try {
      if (reduced || keyboard) {
        cover.set({ transform: opening ? "translateY(105%)" : "translateY(0%)" });
        paw.set({ opacity: 0, transform: "translate(-115%, 8%) rotate(-6deg)" });
      } else if (opening) {
        await paw.start({ opacity: 1, transform: "translate(0, 0) rotate(0deg)", transition: { duration: PAW_TIMING.enter, ease: EASE } });
        await Promise.all([
          cover.start({ transform: "translateY(105%)", transition: { duration: PAW_TIMING.pull, ease: PULL_EASE } }),
          paw.start({ transform: "translate(8%, 170%) rotate(5deg)", transition: { duration: PAW_TIMING.pull, ease: PULL_EASE } }),
        ]);
        paw.set({ opacity: 0 });
      } else {
        paw.set({ opacity: 1, transform: "translate(8%, 170%) rotate(5deg)" });
        await Promise.all([
          cover.start({ transform: "translateY(0%)", transition: { duration: PAW_TIMING.return, ease: PULL_EASE } }),
          paw.start({ transform: "translate(0, 0) rotate(0deg)", transition: { duration: PAW_TIMING.return, ease: PULL_EASE } }),
        ]);
        await paw.start({ opacity: 0, transform: "translate(-115%, 8%) rotate(-6deg)", transition: { duration: PAW_TIMING.exit, ease: EASE } });
      }
      setPhase(opening ? "open" : "closed");
      if (keyboard) requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
    } finally {
      lock.current = false;
    }
  };

  return <article className={styles.card} data-benefit-card data-revealed={open} data-phase={phase} data-show-benefit={showBenefit}>
    <div className={styles.cardTop}>
      <div className={styles.cardCopy}>
        <p className={styles.cardBody} data-benefit-measure="copy" aria-hidden={showBenefit}>{tr(item.body)}</p>
        <h3 id={panelId + "-title"} className={styles.cardHeadline} data-benefit-measure="copy" aria-hidden={!showBenefit}>{tr(item.detail)}</h3>
      </div>
    </div>
    <div className={styles.detailShell}>
      <div className={styles.sculpture} data-sculpture={index} data-leaving={phase !== "closed"} aria-hidden="true">
        <BenefitSculpture kind={index} />
      </div>
      <div className={styles.detailWell}>
        <div id={panelId} role="region" aria-labelledby={panelId + "-title"} aria-hidden={!open} className={styles.details}>
          <div className={styles.detailContent} data-benefit-measure="detail">
            <ul>{item.points.map(point => <li key={point}><Check aria-hidden="true" />{tr(point)}</li>)}</ul>
          {item.stat && <div className={styles.metric} data-benefit-stat>
            <span className={styles.metricValue}>{item.stat.qualifier && <small>{tr(item.stat.qualifier)}</small>}{tr(item.stat.value)}<span>{item.stat.unit}</span></span>
            <span className={styles.metricLabel}>{tr(item.stat.label)}</span>
          </div>}
          </div>
        </div>
        <motion.div className={styles.detailCover} animate={cover} aria-hidden="true">

        </motion.div>
        <motion.div className={styles.paw} aria-hidden="true" initial={{ opacity: 0, transform: "translate(-115%, 8%) rotate(-6deg)" }} animate={paw}>
          <Image src={PAW_IMAGE} alt="" fill sizes="(max-width: 767px) 144px, (max-width: 2000px) 12vw, 240px" className={styles.pawImage} />
        </motion.div>
      </div>
      <motion.div className={styles.seamCarrier} animate={cover} aria-hidden="true">
        <div className={styles.cardSeam} data-card-seam>
          <Image src={CARD_SEAM_IMAGE} alt="" fill sizes="(max-width: 999px) 90vw, (max-width: 2000px) 30vw, 560px" />
        </div>
      </motion.div>
    </div>
    <button ref={trigger} type="button" className={styles.cardToggle} aria-expanded={open || phase === "closing"} aria-controls={panelId}
      aria-label={`${tr(open ? "Hide benefit" : "Reveal benefit")}: ${tr(item.title)}`} disabled={busy}
      onClick={event => void toggle(event.detail === 0)}>
      <span className={styles.toggleIcon}>{open ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}</span>
    </button>
  </article>;
}

export default function PawRevealStack() {
  const tr = usePublicCopy();
  const chapterRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const journey = useLionJourney();
  const setRevealSection = journey?.setRevealSection;
  const setReveal = journey?.setReveal;
  const lenis = useLenis();

  // The entrance and the shrinking logo use the same 200vmax circle.
  useEffect(() => {
    const chapter = chapterRef.current;
    if (!chapter) return;
    const measure = () => {
      const radius = parseFloat(getComputedStyle(chapter, "::before").width) / 2;
      const halfWidth = chapter.clientWidth / 2;
      const rise = radius - Math.sqrt(Math.max(0, radius * radius - halfWidth * halfWidth));
      const value = rise.toFixed(3) + "px";
      if (chapter.style.getPropertyValue("--imagine-cap-rise") !== value) chapter.style.setProperty("--imagine-cap-rise", value);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(chapter);
    window.addEventListener("resize", measure);
    measure();
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  // Keep stacked cards equally proportioned as translations, fonts and widths change.
  // Observe the natural inner content, never the equalized outer rows.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const content = Array.from(grid.querySelectorAll<HTMLElement>("[data-benefit-measure]"));
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        for (const part of ["copy", "detail"]) {
          const height = Math.ceil(Math.max(0, ...content.filter(el => el.dataset.benefitMeasure === part).map(el => el.getBoundingClientRect().height)));
          grid.style.setProperty(`--benefit-${part}-height`, `${height}px`);
        }
        for (const card of grid.querySelectorAll<HTMLElement>("[data-benefit-card]")) {
          const stat = card.querySelector<HTMLElement>("[data-benefit-stat]");
          if (!stat) continue;
          const cardBounds = card.getBoundingClientRect(), statBounds = (stat.firstElementChild ?? stat).getBoundingClientRect();
          card.style.setProperty("--benefit-toggle-bottom", (cardBounds.bottom - statBounds.top - statBounds.height / 2 - 22) + "px");
        }
      });
    };
    const observer = new ResizeObserver(measure);
    content.forEach(el => observer.observe(el));
    measure();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    setRevealSection?.(chapterRef.current);
    setReveal?.(1);
    return () => setRevealSection?.(null);
  }, [setRevealSection, setReveal]);

  useEffect(() => {
    if (!["#problems", "#imagine"].includes(window.location.hash)) return;
    let frame = 0;
    let readyFrame = 0;
    const land = () => {
      readyFrame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (!chapterRef.current) return;
          if (lenis) lenis.scrollTo(chapterRef.current, { immediate: true, force: true });
          else chapterRef.current.scrollIntoView({ behavior: "instant", block: "start" });
        });
      });
    };
    if (document.documentElement.dataset.splashComplete === "true") land();
    else window.addEventListener("lionovart:splash-complete", land, { once: true });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(readyFrame); window.removeEventListener("lionovart:splash-complete", land); };
  }, [lenis]);

  return <section ref={chapterRef} id="problems" aria-labelledby="imagine-heading" className={styles.chapter} data-imagine-chapter data-scroll-title-skip>
    <span id="imagine" className={styles.anchor} aria-hidden="true" />
    <div className={styles.redChapter}>
      <header className={styles.intro}>
        <h2 id="imagine-heading"><span>{tr("Your image speaks first.")}</span></h2>
        <p className={styles.introBody}>{tr("Let it speak well of the work behind it.")}</p>
      </header>
      <div ref={gridRef} className={styles.grid} data-imagine-content>
        {BENEFITS.map((item, index) => <BenefitCard key={item.title} item={item} index={index} />)}
      </div>
      <div className={styles.reviewOffer}>
        <p><span>{tr("Not sure where to start?")}</span>{tr("A personal review. Three priority fixes.")}</p>
        <Link href="/audit" className={styles.reviewLink}>{tr("Review my brand")}<ArrowUpRight aria-hidden="true" /></Link>
      </div>
    </div>
  </section>;
}
