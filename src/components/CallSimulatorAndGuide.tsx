import React, { useState, useEffect } from 'react';
import { PhoneCall, PhoneOff, HelpCircle, CheckCircle2, AlertTriangle, ShieldCheck, Smartphone, Volume2, Waves } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine.ts';

interface CallSimulatorAndGuideProps {
  isCallMode: boolean;
  onToggleCallMode: () => void;
  voiceRms: number;
  lang: 'bn' | 'en';
}

export const CallSimulatorAndGuide: React.FC<CallSimulatorAndGuideProps> = ({
  isCallMode,
  onToggleCallMode,
  voiceRms,
  lang,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  useEffect(() => {
    let interval: number | null = null;
    if (isCallMode) {
      interval = window.setInterval(() => {
        setCallDuration((c) => c + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallMode]);

  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <PhoneCall className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span>{lang === 'bn' ? 'অটোমেটিক কল সাউন্ড ইফেক্টস' : 'Automatic Call Sound FX'}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isCallMode
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isCallMode ? (lang === 'bn' ? 'কল চলমান' : 'CALL RUNNING') : (lang === 'bn' ? 'প্রস্তুত' : 'STANDBY')}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'কল চলাকালীন সার্বক্ষণিক ঘ্যার ঘ্যার (Grrr) সাউন্ড চালু থাকবে এবং কথা বললে সাথে সাথে মিক্স হবে'
                : 'Continuous background Grrr rasp that runs even when silent and intensifies while speaking'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAndroidGuide(!showAndroidGuide)}
          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-800 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'অ্যান্ড্রয়েড কল সেটআপ গাইড' : 'Android Call Guide'}</span>
        </button>
      </div>

      {/* Live Call Simulator Panel */}
      <div
        className={`p-4 rounded-2xl border transition-all duration-300 ${
          isCallMode
            ? 'bg-gradient-to-r from-rose-950/40 via-slate-950 to-slate-900 border-rose-700/50 shadow-[0_0_25px_rgba(244,63,94,0.2)]'
            : 'bg-slate-950/70 border-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl border transition-all ${
                isCallMode
                  ? 'bg-rose-600 text-white border-rose-500 shadow-[0_0_15px_#f43f5e]'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <PhoneCall className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {isCallMode
                    ? (lang === 'bn' ? 'লাইভ কল সংযুক্ত (ঘ্যার ঘ্যার সক্রিয়)' : 'Voice Call Connected (Grrr Active)')
                    : (lang === 'bn' ? 'কল সিমুলেশন টেস্ট' : 'Call Mode Simulator')}
                </span>
                {isCallMode && (
                  <span className="font-mono text-xs font-bold text-rose-400">
                    {formatCallTime(callDuration)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isCallMode
                  ? (lang === 'bn'
                      ? '✓ কথা না বললেও ব্যাকগ্রাউন্ডে Grrr সাউন্ড চলছে • কথা বললে আরো ভারী হচ্ছে'
                      : '✓ Grrr is playing continuously in the background • Modulates when you speak')
                  : (lang === 'bn'
                      ? 'বাটন চাপুন কল চালু করে ঘ্যার ঘ্যার সাউন্ড টেস্ট করার জন্য'
                      : 'Toggle on to enter call mode with auto-Grrr sound')}
              </p>
            </div>
          </div>

          <button
            onClick={onToggleCallMode}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg ${
              isCallMode
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_18px_rgba(244,63,94,0.5)]'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
            }`}
          >
            {isCallMode ? (
              <>
                <PhoneOff className="w-4 h-4" />
                <span>{lang === 'bn' ? 'কল বন্ধ করুন' : 'End Call Mode'}</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-4 h-4" />
                <span>{lang === 'bn' ? 'কল মোড চালু করুন' : 'Start Call Mode'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Android & 3rd-party Routing Helper Accordion */}
      {showAndroidGuide && (
        <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-900/50 space-y-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Smartphone className="w-4 h-4" />
            <span>
              {lang === 'bn'
                ? 'WhatsApp, Messenger বা সাধারণ ফোনে সাউন্ড পাঠানোর নিয়মাবলী:'
                : 'How to Route Effects to WhatsApp, Messenger, or Phone Calls:'}
            </span>
          </div>

          <p className="text-slate-400 leading-relaxed">
            {lang === 'bn'
              ? 'অ্যান্ড্রয়েড সিস্টেমে সিকিউরিটির কারণে এক অ্যাপ সরাসরি অন্য অ্যাপের কল মাইক হাইজ্যাক করতে পারে না। তবে আপনার পাঠানো ভিডিওতে যেমন নোটিফিকেশনে "Hear Boost - will work in the background" দেখানো হয়েছে, ঠিক তেমনি নিচের ৩টি কার্যকর উপায়ে আপনি এই অ্যাপের ঘ্যার ঘ্যার সাউন্ড যেকোনো কলে পাঠাতে পারবেন:'
              : 'Android isolates audio streams between apps for privacy. However, just like the "Hear Boost - will work in the background" notification seen on your phone, you can route this sound to any call via:'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? '১. ব্যাকগ্রাউন্ড স্পিকার মোড' : '1. Speakerphone Mode'}</span>
              </span>
              <p className="text-[11px] text-slate-400 leading-tight">
                {lang === 'bn'
                  ? 'অ্যাপটি ব্যাকগ্রাউন্ডে চালু রেখে কলে লাউডস্পিকার অন করুন। অ্যাপের ডিপ বেস সরাসরি ফোনের মাইকে পিকআপ হয়ে অপর প্রান্তে ঘ্যার ঘ্যার সাউন্ড যাবে।'
                  : 'Keep app open in background and put call on speakerphone. The deep grrr will be picked up clearly by the microphone.'}
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? '২. ভার্চুয়াল অডিও ক্যাবল / লুপব্যাক' : '2. Audio Loopback / Aux Splitter'}</span>
              </span>
              <p className="text-[11px] text-slate-400 leading-tight">
                {lang === 'bn'
                  ? 'একটি 3.5mm Headphone Splitter বা Virtual Audio Cable অ্যাপ ব্যবহার করে আউটপুটকে ইনপুট মাইকে রিডাইরেক্ট করুন।'
                  : 'Use a TRRS Aux splitter cable or virtual audio driver to feed this app output directly into the phone microphone input.'}
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? '৩. ভয়েস মেসেজ এক্সপোর্ট' : '3. Voice Message Share'}</span>
              </span>
              <p className="text-[11px] text-slate-400 leading-tight">
                {lang === 'bn'
                  ? 'উপরের "ভয়েস মেসেজ রেকর্ডার" দিয়ে কথা বললে স্বয়ংক্রিয়ভাবে Grrr ও Beat সিঙ্ক হয়ে অডিও তৈরি হবে যা সরাসরি যেকোনো চ্যাটে পাঠানো যায়।'
                  : 'Record in the Voice Message FX tab; it auto-syncs Grrr + Beat into a high quality audio file ready to send to any chat.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
