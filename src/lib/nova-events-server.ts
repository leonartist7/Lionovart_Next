import "server-only";
import crypto from "node:crypto";

export async function trackNovaServerEvent(
  name: string,
  distinctId: string,
  props?: Record<string, unknown>,
) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  try {
    await fetch("https://us.i.posthog.com/capture/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        event: name,
        distinct_id: distinctId,
        properties: props ?? {},
      }),
    });
  } catch {
    // swallow — never block the main request
  }
}

export function hashUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 12);
}
