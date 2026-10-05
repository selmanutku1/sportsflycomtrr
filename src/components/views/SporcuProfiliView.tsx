import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Activity,
  Award,
  CalendarCheck,
  CreditCard,
  FileText,
  Edit2,
  Share2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  Plus,
  Trash2,
  Download,
  Mail,
  MapPin,
  Heart,
  FileCheck,
  X,
  MessageSquare,
  Building,
  Check,
  Camera,
  Image as ImageIcon,
  ZoomIn,
  UploadCloud,
  Eye,
  FileDown,
  Zap,
} from 'lucide-react';
import {
  SporcuItem,
  NavPage,
  KulupEvrakItem,
  KulupGaleriItem,
  KulupEvrakKategori,
  KulupGaleriKategori,
} from '../../types';
import { downloadSporcuDevelopmentPdfReport } from '../../utils/sporcuPdfReportGenerator';
import {
  SporcuProfil,
  getOrCreateSporcuProfil,
  getStoredSporcuProfilleri,
  saveStoredSporcuProfilleri,
} from '../../data/sporcuProfilData';
import {
  getStoredKulupEvraklari,
  saveStoredKulupEvraklari,
  getStoredKulupGaleri,
  saveStoredKulupGaleri,
  PRESET_AVATARS,
} from '../../data/kulupEvrakGaleriData';
import { SporcuFotoModal } from './sporcu/SporcuFotoModal';

interface SporcuProfiliViewProps {
  sporcu: SporcuItem;
  allSporcular: SporcuItem[];
  onBack: () => void;
  onSelectSporcu: (sporcu: SporcuItem) => void;
  onNavigate?: (page: NavPage) => void;
  onEditSporcu?: (sporcu: SporcuItem) => void;
}

type ProfileTab =
  | 'genel'
  | 'veli'
  | 'saglik'
  | 'performans'
  | 'yoklama'
  | 'finans'
  | 'evraklar'
  | 'galeri'
  | 'notlar';

