import inventory from './collection-assets.json';
import type { Work } from './work-data';

// Owner-approved filename guidance; statuses can be changed per entry later.
// Tuple: public ID, accessible name, industry, style IDs, service IDs.
const assignments: Array<[string, string, string, string[], string[]]> = [
  ['AXIOM_branding_tech_myrxwc','AXIOM','technology',['high-tech','minimal'],['identity']],
  ['Ecommerce_audio_elegant_lxtupy','Audio ecommerce','home-lifestyle',['elegant'],['digital','web-dev']],
  ['Editorial_architecture_minimalist_szvint','Editorial architecture','construction-trades',['editorial','minimal'],['digital','web-dev']],
  ['FORGE_branding_editorial_pr4gjp','FORGE','construction-trades',['editorial'],['identity']],
  ['Home_architecture_realtor_tpscv7','Home architecture','real-estate',['elegant'],['digital','web-dev']],
  ['Home_interior_uaysv1','Home interior','home-lifestyle',['editorial','minimal'],['digital','web-dev']],
  ['LOOM_branding_elegant_ssp3aw','LOOM','fashion',['elegant'],['identity']],
  ['Travel_bold_kodtn5','Travel bold','hospitality',['bold-playful'],['digital','web-dev']],
  ['ai_hightech_b0pcvg','AI high-tech','technology',['high-tech'],['digital','web-dev']],
  ['ai_tech_n6u2lk','AI technology','technology',['high-tech'],['digital','web-dev']],
  ['architecture_contractor_editorial_zxmrlm','Architecture contractor','construction-trades',['editorial'],['digital','web-dev']],
  ['arhcitecutre_editorial_elegant_nlg2ws','Architecture elegant','construction-trades',['editorial','elegant'],['digital','web-dev']],
  ['auto_concept_editorial_ckzi3o','Automotive editorial','automotive',['editorial'],['digital','web-dev']],
  ['clothing_fashion_hightech_ok3ktp','Fashion high-tech','fashion',['high-tech'],['digital','web-dev']],
  ['coffee_bold_2_nmhczz','Coffee bold II','food-beverage',['bold-playful'],['digital','web-dev']],
  ['coffee_bold_vse86b','Coffee bold','food-beverage',['bold-playful'],['digital','web-dev']],
  ['coffee_minimal_dbdqdu','Coffee minimal','food-beverage',['minimal'],['digital','web-dev']],
  ['coffeeshop-app-03_cn1kmx','Coffee shop app','food-beverage',['elegant','minimal'],['digital','app-dev']],
  ['cover-4x3-fill-w800_kn3rmn','CALIBER','fashion',['elegant'],['identity']],
  ['ecommerce-components-cover-4x3_tn5b6y','Ecommerce components','home-lifestyle',['minimal'],['digital','web-dev']],
  ['editorial_architecture_designer-personal_lvwaop','Architecture designer','construction-trades',['editorial'],['digital','web-dev']],
  ['eiffel-tower-assembly-tech-architecture_gjbiad','Eiffel Tower assembly','construction-trades',['high-tech'],['digital','web-dev']],
  ['energy-command-hitech_xo3ar7','Energy command','technology',['high-tech'],['digital','web-dev']],
  ['food_snack_bold_pk2yax','Food snack','food-beverage',['bold-playful'],['digital','web-dev']],
  ['interactive_platform_3D_hightech_h0lmfo','Interactive 3D platform','technology',['high-tech'],['digital','web-dev']],
  ['lumo-card-20260927_fzvonv','Lumo','food-beverage',['bold-playful'],['digital','web-dev']],
  ['nestora-app-cover-v3-w800_yvzdak','Nestora app','real-estate',['elegant','minimal'],['digital','app-dev']],
  ['perfum_elegant_aikona','Perfume','wellness',['elegant','organic-calm'],['digital','web-dev']],
  ['personal_tzovov','Personal AI','technology',['high-tech'],['digital','web-dev']],
  ['platform_smart_g0vlma','Smart platform','technology',['minimal'],['digital','web-dev']],
  ['platforms_storefront_hitech_ct0nfn','Storefront platform','technology',['high-tech'],['digital','web-dev']],
  ['realtor_minimal_gfb5gf','Realtor minimal','real-estate',['minimal'],['digital','web-dev']],
  ['soda_bold_ziarjv','Soda','food-beverage',['bold-playful'],['digital','web-dev']],
  ['tech_3D_platform_csnbk1','3D technology platform','technology',['high-tech'],['digital','web-dev']],
  ['tech_bhwzmn','Technology minimal','technology',['minimal'],['digital','web-dev']],
  ['tech_finance_liz8co','Finance technology','finance',['high-tech'],['digital','web-dev']],
  ['tech_minimal_2_nkwttl','Technology minimal II','technology',['minimal'],['digital','web-dev']],
  ['tech_minimal_l1qwi4','Technology minimal III','technology',['minimal'],['digital','web-dev']],
  ['transport_manager_platform_hitech_nuc1gm','Transport manager','technology',['high-tech'],['digital','web-dev']],
  ['travel_editorial_svklee','Travel editorial','hospitality',['editorial'],['digital','web-dev']],
  ['vantra-facility-os-hitech_bg4iwg','Vantra facility OS','technology',['high-tech'],['digital','web-dev']],
  ['veyra-thumb-4x3_bwbdg0','Veyra','technology',['high-tech'],['digital','web-dev']],
  ['vital-app-cover-w800_srszqk','Vital app','wellness',['minimal'],['digital','app-dev']],
];

export const collectionWorks: Work[] = assignments.map(([publicId,name,industry,styleIds,services]) => {
  const asset = inventory.assets.find(item => item.publicId === publicId);
  if (!asset) throw new Error(`Missing collection asset: ${publicId}`);
  return {
    slug: publicId.replace(/_[^_]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name, industry, styleIds, services, campaignIds: [], status: 'client',
    assetId: asset.assetId, publicId, sourceDisplayName: asset.displayName,
    width: asset.width, height: asset.height, fit: 'contain',
    poster: asset.kind === 'image' ? asset.src : asset.poster,
    media: asset.kind === 'video'
      ? {kind:'video', src:asset.src.replace('/video/upload/','/video/upload/w_1600,c_limit,q_auto/'), originalSrc:asset.src}
      : {kind:'image', src:asset.src},
  };
});
