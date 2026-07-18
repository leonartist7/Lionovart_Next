import { Type, Behavior } from "@google/genai";
import type { Tool } from "@google/genai";
import { SYSTEM_PROMPT as EN_PROMPT } from "./strategist-prompts/en";
import { SYSTEM_PROMPT as ES_PROMPT } from "./strategist-prompts/es";
import { SYSTEM_PROMPT as FR_PROMPT } from "./strategist-prompts/fr";
import { SYSTEM_PROMPT as IT_PROMPT } from "./strategist-prompts/it";
import { SYSTEM_PROMPT as KO_PROMPT } from "./strategist-prompts/ko";

/* ─── System Prompt ──────────────────────────────────────────── */

export type NovaLocale = "en" | "es" | "fr" | "it" | "ko";

export function getSystemPrompt(locale: NovaLocale): string {
  switch (locale) {
    case "es": return ES_PROMPT;
    case "fr": return FR_PROMPT;
    case "it": return IT_PROMPT;
    case "ko": return KO_PROMPT;
    case "en":
    default: return EN_PROMPT;
  }
}


/* ─── Function Tool Declarations ─────────────────────────────── */

export const STRATEGIST_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "load_skill",
        description:
          "Load a deep playbook (skill) before responding in its territory — objection handling, LIONOVART FAQs, booking flow, lead qualification. Silent and instant. Call it the moment the conversation enters a skill's territory, absorb the returned instructions, then respond. Once loaded, a skill stays with you for the session.",
        // Runs while you keep speaking — never wait for it in silence.
        behavior: Behavior.NON_BLOCKING,
        parameters: {
          type: Type.OBJECT,
          properties: {
            skill_id: {
              type: Type.STRING,
              enum: ["objections", "faq", "scheduling", "qualification"],
              description: "The skill to load",
            },
          },
          required: ["skill_id"],
        },
      },
      {
        name: "flag_objection",
        description:
          "Silently records which objection type you're handling. Call it the moment you recognize the objection, right after load_skill('objections') resolves — before or while you respond. Silent, does not affect the conversation.",
        behavior: Behavior.NON_BLOCKING,
        parameters: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              enum: [
                "price",
                "needs-time",
                "has-agency",
                "diy",
                "no-time",
                "ai-trust",
                "past-failure",
                "send-info",
                "too-small",
              ],
              description: "Which objection pattern this matches",
            },
          },
          required: ["type"],
        },
      },
      {
        name: "enrich_business",
        description:
          "Looks up a business's public Google Business Profile data (rating, review count, category) silently in the background. Call once you know their business name and, if mentioned, their city — right after or alongside scrape_website. Never announce the lookup; weave one specific detail naturally into the conversation later if useful, never recite it as a stat.",
        behavior: Behavior.NON_BLOCKING,
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The business name" },
            city: { type: Type.STRING, description: "City, if mentioned — improves match accuracy" },
          },
          required: ["name"],
        },
      },
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
        // Persisted silently in the background — never stalls speech waiting for the write to finish.
        behavior: Behavior.NON_BLOCKING,
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
          "Get the booking page link for scheduling a call with Leon. Use this when check_availability isn't available (returns available:false) — the link-handoff fallback.",
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: "check_availability",
        description:
          "Checks real calendar availability for the next 7 days. Returns { available: false } when real-time booking isn't set up — in that case, silently fall back to fetch_booking_link + the link handoff, never mention it failed. When available, returns up to 3 slots as { start (ISO), label (human-readable) } — offer at most 3 aloud.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            timezone: {
              type: Type.STRING,
              description: "IANA timezone if the user mentioned one (e.g. 'America/Edmonton'). Omit if unknown — never ask for it explicitly, infer or omit.",
            },
          },
        },
      },
      {
        name: "book_meeting",
        description:
          "Books a real calendar slot returned by check_availability. Call once the user picks a time and you have their name + email. Confirm aloud once it returns booked:true, then call show_handoff_cards with booking_confirmed:true.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            start: { type: Type.STRING, description: "The exact ISO start time from a check_availability slot" },
            name: { type: Type.STRING, description: "Lead's name" },
            email: { type: Type.STRING, description: "Lead's email — required by the booking system" },
            phone: { type: Type.STRING, description: "Lead's phone, if known" },
            notes: { type: Type.STRING, description: "One-line context for Leon ahead of the call" },
            timezone: { type: Type.STRING, description: "IANA timezone, if known" },
          },
          required: ["start", "name", "email"],
        },
      },
      {
        name: "send_follow_up_email",
        description:
          "Sends a follow-up email recap to the lead. ONLY call this after the user has explicitly said yes to receiving an email in this conversation — never as a silent default. Never call twice in one session.",
        // Fire-and-forget — never stalls speech waiting for Resend.
        behavior: Behavior.NON_BLOCKING,
        parameters: {
          type: Type.OBJECT,
          properties: {
            email: { type: Type.STRING, description: "Lead's email address" },
            name: { type: Type.STRING, description: "Lead's name" },
            summary: { type: Type.STRING, description: "2-3 sentence recap of what was discussed, in your own words" },
          },
          required: ["email", "name", "summary"],
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
          "Display WhatsApp and booking cards to transition the user to the human conversation with Leon. Call after save_lead_data, generate_whatsapp_link, and either fetch_booking_link (link mode) or book_meeting (real booking, calcom mode).",
        parameters: {
          type: Type.OBJECT,
          properties: {
            whatsapp_url: { type: Type.STRING, description: "The full WhatsApp deep link URL" },
            booking_url: { type: Type.STRING, description: "The booking page URL (link mode), or the confirmed booking's view link (calcom mode, from book_meeting's manage_url)" },
            summary_message: {
              type: Type.STRING,
              description: "A brief, warm closing message to display above the cards",
            },
            booking_confirmed: {
              type: Type.BOOLEAN,
              description: "Pass true only when book_meeting already succeeded — the card shows a confirmed state instead of a schedule button.",
            },
            booking_time_label: {
              type: Type.STRING,
              description: "Human-readable confirmed time, e.g. 'Tuesday, July 21 at 2:00 PM' — required when booking_confirmed is true.",
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
  bookingConfirmed?: boolean;
  bookingTimeLabel?: string;
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
