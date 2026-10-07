import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  FileSpreadsheet,
  ChevronDown,
  X,
  Printer,
  ShieldCheck,
  Check,
  Fingerprint,
  FileSignature,
  UserCheck,
} from 'lucide-react';
import { KulupSozlesmesi } from '../../types';
import { INITIAL_YONETICILER } from '../../data/mockData';
import { TURKEY_CITIES, getDistrictsForCity } from '../../data/turkeyCitiesData';

export interface AthleteContract {
  id: string;
  athleteName: string;
  parentName: string;
  birthDate: string;
  tcNo: string;
  phone: string;
  email: string;
  branch: string;
  sube: string;
  signedAt: string;
  ipAddress: string;
  status: 'Onaylandı' | 'Bekliyor';
  signature: string;
  kvkkApproved: boolean;
  taahhutnameApproved: boolean;
  photoVideoApproved: boolean;
  hash: string;
}

const INITIAL_ATHLETE_CONTRACTS: AthleteContract[] = [
  {
    id: 'AC-2026-001',
    athleteName: 'Emre Çetinkaya',
    parentName: 'Murat Çetinkaya',
    birthDate: '12.06.2014',
    tcNo: '34918276510',
    phone: '+90 532 999 88 77',
    email: 'murat.cetinkaya@gmail.com',
    branch: 'Basketbol',
    sube: 'Kadıköy Merkez Şube',
    signedAt: '14.09.2026 15:45',
    ipAddress: '185.116.14.202',
    status: 'Onaylandı',
    signature: 'MURAT ÇETİNKAYA',
    kvkkApproved: true,
    taahhutnameApproved: true,
    photoVideoApproved: true,
    hash: 'sha256-8a9d1b4c3e7f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b',
  },
  {
    id: 'AC-2026-002',
    athleteName: 'Defne Şahin',
    parentName: 'Zeynep Şahin',
    birthDate: '24.03.2012',
    tcNo: '28194017522',
    phone: '+90 533 222 11 00',
    email: 'zeynep.sahin@hotmail.com',
    branch: 'Voleybol',
    sube: 'Ataşehir Batı Ataşehir Şubesi',
    signedAt: '14.09.2026 11:30',
    ipAddress: '85.101.44.18',
    status: 'Onaylandı',
    signature: 'ZEYNEP ŞAHİN',
    kvkkApproved: true,
    taahhutnameApproved: true,
    photoVideoApproved: true,
    hash: 'sha256-4c7e8a9d1b4c7e8a9d1b4c7e8a9d1b4c7e8a9d1b4c7e8a9d1b4c7e8a9d1b4c7e',
  },
  {
    id: 'AC-2026-003',
    athleteName: 'Kaan Yıldırım',
    parentName: 'Ahmet Yıldırım',
    birthDate: '22.01.2010',
    tcNo: '10839210284',
    phone: '+90 535 600 77 33',
    email: 'ahmet.yildirim@gmail.com',
    branch: 'Basketbol',
    sube: 'Beşiktaş Spor Kompleksi',
    signedAt: '18.09.2026 10:15',
    ipAddress: '176.43.210.99',
    status: 'Onaylandı',
    signature: 'AHMET YILDIRIM',
    kvkkApproved: true,
    taahhutnameApproved: true,
    photoVideoApproved: false,
    hash: 'sha256-2b4c7e8a9d1b4c7e8a9d1b4c7e8a9d1b4c7e8a9d1b4c7e8a9d1b4c7e8a9d1b4c',
  },
  {
    id: 'AC-2026-004',
    athleteName: 'Zeynep Kaya',
    parentName: 'Mehmet Kaya',
    birthDate: '18.06.2012',
    tcNo: '57111284719',
    phone: '+90 533 450 12 88',
    email: 'mehmet.kaya@gmail.com',
    branch: 'Voleybol',
    sube: 'Kartal Sahil Tesisleri',
    signedAt: '',
    ipAddress: '',
    status: 'Bekliyor',
    signature: '',
    kvkkApproved: false,
    taahhutnameApproved: false,
    photoVideoApproved: false,
    hash: '',
  }
];

