import React, { useState } from 'react';
import {
  X,
  FileText,
  Building2,
  MapPin,
  Mail,
  Phone,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { LEGAL_TEXTS, LegalDoc } from '../../data/legalTexts';

interface LegalDocPreviewModalProps {
  initialDocId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept?: (docId: string) => void;
  isAccepted?: boolean;
}

export const LegalDocPreviewModal: React.FC<LegalDocPreviewModalProps> = ({
  initialDocId = 'kvkk',
  isOpen,
  onClose,
  onAccept,
  isAccepted = false,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(initialDocId || 'kvkk');
  const [copied, setCopied] = useState<boolean>(false);

  // Sync when initialDocId changes and modal opens
  React.useEffect(() => {
    if (initialDocId && LEGAL_TEXTS[initialDocId]) {
      setSelectedKey(initialDocId);
    }
  }, [initialDocId, isOpen]);

  if (!isOpen) return null;

  const currentDoc: LegalDoc = LEGAL_TEXTS[selectedKey] || LEGAL_TEXTS.kvkk;

  const handleCopyText = () => {
    const textToCopy = `
${currentDoc.title.toUpperCase()}
${currentDoc.subtitle}
Kurum: ${currentDoc.companyInfo.unvan} (${currentDoc.companyInfo.adres})
Son Güncelleme: ${currentDoc.lastUpdated}

ÖZET:
${currentDoc.summary}

${currentDoc.sections
  .map(
    (s) => `
${s.heading}
${s.content}
${s.bulletPoints ? s.bulletPoints.map((b) => `• ${b}`).join('\n') : ''}
`
  )
  .join('\n')}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {currentDoc.badge}
                </span>
                <span className="text-[11px] text-slate-400">
                  Son Güncelleme: {currentDoc.lastUpdated}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {currentDoc.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Quick switch between 5 legal texts) */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 overflow-x-auto scrollbar-none text-xs">
          {Object.entries(LEGAL_TEXTS).map(([key, doc]) => {
            const isActive = selectedKey === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedKey(key)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-blue-700 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                }`}
              >
                <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{doc.title}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body - Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700">
          {/* Company Identity Notice Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Veri Sorumlusu / Hizmet Sağlayıcı Şirket Bilgileri:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1">
              <div className="flex items-start gap-1.5">
                <span className="font-semibold text-slate-800">Unvan:</span>
                <span>{currentDoc.companyInfo.unvan}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{currentDoc.companyInfo.adres}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{currentDoc.companyInfo.eposta}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <a
                  href={`tel:${currentDoc.companyInfo.telefon.replace(/[^0-9]/g, '')}`}
                  className="text-blue-700 font-semibold hover:underline"
                  title="Aramak için tıklayınız"
                >
                  {currentDoc.companyInfo.telefon}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Summary Box */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>Metin Özeti &amp; Amacı</span>
            </h4>
            <p className="text-xs text-blue-950 leading-relaxed font-normal">
              {currentDoc.summary}
            </p>
          </div>

          {/* Detailed Document Sections */}
          <div className="space-y-5 text-xs sm:text-[13px] leading-relaxed">
            {currentDoc.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-1 flex items-center gap-2">
                  <span className="text-blue-600 font-black">•</span>
                  <span>{sec.heading}</span>
                </h3>
                <p className="text-slate-600 whitespace-pre-line text-justify">
                  {sec.content}
                </p>
                {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                  <ul className="space-y-1.5 pl-4 list-disc text-slate-600">
                    {sec.bulletPoints.map((bp, bidx) => (
                      <li key={bidx} className="leading-normal">
                        {bp}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Kopyalandı</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Metni Kopyala</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Yazdır</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onAccept && (
              <button
                onClick={() => {
                  onAccept(selectedKey);
                  onClose();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isAccepted
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {isAccepted ? 'Onaylandı (Tekrar Onayla)' : 'Okudum, Anladım ve Onaylıyorum'}
                </span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
