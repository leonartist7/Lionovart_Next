/** Shared, dependency-free policy for the Vercel live-session broker. */
export const NOVA_SESSION_MS = 45 * 60 * 1000;
export const NOVA_TOKEN_START_MS = 60 * 1000;
export const NOVA_TOOL_GRACE_MS = 5 * 60 * 1000;

export function validConversationId(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(value);
}

export function validLocale(value: unknown): value is string {
  return typeof value === "string" && ["en", "fr", "es", "it", "ja", "ko"].includes(value);
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;
  if (!origin) return fetchSite === "same-origin" || fetchSite === "none";
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function liveTokenPolicy(now: number, startedAt: number) {
  const deadline = startedAt + NOVA_SESSION_MS;
  if (!Number.isFinite(startedAt) || startedAt > now || deadline <= now) throw new Error("session_expired");
  return {
    uses: 1,
    expireTime: new Date(deadline).toISOString(),
    newSessionExpireTime: new Date(Math.min(now + NOVA_TOKEN_START_MS, deadline)).toISOString(),
  };
}
