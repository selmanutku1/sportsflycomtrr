import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  X,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { EgitmenItem, GrupItem } from '../../../types';
import { INITIAL_GRUPLAR } from '../../../data/mockMuhasebeData';

interface TrainerAssignGroupModalProps {
  trainer: EgitmenItem;
  allGroups?: GrupItem[];
  onClose: () => void;
  onSaveGroups: (trainerId: string, updatedGroups: string[], updatedAthletesCount: number, updatedWeeklyHours: number) => void;
  onToast: (msg: string) => void;
}

export const TrainerAssignGroupModal: React.FC<TrainerAssignGroupModalProps> = ({
  trainer,
  allGroups = INITIAL_GRUPLAR,
  onClose,
  onSaveGroups,
  onToast,
}) => {
  // Current assigned groups for this trainer
  const [assignedList, setAssignedList] = useState<string[]>(
    trainer.assignedGroups && trainer.assignedGroups.length > 0
      ? [...trainer.assignedGroups]
      : [`${trainer.branch || 'Futbol'} Akademi Grubu`]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [newCustomGroupName, setNewCustomGroupName] = useState('');
  const [showCustomGroupInput, setShowCustomGroupInput] = useState(false);

  // Available groups from system
  const systemGroups = allGroups.map((g) => ({
    id: g.id,
    name: g.name,
    branch: g.branch || 'Spor',
    category: g.category || 'Akademi',
    memberCount: g.memberCount || 15,
    schedule: g.schedule ? `${g.schedule.days.slice(0, 2).join(', ')} • ${g.schedule.time}` : 'Haftada 3 Gün',
  }));

  // Filter groups
  const filteredAvailableGroups = systemGroups.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || g.branch === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Unique branches from system groups
  const uniqueBranches = ['Tümü', ...Array.from(new Set(systemGroups.map((g) => g.branch)))];

  // Toggle or add group
  const handleToggleGroup = (groupName: string) => {
    if (assignedList.includes(groupName)) {
      setAssignedList(assignedList.filter((g) => g !== groupName));
      onToast(`"${groupName}" eğitmen listesinden çıkarıldı.`);
    } else {
      setAssignedList([...assignedList, groupName]);
      onToast(`"${groupName}" eğitmene başarıyla atandı.`);
    }
  };

  // Add custom group
  const handleAddCustomGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomGroupName.trim()) return;
    const name = newCustomGroupName.trim();
    if (assignedList.includes(name)) {
      onToast('Bu grup zaten listede mevcut.');
      return;
    }
    setAssignedList([...assignedList, name]);
    setNewCustomGroupName('');
    setShowCustomGroupInput(false);
    onToast(`"${name}" yeni grup olarak eğitmene eklendi.`);
  };

  // Save changes
  const handleSave = () => {
    const calculatedAthletes = assignedList.length * 15;
    const calculatedHours = Math.max(12, assignedList.length * 6);
    onSaveGroups(trainer.id, assignedList, calculatedAthletes, calculatedHours);
    onToast(`"${trainer.name}" için grup atamaları başarıyla güncellendi (${assignedList.length} grup).`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Eğitmene Grup &amp; Takım Atama
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{trainer.name}</span> • {trainer.branch || 'Spor'} Branşı
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          {/* Active Assigned Groups Chips */}
          <div className="bg-slate-50 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Şu Anda Atanmış Gruplar ({assignedList.length})
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Tahmini ~{assignedList.length * 15} Sporcu
              </span>
            </div>

            {assignedList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {assignedList.map((grpName, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold group transition-all"
                  >
                    <span>{grpName}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleGroup(grpName)}
                      className="text-blue-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded-md transition-colors"
                      title="Grubu Kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium py-1">
                Eğitmene henüz atanmış grup bulunmuyor. Lütfen aşağıdaki listeden grup seçiniz.
              </p>
            )}
          </div>

          {/* Quick Custom Group Adder */}
          <div>
            {!showCustomGroupInput ? (
              <button
                type="button"
                onClick={() => setShowCustomGroupInput(true)}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Listede olmayan özel bir grup / yaş takımı ekle</span>
              </button>
            ) : (
              <form onSubmit={handleAddCustomGroup} className="flex gap-2 items-center bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                <input
                  type="text"
                  placeholder="Örn: U11 Gelişim & Hazırlık Grubu"
                  value={newCustomGroupName}
                  onChange={(e) => setNewCustomGroupName(e.target.value)}
                  className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs cursor-pointer"
                >
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomGroupInput(false);
                    setNewCustomGroupName('');
                  }}
                  className="px-2.5 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-semibold"
                >
                  İptal
                </button>
              </form>
            )}
          </div>

          {/* Available System Groups */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Kulüp Gruplarından Seçin</span>
              </span>

              {/* Search input */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Grup ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Branch filter pills */}
            <div className="flex flex-wrap gap-1.5">
              {uniqueBranches.map((br) => (
                <button
                  key={br}
                  type="button"
                  onClick={() => setSelectedCategory(br)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === br
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {br}
                </button>
              ))}
            </div>

            {/* Groups list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {filteredAvailableGroups.map((grp) => {
                const isAssigned = assignedList.includes(grp.name);
                return (
                  <div
                    key={grp.id}
                    onClick={() => handleToggleGroup(grp.name)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 select-none ${
                      isAssigned
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-700 ring-1 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {grp.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                          {grp.branch}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {grp.memberCount} Sporcu
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {grp.schedule}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAssigned ? (
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-blue-600 flex items-center justify-center transition-colors">
                          <Plus className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredAvailableGroups.length === 0 && (
                <div className="col-span-2 py-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  Aradığınız kriterde grup bulunamadı. Yukarıdan yeni grup ekleyebilirsiniz.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Atamaları Kaydet ({assignedList.length} Grup)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
