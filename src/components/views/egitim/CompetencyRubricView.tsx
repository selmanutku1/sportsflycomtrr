import React from 'react';
import { CompetencyRubricItem, BranchType, AgeCategory } from '../../../types/egitimPlanlama';
import { CheckCircle2, Award, Target, HelpCircle } from 'lucide-react';

interface CompetencyRubricViewProps {
  branch: BranchType;
  ageCategory: AgeCategory;
  rubrics: CompetencyRubricItem[];
}

export const CompetencyRubricView: React.FC<CompetencyRubricViewProps> = ({
  branch,
  ageCategory,
  rubrics,
}) => {
  const filteredRubrics = rubrics.filter(
    (r) => r.branch === branch && (r.ageCategory === ageCategory || !r.ageCategory)
  );

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Award className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Beceri & Yetkinlik Rubrik Matrisi
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Sporcu karnesi ve antrenör saha gözlemleri için 3 seviyeli objektif değerlendirme kılavuzu.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Seviye 1: Gelişmekte
          </span>
          <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Seviye 2: Yetkin
          </span>
          <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Seviye 3: Usta / Lider
          </span>
        </div>
      </div>

      {/* Rubric Cards List */}
      <div className="space-y-4">
        {filteredRubrics.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#162238] rounded-2xl border border-slate-200 dark:border-slate-800">
            <Target className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Bu yaş kategorisi için henüz özel rubrik atanmadı.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Genel kazanım ilkeleri tüm yaş grupları için geçerlidir.
            </p>
          </div>
        ) : (
          filteredRubrics.map((rubric) => (
            <div
              key={rubric.id}
              className="bg-white dark:bg-[#162238] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {rubric.domain}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {rubric.branch} • {rubric.ageCategory}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {rubric.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {rubric.description}
                  </p>
                </div>
              </div>

              {/* 3-Level Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Level 1 */}
                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-amber-900 dark:text-amber-200">
                      Seviye 1 (Geliştirilmeli)
                    </span>
                    <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rubric.evaluationCriteria.level1}
                  </p>
                </div>

                {/* Level 2 */}
                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-blue-900 dark:text-blue-200">
                      Seviye 2 (Beklenen / Yetkin)
                    </span>
                    <span className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800/60 text-blue-800 dark:text-blue-200 flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rubric.evaluationCriteria.level2}
                  </p>
                </div>

                {/* Level 3 */}
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">
                      Seviye 3 (Üstün / Oturmuş)
                    </span>
                    <span className="w-5 h-5 rounded-full bg-emerald-200 dark:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-[10px]">
                      3
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rubric.evaluationCriteria.level3}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
