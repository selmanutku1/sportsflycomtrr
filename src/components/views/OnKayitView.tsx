import React, { useState, useMemo, useEffect } from 'react';
import {
  UserPlus,
  Link as LinkIcon,
  Copy,
  Check,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Phone,
  Mail,
  User,
  Shield,
  HeartPulse,
  Share2,
  QrCode,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  X,
  Printer,
  ExternalLink,
  Info,
  CheckCircle2,
  Clock,
  Ban,
  Building,
  Activity,
  Award,
  FileText,
  MapPin,
} from 'lucide-react';
import { SportsFlyIcon } from '../SportsFlyLogo';
import { OnKayitItem, OnKayitDurumu, SporcuItem } from '../../types';
import { INITIAL_ON_KAYITLAR, INITIAL_SPORCULAR } from '../../data/mockData';
import { LegalDocPreviewModal } from '../modals/LegalDocPreviewModal';
import { TURKEY_CITIES, getDistrictsForCity } from '../../data/turkeyCitiesData';

export const OnKayitView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'liste' | 'yeni-kayit'>('liste');
  const [records, setRecords] = useState<OnKayitItem[]>(() => {
    const saved = localStorage.getItem('sportsfly_on_kayitlar');
    return saved ? JSON.parse(saved) : INITIAL_ON_KAYITLAR;
  });

  // Save records to localStorage whenever they change and notify other views
  useEffect(() => {
    localStorage.setItem('sportsfly_on_kayitlar', JSON.stringify(records));
    try {
      window.dispatchEvent(new Event('sportsfly_on_kayitlar_updated'));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('sportsfly_on_kayitlar_channel');
        bc.postMessage({ type: 'updated', count: records.length });
        bc.close();
      }
    } catch (e) {}
  }, [records]);

  // Synchronize on cross-view / cross-tab changes
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('sportsfly_on_kayitlar');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setRecords(parsed);
          }
        } catch (e) {}
      }
    };
    window.addEventListener('sportsfly_on_kayitlar_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('sportsfly_on_kayitlar_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const [statusFilter, setStatusFilter] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('Tümü');
  const [subeFilter, setSubeFilter] = useState('Tümü');
  const [cinsiyetFilter, setCinsiyetFilter] = useState('Tümü');
  const [ulasmaTuruFilter, setUlasmaTuruFilter] = useState('Tümü');

  // Modal states
  const [selectedRecord, setSelectedRecord] = useState<OnKayitItem | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedLinkBranch, setSelectedLinkBranch] = useState('Tümü');
  const [selectedLinkBranchName, setSelectedLinkBranchName] = useState('Tüm Branşlar');
  const [isPreviewPublicModalOpen, setIsPreviewPublicModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Legal Document Preview Modal State
  const [legalModalDoc, setLegalModalDoc] = useState<string | null>(null);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  const handleOpenLegalDoc = (docKey: string) => {
    setLegalModalDoc(docKey);
    setIsLegalModalOpen(true);
  };

  const handleAcceptLegalDoc = (docKey: string) => {
    if (docKey === 'kvkk') {
      setFormData((prev) => ({ ...prev, kvkkAydinlatmaOnay: true }));
    } else if (docKey === 'acik-riza') {
      setFormData((prev) => ({ ...prev, acikRizaOnay: true }));
    } else if (docKey === 'fotograf-video') {
      setFormData((prev) => ({ ...prev, fotografVideoIzni: true }));
    } else if (docKey === 'iletisim') {
      setFormData((prev) => ({ ...prev, iletisimKampanyaIzni: true }));
    } else if (docKey === 'veli-onay') {
      setFormData((prev) => ({ ...prev, veliOnayi: true }));
    }
    setNotification('Yasal metin onaylandı ve ilgili kutucuk işaretlendi.');
    setTimeout(() => setNotification(null), 3000);
  };

  // Form State
  const initialFormState: Partial<OnKayitItem> = {
    bagliOnKayit: 'Yok',
    onKayitTarihi: new Date().toISOString().split('T')[0],
    sube: 'Kadıköy Merkez Şube',
    brans: 'Basketbol',
    sporcuAdSoyad: '',
    cinsiyet: 'Erkek',
    tcKimlikNo: '',
    dogumTarihi: '2015-01-01',
    telefon: '',
    il: 'İstanbul',
    ilce: 'Kadıköy',
    adres: '',
    boy: '',
    kilo: '',
    veliAdSoyad: '',
    veliTelefon: '',
    veliEposta: '',
    veliMeslek: '',
    veliEgitimDurumu: 'Lisans',
    saglikDurumu: 'Sağlıklı, spor yapmasında engel yoktur',
    alerjiDurumu: '',
    kronikRahatsizlik: '',
    davranissalOzelDurum: '',
    duzenliKullanilanIlac: '',
    acilDurumAranacakKisi: '',
    acilDurumTelefonu: '',
    ulasmaTuru: 'Referans / Tavsiye',
    referansVerenKisi: '',
    ekAciklama: '',
    gorusmeYapan: 'Sistem Yöneticisi',
    gorusmeTuru: 'Telefon',
    gorusmeTarihi: new Date().toISOString().split('T')[0],
    gorusmeNotlari: '',
    ilgilenilenBrans: 'Basketbol',
    tercihEdilenGunler: ['Cumartesi', 'Pazar'],
    tercihEdilenSaatler: '10:00 - 12:00',
    beklenenSozlesmeTutari: 25000,
    sozlesmeOlasiligi: 'Yüksek',
    gerceklesenSozlesmeTutari: 0,
    sozlesmeTarihi: '',
    odemeDurumu: 'Bekliyor',
    odemeYontemi: 'Kredi Kartı',
    indirimKampanya: '',
    kaybedilmeNedeni: '',
    kvkkAydinlatmaOnay: true,
    acikRizaOnay: true,
    fotografVideoIzni: true,
    iletisimKampanyaIzni: true,
    veliOnayi: true,
    kayitOlusturanKullanici: 'Admin (SportsFly)',
    kayitDurumu: 'Ön Kayıt',
  };

  const [formData, setFormData] = useState<Partial<OnKayitItem>>(initialFormState);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesStatus = statusFilter === 'Tümü' || r.kayitDurumu === statusFilter;
      const matchesBranch = branchFilter === 'Tümü' || r.brans === branchFilter;
      const matchesSube = subeFilter === 'Tümü' || r.sube === subeFilter;
      const matchesCinsiyet = cinsiyetFilter === 'Tümü' || r.cinsiyet === cinsiyetFilter;
      const matchesUlasma = ulasmaTuruFilter === 'Tümü' || r.ulasmaTuru === ulasmaTuruFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.sporcuAdSoyad.toLowerCase().includes(q) ||
        r.veliAdSoyad.toLowerCase().includes(q) ||
        r.onKayitNo.toLowerCase().includes(q) ||
        r.veliTelefon.includes(q) ||
        r.tcKimlikNo.includes(q);
      return matchesStatus && matchesBranch && matchesSube && matchesCinsiyet && matchesUlasma && matchesSearch;
    });
  }, [records, statusFilter, branchFilter, subeFilter, cinsiyetFilter, ulasmaTuruFilter, searchQuery]);

  // Status counts for badge tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Tümü: records.length,
      'Ön Kayıt': 0,
      'Görüşme Yapıldı': 0,
      'Deneme Antrenmanı': 0,
      'Sözleşme Bekleniyor': 0,
      'Kayıt Oldu': 0,
      'Kayıt Olmadı': 0,
      İptal: 0,
    };
    records.forEach((r) => {
      if (counts[r.kayitDurumu] !== undefined) {
        counts[r.kayitDurumu]++;
      }
    });
    return counts;
  }, [records]);

  // Show notification helper
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sporcuAdSoyad || !formData.veliAdSoyad || !formData.veliTelefon) {
      alert('Lütfen Sporcu Adı Soyadı, Veli Adı Soyadı ve Veli Telefonunu doldurunuz.');
      return;
    }

    if (!formData.acilDurumAranacakKisi || !formData.acilDurumTelefonu) {
      alert('Çocuk sporcuların güvenliği için Acil Durumda Aranacak Kişi ve Telefonu zorunludur.');
      return;
    }

    const nextIdNumber = records.length + 1;
    const newRecord: OnKayitItem = {
      ...(formData as OnKayitItem),
      id: `ok-${Date.now()}`,
      onKayitNo: `ÖNK-2026-${String(nextIdNumber).padStart(3, '0')}`,
      kayitTarihi: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      sonGuncellemeTarihi: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      kayitOlusturanKullanici: 'Admin (SportsFly)',
      kayitDurumu: formData.kayitDurumu || 'Ön Kayıt',
    };

    setRecords([newRecord, ...records]);
    setFormData(initialFormState);
    setActiveTab('liste');
    triggerNotification(`"${newRecord.sporcuAdSoyad}" için ${newRecord.onKayitNo} numaralı ön kayıt başarıyla oluşturuldu!`);
  };

  // Convert Pre-registration to real Athlete (Autonomously mapping profile fields)
  const convertToSporcu = (item: OnKayitItem) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;

    // Clean branch location label
    const cleanedFacility = item.sube.replace(' Şube', '').replace(' Şubesi', '');

    const newSporcu: SporcuItem = {
      id: `s-ok-${item.id}`,
      name: item.sporcuAdSoyad,
      email: item.veliEposta || `${item.sporcuAdSoyad.toLowerCase().replace(/\s+/g, '')}@sportsfly-student.com`,
      phone: item.veliTelefon || item.telefon || '+90 530 000 00 00',
      branch: item.brans,
      teamGroup: 'Aday Grubu',
      code,
      date: formattedDate,
      facility: cleanedFacility,
      isActive: true,
      avatarUrl: item.cinsiyet === 'Erkek'
        ? 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      birthDate: item.dogumTarihi ? item.dogumTarihi.split('-').reverse().join('.') : '15.05.2012'
    };

    const savedSporcular = localStorage.getItem('sportsfly_sporcular');
    let currentSporcular: SporcuItem[] = savedSporcular ? JSON.parse(savedSporcular) : INITIAL_SPORCULAR;

    if (!currentSporcular.some(s => s.name === newSporcu.name && s.phone === newSporcu.phone)) {
      currentSporcular = [newSporcu, ...currentSporcular];
      localStorage.setItem('sportsfly_sporcular', JSON.stringify(currentSporcular));
      
      // Dispatch events for immediate reactivity
      window.dispatchEvent(new Event('sportsfly_sporcular_updated'));
      triggerNotification(`"${newSporcu.name}" isimli sporcu otomatik olarak ana listeye aktarıldı!`);
    } else {
      triggerNotification(`"${newSporcu.name}" zaten sporcu listesinde bulunuyor.`);
    }
  };

  // Quick change status
  const handleQuickStatusChange = (id: string, newStatus: OnKayitDurumu) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updatedRecord = {
            ...r,
            kayitDurumu: newStatus,
            sonGuncellemeTarihi:
              new Date().toLocaleDateString('tr-TR') +
              ' ' +
              new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          };
          if (newStatus === 'Kayıt Oldu') {
            convertToSporcu(updatedRecord);
          }
          return updatedRecord;
        }
        return r;
      })
    );
    triggerNotification(`Durum "${newStatus}" olarak güncellendi.`);
  };

  // Generate public registration URL
  const publicRegistrationLink = `https://sportsfly.com.tr/on-kayit/kadikoy-merkez?ref=web&sube=${encodeURIComponent(
    selectedLinkBranch
  )}&brans=${encodeURIComponent(selectedLinkBranchName)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicRegistrationLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Ön Kayıt No',
      'Ön Kayıt Tarihi',
      'Şube',
      'Branş',
      'Sporcu Adı',
      'Cinsiyet',
      'T.C. Kimlik',
      'Doğum Tarihi',
      'İl',
      'İlçe',
      'Adres',
      'Veli Adı',
      'Veli Telefon',
      'Veli E-posta',
      'Acil Durum Kişi',
      'Acil Durum Tel',
      'Ulaşma Türü',
      'Kayıt Durumu',
      'Beklenen Tutar',
      'Görüşme Yapan',
    ];

    const rows = filteredRecords.map((r) => [
      r.onKayitNo,
      r.onKayitTarihi,
      `"${r.sube}"`,
      `"${r.brans}"`,
      `"${r.sporcuAdSoyad}"`,
      r.cinsiyet,
      r.tcKimlikNo,
      r.dogumTarihi,
      `"${r.il || ''}"`,
      `"${r.ilce || ''}"`,
      `"${(r.adres || '').replace(/"/g, '""')}"`,
      `"${r.veliAdSoyad}"`,
      `"${r.veliTelefon}"`,
      `"${r.veliEposta}"`,
      `"${r.acilDurumAranacakKisi}"`,
      `"${r.acilDurumTelefonu}"`,
      `"${r.ulasmaTuru}"`,
      `"${r.kayitDurumu}"`,
      r.beklenenSozlesmeTutari || 0,
      `"${r.gorusmeYapan || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SportsFly_On_Kayitlar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Color helper for status badge
  const getStatusBadge = (status: OnKayitDurumu) => {
    switch (status) {
      case 'Ön Kayıt':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Görüşme Yapıldı':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Deneme Antrenmanı':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Sözleşme Bekleniyor':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Kayıt Oldu':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Kayıt Olmadı':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'İptal':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{notification}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Ön Kayıt Yönetimi
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {records.length} Başvuru
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Public Link Button */}
          <button
            id="btn-get-on-kayit-link"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <LinkIcon className="w-4 h-4" />
            <span>Ön Kayıt Linki Al</span>
          </button>

          {/* New Registration Button */}
          <button
            id="btn-switch-tab"
            onClick={() => setActiveTab(activeTab === 'liste' ? 'yeni-kayit' : 'liste')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer ${
              activeTab === 'yeni-kayit'
                ? 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {activeTab === 'liste' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Yeni Ön Kayıt Ekle</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Kayıt Listesine Dön</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* QUICK INFO BANNER FOR PUBLIC LINK */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 sm:p-5 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <SportsFlyIcon className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm sm:text-base">Velilere Doğrudan Ön Kayıt Linki Gönderin</h3>
          </div>
          <p className="text-xs text-blue-100 max-w-2xl">
            Sosyal medya, Instagram biyografisi, WhatsApp veya web sitenizde paylaşabileceğiniz özel form ile veliler 9 adımlı formu telefonlarından saniyeler içinde doldurabilir.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setIsShareModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Share2 className="w-3.5 h-3.5" />
            Linki Paylaş & QR
          </button>
        </div>
      </div>

      {/* VIEW: 1. LIST VIEW */}
      {activeTab === 'liste' && (
        <div className="space-y-4">
          {/* Status Filters Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {[
              'Tümü',
              'Ön Kayıt',
              'Görüşme Yapıldı',
              'Deneme Antrenmanı',
              'Sözleşme Bekleniyor',
              'Kayıt Oldu',
              'Kayıt Olmadı',
              'İptal',
            ].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    statusFilter === st
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {statusCounts[st] ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Secondary Filter Bar with all requested filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search Box */}
              <div className="relative md:col-span-4">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Sporcu, veli adı, T.C. veya telefon ara..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-slate-50/50"
                />
              </div>

              {/* Branch Filter */}
              <div className="md:col-span-2">
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Tümü">Tüm Branşlar</option>
                  <option value="Basketbol">Basketbol</option>
                  <option value="Voleybol">Voleybol</option>
                  <option value="Yüzme">Yüzme</option>
                  <option value="Futbol">Futbol</option>
                  <option value="Jimnastik">Jimnastik</option>
                </select>
              </div>

              {/* Sube Filter */}
              <div className="md:col-span-2">
                <select
                  value={subeFilter}
                  onChange={(e) => setSubeFilter(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Tümü">Tüm Şubeler</option>
                  <option value="Kadıköy Merkez Şube">Kadıköy Merkez</option>
                  <option value="Ataşehir Batı Ataşehir Şubesi">Ataşehir Batı</option>
                  <option value="Kartal Sahil Tesisleri">Kartal Sahil</option>
                  <option value="Beşiktaş Spor Kompleksi">Beşiktaş</option>
                </select>
              </div>

              {/* Cinsiyet Filter */}
              <div className="md:col-span-2">
                <select
                  value={cinsiyetFilter}
                  onChange={(e) => setCinsiyetFilter(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Tümü">Tüm Cinsiyetler</option>
                  <option value="Erkek">Erkek</option>
                  <option value="Kız">Kız</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-2 flex justify-end gap-2">
                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 bg-white transition-colors cursor-pointer"
                  title="Excel / CSV Olarak İndir"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel İndir</span>
                </button>
              </div>
            </div>
            
            {/* Tertiary Filter Line */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs pt-2 border-t border-slate-100">
              <span className="text-slate-400 font-semibold">Ulaşma Kanalı:</span>
              {['Tümü', 'Referans / Tavsiye', 'Sosyal Medya', 'Google / Arama', 'Diğer'].map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => setUlasmaTuruFilter(source)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                    ulasmaTuruFilter === source
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          {/* RESULTS TABLE (Desktop) & CARDS (Mobile) */}
          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Kayıt Bulunamadı</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Arama kriterlerinize uygun ön kayıt bulunmuyor. Filtreleri temizleyebilir veya yeni bir ön kayıt oluşturabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* DESKTOP TABLE */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                      <th className="py-3.5 px-4">Kayıt No &amp; Tarih</th>
                      <th className="py-3.5 px-4">Sporcu Bilgisi</th>
                      <th className="py-3.5 px-4">Veli İletişim</th>
                      <th className="py-3.5 px-4">Acil Durum Kişisi</th>
                      <th className="py-3.5 px-4">Branş &amp; Şube</th>
                      <th className="py-3.5 px-4">Pazarlama / Kaynak</th>
                      <th className="py-3.5 px-4">Beklenen Tutar</th>
                      <th className="py-3.5 px-4">Durum</th>
                      <th className="py-3.5 px-4 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{item.onKayitNo}</span>
                          <span className="text-[11px] text-slate-400">{item.onKayitTarihi}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{item.sporcuAdSoyad}</span>
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                item.cinsiyet === 'Erkek'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {item.cinsiyet}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {item.dogumTarihi} • TC: {item.tcKimlikNo ? `${item.tcKimlikNo.slice(0, 3)}****` : 'Belirtilmedi'}
                          </div>
                          {(item.il || item.ilce) && (
                            <div className="text-[10px] text-blue-600 font-medium flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 shrink-0 text-blue-500" />
                              <span>{[item.ilce, item.il].filter(Boolean).join(' / ')}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{item.veliAdSoyad}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{item.veliTelefon}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1 text-[11px]">
                            <HeartPulse className="w-3 h-3 text-rose-500" />
                            <span>{item.acilDurumAranacakKisi}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">{item.acilDurumTelefonu}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-blue-600 block">{item.brans}</span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
                            {item.sube}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]">
                            {item.ulasmaTuru}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900">
                            {item.beklenenSozlesmeTutari
                              ? `${item.beklenenSozlesmeTutari.toLocaleString('tr-TR')} ₺`
                              : '-'}
                          </span>
                          {item.sozlesmeOlasiligi && (
                            <span
                              className={`text-[10px] block font-semibold ${
                                item.sozlesmeOlasiligi === 'Yüksek'
                                  ? 'text-emerald-600'
                                  : item.sozlesmeOlasiligi === 'Orta'
                                  ? 'text-amber-600'
                                  : 'text-slate-500'
                              }`}
                            >
                              Olasılık: {item.sozlesmeOlasiligi}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="relative inline-block">
                            <select
                              value={item.kayitDurumu}
                              onChange={(e) =>
                                handleQuickStatusChange(item.id, e.target.value as OnKayitDurumu)
                              }
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer outline-none ${getStatusBadge(
                                item.kayitDurumu
                              )}`}
                            >
                              <option value="Ön Kayıt">Ön Kayıt</option>
                              <option value="Görüşme Yapıldı">Görüşme Yapıldı</option>
                              <option value="Deneme Antrenmanı">Deneme Antrenmanı</option>
                              <option value="Sözleşme Bekleniyor">Sözleşme Bekleniyor</option>
                              <option value="Kayıt Oldu">Kayıt Oldu</option>
                              <option value="Kayıt Olmadı">Kayıt Olmadı</option>
                              <option value="İptal">İptal</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedRecord(item)}
                            className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Tüm Detayları İncele"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS (below lg) */}
              <div className="block lg:hidden divide-y divide-slate-100 p-3 space-y-3">
                {filteredRecords.map((item) => (
                  <div key={item.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{item.sporcuAdSoyad}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              item.cinsiyet === 'Erkek'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {item.cinsiyet}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {item.onKayitNo} • {item.onKayitTarihi}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(item.kayitDurumu)}`}>
                        {item.kayitDurumu}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Branş:</span>
                        <span className="font-semibold text-blue-600">{item.brans}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">İl / İlçe:</span>
                        <span className="font-semibold text-slate-800">{[item.ilce, item.il].filter(Boolean).join(' / ') || 'Belirtilmedi'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Veli:</span>
                        <span className="font-medium text-slate-800">{item.veliAdSoyad}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Telefon:</span>
                        <span className="font-medium text-slate-800">{item.veliTelefon}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Acil Durum Kişisi:</span>
                        <span className="font-medium text-rose-600">{item.acilDurumAranacakKisi}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <div className="text-xs">
                        <span className="text-slate-400 text-[10px]">Beklenen: </span>
                        <strong className="text-slate-800">
                          {item.beklenenSozlesmeTutari ? `${item.beklenenSozlesmeTutari.toLocaleString('tr-TR')} ₺` : '-'}
                        </strong>
                      </div>
                      <button
                        onClick={() => setSelectedRecord(item)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detayları Gör</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: 2. NEW REGISTRATION FORM (EKSİKSİZ 9 ALAN) */}
      {activeTab === 'yeni-kayit' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* FORM BANNER */}
            <div className="bg-slate-900 text-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Yeni Ön Kayıt Giriş Formu</h2>
                  <p className="text-xs text-slate-300">
                    Lütfen tüm zorunlu (*) ve operasyonel bilgileri eksiksiz doldurunuz.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 rounded-xl border border-slate-700 text-xs text-slate-300 shadow-2xs">
                  <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-slate-400 text-[11px]">İletişim:</span>
                  <a href="tel:02168501907" className="font-bold text-white hover:text-blue-300 transition-colors">
                    0216 850 1907
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('liste')}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8 divide-y divide-slate-100">
              {/* BÖLÜM 1: Yönetici / Ön Kayıt Bilgileri */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                    1
                  </span>
                  <h3>Yönetici / Ön Kayıt Bilgileri</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bağlı Ön Kayıt</label>
                    <input
                      type="text"
                      value={formData.bagliOnKayit || ''}
                      onChange={(e) => setFormData({ ...formData, bagliOnKayit: e.target.value })}
                      placeholder="Yok veya referans kayıt no"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ön Kayıt Tarihi *</label>
                    <input
                      type="date"
                      required
                      value={formData.onKayitTarihi}
                      onChange={(e) => setFormData({ ...formData, onKayitTarihi: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Ön Kayıt No <span className="text-slate-400 font-normal">(Otomatik)</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`ÖNK-2026-${String(records.length + 1).padStart(3, '0')}`}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Şube *</label>
                    <select
                      value={formData.sube}
                      onChange={(e) => setFormData({ ...formData, sube: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Kadıköy Merkez Şube">Kadıköy Merkez Şube</option>
                      <option value="Ataşehir Batı Ataşehir Şubesi">Ataşehir Batı Ataşehir Şubesi</option>
                      <option value="Kartal Sahil Tesisleri">Kartal Sahil Tesisleri</option>
                      <option value="Beşiktaş Spor Kompleksi">Beşiktaş Spor Kompleksi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Branş *</label>
                    <select
                      value={formData.brans}
                      onChange={(e) => setFormData({ ...formData, brans: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Basketbol">Basketbol</option>
                      <option value="Voleybol">Voleybol</option>
                      <option value="Yüzme">Yüzme</option>
                      <option value="Futbol">Futbol</option>
                      <option value="Jimnastik">Jimnastik</option>
                      <option value="Tenis">Tenis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kayıt Durumu *</label>
                    <select
                      value={formData.kayitDurumu}
                      onChange={(e) => setFormData({ ...formData, kayitDurumu: e.target.value as OnKayitDurumu })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-bold text-blue-700"
                    >
                      <option value="Ön Kayıt">Ön Kayıt</option>
                      <option value="Görüşme Yapıldı">Görüşme Yapıldı</option>
                      <option value="Deneme Antrenmanı">Deneme Antrenmanı</option>
                      <option value="Sözleşme Bekleniyor">Sözleşme Bekleniyor</option>
                      <option value="Kayıt Oldu">Kayıt Oldu</option>
                      <option value="Kayıt Olmadı">Kayıt Olmadı</option>
                      <option value="İptal">İptal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BÖLÜM 2: Sporcu Bilgileri */}
              <div className="space-y-4 pt-6">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                    2
                  </span>
                  <h3>Sporcu Bilgileri</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Sporcu Ad Soyad *</label>
                    <input
                      type="text"
                      required
                      value={formData.sporcuAdSoyad || ''}
                      onChange={(e) => setFormData({ ...formData, sporcuAdSoyad: e.target.value })}
                      placeholder="Örn: Kerem Kaya"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cinsiyet *</label>
                    <div className="flex items-center gap-4 mt-1.5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="cinsiyet"
                          value="Erkek"
                          checked={formData.cinsiyet === 'Erkek'}
                          onChange={() => setFormData({ ...formData, cinsiyet: 'Erkek' })}
                          className="text-blue-600"
                        />
                        <span>Erkek</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="cinsiyet"
                          value="Kız"
                          checked={formData.cinsiyet === 'Kız'}
                          onChange={() => setFormData({ ...formData, cinsiyet: 'Kız' })}
                          className="text-blue-600"
                        />
                        <span>Kız</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">T.C. Kimlik No</label>
                    <input
                      type="text"
                      maxLength={11}
                      value={formData.tcKimlikNo || ''}
                      onChange={(e) => setFormData({ ...formData, tcKimlikNo: e.target.value.replace(/\D/g, '') })}
                      placeholder="11 Haneli T.C."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Doğum Tarihi *</label>
                    <input
                      type="date"
                      required
                      value={formData.dogumTarihi || ''}
                      onChange={(e) => setFormData({ ...formData, dogumTarihi: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sporcu Telefonu</label>
                    <input
                      type="tel"
                      value={formData.telefon || ''}
                      onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                      placeholder="+90 5XX XXX XX XX"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Boy (cm)</label>
                    <input
                      type="number"
                      value={formData.boy || ''}
                      onChange={(e) => setFormData({ ...formData, boy: e.target.value })}
                      placeholder="Örn: 152"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kilo (kg)</label>
                    <input
                      type="number"
                      value={formData.kilo || ''}
                      onChange={(e) => setFormData({ ...formData, kilo: e.target.value })}
                      placeholder="Örn: 44"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>İl (Şehir) *</span>
                    </label>
                    <select
                      value={formData.il || 'İstanbul'}
                      onChange={(e) => {
                        const newCity = e.target.value;
                        const districts = getDistrictsForCity(newCity);
                        setFormData({
                          ...formData,
                          il: newCity,
                          ilce: districts[0] || 'Merkez',
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-800"
                    >
                      {TURKEY_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>İlçe *</span>
                    </label>
                    <select
                      value={formData.ilce || getDistrictsForCity(formData.il || 'İstanbul')[0] || ''}
                      onChange={(e) => setFormData({ ...formData, ilce: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-800"
                    >
                      {getDistrictsForCity(formData.il || 'İstanbul').map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block font-semibold text-slate-700 mb-1">Açık İkamet Adresi</label>
                    <textarea
                      rows={2}
                      value={formData.adres || ''}
                      onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                      placeholder="Mahalle, Cadde, Sokak, Bina No, Daire..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* BÖLÜM 3: Veli Bilgileri */}
              <div className="space-y-4 pt-6">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                    3
                  </span>
                  <h3>Veli Bilgileri</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Veli Ad Soyad *</label>
                    <input
                      type="text"
                      required
                      value={formData.veliAdSoyad || ''}
                      onChange={(e) => setFormData({ ...formData, veliAdSoyad: e.target.value })}
                      placeholder="Anne / Baba Ad Soyad"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Veli Telefon *</label>
                    <input
                      type="tel"
                      required
                      value={formData.veliTelefon || ''}
                      onChange={(e) => setFormData({ ...formData, veliTelefon: e.target.value })}
                      placeholder="+90 5XX XXX XX XX"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Veli E-posta</label>
                    <input
                      type="email"
                      value={formData.veliEposta || ''}
                      onChange={(e) => setFormData({ ...formData, veliEposta: e.target.value })}
                      placeholder="veli@ornek.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Veli Meslek</label>
                    <input
                      type="text"
                      value={formData.veliMeslek || ''}
                      onChange={(e) => setFormData({ ...formData, veliMeslek: e.target.value })}
                      placeholder="Örn: Mühendis, Öğretmen"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Veli Eğitim Durumu</label>
                    <select
                      value={formData.veliEgitimDurumu}
                      onChange={(e) => setFormData({ ...formData, veliEgitimDurumu: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="İlköğretim">İlköğretim</option>
                      <option value="Lise">Lise</option>
                      <option value="Ön Lisans">Ön Lisans</option>
                      <option value="Lisans">Lisans</option>
                      <option value="Yüksek Lisans">Yüksek Lisans</option>
                      <option value="Doktora">Doktora</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BÖLÜM 4: Sporcu Sağlık ve Özel Durum Bilgileri */}
              <div className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                      4
                    </span>
                    <h3>Sporcu Sağlık ve Özel Durum Bilgileri</h3>
                  </div>
                  <span className="text-[11px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Önemli Çocuk Güvenlik Alanı
                  </span>
                </div>

                {/* Acil Durum Kutusu (Öne Çıkarılmış) */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-rose-600" />
                      <span>Acil Durumda Aranacak Kişi *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.acilDurumAranacakKisi || ''}
                      onChange={(e) => setFormData({ ...formData, acilDurumAranacakKisi: e.target.value })}
                      placeholder="Örn: Ayşe Yılmaz (Teyzesi / Anne)"
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                    />
                    <span className="text-[10px] text-amber-800 mt-1 block">
                      Özellikle çocuk sporcular için acil durum kişisi ve telefonunu eklemeniz önerilir.
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-rose-600" />
                      <span>Acil Durum Telefonu *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.acilDurumTelefonu || ''}
                      onChange={(e) => setFormData({ ...formData, acilDurumTelefonu: e.target.value })}
                      placeholder="+90 5XX XXX XX XX"
                      className="w-full px-3 py-2 border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Genel Sağlık Durumu</label>
                    <input
                      type="text"
                      value={formData.saglikDurumu || ''}
                      onChange={(e) => setFormData({ ...formData, saglikDurumu: e.target.value })}
                      placeholder="Sağlıklı / Spor yapabilir"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Alerji Durumu</label>
                    <input
                      type="text"
                      value={formData.alerjiDurumu || ''}
                      onChange={(e) => setFormData({ ...formData, alerjiDurumu: e.target.value })}
                      placeholder="Örn: Polen, Fıstık alerjisi veya Yok"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kronik Rahatsızlık</label>
                    <input
                      type="text"
                      value={formData.kronikRahatsizlik || ''}
                      onChange={(e) => setFormData({ ...formData, kronikRahatsizlik: e.target.value })}
                      placeholder="Örn: Astım, Diyabet veya Yok"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Davranışsal / Özel Durum</label>
                    <input
                      type="text"
                      value={formData.davranissalOzelDurum || ''}
                      onChange={(e) => setFormData({ ...formData, davranissalOzelDurum: e.target.value })}
                      placeholder="Örn: Dikkat eksikliği, sudan korkma"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Düzenli Kullanılan İlaç</label>
                    <input
                      type="text"
                      value={formData.duzenliKullanilanIlac || ''}
                      onChange={(e) => setFormData({ ...formData, duzenliKullanilanIlac: e.target.value })}
                      placeholder="İlaç adı, kullanım sıklığı veya Yok"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* BÖLÜM 5: Kulübe Ulaşma / Pazarlama Bilgileri */}
              <div className="space-y-4 pt-6">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                    5
                  </span>
                  <h3>Kulübe Ulaşma / Pazarlama Bilgileri</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kulübe Ulaşma Türü *</label>
                    <select
                      value={formData.ulasmaTuru}
                      onChange={(e) => setFormData({ ...formData, ulasmaTuru: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                    >
                      <option value="Referans / Tavsiye">Referans / Tavsiye</option>
                      <option value="Sosyal Medya">Sosyal Medya (Instagram / Facebook)</option>
                      <option value="Sporsepeti.com.tr">Sporsepeti.com.tr</option>
                      <option value="Google / İnternet">Google / İnternet Arama</option>
                      <option value="Afiş / Billboard">Afiş / Billboard / Broşür</option>
                      <option value="Mail / SMS">Mail / SMS Kampanyası</option>
                      <option value="Etkinlik">Turnuva / Etkinlik</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Referans Veren Kişi</label>
                    <input
                      type="text"
                      value={formData.referansVerenKisi || ''}
                      onChange={(e) => setFormData({ ...formData, referansVerenKisi: e.target.value })}
                      placeholder="Örn: Murat Bey (U12 Velisi)"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ek Açıklama / Not</label>
                    <input
                      type="text"
                      value={formData.ekAciklama || ''}
                      onChange={(e) => setFormData({ ...formData, ekAciklama: e.target.value })}
                      placeholder="Pazarlama veya kampanya notu"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* BÖLÜM 6: Görüşme Bilgileri */}
              <div className="space-y-4 pt-6">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                    6
                  </span>
                  <h3>Görüşme Bilgileri</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Görüşme Yapan</label>
                    <input
                      type="text"
                      value={formData.gorusmeYapan || ''}
                      onChange={(e) => setFormData({ ...formData, gorusmeYapan: e.target.value })}
                      placeholder="Görüşmeyi yapan antrenör/yönetici"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Görüşme Türü</label>
                    <select
                      value={formData.gorusmeTuru}
                      onChange={(e) => setFormData({ ...formData, gorusmeTuru: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Online">Online</option>
                      <option value="Yüz Yüze">Yüz Yüze</option>
                      <option value="Telefon">Telefon</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Görüşme Tarihi</label>
                    <input
                      type="date"
                      value={formData.gorusmeTarihi || ''}
                      onChange={(e) => setFormData({ ...formData, gorusmeTarihi: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">İlgilenilen Branş / Kategori</label>
                    <input
                      type="text"
                      value={formData.ilgilenilenBrans || ''}
                      onChange={(e) => setFormData({ ...formData, ilgilenilenBrans: e.target.value })}
                      placeholder="Örn: Basketbol U14 Gelişim"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Tercih Edilen Günler</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((gun) => {
                        const isSelected = formData.tercihEdilenGunler?.includes(gun);
                        return (
                          <button
                            type="button"
                            key={gun}
                            onClick={() => {
                              const current = formData.tercihEdilenGunler || [];
                              const updated = isSelected
                                ? current.filter((g) => g !== gun)
                                : [...current, gun];
                              setFormData({ ...formData, tercihEdilenGunler: updated });
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {gun}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Tercih Edilen Saatler</label>
                    <input
                      type="text"
                      value={formData.tercihEdilenSaatler || ''}
                      onChange={(e) => setFormData({ ...formData, tercihEdilenSaatler: e.target.value })}
                      placeholder="Örn: 10:00 - 12:00 veya Hafta içi akşamüstü"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block font-semibold text-slate-700 mb-1">Görüşme Notları</label>
                    <textarea
                      rows={2}
                      value={formData.gorusmeNotlari || ''}
                      onChange={(e) => setFormData({ ...formData, gorusmeNotlari: e.target.value })}
                      placeholder="Veli ile yapılan görüşmenin detayları, antrenör değerlendirmesi vb."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* BÖLÜM 7: Satış / Sözleşme Bilgileri */}
              <div className="space-y-4 pt-6">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                    7
                  </span>
                  <h3>Satış / Sözleşme Bilgileri</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Beklenen Sözleşme Tutarı (₺)</label>
                    <input
                      type="number"
                      value={formData.beklenenSozlesmeTutari || ''}
                      onChange={(e) => setFormData({ ...formData, beklenenSozlesmeTutari: Number(e.target.value) })}
                      placeholder="Örn: 24000"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sözleşme Olasılığı</label>
                    <select
                      value={formData.sozlesmeOlasiligi}
                      onChange={(e) => setFormData({ ...formData, sozlesmeOlasiligi: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Yüksek">Yüksek</option>
                      <option value="Orta">Orta</option>
                      <option value="Düşük">Düşük</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gerçekleşen Sözleşme Tutarı (₺)</label>
                    <input
                      type="number"
                      value={formData.gerceklesenSozlesmeTutari || ''}
                      onChange={(e) => setFormData({ ...formData, gerceklesenSozlesmeTutari: Number(e.target.value) })}
                      placeholder="Sözleşme yapıldıysa giriniz"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sözleşme Tarihi</label>
                    <input
                      type="date"
                      value={formData.sozlesmeTarihi || ''}
                      onChange={(e) => setFormData({ ...formData, sozlesmeTarihi: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ödeme Durumu</label>
                    <select
                      value={formData.odemeDurumu}
                      onChange={(e) => setFormData({ ...formData, odemeDurumu: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Bekliyor">Bekliyor</option>
                      <option value="Ödendi">Ödendi</option>
                      <option value="Kısmi Ödeme">Kısmi Ödeme</option>
                      <option value="Ödenmedi">Ödenmedi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ödeme Yöntemi</label>
                    <select
                      value={formData.odemeYontemi}
                      onChange={(e) => setFormData({ ...formData, odemeYontemi: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Kredi Kartı">Kredi Kartı</option>
                      <option value="Havale / EFT">Havale / EFT</option>
                      <option value="Nakit">Nakit</option>
                      <option value="Taksit">Taksit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">İndirim / Kampanya</label>
                    <input
                      type="text"
                      value={formData.indirimKampanya || ''}
                      onChange={(e) => setFormData({ ...formData, indirimKampanya: e.target.value })}
                      placeholder="Örn: Erken Kayıt, Kardeş İndirimi"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kaybedilme Nedeni (Olumsuzsa)</label>
                    <input
                      type="text"
                      value={formData.kaybedilmeNedeni || ''}
                      onChange={(e) => setFormData({ ...formData, kaybedilmeNedeni: e.target.value })}
                      placeholder="Örn: Fiyat yüksek, mesafe uzak"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-rose-600"
                    />
                  </div>
                </div>
              </div>

              {/* BÖLÜM 8: KVKK / Onaylar */}
              <div className="space-y-4 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                      8
                    </span>
                    <h3>KVKK &amp; Yasal Onaylar</h3>
                  </div>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Başlıklara tıklayarak yasal metinleri önizleyebilirsiniz</span>
                  </span>
                </div>

                {/* Company & Info Banner */}
                <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      <strong className="text-slate-900">Sporsepeti Bilişim Teknolojileri ve Pazarlama Ltd. Şti. (Kadıköy/İstanbul)</strong> veri sorumluluğu ve 6698 sayılı KVKK kapsamında düzenlenen yasal onay metinleridir.
                      Aşağıdaki başlıklara veya <span className="font-bold text-blue-700">"Metni İncele"</span> butonuna tıklayarak metinlerin tamamını inceleyebilirsiniz.
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-blue-200 text-xs shadow-2xs">
                    <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-slate-500 text-[11px]">İletişim Hattı:</span>
                    <a href="tel:02168501907" className="font-bold text-blue-700 hover:underline">
                      0216 850 1907
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                  {/* Item 1: KVKK Aydınlatma Metni */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2.5">
                        <input
                          id="chk-kvkk"
                          type="checkbox"
                          checked={formData.kvkkAydinlatmaOnay}
                          onChange={(e) => setFormData({ ...formData, kvkkAydinlatmaOnay: e.target.checked })}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                        />
                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => handleOpenLegalDoc('kvkk')}
                            className="text-left font-bold text-slate-800 hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1 group leading-tight"
                            title="Metni Önizlemek İçin Tıklayın"
                          >
                            <span>KVKK Aydınlatma Metni Onayı</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                          </button>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            6698 Sayılı Kanun Uyarınca Bilgilendirme
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 text-[10px]">Sporsepeti Ltd. Şti.</span>
                      <button
                        type="button"
                        onClick={() => handleOpenLegalDoc('kvkk')}
                        className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Metni İncele</span>
                      </button>
                    </div>
                  </div>

                  {/* Item 2: Açık Rıza Onayı */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2.5">
                        <input
                          id="chk-acik-riza"
                          type="checkbox"
                          checked={formData.acikRizaOnay}
                          onChange={(e) => setFormData({ ...formData, acikRizaOnay: e.target.checked })}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                        />
                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => handleOpenLegalDoc('acik-riza')}
                            className="text-left font-bold text-slate-800 hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1 group leading-tight"
                            title="Metni Önizlemek İçin Tıklayın"
                          >
                            <span>Açık Rıza Onayı</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                          </button>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Sağlık &amp; Fiziksel Özel Nitelikli Veri
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 text-[10px]">KVKK Madde 6</span>
                      <button
                        type="button"
                        onClick={() => handleOpenLegalDoc('acik-riza')}
                        className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Metni İncele</span>
                      </button>
                    </div>
                  </div>

                  {/* Item 3: Fotoğraf / Video Kullanım İzni */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2.5">
                        <input
                          id="chk-foto-video"
                          type="checkbox"
                          checked={formData.fotografVideoIzni}
                          onChange={(e) => setFormData({ ...formData, fotografVideoIzni: e.target.checked })}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                        />
                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => handleOpenLegalDoc('fotograf-video')}
                            className="text-left font-bold text-slate-800 hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1 group leading-tight"
                            title="Metni Önizlemek İçin Tıklayın"
                          >
                            <span>Fotoğraf / Video Kullanım İzni</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                          </button>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Sosyal Medya &amp; Kulüp Sitesi Görselleri
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 text-[10px]">Görsel / İşitsel</span>
                      <button
                        type="button"
                        onClick={() => handleOpenLegalDoc('fotograf-video')}
                        className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Metni İncele</span>
                      </button>
                    </div>
                  </div>

                  {/* Item 4: İletişim / Kampanya İzni */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2.5">
                        <input
                          id="chk-iletisim"
                          type="checkbox"
                          checked={formData.iletisimKampanyaIzni}
                          onChange={(e) => setFormData({ ...formData, iletisimKampanyaIzni: e.target.checked })}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                        />
                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => handleOpenLegalDoc('iletisim')}
                            className="text-left font-bold text-slate-800 hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1 group leading-tight"
                            title="Metni Önizlemek İçin Tıklayın"
                          >
                            <span>İletişim / Kampanya İzni</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                          </button>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            SMS, WhatsApp ve E-posta Duyuruları
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 text-[10px]">6563 Sayılı ETK</span>
                      <button
                        type="button"
                        onClick={() => handleOpenLegalDoc('iletisim')}
                        className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Metni İncele</span>
                      </button>
                    </div>
                  </div>

                  {/* Item 5: Veli Onayı */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-2.5">
                        <input
                          id="chk-veli-onay"
                          type="checkbox"
                          checked={formData.veliOnayi}
                          onChange={(e) => setFormData({ ...formData, veliOnayi: e.target.checked })}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                        />
                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => handleOpenLegalDoc('veli-onay')}
                            className="text-left font-bold text-slate-800 hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1 group leading-tight"
                            title="Metni Önizlemek İçin Tıklayın"
                          >
                            <span>Veli Onayı</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                          </button>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Katılım Muvafakati &amp; Sağlık Beyanı
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 text-[10px]">Yasal Vasi Beyanı</span>
                      <button
                        type="button"
                        onClick={() => handleOpenLegalDoc('veli-onay')}
                        className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Metni İncele</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* BÖLÜM 9: Sistemsel Alanlar (Bilgilendirme) */}
              <div className="space-y-2 pt-6">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                    9
                  </span>
                  <span>Sistemsel Otomatik Alanlar (Kullanıcıya Gösterilmeden Oluşturulur)</span>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-600 flex flex-wrap gap-4">
                  <span><strong>Kayıt Oluşturan:</strong> {formData.kayitOlusturanKullanici || 'Sistem'}</span>
                  <span><strong>Kayıt Tarihi:</strong> {new Date().toLocaleDateString('tr-TR')} (Otomatik)</span>
                  <span><strong>Son Güncelleme:</strong> Anlık (Otomatik)</span>
                  <span><strong>Seçili Kayıt Durumu:</strong> <span className="font-bold text-blue-700">{formData.kayitDurumu}</span></span>
                </div>
              </div>
            </div>

            {/* FORM FOOTER */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('liste')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                id="btn-submit-on-kayit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Ön Kaydı Tamamla ve Kaydet</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SHARE PUBLIC LINK & QR MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Ön Kayıt Linki &amp; QR Paylaşımı</h3>
                  <p className="text-xs text-slate-500">Velilerin online dolduracağı ön kayıt formu bağlantısı</p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customizer: Branch & Department */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block">Link Parametreleri (Opsiyonel):</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">Şube:</label>
                  <select
                    value={selectedLinkBranch}
                    onChange={(e) => setSelectedLinkBranch(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="Tümü">Tüm Şubeler (Genel)</option>
                    <option value="Kadıköy Merkez Şube">Kadıköy Merkez Şube</option>
                    <option value="Ataşehir Şubesi">Ataşehir Şubesi</option>
                    <option value="Kartal Şubesi">Kartal Şubesi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">Branş:</label>
                  <select
                    value={selectedLinkBranchName}
                    onChange={(e) => setSelectedLinkBranchName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="Tüm Branşlar">Tüm Branşlar</option>
                    <option value="Basketbol">Basketbol</option>
                    <option value="Voleybol">Voleybol</option>
                    <option value="Yüzme">Yüzme</option>
                    <option value="Futbol">Futbol</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Copyable Link Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Ön Kayıt Web Bağlantısı</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicRegistrationLink}
                  className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-sans tabular-nums select-all outline-none"
                />
                <button
                  id="btn-copy-public-link"
                  onClick={copyToClipboard}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    linkCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Channels */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Merhaba! SportsFly Spor Kulübü yeni dönem ön kayıt formu için lütfen linke tıklayınız: ${publicRegistrationLink} (İletişim Hattı: 0216 850 1907)`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>WhatsApp'ta Paylaş</span>
              </a>

              <button
                onClick={() => setIsPreviewPublicModalOpen(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Form Önizlemesi</span>
              </button>
            </div>

            {/* QR Code Section */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                  <QrCode className="w-14 h-14 text-slate-800" />
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <span className="font-bold text-slate-900 block">Tesis İçi QR Kod</span>
                  <p className="text-[11px]">
                    Bu QR kodu kulüp panosuna, resepsiyona veya broşürlere ekleyerek velilerin doğrudan ön kayıt yapmasını sağlayabilirsiniz.
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end text-right text-xs shrink-0 pl-2">
                <span className="text-[10px] text-slate-400">Danışma Hattı</span>
                <a href="tel:02168501907" className="font-bold text-blue-700 hover:underline">0216 850 1907</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PUBLIC FORM PREVIEW MODAL */}
      {isPreviewPublicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  Canlı Önizleme
                </span>
                <h3 className="font-bold text-slate-900 text-base">Veli Online Ön Kayıt Sayfası</h3>
              </div>
              <button
                onClick={() => setIsPreviewPublicModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Public Portal */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="text-center space-y-1 pb-4 border-b border-slate-200">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                  SF
                </div>
                <h2 className="text-lg font-black text-slate-900">SportsFly Spor Kulübü</h2>
                <p className="text-xs text-slate-500">2026 - 2027 Sezonu Online Ön Kayıt Başvuru Formu</p>
                <div className="pt-1.5 flex items-center justify-center gap-1.5 text-xs text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kulüp Danışma &amp; Destek Hattı:</span>
                  <a href="tel:02168501907" className="font-bold text-blue-700 hover:underline">
                    0216 850 1907
                  </a>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-blue-600 block mb-1">1. Sporcu &amp; Branş Tercihi</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>Şube: <strong>{selectedLinkBranch}</strong></div>
                    <div>Branş: <strong>{selectedLinkBranchName}</strong></div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-blue-600 block mb-1">2. Sporcu &amp; İkamet Bilgileri</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600 text-[11px] mt-1.5">
                    <div>Ad Soyad: <strong className="text-slate-800">Sporcu Adı</strong></div>
                    <div>Cinsiyet / D.Tarihi: <strong className="text-slate-800">Erkek / 2015</strong></div>
                    <div className="flex items-center gap-1 text-blue-700 font-semibold">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>İl / İlçe: <strong>İstanbul / Kadıköy</strong></span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-[10px] mt-1.5">
                    * 81 İl ve bağlı İlçe dinamik olarak seçilip açık adres kaydedilir.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-blue-600 block mb-1">3. Veli &amp; Acil Durum İletişimi</span>
                  <p className="text-slate-500 text-[11px]">
                    Veli Adı, Telefon, E-posta, Acil Durum Aranacak Kişi, Sağlık ve Alerji bilgileri bu adımdan güvenli olarak alınır.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600 block">4. KVKK ve Yasal Onaylar</span>
                    <span className="text-[10px] text-slate-500 font-medium">İletişim: 0216 850 1907</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Veli aşağıdaki yasal metinleri inceleyip onay kutularını işaretleyerek ön kaydını tamamlar:
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {[
                      { key: 'kvkk', label: 'KVKK Aydınlatma Metni Onayı' },
                      { key: 'acik-riza', label: 'Özel Nitelikli Veri Açık Rıza Onayı' },
                      { key: 'fotograf-video', label: 'Fotoğraf ve Video Kullanım İzni' },
                      { key: 'iletisim', label: 'İletişim ve Kampanya İzni' },
                      { key: 'veli-onay', label: 'Veli Katılım ve Sorumluluk Beyanı' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between text-[11px] p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="font-medium text-slate-700 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {item.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenLegalDoc(item.key)}
                          className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 hover:underline cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Metni Gör</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center pt-2 space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kayıt ve İletişim Hattı: <a href="tel:02168501907" className="text-blue-700 font-bold hover:underline">0216 850 1907</a></span>
                </div>
                <span className="text-[11px] text-slate-400 block">
                  * Bu form mobil uyumludur ve SportsFly veritabanına anlık entegredir.
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsPreviewPublicModalOpen(false)}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD DETAIL MODAL (ALL 9 SECTIONS DISPLAYED) */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-sans tabular-nums font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                    {selectedRecord.onKayitNo}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(selectedRecord.kayitDurumu)}`}>
                    {selectedRecord.kayitDurumu}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {selectedRecord.sporcuAdSoyad} Ön Kayıt Detayı
                </h2>
                <p className="text-xs text-slate-400">
                  Kayıt Tarihi: {selectedRecord.onKayitTarihi} • Oluşturan: {selectedRecord.kayitOlusturanKullanici}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                  title="Yazdır"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: 9 Detailed Sections */}
            <div className="space-y-6 text-xs text-slate-700 divide-y divide-slate-100">
              {/* 1. Yönetici / Ön Kayıt Bilgileri */}
              <div className="space-y-2">
                <h4 className="font-bold text-blue-600 text-xs uppercase tracking-wider">
                  1. Yönetici / Ön Kayıt Bilgileri
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div><span className="text-slate-400 block text-[10px]">Şube:</span> <strong>{selectedRecord.sube}</strong></div>
                  <div><span className="text-slate-400 block text-[10px]">Branş:</span> <strong className="text-blue-600">{selectedRecord.brans}</strong></div>
                  <div><span className="text-slate-400 block text-[10px]">Bağlı Ön Kayıt:</span> <span>{selectedRecord.bagliOnKayit || 'Yok'}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Ön Kayıt Tarihi:</span> <span>{selectedRecord.onKayitTarihi}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Son Güncelleme:</span> <span>{selectedRecord.sonGuncellemeTarihi}</span></div>
                </div>
              </div>

              {/* 2. Sporcu Bilgileri */}
              <div className="space-y-2 pt-4">
                <h4 className="font-bold text-blue-600 text-xs uppercase tracking-wider">
                  2. Sporcu Bilgileri
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div><span className="text-slate-400 block text-[10px]">Ad Soyad:</span> <strong>{selectedRecord.sporcuAdSoyad}</strong></div>
                  <div><span className="text-slate-400 block text-[10px]">Cinsiyet:</span> <span>{selectedRecord.cinsiyet}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">T.C. Kimlik:</span> <span>{selectedRecord.tcKimlikNo || 'Belirtilmedi'}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Doğum Tarihi:</span> <span>{selectedRecord.dogumTarihi}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Telefon:</span> <span>{selectedRecord.telefon || 'Belirtilmedi'}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">İl (Şehir):</span> <strong>{selectedRecord.il || 'Belirtilmedi'}</strong></div>
                  <div><span className="text-slate-400 block text-[10px]">İlçe:</span> <strong>{selectedRecord.ilce || 'Belirtilmedi'}</strong></div>
                  <div><span className="text-slate-400 block text-[10px]">Boy / Kilo:</span> <span>{selectedRecord.boy ? `${selectedRecord.boy} cm` : '-'} / {selectedRecord.kilo ? `${selectedRecord.kilo} kg` : '-'}</span></div>
                  <div className="col-span-2 sm:col-span-4"><span className="text-slate-400 block text-[10px]">Açık Adres:</span> <span>{selectedRecord.adres || 'Belirtilmedi'}</span></div>
                </div>
              </div>

              {/* 3. Veli Bilgileri */}
              <div className="space-y-2 pt-4">
                <h4 className="font-bold text-blue-600 text-xs uppercase tracking-wider">
                  3. Veli Bilgileri
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div><span className="text-slate-400 block text-[10px]">Veli Ad Soyad:</span> <strong>{selectedRecord.veliAdSoyad}</strong></div>
                  <div><span className="text-slate-400 block text-[10px]">Telefon:</span> <strong className="text-slate-900">{selectedRecord.veliTelefon}</strong></div>
                  <div><span className="text-slate-400 block text-[10px]">E-posta:</span> <span>{selectedRecord.veliEposta || '-'}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Meslek:</span> <span>{selectedRecord.veliMeslek || '-'}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Eğitim Durumu:</span> <span>{selectedRecord.veliEgitimDurumu || '-'}</span></div>
                </div>
              </div>

              {/* 4. Sporcu Sağlık ve Özel Durum Bilgileri */}
              <div className="space-y-2 pt-4">
                <h4 className="font-bold text-rose-600 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4" />
                  <span>4. Sporcu Sağlık ve Acil Durum Bilgileri</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-rose-50/50 p-3.5 rounded-xl border border-rose-200">
                  <div className="bg-white p-3 rounded-lg border border-rose-200">
                    <span className="text-rose-700 font-bold block text-xs">Acil Durumda Aranacak Kişi:</span>
                    <strong className="text-slate-900 text-sm">{selectedRecord.acilDurumAranacakKisi}</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-rose-200">
                    <span className="text-rose-700 font-bold block text-xs">Acil Durum Telefonu:</span>
                    <strong className="text-slate-900 text-sm">{selectedRecord.acilDurumTelefonu}</strong>
                  </div>
                  <div><span className="text-slate-500 block text-[10px]">Genel Sağlık:</span> <span>{selectedRecord.saglikDurumu || '-'}</span></div>
                  <div><span className="text-slate-500 block text-[10px]">Alerji:</span> <span>{selectedRecord.alerjiDurumu || 'Yok'}</span></div>
                  <div><span className="text-slate-500 block text-[10px]">Kronik Rahatsızlık:</span> <span>{selectedRecord.kronikRahatsizlik || 'Yok'}</span></div>
                  <div><span className="text-slate-500 block text-[10px]">Düzenli İlaç:</span> <span>{selectedRecord.duzenliKullanilanIlac || 'Yok'}</span></div>
                  <div className="col-span-1 sm:col-span-2"><span className="text-slate-500 block text-[10px]">Davranışsal / Özel Durum:</span> <span>{selectedRecord.davranissalOzelDurum || 'Yok'}</span></div>
                </div>
              </div>

              {/* 5. Pazarlama / Kulübe Ulaşma */}
              <div className="space-y-2 pt-4">
                <h4 className="font-bold text-blue-600 text-xs uppercase tracking-wider">
                  5. Kulübe Ulaşma / Pazarlama Bilgileri
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div><span className="text-slate-400 block text-[10px]">Ulaşma Türü:</span> <strong className="text-slate-900">{selectedRecord.ulasmaTuru}</strong></div>
                  <div><span className="text-slate-400 block text-[10px]">Referans Veren:</span> <span>{selectedRecord.referansVerenKisi || '-'}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Ek Not:</span> <span>{selectedRecord.ekAciklama || '-'}</span></div>
                </div>
              </div>

              {/* 6. Görüşme Bilgileri */}
              <div className="space-y-2 pt-4">
                <h4 className="font-bold text-blue-600 text-xs uppercase tracking-wider">
                  6. Görüşme Bilgileri
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div><span className="text-slate-400 block text-[10px]">Görüşme Yapan:</span> <strong>{selectedRecord.gorusmeYapan || '-'}</strong></div>
                  <div><span className="text-slate-400 block text-[10px]">Görüşme Türü:</span> <span>{selectedRecord.gorusmeTuru || '-'}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Görüşme Tarihi:</span> <span>{selectedRecord.gorusmeTarihi || '-'}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">İlgilenilen Branş:</span> <span>{selectedRecord.ilgilenilenBrans || '-'}</span></div>
                  <div className="col-span-2"><span className="text-slate-400 block text-[10px]">Tercih Edilen Günler:</span> <span>{selectedRecord.tercihEdilenGunler?.join(', ') || '-'}</span></div>
                  <div className="col-span-2"><span className="text-slate-400 block text-[10px]">Tercih Edilen Saatler:</span> <span>{selectedRecord.tercihEdilenSaatler || '-'}</span></div>
                  <div className="col-span-2 sm:col-span-4"><span className="text-slate-400 block text-[10px]">Görüşme Notları:</span> <span>{selectedRecord.gorusmeNotlari || 'Not girilmemiş.'}</span></div>
                </div>
              </div>

              {/* 7. Satış / Sözleşme */}
              <div className="space-y-2 pt-4">
                <h4 className="font-bold text-blue-600 text-xs uppercase tracking-wider">
                  7. Satış / Sözleşme Bilgileri
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Beklenen Tutar:</span>
                    <strong className="text-slate-900">
                      {selectedRecord.beklenenSozlesmeTutari ? `${selectedRecord.beklenenSozlesmeTutari.toLocaleString('tr-TR')} ₺` : '-'}
                    </strong>
                  </div>
                  <div><span className="text-slate-400 block text-[10px]">Sözleşme Olasılığı:</span> <strong>{selectedRecord.sozlesmeOlasiligi || '-'}</strong></div>
                  <div><span className="text-slate-400 block text-[10px]">Gerçekleşen Tutar:</span> <strong>{selectedRecord.gerceklesenSozlesmeTutari ? `${selectedRecord.gerceklesenSozlesmeTutari.toLocaleString('tr-TR')} ₺` : '-'}</strong></div>
                  <div><span className="text-slate-400 block text-[10px]">Ödeme Durumu:</span> <span>{selectedRecord.odemeDurumu || '-'}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Ödeme Yöntemi:</span> <span>{selectedRecord.odemeYontemi || '-'}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">Kampanya:</span> <span>{selectedRecord.indirimKampanya || '-'}</span></div>
                  {selectedRecord.kaybedilmeNedeni && (
                    <div className="col-span-2"><span className="text-rose-600 block text-[10px] font-bold">Kaybedilme Nedeni:</span> <span className="text-rose-700 font-semibold">{selectedRecord.kaybedilmeNedeni}</span></div>
                  )}
                </div>
              </div>

              {/* 8. KVKK Onayları */}
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-blue-600 text-xs uppercase tracking-wider">
                    8. KVKK &amp; İzin Onayları
                  </h4>
                  <span className="text-[10px] text-slate-400">Metinleri incelemek için tıklayabilirsiniz</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenLegalDoc('kvkk')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                      selectedRecord.kvkkAydinlatmaOnay
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <span>KVKK Metni: {selectedRecord.kvkkAydinlatmaOnay ? '✓ Onaylı' : 'X'}</span>
                    <Eye className="w-3 h-3 ml-0.5 opacity-60" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenLegalDoc('acik-riza')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                      selectedRecord.acikRizaOnay
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <span>Açık Rıza: {selectedRecord.acikRizaOnay ? '✓ Onaylı' : 'X'}</span>
                    <Eye className="w-3 h-3 ml-0.5 opacity-60" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenLegalDoc('fotograf-video')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                      selectedRecord.fotografVideoIzni
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    <span>Fotoğraf/Video: {selectedRecord.fotografVideoIzni ? '✓ İzin Verildi' : 'İzin Verilmedi'}</span>
                    <Eye className="w-3 h-3 ml-0.5 opacity-60" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenLegalDoc('iletisim')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                      selectedRecord.iletisimKampanyaIzni
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <span>İletişim/SMS: {selectedRecord.iletisimKampanyaIzni ? '✓ Onaylı' : 'X'}</span>
                    <Eye className="w-3 h-3 ml-0.5 opacity-60" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenLegalDoc('veli-onay')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                      selectedRecord.veliOnayi
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    <span>Veli Onayı: {selectedRecord.veliOnayi ? '✓ Alındı' : 'X'}</span>
                    <Eye className="w-3 h-3 ml-0.5 opacity-60" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Durumu Değiştir:</span>
                <select
                  value={selectedRecord.kayitDurumu}
                  onChange={(e) => {
                    const newSt = e.target.value as OnKayitDurumu;
                    handleQuickStatusChange(selectedRecord.id, newSt);
                    setSelectedRecord({ ...selectedRecord, kayitDurumu: newSt });
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold bg-white text-slate-800"
                >
                  <option value="Ön Kayıt">Ön Kayıt</option>
                  <option value="Görüşme Yapıldı">Görüşme Yapıldı</option>
                  <option value="Deneme Antrenmanı">Deneme Antrenmanı</option>
                  <option value="Sözleşme Bekleniyor">Sözleşme Bekleniyor</option>
                  <option value="Kayıt Oldu">Kayıt Oldu</option>
                  <option value="Kayıt Olmadı">Kayıt Olmadı</option>
                  <option value="İptal">İptal</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {selectedRecord.kayitDurumu !== 'Kayıt Oldu' && (
                  <button
                    onClick={() => {
                      handleQuickStatusChange(selectedRecord.id, 'Kayıt Oldu');
                      setSelectedRecord({ ...selectedRecord, kayitDurumu: 'Kayıt Oldu' });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kaydı Onayla &amp; Sporcu Yap</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEGAL DOCUMENT PREVIEW MODAL */}
      <LegalDocPreviewModal
        isOpen={isLegalModalOpen}
        initialDocId={legalModalDoc}
        onClose={() => setIsLegalModalOpen(false)}
        onAccept={handleAcceptLegalDoc}
        isAccepted={
          legalModalDoc === 'kvkk'
            ? formData.kvkkAydinlatmaOnay
            : legalModalDoc === 'acik-riza'
            ? formData.acikRizaOnay
            : legalModalDoc === 'fotograf-video'
            ? formData.fotografVideoIzni
            : legalModalDoc === 'iletisim'
            ? formData.iletisimKampanyaIzni
            : legalModalDoc === 'veli-onay'
            ? formData.veliOnayi
            : false
        }
      />
    </div>
  );
};
