"use client";

import { usePublicCopy } from "@/hooks/usePublicCopy";

import { useContext, useMemo, useRef, useSyncExternalStore, type Ref } from "react";
import { useInView } from "framer-motion";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import styles from "./ClosingCTA.module.css";
import HeroCycling, { type Word } from "@/components/sections/HeroCycling";
import VideoBackdrop from "@/components/ui/VideoBackdrop";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { useNovaStore, type NovaIntake } from "@/lib/stores/nova-store";
import { useLanguage } from "@/contexts/LanguageContext";
import BrandCrest from "@/components/sections/services/brand/branding/BrandCrest";
import TrailAttractionTarget from "@/components/ui/TrailAttractionTarget";
import { EN_WORD_ART } from "@/lib/word-art";
import { useSaveData } from "@/hooks/useSaveData";
import { ClosingRevealContext } from "./ClosingRibbonOrnament";

// Capped at 1080p (master is 4K) and q_auto:eco — this sits under a bg-black/70
// scrim, so the extra quality was never visible.
const FOOTER_CLIP =
  "https://res.cloudinary.com/dgio9uutc/video/upload/w_1920,c_limit,f_auto,q_auto:eco/v1779845599/Footage_02_chsoa3.mp4";

// Share the hero's cached AVIF resources; a separate resized URL would download
// the same word twice on the homepage. Only the closing cadence changes.
const CLOSING_WORD_ART: Word[] = EN_WORD_ART.map(word => ({
  ...word,
  holdMs: 4200,
}));

const subscribeVisibility = (callback: () => void) => {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
};
const getHidden = () => document.hidden;
const getServerHidden = () => true;

const compactQuery = "(max-width: 639px), (pointer: coarse)";
const subscribeBudget = (notify: () => void) => {
  const media = matchMedia(compactQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const getCompact = () => matchMedia(compactQuery).matches;
const getFalse = () => false;
const getTrue = () => true;

function CompactClosing({ words, onStart, ringRef, chapterInJourney }: { words: Word[]; onStart: (intake: NovaIntake) => void; ringRef?: Ref<HTMLDivElement>; chapterInJourney?: boolean }) {
  const tr = usePublicCopy();
  const { t, locale } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const intakeDialog = useRef<HTMLDialogElement>(null);
  const fr = locale === "fr";
  const inView = useInView(sectionRef);
  const reducedMotion = useHydratedReducedMotion();
  const hidden = useSyncExternalStore(subscribeVisibility, getHidden, getServerHidden);
  const progress = useContext(ClosingRevealContext);
  const revealStore = useMemo(() => ({
    subscribe: (notify: () => void) => typeof progress === "number" ? () => {} : progress.on("change", notify),
    getSnapshot: () => (typeof progress === "number" ? progress : progress.get()) >= .78,
  }), [progress]);
  const revealed = useSyncExternalStore(revealStore.subscribe, revealStore.getSnapshot, getFalse);
  const compact = useSyncExternalStore(subscribeBudget, getCompact, getTrue);
  const saveData = useSaveData();
  const paused = reducedMotion || saveData || hidden || !inView || !revealed;

  return (
    <section id="closing-cta" ref={sectionRef} className={styles.section} data-art-directed="dark" data-scroll-title-skip>
      <div ref={ringRef} className={styles.copy} data-closing-copy>
        {!chapterInJourney && <p className={`${styles.accent} ${locale === "ja" || locale === "ko" ? "font-body" : "editorial-accent"}`}>
          {tr("Your next chapter, together")}
        </p>}
        <HeroCycling variant="closing" staticText={t.hero.staticText} words={words} staticColor="#ffffff" cyclingColor="#ffffff" paused={paused} />
        <div className={styles.stage} data-closing-stage>
          <div className={styles.action} data-closing-action>
            <TrailAttractionTarget>
              <LiquidMetalButton label={fr ? "Commencer" : "Start"} width={220} paused={paused} shaderEnabled={!compact && !saveData && !reducedMotion && inView && revealed} onClick={() => intakeDialog.current?.showModal()} />
            </TrailAttractionTarget>
          </div>
        </div>
      </div>
      <dialog ref={intakeDialog} className={styles.glass} aria-labelledby="closing-intake-title">
        <form onSubmit={event => {
          event.preventDefault();
          const form = event.currentTarget;
          const contact = form.elements.namedItem("contact") as HTMLInputElement;
          const site = form.elements.namedItem("website") as HTMLInputElement;
          const value = contact.value.trim();
          const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          const phone = /^\+?[\d\s().-]+$/.test(value) && /^\d{7,15}$/.test(value.replace(/\D/g, ""));
          if (!email && !phone) {
            contact.setCustomValidity(fr ? "Indiquez un e-mail ou un numéro valide." : "Enter a valid email or phone number.");
            contact.reportValidity();
            return;
          }
          let website = "";
          if (site.value.trim()) {
            try {
              const raw = site.value.trim();
              const url = new URL(raw.includes("://") ? raw : "https://" + raw);
              if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".") || url.username || url.password) throw new Error();
              website = url.href;
            } catch {
              site.setCustomValidity(fr ? "Indiquez un site valide, par exemple studio.fr." : "Enter a website such as studio.com.");
              site.reportValidity();
              return;
            }
          }
          intakeDialog.current?.close();
          onStart({ email: email ? value : "", phone: email ? "" : value, website });
        }}>
          <button type="button" className={styles.dismiss} aria-label={fr ? "Fermer" : "Close"} onClick={() => intakeDialog.current?.close()}>×</button>
          <p className={styles.eyebrow}>LIONOVART / NOVA</p>
          <h2 id="closing-intake-title">{fr ? "Parlons de votre projet." : "Let’s talk about your project."}</h2>
          <label>{fr ? "E-mail ou téléphone" : "Email or phone number"}
            <input name="contact" required autoFocus autoCapitalize="none" spellCheck={false} maxLength={254} onInput={e => e.currentTarget.setCustomValidity("")} />
          </label>
          <label>{fr ? "Site web (facultatif)" : "Website (optional)"}
            <input name="website" autoComplete="url" inputMode="url" placeholder="studio.com" maxLength={512} onInput={e => e.currentTarget.setCustomValidity("")} />
          </label>
          <button className={styles.talk} data-shape-button type="submit">{fr ? "Parler avec notre agent" : "Talk with our agent"}</button>
        </form>
      </dialog>
    </section>
  );
}

