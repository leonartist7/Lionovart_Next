/** Canonical public destinations shared by the client and NOVA's knowledge. */
const SECTION_DESTINATIONS = {
  hero: { pathname: "/", target: "hero" },
  about: { pathname: "/about", target: "about-content" },
  founder: { pathname: "/about", target: "founder" },
  philosophy: { pathname: "/about", target: "philosophy" },
  "lion-nova-art": { pathname: "/about", target: "lion-nova-art" },
  "working-together": { pathname: "/about", target: "working-together" },
  "working-models": { pathname: "/about", target: "working-models" },
  showcase: { pathname: "/", target: "selected-work" },
  portfolio: { pathname: "/", target: "selected-work" },
  "selected-work": { pathname: "/", target: "selected-work" },
  problems: { pathname: "/", target: "problems" },
  services: { pathname: "/", target: "services" },
  process: { pathname: "/", target: "process" },
  comparison: { pathname: "/", target: "comparison" },
  testimonials: { pathname: "/", target: "client-experience" },
  faq: { pathname: "/", target: "faq" },
  "closing-cta": { pathname: "/", target: "closing-cta" },
};
function publicPath(pathname) {
  return (
    pathname.replace(/^\/(en|fr|es|it|ja|ko)(?=\/|$)/, "").replace(/\/$/, "") ||
    "/"
  );
}
function resolveSectionDestination(sectionId, pathname) {
  const current = publicPath(pathname);
  if (sectionId === "comparison" && current === "/about")
    return SECTION_DESTINATIONS["working-models"];
  if (sectionId === "closing-cta" && current === "/about")
    return { pathname: "/about", target: "closing-cta" };
  return Object.hasOwn(SECTION_DESTINATIONS, sectionId)
    ? SECTION_DESTINATIONS[sectionId]
    : null;
}
module.exports = {
  SECTION_DESTINATIONS,
  publicPath,
  resolveSectionDestination,
};
