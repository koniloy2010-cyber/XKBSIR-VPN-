import React from 'react';
import { Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import { SOUND_PRESETS, SoundPreset } from '../audio/soundPresets.ts';

interface SoundPresetSelectorProps {
  activePresetId: string | null;
  onSelectPreset: (preset: SoundPreset) => void;
  lang: 'bn' | 'en';
}

export const SoundPresetSelector: React.FC<SoundPresetSelectorProps> = ({
  activePresetId,
  onSelectPreset,
  lang,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {lang === 'bn' ? 'প্রিসেট সাউন্ড সিস্টেম (Presets)' : 'Sound Profiles & Presets'}
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          {lang === 'bn' ? 'এক ক্লিকে সাউন্ড সেট করুন' : '1-Click Fast Configuration'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {SOUND_PRESETS.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-cyan-950/80 border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-100 truncate">
                  {lang === 'bn' ? preset.nameBn : preset.name}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2">
                {lang === 'bn' ? preset.descBn : preset.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
