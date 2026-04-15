import type { Message, HistoryEntry, StreamEvent } from "./strategist-config";

/* Convert internal Message array to Gemini history format */
export function formatHistory(messages: Message[]): HistoryEntry[] {
  return messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));
}

/**
 * Sends a message to the Gemini chat proxy and yields StreamEvents.
 * Uses SSE (text/event-stream) from /api/strategist/chat.
 * The AbortSignal allows callers to cancel mid-stream.
 */
export async function* sendMessage(
  message: string,
  history: Message[],
  signal?: AbortSignal
): AsyncGenerator<StreamEvent> {
  let response: Response;

  try {
    response = await fetch("/api/strategist/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: formatHistory(history) }),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") return;
    yield { type: "error", message: "Network error — please try again." };
    return;
  }

  if (!response.ok) {
    yield { type: "error", message: `Server error ${response.status}` };
    return;
  }

  if (!response.body) {
    yield { type: "error", message: "Empty response from server." };
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    let done = false;
    let chunk: Uint8Array | undefined;

    try {
      const read = await reader.read();
      done = read.done;
      chunk = read.value;
    } catch {
      // Stream cancelled
      return;
    }

    if (done) break;
    if (!chunk) continue;

    buffer += decoder.decode(chunk, { stream: true });

    /* Process complete SSE lines */
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // keep incomplete last line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;

      const raw = trimmed.slice(6);
      if (!raw || raw === "[DONE]") continue;

      try {
        const event = JSON.parse(raw) as StreamEvent;
        yield event;
        if (event.type === "done" || event.type === "error") return;
      } catch {
        // Malformed JSON — skip
      }
    }
  }
}
