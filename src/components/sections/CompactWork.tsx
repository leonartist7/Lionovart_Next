"use client";

import { useWorkBrowse } from "./selected-work/WorkBrowse";
import GalleryWalkthrough from "./GalleryWalkthrough";
import { GALLERY_MAX_PROJECTS } from "./gallery-journey";

/** Work selection stays inside the shared room; filtering resets the local focus. */
export default function CompactWork({ servicesCurves = false }: { servicesCurves?: boolean }) {
  const browse = useWorkBrowse();
  return <GalleryWalkthrough key={browse.industry + "/" + browse.style}
    projects={browse.galleryProjects.slice(0, GALLERY_MAX_PROJECTS)} servicesCurves={servicesCurves} />;
}
