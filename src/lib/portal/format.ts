/**
 * Date formatting shared by the portal.
 *
 * Fixed to en-CA so a date renders identically on the server and on the
 * client — locale-dependent formatting is a classic hydration mismatch.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "—";
  return new Date(ms).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "in 3 days" / "2 weeks ago" — coarse on purpose; exact times aren't useful here. */
export function relativeDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "";

  const days = Math.round((ms - Date.now()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 0 && days < 14) return `in ${days} days`;
  if (days < 0 && days > -14) return `${Math.abs(days)} days ago`;

  const weeks = Math.round(days / 7);
  if (weeks > 0) return `in ${weeks} weeks`;
  return `${Math.abs(weeks)} weeks ago`;
}
