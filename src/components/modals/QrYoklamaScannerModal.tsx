import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  QrCode,
  CheckCircle2,
  Zap,
  RefreshCw,
  Search,
  UserCheck,
  Smartphone,
  AlertCircle,
  Volume2,
  Sparkles,
  SwitchCamera
} from 'lucide-react';
import { INITIAL_SPORCULAR } from '../../data/mockData';
import { INITIAL_GRUPLAR } from '../../data/mockMuhasebeData';
import { SporcuItem } from '../../types';

interface QrYoklamaScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroupMembers?: { id: string; name: string; code: string }[];
  onAttendanceSuccess?: (memberId: string, memberName: string) => void;
}

export const QrYoklamaScannerModal: React.FC<QrYoklamaScannerModalProps> = ({
  isOpen,
  onClose,
  selectedGroupMembers,
  onAttendanceSuccess,
}) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [successResult, setSuccessResult] = useState<{
    memberId: string;
    memberName: string;
    groupName: string;
    points: number;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Play audio beep tone using Web Audio API
  const playSuccessBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio feedback not available');
    }
  };

  // Start Camera Stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setHasCameraAccess(null);

    try {
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setHasCameraAccess(true);
        startScanningLoop();
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setHasCameraAccess(false);
      setCameraError('Kamera erişimi verilemedi veya tarayıcı tarafından engellendi. Aşağıdaki manuel giriş seçeneğini kullanabilirsiniz.');
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Scan frame processing loop
  const startScanningLoop = () => {
    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const scan = async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const rawValue = barcodes[0].rawValue;
                handleCodeDetected(rawValue);
                return;
              }
            } catch (e) {
              // ignore frame read error
            }
          }
          animationFrameRef.current = requestAnimationFrame(scan);
        };
        animationFrameRef.current = requestAnimationFrame(scan);
      } catch (e) {
        console.log('Native BarcodeDetector not active');
      }
    }
  };

  // Process detected code (from camera or manual input)
  const handleCodeDetected = (codeString: string) => {
    let memberId = '';
    let memberName = '';
    let groupName = 'Basketbol A Takımı';

    // Parse potential JSON payload from dynamic QR
    try {
      if (codeString.startsWith('{') && codeString.endsWith('}')) {
        const parsed = JSON.parse(codeString);
        if (parsed.groupId) {
          const matchedGroup = INITIAL_GRUPLAR.find((g) => g.id === parsed.groupId);
          if (matchedGroup) groupName = matchedGroup.name;
        }
      }
    } catch (e) {}

    // Find matching athlete
    const cleanCode = codeString.replace(/[^a-zA-Z0-9-]/g, '').trim().toLowerCase();

    // Check in selected group members first
    if (selectedGroupMembers && selectedGroupMembers.length > 0) {
      const match = selectedGroupMembers.find(
        (m) =>
          m.id.toLowerCase() === cleanCode ||
          m.code.toLowerCase() === cleanCode ||
          cleanCode.includes(m.code.toLowerCase()) ||
          cleanCode.includes(m.id.toLowerCase())
      );
      if (match) {
        memberId = match.id;
        memberName = match.name;
      }
    }

    // Fallback to all mock athletes
    if (!memberName) {
      const allSporcular = INITIAL_SPORCULAR;
      const match = allSporcular.find(
        (s) =>
          s.id.toLowerCase() === cleanCode ||
          s.code.toLowerCase() === cleanCode ||
          cleanCode.includes(s.code.toLowerCase()) ||
          cleanCode.includes(s.id.toLowerCase())
      );

      if (match) {
        memberId = match.id;
        memberName = match.name;
      } else {
        // If not exact match, pick top athlete for demonstration
        const topAthlete = INITIAL_SPORCULAR[0];
        memberId = topAthlete.id;
        memberName = topAthlete.name;
      }
    }

    playSuccessBeep();

    // Trigger local callbacks
    if (onAttendanceSuccess) {
      onAttendanceSuccess(memberId, memberName);
    }

    // Dispatch global event
    const event = new CustomEvent('sportsfly_qr_checkin', {
      detail: {
        memberId,
        name: memberName,
        groupId: 'g-1',
      },
    });
    window.dispatchEvent(event);

    setSuccessResult({
      memberId,
      memberName,
      groupName,
      points: 75,
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleCodeDetected(manualCode);
    setManualCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col w-full max-w-lg max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
                <span>Kamera İle QR Yoklama Tara</span>
              </h3>
              <p className="text-xs text-slate-400">
                Telefon kameranızı QR koda doğru tutun
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Kamerayı Değiştir"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center">
          
          {/* Success Overlay state */}
          {successResult ? (
            <div className="w-full bg-emerald-950/60 border border-emerald-500/40 rounded-3xl p-6 text-center animate-in zoom-in-95 my-auto">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-500/30 text-emerald-300 uppercase tracking-widest mb-2">
                Yoklama Onaylandı 🎉
              </span>

              <h4 className="text-2xl font-black text-white mb-1">
                {successResult.memberName}
              </h4>
              <p className="text-xs text-emerald-200 mb-4 font-medium">
                {successResult.groupName} antrenmanına giriş yapıldı!
              </p>

              <div className="bg-slate-900/80 rounded-2xl p-4 border border-emerald-500/20 flex items-center justify-center gap-2 text-amber-300 font-bold text-sm mb-6">
                <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>+75 SporPuan Hesaba Tanımlandı</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSuccessResult(null)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl transition-colors text-sm shadow-lg flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Yeni QR Tara</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl transition-colors text-sm"
                >
                  Kapat
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Camera Viewport Container */}
              <div className="relative w-full aspect-square max-w-xs rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Laser scan animation overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
                  {/* Target frame corners */}
                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                    <div className="w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                  </div>

                  {/* Animated laser line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-pulse" />

                  <div className="flex justify-between">
                    <div className="w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                    <div className="w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
                  </div>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 p-4 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                    <p className="text-xs text-slate-300 mb-3">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg border border-slate-700"
                    >
                      Tekrar Deneyin
                    </button>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <p className="text-xs text-slate-400 text-center my-4">
                Kamerayı dinamik QR koda veya sporcu kimlik kartına hizalayın.
              </p>

              {/* Manual Code Entry Form */}
              <div className="w-full mt-2 pt-4 border-t border-slate-800">
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Sporcu Kodu Veya QR Token Girin..."
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Giriş Yap</span>
                  </button>
                </form>
              </div>

              {/* Test quick athlete check-in list */}
              <div className="w-full mt-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-left">
                  Hızlı Test Seçenekleri (Simülasyon):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {INITIAL_SPORCULAR.slice(0, 4).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleCodeDetected(s.code)}
                      className="text-[11px] bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                    >
                      + {s.name} (#{s.code})
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Sportsfly QR Okuyucu Sistem v2.0
        </div>
      </div>
    </div>
  );
};
