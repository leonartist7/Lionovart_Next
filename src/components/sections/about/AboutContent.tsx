import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Translations } from "@/lib/i18n";
import styles from "./AboutContent.module.css";

export default function AboutContent({
  copy,
  navigation,
}: {
  copy: Translations["aboutPage"];
  navigation: Translations["siteNavigation"];
}) {
  return (
    <div className={styles.page}>
      <a href="#about-content" className={styles.skip}>
        {navigation.skip}
      </a>
      <header
        tabIndex={-1}
        id="about-content"
        data-nova-section="about"
        className={styles.opening}
      >
        <div className={styles.container}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1 className={styles.headline}>{copy.headline}</h1>
          <div className={styles.openingFoot}>
            <p className={styles.introduction}>{copy.intro}</p>
            <a className={styles.textLink} href="#founder">
              {copy.meet}
              <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className={styles.openingRule} aria-hidden="true">
            <span>LION / NOVA / ART</span>
            <span>01 — 03</span>
          </div>
        </div>
      </header>

      <section
        id="founder"
        data-nova-section="founder"
        className={styles.founder}
        aria-labelledby="founder-heading"
      >
        <div className={`${styles.container} ${styles.founderGrid}`}>
          <figure className={styles.portrait}>
            <Image
              src="/images/Leon-Studioshot.avif"
              alt={navigation.portraitAlt}
              width={1024}
              height={1024}
              sizes="(max-width: 767px) 92vw, 42vw"
              className={styles.portraitImage}
            />
            <figcaption>
              <span>Leonardo</span>
              <span>{copy.founderRole}</span>
            </figcaption>
          </figure>
          <div className={styles.founderCopy}>
            <h2 id="founder-heading" className={styles.heading}>
              {copy.founderHeading}
            </h2>
            <div className={styles.prose}>
              {copy.founderParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="philosophy"
        data-nova-section="philosophy"
        className={styles.philosophy}
        aria-labelledby="philosophy-heading"
      >
        <div className={styles.container}>
          <div className={styles.philosophyGrid}>
            <h2
              id="philosophy-heading"
              className={`${styles.heading} ${styles.philosophyTitle}`}
            >
              {copy.philosophyHeading}
            </h2>
            <div className={styles.prose}>
              {copy.philosophyParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <Link href="/services" className={styles.textLink}>
                {copy.expertiseLink}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <section
            id="lion-nova-art"
            data-nova-section="lion-nova-art"
            className={styles.brand}
            aria-labelledby="brand-heading"
          >
            <div className={styles.brandIntro}>
              <h2 id="brand-heading" className={styles.subheading}>
                {copy.brandHeading}
              </h2>
              <p>{copy.brandIntro}</p>
            </div>
            <div className={styles.pillars}>
              {copy.pillars.map((pillar, index) => (
                <article key={pillar.name} className={styles.pillar}>
                  <div className={styles.pillarName}>
                    <span className={styles.number}>0{index + 1}</span>
                    <h3>{pillar.name}</h3>
                  </div>
                  <div className={styles.pillarBody}>
                    <h4>{pillar.heading}</h4>
                    <p>{pillar.body}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className={styles.seam}>{copy.brandSeam}</p>
          </section>
        </div>
      </section>

      <section
        id="working-together"
        data-nova-section="working-together"
        className={styles.working}
        aria-labelledby="working-heading"
      >
        <div className={styles.container}>
          <h2
            id="working-heading"
            className={`${styles.heading} ${styles.workingHeading}`}
          >
            {copy.principlesHeading}
          </h2>
          <div className={styles.principles}>
            {copy.principles.map((principle, index) => (
              <article key={principle.heading} className={styles.principle}>
                <span className={styles.number} aria-hidden="true">
                  0{index + 1}
                </span>
                <h3>{principle.heading}</h3>
                <p>{principle.body}</p>
              </article>
            ))}
          </div>
          <Link href="/#process" className={styles.textLink}>
            {copy.processLink}
            <span aria-hidden="true">↗</span>
          </Link>

          <section
            id="working-models"
            data-nova-section="working-models"
            className={styles.models}
            aria-labelledby="models-heading"
          >
            <div className={styles.modelsIntro}>
              <h2 id="models-heading" className={styles.subheading}>
                {copy.modelsHeading}
              </h2>
              <p>{copy.modelsIntro}</p>
            </div>
            <div className={styles.modelList}>
              {copy.models.map((model, index) => (
                <article
                  key={model.name}
                  className={`${styles.model} ${index === 0 ? styles.studioModel : ""}`}
                >
                  <h3>{model.name}</h3>
                  <div>
                    <h4>{model.heading}</h4>
                    <p>{model.body}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className={styles.modelsFoot}>
              <p className={styles.qualifier}>{copy.modelsQualifier}</p>
              <Link href="/#selected-work" className={styles.textLink}>
                {copy.workLink}
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
