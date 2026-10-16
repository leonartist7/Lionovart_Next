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
  private cueCleanup = new Set<() => void>();
  private output: GainNode | undefined;
  private lastChange = -Infinity;
  private lastChangeId = "";
  private breezeGain: GainNode | undefined;
  private breezeFilter: BiquadFilterNode | undefined;
  private hush: ReturnType<typeof setTimeout> | undefined;
  enabled = false;

  async toggle() {
    if (this.enabled) {
      this.enabled = false;
      this.quiet();
      this.stopCues();
      await this.context?.suspend();
      return false;
    }
    try {
      this.context ??= new AudioContext();
      if (!this.output) {
        this.output = this.context.createGain();
        this.output.gain.value = .45;
        this.output.connect(this.context.destination);
      }
      await this.context.resume();
      this.enabled = this.context.state === "running";
      if (this.enabled) this.prepareBreeze();
      if (this.enabled) this.tap();
    } catch { this.enabled = false; }
    return this.enabled;
  }

  tap() {
    if (!this.canHear() || performance.now() - this.lastTap < 240) return;
    this.lastTap = performance.now();
    // Rounded contact, with a trace of air rather than a sharp digital click.
    this.note(520, .16, .014);
    this.air(.16, .0035, 950);
  }

  hover() {
    const now = performance.now();
    if (!this.canHear() || now - this.lastHover < 1400 || now - this.lastMovement < 600 || now - this.lastTap < 450) return;
    this.lastHover = now;
    this.air(.26, .003, 620);
  }

  change(kind: "service" | "process", id: string, index = 0) {
    const now = performance.now(), key = `${kind}:${id}`;
    if (!this.canHear() || key === this.lastChangeId || now - this.lastChange < 500) return;
    this.lastChangeId = key; this.lastChange = now;
    const base = kind === "service" ? 392 : 320 + Math.max(0, Math.min(3, index)) * 32;
    this.note(base, .26, .011);
    this.note(base * 1.5, .28, .003, .025);
  }

  private canHear() { return this.enabled && this.context?.state === "running" && !document.hidden; }

  private air(duration: number, volume: number, cutoff: number) {
    const ctx = this.context, buffer = this.breezeBuffer;
    if (!this.canHear() || !ctx || !buffer) return;
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = buffer;
    filter.type = "lowpass"; filter.frequency.value = cutoff; filter.Q.value = .4;
    gain.gain.setValueAtTime(.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + .055);
    gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + duration);
    source.connect(filter); filter.connect(gain); gain.connect(this.output!);
    source.start(ctx.currentTime, 2); source.stop(ctx.currentTime + duration + .02);
    const cleanup = () => { source.onended = null; source.disconnect(); filter.disconnect(); gain.disconnect(); this.cueCleanup.delete(dispose); };
    const dispose = () => { source.stop(); cleanup(); };
    this.cueCleanup.add(dispose); source.onended = cleanup;
  }

  private stopCues() { [...this.cueCleanup].forEach(cleanup => cleanup()); }

  chapter(id: string) {
    if (!this.canHear() || this.heard.has(id) || performance.now() - this.lastChapter < 2800) return;
    this.heard.add(id);
    this.lastChapter = performance.now();
    this.note(220, .3, .010);
    this.note(330, .28, .003, .035);
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
    source.connect(filter); filter.connect(gain); gain.connect(this.output!);
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
    tone.connect(filter); filter.connect(gain); gain.connect(this.output!);
    tone.start(start); tone.stop(start + duration + .02);
    const cleanup = () => { tone.onended = null; tone.disconnect(); filter.disconnect(); gain.disconnect(); this.cueCleanup.delete(dispose); };
    const dispose = () => { tone.stop(); cleanup(); };
    this.cueCleanup.add(dispose); tone.onended = cleanup;
  }

  suspend() { this.quiet(); this.stopCues(); void this.context?.suspend(); }
  resume() { if (this.enabled) void this.context?.resume(); }
  dispose() {
    this.enabled = false; clearTimeout(this.hush);
    this.stopCues();
    this.breeze?.stop(); this.breeze?.disconnect(); this.breezeFilter?.disconnect(); this.breezeGain?.disconnect();
    this.output?.disconnect();
    void this.context?.close();
  }
}
