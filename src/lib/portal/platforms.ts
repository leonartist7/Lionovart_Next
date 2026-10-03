import { PLATFORMS, type Platform } from "@/lib/portal/types";

/**
 * Per-platform posting constraints, and the validation built on them.
 *
 * Deliberately **pure** — no `server-only`, no Firestore. The composer needs
 * these rules live as you type, and the API needs them before it will let a
 * post reach a client. Two copies of "what Instagram actually accepts" is two
 * places for it to go stale, and the failure is the exact one this page exists
 * to prevent: a client approving something that cannot post. Same stance
 * `deriveProgress` and `deriveCalendarItems` take.
 */

export interface PlatformSpec {
  id: Platform;
  label: string;
  /** Applies to the **composed** text — caption plus the rendered hashtags. */
  maxChars: number;
  /** Above this, the platform ignores the extra tags or rejects the post. */
  maxHashtags: number;
  /** Instagram will not accept a text-only feed post. */
  requiresMedia: boolean;
  maxMedia: number;
  /** Accepted width ÷ height range for the first image. */
  aspect: { min: number; max: number; label: string };
  /**
   * X rewrites every URL to a fixed-width t.co link, so a 90-character URL
   * costs 23. This is the classic "the counter says 310 but it posts fine"
   * case — and its inverse, which is the one that bites.
   */
  urlsCountAsFixedWidth?: number;
}

export const PLATFORM_SPECS: Record<Platform, PlatformSpec> = {
  instagram: {
    id: "instagram",
    label: "Instagram",
    maxChars: 2200,
    maxHashtags: 30,
    requiresMedia: true,
    maxMedia: 10,
    aspect: { min: 0.8, max: 1.91, label: "4:5 to 1.91:1" },
  },
  facebook: {
    id: "facebook",
    label: "Facebook",
    maxChars: 63206,
    maxHashtags: 30,
    requiresMedia: false,
    maxMedia: 10,
    aspect: { min: 0.4, max: 4, label: "wide latitude" },
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    maxChars: 3000,
    maxHashtags: 30,
    requiresMedia: false,
    maxMedia: 9,
    aspect: { min: 0.5, max: 2.4, label: "1:2 to 2.4:1" },
  },
  x: {
    id: "x",
    label: "X",
    maxChars: 280,
    maxHashtags: 10,
    requiresMedia: false,
    maxMedia: 4,
    aspect: { min: 0.33, max: 3, label: "1:3 to 3:1" },
    urlsCountAsFixedWidth: 23,
  },
};

export const PLATFORM_LIST: PlatformSpec[] = PLATFORMS.map((p) => PLATFORM_SPECS[p]);

export function isPlatform(value: string): value is Platform {
  return (PLATFORMS as readonly string[]).includes(value);
}

/* ── Hashtags ────────────────────────────────────────────────────── */

/**
 * Normalizes what a person typed into what actually posts: one leading `#`,
 * no spaces, no punctuation. Case is **preserved** — `#BrandIdentity` is
 * readable by a screen reader and `#brandidentity` is not.
 */
