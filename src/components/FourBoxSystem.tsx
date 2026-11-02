import React from 'react';
import { Power, Volume2, Activity, Zap, Waves, Disc3, Flame, Music, Sparkles } from 'lucide-react';
import { AudioBoxId, BoxConfig } from '../audio/types.ts';

interface FourBoxSystemProps {
  boxes: Record<AudioBoxId, BoxConfig>;
  onToggleBox: (id: AudioBoxId) => void;
  onChangeVolume: (id: AudioBoxId, val: number) => void;
  onChangeParam: (id: AudioBoxId, paramNum: 1 | 2, val: number) => void;
  onChangeBeatPattern?: (pattern: 'trap' | 'grrr_drill' | 'cyber_pulse' | 'voice_sync') => void;
  currentBeatPattern?: string;
  beatStep?: number;
  voiceModulation: number;
  lang: 'bn' | 'en';
}

export const FourBoxSystem: React.FC<FourBoxSystemProps> = ({
  boxes,
  onToggleBox,
  onChangeVolume,
  onChangeParam,
  onChangeBeatPattern,
  currentBeatPattern = 'trap',
  beatStep = 0,
  voiceModulation,
  lang,
}) => {
  const boxList: BoxConfig[] = Object.values(boxes);

  const getBoxIcon = (id: AudioBoxId) => {
    switch (id) {
      case 'box1_deep_grrr':
        return <Waves className="w-5 h-5 text-amber-400" />;
      case 'box2_heavy_vibration':
        return <Activity className="w-5 h-5 text-cyan-400" />;
      case 'box3_electronic_beat':
        return <Disc3 className="w-5 h-5 text-purple-400" />;
      case 'box4_combo':
        return <Flame className="w-5 h-5 text-emerald-400" />;
    }
  };

  const allActive = boxList.every((b) => b.enabled);

  const handleToggleAll = (target: boolean) => {
    boxList.forEach((b) => {
      if (b.enabled !== target) {
        onToggleBox(b.id);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header and Quick Mix Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/50">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              {lang === 'bn' ? '৪-বক্স অডিও সিস্টেম (Four-Box Sound System)' : 'Four-Box Audio System'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'প্রতিটি বক্সের নিজস্ব সাউন্ড, আলাদা ভলিউম ও ভয়েস সিঙ্ক মিক্সার'
                : 'Individual sound generators with independent volume & real-time voice sync'}
            </p>
          </div>
        </div>

        {/* Quick Batch Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleAll(!allActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              allActive
                ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-600/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            {allActive
              ? (lang === 'bn' ? 'সব বক্স বন্ধ করুন' : 'Mute All Boxes')
              : (lang === 'bn' ? 'সব ৪টি বক্স চালু করুন' : 'Enable All 4 Boxes')}
          </button>
        </div>
      </div>

      {/* Grid of the 4 Audio Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {boxList.map((box) => {
          const isEnabled = box.enabled;
          const isModulated = isEnabled && voiceModulation > 0.15;

          return (
            <div
              key={box.id}
              className={`relative rounded-3xl p-5 border transition-all duration-300 backdrop-blur-md overflow-hidden ${
                isEnabled
                  ? 'bg-slate-900/90 border-slate-700 shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
                  : 'bg-slate-950/60 border-slate-900 opacity-70 hover:opacity-90'
              }`}
            >
              {/* Dynamic glowing top accent bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${box.color} ${
                  isEnabled ? 'opacity-100' : 'opacity-20'
                }`}
              />

              {/* Ambient dynamic voice reaction flare */}
              {isModulated && (
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-opacity duration-150"
                  style={{
                    backgroundColor: box.id === 'box1_deep_grrr' ? '#f59e0b' : '#06b6d4',
                    opacity: voiceModulation * 0.4,
                  }}
                />
              )}

              {/* Box Header: Title, Icon, Power Toggle */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-2xl border transition-all ${
                      isEnabled
                        ? 'bg-slate-800/90 border-slate-700 shadow-md'
                        : 'bg-slate-950 border-slate-900'
                    }`}
                  >
                    {getBoxIcon(box.id)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                        {box.id.replace('_', ' ').toUpperCase()}
                      </span>
                      {isEnabled && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          LIVE ON
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-100">
                      {lang === 'bn' ? box.nameBn : box.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === 'bn' ? box.descBn : box.desc}
                    </p>
                  </div>
                </div>

                {/* Power Switch */}
                <button
                  onClick={() => onToggleBox(box.id)}
                  aria-label={`Toggle ${box.name}`}
                  className={`p-3 rounded-2xl transition-all duration-200 border ${
                    isEnabled
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-105'
                      : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <Power className="w-5 h-5" />
                </button>
              </div>

              {/* Volume Slider & Meter */}
              <div className="space-y-3 pt-2 border-t border-slate-800/70">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lang === 'bn' ? 'বক্স ভলিউম (Volume)' : 'Box Volume'}</span>
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {Math.round(box.volume * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={box.volume}
                    disabled={!isEnabled}
                    onChange={(e) => onChangeVolume(box.id, parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={`${box.name} Volume`}
                  />
                </div>

                {/* Macro Parameters (e.g. Drive, Speed, Rumble, Tempo) */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-slate-400">
                        {lang === 'bn' ? box.param1LabelBn : box.param1Label}
                      </span>
                      <span className="font-mono text-amber-400 font-semibold">
                        {Math.round(box.parameter1 * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.02"
                      value={box.parameter1}
                      disabled={!isEnabled}
                      onChange={(e) => onChangeParam(box.id, 1, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-30"
                      aria-label={box.param1Label}
                    />
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-slate-400">
                        {lang === 'bn' ? box.param2LabelBn : box.param2Label}
                      </span>
                      <span className="font-mono text-cyan-400 font-semibold">
                        {Math.round(box.parameter2 * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.02"
                      value={box.parameter2}
                      disabled={!isEnabled}
                      onChange={(e) => onChangeParam(box.id, 2, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-30"
                      aria-label={box.param2Label}
                    />
                  </div>
                </div>

                {/* Box 3 Special: Beat Pattern Selector & 16-Step Sequencer Lights */}
                {box.id === 'box3_electronic_beat' && (
                  <div className="mt-2 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Music className="w-3 h-3 text-purple-400" />
                        <span>{lang === 'bn' ? 'বিট প্যাটার্ন:' : 'Beat Pattern:'}</span>
                      </span>

                      {/* Sequencer step LEDs */}
                      <div className="flex items-center gap-1">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((s) => (
                          <div
                            key={s}
                            className={`w-1.5 h-1.5 rounded-full transition-colors duration-75 ${
                              isEnabled && (beatStep % 8 === s)
                                ? 'bg-purple-400 shadow-[0_0_6px_#c084fc]'
                                : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                      {(
                        [
                          { id: 'trap', label: '808 Trap' },
                          { id: 'grrr_drill', label: 'Grrr Drill' },
                          { id: 'cyber_pulse', label: 'Cyber Pulse' },
                          { id: 'voice_sync', label: 'Voice Sync' },
                        ] as const
                      ).map((pat) => (
                        <button
                          key={pat.id}
                          onClick={() => onChangeBeatPattern?.(pat.id)}
                          className={`py-1 px-1.5 rounded-lg font-semibold transition-all text-center ${
                            currentBeatPattern === pat.id
                              ? 'bg-purple-600/40 text-purple-200 border border-purple-500/60 shadow-sm'
                              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {pat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
