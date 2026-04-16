// public/audio-processor.js
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.port.onmessage = (e) => {
      // Receive PCM data from main thread to play
      if (e.data.pcm) {
        this.buffer.push(...e.data.pcm);
      }
    };
  }

  process(inputs, outputs, parameters) {
    // Capture mic input
    const input = inputs[0];
    if (input && input[0]) {
      const channelData = input[0];
      const pcm16 = new Int16Array(channelData.length);
      for (let i = 0; i < channelData.length; i++) {
        let s = Math.max(-1, Math.min(1, channelData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      this.port.postMessage({ type: "audio", pcm: pcm16 });
    }

    // Playback received audio
    const output = outputs[0];
    if (output && output[0]) {
      const channelData = output[0];
      for (let i = 0; i < channelData.length; i++) {
        if (this.buffer.length > 0) {
          const val = this.buffer.shift();
          channelData[i] = val / 32768.0; // Int16 to Float32
        } else {
          channelData[i] = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
