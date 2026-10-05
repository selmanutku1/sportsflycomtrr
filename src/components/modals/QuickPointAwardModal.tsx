import React, { useState, useMemo } from 'react';
import {
  Zap,
  X,
  Heart,
  TrendingUp,
  Trophy,
  Users,
  Award,
  Crown,
  Sparkles,
  Bot,
  MessageSquare,
  Flame,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import { addSporPuanNotification } from '../../data/notifications';
import { getAthleteAutomationStats } from '../../utils/sporpuanAutomation';
import { syncQuickPointToKarne } from '../../utils/sporpuanKarneBridge';

export interface QuickPointSporcu {
  id: string;
  name: string;
  avatarUrl?: string;
  branch?: string;
  teamGroup?: string;
}

interface QuickPointAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  sporcu: QuickPointSporcu | null;
  onSuccess?: (message: string) => void;
}

interface QuickPreset {
  id: string;
  title: string;
  category: 'Davranış' | 'Gelişim' | 'Etkinlik' | 'Liderlik';
  points: number;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  borderClass: string;
  badgeClass: string;
}

// Strictly COACH DISCRETION & FIELD OBSERVATION Presets
// (Automated rules like Weekly Full Attendance, Session Attendance, Streaks, and Payments are fully automated by system engine)
const COACH_OBSERVATION_PRESETS: QuickPreset[] = [
  {
    id: 'coach-1',
    title: 'Fair-Play & Örnek Sportmenlik',
    category: 'Davranış',
    points: 50,
    desc: 'Takım ruhu, rakibe ve hakeme saygı, centilmence tavır',
    icon: Heart,
    colorClass: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50',
    borderClass: 'border-rose-200 dark:border-rose-800',
    badgeClass: 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300',
  },
  {
    id: 'coach-2',
    title: 'Üstün Efor & Mücadele Gücü',
    category: 'Gelişim',
    points: 40,
    desc: 'Antrenmanda yüksek gayret, pes etmeme ve odaklanma',
    icon: TrendingUp,
    colorClass: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'coach-3',
    title: 'Saha İçi Liderlik & İletişim',
    category: 'Liderlik',
    points: 35,
    desc: 'Arkadaşlarını motive etme, saha içi yönlendirme ve kaptanlık',
    icon: Crown,
    colorClass: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50',
    borderClass: 'border-amber-200 dark:border-amber-800',
    badgeClass: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300',
  },
  {
    id: 'coach-4',
    title: 'Teknik & Taktiksel Gelişim',
    category: 'Gelişim',
    points: 45,
    desc: 'Yeni hareket ve antrenman direktiflerini başarıyla uygulama',
    icon: Award,
    colorClass: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50',
    borderClass: 'border-blue-200 dark:border-blue-800',
    badgeClass: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
  },
  {
    id: 'coach-5',
    title: 'Günün Antrenman Yıldızı (MVP)',
    category: 'Etkinlik',
    points: 60,
    desc: 'Seans boyunca üst düzey performans ve rol model olma',
    icon: Trophy,
    colorClass: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50',
    borderClass: 'border-purple-200 dark:border-purple-800',
    badgeClass: 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300',
  },
  {
    id: 'coach-6',
    title: 'Yardımlaşma & Pozitif Tutum',
    category: 'Davranış',
    points: 30,
    desc: 'Ekipmana ve arkadaşlarına destek olma, yapıcı enerji',
    icon: Users,
    colorClass: 'text-teal-600 bg-teal-50 dark:bg-teal-950/50',
    borderClass: 'border-teal-200 dark:border-teal-800',
    badgeClass: 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300',
  },
];

