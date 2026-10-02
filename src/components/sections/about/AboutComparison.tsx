import styles from "./AboutPageContent.module.css";

const providers = ["LIONOVART", "In-house team", "Creative agency", "Freelancers", "AI tools"];
// Compare working models, not unverified delivery guarantees or client results.
const topics = [
  { name: "Speed", entries: ["Priorities and milestones agreed directly", "Depends on internal capacity", "Scheduled around agency capacity", "Depends on individual availability", "Fast drafts; review still needed"] },
  { name: "Flexibility", entries: ["Disciplines scoped around the project", "Changes fit existing roles", "Changes follow the project scope", "Specialists engaged separately", "Bound by tool capabilities"] },
  { name: "Quality", entries: ["One creative lead across touchpoints", "Internal brand knowledge", "Agency creative and review process", "Each specialist’s own approach", "Human direction and checking needed"] },
  { name: "Scalability", entries: ["Production partners for specialist needs", "Hiring or outsourcing may be needed", "Resourcing through the agency", "Additional specialists to coordinate", "More output; human oversight needed"] },
  { name: "Efficiency", entries: ["A shared brief and direct contact", "Ongoing staffing and management", "Account and project management", "Multiple briefs and handoffs", "Prompts, selection, and refinement"] },
  { name: "Print & physical", entries: ["Design and production coordination", "Needs relevant production expertise", "Depends on agency specialism", "Depends on individual specialism", "Needs human production preparation"] },
  { name: "Support", entries: ["Direct access to the creative lead", "An internal point of contact", "An account or project contact", "Contact each specialist directly", "Product support, not creative direction"] },
];

export default function AboutComparison() {
  return (
    <section id="approach" className={styles.approach} aria-labelledby="approach-heading">
      <div className={styles.container}>
        <div className={styles.comparisonHeader}>
          <div><p className={styles.eyebrow}>Why work with LIONOVART</p><h2 id="approach-heading" className={styles.sectionTitle}>The difference is<br /><em>the connection.</em></h2></div>
          <p className={styles.comparisonIntro}>One creative direction. A direct relationship. Connected expertise from the brief to the final expression. Here’s how that working model compares.</p>
        </div>
        <table className={styles.comparisonTable}>
          <caption className="sr-only">Working-model comparison across seven topics and five options</caption>
          <thead><tr><th scope="col">Working model</th>{providers.map((provider, index) => <th key={provider} scope="col" className={index === 0 ? styles.highlightColumn : undefined}>{provider}</th>)}</tr></thead>
          <tbody>{topics.map((topic) => <tr key={topic.name}><th scope="row">{topic.name}</th>{topic.entries.map((entry, index) => <td key={providers[index]} className={index === 0 ? styles.highlightColumn : undefined}>{entry}</td>)}</tr>)}</tbody>
        </table>
        <div className={styles.mobileComparison}>
          <p className={styles.comparisonHint}>Explore the comparison by topic <span aria-hidden="true">↓</span></p>
          {topics.map((topic, topicIndex) => (
            <details key={topic.name} open={topicIndex === 0} className={styles.topic}>
              <summary><span><small aria-hidden="true">0{topicIndex + 1}</small>{topic.name}</span><span className={styles.disclosureIcon} aria-hidden="true">+</span></summary>
              <dl>{topic.entries.map((entry, index) => <div key={providers[index]} className={index === 0 ? styles.highlightEntry : undefined}><dt>{providers[index]}</dt><dd>{entry}</dd></div>)}</dl>
            </details>
          ))}
        </div>
        <p className={styles.comparisonFootnote}>Every model has its place. Team structure, timing, fees, and support depend on the scope agreed with your chosen provider.</p>
      </div>
    </section>
  );
}
