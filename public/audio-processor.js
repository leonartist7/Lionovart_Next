// public/audio-processor.js
// Dedicated exclusively to capturing microphone input and safely downsampling 
// to Gemini's strict 16kHz 16-bit PCM requirement, bypassing iOS/Safari hardware locks.

class AudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    // Grab the hardware sample rate from the main thread, default to 16k if missing
    this.inSampleRate = options.processorOptions?.sampleRate || 16000;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input && input[0]) {
      const channelData = input[0];
      
      // Calculate how many samples to drop/interpolate to reach exactly 16000Hz
      const ratio = this.inSampleRate / 16000;
      const newLength = Math.max(1, Math.round(channelData.length / ratio));
      const pcm16 = new Int16Array(newLength);
      
      for (let i = 0; i < newLength; i++) {
        const originalIndex = i * ratio;
        const index = Math.floor(originalIndex);
        const t = originalIndex - index;
        
        // Linear interpolation for smooth downsampling without metallic artifacts
        const val1 = channelData[index] || 0;
        const val2 = channelData[index + 1] || val1;
        const sample = val1 + t * (val2 - val1);
        
        // Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
        let s = Math.max(-1, Math.min(1, sample));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      
      // Send the perfectly formatted 16kHz chunk to the main thread
      this.port.postMessage({ type: "audio", pcm: pcm16 });
    }
    
    // We intentionally do not handle playback here anymore.
    // Main thread uses AudioBufferSourceNode for flawless 24kHz native playback.
    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
