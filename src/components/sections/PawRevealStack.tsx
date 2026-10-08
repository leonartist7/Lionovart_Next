"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useAnimation, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, Check, Minus, Pause, Play, Plus } from "lucide-react";
import { useLenis } from "lenis/react";
import { Link } from "@/i18n/navigation";
import { usePublicCopy } from "@/hooks/usePublicCopy";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";
import { useLionJourney } from "./lion-journey/LionJourney";
import { SHOWCASE_IMAGES } from "./showcase-images";
import styles from "./PawRevealStack.module.css";
import BenefitSculpture from "./BenefitSculpture";

const PAW_IMAGE = "https://res.cloudinary.com/dgio9uutc/image/upload/f_auto,q_auto,w_320/v1775085187/Untitled_design_4_muu53f.png";
const CARD_SEAM_IMAGE = "https://res.cloudinary.com/dgio9uutc/image/upload/f_webp,q_auto,w_1200/v1791472322/magnific__enhance__13327_ykxqce.avif";
const EASE = [0.16, 1, 0.3, 1] as const;
const PULL_EASE = [0.32, 0.72, 0, 1] as const;
const PAW_TIMING = { enter: .45, pull: 1.2, return: 1.05, exit: .35 } as const;
const BENEFITS = [
  {
    title: "Look as good as your work.",
    body: "Give people a reason to trust your business before you say a word.",
    detail: "A presence that does your work justice.",
    stat: { value: "46.1", unit: "%", label: "Of credibility comments referenced design", source: "https://credibility.stanford.edu/pdf/How_Do_People_Evaluate_a_Web_Site%27s_Credibility_v37.pdf", sourceLabel: "Study: Stanford / Consumer WebWatch", qualifier: null },
    points: ["A clear position in your market", "An identity that reflects your quality"],
  },
  {
    title: "Less admin. More headspace.",
    body: "Let your systems handle the routine. Put your time where it matters.",
    detail: "More space for what moves you forward.",
    stat: { value: "15", unit: "h+", label: "Weekly time-saving target", source: null, sourceLabel: null, qualifier: null },
    points: ["Enquiries and follow-ups in one place", "Workflows built around your team"],
  },
  {
    title: "Be the name they remember.",
    body: "One recognisable world, across your website, content and identity.",
    detail: "Every encounter feels like your brand.",
    stat: { value: "33", unit: "%", label: "Potential revenue lift with consistent branding", source: "https://www.prnewswire.com/news-releases/study-finds-companies-with-consistent-branding-can-see-up-to-33-increase-in-revenue-300967219.html", sourceLabel: "Survey: Lucidpress (2019)", qualifier: "Up to" },
    points: ["A recognisable voice", "A consistent world, everywhere"],
  },
];
const shortViewportQuery = "(max-height: 480px)";
const subscribeShortViewport = (notify: () => void) => {
  const media = matchMedia(shortViewportQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};


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

  return <article className={styles.card} data-benefit-card data-has-metric={Boolean(item.stat)} data-revealed={open} data-phase={phase}>
    <div className={styles.cardTop}>
      <div className={styles.cardCopy} data-benefit-measure="copy">
        <h3 id={panelId + "-title"}><span data-benefit-measure="heading">{tr(item.title)}</span></h3>
        <p className={styles.cardBody}><span data-benefit-measure="body">{tr(item.body)}</span></p>
      </div>
    </div>
    <div className={styles.detailShell}>
      <div className={styles.sculpture} data-sculpture={index} data-leaving={phase !== "closed"} aria-hidden="true">
        <BenefitSculpture kind={index} />
      </div>
      <div className={styles.detailWell}>
        <div id={panelId} role="region" aria-labelledby={panelId + "-title"} aria-hidden={!open} className={styles.details}>
          <div className={styles.detailContent} data-benefit-measure="detail">
            <p>{tr(item.detail)}</p>
            <ul>{item.points.map(point => <li key={point}><Check aria-hidden="true" />{tr(point)}</li>)}</ul>
            {item.stat?.source && <a className={styles.metricSource} href={item.stat.source} target="_blank" rel="noreferrer"
              tabIndex={open ? 0 : -1} aria-label={tr("Read the research source")}>{tr(item.stat.sourceLabel || "Research source")}</a>}
          </div>
        </div>
        <motion.div className={styles.detailCover} animate={cover} aria-hidden={open}>
          <div className={styles.cardSeam} aria-hidden="true" data-card-seam>
            <Image src={CARD_SEAM_IMAGE} alt="" fill sizes="(max-width: 1023px) 90vw, (max-width: 2000px) 30vw, 560px" />
          </div>
          {item.stat && <div className={styles.metric} data-benefit-stat>
            <span className={styles.metricValue}>{item.stat.qualifier && <small>{tr(item.stat.qualifier)}</small>}{tr(item.stat.value)}<span>{item.stat.unit}</span></span>
            <span className={styles.metricLabel}>{tr(item.stat.label)}</span>
          </div>}
        </motion.div>
        <motion.div className={styles.paw} aria-hidden="true" initial={{ opacity: 0, transform: "translate(-115%, 8%) rotate(-6deg)" }} animate={paw}>
          <Image src={PAW_IMAGE} alt="" fill sizes="(max-width: 767px) 144px, (max-width: 2000px) 12vw, 240px" className={styles.pawImage} />
        </motion.div>
      </div>
    </div>
    <button ref={trigger} type="button" className={styles.cardToggle} aria-expanded={open || phase === "closing"} aria-controls={panelId}
      aria-label={`${tr(open ? "Hide benefit" : "Reveal benefit")}: ${tr(item.title)}`} disabled={busy}
      onClick={event => void toggle(event.detail === 0)}>
      <span className={styles.toggleIcon}>{open ? <Minus aria-hidden="true" /> : <Plus aria-hidden="true" />}</span>
    </button>
  </article>;
}

