import styles from "./WorkingModels.module.css";

const providers = ["LIONOVART", "In-house team", "Creative agency", "Freelancer", "AI tools only"];
// Keep the seven subjects from the former homepage chart, while describing
// working models rather than assigning universal pass/fail scores.
const topics = [
  { name: "Speed", cells: ["Milestones agreed around the brief and production needs.", "Capacity depends on the team's workload.", "Scheduling follows the agreed scope and team availability.", "Timing follows the specialist's availability.", "Fast drafts; review and finishing still take time."] },
  { name: "Flexibility", cells: ["Choose the disciplines and deliverables your project needs.", "Priorities can change within the team's skill set.", "Changes are handled within the agency's agreement.", "Additional skills may require another specialist.", "Flexible exploration within the tool's capabilities."] },
  { name: "Quality", cells: ["Creative direction and a shared brand system guide the work.", "Internal brand knowledge can support consistency.", "Quality depends on the team's expertise and direction.", "Match the specialist's portfolio to the brief.", "Output needs brand judgment and quality control."] },
  { name: "Scalability", cells: ["Plan additional work and production partners around the scope.", "More capacity may mean hiring or outside support.", "Capacity and additional services depend on the agreement.", "Availability and specialist capacity shape the workload.", "Draft volume can grow; oversight remains necessary."] },
  { name: "Efficiency & cost", cells: ["A connected brief reduces handoffs; pricing follows the scope.", "Salaries, tools and management form the ongoing cost.", "Project fees or retainers depend on the agency's model.", "Hourly or project fees vary by specialist.", "Subscriptions plus your own time for direction and finishing."] },
  { name: "Print & production", cells: ["Design and production coordination are available within the brief.", "Production expertise may be internal or sourced separately.", "Capabilities vary; some agencies specialize in production.", "Choose a specialist with the relevant production experience.", "Files need technical checks before physical production."] },
  { name: "Support", cells: ["Direct collaboration with Leonardo; support agreed per project.", "Access to colleagues through your internal processes.", "An account or project contact, depending on the setup.", "Direct contact during the agreed engagement.", "Tool support handles the software, not your creative direction."] },
];

export default function WorkingModels() {
  return (
    <section id="comparison" data-nova-section="comparison" className={styles.section} aria-labelledby="working-models-heading">
      <div className={styles.container}>
        <p className={styles.eyebrow}>Compare the approaches</p>
        <h2 id="working-models-heading">Different ways<br />to build your brand.</h2>
        <p className={styles.introduction}>The right setup depends on your goals, your team and the work ahead. Here is how common working models can differ.</p>
        <p className={styles.scope}>Illustrative approaches. Capabilities, pricing and support vary by provider and project.</p>
        <div className={styles.topics}>
          {topics.map((topic, index) => (
            <article key={topic.name} className={styles.topic} aria-labelledby={`working-model-${index}`}>
              <h3 id={`working-model-${index}`}><span aria-hidden="true">0{index + 1}</span>{topic.name}</h3>
              <dl className={styles.models}>
                {providers.map((provider, providerIndex) => (
                  <div key={provider} className={providerIndex === 0 ? styles.brand : styles.alternative}>
                    <dt>{provider}</dt><dd>{topic.cells[providerIndex]}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