export const QuickPointAwardModal: React.FC<QuickPointAwardModalProps> = ({
  isOpen,
  onClose,
  sporcu,
  onSuccess,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('coach-1');
  const [customPoints, setCustomPoints] = useState<number | null>(null);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showAutomationDetails, setShowAutomationDetails] = useState<boolean>(false);

  const automationStats = useMemo(() => {
    if (!sporcu) return null;
    return getAthleteAutomationStats(sporcu.id);
  }, [sporcu]);

  if (!isOpen || !sporcu) return null;

  const selectedPreset =
    COACH_OBSERVATION_PRESETS.find((p) => p.id === selectedPresetId) || COACH_OBSERVATION_PRESETS[0];
  const activePoints = customPoints !== null ? customPoints : selectedPreset.points;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sporcu) return;

    setIsSubmitting(true);

    const ruleTitle =
      customPoints !== null
        ? `Özel Antrenör Puanı (${selectedPreset.category})`
        : selectedPreset.title;

    // 1. Trigger push notification toast, sound, haptic and notification center
    addSporPuanNotification({
      sporcuId: sporcu.id,
      sporcuName: sporcu.name,
      ruleName: ruleTitle,
      points: activePoints,
      category: selectedPreset.category,
      note: note.trim() || undefined,
    });

    // 2. Persist to sportsfly_sporpuan_logs_new for athlete profile sync
    try {
      const savedLogs = localStorage.getItem('sportsfly_sporpuan_logs_new');
      const currentLogs = savedLogs ? JSON.parse(savedLogs) : [];
      const newEntry = {
        id: `sp-coach-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sporcuId: sporcu.id,
        sporcuName: sporcu.name,
        category: selectedPreset.category,
        ruleName: ruleTitle,
        points: activePoints,
        date: 'Bugün',
        source: 'Koç Onayı',
        note: note.trim() || undefined,
      };
      localStorage.setItem('sportsfly_sporpuan_logs_new', JSON.stringify([newEntry, ...currentLogs]));

      // 3. Dynamically balance & sync into Sporcu Karnesi (timeline observation & score recalculation)
      syncQuickPointToKarne(
        sporcu.id,
        sporcu.name,
        selectedPreset.category,
        ruleTitle,
        activePoints,
        note.trim() || undefined
      );
    } catch (err) {
      console.error('Failed to write log', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess(
          `${sporcu.name} için +${activePoints} SP tanımlandı ve veli/sporcuya anlık bildirim gönderildi!`
        );
      }
      onClose();
      setNote('');
      setCustomPoints(null);
    }, 200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#111c2e] w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-700 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-tight flex items-center gap-1.5">
                <span>Hızlı Puan Ver</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                  Saha İçi Gözlem
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Antrenör Takdir Kriterleri • Tek Dokunuşla Puanlama
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Athlete Info Card */}
          <div className="p-3 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-slate-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-900/40 rounded-xl border border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={
                  sporcu.avatarUrl ||
                  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80'
                }
                alt={sporcu.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/40 shrink-0"
              />
              <div className="min-w-0">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">
                  {sporcu.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                  <span className="font-semibold text-blue-700 dark:text-blue-300">
                    {sporcu.branch || 'Basketbol'}
                  </span>
                  <span>•</span>
                  <span>{sporcu.teamGroup || 'Gelişim Takımı'}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                Verilecek Puan
              </span>
              <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
                +{activePoints} SP
              </span>
            </div>
          </div>

          {/* Dinamik Karne Etkisi Göstergesi */}
          <div className="p-2.5 bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200/70 dark:border-amber-900/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold">
                Dinamik Karne Dengesi: <strong className="font-black text-amber-700 dark:text-amber-300">+{activePoints >= 50 ? '0.3' : '0.2'}</strong> Karne Notu ve Saha Gözlemine Yansır
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-900/70 text-amber-900 dark:text-amber-100 font-extrabold text-[10px]">
              Karneyle Senkronize
            </span>
          </div>

          {/* 1. SMART AUTOMATION STATUS BANNER (Explaining that attendance/streaks are handled automatically) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Sistem Otomasyon Motoru</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                      Aktif
                    </span>
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    Haftalık tam devam, yoklama ve katılım serileri sistem tarafından otomatik hesaplanır.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAutomationDetails(!showAutomationDetails)}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer pt-0.5"
              >
                <span>{showAutomationDetails ? 'Gizle' : 'Kazanımlar'}</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${showAutomationDetails ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {/* Quick Automation Metrics Chips */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/80 text-center">
              <div className="p-2 rounded-xl bg-white dark:bg-[#162238] border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Haftalık Devam</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  %{automationStats?.weeklyAttendanceRate || 100} (Tam)
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white dark:bg-[#162238] border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold flex items-center justify-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 text-amber-500" />
                  <span>Katılım Serisi</span>
                </span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                  {automationStats?.currentStreakWeeks || 4} Hafta
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white dark:bg-[#162238] border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Otomatik SP</span>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 mt-0.5 block">
                  +{automationStats?.totalAutomatedPoints || 250} SP
                </span>
              </div>
            </div>

            {/* Expandable Automated Rules breakdown */}
            {showAutomationDetails && (
              <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-200 space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Bu sporcuya sistemin otomatik uyguladığı kurallar:</span>
                </div>
                <ul className="space-y-1 pl-4 list-disc text-[11px]">
                  <li>
                    <strong>Antrenmana Katılım:</strong> Yoklamada &quot;Geldi&quot; işaretlendiğinde her ders <strong>+25 SP</strong>
                  </li>
                  <li>
                    <strong>Haftalık Tam Devam Bonusu:</strong> Haftanın tüm antrenmanları tamamlandığında <strong>+50 SP</strong>
                  </li>
                  <li>
                    <strong>4 Hafta Kesintisiz Seri:</strong> Devam serisi korunduğunda aylık <strong>+75 SP</strong>
                  </li>
                  <li>
                    <strong>Aidat &amp; Dönem Yenileme:</strong> Muhasebe ödeme kaydı düştüğünde <strong>+30 / +150 SP</strong>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* 2. COACH OBSERVATION PRESETS (Exclusively genuine trainer judgment) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Saha İçi Antrenör Gözlem Kriterleri:</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                (Antrenör Takdiri)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {COACH_OBSERVATION_PRESETS.map((preset) => {
                const IconComponent = preset.icon;
                const isSelected = selectedPresetId === preset.id && customPoints === null;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setCustomPoints(null);
                    }}
                    className={`min-h-[58px] p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2.5 cursor-pointer select-none active:scale-[0.98] ${
                      isSelected
                        ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/30 shadow-xs'
                        : 'bg-white dark:bg-[#162238] border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${preset.colorClass}`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                            {preset.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {preset.desc}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : preset.badgeClass
                        }`}
                      >
                        +{preset.points} SP
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Custom Point Fast Quick-Chips (Touch friendly) */}
          <div className="pt-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Veya Özel Puan Belirle:
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {[10, 20, 30, 50, 75, 100].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => setCustomPoints(pts)}
                  className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
                    customPoints === pts
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/40 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  +{pts} SP
                </button>
              ))}
              {customPoints !== null && (
                <button
                  type="button"
                  onClick={() => setCustomPoints(null)}
                  className="min-h-[42px] px-2.5 py-1 text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  Sıfırla
                </button>
              )}
            </div>
          </div>

          {/* 4. Coach Note Input (Optional) */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Antrenör Notu &amp; Gözlemi (İsteğe Bağlı)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn: Maç sonu rakibi tebrik etti, harika savunma gayreti..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-[#111c2e] text-slate-900 dark:text-slate-100 outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 bg-slate-50/80 dark:bg-[#162238]/60 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            İptal
          </button>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="min-h-[48px] flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>
              {isSubmitting
                ? 'Puan Kaydediliyor...'
                : `+${activePoints} SP Puanını Hemen Tanımla & Bildir`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
