import { getLocale } from "next-intl/server";
import { getPublicCopy } from "@/lib/i18n/public-copy";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { CONTACT_EMAIL } from "@/lib/contact";
import CountUpResult from "../CountUpResult";
import AboutComparison from "./AboutComparison";
import styles from "./AboutPageContent.module.css";

const pillars = [
  { name: "LION", title: "The confidence to lead.", description: "Find the position your brand can own. Give it a clear voice, a recognizable identity, and a direction that guides what comes next.", disciplines: "Positioning · Brand strategy · Identity" },
  { name: "NOVA", title: "The drive to evolve.", description: "Put technology to work where it makes a difference. Connect websites, apps, AI systems, and automation to the way your business actually runs.", disciplines: "Platforms · AI systems · Automation" },
  { name: "ART", title: "The power to move people.", description: "Give the idea a form people can feel. Through design, film, sound, and physical experiences, make every encounter part of the same world.", disciplines: "Design · Film · Audiovisual experiences" },
];
const stats = [
  { value: 3, title: "Brand pillars", description: "LION. NOVA. ART. Our foundation." },
  { value: 6, title: "Connected disciplines", description: "From brand strategy to growth." },
  { value: 1, title: "Creative direction", description: "A shared idea across every touchpoint." },
];
const disciplines = ["Brand & strategy", "Web & apps", "Content studio", "Print & physical", "Systems & AI", "Growth marketing"];

