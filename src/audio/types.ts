export type AudioBoxId = 'box1_deep_grrr' | 'box2_heavy_vibration' | 'box3_electronic_beat' | 'box4_combo';

export interface BoxConfig {
  id: AudioBoxId;
  name: string;
  nameBn: string;
  desc: string;
  descBn: string;
  color: string;
  enabled: boolean;
  volume: number; // 0 to 1
  parameter1: number; // e.g., Drive or Depth (0 to 1)
  parameter2: number; // e.g., Speed or Frequency (0 to 1)
  param1Label: string;
  param1LabelBn: string;
  param2Label: string;
  param2LabelBn: string;
}

export interface EqualizerBands {
  band60: number; // -12 to +12 dB
  band230: number;
  band910: number;
  band3600: number;
  band14000: number;
}

export interface VoiceSyncConfig {
  enabled: boolean;
  sensitivity: number; // 0.1 to 3.0
  threshold: number; // 0.01 to 0.5
  modulateGrrrDrive: boolean;
  modulateVibration: boolean;
  modulateBeatSync: boolean;
}

export interface VoiceRecording {
  id: string;
  url: string;
  blob: Blob;
  duration: number;
  createdAt: Date;
  sizeBytes: number;
}

export interface Boost1000XConfig {
  enabled: boolean;
  multiplier: number; // 1 to 1000
  vocalPunch: number; // 1 to 10
  grrrOverdrive: number; // 1 to 10
  beatPunch: number; // 1 to 10
}

export interface XKBVoiceConfig {
  micBoostScale: number; // 0 to 300 display scale
  enhancement30000X: number; // 1 to 30,000 visual & DSP scale
  is30000XEnabled: boolean;
  hdMicMode: boolean;
  clearVoiceMode: boolean;
  powerfulVoiceMode: boolean;
  safeOutputLimiter: boolean;
  bassControl: number; // 0 to 100%
  highPitchControl: number; // 0 to 100%
  noiseReduction: boolean;
  echoControl: boolean;
  receiverOptimization: boolean;
}


