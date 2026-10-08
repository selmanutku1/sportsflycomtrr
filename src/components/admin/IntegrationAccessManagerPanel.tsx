import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash2, Key, Check } from 'lucide-react';
import { getStoredIntegrations } from '../../data/entegrasyonlarData';

const allStored = getStoredIntegrations();
const ALL_MODULES = allStored.map(item => ({ id: item.id, name: item.name }));
const defaultActiveModules: Record<string, boolean> = {};
allStored.forEach(item => {
  defaultActiveModules[item.id] = true;
});

export const IntegrationAccessManagerPanel: React.FC = () => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [activeModules, setActiveModules] = useState<Record<string, boolean>>(defaultActiveModules);

  const fetchIntegrations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'integrations'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIntegrations(data);
      localStorage.setItem('sportsfly_integration_access_list', JSON.stringify(data));
    } catch (e) {
      // Fallback to localStorage if offline/Firestore error
      const stored = localStorage.getItem('sportsfly_integration_access_list');
      if (stored) {
        setIntegrations(JSON.parse(stored));
      }
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const generateAccessCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setAccessCode(code);
  };

  const handleAddIntegration = async () => {
    if (!companyName || !accessCode) return;
    const newEntry = {
      companyName,
      accessCode,
      activeModules,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'integrations'), newEntry);
    } catch (e) {}

    const updated = [...integrations, { id: Date.now().toString(), ...newEntry }];
    setIntegrations(updated);
    localStorage.setItem('sportsfly_integration_access_list', JSON.stringify(updated));

    setCompanyName('');
    setAccessCode('');
    setActiveModules(defaultActiveModules);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'integrations', id));
    } catch (e) {}
    const updated = integrations.filter(i => i.id !== id);
    setIntegrations(updated);
    localStorage.setItem('sportsfly_integration_access_list', JSON.stringify(updated));
  };

  const toggleModule = (modId: string) => {
    setActiveModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  return (
    <div className="bg-white dark:bg-[#111c2e] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mt-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Entegrasyon Erişim ve Aktif Modül Yönetimi</h2>
      <p className="text-xs text-slate-500 mb-4">
        Firma geçiş kodları tanımlayın ve her geçiş kodu için hangi entegrasyon modüllerinin aktif olacağını belirleyin.
      </p>

      <div className="space-y-4 mb-6 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Firma Adı"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Geçiş Kodu (örn. ABC123XYZ)"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold uppercase font-mono"
            />
            <button
              type="button"
              onClick={generateAccessCode}
              className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl cursor-pointer"
              title="Otomatik Kod Oluştur"
            >
              <Key className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Bu Geçiş Kodu İçin Aktif Edilecek Entegrasyonlar / Modüller:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ALL_MODULES.map((mod) => {
              const isActive = activeModules[mod.id] ?? true;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="truncate">{mod.name}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleAddIntegration}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Geçiş Kodu ve Yetkileri Kaydet
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
          Tanımlı Firma Entegrasyon Erişimleri ({integrations.length})
        </h3>
        {integrations.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">Henüz tanımlı firma erişimi bulunmuyor.</p>
        ) : (
          integrations.map((int: any) => (
            <div key={int.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">{int.companyName}</p>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[11px] font-mono font-bold">
                    {int.accessCode}
                  </span>
                </div>
                {int.activeModules && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {Object.entries(int.activeModules).map(([modId, active]) => {
                      if (!active) return null;
                      const modMeta = ALL_MODULES.find(m => m.id === modId);
                      if (!modMeta) return null;
                      return (
                        <span key={modId} className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-semibold">
                          ✓ {modMeta.name}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(int.id)}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg cursor-pointer self-end sm:self-auto"
                title="Erişimi Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

