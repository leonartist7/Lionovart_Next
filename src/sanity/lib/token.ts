export const token = process.env.SANITY_API_READ_TOKEN

if (!token && process.env.NODE_ENV !== 'development' && process.env.NEXT_PHASE !== 'phase-production-build') {
  console.warn('Missing SANITY_API_READ_TOKEN. Live Drafts will not work.')
}
