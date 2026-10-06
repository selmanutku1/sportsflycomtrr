import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Lock,
  Unlock,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Building2,
  Clock,
  Mail,
  UserCheck,
  Layers,
  Eye,
  RotateCcw,
  X,
} from 'lucide-react';
import { NavPage, PackagePlanType } from '../../types';
import {
  ALL_CONFIGURABLE_SYSTEM_AREAS,
  ConfigurableAreaItem,
  GoogleUserAccessRecord,
  getStoredGoogleUsers,
  saveStoredGoogleUsers,
  syncGoogleUserToFirestore,
  fetchAndMergeGoogleUsersFromFirestore,
  deleteGoogleUserRecord,
} from '../../data/googleUsersAccess';
import {
  ADMIN_GOOGLE_EMAIL,
  getStoredUserProfile,
  saveStoredUserProfile,
} from '../../data/userProfile';
import { setActiveSessionPlan } from '../../data/packagePermissions';
import { approveRegisteredUser } from '../../services/registeredUsersService';

interface GoogleUsersAccessManagerPanelProps {
  onNavigate?: (page: NavPage) => void;
}

const CATEGORIES: ConfigurableAreaItem['category'][] = [
  'Temel Yönetim',
  'Kadro & Branş',
  'Operasyon & Karne',
  'Finans & Muhasebe',
  'Sporpuan & Modüller',
];

