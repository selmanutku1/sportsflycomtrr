import React, { useState } from 'react';
import { Building2, KeyRound, ArrowRight } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface IntegrationLoginViewProps {
  onSuccess: () => void;
  onError: (error: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  onBack?: () => void;
}

export const IntegrationLoginView: React.FC<IntegrationLoginViewProps> = ({ onSuccess, onError, setIsLoading, onBack }) => {
  const [integrationId, setIntegrationId] = useState('');
  const [code, setCode] = useState('');

  const handleIntegrationLogin = async () => {
    if (!integrationId || !code) {
      onError('Lütfen firma adı ve geçiş kodunu giriniz.');
      return;
    }

    setIsLoading(true);
    onError(null);

    try {
      // Mock validation for demonstration
      if (integrationId === 'demo' && code === '123456') {
        onSuccess();
      } else {
        onError('Firma adı veya geçiş kodu hatalı.');
      }
    } catch (e) {
      console.error('Integration login error details:', e);
      onError('Bağlantı hatası.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-700">Firma Adı</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={integrationId}
            onChange={(e) => setIntegrationId(e.target.value)}
            placeholder="Firma adını giriniz"
            className="w-full pl-9 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-700">Geçiş Kodu</label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Geçiş kodunuzu giriniz"
            className="w-full pl-9 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm tracking-wide transition-all shadow-sm cursor-pointer"
          >
            Geri Dön
          </button>
        )}
        <button
          onClick={handleIntegrationLogin}
          className="flex-[2] py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Giriş Yap</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
