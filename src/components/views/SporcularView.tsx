import React, { useState, useEffect } from 'react';
import {
  Plus,
  UploadCloud,
  ClipboardList,
  Link2,
  Send,
  Search,
  FileSpreadsheet,
  Check,
  Edit2,
  Trash2,
  X,
  Copy,
  CheckCircle2,
  QrCode,
  FileUp,
  User,
  FileDown,
  Filter,
  Users,
  UserCheck,
  UserX,
  Phone,
  Calendar,
  ChevronRight,
  BarChart3,
  Building2,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { INITIAL_SPORCULAR } from '../../data/mockData';
import { SporcuItem, NavPage } from '../../types';
import { SporcuProfiliView } from './SporcuProfiliView';
import { SporcuD3OzetAlani } from './sporcu/SporcuD3OzetAlani';
import { downloadSporcuDevelopmentPdfReport } from '../../utils/sporcuPdfReportGenerator';
import { QuickPointAwardModal } from '../modals/QuickPointAwardModal';

interface SporcularViewProps {
  onNavigate?: (page: NavPage) => void;
}

export const SporcularView: React.FC<SporcularViewProps> = ({ onNavigate }) => {
  const [sporcular, setSporcular] = useState<SporcuItem[]>(() => {
    const saved = localStorage.getItem('sportsfly_sporcular');
    return saved ? JSON.parse(saved) : INITIAL_SPORCULAR;
  });

  useEffect(() => {
    localStorage.setItem('sportsfly_sporcular', JSON.stringify(sporcular));
  }, [sporcular]);

  // Synchronize on cross-view changes
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('sportsfly_sporcular');
      if (saved) {
        setSporcular(JSON.parse(saved));
      }
    };
    window.addEventListener('sportsfly_sporcular_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('sportsfly_sporcular_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'passive'>('all');
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(
    () => INITIAL_SPORCULAR[0]?.id || 's-1'
  );
  const [viewingProfileSporcu, setViewingProfileSporcu] = useState<SporcuItem | null>(null);
  const [quickPointSporcu, setQuickPointSporcu] = useState<SporcuItem | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreRegModal, setShowPreRegModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [editingSporcu, setEditingSporcu] = useState<SporcuItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBranch, setFormBranch] = useState('Basketbol');
  const [formTeamGroup, setFormTeamGroup] = useState('U14 Erkek Gelişim');
  const [formFacility, setFormFacility] = useState('DigiMondi');
  const [formBirthDate, setFormBirthDate] = useState('2012-05-15');

  // Pre-registration list mock
  const [preRegistrations, setPreRegistrations] = useState([
    { id: 'pr-1', name: 'Barış Koçak', email: 'baris.k@gmail.com', phone: '+90 530 111 22 33', facility: 'Saraçgym', branch: 'Basketbol', date: '09.09.2024' },
    { id: 'pr-2', name: 'Ezgi Yılmaz', email: 'ezgiyilmaz@gmail.com', phone: '+90 535 999 88 77', facility: 'DigiMondi', branch: 'Voleybol', date: '08.09.2024' },
  ]);

  // Invite link
  const [copiedLink, setCopiedLink] = useState(false);
  const inviteUrl = 'https://sportsfly.app/davet/sporsepeti-sporcu-kayit?ref=digimondi-422';

  // Message modal state
  const [messageChannel, setMessageChannel] = useState<'sms' | 'email'>('sms');
  const [messageContent, setMessageContent] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleActive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSporcular((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
    triggerToast('Sporcu aktiflik durumu güncellendi.');
  };

  const handleDeleteSporcu = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`${name} isimli sporcuyu listeden kaldırmak istediğinize emin misiniz?`)) {
      setSporcular((prev) => prev.filter((s) => s.id !== id));
      triggerToast(`${name} listeden kaldırıldı.`);
    }
  };

  const handleAddSporcu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

    const newSporcu: SporcuItem = {
      id: `s-${Date.now()}`,
      name: formName,
      email: formEmail,
      phone: formPhone || '+90 530 000 00 00',
      branch: formBranch,
      teamGroup: formTeamGroup,
      birthDate: formBirthDate,
      code,
      date: formattedDate,
      facility: formFacility,
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80',
    };

    setSporcular([newSporcu, ...sporcular]);
    setShowAddModal(false);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    triggerToast(`Yeni sporcu ${formName} başarıyla eklendi.`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSporcu) return;

    setSporcular((prev) =>
      prev.map((s) => (s.id === editingSporcu.id ? editingSporcu : s))
    );
    setEditingSporcu(null);
    triggerToast('Sporcu bilgileri güncellendi.');
  };

  const handleApprovePreReg = (item: typeof preRegistrations[0]) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const newSporcu: SporcuItem = {
      id: `s-${Date.now()}`,
      name: item.name,
      email: item.email,
      phone: item.phone,
      branch: item.branch || 'Basketbol',
      teamGroup: 'Aday Grubu',
      code,
      date: item.date,
      facility: item.facility,
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    };
    setSporcular([newSporcu, ...sporcular]);
    setPreRegistrations(preRegistrations.filter((p) => p.id !== item.id));
    triggerToast(`${item.name} ön kaydı onaylanarak sporcu listesine eklendi.`);
  };

  const handleExportExcel = () => {
    triggerToast('Sporcu listesi Excel olarak dışa aktarılıyor...');
    setTimeout(() => {
      const headers = ['Sporcu Adı', 'E-posta', 'Telefon', 'Branş', 'Grup', 'Sporcu Kodu', 'Kayıt Tarihi', 'Kulüp', 'Aktiflik'];
      const rows = filteredSporcular.map((s) => [
        s.name,
        s.email,
        s.phone || '-',
        s.branch || '-',
        s.teamGroup || '-',
        s.code,
        s.date,
        s.facility,
        s.isActive ? 'Aktif' : 'Pasif',
      ]);
      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Sporcu_Listesi_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('Excel başarıyla indirildi.');
    }, 400);
  };

  const handleDownloadPDFReport = async (targetSporcu?: SporcuItem) => {
    const target =
      targetSporcu ||
      sporcular.find((s) => s.id === selectedId) ||
      sporcular[0];

    if (!target || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);
      triggerToast(`${target.name} için gelişim & katılım PDF raporu hazırlanıyor...`);
      await downloadSporcuDevelopmentPdfReport({ sporcu: target });
      triggerToast(`✓ ${target.name} PDF raporu başarıyla indirildi!`);
    } catch (err) {
      console.error('PDF indirme hatası:', err);
      triggerToast('PDF oluşturulurken bir hata meydana geldi.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    setShowMessageModal(false);
    setMessageContent('');
    triggerToast(`Mesaj ${filteredSporcular.length} sporcuya başarıyla iletildi.`);
  };

  // Filter athletes
  const filteredSporcular = sporcular.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.code.includes(q) ||
      (s.phone && s.phone.includes(q)) ||
      (s.branch && s.branch.toLowerCase().includes(q)) ||
      (s.facility && s.facility.toLowerCase().includes(q));

    const matchesBranch = selectedBranch === 'all' || s.branch === selectedBranch;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && s.isActive) ||
      (selectedStatus === 'passive' && !s.isActive);
    const matchesFacility =
      selectedFacility === 'all' || s.facility.toLowerCase() === selectedFacility.toLowerCase();

    return matchesSearch && matchesBranch && matchesStatus && matchesFacility;
  });

  const totalCount = sporcular.length;
  const activeCount = sporcular.filter((s) => s.isActive).length;
  const passiveCount = totalCount - activeCount;

  // If a sporcu profile is being viewed, render the detailed profile view
  if (viewingProfileSporcu) {
    return (
      <div className="space-y-4">
        <SporcuProfiliView
          sporcu={viewingProfileSporcu}
          allSporcular={sporcular}
          onBack={() => setViewingProfileSporcu(null)}
          onSelectSporcu={(next) => {
            setSelectedId(next.id);
            setViewingProfileSporcu(next);
          }}
          onNavigate={onNavigate}
          onEditSporcu={(s) => setEditingSporcu(s)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150 text-xs sm:text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Sade Başlık & Özet Metrik Çubuğu */}
      <div className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Sporcular
            </h1>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/60">
              {totalCount} Kayıtlı
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kulüp sporcu havuzunuzu, lisans bilgilerini, aktiflik durumlarını ve iletişim detaylarını yönetin.
          </p>
        </div>

        {/* Hızlı Özet Sayaçları (Kompakt Rozetler) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#162238] border border-slate-200/70 dark:border-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Aktif:</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{activeCount}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#162238] border border-slate-200/70 dark:border-slate-700">
            <UserX className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Pasif:</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{passiveCount}</span>
          </div>

          <button
            onClick={() => setShowPreRegModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 border border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 transition-colors cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Ön Kayıt:</span>
            <span className="text-xs font-bold bg-blue-600 text-white rounded-full px-1.5 py-0.2">{preRegistrations.length}</span>
          </button>

          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              showAnalytics
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-white dark:bg-[#111c2e] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
            title="D3 Performans ve Katılım Grafiği"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{showAnalytics ? 'Grafiği Gizle' : 'Grafik Analiz'}</span>
          </button>
        </div>
      </div>

      {/* İsteğe Bağlı D3 Gelişim & Katılım Analizi Alanı (Açılıp Kapanabilir) */}
      {showAnalytics && (
        <div className="animate-in fade-in duration-200">
          <SporcuD3OzetAlani
            sporcular={sporcular}
            selectedSporcuId={selectedId}
            onSelectSporcu={(id) => setSelectedId(id)}
            onOpenProfile={(sporcu) => {
              setSelectedId(sporcu.id);
              setViewingProfileSporcu(sporcu);
            }}
          />
        </div>
      )}

      {/* 2. Ana Kart: Sade Kontrol Çubuğu, Filtreler & Tablo */}
      <div className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Üst İşlem ve Arama Çubuğu */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Sol İşlem Butonları (Sade & Düzenli Grup) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary: Yeni Sporcu Ekle */}
            <button
              id="btn-add-sporcu"
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Sporcu Ekle</span>
            </button>

            {/* Toplu Yükle */}
            <button
              id="btn-upload-sporcu"
              onClick={() => setShowUploadModal(true)}
              className="px-3 py-2 bg-slate-100 dark:bg-[#162238] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/70 dark:border-slate-700"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
              <span>Toplu Yükle</span>
            </button>

            {/* Davet Linki */}
            <button
              id="btn-invite-link"
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-2 bg-slate-100 dark:bg-[#162238] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/70 dark:border-slate-700"
            >
              <Link2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Davet Linki</span>
            </button>

            {/* Mesaj Gönder */}
            <button
              id="btn-send-message"
              onClick={() => setShowMessageModal(true)}
              className="px-3 py-2 bg-slate-100 dark:bg-[#162238] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/70 dark:border-slate-700"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" />
              <span>Toplu Mesaj</span>
            </button>
          </div>

          {/* Sağ Alan: Arama, PDF Rapor, Excel */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Arama Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="İsim, e-posta veya kod ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Dışa Aktar Açılır Menüsü */}
            <div className="relative">
              <button
                id="btn-sporcular-disa-aktar"
                type="button"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Dışa Aktarma Seçenekleri"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Dışa Aktar</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isExportMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsExportMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        handleDownloadPDFReport();
                      }}
                      disabled={isGeneratingPdf}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      {isGeneratingPdf ? (
                        <div className="w-4 h-4 border-2 border-rose-600/30 border-t-rose-600 rounded-full animate-spin shrink-0" />
                      ) : (
                        <FileDown className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{isGeneratingPdf ? 'PDF Hazırlanıyor...' : 'Gelişim PDF Raporu'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        handleExportExcel();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100 dark:border-slate-800"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Excel (.CSV) Tablosu</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Branş ve Durum Hızlı Filtre Sekmeleri */}
        <div className="px-4 py-2.5 bg-slate-50/60 dark:bg-[#162238]/30 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Branş Tabları */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1 text-[11px]">Branş:</span>
            {['all', 'Basketbol', 'Voleybol', 'Yüzme', 'Jimnastik'].map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBranch(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedBranch === b
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-[#111c2e] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700'
                }`}
              >
                {b === 'all' ? 'Tüm Branşlar' : b}
              </button>
            ))}
          </div>

          {/* Durum & Tesis Filtresi */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-2.5 py-1 text-xs bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Yalnızca Aktifler</option>
              <option value="passive">Yalnızca Pasifler</option>
            </select>

            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">Tüm Tesisler</option>
              <option value="DigiMondi">DigiMondi</option>
              <option value="Saraçgym">Saraçgym</option>
              <option value="aicosports">aicosports</option>
              <option value="Selman Utku">Selman Utku</option>
            </select>
          </div>
        </div>

        {/* Mobil ve Dokunmatik Ekranlar İçin Sporcu Kart Listesi */}
        <div className="block lg:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredSporcular.length > 0 ? (
            filteredSporcular.map((sporcu) => {
              const isChecked = selectedId === sporcu.id;
              return (
                <div
                  key={sporcu.id}
                  onClick={() => {
                    setSelectedId(sporcu.id);
                    setViewingProfileSporcu(sporcu);
                  }}
                  className={`p-4 transition-colors ${
                    isChecked ? 'bg-blue-50/40 dark:bg-blue-950/20' : 'bg-white dark:bg-[#111c2e]'
                  }`}
                >
                  {/* Üst Satır: Avatar, Bilgiler ve Durum */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={
                            sporcu.avatarUrl ||
                            'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80'
                          }
                          alt={sporcu.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                        />
                        {sporcu.isActive && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#111c2e] rounded-full"
                            title="Aktif Sporcu"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                          <span className="truncate">{sporcu.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5 text-[11px]">
                          <span className="font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                            {sporcu.branch || 'Basketbol'}
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {sporcu.teamGroup || 'Gelişim Takımı'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span>{sporcu.facility}</span>
                          <span>•</span>
                          <span className="font-mono">{sporcu.code}</span>
                        </div>
                      </div>
                    </div>

                    {/* Aktiflik Durumu (44px dokunmatik alan) */}
                    <button
                      onClick={(e) => handleToggleActive(sporcu.id, e)}
                      className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        sporcu.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                      title={sporcu.isActive ? 'Tıkla: Pasife al' : 'Tıkla: Aktif et'}
                    >
                      <Check className={`w-3.5 h-3.5 ${sporcu.isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{sporcu.isActive ? 'Aktif' : 'Pasif'}</span>
                    </button>
                  </div>

                    {/* Mobil Kısayol Butonları: Geniş Dokunmatik 'Hızlı Puan Ver' */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    {/* HIZLI PUAN VER BUTONU - Geniş ergonomik dokunmatik alan */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(sporcu.id);
                        setQuickPointSporcu(sporcu);
                      }}
                      className="flex-1 min-h-[46px] px-4 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all cursor-pointer select-none"
                      title="Sporcuya Hızlı Puan Ver"
                    >
                      <Zap className="w-4 h-4 fill-slate-950 text-slate-950 shrink-0" />
                      <span>Hızlı Puan Ver</span>
                    </button>

                    {/* Rapor Butonu */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(sporcu.id);
                        handleDownloadPDFReport(sporcu);
                      }}
                      className="min-h-[46px] min-w-[46px] px-3.5 py-2.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-200/70 dark:border-rose-800/70 transition-colors cursor-pointer"
                      title="Gelişim PDF Raporu İndir"
                    >
                      <FileDown className="w-4 h-4" />
                      <span className="hidden xs:inline">Rapor</span>
                    </button>

                    {/* Düzenle Butonu */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSporcu(sporcu);
                      }}
                      className="min-h-[46px] min-w-[46px] p-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center justify-center transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                      title="Düzenle"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400">
              <p className="font-semibold text-sm">Arama kriterlerine uygun sporcu bulunamadı.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBranch('all');
                  setSelectedStatus('all');
                  setSelectedFacility('all');
                }}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline mt-2 inline-block cursor-pointer"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>

        {/* Sporcu Tablosu (Masaüstü & Geniş Tabletler) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-[#162238]/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">Seçim</th>
                <th className="py-3 px-4">Sporcu Bilgileri</th>
                <th className="py-3 px-4">Branş &amp; Yaş Grubu</th>
                <th className="py-3 px-4">Tesis / Kulüp</th>
                <th className="py-3 px-4">Kayıt Tarihi</th>
                <th className="py-3 px-4 text-center">Durum</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSporcular.length > 0 ? (
                filteredSporcular.map((sporcu) => {
                  const isChecked = selectedId === sporcu.id;

                  return (
                    <tr
                      key={sporcu.id}
                      onClick={() => {
                        setSelectedId(sporcu.id);
                        setViewingProfileSporcu(sporcu);
                      }}
                      className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group ${
                        isChecked ? 'bg-blue-50/40 dark:bg-blue-950/30' : ''
                      }`}
                      title="Sporcu detay profilini açmak için tıklayın"
                    >
                      {/* Radio Selection */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="radio"
                          name="selectedSporcu"
                          checked={isChecked}
                          onChange={() => setSelectedId(sporcu.id)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 cursor-pointer"
                        />
                      </td>

                      {/* Sporcu Info: Avatar + Name + Email + Phone + Code */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={sporcu.avatarUrl || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80'}
                            alt={sporcu.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0 group-hover:ring-blue-500 transition-all group-hover:scale-105"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              <span className="group-hover:underline">{sporcu.name}</span>
                              {sporcu.isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Aktif Sporcu" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <span>{sporcu.email}</span>
                              {sporcu.phone && (
                                <>
                                  <span className="mx-1">&bull;</span>
                                  <span>{sporcu.phone}</span>
                                </>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                              Lisans Kodu: <strong className="text-slate-600 dark:text-slate-400">{sporcu.code}</strong>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Branş & Yaş Grubu */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {sporcu.teamGroup || 'Gelişim Takımı'}
                        </div>
                        <span className="inline-block text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded mt-0.5">
                          {sporcu.branch || 'Basketbol'}
                        </span>
                      </td>

                      {/* Tesis / Kulüp */}
                      <td className="py-3 px-4">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {sporcu.facility}
                        </div>
                      </td>

                      {/* Kayıt Tarihi */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {sporcu.date}
                      </td>

                      {/* Durum / Aktiflik Toggle */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(sporcu.id, e);
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                            sporcu.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                          title={sporcu.isActive ? 'Tıkla: Pasife al' : 'Tıkla: Aktif et'}
                        >
                          <Check className={`w-3 h-3 ${sporcu.isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{sporcu.isActive ? 'Aktif' : 'Pasif'}</span>
                        </button>
                      </td>

                      {/* İşlemler */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Hızlı Puan Ver Butonu */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(sporcu.id);
                              setQuickPointSporcu(sporcu);
                            }}
                            className="min-h-[32px] px-2.5 py-1 text-amber-950 dark:text-amber-300 bg-amber-500/15 dark:bg-amber-950/60 hover:bg-amber-500/25 dark:hover:bg-amber-900/60 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs border border-amber-300/80 dark:border-amber-700/80 cursor-pointer shadow-2xs active:scale-95"
                            title="Sporcuya Hızlı Puan Ver (Sporpuan)"
                          >
                            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600 shrink-0" />
                            <span>Hızlı Puan</span>
                          </button>

                          {/* Rapor PDF */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(sporcu.id);
                              handleDownloadPDFReport(sporcu);
                            }}
                            className="px-2.5 py-1 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs border border-rose-200/70 dark:border-rose-800/70 cursor-pointer"
                            title="Gelişim ve Katılım PDF Raporunu İndir"
                          >
                            <FileDown className="w-3 h-3" />
                            <span>Rapor</span>
                          </button>

                          {/* Düzenle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSporcu(sporcu);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Sil */}
                          <button
                            onClick={(e) => handleDeleteSporcu(sporcu.id, sporcu.name, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Listeden Kaldır"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <p className="font-semibold text-sm">Arama kriterlerine uygun sporcu bulunamadı.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedBranch('all');
                        setSelectedStatus('all');
                        setSelectedFacility('all');
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline mt-2 inline-block cursor-pointer"
                    >
                      Filtreleri Temizle
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tablo Alt Bilgi Çubuğu */}
        <div className="p-3.5 bg-slate-50/70 dark:bg-[#162238]/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Görüntülenen: <strong>{filteredSporcular.length}</strong> / {totalCount} Sporcu
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Aktif: {activeCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Pasif: {passiveCount}
            </span>
          </div>
        </div>
      </div>

      {/* Modal 1: Yeni Sporcu Ekle */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Yeni Sporcu Kaydı
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSporcu} className="py-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sporcu Adı Soyadı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Emirhan Yıldız"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    E-posta Adresi *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sporcu@gmail.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telefon / Veli Telefonu
                  </label>
                  <input
                    type="tel"
                    placeholder="+90 532 000 00 00"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Branş
                  </label>
                  <select
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Basketbol">Basketbol</option>
                    <option value="Voleybol">Voleybol</option>
                    <option value="Yüzme">Yüzme</option>
                    <option value="Jimnastik">Jimnastik</option>
                    <option value="Futbol">Futbol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Grup / Kategori
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: U14 Erkek Gelişim A"
                    value={formTeamGroup}
                    onChange={(e) => setFormTeamGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kulüp / Tesis
                </label>
                <select
                  value={formFacility}
                  onChange={(e) => setFormFacility(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                >
                  <option value="DigiMondi">DigiMondi (Merkez Kampüs)</option>
                  <option value="Saraçgym">Saraçgym (Batı Tesisi)</option>
                  <option value="aicosports">aicosports (Doğu Akademi)</option>
                  <option value="Selman Utku">Selman Utku Bireysel</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-2xs cursor-pointer"
                >
                  Sporcuyu Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Toplu Sporcu Yükle (Excel/CSV drag-drop) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-600" />
                Toplu Sporcu Yükleme (Excel / CSV)
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="border-2 border-dashed border-blue-200 dark:border-blue-900/60 hover:border-blue-400 rounded-2xl p-7 text-center bg-blue-50/30 dark:bg-blue-950/20 transition-colors cursor-pointer">
                <FileUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Excel veya CSV dosyanızı buraya sürükleyin
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  veya dosya seçmek için tıklayın (.xlsx, .xls, .csv)
                </p>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  className="hidden"
                  id="excel-file-input"
                  onChange={() => {
                    setShowUploadModal(false);
                    triggerToast('Dosyadaki sporcular başarıyla listeye aktarıldı!');
                  }}
                />
                <label
                  htmlFor="excel-file-input"
                  className="inline-block mt-3 px-4 py-2 bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  Dosya Seç
                </label>
              </div>

              <div className="bg-slate-50 dark:bg-[#162238]/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  Desteklenen Kolonlar:
                </span>
                Ad Soyad, E-posta, Telefon, Branş, Yaş Grubu, Tesis Adı, Lisans No
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Ön Kayıt Talepleri */}
      {showPreRegModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                Ön Kayıt Talepleri ({preRegistrations.length})
              </h3>
              <button
                onClick={() => setShowPreRegModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 max-h-80 overflow-y-auto">
              {preRegistrations.length > 0 ? (
                preRegistrations.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-50 dark:bg-[#162238]/60 border border-slate-200/80 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.email} • {item.phone}</p>
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded mt-1 inline-block">
                        {item.facility} • {item.branch} • {item.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApprovePreReg(item)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
                      >
                        Onayla &amp; Ekle
                      </button>
                      <button
                        onClick={() => {
                          setPreRegistrations(preRegistrations.filter((p) => p.id !== item.id));
                          triggerToast('Ön kayıt reddedildi.');
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Reddet"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-xs text-slate-400">
                  Bekleyen ön kayıt bulunmamaktadır.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Davet Linki & Karekod */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-600" />
                Sporcu Kayıt Davet Linki
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Bu bağlantıyı veliler ve sporcularla paylaşarak dijital kayıt formunu doldurmalarını sağlayabilirsiniz.
              </p>

              <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-xl">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="bg-transparent text-xs text-slate-700 dark:text-slate-300 font-mono flex-1 outline-hidden px-2"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Kopyalandı' : 'Kopyala'}
                </button>
              </div>

              <div className="flex items-center justify-center p-4 bg-slate-50 dark:bg-[#162238]/60 rounded-xl border border-slate-200/60 dark:border-slate-700 text-center">
                <div>
                  <div className="w-24 h-24 bg-white border border-slate-300 rounded-lg mx-auto flex items-center justify-center shadow-2xs">
                    <QrCode className="w-20 h-20 text-slate-800" />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-2 block font-medium">
                    Karekod ile Kolay Kayıt
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Mesaj Gönder */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                Sporculara Toplu Duyuru / Mesaj
              </h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="py-4 space-y-3">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="msgChannel"
                    checked={messageChannel === 'sms'}
                    onChange={() => setMessageChannel('sms')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  SMS Bildirimi
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="msgChannel"
                    checked={messageChannel === 'email'}
                    onChange={() => setMessageChannel('email')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  E-Posta Bülteni
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mesaj Metni *
                </label>
                <textarea
                  required
                  rows={4}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Sporculara veya velilere iletilecek bilgilendirme metni..."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Gönder ({filteredSporcular.length} Sporcu)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Sporcu Bilgilerini Düzenle */}
      {editingSporcu && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-600" />
                Sporcu Bilgilerini Düzenle
              </h3>
              <button
                onClick={() => setEditingSporcu(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  required
                  value={editingSporcu.name}
                  onChange={(e) =>
                    setEditingSporcu({ ...editingSporcu, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  required
                  value={editingSporcu.email}
                  onChange={(e) =>
                    setEditingSporcu({ ...editingSporcu, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Branş
                  </label>
                  <input
                    type="text"
                    value={editingSporcu.branch || ''}
                    onChange={(e) =>
                      setEditingSporcu({ ...editingSporcu, branch: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tesis / Kulüp
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSporcu.facility}
                    onChange={(e) =>
                      setEditingSporcu({ ...editingSporcu, facility: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-[#162238] border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSporcu(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-2xs cursor-pointer"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal 6: Hızlı Puan Ver (SporPuan) Modal */}
      <QuickPointAwardModal
        isOpen={!!quickPointSporcu}
        onClose={() => setQuickPointSporcu(null)}
        sporcu={quickPointSporcu}
        onSuccess={(msg) => triggerToast(msg)}
      />
    </div>
  );
};
