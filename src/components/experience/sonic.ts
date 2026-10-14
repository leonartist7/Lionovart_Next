/** Locally synthesized cues and a very quiet breeze, enabled only by a click. */
export class SonicCues {
  private context: AudioContext | undefined;
  private lastChapter = -Infinity;
  private lastTap = -Infinity;
  private heard = new Set<string>();
  private breeze: AudioBufferSourceNode | undefined;
  private breezeGain: GainNode | undefined;
  private breezeFilter: BiquadFilterNode | undefined;
  private hush: ReturnType<typeof setTimeout> | undefined;
  enabled = false;

  async toggle() {
    if (this.enabled) {
      this.enabled = false;
      this.quiet();
      await this.context?.suspend();
      return false;
    }
    try {
      this.context ??= new AudioContext();
      await this.context.resume();
      this.enabled = this.context.state === "running";
      if (this.enabled) this.prepareBreeze();
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

  private prepareBreeze() {
    const ctx = this.context;
    if (!ctx || this.breeze) return;
    const buffer = ctx.createBuffer(2, Math.ceil(ctx.sampleRate * 3), ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let brown = 0;
      for (let i = 0; i < data.length; i++) {
        brown = (brown + (Math.random() * 2 - 1) * .025) / 1.025;
        // Fade the loop seam; the two channels have independent air movement.
        const edge = Math.min(1, i / 800, (data.length - 1 - i) / 800);
        data[i] = brown * 3 * edge;
      }
    }
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = buffer; source.loop = true;
    filter.type = "bandpass"; filter.frequency.value = 520; filter.Q.value = .45;
    gain.gain.value = 0;
    source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    source.start();
    this.breeze = source; this.breezeGain = gain; this.breezeFilter = filter;
  }

  scroll(velocity: number) {
    const ctx = this.context, gain = this.breezeGain;
    if (!this.enabled || !ctx || !gain || ctx.state !== "running" || document.hidden) return;
    const movement = Math.min(1, Math.abs(velocity) / 18);
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setTargetAtTime(movement * .026, ctx.currentTime, .2);
    this.breezeFilter?.frequency.setTargetAtTime(420 + movement * 280, ctx.currentTime, .35);
    clearTimeout(this.hush);
    this.hush = setTimeout(() => this.quiet(), 120);
  }

  private quiet() {
    clearTimeout(this.hush);
    const ctx = this.context, gain = this.breezeGain;
    if (!ctx || !gain) return;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setTargetAtTime(0, ctx.currentTime, .4);
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

  suspend() { this.quiet(); void this.context?.suspend(); }
  resume() { if (this.enabled) void this.context?.resume(); }
  dispose() {
    this.enabled = false; clearTimeout(this.hush);
    this.breeze?.stop(); this.breeze?.disconnect(); this.breezeFilter?.disconnect(); this.breezeGain?.disconnect();
    void this.context?.close();
  }
}
