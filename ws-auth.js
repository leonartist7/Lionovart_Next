// Shared token + abuse-control helpers. mintToken/verifyToken back BOTH the
// WS upgrade token (verified by server.js/ws-dev.js, a separate process from
// Next.js) and the tool-call bearer token (verified in-process by
// /api/strategist/tool) — one HMAC scheme, one place it can drift.
const crypto = require("crypto");

const MAX_PER_IP = 2;
const MAX_GLOBAL = parseInt(process.env.NOVA_WS_MAX_GLOBAL || "20", 10);

const sessionsByIp = new Map();
let globalSessions = 0;

// Mints `${base64url(JSON payload)}.${hmacSha256(payload)}`. Caller supplies
// the payload fields; iat/exp are added here from ttlMs.
function mintToken(payload, secret, ttlMs) {
  const now = Date.now();
  const full = { ...payload, iat: now, exp: now + ttlMs };
  const payloadB64 = Buffer.from(JSON.stringify(full)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

// Verifies a token minted by mintToken. Returns the decoded payload, or null
// if the signature is bad, malformed, or expired.
function verifyToken(token, secret) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;

  let expected;
  try {
    expected = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  } catch {
    return null;
  }
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!payload || typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
  return payload;
}

// Thin wrapper kept for server.js/ws-dev.js call sites — WS token payload is
// {sid, iat, exp, ip}.
function verifyWsToken(token, secret) {
  return verifyToken(token, secret);
}

function isAllowedOrigin(origin, isDev) {
  if (!origin) return isDev; // allow missing Origin only in dev (curl/tools)
  if (/^https?:\/\/([a-z0-9-]+\.)*lionovart\.com$/i.test(origin)) return true;
  if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

function getRequestIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

// ponytail: counters are per-process (per Cloud Run instance), not fleet-wide.
// Good enough for an abuse ceiling on a single-agent demo; upgrade to a shared
// store (Redis/Firestore) if true fleet-wide capping is ever needed.
function tryAcquireSlot(ip) {
  const current = sessionsByIp.get(ip) || 0;
  if (current >= MAX_PER_IP) return false;
  if (globalSessions >= MAX_GLOBAL) return false;
  sessionsByIp.set(ip, current + 1);
  globalSessions += 1;
  return true;
}

function releaseSlot(ip) {
  const current = sessionsByIp.get(ip) || 0;
  if (current <= 1) sessionsByIp.delete(ip);
  else sessionsByIp.set(ip, current - 1);
  globalSessions = Math.max(0, globalSessions - 1);
}

module.exports = {
  mintToken,
  verifyToken,
  verifyWsToken,
  isAllowedOrigin,
  getRequestIp,
  tryAcquireSlot,
  releaseSlot,
};
