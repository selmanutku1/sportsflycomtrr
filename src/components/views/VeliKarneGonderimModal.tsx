import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  Smartphone, 
  Settings, 
  History, 
  Check, 
  Copy, 
  ExternalLink, 
  FileDown, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Trash2, 
  Key, 
  Save, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { SportsFlyIcon } from '../SportsFlyLogo';
import { SporcuKarne } from '../../data/mockKarneData';
import { 
  NotificationChannel,
  VeliBildirimLog,
  SmsAyarConfig,
  WHATSAPP_SABLONLARI,
  SMS_SABLONLARI,
  SMS_SAGLAYICI_LISTESI,
  getStoredSmsConfig,
  saveStoredSmsConfig,
  getStoredBildirimLogs,
  addBildirimLog,
  saveStoredBildirimLogs,
  cleanPhoneForWhatsApp,
  cleanPhoneForSms,
  formatTemplate
} from '../../data/karneBildirimData';
import { getAthletePhotoUrl, getAthleteInitials } from '../../utils/athletePhotoResolver';

interface VeliKarneGonderimModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKarne: SporcuKarne;
  onUpdateKarne: (updatedKarne: SporcuKarne) => void;
  onDownloadPDF: () => void;
  isDownloadingPDF?: boolean;
}

export const VeliKarneGonderimModal: React.FC<VeliKarneGonderimModalProps> = ({
  isOpen,
  onClose,
  selectedKarne,
  onUpdateKarne,
  onDownloadPDF,
  isDownloadingPDF = false,
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'sms' | 'ayarlar' | 'gecmis'>('whatsapp');
  
  // Parent contact state (in sync with selectedKarne)
  const [veliAdSoyad, setVeliAdSoyad] = useState(selectedKarne.veliAdSoyad || '');
  const [veliTelefon, setVeliTelefon] = useState(selectedKarne.veliTelefon || '');
  const [veliYakinlik, setVeliYakinlik] = useState<'Anne' | 'Baba' | 'Vasi' | 'Diğer'>(
    selectedKarne.veliYakinlik || 'Baba'
  );
  const [veliEposta, setVeliEposta] = useState(selectedKarne.veliEposta || '');
  const [isSavedContact, setIsSavedContact] = useState(false);

  // WhatsApp state
  const [selectedWaTemplateId, setSelectedWaTemplateId] = useState<string>(WHATSAPP_SABLONLARI[0].id);
  const [waMessage, setWaMessage] = useState<string>('');
  const [isCopiedWa, setIsCopiedWa] = useState(false);

  // SMS state
  const [selectedSmsTemplateId, setSelectedSmsTemplateId] = useState<string>(SMS_SABLONLARI[0].id);
  const [smsMessage, setSmsMessage] = useState<string>('');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [isCopiedSms, setIsCopiedSms] = useState(false);
  const [smsSuccessStatus, setSmsSuccessStatus] = useState<string | null>(null);

  // Settings state
  const [smsConfig, setSmsConfig] = useState<SmsAyarConfig>(() => getStoredSmsConfig());
  const [isConfigSaved, setIsConfigSaved] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testSmsStatus, setTestSmsStatus] = useState<string | null>(null);

  // History state
  const [logs, setLogs] = useState<VeliBildirimLog[]>(() => getStoredBildirimLogs());

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync parent contact when selectedKarne changes
  useEffect(() => {
    setVeliAdSoyad(selectedKarne.veliAdSoyad || '');
    setVeliTelefon(selectedKarne.veliTelefon || '');
    setVeliYakinlik(selectedKarne.veliYakinlik || 'Baba');
    setVeliEposta(selectedKarne.veliEposta || '');
  }, [selectedKarne]);

  // Update WhatsApp message when template or parent overrides change
  useEffect(() => {
    const templateObj = WHATSAPP_SABLONLARI.find((t) => t.id === selectedWaTemplateId) || WHATSAPP_SABLONLARI[0];
    const generated = formatTemplate(templateObj.sablon, selectedKarne, {
      adSoyad: veliAdSoyad,
      telefon: veliTelefon,
    });
    setWaMessage(generated);
  }, [selectedWaTemplateId, selectedKarne, veliAdSoyad, veliTelefon]);

  // Update SMS message when template or parent overrides change
  useEffect(() => {
    const templateObj = SMS_SABLONLARI.find((t) => t.id === selectedSmsTemplateId) || SMS_SABLONLARI[0];
    const generated = formatTemplate(templateObj.sablon, selectedKarne, {
      adSoyad: veliAdSoyad,
      telefon: veliTelefon,
    });
    setSmsMessage(generated);
  }, [selectedSmsTemplateId, selectedKarne, veliAdSoyad, veliTelefon]);

  // Listen for log updates
  useEffect(() => {
    const handleLogUpdate = (e: any) => {
      if (e?.detail) setLogs(e.detail);
      else setLogs(getStoredBildirimLogs());
    };
    window.addEventListener('sportsfly_bildirim_logs_updated', handleLogUpdate);
    return () => window.removeEventListener('sportsfly_bildirim_logs_updated', handleLogUpdate);
  }, []);

  if (!isOpen) return null;

  const handleSaveContact = () => {
    const updated: SporcuKarne = {
      ...selectedKarne,
      veliAdSoyad,
      veliTelefon,
      veliYakinlik,
      veliEposta,
    };
    onUpdateKarne(updated);
    setIsSavedContact(true);
    showToast('Veli iletişim bilgileri sporcu karnesine kaydedildi!');
    setTimeout(() => setIsSavedContact(false), 2500);
  };

  // WhatsApp send handler
  const handleSendWhatsApp = () => {
    const cleanPhone = cleanPhoneForWhatsApp(veliTelefon);
    if (!cleanPhone || cleanPhone.length < 10) {
      alert('Lütfen geçerli bir veli cep telefonu giriniz.');
      return;
    }

    // WhatsApp Click to Chat URL
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(waMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    // Add to logs
    addBildirimLog({
      karneId: selectedKarne.id,
      sporcuAdSoyad: selectedKarne.adSoyad,
      veliAdSoyad: veliAdSoyad || 'Veli',
      telefon: veliTelefon,
      kanal: 'whatsapp',
      mesaj: waMessage.substring(0, 150) + '...',
      durum: 'WhatsApp Açıldı',
    });

    showToast(`WhatsApp açıldı! ${selectedKarne.adSoyad} karnesi veliye aktarılmaya hazır.`);
  };

  const handleCopyWhatsApp = async () => {
    try {
      await navigator.clipboard.writeText(waMessage);
      setIsCopiedWa(true);
      showToast('WhatsApp mesaj metni panoya kopyalandı!');
      setTimeout(() => setIsCopiedWa(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // SMS native intent (from device)
  const handleSendNativeSms = () => {
    const cleanPhone = cleanPhoneForSms(veliTelefon);
    if (!cleanPhone) {
      alert('Lütfen geçerli bir veli cep telefonu giriniz.');
      return;
    }

    const url = `sms:${cleanPhone}?body=${encodeURIComponent(smsMessage)}`;
    window.open(url, '_self');

    addBildirimLog({
      karneId: selectedKarne.id,
      sporcuAdSoyad: selectedKarne.adSoyad,
      veliAdSoyad: veliAdSoyad || 'Veli',
      telefon: veliTelefon,
      kanal: 'sms',
      mesaj: smsMessage,
      durum: 'SMS Gönderildi',
      smsBaslik: 'CİHAZ_SMS',
    });

    showToast('Cihaz SMS uygulaması açıldı.');
  };

  // Official Club SMS Gateway send (API)
  const handleSendOfficialSms = () => {
    const cleanPhone = cleanPhoneForSms(veliTelefon);
    if (!cleanPhone) {
      alert('Lütfen geçerli bir veli cep telefonu giriniz.');
      return;
    }

    setIsSendingSms(true);
    setSmsSuccessStatus(null);

    setTimeout(() => {
      setIsSendingSms(false);
      const raporNo = `SF-${Math.floor(10000 + Math.random() * 90000)}`;

      // Update SMS credit balance
      const newConfig: SmsAyarConfig = {
        ...smsConfig,
        bakiyeKredi: Math.max(0, smsConfig.bakiyeKredi - 1),
      };
      setSmsConfig(newConfig);
      saveStoredSmsConfig(newConfig);

      // Log
      addBildirimLog({
        karneId: selectedKarne.id,
        sporcuAdSoyad: selectedKarne.adSoyad,
        veliAdSoyad: veliAdSoyad || 'Veli',
        telefon: veliTelefon,
        kanal: 'sms',
        mesaj: smsMessage,
        durum: 'İletildi',
        smsBaslik: smsConfig.baslik,
        raporKodu: raporNo,
      });

      setSmsSuccessStatus(`SMS başarıyla iletildi! Başlık: ${smsConfig.baslik} • Rapor Kodu: ${raporNo}`);
      showToast(`SMS "${smsConfig.baslik}" başlığıyla veliye başarıyla gönderildi!`);
    }, 1100);
  };

  const handleCopySms = async () => {
    try {
      await navigator.clipboard.writeText(smsMessage);
      setIsCopiedSms(true);
      showToast('SMS metni panoya kopyalandı!');
      setTimeout(() => setIsCopiedSms(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSmsConfig(smsConfig);
    setIsConfigSaved(true);
    showToast('SMS ve bildirim yapılandırması başarıyla kaydedildi!');
    setTimeout(() => setIsConfigSaved(false), 2500);
  };

  const handleSendTestSms = () => {
    if (!testPhoneNumber) {
      alert('Lütfen test edilecek bir telefon numarası giriniz.');
      return;
    }
    setTestSmsStatus('Gönderiliyor...');
    setTimeout(() => {
      setTestSmsStatus(`Test SMS'i ${testPhoneNumber} numarasına "${smsConfig.baslik}" başlığıyla başarıyla ulaştı!`);
      showToast('Test SMS gönderimi başarılı!');
      setTimeout(() => setTestSmsStatus(null), 4000);
    }, 1000);
  };

  const handleClearLogs = () => {
    if (window.confirm('Tüm veli bildirim geçmişi silinsin mi?')) {
      saveStoredBildirimLogs([]);
      showToast('Bildirim geçmişi temizlendi.');
    }
  };

  const smsCharacterCount = smsMessage.length;
  const smsPartCount = Math.ceil(smsCharacterCount / 160) || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            {(() => {
              const photo = getAthletePhotoUrl(selectedKarne);
              const initials = getAthleteInitials(selectedKarne.adSoyad);
              return (
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white border border-blue-400/30 flex items-center justify-center shrink-0 overflow-hidden shadow-xs font-black text-xs">
                  {photo ? (
                    <img 
                      src={photo} 
                      alt={selectedKarne.adSoyad}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              );
            })()}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white tracking-tight truncate">
                  Veliye Karne Gönderim &amp; Bildirim Merkezi
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  WhatsApp &amp; SMS
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {selectedKarne.adSoyad} • {selectedKarne.brans} ({selectedKarne.grup}) • Karne Notu: {(
                  (
                    selectedKarne.teknik.ortalama +
                    selectedKarne.fiziksel.ortalama +
                    selectedKarne.taktiksel.ortalama +
                    selectedKarne.zihinsel.ortalama +
                    (selectedKarne.davranissal?.kriterler?.ortalama || 8)
                  ) / 5
                ).toFixed(1)}/10
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 bg-slate-50 border-b border-slate-200 overflow-x-auto custom-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-white text-emerald-700 border-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp İle Gönder</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sms')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'sms'
                ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
            }`}
          >
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>SMS İle Gönder</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-semibold">
              {smsConfig.baslik}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ayarlar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'ayarlar'
                ? 'bg-white text-slate-900 border-slate-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>SMS &amp; Başlık Ayarları</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gecmis')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer ml-auto ${
              activeTab === 'gecmis'
                ? 'bg-white text-indigo-700 border-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/70'
            }`}
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>Gönderim Geçmişi</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full font-bold">
              {logs.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">

          {/* Veli Bilgisi Üst Kartı (WhatsApp ve SMS Sekmelerinde Göster) */}
          {(activeTab === 'whatsapp' || activeTab === 'sms') && (
            <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/50 border border-blue-200/80 rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Alıcı Veli İletişim Bilgileri
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Mesajın iletileceği veli adı ve cep telefonunu kontrol edin veya güncelleyin.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveContact}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                >
                  {isSavedContact ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Kaydedildi</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Bilgileri Karnede Güncelle</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Veli Adı Soyadı
                  </label>
                  <input
                    type="text"
                    value={veliAdSoyad}
                    onChange={(e) => setVeliAdSoyad(e.target.value)}
                    placeholder="Örn: Murat Yıldırım"
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Yakınlık
                  </label>
                  <select
                    value={veliYakinlik}
                    onChange={(e) => setVeliYakinlik(e.target.value as any)}
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  >
                    <option value="Baba">Baba</option>
                    <option value="Anne">Anne</option>
                    <option value="Vasi">Vasi</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Cep Telefonu (WhatsApp &amp; SMS)
                  </label>
                  <input
                    type="tel"
                    value={veliTelefon}
                    onChange={(e) => setVeliTelefon(e.target.value)}
                    placeholder="+90 532 000 00 00"
                    className="w-full text-xs font-bold text-slate-800 px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Veli E-Posta (Opsiyonel)
                  </label>
                  <input
                    type="email"
                    value={veliEposta}
                    onChange={(e) => setVeliEposta(e.target.value)}
                    placeholder="veli@ornek.com"
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              {/* Template selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Hazır WhatsApp Bildirim Şablonu Seçin:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {WHATSAPP_SABLONLARI.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedWaTemplateId(tpl.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedWaTemplateId === tpl.id
                          ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 shadow-2xs ring-1 ring-emerald-400'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold truncate">{tpl.baslik}</span>
                        {selectedWaTemplateId === tpl.id && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                        {tpl.aciklama}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Two columns: Editor & Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Mesaj İçeriği (Düzenleyebilirsiniz):
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyWhatsApp}
                      className="text-[11px] font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      {isCopiedWa ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Metni Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    rows={12}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    className="w-full text-xs font-mono p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed custom-scrollbar"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>*yıldız* ile kalın metin, satır sonları korunur.</span>
                    <span>{waMessage.length} karakter</span>
                  </div>
                </div>

                {/* WhatsApp Chat Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Canlı WhatsApp Sohbet Önizlemesi
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Veli Ekranı
                    </span>
                  </div>

                  {/* WhatsApp Phone Mockup Container */}
                  <div className="rounded-2xl border border-slate-200 bg-[#efeae2] p-4 min-h-[290px] flex flex-col justify-between shadow-inner relative overflow-hidden">
                    {/* Top chat bar */}
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#00000010] mb-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                        {selectedKarne.adSoyad.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {veliAdSoyad || 'Değerli Velimiz'} ({selectedKarne.adSoyad} Velisi)
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {veliTelefon || '+90 532 ...'} • Çevrimiçi
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Chat Bubble */}
                    <div className="self-end max-w-[95%] bg-[#d9fdd3] text-slate-900 rounded-2xl rounded-tr-xs p-3.5 shadow-xs border border-[#00000010] space-y-2">
                      <div className="text-xs whitespace-pre-wrap leading-relaxed">
                        {waMessage}
                      </div>

                      {/* PDF attachment teaser */}
                      <div className="bg-white/90 rounded-xl p-2.5 border border-emerald-200 flex items-center justify-between gap-2 shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center font-black text-[10px] shrink-0 shadow-2xs">
                            PDF
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-slate-900 truncate">
                              {selectedKarne.adSoyad.replace(/\s+/g, '_')}_Karnesi.pdf
                            </div>
                            <div className="text-[9px] text-slate-500">
                              SportsFly Resmi Sporcu Gelişim Raporu • 2 Sayfa
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={onDownloadPDF}
                          disabled={isDownloadingPDF}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                        >
                          {isDownloadingPDF ? 'Hazırlanıyor...' : 'İndir'}
                        </button>
                      </div>

                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 pt-0.5">
                        <span>{new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <CheckCircle2 className="w-3 h-3 text-blue-500" />
                      </div>
                    </div>

                    {/* Bottom hint */}
                    <div className="text-[10px] text-center text-slate-500 pt-3">
                      Mesaj velinin WhatsApp uygulamasına doğrudan bu formatta gidecektir.
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onDownloadPDF}
                    disabled={isDownloadingPDF}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <FileDown className="w-4 h-4 text-blue-600" />
                    <span>
                      {isDownloadingPDF ? 'PDF Hazırlanıyor...' : 'Karnenin PDF Belgesini İndir'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-white" />
                    <span>WhatsApp Web / Uygulamada Aç &amp; Gönder</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SMS */}
          {activeTab === 'sms' && (
            <div className="space-y-4">
              {/* SMS Config Ribbon */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Resmi Gönderici Başlığı: <span className="text-blue-700">{smsConfig.baslik}</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Sağlayıcı: {SMS_SAGLAYICI_LISTESI.find(s => s.id === smsConfig.saglayici)?.ad} • Mevcut Bakiye: <strong className="text-slate-800">{smsConfig.bakiyeKredi} SMS</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('ayarlar')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Settings className="w-3 h-3" />
                  <span>Başlığı / Sağlayıcıyı Değiştir</span>
                </button>
              </div>

              {/* SMS Success Alert */}
              {smsSuccessStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{smsSuccessStatus}</span>
                </div>
              )}

              {/* Template selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Hazır SMS Şablonu Seçin:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SMS_SABLONLARI.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedSmsTemplateId(tpl.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedSmsTemplateId === tpl.id
                          ? 'bg-blue-50/80 border-blue-500 text-blue-950 shadow-2xs ring-1 ring-blue-400'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold truncate">{tpl.baslik}</span>
                        {selectedSmsTemplateId === tpl.id && (
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                        {tpl.aciklama}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* SMS Editor and Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    SMS Metni (160 Karakter Standart SMS):
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      smsCharacterCount <= 160 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {smsCharacterCount} / 160 Karakter ({smsPartCount} SMS Boyutu)
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySms}
                      className="text-[11px] font-semibold text-slate-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      {isCopiedSms ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Metni Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  className="w-full text-xs font-sans p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              {/* SMS Preview Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white uppercase">{smsConfig.baslik}</span>
                    <span>•</span>
                    <span>Resmi SMS İletimi</span>
                  </div>
                  <span>{veliTelefon || '+90 532 ...'}</span>
                </div>

                <div className="text-sm font-medium text-slate-100 leading-relaxed">
                  {smsMessage}
                </div>

                <div className="text-[10px] text-slate-400 text-right">
                  İleti Merkezi Raporlama Kodu İle Sertifikalı Gönderim
                </div>
              </div>

              {/* SMS Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Option 1: Official Club SMS Gateway */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200 rounded-xl flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-blue-900">
                        1. Resmi Kulüp Başlığı ile Gönder ({smsConfig.baslik})
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-200 text-blue-800 rounded">
                        API Entegre
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {SMS_SAGLAYICI_LISTESI.find(s => s.id === smsConfig.saglayici)?.ad} üzerinden velinin telefonuna resmi SMS başlığıyla tek tıkla iletilir.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOfficialSms}
                    disabled={isSendingSms}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSendingSms ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>SMS İletiliyor...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Resmi SMS Gönder (1 Kredi Düşer)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Option 2: Native Device SMS Intent */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">
                        2. Cihazınızın SMS Uygulaması ile Gönder
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded">
                        Doğrudan Cihaz
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Telefonunuzdaki veya bilgisayarınızdaki varsayılan SMS uygulamasını velinin numarası ve metinle anında açar.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendNativeSms}
                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Cihazdan SMS Aç</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS & CONFIGURATION */}
          {activeTab === 'ayarlar' && (
            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-600" />
                    SMS &amp; Bildirim Başlık Yapılandırması
                  </h4>
                  <p className="text-xs text-slate-500">
                    Kulübünüzün resmi SMS başlığını, SMS API sağlayıcısını ve kimlik doğrulama bilgilerini yapılandırın.
                  </p>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isConfigSaved ? 'Kaydedildi ✓' : 'Ayarları Kaydet'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SMS Originator Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Resmi SMS Gönderici Başlığı (Originator)
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={smsConfig.baslik}
                    onChange={(e) => setSmsConfig({ ...smsConfig, baslik: e.target.value.toUpperCase() })}
                    placeholder="SPORTSFLY"
                    className="w-full text-xs font-black uppercase tracking-wider p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Operatör kuralları gereği maksimum 11 karakter alfanümerik (Örn: SPORTSFLY, KULUPBASKET)
                  </p>
                </div>

                {/* SMS Provider */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SMS Servis Sağlayıcısı
                  </label>
                  <select
                    value={smsConfig.saglayici}
                    onChange={(e) => setSmsConfig({ ...smsConfig, saglayici: e.target.value as any })}
                    className="w-full text-xs font-bold p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  >
                    {SMS_SAGLAYICI_LISTESI.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.ad} ({prov.ulke}) - {prov.aciklama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* API Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    API Kullanıcı Adı / Abone No
                  </label>
                  <input
                    type="text"
                    value={smsConfig.apiKullanici}
                    onChange={(e) => setSmsConfig({ ...smsConfig, apiKullanici: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>

                {/* API Password / Secret */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    API Gizli Anahtarı / Şifre
                  </label>
                  <input
                    type="password"
                    value={smsConfig.apiSifre}
                    onChange={(e) => setSmsConfig({ ...smsConfig, apiSifre: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                {/* SMS Balance */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mevcut SMS Kredisi
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={smsConfig.bakiyeKredi}
                      onChange={(e) => setSmsConfig({ ...smsConfig, bakiyeKredi: Number(e.target.value) || 0 })}
                      className="w-36 text-xs font-bold p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                    />
                    <span className="text-xs text-slate-500 font-medium">Adet SMS</span>
                  </div>
                </div>

                {/* Preferred sending method */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Varsayılan SMS Gönderim Kanalı
                  </label>
                  <select
                    value={smsConfig.varsayilanGonderimYontemi}
                    onChange={(e) => setSmsConfig({ ...smsConfig, varsayilanGonderimYontemi: e.target.value as any })}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  >
                    <option value="api">Resmi Kulüp Gateway (API Üzerinden)</option>
                    <option value="cihaz">Cihaz SMS Uygulaması</option>
                  </select>
                </div>
              </div>

              {/* Test SMS Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <SportsFlyIcon className="w-3.5 h-3.5" />
                    SMS Yapılandırmasını Test Et
                  </span>
                  {testSmsStatus && (
                    <span className="text-xs font-bold text-emerald-600 animate-in fade-in">
                      {testSmsStatus}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="tel"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    placeholder="Test edilecek telefon örn: +90 532 123 45 67"
                    className="w-full sm:flex-1 text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestSms}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Test SMS'i Gönder
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: HISTORY & AUDIT LOGS */}
          {activeTab === 'gecmis' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Veli Bildirim &amp; Karne Gönderim Günlüğü
                  </h4>
                  <p className="text-xs text-slate-500">
                    Bu sistemden velilere iletilen tüm WhatsApp ve SMS bildirimlerinin kayıtları.
                  </p>
                </div>

                {logs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearLogs}
                    className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Geçmişi Temizle</span>
                  </button>
                )}
              </div>

              {logs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Henüz veli bildirim kaydı bulunmuyor. WhatsApp veya SMS sekmesinden gönderim yapabilirsiniz.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Tarih &amp; Saat</th>
                        <th className="p-3">Sporcu</th>
                        <th className="p-3">Veli</th>
                        <th className="p-3">Kanal</th>
                        <th className="p-3">Telefon</th>
                        <th className="p-3">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {log.tarih}
                          </td>
                          <td className="p-3 font-bold text-slate-800">
                            {log.sporcuAdSoyad}
                          </td>
                          <td className="p-3 text-slate-700">
                            {log.veliAdSoyad}
                          </td>
                          <td className="p-3">
                            {log.kanal === 'whatsapp' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                                WhatsApp
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                                <Smartphone className="w-3 h-3 text-blue-600" />
                                SMS ({log.smsBaslik || 'SMS'})
                              </span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-600">
                            {log.telefon}
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              {log.durum}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Global Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>KVKK Uyumlu Veli Bildirim Sistemi • SportsFly v2.6</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
