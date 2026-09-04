/**
 * Portal theme choice.
 *
 * Stored in a plain cookie (not localStorage) so the `(app)` root layout can
 * read it during SSR and stamp `data-portal-theme` into the first painted
 * frame. That is what makes the toggle flash-free without an inline script.
 *
 * `system` is deliberately left unresolved on the server — `globals.css`
 * resolves it with a `prefers-color-scheme` media query, so the server never
 * has to guess the viewer's OS setting.
 */

export const PORTAL_THEME_COOKIE = "lv_theme";

export const THEME_CHOICES = ["light", "dark", "system"] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];

/** The brand shell is dark, so an unset cookie means dark rather than system. */
export const DEFAULT_THEME: ThemeChoice = "dark";

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return (
    typeof value === "string" &&
    (THEME_CHOICES as readonly string[]).includes(value)
  );
}

export function resolveThemeChoice(value: string | undefined): ThemeChoice {
  return isThemeChoice(value) ? value : DEFAULT_THEME;
}

/** One year — a theme preference should outlive the session cookie. */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
