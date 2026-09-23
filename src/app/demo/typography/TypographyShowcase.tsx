"use client";

import { useState } from "react";
import Link from "next/link";
import s from "./typography.module.css";

const initialCopy = { headline: "Make your brand roar.", accent: "With a little grace.", body: "Identity, experiences and systems. Thoughtfully made to carry your ambition forward." };
const directions = [
  { id: "signature", number: "01", title: "Signature", note: "Our recommendation", description: "Clash leads. A smaller italic phrase adds a personal signature. The everyday LIONOVART voice." },
  { id: "editorial", number: "02", title: "Editorial", note: "Stories & perspectives", description: "A quiet Clash heading gives the floor to a generous serif statement. For stories and considered opinions." },
  { id: "expressive", number: "03", title: "Expressive", note: "Campaigns & launches", description: "Two voices share a headline. The italic phrase becomes the turn in the thought. Use for occasional impact." },
] as const;
const specs = [
  ["Primary headings", "Clash Display", "600–700 / normal", "Existing responsive scale", "Tight; uppercase or sentence case"],
  ["Hero subtitle", "Playfair Display", "400 / italic", "22–30px / 1.35", "Normal tracking; sentence case"],
  ["Bridge accent", "Playfair Display", "500 / italic", "32–80px / 1.15", "One complete phrase"],
  ["Closing introduction", "Playfair Display", "400 / italic", "24–36px / 1.25", "Normal tracking; sentence case"],
  ["Editorial quotation", "Playfair Display", "400 / normal", "28–48px / 1.3", "Generous space; short passages"],
  ["Body & interface", "Existing Clash / DM Sans", "400–600 / normal", "Existing responsive scale", "Keep the reading rhythm"],
];

