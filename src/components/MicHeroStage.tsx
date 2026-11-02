import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Radio, PhoneCall, Settings2, Sliders } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine.ts';

interface MicHeroStageProps {
  isMicActive: boolean;
  onToggleMic: () => void;
  masterVolume: number;
  onChangeVolume: (val: number) => void;
  voicePassthrough: boolean;
  onTogglePassthrough: () => void;
  isCallMode: boolean;
  onToggleCallMode: () => void;
  voiceRms: number;
  lang: 'bn' | 'en';
}

export const MicHeroStage: React.FC<MicHeroStageProps> = ({
  isMicActive,
  onToggleMic,
  masterVolume,
  onChangeVolume,
  voicePassthrough,
  onTogglePassthrough,
  isCallMode,
  onToggleCallMode,
  voiceRms,
  lang,
}) => {
  const [devices, setDevices] = useState<{ deviceId: string; label: string }[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [micGain, setMicGain] = useState<number>(1.0);

  useEffect(() => {
    // List available audio input devices
    const getDevices = async () => {
      try {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devs
          .filter((d) => d.kind === 'audioinput')
          .map((d, index) => ({
            deviceId: d.deviceId,
            label: d.label || (index === 0 ? 'Mobile (Back) / Built-in Mic' : `Microphone ${index + 1}`),
          }));

        if (audioInputs.length === 0) {
          audioInputs.push({ deviceId: 'default', label: 'Mobile (Back)' });
        }
        setDevices(audioInputs);
        if (audioInputs[0]) setSelectedDevice(audioInputs[0].deviceId);
      } catch (err) {
        setDevices([{ deviceId: 'default', label: 'Mobile (Back)' }]);
      }
    };

    getDevices();
  }, []);

  const handleDeviceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedDevice(id);
    if (isMicActive) {
      await audioEngine.startMicrophone(id);
    }
  };

  const handleMicGainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMicGain(val);
    audioEngine.setMicInputGain(val);
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-3xl p-5 border border-slate-800 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Background ambient glow pulse based on voice RMS */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-100 ease-out blur-3xl opacity-20"
        style={{
          width: `${240 + voiceRms * 600}px`,
          height: `${240 + voiceRms * 600}px`,
          background: isCallMode
            ? 'radial-gradient(circle, #f43f5e 0%, #7c3aed 100%)'
            : isMicActive
            ? 'radial-gradient(circle, #06b6d4 0%, #3b82f6 100%)'
            : 'radial-gradient(circle, #475569 0%, #0f172a 100%)',
        }}
      />

      {/* Top Device & Mode Bar (resembles the mobile app header from video) */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-800/40 rounded-xl px-3 py-1.5 shadow-sm">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <select
            value={selectedDevice}
            onChange={handleDeviceChange}
            className="bg-transparent text-xs text-cyan-200 font-medium focus:outline-none cursor-pointer max-w-[180px] truncate"
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId} className="bg-slate-900 text-slate-100">
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Automatic Call Sound Effects toggle button */}
          <button
            onClick={onToggleCallMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-md ${
              isCallMode
                ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
            title="Automatic Call Sound Effects (Continuous Grrr)"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{isCallMode ? (lang === 'bn' ? 'কল মোড সক্রিয়' : 'Call Mode Active') : (lang === 'bn' ? 'কল গ্রার মোড' : 'Call Grrr Mode')}</span>
          </button>

          {/* Voice Passthrough switch */}
          <button
            onClick={onTogglePassthrough}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              voicePassthrough
                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                : 'border-slate-800 bg-slate-900/50 text-slate-400'
            }`}
            title="Hear your voice through speaker"
          >
            <Sliders className="w-3 h-3" />
            <span>{voicePassthrough ? (lang === 'bn' ? 'স্পিকারে ভয়েস অন' : 'Voice Out: ON') : (lang === 'bn' ? 'ভয়েস আউট মিউট' : 'Voice Out: MUTED')}</span>
          </button>
        </div>
      </div>

      {/* Main Center Area: Big Mic + Right-side Vertical Volume Slider */}
      <div className="relative z-10 flex items-center justify-between py-6 px-4">
        {/* Left Side: Mic Gain Slider */}
        <div className="flex flex-col items-center gap-2 w-16">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 text-center">
            {lang === 'bn' ? 'মাইক গেইন' : 'Mic Gain'}
          </span>
          <div className="relative h-44 flex items-center justify-center">
            <input
              type="range"
              min="0"
              max="2.5"
              step="0.05"
              value={micGain}
              onChange={handleMicGainChange}
              className="h-36 w-2 accent-cyan-400 rounded-lg cursor-pointer appearance-none bg-slate-800 slider-vertical"
              style={{
                writingMode: 'vertical-lr',
                direction: 'rtl',
              }}
              aria-label="Microphone Input Gain"
            />
          </div>
          <span className="text-[11px] font-mono text-cyan-400 font-bold">
            {Math.round(micGain * 100)}%
          </span>
        </div>

        {/* Center: Big Animated Microphone Button */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative group">
            {/* Pulsing ring waves when active */}
            {isMicActive && (
              <>
                <div
                  className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping opacity-60 pointer-events-none"
                  style={{ animationDuration: '2.5s' }}
                />
                <div
                  className="absolute -inset-4 rounded-full border border-cyan-500/30 animate-pulse pointer-events-none"
                  style={{ transform: `scale(${1 + voiceRms * 0.8})` }}
                />
              </>
            )}

            <button
              onClick={onToggleMic}
              aria-label={isMicActive ? 'Turn off microphone' : 'Turn on microphone'}
              className={`relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44 rounded-full transition-all duration-300 shadow-2xl ${
                isMicActive
                  ? 'bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-600 text-white shadow-[0_0_50px_rgba(6,182,212,0.6)] scale-105 active:scale-95'
                  : 'bg-slate-900 border-4 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 active:scale-95'
              }`}
            >
              {isMicActive ? (
                <Mic className="w-20 h-20 md:w-24 md:h-24 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] transition-transform duration-150" />
              ) : (
                <MicOff className="w-20 h-20 md:w-24 md:h-24 opacity-60" />
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isMicActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isMicActive
                ? (lang === 'bn' ? '● লাইভ মাইক্রোফোন চালু' : '● LIVE MIC ACTIVE')
                : (lang === 'bn' ? 'মাইক বন্ধ - চালু করতে চাপ দিন' : 'MIC OFF - TAP TO START')}
            </span>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
              {isCallMode
                ? (lang === 'bn'
                    ? 'কল মোড: কথা না বললেও ব্যাকগ্রাউন্ডে ঘ্যার ঘ্যার সাউন্ড চলতে থাকবে'
                    : 'Call Mode: Continuous Grrr sound running in background & syncs with voice')
                : (lang === 'bn'
                    ? '৪টি বক্সের ইফেক্ট ও ভয়েস রিয়েল-টাইমে প্রসেস হচ্ছে'
                    : 'Real-time 4-box audio processing with ultra low latency')}
            </p>
          </div>
        </div>

        {/* Right Side: Volume Control Slider (Matches video screenshot layout) */}
        <div className="flex flex-col items-center gap-2 w-16">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 text-center">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'bn' ? 'ভলিউম' : 'Volume'}</span>
          </div>
          <div className="relative h-44 flex items-center justify-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="h-36 w-2 accent-cyan-400 rounded-lg cursor-pointer appearance-none bg-slate-800 slider-vertical"
              style={{
                writingMode: 'vertical-lr',
                direction: 'rtl',
              }}
              aria-label="Master Output Volume"
            />
          </div>
          <span className="text-[11px] font-mono text-cyan-400 font-bold">
            {Math.round(masterVolume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