function WorkHandoff() {
  const tr = usePublicCopy();
  const reduced = useHydratedReducedMotion();
  const shortViewport = useSyncExternalStore(subscribeShortViewport, () => matchMedia(shortViewportQuery).matches, () => false);
  const staticScene = reduced || shortViewport;
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { margin: "160px" });
  const [paused, setPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const circleTransform = useTransform(scrollYProgress, [0, 0.14, 0.68, 1], ["translate(-50%, -50%) scale(1)", "translate(-50%, -50%) scale(1)", "translate(-50%, -50%) scale(0.065)", "translate(-50%, -50%) scale(0.065)"]);
  const invitationOpacity = useTransform(scrollYProgress, [0, 0.14, 0.34], [1, 1, 0]);
  const invitationVisibility = useTransform(scrollYProgress, p => p >= 0.34 ? "hidden" : "visible");
  const logoOpacity = useTransform(scrollYProgress, [0, 0.38, 0.65, 1], [0, 0, 1, 1]);
  const workOpacity = useTransform(scrollYProgress, [0, 0.4, 0.66, 1], [0, 0, 1, 1]);
  const captionOpacity = useTransform(scrollYProgress, [0, 0.55, 0.78, 1], [0, 0, 1, 1]);
  const captionVisibility = useTransform(scrollYProgress, p => p <= 0.55 ? "hidden" : "visible");

  useEffect(() => {
    const sync = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return <div ref={ref} className={styles.handoff} data-imagine-handoff data-static={staticScene}>
    <div className={styles.stage}>
      <motion.div className={styles.circle} data-imagine-circle aria-hidden="true"
        style={staticScene ? undefined : { transform: circleTransform }}>
        <motion.div className={styles.logo} style={{ opacity: staticScene ? 1 : logoOpacity }}>
          <Image src="/images/lionovart-icon.svg" alt="" fill sizes="180px" />
        </motion.div>
      </motion.div>
      {!staticScene && <motion.div className={styles.invitation} style={{ opacity: invitationOpacity, visibility: invitationVisibility }}>
        <p className={styles.eyebrow}>{tr("Now imagine the possibilities")}</p>
        <p className={styles.invitationTitle}>{tr("Your ambition.")}<br />{tr("Made visible.")}</p>
        <ArrowDown aria-hidden="true" />
      </motion.div>}
      <motion.header className={styles.workHeading} style={staticScene ? undefined : { opacity: captionOpacity, visibility: captionVisibility }}>
        <p className={styles.eyebrow}>{tr("Selected work")}</p>
        <h2>{tr("Different stories.")}<br />{tr("Distinct identities.")}</h2>
      </motion.header>
      {staticScene ? <div className={styles.staticGallery} data-imagine-static-gallery>
        {SHOWCASE_IMAGES.map((src, index) => <div key={src}><Image src={src} alt={`${tr("Selected creative work")} ${index + 1}`} fill sizes="(max-width: 767px) 45vw, 30vw" /></div>)}
      </div> : <motion.div className={styles.workStream} style={{ opacity: workOpacity }} aria-hidden="true">
        {near && <ImageStreamHero images={SHOWCASE_IMAGES.map(src => ({ src }))} cards={7} speed={30} axis={50}
          paused={paused || !pageVisible}
          path={{ cardWidth: 19, cardHeight: 24, birthHeight: 3.4, exitHeight: 40, railBirth: -5.5, railExit: 36, fan: 2.7, turnBirth: 5, turnExit: 23, stops: 18 }}
          className={styles.streamCanvas} />}
      </motion.div>}
      <motion.div className={styles.workFooter} style={staticScene ? undefined : { opacity: captionOpacity, visibility: captionVisibility }}>
        <p>{tr("Now, let’s shape your world.")}</p>
        <a href="#services" className={styles.servicesLink}>{tr("Explore our services")}<ArrowDown aria-hidden="true" /></a>
        {!staticScene && <button className={styles.pause} type="button" aria-pressed={paused}
          aria-label={tr(paused ? "Play work animation" : "Pause work animation")} onClick={() => setPaused(v => !v)}>
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </button>}
      </motion.div>
    </div>
  </div>;
}

export default function PawRevealStack() {
  const tr = usePublicCopy();
  const chapterRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const journey = useLionJourney();
  const setRevealSection = journey?.setRevealSection;
  const setReveal = journey?.setReveal;
  const lenis = useLenis();

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
        for (const part of ["heading", "body", "copy", "detail"]) {
          const height = Math.ceil(Math.max(0, ...content.filter(el => el.dataset.benefitMeasure === part).map(el => el.getBoundingClientRect().height)));
          grid.style.setProperty(`--benefit-${part}-height`, `${height}px`);
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
        <h2 id="imagine-heading">{tr("Your image speaks")}<br /><span>{tr("before you do.")}</span></h2>
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
    <WorkHandoff />
  </section>;
}
