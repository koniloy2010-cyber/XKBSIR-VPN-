import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../audio/audioEngine.ts';

interface AudioVisualizerProps {
  isMicActive: boolean;
  voiceRms: number;
  modulation: number;
  masterVolume: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isMicActive,
  voiceRms,
  modulation,
  masterVolume,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = 256;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    const render = () => {
      audioEngine.getMasterFrequencyData(freqData);
      audioEngine.getMasterTimeDomainData(timeData);

      const width = canvas.width;
      const height = canvas.height;

      // Dark background with subtle gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0a0f1d');
      bgGrad.addColorStop(1, '#05070d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let y = 20; y < height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw frequency spectrum bars
      const barCount = 48;
      const barWidth = width / barCount;
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * (bufferLength / 2));
        const val = freqData[dataIndex] || 0;
        const barHeight = (val / 255) * (height * 0.7);

        // Cyberpunk cyan/amber/emerald gradient
        const barGrad = ctx.createLinearGradient(0, height, 0, height - barHeight);
        barGrad.addColorStop(0, '#0284c7');
        barGrad.addColorStop(0.6, '#38bdf8');
        barGrad.addColorStop(1, '#f59e0b');

        ctx.fillStyle = barGrad;
        ctx.fillRect(i * barWidth + 1, height - barHeight, barWidth - 2, barHeight);
      }

      // Draw real-time oscilloscope waveform overlay
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#00f2fe';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="relative bg-slate-950/80 border border-cyan-900/40 rounded-2xl p-3 backdrop-blur-md shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Real-Time Audio Spectrum & Oscilloscope
          </span>
        </div>

        {/* Real-time Indicators */}
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Voice In:</span>
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500 transition-all duration-75"
                style={{ width: `${Math.min(100, voiceRms * 300)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Sync Mod:</span>
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-amber-500 transition-all duration-75"
                style={{ width: `${Math.round(modulation * 100)}%` }}
              />
            </div>
            <span className="text-amber-400">{Math.round(modulation * 100)}%</span>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={720}
        height={130}
        className="w-full h-28 rounded-xl bg-slate-950 border border-slate-800/80 shadow-inner"
      />

      <div className="flex items-center justify-between mt-2 px-2 text-[10px] text-slate-500 font-mono">
        <span>20 Hz (SUB BASS)</span>
        <span>100 Hz (GRRR GROWL)</span>
        <span>1 kHz (VOCALS)</span>
        <span>4 kHz (ATTACK)</span>
        <span>16 kHz (AIR)</span>
      </div>
    </div>
  );
};