export function normalizeHashtag(raw: string): string {
  const cleaned = raw.trim().replace(/^#+/, "").replace(/[^\p{L}\p{N}_]/gu, "");
  return cleaned ? `#${cleaned}` : "";
}

export function normalizeHashtags(raw: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of raw) {
    const normalized = normalizeHashtag(tag);
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

/**
 * The text that actually posts.
 *
 * Instagram, Facebook and LinkedIn all read as a caption with a tag block
 * beneath it; on X there is no room for a block, so tags run inline. Either
 * way the tags are part of the character count — which is the whole reason
 * this returns one string rather than counting the caption alone.
 */
export function composeText(
  platform: Platform,
  caption: string,
  hashtags: readonly string[],
): string {
  const tags = normalizeHashtags(hashtags);
  const body = caption.trim();
  if (tags.length === 0) return body;
  const joined = tags.join(" ");
  if (!body) return joined;
  return platform === "x" ? `${body} ${joined}` : `${body}\n\n${joined}`;
}

const URL_PATTERN = /https?:\/\/\S+/g;

/** Length as the platform counts it, not as `String.length` does. */
export function effectiveLength(platform: Platform, text: string): number {
  const fixed = PLATFORM_SPECS[platform].urlsCountAsFixedWidth;
  if (!fixed) return [...text].length;
  let length = 0;
  let cursor = 0;
  URL_PATTERN.lastIndex = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    length += [...text.slice(cursor, match.index)].length + fixed;
    cursor = match.index + match[0].length;
  }
  return length + [...text.slice(cursor)].length;
}

/* ── Validation ──────────────────────────────────────────────────── */

/** What the validator knows about one attached image. */
export interface MediaInfo {
  assetId: string;
  name: string;
  kind: "image" | "video" | "doc" | "other";
  width?: number;
  height?: number;
}

export interface ValidationIssue {
  platform: Platform;
  /** `error` blocks the post. `warning` is worth saying and does not block. */
  severity: "error" | "warning";
  message: string;
}

export interface PlatformValidation {
  platform: Platform;
  composed: string;
  length: number;
  maxChars: number;
  hashtagCount: number;
  issues: ValidationIssue[];
}

export interface PostValidation {
  /** True when nothing is an `error` — i.e. this can genuinely post. */
  ok: boolean;
  perPlatform: PlatformValidation[];
  issues: ValidationIssue[];
}

export interface ValidatablePost {
  platforms: readonly Platform[];
  caption: string;
  hashtags: readonly string[];
}

/**
 * The one validator. Called by the composer on every keystroke, and again
 * server-side before a post may leave `draft` — the client's copy is a
 * courtesy, the server's is the rule.
 */
export function validatePost(post: ValidatablePost, media: readonly MediaInfo[]): PostValidation {
  const perPlatform: PlatformValidation[] = [];
  const all: ValidationIssue[] = [];

  if (post.platforms.length === 0) {
    const issue: ValidationIssue = {
      platform: "instagram",
      severity: "error",
      message: "Choose at least one platform.",
    };
    // Platform-agnostic, but the shape needs one — it surfaces in the summary,
    // never inside a per-platform panel, because there are none.
    return { ok: false, perPlatform: [], issues: [issue] };
  }

  const images = media.filter((m) => m.kind === "image" || m.kind === "video");

  for (const platform of post.platforms) {
    const spec = PLATFORM_SPECS[platform];
    const composed = composeText(platform, post.caption, post.hashtags);
    const length = effectiveLength(platform, composed);
    const tags = normalizeHashtags(post.hashtags);
    const issues: ValidationIssue[] = [];

    const add = (severity: ValidationIssue["severity"], message: string) =>
      issues.push({ platform, severity, message });

    if (!post.caption.trim() && tags.length === 0) {
      add("error", "There's no caption yet.");
    }
    if (length > spec.maxChars) {
      add(
        "error",
        `${length - spec.maxChars} characters over ${spec.label}'s ${spec.maxChars.toLocaleString("en-CA")} limit.`,
      );
    }
    if (tags.length > spec.maxHashtags) {
      add("error", `${spec.label} takes at most ${spec.maxHashtags} hashtags — there are ${tags.length}.`);
    }
    if (spec.requiresMedia && images.length === 0) {
      add("error", `${spec.label} won't accept a post with no image.`);
    }
    if (images.length > spec.maxMedia) {
      add("error", `${spec.label} takes at most ${spec.maxMedia} images — there are ${images.length}.`);
    }

    const first = images[0];
    if (first) {
      if (first.width && first.height) {
        const ratio = first.width / first.height;
        if (ratio < spec.aspect.min || ratio > spec.aspect.max) {
          add(
            "error",
            `${first.name} is ${first.width}×${first.height}. ${spec.label} accepts ${spec.aspect.label}.`,
          );
        }
      } else if (spec.requiresMedia) {
        // Uploaded files don't carry dimensions yet, so this can't be an error
        // without blocking every real post. Say what isn't known instead of
        // pretending to have checked it.
        add("warning", `${first.name}'s dimensions aren't recorded — check the crop before it posts.`);
      }
    }

    perPlatform.push({
      platform,
      composed,
      length,
      maxChars: spec.maxChars,
      hashtagCount: tags.length,
      issues,
    });
    all.push(...issues);
  }

  return { ok: !all.some((i) => i.severity === "error"), perPlatform, issues: all };
}

/* ── Post states ─────────────────────────────────────────────────── */

/**
 * States a non-agency member may see at all. Ideas and drafts are studio-only
 * — work in flight the studio hasn't shown anyone yet.
 *
 * Lives in the pure module because three places need the same answer: the data
 * layer that filters reads, the demo fixtures that mirror it, and any client
 * component that has to reason about what it was given.
 */
export const CLIENT_VISIBLE_STATES: import("@/lib/portal/types").PostState[] = [
  "in_review",
  "approved",
  "scheduled",
  "published",
  "rejected",
];

/* ── Display ─────────────────────────────────────────────────────── */

/**
 * What each state is called in the interface, and the badge it carries.
 *
 * Pipeline labels are written from the reader's point of view rather than the
 * database's: a client looking at `in_review` is looking at something that
 * needs *them*, and "In review" doesn't say that. Kept next to the constraints
 * so the pipeline, the composer and the demo preview can't drift apart.
 */
export const POST_STATE_LABELS: Record<
  import("@/lib/portal/types").PostState,
  { label: string; clientLabel: string; badge: "default" | "neutral" | "success" | "warning" }
> = {
  idea: { label: "Ideas", clientLabel: "Ideas", badge: "neutral" },
  draft: { label: "Drafts", clientLabel: "Drafts", badge: "neutral" },
  in_review: { label: "With the client", clientLabel: "Waiting on you", badge: "warning" },
  approved: { label: "Approved", clientLabel: "Approved", badge: "success" },
  scheduled: { label: "Scheduled", clientLabel: "Scheduled", badge: "success" },
  published: { label: "Published", clientLabel: "Published", badge: "neutral" },
  rejected: { label: "Changes requested", clientLabel: "Changes requested", badge: "default" },
};

/** The order the pipeline reads in — work moves down the page, not around it. */
export const POST_STATE_ORDER: import("@/lib/portal/types").PostState[] = [
  "in_review",
  "rejected",
  "scheduled",
  "approved",
  "draft",
  "idea",
  "published",
];