export const GoogleUsersAccessManagerPanel: React.FC<GoogleUsersAccessManagerPanelProps> = ({
  onNavigate,
}) => {
  const [users, setUsers] = useState<GoogleUserAccessRecord[]>(() => getStoredGoogleUsers());
  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    const initial = getStoredGoogleUsers();
    return initial[0]?.id || '';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'locked' | 'custom' | 'full'>('all');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('Tümü');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // New Google User Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newClub, setNewClub] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPreset, setNewPreset] = useState<'locked' | 'starter' | 'full'>('locked');

  useEffect(() => {
    let mounted = true;
    fetchAndMergeGoogleUsersFromFirestore().then((merged) => {
      if (mounted && merged.length > 0) {
        setUsers(merged);
        setSelectedUserId((prev) =>
          prev && merged.some((u) => u.id === prev) ? prev : merged[0].id
        );
      }
    });

    const handleUpdate = () => {
      const latest = getStoredGoogleUsers();
      setUsers(latest);
    };

    window.addEventListener('sportsfly_google_users_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('sportsfly_google_users_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) || users[0] || null,
    [users, selectedUserId]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.clubName.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'locked') {
        return !u.isFullAccess && u.allowedPages.length <= 1;
      }
      if (statusFilter === 'custom') {
        return !u.isFullAccess && u.allowedPages.length > 1;
      }
      if (statusFilter === 'full') {
        return u.isFullAccess;
      }
      return true;
    });
  }, [users, searchQuery, statusFilter]);

  const showFeedback = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast(null);
    }, 3000);
  };

  const updateUserRecord = (
    userId: string,
    updater: (record: GoogleUserAccessRecord) => GoogleUserAccessRecord,
    feedbackMsg?: string
  ) => {
    const nextList = users.map((u) => {
      if (u.id !== userId) return u;
      const updated = updater(u);
      // Ensure 'paketler' is always included
      if (!updated.allowedPages.includes('paketler')) {
        updated.allowedPages = ['paketler', ...updated.allowedPages];
      }
      syncGoogleUserToFirestore(updated);
      return updated;
    });
    setUsers(nextList);
    saveStoredGoogleUsers(nextList);
    if (feedbackMsg) {
      showFeedback(feedbackMsg);
    }
  };

  const handleTogglePage = (page: NavPage) => {
    if (!selectedUser) return;
    if (page === 'paketler') {
      showFeedback('Paketler alanı tüm Google kullanıcıları için varsayılan olarak açıktır.');
      return;
    }

    updateUserRecord(
      selectedUser.id,
      (u) => {
        const currentPages = u.isFullAccess
          ? ALL_CONFIGURABLE_SYSTEM_AREAS.map((a) => a.page)
          : u.allowedPages;
        const exists = currentPages.includes(page);
        const nextPages = exists
          ? currentPages.filter((p) => p !== page)
          : [...currentPages, page];
        const isAllSelected = nextPages.length >= ALL_CONFIGURABLE_SYSTEM_AREAS.length;
        return {
          ...u,
          allowedPages: nextPages,
          isFullAccess: isAllSelected,
        };
      },
      `"${selectedUser.name}" için alan yetkisi güncellendi.`
    );
  };

  const handleToggleCategory = (category: ConfigurableAreaItem['category']) => {
    if (!selectedUser) return;
    const categoryPages = ALL_CONFIGURABLE_SYSTEM_AREAS.filter(
      (a) => a.category === category
    ).map((a) => a.page);

    const currentPages = selectedUser.isFullAccess
      ? ALL_CONFIGURABLE_SYSTEM_AREAS.map((a) => a.page)
      : selectedUser.allowedPages;

    const allCategoryActive = categoryPages.every((p) => currentPages.includes(p));

    updateUserRecord(
      selectedUser.id,
      (u) => {
        let nextPages: NavPage[];
        if (allCategoryActive) {
          nextPages = currentPages.filter(
            (p) => !categoryPages.includes(p) || p === 'paketler'
          );
        } else {
          const set = new Set<NavPage>([...currentPages, ...categoryPages, 'paketler']);
          nextPages = Array.from(set);
        }
        const isAllSelected = nextPages.length >= ALL_CONFIGURABLE_SYSTEM_AREAS.length;
        return {
          ...u,
          allowedPages: nextPages,
          isFullAccess: isAllSelected,
        };
      },
      `"${category}" kategorisindeki alanlar ${allCategoryActive ? 'kilitlendi' : 'aktif edildi'}.`
    );
  };

  const handleApplyPreset = (preset: 'locked' | 'starter' | 'academy' | 'full') => {
    if (!selectedUser) return;

    const starterPages: NavPage[] = [
      'paketler',
      'anasayfa',
      'sporcular',
      'gruplar',
      'egitmenler',
      'yoklama',
      'sporcu-karnesi',
      'antrenman-takvimi',
      'destek',
    ];

    const academyPages: NavPage[] = [
      ...starterPages,
      'on-kayit',
      'subeler',
      'brans-yonetimi',
      'egitim-planlama',
      'on-muhasebe',
      'odeme-plani',
      'gelir-gider-yonetimi',
      'entegrasyonlar',
      'kulup-evraklari',
    ];

    const allPages = ALL_CONFIGURABLE_SYSTEM_AREAS.map((a) => a.page);

    updateUserRecord(
      selectedUser.id,
      (u) => {
        if (preset === 'locked') {
          return {
            ...u,
            assignedPlan: 'Paket Seçilmedi',
            allowedPages: ['paketler'],
            isFullAccess: false,
            notes: 'Yalnızca Paketler açık (Sol menüdeki diğer tüm kategoriler kilitli).',
          };
        }
        if (preset === 'starter') {
          return {
            ...u,
            assignedPlan: 'Başlangıç Kulübü',
            allowedPages: starterPages,
            isFullAccess: false,
            notes: 'Temel Kadro, Yoklama ve Sporcu Karnesi alanları aktif edildi.',
          };
        }
        if (preset === 'academy') {
          return {
            ...u,
            assignedPlan: 'Kulüp & Akademi',
            allowedPages: academyPages,
            isFullAccess: false,
            notes: 'Akademi, Ön Muhasebe ve SportsFly Lab alanları aktif edildi.',
          };
        }
        return {
          ...u,
          assignedPlan: 'Pro Akademi & Çoklu Şube',
          allowedPages: allPages,
          isFullAccess: true,
          notes: 'Admin tarafından tüm sistem alanları kısıtlamasız açıldı.',
        };
      },
      `"${selectedUser.name}" için yetki şablonu uygulandı.`
    );
  };

  const handleAddGoogleUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !newName.trim()) return;
    if (cleanEmail === ADMIN_GOOGLE_EMAIL) {
      showFeedback(`${ADMIN_GOOGLE_EMAIL} zaten kalıcı Süper Admin yetkisine sahiptir.`);
      return;
    }

    const now = new Date();
    const formattedNow = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const starterPages: NavPage[] = [
      'paketler',
      'anasayfa',
      'sporcular',
      'gruplar',
      'yoklama',
      'sporcu-karnesi',
      'antrenman-takvimi',
    ];
    const allPages = ALL_CONFIGURABLE_SYSTEM_AREAS.map((a) => a.page);

    const newRecord: GoogleUserAccessRecord = {
      id: `guser-${Date.now()}`,
      uid: `google-uid-${Date.now()}`,
      name: newName.trim(),
      email: cleanEmail,
      clubName: newClub.trim() || 'Belirtilmedi',
      phone: newPhone.trim() || '+90 532 000 00 00',
      firstLoginAt: formattedNow,
      lastLoginAt: formattedNow,
      assignedPlan:
        newPreset === 'full'
          ? 'Pro Akademi & Çoklu Şube'
          : newPreset === 'starter'
          ? 'Başlangıç Kulübü'
          : 'Paket Seçilmedi',
      allowedPages:
        newPreset === 'full' ? allPages : newPreset === 'starter' ? starterPages : ['paketler'],
      isFullAccess: newPreset === 'full',
      notes: 'Admin panelinden eklendi ve yetkilendirildi.',
    };

    const nextList = [newRecord, ...users.filter((u) => u.email.toLowerCase() !== cleanEmail)];
    setUsers(nextList);
    saveStoredGoogleUsers(nextList);
    syncGoogleUserToFirestore(newRecord);
    approveRegisteredUser(cleanEmail, 'Süper Admin').catch(() => {});
    setSelectedUserId(newRecord.id);
    setNewName('');
    setNewEmail('');
    setNewClub('');
    setNewPhone('');
    setIsAddModalOpen(false);
    showFeedback(`"${newRecord.name}" (${newRecord.email}) Google kullanıcı listesine eklendi.`);
  };

  const handleDeleteUser = async (user: GoogleUserAccessRecord) => {
    await deleteGoogleUserRecord(user.id);
    const remaining = getStoredGoogleUsers();
    setUsers(remaining);
    if (selectedUserId === user.id) {
      setSelectedUserId(remaining[0]?.id || '');
    }
    showFeedback(`"${user.name}" listeden kaldırıldı.`);
  };

  const handleSimulateGoogleUser = (user: GoogleUserAccessRecord) => {
    const currentProf = getStoredUserProfile();
    saveStoredUserProfile({
      ...currentProf,
      name: user.name,
      email: user.email,
      role: 'Google Kullanıcısı',
      title: 'Google Hesabı',
      club: user.clubName,
      authProvider: 'google',
      hasActivePackage: user.isFullAccess,
    });
    if (user.assignedPlan !== 'Paket Seçilmedi') {
      setActiveSessionPlan(user.assignedPlan);
    }
    showFeedback(
      `"${user.name}" görünümüne geçildi. Sol menüden açık/kilitli alanları test edebilirsiniz.`
    );
    if (onNavigate) {
      onNavigate('paketler');
    }
  };

  const totalAreasCount = ALL_CONFIGURABLE_SYSTEM_AREAS.length;
  const activeAreasForSelected = selectedUser
    ? selectedUser.isFullAccess
      ? totalAreasCount
      : selectedUser.allowedPages.length
    : 0;

  const visibleCategories =
    activeCategoryTab === 'Tümü'
      ? CATEGORIES
      : CATEGORIES.filter((c) => c === activeCategoryTab);

  return (
    <div className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Top Gradient Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 px-5 sm:px-6 py-5 text-white border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Google OAuth Kullanıcı &amp; Alan Yetkilendirme Merkezi
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Admin ({ADMIN_GOOGLE_EMAIL}): Tüm Sistem Açık
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              Google İle Giriş Yapanlar Listesi &amp; Aktif Alan Yönetimi
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Google hesabıyla kayıt olan kullanıcılar varsayılan olarak yalnızca{' '}
              <strong className="text-white">Paketler</strong> sayfasını görebilir ve sol menüdeki
              tüm kategorileri kilitli görür. Listeden bir Google kullanıcısı seçerek onun için
              aktif edilecek menü ve modül alanlarını tek tıkla belirleyebilirsiniz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Google Kullanıcısı Ekle / Tanımla</span>
            </button>
          </div>
        </div>

        {/* Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Süper Admin Hesabı
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-300 mt-0.5 block truncate">
              {ADMIN_GOOGLE_EMAIL}
            </span>
            <span className="text-[10px] text-emerald-400/90 font-semibold">
              Kalıcı Tam Yetki ({totalAreasCount}/{totalAreasCount} Alan)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Google Girişli Kullanıcılar
            </span>
            <span className="text-lg font-extrabold text-white mt-0.5 block">
              {users.length} Kullanıcı
            </span>
            <span className="text-[10px] text-blue-300 font-semibold">
              Kayıtlı Google OAuth oturumu
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Özel Alan Aktif Edilenler
            </span>
            <span className="text-lg font-extrabold text-blue-300 mt-0.5 block">
              {users.filter((u) => u.isFullAccess || u.allowedPages.length > 1).length} Kullanıcı
            </span>
            <span className="text-[10px] text-slate-300 font-semibold">
              Admin tarafından alan açıldı
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Sadece Paketler Açık (Kilitli)
            </span>
            <span className="text-lg font-extrabold text-amber-300 mt-0.5 block">
              {users.filter((u) => !u.isFullAccess && u.allowedPages.length <= 1).length} Kullanıcı
            </span>
            <span className="text-[10px] text-amber-200/90 font-semibold">
              Yetkilendirme / Paket bekliyor
            </span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {saveToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800/80 px-6 py-2.5 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{saveToast}</span>
          </div>
          <button
            onClick={() => setSaveToast(null)}
            className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Two-Column Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        {/* LEFT COLUMN: Google Login Users List (5 cols) */}
        <div className="lg:col-span-5 p-4 sm:p-5 bg-slate-50/40 dark:bg-[#162238]/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  1. Google İle Giriş Yapanlar ({filteredUsers.length})
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Yetkilerini düzenlemek istediğiniz kullanıcıya tıklayın
                </p>
              </div>
            </div>

            {/* Search & Status Filter */}
            <div className="space-y-2.5 mb-3.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="İsim, Gmail adresi veya kulüp ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'Tümü' },
                  { id: 'locked', label: 'Sadece Paketler (Kilitli)' },
                  { id: 'custom', label: 'Özel Alan Açık' },
                  { id: 'full', label: 'Tam Erişim' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      statusFilter === tab.id
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-[#111c2e] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pinned Super Admin Account Card */}
            <div className="mb-3 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  SA
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      Selman Utku (Admin)
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-600 text-white">
                      Süper Admin
                    </span>
                  </div>
                  <span className="text-[11px] font-sans tabular-nums text-emerald-700 dark:text-emerald-300 block truncate">
                    {ADMIN_GOOGLE_EMAIL}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-white dark:bg-[#111c2e] text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                Tüm Sistem Açık
              </span>
            </div>

            {/* Google Users Scrollable List */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                  Arama kriterine uygun Google kullanıcısı bulunamadı.
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUser?.id === user.id;
                  const activeCount = user.isFullAccess
                    ? totalAreasCount
                    : user.allowedPages.length;
                  const isOnlyPackages = !user.isFullAccess && activeCount <= 1;

                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-[#111c2e] border-blue-500 ring-2 ring-blue-500/15 shadow-sm'
                          : 'bg-white/80 dark:bg-[#111c2e]/70 border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          {/* Avatar with Google G badge */}
                          <div className="relative shrink-0">
                            <div
                              className={`w-9 h-9 rounded-xl font-extrabold text-xs flex items-center justify-center ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <span
                              className="w-4 h-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[9px] font-black text-blue-600 absolute -bottom-1 -right-1 shadow-2xs"
                              title="Google OAuth Girişi"
                            >
                              G
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                                {user.name}
                              </span>
                              {user.isFullAccess ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                                  Tam Erişim ({totalAreasCount}/{totalAreasCount})
                                </span>
                              ) : isOnlyPackages ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" />
                                  Sadece Paketler (1/{totalAreasCount})
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                                  {activeCount} / {totalAreasCount} Alan Aktif
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate font-sans tabular-nums">{user.email}</span>
                            </div>

                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1 truncate">
                                <Building2 className="w-3 h-3 shrink-0" />
                                {user.clubName}
                              </span>
                              <span className="flex items-center gap-1 shrink-0">
                                <Clock className="w-3 h-3 shrink-0" />
                                {user.lastLoginAt}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleSimulateGoogleUser(user);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                            title="Bu kullanıcının gözünden sol menüyü test et"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleDeleteUser(user);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Listeden kaldır"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Google ile giriş yapan yeni hesaplar otomatik olarak bu listeye düşer.</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Areas Configurator for Selected Google User (7 cols) */}
        <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between">
          {selectedUser ? (
            <div className="space-y-5">
              {/* Selected User Top Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#162238]/60 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      2. Seçili Kullanıcı Yetki Yapılandırması
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {activeAreasForSelected} / {totalAreasCount} Alan Açık
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{selectedUser.name}</span>
                    <span className="text-xs font-sans tabular-nums font-normal text-slate-500 dark:text-slate-400">
                      ({selectedUser.email})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kulüp: <strong className="text-slate-700 dark:text-slate-200">{selectedUser.clubName}</strong> · İlk Giriş: {selectedUser.firstLoginAt}
                  </p>
                </div>

                {/* Quick Simulate Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSimulateGoogleUser(selectedUser)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-[#111c2e] hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/70 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Gözünden Gör</span>
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Hızlı Yetki Şablonları (Tek Tıkla Belirle)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('locked')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      !selectedUser.isFullAccess && selectedUser.allowedPages.length <= 1
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/20'
                        : 'bg-white dark:bg-[#111c2e] border-slate-200 dark:border-slate-800 hover:border-amber-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-extrabold text-amber-600">1 Alan</span>
                    </div>
                    <div className="text-xs font-extrabold">Sadece Paketler</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Sol menü kilitli</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset('starter')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      !selectedUser.isFullAccess &&
                      selectedUser.allowedPages.length > 1 &&
                      selectedUser.allowedPages.length <= 10
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-900 dark:text-blue-200 ring-2 ring-blue-400/20'
                        : 'bg-white dark:bg-[#111c2e] border-slate-200 dark:border-slate-800 hover:border-blue-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[10px] font-extrabold text-blue-600">9 Alan</span>
                    </div>
                    <div className="text-xs font-extrabold">Başlangıç Alanları</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Sporcu, Yoklama, Karne</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset('academy')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      !selectedUser.isFullAccess && selectedUser.allowedPages.length > 10
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-400/20'
                        : 'bg-white dark:bg-[#111c2e] border-slate-200 dark:border-slate-800 hover:border-indigo-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[10px] font-extrabold text-indigo-600">18 Alan</span>
                    </div>
                    <div className="text-xs font-extrabold">Kulüp &amp; Akademi</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">+Muhasebe &amp; Lab</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset('full')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedUser.isFullAccess
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-[#111c2e] border-slate-200 dark:border-slate-800 hover:border-emerald-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] font-extrabold text-emerald-600">
                        {totalAreasCount} Alan
                      </span>
                    </div>
                    <div className="text-xs font-extrabold">Tüm Sistemi Aç</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Kısıtlamasız erişim</div>
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
                {['Tümü', ...CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryTab(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeCategoryTab === cat
                        ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Individual Areas Checkboxes Grouped by Category */}
              <div className="space-y-5 max-h-[460px] overflow-y-auto pr-1">
                {visibleCategories.map((category) => {
                  const items = ALL_CONFIGURABLE_SYSTEM_AREAS.filter(
                    (a) => a.category === category
                  );
                  const activeInCat = items.filter(
                    (i) =>
                      selectedUser.isFullAccess ||
                      selectedUser.allowedPages.includes(i.page)
                  ).length;
                  const allCatActive = activeInCat === items.length;

                  return (
                    <div
                      key={category}
                      className="rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden"
                    >
                      <div className="bg-slate-50 dark:bg-[#162238]/80 px-4 py-2.5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            {category}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {activeInCat} / {items.length} Aktif
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleCategory(category)}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          {allCatActive ? 'Kategoriyi Kilitle' : 'Tüm Kategoriyi Aç'}
                        </button>
                      </div>

                      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white dark:bg-[#111c2e]">
                        {items.map((area) => {
                          const isEnabled =
                            selectedUser.isFullAccess ||
                            selectedUser.allowedPages.includes(area.page);
                          const isDefaultLocked = area.page === 'paketler';

                          return (
                            <div
                              key={area.page}
                              onClick={() => handleTogglePage(area.page)}
                              className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer select-none ${
                                isEnabled
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-2xs'
                                  : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/80 dark:border-slate-800 opacity-80 hover:opacity-100'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div
                                  className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                                    isEnabled
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-transparent'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className={`text-xs font-bold ${
                                        isEnabled
                                          ? 'text-slate-900 dark:text-white'
                                          : 'text-slate-600 dark:text-slate-400'
                                      }`}
                                    >
                                      {area.label}
                                    </span>
                                    {isDefaultLocked && (
                                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                        Varsayılan Açık
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                    {area.description}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 ${
                                  isEnabled
                                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {isEnabled ? (
                                  <>
                                    <Unlock className="w-2.5 h-2.5" />
                                    Aktif
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-2.5 h-2.5 text-amber-500" />
                                    Kilitli
                                  </>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-sm text-slate-400">
              Lütfen sol listeden bir Google kullanıcısı seçin.
            </div>
          )}

          {/* Footer Action Bar */}
          {selectedUser && (
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                <span>
                  Seçtiğiniz alanlar <strong>{selectedUser.email}</strong> hesabı için anında sol
                  menüde aktif edilir, seçilmeyen alanlar kilitli kalır.
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('locked')}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sıfırla (Sadece Paketler)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    syncGoogleUserToFirestore(selectedUser);
                    showFeedback(
                      `"${selectedUser.name}" için ${activeAreasForSelected} aktif alan kaydedildi ve senkronize edildi.`
                    );
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Yetkileri Kaydet &amp; Uygula</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Google User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Google Kullanıcısı Ekle &amp; Alan Tanımla
                </h3>
                <p className="text-xs text-slate-500">
                  Google ile giriş yapacak veya yapmış kullanıcı için ön yetki tanımlayın
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGoogleUser} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162238] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google (Gmail) E-Posta Adresi *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ornek.kullanici@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162238] text-slate-900 dark:text-white font-sans tabular-nums"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kulüp / Akademi Adı
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Anadolu Spor Okulu"
                    value={newClub}
                    onChange={(e) => setNewClub(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162238] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Telefon
                  </label>
                  <input
                    type="text"
                    placeholder="+90 532 000 00 00"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162238] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Başlangıç Alan Yetkisi
                </label>
                <select
                  value={newPreset}
                  onChange={(e) => setNewPreset(e.target.value as typeof newPreset)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#162238] text-slate-900 dark:text-white font-semibold"
                >
                  <option value="locked">Sadece Paketler Açık (Sol Menü Kilitli)</option>
                  <option value="starter">Başlangıç Alanları Açık (Sporcu, Yoklama, Karne)</option>
                  <option value="full">Tüm Sistem Alanları Açık (Tam Erişim)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  Kullanıcıyı Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
