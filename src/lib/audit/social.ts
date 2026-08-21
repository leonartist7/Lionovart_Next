import "server-only";

/**
 * Social presence audit — scoped deliberately to what can be verified.
 *
 * We detect which platforms a business links to from its own site, and whether
 * a shared link renders properly. We do NOT scrape profiles or estimate
 * followers: the platforms block it, and a fabricated engagement number is the
 * fastest way to lose a prospect who knows their own account. Actual content
 * review is a live-call item, which converts better than a guess anyway.
 */

const PLATFORMS: Array<{ id: string; label: string; re: RegExp }> = [
  { id: "instagram", label: "Instagram", re: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[A-Za-z0-9_.]+/i },
  { id: "facebook", label: "Facebook", re: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[A-Za-z0-9_.\-]+/i },
  { id: "linkedin", label: "LinkedIn", re: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:company|in)\/[A-Za-z0-9_.\-]+/i },
  { id: "tiktok", label: "TikTok", re: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[A-Za-z0-9_.]+/i },
  { id: "youtube", label: "YouTube", re: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:@|c\/|channel\/|user\/)[A-Za-z0-9_.\-]+/i },
  { id: "x", label: "X", re: /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/[A-Za-z0-9_]+/i },
];

export interface SocialAudit {
  linked: string[];
  missing: string[];
  hasOgImage: boolean;
  hasTwitterCard: boolean;
  score: number;
  findings: string[];
}

export function auditSocial(html: string): SocialAudit {
  const linked: string[] = [];
  const missing: string[] = [];
  for (const p of PLATFORMS) {
    (p.re.test(html) ? linked : missing).push(p.label);
  }

  const hasOgImage = /<meta[^>]+property=["']og:image["']/i.test(html);
  const hasTwitterCard = /<meta[^>]+name=["']twitter:card["']/i.test(html);

  const findings: string[] = [];
  if (linked.length === 0) {
    findings.push("Your website doesn't link to a single social profile. Whatever you're posting, visitors here can't find it.");
  } else {
    findings.push(`Your site links to ${linked.join(", ")}.`);
    if (missing.length) {
      findings.push(
        `Nothing links to ${missing.join(", ")}. Not every business needs every platform — but a buyer checking you out looks for the one where your work would actually show, and gives up if it isn't linked.`,
      );
    }
  }
  if (!hasOgImage) {
    findings.push("When someone shares your link in a message or a post, it renders as a bare grey box — there's no preview image set. That's your work being shared with the visual stripped out.");
  }
  if (!hasTwitterCard && hasOgImage) {
    findings.push("Open Graph is set but there's no Twitter card, so previews are inconsistent across apps.");
  }

  // Weighted toward the two things that are actually verifiable and actually
  // matter from the site's side: being findable, and sharing cleanly.
  let score = 0;
  score += Math.min(linked.length, 3) * 20; // up to 60
  score += hasOgImage ? 28 : 0;
  score += hasTwitterCard ? 12 : 0;

  return {
    linked,
    missing,
    hasOgImage,
    hasTwitterCard,
    score: Math.min(100, score),
    findings,
  };
}
