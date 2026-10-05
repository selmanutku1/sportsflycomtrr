import React, { useState } from 'react';
import { TrainingPlan } from '../../../types/egitimPlanlama';
import { X, Check, Calendar, Users, Building2, Clock } from 'lucide-react';
import { SportsFlyIcon } from '../../SportsFlyLogo';
import { INITIAL_GRUPLAR } from '../../../data/mockMuhasebeData';

interface AssignToGroupModalProps {
  plan: TrainingPlan;
  onClose: () => void;
  onSuccess: (assignedGroupNames: string[], scheduledDate: string) => void;
}

export const AssignToGroupModal: React.FC<AssignToGroupModalProps> = ({
  plan,
  onClose,
  onSuccess,
}) => {
  const [selectedGroups, setSelectedGroups] = useState<string[]>(plan.assignedGroups || []);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('17:30');
  const [notifyTrainers, setNotifyTrainers] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Filter groups matching the branch or relevant age
  const availableGroups = INITIAL_GRUPLAR;

  const toggleGroup = (groupName: string) => {
    if (selectedGroups.includes(groupName)) {
      setSelectedGroups(selectedGroups.filter((g) => g !== groupName));
    } else {
      setSelectedGroups([...selectedGroups, groupName]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onSuccess(selectedGroups, `${scheduledDate} ${scheduledTime}`);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#111c2e] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Antrenmanı Gruplara Ata
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {plan.code} • {plan.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Target Group Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Uygulanacak Kulüp Grupları & Takımlar
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {availableGroups.map((g) => {
                const isSelected = selectedGroups.includes(g.name);
                return (
                  <div
                    key={g.id}
                    onClick={() => toggleGroup(g.name)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500/80 text-blue-900 dark:text-blue-200 shadow-xs'
                        : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{g.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
                          {g.branch || plan.branch}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {g.facility} • {g.instructorName}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Uygulama Tarihi
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/30 outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Seans Saati
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/30 outline-hidden"
                required
              />
            </div>
          </div>

          {/* Trainer notification */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyTrainers}
              onChange={(e) => setNotifyTrainers(e.target.checked)}
              className="w-4 h-4 rounded-sm text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Grup antrenörlerine WhatsApp / SMS ile müfredat planını bildir
            </span>
          </label>

          {/* Submit buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitted || selectedGroups.length === 0}
              className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitted ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Atandı!</span>
                </>
              ) : (
                <>
                  <SportsFlyIcon className="w-4 h-4" />
                  <span>Gruba Ata ({selectedGroups.length})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
