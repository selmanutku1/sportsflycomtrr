import React, { useState } from 'react';
import { TrainingPlan } from '../../../types/egitimPlanlama';
import {
  X,
  Clock,
  Award,
  Layers,
  Printer,
  Users,
  CheckCircle2,
  CalendarPlus,
  Play,
  Pause,
  RotateCcw,
  Share2,
  BookOpen,
} from 'lucide-react';
import { SportsFlyIcon } from '../../SportsFlyLogo';
import { DrillCard } from './DrillCard';

interface TrainingPlanModalProps {
  plan: TrainingPlan;
  onClose: () => void;
  onAssignToGroup?: (plan: TrainingPlan) => void;
}

export const TrainingPlanModal: React.FC<TrainingPlanModalProps> = ({
  plan,
  onClose,
  onAssignToGroup,
}) => {
  const [activeTab, setActiveTab] = useState<'drills' | 'coachGuide' | 'outcomes'>('drills');

  // Live Timer for Coach on Court
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  React.useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#111c2e] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-2xs">
                {plan.branch}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {plan.ageCategory}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {plan.difficulty}
              </span>
              <span className="text-xs text-slate-400 font-mono">Kod: {plan.code}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {plan.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {plan.summary}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Antrenman Planını Yazdır / PDF İndir"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Coach Assistant & Timing Bar */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between gap-3 text-xs shrink-0 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300">Öngörülen Seans:</span>
              <span className="font-bold text-white text-sm">{plan.totalDurationMinutes} Dakika</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-700">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">Dril Sayısı:</span>
              <span className="font-bold text-white">{plan.drills.length} İstasyon</span>
            </div>
          </div>

          {/* Live Stopwatch for Coach */}
          <div className="flex items-center gap-2.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-[11px] text-slate-400 font-medium">Canlı Seans Sayacı:</span>
            <span className="font-mono font-black text-sm text-emerald-400">
              {formatTimer(secondsElapsed)}
            </span>
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
              title={isTimerRunning ? 'Durdur' : 'Başlat'}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTimerRunning(false);
                setSecondsElapsed(0);
              }}
              className="p-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
              title="Sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111c2e] shrink-0">
          <button
            onClick={() => setActiveTab('drills')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'drills'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Driller & Saha Planı ({plan.drills.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('outcomes')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'outcomes'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Kazanımlar & Ekipman</span>
          </button>

          <button
            onClick={() => setActiveTab('coachGuide')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'coachGuide'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <SportsFlyIcon className="w-4 h-4" />
            <span>Antrenör Kılavuzu & Notlar</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {activeTab === 'drills' && (
            <div className="space-y-4">
              {plan.drills.map((drill, index) => (
                <DrillCard
                  key={drill.id}
                  drill={drill}
                  index={index}
                  branch={plan.branch}
                  defaultExpanded={index === 0}
                />
              ))}
            </div>
          )}

          {activeTab === 'outcomes' && (
            <div className="space-y-6">
              {/* Learning Outcomes */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Hedeflenen Temel Kazanımlar (Learning Outcomes)
                </h4>
                <ul className="space-y-2">
                  {plan.learningOutcomes.map((outcome, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Equipment Checklist */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Gerekli Ekipman Listesi (Saha Hazırlığı)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {plan.equipmentList.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 shadow-2xs"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Focus tags */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Odak Etiketleri
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {plan.focusTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'coachGuide' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <SportsFlyIcon className="w-4 h-4" />
                  Baş Antrenörün Saha İçi Tavsiyeleri
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {plan.coachTips}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                  <h5 className="font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
                    ✅ İdeal Seans Akışı
                  </h5>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Sporcuların enerjisini korumak için dril geçişlerinde su molalarını 60-90 saniye ile sınırlayın, saha düzenini seans öncesinde kurun.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
                  <h5 className="font-bold text-rose-800 dark:text-rose-300 mb-1.5">
                    ⚠️ Sık Yapılan Hatalar
                  </h5>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Çocukları uzun sıralarda bekletmeyin; istasyonları ikiye bölerek sporcu başına düşen top temas sayısını maksimumda tutun.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Müfredat Dönemi: <span className="font-semibold text-slate-800 dark:text-slate-200">{plan.seasonPhase}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Kapat
            </button>

            {onAssignToGroup && (
              <button
                onClick={() => onAssignToGroup(plan)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Gruplara / Takıma Ata</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
