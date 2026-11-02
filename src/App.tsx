import React, { useState, useEffect } from 'react';
import {
  Mic,
  Activity,
  Layers,
  SlidersVertical,
  PhoneCall,
  Send,
  Zap,
  Volume2,
  ShieldCheck,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

import { audioEngine } from './audio/audioEngine.ts';
import { AudioBoxId, BoxConfig, EqualizerBands, VoiceSyncConfig, XKBVoiceConfig } from './audio/types.ts';
import { SOUND_PRESETS, SoundPreset } from './audio/soundPresets.ts';

import { XKBHeader } from './components/XKBHeader.tsx';
import { XKBMicHero } from './components/XKBMicHero.tsx';
import { XKBVoiceControls } from './components/XKBVoiceControls.tsx';
import { XKBSettingsModal } from './components/XKBSettingsModal.tsx';
import { AudioVisualizer } from './components/AudioVisualizer.tsx';
import { EqualizerPanel } from './components/EqualizerPanel.tsx';
import { FourBoxSystem } from './components/FourBoxSystem.tsx';
import { VoiceSyncController } from './components/VoiceSyncController.tsx';
import { VoiceMessageRecorder } from './components/VoiceMessageRecorder.tsx';
import { CallSimulatorAndGuide } from './components/CallSimulatorAndGuide.tsx';

export default function App() {
  const [isMicActive, setIsMicActive] = useState(false);
  const [voicePassthrough, setVoicePassthrough] = useState(true);
  const [isCallMode, setIsCallMode] = useState(false);
  const [voiceRms, setVoiceRms] = useState(0);
  const [voiceModulation, setVoiceModulation] = useState(0);
  const [beatStep, setBeatStep] = useState(0);
  const [currentBeatPattern, setCurrentBeatPattern] = useState<'trap' | 'grrr_drill' | 'cyber_pulse' | 'voice_sync'>('trap');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Audio State mirrors
  const [xkbConfig, setXkbConfig] = useState<XKBVoiceConfig>(() => audioEngine.getXKBConfig());
  const [boxes, setBoxes] = useState<Record<AudioBoxId, BoxConfig>>(() => audioEngine.getBoxesConfig());
  const [eqBands, setEqBands] = useState<EqualizerBands>(() => audioEngine.getEqualizerBands());
  const [voiceSyncConfig, setVoiceSyncConfig] = useState<VoiceSyncConfig>(() => audioEngine.getVoiceSyncConfig());
  const [activeTab, setActiveTab] = useState<'main' | 'enhancement' | 'boxes' | 'equalizer' | 'voice_msg' | 'call_fx'>('main');

  useEffect(() => {
    // Register audio engine callbacks
    audioEngine.setCallbacks({
      onVoiceData: (rms, modulation) => {
        setVoiceRms(rms);
        setVoiceModulation(modulation);
      },
      onBeatStep: (step) => {
        setBeatStep(step);
      },
    });

    return () => {
      audioEngine.destroy();
    };
  }, []);

  // Mic Toggle
  const handleToggleMic = async () => {
    if (isMicActive) {
      audioEngine.stopMicrophone();
      setIsMicActive(false);
    } else {
      const ok = await audioEngine.startMicrophone();
      setIsMicActive(ok);
      if (ok) {
        audioEngine.setXKBConfig(xkbConfig);
      }
    }
  };

  const handleEnsureMic = async (): Promise<boolean> => {
    if (!isMicActive) {
      const ok = await audioEngine.startMicrophone();
      setIsMicActive(ok);
      if (ok) {
        audioEngine.setXKBConfig(xkbConfig);
      }
      return ok;
    }
    return true;
  };

  // Voice Passthrough
  const handleTogglePassthrough = () => {
    const next = !voicePassthrough;
    setVoicePassthrough(next);
    audioEngine.setVoicePassthrough(next);
  };

  // XKB Voice Configuration Change
  const handleChangeXKBConfig = (newCfg: Partial<XKBVoiceConfig>) => {
    audioEngine.setXKBConfig(newCfg);
    setXkbConfig({ ...audioEngine.getXKBConfig() });
  };

  // Call Mode Toggle
  const handleToggleCallMode = () => {
    const next = !isCallMode;
    setIsCallMode(next);
    audioEngine.setCallMode(next);
    setBoxes({ ...audioEngine.getBoxesConfig() });
  };

  // Box Controls
  const handleToggleBox = (id: AudioBoxId) => {
    const current = boxes[id].enabled;
    audioEngine.setBoxEnabled(id, !current);
    setBoxes({ ...audioEngine.getBoxesConfig() });
  };

  const handleChangeBoxVolume = (id: AudioBoxId, val: number) => {
    audioEngine.setBoxVolume(id, val);
    setBoxes({ ...audioEngine.getBoxesConfig() });
  };

  const handleChangeBoxParam = (id: AudioBoxId, paramNum: 1 | 2, val: number) => {
    audioEngine.setBoxParameter(id, paramNum, val);
    setBoxes({ ...audioEngine.getBoxesConfig() });
  };

  const handleChangeBeatPattern = (pattern: 'trap' | 'grrr_drill' | 'cyber_pulse' | 'voice_sync') => {
    setCurrentBeatPattern(pattern);
    audioEngine.setBeatPattern(pattern);
  };

  // Equalizer
  const handleChangeEqBand = (band: keyof EqualizerBands, val: number) => {
    audioEngine.setEqualizerBand(band, val);
    setEqBands({ ...audioEngine.getEqualizerBands() });
  };

  const handleResetEq = () => {
    const flat: EqualizerBands = {
      band60: 0,
      band230: 0,
      band910: 0,
      band3600: 0,
      band14000: 0,
    };
    (Object.keys(flat) as (keyof EqualizerBands)[]).forEach((b) => {
      audioEngine.setEqualizerBand(b, 0);
    });
    setEqBands(flat);
  };

  // Voice Sync
  const handleChangeVoiceSync = (cfg: Partial<VoiceSyncConfig>) => {
    audioEngine.setVoiceSyncConfig(cfg);
    setVoiceSyncConfig({ ...audioEngine.getVoiceSyncConfig() });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Official XKB Header */}
      <XKBHeader
        isBoosterActive={isMicActive}
        onOpenSettings={() => setIsSettingsOpen(true)}
        is30000XActive={xkbConfig.is30000XEnabled}
        onToggle30000X={() => handleChangeXKBConfig({ is30000XEnabled: !xkbConfig.is30000XEnabled })}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5 space-y-5">
        {/* Navigation Quick Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium scrollbar-none">
          {[
            { id: 'main', label: 'Main Booster', icon: Layers },
            { id: 'enhancement', label: 'Voice Enhancement', icon: Sliders },
            { id: 'boxes', label: 'Sound FX Boxes', icon: Activity },
            { id: 'equalizer', label: '5-Band EQ', icon: SlidersVertical },
            { id: 'call_fx', label: 'Call FX Mode', icon: PhoneCall },
            { id: 'voice_msg', label: 'Voice Message', icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap font-bold ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Hero Mic Booster Stage & Live Visualizer */}
        {(activeTab === 'main' || activeTab === 'enhancement') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <XKBMicHero
                isMicActive={isMicActive}
                onToggleMic={handleToggleMic}
                config={xkbConfig}
                onChangeConfig={handleChangeXKBConfig}
                voiceRms={voiceRms}
              />
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              <AudioVisualizer
                isMicActive={isMicActive}
                voiceRms={voiceRms}
                modulation={voiceModulation}
                masterVolume={0.9}
              />

              {/* Status & Processing Summary Card */}
              <div className="p-4 bg-slate-950/80 border border-cyan-950/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Real-Time Voice Normalization</span>
                  </span>
                  <span className="text-cyan-400 font-mono text-[11px]">HD 48,000 Hz</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Real-time audio processing with soft-saturation limiter prevents ear damage while delivering maximum loudness, speech presence, and deep bass.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Voice Controls: Bass, High Pitch, Clear Voice, Receiver Audio Optimization */}
        {(activeTab === 'main' || activeTab === 'enhancement') && (
          <XKBVoiceControls
            config={xkbConfig}
            onChangeConfig={handleChangeXKBConfig}
          />
        )}

        {/* Four-Box Sound Effects (Grrr, Vibration, Beat, Combo) */}
        {(activeTab === 'main' || activeTab === 'boxes') && (
          <FourBoxSystem
            boxes={boxes}
            onToggleBox={handleToggleBox}
            onChangeVolume={handleChangeBoxVolume}
            onChangeParam={handleChangeBoxParam}
            onChangeBeatPattern={handleChangeBeatPattern}
            currentBeatPattern={currentBeatPattern}
            beatStep={beatStep}
            voiceModulation={voiceModulation}
            lang="en"
          />
        )}

        {/* 5-Band Equalizer (60Hz, 230Hz, 910Hz, 3600Hz, 14000Hz) */}
        {(activeTab === 'main' || activeTab === 'equalizer') && (
          <EqualizerPanel
            bands={eqBands}
            onChangeBand={handleChangeEqBand}
            onReset={handleResetEq}
            lang="en"
          />
        )}

        {/* Voice-Sync Controller */}
        {(activeTab === 'main' || activeTab === 'boxes') && (
          <VoiceSyncController
            config={voiceSyncConfig}
            onChangeConfig={handleChangeVoiceSync}
            voiceRms={voiceRms}
            modulation={voiceModulation}
            lang="en"
          />
        )}

        {/* Voice Message Recorder (1-Click Record with Grrr & Beat + WhatsApp Share) */}
        {(activeTab === 'main' || activeTab === 'voice_msg') && (
          <VoiceMessageRecorder
            isMicActive={isMicActive}
            onEnsureMic={handleEnsureMic}
            lang="en"
          />
        )}

        {/* Call Mode FX & Android Audio Routing Guide */}
        {(activeTab === 'main' || activeTab === 'call_fx') && (
          <CallSimulatorAndGuide
            isCallMode={isCallMode}
            onToggleCallMode={handleToggleCallMode}
            voiceRms={voiceRms}
            lang="en"
          />
        )}
      </main>

      {/* Settings Modal */}
      <XKBSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        voicePassthrough={voicePassthrough}
        onTogglePassthrough={handleTogglePassthrough}
      />

      {/* Footer */}
      <footer className="mt-8 py-4 border-t border-cyan-950/60 bg-black/80 text-center text-xs text-slate-500 font-mono">
        <p>
          XKB VPN – Premium Voice Booster • Ultra HD Audio Processing • Safe Limiter Active
        </p>
      </footer>
    </div>
  );
}
