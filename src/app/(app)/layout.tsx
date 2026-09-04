import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";
import { PORTAL_THEME_COOKIE, resolveThemeChoice } from "@/lib/portal/theme";

/**
 * Root layout for the signed-in surfaces — the client portal and the Nova
 * console. Deliberately separate from `(site)`: the marketing layout forces
 * Lenis smooth scroll, a splash screen, a custom cursor and a full-screen WebGL
 * canvas onto everything it wraps, all of which fight an app shell (they break
 * drag-and-drop, nested scroll panes and touch).
 *
 * Crossing between the two groups triggers a full page load, which is the
 * behaviour we want at the site → app boundary.
 */

export const metadata: Metadata = {
  title: {
    default: "LIONOVART Portal",
    template: "%s · LIONOVART",
  },
  // Signed-in surfaces must never be indexed.
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0d" },
  ],
  colorScheme: "light dark",
  // The portal is a full-height app: prevent the double-tap zoom jump on iOS
  // without disabling pinch-zoom, which would be an accessibility failure.
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Read the stored choice server-side so the correct palette is in the first
  // painted frame — no inline script, no flash. `system` is resolved in CSS by
  // a `prefers-color-scheme` media query, so the server never has to guess.
  const cookieStore = await cookies();
  const theme = resolveThemeChoice(cookieStore.get(PORTAL_THEME_COOKIE)?.value);

  return (
    <html
      lang="en"
      data-portal-theme={theme}
      className={`${fontVariables} h-full`}
      suppressHydrationWarning
    >
      <body className="font-body bg-background text-foreground min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}
