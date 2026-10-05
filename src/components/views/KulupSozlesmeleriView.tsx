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
} from 'lucide-react';
import { KulupSozlesmesi } from '../../types';
import { INITIAL_YONETICILER } from '../../data/mockData';
import { TURKEY_CITIES, getDistrictsForCity } from '../../data/turkeyCitiesData';

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
  const [activeTab, setActiveTab] = useState<'form' | 'liste'>('form');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tümü' | 'Onaylandı' | 'İmza Bekliyor' | 'İnceleniyor'>('Tümü');
  const [selectedContract, setSelectedContract] = useState<KulupSozlesmesi | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs font-semibold w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Sözleşme Ekle</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('liste')}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'liste'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Kayıtlı Sözleşmeler ({sozlesmeler.length})</span>
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
                    className="w-full h-11 px-3.5 border border-slate-300 rounded-lg text-sm text-slate-800 font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
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
                  <div className="flex justify-between pt-1 border-t border-slate-200 font-mono text-[11px]">
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
                    <td className="py-3.5 px-3 font-mono font-bold text-blue-600">
                      {item.sozlesmeNo}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 text-xs">{item.firmaUnvani}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
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
                  <p className="text-xs text-slate-500 font-mono">
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
                  <span className="font-mono text-slate-800">{selectedContract.tcKimlik}</span>
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
                  <span className="font-mono font-bold text-slate-900 block">{selectedContract.iban}</span>
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
