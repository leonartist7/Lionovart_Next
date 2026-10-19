// These are the same service visuals used by the current homepage chapter,
// stored locally so both the poster and WebGL texture use identical pixels.
export const SERVICE_GALLERY_PROJECTS = [
  { id: "branding", name: "Brand Identity & Strategy", poster: "/images/services-gallery/brand.webp", color: "#b7a69d" },
  { id: "web", name: "Web & App Development", poster: "/images/services-gallery/web.webp", color: "#292d35" },
  { id: "content", name: "Content Studio", poster: "/images/services-gallery/content.webp", color: "#573c3a" },
  { id: "print", name: "Print & Physical Branding", poster: "/images/services-gallery/print.webp", color: "#c9b7a6" },
  { id: "systems", name: "Smart Systems & AI", poster: "/images/services-gallery/systems.webp", color: "#302f3c" },
  { id: "led", name: "Transparent LED Experiences", poster: "/images/transparent-led-concept.svg", color: "#6b4a44" },
] as const;
