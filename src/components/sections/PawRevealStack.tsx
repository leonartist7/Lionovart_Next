"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useAnimation, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, Check, Pause, Play, Plus } from "lucide-react";
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
const EASE = [0.16, 1, 0.3, 1] as const;
const BENEFITS = [
  {
    title: "Look as good as your work.",
    body: "Give people a reason to trust your business before you say a word.",
    detail: "A presence that does your work justice.",
    points: ["A clear position in your market", "An identity that reflects your quality", "A consistent story at every touchpoint"],
  },
  {
    title: "Less admin. More headspace.",
    body: "Let your systems handle the routine. Put your time where it matters.",
    detail: "More space for what moves you forward.",
    points: ["Enquiries captured in one place", "Follow-ups that keep moving", "Workflows built around your team"],
  },
  {
    title: "Be recognised. Be remembered.",
    body: "Your website, your content, your identity. Finally speaking the same language.",
    detail: "Every encounter feels like your brand.",
    points: ["A website with a clear next step", "Content with a recognisable voice", "Campaigns that connect the whole story"],
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
  const [phase, setPhase] = useState<"closed" | "revealing" | "open">("closed");
  const lock = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const cover = useAnimation();
  const paw = useAnimation();
  const panelId = `imagine-result-${index}`;

  const reveal = async (keyboard: boolean) => {
    if (lock.current) return;
    lock.current = true;
    setPhase("revealing");
    if (!reduced && !keyboard) {
      await paw.start({ opacity: 1, transform: "translate(0, 0) rotate(0deg)", transition: { duration: 0.35, ease: EASE } });
      await Promise.all([
        cover.start({ transform: "translateY(105%)", transition: { duration: 0.65, ease: EASE } }),
        paw.start({ transform: "translate(8%, 170%) rotate(5deg)", transition: { duration: 0.65, ease: EASE } }),
      ]);
    }
    setPhase("open");
    requestAnimationFrame(() => panel.current?.focus({ preventScroll: true }));
  };

  return <article className={styles.card} data-benefit-card data-revealed={phase === "open"}>
    <div className={styles.cardTop}>
      <h3>{tr(item.title)}</h3>
      <p className={styles.cardBody}>{tr(item.body)}</p>
    </div>
    <div className={styles.detailShell}>
      {phase !== "open" && <div className={styles.sculpture} data-sculpture={index} data-leaving={phase === "revealing"} aria-hidden="true">
        <BenefitSculpture kind={index} />
      </div>}
    <div className={styles.detailWell}>
      <div ref={panel} id={panelId} tabIndex={phase === "open" ? -1 : undefined} role="region"
        aria-label={tr(item.detail)} aria-hidden={phase !== "open"} className={styles.details}>
        <p>{tr(item.detail)}</p>
        <ul>{item.points.map(point => <li key={point}><Check aria-hidden="true" />{tr(point)}</li>)}</ul>
      </div>
      {phase !== "open" && <>
        <motion.button type="button" className={styles.detailCover} animate={cover}
          aria-expanded={false} aria-controls={panelId} disabled={phase === "revealing"}
          onClick={event => void reveal(event.detail === 0)}>
          <span className={styles.coverLabel}>{tr("See how")}<Plus aria-hidden="true" /></span>
        </motion.button>
        <motion.div className={styles.paw} aria-hidden="true" initial={{ opacity: 0, transform: "translate(-115%, 8%) rotate(-6deg)" }} animate={paw}>
          <Image src={PAW_IMAGE} alt="" fill sizes="128px" className={styles.pawImage} />
        </motion.div>
      </>}
    </div>
    </div>
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
  const circleTransform = useTransform(scrollYProgress, [0, 0.68, 1], ["translate(-50%, -50%) scale(1)", "translate(-50%, -50%) scale(0.065)", "translate(-50%, -50%) scale(0.065)"]);
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
      <motion.header className={styles.workHeading} style={staticScene ? undefined : { opacity: captionOpacity, visibility: captionVisibility }}>
        <p className={styles.eyebrow}>{tr("Selected work")}</p>
        <h2>{tr("See the difference.")}</h2>
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
        <p>{tr("Identity. Digital. Content. Systems.")}</p>
        <a href="#services" className={styles.servicesLink}>{tr("Find your service")}<ArrowDown aria-hidden="true" /></a>
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
  const journey = useLionJourney();
  const setRevealSection = journey?.setRevealSection;
  const setReveal = journey?.setReveal;
  const lenis = useLenis();

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
        <h2 id="imagine-heading">{tr("Be seen for")}<br /><span>{tr("what you’re worth.")}</span></h2>
        <p className={styles.introBody}>{tr("You’ve put years into your business. Let people see the difference.")}</p>
      </header>
      <div className={styles.grid} data-imagine-content>
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
