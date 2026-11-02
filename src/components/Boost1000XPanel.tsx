import React from 'react';
import { Flame, Zap, Volume2, ShieldAlert, Sparkles, Mic, Waves, Disc3 } from 'lucide-react';
import { Boost1000XConfig } from '../audio/types.ts';

interface Boost1000XPanelProps {
  config: Boost1000XConfig;
  onChangeConfig: (newCfg: Partial<Boost1000XConfig>) => void;
  lang: 'bn' | 'en';
}

export const Boost1000XPanel: React.FC<Boost1000XPanelProps> = ({
  config,
  onChangeConfig,
  lang,
}) => {
  return (
    <div
      className={`relative rounded-3xl p-5 border transition-all duration-300 backdrop-blur-md overflow-hidden ${
        config.enabled
          ? 'bg-gradient-to-r from-red-950/60 via-slate-950 to-amber-950/60 border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.25)]'
          : 'bg-slate-900/80 border-slate-800'
      }`}
    >
      {/* Top dynamic fire aura when 1000X is enabled */}
      {config.enabled && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-red-500 to-yellow-400 animate-pulse" />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl border transition-all ${
              config.enabled
                ? 'bg-gradient-to-tr from-amber-500 to-red-600 text-slate-950 border-amber-400 shadow-[0_0_20px_#f59e0b] scale-105'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <Flame className="w-6 h-6 fill-current animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-wide text-white flex items-center gap-1.5">
                <span>{lang === 'bn' ? '১০০০X বিস্ট সাউন্ড বুস্ট' : '1000X BEAST SOUND BOOST'}</span>
              </h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                  config.enabled
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_#f59e0b]'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {config.enabled ? '1000X ACTIVE' : 'OFF'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'আপনার কথার জোর, ঘ্যার ঘ্যার এবং বিটগুলো চরম তীব্র ও শক্তিশালী করার আল্ট্রা পাওয়ার ইঞ্জিন'
                : 'Maximum vocal loudness, motorized Grrr rasp, and earthquake 808 sub-beat impact'}
            </p>
          </div>
        </div>

        {/* Master 1000X Boost Toggle Switch */}
        <button
          onClick={() => onChangeConfig({ enabled: !config.enabled })}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all duration-200 shadow-xl ${
            config.enabled
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.6)] scale-105'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>
            {config.enabled
              ? (lang === 'bn' ? '১০০০X বুস্ট সক্রিয় (ON)' : '1000X BOOST ON')
              : (lang === 'bn' ? '১০০০X বুস্ট চালু করুন' : 'ENABLE 1000X BOOST')}
          </span>
        </button>
      </div>

      {/* Boost Sliders & Multipliers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* Vocal Strength Punch Slider */}
        <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-200">
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'bn' ? 'কথার জোর (Vocal Punch)' : 'Vocal Punch'}</span>
            </span>
            <span className="font-mono text-cyan-400 font-bold">
              +{Math.round(config.vocalPunch * 10)}%
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={config.vocalPunch}
            disabled={!config.enabled}
            onChange={(e) => onChangeConfig({ vocalPunch: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
            aria-label="Vocal Punch"
          />
          <p className="text-[10px] text-slate-500">
            {lang === 'bn' ? 'কথা বলার জোর ও গলার আওয়াজ বহুগুণ বৃদ্ধি' : 'Amplifies your spoken voice to punch through'}
          </p>
        </div>

        {/* Grrr Overdrive Rasp Slider */}
        <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-200">
              <Waves className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? 'ঘ্যার ঘ্যার ওভারড্রাইভ' : 'Grrr Overdrive'}</span>
            </span>
            <span className="font-mono text-amber-400 font-bold">
              +{Math.round(config.grrrOverdrive * 10)}%
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={config.grrrOverdrive}
            disabled={!config.enabled}
            onChange={(e) => onChangeConfig({ grrrOverdrive: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
            aria-label="Grrr Overdrive"
          />
          <p className="text-[10px] text-slate-500">
            {lang === 'bn' ? 'ঘ্যার ঘ্যার সাউন্ডের চরম ঝাঁঝ ও ভারী কম্পন' : 'Intensifies motorized growl & rasp saturation'}
          </p>
        </div>

        {/* Beat & 808 Sub Punch Slider */}
        <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-slate-200">
              <Disc3 className="w-3.5 h-3.5 text-purple-400" />
              <span>{lang === 'bn' ? 'বিট ও সাব বেস পাঞ্চ' : 'Beat & Sub Punch'}</span>
            </span>
            <span className="font-mono text-purple-400 font-bold">
              +{Math.round(config.beatPunch * 10)}%
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={config.beatPunch}
            disabled={!config.enabled}
            onChange={(e) => onChangeConfig({ beatPunch: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400 disabled:opacity-40"
            aria-label="Beat Punch"
          />
          <p className="text-[10px] text-slate-500">
            {lang === 'bn' ? '৮০৮ সাব-কিক ও বুকের ভেতর ধাক্কা দেওয়া বিট' : 'Deep chest-thumping 808 bass kick'}
          </p>
        </div>
      </div>

      {/* Quick Multiplier Selector Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
        <span className="text-slate-400 font-medium">
          {lang === 'bn' ? 'পাওয়ার মাল্টিপ্লায়ার স্কেল:' : 'Power Multiplier Scale:'}
        </span>

        <div className="flex items-center gap-1.5">
          {[
            { mul: 10, label: '10X' },
            { mul: 50, label: '50X' },
            { mul: 100, label: '100X' },
            { mul: 500, label: '500X' },
            { mul: 1000, label: '⚡ 1000X' },
          ].map((item) => (
            <button
              key={item.mul}
              onClick={() => {
                onChangeConfig({ multiplier: item.mul, enabled: true });
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                config.enabled && config.multiplier === item.mul
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_#f59e0b]'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