export default function TypographyShowcase() {
  const [dark, setDark] = useState(false);
  const [copy, setCopy] = useState(initialCopy);

  return (
    <main className={s.study} data-theme={dark ? "dark" : "light"}>
      <a className={s.skip} href="#directions">Skip to directions</a>
      <header className={s.masthead}>
        <Link className={s.wordmark} href="/" prefetch={false} aria-label="LIONOVART homepage">LIONOVART<span aria-hidden="true">®</span></Link>
        <span className={s.edition}>Identity study / 01</span>
        <button type="button" className={s.themeButton} aria-pressed={dark} onClick={() => setDark(!dark)}>{dark ? "Light preview" : "Dark preview"}<span aria-hidden="true"> ◐</span></button>
      </header>

      <section className={s.cover} aria-labelledby="study-title">
        <div className={s.kicker}><span>Two typefaces. One identity.</span><span>Typography / LIONOVART</span></div>
        <h1 id="study-title" className={s.coverTitle}>Clash Display<span className={s.coverSerif}><span className={s.multiply} aria-hidden="true">×</span> Playfair Display</span></h1>
        <div className={s.coverFoot}>
          <p>Presence, <em>with feeling.</em></p>
          <p>A bold foundation. An expressive counterpoint.<br />A typography system for a brand with both.</p>
        </div>
      </section>

      <section className={s.workspace} aria-labelledby="try-title">
        <div><span className={s.eyebrow}>The working specimen</span><h2 id="try-title">Try your words.</h2><p>Edits update every direction and application below. Illustrative copy, for design exploration.</p></div>
        <div className={s.fields}>
          <label>Main headline<input value={copy.headline} maxLength={90} onChange={e => setCopy({ ...copy, headline: e.target.value })} /></label>
          <label>Expressive phrase<input value={copy.accent} maxLength={100} onChange={e => setCopy({ ...copy, accent: e.target.value })} /></label>
          <label className={s.bodyField}>Supporting copy<textarea rows={2} value={copy.body} maxLength={260} onChange={e => setCopy({ ...copy, body: e.target.value })} /></label>
          <button className={s.reset} type="button" onClick={() => setCopy(initialCopy)}>Reset sample copy ↗</button>
        </div>
      </section>

      <section id="directions" className={s.section} aria-labelledby="directions-title">
        <div className={s.sectionHeading}><h2 id="directions-title">Three ways to speak.</h2><span>01 — 03 / Same words, different rhythm</span></div>
        <div className={s.directions}>
          {directions.map(direction => <article key={direction.id} className={s.direction} data-direction={direction.id}>
            <div className={s.directionTop}><span>{direction.number} / {direction.title}</span><span>{direction.note}</span></div>
            <div className={`${s.specimen} ${s[direction.id]}`}>
              {direction.id === "expressive" ? <h3>{copy.headline} <em>{copy.accent}</em></h3> : <><h3>{copy.headline}</h3><p className={s.accent}>{copy.accent}</p></>}
              <p className={s.specimenBody}>{copy.body}</p>
            </div>
            <p className={s.directionDescription}>{direction.description}</p>
          </article>)}
        </div>
      </section>

      <section className={s.section} aria-labelledby="applications-title">
        <div className={s.sectionHeading}><h2 id="applications-title">One signature. Everywhere.</h2><span>04 / Recommended applications</span></div>
        <div className={s.applications}>
          <article className={`${s.application} ${s.heroApplication}`} aria-label="Website hero specimen">
            <div className={s.applicationLabel}><span>LIONOVART</span><span>01 / Website hero</span></div>
            <div className={s.heroCopy}><h3>{copy.headline}</h3><p className={s.accent}>{copy.accent}</p><p className={s.supporting}>{copy.body}</p></div>
            <span className={s.mockCta}>Brand / Web / Experiences</span>
            <span className={s.heroGlyph} aria-hidden="true">Aa</span>
          </article>
          <article className={`${s.application} ${s.statementApplication}`} aria-label="Brand statement specimen">
            <div className={s.applicationLabel}><span>02 / Brand statement</span><span>Signature</span></div>
            <div><h3>{copy.headline}</h3><p className={s.accent}>{copy.accent}</p></div>
            <p className={s.supporting}>{copy.body}</p>
          </article>
          <article className={`${s.application} ${s.socialApplication}`} aria-label="Social post specimen">
            <div className={s.applicationLabel}><span>LIONOVART®</span><span>03 / Social</span></div>
            <div><h3>{copy.headline}</h3><p className={s.accent}>{copy.accent}</p></div>
            <div className={s.socialFooter}><span>Made to be remembered.</span><span aria-hidden="true">↗</span></div>
          </article>
          <article className={`${s.application} ${s.editorialApplication}`} aria-label="Editorial layout specimen">
            <div className={s.applicationLabel}><span>04 / Studio journal</span><span>Vol. 01</span></div>
            <h3>{copy.headline}</h3><p className={s.quote}>{copy.accent}</p>
            <div className={s.articleBody}><span>Perspective<br />LIONOVART studio</span><p>{copy.body}</p></div>
            <span className={s.folio}>Form / Feeling / Function</span>
          </article>
        </div>
      </section>

      <section className={`${s.section} ${s.rules}`} aria-labelledby="rules-title">
        <div><span className={s.eyebrow}>The art of restraint</span><h2 id="rules-title">Give each voice<br />its own space.</h2></div>
        <div className={s.ruleList}>
          <p><strong>01 / Let Clash lead.</strong> Keep the logo, principal headings, navigation and buttons in their established type system.</p>
          <p><strong>02 / Make the serif count.</strong> One expressive phrase per composition. Keep italics in sentence case with normal spacing.</p>
          <p><strong>03 / Protect the reading rhythm.</strong> Preserve DM Sans body copy. Reserve Playfair for accents and short editorial passages, with room for its letterforms.</p>
          <p><strong>04 / Design for the language.</strong> Style whole translated phrases. Japanese and Korean retain the existing website typography.</p>
        </div>
      </section>

      <section className={s.section} aria-labelledby="spec-title">
        <div className={s.sectionHeading}><h2 id="spec-title">The typography recipe.</h2><span>05 / Design & development</span></div>
        <div className={s.tableWrap} role="region" aria-label="Typography specifications" tabIndex={0}><table className={s.specTable}><thead><tr>{["Role", "Typeface", "Weight / style", "Size / line height", "Treatment"].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{specs.map(row => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th key={index} scope="row">{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div>
        <p className={s.implementationNote}>Responsive values span mobile to desktop. Use <code>font-editorial</code> for the family and <code>editorial-accent</code> for the italic treatment. Genuine font styles; no synthetic italics.</p>
      </section>
      <footer className={s.footer}><span>LIONOVART / Typography study</span><p>Bold enough to lead. <em>Refined enough to last.</em></p><Link href="/" prefetch={false}>View the website ↗</Link></footer>
    </main>
  );
}
