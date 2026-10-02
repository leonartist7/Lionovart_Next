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

export default function AboutPageContent() {
  return (
    <div className={styles.page} lang="en" data-scroll-title-skip>
      <section className={styles.opening} aria-labelledby="about-heading">
        <div className={styles.container}>
          <p className={styles.eyebrow}>LIONOVART / Creative & digital agency</p>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <h1 id="about-heading" className={styles.heroTitle}>The art of<br /><em>innovation.</em></h1>
              <p className={styles.introduction}>We connect strategy, design, and technology to build brands with a distinct point of view. From the first idea to the last detail. On screen and in the real world.</p>
              <a href="#about" className={styles.textLink}>Inside LIONOVART <span aria-hidden="true">↓</span></a>
            </div>
            <figure className={styles.heroArtwork}>
              <div className={styles.orbit} aria-hidden="true" />
              <Image src="/images/LION-CIRCLE.avif" alt="LIONOVART’s crowned golden lion on its signature red circle" width={800} height={800} sizes="(max-width: 767px) 78vw, 40vw" priority className={styles.lionImage} />
              <figcaption><span>Confidence. Innovation. Emotion.</span><span aria-hidden="true">↗</span></figcaption>
            </figure>
          </div>
          <p className={styles.chapterMarker}><span>Independent thinking. Connected execution.</span><span aria-hidden="true">LION / NOVA / ART</span></p>
        </div>
      </section>
      <section id="about" data-nova-section="about" className={styles.agency} aria-labelledby="agency-heading">
        <div className={styles.container}>
          <div className={styles.agencyHeader}>
            <p className={styles.eyebrow}>More than a single discipline</p>
            <h2 id="agency-heading" className={styles.sectionTitle}>Different expertise.<br /><em>One creative world.</em></h2>
            <p className={styles.agencyIntro}>A brand loses its strength when every part speaks a different language. We bring the thinking and the making together, with a clear creative lead and specialist production partners where the work needs them.</p>
          </div>
          <dl className={styles.stats} aria-label="The agency in numbers">
            {stats.map((stat) => <div className={styles.stat} key={stat.title}><dt>{stat.title}</dt><dd className={styles.statNumber}><CountUpResult value={stat.value} locale="en" /></dd><dd className={styles.statDescription}>{stat.description}</dd></div>)}
          </dl>
          <div className={styles.disciplineList} aria-label="Our six disciplines">{disciplines.map((discipline, index) => <span key={discipline}><small aria-hidden="true">0{index + 1}</small>{discipline}</span>)}</div>
        </div>
      </section>
      <section id="philosophy" className={styles.philosophy} aria-labelledby="philosophy-heading">
        <div className={styles.container}>
          <p className={styles.eyebrow}>An idea should travel</p>
          <div className={styles.philosophyGrid}>
            <h2 id="philosophy-heading" className={styles.sectionTitle}>From identity<br />to <em>experience.</em></h2>
            <div className={styles.prose}>
              <p>A visual identity sets the tone. A film gives it a story. A website makes it useful. Intelligent systems connect what happens next.</p>
              <p>Sometimes the idea needs a room: an event, a projection, a moment shaped by light and sound. We develop the concept and creative direction, then coordinate with the right production partners to bring it into the physical world.</p>
              <Link href="/services" className={styles.textLink}>Explore our expertise <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
          <div className={styles.visualSequence} aria-label="Illustrations of our connected disciplines">
            <figure className={styles.identityVisual}>
              <Image src="/images/services-gallery/brand.webp" alt="LIONOVART brand identity explored through stationery and typography" width={1672} height={941} sizes="(max-width: 767px) 90vw, 48vw" className={styles.serviceImage} />
              <figcaption><span>01 / Define the identity</span><span aria-hidden="true">↗</span></figcaption>
            </figure>
            <figure className={styles.digitalVisual}>
              <Image src="/images/services-gallery/web.webp" alt="LIONOVART digital design across desktop and mobile screens" width={1672} height={941} sizes="(max-width: 767px) 78vw, 32vw" className={styles.serviceImage} />
              <figcaption><span>02 / Build the experience</span><span aria-hidden="true">↗</span></figcaption>
            </figure>
            <p className={styles.visualNote}>The same idea.<br /><em>A different expression.</em><span>Illustrations of our expertise</span></p>
          </div>
        </div>
      </section>
      <section id="pillars" className={styles.pillars} aria-labelledby="pillars-heading">
        <div className={styles.container}>
          <div className={styles.sectionHeader}><p className={styles.eyebrow}>Three forces behind the name</p><h2 id="pillars-heading" className={styles.sectionTitle}>Our name is<br /><em>our approach.</em></h2></div>
          {pillars.map((pillar, index) => <article key={pillar.name} className={styles.pillarRow}>
            <p className={styles.pillarName}><span className={styles.index}>0{index + 1}</span>{pillar.name}<span className={styles.pillarSymbol} aria-hidden="true">{["↗", "✳", "✦"][index]}</span></p>
            <div className={styles.pillarCopy}><h3>{pillar.title}</h3><p>{pillar.description}</p><p className={styles.disciplines}>{pillar.disciplines}</p></div>
          </article>)}
        </div>
      </section>
      <AboutComparison />
      <section id="founder" className={styles.founder} aria-labelledby="founder-heading">
        <div className={`${styles.container} ${styles.founderGrid}`}>
          <figure className={styles.portrait}>
            <Image src="/images/Leon-Studioshot.avif" alt="Leonardo, founder and creative director of LIONOVART" width={1024} height={1024} sizes="(max-width: 767px) 90vw, 36vw" className={styles.portraitImage} />
            <figcaption>Leonardo / Founder & creative director</figcaption>
          </figure>
          <div className={styles.founderStory}>
            <p className={styles.eyebrow}>A personal commitment to the work</p>
            <h2 id="founder-heading" className={styles.sectionTitle}>Led by Leonardo.<br /><em>Built around the idea.</em></h2>
            <p>Leonardo founded LIONOVART to bring the thinking and the making closer together. Brand identity, film, digital platforms, and physical experiences share the same creative vision, with each discipline strengthening the others.</p>
            <p>Leonardo leads the creative direction and remains your direct point of contact. For projects that need specialist production, we bring in the right collaborators around an agreed brief, with one direction guiding the work.</p>
          </div>
        </div>
      </section>
      <section id="about-contact" className={styles.closing} aria-labelledby="contact-heading">
        <div className={styles.container}>
          <p className={styles.eyebrow}>Your next chapter</p><h2 id="contact-heading" className={styles.sectionTitle}>Let’s make it<br /><em>unmistakable.</em></h2>
          <p className={styles.closingCopy}>Tell us what you’re building—and what you want people to feel, understand, or do.</p>
          <div className={styles.actions}><Link href="/call" className={styles.primaryLink}>Let’s talk <span aria-hidden="true">↗</span></Link><a href={`mailto:${CONTACT_EMAIL}`} className={styles.textLink}>Or send us a note</a></div>
        </div>
      </section>
    </div>
  );
}
