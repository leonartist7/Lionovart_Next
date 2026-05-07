"use client";

import { posthog, initPostHog } from "./posthog-client";

export const NOVA_EVENT = {
  SESSION_STARTED: "nova.session_started",
  SESSION_ENDED: "nova.session_ended",
  STAGE_REACHED: "nova.stage_reached",
  FIELD_CONFIRMED: "nova.field_confirmed",
  TOOL_CALLED: "nova.tool_called",
  TOOL_ERROR: "nova.tool_error",
  SCRAPE_FIRED: "nova.scrape_fired",
  SCRAPE_SUCCEEDED: "nova.scrape_succeeded",
  SCRAPE_FAILED: "nova.scrape_failed",
  HANDOFF_OFFERED: "nova.handoff_offered",
  HANDOFF_ACCEPTED: "nova.handoff_accepted",
  HANDOFF_CARD_CLICKED: "nova.handoff_card_clicked",
  PRIVACY_ACCEPTED: "nova.privacy_accepted",
  TEXT_MODE_TOGGLED: "nova.text_mode_toggled",
  BOOKING_EMBED_OPENED: "nova.booking_embed_opened",
  BOOKING_COMPLETED: "nova.booking_completed",
} as const;

export type NovaEventName = (typeof NOVA_EVENT)[keyof typeof NOVA_EVENT];

export function trackNovaEvent(name: NovaEventName, props?: Record<string, unknown>) {
  try {
    initPostHog();
    posthog.capture?.(name, props);
  } catch {
    // never break session because analytics failed
  }
}
