/**
 * Real-time Soothing Ambient Sound Generator using Web Audio API.
 * This guarantees real, non-mocked audio feedback for the guided meditations
 * of the Biblioteca Sagrada, customized for anxiety, sleep, and protection.
 */

class AmbientSoundGenerator {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioWorkletNode | ScriptProcessorNode | null = null;
  private oscs: OscillatorNode[] = [];
  private oscGains: GainNode[] = [];
  private filterNode: BiquadFilterNode | null = null;
  private chordInterval: any = null;

  constructor() {
    // Lazy audio context instantiation to comply with browser autocomplete rules
  }

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime); // Safe, low volume default
    this.masterGain.connect(this.ctx.destination);
  }

  public setVolume(volume: number) {
    if (!this.ctx) return;
    const value = Math.max(0, Math.min(0.3, volume * 0.15)); // Cap at safe max
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.4);
    }
  }

  /**
   * Generates a soft, comforting low-pass noise to simulate gentle falling rain
   */
  private playRainSound() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate Pink / Brownish Noise
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Filter white noise to create a gentle, warm rumbling rain/ocean effect
      output[i] = (lastOut * 0.98 + white * 0.02);
      lastOut = output[i];
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter to make it extremely warm and muffled
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noiseSource.start();

    // Store references for cleanup
    (this as any).rainSource = noiseSource;
    (this as any).rainGain = noiseGain;
  }

  /**
   * Generates beautiful ambient synthesizer pad chords (Major chords to signify hope and divinity)
   */
  private playWarmPad(freqs: number[]) {
    if (!this.ctx || !this.masterGain) return;

    // Create 3 oscillators for a lush angelic triadic chord
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      
      const osc = this.ctx.createOscillator();
      // Combine soft Triangle or beautiful Sine waves to avoid harsh tones
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      // Detune slightly for an ensemble feeling (unison choir effect)
      osc.detune.setValueAtTime((idx - 1) * 6, this.ctx.currentTime);

      // Connect to a local gain node to allow fading in and out nicely
      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0, this.ctx.currentTime);
      
      // Low pass filter to remove high buzz, leaving a beautiful ambient cloud
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(320, this.ctx.currentTime);

      osc.connect(lowpass);
      lowpass.connect(oscGain);
      oscGain.connect(this.masterGain);

      // Fade in smoothly
      oscGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 3.0);

      osc.start();

      this.oscs.push(osc);
      this.oscGains.push(oscGain);
    });
  }

  /**
   * Dynamically alters chords over time, translating divine harmony and soothing anxiety
   */
  private startChordProgression(mode: 'sleep' | 'anxiety' | 'protection' | 'inner_peace') {
    let chordIndex = 0;
    
    // Choose healing solfeggio frequencies and hopeful chords (C Major, F Major, Am, G Major)
    // Transposed to lower, soothing octaves (Frequencies around 100-300Hz)
    const progressions = {
      anxiety: [
        [130.81, 164.81, 196.00], // C3, E3, G3 (Rest)
        [174.61, 220.00, 261.63], // F3, A3, C4 (Grace)
        [146.83, 174.61, 220.00], // Dm3, F3, A3 (Seeking)
        [164.81, 196.00, 246.94]  // Em3, G3, B3 (Peace)
      ],
      sleep: [
        [110.00, 130.81, 164.81], // Am2, C3, E3 (Deep reflection)
        [130.81, 164.81, 196.00], // C3, E3, G3 (Comfort)
        [146.83, 174.61, 220.00], // D3, F3, A3 (Stillness)
        [110.00, 130.81, 164.81]  // Loop back
      ],
      protection: [
        [130.81, 196.00, 261.63], // C3, G3, C4 (Divine Shield)
        [174.61, 261.63, 349.23], // F3, C4, F4 (Power)
        [196.00, 293.66, 392.00], // G3, D4, G4 (Glory)
        [130.81, 196.00, 261.63]  // Return to base
      ],
      inner_peace: [
        [136.10, 171.30, 203.90], // Oum-frequency aligned C#3
        [163.20, 205.60, 244.50], // E3 scale
        [145.40, 183.10, 217.80], // D#3 scale
        [136.10, 171.30, 203.90]  // Solfeggio 528Hz sub-harmonics
      ]
    };

    const chords = progressions[mode] || progressions.anxiety;
    
    // Play initial chord
    this.playWarmPad(chords[chordIndex]);

    // Periodically shift chords with smooth transition ramps (cross-fading)
    this.chordInterval = setInterval(() => {
      if (!this.ctx) return;
      chordIndex = (chordIndex + 1) % chords.length;
      const targetChord = chords[chordIndex];

      // Fade out current oscillators
      const currentOscs = [...this.oscs];
      const currentGains = [...this.oscGains];
      this.oscs = [];
      this.oscGains = [];

      currentGains.forEach((gainNode) => {
        if (!this.ctx) return;
        gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 3.0);
      });

      // Cleanup faded out oscillators after transition completes
      setTimeout(() => {
        currentOscs.forEach(o => {
          try { o.stop(); } catch(e){}
        });
      }, 4000);

      // Fade in new chord
      this.playWarmPad(targetChord);

    }, 12000); // Shift chords every 12 seconds
  }

  public start(mode: 'anxiety' | 'sleep' | 'protection' | 'inner_peace') {
    this.stop();
    this.init();
    
    if (!this.ctx) return;
    
    // Resume context if suspended (browser security rules)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Always play a gentle pad base
    this.startChordProgression(mode);

    // For Anxiety and Sleep, we layer soothing rain soundscape
    if (mode === 'anxiety' || mode === 'sleep') {
      this.playRainSound();
    }
    
    // A nice high-frequency chime to ring occasionally (holy bell atmosphere)
    let chimeInterval = setInterval(() => {
      if (!this.ctx || !this.masterGain) return;
      
      const bellFreq = mode === 'protection' ? 528 : 432; // Solfeggio frequencies
      const bell = this.ctx.createOscillator();
      bell.type = 'sine';
      // High bell octave
      bell.frequency.setValueAtTime(bellFreq, this.ctx.currentTime);
      
      const bellGain = this.ctx.createGain();
      bellGain.gain.setValueAtTime(0, this.ctx.currentTime);
      
      bell.connect(bellGain);
      bellGain.connect(this.masterGain);
      
      // Sharp decay bell sweep
      bellGain.gain.setValueAtTime(0.012, this.ctx.currentTime);
      bellGain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + 3.5);
      
      bell.start();
      setTimeout(() => {
        try { bell.stop(); } catch(e){}
      }, 4000);
    }, mode === 'sleep' ? 18000 : 12000);

    (this as any).chimeInterval = chimeInterval;
  }

  public stop() {
    // Clear chord interval
    if (this.chordInterval) {
      clearInterval(this.chordInterval);
      this.chordInterval = null;
    }

    if ((this as any).chimeInterval) {
      clearInterval((this as any).chimeInterval);
      (this as any).chimeInterval = null;
    }

    // Stop rain noise
    if ((this as any).rainSource) {
      try { (this as any).rainSource.stop(); } catch(e){}
      (this as any).rainSource = null;
    }
    if ((this as any).rainGain) {
      (this as any).rainGain.disconnect();
      (this as any).rainGain = null;
    }

    // Stop and clear all chord oscillators
    this.oscs.forEach((osc) => {
      try { osc.stop(); } catch (e) {}
    });
    this.oscs = [];

    this.oscGains.forEach((gain) => {
      try { gain.disconnect(); } catch (e) {}
    });
    this.oscGains = [];
  }
}

export const ambientSound = new AmbientSoundGenerator();
