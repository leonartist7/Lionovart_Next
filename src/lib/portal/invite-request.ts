import { PORTAL_ROLES, type PortalRole } from "@/lib/portal/types";

/** Validate external input before a Firestore document reference is constructed. */
export function validateInviteWorkspaceId(value: unknown): string {
  if (typeof value !== "string") throw new Error("A workspace ID is required.");
  const id = value.trim();
  // eslint-disable-next-line no-control-regex
  if (!id || new TextEncoder().encode(id).length > 1500 || /[\/\u0000-\u001f\u007f]/.test(id)
    || id === "." || id === ".." || /^__.*__$/.test(id)) {
    throw new Error("Invalid workspace ID.");
  }
  return id;
}

export function validateInviteRequest(input: unknown): {
  workspaceId: string; email: string; role: PortalRole;
} {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Send an invitation object.");
  }
  const value = input as Record<string, unknown>;
  const workspaceId = validateInviteWorkspaceId(value.workspaceId);
  // eslint-disable-next-line no-control-regex
  if (typeof value.email !== "string" || /[\u0000-\u001f\u007f]/.test(value.email)) {
    throw new Error("A valid email is required.");
  }
  const email = value.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid email is required.");
  }
  const role = value.role === undefined ? "client_owner" : value.role;
  if (typeof role !== "string" || !PORTAL_ROLES.includes(role as PortalRole) || role === "agency") {
    throw new Error("Invalid role.");
  }
  return { workspaceId, email, role: role as PortalRole };
}

/** No request URL, Origin, Host or forwarded header may supply a bearer-link origin. */
export function resolveInviteOrigin(env: {
  PORTAL_BASE?: string; VERCEL_URL?: string; VERCEL_ENV?: string; NODE_ENV?: string;
}): string {
  // A preview must not inherit a production PORTAL_BASE and email a production link.
  const base = env.VERCEL_ENV === "preview"
    ? (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined)
    : (env.PORTAL_BASE || (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined));
  if (!base || base.length > 2048 || /\s/.test(base)) throw new Error("Invitation origin is not configured.");
  const url = new URL(base);
  const local = env.NODE_ENV !== "production" && (!env.VERCEL_ENV || env.VERCEL_ENV === "development")
    && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if ((url.protocol !== "https:" && !(local && url.protocol === "http:"))
    || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("Invitation origin must be a trusted HTTPS origin.");
  }
  return url.origin;
}
