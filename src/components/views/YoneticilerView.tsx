import React, { useState } from 'react';
import {
  Plus,
  Search,
  Download,
  Send,
  User,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  GraduationCap,
  Calendar,
  Building2,
  Mail,
  Phone,
  Clock,
  X,
  Lock,
  Unlock,
  Layers,
  Eye,
  Check,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import { SportsFlyIcon } from '../SportsFlyLogo';
import { INITIAL_YONETICILER } from '../../data/mockData';
import { YoneticiItem, PackagePlanType } from '../../types';
import {
  PACKAGE_DETAILS,
  CANONICAL_PACKAGES,
  normalizePlanName,
  setActiveSessionPlan,
} from '../../data/packagePermissions';

const YONETICILER_STORAGE_KEY = 'sportsfly_yoneticiler_v2';

const getInitialYoneticiler = (): YoneticiItem[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(YONETICILER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
  }
  return INITIAL_YONETICILER;
};

export const YoneticilerView: React.FC = () => {
  const [yoneticiler, setYoneticiler] = useState<YoneticiItem[]>(getInitialYoneticiler);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Erişilebilir' | 'Erişilemez'>('all');
  const [packageFilter, setPackageFilter] = useState<'all' | PackagePlanType>('all');

  // Impersonated Sports School Account State (Admin Girişi)
  const [activeImpersonation, setActiveImpersonation] = useState<YoneticiItem | null>(null);

  // Modals
  const [loginModalManager, setLoginModalManager] = useState<YoneticiItem | null>(null);
  const [inaccessibleModalManager, setInaccessibleModalManager] = useState<YoneticiItem | null>(null);
  const [packageModalManager, setPackageModalManager] = useState<YoneticiItem | null>(null);
  const [modalSelectedPlan, setModalSelectedPlan] = useState<PackagePlanType>('Kulüp & Akademi');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageChannel, setMessageChannel] = useState<'sms' | 'email' | 'both'>('email');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Persist yoneticiler
  const updateYoneticiler = (newYoneticiler: YoneticiItem[]) => {
    setYoneticiler(newYoneticiler);
    try {
      localStorage.setItem(YONETICILER_STORAGE_KEY, JSON.stringify(newYoneticiler));
    } catch (e) {}
  };

  // Add Manager Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+90 532 ');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newAccessibility, setNewAccessibility] = useState<'Erişilebilir' | 'Erişilemez'>('Erişilebilir');
  const [newPackageType, setNewPackageType] = useState<PackagePlanType>('Kulüp & Akademi');

  // Filtered List
  const filteredList = yoneticiler.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      item.schoolName.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || item.accessibility === statusFilter;
    const matchesPackage = packageFilter === 'all' || normalizePlanName(item.packageType) === packageFilter;

    return matchesSearch && matchesStatus && matchesPackage;
  });

  // Toggle Selection
  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map((i) => i.id));
    }
  };

  // Change manager package directly
  const handleChangeManagerPackage = (managerId: string, newPlan: PackagePlanType) => {
    const updated = yoneticiler.map((item) => {
      if (item.id === managerId) {
        return { ...item, packageType: newPlan };
      }
      return item;
    });
    updateYoneticiler(updated);

    const targetManager = updated.find((m) => m.id === managerId);
    const targetName = targetManager?.name || 'Yönetici';

    if (activeImpersonation && activeImpersonation.id === managerId) {
      setActiveImpersonation({ ...activeImpersonation, packageType: newPlan });
      setActiveSessionPlan(newPlan);
    }

    showToast(
      `"${targetName}" paket türü "${newPlan}" olarak güncellendi. Sistem erişim yetkileri sınırlandı.`,
      'success'
    );
  };

  // Open detailed package modal
  const handleOpenPackageModal = (manager: YoneticiItem) => {
    setPackageModalManager(manager);
    setModalSelectedPlan(normalizePlanName(manager.packageType));
  };

  // Save from package modal
  const handleSavePackageModal = () => {
    if (!packageModalManager) return;
    handleChangeManagerPackage(packageModalManager.id, modalSelectedPlan);
    setPackageModalManager(null);
  };

  // Handle Login to Sports School Account (Admin Girişi)
  const handleLoginToSchool = (manager: YoneticiItem) => {
    if (manager.accessibility === 'Erişilebilir') {
      setActiveImpersonation(manager);
      const plan = normalizePlanName(manager.packageType);
      setActiveSessionPlan(plan);
      setLoginModalManager(null);
      showToast(
        `"${manager.schoolName}" (${manager.name}) spor okulu hesabına giriş yapıldı. Aktif Paket: ${plan}`,
        'success'
      );
    } else {
      setInaccessibleModalManager(manager);
    }
  };

  // Toggle Accessibility
  const handleToggleAccessibility = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = yoneticiler.map((item) => {
      if (item.id === id) {
        const nextStatus = item.accessibility === 'Erişilebilir' ? 'Erişilemez' : 'Erişilebilir';
        showToast(
          `${item.name} erişilebilirlik durumu "${nextStatus}" olarak güncellendi.`,
          nextStatus === 'Erişilebilir' ? 'success' : 'warning'
        );
        return { ...item, accessibility: nextStatus as 'Erişilebilir' | 'Erişilemez' };
      }
      return item;
    });
    updateYoneticiler(updated);
  };

  // Force enable accessibility from modal and login
  const handleForceEnableAndLogin = (manager: YoneticiItem) => {
    const updatedList = yoneticiler.map((item) =>
      item.id === manager.id ? { ...item, accessibility: 'Erişilebilir' as const } : item
    );
    updateYoneticiler(updatedList);
    const updated = { ...manager, accessibility: 'Erişilebilir' as const };
    setInaccessibleModalManager(null);
    setActiveImpersonation(updated);
    const plan = normalizePlanName(updated.packageType);
    setActiveSessionPlan(plan);
    showToast(
      `Süper Admin erişim yetkisi aktif edildi ve "${updated.schoolName}" hesabına giriş yapıldı (Paket: ${plan}).`,
      'success'
    );
  };

  // Add Manager
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      showToast('Lütfen yönetici adı ve e-posta adresini giriniz.', 'warning');
      return;
    }

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newManager: YoneticiItem = {
      id: `yon-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      code: randomCode,
      createdAt: formattedDate,
      phone: newPhone.trim() || '+90 532 000 00 00',
      role: 'Spor Okulu Admin',
      schoolName: newSchoolName.trim() || `${newName.trim()} Spor Akademisi`,
      accessibility: newAccessibility,
      packageType: newPackageType,
      authProvider: 'email',
      activeStudents: 50,
      activeTrainers: 3,
      branches: ['Genel Spor'],
      lastLogin: 'Henüz giriş yapmadı',
    };

    updateYoneticiler([newManager, ...yoneticiler]);
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('+90 532 ');
    setNewSchoolName('');
    setNewPackageType('Kulüp & Akademi');
    showToast(`Yeni yönetici "${newManager.name}" (${newPackageType} Paketi) başarıyla eklendi.`, 'success');
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const headers = ['Yönetici Adı', 'E-Posta', 'Kod', 'Kayıt Tarihi', 'Telefon', 'Üyelik Türü', 'Spor Okulu', 'Erişilebilirlik'];
    const rows = filteredList.map((m) => [
      `"${m.name}"`,
      `"${m.email}"`,
      `"${m.code}"`,
      `"${m.createdAt}"`,
      `"${m.phone}"`,
      `"${m.role}"`,
      `"${m.schoolName}"`,
      `"${m.accessibility}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sporsepeti_Yoneticiler_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${filteredList.length} yönetici verisi Excel/CSV olarak indirildi.`, 'success');
  };

  // Send Message
  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      showToast('Lütfen mesaj içeriğini yazınız.', 'warning');
      return;
    }
    const recipientCount = selectedIds.length > 0 ? selectedIds.length : yoneticiler.length;
    setShowMessageModal(false);
    setMessageText('');
    showToast(
      `${recipientCount} spor okulu yöneticisine ${messageChannel.toUpperCase()} ile mesaj iletildi.`,
      'success'
    );
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="yonetici-toast"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-bottom-3 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : toastMessage.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : 'bg-blue-50 text-blue-900 border-blue-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : toastMessage.type === 'warning' ? (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          ) : (
            <SportsFlyIcon className="w-5 h-5 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ACTIVE IMPERSONATION BANNER & PANEL (Adminin Spor Okulu Hesabına Giriş Yapmış Durumu) */}
      {activeImpersonation && (
        <div
          id="impersonation-active-panel"
          className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 text-white rounded-xl p-4 lg:p-5 shadow-md border border-blue-500/30"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs shrink-0 border border-white/20">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-emerald-400 text-slate-950 text-[11px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Canlı Spor Okulu Oturumu
                  </span>
                  <span className="text-xs text-blue-100 font-medium">
                    Süper Admin Giriş Modu
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {activeImpersonation.schoolName}
                </h3>
                <p className="text-xs text-blue-100/90 flex items-center gap-2 mt-0.5 flex-wrap">
                  <span>Yönetici: <b>{activeImpersonation.name}</b></span>
                  <span>•</span>
                  <span>E-posta: {activeImpersonation.email}</span>
                  <span>•</span>
                  <span>Telefon: {activeImpersonation.phone}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <button
                onClick={() => {
                  showToast(`"${activeImpersonation.schoolName}" yönetim paneline senkronize olundu.`, 'info');
                }}
                className="px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
                title="Spor Okulu Kontrol Paneli"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Okul Detaylarını Gör</span>
              </button>

              <button
                onClick={() => {
                  const exitingName = activeImpersonation.schoolName;
                  setActiveImpersonation(null);
                  showToast(`"${exitingName}" hesabından çıkış yapıldı. Süper Admin paneline dönüldü.`, 'info');
                }}
                className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                title="Oturumu Sonlandır ve Admin Paneline Dön"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Oturumu Kapat &amp; Admin Paneline Dön</span>
              </button>
            </div>
          </div>

          {/* Quick Stats for this Impersonated Sports School */}
          <div className="mt-4 pt-3.5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-xs">
              <span className="text-blue-200 block text-[11px]">Kayıtlı Sporcu</span>
              <span className="text-base font-bold text-white">{activeImpersonation.activeStudents || 120} Öğrenci</span>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-xs">
              <span className="text-blue-200 block text-[11px]">Eğitmen Kadrosu</span>
              <span className="text-base font-bold text-white">{activeImpersonation.activeTrainers || 6} Eğitmen</span>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-xs">
              <span className="text-blue-200 block text-[11px]">Aktif Branşlar</span>
              <span className="text-base font-bold text-white">
                {activeImpersonation.branches?.join(', ') || 'Basketbol, Yüzme'}
              </span>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-xs flex flex-col justify-between">
              <span className="text-blue-200 block text-[11px]">Tanımlı Paket Türü</span>
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-extrabold text-amber-300">
                  {activeImpersonation.packageType || 'Premium'}
                </span>
                <button
                  onClick={() => handleOpenPackageModal(activeImpersonation)}
                  className="text-[10px] bg-white/20 hover:bg-white/30 px-1.5 py-0.5 rounded text-white font-semibold transition-colors"
                  title="Paketi ve modül izinlerini değiştir"
                >
                  Değiştir
                </button>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-xs">
              <span className="text-blue-200 block text-[11px]">Erişim Durumu</span>
              <span className="text-base font-bold text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                Yetkili Giriş Açık
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER (Matches the user's uploaded screenshot) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-6">
        {/* Top Action Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-4">
          {/* Left: Green Plus Button + Quick Filter Tabs */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              id="btn-add-yonetici"
              onClick={() => setShowAddModal(true)}
              className="w-10 h-10 rounded-lg bg-[#188038] hover:bg-[#137333] active:scale-95 text-white flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
              title="Yeni Yönetici Ekle"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Tümü ({yoneticiler.length})
              </button>
              <button
                onClick={() => setStatusFilter('Erişilebilir')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  statusFilter === 'Erişilebilir'
                    ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                    : 'hover:text-slate-900 text-emerald-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Erişilebilir ({yoneticiler.filter((y) => y.accessibility === 'Erişilebilir').length})
              </button>
              <button
                onClick={() => setStatusFilter('Erişilemez')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  statusFilter === 'Erişilemez'
                    ? 'bg-rose-600 text-white font-semibold shadow-2xs'
                    : 'hover:text-slate-900 text-rose-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Erişilemez ({yoneticiler.filter((y) => y.accessibility === 'Erişilemez').length})
              </button>
            </div>
          </div>

          {/* Right: Mesaj Gönder, Yönetici Ara, Excel */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end w-full lg:w-auto">
            {/* Mesaj Gönder (Cyan Button) */}
            <button
              id="btn-send-message"
              onClick={() => setShowMessageModal(true)}
              className="bg-[#00c5eb] hover:bg-[#00b2d6] text-white px-3 sm:px-4 py-2 rounded-md font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
              title="Yöneticilere Mesaj Gönder"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Mesaj Gönder</span>
              {selectedIds.length > 0 && (
                <span className="bg-white text-cyan-700 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ml-1">
                  {selectedIds.length}
                </span>
              )}
            </button>

            {/* Yönetici Ara Input */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                id="search-yonetici"
                type="text"
                placeholder="Yönetici Ara"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-slate-300 rounded-md px-3 py-1.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-52"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Excel Button */}
            <button
              id="btn-export-excel"
              onClick={handleExportExcel}
              className="bg-[#188038] hover:bg-[#137333] text-white px-3 sm:px-4 py-2 rounded-md font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
              title="Excel (CSV) Olarak İndir"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Secondary Bar: Package Filter Pills (Başlangıç, Profesyonel, Premium, Kurumsal) */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium mb-4 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold px-1 shrink-0">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] uppercase tracking-wider">Paket Filtresi:</span>
          </div>
          <button
            onClick={() => setPackageFilter('all')}
            className={`px-3 py-1 rounded-md transition-all whitespace-nowrap ${
              packageFilter === 'all'
                ? 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tüm Paketler ({yoneticiler.length})
          </button>
          {CANONICAL_PACKAGES.map((plan) => {
            const count = yoneticiler.filter((y) => normalizePlanName(y.packageType) === plan).length;
            const details = PACKAGE_DETAILS[plan];
            return (
              <button
                key={plan}
                onClick={() => setPackageFilter(plan)}
                className={`px-3 py-1 rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  packageFilter === plan
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{plan}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    packageFilter === plan
                      ? 'bg-blue-800 text-blue-100'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
                <span className="text-[10px] opacity-75 hidden sm:inline">
                  ({details?.priceFormatted})
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-header */}
        <div className="mb-4 px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Yönetici Listesi ve Yetkilendirme</span>
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={() => setSelectedIds([])}
              className="text-emerald-700 hover:underline shrink-0 font-medium"
            >
              Seçimi Temizle ({selectedIds.length})
            </button>
          )}
        </div>

        {/* MOBILE CARDS FOR YÖNETİCİLER (<768px) */}
        <div className="block md:hidden space-y-3">
          {filteredList.map((manager) => {
            const isSelected = selectedIds.includes(manager.id);
            const isCurrentActive = activeImpersonation?.id === manager.id;
            const currentPlan = normalizePlanName(manager.packageType);
            const planDetails = PACKAGE_DETAILS[currentPlan] || PACKAGE_DETAILS['Başlangıç Kulübü'];

            return (
              <div
                key={manager.id}
                className={`group p-5 rounded-2xl border transition-all space-y-4 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/30 shadow-sm'
                    : isCurrentActive
                    ? 'border-cyan-500 bg-cyan-50/20'
                    : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Header: Select + Avatar + Info + Accessibility Pill */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    {/* Checkbox circle */}
                    <div className="pt-1 shrink-0">
                      <button
                        onClick={() => toggleSelectOne(manager.id)}
                        className={`w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                        aria-label={`Yönetici seç: ${manager.name}`}
                      >
                        {isSelected && <span className="w-2 h-2 bg-white rounded-full" />}
                      </button>
                    </div>

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {manager.avatarUrl ? (
                        <img
                          src={manager.avatarUrl}
                          alt={manager.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-2xs">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                      {isCurrentActive && (
                        <span
                          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"
                          title="Aktif Oturum Açık"
                        />
                      )}
                    </div>

                    {/* Manager Name & Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">
                          {manager.name}
                        </h4>
                        {isCurrentActive && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-sm bg-blue-100 text-blue-700">
                            Aktif Giriş
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 truncate">{manager.email}</p>
                      <p className="text-[11px] text-blue-600 font-semibold truncate">{manager.schoolName}</p>
                    </div>
                  </div>

                  {/* Accessibility Toggle Button */}
                  <button
                    onClick={(e) => handleToggleAccessibility(manager.id, e)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer ${
                      manager.accessibility === 'Erişilebilir'
                        ? 'bg-[#188038] hover:bg-[#137333] text-white'
                        : 'bg-[#d93025] hover:bg-[#b3261e] text-white'
                    }`}
                  >
                    {manager.accessibility === 'Erişilebilir' ? (
                      <Unlock className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span>{manager.accessibility}</span>
                  </button>
                </div>

                {/* Details Grid: Telefon, Kod, Kayıt Tarihi */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px] mb-0.5">Telefon:</span>
                    <a href={`tel:${manager.phone}`} className="font-medium text-slate-900 hover:text-blue-600">
                      {manager.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] mb-0.5">Kod / Tarih:</span>
                    <span className="font-mono text-slate-900 font-semibold text-xs">{manager.code}</span>
                    <span className="text-[11px] text-slate-500 block">{manager.createdAt}</span>
                  </div>
                </div>

                {/* Package selector & Actions */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">Paket:</span>
                    <select
                      id={`select-package-mobile-${manager.id}`}
                      value={currentPlan}
                      onChange={(e) =>
                        handleChangeManagerPackage(manager.id, e.target.value as PackagePlanType)
                      }
                      className={`text-sm font-bold px-4 py-2.5 rounded-xl border appearance-none pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${planDetails.badgeClass}`}
                    >
                      {CANONICAL_PACKAGES.map((plan) => {
                        const details = PACKAGE_DETAILS[plan];
                        return (
                          <option key={plan} value={plan}>
                            {plan} (Seviye {details?.level})
                          </option>
                        );
                      })}
                    </select>
                    <button
                      onClick={() => handleOpenPackageModal(manager)}
                      className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Paket izinleri"
                    >
                      <SlidersHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Spor Okulu Girişi Butonu (Cyan) */}
                  <button
                    id={`btn-mobile-login-school-${manager.id}`}
                    onClick={() => {
                      if (manager.accessibility === 'Erişilebilir') {
                        setLoginModalManager(manager);
                      } else {
                        setInaccessibleModalManager(manager);
                      }
                    }}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer ${
                      manager.accessibility === 'Erişilebilir'
                        ? 'bg-[#00c5eb] hover:bg-[#00b2d6] text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 fill-current" />
                    <span>Giriş Yap</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredList.length === 0 && (
            <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 text-sm">Aramanıza uygun yönetici bulunamadı.</p>
              <p className="text-xs text-slate-400 mt-1">Filtreleri veya arama terimini değiştirmeyi deneyebilirsiniz.</p>
            </div>
          )}
        </div>

        {/* Desktop Table Content */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-700 select-none">
                <th className="py-3 px-2 w-10 text-center">
                  <button
                    onClick={toggleSelectAll}
                    title="Tümünü Seç"
                    className={`w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center ${
                      selectedIds.length === filteredList.length && filteredList.length > 0
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {selectedIds.length === filteredList.length && filteredList.length > 0 && (
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3 text-slate-800">Yönetici</th>
                <th className="py-3 px-3 text-slate-800">Telefon</th>
                <th className="py-3 px-3 text-slate-800">Üyelik Türü</th>
                <th className="py-3 px-3 text-slate-800">Paket Türü &amp; Yetki</th>
                <th className="py-3 px-3 text-slate-800 text-center">Erişilebilirlik</th>
                <th className="py-3 px-3 text-right text-slate-800 pr-4">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((manager) => {
                const isSelected = selectedIds.includes(manager.id);
                const isCurrentActive = activeImpersonation?.id === manager.id;
                const currentPlan = normalizePlanName(manager.packageType);
                const planDetails = PACKAGE_DETAILS[currentPlan] || PACKAGE_DETAILS['Başlangıç Kulübü'];

                return (
                  <tr
                    key={manager.id}
                    className={`transition-colors group hover:bg-slate-50/90 ${
                      isSelected ? 'bg-blue-50/40' : isCurrentActive ? 'bg-cyan-50/40' : ''
                    }`}
                  >
                    {/* Checkbox circle */}
                    <td className="py-4 px-2 text-center align-middle">
                      <button
                        onClick={() => toggleSelectOne(manager.id)}
                        className={`w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-slate-300 hover:border-slate-400'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </button>
                    </td>

                    {/* Yönetici (Avatar + Name + Email + Code + Date) */}
                    <td className="py-4 px-3 align-middle">
                      <div className="flex items-center gap-3.5">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          {manager.avatarUrl ? (
                            <img
                              src={manager.avatarUrl}
                              alt={manager.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-2xs">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}

                          {isCurrentActive && (
                            <span
                              className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"
                              title="Aktif Oturum Açık"
                            />
                          )}
                        </div>

                        {/* Info details */}
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-base leading-tight group-hover:text-blue-600 transition-colors">
                              {manager.name}
                            </h4>
                            {isCurrentActive && (
                              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700">
                                Aktif Giriş
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 leading-snug">
                            {manager.email}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                            <span>{manager.code}</span>
                            <span>•</span>
                            <span className="font-sans text-slate-400">{manager.createdAt}</span>
                          </div>
                          <p className="text-[11px] text-blue-600/80 font-medium">
                            {manager.schoolName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Telefon */}
                    <td className="py-4 px-3 align-middle text-sm text-slate-700 font-medium whitespace-nowrap">
                      {manager.phone}
                    </td>

                    {/* Üyelik Türü */}
                    <td className="py-4 px-3 align-middle text-sm text-slate-700 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{manager.role}</span>
                        <span className="text-[11px] text-slate-400">Yönetim Yetkisi</span>
                      </div>
                    </td>

                    {/* Paket Türü & Yetki (Dropdown + Detaylar Butonu + Seviye Özeti) */}
                    <td className="py-4 px-3 align-middle whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {/* Interactive Plan Selector Dropdown */}
                          <div className="relative inline-block">
                            <select
                              id={`select-package-${manager.id}`}
                              value={currentPlan}
                              onChange={(e) =>
                                handleChangeManagerPackage(
                                  manager.id,
                                  e.target.value as PackagePlanType
                                )
                              }
                              className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border appearance-none pr-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs transition-all ${planDetails?.badgeClass || ''}`}
                              title="Paket türünü değiştir (Erişim kısıtlamalarını anında günceller)"
                            >
                              {CANONICAL_PACKAGES.map((plan) => {
                                const details = PACKAGE_DETAILS[plan];
                                return (
                                  <option key={plan} value={plan}>
                                    {plan} (Seviye {details?.level})
                                  </option>
                                );
                              })}
                            </select>
                            <span className="text-[9px] text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                              ▼
                            </span>
                          </div>

                          {/* Package Permissions & Limits Details Modal Opener */}
                          <button
                            onClick={() => handleOpenPackageModal(manager)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title={`"${manager.name}" için paket izinlerini & modül kısıtlamalarını incele/değiştir`}
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Quick Permission Summary */}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <span className={`w-1.5 h-1.5 rounded-full ${planDetails?.dotColor || 'bg-slate-400'}`} />
                          <span className="font-medium text-slate-600">
                            {planDetails?.level === 1 && 'Tek Şube • 100 Sporcu • Temel Yetki'}
                            {planDetails?.level === 2 && '3 Şube • 350 Sporcu • Ön Muhasebe & Analitik'}
                            {planDetails?.level === 3 && 'Sınırsız Şube • 1.500+ Sporcu • Sporpuan & Tam Yetki'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Erişilebilirlik (Green pill: Erişilebilir / Red pill: Erişilemez) */}
                    <td className="py-4 px-3 align-middle text-center whitespace-nowrap">
                      <button
                        onClick={(e) => handleToggleAccessibility(manager.id, e)}
                        title={`Durumu değiştirmek için tıklayın (${manager.accessibility === 'Erişilebilir' ? 'Erişilemez yap' : 'Erişilebilir yap'})`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                          manager.accessibility === 'Erişilebilir'
                            ? 'bg-[#188038] hover:bg-[#137333] text-white'
                            : 'bg-[#d93025] hover:bg-[#b3261e] text-white'
                        }`}
                      >
                        {manager.accessibility === 'Erişilebilir' ? (
                          <Unlock className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                        <span>{manager.accessibility}</span>
                      </button>
                    </td>

                    {/* Action Icon: Google icon (if google auth) + Cyan User Icon (Hesaba Giriş Yap) */}
                    <td className="py-4 px-3 pr-4 align-middle text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        {/* Google Auth Icon */}
                        {manager.authProvider === 'google' && (
                          <div
                            className="w-6 h-6 flex items-center justify-center shrink-0 cursor-default"
                            title="Google Kimlik Doğrulaması ile Bağlı"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                              />
                              <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                              />
                            </svg>
                          </div>
                        )}

                        {/* Cyan User Silhouette Action Icon (Spor Okulu Hesabına Giriş Yap) */}
                        <button
                          id={`btn-login-school-${manager.id}`}
                          onClick={() => {
                            if (manager.accessibility === 'Erişilebilir') {
                              setLoginModalManager(manager);
                            } else {
                              setInaccessibleModalManager(manager);
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            manager.accessibility === 'Erişilebilir'
                              ? 'text-[#00c5eb] hover:text-[#009bb8] hover:bg-cyan-50'
                              : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                          }`}
                          title={
                            manager.accessibility === 'Erişilebilir'
                              ? `Admin olarak ${manager.name} spor okulu hesabına giriş yap (Paket: ${currentPlan})`
                              : `${manager.name} hesabı erişime kapalı (Detay ve yetki isteği)`
                          }
                        >
                          <User className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700">Aramanıza uygun yönetici bulunamadı.</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Filtreleri veya arama kriterlerini temizleyerek tekrar deneyebilirsiniz.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>Toplam {filteredList.length} yönetici listeleniyor</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#188038]" />
              Erişilebilir ({yoneticiler.filter((y) => y.accessibility === 'Erişilebilir').length})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#d93025]" />
              Erişilemez ({yoneticiler.filter((y) => y.accessibility === 'Erişilemez').length})
            </span>
          </div>
        </div>
      </div>

      {/* CONFIRM LOGIN TO SPORTS SCHOOL ACCOUNT MODAL */}
      {loginModalManager && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                <LogIn className="w-6 h-6" />
              </div>
              <button
                onClick={() => setLoginModalManager(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold text-slate-900">
                Spor Okulu Hesabına Giriş Yapılsın mı?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Admin olarak <b>{loginModalManager.schoolName}</b> hesabına doğrudan geçiş yapmak üzeresiniz.
              </p>

              {/* School Details Card */}
              <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Yönetici Adı:</span>
                  <span className="font-bold text-slate-800">{loginModalManager.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">E-Posta:</span>
                  <span className="font-medium text-slate-700">{loginModalManager.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Telefon:</span>
                  <span className="font-medium text-slate-700">{loginModalManager.phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Kayıtlı Öğrenci / Eğitmen:</span>
                  <span className="font-bold text-blue-700">
                    {loginModalManager.activeStudents || 120} Sporcu / {loginModalManager.activeTrainers || 6} Antrenör
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Erişilebilirlik Durumu:</span>
                  <span className="bg-[#188038] text-white px-2 py-0.5 rounded text-[11px] font-semibold">
                    Erişilebilir (Giriş İzni Açık)
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Bu oturum süper yönetici yetkisi ile başlatılır. Spor okulunun sporcularını, ders programlarını ve tahsilatlarını denetleyebilirsiniz. İstediğiniz an üst bardan oturumu kapatıp geri dönebilirsiniz.
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setLoginModalManager(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => handleLoginToSchool(loginModalManager)}
                className="px-5 py-2 rounded-lg bg-[#00c5eb] hover:bg-[#00b2d6] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Hesaba Geçiş Yap &amp; Giriş Aç</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INACCESSIBLE (ERİŞİLEMEZ) MODAL & FORCE ENABLE */}
      {inaccessibleModalManager && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <button
                onClick={() => setInaccessibleModalManager(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
                  Erişilemez
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Spor Okulu Hesabına Erişim Kapalı
                </h3>
              </div>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Yönetici <b>{inaccessibleModalManager.name}</b> ({inaccessibleModalManager.email}) için doğrudan hesaba giriş izni (Erişilebilirlik) şu anda kapalıdır.
              </p>

              <div className="mt-4 bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 space-y-2 text-xs text-rose-900">
                <p className="font-semibold text-rose-800">Olası Nedenler:</p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-700">
                  <li>Yönetici hesap ayarlarından süper admin erişim yetkisini askıya almış olabilir.</li>
                  <li>2 Adımlı Doğrulama (2FA) veya güvenlik anahtarı onayı beklenmektedir.</li>
                  <li>Sözleşme veya aktivite onay süreci henüz tamamlanmamış olabilir.</li>
                </ul>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <p className="font-medium text-slate-800 mb-1">Süper Admin Seçenekleri:</p>
                <p className="text-[11px]">
                  Süper yönetici olarak erişim kısıtlamasını kaldırabilir veya yöneticiye SMS/E-posta ile erişim talebi gönderebilirsiniz.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setInaccessibleModalManager(null);
                  showToast(`${inaccessibleModalManager.name} yöneticisine erişim talep bildirimi gönderildi.`, 'info');
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center justify-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Erişim İzni Talep Et</span>
              </button>

              <button
                type="button"
                onClick={() => handleForceEnableAndLogin(inaccessibleModalManager)}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-[#188038] hover:bg-[#137333] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Unlock className="w-4 h-4" />
                <span>Erişimi Aç ve Hesaba Giriş Yap</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ YÖNETİCİ EKLE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#188038] text-white flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Yeni Yönetici Ekle</h3>
                  <p className="text-xs text-slate-500">Spor okulu yöneticisi ve erişim profili oluşturun</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yönetici Adı Soyadı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Mehmet Çelik"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-Posta Adresi *
                </label>
                <input
                  type="email"
                  required
                  placeholder="mehmet@sporokulu.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefon Numarası
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Üyelik Türü
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Spor Okulu Admin"
                    className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Spor Okulu / Kulüp Adı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Yıldızlar Spor Akademisi"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paket Türü &amp; Erişim Yetki Düzeyi *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {CANONICAL_PACKAGES.map((plan) => {
                    const isSelected = newPackageType === plan;
                    const details = PACKAGE_DETAILS[plan];
                    return (
                      <button
                        type="button"
                        key={plan}
                        onClick={() => setNewPackageType(plan)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{plan}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <span className="text-[11px] font-semibold text-blue-600 block mt-0.5">
                          {details?.priceFormatted}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                          {details?.maxStudents} Öğrenci
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Erişilebilirlik Durumu (Admin Girişi)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewAccessibility('Erişilebilir')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      newAccessibility === 'Erişilebilir'
                        ? 'bg-[#188038] text-white border-[#188038] shadow-xs'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Erişilebilir (Giriş Açık)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewAccessibility('Erişilemez')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      newAccessibility === 'Erişilemez'
                        ? 'bg-[#d93025] text-white border-[#d93025] shadow-xs'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Erişilemez (Kapalı)</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  * "Erişilebilir" seçildiğinde süper admin tek tıkla bu spor okulunun hesabına giriş yapabilir.
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#188038] hover:bg-[#137333] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yöneticiyi Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YÖNETİCİ PAKET TÜRÜ VE ERİŞİM YETKİLERİ MODAL */}
      {packageModalManager && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Paket Türü &amp; Modül İzinlerini Yönet
                  </h3>
                  <p className="text-xs text-slate-500">
                    {packageModalManager.name} ({packageModalManager.schoolName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPackageModalManager(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Manager Summary */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Mevcut Tanımlı Paket:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {packageModalManager.packageType || 'Başlangıç'}
                  </span>
                </div>
                <div className="text-slate-400">
                  <span>Kod: {packageModalManager.code}</span> • <span>Telefon: {packageModalManager.phone}</span>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                Aktif Seçim: <strong className="text-blue-600 font-bold">{modalSelectedPlan}</strong>
              </div>
            </div>

            {/* 3 Package Cards */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Uygulanacak Paket Planını Seçin:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {CANONICAL_PACKAGES.map((plan) => {
                  const details = PACKAGE_DETAILS[plan];
                  const isSelected = modalSelectedPlan === plan;
                  const isOriginal = normalizePlanName(packageModalManager.packageType) === plan;

                  return (
                    <div
                      key={plan}
                      onClick={() => setModalSelectedPlan(plan)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-base">{plan}</h4>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${details.badgeClass}`}>
                              Seviye {details.level}
                            </span>
                            {isOriginal && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                Şu anki
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-blue-600 mt-1">
                            {details.priceFormatted}
                          </p>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 mt-2">{details.description}</p>

                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <div>
                          <span className="text-slate-400 block">Kapasite:</span>
                          <strong className="text-slate-800">{details.maxStudents} Öğrenci</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Eğitmen:</span>
                          <strong className="text-slate-800">{details.maxTrainers} Eğitmen</strong>
                        </div>
                      </div>

                      {/* Allowed vs Restricted modules summary */}
                      <div className="mt-3 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Erişebildiği Modüller:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {details.features.slice(0, 4).map((f, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium flex items-center gap-1"
                            >
                              <Check className="w-2.5 h-2.5" />
                              <span>{f}</span>
                            </span>
                          ))}
                        </div>

                        {details.restrictedFeatures.length > 0 && (
                          <>
                            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block mt-2">
                              Kısıtlanan Modüller:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {details.restrictedFeatures.map((rf, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-medium flex items-center gap-1"
                                >
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>{rf}</span>
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Warning note */}
            <div className="mt-4 p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs text-blue-800 flex items-start gap-2">
              <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Paket değişikliğini kaydettiğinizde, bu spor okulu yöneticisi seçilen paketin üstündeki modüllere tıkladığında otomatik olarak <strong>"Paket Yükseltme Gerekli"</strong> kısıtlama ekranıyla karşılaşır.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPackageModalManager(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleSavePackageModal}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Paketi ve Yetkileri Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MESAJ GÖNDER MODAL */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#00c5eb] text-white flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Yöneticilere Mesaj Gönder</h3>
                  <p className="text-xs text-slate-500">
                    {selectedIds.length > 0
                      ? `Seçili ${selectedIds.length} spor okulu yöneticisine mesaj iletin`
                      : `Tüm yöneticilere (${yoneticiler.length}) toplu duyuru gönderin`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendMessageSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gönderim Kanalı
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMessageChannel('email')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      messageChannel === 'email'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    E-Posta
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageChannel('sms')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      messageChannel === 'sms'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageChannel('both')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                      messageChannel === 'both'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    E-Posta + SMS
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mesaj Metni *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Sayın Spor Okulu Yöneticimiz, yeni sezon antrenman takvimleri ve..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 flex items-center justify-between">
                <span>Tahmini Alıcı Sayısı:</span>
                <span className="font-bold text-slate-800">
                  {selectedIds.length > 0 ? selectedIds.length : yoneticiler.length} Yönetici
                </span>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#00c5eb] hover:bg-[#00b2d6] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Mesajı Gönder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
