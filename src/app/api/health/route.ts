import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Configuration presence is not an upstream availability or voice-quality test. */
export async function GET() {
  const persistenceConfigured = Boolean(process.env.FIREBASE_PROJECT_ID && (
    process.env.FIRESTORE_EMULATOR_HOST ||
    (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY)
  ));
  return NextResponse.json({
    status: "ok",
    voice: {
      transport: "gemini-direct",
      configured: Boolean(process.env.GEMINI_API_KEY && (process.env.NOVA_WS_SECRET?.length ?? 0) >= 32 && persistenceConfigured),
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
