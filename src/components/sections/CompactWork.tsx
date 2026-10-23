"use client";

import { useWorkBrowse } from "./selected-work/WorkBrowse";
import GalleryWalkthrough from "./GalleryWalkthrough";

/** Work selection stays inside the shared room; filtering resets the local focus. */
export default function CompactWork({ servicesCurves = false }: { servicesCurves?: boolean }) {
  const browse = useWorkBrowse();
  return <GalleryWalkthrough key={browse.industry + "/" + browse.style}
    projects={browse.galleryProjects} servicesCurves={servicesCurves} />;
}
