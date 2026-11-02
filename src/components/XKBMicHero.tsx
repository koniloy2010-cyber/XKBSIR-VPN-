import React from 'react';
import { Mic, MicOff, Power, Zap, ShieldCheck, Sparkles, Volume2, Radio, Check, Sliders } from 'lucide-react';
import { XKBVoiceConfig } from '../audio/types.ts';

interface XKBMicHeroProps {
  isMicActive: boolean;
  onToggleMic: () => void;
  config: XKBVoiceConfig;
  onChangeConfig: (newCfg: Partial<XKBVoiceConfig>) => void;
  voiceRms: number;
}

export const XKBMicHero: React.FC<XKBMicHeroProps> = ({
  isMicActive,
  onToggleMic,
  config,
  onChangeConfig,
  voiceRms,
}) => {
  return (
    <div className="relative bg-gradient-to-b from-[#040d1a] via-[#020712] to-black rounded-3xl p-6 border border-cyan-950/80 shadow-[0_12px_45px_rgba(0,0,0,0.9)] overflow-hidden">
      {/* Electric-Blue dynamic ambient pulse */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-100 ease-out blur-3xl opacity-25"
        style={{
          width: `${260 + voiceRms * 700}px`,
          height: `${260 + voiceRms * 700}px`,
          background: config.is30000XEnabled
            ? 'radial-gradient(circle, #00f0ff 0%, #3b82f6 60%, #1e1b4b 100%)'
            : isMicActive
            ? 'radial-gradient(circle, #0284c7 0%, #1e40af 100%)'
            : 'radial-gradient(circle, #1e293b 0%, #030712 100%)',
        }}
      />

      {/* Top Status Bar with HD Mode Badges */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-cyan-900/40">
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              isMicActive
                ? 'bg-cyan-400 shadow-[0_0_12px_#00f0ff] animate-pulse'
                : 'bg-slate-700'
            }`}
          />
          <span className="text-xs font-mono font-bold tracking-wider text-cyan-200 uppercase">
            {isMicActive ? 'DSP Engine Online • Ultra HD Active' : 'Microphone Inactive • Standby'}
          </span>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
          <button
            onClick={() => onChangeConfig({ hdMicMode: !config.hdMicMode })}
            className={`px-2 py-0.5 rounded-lg border font-bold transition-all ${
              config.hdMicMode
                ? 'bg-cyan-950/80 border-cyan-400/60 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            HD MIC {config.hdMicMode ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => onChangeConfig({ clearVoiceMode: !config.clearVoiceMode })}
            className={`px-2 py-0.5 rounded-lg border font-bold transition-all ${
              config.clearVoiceMode
                ? 'bg-blue-950/80 border-blue-400/60 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            CLEAR VOICE {config.clearVoiceMode ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => onChangeConfig({ safeOutputLimiter: !config.safeOutputLimiter })}
            className={`px-2 py-0.5 rounded-lg border font-bold transition-all ${
              config.safeOutputLimiter
                ? 'bg-emerald-950/80 border-emerald-400/60 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            SAFE LIMITER {config.safeOutputLimiter ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Centerpiece: Large START Button with XKB-SIR Official Logo */}
      <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center">
        <div className="relative group mb-5">
          {/* Animated Electric Blue Rings */}
          {isMicActive && (
            <>
              <div
                className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-ping opacity-60 pointer-events-none"
                style={{ animationDuration: '2.5s' }}
              />
              <div
                className="absolute -inset-4 rounded-full border border-cyan-400/30 animate-pulse pointer-events-none"
                style={{ transform: `scale(${1 + voiceRms * 0.9})` }}
              />
            </>
          )}

          {/* Large START / BOOST Button */}
          <button
            onClick={onToggleMic}
            aria-label={isMicActive ? 'Stop Voice Booster' : 'Start Voice Booster'}
            className={`relative flex flex-col items-center justify-center w-48 h-48 sm:w-56 sm:h-56 rounded-full transition-all duration-300 shadow-2xl overflow-hidden ${
              isMicActive
                ? 'border-4 border-cyan-400 shadow-[0_0_60px_rgba(0,240,255,0.7)] scale-105 active:scale-95'
                : 'border-4 border-slate-800 hover:border-cyan-600/60 opacity-80 hover:opacity-100 active:scale-95'
            }`}
          >
            {/* Background Image: Official XKB-SIR logo */}
            <img
              src="/xkb-logo.png"
              alt="XKB-SIR"
              className={`w-full h-full object-cover transition-all duration-500 ${
                isMicActive ? 'scale-110 filter brightness-110' : 'filter grayscale-[40%] brightness-75'
              }`}
            />

            {/* Glowing overlay text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col items-center justify-end pb-4">
              <span
                className={`text-lg sm:text-xl font-black tracking-wider uppercase drop-shadow-md ${
                  isMicActive ? 'text-cyan-300' : 'text-slate-300'
                }`}
              >
                {isMicActive ? 'BOOSTER RUNNING' : 'START BOOSTER'}
              </span>
              <span className="text-[10px] font-mono font-bold text-cyan-400/90 tracking-widest mt-0.5">
                {isMicActive ? 'TAP TO STOP' : 'TAP TO ACTIVATE'}
              </span>
            </div>
          </button>
        </div>

        {/* Real-time Voice Modulation / Loudness Bar */}
        <div className="w-full max-w-md bg-slate-950/80 p-3 rounded-2xl border border-cyan-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-semibold">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span>Voice Loudness Input</span>
            </span>
            <span className="text-cyan-400 font-bold">
              {Math.min(100, Math.round(voiceRms * 400))}%
            </span>
          </div>

          <div className="h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 rounded-full transition-all duration-75 shadow-[0_0_12px_#00f0ff]"
              style={{ width: `${Math.min(100, voiceRms * 400)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 0–300 Microphone Boost Display Scale Slider */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-cyan-950/80">
        {/* 0-300 Slider */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-cyan-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5 text-slate-200">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Microphone Boost (0–300 Scale)</span>
            </div>
            <span className="font-mono text-cyan-400 text-sm font-extrabold px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-800/50">
              {config.micBoostScale} / 300
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="300"
            step="1"
            value={config.micBoostScale}
            onChange={(e) => onChangeConfig({ micBoostScale: parseInt(e.target.value, 10) })}
            className="w-full h-2.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            aria-label="Microphone Boost 0-300 scale"
          />

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>0 (Mute)</span>
            <span>100 (Normal 1.0X)</span>
            <span>200 (High 3.0X)</span>
            <span className="text-cyan-400 font-bold">300 (Max 5.0X)</span>
          </div>
        </div>

        {/* 30,000X Visual Effect & Voice Enhancement Scale */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-cyan-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5 text-slate-200">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Voice Enhancement Scale</span>
            </div>
            <button
              onClick={() => onChangeConfig({ is30000XEnabled: !config.is30000XEnabled })}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                config.is30000XEnabled
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_15px_#00f0ff]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {config.is30000XEnabled ? '30,000X ACTIVE' : 'ENABLE 30,000X'}
            </button>
          </div>

          <input
            type="range"
            min="1000"
            max="30000"
            step="500"
            value={config.enhancement30000X}
            disabled={!config.is30000XEnabled}
            onChange={(e) => onChangeConfig({ enhancement30000X: parseInt(e.target.value, 10) })}
            className="w-full h-2.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
            aria-label="30000X Voice Enhancement"
          />

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>1,000X</span>
            <span>10,000X</span>
            <span>20,000X</span>
            <span className="text-cyan-400 font-bold">
              {config.is30000XEnabled ? `${config.enhancement30000X.toLocaleString()}X` : '30,000X (OFF)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
