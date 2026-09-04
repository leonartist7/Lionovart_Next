import type { Metadata } from "next";
import Home from "../page";

export const metadata: Metadata = {
  title: "Grenoble Founders Offer",
  description:
    "A complimentary Brand & Growth Blueprint for ambitious Grenoble founders.",
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

export default Home;
