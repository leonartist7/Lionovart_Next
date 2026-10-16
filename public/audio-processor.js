// Continuous resampling preserves fractional position across worklet blocks.
// Send 20 ms packets instead of a WebSocket message for every render quantum.
class AudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.ratio = (options.processorOptions?.sampleRate || sampleRate) / 16000;
    this.position = 0;
    this.samples = [];
    this.packet = new Int16Array(320);
    this.packetIndex = 0;
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input) return true;
    for (let i = 0; i < input.length; i++) this.samples.push(input[i]);
    while (this.position + 1 < this.samples.length) {
      const index = Math.floor(this.position);
      const fraction = this.position - index;
      const value = this.samples[index] + fraction * (this.samples[index + 1] - this.samples[index]);
      const clamped = Math.max(-1, Math.min(1, value));
      this.packet[this.packetIndex++] = clamped < 0 ? clamped * 32768 : clamped * 32767;
      this.position += this.ratio;
      if (this.packetIndex === this.packet.length) {
        this.port.postMessage({ type: "audio", pcm: this.packet }, [this.packet.buffer]);
        this.packet = new Int16Array(320);
        this.packetIndex = 0;
      }
    }
    const consumed = Math.min(Math.floor(this.position), this.samples.length - 1);
    this.samples.splice(0, consumed);
    this.position -= consumed;
    return true;
  }
}
registerProcessor("audio-processor", AudioProcessor);