export const SporcuProfiliView: React.FC<SporcuProfiliViewProps> = ({
  sporcu,
  allSporcular,
  onBack,
  onSelectSporcu,
  onNavigate,
  onEditSporcu,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('genel');
  const [profiller, setProfiller] = useState<Record<string, SporcuProfil>>(() =>
    getStoredSporcuProfilleri()
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Photo modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Club Documents and Gallery storage states
  const [kulupEvraklari, setKulupEvraklari] = useState<KulupEvrakItem[]>(() =>
    getStoredKulupEvraklari()
  );
  const [kulupGaleri, setKulupGaleri] = useState<KulupGaleriItem[]>(() =>
    getStoredKulupGaleri()
  );

  // Athlete documents & gallery modal states
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('all');
  const [galeriCategoryFilter, setGaleriCategoryFilter] = useState<string>('all');
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<KulupEvrakKategori>('Lisans');
  const [newDocNumber, setNewDocNumber] = useState('');
  const [newDocExpiry, setNewDocExpiry] = useState('30.06.2025');
  const [newDocStatus, setNewDocStatus] = useState<
    'Geçerli' | 'Süresi Yaklaşan' | 'Süresi Dolmuş' | 'Onay Bekliyor'
  >('Geçerli');

  const [isAddGaleriModalOpen, setIsAddGaleriModalOpen] = useState(false);
  const [newGaleriTitle, setNewGaleriTitle] = useState('');
  const [newGaleriCategory, setNewGaleriCategory] = useState<KulupGaleriKategori>('Antrenman');
  const [newGaleriUrl, setNewGaleriUrl] = useState('');
  const [newGaleriDesc, setNewGaleriDesc] = useState('');
  const [activeLightboxImage, setActiveLightboxImage] = useState<{
    url: string;
    title: string;
    date: string;
    category: string;
  } | null>(null);

  // New Note state
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('Genel Not');

  // Quick edit modal state inside profile
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    adSoyad: sporcu.name,
    email: sporcu.email,
    telefon: '',
    kulup: sporcu.facility,
    takimGrup: '',
    mevki: '',
    formaNo: 10,
    boy: 175,
    kilo: 65,
    durum: 'Aktif' as 'Aktif' | 'Pasif' | 'Donduruldu' | 'Sakat',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadReport = async () => {
    if (isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      showToast(`${currentProfil.kimlik.adSoyad} için PDF raporu hazırlanıyor...`);
      await downloadSporcuDevelopmentPdfReport({
        sporcu,
        profil: currentProfil,
      });
      showToast(`✓ ${currentProfil.kimlik.adSoyad} PDF raporu başarıyla indirildi!`);
    } catch (err) {
      console.error('PDF indirme hatası:', err);
      showToast('PDF oluşturulurken bir hata meydana geldi.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const currentProfil: SporcuProfil =
    profiller[sporcu.id] || getOrCreateSporcuProfil(sporcu);

  // SporPuan real-time logs & events synchronization
  const [sporpuanLogs, setSporpuanLogs] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sportsfly_sporpuan_logs_new');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [
      {
        id: 'sp-init-1',
        sporcuId: sporcu.id,
        sporcuName: sporcu.name,
        category: 'Devam',
        ruleName: 'Haftalık düzenli antrenman katılımı',
        points: 25,
        date: 'Bugün',
        source: 'Otomatik',
        note: 'Eylül ayı tam katılım',
      },
      {
        id: 'sp-init-2',
        sporcuId: sporcu.id,
        sporcuName: sporcu.name,
        category: 'Davranış',
        ruleName: 'Fair-play ve örnek davranış',
        points: 50,
        date: 'Dün',
        source: 'Koç Onayı',
        note: 'Takım arkadaşına destek olma ve saha disiplini',
      },
    ];
  });

  useEffect(() => {
    const handleSyncSporpuan = () => {
      try {
        const saved = localStorage.getItem('sportsfly_sporpuan_logs_new');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSporpuanLogs(parsed);
        }
      } catch (e) {}
    };

    window.addEventListener('sportsfly_point_earned', handleSyncSporpuan);
    window.addEventListener('sportsfly_notifications_updated', handleSyncSporpuan);
    window.addEventListener('storage', handleSyncSporpuan);
    return () => {
      window.removeEventListener('sportsfly_point_earned', handleSyncSporpuan);
      window.removeEventListener('sportsfly_notifications_updated', handleSyncSporpuan);
      window.removeEventListener('storage', handleSyncSporpuan);
    };
  }, []);

  // Filter logs for current athlete
  const athleteSporpuanLogs = sporpuanLogs.filter((l) => {
    const matchId =
      l.sporcuId &&
      (l.sporcuId === sporcu.id ||
        l.sporcuId === currentProfil.kimlik.tcKimlik ||
        String(l.sporcuId).includes(sporcu.id));
    const matchName =
      l.sporcuName &&
      (l.sporcuName.toLowerCase().includes(sporcu.name.toLowerCase()) ||
        sporcu.name.toLowerCase().includes(l.sporcuName.toLowerCase()) ||
        (currentProfil.kimlik.adSoyad &&
          l.sporcuName.toLowerCase().includes(currentProfil.kimlik.adSoyad.toLowerCase())));
    return matchId || matchName;
  });

  const athleteTotalPoints =
    420 + athleteSporpuanLogs.reduce((sum, l) => sum + (Number(l.points) || 0), 0);


  // Previous & Next athlete handlers
  const currentIndex = allSporcular.findIndex((s) => s.id === sporcu.id);
  const prevSporcu =
    currentIndex > 0 ? allSporcular[currentIndex - 1] : null;
  const nextSporcu =
    currentIndex < allSporcular.length - 1 ? allSporcular[currentIndex + 1] : null;

  // Open Edit Modal with current values
  const handleOpenEditModal = () => {
    setEditFormData({
      adSoyad: currentProfil.kimlik.adSoyad,
      email: currentProfil.veli.veliEposta,
      telefon: currentProfil.veli.babaTelefon || currentProfil.veli.anneTelefon,
      kulup: currentProfil.kimlik.kulup,
      takimGrup: currentProfil.kimlik.takimGrup,
      mevki: currentProfil.kimlik.mevki,
      formaNo: currentProfil.kimlik.formaNo,
      boy: currentProfil.saglik.boy,
      kilo: currentProfil.saglik.kilo,
      durum: currentProfil.kimlik.durum,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditForm = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfil: SporcuProfil = {
      ...currentProfil,
      kimlik: {
        ...currentProfil.kimlik,
        adSoyad: editFormData.adSoyad,
        kulup: editFormData.kulup,
        takimGrup: editFormData.takimGrup,
        mevki: editFormData.mevki,
        formaNo: Number(editFormData.formaNo),
        durum: editFormData.durum,
      },
      veli: {
        ...currentProfil.veli,
        veliEposta: editFormData.email,
        babaTelefon: editFormData.telefon,
      },
      saglik: {
        ...currentProfil.saglik,
        boy: Number(editFormData.boy),
        kilo: Number(editFormData.kilo),
        bki: Number(
          (
            Number(editFormData.kilo) /
            Math.pow(Number(editFormData.boy) / 100, 2)
          ).toFixed(1)
        ),
      },
    };

    const newAll = { ...profiller, [sporcu.id]: updatedProfil };
    setProfiller(newAll);
    saveStoredSporcuProfilleri(newAll);
    setIsEditModalOpen(false);
    showToast('Sporcu profil bilgileri güncellendi.');
  };

  // Add note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      yazar: 'Kulüp Yetkilisi',
      unvan: 'Antrenör',
      tarih: new Date().toLocaleDateString('tr-TR'),
      icerik: newNoteContent.trim(),
      kategori: newNoteCategory,
    };

    const updatedProfil: SporcuProfil = {
      ...currentProfil,
      notlarVeBelgeler: {
        ...currentProfil.notlarVeBelgeler,
        notlar: [newNote, ...currentProfil.notlarVeBelgeler.notlar],
      },
    };

    const newAll = { ...profiller, [sporcu.id]: updatedProfil };
    setProfiller(newAll);
    saveStoredSporcuProfilleri(newAll);
    setNewNoteContent('');
    setIsAddingNote(false);
    showToast('Yeni antrenör notu başarıyla eklendi.');
  };

  // Quick WhatsApp message
  const handleSendWhatsApp = () => {
    const phone =
      currentProfil.veli.babaTelefon || currentProfil.veli.anneTelefon;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Sayın Veli, Sporcumuz ${currentProfil.kimlik.adSoyad} hakkında bilgilendirme:`
    );
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`, '_blank');
  };

  // Athlete Photo update handler
  const handleSavePhoto = (newUrl: string) => {
    const updatedProfil: SporcuProfil = {
      ...currentProfil,
      kimlik: {
        ...currentProfil.kimlik,
        fotoUrl: newUrl,
      },
    };
    const updatedProfiller = {
      ...profiller,
      [sporcu.id]: updatedProfil,
    };
    setProfiller(updatedProfiller);
    saveStoredSporcuProfilleri(updatedProfiller);
    if (onEditSporcu) {
      onEditSporcu({
        ...sporcu,
        avatarUrl: newUrl,
      });
    }
    showToast('Sporcu profil görseli başarıyla güncellendi.');
  };

  // Athlete Document management
  const athleteEvraklarRaw = kulupEvraklari.filter(
    (e) =>
      e.athleteId === sporcu.id ||
      e.athleteName === currentProfil.kimlik.adSoyad ||
      e.athleteName === sporcu.name
  );

  const athleteEvraklar = athleteEvraklarRaw.filter((e) => {
    if (docCategoryFilter !== 'all' && e.category !== docCategoryFilter) return false;
    return true;
  });

  const handleAddDocToAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    const newDoc: KulupEvrakItem = {
      id: `evrak-${Date.now()}`,
      title: newDocTitle.trim(),
      club: currentProfil.kimlik.kulup,
      athleteId: sporcu.id,
      athleteName: currentProfil.kimlik.adSoyad,
      category: newDocCategory,
      documentNumber: newDocNumber.trim() || `EVR-${Math.floor(10000 + Math.random() * 90000)}`,
      issueDate: new Date().toLocaleDateString('tr-TR'),
      expiryDate: newDocExpiry.trim() || undefined,
      status: newDocStatus,
      fileType: 'pdf',
      fileSize: '1.2 MB',
      uploadedBy: 'Kulüp Antrenörü',
    };

    const updatedDocs = [newDoc, ...kulupEvraklari];
    setKulupEvraklari(updatedDocs);
    saveStoredKulupEvraklari(updatedDocs);

    // Also sync to athlete profile internal belgeler list
    const updatedProfil: SporcuProfil = {
      ...currentProfil,
      notlarVeBelgeler: {
        ...currentProfil.notlarVeBelgeler,
        belgeler: [
          {
            id: newDoc.id,
            ad: `${newDoc.title}.pdf`,
            tur: 'PDF',
            yuklenmeTarihi: newDoc.issueDate,
            boyut: newDoc.fileSize,
            durum: 'Onaylandi',
          },
          ...currentProfil.notlarVeBelgeler.belgeler,
        ],
      },
    };
    const updatedProfiller = {
      ...profiller,
      [sporcu.id]: updatedProfil,
    };
    setProfiller(updatedProfiller);
    saveStoredSporcuProfilleri(updatedProfiller);

    setIsAddDocModalOpen(false);
    setNewDocTitle('');
    setNewDocNumber('');
    showToast(`"${newDoc.title}" evrakı başarıyla yüklendi.`);
  };

  const handleDeleteAthleteDoc = (id: string, title: string) => {
    if (window.confirm(`"${title}" evrakını silmek istediğinize emin misiniz?`)) {
      const updated = kulupEvraklari.filter((e) => e.id !== id);
      setKulupEvraklari(updated);
      saveStoredKulupEvraklari(updated);
      showToast(`"${title}" evrakı silindi.`);
    }
  };

  // Athlete Gallery management
  const athleteGaleriPhotosRaw = [
    ...(currentProfil.galeri || []).map((g) => ({
      id: g.id,
      title: g.title,
      imageUrl: g.url,
      date: g.date,
      category: g.category as KulupGaleriKategori,
      club: currentProfil.kimlik.kulup,
      description: 'Sporcu bireysel albümü',
      taggedAthletes: [currentProfil.kimlik.adSoyad],
    })),
    ...kulupGaleri.filter(
      (g) =>
        g.taggedAthletes?.some(
          (a) => a === currentProfil.kimlik.adSoyad || a === sporcu.name
        ) &&
        !currentProfil.galeri?.some((cg) => cg.id === g.id)
    ),
  ];

  const athleteGaleriPhotos = athleteGaleriPhotosRaw.filter((p) => {
    if (galeriCategoryFilter !== 'all' && p.category !== galeriCategoryFilter) return false;
    return true;
  });

  const handleAddPhotoToAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGaleriTitle.trim()) return;

    const finalUrl =
      newGaleriUrl.trim() ||
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1000&auto=format&fit=crop&q=80';

    const newPhoto: KulupGaleriItem = {
      id: `gal-${Date.now()}`,
      title: newGaleriTitle.trim(),
      club: currentProfil.kimlik.kulup,
      category: newGaleriCategory,
      date: new Date().toLocaleDateString('tr-TR'),
      imageUrl: finalUrl,
      description: newGaleriDesc.trim() || undefined,
      taggedAthletes: [currentProfil.kimlik.adSoyad],
      uploaderName: 'Kulüp Antrenörü',
    };

    const updatedGaleri = [newPhoto, ...kulupGaleri];
    setKulupGaleri(updatedGaleri);
    saveStoredKulupGaleri(updatedGaleri);

    // Also add to currentProfil.galeri
    const currentGal = currentProfil.galeri || [];
    const updatedProfil: SporcuProfil = {
      ...currentProfil,
      galeri: [
        {
          id: newPhoto.id,
          url: newPhoto.imageUrl,
          title: newPhoto.title,
          date: newPhoto.date,
          category: newPhoto.category,
        },
        ...currentGal,
      ],
    };
    const updatedProfiller = {
      ...profiller,
      [sporcu.id]: updatedProfil,
    };
    setProfiller(updatedProfiller);
    saveStoredSporcuProfilleri(updatedProfiller);

    setIsAddGaleriModalOpen(false);
    setNewGaleriTitle('');
    setNewGaleriUrl('');
    setNewGaleriDesc('');
    showToast(`"${newPhoto.title}" görseli sporcu galerisine eklendi.`);
  };

  const handleDeleteAthletePhoto = (id: string, title: string) => {
    if (window.confirm(`"${title}" fotoğrafını galeriden silmek istediğinize emin misiniz?`)) {
      const updatedGaleri = kulupGaleri.filter((g) => g.id !== id);
      setKulupGaleri(updatedGaleri);
      saveStoredKulupGaleri(updatedGaleri);

      const updatedProfil: SporcuProfil = {
        ...currentProfil,
        galeri: (currentProfil.galeri || []).filter((g) => g.id !== id),
      };
      const updatedProfiller = {
        ...profiller,
        [sporcu.id]: updatedProfil,
      };
      setProfiller(updatedProfiller);
      saveStoredSporcuProfilleri(updatedProfiller);

      if (activeLightboxImage?.url) setActiveLightboxImage(null);
      showToast(`"${title}" fotoğrafı silindi.`);
    }
  };

  const handleSetAsProfilePhoto = (photoUrl: string) => {
    handleSavePhoto(photoUrl);
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header / Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Sporcu Listesine Geri Dön"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Sporcu Listesine Dön</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Sporcular</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">
              {currentProfil.kimlik.adSoyad}
            </span>
            <span>/</span>
            <span className="text-blue-600 font-semibold">Profil Detayı</span>
          </div>
        </div>

        {/* Previous / Next Athlete Quick Switch */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!prevSporcu}
            onClick={() => prevSporcu && onSelectSporcu(prevSporcu)}
            className="p-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title={prevSporcu ? `Önceki: ${prevSporcu.name}` : 'İlk Sporcu'}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-500 font-semibold px-1">
            {currentIndex + 1} / {allSporcular.length}
          </span>
          <button
            type="button"
            disabled={!nextSporcu}
            onClick={() => nextSporcu && onSelectSporcu(nextSporcu)}
            className="p-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title={nextSporcu ? `Sonraki: ${nextSporcu.name}` : 'Son Sporcu'}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors ml-1"
            title="Yazdır"
          >
            <Printer className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Main Profile Summary Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar and Identity Info */}
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Interactive Avatar with Camera Overlay & Corner Action Badge */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsPhotoModalOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsPhotoModalOpen(true);
                }
              }}
              className="relative group cursor-pointer shrink-0 select-none"
              title="Profil Fotoğrafı Ekle / Değiştir (Tıklayın)"
              aria-label="Profil Fotoğrafı Ekle veya Değiştir"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs relative overflow-hidden border-2 border-slate-200/90 group-hover:border-blue-500 transition-all">
                {currentProfil.kimlik.fotoUrl || (sporcu as any).avatarUrl ? (
                  <img
                    src={currentProfil.kimlik.fotoUrl || (sporcu as any).avatarUrl}
                    alt={currentProfil.kimlik.adSoyad}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-9 h-9 sm:w-11 sm:h-11 text-slate-300" />
                )}

                {/* Camera Overlay on Hover */}
                <div className="absolute inset-0 bg-slate-900/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[1px]">
                  <Camera className="w-5 h-5 mb-0.5 text-white drop-shadow-xs" />
                  <span className="text-[10px] font-bold">Değiştir</span>
                </div>
              </div>

              {/* Jersey Number Badge (Top-Left) */}
              <span className="absolute -top-2 -left-2 bg-slate-900/90 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border border-white/80 z-10 shadow-xs">
                #{currentProfil.kimlik.formaNo}
              </span>

              {/* Prominent Camera Action Badge (Bottom-Right) */}
              <div
                className="absolute -bottom-1.5 -right-1.5 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full shadow-md border-2 border-white ring-1 ring-blue-500/20 group-hover:scale-110 active:scale-95 transition-all z-10 flex items-center justify-center"
                title="Fotoğraf Yükle veya Değiştir"
              >
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentProfil.kimlik.adSoyad}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {currentProfil.kimlik.durum}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {currentProfil.kimlik.brans}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {currentProfil.kimlik.kulup} • {currentProfil.kimlik.takimGrup} • {currentProfil.kimlik.mevki}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-mono">
                <span>Sporcu Kodu: <strong className="text-slate-800">{currentProfil.sporcuKodu}</strong></span>
                <span>•</span>
                <span>Lisans: <strong className="text-slate-800">{currentProfil.kimlik.lisansNo}</strong></span>
                <span>•</span>
                <span>Kayıt: {currentProfil.kimlik.kayitTarihi}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Düzenle</span>
            </button>

            <button
              id="btn-profil-rapor-indir"
              type="button"
              onClick={handleDownloadReport}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Gelişim ve antrenman katılım verilerini tek tıkla PDF raporu olarak indir"
            >
              {isGeneratingPdf ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? 'İndiriliyor...' : 'Rapor İndir (PDF)'}</span>
            </button>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('sporcu-karnesi')}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Sporcu Karnesi</span>
              </button>
            )}
          </div>
        </div>

        {/* 6 Quick Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Yaş ve Doğum</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              {currentProfil.kimlik.yas} Yaş
            </p>
            <span className="text-[11px] text-slate-500">{currentProfil.kimlik.dogumTarihi}</span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Boy / Kilo (BKI)</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              {currentProfil.saglik.boy} cm / {currentProfil.saglik.kilo} kg
            </p>
            <span className="text-[11px] text-emerald-700 font-semibold">BKI: {currentProfil.saglik.bki} (İdeal)</span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Antrenman Katılımı</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              %{currentProfil.yoklama.katilimYuzdesi}
            </p>
            <span className="text-[11px] text-slate-500">
              {currentProfil.yoklama.katildigiAntrenman} / {currentProfil.yoklama.toplamAntrenman} Seans
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Genel Karne Puanı</span>
            <p className="text-sm font-bold text-blue-700 mt-0.5">
              {currentProfil.performans.genelOrtalama} <span className="text-xs text-slate-500 font-normal">/ 10</span>
            </p>
            <span className="text-[11px] text-blue-600 font-semibold">Üst Düzey Başarı</span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">Aidat & Bakiye</span>
            <p className="text-sm font-bold text-emerald-700 mt-0.5">
              {currentProfil.finans.durum}
            </p>
            <span className="text-[11px] text-slate-500">{currentProfil.finans.paketAdi.slice(0, 18)}...</span>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-xl p-3 border border-amber-200/80">
            <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
              <span>Sporpuan (SP)</span>
            </span>
            <p className="text-sm font-black text-amber-950 mt-0.5">
              {athleteTotalPoints} SP
            </p>
            <span className="text-[11px] text-amber-700 font-semibold">
              {athleteSporpuanLogs.length} Etkinlik Kaydı
            </span>
          </div>
        </div>
      </div>

      {/* DETAIL BUTTONS / NAVIGATION TABS (Sade, Profesyonel Segment Butonlar) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('genel')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'genel'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Genel & Kimlik</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('veli')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'veli'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Veli & İletişim</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saglik')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'saglik'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Sağlık & Fiziksel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('performans')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'performans'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Performans & Karne</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('yoklama')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'yoklama'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Yoklama & Katılım</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finans')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'finans'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Finans & Aidat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evraklar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'evraklar'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Evraklar & Lisanslar ({athleteEvraklarRaw.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('galeri')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'galeri'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Galeri & Fotoğraflar ({athleteGaleriPhotosRaw.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notlar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'notlar'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Antrenör Notları ({currentProfil.notlarVeBelgeler.notlar.length})</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 min-h-[420px]">
        {/* ============================================================ */}
        {/* TAB 1: GENEL & KİMLİK BİLGİLERİ */}
        {/* ============================================================ */}
        {activeTab === 'genel' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Kimlik ve Nüfus Kayıt Bilgileri</h3>
                <p className="text-xs text-slate-500">Sporcunun resmi kayıt ve lisanslama bilgileri</p>
              </div>
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Düzenle</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">T.C. Kimlik Numarası</span>
                <span className="text-sm font-mono font-bold text-slate-800 mt-0.5 block">{currentProfil.kimlik.tcKimlik}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">Adı Soyadı</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">{currentProfil.kimlik.adSoyad}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">Doğum Tarihi / Yaş</span>
                <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                  {currentProfil.kimlik.dogumTarihi} ({currentProfil.kimlik.yas} Yaş)
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">Doğum Yeri / Uyruk</span>
                <span className="text-sm font-medium text-slate-800 mt-0.5 block">
                  {currentProfil.kimlik.dogumYeri} • {currentProfil.kimlik.uyruk}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">Cinsiyet / Kan Grubu</span>
                <span className="text-sm font-medium text-slate-800 mt-0.5 block">
                  {currentProfil.kimlik.cinsiyet} • {currentProfil.kimlik.kanGrubu}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">Öğrenim Gördüğü Okul / Sınıf</span>
                <span className="text-sm font-medium text-slate-800 mt-0.5 block">
                  {currentProfil.kimlik.okul} ({currentProfil.kimlik.sinif})
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-1">Kulüp ve Sporcu Tescil Bilgileri</h3>
              <p className="text-xs text-slate-500 mb-4">Kulüp içi branş, takım ve lisans detayları</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block">Kulüp / Şube</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">{currentProfil.kimlik.kulup}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block">Takım / Yaş Grubu</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">{currentProfil.kimlik.takimGrup}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block">Mevki / Forma No</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {currentProfil.kimlik.mevki} (Forma #{currentProfil.kimlik.formaNo})
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block">Baskın Taraf</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">{currentProfil.kimlik.baskinTaraf}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block">Lisans Türü</span>
                  <span className="text-sm font-medium text-slate-800 mt-0.5 block">{currentProfil.kimlik.lisansTuru}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block">Lisans Belge No</span>
                  <span className="text-sm font-mono font-bold text-slate-800 mt-0.5 block">{currentProfil.kimlik.lisansNo}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block">Kulübe İlk Kayıt Tarihi</span>
                  <span className="text-sm font-medium text-slate-800 mt-0.5 block">{currentProfil.kimlik.kayitTarihi}</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block">Mevcut Durumu</span>
                  <span className="text-sm font-bold text-emerald-700 mt-0.5 block">{currentProfil.kimlik.durum}</span>
                </div>
              </div>
            </div>

            {/* Son Puan & Gelişim Etkinlikleri (SporPuan) */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center">
                      <Zap className="w-4 h-4 fill-amber-500" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Son Puan & Gelişim Etkinlikleri (Sporpuan)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kulüp yöneticisi ve antrenör tarafından tanımlanan anlık puan kazanımları ve bildirim geçmişi
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{athleteTotalPoints} SP</span>
                  </div>

                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('sporpuan-sporcu-degerlendirme')}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                      title="Sporcuya yeni puan tanımla ve bildirim merkezini tetikle"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Yeni Puan Tanımla</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Activity Timeline List */}
              {athleteSporpuanLogs.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Zap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Henüz puan etkinliği kaydedilmemiş.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Antrenör veya yönetici tarafından tanımlanan puanlar burada anlık listelenecektir.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {athleteSporpuanLogs.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Zap className="w-4 h-4 fill-amber-500" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {item.ruleName}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                              {item.category}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {item.date || 'Şimdi'}
                            </span>
                          </div>

                          {item.note && (
                            <p className="text-[11px] text-slate-600 mt-1 italic">
                              "{item.note}"
                            </p>
                          )}

                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                            <span className="font-semibold text-slate-600">
                              Kaynak: {item.source || 'Koç Onayı'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Bildirim Merkezine İletildi</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                          +{item.points} SP
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5 hidden sm:inline">
                          Kazanım Onaylandı
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: VELİ & İLETİŞİM BİLGİLERİ */}
        {/* ============================================================ */}
        {activeTab === 'veli' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Veli ve İletişim Rehberi</h3>
                <p className="text-xs text-slate-500">Anne, baba, acil durum irtibat ve tebligat adresleri</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Başlat</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Baba Bilgileri */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Baba Bilgileri</span>
                  </h4>
                  {currentProfil.veli.birincilIletisim === 'Baba' && (
                    <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Birincil Veli
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500">Ad Soyad:</span>
                    <span className="font-bold text-slate-800">{currentProfil.veli.babaAdSoyad}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500">Telefon:</span>
                    <a
                      href={`tel:${currentProfil.veli.babaTelefon}`}
                      className="font-mono font-bold text-blue-600 hover:underline"
                    >
                      {currentProfil.veli.babaTelefon}
                    </a>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Meslek:</span>
                    <span className="font-medium text-slate-700">{currentProfil.veli.babaMeslek}</span>
                  </div>
                </div>
              </div>

              {/* Anne Bilgileri */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-rose-600" />
                    <span>Anne Bilgileri</span>
                  </h4>
                  {currentProfil.veli.birincilIletisim === 'Anne' && (
                    <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                      Birincil Veli
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500">Ad Soyad:</span>
                    <span className="font-bold text-slate-800">{currentProfil.veli.anneAdSoyad}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500">Telefon:</span>
                    <a
                      href={`tel:${currentProfil.veli.anneTelefon}`}
                      className="font-mono font-bold text-blue-600 hover:underline"
                    >
                      {currentProfil.veli.anneTelefon}
                    </a>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Meslek:</span>
                    <span className="font-medium text-slate-700">{currentProfil.veli.anneMeslek}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Adres ve Acil Durum Bilgisi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <span>İkametgah ve E-Posta</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Veli E-posta Adresi:</span>
                    <a
                      href={`mailto:${currentProfil.veli.veliEposta}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {currentProfil.veli.veliEposta}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Ev Adresi:</span>
                    <p className="font-medium text-slate-800">{currentProfil.veli.evAdresi}</p>
                    <span className="text-slate-500 block text-[11px] mt-0.5 font-semibold">
                      {currentProfil.veli.ilIlce}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3">
                <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Acil Durum İletişim Kişisi</span>
                </h4>
                <p className="text-xs text-amber-800">
                  Antrenman veya müsabaka esnasında beklenmeyen bir sağlık durumunda ilk aranacak kişi:
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-amber-800">Kişi / Yakınlık:</span>
                    <strong className="text-amber-950">
                      {currentProfil.veli.acilDurumKisi} ({currentProfil.veli.acilDurumYakinlik})
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-800">Acil Telefon:</span>
                    <a
                      href={`tel:${currentProfil.veli.acilDurumTelefon}`}
                      className="font-mono font-bold text-amber-950 hover:underline"
                    >
                      {currentProfil.veli.acilDurumTelefon}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: SAĞLIK & FİZİKSEL DURUM */}
        {/* ============================================================ */}
        {activeTab === 'saglik' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Sağlık Raporu ve Fiziksel Ölçümler</h3>
                <p className="text-xs text-slate-500">Spor hekimi onayı, antropometrik ölçümler ve kronik durumlar</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Sağlık Raporu: {currentProfil.saglik.raporDurumu}
              </span>
            </div>

            {/* Antropometri Kartları */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-xs text-slate-500 font-semibold block">Boy</span>
                <p className="text-xl font-black text-slate-800 mt-1">{currentProfil.saglik.boy} cm</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-xs text-slate-500 font-semibold block">Kilo</span>
                <p className="text-xl font-black text-slate-800 mt-1">{currentProfil.saglik.kilo} kg</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-xs text-slate-500 font-semibold block">BKI (Vücut Kitle)</span>
                <p className="text-xl font-black text-emerald-700 mt-1">{currentProfil.saglik.bki}</p>
                <span className="text-[10px] text-emerald-600 font-semibold">Normal Aralık</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-xs text-slate-500 font-semibold block">Kan Grubu</span>
                <p className="text-xl font-black text-rose-700 mt-1">{currentProfil.saglik.kanGrubu}</p>
              </div>
            </div>

            {/* Sağlık Raporu ve Sigorta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>Resmi Sporcu Sağlık Raporu</span>
                </h4>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Rapor Tarihi:</span>
                  <span className="font-semibold text-slate-800">{currentProfil.saglik.saglikRaporuTarihi}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Geçerlilik Bitiş:</span>
                  <span className="font-semibold text-slate-800">{currentProfil.saglik.saglikRaporuGecerlilik}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Acil Tıbbi Müdahale Onayı:</span>
                  <span className="font-bold text-emerald-700">Veli Tarafından Onaylandı</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Sporcu Özel Sağlık Sigortası</span>
                </h4>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Sigorta Şirketi:</span>
                  <span className="font-semibold text-slate-800">{currentProfil.saglik.sigortaSirketi}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Poliçe Numarası:</span>
                  <span className="font-mono font-bold text-slate-800">{currentProfil.saglik.sigortaPoliceNo}</span>
                </div>
              </div>
            </div>

            {/* Alerji & Rahatsızlıklar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-800 block mb-1">Alerjiler</span>
                {currentProfil.saglik.alerjiler.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {currentProfil.saglik.alerjiler.map((a, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-xs bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                        {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">Bilinen alerji yok</span>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-800 block mb-1">Kronik Rahatsızlıklar</span>
                {currentProfil.saglik.kronikRahatsizliklar.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {currentProfil.saglik.kronikRahatsizliklar.map((k, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-xs bg-slate-200 text-slate-800 font-medium">
                        {k}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">Kronik rahatsızlık yok</span>
                )}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-800 block mb-1">Kullanılan İlaçlar</span>
                {currentProfil.saglik.kullanilanIlaclar.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {currentProfil.saglik.kullanilanIlaclar.map((ilac, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                        {ilac}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-500">Düzenli ilaç kullanımı yok</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: PERFORMANS & KARNE */}
        {/* ============================================================ */}
        {activeTab === 'performans' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Teknik & Atletik Performans Değerlendirmesi</h3>
                <p className="text-xs text-slate-500">Antrenör puanlamaları, fiziksel testler ve kazanılan rozetler</p>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('sporcu-karnesi')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  <span>Resmi Karne Görünümünü Aç</span>
                </button>
              )}
            </div>

            {/* 4 Ana Puan Sütunu */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                <span className="text-xs text-slate-500 font-semibold block">Teknik Puan</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{currentProfil.performans.teknikPuan}</p>
                <span className="text-[11px] text-slate-400">/ 10</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                <span className="text-xs text-slate-500 font-semibold block">Fiziksel Puan</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{currentProfil.performans.fizikselPuan}</p>
                <span className="text-[11px] text-slate-400">/ 10</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                <span className="text-xs text-slate-500 font-semibold block">Taktiksel Puan</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{currentProfil.performans.taktikselPuan}</p>
                <span className="text-[11px] text-slate-400">/ 10</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
                <span className="text-xs text-slate-500 font-semibold block">Zihinsel & Karakter</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{currentProfil.performans.zihinselPuan}</p>
                <span className="text-[11px] text-slate-400">/ 10</span>
              </div>
            </div>

            {/* Antrenör Değerlendirmesi */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/70 space-y-2">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Antrenör Baş Değerlendirmesi
              </h4>
              <p className="text-sm text-slate-800 leading-relaxed italic">
                "{currentProfil.performans.antrenorGorus}"
              </p>
            </div>

            {/* Güçlü Yönler & Gelişim Alanları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Öne Çıkan Güçlü Yönler
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {currentProfil.performans.gucluYonler.map((yon, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {yon}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Geliştirilmesi Hedeflenen Alanlar
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {currentProfil.performans.gelisimAlanlari.map((alan, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      {alan}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Fiziksel Testler Tablosu */}
            <div className="pt-2">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Dönemsel Fiziksel Test Sonuçları</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Test Adı</th>
                      <th className="py-2.5 px-3">Sporcu Değeri</th>
                      <th className="py-2.5 px-3">Yaş Grubu Hedefi</th>
                      <th className="py-2.5 px-3 text-right">Değerlendirme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {currentProfil.performans.fizikselTestler.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{t.testAdi}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-900 font-bold">{t.sonuc}</td>
                        <td className="py-2.5 px-3 text-slate-500">{t.hedef}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              t.durum === 'Iyi'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {t.durum === 'Iyi' ? 'Hedefe Uygun' : 'Geliştirilmeli'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: YOKLAMA & KATILIM */}
        {/* ============================================================ */}
        {activeTab === 'yoklama' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Yoklama ve Seans Devam Takibi</h3>
                <p className="text-xs text-slate-500">Sezon içi toplam antrenman devam oranları ve son katılım kayıtları</p>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('yoklama')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-slate-600" />
                  <span>Yoklama Modülüne Git</span>
                </button>
              )}
            </div>

            {/* İstatistik Çubukları */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold block">Katılım Oranı</span>
                <p className="text-xl font-black text-emerald-700 mt-1">
                  %{currentProfil.yoklama.katilimYuzdesi}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold block">Katıldığı Antrenman</span>
                <p className="text-xl font-black text-slate-800 mt-1">
                  {currentProfil.yoklama.katildigiAntrenman} Seans
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold block">Mazeretli Devamsızlık</span>
                <p className="text-xl font-black text-blue-700 mt-1">
                  {currentProfil.yoklama.mazeretliDevamsizlik} Seans
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold block">Mazeretsiz Devamsızlık</span>
                <p className="text-xl font-black text-rose-700 mt-1">
                  {currentProfil.yoklama.mazeretsizDevamsizlik} Seans
                </p>
              </div>
            </div>

            {/* Son Seanslar Tablosu */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-slate-900">Son Antrenman Seansları</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Tarih / Saat</th>
                      <th className="py-2.5 px-3">Antrenman Başlığı</th>
                      <th className="py-2.5 px-3">Durum</th>
                      <th className="py-2.5 px-3">Açıklama / Not</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {currentProfil.yoklama.sonKayitlar.map((kayit, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-mono text-slate-700">
                          {kayit.tarih} - {kayit.saat}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{kayit.baslik}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              kayit.durum === 'Katildi'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : kayit.durum === 'Mazeretli'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {kayit.durum}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{kayit.not || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: FİNANS & AİDAT DURUMU */}
        {/* ============================================================ */}
        {activeTab === 'finans' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Aidat ve Finansal Hesap Özeti</h3>
                <p className="text-xs text-slate-500">Üyelik paketi, aylık aidatlar ve tahsilat makbuzları</p>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('on-muhasebe')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-slate-600" />
                  <span>Ön Muhasebeye Git</span>
                </button>
              )}
            </div>

            {/* Paket & Aidat Özet Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Kayıtlı Paket</span>
                <p className="text-base font-bold text-slate-900">{currentProfil.finans.paketAdi}</p>
                <p className="text-xs text-slate-500">{currentProfil.finans.odemePlani}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Aylık Aidat Tutarı</span>
                <p className="text-xl font-black text-slate-900">{currentProfil.finans.aylikAidat} TL</p>
                <p className="text-xs text-emerald-700 font-semibold">Son Ödeme: {currentProfil.finans.sonOdemeTarihi}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-xs text-slate-500 font-semibold block">Gelecek Vade & Bakiye</span>
                <p className="text-base font-bold text-emerald-700">Borç Bulunmuyor</p>
                <p className="text-xs text-slate-500">Sonraki Vade: {currentProfil.finans.sonrakiOdemeTarihi}</p>
              </div>
            </div>

            {/* Ödeme Geçmişi */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-slate-900">Geçmiş Tahsilat Makbuzları</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Makbuz No</th>
                      <th className="py-2.5 px-3">Dönem</th>
                      <th className="py-2.5 px-3">Tutar</th>
                      <th className="py-2.5 px-3">Tarih</th>
                      <th className="py-2.5 px-3">Ödeme Yöntemi</th>
                      <th className="py-2.5 px-3 text-right">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {currentProfil.finans.odemeler.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{o.makbuzNo}</td>
                        <td className="py-2.5 px-3 text-slate-700">{o.donem}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{o.tutar} TL</td>
                        <td className="py-2.5 px-3 text-slate-500">{o.odemeTarihi}</td>
                        <td className="py-2.5 px-3 text-slate-600">{o.yontem}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {o.durum}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: NOTLAR & BELGELER */}
        {/* ============================================================ */}
        {activeTab === 'notlar' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Antrenör Notları ve Resmi Belgeler</h3>
                <p className="text-xs text-slate-500">Sporcuya ait özel gözlem notları, lisans ve taahhüt belgeleri</p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingNote(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Not Ekle</span>
              </button>
            </div>

            {/* Add note inline card */}
            {isAddingNote && (
              <form onSubmit={handleAddNote} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">Antrenör / Yetkili Notu Ekle</h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kategori</label>
                    <select
                      value={newNoteCategory}
                      onChange={(e) => setNewNoteCategory(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="Teknik Not">Teknik Not</option>
                      <option value="Taktik Not">Taktik Not</option>
                      <option value="Disiplin & Davranış">Disiplin & Davranış</option>
                      <option value="Beslenme & Sağlık">Beslenme & Sağlık</option>
                      <option value="Veli Görüşmesi">Veli Görüşmesi</option>
                      <option value="Genel Not">Genel Not</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Not Açıklaması *</label>
                    <input
                      type="text"
                      required
                      placeholder="Sporcu hakkında antrenör gözlemi..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingNote(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
                  >
                    Notu Kaydet
                  </button>
                </div>
              </form>
            )}

            {/* Notes List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Gözlem ve Değerlendirme Notları ({currentProfil.notlarVeBelgeler.notlar.length})
              </h4>
              {currentProfil.notlarVeBelgeler.notlar.length > 0 ? (
                <div className="space-y-2.5">
                  {currentProfil.notlarVeBelgeler.notlar.map((n) => (
                    <div key={n.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{n.yazar}</span>
                          <span className="text-[11px] text-slate-500 font-medium">({n.unvan})</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {n.kategori}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px]">{n.tarih}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{n.icerik}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3">Kayıtlı not bulunmuyor.</p>
              )}
            </div>

            {/* Documents List */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Resmi Belgeler ve Evraklar ({currentProfil.notlarVeBelgeler.belgeler.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentProfil.notlarVeBelgeler.belgeler.map((b) => (
                  <div key={b.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-5 h-5 text-rose-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate" title={b.ad}>
                          {b.ad}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {b.boyut} • {b.yuklenmeTarihi}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast(`${b.ad} indiriliyor...`)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg shrink-0 transition-colors"
                      title="Belgeyi İndir"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 8: EVRAKLAR & RESMİ LİSANSLAR */}
        {/* ============================================================ */}
        {activeTab === 'evraklar' && (
          <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span>Resmi Evraklar, Lisanslar ve Sağlık Belgeleri</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sporcunun federasyon lisansı, periyodik sağlık raporu, veli izin taahhütnameleri ve kayıt evrakları.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddDocModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Evrak Yükle</span>
              </button>
            </div>

            {/* Status Summary Pill Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-800 block">Geçerli Evraklar</span>
                    <span className="text-base font-black text-emerald-900">
                      {athleteEvraklarRaw.filter((e) => e.status === 'Geçerli').length} Adet
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                  Aktif
                </span>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <div>
                    <span className="text-[11px] font-semibold text-amber-800 block">Süresi Yaklaşan</span>
                    <span className="text-base font-black text-amber-900">
                      {athleteEvraklarRaw.filter((e) => e.status === 'Süresi Yaklaşan').length} Adet
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-amber-700 bg-white/80 px-2 py-0.5 rounded-md border border-amber-200">
                  Yenileme
                </span>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <div>
                    <span className="text-[11px] font-semibold text-rose-800 block">Süresi Dolan / Eksik</span>
                    <span className="text-base font-black text-rose-900">
                      {athleteEvraklarRaw.filter((e) => e.status === 'Süresi Dolmuş').length} Adet
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-rose-700 bg-white/80 px-2 py-0.5 rounded-md border border-rose-200">
                  Kritik
                </span>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs text-slate-400 font-semibold mr-1 shrink-0">Kategori:</span>
              {[
                { id: 'all', label: `Tümü (${athleteEvraklarRaw.length})` },
                { id: 'Lisans', label: `Lisanslar (${athleteEvraklarRaw.filter((e) => e.category === 'Lisans').length})` },
                { id: 'Sağlık Raporu', label: `Sağlık (${athleteEvraklarRaw.filter((e) => e.category === 'Sağlık Raporu').length})` },
                { id: 'Veli İzin Belgesi', label: `Veli İzni (${athleteEvraklarRaw.filter((e) => e.category === 'Veli İzin Belgesi').length})` },
                { id: 'Kimlik / Pasaport', label: 'Kimlik & Pasaport' },
                { id: 'Kayıt Sözleşmesi', label: 'Sözleşmeler' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setDocCategoryFilter(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    docCategoryFilter === c.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Documents List */}
            {athleteEvraklar.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {athleteEvraklar.map((doc) => {
                  const isExpiring = doc.status === 'Süresi Yaklaşan';
                  const isExpired = doc.status === 'Süresi Dolmuş';
                  return (
                    <div
                      key={doc.id}
                      className="p-4 bg-white border border-slate-200/90 rounded-2xl hover:shadow-xs transition-all flex flex-col justify-between gap-3 relative group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                              <FileCheck className="w-4 h-4" />
                            </span>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                {doc.category}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 line-clamp-1" title={doc.title}>
                                {doc.title}
                              </h4>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                              isExpired
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isExpiring
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-500 pt-1 font-mono">
                          {doc.documentNumber && (
                            <div className="flex justify-between">
                              <span>Belge No:</span>
                              <span className="font-bold text-slate-700">{doc.documentNumber}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Veriliş:</span>
                            <span className="text-slate-700">{doc.issueDate}</span>
                          </div>
                          {doc.expiryDate && (
                            <div className="flex justify-between">
                              <span>Geçerlilik:</span>
                              <span className={`font-bold ${isExpired ? 'text-rose-600' : isExpiring ? 'text-amber-600' : 'text-slate-700'}`}>
                                {doc.expiryDate}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                        <span className="text-[11px] text-slate-400">
                          {doc.fileSize} • {doc.fileType.toUpperCase()}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => showToast(`"${doc.title}" evrakı indiriliyor...`)}
                            className="flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold transition-colors cursor-pointer"
                            title="Belgeyi İndir"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                            <span>İndir</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAthleteDoc(doc.id, doc.title)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Evrakı Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl p-6">
                <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">Evrak Bulunamadı</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Bu filtrede veya sporcuya ait henüz resmi bir evrak yüklenmemiş.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddDocModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>İlk Evrakı Yükle</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 9: GALERİ & MEDYA */}
        {/* ============================================================ */}
        {activeTab === 'galeri' && (
          <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  <span>Sporcu ve Kulüp Fotoğraf Galerisi</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Antrenman anları, maç fotoğrafları, kupa törenleri ve bireysel sporcu portreleri.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddGaleriModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Fotoğraf Ekle</span>
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs text-slate-400 font-semibold mr-1 shrink-0">Filtrele:</span>
              {[
                { id: 'all', label: `Tümü (${athleteGaleriPhotosRaw.length})` },
                { id: 'Antrenman', label: 'Antrenman' },
                { id: 'Maç & Turnuva', label: 'Maç & Turnuva' },
                { id: 'Kupa & Madalya', label: 'Kupa & Ödül' },
                { id: 'Bireysel & Portre', label: 'Portre' },
                { id: 'Kulüp Etkinliği', label: 'Etkinlik' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setGaleriCategoryFilter(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    galeriCategoryFilter === c.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            {athleteGaleriPhotos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {athleteGaleriPhotos.map((photo) => {
                  const isCurrentProfilePhoto =
                    currentProfil.kimlik.fotoUrl === photo.imageUrl;
                  return (
                    <div
                      key={photo.id}
                      className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between relative"
                    >
                      {/* Image container */}
                      <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />

                        {/* Top Category Badge */}
                        <div className="absolute top-2 left-2 z-10">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                            {photo.category}
                          </span>
                        </div>

                        {/* Active Profile Photo Indicator */}
                        {isCurrentProfilePhoto && (
                          <div className="absolute top-2 right-2 z-10">
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                              <Check className="w-3 h-3" />
                              <span>Profil Görseli</span>
                            </span>
                          </div>
                        )}

                        {/* Hover Overlay with Lightbox View */}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveLightboxImage({
                                url: photo.imageUrl,
                                title: photo.title,
                                date: photo.date,
                                category: photo.category,
                              })
                            }
                            className="p-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-md transition-transform hover:scale-110 cursor-pointer"
                            title="Büyük Gör"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetAsProfilePhoto(photo.imageUrl)}
                            className="px-2.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-md transition-transform hover:scale-105 cursor-pointer flex items-center gap-1"
                            title="Profil Fotoğrafı Yap"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Profil Yap</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAthletePhoto(photo.id, photo.title)}
                            className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="p-3 bg-white space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 truncate" title={photo.title}>
                          {photo.title}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{photo.date}</span>
                          <span className="truncate max-w-[120px]">{photo.club}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl p-6">
                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">Fotoğraf Bulunamadı</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Bu kategoride veya bu sporcuya ait henüz yüklenmiş bir fotoğraf bulunmuyor.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddGaleriModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Fotoğraf Yükle</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>Sporcu Profil Bilgilerini Düzenle</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditForm} className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Adı Soyadı *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.adSoyad}
                    onChange={(e) => setEditFormData({ ...editFormData, adSoyad: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kulüp / Tesis *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.kulup}
                    onChange={(e) => setEditFormData({ ...editFormData, kulup: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Takım / Yaş Grubu</label>
                  <input
                    type="text"
                    value={editFormData.takimGrup}
                    onChange={(e) => setEditFormData({ ...editFormData, takimGrup: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mevki / Pozisyon</label>
                  <input
                    type="text"
                    value={editFormData.mevki}
                    onChange={(e) => setEditFormData({ ...editFormData, mevki: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Forma No</label>
                  <input
                    type="number"
                    value={editFormData.formaNo}
                    onChange={(e) => setEditFormData({ ...editFormData, formaNo: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Boy (cm)</label>
                  <input
                    type="number"
                    value={editFormData.boy}
                    onChange={(e) => setEditFormData({ ...editFormData, boy: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kilo (kg)</label>
                  <input
                    type="number"
                    value={editFormData.kilo}
                    onChange={(e) => setEditFormData({ ...editFormData, kilo: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Veli E-Posta</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Veli Telefonu</label>
                  <input
                    type="text"
                    value={editFormData.telefon}
                    onChange={(e) => setEditFormData({ ...editFormData, telefon: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Durum</label>
                <select
                  value={editFormData.durum}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      durum: e.target.value as 'Aktif' | 'Pasif' | 'Donduruldu' | 'Sakat',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pasif">Pasif</option>
                  <option value="Donduruldu">Donduruldu</option>
                  <option value="Sakat">Sakat / Tedavi Sürecinde</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-bold shadow-2xs"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Athlete Profile Photo Modal */}
      <SporcuFotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        sporcuAdi={currentProfil.kimlik.adSoyad}
        currentPhotoUrl={currentProfil.kimlik.fotoUrl || (sporcu as any).avatarUrl}
        onSavePhoto={handleSavePhoto}
        sporcuGalerisi={currentProfil.galeri?.map((g) => g.url)}
      />

      {/* 2. Add New Document Modal */}
      {isAddDocModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Yeni Resmi Evrak Yükle</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddDocModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocToAthlete} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Evrak / Belge Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="örn: 2024-2025 Federasyon Lisans Belgesi"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value as KulupEvrakKategori)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="Lisans">Lisans (TBF/TFF vb.)</option>
                    <option value="Sağlık Raporu">Sağlık Raporu</option>
                    <option value="Veli İzin Belgesi">Veli İzin Belgesi</option>
                    <option value="Kimlik / Pasaport">Kimlik / Pasaport</option>
                    <option value="Kayıt Sözleşmesi">Kayıt Sözleşmesi</option>
                    <option value="Diğer Evraklar">Diğer Evraklar</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Durum *
                  </label>
                  <select
                    value={newDocStatus}
                    onChange={(e) =>
                      setNewDocStatus(
                        e.target.value as
                          | 'Geçerli'
                          | 'Süresi Yaklaşan'
                          | 'Süresi Dolmuş'
                          | 'Onay Bekliyor'
                      )
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="Geçerli">Geçerli</option>
                    <option value="Süresi Yaklaşan">Süresi Yaklaşan</option>
                    <option value="Onay Bekliyor">Onay Bekliyor</option>
                    <option value="Süresi Dolmuş">Süresi Dolmuş</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Belge / Lisans No
                  </label>
                  <input
                    type="text"
                    placeholder="örn: LIS-34-8921"
                    value={newDocNumber}
                    onChange={(e) => setNewDocNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Geçerlilik Bitiş Tarihi
                  </label>
                  <input
                    type="text"
                    placeholder="30.06.2025"
                    value={newDocExpiry}
                    onChange={(e) => setNewDocExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/70 text-center space-y-1">
                <UploadCloud className="w-7 h-7 text-blue-600 mx-auto" />
                <p className="font-semibold text-slate-700">PDF, JPEG veya PNG Belge Seçin</p>
                <p className="text-[11px] text-slate-400">Maksimum dosya boyutu: 10 MB</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDocModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Evrakı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add New Gallery Photo Modal */}
      {isAddGaleriModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <span>Sporcu Galerisine Fotoğraf Ekle</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddGaleriModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPhotoToAthlete} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fotoğraf Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="örn: Sezon Öncesi Şut Antrenmanı"
                  value={newGaleriTitle}
                  onChange={(e) => setNewGaleriTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kategori *
                </label>
                <select
                  value={newGaleriCategory}
                  onChange={(e) => setNewGaleriCategory(e.target.value as KulupGaleriKategori)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="Antrenman">Antrenman</option>
                  <option value="Maç & Turnuva">Maç & Turnuva</option>
                  <option value="Kupa & Madalya">Kupa & Madalya</option>
                  <option value="Bireysel & Portre">Bireysel & Portre</option>
                  <option value="Kulüp Etkinliği">Kulüp Etkinliği</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Görsel URL veya Hazır Seçim
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newGaleriUrl}
                  onChange={(e) => setNewGaleriUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Quick Pick Presets */}
              <div>
                <span className="block font-semibold text-slate-700 mb-1.5">
                  Veya Hazır Spor Fotoğraflarından Seçin:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AVATARS.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setNewGaleriUrl(p.url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        newGaleriUrl === p.url ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.label}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Not / Açıklama
                </label>
                <input
                  type="text"
                  placeholder="Fotoğraf hakkında kısa not..."
                  value={newGaleriDesc}
                  onChange={(e) => setNewGaleriDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddGaleriModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Galeriyi Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Lightbox Viewer Modal */}
      {activeLightboxImage && (
        <div
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 bg-slate-950/90 z-60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
          >
            <div className="p-4 flex items-center justify-between border-b border-slate-800 text-white">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                  {activeLightboxImage.category}
                </span>
                <h3 className="text-sm font-bold text-white">{activeLightboxImage.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleSetAsProfilePhoto(activeLightboxImage.url);
                    setActiveLightboxImage(null);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Profil Fotoğrafı Yap</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLightboxImage(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative aspect-16/10 bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activeLightboxImage.url}
                alt={activeLightboxImage.title}
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-3 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
              <span>{activeLightboxImage.date}</span>
              <button
                type="button"
                onClick={() => showToast('Fotoğraf indiriliyor...')}
                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>İndir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
