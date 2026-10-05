import React, { useState, useMemo } from 'react';
import {
  BranchType,
  AgeCategory,
  DifficultyLevel,
  TrainingPlan,
} from '../../types/egitimPlanlama';
import {
  BRANCH_AGE_METADATA,
  TEMPLATE_TRAINING_PLANS,
  CURRICULUM_WEEKS,
  COMPETENCY_RUBRICS,
} from '../../data/egitimPlanlamaData';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Layers,
  Clock,
  Award,
  Target,
  Users,
  ChevronRight,
  Flame,
  Printer,
  CalendarPlus,
  CheckCircle2,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { TrainingPlanModal } from './egitim/TrainingPlanModal';
import { CreateTrainingPlanModal } from './egitim/CreateTrainingPlanModal';
import { AssignToGroupModal } from './egitim/AssignToGroupModal';
import { CurriculumMatrixView } from './egitim/CurriculumMatrixView';
import { CompetencyRubricView } from './egitim/CompetencyRubricView';

export const EgitimPlanlamaView: React.FC = () => {
  // Primary Navigation States
  const [selectedBranch, setSelectedBranch] = useState<BranchType>('Futbol');
  const [selectedAge, setSelectedAge] = useState<AgeCategory>('U9-U11');
  const [activeSubTab, setActiveSubTab] = useState<'plans' | 'curriculum' | 'rubrics'>('plans');

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Data State (with local persistence for created plans)
  const [allPlans, setAllPlans] = useState<TrainingPlan[]>(() => {
    try {
      const saved = localStorage.getItem('sportsfly_custom_training_plans');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...TEMPLATE_TRAINING_PLANS, ...parsed];
      }
    } catch (e) {
      console.error(e);
    }
    return TEMPLATE_TRAINING_PLANS;
  });

  // Modal States
  const [activeModalPlan, setActiveModalPlan] = useState<TrainingPlan | null>(null);
  const [assigningPlan, setAssigningPlan] = useState<TrainingPlan | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Current Age Metadata
  const currentMeta = useMemo(() => {
    return (
      BRANCH_AGE_METADATA.find(
        (m) => m.branch === selectedBranch && m.ageCategory === selectedAge
      ) || BRANCH_AGE_METADATA[0]
    );
  }, [selectedBranch, selectedAge]);

  // Filtered Plans
  const filteredPlans = useMemo(() => {
    return allPlans.filter((plan) => {
      const matchesBranch = plan.branch === selectedBranch;
      const matchesAge = plan.ageCategory === selectedAge;
      const matchesSearch =
        searchQuery === '' ||
        plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.focusTags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        plan.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDiff =
        selectedDifficulty === 'all' || plan.difficulty === selectedDifficulty;

      return matchesBranch && matchesAge && matchesSearch && matchesDiff;
    });
  }, [allPlans, selectedBranch, selectedAge, searchQuery, selectedDifficulty]);

  // Handle Save New Plan
  const handleSaveNewPlan = (newPlan: TrainingPlan) => {
    const updated = [newPlan, ...allPlans];
    setAllPlans(updated);
    try {
      const customs = updated.filter((p) => p.isCustom);
      localStorage.setItem('sportsfly_custom_training_plans', JSON.stringify(customs));
    } catch (e) {
      console.error(e);
    }
    showToast(`"${newPlan.title}" başarıyla müfredata eklendi!`);
    setSelectedBranch(newPlan.branch);
    setSelectedAge(newPlan.ageCategory);
  };

  // Handle Assign to Group
  const handleAssignSuccess = (groups: string[], scheduledTime: string) => {
    if (assigningPlan) {
      showToast(
        `"${assigningPlan.title}" planı ${groups.join(', ')} gruplarına (${scheduledTime}) başarıyla atandı.`
      );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Hero Banner / Module Header */}
      <div className="bg-white dark:bg-[#162238] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5 border border-blue-200/50 dark:border-blue-800">
                <BookOpen className="w-4 h-4" />
                <span>Akademi Müfredat & Antrenman Planlama</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Branş & Yaş Odaklı
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Eğitim Planlama & Taktik Kütüphanesi
            </h1>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Plan / İstasyon Oluştur</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
              {allPlans.length}
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Toplam Hazır Seans</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Kapsamlı Driller</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              3
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Aktif Branş</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Futbol • Basket • Voleybol</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
              4
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Yaş Kategorisi</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">U6 - U17 Gelişim</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
              12
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Haftalık Sezon Planı</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Periyodik Müfredat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Branch Pills (Futbol, Basketbol, Voleybol) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#162238] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          {(
            [
              { branch: 'Futbol', icon: '⚽', desc: 'Saha & Rondo Taktikleri' },
              { branch: 'Basketbol', icon: '🏀', desc: 'Parke & Hücum Setleri' },
              { branch: 'Voleybol', icon: '🏐', desc: 'File & Rotasyon Düzenleri' },
            ] as const
          ).map((item) => {
            const isSelected = selectedBranch === item.branch;
            return (
              <button
                key={item.branch}
                onClick={() => setSelectedBranch(item.branch)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.branch}</span>
              </button>
            );
          })}
        </div>

        {/* Sub-Tab Navigation (Şablonlar / 12-Haftalık Müfredat / Rubrikler) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab('plans')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'plans'
                ? 'bg-white dark:bg-[#162238] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Şablon Seanslar</span>
          </button>

          <button
            onClick={() => setActiveSubTab('curriculum')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'curriculum'
                ? 'bg-white dark:bg-[#162238] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>12-Haftalık Müfredat</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rubrics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'rubrics'
                ? 'bg-white dark:bg-[#162238] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Yetkinlik Rubrikleri</span>
          </button>
        </div>
      </div>

      {/* Age Category Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {(
          [
            { key: 'U6-U8', title: 'U6 - U8 Minikler', subtitle: 'Temel Motorik & Oyun' },
            { key: 'U9-U11', title: 'U9 - U11 Küçükler', subtitle: 'Beceri & Temel Teknik' },
            { key: 'U12-U14', title: 'U12 - U14 Yıldızlar', subtitle: 'Taktik & Pozisyon' },
            { key: 'U15-U17', title: 'U15 - U17 Gençler', subtitle: 'Performans & Sistem' },
          ] as const
        ).map((age) => {
          const isSelected = selectedAge === age.key;
          return (
            <button
              key={age.key}
              onClick={() => setSelectedAge(age.key)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 shadow-xs'
                  : 'bg-white dark:bg-[#162238] border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black">{age.key}</span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {age.title}
              </p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{age.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Age Developmental Philosophy Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#162238] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Gelişim Felsefesi & Pedagojik Hedef
            </span>
            <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              {currentMeta.philosophy}
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs shrink-0">
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              ⏱ {currentMeta.recommendedDuration}
            </span>
            <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold">
              📅 {currentMeta.sessionsPerWeek}
            </span>
          </div>
        </div>

        {/* 3 Pillars: Physical, Technical, Tactical */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Fiziksel & Motorik Odak</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {currentMeta.physicalFocus}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30">
            <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300 font-bold mb-1">
              <Target className="w-3.5 h-3.5" />
              <span>Teknik & Beceri Odağı</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {currentMeta.technicalFocus}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Taktik & Oyun Algısı</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {currentMeta.tacticalFocus}
            </p>
          </div>
        </div>
      </div>

      {/* Main SubTab Content */}
      {activeSubTab === 'plans' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Dril, rondo, anahtar kelime veya kod ara..."
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-2xl bg-white dark:bg-[#162238] border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-[#162238] border border-slate-200/80 dark:border-slate-800 text-xs">
                <span className="px-2 text-slate-400 text-[11px]">Zorluk:</span>
                {(['all', 'Başlangıç', 'Orta', 'İleri'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedDifficulty === diff
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {diff === 'all' ? 'Tümü' : diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Training Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-[#162238] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 flex flex-col justify-between shadow-xs hover:border-blue-500/60 dark:hover:border-blue-500/50 hover:shadow-md transition-all group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                        {plan.code}
                      </span>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {plan.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {plan.totalDurationMinutes} dk
                      </span>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {plan.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {plan.summary}
                  </p>

                  {/* Drills Count & Focus Tags */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-amber-500" />
                        İstasyon Sayısı:
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {plan.drills.length} Dril
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {plan.focusTags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-[10px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setAssigningPlan(plan)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Takıma / Gruplara Ata"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-blue-500" />
                    <span className="hidden sm:inline">Ata</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalPlan(plan)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <span>İncele & Taktik Tahtası</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredPlans.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-[#162238] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Search className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Aradığınız kriterlere uygun antrenman planı bulunamadı
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Filtreleri sıfırlayabilir veya kulübünüze özel yeni bir seans planı oluşturabilirsiniz.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDifficulty('all');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'curriculum' && (
        <CurriculumMatrixView
          branch={selectedBranch}
          ageCategory={selectedAge}
          curriculumWeeks={CURRICULUM_WEEKS}
          allPlans={allPlans}
          onSelectPlan={(plan) => setActiveModalPlan(plan)}
        />
      )}

      {activeSubTab === 'rubrics' && (
        <CompetencyRubricView
          branch={selectedBranch}
          ageCategory={selectedAge}
          rubrics={COMPETENCY_RUBRICS}
        />
      )}

      {/* Detail & Live Coach Modal */}
      {activeModalPlan && (
        <TrainingPlanModal
          plan={activeModalPlan}
          onClose={() => setActiveModalPlan(null)}
          onAssignToGroup={(plan) => {
            setActiveModalPlan(null);
            setAssigningPlan(plan);
          }}
        />
      )}

      {/* Create Custom Plan Modal */}
      {isCreateModalOpen && (
        <CreateTrainingPlanModal
          initialBranch={selectedBranch}
          initialAge={selectedAge}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSaveNewPlan}
        />
      )}

      {/* Assign Plan to Group Modal */}
      {assigningPlan && (
        <AssignToGroupModal
          plan={assigningPlan}
          onClose={() => setAssigningPlan(null)}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
};
