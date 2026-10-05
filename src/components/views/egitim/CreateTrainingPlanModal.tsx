import React, { useState } from 'react';
import {
  TrainingPlan,
  BranchType,
  AgeCategory,
  DifficultyLevel,
  TrainingDrill,
} from '../../../types/egitimPlanlama';
import { X, Plus, Trash2, Clock, Check, Layers, BookOpen } from 'lucide-react';
import { SportsFlyIcon } from '../../SportsFlyLogo';

interface CreateTrainingPlanModalProps {
  initialBranch?: BranchType;
  initialAge?: AgeCategory;
  onClose: () => void;
  onSave: (newPlan: TrainingPlan) => void;
}

export const CreateTrainingPlanModal: React.FC<CreateTrainingPlanModalProps> = ({
  initialBranch = 'Futbol',
  initialAge = 'U9-U11',
  onClose,
  onSave,
}) => {
  const [branch, setBranch] = useState<BranchType>(initialBranch);
  const [ageCategory, setAgeCategory] = useState<AgeCategory>(initialAge);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Orta');
  const [seasonPhase, setSeasonPhase] = useState<TrainingPlan['seasonPhase']>('Temel Gelişim Dönemi');
  const [summary, setSummary] = useState('');
  const [totalDuration, setTotalDuration] = useState(60);
  const [focusTagInput, setFocusTagInput] = useState('Teknik, Pas, Çabuk Karar');
  const [equipmentInput, setEquipmentInput] = useState('Toplar, Huniler, Yelekler');
  const [coachTips, setCoachTips] = useState('');

  // Initial Drills
  const [drills, setDrills] = useState<TrainingDrill[]>([
    {
      id: 'custom-d1',
      title: 'Dinamik Koordinasyon & Isınma',
      phase: 'Isınma & Koordinasyon',
      durationMinutes: 10,
      intensity: 'Orta',
      playerCount: 'Tüm Takım',
      spaceRequired: '20x20m',
      equipment: ['Huniler', 'Toplar'],
      objective: 'Vücut ısısını artırma ve temel top teması sağlama.',
      instructions: ['Serbest hareketlenme ve antrenör düdüğünde yön değiştirme.'],
      coachingPoints: ['Dinamik esneme hareketlerini aceleye getirmeme.'],
    },
    {
      id: 'custom-d2',
      title: 'Ana Bölüm - Beceri Geliştirme',
      phase: 'Temel Teknik (Dril 1)',
      durationMinutes: 25,
      intensity: 'Yüksek',
      playerCount: '6-8 Sporcu / İstasyon',
      spaceRequired: 'Yarı Saha',
      equipment: ['Toplar', 'Yelekler'],
      objective: 'Seansın ana temasını pekiştirici dar alan istasyonu.',
      instructions: ['1v1 veya 2v2 hızlı geçişli istasyon oyunu.'],
      coachingPoints: ['Hızlı karar verme ve cesaretli aksiyon alma.'],
    },
    {
      id: 'custom-d3',
      title: 'Müsabaka & Taktik Oyun Simülasyonu',
      phase: 'Maç & Oyun Simülasyonu',
      durationMinutes: 20,
      intensity: 'Maksimum',
      playerCount: 'Tüm Grup',
      spaceRequired: 'Tam / Yarı Saha',
      equipment: ['Kaleler / Pota / File', 'Yelekler'],
      objective: 'Öğrenilen kazanımları maç formatında sergileme.',
      instructions: ['Kazanım kuralı eklenmiş mini turnuva maçı.'],
      coachingPoints: ['Saha içi iletişim ve fair-play.'],
    },
    {
      id: 'custom-d4',
      title: 'Soğuma & Geri Bildirim Çemberi',
      phase: 'Soğuma & Değerlendirme',
      durationMinutes: 5,
      intensity: 'Düşük',
      playerCount: 'Tüm Takım',
      spaceRequired: 'Orta Alan',
      equipment: ['-'],
      objective: 'Nabız düşürme ve seansın kritik anlarını özetleme.',
      instructions: ['Statik esneme ve antrenör konuşması.'],
      coachingPoints: ['Pozitif kapanış.'],
    },
  ]);

  const handleAddDrill = () => {
    const newDrill: TrainingDrill = {
      id: `custom-d-${Date.now()}`,
      title: `Yeni İstasyon ${drills.length + 1}`,
      phase: 'Taktik Gelişim (Dril 2)',
      durationMinutes: 15,
      intensity: 'Orta',
      playerCount: '8-10 Sporcu',
      spaceRequired: 'Yarı Saha',
      equipment: ['Toplar'],
      objective: 'Kazanım hedefi',
      instructions: ['Uygulama basamakları'],
      coachingPoints: ['Antrenör püf noktası'],
    };
    setDrills([...drills, newDrill]);
  };

  const handleRemoveDrill = (index: number) => {
    if (drills.length <= 1) return;
    setDrills(drills.filter((_, i) => i !== index));
  };

  const handleDrillChange = (index: number, field: keyof TrainingDrill, value: any) => {
    const updated = [...drills];
    updated[index] = { ...updated[index], [field]: value };
    setDrills(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const codeBranch = branch === 'Futbol' ? 'FB' : branch === 'Basketbol' ? 'BB' : 'VB';
    const cleanAge = ageCategory.replace('-', '');
    const code = `ÖZEL-${codeBranch}-${cleanAge}-${Math.floor(100 + Math.random() * 900)}`;

    const newPlan: TrainingPlan = {
      id: `plan-custom-${Date.now()}`,
      code,
      title: title || `${branch} ${ageCategory} Özel Antrenman Planı`,
      branch,
      ageCategory,
      ageGroupTitle: `${ageCategory} Özel Seans`,
      periodWeek: 1,
      sessionNumber: 1,
      difficulty,
      totalDurationMinutes: totalDuration,
      seasonPhase,
      focusTags: focusTagInput.split(',').map((t) => t.trim()).filter(Boolean),
      summary: summary || 'Kulüp antrenörü tarafından oluşturulmuş özel seans planı.',
      learningOutcomes: [
        'Temel teknik uygulamada istikrar',
        'Saha içi doğru pozisyon alma ve iletişim',
        'Müsabaka temposunda kararlılık',
      ],
      drills,
      equipmentList: equipmentInput.split(',').map((e) => e.trim()).filter(Boolean),
      coachTips: coachTips || 'Seans boyunca sporcuların motivasyonunu ve eforunu sürekli ödüllendirin.',
      isCustom: true,
      authorName: 'Kulüp Başantrenörü',
      rating: 5.0,
      downloadCount: 1,
    };

    onSave(newPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#111c2e] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <SportsFlyIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Yeni Antrenman Planı Oluştur
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Branş, yaş grubu ve özel driller ile kulübünüze özel müfredat hazırlayın
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Branch & Age Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Branş
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Futbol', 'Basketbol', 'Voleybol'] as BranchType[]).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBranch(b)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      branch === b
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {b === 'Futbol' ? '⚽ Futbol' : b === 'Basketbol' ? '🏀 Basketbol' : '🏐 Voleybol'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Yaş Kategorisi
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['U6-U8', 'U9-U11', 'U12-U14', 'U15-U17'] as AgeCategory[]).map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => setAgeCategory(age)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      ageCategory === age
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title and Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Plan Başlığı *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: 1v1 Çalımlama & Hızlı Kanat Hücumları"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/30 outline-hidden font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Toplam Süre (Dakika)
              </label>
              <select
                value={totalDuration}
                onChange={(e) => setTotalDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/30 outline-hidden font-medium"
              >
                <option value={45}>45 Dakika</option>
                <option value={60}>60 Dakika</option>
                <option value={75}>75 Dakika</option>
                <option value={90}>90 Dakika</option>
              </select>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Seans Özeti & Amacı
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Antrenmanın temel amacını ve sporculara kazandıracağı beceriyi kısaca açıklayın..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/30 outline-hidden"
            />
          </div>

          {/* Drills Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                İstasyonlar & Dril Kurgusu ({drills.length})
              </label>
              <button
                type="button"
                onClick={handleAddDrill}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                İstasyon Ekle
              </button>
            </div>

            <div className="space-y-3">
              {drills.map((drill, idx) => (
                <div
                  key={drill.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={drill.title}
                        onChange={(e) => handleDrillChange(idx, 'title', e.target.value)}
                        placeholder="Dril Başlığı"
                        className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="number"
                          value={drill.durationMinutes}
                          onChange={(e) => handleDrillChange(idx, 'durationMinutes', Number(e.target.value))}
                          className="w-14 px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center"
                        />
                        <span className="text-[11px] text-slate-400">dk</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDrill(idx)}
                        disabled={drills.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                        title="İstasyonu Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={drill.objective}
                    onChange={(e) => handleDrillChange(idx, 'objective', e.target.value)}
                    placeholder="Hedef Kazanım (Örn: Çabuk yön değiştirme ve kaleye vuruş)"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Equipment and Focus Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gerekli Ekipmanlar (Virgülle ayırın)
              </label>
              <input
                type="text"
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                placeholder="Örn: 10 Top, 15 Huni, 4 Minyatür Kale"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Odak Etiketleri (Virgülle ayırın)
              </label>
              <input
                type="text"
                value={focusTagInput}
                onChange={(e) => setFocusTagInput(e.target.value)}
                placeholder="Örn: Rondo, 1v1, Çeviklik"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Coach Tips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Antrenör Püf Noktaları & Notlar
            </label>
            <textarea
              rows={2}
              value={coachTips}
              onChange={(e) => setCoachTips(e.target.value)}
              placeholder="Antrenörün dikkat edeceği iletişim ve teknik yönlendirme notları..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/30 outline-hidden"
            />
          </div>

          {/* Footer Save */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Planı Kaydet & Müfredata Ekle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
