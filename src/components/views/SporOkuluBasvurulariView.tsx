import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Phone,
  Mail,
  User,
  Eye,
  RefreshCw,
  MapPin,
  Calendar,
  X,
  Check,
  Ban,
  BadgeAlert,
  Lock,
  Trash2,
} from 'lucide-react';
import { sendMutlucellSms } from '../../services/smsService';
import { getStoredUserProfile } from '../../data/userProfile';
import { isSuperAdminUser } from '../../data/packagePermissions';
import { fetchWithTimeout } from '../../utils/networkResilience';
import { basvurularService, FirestoreSporOkuluBasvurusuDoc } from '../../services/firestoreService';

export interface ClubRegistrationRequest {
  id: string;
  requestType?: 'spor_okulu_basvurusu' | 'demo_rezervasyonu';
  source?: string;
  clubName: string;
  managerName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  branches: string[];
  selectedPlan: string;
  athleteCount?: string;
  demoDate?: string;
  demoTime?: string;
  createdAt: string;
  status: 'onay_bekliyor' | 'onaylandi' | 'reddedildi' | 'askida';
  notes?: string;
  rejectionReason?: string;
  approvedAt?: string;
  smsSentAt?: string;
}

const LEGACY_TEST_IDS = new Set([
  'req_101',
  'req_102',
  'req_103',
  'req_104',
  'req_105',
  'demo_101',
  'demo_102',
  'demo_103',
]);

function filterOutTestItems(list: ClubRegistrationRequest[]): ClubRegistrationRequest[] {
  if (!Array.isArray(list)) return [];
  return list.filter((item) => item && item.id && !LEGACY_TEST_IDS.has(String(item.id)));
}

