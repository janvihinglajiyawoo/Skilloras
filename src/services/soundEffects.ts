// Sound Effects and Relaxing Background Study Music Service using Web Audio API
// 100% Offline-friendly, zero external dependencies, zero CORS issues, instant response

export type StudyMusicTrack = 'lofi-chords' | 'calm-piano' | 'deep-focus' | 'zen-garden';

export interface StudyMusicTrackInfo {
  id: StudyMusicTrack;
  title: string;
  description: string;
  mood: string;
  icon: string;
}

export const STUDY_MUSIC_TRACKS: StudyMusicTrackInfo[] = [
  {
    id: 'lofi-chords',
    title: 'Warm Lo-Fi Study Chords',
    description: 'Smooth, nostalgic electric piano chords with soft warm frequencies',
    mood: 'Relaxed & Cozy',
    icon: '☕',
  },
  {
    id: 'calm-piano',
    title: 'Calm Rain & Gentle Piano',
    description: 'Serene acoustic piano tones layered with relaxing ambient rain textures',
    mood: 'Peaceful & Reflective',
    icon: '🌧️',
  },
  {
    id: 'deep-focus',
    title: 'Deep Focus Alpha Waves',
    description: '432Hz ambient drone and warm analog pads designed for concentration',
    mood: 'Deep Concentration',
    icon: '🧠',
  },
  {
    id: 'zen-garden',
    title: 'Zen Garden Meditation',
    description: 'Harmonic singing bell overtones and gentle pentatonic melodies',
    mood: 'Calm & Centered',
    icon: '🍃',
  },
];

