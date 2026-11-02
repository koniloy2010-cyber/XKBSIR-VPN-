import React from 'react';
import { Sliders, Volume2, Sparkles, Activity, ShieldCheck, Waves, CheckCircle2, Headphones, Radio } from 'lucide-react';
import { XKBVoiceConfig } from '../audio/types.ts';

interface XKBVoiceControlsProps {
  config: XKBVoiceConfig;
  onChangeConfig: (newCfg: Partial<XKBVoiceConfig>) => void;
}

export const XKBVoiceControls: React.FC<XKBVoiceControlsProps> = ({
  config,
  onChangeConfig,
}) => {
  return (
    <div className="bg-[#030712]/90 border border-cyan-950/80 rounded-3xl p-5 shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Extreme Voice Enhancement & Optimization
            </h2>
            <p className="text-xs text-slate-400">
              Real-time DSP filtering for powerful loudness, presence, and receiver clarity
            </p>
          </div>
        </div>
      </div>

      {/* Primary Sliders: Bass Control & High Pitch Enhancement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Deep Bass Enhancement */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-cyan-950 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5 text-slate-200">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span>Deep Bass Enhancement</span>
            </div>
            <span className="font-mono text-cyan-400 font-bold">
              {config.bassControl}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={config.bassControl}
            onChange={(e) => onChangeConfig({ bassControl: parseInt(e.target.value, 10) })}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            aria-label="Bass Control"
          />

          <p className="text-[10px] text-slate-400">
            Sub-harmonic low-end body with zero boxiness or muddiness
          </p>
        </div>

        {/* High Pitch Enhancement */}
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-cyan-950 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5 text-slate-200">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>High Pitch & Vocal Grit</span>
            </div>
            <span className="font-mono text-blue-400 font-bold">
              {config.highPitchControl}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={config.highPitchControl}
            onChange={(e) => onChangeConfig({ highPitchControl: parseInt(e.target.value, 10) })}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-400"
            aria-label="High Pitch Control"
          />

          <p className="text-[10px] text-slate-400">
            Crisp articulation, vocal brightness, and speech cut-through
          </p>
        </div>
      </div>

      {/* Advanced Toggles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Clear Voice Mode */}
        <button
          onClick={() => onChangeConfig({ clearVoiceMode: !config.clearVoiceMode })}
          className={`p-3 rounded-2xl border text-left transition-all ${
            config.clearVoiceMode
              ? 'bg-cyan-950/70 border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-slate-950 border-slate-900 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white">Clear Voice Mode</span>
            <CheckCircle2 className={`w-4 h-4 ${config.clearVoiceMode ? 'text-cyan-400' : 'text-slate-700'}`} />
          </div>
          <p className="text-[10px] text-slate-400">
            2.8kHz presence peak for speech intelligibility
          </p>
        </button>

        {/* Powerful Voice Mode */}
        <button
          onClick={() => onChangeConfig({ powerfulVoiceMode: !config.powerfulVoiceMode })}
          className={`p-3 rounded-2xl border text-left transition-all ${
            config.powerfulVoiceMode
              ? 'bg-blue-950/70 border-blue-400/60 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
              : 'bg-slate-950 border-slate-900 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white">Powerful Voice</span>
            <CheckCircle2 className={`w-4 h-4 ${config.powerfulVoiceMode ? 'text-blue-400' : 'text-slate-700'}`} />
          </div>
          <p className="text-[10px] text-slate-400">
            Up to +12dB dynamic punch & amplification
          </p>
        </button>

        {/* Noise Reduction */}
        <button
          onClick={() => onChangeConfig({ noiseReduction: !config.noiseReduction })}
          className={`p-3 rounded-2xl border text-left transition-all ${
            config.noiseReduction
              ? 'bg-emerald-950/70 border-emerald-400/60'
              : 'bg-slate-950 border-slate-900 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white">Noise Reduction</span>
            <CheckCircle2 className={`w-4 h-4 ${config.noiseReduction ? 'text-emerald-400' : 'text-slate-700'}`} />
          </div>
          <p className="text-[10px] text-slate-400">
            Highpass subsonic gate filtering room hiss
          </p>
        </button>

        {/* Echo & Distortion Control */}
        <button
          onClick={() => onChangeConfig({ echoControl: !config.echoControl })}
          className={`p-3 rounded-2xl border text-left transition-all ${
            config.echoControl
              ? 'bg-indigo-950/70 border-indigo-400/60'
              : 'bg-slate-950 border-slate-900 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white">Echo & Distortion</span>
            <CheckCircle2 className={`w-4 h-4 ${config.echoControl ? 'text-indigo-400' : 'text-slate-700'}`} />
          </div>
          <p className="text-[10px] text-slate-400">
            Anti-feedback & clipping distortion prevention
          </p>
        </button>
      </div>

      {/* Receiver Audio Optimization Card */}
      <div className="p-4 bg-slate-950/80 rounded-2xl border border-cyan-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/40">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Receiver Audio Optimization
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Normalizes voice loudness for clear playback on low-volume earpieces and phone speakers without overriding receiver hardware settings.
            </p>
          </div>
        </div>

        <button
          onClick={() => onChangeConfig({ receiverOptimization: !config.receiverOptimization })}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
            config.receiverOptimization
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-black'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          {config.receiverOptimization ? 'OPTIMIZATION ON' : 'OPTIMIZATION OFF'}
        </button>
      </div>
    </div>
  );
};
