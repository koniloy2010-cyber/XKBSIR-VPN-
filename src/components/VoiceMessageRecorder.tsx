import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Download, Trash2, Send, Share2, Sparkles, CheckCircle2 } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine.ts';
import { VoiceRecording } from '../audio/types.ts';

interface VoiceMessageRecorderProps {
  isMicActive: boolean;
  onEnsureMic: () => Promise<boolean>;
  lang: 'bn' | 'en';
}

export const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({
  isMicActive,
  onEnsureMic,
  lang,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartRecord = async () => {
    const micReady = await onEnsureMic();
    if (!micReady) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে প্রথমে মাইক্রোফোন চালু করুন!' : 'Please enable microphone first!');
      return;
    }

    // Auto-enable Beat & Grrr for the voice message as requested by user
    audioEngine.setBoxEnabled('box1_deep_grrr', true);
    audioEngine.setBoxEnabled('box3_electronic_beat', true);

    const started = audioEngine.startVoiceRecording();
    if (started) {
      setIsRecording(true);
      setRecordDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
      setStatusMessage(
        lang === 'bn'
          ? 'রেকর্ডিং শুরু হয়েছে: আপনার কথার সাথে ঘ্যার ঘ্যার ও বিট স্বয়ংক্রিয়ভাবে যুক্ত হচ্ছে!'
          : 'Recording: Grrr & Beat automatically syncing to your voice!'
      );
    }
  };

  const handleStopRecord = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    const blob = await audioEngine.stopVoiceRecording();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const newRec: VoiceRecording = {
        id: `rec_${Date.now()}`,
        url,
        blob,
        duration: recordDuration,
        createdAt: new Date(),
        sizeBytes: blob.size,
      };
      setRecordings((prev) => [newRec, ...prev]);
      setStatusMessage(
        lang === 'bn'
          ? 'ভয়েস মেসেজ প্রস্তুত! নিচে শুনুন বা ডাউনলোড করে পাঠান।'
          : 'Voice message ready! Listen or download below.'
      );
    }
  };

  const handlePlayToggle = (rec: VoiceRecording) => {
    if (playingId === rec.id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(rec.url);
      audioPlayerRef.current = audio;
      audio.onended = () => setPlayingId(null);
      audio.play();
      setPlayingId(rec.id);
    }
  };

  const handleDelete = (id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    if (playingId === id && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setPlayingId(null);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <Send className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span>{lang === 'bn' ? 'ভয়েস মেসেজ ইফেক্টস স্টুডিও' : 'Voice Message FX Studio'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                BEAT & GRRR SYNC
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'কাউকে ভয়েস মেসেজ পাঠাতে রেকর্ড করুন—স্বয়ংক্রিয়ভাবে Grrr ও Beat সাউন্ড সিঙ্ক হয়ে যুক্ত হবে'
                : 'Record voice notes with embedded Grrr bass & rhythmic beats auto-matched to your speech'}
            </p>
          </div>
        </div>
      </div>

      {/* Record Action Bar */}
      <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isRecording ? (
            <button
              onClick={handleStopRecord}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all animate-pulse"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>{lang === 'bn' ? 'রেকর্ড সম্পন্ন করুন' : 'Stop & Save'}</span>
            </button>
          ) : (
            <button
              onClick={handleStartRecord}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ভয়েস মেসেজ রেকর্ড করুন' : 'Record Voice Message'}</span>
            </button>
          )}

          {isRecording && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span className="font-mono text-base font-bold text-rose-400">
                {formatTime(recordDuration)}
              </span>
              <span className="text-xs text-slate-400">
                {lang === 'bn' ? '(Grrr + Beat সিঙ্ক হচ্ছে)' : '(Syncing Grrr + Beat)'}
              </span>
            </div>
          )}
        </div>

        {statusMessage && (
          <div className="text-xs text-cyan-300 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Recorded List */}
      {recordings.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-slate-400">
            {lang === 'bn' ? 'প্রস্তুতকৃত ভয়েস মেসেজ সমূহ:' : 'Created Voice Messages:'}
          </span>

          <div className="space-y-2">
            {recordings.map((rec, idx) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePlayToggle(rec)}
                    className="p-2 rounded-xl bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 transition-colors"
                  >
                    {playingId === rec.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 fill-purple-300" />
                    )}
                  </button>

                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      {lang === 'bn' ? `ভয়েস নোট #${recordings.length - idx}` : `Voice Note #${recordings.length - idx}`}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTime(rec.duration)} • {(rec.sizeBytes / 1024).toFixed(0)} KB • Grrr & Beat FX
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      if (navigator.share) {
                        try {
                          const file = new File([rec.blob], `grrr-voice-${rec.id}.webm`, { type: 'audio/webm' });
                          await navigator.share({
                            title: 'AI Grrr Voice Note',
                            text: 'Voice note with Grrr & Beat FX',
                            files: [file],
                          });
                        } catch (e) {
                          // User cancelled or not supported
                        }
                      } else {
                        // Fallback trigger download
                        const a = document.createElement('a');
                        a.href = rec.url;
                        a.download = `grrr-voice-${rec.id}.webm`;
                        a.click();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold transition-colors border border-purple-500/40"
                    title={lang === 'bn' ? 'WhatsApp / Messenger এ শেয়ার করুন' : 'Share to WhatsApp / Apps'}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'শেয়ার / WhatsApp' : 'Share'}</span>
                  </button>

                  <a
                    href={rec.url}
                    download={`ai-audio-grrr-msg-${rec.id}.webm`}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
                    title={lang === 'bn' ? 'ডাউনলোড করুন' : 'Download Audio'}
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDelete(rec.id)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                    title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Direct FAQ Explanation on Mic & Voice Messaging */}
      <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-cyan-800/40 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-cyan-300 font-bold">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>
            {lang === 'bn'
              ? 'অন্য অ্যাপে (WhatsApp/Messenger) ভয়েস মেসেজ দিলে কি মাইক বন্ধ হবে?'
              : 'Will the mic stop when recording in WhatsApp or other apps?'}
          </span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          {lang === 'bn'
            ? 'অ্যান্ড্রয়েডের নিয়ম অনুযায়ী একসাথে দুটি অ্যাপ সরাসরি একই মাইক রেকর্ড করতে পারে না। কিন্তু আপনার কোনো সমস্যা হবে না, কারণ আমাদের অ্যাপে দুটি সহজ উপায় রয়েছে:'
            : 'Android does not allow two apps to record from the hardware mic simultaneously. However, you have two guaranteed ways:'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400">
              {lang === 'bn' ? 'পদ্ধতি ১ (সবচেয়ে সহজ ও ১০০% নিখুঁত):' : 'Method 1 (Best Quality):'}
            </span>
            <p className="text-slate-400">
              {lang === 'bn'
                ? 'এই অ্যাপেই "ভয়েস মেসেজ রেকর্ড করুন" চাপুন -> কথা শেষ করে "শেয়ার / WhatsApp" বাটনে ১ ক্লিকে পাঠিয়ে দিন। এতে মাইক বন্ধ হওয়ার কোনো ঝুঁকি নেই!'
                : 'Record directly in this app with Grrr + Beat sync, then tap "Share / WhatsApp" to send instantly.'}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-400">
              {lang === 'bn' ? 'পদ্ধতি ২ (সরাসরি হোয়াটসঅ্যাপে রেকর্ড):' : 'Method 2 (Speaker Loopback):'}
            </span>
            <p className="text-slate-400">
              {lang === 'bn'
                ? 'অ্যাপের "Box 1 Grrr" সাউন্ড লাউডস্পিকারে অন রাখুন। এরপর হোয়াটসঅ্যাপের মাইক বাটন চেপে কথা বললে স্পিকারের ঘ্যার ঘ্যার সাউন্ড স্বয়ংক্রিয়ভাবে অপর প্রান্তে যাবে।'
                : 'Keep the Grrr sound playing through your phone speaker in the background. WhatsApp will record the speaker sound along with your voice.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
