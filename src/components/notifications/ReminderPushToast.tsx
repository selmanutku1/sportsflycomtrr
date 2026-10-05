import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  BellRing,
  X,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Send,
  Users,
} from 'lucide-react';
import { NavPage } from '../../types';

interface ReminderEventDetail {
  recipientsCount: number;
  athleteNamesText: string;
  groupName: string;
  targetAudience: 'parent' | 'trainer' | 'both';
  channels: string[];
  message: string;
  log?: any;
}

interface ReminderPushToastProps {
  onNavigate?: (page: NavPage) => void;
}

export const ReminderPushToast: React.FC<ReminderPushToastProps> = ({ onNavigate }) => {
  const [activeAlert, setActiveAlert] = useState<ReminderEventDetail | null>(null);
  const [progress, setProgress] = useState<number>(100);
  const timerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);

  // Play subtle bell chime for reminder triggers
  const playBellSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15); // E6

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
      setTimeout(() => {
        ctx.close().catch(() => {});
      }, 650);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (e) {}
    }
  };

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setActiveAlert(null);
  };

  const handleOpenYoklama = () => {
    if (onNavigate) {
      onNavigate('yoklama');
    }
    handleDismiss();
  };

  useEffect(() => {
    const handleReminderEvent = (e: any) => {
      const data: ReminderEventDetail = e.detail;
      if (!data) return;

      playBellSound();
      triggerHaptic();

      setActiveAlert(data);
      setProgress(100);

      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      const duration = 6500;
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

    window.addEventListener('sportsfly_reminder_triggered', handleReminderEvent);
    return () => {
      window.removeEventListener('sportsfly_reminder_triggered', handleReminderEvent);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  if (!activeAlert) return null;

  return (
    <div
      className="fixed top-3 sm:top-5 left-3 right-3 sm:left-auto sm:right-5 sm:w-[440px] z-[110] animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto"
      role="alert"
    >
      <div className="bg-slate-900/95 dark:bg-[#090d16]/95 text-white rounded-2xl shadow-2xl border border-blue-500/30 backdrop-blur-md overflow-hidden ring-1 ring-black/20">
        {/* Top Native Mobile Header */}
        <div className="px-3.5 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold">
              <BellRing className="w-3 h-3 text-white animate-bounce" />
            </div>
            <span className="font-bold text-slate-200">Otomatik Yoklama Tetikleyicisi</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-medium">Şimdi</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[9px] uppercase tracking-wider border border-emerald-500/30">
              {activeAlert.recipientsCount} KİŞİYE İLETİLDİ
            </span>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Send className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black text-white flex items-center justify-between gap-2">
                <span>Hatırlatma Bildirimi Gönderildi</span>
                <span className="text-blue-400 font-semibold text-[11px] truncate">{activeAlert.groupName}</span>
              </h4>

              <p className="text-xs text-slate-200 font-medium mt-1 leading-snug line-clamp-2">
                {activeAlert.message}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-400" />
                  <span>Hedef: {activeAlert.targetAudience === 'parent' ? 'Veliler' : activeAlert.targetAudience === 'trainer' ? 'Eğitmenler' : 'Veliler & Eğitmenler'}</span>
                </span>
                
                {activeAlert.channels.map((ch, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/40 font-mono text-[9px]">
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleOpenYoklama}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Yoklama Listesine Git</span>
            </button>

            <button
              onClick={handleDismiss}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            >
              <span>Tamam</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 h-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
