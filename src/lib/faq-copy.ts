export type FAQCopyItem = {
  question: string;
  answer: string;
};

/**
 * Canonical English FAQ copy used by the homepage UI, quick-answer widget,
 * and FAQPage structured data. Keep this concise, human, and objection-led.
 */
export const FAQ_ITEMS_EN: FAQCopyItem[] = [
  {
    question: "What if I’m not sure what I need yet?",
    answer:
      "That’s normal. You don’t need a perfect brief — we start by finding what is actually holding the brand back, then focus on the work that will move it forward.",
  },
  {
    question: "What will this actually cost?",
    answer:
      "It depends on what the business genuinely needs. We understand the problem first, scope the right level of work, and give you a clear path before you decide to move forward.",
  },
  {
    question: "How soon will I see something real?",
    answer:
      "Early. You’ll see direction in the first two weeks, then the work builds from there — with clear progress instead of disappearing into a black box.",
  },
  {
    question: "Will I get passed to someone else after the call?",
    answer:
      "No hand-off maze. The people shaping the direction stay close to the work, so decisions stay faster and the brand stays consistent from strategy through execution.",
  },
  {
    question: "What happens after launch?",
    answer:
      "Launch is not the finish line. We look at what is working, what needs sharpening, and where the next opportunity is as the business grows.",
  },
];
