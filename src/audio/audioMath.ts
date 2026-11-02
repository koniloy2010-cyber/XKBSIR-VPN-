/**
 * Pure mathematical functions for audio DSP, distortion, voice sync, and equalizer
 */

/**
 * Creates an S-curve wave shaper distortion table for deep harmonic growl ("ঘ্যার ঘ্যার" effect)
 */
export function makeDistortionCurve(amount: number = 50, nSamples: number = 44100): Float32Array<ArrayBuffer> {
  const k = Math.max(0.1, amount);
  const buffer = new ArrayBuffer(nSamples * 4);
  const curve = new Float32Array(buffer);
  const deg = Math.PI / 180;
  
  for (let i = 0; i < nSamples; ++i) {
    const x = (i * 2) / nSamples - 1;
    // Non-linear sigmoid saturation with asymmetric warmth for aggressive grrr
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    // Soft clamp between -1 and 1
    if (curve[i] > 1) curve[i] = 1;
    if (curve[i] < -1) curve[i] = -1;
  }
  return curve;
}

/**
 * Maps decibels (-24 to +24) to linear gain multiplier (0 to ~16)
 */
export function mapDbToGain(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Clamps a number between min and max
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Calculates dynamic modulation based on voice volume (RMS)
 * Returns a smoothed 0-1 value indicating how strongly the voice should modulate the boxes
 */
export function calculateVoiceSyncModulation(
  voiceRms: number,
  sensitivity: number = 1.5,
  threshold: number = 0.02
): number {
  if (voiceRms < threshold) {
    return 0;
  }
  const excess = voiceRms - threshold;
  const rawMod = excess * sensitivity * 4;
  return clamp(rawMod, 0, 1);
}

/**
 * Calculates boosted gain with non-linear saturation threshold
 */
export function calculateBoostedGain(baseGain: number, multiplier: number, isEnabled: boolean): number {
  if (!isEnabled) return baseGain;
  // Non-linear gain expansion that scales safely from 1x to 1000x
  const effectiveMul = Math.min(Math.max(multiplier, 1), 1000);
  return baseGain * Math.pow(effectiveMul, 0.7);
}

/**
 * Maps 0-300 display scale to clean linear audio multiplier
 * 0 = 0 (Mute), 100 = 1.0 (Normal), 200 = 2.5 (High), 300 = 5.0 (Extreme HD Boost)
 */
export function map300ScaleToGain(scale300: number): number {
  const s = clamp(scale300, 0, 300);
  if (s <= 100) {
    return s / 100;
  }
  // Up to 5.0x (+14dB linear pre-amp gain)
  return 1.0 + ((s - 100) / 200) * 4.0;
}

/**
 * Calculates real-time 30,000X extreme enhancement multiplier
 */
export function calculate30000XGain(scale: number, isEnabled: boolean): number {
  if (!isEnabled) return 1.0;
  const clampedScale = clamp(scale, 1, 30000);
  // Logarithmic acoustic expansion preventing overflow while maximizing punch
  return 1.0 + Math.log10(clampedScale) * 3.8;
}

/**
 * Creates an ultra-thick soft-knee saturation curve for 1000X extreme volume boost
 */
export function make1000XSoftClipperCurve(nSamples: number = 44100): Float32Array<ArrayBuffer> {
  const buffer = new ArrayBuffer(nSamples * 4);
  const curve = new Float32Array(buffer);
  for (let i = 0; i < nSamples; ++i) {
    const x = (i * 2) / nSamples - 1;
    // Hyperbolic tangent soft saturation prevents harsh digital clipping while delivering massive loudness
    curve[i] = Math.tanh(x * 3.5);
  }
  return curve;
}

/**
 * Rhythmic step calculator for electronic beat box
 */
export function getBeatTriggers(step: number, patternName: string = 'trap'): {
  kick: boolean;
  snare: boolean;
  hihat: boolean;
  subPulse: boolean;
} {
  const s = step % 16;
  switch (patternName) {
    case 'grrr_drill':
      // Aggressive drill-style bass drops & rapid hi-hats
      return {
        kick: s === 0 || s === 3 || s === 8 || s === 11 || s === 14,
        snare: s === 4 || s === 12,
        hihat: s % 2 === 0 || s === 7 || s === 15,
        subPulse: s === 0 || s === 8 || s === 10,
      };
    case 'cyber_pulse':
      // Four on the floor pulsing electronic drive
      return {
        kick: s % 4 === 0,
        snare: s === 4 || s === 12,
        hihat: s % 2 === 1,
        subPulse: s % 2 === 0,
      };
    case 'trap':
    default:
      // Heavy 808 style bounce
      return {
        kick: s === 0 || s === 6 || s === 10,
        snare: s === 4 || s === 12,
        hihat: s % 2 === 0,
        subPulse: s === 0 || s === 10,
      };
  }
}
