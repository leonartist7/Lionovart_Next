import { collectionWork } from "./cloudinaryCollection";

/** Imported work followed by wireframe fixtures. Final assignments need content approval.
 * Array order is the editorial order; no dates or invented client results are inferred.
 */
export const industries = [
  { id: "consumer", label: "Consumer brands" },
  { id: "wellness", label: "Wellness" },
  { id: "events", label: "Events" },
  { id: "hospitality", label: "Hospitality" },
  { id: "education", label: "Education" },
  { id: "technology", label: "Technology" },
  { id: "finance", label: "Finance" },
] as const;
export const services = [
  { id: "identity", label: "Brand identity" },
  { id: "digital", label: "Digital design" },
  { id: "campaign", label: "Campaign" },
  { id: "motion", label: "Motion" },
  { id: "web-dev", label: "Web dev" },
  { id: "creative-content", label: "Creative content" },
  { id: "ai-os", label: "AI operating system" },
  { id: "app-dev", label: "App dev" },
  { id: "event-branding", label: "Event branding" },
] as const;
export type WorkEntry = {
  slug: string;
  name: string;
  industry: string;
  serviceIds: string[];
  kind: "project" | "concept" | "work";
  number: string;
  poster?: string;
  video?: string;
  posterAlt?: string;
  supportingPosters?: string[];
  duration?: number;
  sourceId?: string;
  // Only populate this with approved, attributable evidence in a future content pass.
  verifiedOutcome?: string;
};
const fixtureIndustries = industries.slice(0, 6);
const fixtureServices = services.slice(0, 4);
const fixtures: WorkEntry[] = Array.from({ length: 20 }, (_, offset) => {
  const index = offset + 10;
  return {
    slug: `sample-${String(index + 1).padStart(2, "0")}`,
    name: `Sample ${index % 3 === 1 ? "concept" : "project"} ${String(index + 1).padStart(2, "0")}`,
    number: String(index + 1).padStart(2, "0"),
    industry: fixtureIndustries[index % fixtureIndustries.length].id,
    serviceIds: [fixtureServices[(index + Math.floor(index / fixtureIndustries.length)) % fixtureServices.length].id],
    kind: index % 3 === 1 ? "concept" : "project",
  };
});
export const workEntries: WorkEntry[] = [...collectionWork, ...fixtures];
export const industryLabel = (id: string) => industries.find(item => item.id === id)?.label ?? "All industries";
export const serviceLabel = (id: string) => services.find(item => item.id === id)?.label ?? "All services";
export const workServiceLabels = (entry: WorkEntry) => entry.serviceIds.map(serviceLabel);
export const workStatus = (entry: WorkEntry) => entry.kind === "work" ? "Work showcase" : entry.kind === "concept" ? "Concept placeholder" : "Project placeholder";
export const workIndustryLabel = (entry: WorkEntry) => entry.industry ? industryLabel(entry.industry) : "Industry pending";

export function filterWork(industry: string, service: string, query: string) {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return workEntries.filter(entry => (!industry || entry.industry === industry) && (!service || entry.serviceIds.includes(service)) &&
    words.every(word => `${entry.name} ${workIndustryLabel(entry)} ${workServiceLabels(entry).join(" ")} ${entry.kind}`.toLocaleLowerCase().includes(word)));
}

/** Accept only a local gallery URL, never a user-supplied redirect destination. */
export function safeGalleryPath(value: string | null) {
  if (!value) return "/work";
  try {
    const url = new URL(value, "https://work.local");
    if (url.origin !== "https://work.local" || !/^\/(?:en\/|fr\/|es\/|it\/|ja\/|ko\/)?work$/.test(url.pathname)) return "/work";
    return `/work${url.search}`;
  } catch { return "/work"; }
}
