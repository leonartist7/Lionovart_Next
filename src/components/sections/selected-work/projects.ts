import { collectionWork } from "../../work/cloudinaryCollection";

export type WorkProject = {
  id: string;
  name: string;
  discipline: "identityDigital" | "identityIllustration" | "identityCampaign";
  poster: string;
  color: string;
  video?: string;
};

// Match the compact homepage selection to the user-supplied Cloudinary films.
const film = (id: string) => collectionWork.find(entry => entry.slug === id)?.video;
export const WORK_PROJECTS: readonly WorkProject[] = [
  { id: "fundonion", name: "FundOnion", discipline: "identityDigital", poster: "/images/selected-work/fundonion.png", color: "#183d32", video: film("fundonion") },
  { id: "stormlikes", name: "Stormlikes", discipline: "identityIllustration", poster: "/images/selected-work/stormlikes.png", color: "#41215e", video: film("stormlikes") },
  { id: "coinly", name: "Coinly", discipline: "identityIllustration", poster: "/images/selected-work/coinly.png", color: "#703d1e", video: film("coinly") },
  { id: "rakbank", name: "Rakbank", discipline: "identityCampaign", poster: "/images/selected-work/rakbank.png", color: "#652d2c", video: film("rakbank") },
];
