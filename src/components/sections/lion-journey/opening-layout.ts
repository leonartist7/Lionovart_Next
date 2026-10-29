const clamp = (n: number, max = 1) => Math.max(0, Math.min(max, n));
export const LANDSCAPE_FILM_QUERY = "(min-width: 768px), (min-width: 600px) and (min-aspect-ratio: 6/5)";
export function usesLandscapeFilm(width: number, height: number) {
  return width >= 768 || (width >= 600 && width >= height * 1.2);
}

/** Read a long stack before its flip, then read the matching back faces. */
export function openingReadingPose(travel: number, span: number, frontOverflow = 0, backOverflow = 0) {
  const frontRead = clamp(travel - span * .525, frontOverflow);
  const progress = clamp((travel - frontRead) / Math.max(1, span));
  const reset = clamp((progress - .68) / .18);
  const smooth = reset * reset * (3 - 2 * reset);
  return { progress, offset: frontRead * (1 - smooth) + clamp(travel - span - frontOverflow, backOverflow) };
}

/** Film sits above its trust/heading beat. Tall cards retain the same top edge and overflow reading path. */
export function openingFrameCenters(stageCenter: number, finalHeight: number, safeTop: number, safeBottom: number, proofReserve: number, allowance: number) {
  const available = Math.max(1, safeBottom - safeTop - proofReserve - allowance * 2);
  const visibleHeight = Math.min(finalHeight, available);
  const filmCenter = Math.max(safeTop + allowance + visibleHeight / 2,
    Math.min(stageCenter, safeBottom - proofReserve - allowance - visibleHeight / 2));
  return { filmCenter, cardCenter: filmCenter + Math.max(0, finalHeight - available) / 2 };
}

/** A single card stack is read once, without rewinding it for another face. */
export function inlineBenefitReadingPose(travel: number, span: number, overflow = 0) {
  const offset = clamp(travel - span * .84, overflow);
  return { progress: clamp((travel - offset) / Math.max(1, span)), offset };
}

/** The parent intro is sticky too; use its stable runway origin for navigation. */
export function openingDocumentTop(opening: HTMLElement, pageScroll: number) {
  const intro = opening.closest<HTMLElement>("[data-work-intro]");
  const transition = opening.closest<HTMLElement>("[data-work-services-transition]");
  const y = opening.getBoundingClientRect().top;
  return intro && transition ? transition.getBoundingClientRect().top + pageScroll + y - intro.getBoundingClientRect().top : y + pageScroll;
}