// Initial pre-populated club contracts for immediate interactivity
const INITIAL_SOZLESMELER: KulupSozlesmesi[] = [
  {
    id: 'ks-1',
    sozlesmeNo: 'KS-2026-001',
    yonetici: 'Abdullah acet',
    firmaTip: 'Spor Kulübü Derneği',
    tcKimlik: '28471930284',
    dogumTarihi: '1984-05-14',
    il: 'İstanbul',
    ilce: 'Kadıköy',
    eposta: 'info@acetbasketbol.org.tr',
    vergiDairesi: 'Kadıköy Vergi Dairesi',
    ibanUnvan: 'Acet Basketbol ve Spor Kulübü Derneği İktisadi İşletmesi',
    adSoyad: 'Abdullah Acet',
    firmaUnvani: 'Acet Basketbol Spor Kulübü Derneği',
    telefon: '0532 525 82 71',
    website: 'https://acetbasketbol.org.tr',
    iban: 'TR32 0006 2000 0001 2345 6789 01',
    status: 'Onaylandı',
    createdAt: '12.01.2026',
  },
  {
    id: 'ks-2',
    sozlesmeNo: 'KS-2026-002',
    yonetici: 'Burak Demir',
    firmaTip: 'Limited Şirket',
    tcKimlik: '19384729103',
    dogumTarihi: '1990-11-22',
    il: 'İstanbul',
    ilce: 'Kartal',
    eposta: 'iletisim@kartalyuzme.com',
    vergiDairesi: 'Kartal Vergi Dairesi',
    ibanUnvan: 'Kartal Yüzme ve Su Sporları Hizmetleri Ltd. Şti.',
    adSoyad: 'Burak Demir',
    firmaUnvani: 'Kartal Yüzme & Su Sporları Kulübü Ltd. Şti.',
    telefon: '0542 887 23 11',
    website: 'https://kartalyuzme.com',
    iban: 'TR44 0006 4000 0012 3456 7890 12',
    status: 'İmza Bekliyor',
    createdAt: '03.02.2026',
  },
  {
    id: 'ks-3',
    sozlesmeNo: 'KS-2026-003',
    yonetici: 'Selin Aydın',
    firmaTip: 'Şahıs Şirketi',
    tcKimlik: '38291049281',
    dogumTarihi: '1992-08-09',
    il: 'Ankara',
    ilce: 'Çankaya',
    eposta: 'selin@gelecekyildizlar.com',
    vergiDairesi: 'Çankaya Vergi Dairesi',
    ibanUnvan: 'Selin Aydın Tenis Spor Hizmetleri',
    adSoyad: 'Selin Aydın',
    firmaUnvani: 'Gelecek Yıldızlar Tenis Akademisi',
    telefon: '0530 114 55 66',
    website: 'https://gelecekyildizlar.com',
    iban: 'TR88 0001 5001 5800 1234 5678 90',
    status: 'Onaylandı',
    createdAt: '18.02.2026',
  },
  {
    id: 'ks-4',
    sozlesmeNo: 'KS-2026-004',
    yonetici: 'Ahmet',
    firmaTip: 'Bireysel Müşteri',
    tcKimlik: '48291039485',
    dogumTarihi: '1995-03-17',
    il: 'İzmir',
    ilce: 'Karşıyaka',
    eposta: 'yakemik411@cybtric.com',
    vergiDairesi: 'Karşıyaka Vergi Dairesi',
    ibanUnvan: 'Ahmet Kemik',
    adSoyad: 'Ahmet Kemik',
    firmaUnvani: 'CybTric Spor Kulübü',
    telefon: '0533 381 03 68',
    website: '',
    iban: 'TR12 0006 1000 0000 8765 4321 00',
    status: 'İnceleniyor',
    createdAt: '01.03.2026',
  },
];

const FIRMA_TIPLERI = [
  'Bireysel Müşteri',
  'Kurumsal Müşteri / Kulüp',
  'Şahıs Şirketi',
  'Limited Şirket',
  'Anonim Şirket',
  'Spor Kulübü Derneği',
];

