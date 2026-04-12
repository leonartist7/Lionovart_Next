'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('[LIONOVART] Runtime error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-[5rem] font-bold text-white/10 leading-none select-none">!</div>
        <h2 className="text-2xl font-bold uppercase tracking-widest text-white">
          Something went wrong
        </h2>
        <p className="text-white/50 text-sm leading-relaxed">
          An unexpected error occurred. This has been logged automatically.
        </p>
        <button
          onClick={() => unstable_retry()}
          className="inline-flex h-12 items-center justify-center rounded-full bg-[#e5192a] px-8 text-sm font-bold uppercase tracking-widest text-white transition-all hover:scale-105 hover:bg-[#c4141f]"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
