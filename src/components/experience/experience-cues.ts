/** Shared event; one opt-in audio graph owns all page cues. */
export function emitExperienceCue(kind: "service" | "process", id: string, index = 0) {
  window.dispatchEvent(new CustomEvent("lionovart:sound-cue", { detail: { kind, id, index } }));
}
