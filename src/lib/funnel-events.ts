"use client";

import { posthog, initPostHog } from "./posthog-client";

// Kept separate from NOVA_EVENT (nova-events.ts) — these are funnel/CTA
// events outside the NOVA conversation lifecycle: hero/banner/sticky-bar
// clicks and the /audit form, not chat session events.
export const FUNNEL_EVENT = {
  HERO_PEEK_SUBMITTED: "funnel.hero_peek_submitted",
  HERO_PEEK_CTA_CLICKED: "funnel.hero_peek_cta_clicked",
  FOUNDER_BANNER_CLICKED: "funnel.founder_banner_clicked",
  STICKY_AUDIT_CLICKED: "funnel.sticky_audit_clicked",
  AUDIT_STRIP_CLICKED: "funnel.audit_strip_clicked",
  AUDIT_FORM_SUBMITTED: "funnel.audit_form_submitted",
  EXIT_INTENT_SHOWN: "funnel.exit_intent_shown",
  EXIT_INTENT_DISMISSED: "funnel.exit_intent_dismissed",
  EXIT_INTENT_CLICKED: "funnel.exit_intent_clicked",
  CALL_PAGE_CTA_CLICKED: "funnel.call_page_cta_clicked",
} as const;

export type FunnelEventName = (typeof FUNNEL_EVENT)[keyof typeof FUNNEL_EVENT];

export function trackFunnelEvent(name: FunnelEventName, props?: Record<string, unknown>) {
  try {
    initPostHog();
    posthog.capture?.(name, props);
  } catch {
    // never break the funnel because analytics failed
  }
}
