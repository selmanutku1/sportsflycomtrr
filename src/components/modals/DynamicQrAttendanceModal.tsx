import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Sparkles,
  Maximize2,
  RefreshCw,
  CheckCircle2,
  Zap,
  Users,
  ShieldCheck,
  Smartphone,
  Camera,
  Volume2
} from 'lucide-react';
import { QrCodeDisplay } from '../common/QrCodeDisplay';
import { GrupItem, SporcuItem } from '../../types';

interface DynamicQrAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: GrupItem;
  date: string;
  onAthleteCheckedIn?: (memberId: string) => void;
  attendanceState: Record<string, 'present' | 'absent' | 'excused' | null>;
}

export const DynamicQrAttendanceModal: React.FC<DynamicQrAttendanceModalProps> = ({
  isOpen,
  onClose,
  group,
  date,
  onAthleteCheckedIn,
  attendanceState,
}) => {
  const [tokenCounter, setTokenCounter] = useState(20);
  const [sessionToken, setSessionToken] = useState(() => `SF-LIVE-${Math.floor(1000 + Math.random() * 9000)}`);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recentCheckedInName, setRecentCheckedInName] = useState<string | null>(null);

  // Refresh token countdown
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTokenCounter((prev) => {
        if (prev <= 1) {
          setSessionToken(`SF-LIVE-${Math.floor(1000 + Math.random() * 9000)}`);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Listen for live QR check-ins triggered from phone or camera scanner
  useEffect(() => {
    if (!isOpen) return;

    const handleQrCheckIn = (e: CustomEvent<{ memberId: string; name: string; groupId: string }>) => {
      if (e.detail && e.detail.groupId === group.id) {
        if (onAthleteCheckedIn) {
          onAthleteCheckedIn(e.detail.memberId);
        }
        setRecentCheckedInName(e.detail.name);
        setTimeout(() => setRecentCheckedInName(null), 4000);
      }
    };

    window.addEventListener('sportsfly_qr_checkin' as any, handleQrCheckIn);
    return () => {
      window.removeEventListener('sportsfly_qr_checkin' as any, handleQrCheckIn);
    };
  }, [isOpen, group.id, onAthleteCheckedIn]);

  if (!isOpen) return null;

  const qrPayload = JSON.stringify({
    app: 'Sportsfly',
    type: 'yoklama_checkin',
    groupId: group.id,
    groupName: group.name,
    date,
    token: sessionToken,
    timestamp: Date.now(),
  });

  const checkedInMembers = group.members?.filter(
    (m) => attendanceState[m.id] === 'present'
  ) || [];

  const totalMembers = group.members?.length || 0;

  // Simulate a test athlete check-in for trainer demo
  const simulateAthleteScan = () => {
    const pendingMembers = group.members?.filter(m => attendanceState[m.id] !== 'present') || [];
    if (pendingMembers.length === 0) return;
    const randomMember = pendingMembers[Math.floor(Math.random() * pendingMembers.length)];

    if (onAthleteCheckedIn) {
      onAthleteCheckedIn(randomMember.id);
    }

    setRecentCheckedInName(randomMember.name);
    setTimeout(() => setRecentCheckedInName(null), 4000);

    // Dispatch global event
    const event = new CustomEvent('sportsfly_qr_checkin', {
      detail: {
        memberId: randomMember.id,
        name: randomMember.name,
        groupId: group.id,
      },
    });
    window.dispatchEvent(event);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col w-full transition-all ${
        isFullscreen ? 'h-screen w-screen rounded-none' : 'max-w-2xl max-h-[90vh]'
      }`}>
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight flex items-center gap-2">
                <span>Dinamik QR Yoklama Ekrani</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Canli Aktif
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {group.name} • {date} • {group.branch}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={isFullscreen ? 'Tam Ekrandan Çık' : 'Kiosk / Tam Ekran'}
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Recent Scan Flash Notice */}
        {recentCheckedInName && (
          <div className="bg-emerald-500 text-slate-950 font-black text-sm px-4 py-3 flex items-center justify-between animate-in slide-in-from-top-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 fill-slate-950 text-emerald-500" />
              <span>🎉 YOKLAMA ALINDI: {recentCheckedInName} antrenmana giriş yaptı! (+75 SporPuan)</span>
            </div>
            <span className="text-xs bg-slate-950 text-emerald-400 px-2 py-0.5 rounded-md">Otomatik İşlendi</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 flex flex-col items-center justify-center text-center">
          
          {/* QR Container & Live Security Pulse */}
          <div className="relative group my-2">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 animate-pulse" />
            
            <QrCodeDisplay value={qrPayload} size={240} className="relative shadow-2xl" />

            {/* Live Refresh Badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-950 text-slate-300 px-3.5 py-1 rounded-full border border-slate-700 text-xs font-mono font-bold flex items-center gap-2 shadow-lg">
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span>Dinamik Kod: <strong className="text-white">{tokenCounter}s</strong></span>
            </div>
          </div>

          {/* Instructions for Athletes */}
          <div className="mt-7 max-w-md bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-left">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-200 mb-2">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>Sporcular Nasıl Giriş Yapar?</span>
            </div>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Telefon kamerasını açın veya <strong>Sportsfly</strong> uygulamasına girin.</li>
              <li>Ekranda yayınlanan bu QR kodu okutun.</li>
              <li>Yoklamanız anında <strong>"Geldi"</strong> olarak işaretlenir ve profilinize +75 SP tanımlanır.</li>
            </ol>
          </div>

          {/* Quick Simulation & Live Stats Bar */}
          <div className="mt-6 w-full max-w-md flex items-center justify-between bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/40 text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">Katılım:</span>
              <strong className="text-emerald-400 font-extrabold text-sm">{checkedInMembers.length} / {totalMembers}</strong>
            </div>

            <button
              type="button"
              onClick={simulateAthleteScan}
              className="bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Test amaçlı bir sporcu girişini simüle et"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Taraması Yap</span>
            </button>
          </div>

          {/* Checked-in Avatars Pills */}
          {checkedInMembers.length > 0 && (
            <div className="mt-4 w-full max-w-md">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left mb-2">
                QR İle Katılan Sporcular:
              </div>
              <div className="flex flex-wrap gap-2">
                {checkedInMembers.map((m) => (
                  <span
                    key={m.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{m.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Resmi Sportsfly Güvenli Yoklama Protokolü v3.2</span>
          </div>

          <div className="font-mono text-[11px] text-slate-500">
            Jeton: {sessionToken}
          </div>
        </div>
      </div>
    </div>
  );
};
