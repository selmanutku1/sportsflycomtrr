import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query } from 'firebase/firestore';
import { Plus, Trash2, Key, Building2 } from 'lucide-react';

export const IntegrationAccessManagerPanel: React.FC = () => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [accessCode, setAccessCode] = useState('');

  const fetchIntegrations = async () => {
    const querySnapshot = await getDocs(collection(db, 'integrations'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setIntegrations(data);
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
    await addDoc(collection(db, 'integrations'), {
      companyName,
      accessCode,
    });
    setCompanyName('');
    setAccessCode('');
    fetchIntegrations();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'integrations', id));
    fetchIntegrations();
  };

  return (
    <div className="bg-white dark:bg-[#111c2e] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mt-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Entegrasyon Erişim Yönetimi</h2>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Firma Adı"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Geçiş Kodu"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className="px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700"
          />
          <button
            onClick={generateAccessCode}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl"
            title="Otomatik Kod Oluştur"
          >
            <Key className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
        <button
          onClick={handleAddIntegration}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Ekle
        </button>
      </div>
      <div className="space-y-2">
        {integrations.map((int: any) => (
          <div key={int.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div>
              <p className="font-bold">{int.companyName}</p>
              <p className="text-xs text-slate-500">Kod: {int.accessCode}</p>
            </div>
            <button onClick={() => handleDelete(int.id)} className="text-rose-500 cursor-pointer">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
