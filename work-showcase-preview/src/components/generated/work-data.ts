import { collectionWorks } from './collection-work';
import legacyAssets from './legacy-assets.json';
import approvedCuration from './work-curation.json';
import approvedTags from './work-approved-tags.json';

const poster0 = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/458193568318758912/458193568318758913/98ffa05c464a9cf1e858dab873a877fa5bb2a0204d3caba8c2f44dcd76786756.jpg";const poster1 = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/458193568318758912/458193568318758913/be79634c8a89aaa279ad8809fb277d778956e220c1ea52972872ade0e8d3904a.jpg";const poster2 = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/458193568318758912/458193568318758913/995c7eb8ceaa75eb96534e73369213b5fcb6f596fc44d08d6ecc4bb88b24a77a.jpg";const poster3 = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/458193568318758912/458193568318758913/95291e7f379949e54e35e35db7b12ef898ef99a27ff470efc627a96538b13c4c.jpg";const poster4 = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/458193568318758912/458193568318758913/4500d4cb8a8392d9ec6d5b67f543c9fed8a1cbcbd8343c5550b4c83c3447de89.jpg";const poster5 = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/458193568318758912/458193568318758913/ec8c9ddf6c7c5fe4cb56675eb9441a54042e26ef5a10c348234cbded20955bc8.jpg";const poster6 = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/458193568318758912/458193568318758913/7f3b5156f27e4b7ea868d02860551d3fb6d3fdda3fe7f09394c4c1bd9abe3e23.jpg";const poster7 = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/458193568318758912/458193568318758913/2d1984edb23afb63f351ab98caf1f30e85c3ec168759fa0b27e91e657ed8d11e.jpg";const poster8 = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/458193568318758912/458193568318758913/2d617949e6be79a18a8fe7cdbdf80a6ef2cc242234346cb343602e5f7f79b840.jpg";const poster9 = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/458193568318758912/458193568318758913/226851f7b460ba6fec32c2b1cf7cab82e7cc9ceecb21e75ee61fe796e7378ca7.jpg";









// Assign campaigns after the actual seasonal assets are identified.
// Initial style tags are editorial judgments from the supplied project posters.
export type Work = {
  slug: string; name: string; industry: string; services: string[]; campaignIds: string[]; styleIds: string[];
  assetId: string; publicId: string; sourceDisplayName: string; status: 'client' | 'concept';
  width: number; height: number; fit: 'cover' | 'contain'; poster: string;
  media: {kind:'video'; src:string; originalSrc:string} | {kind:'image'; src:string};
};
const legacyEntries = [
{
  "slug": "stormlikes",
  "styleIds": ["bold-playful"],
  "campaignIds": [],
  "name": "Stormlikes",
  "industry": "technology",
  "services": [
  "identity",
  "digital",
  "creative-content"],

  "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330502/11729b6b5382e483f1dc7503f9874fb6_tp7bj8.mp4",
  "poster": poster0
},
{
  "slug": "lsi-asia-25",
  "styleIds": ["editorial", "elegant"],
  "campaignIds": [],
  "name": "LSI Asia ’25",
  "industry": "events",
  "services": [
  "identity",
  "event-branding"],

  "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330503/1605312c7cf23134a16fef58cf547fab_yg0pe4.mp4",
  "poster": poster1
},
{
  "slug": "fundonion",
  "styleIds": ["editorial", "elegant", "minimal"],
  "campaignIds": [],
  "name": "FundOnion",
  "industry": "finance",
  "services": [
  "identity",
  "web-dev"],

  "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330502/29b7dd2a4b2a65c7cd8d4ff86ccf734a_noxlkr.mp4",
  "poster": poster2
},
{
  "slug": "oma",
  "styleIds": ["bold-playful"],
  "campaignIds": [],
  "name": "OMa",
  "industry": "food-beverage",
  "services": [
  "identity",
  "creative-content"],

  "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330500/2d78826612e7b0ba3c03ed58d66303db_fzcwuy.mp4",
  "poster": poster3
},
{
  "slug": "rise",
  "styleIds": ["high-tech", "minimal"],
  "campaignIds": [],
  "name": "Rise",
  "industry": "finance",
  "services": [
  "identity",
  "app-dev"],

  "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330504/c97fbabff45f0ce5d2324fb7051ccc47_so2jox.mp4",
  "poster": poster4
},
{
  "slug": "justa",
  "styleIds": ["minimal", "elegant", "high-tech"],
  "campaignIds": [],
  "name": "JUSTA",
  "industry": "fashion",
  "services": [
  "identity",
  "creative-content"],

  "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330505/fdf1b97ea8ee9313371f9ad30bb81f51_rtsjyn.mp4",
  "poster": poster5
},
{
  "slug": "coinly",
  "styleIds": ["bold-playful"],
  "campaignIds": [],
  "name": "Coinly",
  "industry": "finance",
  "services": [
  "identity",
  "app-dev"],

  "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330507/original-46d0797d3a81c8cf5aee66e9b2bd14d3_o5jfgc.mp4",
  "poster": poster6
},
{
  "slug": "op",
  "styleIds": ["high-tech"],
  "campaignIds": [],
  "name": "OP",
  "industry": "",
  "services": [
  "identity",
  "digital",
  "creative-content"],

  "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330510/original-5805cd669da8ded7fadd3b8d9f2a4d12_osic3b.mp4",
  "poster": poster7
},
{
  "slug": "rakbank",
  "styleIds": ["elegant", "minimal"],
  "campaignIds": [],
  "name": "Rakbank",
  "industry": "finance",
  "services": [
  "identity",
  "app-dev"],

  "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330510/original-ca7d8db36054fe22faf618552f2f5514_iobfz9.mp4",
  "poster": poster8
},
{
  "slug": "blastup",
  "styleIds": ["bold-playful"],
  "campaignIds": [],
  "name": "Blastup",
  "industry": "technology",
  "services": [
  "identity",
  "web-dev",
  "creative-content"],

  "video": "https://res.cloudinary.com/dgio9uutc/video/upload/w_1600,c_limit,q_auto/v1790330514/original-decb2a241f75471d293be67df1f1ea57_reuk1v.mp4",
  "poster": poster9
}];

