import "server-only";
import { GoogleGenAI, Type } from "@google/genai";
import { BRAND, buildPlatePrompt, type BrandTemplate } from "@/lib/portal/brand";
import { assetStoragePath, confirmUpload, newAssetId, writeServerObject } from "@/lib/portal/assets";
import { listProjects, nextMilestone } from "@/lib/portal/projects";
import { normalizeHashtags, isPlatform } from "@/lib/portal/platforms";
import type { Asset, Platform, PortalRole } from "@/lib/portal/types";

/**
 * Gemini wiring for Content — idea generation and on-brand image plates.
 *
 * Reuses the pattern `assistant-tools.ts` and `/api/strategist/chat` already
 * established: one `GoogleGenAI` client, the model from `GEMINI_MODEL`, and an
 * honest failure when `GEMINI_API_KEY` isn't set rather than a crash or a
 * fabricated result. Ideas are one-shot structured output rather than the
 * assistant's streaming tool loop — there is nothing to stream and nothing for
 * the model to call; the workspace context is gathered first and handed over.
 */

export type AiResult<T> = { ok: true; value: T } | { ok: false; error: string; status: number };

function client(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}

const TEXT_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";

/* ── Ideas ───────────────────────────────────────────────────────── */

export interface GeneratedIdea {
  caption: string;
  hashtags: string[];
  platforms: Platform[];
  rationale: string;
}

const IDEA_SYSTEM_PROMPT = `You write social content for LIONOVART, a creative studio, on behalf of one client.

Write the way the studio writes: direct, unhurried, never chirpy. Sentence case. No exclamation marks, no "Oops", no "Awesome", no emoji-stuffed openers. A caption states something true and specific — about the work, the craft, or the decision behind it — rather than posing a rhetorical question to bait replies.

Ground every idea in the workspace context you are given. If the context is thin, write fewer, broader ideas rather than inventing a project, a metric, a client name or a date that isn't there.

Keep captions inside the platform limits you are told about. Hashtags are lowercase-free camel case where it helps a screen reader (#BrandIdentity, not #brandidentity), and there are never more than eight.`;

const IDEA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ideas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          caption: { type: Type.STRING, description: "The post caption, ready to publish." },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          platforms: { type: Type.ARRAY, items: { type: Type.STRING } },
          rationale: { type: Type.STRING, description: "One sentence on why this is worth posting." },
        },
        required: ["caption", "hashtags", "platforms", "rationale"],
      },
    },
  },
  required: ["ideas"],
};

/** What the model is told about the workspace — real data, read with the caller's own role. */
async function workspaceContext(workspaceId: string, viewerRole: PortalRole): Promise<string> {
  const projects = await listProjects(workspaceId, viewerRole);
  if (projects.length === 0) return "No projects are set up in this workspace yet.";
  return projects
    .map((p) => {
      const next = nextMilestone(p.milestones)?.title;
      return `- ${p.name} (${p.kind}, ${p.status}, ${p.progress}% done)${next ? `, next: ${next}` : ""}`;
    })
    .join("\n");
}

export interface GenerateIdeasInput {
  workspaceId: string;
  workspaceName: string;
  viewerRole: PortalRole;
  platforms: Platform[];
  /** Optional steer — "the rebrand launch", "behind the scenes". */
  brief?: string;
  count: number;
}

