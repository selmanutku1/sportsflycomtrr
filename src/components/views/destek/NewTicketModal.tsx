import React, { useState } from 'react';
import {
  X,
  Send,
  Upload,
  AlertCircle,
  FileText,
  Trash2,
  Paperclip,
  CheckCircle2,
  Phone,
  MessageSquare,
  Mail,
  ShieldCheck,
  Building2,
  HelpCircle,
} from 'lucide-react';
import {
  SupportTicketFull,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportAttachment,
} from '../../../types/destek';
import { SUPPORT_CATEGORIES } from '../../../data/mockDestekData';
import { getStoredUserProfile } from '../../../data/userProfile';
import { getStoredSubeler, getActiveSubeId } from '../../../data/subeData';
import { getActiveSessionPlan } from '../../../data/packagePermissions';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newTicket: SupportTicketFull) => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const userProfile = getStoredUserProfile();
  const subeler = getStoredSubeler();
  const activeSubeId = getActiveSubeId();
  const activePlan = getActiveSessionPlan();

  const [category, setCategory] = useState<SupportTicketCategory>('teknik');
  const [priority, setPriority] = useState<SupportTicketPriority>('Normal');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(
    activeSubeId !== 'all' ? subeler.find((s) => s.id === activeSubeId)?.ad || 'Tüm Şubeler' : 'Tüm Şubeler'
  );
  const [preferredContact, setPreferredContact] = useState<'panel' | 'whatsapp' | 'email' | 'phone'>('panel');
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      const newFiles: SupportAttachment[] = filesArray.map((f: File) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: f.type || 'application/octet-stream',
      }));
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files) as File[];
      const newFiles: SupportAttachment[] = filesArray.map((f: File) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: f.type || 'application/octet-stream',
      }));
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setErrorMsg('Lütfen talep konusunu belirtiniz.');
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setErrorMsg('Lütfen sorununuzu veya talebinizi en az 10 karakter ile açıklayınız.');
      return;
    }

    const now = new Date();
    const timeStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const ticketIdNum = Math.floor(1050 + Math.random() * 900);

    const newTicket: SupportTicketFull = {
      id: `SF-${ticketIdNum}`,
      ticketNumber: ticketIdNum,
      subject: subject.trim(),
      category,
      priority,
      status: 'Acik',
      clubName: userProfile?.club || 'Gelecek Yıldızlar Spor Kulübü',
      clubPackage: activePlan,
      clubBranch: selectedBranch,
      creatorName: userProfile?.name || 'Selman Utku',
      creatorEmail: userProfile?.email || 'selmanutkumarmara@gmail.com',
      creatorPhone: userProfile?.phone || '+90 532 900 12 34',
      createdAt: timeStr,
      updatedAt: timeStr,
      preferredContact,
      assignedAgent: {
        name: 'SportsFly Nöbetçi Destek Ekibi',
        title: 'Kıdemli Müşteri Temsilcisi',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        status: 'online',
      },
      messages: [
        {
          id: `msg-${Date.now()}`,
          ticketId: `SF-${ticketIdNum}`,
          senderType: 'club_admin',
          senderName: `${userProfile?.name || 'Selman Utku'} (${userProfile?.role || 'Kulüp Yöneticisi'})`,
          senderRole: userProfile?.role || 'Kulüp Yöneticisi',
          createdAt: timeStr,
          message: message.trim(),
          attachments: attachments.length > 0 ? attachments : undefined,
        },
      ],
    };

    onSubmit(newTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#111c2e] rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-[#162238]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Yeni Destek Talebi Oluştur
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SportsFly Müşteri Başarı ve Teknik Destek Ekibine doğrudan iletilir
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(85vh-8rem)] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Club Info Banner */}
          <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Kulüp: <strong>{userProfile?.club || 'Gelecek Yıldızlar Spor Kulübü'}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold text-[10px]">
                {activePlan}
              </span>
              <span>Yetkili: <strong>{userProfile?.name}</strong></span>
            </div>
          </div>

          {/* Category Selection Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Destek Kategorisi <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUPPORT_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/50 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-[#162238]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSelected ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cat.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject & Priority in 2 Cols */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Talep Konusu / Başlık <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Örn: Sanal POS tahsilat bildirimi veya yoklama QR kodu sorunu"
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Öncelik Düzeyi
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as SupportTicketPriority)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 outline-hidden cursor-pointer"
              >
                <option value="Dusuk">Düşük (48 saat)</option>
                <option value="Normal">Normal (24 saat)</option>
                <option value="Yuksek">Yüksek (4 saat)</option>
                <option value="Acil">Acil / Kesinti (1 saat)</option>
              </select>
            </div>
          </div>

          {/* Branch & Contact Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                İlgili Şube / Tesis
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 outline-hidden cursor-pointer"
              >
                <option value="Tüm Şubeler">Tüm Şubeler (Genel Kulüp)</option>
                {subeler.map((s) => (
                  <option key={s.id} value={s.ad}>
                    {s.ad} ({s.sehir})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cevap Bildirim Tercihi
              </label>
              <div className="flex items-center gap-2 pt-0.5">
                {[
                  { id: 'panel', label: 'Panel İçi', icon: MessageSquare },
                  { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
                  { id: 'email', label: 'E-posta', icon: Mail },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPreferredContact(item.id as any)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      preferredContact === item.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Message */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Açıklama &amp; Detaylar <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Lütfen karşılaştığınız durumu veya sorunuzu detaylandırın
              </span>
            </div>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Sorununuzu, hangi ekranda gerçekleştiğini veya istediğiniz desteği buraya yazabilirsiniz..."
              className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 outline-hidden leading-relaxed"
            />
          </div>

          {/* File & Screen Upload Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Ekran Görüntüsü veya Dosya Ekle (Opsiyonel)
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`p-4 border-2 border-dashed rounded-xl text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#162238]/40 hover:bg-slate-50 dark:hover:bg-[#162238]'
              }`}
            >
              <input
                id="file-ticket-upload"
                type="file"
                multiple
                accept="image/*,.pdf,.xlsx,.csv,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-ticket-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Dosyaları buraya sürükleyin veya <span className="text-blue-600 dark:text-blue-400 underline">gözatın</span>
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  PNG, JPG, PDF, Excel formatları (Maks. 10 MB)
                </p>
              </label>
            </div>

            {/* Attached Files List */}
            {attachments.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">({file.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Talebi SportsFly Ekibine Gönder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
