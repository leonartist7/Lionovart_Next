"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";
import { app } from "@/lib/firebase";
import { cn } from "@/lib/utils";

const EMAIL_FOR_LINK_KEY = "lv_portal_email_for_link";

/** Maps Firebase Auth codes to something a client can act on. */
function describeAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case "auth/unauthorized-domain":
      return "This domain isn't authorized for sign-in yet. Let us know and we'll fix it.";
    case "auth/operation-not-allowed":
      return "This sign-in method isn't enabled yet. Let us know and we'll fix it.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in window — allow pop-ups and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was closed before it finished. Try again.";
    case "auth/invalid-email":
      return "That doesn't look like a valid email address.";
    case "auth/invalid-action-code":
      return "That sign-in link has expired or was already used. Request a new one.";
    case "auth/configuration-not-found":
    case "auth/invalid-api-key":
      return "Sign-in isn't configured for this environment.";
    default:
      return code ? `Sign-in failed (${code}). Please try again.` : "Sign-in failed. Please try again.";
  }
}

type Mode = "idle" | "working" | "link-sent";

export function PortalSignIn({
  inviteToken,
  expectedEmail,
  heading,
  subheading,
}: {
  inviteToken?: string;
  /** When the invite is bound to an address, prefill and lock it. */
  expectedEmail?: string;
  heading: string;
  subheading: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("idle");
  const [email, setEmail] = useState(expectedEmail ?? "");
  const [showEmail, setShowEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

  /** Trades a Firebase credential for the portal session cookie. */
  const establishSession = useCallback(
    async (cred: UserCredential) => {
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/portal/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, inviteToken }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Sign-in failed. Please try again.");
        setMode("idle");
        return;
      }

      // A full navigation, not a client transition: the session cookie has to
      // reach the server layout that guards every portal route.
      window.location.assign("/portal");
    },
    [inviteToken],
  );

  // Completing an email-link sign-in: the user has landed back here from their
  // inbox and the credential is in the URL.
  useEffect(() => {
    if (!configured) return;
    const auth = getAuth(app);
    const href = window.location.href;
    if (!isSignInWithEmailLink(auth, href)) return;

    const stored = window.localStorage.getItem(EMAIL_FOR_LINK_KEY);
    // Opening the link on a different device means we no longer know which
    // address it was sent to — ask rather than fail silently.
    const address = stored ?? expectedEmail ?? window.prompt("Confirm your email to finish signing in") ?? "";
    if (!address) return;

    setMode("working");
    signInWithEmailLink(auth, address, href)
      .then((cred) => {
        window.localStorage.removeItem(EMAIL_FOR_LINK_KEY);
        return establishSession(cred);
      })
      .catch((err) => {
        console.error("[portal] email link sign-in failed:", err);
        setError(describeAuthError(err));
        setMode("idle");
      });
  }, [configured, expectedEmail, establishSession]);

  async function handleGoogle() {
    setError(null);
    setMode("working");
    try {
      const cred = await signInWithPopup(getAuth(app), new GoogleAuthProvider());
      await establishSession(cred);
    } catch (err) {
      console.error("[portal] google sign-in failed:", err);
      setError(describeAuthError(err));
      setMode("idle");
    }
  }

  async function handleEmailLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const address = email.trim().toLowerCase();
    if (!address) return;

    setMode("working");
    try {
      // Carry the invite through the round trip so the link still redeems it.
      const url = new URL(window.location.href);
      if (inviteToken) url.searchParams.set("token", inviteToken);

      await sendSignInLinkToEmail(getAuth(app), address, {
        url: url.toString(),
        handleCodeInApp: true,
      });
      window.localStorage.setItem(EMAIL_FOR_LINK_KEY, address);
      setMode("link-sent");
    } catch (err) {
      console.error("[portal] send sign-in link failed:", err);
      setError(describeAuthError(err));
      setMode("idle");
    }
  }

  if (!configured) {
    return (
      <Shell heading="Portal unavailable" subheading="">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Sign-in isn&apos;t configured for this environment. Set the{" "}
          <code className="bg-muted rounded px-1 py-0.5 text-xs">NEXT_PUBLIC_FIREBASE_*</code>{" "}
          variables to enable it.
        </p>
      </Shell>
    );
  }

  if (mode === "link-sent") {
    return (
      <Shell heading="Check your inbox" subheading={`We sent a sign-in link to ${email}.`}>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Open it on this device to finish signing in. The link works once and expires shortly.
        </p>
        <button
          type="button"
          onClick={() => setMode("idle")}
          className="text-muted-foreground hover:text-foreground mt-6 text-sm underline underline-offset-4 transition-colors"
        >
          Use a different address
        </button>
      </Shell>
    );
  }

  const busy = mode === "working";

  return (
    <Shell heading={heading} subheading={subheading}>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        className={cn(
          "border-border bg-card text-foreground flex w-full items-center justify-center gap-3",
          "rounded-xl border px-4 py-3.5 text-sm font-medium",
          "transition-[transform,background-color] duration-150 ease-out",
          "hover:bg-muted active:scale-[0.985]",
          "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        <GoogleMark />
        {busy ? "Signing in…" : "Continue with Google"}
      </button>

      {!showEmail ? (
        <button
          type="button"
          onClick={() => setShowEmail(true)}
          disabled={busy}
          className="text-muted-foreground hover:text-foreground mt-4 w-full text-sm transition-colors disabled:opacity-50"
        >
          Continue with email instead
        </button>
      ) : (
        <form onSubmit={handleEmailLink} className="mt-4 space-y-3">
          <label htmlFor="portal-email" className="sr-only">
            Email address
          </label>
          <input
            id="portal-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            readOnly={Boolean(expectedEmail)}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={cn(
              "border-border bg-card text-foreground placeholder:text-muted-foreground/70 w-full rounded-xl border px-4 py-3.5 text-sm",
              "focus-visible:border-primary/60 focus-visible:ring-primary/30 focus-visible:ring-3 focus-visible:outline-none",
              "read-only:opacity-70",
            )}
          />
          <button
            type="submit"
            disabled={busy}
            className={cn(
              "bg-primary text-primary-foreground w-full rounded-xl px-4 py-3.5 text-sm font-semibold",
              "transition-[transform,opacity] duration-150 ease-out active:scale-[0.985]",
              "focus-visible:ring-primary/50 focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            {busy ? "Sending…" : "Email me a sign-in link"}
          </button>
        </form>
      )}

      {error && (
        <p role="alert" className="text-primary mt-5 text-sm leading-relaxed">
          {error}
        </p>
      )}
    </Shell>
  );
}

function Shell({
  heading,
  subheading,
  children,
}: {
  heading: string;
  subheading: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex items-center gap-2.5">
          <span className="bg-primary size-2 rounded-full" />
          <span className="font-heading text-foreground text-xs font-semibold tracking-[0.28em] uppercase">
            Lionovart
          </span>
        </div>

        <h1 className="font-heading text-foreground text-3xl leading-[1.1] font-bold tracking-[-0.02em]">
          {heading}
        </h1>
        {subheading && (
          <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">{subheading}</p>
        )}

        <div className="mt-9">{children}</div>
      </div>
    </main>
  );
}

/** Google's mark, per their branding guidelines for sign-in buttons. */
function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
