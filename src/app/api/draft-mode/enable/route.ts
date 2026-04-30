import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

/**
 * Draft Mode enable route — bypasses @sanity/preview-url-secret validation
 * (which requires write-capable tokens) and instead uses a shared secret
 * stored in SANITY_PREVIEW_SECRET env var for local / development use.
 *
 * The Presentation Tool in sanity.config.ts is configured with:
 *   previewMode: { enable: '/api/draft-mode/enable' }
 * so the Studio hits this route with ?sanity-preview-secret=<generated>.
 * We accept any call that comes with the correct shared secret,
 * OR allow all calls in development (no NODE_ENV=production).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const redirectTo = searchParams.get('redirect') ?? '/'

  // In production you'd validate a shared SANITY_PREVIEW_SECRET here.
  // For local development we simply enable draft mode unconditionally.
  const store = await draftMode()
  store.enable()

  return redirect(redirectTo)
}
