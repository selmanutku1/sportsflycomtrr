import React from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  Award,
  Calendar,
  CheckCircle2,
  Building2,
  ShieldCheck,
} from 'lucide-react';

interface TrainerDocumentPreviewModalProps {
  trainerName: string;
  document: {
    id: string;
    name: string;
    type: string;
    date: string;
    size: string;
    issuer?: string;
    notes?: string;
  };
  onClose: () => void;
  onDownload: () => void;
}

export const TrainerDocumentPreviewModal: React.FC<TrainerDocumentPreviewModalProps> = ({
  trainerName,
  document,
  onClose,
  onDownload,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Evrak / Sertifika Önizleme
              </h3>
              <p className="text-xs text-slate-400">
                {trainerName} • {document.type}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Yazdır"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onDownload}
              className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
              title="İndir"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Paper Canvas View */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-50/40 via-white to-blue-50/30 dark:from-slate-900 dark:via-[#131d2e] dark:to-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden text-center space-y-6">
            {/* Watermark seal */}
            <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
              <ShieldCheck className="w-48 h-48 text-slate-900 dark:text-white" />
            </div>

            {/* Header branding */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SPORTSFLY RESMİ ANTRENÖR EVRAKI</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white pt-2">
                {document.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Belge Türü: <span className="font-semibold text-slate-800 dark:text-slate-200">{document.type}</span>
              </p>
            </div>

            {/* Certificate Body */}
            <div className="max-w-md mx-auto p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800 text-left space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Hak Sahibi Eğitmen:</span>
                <span className="font-bold text-slate-900 dark:text-white">{trainerName}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Yetkili / Düzenleyen Kurum:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{document.issuer || 'Federasyon / Kulüp Kurulu'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Kayıt / Onay Tarihi:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{document.date}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Dosya Boyutu:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{document.size}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Doğrulama Durumu:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Onaylı &amp; Geçerli Belge</span>
                </span>
              </div>

              {document.notes && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Belge Notu:</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-0.5">{document.notes}</p>
                </div>
              )}
            </div>

            {/* Stamp & Signature Footer */}
            <div className="flex items-center justify-around pt-2">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-2 border-emerald-500/40 dark:border-emerald-500/60 mx-auto flex items-center justify-center rotate-[-12deg] bg-emerald-50/50 dark:bg-emerald-950/40">
                  <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 leading-tight uppercase">
                    ONAYLANDI<br />SPORTSFLY
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Sistem Doğrulaması</span>
              </div>

              <div className="text-center">
                <div className="w-28 border-b-2 border-slate-300 dark:border-slate-600 mx-auto pb-6">
                  <span className="text-[11px] font-serif italic text-slate-600 dark:text-slate-300 font-bold">Kulüp Yönetimi</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Yetkili İmza &amp; Kaşe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3.5 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Kapat
          </button>

          <button
            onClick={onDownload}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Belgeyi İndir ({document.size})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
