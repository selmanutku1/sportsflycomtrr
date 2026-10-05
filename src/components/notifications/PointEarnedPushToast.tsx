import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  X,
  Bell,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Volume2,
} from 'lucide-react';
import { NavPage } from '../../types';

interface PointEarnedData {
  id?: string;
  sporcuId?: string;
  sporcuName: string;
  ruleName: string;
  points: number;
  category: string;
  note?: string;
  date?: string;
  notificationId?: string;
}

interface PointEarnedPushToastProps {
  onNavigate?: (page: NavPage) => void;
}

export const PointEarnedPushToast: React.FC<PointEarnedPushToastProps> = ({
  onNavigate,
}) => {
  const [activeAlert, setActiveAlert] = useState<PointEarnedData | null>(null);
  const [progress, setProgress] = useState<number>(100);
  const timerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);
  const toastRef = useRef<HTMLDivElement>(null);

  // Play subtle sound effect on point award
  const playRewardSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.3); // C6

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
      setTimeout(() => {
        ctx.close().catch(() => {});
      }, 600);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  // Trigger haptic vibration on mobile devices
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([80, 40, 100]);
      } catch (e) {}
    }
  };

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setActiveAlert(null);
  };

  const handleOpenNotificationCenter = () => {
    // Dispatch custom event for Header to open its notification dropdown
    window.dispatchEvent(new CustomEvent('sportsfly_open_notifications'));
    handleDismiss();
  };

  const handleGoToEvaluation = () => {
    if (onNavigate) {
      onNavigate('sporpuan-sporcu-degerlendirme');
    }
    handleDismiss();
  };

  useEffect(() => {
    const handlePointEarnedEvent = (e: any) => {
      const data: PointEarnedData = e.detail;
      if (!data) return;

      // Trigger sensory feedbacks
      playRewardSound();
      triggerHaptic();

      // Set current alert
      setActiveAlert(data);
      setProgress(100);

      // Clear previous timers
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      // Duration: 5.5 seconds
      const duration = 5500;
      const stepInterval = 50;
      const totalSteps = duration / stepInterval;
      let currentStep = totalSteps;

      progressIntervalRef.current = setInterval(() => {
        currentStep -= 1;
        const newProgress = Math.max(0, (currentStep / totalSteps) * 100);
        setProgress(newProgress);
        if (currentStep <= 0) {
          clearInterval(progressIntervalRef.current);
        }
      }, stepInterval);

      timerRef.current = setTimeout(() => {
        setActiveAlert(null);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }, duration);
    };

    window.addEventListener('sportsfly_point_earned', handlePointEarnedEvent);
    return () => {
      window.removeEventListener('sportsfly_point_earned', handlePointEarnedEvent);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  if (!activeAlert) return null;

  return (
    <div
      ref={toastRef}
      className="fixed top-3 sm:top-5 left-3 right-3 sm:left-auto sm:right-5 sm:w-[420px] z-[100] animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto"
      role="alert"
      aria-live="assertive"
    >
      <div className="bg-slate-900/95 dark:bg-[#0f172a]/95 text-white rounded-2xl shadow-2xl border border-amber-500/30 backdrop-blur-md overflow-hidden ring-1 ring-black/10">
        {/* Top App Header Row (Native mobile push style) */}
        <div className="px-3.5 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Zap className="w-3 h-3 fill-slate-950" />
            </div>
            <span className="font-bold text-slate-200">SportsFly Bildirim</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-medium">Şimdi</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] uppercase tracking-wider border border-amber-500/30">
              YENİ PUAN
            </span>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3.5 sm:p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>Yeni Puan Kazanımı!</span>
                  <span className="text-amber-400 font-bold text-[10px]">• Bildirim Merkezine Düştü</span>
                </h4>
                <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs shrink-0 border border-emerald-500/30">
                  +{activeAlert.points} SP
                </div>
              </div>

              <p className="text-xs text-slate-200 font-semibold mt-1 leading-snug">
                <strong className="text-white">{activeAlert.sporcuName}</strong> sporcusuna{' '}
                <span className="text-amber-300">"{activeAlert.ruleName}"</span> tanımlandı.
              </p>

              {activeAlert.note && (
                <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-1">
                  Not: "{activeAlert.note}"
                </p>
              )}

              <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                  {activeAlert.category}
                </span>
                <span className="flex items-center gap-1 text-blue-400 font-medium">
                  <Bell className="w-3 h-3" />
                  <span>Merkeze kaydedildi</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons (Touch Friendly) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleOpenNotificationCenter}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Bildirimi Gör</span>
            </button>

            <button
              onClick={handleGoToEvaluation}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            >
              <span>Sporpuan Detayı</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar (Countdown to Auto-Dismiss) */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
