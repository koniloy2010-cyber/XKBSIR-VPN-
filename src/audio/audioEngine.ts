import {
  makeDistortionCurve,
  mapDbToGain,
  clamp,
  calculateVoiceSyncModulation,
  getBeatTriggers,
  calculateBoostedGain,
  make1000XSoftClipperCurve,
  map300ScaleToGain,
  calculate30000XGain,
} from './audioMath.ts';
import {
  AudioBoxId,
  BoxConfig,
  EqualizerBands,
  VoiceSyncConfig,
  Boost1000XConfig,
  XKBVoiceConfig,
} from './types.ts';

export class AudioEffectsEngine {
  private ctx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private micGain: GainNode | null = null;
  private vocalPunchGain: GainNode | null = null; // Vocal loudness boost
  private micMuteGain: GainNode | null = null; // Speaker feedback prevention
  private micAnalyser: AnalyserNode | null = null;
  private masterAnalyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private boostPreAmpGain: GainNode | null = null; // Extreme 1000X / 30000X boost
  private boostSaturator: WaveShaperNode | null = null; // Soft-clipper to prevent digital harshness
  private masterCompressor: DynamicsCompressorNode | null = null;
  private recordDestination: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  // Dedicated XKB DSP filters
  private xkbBassFilter: BiquadFilterNode | null = null;
  private xkbClearVoiceFilter: BiquadFilterNode | null = null;
  private xkbHighPitchFilter: BiquadFilterNode | null = null;
  private xkbNoiseFilter: BiquadFilterNode | null = null;

  private xkbConfig: XKBVoiceConfig = {
    micBoostScale: 150,
    enhancement30000X: 30000,
    is30000XEnabled: false,
    hdMicMode: true,
    clearVoiceMode: true,
    powerfulVoiceMode: false,
    safeOutputLimiter: true,
    bassControl: 65,
    highPitchControl: 60,
    noiseReduction: true,
    echoControl: true,
    receiverOptimization: true,
  };

  private boost1000XConfig: Boost1000XConfig = {
    enabled: false,
    multiplier: 1000,
    vocalPunch: 5,
    grrrOverdrive: 5,
    beatPunch: 5,
  };

  // 5-band Equalizer nodes
  private eqFilters: {
    band60: BiquadFilterNode | null;
    band230: BiquadFilterNode | null;
    band910: BiquadFilterNode | null;
    band3600: BiquadFilterNode | null;
    band14000: BiquadFilterNode | null;
  } = {
    band60: null,
    band230: null,
    band910: null,
    band3600: null,
    band14000: null,
  };

  // Box 1: Deep Grrr Bass Nodes
  private box1 = {
    gain: null as GainNode | null,
    osc: null as OscillatorNode | null,
    subOsc: null as OscillatorNode | null,
    lfo: null as OscillatorNode | null,
    lfoGain: null as GainNode | null,
    distortion: null as WaveShaperNode | null,
    filter: null as BiquadFilterNode | null,
    baseDrive: 45,
    baseFreq: 52,
    baseLfoRate: 11,
  };

  // Box 2: Heavy Vibration Nodes
  private box2 = {
    gain: null as GainNode | null,
    osc1: null as OscillatorNode | null,
    osc2: null as OscillatorNode | null,
    ringModOsc: null as OscillatorNode | null,
    ringModGain: null as GainNode | null,
    filter: null as BiquadFilterNode | null,
    baseFreq: 42,
    vibrationDepth: 0.8,
  };

  // Box 3: Electronic Beat Nodes & Clock
  private box3 = {
    gain: null as GainNode | null,
    bpm: 120,
    pattern: 'trap',
    step: 0,
    timerId: null as number | null,
    noiseBuffer: null as AudioBuffer | null,
  };

  // Box 4: Advanced Bass & Grrr Combo Nodes
  private box4 = {
    gain: null as GainNode | null,
    oscMain: null as OscillatorNode | null,
    oscHarmonic: null as OscillatorNode | null,
    distortion: null as WaveShaperNode | null,
    formantFilter1: null as BiquadFilterNode | null,
    formantFilter2: null as BiquadFilterNode | null,
    comboIntensity: 0.85,
  };

  // State
  private isInitialized = false;
  private isMicActive = false;
  private isCallModeActive = false;
  private voicePassthrough = true;
  private masterVolume = 0.85;
  private micInputGain = 1.0;
  private currentDeviceId: string = '';
  private voiceRms = 0;
  private voiceModulationAmount = 0;
  private animFrameId: number | null = null;
  private onVoiceDataCallback: ((rms: number, modulation: number) => void) | null = null;
  private onBeatStepCallback: ((step: number) => void) | null = null;

  private voiceSyncConfig: VoiceSyncConfig = {
    enabled: true,
    sensitivity: 1.8,
    threshold: 0.03,
    modulateGrrrDrive: true,
    modulateVibration: true,
    modulateBeatSync: true,
  };

