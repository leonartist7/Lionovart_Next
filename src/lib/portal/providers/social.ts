import "server-only";
import { validatePost, type MediaInfo, type PostValidation } from "@/lib/portal/platforms";
import type { Platform, Post, PublishResult } from "@/lib/portal/types";

/**
 * The seam real social publishing will slot into.
 *
 * Meta and LinkedIn both gate posting behind app review — weeks of external
 * approval that no amount of code shortens, so publishing is deliberately not
 * built (see PORTAL_HANDOFF.md's cut list). What ships instead is
 * `ManualPublisher`: it runs the **real** per-platform validation, then hands
 * the studio the exact text to post and records what they confirm.
 *
 * The important property is that the UI has no stub-shaped hole. A post that
 * `ManualPublisher` refuses is a post a live driver would also refuse, because
 * both call the same `validatePost`. When `MetaPublisher` arrives it
 * implements this interface and `getSocialPublisher()` starts returning it —
 * nothing above this line changes. Same shape as `whatsapp.ts`.
 */

export interface PublishInput {
  post: Post;
  media: MediaInfo[];
  /** Platforms the studio is confirming right now — a subset of the post's. */
  platforms: Platform[];
  /** Where it went, when the studio has the link. */
  urls?: Partial<Record<Platform, string>>;
  actorUid: string;
}

export type PublishOutcome =
  | { ok: true; results: Partial<Record<Platform, PublishResult>> }
  | { ok: false; error: string; validation?: PostValidation };

export interface SocialPublisher {
  readonly id: string;
  /**
   * True when a person has to post it by hand. The UI says so plainly rather
   * than implying an automation that doesn't exist.
   */
  readonly requiresManualStep: boolean;
  validate(post: Post, media: MediaInfo[]): PostValidation;
  publish(input: PublishInput): Promise<PublishOutcome>;
}

class ManualPublisher implements SocialPublisher {
  readonly id = "manual";
  readonly requiresManualStep = true;

  validate(post: Post, media: MediaInfo[]): PostValidation {
    return validatePost(post, media);
  }

  async publish(input: PublishInput): Promise<PublishOutcome> {
    const validation = this.validate(input.post, input.media);
    if (!validation.ok) {
      return { ok: false, error: "This can't post as written.", validation };
    }

    const confirming = input.platforms.filter((p) => input.post.platforms.includes(p));
    if (confirming.length === 0) {
      return { ok: false, error: "Choose which platforms went out." };
    }

    const at = new Date().toISOString();
    const results: Partial<Record<Platform, PublishResult>> = {};
    for (const platform of confirming) {
      const url = input.urls?.[platform]?.trim();
      results[platform] = {
        status: "published",
        at,
        ...(url ? { url } : {}),
      };
    }
    return { ok: true, results };
  }
}

const manual = new ManualPublisher();

/**
 * Selected by environment, exactly as `getWhatsAppProvider()` is. There is no
 * live driver yet, so this returns the manual one — the function exists now so
 * that adding one later is a change in this file and nowhere else.
 */
export function getSocialPublisher(): SocialPublisher {
  return manual;
}