export const KulupSozlesmeleriView: React.FC = () => {
  const [sozlesmeler, setSozlesmeler] = useState<KulupSozlesmesi[]>(INITIAL_SOZLESMELER);
  const [activeTab, setActiveTab] = useState<'form' | 'liste' | 'sporcu-sozlesmeleri'>('form');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tümü' | 'Onaylandı' | 'İmza Bekliyor' | 'İnceleniyor'>('Tümü');
  const [selectedContract, setSelectedContract] = useState<KulupSozlesmesi | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Athlete Contracts States
  const [athleteContracts, setAthleteContracts] = useState<AthleteContract[]>(() => {
    try {
      const saved = localStorage.getItem('sportsfly_athlete_contracts_v1');
      return saved ? JSON.parse(saved) : INITIAL_ATHLETE_CONTRACTS;
    } catch {
      return INITIAL_ATHLETE_CONTRACTS;
    }
  });
  const [selectedAthleteContract, setSelectedAthleteContract] = useState<AthleteContract | null>(INITIAL_ATHLETE_CONTRACTS[0]);
  const [athleteSearchQuery, setAthleteSearchQuery] = useState('');
  const [athleteStatusFilter, setAthleteStatusFilter] = useState<'Tümü' | 'Onaylandı' | 'Bekliyor'>('Tümü');

  // Form State matching the exact fields in user's image
  const [formData, setFormData] = useState({
    yonetici: '',
    firmaTip: 'Bireysel Müşteri',
    tcKimlik: '',
    dogumTarihi: '',
    il: '',
    eposta: '',
    vergiDairesi: '',
    ibanUnvan: '',
    adSoyad: '',
    firmaUnvani: '',
    telefon: '',
    ilce: '',
    website: '',
    iban: '',
  });

  // Dynamic district options based on selected city
  const availableDistricts = formData.il ? getDistrictsForCity(formData.il) : [];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'il') {
        updated.ilce = ''; // Reset district when city changes
      }
      return updated;
    });
    if (errorMessage) setErrorMessage(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for required fields with asterisk in the screenshot
    if (!formData.yonetici) {
      setErrorMessage('Lütfen "Yönetici" alanını seçiniz.');
      return;
    }
    if (!formData.firmaTip) {
      setErrorMessage('Lütfen "Firma Tip" alanını seçiniz.');
      return;
    }
    if (!formData.tcKimlik.trim()) {
      setErrorMessage('Lütfen "TC Kimlik" alanını doldurunuz.');
      return;
    }
    if (!formData.dogumTarihi) {
      setErrorMessage('Lütfen "Doğum Tarihi" alanını seçiniz.');
      return;
    }
    if (!formData.il) {
      setErrorMessage('Lütfen "İl" alanını seçiniz.');
      return;
    }
    if (!formData.vergiDairesi.trim()) {
      setErrorMessage('Lütfen "Vergi Dairesi" alanını doldurunuz.');
      return;
    }
    if (!formData.ibanUnvan.trim()) {
      setErrorMessage('Lütfen "IBAN Unvan" alanını doldurunuz.');
      return;
    }
    if (!formData.adSoyad.trim()) {
      setErrorMessage('Lütfen "Ad Soyad" alanını doldurunuz.');
      return;
    }
    if (!formData.firmaUnvani.trim()) {
      setErrorMessage('Lütfen "Firma Ünvanı" alanını doldurunuz.');
      return;
    }
    if (!formData.telefon.trim()) {
      setErrorMessage('Lütfen "Telefon Numarası" alanını doldurunuz.');
      return;
    }
    if (!formData.ilce) {
      setErrorMessage('Lütfen "İlçe" alanını seçiniz.');
      return;
    }
    if (!formData.iban.trim()) {
      setErrorMessage('Lütfen "IBAN" alanını doldurunuz.');
      return;
    }

    const newSozlesme: KulupSozlesmesi = {
      id: `ks-${Date.now()}`,
      sozlesmeNo: `KS-2026-${String(sozlesmeler.length + 1).padStart(3, '0')}`,
      yonetici: formData.yonetici,
      firmaTip: formData.firmaTip,
      tcKimlik: formData.tcKimlik,
      dogumTarihi: formData.dogumTarihi,
      il: formData.il,
      ilce: formData.ilce,
      eposta: formData.eposta,
      vergiDairesi: formData.vergiDairesi,
      ibanUnvan: formData.ibanUnvan,
      adSoyad: formData.adSoyad,
      firmaUnvani: formData.firmaUnvani,
      telefon: formData.telefon,
      website: formData.website,
      iban: formData.iban.toUpperCase(),
      status: 'Onaylandı',
      createdAt: new Date().toLocaleDateString('tr-TR'),
    };

    setSozlesmeler([newSozlesme, ...sozlesmeler]);
    setSuccessMessage(`"${newSozlesme.firmaUnvani}" için kulüp sözleşmesi başarıyla kaydedildi.`);

    // Reset form
    setFormData({
      yonetici: '',
      firmaTip: 'Bireysel Müşteri',
      tcKimlik: '',
      dogumTarihi: '',
      il: '',
      eposta: '',
      vergiDairesi: '',
      ibanUnvan: '',
      adSoyad: '',
      firmaUnvani: '',
      telefon: '',
      ilce: '',
      website: '',
      iban: '',
    });

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" sözleşmesini silmek istediğinize emin misiniz?`)) {
      setSozlesmeler((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Sözleşme No',
      'Yönetici',
      'Firma Tipi',
      'Firma Ünvanı',
      'Yetkili Ad Soyad',
      'TC Kimlik',
      'Doğum Tarihi',
      'Telefon',
      'E-posta',
      'İl',
      'İlçe',
      'Vergi Dairesi',
      'IBAN',
      'IBAN Ünvan',
      'Kayıt Tarihi',
      'Durum',
    ];

    const rows = sozlesmeler.map((s) => [
      s.sozlesmeNo,
      `"${s.yonetici}"`,
      `"${s.firmaTip}"`,
      `"${s.firmaUnvani}"`,
      `"${s.adSoyad}"`,
      s.tcKimlik,
      s.dogumTarihi,
      `"${s.telefon}"`,
      s.eposta || '',
      s.il,
      s.ilce,
      `"${s.vergiDairesi}"`,
      `"${s.iban}"`,
      `"${s.ibanUnvan}"`,
      s.createdAt,
      s.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SportsFly_Kulup_Sozlesmeleri_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSozlesmeler = sozlesmeler.filter((s) => {
    const matchesStatus = statusFilter === 'Tümü' || s.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      s.firmaUnvani.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.adSoyad.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.yonetici.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tcKimlik.includes(searchQuery) ||
      s.il.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sozlesmeNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Kulüp Sözleşmeleri
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Kulüp, işletme ve yönetici resmi sözleşme kayıtları ve firma bilgileri yönetimi
              </p>
            </div>
          </div>

          {/* Tab Switcher & Export */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs font-semibold w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`flex-1 sm:flex-initial px-3 py-2 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-white/60 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Sözleşme Ekle</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('liste')}
                className={`flex-1 sm:flex-initial px-3 py-2 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'liste'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-white/60 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Kayıtlı Sözleşmeler ({sozlesmeler.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sporcu-sozlesmeleri')}
                className={`flex-1 sm:flex-initial px-3 py-2 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'sporcu-sozlesmeleri'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-white/60 hover:text-slate-900'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Sporcu Sözleşmeleri ({athleteContracts.length})</span>
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 bg-[#188038] hover:bg-[#137333] text-white rounded-lg text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
              title="Excel (CSV) Olarak Dışa Aktar"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="text-[11px] font-medium text-slate-500 block">Toplam Sözleşme</span>
            <span className="text-lg font-bold text-slate-900">{sozlesmeler.length}</span>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-100">
            <span className="text-[11px] font-medium text-emerald-700 block">Onaylanan</span>
            <span className="text-lg font-bold text-emerald-800">
              {sozlesmeler.filter((s) => s.status === 'Onaylandı').length}
            </span>
          </div>
          <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-100">
            <span className="text-[11px] font-medium text-amber-700 block">İmza Bekleyen</span>
            <span className="text-lg font-bold text-amber-800">
              {sozlesmeler.filter((s) => s.status === 'İmza Bekliyor').length}
            </span>
          </div>
          <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-100">
            <span className="text-[11px] font-medium text-blue-700 block">İncelenen</span>
            <span className="text-lg font-bold text-blue-800">
              {sozlesmeler.filter((s) => s.status === 'İnceleniyor').length}
            </span>
          </div>
        </div>
      </div>

      {/* SUCCESS & ERROR ALERTS */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 p-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-800 p-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* FORM SECTION (Exact match to User's Uploaded Image) */}
      {activeTab === 'form' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 sm:p-8">
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Yeni Kulüp Sözleşmesi Oluştur</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kulüp/firma resmi unvanı, yetkili yönetici ve finansal faturalama bilgileri
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400">
              * ile işaretli alanlar zorunludur
            </span>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* The 3-Column Layout from Screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {/* SÜTUN 1: Yönetici * */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="form-yonetici"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    Yönetici *
                  </label>
                  <div className="relative">
                    <select
                      id="form-yonetici"
                      value={formData.yonetici}
                      onChange={(e) => handleInputChange('yonetici', e.target.value)}
                      className="w-full h-11 px-3.5 pr-9 border border-slate-300 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Yönetici Seçiniz</option>
                      {INITIAL_YONETICILER.map((y) => (
                        <option key={y.id} value={y.name}>
                          {y.name} ({y.schoolName})
                        </option>
                      ))}
                      <option value="Selman Utku Marmara">Selman Utku Marmara (Sistem Yöneticisi)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="hidden lg:block p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-600 space-y-2 mt-6">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Sözleşme Güvenliği &amp; Onay</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    Kaydedilen kulüp sözleşmesi, SportsFly altyapısındaki tüm tahsilat, aidat ve aktivite operasyonlarında yasal referans olarak kullanılır.
                  </p>
                </div>
              </div>

              {/* SÜTUN 2: Firma Tip *, TC Kimlik *, Doğum Tarihi *, İl *, Eposta, Vergi Dairesi *, IBAN Unvan * */}
              <div className="space-y-4">
                {/* Firma Tip * */}
                <div>
                  <label
                    htmlFor="form-firma-tip"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    Firma Tip *
                  </label>
                  <div className="relative">
                    <select
                      id="form-firma-tip"
                      value={formData.firmaTip}
                      onChange={(e) => handleInputChange('firmaTip', e.target.value)}
                      className="w-full h-11 px-3.5 pr-9 border border-slate-300 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      {FIRMA_TIPLERI.map((tip) => (
                        <option key={tip} value={tip}>
                          {tip}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* TC Kimlik * */}
                <div>
                  <label
                    htmlFor="form-tc-kimlik"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    TC Kimlik *
                  </label>
                  <input
                    id="form-tc-kimlik"
                    type="text"
                    maxLength={11}
                    placeholder="11 haneli TC kimlik numarası"
                    value={formData.tcKimlik}
                    onChange={(e) => handleInputChange('tcKimlik', e.target.value.replace(/\D/g, ''))}
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Doğum Tarihi * */}
                <div>
                  <label
                    htmlFor="form-dogum-tarihi"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    Doğum Tarihi *
                  </label>
                  <div className="relative">
                    <input
                      id="form-dogum-tarihi"
                      type="date"
                      value={formData.dogumTarihi}
                      onChange={(e) => handleInputChange('dogumTarihi', e.target.value)}
                      className="w-full h-11 px-3.5 pr-10 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* İl * */}
                <div>
                  <label
                    htmlFor="form-il"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    İl *
                  </label>
                  <div className="relative">
                    <select
                      id="form-il"
                      value={formData.il}
                      onChange={(e) => handleInputChange('il', e.target.value)}
                      className="w-full h-11 px-3.5 pr-9 border border-slate-300 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Seçiniz</option>
                      {TURKEY_CITIES.map((sehir) => (
                        <option key={sehir} value={sehir}>
                          {sehir}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Eposta */}
                <div>
                  <label
                    htmlFor="form-eposta"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    Eposta
                  </label>
                  <input
                    id="form-eposta"
                    type="email"
                    placeholder="ornek@kulup.com"
                    value={formData.eposta}
                    onChange={(e) => handleInputChange('eposta', e.target.value)}
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Vergi Dairesi * */}
                <div>
                  <label
                    htmlFor="form-vergi-dairesi"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    Vergi Dairesi *
                  </label>
                  <input
                    id="form-vergi-dairesi"
                    type="text"
                    placeholder="Vergi dairesi adı"
                    value={formData.vergiDairesi}
                    onChange={(e) => handleInputChange('vergiDairesi', e.target.value)}
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* IBAN Unvan * */}
                <div>
                  <label
                    htmlFor="form-iban-unvan"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    IBAN Unvan *
                  </label>
                  <input
                    id="form-iban-unvan"
                    type="text"
                    placeholder="Banka hesabında kayıtlı ünvan"
                    value={formData.ibanUnvan}
                    onChange={(e) => handleInputChange('ibanUnvan', e.target.value)}
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* SÜTUN 3: Ad Soyad *, Firma Ünvanı *, Telefon Numarası *, İlçe *, Website, IBAN * */}
              <div className="space-y-4">
                {/* Ad Soyad * */}
                <div>
                  <label
                    htmlFor="form-ad-soyad"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    Ad Soyad *
                  </label>
                  <input
                    id="form-ad-soyad"
                    type="text"
                    placeholder="Yetkili ad soyad"
                    value={formData.adSoyad}
                    onChange={(e) => handleInputChange('adSoyad', e.target.value)}
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Firma Ünvanı * */}
                <div>
                  <label
                    htmlFor="form-firma-unvani"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    Firma Ünvanı *
                  </label>
                  <input
                    id="form-firma-unvani"
                    type="text"
                    placeholder="Resmi kulüp veya şirket ünvanı"
                    value={formData.firmaUnvani}
                    onChange={(e) => handleInputChange('firmaUnvani', e.target.value)}
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Telefon Numarası * */}
                <div>
                  <label
                    htmlFor="form-telefon"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    Telefon Numarası *
                  </label>
                  <input
                    id="form-telefon"
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    value={formData.telefon}
                    onChange={(e) => handleInputChange('telefon', e.target.value)}
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* İlçe * */}
                <div>
                  <label
                    htmlFor="form-ilce"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    İlçe *
                  </label>
                  <div className="relative">
                    <select
                      id="form-ilce"
                      value={formData.ilce}
                      onChange={(e) => handleInputChange('ilce', e.target.value)}
                      disabled={!formData.il}
                      className={`w-full h-11 px-3.5 pr-9 border rounded-lg text-sm transition-all appearance-none cursor-pointer ${
                        !formData.il
                          ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-white text-slate-800 border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    >
                      <option value="">Seçiniz</option>
                      {availableDistricts.map((ilce) => (
                        <option key={ilce} value={ilce}>
                          {ilce}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label
                    htmlFor="form-website"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    Website
                  </label>
                  <input
                    id="form-website"
                    type="url"
                    placeholder="https://kulup.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* IBAN * */}
                <div>
                  <label
                    htmlFor="form-iban"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    IBAN *
                  </label>
                  <input
                    id="form-iban"
                    type="text"
                    placeholder="TRXX XXXX XXXX XXXX XXXX XXXX XX"
                    value={formData.iban}
                    onChange={(e) => handleInputChange('iban', e.target.value)}
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm text-slate-800 font-sans tabular-nums placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Form Footer with the Blue "Ekle" button (matches screenshot exactly at bottom right) */}
            <div className="flex items-center justify-end pt-6 border-t border-slate-200">
              <button
                id="btn-kulup-sozlesmesi-ekle"
                type="submit"
                className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer min-w-[120px] active:scale-[0.99] flex items-center justify-center gap-1.5"
              >
                <span>Ekle</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SÖZLEŞMELER LİSTESİ TAB */}
      {activeTab === 'liste' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 sm:p-6 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {(['Tümü', 'Onaylandı', 'İmza Bekliyor', 'İnceleniyor'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 whitespace-nowrap min-h-[34px] cursor-pointer ${
                    statusFilter === status
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Kulüp, unvan, yetkili veya no ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[38px]"
              />
            </div>
          </div>

          {/* MOBILE CARDS (<640px) */}
          <div className="block sm:hidden space-y-3">
            {filteredSozlesmeler.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-sans tabular-nums text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                      {item.sozlesmeNo}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{item.firmaUnvani}</h3>
                    <p className="text-xs text-slate-600">{item.adSoyad}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                      item.status === 'Onaylandı'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'İmza Bekliyor'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs bg-slate-50 p-2.5 rounded-lg text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Yönetici:</span>
                    <span className="font-semibold">{item.yonetici}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Firma Tipi:</span>
                    <span>{item.firmaTip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Konum:</span>
                    <span>
                      {item.ilçe ? `${item.ilçe}, ` : ''}{item.il}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Telefon:</span>
                    <span>{item.telefon}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 font-sans tabular-nums text-[11px]">
                    <span className="text-slate-400">IBAN:</span>
                    <span className="truncate max-w-[200px]">{item.iban}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setSelectedContract(item)}
                    className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors min-h-[36px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Görüntüle</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.firmaUnvani)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE (Visible on sm and larger) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold bg-slate-50/50">
                  <th className="py-3 px-3">Sözleşme No</th>
                  <th className="py-3 px-3">Firma / Kulüp Ünvanı</th>
                  <th className="py-3 px-3">Yetkili &amp; Yönetici</th>
                  <th className="py-3 px-3">Firma Tipi</th>
                  <th className="py-3 px-3">İl / İlçe</th>
                  <th className="py-3 px-3">İletişim</th>
                  <th className="py-3 px-3">Durum</th>
                  <th className="py-3 px-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSozlesmeler.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-sans tabular-nums font-bold text-blue-600">
                      {item.sozlesmeNo}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 text-xs">{item.firmaUnvani}</div>
                      <div className="text-[11px] text-slate-500 font-sans tabular-nums">
                        VD: {item.vergiDairesi}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800">{item.adSoyad}</div>
                      <div className="text-[11px] text-slate-500">Yön: {item.yonetici}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {item.firmaTip}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-slate-800 font-medium">
                        {item.il} / {item.ilce}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="text-slate-800">{item.telefon}</div>
                      {item.eposta && (
                        <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                          {item.eposta}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Onaylandı'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'İmza Bekliyor'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedContract(item)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          title="Sözleşmeyi İncele"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Görüntüle</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.firmaUnvani)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSozlesmeler.length === 0 && (
            <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-sm text-slate-700">Sözleşme bulunamadı</p>
              <p className="text-xs text-slate-400 mt-1">
                Arama kriterlerinizi değiştirebilir veya yeni bir kulüp sözleşmesi ekleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SPORCU SÖZLEŞMELERİ SPLIT LAYOUT */}
      {activeTab === 'sporcu-sozlesmeleri' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-150">
          
          {/* LEFT COLUMN: Athlete List & Search (5 Columns) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-blue-600" />
                <span>Sporcu Kayıt Taahhütnameleri</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Veliler tarafından onaylanmış dijital taahhütname onay kayıtları
              </p>
            </div>

            {/* Filter Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Sporcu, veli adı veya ref ara..."
                  value={athleteSearchQuery}
                  onChange={(e) => setAthleteSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Quick Status Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                {(['Tümü', 'Onaylandı', 'Bekliyor'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setAthleteStatusFilter(st)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                      athleteStatusFilter === st
                        ? 'bg-blue-600 border-blue-600 text-white shadow-3xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Athlete Cards List */}
            <div className="space-y-2 max-h-[58vh] overflow-y-auto pr-1">
              {athleteContracts.filter((ac) => {
                const matchesSearch = ac.athleteName.toLowerCase().includes(athleteSearchQuery.toLowerCase()) ||
                  ac.parentName.toLowerCase().includes(athleteSearchQuery.toLowerCase()) ||
                  ac.id.toLowerCase().includes(athleteSearchQuery.toLowerCase());
                const matchesStatus = athleteStatusFilter === 'Tümü' || ac.status === athleteStatusFilter;
                return matchesSearch && matchesStatus;
              }).map((ac) => {
                const isSelected = selectedAthleteContract?.id === ac.id;
                return (
                  <div
                    key={ac.id}
                    onClick={() => setSelectedAthleteContract(ac)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/20 ring-2 ring-blue-500/10'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-blue-600 px-1.5 py-0.2 rounded bg-blue-50">
                          {ac.id}
                        </span>
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-1">{ac.athleteName}</h3>
                        <p className="text-[11px] text-slate-500">Veli: {ac.parentName}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                          ac.status === 'Onaylandı'
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                            : 'bg-amber-50 border border-amber-200 text-amber-800'
                        }`}
                      >
                        {ac.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1 text-[9px] border-t border-slate-100">
                      <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 font-semibold rounded">
                        {ac.branch}
                      </span>
                      <span className="text-slate-400 block max-w-[150px] truncate">
                        {ac.sube}
                      </span>
                      {ac.signedAt && (
                        <span className="text-slate-400 font-sans tabular-nums ml-auto">
                          {ac.signedAt.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {athleteContracts.filter((ac) => {
                const matchesSearch = ac.athleteName.toLowerCase().includes(athleteSearchQuery.toLowerCase()) ||
                  ac.parentName.toLowerCase().includes(athleteSearchQuery.toLowerCase()) ||
                  ac.id.toLowerCase().includes(athleteSearchQuery.toLowerCase());
                const matchesStatus = athleteStatusFilter === 'Tümü' || ac.status === athleteStatusFilter;
                return matchesSearch && matchesStatus;
              }).length === 0 && (
                <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <UserCheck className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                  <p className="font-semibold text-xs text-slate-700">Sporcu taahhütnamesi bulunamadı</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Document Viewer & Actions (7 Columns) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5 text-left relative overflow-hidden">
            
            {/* Watermark security accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015] pointer-events-none select-none">
              <ShieldCheck className="w-96 h-96 text-slate-900" />
            </div>

            {selectedAthleteContract ? (
              <div className="space-y-5 relative z-10">
                {/* Viewer Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        Veli Muvafakatnamesi
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Ref: {selectedAthleteContract.id}
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      {selectedAthleteContract.athleteName} — Taahhütname Kaydı
                    </h2>
                  </div>

                  {/* Actions (Yazdır / İndir) */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // Print Action
                        const ac = selectedAthleteContract;
                        const printWindow = window.open('', '_blank');
                        if (!printWindow) {
                          alert('Yazdırma penceresi tarayıcınız tarafından engellendi.');
                          return;
                        }
                        const htmlContent = `
                          <html>
                            <head>
                              <title>Sporcu Kayıt Sözleşmesi - ${ac.athleteName}</title>
                              <style>
                                body { font-family: sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 0 auto; }
                                h1 { font-size: 20px; text-align: center; color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 24px; font-weight: bold; }
                                .section { margin-bottom: 20px; }
                                .section-title { font-weight: bold; font-size: 14px; background: #f1f5f9; padding: 6px 12px; border-radius: 4px; margin-bottom: 10px; }
                                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; }
                                .field { font-weight: 600; }
                                .legal { font-size: 11px; color: #475569; text-align: justify; margin-top: 15px; }
                                .signature-box { border: 2px dashed #94a3b8; padding: 15px; border-radius: 8px; margin-top: 30px; text-align: center; font-size: 12px; background: #faf5ff; }
                                .footer { margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
                              </style>
                            </head>
                            <body>
                              <h1>SPORCU KAYIT TAAHHÜTNAMESİ VE DİJİTAL SÖZLEŞME</h1>
                              <div class="section">
                                <div class="section-title">1. SPORCU BİLGİLERİ</div>
                                <div class="grid">
                                  <div><span class="field">Adı Soyadı:</span> ${ac.athleteName}</div>
                                  <div><span class="field">Doğum Tarihi:</span> ${ac.birthDate}</div>
                                  <div><span class="field">T.C. Kimlik No:</span> ${ac.tcNo}</div>
                                  <div><span class="field">Branş / Şube:</span> ${ac.branch} / ${ac.sube}</div>
                                </div>
                              </div>
                              <div class="section">
                                <div class="section-title">2. VELİ / YASAL VASİ BİLGİLERİ</div>
                                <div class="grid">
                                  <div><span class="field">Adı Soyadı:</span> ${ac.parentName}</div>
                                  <div><span class="field">Telefon:</span> ${ac.phone}</div>
                                  <div><span class="field">E-posta:</span> ${ac.email}</div>
                                </div>
                              </div>
                              <div class="section">
                                <div class="section-title">3. TAAHHÜTNAME HÜKÜMLERİ VE VELİ BEYANI</div>
                                <p class="legal">
                                  1. Velisi bulunduğum yukarıda bilgileri yazılı sporcunun, kulübün düzenleyeceği tüm antrenmanlara, hazırlık ve resmi lig müsabakalarına katılmasına izin veriyorum. Sporcunun spor yapmasına engel olabilecek herhangi bir kardiyolojik, ortopedik veya kronik rahatsızlığı olmadığını beyan ederim.<br/>
                                  2. 6698 sayılı KVKK kapsamında kişisel verilerimizin, sağlık beyanlarımızın ve acil durum iletişim bilgilerinin kulüp veri sorumlusu tarafından yasal sınırlar çerçevesinde işlenmesine ve saklanmasına onay veriyorum.<br/>
                                  3. Sporcunun antrenmanlar sırasında tesis kurallarına ve antrenör direktiflerine uymakla yükümlü olduğunu kabul ederim.
                                </p>
                              </div>
                              <div class="signature-box">
                                <div style="font-weight: bold; color: #1e3a8a;">DİJİTAL ONAY VE İMZA GÜNLÜĞÜ</div>
                                <div style="margin-top: 8px;">
                                  <div>İmzalayan / Veli: <strong style="text-transform: uppercase;">${ac.signature || '(İMZALANMADI)'}</strong></div>
                                  <div>Onay Tarihi: ${ac.signedAt || '(İMZALANMADI)'} | IP: ${ac.ipAddress || '-'}</div>
                                  <div style="font-family: monospace; font-size: 10px; color: #64748b; margin-top: 4px;">Güvenlik Hash: ${ac.hash || '-'}</div>
                                </div>
                              </div>
                              <div class="footer">SportsFly Spor Kulübü ve Akademi Yönetim Yazılımı • sporsepeti.com.tr</div>
                              <script>
                                window.onload = function() { window.print(); window.close(); }
                              </script>
                            </body>
                          </html>
                        `;
                        printWindow.document.write(htmlContent);
                        printWindow.document.close();
                      }}
                      className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 min-h-[36px]"
                      title="Sözleşmeyi Yazdır"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Yazdır</span>
                    </button>

                    <button
                      onClick={() => {
                        // Download Action
                        const ac = selectedAthleteContract;
                        const content = `SPORCU KAYIT TAAHHÜTNAMESİ VE DİJİTAL SÖZLEŞME ONAY BELGESİ\nReferans/ID: ${ac.id}\nOnay Tarihi: ${ac.signedAt || 'Mevcut Değil'}\nIP Adresi: ${ac.ipAddress || 'Mevcut Değil'}\nDoğrulama Özeti (Hash): ${ac.hash || 'Mevcut Değil'}\n--------------------------------------------------\n\n1. SPORCU BİLGİLERİ\nAdı Soyadı: ${ac.athleteName}\nDoğum Tarihi: ${ac.birthDate}\nT.C. Kimlik No: ${ac.tcNo}\nBranş: ${ac.branch}\nŞube/Tesis: ${ac.sube}\n\n2. VELİ / YASAL VASİ BİLGİLERİ\nAdı Soyadı: ${ac.parentName}\nTelefon: ${ac.phone}\nE-posta: ${ac.email}\n\n3. ONAYLANAN METİNLER VE MUVAFAKATLER\n[X] 6698 Sayılı KVKK Aydınlatma ve Açık Rıza Metni (ONAYLANDI)\n[X] Sporcu Kayıt Taahhütnamesi ve Veli İzin Belgesi (ONAYLANDI)\n[${ac.photoVideoApproved ? 'X' : ' '}] Tanıtım Amaçlı Fotoğraf ve Video Çekim İzni (${ac.photoVideoApproved ? 'ONAYLANDI' : 'RETTEDİLDİ'})\n\n4. VELİ BEYANI VE DİJİTAL İMZA\nMuvafakatname ve taahhütname metinlerinde yer alan tüm kuralları, hak ve yükümlülükleri okudum, anladım ve hür irademle kabul ediyorum.\n\nDijital İmza / Onaylayan: ${ac.signature}\n--------------------------------------------------\nBu belge, velinin SportsFly altyapısı üzerinden gerçekleştirdiği dijital onay günlüğü ve onay log kayıtları uyarınca otomatik üretilmiştir.\nSportsFly Spor Okulu ve Akademi Yönetim Platformu • sporsepeti.com.tr`;
                        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `SportsFly_Sporcu_Sozlesmesi_${ac.athleteName.replace(/\s+/g, '_')}.txt`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-3xs cursor-pointer flex items-center gap-1.5 min-h-[36px]"
                      title="Sözleşmeyi İndir (Metin)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>İndir</span>
                    </button>
                  </div>
                </div>

                {/* Profile Key Value Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Sporcu Ad Soyad:</span>
                    <span className="font-bold text-slate-800">{selectedAthleteContract.athleteName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Veli Ad Soyad:</span>
                    <span className="font-bold text-slate-800">{selectedAthleteContract.parentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">T.C. Kimlik No:</span>
                    <span className="font-sans tabular-nums text-slate-700">{selectedAthleteContract.tcNo || 'Belirtilmedi'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Doğum Tarihi:</span>
                    <span className="text-slate-700 font-sans tabular-nums">{selectedAthleteContract.birthDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">İrtibat Telefon:</span>
                    <span className="text-slate-700 font-sans tabular-nums">{selectedAthleteContract.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">E-posta Adresi:</span>
                    <span className="text-slate-700">{selectedAthleteContract.email || 'Belirtilmedi'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kayıt Şube / Branş:</span>
                    <span className="text-blue-700 font-bold">{selectedAthleteContract.sube} / {selectedAthleteContract.branch}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Sözleşme Durumu:</span>
                    <span className={`font-bold ${selectedAthleteContract.status === 'Onaylandı' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {selectedAthleteContract.status === 'Onaylandı' ? '✓ Dijital Onay Tamamlandı' : 'X İmzalanması Bekleniyor'}
                    </span>
                  </div>
                </div>

                {/* Consent & Approval Checkboxes Visualizer */}
                <div className="space-y-2 pt-1">
                  <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Veli Dijital Onay ve Muvafakat Tercihleri:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        selectedAthleteContract.kvkkApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Check className="w-3 h-3 font-bold" />
                      </div>
                      <span className="text-slate-700 font-medium">KVKK Aydınlatma Metni</span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        selectedAthleteContract.taahhutnameApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Check className="w-3 h-3 font-bold" />
                      </div>
                      <span className="text-slate-700 font-medium">Sporcu Kayıt Taahhütnamesi</span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 sm:col-span-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        selectedAthleteContract.photoVideoApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Check className="w-3 h-3 font-bold" />
                      </div>
                      <span className="text-slate-700 font-medium">Sosyal Medya Tanıtım Amaçlı Fotoğraf/Video Çekim İzni</span>
                    </div>
                  </div>
                </div>

                {/* Secure Cryptographic Trust Seal / Digital Signature Logs */}
                {selectedAthleteContract.status === 'Onaylandı' ? (
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 relative overflow-hidden border border-slate-800">
                    {/* Glowing lock badge background */}
                    <div className="absolute right-3 bottom-1.5 opacity-10">
                      <ShieldCheck className="w-20 h-20 text-white" />
                    </div>

                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                      <Fingerprint className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h4 className="text-xs font-black text-white tracking-wide uppercase">
                          Güvenli Elektronik İmza &amp; Onay Günlüğü
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          SportsFly Dijital Güvenlik Ağı Tarafından Doğrulanmıştır
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-mono leading-relaxed text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-sans">ONAYLAYAN VELİ (DİJİTAL İMZA)</span>
                        <span className="font-bold text-white uppercase tracking-wider">
                          {selectedAthleteContract.signature}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-sans">ONAY TARİHİ VE SAATİ</span>
                        <span className="font-bold text-white">
                          {selectedAthleteContract.signedAt}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-sans">KULLANICI IP ADRESİ</span>
                        <span className="font-semibold text-slate-200">
                          {selectedAthleteContract.ipAddress}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-sans">İŞLEM DURUMU</span>
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>E-İMZALANDI (VERIFIED)</span>
                        </span>
                      </div>
                      <div className="sm:col-span-2 pt-1 border-t border-slate-800">
                        <span className="text-slate-500 block text-[9px] uppercase font-sans">DİJİTAL PARMAK İZİ ÖZETİ (SHA-256 HASH)</span>
                        <span className="text-[10px] text-slate-400 select-all block break-all leading-normal">
                          {selectedAthleteContract.hash}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2 flex flex-col justify-center items-center text-center py-6">
                    <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
                    <div>
                      <h4 className="font-extrabold text-slate-800">Sözleşme Onayı Bekliyor</h4>
                      <p className="text-slate-500 mt-0.5 max-w-sm">
                        Bu sporcunun velisi henüz dijital kayıt taahhütnamesini imzalamamıştır. Veli, ön kayıt formu veya veli paneli üzerinden taahhütnameyi onayladığında dijital onay günlüğü bu alanda belirecektir.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                <FileSignature className="w-12 h-12 text-slate-300 animate-bounce" />
                <div>
                  <h3 className="font-bold text-slate-800">Sözleşme Seçilmedi</h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Sözleşme detaylarını, KVKK muvafakatlerini ve dijital e-imza günlüklerini görüntülemek için sol taraftaki listeden bir sporcu seçiniz.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAY & SÖZLEŞME ÖNİZLEME MODALI */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Kulüp Sözleşme Belgesi
                  </h3>
                  <p className="text-xs text-slate-500 font-sans tabular-nums">
                    Ref: {selectedContract.sozlesmeNo} • {selectedContract.createdAt}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedContract(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Official Document Preview */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-blue-900 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm block">{selectedContract.firmaUnvani}</span>
                  <span className="text-xs text-blue-700">Firma Tipi: {selectedContract.firmaTip}</span>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">
                  {selectedContract.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Yetkili Ad Soyad:</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedContract.adSoyad}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Bağlı Yönetici:</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedContract.yonetici}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">T.C. Kimlik No:</span>
                  <span className="font-sans tabular-nums text-slate-800">{selectedContract.tcKimlik}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Doğum Tarihi:</span>
                  <span className="text-slate-800">{selectedContract.dogumTarihi}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Telefon:</span>
                  <span className="text-slate-800">{selectedContract.telefon}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">E-posta:</span>
                  <span className="text-slate-800">{selectedContract.eposta || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">İl / İlçe:</span>
                  <span className="text-slate-800">
                    {selectedContract.il} / {selectedContract.ilce}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Vergi Dairesi:</span>
                  <span className="text-slate-800">{selectedContract.vergiDairesi}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[11px]">IBAN / Hesap Ünvanı:</span>
                  <span className="font-sans tabular-nums font-bold text-slate-900 block">{selectedContract.iban}</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">Ünvan: {selectedContract.ibanUnvan}</span>
                </div>
              </div>

              {/* Legal Terms Excerpt */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  SportsFly Hizmet &amp; İşletme Sözleşme Hükümleri
                </h4>
                <p className="text-slate-600 text-[11px]">
                  İşbu sözleşme, SportsFly Dijital Spor Yönetim Platformu ile yukarıda bilgileri yer alan Spor Kulübü / İşletme arasında dijital üye kaydı, antrenman planlama, aidat tahsilat aracılığı ve sporcu veri saklama standartları uyarınca akdedilmiştir.
                </p>
                <p className="text-slate-600 text-[11px]">
                  Kulüp yetkilisi, sisteme girilen tüm antrenör, sporcu ve veli bilgilerinin 6698 sayılı KVKK mevzuatına uygun olarak toplandığını ve SportsFly veri işleme ilkelerine riayet edeceğini kabul ve taahhüt eder.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setSelectedContract(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Kapat
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Yazdır</span>
                </button>
                <button
                  onClick={() => {
                    alert('Kulüp sözleşmesi PDF belgesi oluşturuldu ve indiriliyor.');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF İndir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