  private boxesConfig: Record<AudioBoxId, BoxConfig> = {
    box1_deep_grrr: {
      id: 'box1_deep_grrr',
      name: 'Deep Grrr Bass',
      nameBn: 'ডিপ গ্রার (Grrr) বেস',
      desc: 'Sub-harmonic growl with motorized rasp vibration',
      descBn: 'মোটরাইজড ঘ্যার ঘ্যার সাউন্ড ও সাব-হারমোনিক গ্রোওল',
      color: 'from-amber-500 to-red-600',
      enabled: true,
      volume: 0.75,
      parameter1: 0.65, // Drive
      parameter2: 0.55, // Flutter speed
      param1Label: 'Grrr Drive',
      param1LabelBn: 'ড্রাইভ তীব্রতা',
      param2Label: 'Flutter Speed',
      param2LabelBn: 'ঘ্যার ঘ্যার গতি',
    },
    box2_heavy_vibration: {
      id: 'box2_heavy_vibration',
      name: 'Heavy Vibration',
      nameBn: 'হেভি ভাইব্রেশন সাউন্ড',
      desc: 'Acoustic detuned sub-beating with physical rumble',
      descBn: 'তীব্র কাঁপন ও ডিপ সাব-উফার রেজোন্যান্স ভাইব্রেশন',
      color: 'from-cyan-500 to-blue-600',
      enabled: true,
      volume: 0.7,
      parameter1: 0.8, // Vibration depth
      parameter2: 0.4, // Rumble Hz
      param1Label: 'Vibration Depth',
      param1LabelBn: 'কম্পনের গভীরতা',
      param2Label: 'Rumble Hz',
      param2LabelBn: 'সাব ফ্রিকোয়েন্সি',
    },
    box3_electronic_beat: {
      id: 'box3_electronic_beat',
      name: 'Electronic Beat',
      nameBn: 'ইলেকট্রনিক বিট সিস্টেম',
      desc: 'Rhythmic 808 sub-pulse, kick & syncable beat loops',
      descBn: '৮০৮ সাব কিক ও কথার রিদমের সাথে বিট সিঙ্ক',
      color: 'from-purple-500 to-indigo-600',
      enabled: true,
      volume: 0.65,
      parameter1: 0.5, // 120 BPM
      parameter2: 0.8, // Punch
      param1Label: 'Tempo (BPM)',
      param1LabelBn: 'টেম্পো (BPM)',
      param2Label: 'Beat Punch',
      param2LabelBn: 'পাঞ্চ তীব্রতা',
    },
    box4_combo: {
      id: 'box4_combo',
      name: 'Bass & Grrr Combo',
      nameBn: 'কম্বো বেস ও গ্রার সাউন্ড',
      desc: 'Maximum overdrive dual-saw growler with formant sweep',
      descBn: 'দ্বিগুণ পাওয়ারফুল ওভারড্রাইভ কম্বো ও ফিল্টার সুইপ',
      color: 'from-emerald-500 to-teal-600',
      enabled: false,
      volume: 0.7,
      parameter1: 0.75, // Overdrive
      parameter2: 0.6, // Formant Resonance
      param1Label: 'Growl Intensity',
      param1LabelBn: 'গ্রোওল তীব্রতা',
      param2Label: 'Formant Resonance',
      param2LabelBn: 'রেজোন্যান্স সুইপ',
    },
  };

  private eqBands: EqualizerBands = {
    band60: 4.5, // boost sub bass
    band230: 2.0, // warm body
    band910: -1.0, // scoop muddy mids
    band3600: 3.0, // vocal presence & rasp grit
    band14000: 1.5, // crisp top
  };

