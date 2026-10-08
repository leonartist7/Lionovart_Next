export const serviceTags = [
  { value: 'identity', label: 'Brand identity' },
  { value: 'web-app-dev', label: 'Web/App dev' },
  { value: 'ai-os', label: 'Smart OS' },
  { value: 'creative-content', label: 'Creative media' },
  { value: 'event-branding', label: 'Event design' },
  { value: 'digital', label: 'Digital design' },
  { value: 'motion', label: 'Motion' },
];
export const serviceOptions = [{ value: '', label: 'All services' }, ...serviceTags,
  { value: 'web-dev', label: 'Web/App dev' }, { value: 'app-dev', label: 'Web/App dev' },
  { value: 'campaign', label: 'Campaign' }];
export const serviceTagLabel = (id: string) => serviceOptions.find(item => item.value === id)?.label ?? id;
export function normalizeServiceTags(ids: string[]): string[] {
  return [...new Set(ids.map(id => id === 'web-dev' || id === 'app-dev' ? 'web-app-dev' : id))];
}
