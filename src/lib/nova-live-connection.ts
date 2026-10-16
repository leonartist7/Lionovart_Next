import type { GoogleGenAI, Session, LiveServerMessage, LiveSendRealtimeInputParameters, FunctionResponse } from "@google/genai";

export interface LiveCredential {
  transport: "gemini-direct";
  token: string;
  toolToken: string;
  model: string;
  voice: string;
  conversationId: string;
  startedAt: number;
  expiresAt: number;
}

type Client = Pick<GoogleGenAI, "live">;
export type LiveClientFactory = (token: string) => Promise<Client>;

async function defaultClient(token: string): Promise<Client> {
  const { GoogleGenAI } = await import("@google/genai");
  return new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: "v1alpha" } });
}

/** Adapter preserves NOVA's audio/tool events while replacing the Cloud Run socket. */
export class NovaLiveConnection {
  readyState = 0;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  private session: Session | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pending: Array<() => void> = [];
  private started = false;

  private credential: LiveCredential;
  private clientFactory: LiveClientFactory;
  constructor(credential: LiveCredential, clientFactory: LiveClientFactory = defaultClient) {
    this.credential = credential;
    this.clientFactory = clientFactory;
  }

  /** Call after handlers are registered; an early SDK callback must not be lost. */
  async connect() {
    if (this.started || this.readyState === 3) return;
    this.started = true;
    this.timer = setTimeout(() => this.fail(), 20_000);
    try {
      const client = await this.clientFactory(this.credential.token);
      if (this.readyState === 3) return;
      const session = await client.live.connect({
        model: this.credential.model,
        // All generation settings, prompt and tools are locked into the token.
        callbacks: {
          onopen: () => { if (this.readyState !== 3) this.onopen?.(); },
          onmessage: (message: LiveServerMessage) => {
            if (this.readyState === 3) return;
            if (message.setupComplete) {
              this.clearTimer();
              this.readyState = 1;
              this.emit({ type: "voice_resolved", voice: this.credential.voice });
              this.emit({ type: "setup_complete" });
            } else {
              this.emit(message);
            }
          },
          onerror: () => this.fail(),
          onclose: event => this.finish(event.code, "Voice connection closed"),
        },
      });
      if (this.readyState === 3) { session.close(); return; }
      this.session = session;
      for (const send of this.pending.splice(0)) send();
    } catch { this.fail(); }
  }

  send(raw: string) {
    if (this.readyState !== 1) return;
    const data = JSON.parse(raw) as { realtimeInput?: LiveSendRealtimeInputParameters; type?: string; responses?: FunctionResponse[] };
    const send = () => {
      if (this.readyState !== 1 || !this.session) return;
      try {
        if (data.realtimeInput) this.session.sendRealtimeInput(data.realtimeInput);
        else if (data.type === "tool_response" && data.responses) this.session.sendToolResponse({ functionResponses: data.responses });
      } catch { this.fail(); }
    };
    if (this.session) send();
    else if (this.pending.length < 8) this.pending.push(send);
  }

  close() {
    if (this.readyState === 3) return;
    this.finish(1000, "Session ended");
    this.session?.close();
    this.session = null;
  }

  private emit(data: unknown) { this.onmessage?.({ data: JSON.stringify(data) }); }
  private clearTimer() { if (this.timer) clearTimeout(this.timer); this.timer = null; }
  private finish(code: number, reason: string) {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.clearTimer();
    this.pending = [];
    this.onclose?.({ code, reason });
  }
  private fail() {
    if (this.readyState === 3) return;
    this.onerror?.();
    this.finish(1011, "Voice connection unavailable");
    this.session?.close();
    this.session = null;
  }
}
