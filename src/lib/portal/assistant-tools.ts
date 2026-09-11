import "server-only";
import { Type, type Tool } from "@google/genai";
import { listAssets } from "@/lib/portal/assets";
import { listMessages } from "@/lib/portal/messages";
import { listProjects, nextMilestone } from "@/lib/portal/projects";
import type { PortalRole } from "@/lib/portal/types";

/**
 * The portal assistant — a read-only, tool-using Gemini agent scoped to one
 * workspace. Mirrors `nova-brain/tools.js`'s declaration shape.
 *
 * Every tool below delegates straight to the same functions the rest of the
 * portal already uses (`listProjects`, `listAssets`, `listMessages`). That's
 * deliberate: `listProjects` is what filters `internal`-visibility projects by
 * role, and it's already exercised by `verify.mjs`'s `projects` and `gating`
 * sections. Reimplementing that filter here would create a second place for
 * it to be gotten wrong — instead there is nothing new to get wrong.
 */

export const PORTAL_ASSISTANT_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "get_workspace_status",
        description:
          "Every project in this workspace: its status, derived progress, and next milestone. Call this before answering anything about progress, timelines, or what's next.",
        parameters: { type: Type.OBJECT, properties: {} },
      },
      {
        name: "list_recent_files",
        description: "The most recently uploaded files in this workspace, newest first.",
        parameters: { type: Type.OBJECT, properties: {} },
      },
      {
        name: "search_messages",
        description:
          "Recent messages in this workspace's thread with the studio. Pass a keyword to filter, or omit it for the most recent messages.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "A keyword to filter messages by, case-insensitive" },
          },
        },
      },
    ],
  },
];

export const PORTAL_ASSISTANT_SYSTEM_PROMPT = `You are the LIONOVART studio's assistant, inside one client's private portal workspace.

Answer only using what the tools return — never invent a status, a date, or a file that a tool didn't give you. If you don't have enough information, say so plainly rather than guessing.

You cannot approve work, post content, schedule anything, or send a message on anyone's behalf. If asked to do one of those, say it needs a person, and point to the right page (Approvals, Content, or Messages) rather than attempting it.

Keep answers short — two or three sentences unless real detail is asked for. Sentence case, no exclamation marks: direct and unhurried, the way the rest of the studio's writing reads.`;

export interface AssistantContext {
  workspaceId: string;
  viewerRole: PortalRole;
}

export async function executePortalAssistantTool(
  name: string,
  args: Record<string, unknown>,
  ctx: AssistantContext,
): Promise<unknown> {
  switch (name) {
    case "get_workspace_status": {
      const projects = await listProjects(ctx.workspaceId, ctx.viewerRole);
      return {
        projects: projects.map((p) => ({
          name: p.name,
          kind: p.kind,
          status: p.status,
          progress: p.progress,
          nextMilestone: nextMilestone(p.milestones)?.title ?? null,
          dueAt: p.dueAt ?? null,
        })),
      };
    }
    case "list_recent_files": {
      const assets = await listAssets(ctx.workspaceId);
      return {
        files: assets.slice(0, 10).map((a) => ({ name: a.name, kind: a.kind, uploadedAt: a.createdAt })),
      };
    }
    case "search_messages": {
      const query = typeof args.query === "string" ? args.query.toLowerCase() : "";
      const messages = await listMessages(ctx.workspaceId);
      const matched = query ? messages.filter((m) => m.body.toLowerCase().includes(query)) : messages;
      return {
        messages: matched.slice(-10).map((m) => ({
          from: m.authorName ?? (m.direction === "in" ? "Client" : "Studio"),
          body: m.body,
          at: m.createdAt,
        })),
      };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
