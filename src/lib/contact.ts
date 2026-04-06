/* ═══════════════════════════════════════════════════════════════════
   LIONOVART — WhatsApp Lead Gen Config
   ═══════════════════════════════════════════════════════════════════
   Replace WHATSAPP_NUMBER with your number, country code first,
   no "+", no spaces, no dashes.
   Example: US +1 (415) 555-1234  →  "14155551234"
            Colombia +57 (300) 123-4567  →  "573001234567"
   ═══════════════════════════════════════════════════════════════════ */
export const WHATSAPP_NUMBER = "YOUR_NUMBER_HERE"; // ← Swap this once

const DEFAULT_MESSAGE =
  "Hi! I just visited Lionovart and I'm interested in discussing a project. Can we connect?";

/** Generic CTA — Navbar, Footer buttons */
export function getWhatsAppUrl(message?: string): string {
  const text = encodeURIComponent(message ?? DEFAULT_MESSAGE);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

/** Hero form CTA — pre-fills the visitor's email so you have their contact */
export function getWhatsAppUrlWithEmail(email: string): string {
  const text = encodeURIComponent(
    `Hi! I visited Lionovart and I'm interested in discussing a project.\n\nYou can also reach me at: ${email}`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
