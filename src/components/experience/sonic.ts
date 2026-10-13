/** Tiny, locally synthesized cues. No download, loop, hover sounds or auto-start. */
export class SonicCues {
  private context: AudioContext | undefined;
  private lastChapter = -Infinity;
  private lastTap = -Infinity;
  private heard = new Set<string>();
  enabled = false;

  async toggle() {
    if (this.enabled) {
      this.enabled = false;
      await this.context?.suspend();
      return false;
    }
    try {
      this.context ??= new AudioContext();
      await this.context.resume();
      this.enabled = this.context.state === "running";
      if (this.enabled) this.tap();
    } catch { this.enabled = false; }
    return this.enabled;
  }

  tap() {
    if (performance.now() - this.lastTap < 180) return;
    this.lastTap = performance.now();
    this.note(240, .07, .018);
  }

  chapter(id: string) {
    if (!this.enabled || this.heard.has(id) || performance.now() - this.lastChapter < 2800) return;
    this.heard.add(id);
    this.lastChapter = performance.now();
    this.note(174.61, .38, .022);
    this.note(261.63, .25, .009, .045);
  }

  private note(frequency: number, duration: number, volume: number, delay = 0) {
    const ctx = this.context;
    if (!this.enabled || !ctx || ctx.state !== "running" || document.hidden) return;
    const start = ctx.currentTime + delay;
    const tone = ctx.createOscillator(), gain = ctx.createGain(), filter = ctx.createBiquadFilter();
    tone.type = "sine";
    tone.frequency.setValueAtTime(frequency, start);
    tone.frequency.exponentialRampToValueAtTime(frequency * .94, start + duration);
    filter.type = "lowpass";
    filter.frequency.value = 900;
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    tone.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    tone.start(start); tone.stop(start + duration + .02);
    tone.onended = () => { tone.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  suspend() { void this.context?.suspend(); }
  resume() { if (this.enabled) void this.context?.resume(); }
  dispose() { this.enabled = false; void this.context?.close(); }
}
