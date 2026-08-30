/**
 * The Ladder — the single source of truth for every published number.
 *
 * Governed by MASTERPLAN.md §3. Every surface that shows an investment figure
 * reads from here: /pricing, the SignatureOffer homepage band, the offer band on
 * each /services/* page, the recommended tier on an audit result, and NOVA's
 * knowledge base. Never hardcode a number at a call site.
 *
 * Stripe Payment Links are created in the Stripe dashboard (MASTERPLAN §5.3 —
 * integrate, don't build a checkout) and pasted in below.
 */

export type TierId = "spark" | "roar" | "pride";

export interface Tier {
  id: TierId;
  name: string;
  /** CAD. For `pride` this is the monthly floor, not a one-time figure. */
  amount: number;
  cadence: "once" | "monthly";
  /** Whether the amount is a floor ("from $X") or the exact investment. */
  isFrom: boolean;
  timeline: string;
  /** Who this is for, in their words, not ours. */
  forWho: string;
  includes: string[];
  /** Retainer modules. Only `pride` has these; a partner picks at least two. */
  modules?: string[];
  /** 50% deposit link. `null` until Leon creates it in the Stripe dashboard. */
  depositLink: string | null;
}

export const TIERS: Record<TierId, Tier> = {
  spark: {
    id: "spark",
    name: "The Spark",
    amount: 750,
    cadence: "once",
    isFrom: false,
    timeline: "2 weeks",
    forWho: "You look amateur online and you need to look real, fast.",
    includes: [
      "Logo system and brand sheet",
      "Business card design",
      "3 social templates",
      "Google Business setup",
    ],
    depositLink: null, // TODO(leon): Stripe Payment Link, 50% of $750
  },
  roar: {
    id: "roar",
    name: "The Roar",
    amount: 2500,
    cadence: "once",
    isFrom: false,
    timeline: "4 weeks",
    forWho: "You are ready to be the obvious choice in your market.",
    includes: [
      "Everything in The Spark",
      "Full brand system and guidelines",
      "5-section conversion website",
      "Content starter kit (9 posts)",
    ],
    depositLink: null, // TODO(leon): Stripe Payment Link, 50% of $2,500
  },
  pride: {
    id: "pride",
    name: "The Pride",
    amount: 1200,
    cadence: "monthly",
    isFrom: true,
    timeline: "Ongoing, 3-month minimum",
    forWho: "You want it run for you.",
    includes: [
      "Pick two or more modules",
      "Scale up or down monthly",
      "Pause without starting over",
    ],
    modules: [
      "Content Engine",
      "NOVA (AI agent)",
      "Growth (SEO and ads)",
      "Design-on-call",
    ],
    depositLink: null, // TODO(leon): Stripe Payment Link, first month
  },
};

/** Render order wherever the ladder is shown as a set. */
export const TIER_ORDER: readonly TierId[] = ["spark", "roar", "pride"] as const;

export interface AddOn {
  id: string;
  name: string;
  amount: number;
  /** Recurring monthly amount on top of the one-time setup, when there is one. */
  monthly?: number;
}

/** Attaches to any tier. MASTERPLAN §3.3. */
export const ADD_ONS: readonly AddOn[] = [
  { id: "nova", name: "NOVA voice agent", amount: 900, monthly: 150 },
  { id: "film", name: "Brand film (60s)", amount: 1500 },
  { id: "print", name: "Print pack", amount: 400 },
  { id: "content-day", name: "Content day (photo and video capture)", amount: 800 },
  { id: "gbp", name: "Google Business optimization", amount: 350 },
] as const;

/**
 * The Founding Five — MASTERPLAN §3.4.
 *
 * The Roar at a founding rate for the first five Calgary partners. This is an
 * exchange, not a discount: copy states what the partner GIVES, never what is
 * taken off. `total` is the real cap, enforced by the Firestore counter at
 * `config/founding_five` (§4.3) — never a static claim in copy.
 */
export const FOUNDING_FIVE = {
  tierId: "roar" as const,
  amount: 1500,
  total: 5,
  /** What the partner gives. Lead with this. */
  exchange: [
    "Full case-study rights (photos, metrics, before and after)",
    "A filmed video testimonial",
    "Three warm introductions to other Calgary owners",
  ],
  depositLink: null as string | null, // TODO(leon): Stripe Payment Link, 50% of $1,500
} as const;

const CAD = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

/**
 * The only way an investment figure reaches the page.
 *
 * Brand rule (MASTERPLAN §1.1): the numbers are always shown, but the word
 * "price" never appears. Callers label these as "Investment".
 */
export function formatInvestment(tier: Pick<Tier, "amount" | "cadence" | "isFrom">): string {
  const base = CAD.format(tier.amount);
  const withCadence = tier.cadence === "monthly" ? `${base} / month` : base;
  return tier.isFrom ? `from ${withCadence}` : withCadence;
}

/**
 * Half up-front, per the sprint model — one-time tiers only.
 *
 * Returns null for a monthly retainer: half of a recurring figure is not a
 * deposit, and rendering it as one would put a wrong number on the page.
 */
export function depositAmount(tier: Pick<Tier, "amount" | "cadence">): number | null {
  return tier.cadence === "monthly" ? null : Math.round(tier.amount / 2);
}
