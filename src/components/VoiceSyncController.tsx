import React from 'react';
import { Sliders, Sparkles, Mic, Activity, Zap, Check } from 'lucide-react';
import { VoiceSyncConfig } from '../audio/types.ts';

interface VoiceSyncControllerProps {
  config: VoiceSyncConfig;
  onChangeConfig: (newCfg: Partial<VoiceSyncConfig>) => void;
  voiceRms: number;
  modulation: number;
  lang: 'bn' | 'en';
}

export const VoiceSyncController: React.FC<VoiceSyncControllerProps> = ({
  config,
  onChangeConfig,
  voiceRms,
  modulation,
  lang,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span>{lang === 'bn' ? 'ভয়েস-সিঙ্ক ও মড্যুলেশন কন্ট্রোল' : 'Real-Time Voice Sync'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                DSP ACTIVE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'কথা বলার সাথে সাথে সাউন্ডের ওঠানামা, ঘ্যার ঘ্যার তীব্রতা ও বিট স্বয়ংক্রিয়ভাবে সিঙ্ক হয়'
                : 'Real-time envelope follower modulates Grrr drive, vibration, and beat velocity as you speak'}
            </p>
          </div>
        </div>

        {/* Master Voice Sync Toggle */}
        <button
          onClick={() => onChangeConfig({ enabled: !config.enabled })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            config.enabled
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'bg-slate-850 text-slate-500 border-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{config.enabled ? (lang === 'bn' ? 'সিঙ্ক চালু' : 'Sync ON') : (lang === 'bn' ? 'সিঙ্ক বন্ধ' : 'Sync OFF')}</span>
        </button>
      </div>

      {/* Live Voice Input Level & Modulation Meter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Mic className="w-3 h-3 text-cyan-400" />
              <span>{lang === 'bn' ? 'ভয়েস ইনপুট স্তর' : 'Live Voice Level'}</span>
            </span>
            <span className="font-mono text-cyan-400 text-[11px]">
              {Math.round(voiceRms * 1000) / 10}%
            </span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 rounded-full transition-all duration-75"
              style={{ width: `${Math.min(100, voiceRms * 400)}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              <span>{lang === 'bn' ? 'অটো মড্যুলেশন গভীরতা' : 'Modulation Depth'}</span>
            </span>
            <span className="font-mono text-amber-400 text-[11px]">
              {Math.round(modulation * 100)}%
            </span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 rounded-full transition-all duration-75"
              style={{ width: `${Math.round(modulation * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sliders: Sensitivity and Threshold */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-300">
              {lang === 'bn' ? 'ভয়েস সংবেদনশীলতা (Sensitivity)' : 'Voice Sensitivity'}
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {config.sensitivity.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={config.sensitivity}
            disabled={!config.enabled}
            onChange={(e) => onChangeConfig({ sensitivity: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
            aria-label="Voice Sensitivity"
          />
          <p className="text-[10px] text-slate-500">
            {lang === 'bn' ? 'কথা বলার সঙ্গে সঙ্গে ইফেক্ট কত দ্রুত শক্তিশালী হবে' : 'How aggressively sound reacts to speech amplitude'}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-300">
              {lang === 'bn' ? 'নয়েজ গেট থ্রেশহোল্ড (Threshold)' : 'Voice Threshold Gate'}
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              {Math.round(config.threshold * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.15"
            step="0.005"
            value={config.threshold}
            disabled={!config.enabled}
            onChange={(e) => onChangeConfig({ threshold: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
            aria-label="Voice Threshold"
          />
          <p className="text-[10px] text-slate-500">
            {lang === 'bn' ? 'অপ্রয়োজনীয় নয়েজ বা ফিসফিস এড়াতে কাটঅফ লেভেল' : 'Min volume required before voice sync engages'}
          </p>
        </div>
      </div>

      {/* Target sync toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
        <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
          <input
            type="checkbox"
            checked={config.modulateGrrrDrive}
            onChange={(e) => onChangeConfig({ modulateGrrrDrive: e.target.checked })}
            className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
          />
          <span>{lang === 'bn' ? 'গ্রার ড্রাইভ সিঙ্ক' : 'Sync Grrr Drive'}</span>
        </label>

        <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
          <input
            type="checkbox"
            checked={config.modulateVibration}
            onChange={(e) => onChangeConfig({ modulateVibration: e.target.checked })}
            className="rounded accent-cyan-500 w-4 h-4 cursor-pointer"
          />
          <span>{lang === 'bn' ? 'ভাইব্রেশন রেজোন্যান্স' : 'Sync Vibration'}</span>
        </label>

        <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700">
          <input
            type="checkbox"
            checked={config.modulateBeatSync}
            onChange={(e) => onChangeConfig({ modulateBeatSync: e.target.checked })}
            className="rounded accent-purple-500 w-4 h-4 cursor-pointer"
          />
          <span>{lang === 'bn' ? 'কথার তালে বিট ম্যাচ' : 'Sync Beat Cadence'}</span>
        </label>
      </div>
    </div>
  );
};