export const SporOkuluBasvurulariView: React.FC = () => {
  const [requests, setRequests] = useState<ClubRegistrationRequest[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('sportsfly_club_applications_v1');
        localStorage.removeItem('sportsfly_club_applications_v2');
        const stored = localStorage.getItem('sportsfly_club_applications_v3');
        if (stored) {
          const parsed = JSON.parse(stored);
          const cleaned = filterOutTestItems(parsed);
          localStorage.setItem('sportsfly_club_applications_v3', JSON.stringify(cleaned));
          return cleaned;
        }
      } catch (e) {}
    }
    return [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'tumu' | 'onay_bekliyor' | 'onaylandi' | 'reddedildi'
  >('tumu');
  const [selectedRequest, setSelectedRequest] = useState<ClubRegistrationRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const processingIdsRef = useRef<Set<string>>(new Set());

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage({ text, type });
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 4000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isRejectionModalOpen) {
          setIsRejectionModalOpen(false);
        } else if (isDetailModalOpen) {
          setIsDetailModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRejectionModalOpen, isDetailModalOpen]);

  const applyServerItems = useCallback((rawItems: any[]) => {
    if (!Array.isArray(rawItems)) return;
    const merged: ClubRegistrationRequest[] = filterOutTestItems(rawItems);
    try {
      const localRaw = localStorage.getItem('sportsfly_club_applications_v3');
      if (localRaw) {
        const localItems: ClubRegistrationRequest[] = filterOutTestItems(JSON.parse(localRaw));
        const serverIds = new Set(merged.map((m) => m.id));
        for (const loc of localItems) {
          if (loc && loc.id && !serverIds.has(loc.id)) {
            merged.unshift(loc);
          }
        }
      }
    } catch {}

    setRequests(merged);
    try {
      localStorage.setItem('sportsfly_club_applications_v3', JSON.stringify(merged));
    } catch {}
  }, []);

  const saveRequestsToStorage = (updated: ClubRegistrationRequest[]) => {
    const cleaned = filterOutTestItems(updated);
    setRequests(cleaned);
    try {
      localStorage.setItem('sportsfly_club_applications_v3', JSON.stringify(cleaned));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('sportsfly_demo_requests_live');
        bc.postMessage({ type: 'updated', items: cleaned });
        bc.close();
      }
    } catch (e) {}
  };

  const fetchLiveRequests = useCallback(async () => {
    try {
      const combined: any[] = [];
      const seenIds = new Set<string>();

      const addItems = (arr: any[]) => {
        if (!Array.isArray(arr)) return;
        for (const item of arr) {
          if (item && item.id && !seenIds.has(String(item.id))) {
            seenIds.add(String(item.id));
            combined.push(item);
          }
        }
      };

      const res = await fetchWithTimeout('/api/demo-requests', { timeoutMs: 7000 });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          addItems(data.items);
        }
      }

      if (
        typeof window !== 'undefined' &&
        window.location.hostname !== 'webapp.sportsfly.com.tr'
      ) {
        try {
          const remoteRes = await fetchWithTimeout(
            'https://webapp.sportsfly.com.tr/api/demo-requests',
            { timeoutMs: 5000 }
          );
          if (remoteRes.ok) {
            const remoteData = await remoteRes.json();
            if (Array.isArray(remoteData.items)) {
              addItems(remoteData.items);
            }
          }
        } catch {
          // Remote domain not yet redeployed or unreachable
        }
      }

      applyServerItems(combined);
    } catch {
      // Fallback to local storage
    }
  }, [applyServerItems]);

  useEffect(() => {
    fetchLiveRequests();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/demo-requests/stream');
      eventSource.onopen = () => {
        setIsLiveConnected(true);
      };
      eventSource.onerror = () => {
        setIsLiveConnected(false);
      };
      eventSource.addEventListener('sync', (evt: MessageEvent) => {
        try {
          const payload = JSON.parse(evt.data);
          if (Array.isArray(payload.items)) {
            applyServerItems(payload.items);
          }
          if (payload.action === 'created' && payload.record?.clubName) {
            showToast(
              `Yeni başvuru anlık olarak panele düştü: ${payload.record.clubName}`,
              'success'
            );
          }
        } catch {}
      });
    } catch {}

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('sportsfly_demo_requests_live');
        bc.onmessage = (evt) => {
          if (evt.data?.items && Array.isArray(evt.data.items)) {
            applyServerItems(evt.data.items);
          } else {
            fetchLiveRequests();
          }
        };
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sportsfly_club_applications_v3' && e.newValue) {
        try {
          applyServerItems(JSON.parse(e.newValue));
        } catch {}
      }
    };
    const handleOnline = () => {
      setIsLiveConnected(true);
      fetchLiveRequests();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('online', handleOnline);

    // Real-time Firestore Listener for /spor-okulu-basvurulari collection
    let unsubFirestore: (() => void) | undefined;
    try {
      unsubFirestore = basvurularService.subscribeToAll((firestoreDocs) => {
        if (Array.isArray(firestoreDocs) && firestoreDocs.length > 0) {
          const mappedDocs: ClubRegistrationRequest[] = firestoreDocs.map((doc) => ({
            id: doc.id,
            requestType: 'spor_okulu_basvurusu',
            source: 'Firestore Realtime',
            clubName: doc.clubName,
            managerName: doc.managerName,
            email: doc.email,
            phone: doc.phone,
            city: doc.city || 'İstanbul',
            district: doc.district || 'Merkez',
            branches: doc.branches || ['Basketbol', 'Voleybol'],
            selectedPlan: doc.selectedPlan,
            athleteCount: doc.athleteCount || '100 - 250 Sporcu',
            createdAt: typeof doc.createdAt === 'string' ? doc.createdAt : new Date().toISOString(),
            status: doc.status || 'onay_bekliyor',
          }));
          applyServerItems(mappedDocs);
        }
      });
    } catch (e) {
      console.error('Firestore application subscription error:', e);
    }

    return () => {
      if (eventSource) eventSource.close();
      if (bc) bc.close();
      if (unsubFirestore) unsubFirestore();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('online', handleOnline);
    };
  }, [fetchLiveRequests, applyServerItems]);

  const handleApprove = async (id: string) => {
    if (processingIdsRef.current.has(id)) return;
    const target = requests.find((r) => r.id === id);
    if (!target || target.status === 'onaylandi') return;
    processingIdsRef.current.add(id);

    try {
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const updated = requests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'onaylandi' as const,
              approvedAt: nowStr,
              smsSentAt: nowStr,
            }
          : r
      );

      saveRequestsToStorage(updated);

      try {
        await fetchWithTimeout(`/api/demo-requests/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'onaylandi', sendSms: true }),
          timeoutMs: 7000,
        });
      } catch {}

      const smsMsg = `SPORTSFLY: Sayın ${target.managerName}, ${target.clubName} için oluşturduğunuz kurumsal spor okulu başvurunuz onaylanmıştır. Hesabınıza giriş yapabilirsiniz.`;
      const smsRes = await sendMutlucellSms(target.phone, smsMsg);

      if (smsRes.success) {
        showToast(`${target.clubName} başvurusu onaylandı ve bilgilendirme SMS'i gönderildi.`, 'success');
      } else {
        showToast(`${target.clubName} başvurusu onaylandı.`, 'info');
      }

      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, status: 'onaylandi', approvedAt: nowStr });
      }
    } finally {
      processingIdsRef.current.delete(id);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || processingIdsRef.current.has(selectedRequest.id)) return;
    const targetId = selectedRequest.id;
    processingIdsRef.current.add(targetId);

    try {
      const reason = rejectionReasonInput.trim() || 'Kurumsal başvuru kriterleri doğrulanamadı.';
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

      const updated = requests.map((r) =>
        r.id === targetId
          ? {
              ...r,
              status: 'reddedildi' as const,
              rejectionReason: reason,
              smsSentAt: nowStr,
            }
          : r
      );

      saveRequestsToStorage(updated);
      setIsRejectionModalOpen(false);

      try {
        await fetchWithTimeout(`/api/demo-requests/${targetId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'reddedildi',
            rejectionReason: reason,
            sendSms: true,
          }),
          timeoutMs: 7000,
        });
      } catch {}

      const smsMsg = `SPORTSFLY: ${selectedRequest.clubName} kurumsal üyelik başvurunuz değerlendirilmiştir. Açıklama: ${reason}`;
      await sendMutlucellSms(selectedRequest.phone, smsMsg);

      showToast(`${selectedRequest.clubName} başvurusu reddedildi.`, 'info');
      setSelectedRequest(null);
    } finally {
      processingIdsRef.current.delete(targetId);
    }
  };

  const handleSuspend = async (id: string) => {
    if (processingIdsRef.current.has(id)) return;
    processingIdsRef.current.add(id);
    try {
      const updated = requests.map((r) =>
        r.id === id ? { ...r, status: 'askida' as const } : r
      );
      saveRequestsToStorage(updated);

      try {
        await fetchWithTimeout(`/api/demo-requests/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'askida' }),
          timeoutMs: 7000,
        });
      } catch {}

      showToast('Başvuru askıya alındı.', 'info');
    } finally {
      processingIdsRef.current.delete(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (processingIdsRef.current.has(id)) return;
    processingIdsRef.current.add(id);
    try {
      const updated = requests.filter((r) => r.id !== id);
      saveRequestsToStorage(updated);

      try {
        await fetchWithTimeout(`/api/demo-requests/${id}`, {
          method: 'DELETE',
          timeoutMs: 7000,
        });
      } catch {}

      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
        setIsDetailModalOpen(false);
      }
      showToast('Başvuru kaydı silindi.', 'info');
    } finally {
      processingIdsRef.current.delete(id);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.clubName.toLowerCase().includes(q) ||
      r.managerName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.includes(searchQuery) ||
      r.city.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'tumu'
        ? true
        : statusFilter === 'reddedildi'
        ? r.status === 'reddedildi' || r.status === 'askida'
        : r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'onay_bekliyor').length;
  const approvedCount = requests.filter((r) => r.status === 'onaylandi').length;
  const rejectedCount = requests.filter(
    (r) => r.status === 'reddedildi' || r.status === 'askida'
  ).length;

  const currentUserProfile = getStoredUserProfile();
  const isSuperAdmin = isSuperAdminUser(currentUserProfile?.role);

  if (!isSuperAdmin) {
    return (
      <div className="p-6 sm:p-10 max-w-xl mx-auto mt-10 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Yetkisiz Erişim Alanı</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          <strong>Spor Okulu Başvuruları</strong> modülü yalnızca{' '}
          <strong>Süper Admin</strong> yetkisine sahip sistem yöneticilerine açıktır.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200 max-w-md ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : toastMessage.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : 'bg-slate-800 text-white border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <div className="text-xs font-medium leading-relaxed flex-1">{toastMessage.text}</div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Minimal Corporate Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Spor Okulu Başvuruları
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kurumsal kayıt formu üzerinden oluşturulan spor okulu ve kulüp başvurularını inceleyin ve yönetin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>Canlı Bağlantı Aktif &bull; Başvurular Anlık Düşer</span>
          </div>
        </div>
      </div>

      {/* Clean Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Toplam Başvuru</span>
            <span className="text-2xl font-bold text-slate-900 mt-0.5 block">{totalCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-700 block">İnceleme Bekleyen</span>
            <span className="text-2xl font-bold text-slate-900 mt-0.5 block">{pendingCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 block">Onaylanan</span>
            <span className="text-2xl font-bold text-slate-900 mt-0.5 block">{approvedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Reddedilen / Askıda</span>
            <span className="text-2xl font-bold text-slate-900 mt-0.5 block">{rejectedCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <Ban className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto text-xs font-semibold">
          {[
            { id: 'tumu', label: `Tümü (${totalCount})` },
            { id: 'onay_bekliyor', label: `Bekleyen (${pendingCount})` },
            { id: 'onaylandi', label: `Onaylanan (${approvedCount})` },
            { id: 'reddedildi', label: `Reddedilen (${rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Spor okulu adı, yetkili, telefon veya e-posta ara..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Main Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Spor Okulu / Kulüp</th>
                <th className="py-3.5 px-4">Yetkili</th>
                <th className="py-3.5 px-4">İletişim</th>
                <th className="py-3.5 px-4">Konum &amp; Branş</th>
                <th className="py-3.5 px-4">Üyelik Paketi</th>
                <th className="py-3.5 px-4">Başvuru Tarihi</th>
                <th className="py-3.5 px-4 text-center">Durum</th>
                <th className="py-3.5 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 px-4 text-center">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-sm text-slate-700">
                      Kayıtlı spor okulu başvurusu bulunmuyor
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Giriş ekranındaki kayıt formu üzerinden yeni bir spor okulu başvurusu oluşturulduğunda bu alanda listelenecektir.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                          {req.clubName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            {req.clubName}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{req.managerName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{req.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{req.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="text-slate-700 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {req.city} / {req.district}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {req.branches.map((b, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-[11px]">
                        {req.selectedPlan}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.createdAt}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {req.status === 'onay_bekliyor' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold text-[11px] border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>Bekliyor</span>
                        </span>
                      )}
                      {req.status === 'onaylandi' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-[11px] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Onaylandı</span>
                        </span>
                      )}
                      {req.status === 'reddedildi' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 font-semibold text-[11px] border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          <span>Reddedildi</span>
                        </span>
                      )}
                      {req.status === 'askida' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                          <Ban className="w-3 h-3" />
                          <span>Askıda</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {req.status === 'onay_bekliyor' && (
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                            title="Başvuruyu Onayla"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Onayla</span>
                          </button>
                        )}

                        {req.status === 'onay_bekliyor' && (
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setRejectionReasonInput('');
                              setIsRejectionModalOpen(true);
                            }}
                            className="py-1.5 px-2.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 font-semibold text-[11px] border border-slate-200 hover:border-rose-200 cursor-pointer transition-colors"
                            title="Başvuruyu Reddet"
                          >
                            <span>Reddet</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                          title="Başvuru Detayı"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(req.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 cursor-pointer transition-colors"
                          title="Kaydı Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {isDetailModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-bold text-base flex items-center justify-center">
                  {selectedRequest.clubName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {selectedRequest.clubName}
                  </h3>
                  <p className="text-xs text-slate-500">Kurumsal Spor Okulu Başvurusu</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Yetkili Adı Soyadı
                  </span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {selectedRequest.managerName}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Telefon Numarası
                  </span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {selectedRequest.phone}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    E-Posta Adresi
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {selectedRequest.email}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Konum
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {selectedRequest.city} / {selectedRequest.district}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Üyelik Paketi
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {selectedRequest.selectedPlan}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Başvuru Tarihi
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {selectedRequest.createdAt}
                  </span>
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                  <span className="font-semibold block text-[11px] text-slate-500 mb-0.5">
                    Başvuru Notu
                  </span>
                  <p className="text-xs leading-relaxed">{selectedRequest.notes}</p>
                </div>
              )}

              {selectedRequest.rejectionReason && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                  <span className="font-semibold block text-[11px] text-rose-700 mb-0.5">
                    Red Gerekçesi
                  </span>
                  <p className="text-xs leading-relaxed">{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {selectedRequest.status === 'onay_bekliyor' && (
                <button
                  onClick={() => {
                    handleApprove(selectedRequest.id);
                    setIsDetailModalOpen(false);
                  }}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Başvuruyu Onayla</span>
                </button>
              )}

              {selectedRequest.status === 'onaylandi' && (
                <button
                  onClick={() => {
                    handleSuspend(selectedRequest.id);
                    setIsDetailModalOpen(false);
                  }}
                  className="py-2 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Ban className="w-4 h-4" />
                  <span>Askıya Al</span>
                </button>
              )}

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="py-2 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 cursor-pointer ml-auto"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {isRejectionModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 text-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <BadgeAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Başvuruyu Reddet</h3>
                <p className="text-xs text-slate-500">{selectedRequest.clubName}</p>
              </div>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reddetme Gerekçesi
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="Başvurunun reddedilme gerekçesini belirtin..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-rose-600 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejectionModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer hover:bg-slate-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reddi Onayla</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
