import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  User,
  Users,
  GraduationCap,
  Activity,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Calendar,
  Check,
  List,
  LayoutGrid,
} from 'lucide-react';
import { SportsFlyIcon } from '../SportsFlyLogo';
import { NavPage } from '../../types';
import {
  Sube,
  TesisTipi,
  SubeDurum,
  getStoredSubeler,
  saveStoredSubeler,
  getActiveSubeId,
  setActiveSubeId,
} from '../../data/subeData';
import { TURKEY_CITIES, getDistrictsForCity } from '../../data/turkeyCitiesData';

interface SubelerViewProps {
  onNavigate?: (page: NavPage) => void;
}

const AVAILABLE_BRANSLAR = [
  'Futbol',
  'Basketbol',
  'Voleybol',
  'Yüzme',
  'Cimnastik',
  'Tenis',
  'Pilates',
  'Masa Tenisi',
];

const AVAILABLE_OZELLIKLER = [
  'Otopark',
  'Kafeterya',
  'Soyunma Odası',
  'Kapalı Havuz',
  'Sentetik Çim',
  'Fizyoterapi',
  'Kondisyon Salonu',
  'Tribün',
];

export const SubelerView: React.FC<SubelerViewProps> = ({ onNavigate }) => {
  const [subeler, setSubeler] = useState<Sube[]>(() => getStoredSubeler());
  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => getActiveSubeId());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSube, setEditingSube] = useState<Sube | null>(null);
  const [isPlanInfoOpen, setIsPlanInfoOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCity, setFormCity] = useState('İstanbul');
  const [formDistrict, setFormDistrict] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formManager, setFormManager] = useState('');
  const [formHeadCoach, setFormHeadCoach] = useState('');
  const [formCapacity, setFormCapacity] = useState(50);
  const [formTesisTipi, setFormTesisTipi] = useState<TesisTipi>('Spor Kompleksi');
  const [formStatus, setFormStatus] = useState<SubeDurum>('Aktif');
  const [formSelectedBranslar, setFormSelectedBranslar] = useState<string[]>(['Basketbol', 'Voleybol']);
  const [formSelectedOzellikler, setFormSelectedOzellikler] = useState<string[]>(['Otopark', 'Soyunma Odası']);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBranchSelect = (id: string) => {
    setSelectedBranchId(id);
    setActiveSubeId(id);
    const branch = subeler.find((s) => s.id === id);
    showToast(id === 'all' ? 'Tüm kulüp şubeleri seçildi' : `Aktif şube değiştirildi: ${branch?.ad}`);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingSube(null);
    setFormName('');
    setFormCode(`SB-${subeler.length + 1}`.padStart(6, '0'));
    setFormCity('İstanbul');
    setFormDistrict('Kadıköy');
    setFormAddress('');
    setFormPhone('+90 216 ');
    setFormEmail('info@kulup.com');
    setFormManager('');
    setFormHeadCoach('');
    setFormCapacity(50);
    setFormTesisTipi('Spor Kompleksi');
    setFormStatus('Aktif');
    setFormSelectedBranslar(['Basketbol', 'Voleybol']);
    setFormSelectedOzellikler(['Otopark', 'Soyunma Odası']);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (sube: Sube) => {
    setEditingSube(sube);
    setFormName(sube.ad);
    setFormCode(sube.kod);
    setFormCity(sube.sehir);
    setFormDistrict(sube.ilce);
    setFormAddress(sube.adres);
    setFormPhone(sube.telefon);
    setFormEmail(sube.eposta);
    setFormManager(sube.sorumluYonetici);
    setFormHeadCoach(sube.sorumluAntrenor);
    setFormCapacity(sube.kapasite);
    setFormTesisTipi(sube.tesisTipi);
    setFormStatus(sube.durum);
    setFormSelectedBranslar(sube.branslar || []);
    setFormSelectedOzellikler(sube.ozellikler || []);
    setIsModalOpen(true);
  };

  const handleSaveSube = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Lütfen şube adını giriniz');
      return;
    }

    if (editingSube) {
      // Update existing
      const updated = subeler.map((s) => {
        if (s.id === editingSube.id) {
          return {
            ...s,
            ad: formName.trim(),
            kod: formCode.trim() || s.kod,
            sehir: formCity,
            ilce: formDistrict.trim(),
            adres: formAddress.trim(),
            telefon: formPhone.trim(),
            eposta: formEmail.trim(),
            sorumluYonetici: formManager.trim() || 'Kulüp Müdürü',
            sorumluAntrenor: formHeadCoach.trim() || 'Baş Antrenör',
            kapasite: Number(formCapacity) || 40,
            tesisTipi: formTesisTipi,
            durum: formStatus,
            branslar: formSelectedBranslar,
            ozellikler: formSelectedOzellikler,
          };
        }
        return s;
      });
      setSubeler(updated);
      saveStoredSubeler(updated);
      setIsModalOpen(false);
      showToast(`✓ "${formName}" şube bilgileri güncellendi.`);
    } else {
      // Create new
      const newSube: Sube = {
        id: `sube-${Date.now()}`,
        ad: formName.trim(),
        kod: formCode.trim() || `SUB-${subeler.length + 1}`,
        sehir: formCity,
        ilce: formDistrict.trim(),
        adres: formAddress.trim(),
        telefon: formPhone.trim(),
        eposta: formEmail.trim(),
        sorumluYonetici: formManager.trim() || 'Kulüp Müdürü',
        sorumluAntrenor: formHeadCoach.trim() || 'Baş Antrenör',
        antrenorSayisi: 3,
        sporcuSayisi: 0,
        kapasite: Number(formCapacity) || 50,
        tesisTipi: formTesisTipi,
        durum: formStatus,
        acilisTarihi: new Date().toLocaleDateString('tr-TR'),
        branslar: formSelectedBranslar,
        ozellikler: formSelectedOzellikler,
      };
      const updated = [newSube, ...subeler];
      setSubeler(updated);
      saveStoredSubeler(updated);
      setIsModalOpen(false);
      showToast(`✓ Yeni şube "${formName}" başarıyla eklendi.`);
    }
  };

  const handleToggleStatus = (subeId: string) => {
    const updated = subeler.map((s) => {
      if (s.id === subeId) {
        const nextStatus: SubeDurum = s.durum === 'Aktif' ? 'Pasif' : 'Aktif';
        return { ...s, durum: nextStatus };
      }
      return s;
    });
    setSubeler(updated);
    saveStoredSubeler(updated);
    showToast('Şube çalışma durumu güncellendi.');
  };

  // Filtered subeler
  const filteredSubeler = subeler.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.ad.toLowerCase().includes(q) ||
      s.kod.toLowerCase().includes(q) ||
      s.ilce.toLowerCase().includes(q) ||
      s.sehir.toLowerCase().includes(q) ||
      s.sorumluYonetici.toLowerCase().includes(q) ||
      s.branslar.some((b) => b.toLowerCase().includes(q));

    const matchesCity = cityFilter === 'all' || s.sehir === cityFilter;
    const matchesStatus = statusFilter === 'all' || s.durum === statusFilter;

    return matchesSearch && matchesCity && matchesStatus;
  });

  // KPI Calculations
  const totalSubeler = subeler.length;
  const activeSubelerCount = subeler.filter((s) => s.durum === 'Aktif').length;
  const totalCapacity = subeler.reduce((acc, s) => acc + s.kapasite, 0);
  const totalAthletes = subeler.reduce((acc, s) => acc + s.sporcuSayisi, 0);
  const totalCoaches = subeler.reduce((acc, s) => acc + s.antrenorSayisi, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalAthletes / totalCapacity) * 100) : 0;

  const uniqueCities = Array.from(new Set(subeler.map((s) => s.sehir)));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-700/60 relative overflow-hidden">
        {/* Subtle decorative background ring */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-[11px] font-semibold tracking-wide">
              <Building2 className="w-3.5 h-3.5" />
              <span>Kulüp Çoklu Şube ve Tesis Yönetim Modülü</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Şube & Tesis Yönetimi
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsPlanInfoOpen(true)}
              className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <SportsFlyIcon className="w-3.5 h-3.5" />
              <span>Çoklu Şube Mimarisi</span>
            </button>

            {onNavigate && (
              <button
                onClick={() => onNavigate('sube-ozet')}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Şube Özet Paneli</span>
              </button>
            )}

            <button
              id="btn-add-new-branch"
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Şube Ekle</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Stat KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/60">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wide">
              Toplam Şube
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-white">{totalSubeler}</span>
              <span className="text-[11px] text-emerald-400 font-semibold">{activeSubelerCount} Aktif Tesis</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wide">
              Kayıtlı Sporcu & Kapasite
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-blue-400">{totalAthletes}</span>
              <span className="text-[11px] text-slate-400">/ {totalCapacity} Kapasite</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wide">
              Genel Doluluk Oranı
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-emerald-400">%{occupancyRate}</span>
              <span className="text-[11px] text-slate-400 font-medium">Optimum Seviye</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wide">
              Eğitmen & Antrenör Kadrosu
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-white">{totalCoaches}</span>
              <span className="text-[11px] text-blue-300 font-medium">{uniqueCities.length} Farklı İl</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5">
        {/* Branch Quick Switcher Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 no-scrollbar">
          <span className="text-xs font-semibold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            Aktif Filtre:
          </span>

          <button
            onClick={() => handleBranchSelect('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              selectedBranchId === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
            }`}
          >
            Tüm Şubeler ({subeler.length})
          </button>

          {subeler.map((s) => (
            <button
              key={s.id}
              onClick={() => handleBranchSelect(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedBranchId === s.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{s.ad}</span>
              <span className="text-[10px] opacity-75 font-mono">({s.sporcuSayisi})</span>
            </button>
          ))}
        </div>

        {/* Toolbar: Search, Filters, and View Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Şube adı, ilçe veya branş ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          {/* Right Controls: City, Status Filters and View Mode Switcher */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="all">Tüm Şehirler</option>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="Aktif">Aktif</option>
                <option value="Pasif">Pasif</option>
                <option value="Tadilatta">Tadilatta</option>
              </select>
            </div>

            {/* View Mode Toggle: Liste (Default) vs Kartlar */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Şubeleri Liste Görünümünde Göster"
              >
                <List className="w-3.5 h-3.5" />
                <span>Liste</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Şubeleri Kart Görünümünde Göster"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kartlar</span>
              </button>
            </div>
          </div>
        </div>

        {/* LIST VIEW (Öncelikli / Varsayılan Görünüm) */}
        {viewMode === 'list' && (
          <div className="pt-2">
            {filteredSubeler.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs">
                <table className="w-full text-left text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50/80 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Şube &amp; Kod</th>
                      <th className="py-3 px-4">Tesis &amp; Konum</th>
                      <th className="py-3 px-4">Yönetim &amp; Kadro</th>
                      <th className="py-3 px-4">Doluluk (Sporcu / Kapasite)</th>
                      <th className="py-3 px-4">Branşlar</th>
                      <th className="py-3 px-4 text-center">Durum</th>
                      <th className="py-3 px-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredSubeler.map((sube) => {
                      const occPercent = Math.round((sube.sporcuSayisi / (sube.kapasite || 1)) * 100);
                      const isSelected = selectedBranchId === sube.id;

                      return (
                        <tr
                          key={sube.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          {/* Şube Adı & Kod */}
                          <td className="py-3 px-4 align-middle">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0 border border-blue-100">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-slate-900 hover:text-blue-600 transition-colors text-sm">
                                    {sube.ad}
                                  </span>
                                  {isSelected && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white">
                                      Aktif
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                    {sube.kod}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    {sube.telefon}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Tesis & Konum */}
                          <td className="py-3 px-4 align-middle">
                            <div>
                              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70 mb-0.5">
                                {sube.tesisTipi}
                              </span>
                              <p className="text-[11px] text-slate-600 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{sube.ilce}, {sube.sehir}</span>
                              </p>
                            </div>
                          </td>

                          {/* Yönetim & Kadro */}
                          <td className="py-3 px-4 align-middle">
                            <div className="space-y-0.5">
                              <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{sube.sorumluYonetici}</span>
                              </p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{sube.sorumluAntrenor} ({sube.antrenorSayisi} Eğitmen)</span>
                              </p>
                            </div>
                          </td>

                          {/* Sporcu & Kapasite (Doluluk) */}
                          <td className="py-3 px-4 align-middle min-w-[160px]">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-900">
                                  {sube.sporcuSayisi} / {sube.kapasite}
                                </span>
                                <span className="font-extrabold text-slate-700">
                                  %{occPercent}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    occPercent >= 90
                                      ? 'bg-rose-500'
                                      : occPercent >= 70
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(100, occPercent)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Branşlar */}
                          <td className="py-3 px-4 align-middle max-w-[180px]">
                            <div className="flex flex-wrap gap-1">
                              {sube.branslar.slice(0, 3).map((brans) => (
                                <span
                                  key={brans}
                                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700"
                                >
                                  {brans}
                                </span>
                              ))}
                              {sube.branslar.length > 3 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                                  +{sube.branslar.length - 3}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Durum */}
                          <td className="py-3 px-4 align-middle text-center">
                            <span
                              className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                sube.durum === 'Aktif'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : sube.durum === 'Tadilatta'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                            >
                              {sube.durum}
                            </span>
                          </td>

                          {/* İşlemler */}
                          <td className="py-3 px-4 align-middle text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleStatus(sube.id)}
                                className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title={sube.durum === 'Aktif' ? 'Pasife Al' : 'Aktifleştir'}
                              >
                                {sube.durum === 'Aktif' ? 'Pasif' : 'Aktif'}
                              </button>

                              {onNavigate && (
                                <>
                                  <button
                                    onClick={() => {
                                      setActiveSubeId(sube.id);
                                      onNavigate('sube-ozet');
                                    }}
                                    className="p-1.5 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                                    title="Şube Özeti &amp; Metrikleri"
                                  >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveSubeId(sube.id);
                                      onNavigate('sporcular');
                                    }}
                                    className="p-1.5 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                    title="Şube Sporcularını Görüntüle"
                                  >
                                    <Users className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => handleOpenEdit(sube)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Şube Bilgilerini Düzenle"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">Aranan kriterde şube bulunamadı.</p>
                <p className="text-xs text-slate-400 mt-0.5">Filtreleri sıfırlayabilir veya yeni bir şube ekleyebilirsiniz.</p>
              </div>
            )}
          </div>
        )}

        {/* GRID / KART GÖRÜNÜMÜ */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {filteredSubeler.length > 0 ? (
              filteredSubeler.map((sube) => {
                const occPercent = Math.round((sube.sporcuSayisi / (sube.kapasite || 1)) * 100);

                return (
                  <div
                    key={sube.id}
                    className="bg-white rounded-xl border border-slate-200/90 hover:border-blue-300 p-4 sm:p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between group"
                  >
                    <div className="space-y-3.5">
                      {/* Card Header: Title & Badges */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                              {sube.kod}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                sube.durum === 'Aktif'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : sube.durum === 'Tadilatta'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                            >
                              {sube.durum}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70">
                              {sube.tesisTipi}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors pt-1">
                            {sube.ad}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>
                              {sube.ilce}, {sube.sehir} • {sube.adres}
                            </span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleOpenEdit(sube)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Şube Bilgilerini Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-blue-600" />
                            Kapasite Doluluk Oranı
                          </span>
                          <span className="font-bold text-slate-900">
                            {sube.sporcuSayisi} / {sube.kapasite} Sporcu (%{occPercent})
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              occPercent >= 90
                                ? 'bg-rose-500'
                                : occPercent >= 70
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, occPercent)}%` }}
                          />
                        </div>
                      </div>

                      {/* Contact & Leaders Row */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            Sorumlu Yönetici
                          </span>
                          <p className="font-semibold text-slate-800 flex items-center gap-1 truncate">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            {sube.sorumluYonetici}
                          </p>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                            Sorumlu Baş Antrenör
                          </span>
                          <p className="font-semibold text-slate-800 flex items-center gap-1 truncate">
                            <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                            {sube.sorumluAntrenor} ({sube.antrenorSayisi} Eğitmen)
                          </p>
                        </div>
                      </div>

                      {/* Sports Branches Pills */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Aktif Branşlar
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {sube.branslar.map((brans) => (
                            <span
                              key={brans}
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                            >
                              {brans}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{sube.telefon}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(sube.id)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold px-2.5 py-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          {sube.durum === 'Aktif' ? 'Pasife Al' : 'Aktifleştir'}
                        </button>

                        {onNavigate && (
                          <>
                            <button
                              onClick={() => {
                                setActiveSubeId(sube.id);
                                onNavigate('sube-ozet');
                              }}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Şube Özeti, Finans ve Sporcu Metrikleri"
                            >
                              <BarChart3 className="w-3.5 h-3.5" />
                              <span>Özet</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveSubeId(sube.id);
                                onNavigate('sporcular');
                              }}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>Sporcular</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">Aranan kriterde şube bulunamadı.</p>
                <p className="text-xs text-slate-400 mt-0.5">Filtreleri sıfırlayabilir veya yeni bir şube ekleyebilirsiniz.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingSube ? 'Şube Bilgilerini Düzenle' : 'Yeni Kulüp Şubesi Ekle'}
                  </h3>
                  <p className="text-xs text-slate-500">Tesis ve lokasyon bilgilerini tanımlayınız.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSube} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700">Şube Adı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Kadıköy Merkez Spor Tesisi"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Şube Kodu</label>
                  <input
                    type="text"
                    placeholder="KDK-01"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tesis Tipi</label>
                  <select
                    value={formTesisTipi}
                    onChange={(e) => setFormTesisTipi(e.target.value as TesisTipi)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden cursor-pointer"
                  >
                    <option value="Spor Kompleksi">Spor Kompleksi</option>
                    <option value="Kapalı Spor Salonu">Kapalı Spor Salonu</option>
                    <option value="Yarı Olimpik Havuz">Yarı Olimpik Havuz</option>
                    <option value="Futbol Sahası">Futbol Sahası</option>
                    <option value="Cimnastik Salonu">Cimnastik Salonu</option>
                    <option value="Stüdyo">Stüdyo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">İl (Şehir)</label>
                  <select
                    value={formCity}
                    onChange={(e) => {
                      const newCity = e.target.value;
                      setFormCity(newCity);
                      const dists = getDistrictsForCity(newCity);
                      setFormDistrict(dists[0] || 'Merkez');
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden bg-white cursor-pointer text-slate-800"
                  >
                    {TURKEY_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">İlçe</label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden bg-white cursor-pointer text-slate-800"
                  >
                    {getDistrictsForCity(formCity).map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700">Açık Adres</label>
                  <input
                    type="text"
                    placeholder="Cadde, sokak, no..."
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Telefon</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">E-Posta</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Sorumlu Yönetici</label>
                  <input
                    type="text"
                    placeholder="Yönetici Adı Soyadı"
                    value={formManager}
                    onChange={(e) => setFormManager(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Sorumlu Baş Antrenör</label>
                  <input
                    type="text"
                    placeholder="Baş Antrenör Adı"
                    value={formHeadCoach}
                    onChange={(e) => setFormHeadCoach(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Sporcu Kapasitesi</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Durum</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as SubeDurum)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden cursor-pointer"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pasif">Pasif</option>
                    <option value="Tadilatta">Tadilatta</option>
                  </select>
                </div>
              </div>

              {/* Branş Seçimi */}
              <div className="space-y-1.5 pt-2">
                <label className="font-semibold text-slate-700 block">Bu Şubede Açık Branşlar</label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_BRANSLAR.map((brans) => {
                    const isSelected = formSelectedBranslar.includes(brans);
                    return (
                      <button
                        type="button"
                        key={brans}
                        onClick={() => {
                          if (isSelected) {
                            setFormSelectedBranslar(formSelectedBranslar.filter((b) => b !== brans));
                          } else {
                            setFormSelectedBranslar([...formSelectedBranslar, brans]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                        }`}
                      >
                        {brans}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tesis Olanakları */}
              <div className="space-y-1.5 pt-2">
                <label className="font-semibold text-slate-700 block">Tesis Olanakları</label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_OZELLIKLER.map((ozellik) => {
                    const isSelected = formSelectedOzellikler.includes(ozellik);
                    return (
                      <button
                        type="button"
                        key={ozellik}
                        onClick={() => {
                          if (isSelected) {
                            setFormSelectedOzellikler(formSelectedOzellikler.filter((o) => o !== ozellik));
                          } else {
                            setFormSelectedOzellikler([...formSelectedOzellikler, ozellik]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                        }`}
                      >
                        {ozellik}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {editingSube ? 'Değişiklikleri Kaydet' : 'Şubeyi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Branch Architecture & Roadmap Plan Modal */}
      {isPlanInfoOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
                  <SportsFlyIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Kulüpler İçin Çoklu Şube Yönetim Mimarisi ve Kurgu Planı
                  </h3>
                  <p className="text-xs text-slate-500">SportsFly Kurumsal Kulüp Çoklu Lokasyon Stratejisi</p>
                </div>
              </div>
              <button
                onClick={() => setIsPlanInfoOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600 leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 space-y-1">
                <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  1. Merkezi Kulüp & Bağımsız Şube Hiyerarşisi
                </h4>
                <p className="text-blue-800">
                  Kulüp Genel Merkezi (Merkez Yönetim), tüm şubelerin finansal akışını, antrenör havuzunu ve
                  sporcu karnesi metriklerini tek bir konsol üzerinden izler. Her şube ise kendi saha, salon,
                  yoklama ve antrenman seanslarını yerel olarak idare eder.
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-100 space-y-1">
                <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  2. Şubeler Arası Sporcu ve Antrenör Dolaşımı (Cross-Branch Roaming)
                </h4>
                <p className="text-emerald-800">
                  Bir sporcu ana kaydını bir şubede tutarken (örneğin Kadıköy), hafta sonu özel kampı veya müsabaka
                  için Ataşehir tesisindeki antrenmana yoklamada işaretlenebilir. Antrenörler birden fazla şubede
                  takvim çakışması olmaksızın seans açabilir.
                </p>
              </div>

              <div className="p-3.5 bg-purple-50/70 rounded-xl border border-purple-100 space-y-1">
                <h4 className="font-bold text-purple-900 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  3. Şube Bazlı Yetkilendirme & Rol Kapsamı (Branch-Scoped RBAC)
                </h4>
                <p className="text-purple-800">
                  Şube Müdürleri ve Antrenörler yalnızca kendi şubelerinin sporcu listesini ve kasa kayıtlarını
                  görebilir. Kulüp Başkanı ve Süper Admin ise tüm şubeler arasında tek tıkla geçiş yaparak
                  konsolide kümülatif raporları inceler.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-100 space-y-1">
                <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  4. Şube Bazlı Ön Muhasebe & Gelir-Gider Kırılımı
                </h4>
                <p className="text-amber-800">
                  Aidat ödemeleri, forma/paket satışları ve salon bakım giderleri şube kodlarına (KDK-01, ATS-02)
                  bağlanarak hangi şubenin karlı çalıştığı ve kapasite doluluğunun finansal getirisi net olarak ölçülür.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsPlanInfoOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
