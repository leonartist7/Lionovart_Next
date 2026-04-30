// Querying with "sanityFetch" will keep content automatically updated
// Before using it, import and render "<SanityLive />" in your layout, see
// https://github.com/sanity-io/next-sanity#live-content-api for more information.
import { defineLive } from "next-sanity/live";
import { client } from './client'
import { token } from './token'

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    apiVersion: '2024-10-15',
    // Set token on the base client so ALL internal fetches (including the
    // sync-tags pre-fetch) use the API token instead of falling back to
    // the Sanity CLI session token stored in ~/.sanity/config. Without this,
    // the CLI session JWT gets sent and Sanity rejects it from localhost:3000
    // with "Unauthorized - Session does not match project host".
    token,
    stega: {
      enabled: true,
      studioUrl: '/studio',
    },
  }),
  serverToken: token,
  browserToken: false, // disable browser-side Live API to prevent session errors
});
