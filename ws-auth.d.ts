export interface WsTokenPayload {
  sid: string;
  iat: number;
  exp: number;
  ip: string;
}

export interface ToolTokenPayload {
  cid: string;
  iat: number;
  exp: number;
}

export function mintToken<T extends object>(payload: T, secret: string, ttlMs: number): string;
export function verifyToken<T = Record<string, unknown>>(token: string | null | undefined, secret: string): (T & { iat: number; exp: number }) | null;
export function verifyWsToken(token: string | null | undefined, secret: string): WsTokenPayload | null;
export function isAllowedOrigin(origin: string | null | undefined, isDev: boolean): boolean;
export function getRequestIp(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }): string;
export function tryAcquireSlot(ip: string): boolean;
export function releaseSlot(ip: string): void;
