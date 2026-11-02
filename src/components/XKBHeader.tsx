import React from 'react';
import { Shield, Sparkles, Settings2, Smartphone, Zap } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface XKBHeaderProps {
  isBoosterActive: boolean;
  onOpenSettings: () => void;
  is30000XActive: boolean;
  onToggle30000X: () => void;
}

export const XKBHeader: React.FC<XKBHeaderProps> = ({
  isBoosterActive,
  onOpenSettings,
  is30000XActive,
  onToggle30000X,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#030712]/95 border-b border-cyan-900/40 backdrop-blur-md px-4 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* App Logo & Branding */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)] bg-black flex items-center justify-center">
              <img
                src="/xkb-logo.png"
                alt="XKB VPN Logo"
                className="w-full h-full object-cover"
              />
            </div>
            {isBoosterActive && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-black animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider text-white flex items-center gap-1.5">
                <span>XKB VPN</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                PRO VOICE BOOSTER
              </span>
            </div>
            <p className="text-[11px] font-mono text-cyan-400/80">
              Ultra HD Real-Time Voice Processing
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 30,000X Quick Toggle */}
          <button
            onClick={onToggle30000X}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              is30000XActive
                ? 'bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.8)] scale-105'
                : 'bg-slate-900 border border-cyan-900/50 text-cyan-400 hover:border-cyan-500'
            }`}
            title="Toggle 30,000X Extreme Voice Enhancement"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>30,000X BOOST</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton lang="en" />

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
            title="Audio & DSP Settings"
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
