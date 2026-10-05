import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  X,
  Sparkles,
  CheckCircle2,
  FileText,
  Activity,
  Dumbbell,
  Layers,
} from 'lucide-react';
import { EgitmenItem } from '../../../types';

interface TrainerAssignTrainingModalProps {
  trainer: EgitmenItem;
  onClose: () => void;
  onAssignTraining: (
    trainerId: string,
    training: {
      id: string;
      title: string;
      branch: string;
      student: string;
      targetGroup: string;
      date: string;
      time: string;
      facility: string;
      notes?: string;
      status: string;
    }
  ) => void;
  onToast: (msg: string) => void;
}

export const TrainerAssignTrainingModal: React.FC<TrainerAssignTrainingModalProps> = ({
  trainer,
  onClose,
  onAssignTraining,
  onToast,
}) => {
  const [title, setTitle] = useState(`${trainer.branch || 'Futbol'} Taktik & Kondisyon Antrenmanı`);
  const [branch, setBranch] = useState(trainer.branch || 'Futbol');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('16:30');
  const [endTime, setEndTime] = useState('18:00');
  const [facility, setFacility] = useState(trainer.facility || 'Saraçgym Nilüfer - A Salonu');
  const [targetType, setTargetType] = useState<'grup' | 'bireysel'>('grup');
  const [targetGroup, setTargetGroup] = useState(
    trainer.assignedGroups && trainer.assignedGroups.length > 0
      ? trainer.assignedGroups[0]
      : `${trainer.branch || 'Spor'} Akademi Grubu`
  );
  const [individualStudent, setIndividualStudent] = useState('');
  const [notes, setNotes] = useState('');
  const [repeatWeekly, setRepeatWeekly] = useState(false);

  const sampleFacilities = [
    'Saraçgym Nilüfer - A Salonu',
    'Saraçgym Nilüfer - B Salonu',
    'Özlüce Yarı Olimpik Havuz',
    'Çim Saha 1 (Ana Saha)',
    'Kort 1 (Toprak Zemin)',
    'Kort 2 (Sert Zemin)',
    'Stüdyo 2 (Reformer Odası)',
    'Ana Fitness & Kondisyon Salonu',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onToast('Lütfen bir antrenman başlığı giriniz.');
      return;
    }

    const trainingId = `app-${Date.now()}`;
    const timeFormatted = `${startTime} - ${endTime}`;
    const studentOrGroup = targetType === 'grup' ? targetGroup : individualStudent || 'Bireysel Sporcu';

    onAssignTraining(trainer.id, {
      id: trainingId,
      title: title.trim(),
      branch,
      student: studentOrGroup,
      targetGroup: targetType === 'grup' ? targetGroup : 'Bireysel Özel Seans',
      date,
      time: timeFormatted,
      facility,
      notes: notes.trim(),
      status: 'Planlandı',
    });

    onToast(`"${trainer.name}" için "${title}" antrenman seansı başarıyla takvime atandı.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Eğitmene Antrenman &amp; Seans Ata
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{trainer.name}</span> • {trainer.branch}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Antrenman Başlığı */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Antrenman / Seans Başlığı *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: U14 Taktik & Geçiş Hücumu Drilleri"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Branş & Hedef Türü */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Branş
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="Futbol">Futbol</option>
                <option value="Basketbol">Basketbol</option>
                <option value="Yüzme">Yüzme</option>
                <option value="Tenis">Tenis</option>
                <option value="Pilates">Pilates</option>
                <option value="Fitness">Fitness</option>
                <option value="Voleybol">Voleybol</option>
                <option value="Jimnastik">Jimnastik</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Hedef Katılımcı
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTargetType('grup')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    targetType === 'grup'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Takım / Grup
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('bireysel')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    targetType === 'bireysel'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Bireysel Özel Ders
                </button>
              </div>
            </div>
          </div>

          {/* Grup veya Sporcu Seçimi */}
          {targetType === 'grup' ? (
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Hedef Grup / Takım
              </label>
              <select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {(trainer.assignedGroups || []).length > 0 ? (
                  (trainer.assignedGroups || []).map((grp, idx) => (
                    <option key={idx} value={grp}>
                      {grp} (Eğitmene Atanmış Grup)
                    </option>
                  ))
                ) : (
                  <option value={`${trainer.branch} Akademi Grubu`}>
                    {trainer.branch} Akademi Grubu
                  </option>
                )}
                <option value="U14 Gelişim Takımı">U14 Gelişim Takımı</option>
                <option value="U16 Yıldız Takımı">U16 Yıldız Takımı</option>
                <option value="Yetişkin Performans Grubu">Yetişkin Performans Grubu</option>
                <option value="Minikler Temel Eğitim">Minikler Temel Eğitim</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Sporcu Adı Soyadı
              </label>
              <input
                type="text"
                placeholder="Örn: Burak Yılmaz (Bireysel Performans)"
                value={individualStudent}
                onChange={(e) => setIndividualStudent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {/* Tarih & Saat */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tarih
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Başlangıç Saati
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Bitiş Saati
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Tesis & Salon */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Tesis &amp; Çalışma Alanı
            </label>
            <select
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {sampleFacilities.map((fac, idx) => (
                <option key={idx} value={fac}>
                  {fac}
                </option>
              ))}
            </select>
          </div>

          {/* Notlar & Driller */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Antrenman Notu / Driller / Açıklama
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Isınma protokolü, şut drillleri, kondisyon seti vb..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Weekly recurrence checkbox */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <input
              type="checkbox"
              id="repeatWeekly"
              checked={repeatWeekly}
              onChange={(e) => setRepeatWeekly(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
            <label htmlFor="repeatWeekly" className="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
              Bu seansı haftalık periyotla eğitmenin düzenli programına dahil et
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Antrenmanı Ata &amp; Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