/**
 * ClosingCTA — the single, canonical page close. The homepage adds a curved
 * portfolio media wall; service pages retain their cinematic video backdrop.
 * The kinetic headline and liquid-metal button open Nova.
 * Used once per page (the footer is now navigation/legal only), so pages never
 * double-close. `crest` adds the brand crest beside the button (branding page).
 */
export default function ClosingCTA({ crest = false, workShowcase = false, ringRef, chapterInJourney = false }: { crest?: boolean; workShowcase?: boolean; ringRef?: Ref<HTMLDivElement>; chapterInJourney?: boolean }) {
  const tr = usePublicCopy();
  const { t, locale } = useLanguage();
  const openNova = useNovaStore((s) => s.openNova);

  // Keep the page close emotional and decisive while the hero owns the more
  // concrete outcome language. Index positions stay aligned across locales.
  // English renders the same word-art AVIFs as the hero (shared EN_WORD_ART);
  // other locales keep the emotional translated cadence as live text.
  const closingWordStrings = [
    t.hero.cyclingWords?.[0],
    t.hero.cyclingWords?.[3],
    t.hero.cyclingWords?.[5],
  ].filter(Boolean) as string[];
  const words: Word[] =
    locale === "en"
      ? (workShowcase ? CLOSING_WORD_ART : EN_WORD_ART)
      : closingWordStrings.map((content) => ({
          content,
          type: "text" as const,
        }));

  if (workShowcase) return <CompactClosing words={words} onStart={intake => {
    let accepted = false;
    try { accepted = sessionStorage.getItem("nova_privacy_accepted") === "1"; } catch { /* Show the voice consent prompt. */ }
    openNova("offer", accepted, intake);
  }} ringRef={ringRef} chapterInJourney={chapterInJourney} />;

  return (
    <section
      id="closing-cta"
      className={`relative overflow-hidden px-6 pb-16 pt-20 text-center md:pb-20 md:pt-28 ${workShowcase ? "bg-bg-surface-light text-[#171412]" : "bg-bg-dark text-white"}`}
    >
      {!workShowcase ? <VideoBackdrop src={FOOTER_CLIP} className="absolute inset-0 z-0" overlayClassName="bg-black/70" /> : null}

      <div className="relative z-40 mx-auto flex max-w-[1280px] flex-col items-center gap-8 md:gap-10">
        <p className={locale === "ja" || locale === "ko" ? "text-[11px] font-bold uppercase tracking-[0.3em] text-brand-red md:text-[13px]" : "editorial-accent editorial-closing text-brand-red"}>
          {tr("Your next chapter, together")}
        </p>

        <div className="w-full">
          <HeroCycling
            staticText={t.hero.staticText}
            staticColor={workShowcase ? "#171412" : "#ffffff"}
            cyclingColor={workShowcase ? "#171412" : "#ffffff"}
            words={words}
            fontSize="clamp(2.6rem, 9.5vw, 7rem)"
            cyclingFontSize="clamp(3.2rem, 12.5vw, 9.5rem)"
            imageFontSize="clamp(2.86rem, 10.45vw, 7.7rem)"

          />
        </div>


        <div className="mt-2 flex items-center gap-5">
          {crest && <BrandCrest className="h-12 w-auto md:h-14" />}
          <TrailAttractionTarget>
            <LiquidMetalButton label={tr("Start your brand")} width={220} onClick={() => openNova("offer", true)} />
          </TrailAttractionTarget>
        </div>
      </div>
    </section>
  );
}

