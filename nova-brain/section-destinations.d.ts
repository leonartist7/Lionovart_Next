export type SectionDestination = { pathname: string; target: string };
export const SECTION_DESTINATIONS: Record<string, SectionDestination>;
export function publicPath(pathname: string): string;
export function resolveSectionDestination(
  sectionId: string,
  pathname: string,
): SectionDestination | null;
