export type FAQCopyItem = {
  question: string;
  answer: string;
};

/**
 * Canonical English FAQ copy used by the homepage UI, quick-answer widget,
 * and FAQPage structured data. These should read like real buying questions,
 * not marketing headings.
 */
export const FAQ_ITEMS_EN: FAQCopyItem[] = [
  {
    question: "What if I know something needs to change, but I’m not sure what?",
    answer:
      "That’s enough to start. We look at what’s costing you trust, attention or time, then decide what deserves fixing first. You won’t be sold a package just because it exists.",
  },
  {
    question: "What does working with LIONOVART actually cost?",
    answer:
      "It depends on what has to change. A focused identity project and a full brand, web and content system are different jobs. We define the scope first, then give you a clear price before anything starts.",
  },
  {
    question: "How quickly will I see something real?",
    answer:
      "Usually within the first two weeks. You’ll see direction, decisions and work in progress early — not a long silent phase followed by a surprise reveal.",
  },
  {
    question: "Who am I actually working with?",
    answer:
      "You stay close to the people making the work. Strategy, creative direction and execution don’t disappear through layers of account management.",
  },
  {
    question: "What happens once we launch?",
    answer:
      "If the brand needs to keep moving, we stay with it. We can refine what’s live, keep content flowing, improve the system and handle the next thing as the business grows.",
  },
];