const legacyWorks: Work[] = legacyEntries.map(({video,...entry}) => {
  const publicId = video.split('/').at(-1)!.replace(/\.mp4$/, '');
  const asset = legacyAssets.find(item => item.publicId === publicId);
  if (!asset) throw new Error('Missing original asset: '+publicId);
  return {...entry, assetId:asset.assetId, publicId, sourceDisplayName:entry.name, status:'client',
    width:asset.width, height:asset.height, fit:'cover',
    media:{kind:'video',src:video,originalSrc:video.replace('/w_1600,c_limit,q_auto/','/')}};
});
const previousOpeningOrder = ['stormlikes','perfum-elegant','home-architecture-realtor','oma','justa','architecture-contractor-editorial','fundonion','travel-bold','lsi-asia-25','soda-bold','loom-branding-elegant','rakbank'];
const combined = [...legacyWorks,...collectionWorks];
const opening = previousOpeningOrder.map(slug => {
  const work = combined.find(item => item.slug === slug);
  if (!work) throw new Error('Missing opening work: '+slug);
  return work;
});
// Set an individual public ID to 'concept' when the owner flags that example.
export const workStatusOverrides: Partial<Record<string, Work['status']>> = {};
// Confirmed owner assignments are keyed by stable Cloudinary asset ID.
export const approvedTagAssignments = approvedTags as Partial<Record<string, { services: string[]; status: Work['status'] }>>;
const baselineWorks: Work[] = [...opening,
  ...legacyWorks.filter(work => !previousOpeningOrder.includes(work.slug)),
  ...collectionWorks.filter(work => !previousOpeningOrder.includes(work.slug)).sort((a,b)=>a.sourceDisplayName.localeCompare(b.sourceDisplayName,'en',{sensitivity:'base'}))]
  .map(work => ({...work, services:approvedTagAssignments[work.assetId]?.services ?? work.services,
    status:workStatusOverrides[work.publicId] ?? approvedTagAssignments[work.assetId]?.status ?? work.status}));

// Owner-selected opening; review numbers remain anchored to asset IDs.
export const openingOrder = ["rakbank","blastup","fundonion","op","clothing-fashion-hightech","stormlikes","soda-bold","oma","home-interior"];
const preferred = openingOrder.map(slug => {
  const work = baselineWorks.find(item => item.slug === slug);
  if (!work) throw new Error('Missing opening work: ' + slug);
  return work;
});
export const works: Work[] = [...preferred, ...baselineWorks.filter(work => !openingOrder.includes(work.slug))];

// Owner-approved archive marks hide entries without deleting source assets or changing review numbers.
export const curationDecisions: Partial<Record<string, 'keep' | 'archive'>> = approvedCuration as Partial<Record<string, 'keep' | 'archive'>>;
export const publishedWorks: Work[] = works.filter(work => curationDecisions[work.assetId] !== 'archive');
