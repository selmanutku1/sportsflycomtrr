import React from 'react';
import { CurriculumWeek, BranchType, AgeCategory, TrainingPlan } from '../../../types/egitimPlanlama';
import { Calendar, CheckCircle2, ChevronRight, BookOpen, Layers } from 'lucide-react';

interface CurriculumMatrixViewProps {
  branch: BranchType;
  ageCategory: AgeCategory;
  curriculumWeeks: CurriculumWeek[];
  allPlans: TrainingPlan[];
  onSelectPlan: (plan: TrainingPlan) => void;
}

export const CurriculumMatrixView: React.FC<CurriculumMatrixViewProps> = ({
  branch,
  ageCategory,
  curriculumWeeks,
  allPlans,
  onSelectPlan,
}) => {
  // Generate all 12 weeks of season
  const totalWeeks = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-blue-900 to-slate-900 text-white shadow-xl relative overflow-hidden border border-blue-800/60">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500 text-white">
              {branch}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-white">
              {ageCategory}
            </span>
            <span className="text-xs text-blue-200">12 Haftalık Periyodik Gelişim Planı</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Sezonluk Müfredat & İlerleme Yol Haritası
          </h3>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1.5 leading-relaxed">
            Sporcuların yaş ve motorik gelişim evrelerine göre basitten karmaşığa (spiral öğretim modeli) yapılandırılmış haftalık kazanım ve değerlendirme haritası.
          </p>
        </div>
      </div>

      {/* 12-Week Roadmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {totalWeeks.map((weekNum) => {
          const matchedWeek = curriculumWeeks.find(
            (w) => w.branch === branch && w.ageCategory === ageCategory && w.weekNumber === weekNum
          ) || {
            weekNumber: weekNum,
            title: `Hafta ${weekNum}: Kazanım Pekiştirme & Dinamik Seans`,
            branch,
            ageCategory,
            seasonPhase: weekNum <= 4 ? 'Sezon Başı / Hazırlık' : weekNum <= 8 ? 'Temel Gelişim Dönemi' : 'Müsabaka & Taktik Dönemi',
            primaryObjective: 'Teknik doğruluğu artırma, dar alanda karar verme hızını geliştirme ve takım uyumu.',
            keyConcepts: ['Teknik Tekrar', 'Oyun Kurma', 'Reaksiyon'],
            suggestedPlanIds: [],
            evaluationChecklist: ['Temel dril kurallarına uyum sağlıyor mu?', 'Saha içi iletişim kuruyor mu?'],
          };

          const suggestedPlans = allPlans.filter(
            (p) => p.branch === branch && p.ageCategory === ageCategory
          );

          const hasDirectPlan = suggestedPlans.length > 0;

          return (
            <div
              key={weekNum}
              className="bg-white dark:bg-[#162238] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:border-blue-400/80 dark:hover:border-blue-500/60 transition-all group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs border border-blue-200/60 dark:border-blue-800">
                      {weekNum}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Hafta
                    </span>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {matchedWeek.seasonPhase}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {matchedWeek.title}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {matchedWeek.primaryObjective}
                </p>

                {/* Key Concepts */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {matchedWeek.keyConcepts.map((concept, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-medium border border-blue-200/40 dark:border-blue-900/40"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Evaluation & Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    🎯 Değerlendirme Kriteri:
                  </span>
                  <div className="flex items-start gap-1.5 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{matchedWeek.evaluationChecklist[0]}</span>
                  </div>
                </div>

                {hasDirectPlan && (
                  <button
                    type="button"
                    onClick={() => onSelectPlan(suggestedPlans[0])}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Örnek Seans Planını İncele</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
