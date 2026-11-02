/** Provider bookmarks, not OAuth connections. Never store credentials here. */
export type ResourceProvider = "Google Drive" | "Figma" | "Notion" | "GitHub" | "Vercel";
export interface ResourceLinkInput {
  label: string;
  url: string;
  visibility: "shared" | "internal";
  provider: ResourceProvider;
}
export interface ResourceLink extends ResourceLinkInput { id: string; createdAt: string; }
export const MAX_RESOURCE_LINKS = 40;

export function validateResourceLink(input: unknown): ResourceLinkInput {
  if (!input || typeof input !== "object") throw new Error("Enter a resource name and URL.");
  const value = input as Record<string, unknown>;
  // eslint-disable-next-line no-control-regex
  if (typeof value.label !== "string" || !value.label.trim() || value.label.length > 80 || /[\r\n\u0000-\u001f]/.test(value.label)) {
    throw new Error("Use a resource name between 1 and 80 characters.");
  }
  if (value.visibility !== "shared" && value.visibility !== "internal") throw new Error("Choose who can see this resource.");
  // eslint-disable-next-line no-control-regex
  if (typeof value.url !== "string" || value.url.length > 2048 || /[\u0000-\u0020\u007f]/.test(value.url)) {
    throw new Error("Enter a valid HTTPS resource URL without spaces.");
  }
  let url: URL;
  try { url = new URL(value.url); } catch { throw new Error("Enter a valid HTTPS resource URL."); }
  if (url.protocol !== "https:" || url.username || url.password || url.port) throw new Error("Use HTTPS without credentials or a custom port.");
  const host = url.hostname;
  const provider: ResourceProvider | undefined =
    ["drive.google.com", "docs.google.com"].includes(host) ? "Google Drive" :
    ["figma.com", "www.figma.com"].includes(host) ? "Figma" :
    ["notion.so", "www.notion.so", "notion.site"].includes(host) || host.endsWith(".notion.site") ? "Notion" :
    host === "github.com" ? "GitHub" :
    host === "vercel.com" || host.endsWith(".vercel.app") ? "Vercel" : undefined;
  if (!provider) throw new Error("Use a Google Drive, Figma, Notion, GitHub, or Vercel resource URL.");
  const queryKeys = [...url.searchParams.keys()];
  if (queryKeys.some(key => /token|secret|password|signature|authorization|credential|api.?key|^key$|^code$|protection.?bypass|^_vercel_share$/i.test(key)) || /token|secret|password|credential/i.test(url.hash)) {
    throw new Error("Do not save credentials, access tokens, or protected-deployment bypass links.");
  }
  return { label: value.label.trim(), url: url.href, visibility: value.visibility, provider };
}

/** Fail closed for malformed records and unknown visibility values. */
export function visibleResourceLinks(records: unknown, isAgency: boolean): ResourceLink[] {
  if (!Array.isArray(records)) return [];
  return records.flatMap((raw): ResourceLink[] => {
    try {
      if (!raw || typeof raw.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(raw.id) || typeof raw.createdAt !== "string") return [];
      const link = validateResourceLink(raw);
      if (!isAgency && link.visibility !== "shared") return [];
      return [{ ...link, id: raw.id, createdAt: raw.createdAt }];
    } catch { return []; }
  }).slice(0, MAX_RESOURCE_LINKS);
}

export function isSameOriginWrite(request: Request): boolean {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin
    && request.headers.get("sec-fetch-site") !== "cross-site";
}

/** Bound actual streamed bytes, not just the caller-controlled Content-Length. */
export async function readResourceBody(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new Error("Send this request as JSON.");
  }
  if (!request.body) throw new Error("The request body is empty.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8192) { await reader.cancel(); throw new Error("The resource is too large."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new Error("The request contains invalid JSON."); }
}
