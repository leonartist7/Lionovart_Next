// Reuse the public site's document shell for locale-prefixed routes. The
// next-intl proxy resolves the locale before this server layout renders.
export { default, metadata, viewport } from "../(site)/layout";
