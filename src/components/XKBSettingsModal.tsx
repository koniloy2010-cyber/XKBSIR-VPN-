import React, { useState, useEffect } from 'react';
import { X, Settings, ShieldCheck, Radio, Volume2, Smartphone, Cpu, CheckCircle } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine.ts';

interface XKBSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voicePassthrough: boolean;
  onTogglePassthrough: () => void;
}

export const XKBSettingsModal: React.FC<XKBSettingsModalProps> = ({
  isOpen,
  onClose,
  voicePassthrough,
  onTogglePassthrough,
}) => {
  const [devices, setDevices] = useState<{ deviceId: string; label: string }[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  useEffect(() => {
    const fetchDevs = async () => {
      try {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const inputs = devs
          .filter((d) => d.kind === 'audioinput')
          .map((d, i) => ({
            deviceId: d.deviceId,
            label: d.label || (i === 0 ? 'Default Phone Microphone' : `Audio Device ${i + 1}`),
          }));
        if (inputs.length === 0) {
          inputs.push({ deviceId: 'default', label: 'Default Microphone' });
        }
        setDevices(inputs);
        if (inputs[0]) setSelectedDevice(inputs[0].deviceId);
      } catch (e) {
        setDevices([{ deviceId: 'default', label: 'Default Microphone' }]);
      }
    };

    fetchDevs();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#030712] border border-cyan-900/60 p-6 shadow-2xl space-y-5 text-slate-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                XKB VPN Audio Settings
              </h3>
              <p className="text-xs text-slate-400">
                Audio DSP hardware routing & processing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          {/* Audio Input Device Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-200 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Input Microphone Device</span>
            </label>
            <select
              value={selectedDevice}
              onChange={async (e) => {
                const id = e.target.value;
                setSelectedDevice(id);
                if (audioEngine.isMicConnected()) {
                  await audioEngine.startMicrophone(id);
                }
              }}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-cyan-900/50 text-cyan-200 font-mono text-xs focus:outline-none focus:border-cyan-400"
            >
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId} className="bg-slate-900 text-slate-100">
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Passthrough switch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <span className="font-bold text-slate-200 block">
                Local Speaker Voice Output
              </span>
              <p className="text-[10px] text-slate-400">
                Play your boosted microphone voice through speaker
              </p>
            </div>
            <button
              onClick={onTogglePassthrough}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                voicePassthrough
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {voicePassthrough ? 'ENABLED' : 'MUTED'}
            </button>
          </div>

          {/* Audio Engine Info Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-cyan-950/60 space-y-2">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Real-Time DSP Specifications</span>
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[9px]">SAMPLE RATE</span>
                <span className="text-slate-200 font-bold">48,000 Hz HD</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[9px]">LATENCY HINT</span>
                <span className="text-cyan-400 font-bold">Interactive ~4ms</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[9px]">LIMITER CEILING</span>
                <span className="text-slate-200 font-bold">-3 dB Brickwall</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 block text-[9px]">COMPRESSION</span>
                <span className="text-blue-400 font-bold">Dynamic RMS</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors border border-slate-800"
        >
          Close Settings
        </button>
      </div>
    </div>
  );
};
