import { GALLERY_WORK } from "./selected-work/gallery";
import { PARTNERSHIP_SCROLL_LENGTH } from "./partnership-motion";

// Reference settings for LIONOVART's original, dependency-free tile choreography.
export const PARTNERSHIP_TILE_SETTINGS = {
  columns: 3, gap: 35, gridWidth: 900, tileAspect: 1.5, tileRadius: 10,
  direction: "alternate" as const, stagger: 0.16, overlap: 0.3,
  zoom: 1.95, spread: 0.3, scrollLength: PARTNERSHIP_SCROLL_LENGTH, scrub: 0.31, grayscale: false,
};

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
  return [{
    id: work.slug,
    poster: work.poster,
    // Only two silent six-second loops, gated by visibility and connection.
    video: work.video && ["rakbank", "fundonion"].includes(work.slug)
      ? cloudinaryTransform(work.video, "w_720,c_limit,f_mp4,q_auto:good,ac_none,so_0,du_6,fr_24")
      : undefined,
  }];
});

export const PARTNERSHIP_TILE_IMAGES = PARTNERSHIP_TILE_MEDIA.map(item => item.poster);

