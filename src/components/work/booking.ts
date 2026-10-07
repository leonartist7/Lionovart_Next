import "server-only";

export function getWorkBookingUrl(): string | null {
  try {
    const url = new URL(process.env.BOOKING_URL ?? "");
    return url.protocol === "https:" ? url.toString() : null;
  } catch { return null; }
}
