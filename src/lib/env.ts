import "server-only";

function required(key: string): string {
  const v = process.env[key];
  if (!v) {
    throw new Error(
      `[env] Missing required environment variable: ${key}. Set it in .env.local or your deployment environment.`,
    );
  }
  return v;
}

function optional(key: string): string | undefined {
  return process.env[key] || undefined;
}

/**
 * The `required` entries are getters, not plain values: as eagerly-evaluated
 * properties they threw the moment any module imported `env`, which crashed
 * `next build` during page-data collection whenever the variable was unset —
 * even for routes that never read it. Reading them still throws, so a genuinely
 * missing variable fails fast at the point of use.
 */
export const env = {
  get WHATSAPP_NUMBER() {
    return required("WHATSAPP_NUMBER");
  },
  get BOOKING_URL() {
    return required("BOOKING_URL");
  },
  SLACK_WEBHOOK_URL: optional("SLACK_WEBHOOK_URL"),
  NEXT_PUBLIC_POSTHOG_KEY: optional("NEXT_PUBLIC_POSTHOG_KEY"),
  RESEND_API_KEY: optional("RESEND_API_KEY"),
  GOOGLE_PLACES_API_KEY: optional("GOOGLE_PLACES_API_KEY"),
  CALCOM_API_KEY: optional("CALCOM_API_KEY"),
  CALCOM_EVENT_TYPE_ID: optional("CALCOM_EVENT_TYPE_ID"),
};
