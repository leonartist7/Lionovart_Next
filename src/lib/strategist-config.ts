import { Type } from "@google/genai";
import type { Tool } from "@google/genai";
import { SYSTEM_PROMPT as EN_PROMPT } from "./strategist-prompts/en";
import { SYSTEM_PROMPT as ES_PROMPT } from "./strategist-prompts/es";

/* ─── System Prompt ──────────────────────────────────────────── */

export type NovaLocale = "en" | "es" | "fr" | "it" | "ko";

export function getSystemPrompt(locale: NovaLocale): string {
  switch (locale) {
    case "es": return ES_PROMPT;
    case "en":
    default: return EN_PROMPT;
  }
}


/* ─── Function Tool Declarations ─────────────────────────────── */

export const STRATEGIST_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "update_screen_info",
        description:
          "Updates the visual lead form on the user's screen in real-time. Call IMMEDIATELY when you learn their name, phone, email, website, or business type. Each field updates independently — only pass the fields you just learned.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Lead's first name or full name" },
            phone: { type: Type.STRING, description: "Lead's phone number" },
            email: { type: Type.STRING, description: "Lead's email address" },
            website: { type: Type.STRING, description: "Lead's website URL" },
            business_type: { type: Type.STRING, description: "Short label like 'restaurant' or 'dental clinic'" },
          },
        },
      },
      {
        name: "confirm_field",
        description:
          "Marks a field as confirmed by the user. Call AFTER the user verbally confirms what's on screen. This collapses the field into a quiet 'filed away' pill so the UI stays clean.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            field: {
              type: Type.STRING,
              description: "Which field was confirmed: 'name', 'phone', 'email', 'website', or 'business_type'",
            },
          },
          required: ["field"],
        },
      },
      {
        name: "scrape_website",
        description:
          "Fetches the user's website URL in the background and returns a summary (title, description, services detected, key copy). Call the MOMENT they share a URL. Don't wait silently — bridge with a value bomb. The result arrives as a [SCRAPE_RESULT] context message.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            url: { type: Type.STRING, description: "The website URL the user provided" },
          },
          required: ["url"],
        },
      },
      {
        name: "lookup_site_info",
        description:
          "Look up LIONOVART knowledge silently before responding. Use for service details, niche framing, philosophy, FAQ reframes.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            kind: {
              type: Type.STRING,
              enum: ["service", "niche", "faq", "philosophy", "value_bomb", "call_offer"],
              description: "Category of information to retrieve.",
            },
            key: {
              type: Type.STRING,
              description: "Specific key within the kind — e.g. 'restaurant' for kind='niche', 'branding' for kind='service', 'pricing' for kind='faq'. Omit for philosophy / value_bomb / call_offer.",
            },
          },
          required: ["kind"],
        },
      },
      {
        name: "scroll_to_section",
        description:
          "Smoothly scrolls the LIONOVART page (visible behind/beside the panel) to a section. Use when the user asks about services, portfolio, process, etc. Available ids: hero, about, showcase, problems, services, portfolio, process, comparison, testimonials, faq.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            section_id: {
              type: Type.STRING,
              description: "The section id to scroll to.",
            },
          },
          required: ["section_id"],
        },
      },
      {
        name: "fetch_user_memory",
        description:
          "Fetches past conversation summaries from the CRM using their phone or email. Call IMMEDIATELY after a returning user shares contact info.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            contact: { type: Type.STRING, description: "Email address or phone number" },
          },
          required: ["contact"],
        },
      },
      {
        name: "save_lead_data",
        description:
          "Save the lead's full discovery profile to the CRM. Call once at handoff (Stage 7) before generating links.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Lead's full name or first name" },
            phone: { type: Type.STRING, description: "Lead's phone number" },
            email: { type: Type.STRING, description: "Lead's email address" },
            website: { type: Type.STRING, description: "Their website URL if shared" },
            business_type: { type: Type.STRING, description: "What kind of business they run" },
            niche: { type: Type.STRING, description: "Specific niche keyword like 'dentist', 'restaurant', 'saas'" },
            project_summary: {
              type: Type.STRING,
              description: "2-3 sentence summary of their project, business, and what they're building",
            },
            current_marketing: {
              type: Type.STRING,
              description: "What marketing they're doing today (ads, referrals, social, etc.)",
            },
            painpoints: {
              type: Type.STRING,
              description: "What they want to improve, in their own words",
            },
            vision: {
              type: Type.STRING,
              description: "What success looks like for them (their stated goal/vision)",
            },
            handoff_offered: {
              type: Type.BOOLEAN,
              description: "Pass true when calling at Stage 7 handoff — triggers the founder notification.",
            },
          },
          required: ["name", "project_summary"],
        },
      },
      {
        name: "generate_whatsapp_link",
        description:
          "Generate a WhatsApp deep link pre-filled with context from the conversation.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Lead's name" },
            project_summary: {
              type: Type.STRING,
              description: "Brief context to include in the message",
            },
          },
          required: ["name", "project_summary"],
        },
      },
      {
        name: "fetch_booking_link",
        description:
          "Get the Google Calendar appointment booking link for scheduling a 20-minute call with Leon.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "mark_stage",
        description:
          "Call at the START of each new conversation stage so progress can be tracked. Call immediately when entering a new stage — this is silent and does not disrupt the conversation.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            stage: {
              type: Type.STRING,
              enum: ["greeting", "identification", "name", "business", "marketing", "pain", "vision", "handoff"],
              description: "The stage being entered",
            },
          },
          required: ["stage"],
        },
      },
      {
        name: "show_handoff_cards",
        description:
          "Display WhatsApp and booking cards to transition the user to the human conversation with Leon. Call after save_lead_data, generate_whatsapp_link, fetch_booking_link.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            whatsapp_url: { type: Type.STRING, description: "The full WhatsApp deep link URL" },
            booking_url: { type: Type.STRING, description: "The Google Calendar booking URL" },
            summary_message: {
              type: Type.STRING,
              description: "A brief, warm closing message to display above the cards",
            },
          },
          required: ["whatsapp_url", "booking_url"],
        },
      },
    ],
  },
];

/* ─── Types shared across modules ───────────────────────────── */

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
}

export interface HandoffData {
  whatsappUrl: string;
  bookingUrl: string;
  summaryMessage?: string;
}

export type SessionState = "idle" | "listening" | "thinking" | "speaking" | "handoff";

export type LeadFieldKey = "name" | "phone" | "email" | "website" | "business_type";

export interface HistoryEntry {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export type StreamEventType =
  | "text"
  | "function_call"
  | "function_result"
  | "handoff"
  | "done"
  | "error";

export interface StreamEvent {
  type: StreamEventType;
  content?: string;
  name?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  whatsapp_url?: string;
  booking_url?: string;
  summary_message?: string;
  message?: string;
}
