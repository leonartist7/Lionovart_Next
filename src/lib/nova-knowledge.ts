/**
 * NOVA's source-of-truth knowledge.
 *
 * Single export consumed in two places:
 *   1. `strategist-config.ts` injects a compact summary into the system prompt
 *   2. `/api/strategist/tool` resolves `lookup_site_info` queries against this object
 *
 * Update this file (not the prompt) when LIONOVART's offering changes.
 */

export const NOVA_KNOWLEDGE = {
  founder: {
    name: "Leonardo",
    nickname: "Leon",
    short:
      "Leonardo (Leon) leads LIONOVART personally — he's a creative director and brand strategist who founded the studio because he was tired of agencies treating clients like invoices.",
    credibility:
      "Hands-on with every partner, designs alongside the team, takes the strategy calls himself.",
  },

  brand: {
    name: "LIONOVART",
    tagline: "Brands that command attention and trust.",
    positioning:
      "A premium creative agency for founders and growing brands who want their visual story to match the value they actually deliver.",
    base: "Calgary, Canada — working with partners across North America.",
  },

  philosophy: {
    modular_subscriptions:
      "We work in modular subscriptions instead of one-off invoices — like Netflix or Spotify, but for the parts of growth that matter most for where you are right now. You can scale up, scale down, or pause without starting over.",
    partnership_model:
      "We don't take clients — we take partners. Once you're in, we're in. That means the same team, same Slack, same voice notes, same Leon every month.",
    limited_capacity:
      "We work with a limited number of partners at a time — quality over volume. We'd rather do five things brilliantly than fifty things half-asleep.",
    communication_first:
      "You get a private partner portal with voice messages and quick async chat. Most updates happen in under 24 hours. We're business owners ourselves — we know time equals money.",
    premium_accessible:
      "Premium results without premium gatekeeping. We don't outsource to other countries, but we also don't price ourselves out of reach for serious founders. The structure flexes for your stage.",
    investment_not_price:
      "We talk in investment, never price. The shape depends on your stage, your goal, and what unlocks the highest-leverage move first. That's what the call with Leon is for.",
  },

  /** Lifted from src/lib/i18n/locales/en.ts — keep in sync. */
  services: [
    {
      id: "branding",
      title: "Brand Identity & Strategy",
      summary:
        "Identity systems that command instant authority across every touchpoint — turning recognition into revenue.",
      deliverables: [
        "Logo System",
        "Brand Guidelines",
        "Typography & Color",
        "Brand Voice",
        "Sonic Identity",
      ],
    },
    {
      id: "web",
      title: "Web & App Development",
      summary:
        "Fast, conversion-focused sites and apps that turn visitors into booked calls. Measurable from day one.",
      deliverables: [
        "UI/UX Design",
        "Web Development",
        "Web & Mobile Apps",
        "CMS Integration",
        "E-Commerce",
        "SEO Setup",
      ],
    },
    {
      id: "video",
      title: "Video Production",
      summary:
        "Brand films, reels, and social content that stop the scroll and make a business impossible to ignore.",
      deliverables: [
        "Brand Films",
        "Social Reels",
        "Product Videos",
        "Motion Design",
        "Sound Design & Custom Music",
      ],
    },
    {
      id: "social",
      title: "Social Media & Content",
      summary:
        "End-to-end social — strategy, creative, copy, calendar — so the brand stays top of mind every month.",
      deliverables: [
        "Content Strategy",
        "Creative Direction",
        "Copywriting",
        "Monthly Calendar",
      ],
    },
    {
      id: "print",
      title: "Print & Physical Branding",
      summary:
        "Print, packaging, and physical brand experiences that make a company impossible to overlook in the real world.",
      deliverables: [
        "Business Cards & Stationery",
        "Packaging Design",
        "Commercial Printing",
        "Apparel Design",
        "Signage & Display",
        "Event Branding",
      ],
    },
    {
      id: "smart-systems",
      title: "Smart Systems & AI",
      summary:
        "AI voice agents, lead automation, and smart workflows that keep the business running 24/7 — without adding headcount.",
      deliverables: [
        "AI Voice Agents",
        "Virtual Receptionists",
        "Lead Automation",
        "AI Chatbots",
        "Workflow Integration",
        "CRM & Email Automation",
      ],
    },
    {
      id: "growth",
      title: "Growth Marketing",
      summary:
        "SEO, local search, paid ads, and strategic consulting that bring buyers in when they're already searching.",
      deliverables: [
        "SEO & AEO Optimization",
        "Google Business Management",
        "Local Search Domination",
        "Paid Ads & Google Ads",
        "Business Consulting",
        "Analytics & Reporting",
      ],
    },
  ],

  /**
   * Quick niche-specific framing Nova can drop after a user names their business.
   * Keys are lowercase niche words; matching is `niche.includes(key)`.
   */
  niche_insights: {
    restaurant:
      "Most restaurants we work with don't have a traffic problem — they have a 'first impression online' problem. The Google profile, the photos, the menu PDF that nobody can read on a phone. Tighten that and bookings climb without a single new ad.",
    cafe:
      "Cafés live or die on Google Maps and Instagram saves. The brands that win build a visual signature you can spot in someone else's reel — that's the multiplier.",
    dentist:
      "In dentistry, trust is the whole product. Most clinics we partner with had great work but a website that looked like the year they opened. Refreshing the brand and the patient journey usually moves the needle on new bookings within 60 days.",
    clinic:
      "Health and wellness clinics tend to undersell themselves online. The clinics that grow fastest are usually the ones that finally let their brand match the quality of care they actually give.",
    contractor:
      "Construction and trades — the biggest unlock is almost always Google reviews + a portfolio site that looks as solid as the builds. People hire who they trust to show up; the brand has to say that before you do.",
    construction:
      "Construction and trades — the biggest unlock is almost always Google reviews + a portfolio site that looks as solid as the builds. People hire who they trust to show up; the brand has to say that before you do.",
    realtor:
      "Real estate is one of the fastest niches to differentiate with brand — most agents look identical. A sharp visual identity + consistent reels usually doubles inbound within a quarter for the agents we work with.",
    coach:
      "Coaches and consultants — the lever is almost always positioning before traffic. The ones who 10x usually didn't get more leads, they got the right leads by sharpening who they were for.",
    ecommerce:
      "E-commerce is brand-led right now. The stores winning aren't the cheapest — they're the ones with a story, a packaging unboxing moment, and a paid funnel that actually converts. All three need to talk to each other.",
    saas:
      "SaaS founders we work with usually have great product, weak landing. The site is the salesperson when you're not in the room — most of the lift comes from sharpening the hero section and the proof.",
    luxury:
      "Luxury is allergic to noise. Less, but better — every touchpoint, every photo, every word. The brands that own the top of the market usually do less marketing, just at a much higher craft level.",
    startup:
      "Pre-launch and early-stage startups — branding before traffic, every time. Nothing kills a launch faster than great product wrapped in a brand that looks like everyone else.",
    agency:
      "Other agencies — we love working alongside, not over. We white-label brand and web for several agencies who'd rather hand off the craft and stay focused on their lane.",
    personal_brand:
      "Personal brands — the work is finding the one signature that's actually you, not a template. Once you've got that, everything else compounds: posts, partnerships, press.",
  } as Record<string, string>,

  /**
   * Short, droppable facts NOVA can use as bridges while a tool runs in background
   * (e.g., scrape_website is fetching). 5–10 second moments of value.
   */
  value_bombs: [
    "Quick thing while that loads — most founders we work with see their biggest growth not from more leads, but from sharpening who they're actually for. Positioning multiplies everything downstream.",
    "Fun fact — the brands that grow fastest aren't the loudest, they're the most consistent. Same colors, same voice, same energy across every touchpoint. That repetition is what builds trust.",
    "While that comes through — one of the biggest unlocks for the partners we work with is usually the gap between how good their work actually is and how it shows up online. Closing that gap is half the game.",
    "Quick one — most websites lose 80% of visitors in the first 3 seconds. Not because the design's bad, but because the message doesn't tell them they're in the right place. Hero section is everything.",
    "Side note — Google rewards consistency wildly. The businesses that show up first for their niche aren't always the biggest, they're the ones that update, post, and engage every week without fail.",
  ],

  /** Common questions Nova hears, with the on-brand reframe. Used by lookup_site_info("faq:..."). */
  faq: [
    {
      q: "How much does this cost?",
      a: "We talk in investment, not price — the shape really depends on your stage and what we focus on first. Some partners start with a Google Business refresh that's a few hundred a month; others come in for full brand + web + content and it's a different conversation. That's exactly what the call with Leon is for — to map what's actually worth spending on first.",
    },
    {
      q: "How long does it take?",
      a: "It depends on the scope, but the modular subscriptions mean you start seeing movement in the first 30 days — not 'wait six months for the big reveal.' Leon will give you a real timeline on the call, grounded in your specific situation.",
    },
    {
      q: "Do you work with my niche?",
      a: "Probably yes — we work across founders, professional services, ecommerce, hospitality, real estate, and personal brands. The common thread is that you care about your brand looking and feeling premium. If that's you, we'll know within the first call if we're the right fit.",
    },
    {
      q: "Are you the cheapest option?",
      a: "Honestly no — we're not. We're also not the most expensive. We're built for founders who'd rather pay the right amount for the right team than save 20% and start over a year later. That's the partnership lens.",
    },
    {
      q: "Can I just hire a freelancer?",
      a: "You absolutely can — and for some things, a freelancer is the right call. The reason our partners work with us instead is that brand, web, content, and growth all have to talk to each other. One brain coordinating all of it is what compounds — five disconnected freelancers usually don't.",
    },
    {
      q: "Do you outsource overseas?",
      a: "No — everything is built in-house in Calgary. That's part of why we cap how many partners we take at once. You'll always know who's actually doing your work.",
    },
    {
      q: "What if I'm not ready yet?",
      a: "That's totally fine — there's no pressure here. The 20-minute call is genuinely just a conversation. Plenty of partners book it months before they're ready, just to map what their next move should be.",
    },
  ],

  call_offer: {
    duration_min: 20,
    framing: "free, no-obligation growth-map call",
    description:
      "20 minutes with Leon. He'll listen, ask sharp questions, and give you a clear take on the highest-leverage move for where you are. No pitch deck, no pressure.",
    cta_phrasing: [
      "Want me to set you up with a quick 20-minute growth-map call with Leon? No pressure, no pitch — just a clear take.",
      "Want me to lock in a free 20-minute call with Leon so you can talk this through directly?",
      "I'd love to set you up with Leon for a 20-minute growth-map session. Free, no obligation. Want me to get that on the calendar?",
    ],
  },

  /** Section IDs Nova can scroll the user to via scroll_to_section tool. */
  page_sections: [
    { id: "hero", label: "the hero / intro" },
    { id: "about", label: "about us" },
    { id: "showcase", label: "the showcase reel" },
    { id: "problems", label: "the problems we solve" },
    { id: "services", label: "services" },
    { id: "portfolio", label: "portfolio / our work" },
    { id: "process", label: "our process" },
    { id: "comparison", label: "us vs other agencies" },
    { id: "testimonials", label: "testimonials" },
    { id: "faq", label: "frequently asked questions" },
  ],
} as const;

export type NovaKnowledge = typeof NOVA_KNOWLEDGE;
export type NovaSectionId = (typeof NOVA_KNOWLEDGE.page_sections)[number]["id"];

/**
 * Compact summary embedded in the system prompt. Keep tight — the full data
 * is reachable via lookup_site_info on demand.
 */
export function getKnowledgeSummaryForPrompt(): string {
  const services = NOVA_KNOWLEDGE.services
    .map((s) => `- ${s.title}: ${s.summary}`)
    .join("\n");

  const philosophy = Object.values(NOVA_KNOWLEDGE.philosophy)
    .map((p) => `- ${p}`)
    .join("\n");

  return [
    `BRAND: ${NOVA_KNOWLEDGE.brand.name} — ${NOVA_KNOWLEDGE.brand.positioning}`,
    `BASE: ${NOVA_KNOWLEDGE.brand.base}`,
    `FOUNDER: ${NOVA_KNOWLEDGE.founder.short}`,
    "",
    "PHILOSOPHY (weave naturally, never recite):",
    philosophy,
    "",
    "SERVICES (high level — use lookup_site_info for deeper detail):",
    services,
    "",
    `CALL OFFER: ${NOVA_KNOWLEDGE.call_offer.description}`,
  ].join("\n");
}
