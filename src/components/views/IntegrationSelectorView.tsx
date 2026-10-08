import React, { useState } from 'react';
import { Building2, ArrowRight } from 'lucide-react';

interface IntegrationSelectorViewProps {
  onSelect: (integrationId: string) => void;
}

export const IntegrationSelectorView: React.FC<IntegrationSelectorViewProps> = ({ onSelect }) => {
  const [integrations] = useState([
    { id: '1', name: 'Kulüp A' },
    { id: '2', name: 'Kulüp B' },
  ]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
        <h2 className="text-xl font-bold mb-6 text-slate-900">Entegrasyon Seçiniz</h2>
        <div className="space-y-3">
          {integrations.map(int => (
            <button
              key={int.id}
              onClick={() => onSelect(int.id)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-slate-400" />
                <span className="font-semibold text-slate-700">{int.name}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
