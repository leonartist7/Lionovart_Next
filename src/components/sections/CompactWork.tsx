"use client";

import { useWorkBrowse } from "./selected-work/WorkBrowse";
import GalleryWalkthrough from "./GalleryWalkthrough";
import { galleryWithCarry } from "./gallery-journey";
import { useServiceWorld } from "./service-world/ServiceWorld";
import { serviceExhibits } from "./service-triptych";
import { GALLERY_WORK, type GalleryWork } from "./selected-work/gallery";

const LED_WORK: GalleryWork = {
  slug: 'transparent-led-concept', name: 'Transparent LED · display concept',
  poster: '/images/transparent-led-concept.svg', assetId: 'transparent-led-concept',
  industry: 'Events & Culture', styles: ['Elegant'], services: ['event-branding'],
  fit: 'contain', status: 'concept',
};

/** Work selection stays inside the shared room; filtering resets the local focus. */
export default function CompactWork({ servicesCurves = false }: { servicesCurves?: boolean }) {
  const browse = useWorkBrowse();
  const world = useServiceWorld();
  const exhibit = serviceExhibits(world?.handoff.service ?? 'branding')[world?.handoff.variant ?? 1];
  const carry = GALLERY_WORK.find(work => work.slug === exhibit?.slug) ?? LED_WORK;
  return <GalleryWalkthrough key={browse.industry + "/" + browse.style}
    projects={galleryWithCarry(browse.galleryProjects, carry)} servicesCurves={servicesCurves} />;
}