  // --- INITIALIZATION ---
  public async initAudio(): Promise<boolean> {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return true;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx({ latencyHint: 'interactive' });

      // Master compressor (Limiter)
      this.masterCompressor = this.ctx.createDynamicsCompressor();
      this.masterCompressor.threshold.setValueAtTime(-3, this.ctx.currentTime);
      this.masterCompressor.knee.setValueAtTime(6, this.ctx.currentTime);
      this.masterCompressor.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.masterCompressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.masterCompressor.release.setValueAtTime(0.15, this.ctx.currentTime);

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

      // Master Analyser
      this.masterAnalyser = this.ctx.createAnalyser();
      this.masterAnalyser.fftSize = 512;
      this.masterAnalyser.smoothingTimeConstant = 0.8;

      // Recording Destination
      this.recordDestination = this.ctx.createMediaStreamDestination();

      // 1000X Master Boost Stage & Soft-Saturator
      this.boostPreAmpGain = this.ctx.createGain();
      const initialBoost = calculateBoostedGain(1.0, this.boost1000XConfig.multiplier, this.boost1000XConfig.enabled);
      this.boostPreAmpGain.gain.setValueAtTime(initialBoost, this.ctx.currentTime);

      this.boostSaturator = this.ctx.createWaveShaper();
      this.boostSaturator.curve = make1000XSoftClipperCurve();
      this.boostSaturator.oversample = '4x';

      // Connect: Master Gain -> Boost Gain -> Boost Saturator -> Compressor -> Analyser -> Output
      this.masterGain.connect(this.boostPreAmpGain);
      this.boostPreAmpGain.connect(this.boostSaturator);
      this.boostSaturator.connect(this.masterCompressor);
      this.masterCompressor.connect(this.masterAnalyser);
      this.masterAnalyser.connect(this.ctx.destination);
      this.masterAnalyser.connect(this.recordDestination);

      // Create noise buffer for electronic percussion
      this.initNoiseBuffer();

      // Setup 5-Band Equalizer
      this.setupEqualizer();

      // Setup the 4 specialized synthesizers
      this.setupBox1DeepGrrr();
      this.setupBox2HeavyVibration();
      this.setupBox3ElectronicBeat();
      this.setupBox4Combo();

      // Start Beat sequencer timer
      this.startBeatClock();

      // Start envelope analysis loop
      this.startAnalysisLoop();

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.error('Failed to initialize AudioContext:', err);
      return false;
    }
  }

  private initNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    this.box3.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.box3.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  // --- EQUALIZER SETUP ---
  private setupEqualizer() {
    if (!this.ctx) return;

    // 60 Hz - Lowshelf
    const f60 = this.ctx.createBiquadFilter();
    f60.type = 'lowshelf';
    f60.frequency.value = 60;
    f60.gain.value = this.eqBands.band60;

    // 230 Hz - Peaking
    const f230 = this.ctx.createBiquadFilter();
    f230.type = 'peaking';
    f230.frequency.value = 230;
    f230.Q.value = 1.0;
    f230.gain.value = this.eqBands.band230;

    // 910 Hz - Peaking
    const f910 = this.ctx.createBiquadFilter();
    f910.type = 'peaking';
    f910.frequency.value = 910;
    f910.Q.value = 1.0;
    f910.gain.value = this.eqBands.band910;

    // 3600 Hz - Peaking
    const f3600 = this.ctx.createBiquadFilter();
    f3600.type = 'peaking';
    f3600.frequency.value = 3600;
    f3600.Q.value = 1.2;
    f3600.gain.value = this.eqBands.band3600;

    // 14000 Hz - Highshelf
    const f14000 = this.ctx.createBiquadFilter();
    f14000.type = 'highshelf';
    f14000.frequency.value = 14000;
    f14000.gain.value = this.eqBands.band14000;

    // Dedicated XKB Bass Control Filter (Deep Bass Enhancement)
    this.xkbBassFilter = this.ctx.createBiquadFilter();
    this.xkbBassFilter.type = 'lowshelf';
    this.xkbBassFilter.frequency.value = 85;
    this.xkbBassFilter.gain.value = (this.xkbConfig.bassControl - 50) * 0.35;

    // Dedicated XKB Clear Voice Intelligibility Filter (Speech Presence Peak)
    this.xkbClearVoiceFilter = this.ctx.createBiquadFilter();
    this.xkbClearVoiceFilter.type = 'peaking';
    this.xkbClearVoiceFilter.frequency.value = 2800;
    this.xkbClearVoiceFilter.Q.value = 1.4;
    this.xkbClearVoiceFilter.gain.value = this.xkbConfig.clearVoiceMode ? 6.5 : 0;

    // Dedicated XKB High Pitch & Treble Grit Filter
    this.xkbHighPitchFilter = this.ctx.createBiquadFilter();
    this.xkbHighPitchFilter.type = 'highshelf';
    this.xkbHighPitchFilter.frequency.value = 9000;
    this.xkbHighPitchFilter.gain.value = (this.xkbConfig.highPitchControl - 50) * 0.3;

    // Dedicated XKB Noise Reduction Highpass Filter
    this.xkbNoiseFilter = this.ctx.createBiquadFilter();
    this.xkbNoiseFilter.type = 'highpass';
    this.xkbNoiseFilter.frequency.value = this.xkbConfig.noiseReduction ? 65 : 10;
    this.xkbNoiseFilter.Q.value = 0.7;

    // Chain: 60 -> 230 -> 910 -> 3600 -> 14000 -> NoiseFilter -> Bass -> ClearVoice -> HighPitch -> Master Gain
    f60.connect(f230);
    f230.connect(f910);
    f910.connect(f3600);
    f3600.connect(f14000);
    f14000.connect(this.xkbNoiseFilter);
    this.xkbNoiseFilter.connect(this.xkbBassFilter);
    this.xkbBassFilter.connect(this.xkbClearVoiceFilter);
    this.xkbClearVoiceFilter.connect(this.xkbHighPitchFilter);
    this.xkbHighPitchFilter.connect(this.masterGain!);

    this.eqFilters = {
      band60: f60,
      band230: f230,
      band910: f910,
      band3600: f3600,
      band14000: f14000,
    };
  }

  // --- BOX 1: DEEP GRRR BASS SETUP ---
  private setupBox1DeepGrrr() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.boxesConfig.box1_deep_grrr.enabled ? this.boxesConfig.box1_deep_grrr.volume : 0, now);

    // Main growl oscillator (sawtooth for rich harmonic spectrum)
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(52, now); // ~G#1 / A1 deep sub

    // Sub oscillator (triangle an octave lower)
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(26, now);

    // Motorized flutter LFO (creates the distinctive "ঘ্যার ঘ্যার" rasp)
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sawtooth';
    lfo.frequency.setValueAtTime(11, now); // 11Hz flutter

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(18, now); // LFO depth in Hz

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // WaveShaper distortion node for aggressive growl saturation
    const distortion = this.ctx.createWaveShaper();
    distortion.curve = makeDistortionCurve(50);
    distortion.oversample = '4x';

    // Resonant lowpass filter to tame harsh highs and amplify sub grrr body
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, now);
    filter.Q.setValueAtTime(3.8, now);

    // Connect: (Osc + SubOsc) -> Distortion -> Filter -> Gain -> EQ Input (f60)
    osc.connect(distortion);
    subOsc.connect(distortion);
    distortion.connect(filter);
    filter.connect(gain);
    gain.connect(this.eqFilters.band60!);

    osc.start();
    subOsc.start();
    lfo.start();

    this.box1 = {
      gain,
      osc,
      subOsc,
      lfo,
      lfoGain,
      distortion,
      filter,
      baseDrive: 50,
      baseFreq: 52,
      baseLfoRate: 11,
    };
  }

  // --- BOX 2: HEAVY VIBRATION SETUP ---
  private setupBox2HeavyVibration() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.boxesConfig.box2_heavy_vibration.enabled ? this.boxesConfig.box2_heavy_vibration.volume : 0, now);

    // Two detuned sub oscillators producing physical acoustic beating (vibration)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(38, now);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(42.5, now); // 4.5Hz acoustic throbbing vibration

    // Ring modulator / AM tremolo to create tactile speaker cone excursion
    const ringModOsc = this.ctx.createOscillator();
    ringModOsc.type = 'sine';
    ringModOsc.frequency.setValueAtTime(32, now);

    const ringModGain = this.ctx.createGain();
    ringModGain.gain.setValueAtTime(0.5, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);
    filter.Q.setValueAtTime(2.0, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.eqFilters.band60!);

    osc1.start();
    osc2.start();
    ringModOsc.start();

    this.box2 = {
      gain,
      osc1,
      osc2,
      ringModOsc,
      ringModGain,
      filter,
      baseFreq: 40,
      vibrationDepth: 0.8,
    };
  }

  // --- BOX 3: ELECTRONIC BEAT SETUP ---
  private setupBox3ElectronicBeat() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.boxesConfig.box3_electronic_beat.enabled ? this.boxesConfig.box3_electronic_beat.volume : 0, now);
    gain.connect(this.eqFilters.band60!);

    this.box3.gain = gain;
  }

  private triggerElectronicKick(time: number, punch: number = 0.8) {
    if (!this.ctx || !this.box3.gain || !this.boxesConfig.box3_electronic_beat.enabled) return;

    // Pitch envelope drop: 150Hz -> 38Hz in 0.1s
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140 * punch + 20, time);
    osc.frequency.exponentialRampToValueAtTime(36, time + 0.12);

    // Amplitude envelope
    gainNode.gain.setValueAtTime(1.0, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gainNode);
    gainNode.connect(this.box3.gain);

    osc.start(time);
    osc.stop(time + 0.36);
  }

  private triggerElectronicHihat(time: number) {
    if (!this.ctx || !this.box3.gain || !this.box3.noiseBuffer || !this.boxesConfig.box3_electronic_beat.enabled) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.box3.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.box3.gain);

    noise.start(time);
    noise.stop(time + 0.06);
  }

  private triggerElectronicSnare(time: number) {
    if (!this.ctx || !this.box3.gain || !this.box3.noiseBuffer || !this.boxesConfig.box3_electronic_beat.enabled) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.box3.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, time);
    filter.Q.setValueAtTime(1.5, time);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.4, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.box3.gain);

    noise.start(time);
    noise.stop(time + 0.2);
  }

  private startBeatClock() {
    if (this.box3.timerId) {
      window.clearInterval(this.box3.timerId);
    }

    // 16th note interval at given BPM
    const bpm = this.box3.bpm || 120;
    const intervalMs = (60000 / bpm) / 4;

    this.box3.timerId = window.setInterval(() => {
      if (!this.ctx) return;
      this.box3.step = (this.box3.step + 1) % 16;
      const triggers = getBeatTriggers(this.box3.step, this.box3.pattern);

      const now = this.ctx.currentTime;
      if (triggers.kick) {
        this.triggerElectronicKick(now, this.boxesConfig.box3_electronic_beat.parameter2);
      }
      if (triggers.snare) {
        this.triggerElectronicSnare(now);
      }
      if (triggers.hihat) {
        this.triggerElectronicHihat(now);
      }

      if (this.onBeatStepCallback) {
        this.onBeatStepCallback(this.box3.step);
      }
    }, intervalMs);
  }

  // --- BOX 4: COMBO BASS & GRRR SETUP ---
  private setupBox4Combo() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.boxesConfig.box4_combo.enabled ? this.boxesConfig.box4_combo.volume : 0, now);

    const oscMain = this.ctx.createOscillator();
    oscMain.type = 'sawtooth';
    oscMain.frequency.setValueAtTime(46, now); // Sub F#

    const oscHarmonic = this.ctx.createOscillator();
    oscHarmonic.type = 'sawtooth';
    oscHarmonic.frequency.setValueAtTime(69.3, now); // Fifth harmonic grit

    const distortion = this.ctx.createWaveShaper();
    distortion.curve = makeDistortionCurve(75);
    distortion.oversample = '4x';

    const formantFilter1 = this.ctx.createBiquadFilter();
    formantFilter1.type = 'peaking';
    formantFilter1.frequency.setValueAtTime(320, now);
    formantFilter1.gain.setValueAtTime(10, now);
    formantFilter1.Q.setValueAtTime(4.0, now);

    const formantFilter2 = this.ctx.createBiquadFilter();
    formantFilter2.type = 'lowpass';
    formantFilter2.frequency.setValueAtTime(650, now);
    formantFilter2.Q.setValueAtTime(3.2, now);

    oscMain.connect(distortion);
    oscHarmonic.connect(distortion);
    distortion.connect(formantFilter1);
    formantFilter1.connect(formantFilter2);
    formantFilter2.connect(gain);
    gain.connect(this.eqFilters.band60!);

    oscMain.start();
    oscHarmonic.start();

    this.box4 = {
      gain,
      oscMain,
      oscHarmonic,
      distortion,
      formantFilter1,
      formantFilter2,
      comboIntensity: 0.85,
    };
  }

  // --- MICROPHONE INPUT & DEVICE SELECTION ---
  public async startMicrophone(deviceId?: string): Promise<boolean> {
    await this.initAudio();
    if (!this.ctx) return false;

    try {
      if (this.micStream) {
        this.micStream.getTracks().forEach((track) => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      };

      this.micStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.micSource = this.ctx.createMediaStreamSource(this.micStream);

      // Mic input gain
      this.micGain = this.ctx.createGain();
      this.micGain.gain.setValueAtTime(this.micInputGain, this.ctx.currentTime);

      // Vocal Punch Pre-Amp (1000X booster for vocal strength)
      this.vocalPunchGain = this.ctx.createGain();
      const punchMultiplier = this.boost1000XConfig.enabled ? (1 + this.boost1000XConfig.vocalPunch * 3.5) : 1.0;
      this.vocalPunchGain.gain.setValueAtTime(punchMultiplier, this.ctx.currentTime);

      // Mic passthrough switch (muted if user wants only effects, or live passthrough to hear voice)
      this.micMuteGain = this.ctx.createGain();
      this.micMuteGain.gain.setValueAtTime(this.voicePassthrough ? 1.0 : 0, this.ctx.currentTime);

      // Mic Analyser for envelope following
      this.micAnalyser = this.ctx.createAnalyser();
      this.micAnalyser.fftSize = 256;
      this.micAnalyser.smoothingTimeConstant = 0.5;

      // Connect: Mic Source -> Mic Analyser
      this.micSource.connect(this.micAnalyser);
      // Mic Source -> Mic Gain -> Vocal Punch Gain -> Mic Mute Gain -> Equalizer input
      this.micSource.connect(this.micGain);
      this.micGain.connect(this.vocalPunchGain);
      this.vocalPunchGain.connect(this.micMuteGain);
      this.micMuteGain.connect(this.eqFilters.band60!);

      this.isMicActive = true;
      if (deviceId) this.currentDeviceId = deviceId;
      return true;
    } catch (err) {
      console.warn('Microphone permission or connection denied:', err);
      this.isMicActive = false;
      return false;
    }
  }

  public stopMicrophone() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    this.isMicActive = false;
  }

  // --- REAL-TIME VOICE-SYNC ENVELOPE FOLLOWER ---
  private startAnalysisLoop() {
    const micDataArray = new Uint8Array(128);

    const update = () => {
      if (this.ctx && this.micAnalyser && this.isMicActive) {
        this.micAnalyser.getByteTimeDomainData(micDataArray);

        // Compute RMS
        let sumSquares = 0;
        for (let i = 0; i < micDataArray.length; i++) {
          const norm = (micDataArray[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        const rms = Math.sqrt(sumSquares / micDataArray.length);
        this.voiceRms = rms;

        // Calculate modulation
        if (this.voiceSyncConfig.enabled) {
          this.voiceModulationAmount = calculateVoiceSyncModulation(
            rms,
            this.voiceSyncConfig.sensitivity,
            this.voiceSyncConfig.threshold
          );

          this.applyVoiceSyncModulation(this.voiceModulationAmount);
        } else {
          this.voiceModulationAmount = 0;
        }

        if (this.onVoiceDataCallback) {
          this.onVoiceDataCallback(this.voiceRms, this.voiceModulationAmount);
        }
      }

      this.animFrameId = requestAnimationFrame(update);
    };

    update();
  }

  private applyVoiceSyncModulation(mod: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Modulate Box 1 Deep Grrr
    if (this.boxesConfig.box1_deep_grrr.enabled && this.box1.lfo && this.box1.filter) {
      // Faster, more aggressive flutter speed when user speaks loudly
      const dynamicLfo = this.box1.baseLfoRate + mod * 14;
      this.box1.lfo.frequency.setTargetAtTime(dynamicLfo, now, 0.05);

      // Open filter cutoff with voice presence
      const cutoff = 380 + mod * 550;
      this.box1.filter.frequency.setTargetAtTime(cutoff, now, 0.05);
    }

    // 2. Modulate Box 2 Heavy Vibration
    if (this.boxesConfig.box2_heavy_vibration.enabled && this.box2.filter && this.box2.gain) {
      // Deep resonant boost on voice peak
      const targetGain = this.boxesConfig.box2_heavy_vibration.volume * (1 + mod * 0.5);
      this.box2.gain.gain.setTargetAtTime(targetGain, now, 0.05);
    }

    // 3. Modulate Box 4 Combo
    if (this.boxesConfig.box4_combo.enabled && this.box4.formantFilter2) {
      const formantCutoff = 600 + mod * 1200;
      this.box4.formantFilter2.frequency.setTargetAtTime(formantCutoff, now, 0.05);
    }

    // 4. Beat Sync Kick Onset
    if (
      this.boxesConfig.box3_electronic_beat.enabled &&
      this.box3.pattern === 'voice_sync' &&
      mod > 0.4
    ) {
      // Trigger instant beat punch on strong syllable
      this.triggerElectronicKick(now, 0.9);
    }
  }

  // --- AUTOMATIC CALL MODE ---
  public setCallMode(active: boolean) {
    this.isCallModeActive = active;
    if (active) {
      // Automatically ensure Box 1 Deep Grrr and Box 2 Vibration are active for continuous background sound
      this.setBoxEnabled('box1_deep_grrr', true);
      this.setBoxEnabled('box2_heavy_vibration', true);
    }
  }

  // --- CONTROLS & SETTERS ---
  public setMasterVolume(vol: number) {
    this.masterVolume = clamp(vol, 0, 1);
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.03);
    }
  }

  public setMicInputGain(gain: number) {
    this.micInputGain = clamp(gain, 0, 3);
    if (this.ctx && this.micGain) {
      this.micGain.gain.setTargetAtTime(this.micInputGain, this.ctx.currentTime, 0.03);
    }
  }

  public setVoicePassthrough(enabled: boolean) {
    this.voicePassthrough = enabled;
    if (this.ctx && this.micMuteGain) {
      this.micMuteGain.gain.setTargetAtTime(enabled ? 1.0 : 0.0, this.ctx.currentTime, 0.03);
    }
  }

  public setBoxEnabled(id: AudioBoxId, enabled: boolean) {
    this.boxesConfig[id].enabled = enabled;
    const now = this.ctx ? this.ctx.currentTime : 0;
    const targetVol = enabled ? this.boxesConfig[id].volume : 0;

    if (id === 'box1_deep_grrr' && this.box1.gain && this.ctx) {
      this.box1.gain.gain.setTargetAtTime(targetVol, now, 0.05);
    } else if (id === 'box2_heavy_vibration' && this.box2.gain && this.ctx) {
      this.box2.gain.gain.setTargetAtTime(targetVol, now, 0.05);
    } else if (id === 'box3_electronic_beat' && this.box3.gain && this.ctx) {
      this.box3.gain.gain.setTargetAtTime(targetVol, now, 0.05);
    } else if (id === 'box4_combo' && this.box4.gain && this.ctx) {
      this.box4.gain.gain.setTargetAtTime(targetVol, now, 0.05);
    }
  }

  public setBoxVolume(id: AudioBoxId, volume: number) {
    const vol = clamp(volume, 0, 1);
    this.boxesConfig[id].volume = vol;
    if (!this.ctx || !this.boxesConfig[id].enabled) return;

    const now = this.ctx.currentTime;
    if (id === 'box1_deep_grrr' && this.box1.gain) {
      this.box1.gain.gain.setTargetAtTime(vol, now, 0.03);
    } else if (id === 'box2_heavy_vibration' && this.box2.gain) {
      this.box2.gain.gain.setTargetAtTime(vol, now, 0.03);
    } else if (id === 'box3_electronic_beat' && this.box3.gain) {
      this.box3.gain.gain.setTargetAtTime(vol, now, 0.03);
    } else if (id === 'box4_combo' && this.box4.gain) {
      this.box4.gain.gain.setTargetAtTime(vol, now, 0.03);
    }
  }

  public setBoxParameter(id: AudioBoxId, paramNum: 1 | 2, value: number) {
    const val = clamp(value, 0, 1);
    if (paramNum === 1) {
      this.boxesConfig[id].parameter1 = val;
    } else {
      this.boxesConfig[id].parameter2 = val;
    }

    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (id === 'box1_deep_grrr') {
      if (paramNum === 1 && this.box1.distortion) {
        // Drive (distortion amount 10 to 120)
        const drive = 15 + val * 105;
        this.box1.distortion.curve = makeDistortionCurve(drive);
      } else if (paramNum === 2 && this.box1.lfo) {
        // Flutter speed (4Hz to 24Hz)
        const speed = 4 + val * 20;
        this.box1.baseLfoRate = speed;
        this.box1.lfo.frequency.setTargetAtTime(speed, now, 0.05);
      }
    } else if (id === 'box2_heavy_vibration') {
      if (paramNum === 1 && this.box2.osc2) {
        // Detune amount
        const detuneHz = 35 + val * 15;
        this.box2.osc2.frequency.setTargetAtTime(detuneHz, now, 0.05);
      } else if (paramNum === 2 && this.box2.osc1) {
        // Base Rumble Hz
        const baseHz = 28 + val * 25;
        this.box2.osc1.frequency.setTargetAtTime(baseHz, now, 0.05);
      }
    } else if (id === 'box3_electronic_beat') {
      if (paramNum === 1) {
        // BPM (80 to 160)
        const bpm = Math.round(80 + val * 80);
        this.box3.bpm = bpm;
        this.startBeatClock();
      }
    } else if (id === 'box4_combo') {
      if (paramNum === 1 && this.box4.distortion) {
        const drive = 30 + val * 120;
        this.box4.distortion.curve = makeDistortionCurve(drive);
      } else if (paramNum === 2 && this.box4.formantFilter1) {
        const freq = 200 + val * 600;
        this.box4.formantFilter1.frequency.setTargetAtTime(freq, now, 0.05);
      }
    }
  }

  public setBeatPattern(pattern: 'trap' | 'grrr_drill' | 'cyber_pulse' | 'voice_sync') {
    this.box3.pattern = pattern;
  }

  public setEqualizerBand(band: keyof EqualizerBands, dbValue: number) {
    const db = clamp(dbValue, -12, 12);
    this.eqBands[band] = db;
    const filter = this.eqFilters[band];
    if (filter && this.ctx) {
      filter.gain.setTargetAtTime(db, this.ctx.currentTime, 0.03);
    }
  }

  public setVoiceSyncConfig(config: Partial<VoiceSyncConfig>) {
    this.voiceSyncConfig = { ...this.voiceSyncConfig, ...config };
  }

  // --- 1000X EXTREME SOUND & VOCAL BOOST ---
  public setBoost1000X(config: Partial<Boost1000XConfig>) {
    this.boost1000XConfig = { ...this.boost1000XConfig, ...config };
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Apply master boosted gain
    if (this.boostPreAmpGain) {
      const gainVal = calculateBoostedGain(
        1.0,
        this.boost1000XConfig.multiplier,
        this.boost1000XConfig.enabled
      );
      this.boostPreAmpGain.gain.setTargetAtTime(gainVal, now, 0.05);
    }

    // Apply vocal punch multiplier
    if (this.vocalPunchGain) {
      const vocalVal = this.boost1000XConfig.enabled
        ? 1.0 + this.boost1000XConfig.vocalPunch * 3.5
        : 1.0;
      this.vocalPunchGain.gain.setTargetAtTime(vocalVal, now, 0.05);
    }

    // Overdrive Box 1 Deep Grrr
    if (this.box1.distortion) {
      const baseDrive = 15 + this.boxesConfig.box1_deep_grrr.parameter1 * 105;
      const boostDrive = this.boost1000XConfig.enabled
        ? baseDrive * (1 + this.boost1000XConfig.grrrOverdrive * 0.4)
        : baseDrive;
      this.box1.distortion.curve = makeDistortionCurve(boostDrive);
    }

    // Overdrive Box 2 Heavy Vibration
    if (this.box2.gain) {
      const baseVol = this.boxesConfig.box2_heavy_vibration.enabled
        ? this.boxesConfig.box2_heavy_vibration.volume
        : 0;
      const targetVol = this.boost1000XConfig.enabled ? baseVol * 1.5 : baseVol;
      this.box2.gain.gain.setTargetAtTime(targetVol, now, 0.05);
    }
  }

  public getBoost1000XConfig(): Boost1000XConfig {
    return this.boost1000XConfig;
  }

  // --- XKB VPN PREMIUM VOICE PROCESSING ---
  public setXKBConfig(config: Partial<XKBVoiceConfig>) {
    this.xkbConfig = { ...this.xkbConfig, ...config };
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Microphone 0-300 Display Scale Gain
    if (this.micGain && this.isMicActive) {
      const scaleGain = map300ScaleToGain(this.xkbConfig.micBoostScale);
      this.micGain.gain.setTargetAtTime(scaleGain, now, 0.03);
    }

    // 2. 30,000X Extreme Voice Enhancement Multiplier
    if (this.boostPreAmpGain) {
      if (this.xkbConfig.is30000XEnabled) {
        const gain30000 = calculate30000XGain(this.xkbConfig.enhancement30000X, true);
        this.boostPreAmpGain.gain.setTargetAtTime(gain30000, now, 0.05);
      } else if (!this.boost1000XConfig.enabled) {
        this.boostPreAmpGain.gain.setTargetAtTime(1.0, now, 0.05);
      }
    }

    // 3. Deep Bass Control (85Hz Shelf)
    if (this.xkbBassFilter) {
      const bassGain = (this.xkbConfig.bassControl - 50) * 0.35;
      this.xkbBassFilter.gain.setTargetAtTime(bassGain, now, 0.03);
    }

    // 4. Clear Voice Mode (2.8kHz Speech Presence Peak)
    if (this.xkbClearVoiceFilter) {
      const clearGain = this.xkbConfig.clearVoiceMode ? 7.0 : 0.0;
      this.xkbClearVoiceFilter.gain.setTargetAtTime(clearGain, now, 0.03);
    }

    // 5. High Pitch & Vocal Grit (9kHz Shelf)
    if (this.xkbHighPitchFilter) {
      const pitchGain = (this.xkbConfig.highPitchControl - 50) * 0.3;
      this.xkbHighPitchFilter.gain.setTargetAtTime(pitchGain, now, 0.03);
    }

    // 6. Noise Reduction Highpass Gate
    if (this.xkbNoiseFilter) {
      const freq = this.xkbConfig.noiseReduction ? 75 : 15;
      this.xkbNoiseFilter.frequency.setTargetAtTime(freq, now, 0.03);
    }

    // 7. Safe Output Limiter & Receiver Dynamic Range Normalization
    if (this.masterCompressor) {
      if (this.xkbConfig.safeOutputLimiter) {
        this.masterCompressor.threshold.setTargetAtTime(-3, now, 0.05);
        this.masterCompressor.ratio.setTargetAtTime(20, now, 0.05);
      } else {
        this.masterCompressor.threshold.setTargetAtTime(-1, now, 0.05);
        this.masterCompressor.ratio.setTargetAtTime(4, now, 0.05);
      }

      if (this.xkbConfig.receiverOptimization) {
        // Optimizes intelligibility for phone earpieces and low-volume phone speakers
        this.masterCompressor.knee.setTargetAtTime(8, now, 0.05);
        this.masterCompressor.release.setTargetAtTime(0.12, now, 0.05);
      }
    }

    // 8. Powerful Voice Mode punch
    if (this.vocalPunchGain) {
      const punchGain = this.xkbConfig.powerfulVoiceMode ? 2.5 : 1.0;
      this.vocalPunchGain.gain.setTargetAtTime(punchGain, now, 0.03);
    }
  }

  public getXKBConfig(): XKBVoiceConfig {
    return this.xkbConfig;
  }

  // --- VOICE MESSAGE RECORDING ---
  public startVoiceRecording(): boolean {
    if (!this.recordDestination) return false;
    this.recordedChunks = [];

    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      this.mediaRecorder = new MediaRecorder(this.recordDestination.stream, {
        mimeType,
        audioBitsPerSecond: 192000,
      });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100); // 100ms chunks
      return true;
    } catch (err) {
      console.error('Failed to start voice recorder:', err);
      return false;
    }
  }

  public stopVoiceRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  // --- AUDIO VISUALIZATION DATA GETTERS ---
  public getMasterFrequencyData(array: Uint8Array): void {
    if (this.masterAnalyser) {
      this.masterAnalyser.getByteFrequencyData(array as unknown as Uint8Array<ArrayBuffer>);
    }
  }

  public getMasterTimeDomainData(array: Uint8Array): void {
    if (this.masterAnalyser) {
      this.masterAnalyser.getByteTimeDomainData(array as unknown as Uint8Array<ArrayBuffer>);
    }
  }

  public setCallbacks(callbacks: {
    onVoiceData?: (rms: number, modulation: number) => void;
    onBeatStep?: (step: number) => void;
  }) {
    if (callbacks.onVoiceData) this.onVoiceDataCallback = callbacks.onVoiceData;
    if (callbacks.onBeatStep) this.onBeatStepCallback = callbacks.onBeatStep;
  }

  // --- GETTERS ---
  public getBoxesConfig() {
    return this.boxesConfig;
  }

  public getEqualizerBands() {
    return this.eqBands;
  }

  public getVoiceSyncConfig() {
    return this.voiceSyncConfig;
  }

  public getMasterVolume() {
    return this.masterVolume;
  }

  public getMicInputGain() {
    return this.micInputGain;
  }

  public getVoicePassthrough() {
    return this.voicePassthrough;
  }

  public isCallActive() {
    return this.isCallModeActive;
  }

  public isMicConnected() {
    return this.isMicActive;
  }

  public destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.box3.timerId) clearInterval(this.box3.timerId);
    this.stopMicrophone();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
    }
  }
}

// Singleton audio engine instance for the application
export const audioEngine = new AudioEffectsEngine();
