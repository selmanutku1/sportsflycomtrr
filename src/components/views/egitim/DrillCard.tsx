import React, { useState } from 'react';
import { TrainingDrill, BranchType } from '../../../types/egitimPlanlama';
import {
  Clock,
  Users,
  Box,
  Target,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Flame,
  Layout,
} from 'lucide-react';
import { TacticalCourtCanvas } from './TacticalCourtCanvas';

interface DrillCardProps {
  drill: TrainingDrill;
  index: number;
  branch: BranchType;
  defaultExpanded?: boolean;
}

export const DrillCard: React.FC<DrillCardProps> = ({
  drill,
  index,
  branch,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showTacticalBoard, setShowTacticalBoard] = useState(false);

  const getPhaseBadge = (phase: string) => {
    switch (phase) {
      case 'Isınma & Koordinasyon':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Temel Teknik (Dril 1)':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Taktik Gelişim (Dril 2)':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Maç & Oyun Simülasyonu':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getIntensityBadge = (intensity: string) => {
    switch (intensity) {
      case 'Düşük':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'Orta':
        return 'text-amber-600 dark:text-amber-400';
      case 'Yüksek':
        return 'text-orange-600 dark:text-orange-400';
      case 'Maksimum':
        return 'text-rose-600 dark:text-rose-400 font-bold';
      default:
        return 'text-slate-600';
    }
  };

  return (
    <div className="bg-white dark:bg-[#162238] rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:border-blue-400/60 dark:hover:border-blue-500/50 transition-all">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200/50 dark:border-blue-800">
            {index + 1}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getPhaseBadge(
                  drill.phase
                )}`}
              >
                {drill.phase}
              </span>

              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{drill.durationMinutes} dk</span>
              </span>

              <span className="flex items-center gap-1 text-xs">
                <Flame className={`w-3.5 h-3.5 ${getIntensityBadge(drill.intensity)}`} />
                <span className={`font-medium ${getIntensityBadge(drill.intensity)}`}>
                  Şiddet: {drill.intensity}
                </span>
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate">
              {drill.title}
            </h4>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              {drill.objective}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTacticalBoard(!showTacticalBoard);
              if (!isExpanded) setIsExpanded(true);
            }}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              showTacticalBoard
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title="Taktik Saha Tahtasını Göster"
          >
            <Layout className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Taktik Tahtası</span>
          </button>

          <div className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expanded Drill Details */}
      {isExpanded && (
        <div className="px-4 pb-5 sm:px-5 border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-4">
          {/* Tactical Canvas Board (Toggleable) */}
          {showTacticalBoard && (
            <div className="my-3">
              <TacticalCourtCanvas
                tacticalData={drill.tacticalData}
                branch={branch}
                title={`${drill.title} - Saha Yerleşimi`}
              />
            </div>
          )}

          {/* Quick Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Sporcu Sayısı</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{drill.playerCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Gerekli Alan</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{drill.spaceRequired}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Gerekli Ekipman</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 truncate block">
                  {drill.equipment.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions (Uygulama Adımları) */}
          <div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Uygulama Adımları & Kurgu
            </h5>
            <ol className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 list-decimal pl-4">
              {drill.instructions.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Coaching Points (Püf Noktaları) */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
            <h5 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Antrenörün Dikkat Edeceği Noktalar (Coaching Points)
            </h5>
            <ul className="space-y-1 text-xs text-amber-900/90 dark:text-amber-200/90">
              {drill.coachingPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
