import React, { useState, useEffect } from 'react';
import {
  Mail,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Save,
  Key,
  Globe,
  Sliders,
  Eye,
  EyeOff,
  Clock,
  Terminal,
  FileText,
  Sparkles,
  Lock,
  Layers,
  Check,
  X,
  ExternalLink,
  Laptop,
  Smartphone,
  Info,
} from 'lucide-react';
import {
  SmtpConfig,
  EmailLogEntry,
  PROVIDER_PRESETS,
  DEFAULT_SMTP_CONFIG,
  getStoredSmtpConfig,
  saveSmtpConfig,
  fetchSmtpConfigFromFirestore,
  sendTestEmail,
  getStoredEmailLogs,
} from '../../services/emailConfigService';

export const EpostaServisYapilandirmasiView: React.FC = () => {
  const [config, setConfig] = useState<SmtpConfig>(getStoredSmtpConfig);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'smtp' | 'templates' | 'test' | 'logs'>('smtp');
  const [templatePreview, setTemplatePreview] = useState<'verification' | 'approval' | 'welcome'>('verification');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Test state
  const [testEmailInput, setTestEmailInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Logs state
  const [logs, setLogs] = useState<EmailLogEntry[]>(getStoredEmailLogs);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    fetchSmtpConfigFromFirestore().then((fetched) => {
      setConfig(fetched);
    });
    setLogs(getStoredEmailLogs());
  }, []);

  const handlePresetSelect = (presetKey: SmtpConfig['providerPreset']) => {
    const preset = PROVIDER_PRESETS[presetKey];
    if (!preset) return;

    setConfig((prev) => ({
      ...prev,
      providerPreset: presetKey,
      host: preset.host,
      port: preset.port,
      secure: preset.secure,
      fromEmail: preset.defaultFrom,
      user: preset.defaultFrom,
    }));
    showToast(`"${preset.name}" hazır şablonu uygulandı.`, 'info');
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await saveSmtpConfig(config);
      showToast('E-posta servis yapılandırması Firestore ve sunucuya başarıyla kaydedildi.', 'success');
    } catch (err: any) {
      showToast(`Kaydetme hatası: ${err?.message || err}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunTest = async () => {
    if (!testEmailInput || !testEmailInput.includes('@')) {
      showToast('Lütfen geçerli bir test e-posta adresi giriniz.', 'error');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    setTestLogs([`[${new Date().toLocaleTimeString()}] Test isteği başlatıldı -> ${testEmailInput}`]);

    try {
      const res = await sendTestEmail(testEmailInput, config);
      if (res.transportLogs) {
        setTestLogs(res.transportLogs);
      }
      setTestResult({
        success: res.success,
        message: res.message,
      });
      setLogs(getStoredEmailLogs());
      if (res.success) {
        if (res.isSandbox) {
          showToast('Sandbox simülasyonu başarılı! (Gerçek e-posta gönderilmedi)', 'info');
        } else {
          showToast('Test e-postası başarıyla gönderildi.', 'success');
        }
      } else {
        showToast(res.message || 'Test gönderimi başarısız oldu.', 'error');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Hata: ${err?.message || err}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const activePreset = PROVIDER_PRESETS[config.providerPreset] || PROVIDER_PRESETS.custom;

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 text-xs font-bold ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300'
              : 'bg-blue-50 text-blue-900 border-blue-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                SportsFly Kurumsal E-Posta &amp; SMTP Motoru
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                  config.sandboxMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                {config.sandboxMode ? 'Sandbox Simülasyonu Aktif' : 'Canlı SMTP İletimi Aktif'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              E-Posta Servis Yapılandırması (SMTP &amp; Nodemailer)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Kullanıcı kayıt onayları, 2FA güvenlik doğrulama kodları ve kurumsal bildirimler için{' '}
              <strong className="text-white font-bold">SportsFly</strong> markalı SMTP sunucu ayarları,
              canlı bağlantı testi ve şablon yönetimi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('test')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/15 cursor-pointer"
            >
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Hızlı Test Gönderimi</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-extrabold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Ayarları Kaydet</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Aktif SMTP Sunucusu
            </span>
            <span className="text-sm font-black text-white mt-1 block truncate">
              {config.host}
            </span>
            <span className="text-[10px] text-blue-300 font-semibold">
              Port {config.port} • {config.secure ? 'SSL/TLS (465)' : 'STARTTLS (587)'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Gönderici Kimliği
            </span>
            <span className="text-sm font-black text-emerald-300 mt-1 block truncate">
              {config.fromName}
            </span>
            <span className="text-[10px] text-slate-300 font-semibold truncate block">
              {config.fromEmail}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Sağlayıcı Şablonu
            </span>
            <span className="text-sm font-black text-cyan-300 mt-1 block truncate">
              {activePreset.name}
            </span>
            <span className="text-[10px] text-slate-300 font-semibold">
              Nodemailer ESMTP Client v6.9
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Toplam Gönderilen İletiler
            </span>
            <span className="text-sm font-black text-purple-300 mt-1 block">
              {logs.length} E-Posta
            </span>
            <span className="text-[10px] text-slate-300 font-semibold">
              Kayıt &amp; 2FA Doğrulamaları
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'smtp', label: '1. SMTP Sunucu & Kimlik Bilgileri', icon: Server },
          { id: 'templates', label: '2. SportsFly E-Posta Şablon Önizleme', icon: Eye },
          { id: 'test', label: '3. Canlı Test Gönderim Aracı', icon: Send },
          { id: 'logs', label: `4. Gönderim Logları (${logs.length})`, icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 rounded-t-xl'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SMTP CONFIG FORM */}
      {activeTab === 'smtp' && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Quick Preset Selector Cards */}
          <div className="bg-white dark:bg-[#111c2e] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Hazır E-Posta Servis Sağlayıcı Şablonları
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kullandığınız e-posta altyapısını seçerek SMTP ayarlarını tek tıkla otomatik doldurun.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.keys(PROVIDER_PRESETS) as SmtpConfig['providerPreset'][]).map((key) => {
                const item = PROVIDER_PRESETS[key];
                const isSelected = config.providerPreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePresetSelect(key)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {item.guide}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400">
                      <span>{item.host}</span>
                      <span>Port {item.port}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed SMTP Connection Parameters */}
          <div className="bg-white dark:bg-[#111c2e] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              SMTP Sunucu ve Kimlik Doğrulama Bilgileri
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Host */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  SMTP Sunucu Adresi (Host) *
                </label>
                <input
                  type="text"
                  required
                  value={config.host}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  placeholder="mail.sportsfly.com.tr"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Port */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  SMTP Port *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    value={config.port}
                    onChange={(e) => setConfig({ ...config, port: Number(e.target.value) || 587 })}
                    placeholder="587"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-1">
                    {[587, 465, 25].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setConfig({ ...config, port: p, secure: p === 465 })}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border cursor-pointer ${
                          config.port === p
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Secure SSL/TLS */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Güvenlik Protokolü (SSL / TLS)
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.secure}
                      onChange={(e) => setConfig({ ...config, secure: e.target.checked })}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      SSL/TLS Aktif (Port 465 için zorunlu)
                    </span>
                  </label>
                </div>
              </div>

              {/* User */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  SMTP Kullanıcı Adı / E-Posta *
                </label>
                <input
                  type="text"
                  required
                  value={config.user}
                  onChange={(e) => setConfig({ ...config, user: e.target.value })}
                  placeholder="noreply@sportsfly.com.tr"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Pass */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  SMTP Şifresi / Uygulama Şifresi (App Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={config.pass}
                    onChange={(e) => setConfig({ ...config, pass: e.target.value })}
                    placeholder="••••••••••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* From Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Gönderici Adı (From Name) *
                </label>
                <input
                  type="text"
                  required
                  value={config.fromName}
                  onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
                  placeholder="SportsFly Doğrulama Servisi"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* From Email */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Gönderici E-Posta Adresi (From Email) *
                </label>
                <input
                  type="email"
                  required
                  value={config.fromEmail}
                  onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
                  placeholder="noreply@sportsfly.com.tr"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Reply-To */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Yanıt E-Postası (Reply-To)
                </label>
                <input
                  type="email"
                  value={config.replyTo || ''}
                  onChange={(e) => setConfig({ ...config, replyTo: e.target.value })}
                  placeholder="destek@sportsfly.com.tr"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Sandbox Toggle */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-3 pt-2">
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      Sandbox / Simülasyon Modu
                    </span>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      Eğer SMTP sunucu şifreniz henüz hazır değilse veya geliştirme ortamında gerçek kullanıcılara
                      e-posta gitmesini istemiyorsanız simülasyon modunu açık tutabilirsiniz. Kodlar yine de ekranda
                      ve loglarda eksiksiz üretilir.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={config.sandboxMode}
                      onChange={(e) => setConfig({ ...config, sandboxMode: e.target.checked })}
                      className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-100">
                      {config.sandboxMode ? 'Sandbox Açık' : 'Sandbox Kapalı (Canlı)'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-72">
                  <input
                    type="email"
                    value={testEmailInput}
                    onChange={(e) => setTestEmailInput(e.target.value)}
                    placeholder="Test için e-posta adresi girin..."
                    className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRunTest}
                  disabled={isTesting || !testEmailInput}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-sm cursor-pointer flex items-center gap-2 transition-all shrink-0"
                  title="Girilen adrese örnek bir doğrulama kodu içeren SMTP test e-postası gönderir"
                >
                  {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Send className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>Test E-postası Gönder</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Yapılandırmayı Kaydet ve Aktif Et</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: TEMPLATE PREVIEWS */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-[#111c2e] rounded-3xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Şablon Seçimi
              </h3>
              {[
                {
                  id: 'verification',
                  title: '1. Kayıt & Giriş Güvenlik Doğrulama Kodu (2FA)',
                  desc: '6 haneli tek kullanımlık kod ve 3 dakika geçerlilik uyarısı.',
                },
                {
                  id: 'approval',
                  title: '2. Spor Okulu Kurumsal Başvuru Onayı',
                  desc: 'Yönetici onaylandığında kulübe gönderilen erişim açılış bildirimi.',
                },
                {
                  id: 'welcome',
                  title: '3. SportsFly Kulüp Hoş Geldiniz İletisi',
                  desc: 'Panel linki, rehber ve kurumsal destek iletişim kanalları.',
                },
              ].map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setTemplatePreview(tpl.id as typeof templatePreview)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    templatePreview === tpl.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="text-xs font-bold">{tpl.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {tpl.desc}
                  </div>
                </button>
              ))}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Cihaz Görünümü:
                </span>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      previewDevice === 'desktop' ? 'bg-white dark:bg-slate-900 shadow-2xs text-blue-600' : 'text-slate-600'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Masaüstü</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      previewDevice === 'mobile' ? 'bg-white dark:bg-slate-900 shadow-2xs text-blue-600' : 'text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobil</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-950 dark:text-blue-200 space-y-1.5">
              <span className="font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Duyarlı &amp; Kurumsal HTML
              </span>
              <p className="text-[11px] leading-relaxed">
                Tüm e-postalar Gmail, Apple Mail, Outlook ve mobil istemcilerde kırılmadan,
                SportsFly marka kimliğiyle mükemmel bir biçimde görüntülenecek şekilde optimize edilmiştir.
              </p>
            </div>
          </div>

          {/* Email Preview Box */}
          <div className="lg:col-span-8 flex justify-center">
            <div
              className={`bg-slate-100 dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 transition-all ${
                previewDevice === 'mobile' ? 'max-w-[380px] w-full' : 'w-full'
              }`}
            >
              {/* Fake Email Client Header */}
              <div className="bg-white dark:bg-[#111c2e] rounded-t-2xl p-3 border-b border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-600 dark:text-slate-300 ml-2 truncate">
                    Kimden: {config.fromName} &lt;{config.fromEmail}&gt;
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold shrink-0">Şimdi</span>
              </div>

              {/* Template Render */}
              <div className="bg-white text-slate-900 p-6 rounded-b-2xl shadow-md space-y-6">
                {/* Header */}
                <div className="bg-slate-950 p-6 rounded-2xl text-center text-white">
                  <div className="text-2xl font-extrabold tracking-tight">
                    SportsFly <span className="text-cyan-400">LAB</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Spor Okulu &amp; Kulüp Yönetim Sistemi
                  </div>
                </div>

                {templatePreview === 'verification' && (
                  <div className="space-y-4 text-center">
                    <h4 className="text-base font-extrabold text-slate-900">
                      E-posta Giriş &amp; Kayıt Doğrulama Kodu
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                      Sayın Kullanıcımız, <strong>yonetici@sporokulu.com</strong> hesabınızla SportsFly sistemine güvenli giriş veya kayıt işlemini tamamlamak için aşağıdaki tek kullanımlık doğrulama kodunu kullanınız:
                    </p>

                    <div className="p-4 rounded-2xl bg-blue-50 border-2 border-dashed border-blue-300 max-w-xs mx-auto">
                      <div className="text-3xl font-black tracking-widest text-blue-700 font-sans tabular-nums">
                        482915
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-2">
                        ⏱️ Bu kod 3 dakika boyunca geçerlidir.
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 text-left pt-3 border-t border-slate-100 leading-relaxed">
                      • Bu kodu hesap güvenliğiniz için kimseyle paylaşmayınız.<br />
                      • Bu işlemi siz başlatmadıysanız lütfen bu e-postayı dikkate almayınız.
                    </div>
                  </div>
                )}

                {templatePreview === 'approval' && (
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Kurumsal Başvurunuz Onaylandı</span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900">
                      SportsFly Kurumsal Hesabınız Aktif Edildi!
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sayın <strong>Mehmet Yılmaz</strong>,<br />
                      <strong>Kadıköy Basketbol Akademi</strong> için oluşturduğunuz spor okulu başvurusu incelenmiş ve sistem yöneticilerimiz tarafından onaylanmıştır.
                    </p>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Kayıtlı E-Posta:</span>
                        <span className="font-bold text-slate-800">mehmet@kadikoybasketbol.com</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Paket:</span>
                        <span className="font-bold text-blue-600">Kulüp &amp; Akademi (Sınırsız Şube)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Giriş Adresi:</span>
                        <span className="font-bold text-slate-800">webapp.sportsfly.com.tr</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        className="w-full py-3 px-6 rounded-xl bg-blue-600 text-white font-bold text-xs text-center shadow-md cursor-pointer"
                      >
                        SportsFly Paneline Giriş Yap
                      </button>
                    </div>
                  </div>
                )}

                {templatePreview === 'welcome' && (
                  <div className="space-y-4">
                    <h4 className="text-base font-extrabold text-slate-900 text-center">
                      SportsFly Ailesine Hoş Geldiniz!
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Spor okulunuzun tüm yoklama, dijital sporcu karnesi, aidat muhasebesi ve branş yönetimini artık tek bir akıllı panelden yönetebilirsiniz.
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <div className="font-extrabold text-blue-600 text-sm">7/24</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Teknik Destek</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <div className="font-extrabold text-emerald-600 text-sm">%100</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">KVKK &amp; Veri Güvenliği</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
                  © {new Date().getFullYear()} SportsFly • webapp.sportsfly.com.tr<br />
                  Bu e-posta kurumsal spor okulu yönetim bildirimleri kapsamında iletilmiştir.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE TEST RUNNER */}
      {activeTab === 'test' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-[#111c2e] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
                Canlı Test E-Postası Gönder
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                SMTP ayarlarınızın doğruluğunu test etmek için girilen e-posta adresine SportsFly markalı,
                örnek bir güvenlik doğrulama kodu içeren test iletisi gönderin.
              </p>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Hedef Test E-Posta Adresi *
                </label>
                <input
                  type="email"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  placeholder="ornek@alanadiniz.com"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRunTest}
                  disabled={isTesting || !testEmailInput}
                  className="w-full py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 cursor-pointer flex items-center justify-center gap-2 transition-all"
                >
                  {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{isTesting ? 'SMTP Bağlantısı Test Ediliyor...' : 'Test E-postası Gönder'}</span>
                </button>
              </div>

              {testResult && (
                <div className="space-y-3">
                  <div
                    className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-rose-50 text-rose-900 border-rose-300'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>

                  {testResult.success && (config.sandboxMode || !config.pass) && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-2xl text-[11px] leading-relaxed space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Sandbox (Simülasyon) Modu veya Eksik Şifre</span>
                      </div>
                      <p className="font-medium text-slate-600 dark:text-slate-400">
                        Şu anda simülasyon modu aktif veya SMTP şifresi belirtilmemiş olduğu için e-posta <strong>gerçekten alıcıya gönderilmedi</strong>, sadece başarılı bir şekilde simüle edildi. Gerçek e-posta teslimatı sağlamak için:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-600 dark:text-slate-400 font-medium">
                        <li>SMTP Şifresi alanına geçerli şifrenizi veya uygulama şifrenizi girin.</li>
                        <li>"Sandbox / Simülasyon Modu" seçeneğini kapatın (Canlı).</li>
                        <li>Yapılandırmayı Kaydedin ve tekrar test edin.</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-slate-950 rounded-3xl p-5 text-slate-200 border border-slate-800 shadow-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="font-sans font-bold text-white text-xs">
                    SMTP Handshake &amp; Protokol Logları
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTestLogs([])}
                  className="text-[11px] font-sans font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Temizle
                </button>
              </div>

              <div className="min-h-[220px] max-h-[360px] overflow-y-auto space-y-1.5 text-[11px] leading-relaxed">
                {testLogs.length === 0 ? (
                  <div className="text-slate-500 italic py-10 text-center">
                    Henüz bir test çalıştırılmadı. Soldaki formdan hedef adres girip test başlatabilirsiniz.
                  </div>
                ) : (
                  testLogs.map((line, idx) => (
                    <div
                      key={idx}
                      className={
                        line.includes('başarılı') || line.includes('teslim')
                          ? 'text-emerald-400 font-semibold'
                          : line.includes('Hata') || line.includes('Hatası')
                          ? 'text-rose-400 font-bold'
                          : 'text-slate-300'
                      }
                    >
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EMAIL LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-[#111c2e] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                E-Posta Gönderim Geçmişi &amp; Raporlar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kullanıcı kayıtları, 2FA kodları ve test iletilerinin gönderim durumları.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('sportsfly_email_logs_v1');
                setLogs([]);
                showToast('Loglar temizlendi.', 'info');
              }}
              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Logları Temizle
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Henüz kaydedilmiş e-posta iletim kaydı bulunmamaktadır.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Tarih / Saat</th>
                    <th className="p-3">Alıcı (To)</th>
                    <th className="p-3">Konu</th>
                    <th className="p-3">Tür</th>
                    <th className="p-3">Durum</th>
                    <th className="p-3">Message-ID / Kod</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/30">
                      <td className="p-3 font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {log.to}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {log.subject}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {log.type === 'verification'
                            ? 'Doğrulama'
                            : log.type === 'approval'
                            ? 'Onay'
                            : log.type === 'test'
                            ? 'Test'
                            : 'Bildirim'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                            log.status === 'sent'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : log.status === 'simulated'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {log.status === 'sent'
                            ? '✓ İletildi'
                            : log.status === 'simulated'
                            ? '⚡ Simüle'
                            : '✕ Hata'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-500 truncate max-w-xs">
                        {log.messageId || '-'}
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
  );
};
