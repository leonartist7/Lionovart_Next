import { GALLERY_WORK } from "./selected-work/gallery";

// Values selected in the owner's React Bits Pro screenshot.
// These are the documented Tile Reveal props; no licensed source is included.
export const PARTNERSHIP_TILE_SETTINGS = {
  columns: 3,
  gap: 35,
  gridWidth: 900,
  tileAspect: 1.5,
  tileRadius: 10,
  direction: "alternate" as const,
  stagger: 0.16,
  overlap: 0.3,
  zoom: 1.95,
  spread: 0.3,
  scrollLength: 3,
  scrub: 0.31,
  grayscale: false,
};

// Reuse the existing portfolio asset identities rather than unrelated stock.
const SLUGS = [
  "rakbank", "coffee-minimal", "stormlikes",
  "home-interior", "fundonion", "oma",
  "lsi-asia-25", "coinly", "perfum-elegant",
];

function cloudinaryTransform(source: string, transform: string) {
  return source.replace(/\/upload\/(?:[^/]+\/)?(?=v\d+\/)/, `/upload/${transform}/`);
}

export const PARTNERSHIP_TILE_MEDIA = SLUGS.flatMap(slug => {
  const work = GALLERY_WORK.find(project => project.slug === slug);
  if (!work) return [];
  const widths = [320, 640, 1000];
  return [{
    id: work.slug,
    alt: work.name,
    poster: cloudinaryTransform(work.poster, "w_1000,c_limit,f_auto,q_auto"),
    srcSet: widths.map(width => `${cloudinaryTransform(work.poster, `w_${width},c_limit,f_auto,q_auto`)} ${width}w`).join(", "),
    // Two short muted loops only. Attach after visibility/data-saving checks.
    video: work.video && ["rakbank", "fundonion"].includes(work.slug)
      ? cloudinaryTransform(work.video, "w_720,c_limit,f_mp4,q_auto:good,ac_none,so_0,du_6,fr_24")
      : undefined,
  }];
});

export const PARTNERSHIP_TILE_IMAGES = PARTNERSHIP_TILE_MEDIA.map(item => item.poster);
