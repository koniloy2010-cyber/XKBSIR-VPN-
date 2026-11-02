import { AudioBoxId, EqualizerBands } from './types.ts';

export interface SoundPreset {
  id: string;
  name: string;
  nameBn: string;
  desc: string;
  descBn: string;
  boxes: Record<AudioBoxId, { enabled: boolean; volume: number; p1: number; p2: number }>;
  eq: EqualizerBands;
  callMode: boolean;
}

export const SOUND_PRESETS: SoundPreset[] = [
  {
    id: 'grrr_beast',
    name: 'Grrr Beast Mode',
    nameBn: 'ঘ্যার ঘ্যার বিস্ট মোড',
    desc: 'Heavy motorized growl + physical vibration rumble',
    descBn: 'তীব্র ঘ্যার ঘ্যার সাউন্ড ও সাব-বেস কাঁপন',
    boxes: {
      box1_deep_grrr: { enabled: true, volume: 0.85, p1: 0.8, p2: 0.65 },
      box2_heavy_vibration: { enabled: true, volume: 0.8, p1: 0.85, p2: 0.4 },
      box3_electronic_beat: { enabled: false, volume: 0.6, p1: 0.5, p2: 0.8 },
      box4_combo: { enabled: true, volume: 0.75, p1: 0.85, p2: 0.7 },
    },
    eq: { band60: 7.0, band230: 3.5, band910: -2.0, band3600: 4.5, band14000: 2.0 },
    callMode: true,
  },
  {
    id: 'call_stealth_grrr',
    name: 'Call Stealth Grrr',
    nameBn: 'কল ব্যাকগ্রাউন্ড ঘ্যার ঘ্যার',
    desc: 'Constant mysterious background Grrr rasp that syncs with voice',
    descBn: 'কল চলাকালীন সার্বক্ষণিক ঘ্যার ঘ্যার ব্যাকগ্রাউন্ড সাউন্ড',
    boxes: {
      box1_deep_grrr: { enabled: true, volume: 0.7, p1: 0.6, p2: 0.5 },
      box2_heavy_vibration: { enabled: true, volume: 0.55, p1: 0.7, p2: 0.35 },
      box3_electronic_beat: { enabled: false, volume: 0.5, p1: 0.5, p2: 0.7 },
      box4_combo: { enabled: false, volume: 0.6, p1: 0.7, p2: 0.5 },
    },
    eq: { band60: 5.0, band230: 2.0, band910: 0.0, band3600: 3.0, band14000: 1.0 },
    callMode: true,
  },
  {
    id: 'voice_msg_sync',
    name: 'Voice Msg Beat Match',
    nameBn: 'ভয়েস মেসেজ বিট ম্যাচ',
    desc: 'Automatic beat sync + dynamic vibration rhythm on syllables',
    descBn: 'ভয়েস মেসেজে কথার তালে তালে বিট ও ভাইব্রেশন',
    boxes: {
      box1_deep_grrr: { enabled: true, volume: 0.65, p1: 0.65, p2: 0.6 },
      box2_heavy_vibration: { enabled: true, volume: 0.7, p1: 0.8, p2: 0.45 },
      box3_electronic_beat: { enabled: true, volume: 0.75, p1: 0.55, p2: 0.85 },
      box4_combo: { enabled: false, volume: 0.6, p1: 0.7, p2: 0.5 },
    },
    eq: { band60: 6.0, band230: 1.5, band910: -1.0, band3600: 2.5, band14000: 3.0 },
    callMode: false,
  },
  {
    id: 'four_box_arena',
    name: '4-Box Mega Arena',
    nameBn: 'চারটি বক্স একসাথে (মেগা মিক্স)',
    desc: 'Full power: all 4 boxes active with dynamic vocal limiter',
    descBn: 'একসাথে ৪টি বক্সের সমন্বয়ে চরম পাওয়ারফুল সাউন্ড আউটপুট',
    boxes: {
      box1_deep_grrr: { enabled: true, volume: 0.75, p1: 0.7, p2: 0.6 },
      box2_heavy_vibration: { enabled: true, volume: 0.7, p1: 0.8, p2: 0.4 },
      box3_electronic_beat: { enabled: true, volume: 0.7, p1: 0.5, p2: 0.8 },
      box4_combo: { enabled: true, volume: 0.7, p1: 0.75, p2: 0.65 },
    },
    eq: { band60: 6.5, band230: 3.0, band910: -1.5, band3600: 4.0, band14000: 2.5 },
    callMode: true,
  },
  {
    id: 'clean_mic_passthrough',
    name: 'Reference Mic to Speaker',
    nameBn: 'রেফারেন্স মাইক টু স্পিকার',
    desc: 'Direct clean low-latency microphone amplifier with 5-band EQ',
    descBn: 'রেফারেন্স ভিডিওর মতো সরাসরি মাইক থেকে স্পিকারে সাউন্ড',
    boxes: {
      box1_deep_grrr: { enabled: false, volume: 0.5, p1: 0.5, p2: 0.5 },
      box2_heavy_vibration: { enabled: false, volume: 0.5, p1: 0.5, p2: 0.5 },
      box3_electronic_beat: { enabled: false, volume: 0.5, p1: 0.5, p2: 0.5 },
      box4_combo: { enabled: false, volume: 0.5, p1: 0.5, p2: 0.5 },
    },
    eq: { band60: 2.0, band230: 1.0, band910: 1.0, band3600: 2.0, band14000: 1.0 },
    callMode: false,
  },
];