export default async function AboutPageContent() {
  const locale = await getLocale();
  const tr = getPublicCopy(locale);
  return (
    <div className={styles.page} lang={locale} data-scroll-title-skip>
      <section className={styles.opening} aria-labelledby="about-heading">
        <div className={styles.container}>
          <p className={styles.eyebrow}>{tr("LIONOVART / Creative & digital agency")}</p>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <h1 id="about-heading" className={styles.heroTitle}>{tr("The art of")}<br /><em>{tr("innovation.")}</em></h1>
              <p className={styles.introduction}>{tr("We connect strategy, design, and technology to build brands with a distinct point of view. From the first idea to the last detail. On screen and in the real world.")}</p>
              <a href="#about" className={styles.textLink}>{tr("Inside LIONOVART")}<span aria-hidden="true">↓</span></a>
            </div>
            <figure className={styles.heroArtwork}>
              <div className={styles.orbit} aria-hidden="true" />
              <Image src="/images/LION-CIRCLE.avif" alt={tr("LIONOVART’s crowned golden lion on its signature red circle")} width={800} height={800} sizes="(max-width: 767px) 78vw, 40vw" priority className={styles.lionImage} />
              <figcaption><span>{tr("Confidence. Innovation. Emotion.")}</span><span aria-hidden="true">↗</span></figcaption>
            </figure>
          </div>
          <p className={styles.chapterMarker}><span>{tr("Independent thinking. Connected execution.")}</span><span aria-hidden="true">LION / NOVA / ART</span></p>
        </div>
      </section>
      <section id="about" data-nova-section="about" className={styles.agency} aria-labelledby="agency-heading">
        <div className={styles.container}>
          <div className={styles.agencyHeader}>
            <p className={styles.eyebrow}>{tr("More than a single discipline")}</p>
            <h2 id="agency-heading" className={styles.sectionTitle}>{tr("Different expertise.")}<br /><em>{tr("One creative world.")}</em></h2>
            <p className={styles.agencyIntro}>{tr("A brand loses its strength when every part speaks a different language. We bring the thinking and the making together, with a clear creative lead and specialist production partners where the work needs them.")}</p>
          </div>
          <dl className={styles.stats} aria-label={tr("The agency in numbers")}>
            {stats.map((stat) => <div className={styles.stat} key={tr(stat.title)}><dt>{tr(stat.title)}</dt><dd className={styles.statNumber}><CountUpResult value={stat.value} locale={locale} /></dd><dd className={styles.statDescription}>{tr(stat.description)}</dd></div>)}
          </dl>
          <div className={styles.disciplineList} aria-label={tr("Our six disciplines")}>{disciplines.map((discipline, index) => <span key={tr(discipline)}><small aria-hidden="true">0{index + 1}</small>{tr(discipline)}</span>)}</div>
        </div>
      </section>
      <section id="philosophy" className={styles.philosophy} aria-labelledby="philosophy-heading">
        <div className={styles.container}>
          <p className={styles.eyebrow}>{tr("An idea should travel")}</p>
          <div className={styles.philosophyGrid}>
            <h2 id="philosophy-heading" className={styles.sectionTitle}>{tr("From identity")}<br />{tr("to")}<em>{tr("experience.")}</em></h2>
            <div className={styles.prose}>
              <p>{tr("A visual identity sets the tone. A film gives it a story. A website makes it useful. Intelligent systems connect what happens next.")}</p>
              <p>{tr("Sometimes the idea needs a room: an event, a projection, a moment shaped by light and sound. We develop the concept and creative direction, then coordinate with the right production partners to bring it into the physical world.")}</p>
              <Link href="/services" className={styles.textLink}>{tr("Explore our expertise")}<span aria-hidden="true">↗</span></Link>
            </div>
          </div>
          <div className={styles.visualSequence} aria-label={tr("Illustrations of our connected disciplines")}>
            <figure className={styles.identityVisual}>
              <Image src="/images/services-gallery/brand.webp" alt={tr("LIONOVART brand identity explored through stationery and typography")} width={1672} height={941} sizes="(max-width: 767px) 90vw, 48vw" className={styles.serviceImage} />
              <figcaption><span>{tr("01 / Define the identity")}</span><span aria-hidden="true">↗</span></figcaption>
            </figure>
            <figure className={styles.digitalVisual}>
              <Image src="/images/services-gallery/web.webp" alt={tr("LIONOVART digital design across desktop and mobile screens")} width={1672} height={941} sizes="(max-width: 767px) 78vw, 32vw" className={styles.serviceImage} />
              <figcaption><span>{tr("02 / Build the experience")}</span><span aria-hidden="true">↗</span></figcaption>
            </figure>
            <p className={styles.visualNote}>{tr("The same idea.")}<br /><em>{tr("A different expression.")}</em><span>{tr("Illustrations of our expertise")}</span></p>
          </div>
        </div>
      </section>
      <section id="pillars" className={styles.pillars} aria-labelledby="pillars-heading">
        <div className={styles.container}>
          <div className={styles.sectionHeader}><p className={styles.eyebrow}>{tr("Three forces behind the name")}</p><h2 id="pillars-heading" className={styles.sectionTitle}>{tr("Our name is")}<br /><em>{tr("our approach.")}</em></h2></div>
          {pillars.map((pillar, index) => <article key={pillar.name} className={styles.pillarRow}>
            <p className={styles.pillarName}><span className={styles.index}>0{index + 1}</span>{pillar.name}<span className={styles.pillarSymbol} aria-hidden="true">{["↗", "✳", "✦"][index]}</span></p>
            <div className={styles.pillarCopy}><h3>{tr(pillar.title)}</h3><p>{tr(pillar.description)}</p><p className={styles.disciplines}>{tr(pillar.disciplines)}</p></div>
          </article>)}
        </div>
      </section>
      <AboutComparison />
      <section id="founder" className={styles.founder} aria-labelledby="founder-heading">
        <div className={`${styles.container} ${styles.founderGrid}`}>
          <figure className={styles.portrait}>
            <Image src="/images/Leon-Studioshot.avif" alt={tr("Leonardo, founder and creative director of LIONOVART")} width={1024} height={1024} sizes="(max-width: 767px) 90vw, 36vw" className={styles.portraitImage} />
            <figcaption>{tr("Leonardo / Founder & creative director")}</figcaption>
          </figure>
          <div className={styles.founderStory}>
            <p className={styles.eyebrow}>{tr("A personal commitment to the work")}</p>
            <h2 id="founder-heading" className={styles.sectionTitle}>{tr("Led by Leonardo.")}<br /><em>{tr("Built around the idea.")}</em></h2>
            <p>{tr("Leonardo founded LIONOVART to bring the thinking and the making closer together. Brand identity, film, digital platforms, and physical experiences share the same creative vision, with each discipline strengthening the others.")}</p>
            <p>{tr("Leonardo leads the creative direction and remains your direct point of contact. For projects that need specialist production, we bring in the right collaborators around an agreed brief, with one direction guiding the work.")}</p>
          </div>
        </div>
      </section>
      <section id="about-contact" className={styles.closing} aria-labelledby="contact-heading">
        <div className={styles.container}>
          <p className={styles.eyebrow}>{tr("Your next chapter")}</p><h2 id="contact-heading" className={styles.sectionTitle}>{tr("Let’s make it")}<br /><em>{tr("unmistakable.")}</em></h2>
          <p className={styles.closingCopy}>{tr("Tell us what you’re building—and what you want people to feel, understand, or do.")}</p>
          <div className={styles.actions}><Link href="/call" className={styles.primaryLink}>{tr("Let’s talk")}<span aria-hidden="true">↗</span></Link><a href={`mailto:${CONTACT_EMAIL}`} className={styles.textLink}>{tr("Or send us a note")}</a></div>
        </div>
      </section>
    </div>
  );
}
