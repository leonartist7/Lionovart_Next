export const campaigns = [
  { value: '', label: 'All' },
  { value: 'black-friday', label: 'Black Friday' },
  { value: 'christmas', label: 'Christmas' },
];
export const industries = [
  { value: '', label: 'All industries' },
  { value: 'food-beverage', label: 'Food & Beverage' },
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'wellness', label: 'Beauty & Wellness' },
  { value: 'hospitality', label: 'Hospitality & Travel' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'construction-trades', label: 'Construction & Trades' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'sports-outdoor', label: 'Sports & Outdoor' },
  { value: 'finance', label: 'Finance' },
  { value: 'technology', label: 'Tech & SaaS' },
  { value: 'events', label: 'Events & Culture' },
  { value: 'home-lifestyle', label: 'Home & Lifestyle' },
];
export const styles = [
  { value: '', label: 'All styles' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'high-tech', label: 'High-tech' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold-playful', label: 'Bold & Playful' },
  { value: 'organic-calm', label: 'Organic & Calm' },
];
export type WorkSelection = { industry: string; service: string; campaign: string; style: string; limit: number };
export const allWork: WorkSelection = { industry: '', service: '', campaign: '', style: '', limit: 12 };
export function matchesWork(work: { industry: string; services: string[]; campaignIds: string[]; styleIds: string[] }, selection: WorkSelection) {
  return (!selection.industry || work.industry === selection.industry)
    && (!selection.service || work.services.includes(selection.service) || (selection.service === 'web-app-dev' && work.services.some(id=>id === 'web-dev' || id === 'app-dev')))
    && (!selection.campaign || work.campaignIds.includes(selection.campaign))
    && (!selection.style || work.styleIds.includes(selection.style));
}
