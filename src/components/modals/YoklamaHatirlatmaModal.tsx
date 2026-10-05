import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  X,
  Send,
  Users,
  Smartphone,
  MessageSquare,
  CheckCircle2,
  Clock,
  Settings,
  History,
  Sparkles,
  ShieldAlert,
  Bot,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';
import { GrupItem } from '../../types';
import {
  executeYoklamaReminderTrigger,
  getAutomationConfig,
  saveAutomationConfig,
  getReminderLogs,
  ReminderRecipient,
  AutomationRuleConfig,
  ReminderLogItem,
} from '../../services/yoklamaHatirlaticiService';

interface YoklamaHatirlatmaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroup: GrupItem | null;
  attendanceDate: string;
  attendanceState: Record<string, 'present' | 'absent' | 'excused' | null>;
}

export const YoklamaHatirlatmaModal: React.FC<YoklamaHatirlatmaModalProps> = ({
  isOpen,
  onClose,
  selectedGroup,
  attendanceDate,
  attendanceState,
}) => {
  const [activeTab, setActiveTab] = useState<'instant' | 'automation' | 'history'>('instant');
  const [targetAudience, setTargetAudience] = useState<'parent' | 'trainer' | 'both'>('parent');

  // Channels
  const [channels, setChannels] = useState({
    appNotification: true,
    sms: true,
    whatsapp: true,
    pushNotification: true,
  });

  // Message template
  const [customMessage, setCustomMessage] = useState<string>('');

  // Selected athletes for instant trigger
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Automation config
  const [automationConfig, setAutomationConfig] = useState<AutomationRuleConfig>(() => getAutomationConfig());

  // Trigger logs
  const [logs, setLogs] = useState<ReminderLogItem[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Filter missing/absent members
  const unsubmittedOrAbsentMembers = React.useMemo(() => {
    if (!selectedGroup || !selectedGroup.members) return [];
    return selectedGroup.members.filter((m) => {
      const st = attendanceState[m.id];
      return st === 'absent' || st === null || st === undefined;
    });
  }, [selectedGroup, attendanceState]);

  // Sync selected members whenever modal opens or group changes
  useEffect(() => {
    if (isOpen) {
      const allMissingIds = unsubmittedOrAbsentMembers.map((m) => m.id);
      setSelectedMemberIds(allMissingIds);
      setLogs(getReminderLogs());
      setAutomationConfig(getAutomationConfig());
    }
  }, [isOpen, unsubmittedOrAbsentMembers]);

  // Update default custom message
  useEffect(() => {
    if (selectedGroup) {
      setCustomMessage(
        `Sayın Veli, sporcumuz {sporcu_adi} bugün (${attendanceDate}) ${selectedGroup.name} antrenmanına henüz yoklama girişi yapmamıştır. Lütfen SportsFly uygulamasından veya antrenörümüzle iletişime geçiniz.`
      );
    }
  }, [selectedGroup, attendanceDate]);

  if (!isOpen || !selectedGroup) return null;

  const toggleSelectMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMemberIds.length === unsubmittedOrAbsentMembers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(unsubmittedOrAbsentMembers.map((m) => m.id));
    }
  };

  const handleSendReminder = () => {
    if (selectedMemberIds.length === 0) return;
    setIsSending(true);

    const recipientsPayload: ReminderRecipient[] = unsubmittedOrAbsentMembers
      .filter((m) => selectedMemberIds.includes(m.id))
      .map((m) => ({
        memberId: m.id,
        athleteName: m.name,
        parentName: `Veli (${m.name.split(' ')[0]})`,
        parentPhone: m.phone || '05300000000',
        trainerName: selectedGroup.instructorName,
        groupName: selectedGroup.name,
        status: (attendanceState[m.id] as any) || 'unmarked',
      }));

    setTimeout(() => {
      const createdLog = executeYoklamaReminderTrigger({
        groupName: selectedGroup.name,
        trainingDate: attendanceDate,
        recipients: recipientsPayload,
        targetAudience,
        channels,
        customMessage,
        triggeredBy: 'Manuel Antrenör/Yönetici Tetikleyicisi',
      });

      setIsSending(false);
      setLogs(getReminderLogs());
      setSuccessBanner(
        `Hatırlatma bildirimi ${recipientsPayload.length} sporcu velisine/eğitmenine başarıyla iletildi!`
      );
      setTimeout(() => setSuccessBanner(null), 4000);
    }, 800);
  };

  const handleSaveAutomationConfig = (updated: AutomationRuleConfig) => {
    setAutomationConfig(updated);
    saveAutomationConfig(updated);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] my-auto animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <BellRing className="w-5 h-5 animate-pulse text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                <span>Yoklama Hatırlatma & Tetikleyici Mantığı</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
                  Otomatik Kural
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {selectedGroup.name} • Yoklama Girişi Yapmayan Sporculara Hatırlatma
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 pt-2 gap-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('instant')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 ${
              activeTab === 'instant'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span> Anlık Hatırlatma Gönder ({unsubmittedOrAbsentMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('automation')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 ${
              activeTab === 'automation'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>🤖 Otomatik Tetikleme Kuralları</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>📋 Tetikleme Logları ({logs.length})</span>
          </button>
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div className="bg-emerald-500 text-white px-4 py-2.5 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'instant' && (
            <div className="space-y-6">
              {/* Target Recipient Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  1. Alıcı Hedef Kitleyi Seçin
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTargetAudience('parent')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      targetAudience === 'parent'
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>Sadece Veliler</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Sporcunun velilerine bildirim iletilir
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience('trainer')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      targetAudience === 'trainer'
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Bot className="w-4 h-4 text-indigo-500" />
                      <span>Sadece Eğitmenler</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Sorumlu antrenör ve yöneticilere bildirim düşer
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetAudience('both')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      targetAudience === 'both'
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <BellRing className="w-4 h-4 text-amber-500" />
                      <span>Her İkisine De (Veli & Eğitmen)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Aynı anda tüm taraflara eş zamanlı gönderir
                    </p>
                  </button>
                </div>
              </div>

              {/* Delivery Channels */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  2. İletim Kanalları
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.appNotification}
                      onChange={(e) => setChannels({ ...channels, appNotification: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">📱 Uygulama İçi</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.pushNotification}
                      onChange={(e) => setChannels({ ...channels, pushNotification: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">🔔 Mobil Push</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.sms}
                      onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">✉️ SMS Bildirimi</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channels.whatsapp}
                      onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">💬 WhatsApp</span>
                  </label>
                </div>
              </div>

              {/* Athlete Selection List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    3. Bildirim Gönderilecek Yoklama Yapmamış / Gelmemiş Sporcular ({unsubmittedOrAbsentMembers.length})
                  </label>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {selectedMemberIds.length === unsubmittedOrAbsentMembers.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                  </button>
                </div>

                {unsubmittedOrAbsentMembers.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800/50">
                    {unsubmittedOrAbsentMembers.map((m) => {
                      const isChecked = selectedMemberIds.includes(m.id);
                      const status = attendanceState[m.id];

                      return (
                        <label
                          key={m.id}
                          className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                            isChecked ? 'bg-blue-50/60 dark:bg-blue-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectMember(m.id)}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{m.name}</div>
                              <div className="text-[10px] text-slate-500">
                                Veli Tel: {m.phone || '05300000000'} • #{m.code}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              status === 'absent'
                                ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {status === 'absent' ? 'Gelmedi İşaretlendi' : 'Henüz Giriş Yapmadı'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed border-emerald-300 bg-emerald-50/50 rounded-xl text-emerald-800">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="font-bold text-xs">Harika! Tüm sporcular yoklamaya giriş yapmış görünüyor.</p>
                  </div>
                )}
              </div>

              {/* Message Customizer */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  4. Bildirim Mesajı Şablonu
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Otomatik değişkenler: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600 font-mono">&#123;sporcu_adi&#125;</code> otomatik olarak ilgili alıcının ismi ile yer değiştirir.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 flex items-start gap-3">
                <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-indigo-900 dark:text-indigo-200">
                    Akıllı Yoklama Hatırlatma Motoru
                  </h4>
                  <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-0.5 leading-relaxed">
                    Aşağıdaki tetikleyici kuralları aktif ettiğinizde, sistem arka planda antrenman başlangıç saatlerini ve yoklama kaydetme işlemlerini otomatik denetler ve aksayan durumlarda müdahale eder.
                  </p>
                </div>
              </div>

              {/* Rule 1 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Zaman Bazlı Otomatik Hatırlatma</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Antrenman saatinden {automationConfig.autoSendAfterStartMinutes} dakika geçmesine rağmen giriş yapmayan sporcuların velilerine otomatik bildirim iletir.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleSaveAutomationConfig({
                      ...automationConfig,
                      autoSendAfterStartEnabled: !automationConfig.autoSendAfterStartEnabled,
                    })
                  }
                  className="shrink-0 text-blue-600 dark:text-blue-400"
                >
                  {automationConfig.autoSendAfterStartEnabled ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Rule 2 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>Yoklama Kaydedildiğinde 'Gelmedi' Olan Velilere Otomatik Bildirim</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Antrenör 'Yoklamayı Kaydet' butonuna bastığı an, 'Gelmedi' işaretlenen sporcu velilerine anında bilgi mesajı düşer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleSaveAutomationConfig({
                      ...automationConfig,
                      autoSendOnSave: !automationConfig.autoSendOnSave,
                    })
                  }
                  className="shrink-0 text-blue-600 dark:text-blue-400"
                >
                  {automationConfig.autoSendOnSave ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Rule 3 */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>Eğitmene Yoklama Unutma Uyarısı</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Antrenman saati bittiğinde grup yoklaması girilmemişse, grubun sorumlu antrenörüne acil hatırlatıcı Push bildirimi atar.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleSaveAutomationConfig({
                      ...automationConfig,
                      trainerAlertOnMissingAttendance: !automationConfig.trainerAlertOnMissingAttendance,
                    })
                  }
                  className="shrink-0 text-blue-600 dark:text-blue-400"
                >
                  {automationConfig.trainerAlertOnMissingAttendance ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Son Gönderilen Hatırlatma İletileri & Log Kayıtları
              </div>

              {logs.length > 0 ? (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                          {log.groupName}
                        </span>
                        <span className="text-[10px] text-slate-400">({log.timestamp})</span>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {log.totalRecipientCount} Kişiye İletildi
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2">
                      "{log.messagePreview}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span>Tetikleyen: {log.triggeredBy}</span>
                      <div className="flex items-center gap-1">
                        {log.channels.map((c, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-200 font-mono">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Henüz kayıtlı hatırlatma logu bulunmuyor.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {activeTab === 'instant' && (
              <span>Seçili Sporcu Sayısı: <strong className="text-slate-800 dark:text-slate-200">{selectedMemberIds.length}</strong></span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
            >
              Kapat
            </button>

            {activeTab === 'instant' && (
              <button
                type="button"
                onClick={handleSendReminder}
                disabled={isSending || selectedMemberIds.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Hatırlatma Bildirimi Gönder</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
