// Direct test: does the API token work with perspective: "drafts"?
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Read env manually
const envContent = readFileSync('.env.local', 'utf-8')
const getEnv = (key) => {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'))
  if (!match) return undefined
  return match[1].replace(/^["']|["']$/g, '').trim()
}

const token = getEnv('SANITY_API_READ_TOKEN')
const projectId = getEnv('NEXT_PUBLIC_SANITY_PROJECT_ID')
const dataset = getEnv('NEXT_PUBLIC_SANITY_DATASET')

console.log('PROJECT ID:', projectId)
console.log('DATASET:', dataset)
console.log('TOKEN (first 10):', token?.substring(0, 10))

const client = createClient({ projectId, dataset, apiVersion: '2024-10-15', useCdn: false, token })

// Test 1: published perspective
try {
  const r1 = await client.fetch('*[_type == "page"][0]{_id}', {}, { perspective: 'published' })
  console.log('✅ Published perspective OK:', JSON.stringify(r1))
} catch (e) {
  console.error('❌ Published perspective FAILED:', e.statusCode, e.message)
}

// Test 2: drafts perspective
try {
  const r2 = await client.fetch('*[_type == "page"][0]{_id}', {}, { perspective: 'drafts' })
  console.log('✅ Drafts perspective OK:', JSON.stringify(r2))
} catch (e) {
  console.error('❌ Drafts perspective FAILED:', e.statusCode, e.message)
}

// Test 3: previewDrafts perspective
try {
  const r3 = await client.fetch('*[_type == "page"][0]{_id}', {}, { perspective: 'previewDrafts' })
  console.log('✅ previewDrafts perspective OK:', JSON.stringify(r3))
} catch (e) {
  console.error('❌ previewDrafts perspective FAILED:', e.statusCode, e.message)
}
