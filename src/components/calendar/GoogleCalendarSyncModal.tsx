import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  X,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  LogOut,
  ChevronRight,
  Sparkles,
  Layers,
  Trash2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { AntrenmanItem } from '../../types';
import {
  signInWithGoogleCalendar,
  disconnectGoogleCalendar,
  batchPushSessionsToGoogleCalendar,
  pushSessionToGoogleCalendar,
  deleteGoogleCalendarEvent,
  subscribeToCalendarAuth,
  getCurrentGoogleUser,
  getCachedAccessToken,
} from '../../services/googleCalendarService';

interface GoogleCalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  antrenmanlar: AntrenmanItem[];
  onUpdateAntrenmanlar: (updated: AntrenmanItem[]) => void;
  onToast: (msg: string) => void;
  selectedSessionToSync?: AntrenmanItem | null;
}

export const GoogleCalendarSyncModal: React.FC<GoogleCalendarSyncModalProps> = ({
  isOpen,
  onClose,
  antrenmanlar,
  onUpdateAntrenmanlar,
  onToast,
  selectedSessionToSync,
}) => {
  const [googleUser, setGoogleUser] = useState<User | null>(getCurrentGoogleUser());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number } | null>(null);

  // Sync Configuration
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'month' | 'week' | 'single'>(
    selectedSessionToSync ? 'single' : 'month'
  );
  const [selectedBranch, setSelectedBranch] = useState<string>('Tümü');
  const [reminderMinutes, setReminderMinutes] = useState<number>(30);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Confirmation state for deleting synced event
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState<{
    session: AntrenmanItem;
    eventId: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Listen to auth state
  useEffect(() => {
    const unsub = subscribeToCalendarAuth((user) => {
      setGoogleUser(user);
    });
    return () => unsub();
  }, []);

  // Filter sessions candidate for sync
  const eligibleSessions = React.useMemo(() => {
    if (selectedSessionToSync) {
      return [selectedSessionToSync];
    }

    return antrenmanlar.filter((item) => {
      if (item.status === 'İptal') return false;
      if (selectedBranch !== 'Tümü' && item.branch !== selectedBranch) return false;

      const itemDate = new Date(item.date);
      const now = new Date();

      if (dateRangeFilter === 'week') {
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        return itemDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1) && itemDate <= nextWeek;
      }

      if (dateRangeFilter === 'month') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      }

      return true;
    });
  }, [antrenmanlar, selectedSessionToSync, selectedBranch, dateRangeFilter]);

  // Set initial selected IDs
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(eligibleSessions.map((s) => s.id));
    }
  }, [isOpen, eligibleSessions.length, selectedBranch, dateRangeFilter]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsConnecting(true);
    try {
      const res = await signInWithGoogleCalendar();
      if (res?.user) {
        onToast(`Google hesabı (${res.user.email}) ile takvim yetkisi başarıyla bağlandı.`);
      }
    } catch (err: any) {
      console.error(err);
      onToast(`Google bağlantısı kurulamadı: ${err.message || 'Lütfen tekrar deneyin.'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('Google Takvim bağlantısını kesmek istediğinize emin misiniz?')) {
      await disconnectGoogleCalendar();
      onToast('Google Takvim bağlantısı sonlandırıldı.');
    }
  };

  const handleToggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === eligibleSessions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleSessions.map((s) => s.id));
    }
  };

  // Perform Batch or Single Sync
  const handleExecuteSync = async () => {
    const token = getCachedAccessToken();
    if (!token || !googleUser) {
      onToast('Lütfen önce Google ile oturum açın.');
      return;
    }

    const sessionsToSync = eligibleSessions.filter((s) => selectedIds.includes(s.id));
    if (sessionsToSync.length === 0) {
      onToast('Lütfen senkronize edilecek en az bir antrenman seçin.');
      return;
    }

    setIsSyncing(true);
    setSyncProgress({ current: 0, total: sessionsToSync.length });

    try {
      const result = await batchPushSessionsToGoogleCalendar(
        sessionsToSync,
        token,
        reminderMinutes
      );

      // Update local state with googleCalendarEventId and link
      const updatedAntrenmanlar = antrenmanlar.map((item) => {
        if (result.syncedSessionIds[item.id]) {
          const syncInfo = result.syncedSessionIds[item.id];
          return {
            ...item,
            googleCalendarEventId: syncInfo.eventId,
            googleCalendarLink: syncInfo.htmlLink,
          };
        }
        return item;
      });

      onUpdateAntrenmanlar(updatedAntrenmanlar);

      if (result.successful > 0) {
        onToast(
          `🎉 ${result.successful} antrenman seansı Google Takviminize anlık olarak aktarıldı!`
        );
      }
      if (result.failed > 0) {
        onToast(`⚠️ ${result.failed} antrenman aktarılamadı.`);
      }
    } catch (err: any) {
      console.error(err);
      onToast(`Senkronizasyon hatası: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  // Delete event from Google Calendar (Requires mandatory user confirmation dialog)
  const handleConfirmDeleteEvent = async () => {
    if (!deleteConfirmEvent) return;
    const { session, eventId } = deleteConfirmEvent;

    setIsDeleting(true);
    try {
      const token = getCachedAccessToken();
      const res = await deleteGoogleCalendarEvent(eventId, token || undefined);

      if (res.success) {
        const updated = antrenmanlar.map((a) =>
          a.id === session.id
            ? { ...a, googleCalendarEventId: undefined, googleCalendarLink: undefined }
            : a
        );
        onUpdateAntrenmanlar(updated);
        onToast(`"${session.title}" etkinliği Google Takvimden kaldırıldı.`);
      } else {
        onToast(`Etkinlik silinemedi: ${res.error}`);
      }
    } catch (err: any) {
      onToast(`Hata: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmEvent(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-2xs">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Google Takvim Entegrasyonu</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/30 text-blue-300 border border-blue-400/30">
                  Canlı Senkronizasyon
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Antrenman ve maç takviminizi Google Takvim hesabınızla çift yönlü senkronize edin.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Auth Status Card */}
          <div className="p-4 rounded-2xl border transition-all bg-slate-50 border-slate-200">
            {!googleUser ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                    <h4 className="text-xs font-bold text-slate-900">Google Hesabı Bağlı Değil</h4>
                  </div>
                  <p className="text-xs text-slate-500 max-w-md">
                    Antrenman seanslarınızı kişisel veya kulüp Google Takviminize aktarmak için Google hesabınızla oturum açın.
                  </p>
                </div>

                {/* Official Material Google Sign-in Button */}
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isConnecting}
                  className="inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isConnecting ? 'Bağlanıyor...' : 'Google ile Bağlan'}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt={googleUser.displayName || 'Google User'}
                      className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover shadow-2xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center font-bold text-sm">
                      {googleUser.displayName?.[0] || googleUser.email?.[0] || 'G'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {googleUser.displayName || 'Google Takvim Bağlı'}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Aktif
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{googleUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>Google Takvim'i Aç</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                    title="Bağlantıyı Kes"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sync Configuration Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Senkronizasyon Parametreleri</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Seçili: <strong>{selectedIds.length}</strong> / {eligibleSessions.length} seans
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Tarih Aralığı
                </label>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="month">Bu Ayın Antrenmanları</option>
                  <option value="week">Önümüzdeki 7 Gün (Bu Hafta)</option>
                  <option value="all">Tüm Gelecek Seanslar</option>
                  {selectedSessionToSync && (
                    <option value="single">Yalnızca Seçili Seans ({selectedSessionToSync.title})</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Branş Filtresi
                </label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Tümü">Tüm Branşlar</option>
                  <option value="Basketbol">Basketbol</option>
                  <option value="Yüzme">Yüzme</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Pilates">Pilates</option>
                  <option value="Tenis">Tenis</option>
                  <option value="Futbol">Futbol</option>
                  <option value="Voleybol">Voleybol</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Takvim Hatırlatıcı Bildirimi
                </label>
                <select
                  value={reminderMinutes}
                  onChange={(e) => setReminderMinutes(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value={15}>15 dakika önce</option>
                  <option value={30}>30 dakika önce (Önerilen)</option>
                  <option value={60}>1 saat önce</option>
                  <option value={120}>2 saat önce</option>
                  <option value={1440}>1 gün önce</option>
                </select>
              </div>
            </div>

            {/* List of Sessions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Aktarılacak Antrenman Seansları</span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-blue-600 hover:text-blue-700 font-bold hover:underline cursor-pointer"
                >
                  {selectedIds.length === eligibleSessions.length ? 'Seçimi Temizle' : 'Tümünü Seç'}
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                {eligibleSessions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Seçilen kriterlere uygun antrenman bulunamadı.
                  </div>
                ) : (
                  eligibleSessions.map((session) => {
                    const isSelected = selectedIds.includes(session.id);
                    const isAlreadySynced = !!session.googleCalendarEventId;

                    return (
                      <div
                        key={session.id}
                        className={`p-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectId(session.id)}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                          />
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {session.title}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                {session.branch}
                              </span>
                              {isAlreadySynced && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                  Takvimde Mevcut
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {session.date} | {session.startTime} - {session.endTime}
                              </span>
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {session.facilityName}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isAlreadySynced && (
                          <div className="flex items-center gap-1 shrink-0">
                            {session.googleCalendarLink && (
                              <a
                                href={session.googleCalendarLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Google Takvimde Gör"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirmEvent({
                                  session,
                                  eventId: session.googleCalendarEventId!,
                                })
                              }
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Google Takvimden Kaldır"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Google Calendar API v3 ile güvenli veri iletişimi sağlanır.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Kapat
            </button>

            <button
              type="button"
              onClick={handleExecuteSync}
              disabled={!googleUser || isSyncing || selectedIds.length === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? `Aktarılıyor (${syncProgress?.current || 0}/${syncProgress?.total || selectedIds.length})...`
                  : `Google Takvim'e Aktar (${selectedIds.length})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Explicit User Confirmation Modal for Destructive Delete (Mandated by Workspace Skill) */}
      {deleteConfirmEvent && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center z-60 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Google Takvimden Silinsin mi?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>"{deleteConfirmEvent.session.title}"</strong> ({deleteConfirmEvent.session.date}) etkinliği kişisel Google Takvim hesabınızdan kalıcı olarak silinecektir.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmEvent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteEvent}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Siliniyor...' : 'Evet, Takvimden Sil'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
