// Adapted from codex/work-showcase (8029ad8): owner-approved order, archive marks and tags.
// Stable Cloudinary asset IDs retain the relationship with the full gallery.
export type GalleryWork = {
  slug: string; name: string; industry: string; styles: string[]; services: string[];
  assetId: string; poster: string; video?: string; fit: "cover" | "contain"; status: "client" | "concept";
};
export const GALLERY_WORK: readonly GalleryWork[] = [
  {
    "slug": "rakbank",
    "name": "Rakbank",
    "industry": "Finance",
    "styles": [
      "Elegant",
      "Minimal"
    ],
    "services": [
      "identity",
      "web-app-dev",
      "creative-content",
      "digital",
      "motion"
    ],
    "assetId": "f72c3aa1ad1254b2562c23329d4aea3b",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/w_800,c_limit,q_auto,f_auto/v1790330510/original-ca7d8db36054fe22faf618552f2f5514_iobfz9.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330510/original-ca7d8db36054fe22faf618552f2f5514_iobfz9.mp4",
    "fit": "cover",
    "status": "client"
  },
  {
    "slug": "blastup",
    "name": "Blastup",
    "industry": "Tech & SaaS",
    "styles": [
      "Bold & Playful"
    ],
    "services": [
      "identity",
      "web-app-dev",
      "digital",
      "motion",
      "creative-content"
    ],
    "assetId": "b96950ac149367a197a7a4cb47affc51",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/w_800,c_limit,q_auto,f_auto/v1790330514/original-decb2a241f75471d293be67df1f1ea57_reuk1v.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330514/original-decb2a241f75471d293be67df1f1ea57_reuk1v.mp4",
    "fit": "cover",
    "status": "client"
  },
  {
    "slug": "fundonion",
    "name": "FundOnion",
    "industry": "Finance",
    "styles": [
      "Editorial",
      "Elegant",
      "Minimal"
    ],
    "services": [
      "identity",
      "web-app-dev",
      "motion",
      "digital"
    ],
    "assetId": "3d5705fdc09cfb32cb2fa5e0506cf33e",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/w_800,c_limit,q_auto,f_auto/v1790330502/29b7dd2a4b2a65c7cd8d4ff86ccf734a_noxlkr.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330502/29b7dd2a4b2a65c7cd8d4ff86ccf734a_noxlkr.mp4",
    "fit": "cover",
    "status": "client"
  },
  {
    "slug": "rise",
    "name": "Rise",
    "industry": "Finance",
    "styles": [
      "High-tech",
      "Minimal"
    ],
    "services": [
      "identity",
      "web-app-dev",
      "motion",
      "ai-os",
      "digital"
    ],
    "assetId": "3c97e799520aa004a9856a348b33c51a",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/w_800,c_limit,q_auto,f_auto/v1790330504/c97fbabff45f0ce5d2324fb7051ccc47_so2jox.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330504/c97fbabff45f0ce5d2324fb7051ccc47_so2jox.mp4",
    "fit": "cover",
    "status": "client"
  },
  {
    "slug": "op",
    "name": "OP",
    "industry": "",
    "styles": [
      "High-tech"
    ],
    "services": [
      "identity",
      "digital",
      "motion",
      "web-app-dev",
      "creative-content"
    ],
    "assetId": "bd2d50c23add4a8ab0800ca3f2f1e1f1",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/w_800,c_limit,q_auto,f_auto/v1790330510/original-5805cd669da8ded7fadd3b8d9f2a4d12_osic3b.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330510/original-5805cd669da8ded7fadd3b8d9f2a4d12_osic3b.mp4",
    "fit": "cover",
    "status": "client"
  },
  {
    "slug": "clothing-fashion-hightech",
    "name": "Fashion high-tech",
    "industry": "Fashion & Apparel",
    "styles": [
      "High-tech"
    ],
    "services": [
      "digital",
      "web-app-dev",
      "motion"
    ],
    "assetId": "525ff30ee486c30d52d9a8683f5bcc59",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791381177/clothing_fashion_hightech_ok3ktp.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791381177/clothing_fashion_hightech_ok3ktp.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "stormlikes",
    "name": "Stormlikes",
    "industry": "Tech & SaaS",
    "styles": [
      "Bold & Playful"
    ],
    "services": [
      "identity",
      "digital",
      "creative-content",
      "web-app-dev",
      "motion"
    ],
    "assetId": "737299ba6c69546fffa074c589adaadd",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/w_800,c_limit,q_auto,f_auto/v1790330502/11729b6b5382e483f1dc7503f9874fb6_tp7bj8.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330502/11729b6b5382e483f1dc7503f9874fb6_tp7bj8.mp4",
    "fit": "cover",
    "status": "client"
  },
  {
    "slug": "coinly",
    "name": "Coinly",
    "industry": "Finance",
    "styles": [
      "Bold & Playful"
    ],
    "services": [
      "identity",
      "web-app-dev",
      "motion",
      "digital",
      "creative-content"
    ],
    "assetId": "2da0ae9c5d814fef5fad4b6f2dfdbabb",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/w_800,c_limit,q_auto,f_auto/v1790330507/original-46d0797d3a81c8cf5aee66e9b2bd14d3_o5jfgc.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330507/original-46d0797d3a81c8cf5aee66e9b2bd14d3_o5jfgc.mp4",
    "fit": "cover",
    "status": "client"
  },
  {
    "slug": "soda-bold",
    "name": "Soda",
    "industry": "Food & Beverage",
    "styles": [
      "Bold & Playful"
    ],
    "services": [
      "digital",
      "web-app-dev",
      "creative-content",
      "identity"
    ],
    "assetId": "378a3bf2cbb17043f513d7323cdc2093",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791381179/soda_bold_ziarjv.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791381179/soda_bold_ziarjv.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "home-interior",
    "name": "Home interior",
    "industry": "Home & Lifestyle",
    "styles": [
      "Editorial",
      "Minimal"
    ],
    "services": [
      "digital",
      "web-app-dev",
      "identity"
    ],
    "assetId": "d3fc131f317b932383e3a7748377d164",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791381177/Home_interior_uaysv1.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791381177/Home_interior_uaysv1.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "perfum-elegant",
    "name": "Perfume",
    "industry": "Beauty & Wellness",
    "styles": [
      "Elegant",
      "Organic & Calm"
    ],
    "services": [
      "web-app-dev",
      "creative-content"
    ],
    "assetId": "2514da5a57bb548d3525b270e2e1b676",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791400907/perfum_elegant_aikona.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791400907/perfum_elegant_aikona.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "home-architecture-realtor",
    "name": "Home architecture",
    "industry": "Real Estate",
    "styles": [
      "Elegant"
    ],
    "services": [
      "digital",
      "web-app-dev",
      "ai-os",
      "identity"
    ],
    "assetId": "5f0d32b5b05a8e62359ac9337ef8a822",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791381177/Home_architecture_realtor_tpscv7.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791381177/Home_architecture_realtor_tpscv7.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "architecture-contractor-editorial",
    "name": "Architecture contractor",
    "industry": "Construction & Trades",
    "styles": [
      "Editorial"
    ],
    "services": [
      "digital",
      "web-app-dev",
      "ai-os"
    ],
    "assetId": "89512a60cf966303f4ca31af31154561",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791381176/architecture_contractor_editorial_zxmrlm.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791381176/architecture_contractor_editorial_zxmrlm.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "travel-bold",
    "name": "Travel bold",
    "industry": "Hospitality & Travel",
    "styles": [
      "Bold & Playful"
    ],
    "services": [
      "digital",
      "web-app-dev",
      "identity"
    ],
    "assetId": "8aeb8ffcad4bf87e89aeeb814c431b61",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791381179/Travel_bold_kodtn5.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791381179/Travel_bold_kodtn5.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "lsi-asia-25",
    "name": "LSI Asia ’25",
    "industry": "Events & Culture",
    "styles": [
      "Editorial",
      "Elegant"
    ],
    "services": [
      "identity",
      "event-branding",
      "motion",
      "digital",
      "web-app-dev"
    ],
    "assetId": "1ee13a4f17929df5f1558561299289aa",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/w_800,c_limit,q_auto,f_auto/v1790330503/1605312c7cf23134a16fef58cf547fab_yg0pe4.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330503/1605312c7cf23134a16fef58cf547fab_yg0pe4.mp4",
    "fit": "cover",
    "status": "client"
  },
  {
    "slug": "ai-hightech",
    "name": "AI high-tech",
    "industry": "Tech & SaaS",
    "styles": [
      "High-tech"
    ],
    "services": [
      "web-app-dev",
      "motion"
    ],
    "assetId": "1dda2de040af52e1382cf38198a71f9d",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791381206/ai_hightech_b0pcvg.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791381206/ai_hightech_b0pcvg.mp4",
    "fit": "contain",
    "status": "concept"
  },
  {
    "slug": "ai-tech",
    "name": "AI technology",
    "industry": "Tech & SaaS",
    "styles": [
      "High-tech"
    ],
    "services": [
      "web-app-dev",
      "ai-os"
    ],
    "assetId": "2c9c8d1b27175dc38a028d3fc7c7dcbd",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791381178/ai_tech_n6u2lk.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791381178/ai_tech_n6u2lk.mp4",
    "fit": "contain",
    "status": "concept"
  },
  {
    "slug": "arhcitecutre-editorial-elegant",
    "name": "Architecture elegant",
    "industry": "Construction & Trades",
    "styles": [
      "Editorial",
      "Elegant"
    ],
    "services": [
      "web-app-dev",
      "creative-content",
      "ai-os"
    ],
    "assetId": "d7ffafd49e5e9ea5ceb6c2435681ab76",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791381177/arhcitecutre_editorial_elegant_nlg2ws.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791381177/arhcitecutre_editorial_elegant_nlg2ws.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "auto-concept-editorial",
    "name": "Automotive editorial",
    "industry": "Automotive",
    "styles": [
      "Editorial"
    ],
    "services": [
      "web-app-dev",
      "motion"
    ],
    "assetId": "730ee46e4e3553a6ea6af9a5be6b5b9b",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791400906/auto_concept_editorial_ckzi3o.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791400906/auto_concept_editorial_ckzi3o.mp4",
    "fit": "contain",
    "status": "concept"
  },
  {
    "slug": "coffee-bold-2",
    "name": "Coffee bold II",
    "industry": "Food & Beverage",
    "styles": [
      "Bold & Playful"
    ],
    "services": [
      "web-app-dev"
    ],
    "assetId": "a8980ff5216f246fcc1249b528eb9acf",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791400908/coffee_bold_2_nmhczz.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791400908/coffee_bold_2_nmhczz.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "coffee-bold",
    "name": "Coffee bold",
    "industry": "Food & Beverage",
    "styles": [
      "Bold & Playful"
    ],
    "services": [
      "web-app-dev",
      "ai-os",
      "motion"
    ],
    "assetId": "30989ad17a7c9054dcbf954da0661139",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791381177/coffee_bold_vse86b.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791381177/coffee_bold_vse86b.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "coffee-minimal",
    "name": "Coffee minimal",
    "industry": "Food & Beverage",
    "styles": [
      "Minimal"
    ],
    "services": [
      "digital",
      "web-app-dev"
    ],
    "assetId": "e3669b71060b6d7d4ad975dbf30f84de",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791381176/coffee_minimal_dbdqdu.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791381176/coffee_minimal_dbdqdu.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "coffeeshop-app-03",
    "name": "Coffee shop app",
    "industry": "Food & Beverage",
    "styles": [
      "Elegant",
      "Minimal"
    ],
    "services": [
      "web-app-dev"
    ],
    "assetId": "f496c1fc2068f7430ec31e1aef396a63",
    "poster": "https://res.cloudinary.com/dgio9uutc/image/upload/v1791400908/coffeeshop-app-03_cn1kmx.webp",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "ecommerce-components-cover-4x3",
    "name": "Ecommerce components",
    "industry": "Home & Lifestyle",
    "styles": [
      "Minimal"
    ],
    "services": [
      "digital",
      "web-app-dev"
    ],
    "assetId": "12ce22822f4f2aa87b20c89537840937",
    "poster": "https://res.cloudinary.com/dgio9uutc/image/upload/v1791400906/ecommerce-components-cover-4x3_tn5b6y.webp",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "editorial-architecture-designer-personal",
    "name": "Architecture designer",
    "industry": "Construction & Trades",
    "styles": [
      "Editorial"
    ],
    "services": [
      "web-app-dev",
      "identity"
    ],
    "assetId": "e76a83d62db7d083eb33fc71d47c4664",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791400909/editorial_architecture_designer-personal_lvwaop.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791400909/editorial_architecture_designer-personal_lvwaop.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "editorial-architecture-minimalist",
    "name": "Editorial architecture",
    "industry": "Construction & Trades",
    "styles": [
      "Editorial",
      "Minimal"
    ],
    "services": [
      "web-app-dev"
    ],
    "assetId": "c42002611d819a7b09cc965b6f91983c",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791400906/Editorial_architecture_minimalist_szvint.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791400906/Editorial_architecture_minimalist_szvint.mp4",
    "fit": "contain",
    "status": "concept"
  },
  {
    "slug": "energy-command-hitech",
    "name": "Energy command",
    "industry": "Tech & SaaS",
    "styles": [
      "High-tech"
    ],
    "services": [
      "web-app-dev",
      "ai-os"
    ],
    "assetId": "76c7ed5cbcf4e37a7cdafc34bd1f3fae",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791400905/energy-command-hitech_xo3ar7.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791400905/energy-command-hitech_xo3ar7.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "food-snack-bold",
    "name": "Food snack",
    "industry": "Food & Beverage",
    "styles": [
      "Bold & Playful"
    ],
    "services": [
      "web-app-dev",
      "creative-content"
    ],
    "assetId": "7c15647cfc4013eb790844595b6b8386",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791400905/food_snack_bold_pk2yax.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791400905/food_snack_bold_pk2yax.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "interactive-platform-3d-hightech",
    "name": "Interactive 3D platform",
    "industry": "Tech & SaaS",
    "styles": [
      "High-tech"
    ],
    "services": [
      "web-app-dev",
      "ai-os"
    ],
    "assetId": "36b8f63c2b4388e1e0504d6893f552ac",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791400905/interactive_platform_3D_hightech_h0lmfo.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791400905/interactive_platform_3D_hightech_h0lmfo.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "oma",
    "name": "OMa",
    "industry": "Food & Beverage",
    "styles": [
      "Bold & Playful"
    ],
    "services": [
      "identity",
      "creative-content",
      "web-app-dev",
      "ai-os"
    ],
    "assetId": "ac63dc318d5f1d5acc708250f180d08b",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/w_800,c_limit,q_auto,f_auto/v1790330500/2d78826612e7b0ba3c03ed58d66303db_fzcwuy.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330500/2d78826612e7b0ba3c03ed58d66303db_fzcwuy.mp4",
    "fit": "cover",
    "status": "client"
  },
  {
    "slug": "platform-smart",
    "name": "Smart platform",
    "industry": "Tech & SaaS",
    "styles": [
      "Minimal"
    ],
    "services": [
      "web-app-dev",
      "ai-os"
    ],
    "assetId": "9e8afb5c887bf4441da440813730abec",
    "poster": "https://res.cloudinary.com/dgio9uutc/image/upload/v1791381175/platform_smart_g0vlma.webp",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "platforms-storefront-hitech",
    "name": "Storefront platform",
    "industry": "Tech & SaaS",
    "styles": [
      "High-tech"
    ],
    "services": [
      "web-app-dev",
      "ai-os"
    ],
    "assetId": "74be9ab6c31869617e3fcf857953d35c",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791400905/platforms_storefront_hitech_ct0nfn.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791400905/platforms_storefront_hitech_ct0nfn.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "realtor-minimal",
    "name": "Realtor minimal",
    "industry": "Real Estate",
    "styles": [
      "Minimal"
    ],
    "services": [
      "web-app-dev",
      "motion"
    ],
    "assetId": "1959a9857cb02f04bba2080806cab5e5",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791381176/realtor_minimal_gfb5gf.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791381176/realtor_minimal_gfb5gf.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "tech-3d-platform",
    "name": "3D technology platform",
    "industry": "Tech & SaaS",
    "styles": [
      "High-tech"
    ],
    "services": [
      "web-app-dev",
      "ai-os",
      "motion"
    ],
    "assetId": "9930db3effc49ffb341b4c120ee3a6ed",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791400908/tech_3D_platform_csnbk1.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791400908/tech_3D_platform_csnbk1.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "tech-finance",
    "name": "Finance technology",
    "industry": "Finance",
    "styles": [
      "High-tech"
    ],
    "services": [
      "web-app-dev",
      "identity"
    ],
    "assetId": "50e72e245ad36bb1bb131d7869e4d40e",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791381257/tech_finance_liz8co.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791381257/tech_finance_liz8co.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "tech-minimal-2",
    "name": "Technology minimal II",
    "industry": "Tech & SaaS",
    "styles": [
      "Minimal"
    ],
    "services": [
      "web-app-dev"
    ],
    "assetId": "d7c425c1c00f4258b51835bfa1345002",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791381240/tech_minimal_2_nkwttl.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791381240/tech_minimal_2_nkwttl.mp4",
    "fit": "contain",
    "status": "concept"
  },
  {
    "slug": "tech-minimal",
    "name": "Technology minimal III",
    "industry": "Tech & SaaS",
    "styles": [
      "Minimal"
    ],
    "services": [
      "motion",
      "web-app-dev"
    ],
    "assetId": "f404fb1ea7b8cfb49e50028488ac62c4",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791381223/tech_minimal_l1qwi4.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791381223/tech_minimal_l1qwi4.mp4",
    "fit": "contain",
    "status": "concept"
  },
  {
    "slug": "transport-manager-platform-hitech",
    "name": "Transport manager",
    "industry": "Tech & SaaS",
    "styles": [
      "High-tech"
    ],
    "services": [
      "web-app-dev",
      "ai-os",
      "motion"
    ],
    "assetId": "91128ef565835287d86d0f7f57bb9d2a",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791400908/transport_manager_platform_hitech_nuc1gm.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791400908/transport_manager_platform_hitech_nuc1gm.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "travel-editorial",
    "name": "Travel editorial",
    "industry": "Hospitality & Travel",
    "styles": [
      "Editorial"
    ],
    "services": [
      "web-app-dev"
    ],
    "assetId": "cdfd3ba3fe97507f1b8ff4dc13ec7876",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791400907/travel_editorial_svklee.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791400907/travel_editorial_svklee.mp4",
    "fit": "contain",
    "status": "client"
  },
  {
    "slug": "vantra-facility-os-hitech",
    "name": "Vantra facility OS",
    "industry": "Tech & SaaS",
    "styles": [
      "High-tech"
    ],
    "services": [
      "ai-os",
      "web-app-dev"
    ],
    "assetId": "29bae784f5dc0c91821632ede982d145",
    "poster": "https://res.cloudinary.com/dgio9uutc/video/upload/q_auto/v1791400905/vantra-facility-os-hitech_bg4iwg.jpg",
    "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1200,c_limit,q_auto/v1791400905/vantra-facility-os-hitech_bg4iwg.mp4",
    "fit": "contain",
    "status": "client"
  }
];
export const GALLERY_SERVICE_LABELS: Record<string, string> = {
  identity: "Brand identity", "web-app-dev": "Web/App dev", "ai-os": "Smart OS",
  "creative-content": "Creative media", "event-branding": "Event design",
  digital: "Digital design", motion: "Motion", campaign: "Campaign",
};
