import React from 'react';
import { SlidersVertical, RotateCcw } from 'lucide-react';
import { EqualizerBands } from '../audio/types.ts';

interface EqualizerPanelProps {
  bands: EqualizerBands;
  onChangeBand: (band: keyof EqualizerBands, value: number) => void;
  onReset: () => void;
  lang: 'bn' | 'en';
}

const BAND_KEYS: { key: keyof EqualizerBands; label: string; desc: string }[] = [
  { key: 'band60', label: '60', desc: 'Sub Bass / Grrr Body' },
  { key: 'band230', label: '230', desc: 'Warmth & Low Mid' },
  { key: 'band910', label: '910', desc: 'Voice Body' },
  { key: 'band3600', label: '3600', desc: 'Voice Presence & Grit' },
  { key: 'band14000', label: '14000', desc: 'High Crisp / Air' },
];

export const EqualizerPanel: React.FC<EqualizerPanelProps> = ({
  bands,
  onChangeBand,
  onReset,
  lang,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersVertical className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            {lang === 'bn' ? 'ইকুয়ালাইজার (Equalizer)' : 'Equalizer'}
          </h2>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
          title="Reset Equalizer to Flat"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{lang === 'bn' ? 'রিসেট' : 'Reset'}</span>
        </button>
      </div>

      {/* 5 Equalizer Sliders side by side (matches video layout exactly) */}
      <div className="grid grid-cols-5 gap-2 md:gap-6 py-2 px-1">
        {BAND_KEYS.map(({ key, label, desc }) => {
          const val = bands[key];
          return (
            <div key={key} className="flex flex-col items-center gap-3">
              <span className="text-[11px] font-mono font-semibold text-cyan-400">
                {val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)} dB
              </span>

              <div className="relative h-44 flex items-center justify-center">
                {/* Center zero line indicator */}
                <div className="absolute w-full h-[1px] bg-slate-700/60 pointer-events-none" />

                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.5"
                  value={val}
                  onChange={(e) => onChangeBand(key, parseFloat(e.target.value))}
                  className="h-36 w-2 accent-cyan-400 rounded-lg cursor-pointer appearance-none bg-slate-800 slider-vertical"
                  style={{
                    writingMode: 'vertical-lr',
                    direction: 'rtl',
                  }}
                  aria-label={`Equalizer ${label} Hz`}
                />
              </div>

              <div className="text-center">
                <span className="text-xs font-bold text-slate-200 font-mono block">
                  {label}
                </span>
                <span className="text-[9px] text-slate-500 hidden sm:block truncate max-w-[60px]">
                  {desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
