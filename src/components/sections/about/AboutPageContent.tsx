import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { CONTACT_EMAIL } from "@/lib/contact";
import styles from "./AboutPageContent.module.css";
import WorkingModels from "./WorkingModels";

// Pillar meanings follow the existing PillarsDemo / brand discipline framing.
const pillars = [
  { name: "LION", title: "Lead with confidence.", description: "Find the position your brand can own. Give it a clear voice, a recognizable identity, and a direction that guides what comes next.", disciplines: "Positioning · Brand strategy · Identity" },
  { name: "NOVA", title: "Move with innovation.", description: "Put technology to work where it makes a difference. Connect websites, apps, AI agents, and automation to the way your business actually runs.", disciplines: "Platforms · AI systems · Automation" },
  { name: "ART", title: "Direct the emotion.", description: "Give the idea a form people can feel. Through design, film, sound, and physical experiences, make every encounter part of the same world.", disciplines: "Design · Film · Audiovisual experiences" },
];

const principles = [
  { title: "A direct creative relationship.", body: "Work with Leonardo on the direction of your project. Know who is leading the work, what is being decided, and why." },
  { title: "One shared direction.", body: "Start with an agreed brief. Carry its purpose and visual language through the deliverables you choose, so each piece strengthens the next." },
  { title: "Ideas that can be delivered.", body: "Bring production, usability, and practical constraints into the conversation early. Build a clear path from the concept to something people can use or experience." },
  { title: "Work with a purpose.", body: "Define what the project needs to improve: recognition, clarity, enquiries, or the way a service works. Let that purpose guide the creative decisions." },
];

export default function AboutPageContent() {
  return (
    <div className={styles.page} lang="en" data-scroll-title-skip>
      <section className={styles.opening} aria-labelledby="about-heading">
        <div className={styles.container}>
          <p className={styles.eyebrow}>About LIONOVART</p>
          <h1 id="about-heading" className={styles.heroTitle}>
            The mind<br /><span className={styles.heroAccent}>behind</span><br />the work.
          </h1>
          <div className={styles.openingBottom}>
            <p className={styles.introduction}>Founded by Leonardo, LIONOVART connects creative direction, design, and technology to give brands a stronger presence—on screen and in the real world.</p>
            <a href="#about" className={styles.textLink}>Meet Leonardo <span aria-hidden="true">↓</span></a>
          </div>
          <p className={styles.chapterMarker} aria-hidden="true">LION / NOVA / ART</p>
        </div>
      </section>

      <section id="about" data-nova-section="about" className={styles.founder} aria-labelledby="founder-heading">
        <div className={`${styles.container} ${styles.founderGrid}`}>
          <div className={styles.founderIdentity}>
            <p className={styles.eyebrow}>The person behind the direction</p>
            <h2 id="founder-heading" className={styles.founderName}>Leonardo.</h2>
            <p className={styles.role}>Founder & creative director</p>
          </div>
          <figure className={styles.portrait}>
            <Image src="/images/Leon-Studioshot.avif" alt="Leonardo, founder and creative director of LIONOVART" width={1024} height={1024} sizes="(max-width: 767px) 100vw, (max-width: 1199px) 45vw, 560px" className={styles.portraitImage} />
            <figcaption>Leonardo / LIONOVART</figcaption>
          </figure>
          <div className={styles.founderStory}>
            <h3>A clear idea deserves<br className={styles.desktopBreak} /> a powerful expression.</h3>
            <p>I built LIONOVART to bring the thinking and the making closer together. A brand’s identity, films, website, and real-world experiences should feel like they belong to the same idea.</p>
            <p>My role is to find that idea, give it a clear direction, and carry it through the work. That means considering both the feeling a project creates and the practical details that make it happen.</p>
            <p>Whether we’re shaping a brand, building a platform, or developing an event concept, I want each decision to make the next one stronger—and the whole experience easier to understand.</p>
          </div>
        </div>
      </section>

      <section id="philosophy" className={styles.philosophy} aria-labelledby="philosophy-heading">
        <div className={styles.container}>
          <p className={styles.eyebrow}>The thinking</p>
          <div className={styles.philosophyGrid}>
            <h2 id="philosophy-heading" className={styles.sectionTitle}>A brand should<br />feel <span>connected.</span></h2>
            <div className={styles.prose}>
              <p>A visual identity sets the tone. A film gives it a story. A website makes it useful. Intelligent systems support what happens after someone gets in touch.</p>
              <p>And sometimes, the idea needs a room: an event, a projection, a moment shaped by light and sound. I develop the concept and creative direction, then coordinate with the right production partners to bring it into the physical world.</p>
              <p>These are different disciplines, connected by one question: what should people feel, understand, or do?</p>
              <Link href="/services" className={styles.textLink}>Explore the expertise <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section id="pillars" className={styles.pillars} aria-labelledby="pillars-heading">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>The name. The approach.</p>
            <h2 id="pillars-heading" className={styles.sectionTitle}>Three forces.<br />One point of view.</h2>
          </div>
          {pillars.map((pillar, index) => (
            <article key={pillar.name} className={styles.pillarRow}>
              <p className={styles.pillarName}><span className={styles.index}>0{index + 1}</span>{pillar.name}</p>
              <div className={styles.pillarCopy}>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
                <p className={styles.disciplines}>{pillar.disciplines}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="approach" className={styles.approach} aria-labelledby="approach-heading">
        <div className={styles.container}>
          <p className={styles.eyebrow}>Why choose LIONOVART</p>
          <h2 id="approach-heading" className={styles.sectionTitle}>The difference is<br />how it comes together.</h2>
          <div className={styles.principles}>
            {principles.map((principle, index) => (
              <article key={principle.title} className={styles.principleRow}>
                <span className={styles.index} aria-hidden="true">0{index + 1}</span>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <WorkingModels />
      <section id="about-contact" className={styles.closing} aria-labelledby="contact-heading">
        <div className={styles.container}>
          <p className={styles.eyebrow}>Your next chapter</p>
          <h2 id="contact-heading" className={styles.sectionTitle}>Let’s make it<br /><span>unmistakable.</span></h2>
          <p className={styles.closingCopy}>Tell me what you’re building—and what you want people to feel, understand, or do.</p>
          <div className={styles.actions}>
            <Link href="/call" className={styles.primaryLink}>Let’s talk <span aria-hidden="true">↗</span></Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className={styles.textLink}>Or send me a note</a>
          </div>
        </div>
      </section>
    </div>
  );
}