export async function generateIdeas(input: GenerateIdeasInput): Promise<AiResult<GeneratedIdea[]>> {
  const ai = client();
  if (!ai) return { ok: false, error: "Idea generation isn't configured yet.", status: 503 };

  const context = await workspaceContext(input.workspaceId, input.viewerRole);
  const limits = input.platforms
    .map((p) => `${p}: hard limit on the composed caption plus hashtags`)
    .join("; ");

  const prompt = [
    `Client workspace: ${input.workspaceName}`,
    "",
    "What's happening in this workspace right now:",
    context,
    "",
    input.brief ? `The studio's steer for this batch: ${input.brief}` : "No particular steer — read the context.",
    "",
    `Write ${input.count} distinct post ideas for these platforms: ${input.platforms.join(", ")}.`,
    `Respect each platform's limits (${limits}). X is 280 characters including hashtags, so an idea aimed at X must be short.`,
    "Each idea names the platforms it suits — don't put a long-form caption on X.",
  ].join("\n");

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: IDEA_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: IDEA_SCHEMA,
      },
    });

    const parsed = JSON.parse(response.text ?? "{}") as { ideas?: unknown[] };
    const ideas = (parsed.ideas ?? []).flatMap((raw): GeneratedIdea[] => {
      const idea = raw as Partial<GeneratedIdea>;
      const caption = typeof idea.caption === "string" ? idea.caption.trim() : "";
      if (!caption) return [];
      const platforms = (Array.isArray(idea.platforms) ? idea.platforms : [])
        .map((p) => String(p).toLowerCase())
        .filter(isPlatform);
      return [{
        caption,
        hashtags: normalizeHashtags(Array.isArray(idea.hashtags) ? idea.hashtags.map(String) : []),
        platforms: platforms.length > 0 ? platforms : input.platforms,
        rationale: typeof idea.rationale === "string" ? idea.rationale : "",
      }];
    });

    if (ideas.length === 0) {
      return { ok: false, error: "Nothing usable came back — try again, or add a steer.", status: 502 };
    }
    return { ok: true, value: ideas };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Idea generation failed.",
      status: 502,
    };
  }
}

/* ── On-brand image plates ───────────────────────────────────────── */

export interface GeneratedPlate {
  asset: Asset;
  width: number;
  height: number;
}

/**
 * Generates a background plate and files it as a normal asset version, so it
 * appears in Files, can be attached to a post, and is validated for aspect
 * ratio like anything else — the dimensions are known here, which is the one
 * case where the aspect check is a real error rather than a warning.
 *
 * What comes back is a **plate**, not a finished graphic: see
 * `buildPlatePrompt` in `brand.ts` for why the model is told to render no text
 * at all, and `BrandOverlay` for the type that goes on top.
 */
export async function generateBrandPlate(
  workspaceId: string,
  input: { subject: string; template: BrandTemplate; actorUid: string },
): Promise<AiResult<GeneratedPlate>> {
  const ai = client();
  if (!ai) return { ok: false, error: "Image generation isn't configured yet.", status: 503 };

  let bytes: Buffer;
  let mime = "image/png";
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: buildPlatePrompt(input.subject, input.template),
      config: {
        imageConfig: {
          aspectRatio: aspectLabel(input.template),
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    const data = part?.inlineData?.data;
    if (!data) {
      return { ok: false, error: "The model returned no image.", status: 502 };
    }
    mime = part?.inlineData?.mimeType ?? "image/png";
    bytes = Buffer.from(data, "base64");
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Image generation failed.",
      status: 502,
    };
  }

  const assetId = newAssetId(workspaceId);
  const name = `${input.template.id}-${Date.now()}.png`;
  const path = assetStoragePath(workspaceId, assetId, 1, name);
  await writeServerObject(path, bytes, mime);

  const confirmed = await confirmUpload(workspaceId, {
    assetId,
    version: 1,
    storagePath: path,
    name,
    mime,
    sizeBytes: bytes.byteLength,
    uploadedBy: input.actorUid,
    note: `Generated plate — ${input.template.label}`,
    width: input.template.width,
    height: input.template.height,
  });
  if ("error" in confirmed) return { ok: false, error: confirmed.error, status: 500 };

  return {
    ok: true,
    value: { asset: confirmed.asset, width: input.template.width, height: input.template.height },
  };
}

/**
 * Gemini's image config takes a named ratio, not pixels. Mapping the templates
 * onto the ones it actually supports keeps the plate from being generated
 * square and then stretched.
 */
function aspectLabel(template: BrandTemplate): string {
  if (template.width === template.height) return "1:1";
  return template.height > template.width * 1.5 ? "9:16" : "4:5";
}

export { BRAND };
