export type WorkProject = {
  id: string;
  name: string;
  discipline: "identityDigital" | "identityIllustration" | "identityCampaign";
  poster: string;
  color: string;
  industry: "Finance" | "Social media";
  style: "Editorial" | "Illustrative";
  video?: string;
};

// Add the final 16:9 film URL to `video`. Posters remain the loading/error fallback.
export const WORK_PROJECTS: readonly WorkProject[] = [
  { id: "fundonion", industry: "Finance", style: "Editorial", name: "FundOnion", discipline: "identityDigital", poster: "/images/selected-work/fundonion.png", color: "#183d32" },
  { id: "stormlikes", industry: "Social media", style: "Illustrative", name: "Stormlikes", discipline: "identityIllustration", poster: "/images/selected-work/stormlikes.png", color: "#41215e" },
  { id: "coinly", industry: "Finance", style: "Illustrative", name: "Coinly", discipline: "identityIllustration", poster: "/images/selected-work/coinly.png", color: "#703d1e" },
  { id: "rakbank", industry: "Finance", style: "Editorial", name: "Rakbank", discipline: "identityCampaign", poster: "/images/selected-work/rakbank.png", color: "#652d2c" },
];
