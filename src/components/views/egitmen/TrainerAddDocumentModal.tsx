import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  X,
  Award,
  Calendar,
  CheckCircle2,
  FileCheck,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { EgitmenItem } from '../../../types';

interface TrainerAddDocumentModalProps {
  trainer: EgitmenItem;
  onClose: () => void;
  onAddDocument: (trainerId: string, document: {
    id: string;
    name: string;
    type: string;
    date: string;
    size: string;
    issuer?: string;
    notes?: string;
  }) => void;
  onToast: (msg: string) => void;
}

export const TrainerAddDocumentModal: React.FC<TrainerAddDocumentModalProps> = ({
  trainer,
  onClose,
  onAddDocument,
  onToast,
}) => {
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Sertifika');
  const [issuer, setIssuer] = useState('Türkiye Futbol Federasyonu (TFF)');
  const [docDate, setDocDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Suggested preset certificates for quick selection
  const presets = [
    { label: 'UEFA Antrenörlük Lisansı', type: 'Lisans', issuer: 'TFF' },
    { label: 'TBF 2. Kademe Antrenör Belgesi', type: 'Lisans', issuer: 'TBF' },
    { label: 'Sporcu İlk Yardım & CPR Sertifikası', type: 'Sertifika', issuer: 'Kızılay / Sağlık Bakanlığı' },
    { label: 'Kulüp Antrenörlük Hizmet Sözleşmesi', type: 'Sözleşme', issuer: 'SportsFly Kulüp Yönetimi' },
    { label: 'Sağlık Kurulu Heyet Raporu', type: 'Sağlık Raporu', issuer: 'Tam Teşekküllü Hastane' },
    { label: 'Adli Sicil & Arşiv Kaydı', type: 'Resmi Evrak', issuer: 'Adalet Bakanlığı' },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setDocName(p.label);
    setDocType(p.type);
    setIssuer(p.issuer);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setSelectedFile({
        name: file.name,
        size: `${sizeMB} MB`,
      });
      if (!docName) {
        setDocName(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setSelectedFile({
        name: file.name,
        size: `${sizeMB} MB`,
      });
      if (!docName) {
        setDocName(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) {
      onToast('Lütfen bir belge veya sertifika adı giriniz.');
      return;
    }

    const formattedDate = docDate
      ? docDate.split('-').reverse().join('.')
      : new Date().toLocaleDateString('tr-TR');

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: selectedFile ? selectedFile.name : `${docName.trim().replace(/\s+/g, '_')}.pdf`,
      type: docType,
      date: formattedDate,
      size: selectedFile ? selectedFile.size : '1.8 MB',
      issuer: issuer.trim() || 'Resmi Federasyon / Kurum',
      notes: notes.trim(),
    };

    onAddDocument(trainer.id, newDoc);
    onToast(`"${docName}" belgesi başarıyla eğitmen profiline yüklendi.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Yeni Sertifika &amp; Belge Yükle
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{trainer.name}</span> • Eğitmen Dosyası
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

        {/* Quick presets */}
        <div className="mt-4 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
            Hızlı Şablonlar (Tek tıkla doldur):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
              >
                + {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* File Upload Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Belge Dosyası (PDF, JPG, PNG) *
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[240px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold">{selectedFile.size} • Dosya Seçildi (Değiştirmek için tıkla)</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Dosyayı buraya sürükleyin veya <span className="text-emerald-600 dark:text-emerald-400 underline">gözatın</span>
                  </p>
                  <p className="text-[10px] text-slate-400">PDF, JPG, PNG veya DOC (Maksimum 25 MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Belge Adı */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Belge / Sertifika Başlığı *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: UEFA B Lisanslı Antrenörlük Belgesi"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Belge Türü */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori / Tür
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Sertifika">Sertifika</option>
                <option value="Lisans">Federasyon Lisansı</option>
                <option value="Sözleşme">Kulüp Sözleşmesi</option>
                <option value="Sağlık Raporu">Sağlık Raporu</option>
                <option value="Resmi Evrak">Resmi Evrak &amp; Adli Sicil</option>
                <option value="Diğer">Diğer Belge</option>
              </select>
            </div>

            {/* Veren Kurum */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Düzenleyen Kurum / Federasyon
              </label>
              <input
                type="text"
                placeholder="Örn: TFF / Gençlik ve Spor Bak."
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Veriliş Tarihi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Düzenleme Tarihi
              </label>
              <input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Geçerlilik Tarihi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Son Geçerlilik (Opsiyonel)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Açıklama / Belge Notu
            </label>
            <input
              type="text"
              placeholder="Örn: 2026-2027 Sezonu federasyon vizesi onaylanmıştır."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              İptal
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Belgeyi Kaydet &amp; Yükle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
