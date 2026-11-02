import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface PWAInstallButtonProps {
  lang: 'bn' | 'en';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ lang }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showManualGuide, setShowManualGuide] = useState(false);

  // If already running as an installed standalone app, show nice active badge
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span>{lang === 'bn' ? 'অ্যাপ ফোনে ইন্সটলড্' : 'App Installed'}</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowManualGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all animate-pulse"
        title={lang === 'bn' ? 'ফোনে সরাসরি অ্যাপ হিসেবে ইন্সটল করুন' : 'Install directly as a phone app'}
      >
        <Smartphone className="w-4 h-4" />
        <span>{lang === 'bn' ? 'ফোনে ইন্সটল করুন' : 'Install App'}</span>
      </button>

      {/* Manual Installation Guide Modal */}
      {showManualGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4 text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {lang === 'bn' ? 'ফোনে অ্যাপটি ইন্সটল করার নিয়ম' : 'How to Install on Phone'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn' ? 'কোনো প্লে স্টোর ছাড়াই সরাসরি ফোনে চলবে' : 'Instantly installs onto your home screen'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowManualGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Android Chrome Instructions */}
            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-900/40 space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                  <span>🤖 {lang === 'bn' ? 'অ্যান্ড্রয়েড ফোনের জন্য (Android Chrome):' : 'For Android (Chrome):'}</span>
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
                  <li>
                    {lang === 'bn'
                      ? 'ক্রোম ব্রাউজারের উপরে ডানদিকের ৩টি ডট ( ⋮ ) মেনুতে চাপ দিন।'
                      : 'Tap the 3 dots menu ( ⋮ ) in the top right of Chrome.'}
                  </li>
                  <li className="font-semibold text-cyan-300">
                    {lang === 'bn'
                      ? '"Install app" অথবা "Add to Home screen" (হোম স্ক্রিনে যোগ করুন)-এ চাপ দিন।'
                      : 'Tap "Install app" or "Add to Home screen".'}
                  </li>
                  <li>
                    {lang === 'bn'
                      ? 'পপআপে "Install" চাপলেই এটি আপনার ফোনে সরাসরি আসল অ্যাপের মতো চলে আসবে!'
                      : 'Tap "Install" to immediately add it to your apps list with zero browser bars!'}
                  </li>
                </ol>
              </div>

              {/* iOS Safari Instructions */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="font-bold text-sky-400 flex items-center gap-1.5 text-sm">
                  <span>🍏 {lang === 'bn' ? 'আইফোন / আইপ্যাডের জন্য (iPhone Safari):' : 'For iPhone (Safari):'}</span>
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
                  <li>
                    {lang === 'bn'
                      ? 'সাফারি ব্রাউজারের নিচে থাকা "Share" (শেয়ার) আইকনে চাপ দিন।'
                      : 'Tap the "Share" icon at the bottom of Safari.'}
                  </li>
                  <li className="font-semibold text-cyan-300">
                    {lang === 'bn'
                      ? 'নিচে স্ক্রোল করে "Add to Home Screen"-এ চাপ দিন।'
                      : 'Scroll down and tap "Add to Home Screen".'}
                  </li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowManualGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              {lang === 'bn' ? 'ঠিক আছে, বুঝেছি' : 'Got it!'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
