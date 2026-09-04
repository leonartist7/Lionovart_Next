"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "@/lib/firebase";

const firebaseConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

/** Maps common Firebase Auth error codes to actionable messages — the
 * generic catch-all was swallowing the real cause (unauthorized domain,
 * provider not enabled, popup blocked, etc). */
function describeAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case "auth/unauthorized-domain":
      return "This domain isn't authorized for sign-in yet — add it under Firebase Console → Authentication → Settings → Authorized domains.";
    case "auth/operation-not-allowed":
      return "Google sign-in isn't enabled for this project — enable it under Firebase Console → Authentication → Sign-in method → Google.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup — allow popups for this site and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in window closed before finishing — try again.";
    case "auth/configuration-not-found":
    case "auth/invalid-api-key":
      return "Firebase isn't configured correctly for this environment — check the NEXT_PUBLIC_FIREBASE_* env vars.";
    default:
      return code
        ? `Sign-in failed (${code}). Please try again.`
        : "Sign-in was cancelled or failed. Please try again.";
  }
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (res.status === 403) {
        setError("This account doesn't have console access.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Sign-in failed. Please try again.");
        setLoading(false);
        return;
      }

      router.replace("/admin/leads");
    } catch (err) {
      console.error("[admin login] sign-in failed:", err);
      setError(describeAuthError(err));
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="glass-surface w-full max-w-sm rounded-2xl p-8 text-center">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="size-2 rounded-full bg-[var(--color-brand-red)]" />
          <span className="font-[var(--font-clash)] text-sm tracking-[0.3em] text-white uppercase">
            Nova Console
          </span>
        </div>

        {!firebaseConfigured ? (
          <p className="text-sm text-white/50">
            Firebase isn&apos;t configured for this environment. Set the
            <code className="mx-1 rounded bg-white/10 px-1 py-0.5 text-white/70">NEXT_PUBLIC_FIREBASE_*</code>
            env vars to enable console sign-in.
          </p>
        ) : (
          <>
            <p className="mb-6 text-sm text-white/50">
              Sign in with the Google account authorized for the Nova Console.
            </p>
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in with Google"}
            </button>
            {error && <p className="mt-4 text-sm text-[var(--color-brand-red)]">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
