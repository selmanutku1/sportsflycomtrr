import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  ShieldCheck,
  Building,
  User,
  X,
  UploadCloud,
  Eye,
  FileCheck,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { KulupEvrakItem, KulupEvrakKategori, SporcuItem, NavPage } from '../../../types';
import {
  getStoredKulupEvraklari,
  saveStoredKulupEvraklari,
} from '../../../data/kulupEvrakGaleriData';
import { INITIAL_SPORCULAR } from '../../../data/mockData';

interface KulupEvraklariViewProps {
  sporcular?: SporcuItem[];
  onSelectSporcu?: (sporcu: SporcuItem) => void;
  selectedClubFilter?: string;
  onToast?: (msg: string) => void;
  onNavigate?: (page: NavPage) => void;
}

export const KulupEvraklariView: React.FC<KulupEvraklariViewProps> = ({
  sporcular = INITIAL_SPORCULAR,
  onSelectSporcu,
  selectedClubFilter = 'all',
  onToast,
  onNavigate,
}) => {
  const safeSporcular = Array.isArray(sporcular) && sporcular.length > 0 ? sporcular : INITIAL_SPORCULAR;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    if (onToast) onToast(msg);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [evraklar, setEvraklar] = useState<KulupEvrakItem[]>(() =>
    getStoredKulupEvraklari()
  );
  const [selectedClub, setSelectedClub] = useState<string>(selectedClubFilter);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewEvrak, setPreviewEvrak] = useState<KulupEvrakItem | null>(null);

  // Add modal form
  const [formTitle, setFormTitle] = useState('');
  const [formClub, setFormClub] = useState('DigiMondi');
  const [formAthleteId, setFormAthleteId] = useState('');
  const [formCategory, setFormCategory] = useState<KulupEvrakKategori>('Lisans');
  const [formDocNumber, setFormDocNumber] = useState('');
  const [formIssueDate, setFormIssueDate] = useState(() => {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  });
  const [formExpiryDate, setFormExpiryDate] = useState('30.06.2025');
  const [formStatus, setFormStatus] = useState<'Geçerli' | 'Süresi Yaklaşan' | 'Süresi Dolmuş' | 'Onay Bekliyor'>('Geçerli');
  const [formNotes, setFormNotes] = useState('');
  const [formFileName, setFormFileName] = useState('');

  // Distinct clubs
  const clubList = Array.from(
    new Set([
      'DigiMondi',
      'Saraçgym',
      'aicosports',
      'Selman Utku',
      ...evraklar.map((e) => e.club),
    ])
  ).filter(Boolean);

  // Filtered documents
  const filteredEvraklar = evraklar.filter((evrak) => {
    if (selectedClub !== 'all' && evrak.club !== selectedClub) return false;
    if (selectedCategory !== 'all' && evrak.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && evrak.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = evrak.title.toLowerCase().includes(q);
      const matchAthlete = evrak.athleteName?.toLowerCase().includes(q) || false;
      const matchNo = evrak.documentNumber?.toLowerCase().includes(q) || false;
      const matchClub = evrak.club.toLowerCase().includes(q);
      return matchTitle || matchAthlete || matchNo || matchClub;
    }
    return true;
  });

  // KPI calculations
  const totalCount = evraklar.length;
  const lisansCount = evraklar.filter((e) => e.category === 'Lisans').length;
  const saglikCount = evraklar.filter((e) => e.category === 'Sağlık Raporu').length;
  const warningCount = evraklar.filter(
    (e) => e.status === 'Süresi Yaklaşan' || e.status === 'Süresi Dolmuş'
  ).length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const matchedAthlete = safeSporcular.find((s) => s.id === formAthleteId);

    const newEvrak: KulupEvrakItem = {
      id: `evrak-${Date.now()}`,
      title: formTitle.trim(),
      club: formClub,
      athleteId: formAthleteId || undefined,
      athleteName: matchedAthlete ? matchedAthlete.name : undefined,
      category: formCategory,
      documentNumber: formDocNumber.trim() || `EVR-${Math.floor(10000 + Math.random() * 90000)}`,
      issueDate: formIssueDate,
      expiryDate: formExpiryDate.trim() || undefined,
      status: formStatus,
      fileType: 'pdf',
      fileSize: '1.4 MB',
      uploadedBy: 'Kulüp İdari İşler',
      notes: formNotes.trim() || undefined,
    };

    const updated = [newEvrak, ...evraklar];
    setEvraklar(updated);
    saveStoredKulupEvraklari(updated);
    setShowAddModal(false);

    // Reset form
    setFormTitle('');
    setFormDocNumber('');
    setFormNotes('');
    setFormFileName('');
    showNotification(`"${newEvrak.title}" evrak kaydı başarıyla eklendi.`);
  };

  const handleDeleteEvrak = (id: string, title: string) => {
    if (window.confirm(`"${title}" evrakını silmek istediğinize emin misiniz?`)) {
      const updated = evraklar.filter((e) => e.id !== id);
      setEvraklar(updated);
      saveStoredKulupEvraklari(updated);
      showNotification(`"${title}" evrakı silindi.`);
    }
  };

  const handleDownload = (evrak: KulupEvrakItem) => {
    showNotification(`"${evrak.title}" (${evrak.fileType.toUpperCase()}) indiriliyor...`);
  };

  return (
    <div className="space-y-5">
      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Toplam Evrak</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalCount}</p>
          <span className="text-[11px] text-slate-500 block">Kayıtlı kulüp ve sporcu arşivi</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Resmi Lisanslar</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{lisansCount}</p>
          <span className="text-[11px] text-slate-500 block">TBF, TVF, TFF lisans kartları</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Sağlık Raporları</span>
            <FileCheck className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-black text-cyan-700">{saglikCount}</p>
          <span className="text-[11px] text-slate-500 block">EKG & Sporcu sağlık belgeleri</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Süre Uyarısı & Dolmuş</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-700">{warningCount}</p>
          <span className="text-[11px] text-amber-600 font-semibold block">Yenileme ve vize gerektirenler</span>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Evrak adı, sporcu adı, lisans no veya kulüp ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </div>

          {/* Add New Document Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Evrak Yükle</span>
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrele:</span>
          </div>

          {/* Club Filter */}
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tüm Kulüpler ({clubList.length})</option>
            {clubList.map((c) => (
              <option key={c} value={c}>
                Kulüp: {c}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tüm Evrak Kategorileri</option>
            <option value="Lisans">Lisanslar</option>
            <option value="Sağlık Raporu">Sağlık Belgeleri</option>
            <option value="Veli İzin Belgesi">Veli İzin & Muvafakatname</option>
            <option value="Kimlik & Kayıt">Kimlik & Kayıt Evrakları</option>
            <option value="Kulüp Sözleşmesi">Kulüp Sözleşmeleri & KVKK</option>
            <option value="Diğer">Diğer</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="Geçerli">Geçerli</option>
            <option value="Süresi Yaklaşan">Süresi Yaklaşan</option>
            <option value="Süresi Dolmuş">Süresi Dolmuş (Acil)</option>
            <option value="Onay Bekliyor">Onay Bekliyor</option>
          </select>

          {(selectedClub !== 'all' ||
            selectedCategory !== 'all' ||
            selectedStatus !== 'all' ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedClub('all');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="text-slate-500 hover:text-slate-800 font-bold underline px-2 cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          )}

          <div className="ml-auto text-slate-500 font-semibold">
            {filteredEvraklar.length} evrak listeleniyor
          </div>
        </div>
      </div>

      {/* Evraklar List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-xs">
                <th className="py-3 px-4">Evrak & Belge Adı</th>
                <th className="py-3 px-4">Kulüp & Sporcu</th>
                <th className="py-3 px-4">Kategori / Belge No</th>
                <th className="py-3 px-4">Düzenleme Tarihi</th>
                <th className="py-3 px-4">Geçerlilik Tarihi</th>
                <th className="py-3 px-4 text-center">Durum</th>
                <th className="py-3 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredEvraklar.length > 0 ? (
                filteredEvraklar.map((evrak) => {
                  const isExpired = evrak.status === 'Süresi Dolmuş';
                  const isWarning = evrak.status === 'Süresi Yaklaşan';

                  return (
                    <tr
                      key={evrak.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isExpired ? 'bg-rose-50/30' : isWarning ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Evrak Adı */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                              evrak.category === 'Lisans'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : evrak.category === 'Sağlık Raporu'
                                ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                                : evrak.category === 'Veli İzin Belgesi'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p
                              onClick={() => setPreviewEvrak(evrak)}
                              className="font-bold text-slate-900 text-xs sm:text-sm hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              {evrak.title}
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-2 pt-0.5">
                              <span className="font-mono uppercase font-bold text-slate-600">
                                {evrak.fileType}
                              </span>
                              <span>•</span>
                              <span>{evrak.fileSize}</span>
                              {evrak.uploadedBy && (
                                <>
                                  <span>•</span>
                                  <span>Yükleyen: {evrak.uploadedBy}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Kulüp & Sporcu */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Building className="w-3 h-3 text-slate-500" />
                            {evrak.club}
                          </span>
                          {evrak.athleteName ? (
                            <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
                              <User className="w-3 h-3" />
                              <span>{evrak.athleteName}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 block">
                              (Genel Kulüp Evrakı)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kategori & Belge No */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 block w-fit mb-1">
                          {evrak.category}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 font-semibold block">
                          {evrak.documentNumber || '-'}
                        </span>
                      </td>

                      {/* Düzenleme Tarihi */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                        {evrak.issueDate}
                      </td>

                      {/* Geçerlilik Tarihi */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold font-mono text-slate-900 block">
                            {evrak.expiryDate || 'Süresiz'}
                          </span>
                          {isWarning && (
                            <span className="text-[10px] text-amber-700 font-bold block">
                              Vize Yenilenmeli
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-[10px] text-rose-700 font-bold block">
                              Süresi Doldu!
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Durum Rozeti */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            evrak.status === 'Geçerli'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : evrak.status === 'Süresi Yaklaşan'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : evrak.status === 'Süresi Dolmuş'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {evrak.status === 'Geçerli' && <CheckCircle2 className="w-3 h-3" />}
                          {evrak.status === 'Süresi Yaklaşan' && <Clock className="w-3 h-3" />}
                          {evrak.status === 'Süresi Dolmuş' && <AlertCircle className="w-3 h-3" />}
                          <span>{evrak.status}</span>
                        </span>
                      </td>

                      {/* İşlemler */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewEvrak(evrak)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Detay & Önizle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(evrak)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Belgeyi İndir"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvrak(evrak.id, evrak.title)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">Kriterlere uygun evrak bulunamadı.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewEvrak && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Evrak Bilgi Kartı
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {previewEvrak.documentNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEvrak(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold block">Belge Adı</span>
                <p className="font-bold text-slate-900 text-sm">{previewEvrak.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-semibold block">Kulüp</span>
                  <p className="font-bold text-slate-800 mt-0.5">{previewEvrak.club}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-semibold block">İlgili Sporcu</span>
                  <p className="font-bold text-blue-700 mt-0.5">
                    {previewEvrak.athleteName || 'Genel Kulüp Evrakı'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 font-semibold block">Kategori</span>
                  <p className="font-bold text-slate-800 mt-0.5">{previewEvrak.category}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 font-semibold block">Düzenleme</span>
                  <p className="font-bold text-slate-800 mt-0.5">{previewEvrak.issueDate}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 font-semibold block">Son Geçerlilik</span>
                  <p className="font-bold text-slate-800 mt-0.5">{previewEvrak.expiryDate || 'Süresiz'}</p>
                </div>
              </div>

              {previewEvrak.notes && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-slate-700">
                  <span className="text-[11px] font-bold text-blue-900 block mb-0.5">Açıklama & Notlar:</span>
                  <p className="text-xs">{previewEvrak.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewEvrak(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Kapat
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownload(previewEvrak);
                  setPreviewEvrak(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Belgeyi İndir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Kulübe Yeni Evrak / Belge Yükle
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Lisans, sağlık raporu, veli izin ve sözleşmeler
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="py-3 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Evrak / Belge Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: TBF 2025/2026 Sezonu Lisansı veya Sağlık Raporu"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kulüp / Tesis *
                  </label>
                  <select
                    value={formClub}
                    onChange={(e) => setFormClub(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    {clubList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    İlgili Sporcu (Opsiyonel)
                  </label>
                  <select
                    value={formAthleteId}
                    onChange={(e) => setFormAthleteId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="">Kulüp Genel Evrakı</option>
                    {(safeSporcular || []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.facility})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Evrak Kategorisi *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as KulupEvrakKategori)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Lisans">Lisans</option>
                    <option value="Sağlık Raporu">Sağlık Raporu</option>
                    <option value="Veli İzin Belgesi">Veli İzin Belgesi</option>
                    <option value="Kimlik & Kayıt">Kimlik & Kayıt</option>
                    <option value="Kulüp Sözleşmesi">Kulüp Sözleşmesi</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Belge / Lisans No
                  </label>
                  <input
                    type="text"
                    placeholder="TR-2024-..."
                    value={formDocNumber}
                    onChange={(e) => setFormDocNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Düzenleme Tarihi
                  </label>
                  <input
                    type="text"
                    placeholder="GG.AA.YYYY"
                    value={formIssueDate}
                    onChange={(e) => setFormIssueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Son Geçerlilik Tarihi (Expiry)
                  </label>
                  <input
                    type="text"
                    placeholder="GG.AA.YYYY veya Süresiz"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Durum
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="Geçerli">Geçerli</option>
                  <option value="Süresi Yaklaşan">Süresi Yaklaşan (Vize Gerekli)</option>
                  <option value="Süresi Dolmuş">Süresi Dolmuş</option>
                  <option value="Onay Bekliyor">Onay Bekliyor</option>
                </select>
              </div>

              {/* File Attachment Upload area */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Dosya Ekle (PDF, JPG, PNG)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-3 text-center bg-slate-50 cursor-pointer">
                  <input
                    type="file"
                    id="file-upload-input"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setFormFileName(file.name);
                    }}
                  />
                  <label
                    htmlFor="file-upload-input"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <UploadCloud className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-bold text-blue-600">
                      {formFileName ? `Seçildi: ${formFileName}` : 'Dosya Seç veya Buraya Sürükle'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      PDF, PNG, JPG (Maks. 10MB)
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Notlar & Açıklama
                </label>
                <textarea
                  rows={2}
                  placeholder="Ek açıklamalar, federasyon onay notu vb."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Evrakı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150 backdrop-blur-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
