import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { PageBuilder } from "@/components/sections/PageBuilder";
import { sanityFetch } from "@/sanity/lib/live";
import { PAGE_QUERY } from "@/sanity/lib/queries";

export default async function Home() {
  const { data } = await sanityFetch({
    query: PAGE_QUERY,
    params: { slug: "/" },
  });

  return (
    <main className="bg-bg-dark min-h-screen">
      <Navbar />
      {/* Passing an empty array forces PageBuilder to use the complete static fallback layout */}
      <PageBuilder blocks={[]} />
      <Footer />
    </main>
  );
}
