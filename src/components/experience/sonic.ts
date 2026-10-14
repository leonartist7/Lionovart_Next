/** Locally synthesized cues and a very quiet breeze, enabled only by a click. */
export class SonicCues {
  private context: AudioContext | undefined;
  private lastChapter = -Infinity;
  private lastTap = -Infinity;
  private lastHover = -Infinity;
  private lastMovement = -Infinity;
  private movement = 0;
  private lastBreezeUpdate = 0;
  private heard = new Set<string>();
  private breeze: AudioBufferSourceNode | undefined;
  private breezeBuffer: AudioBuffer | undefined;
  private hoverCleanup = new Set<() => void>();
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
    this.note(240, .12, .012);
  }

  hover() {
    const now = performance.now();
    const ctx = this.context, buffer = this.breezeBuffer;
    if (!this.enabled || !ctx || !buffer || ctx.state !== "running" || document.hidden || now - this.lastHover < 1400 || now - this.lastMovement < 600) return;
    this.lastHover = now;
    // A brief, muted air brush uses the existing noise buffer, with no chime.
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = buffer;
    filter.type = "lowpass"; filter.frequency.value = 640; filter.Q.value = .4;
    gain.gain.setValueAtTime(.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(.0018, ctx.currentTime + .065);
    gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .28);
    source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    source.start(ctx.currentTime, 2); source.stop(ctx.currentTime + .3);
    const cleanup = () => { source.onended = null; source.disconnect(); filter.disconnect(); gain.disconnect(); this.hoverCleanup.delete(dispose); };
    const dispose = () => { source.stop(); cleanup(); };
    this.hoverCleanup.add(dispose);
    source.onended = cleanup;
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
    const buffer = ctx.createBuffer(2, Math.ceil(ctx.sampleRate * 8), ctx.sampleRate);
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
    this.breezeBuffer = buffer;
    source.buffer = buffer; source.loop = true;
    filter.type = "bandpass"; filter.frequency.value = 420; filter.Q.value = .35;
    gain.gain.value = 0;
    source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    source.start();
    this.breeze = source; this.breezeGain = gain; this.breezeFilter = filter;
  }

  scroll(velocity: number) {
    const ctx = this.context, gain = this.breezeGain;
    if (!this.enabled || !ctx || !gain || ctx.state !== "running" || document.hidden) return;
    if (Math.abs(velocity) > 1) this.lastMovement = performance.now();
    const elapsed = this.lastBreezeUpdate ? Math.min(.2, ctx.currentTime - this.lastBreezeUpdate) : .08;
    if (elapsed < .055) return;
    this.lastBreezeUpdate = ctx.currentTime;
    this.movement += (Math.min(1, Math.abs(velocity) / 22) - this.movement) * (1 - Math.exp(-elapsed / .42));
    // Hold the actual current gain before changing its target; cancelling an
    // unfinished envelope can otherwise restart it from zero on every frame.
    this.hold(gain.gain, ctx);
    gain.gain.setTargetAtTime(this.movement * .018, ctx.currentTime, .45);
    if (this.breezeFilter) {
      this.hold(this.breezeFilter.frequency, ctx);
      this.breezeFilter.frequency.setTargetAtTime(380 + this.movement * 140, ctx.currentTime, .7);
    }
    clearTimeout(this.hush);
    this.hush = setTimeout(() => this.quiet(), 300);
  }

  private hold(param: AudioParam, ctx: AudioContext) {
    if (typeof param.cancelAndHoldAtTime === "function") param.cancelAndHoldAtTime(ctx.currentTime);
    else {
      const current = param.value;
      param.cancelScheduledValues(ctx.currentTime);
      param.setValueAtTime(current, ctx.currentTime);
    }
  }

  private quiet() {
    clearTimeout(this.hush);
    const ctx = this.context, gain = this.breezeGain;
    if (!ctx || !gain) return;
    this.hold(gain.gain, ctx);
    gain.gain.setTargetAtTime(0, ctx.currentTime, .95);
    this.movement = 0;
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
    gain.gain.exponentialRampToValueAtTime(volume, start + .035);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    tone.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    tone.start(start); tone.stop(start + duration + .02);
    tone.onended = () => { tone.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  suspend() { this.quiet(); void this.context?.suspend(); }
  resume() { if (this.enabled) void this.context?.resume(); }
  dispose() {
    this.enabled = false; clearTimeout(this.hush);
    this.hoverCleanup.forEach(cleanup => cleanup());
    this.breeze?.stop(); this.breeze?.disconnect(); this.breezeFilter?.disconnect(); this.breezeGain?.disconnect();
    void this.context?.close();
  }
}