export const CELEBRATORY_AFFIRMATIONS = [
  { text: 'Excellent!', emoji: '🌟', subtext: 'Spot-on understanding of the core concept!' },
  { text: 'Brilliant!', emoji: '🎉', subtext: 'Outstanding mastery shown here!' },
  { text: 'Superb!', emoji: '✨', subtext: 'You nailed that question with precision!' },
  { text: 'Outstanding!', emoji: '🚀', subtext: 'Your hard work is clearly paying off!' },
  { text: 'Spot On!', emoji: '🎯', subtext: 'Flawless recall and analytical thinking!' },
  { text: 'Fantastic!', emoji: '💫', subtext: 'Great grasp of this technical topic!' },
  { text: 'Perfection!', emoji: '🏆', subtext: 'Top-tier accuracy on this assessment!' },
  { text: 'Marvelous!', emoji: '👏', subtext: 'Confidence and clarity in your answers!' },
];

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Background music state
  private isMusicPlaying: boolean = false;
  private currentTrack: StudyMusicTrack = 'lofi-chords';
  private musicVolume: number = 0.35; // default 35% calm background volume
  private musicInterval: any = null;
  private ambientNoiseNode: AudioNode | null = null;
  private masterMusicGain: GainNode | null = null;
  private musicSubscribers: Set<(state: { isPlaying: boolean; track: StudyMusicTrack; volume: number }) => void> = new Set();

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // =========================================================================
  // 1. QUIZ CELEBRATING & ERROR SOUND EFFECTS
  // =========================================================================

  /**
   * Play small celebratory sound on correct answer
   * Bright, cheerful ascending pentatonic arpeggio + bell chime
   */
  public playCorrectSound(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Celebratory chord notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.28, now);
      masterGain.connect(ctx.destination);

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        // Bell-like harmonic combination: triangle + sine overtone
        osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        // Quick attack, gentle bell decay
        const startTime = now + idx * 0.08;
        const duration = 0.45;
        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
      });

      // Extra sparkle shimmer
      setTimeout(() => {
        if (!this.ctx) return;
        const shimmerTime = this.ctx.currentTime;
        const shimmerOsc = this.ctx.createOscillator();
        const shimmerGain = this.ctx.createGain();

        shimmerOsc.type = 'sine';
        shimmerOsc.frequency.setValueAtTime(1318.51, shimmerTime); // E6
        shimmerOsc.frequency.exponentialRampToValueAtTime(1567.98, shimmerTime + 0.15); // G6

        shimmerGain.gain.setValueAtTime(0.12, shimmerTime);
        shimmerGain.gain.exponentialRampToValueAtTime(0.0001, shimmerTime + 0.35);

        shimmerOsc.connect(shimmerGain);
        shimmerGain.connect(this.ctx.destination);

        shimmerOsc.start(shimmerTime);
        shimmerOsc.stop(shimmerTime + 0.4);
      }, 260);
    } catch (e) {
      console.warn('Audio effect error:', e);
    }
  }

  /**
   * Play small gentle error sound on wrong answer
   * Soft, non-punitive dual-tone with gentle warm roll-off
   */
  public playErrorSound(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, now);
      masterGain.connect(ctx.destination);

      // Low, gentle tone: F3 (174.61) then D3 (146.83)
      const freqs = [174.61, 146.83];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm sine wave so it's pleasant and not harsh
        osc.type = 'sine';
        const startTime = now + idx * 0.12;
        const duration = 0.22;

        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
      });
    } catch (e) {
      console.warn('Audio effect error:', e);
    }
  }

  // =========================================================================
  // 2. CALM & RELAXING STUDY BACKGROUND MUSIC (GENERATIVE AMBIENCE)
  // =========================================================================

  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  public isMusicActive(): boolean {
    return this.isMusicPlaying;
  }

  public getCurrentTrack(): StudyMusicTrack {
    return this.currentTrack;
  }

  public setTrack(track: StudyMusicTrack): void {
    this.currentTrack = track;
    if (this.isMusicPlaying) {
      // Restart with the newly selected track
      this.stopMusic();
      this.startMusic();
    } else {
      this.notifySubscribers();
    }
  }

  public getVolume(): number {
    return this.musicVolume;
  }

  public setVolume(vol: number): void {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.masterMusicGain && this.ctx) {
      this.masterMusicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.1);
    }
    this.notifySubscribers();
  }

  public subscribeMusicState(cb: (state: { isPlaying: boolean; track: StudyMusicTrack; volume: number }) => void): () => void {
    this.musicSubscribers.add(cb);
    cb({ isPlaying: this.isMusicPlaying, track: this.currentTrack, volume: this.musicVolume });
    return () => this.musicSubscribers.delete(cb);
  }

  private notifySubscribers(): void {
    const state = { isPlaying: this.isMusicPlaying, track: this.currentTrack, volume: this.musicVolume };
    this.musicSubscribers.forEach((cb) => {
      try {
        cb(state);
      } catch (err) {
        // ignore
      }
    });
  }

  /**
   * Start generating calm, relaxing ambient music loop
   */
  public startMusic(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // Master volume node for music
    this.masterMusicGain = ctx.createGain();
    this.masterMusicGain.gain.setValueAtTime(this.musicVolume, ctx.currentTime);
    this.masterMusicGain.connect(ctx.destination);

    // Start mood-specific synthesis
    if (this.currentTrack === 'lofi-chords') {
      this.startLofiChords(ctx);
    } else if (this.currentTrack === 'calm-piano') {
      this.startCalmPianoAndRain(ctx);
    } else if (this.currentTrack === 'deep-focus') {
      this.startDeepFocusDrone(ctx);
    } else if (this.currentTrack === 'zen-garden') {
      this.startZenGarden(ctx);
    }

    this.notifySubscribers();
  }

  public stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.masterMusicGain && this.ctx) {
      try {
        this.masterMusicGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2);
        setTimeout(() => {
          this.masterMusicGain?.disconnect();
          this.masterMusicGain = null;
        }, 300);
      } catch (e) {
        // ignore
      }
    }
    this.notifySubscribers();
  }

  // Track 1: Warm Lo-Fi Study Chords
  // Beautiful progression: Cmaj9 -> Am9 -> Fmaj7 -> Gsus4
  private startLofiChords(ctx: AudioContext): void {
    const chordProgressions = [
      [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
      [220.0, 261.63, 329.63, 392.0, 493.88],  // Am9
      [174.61, 220.0, 261.63, 329.63, 392.0],  // Fmaj7
      [196.0, 261.63, 293.66, 392.0, 440.0],   // Gsus4 add9
    ];

    let chordIndex = 0;
    const playNextChord = () => {
      if (!this.isMusicPlaying || !this.masterMusicGain) return;
      const now = ctx.currentTime;
      const chord = chordProgressions[chordIndex % chordProgressions.length];
      chordIndex++;

      // Play each note of the chord with a soft Rhodes/Wurlitzer envelope
      chord.forEach((freq, noteIdx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Warm low-pass filter characteristic of Lo-Fi
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(850 + (noteIdx * 80), now);
        filter.Q.setValueAtTime(1.2, now);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Soft staggered strum (20ms between notes)
        const noteStart = now + noteIdx * 0.035;
        const noteDuration = 3.8;

        noteGain.gain.setValueAtTime(0.0001, noteStart);
        noteGain.gain.linearRampToValueAtTime(0.07, noteStart + 0.18);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDuration);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.masterMusicGain!);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration + 0.1);
      });

      // Occasional gentle high sparkle note
      if (Math.random() > 0.3) {
        setTimeout(() => {
          if (!this.isMusicPlaying || !this.masterMusicGain || !this.ctx) return;
          const sparkleFreqs = [783.99, 880.0, 987.77, 1046.5, 1174.66];
          const randomFreq = sparkleFreqs[Math.floor(Math.random() * sparkleFreqs.length)];
          const sparkleTime = this.ctx.currentTime;

          const sparkleOsc = this.ctx.createOscillator();
          const sparkleGain = this.ctx.createGain();
          sparkleOsc.type = 'sine';
          sparkleOsc.frequency.setValueAtTime(randomFreq, sparkleTime);

          sparkleGain.gain.setValueAtTime(0.0001, sparkleTime);
          sparkleGain.gain.linearRampToValueAtTime(0.04, sparkleTime + 0.08);
          sparkleGain.gain.exponentialRampToValueAtTime(0.0001, sparkleTime + 1.2);

          sparkleOsc.connect(sparkleGain);
          sparkleGain.connect(this.masterMusicGain);

          sparkleOsc.start(sparkleTime);
          sparkleOsc.stop(sparkleTime + 1.3);
        }, 1200);
      }
    };

    // Play first chord immediately
    playNextChord();
    this.musicInterval = setInterval(playNextChord, 3800);
  }

  // Track 2: Calm Rain & Gentle Piano
  private startCalmPianoAndRain(ctx: AudioContext): void {
    // 1. Soft rain noise layer via filtered pink noise
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1400, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.045, ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    if (this.masterMusicGain) rainGain.connect(this.masterMusicGain);
    rainSource.start();

    // 2. Periodic gentle acoustic piano notes (Pentatonic F major)
    const pianoNotes = [349.23, 392.0, 440.0, 523.25, 587.33, 698.46, 783.99, 880.0];
    const playPianoPhrase = () => {
      if (!this.isMusicPlaying || !this.masterMusicGain) return;
      const now = ctx.currentTime;
      const count = 2 + Math.floor(Math.random() * 3);

      for (let i = 0; i < count; i++) {
        const note = pianoNotes[Math.floor(Math.random() * pianoNotes.length)];
        const noteStart = now + i * (0.35 + Math.random() * 0.25);
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, noteStart);

        noteGain.gain.setValueAtTime(0.0001, noteStart);
        noteGain.gain.linearRampToValueAtTime(0.08, noteStart + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 2.4);

        osc.connect(noteGain);
        noteGain.connect(this.masterMusicGain);

        osc.start(noteStart);
        osc.stop(noteStart + 2.5);
      }
    };

    playPianoPhrase();
    this.musicInterval = setInterval(playPianoPhrase, 3200);
  }

  // Track 3: Deep Focus Alpha Waves (432Hz warm concentration drone)
  private startDeepFocusDrone(ctx: AudioContext): void {
    const baseFreq = 108.0; // 432 / 4 = 108Hz (deep rich fundamental)
    const harmonics = [108.0, 216.0, 324.0, 432.0];

    harmonics.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Slight detune for lush binaural chorus effect
      if (idx > 0) {
        osc.detune.setValueAtTime((idx % 2 === 0 ? 3.5 : -3.5), ctx.currentTime);
      }

      const amp = idx === 0 ? 0.07 : 0.04 / idx;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(amp, ctx.currentTime + 1.5);

      osc.connect(gain);
      if (this.masterMusicGain) gain.connect(this.masterMusicGain);

      osc.start();
    });

    // Slow ambient breathing swell every 6 seconds
    const swellPulse = () => {
      if (!this.isMusicPlaying || !this.masterMusicGain || !this.ctx) return;
      const now = this.ctx.currentTime;
      const swellOsc = this.ctx.createOscillator();
      const swellGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(432.0, now);
      filter.Q.setValueAtTime(2.0, now);

      swellOsc.type = 'triangle';
      swellOsc.frequency.setValueAtTime(432.0, now);

      swellGain.gain.setValueAtTime(0.0001, now);
      swellGain.gain.linearRampToValueAtTime(0.035, now + 2.5);
      swellGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

      swellOsc.connect(filter);
      filter.connect(swellGain);
      swellGain.connect(this.masterMusicGain);

      swellOsc.start(now);
      swellOsc.stop(now + 6.0);
    };

    swellPulse();
    this.musicInterval = setInterval(swellPulse, 6000);
  }

  // Track 4: Zen Garden Meditation (Harmonic Singing Bells & Pads)
  private startZenGarden(ctx: AudioContext): void {
    const zenNotes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33]; // C Pentatonic
    const playZenBell = () => {
      if (!this.isMusicPlaying || !this.masterMusicGain) return;
      const now = ctx.currentTime;
      const primary = zenNotes[Math.floor(Math.random() * zenNotes.length)];
      const harmonics = [primary, primary * 2.01, primary * 3.02];

      harmonics.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const amp = idx === 0 ? 0.08 : 0.02;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(amp, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(gain);
        gain.connect(this.masterMusicGain!);

        osc.start(now);
        osc.stop(now + 4.0);
      });
    };

    playZenBell();
    this.musicInterval = setInterval(playZenBell, 3500);
  }
}

export const audioService = new AudioService();
