import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Image as ImageIcon, Trash2 } from 'lucide-react';
import { PRESET_AVATARS } from '../../../data/kulupEvrakGaleriData';

interface SporcuFotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoUrl?: string;
  sporcuName: string;
  onSavePhoto: (newUrl: string) => void;
}

export const SporcuFotoModal: React.FC<SporcuFotoModalProps> = ({
  isOpen,
  onClose,
  currentPhotoUrl,
  sporcuName,
  onSavePhoto,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(
    currentPhotoUrl || PRESET_AVATARS[0].url
  );
  const [customUrl, setCustomUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Görsel boyutu 5 MB\'dan küçük olmalıdır.');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedPhoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      setSelectedPhoto(customUrl.trim());
      setCustomUrl('');
    }
  };

  const handleSave = () => {
    onSavePhoto(selectedPhoto);
    onClose();
  };

  const handleRemovePhoto = () => {
    const defaultAvatar = PRESET_AVATARS[0].url;
    setSelectedPhoto(defaultAvatar);
    onSavePhoto(defaultAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                Sporcu Profil Fotoğrafı Ekle / Güncelle
              </h3>
              <p className="text-[11px] text-slate-500">{sporcuName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 space-y-4">
          {/* Active Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border-2 border-white shadow-md">
              {selectedPhoto ? (
                <img
                  src={selectedPhoto}
                  alt={sporcuName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <span className="text-xs font-bold text-slate-800 block">
                Önizleme
              </span>
              <p className="text-[11px] text-slate-500">
                Seçtiğiniz görsel sporcu profil kartında, sporcular tablosunda ve resmi lisans belgelerinde görüntülenecektir.
              </p>
              {currentPhotoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 pt-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Fotoğrafı Kaldır (Varsayılana Dön)</span>
                </button>
              )}
            </div>
          </div>

          {/* Upload From Device Button */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Cihazdan Fotoğraf Yükle
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Bilgisayardan / Telefondan Görsel Seç</span>
            </button>
            {uploadError && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                {uploadError}
              </p>
            )}
          </div>

          {/* Preset Avatars Library */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Veya Hazır Sporcu Portrelerinden Seç
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AVATARS.map((avatar) => {
                const isCurrent = selectedPhoto === avatar.url;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedPhoto(avatar.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group cursor-pointer ${
                      isCurrent
                        ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    title={avatar.label}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center text-white">
                        <Check className="w-5 h-5 drop-shadow-md stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Or enter Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Veya Web Görsel URL'si Yapıştır
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                disabled={!customUrl.trim()}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Fotoğrafı Kaydet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
