import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Ensure it doesn't cache the result

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const sanityToken = process.env.SANITY_API_READ_TOKEN;
  const firebaseKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    keys_loaded: {
      GEMINI_API_KEY: !!geminiKey && geminiKey.length > 10 ? "✅ Loaded" : "❌ Missing or invalid",
      SANITY_API_READ_TOKEN: !!sanityToken && sanityToken.length > 10 ? "✅ Loaded" : "❌ Missing or invalid",
      FIREBASE_ADMIN_PRIVATE_KEY: !!firebaseKey && firebaseKey.length > 20 ? "✅ Loaded" : "❌ Missing or invalid",
    },
    model_config: {
      GEMINI_MODEL: process.env.GEMINI_MODEL || "not set",
      GEMINI_LIVE_MODEL: process.env.GEMINI_LIVE_MODEL || "not set (defaults to models/gemini-3.1-flash-live-preview)",
    },
    ws_logs: (global as any).wsDebugLog || []
  });
}
