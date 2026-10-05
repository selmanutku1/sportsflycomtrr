import React, { useState, useRef, useMemo } from 'react';
import {
  Folder,
  FolderPlus,
  FolderTree,
  FolderOpen,
  Image as ImageIcon,
  Search,
  Plus,
  Filter,
  Building,
  User,
  Calendar,
  Download,
  Trash2,
  ZoomIn,
  X,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Check,
  Grid,
  List,
  FileText,
  MapPin,
  Heart,
  Tag,
  Share2,
  HardDrive,
  Film,
  Sparkles,
  Info,
  ShieldCheck,
  Eye,
  Layers,
  ArrowRight,
  MoreVertical,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import {
  KulupGaleriItem,
  KulupGaleriKategori,
  MedyaKlasorItem,
  SporcuItem,
  NavPage,
} from '../../../types';
import {
  getStoredKulupGaleri,
  saveStoredKulupGaleri,
  getStoredMedyaKlasorler,
  saveStoredMedyaKlasorler,
} from '../../../data/kulupEvrakGaleriData';
import { INITIAL_SPORCULAR } from '../../../data/mockData';

interface KulupGalerisiViewProps {
  sporcular?: SporcuItem[];
  onSelectSporcu?: (sporcu: SporcuItem) => void;
  selectedClubFilter?: string;
  onToast?: (msg: string) => void;
  onNavigate?: (page: NavPage) => void;
}

const PRESET_GALLERY_IMAGES = [
  {
    title: 'Basketbol Pota Altı Turnike & Hızlı Hücum',
    url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&auto=format&fit=crop&q=80',
    category: 'Antrenman' as KulupGaleriKategori,
    branch: 'Basketbol',
  },
  {
    title: 'İstanbul İl Şampiyonası Kupa & Madalya',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80',
    category: 'Kupa & Madalya' as KulupGaleriKategori,
    branch: 'Basketbol',
  },
  {
    title: 'Kondisyon & Çabukluk Merdiven Parkuru',
    url: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=1200&auto=format&fit=crop&q=80',
    category: 'Antrenman' as KulupGaleriKategori,
    branch: 'Genel',
  },
  {
    title: 'Yarı Saha Taktik & Savunma Yerleşimi',
    url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1200&auto=format&fit=crop&q=80',
    category: 'Maç & Turnuva' as KulupGaleriKategori,
    branch: 'Basketbol',
  },
  {
    title: 'Voleybol File Önü Blok & Smaç Hücumu',
    url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&auto=format&fit=crop&q=80',
    category: 'Maç & Turnuva' as KulupGaleriKategori,
    branch: 'Voleybol',
  },
  {
    title: 'Yaz Kampı Toplu Hatıra Fotoğrafı',
    url: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=1200&auto=format&fit=crop&q=80',
    category: 'Kamp & Etkinlik' as KulupGaleriKategori,
    branch: 'Voleybol',
  },
  {
    title: 'Kapalı Spor Salonu & Yeni Ekipmanlar',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80',
    category: 'Tesis & Ekipman' as KulupGaleriKategori,
    branch: 'Genel',
  },
  {
    title: 'Sporcu Resmi Lisans & Profil Portresi',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1200&auto=format&fit=crop&q=80',
    category: 'Portre & Lisans' as KulupGaleriKategori,
    branch: 'Basketbol',
  },
];

const CATEGORY_COLORS: Record<KulupGaleriKategori, { bg: string; text: string; border: string }> = {
  'Antrenman': { bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  'Maç & Turnuva': { bg: 'bg-orange-50 dark:bg-orange-950/60', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  'Kupa & Madalya': { bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  'Kamp & Etkinlik': { bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  'Tesis & Ekipman': { bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  'Portre & Lisans': { bg: 'bg-indigo-50 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
  'Sosyal Medya & Basın': { bg: 'bg-rose-50 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  'Genel': { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' },
};

const FOLDER_COLOR_CLASSES: Record<string, { gradient: string; text: string; bgSoft: string; border: string }> = {
  blue: {
    gradient: 'from-blue-500 to-indigo-600',
    text: 'text-blue-600 dark:text-blue-400',
    bgSoft: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-900/60',
  },
  amber: {
    gradient: 'from-amber-500 to-yellow-600',
    text: 'text-amber-600 dark:text-amber-400',
    bgSoft: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-900/60',
  },
  emerald: {
    gradient: 'from-emerald-500 to-teal-600',
    text: 'text-emerald-600 dark:text-emerald-400',
    bgSoft: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-900/60',
  },
  purple: {
    gradient: 'from-purple-500 to-fuchsia-600',
    text: 'text-purple-600 dark:text-purple-400',
    bgSoft: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-900/60',
  },
  indigo: {
    gradient: 'from-indigo-500 to-blue-700',
    text: 'text-indigo-600 dark:text-indigo-400',
    bgSoft: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-900/60',
  },
  rose: {
    gradient: 'from-rose-500 to-pink-600',
    text: 'text-rose-600 dark:text-rose-400',
    bgSoft: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-900/60',
  },
};

export const KulupGalerisiView: React.FC<KulupGalerisiViewProps> = ({
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

  // State
  const [galeri, setGaleri] = useState<KulupGaleriItem[]>(() => getStoredKulupGaleri());
  const [klasorler, setKlasorler] = useState<MedyaKlasorItem[]>(() => getStoredMedyaKlasorler());
  
  // Navigation & Filtering
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null); // null = root / all
  const [selectedClub, setSelectedClub] = useState<string>(selectedClubFilter);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAthleteFilter, setSelectedAthleteFilter] = useState<string>('all');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Upload Form state
  const [formTitle, setFormTitle] = useState('');
  const [formClub, setFormClub] = useState('DigiMondi');
  const [formCategory, setFormCategory] = useState<KulupGaleriKategori>('Antrenman');
  const [formFolderId, setFormFolderId] = useState<string>('folder-1');
  const [formBranch, setFormBranch] = useState('Basketbol');
  const [formDate, setFormDate] = useState(() => {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
  });
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTaggedAthletes, setFormTaggedAthletes] = useState<string[]>([]);
  const [formKvkkApproved, setFormKvkkApproved] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folder Form state
  const [folderName, setFolderName] = useState('');
  const [folderDesc, setFolderDesc] = useState('');
  const [folderCategory, setFolderCategory] = useState<KulupGaleriKategori>('Antrenman');
  const [folderColor, setFolderColor] = useState('blue');
  const [folderClub, setFolderClub] = useState('DigiMondi');
  const [folderBranch, setFolderBranch] = useState('Basketbol');

  // Distinct clubs list
  const clubList = useMemo(() => {
    return Array.from(
      new Set([
        'DigiMondi',
        'Saraçgym',
        'aicosports',
        'Selman Utku',
        ...(galeri || []).map((g) => g.club),
      ])
    ).filter(Boolean);
  }, [galeri]);

  // Compute folder counts dynamically
  const enrichedFolders = useMemo(() => {
    return klasorler.map((folder) => {
      const itemsInFolder = galeri.filter((g) => g.folderId === folder.id);
      const covers = itemsInFolder.slice(0, 3).map((i) => i.imageUrl);
      return {
        ...folder,
        itemCount: itemsInFolder.length,
        coverImage: covers[0] || folder.coverImage,
        recentCovers: covers,
      };
    });
  }, [klasorler, galeri]);

  // Current active folder object
  const currentActiveFolder = useMemo(() => {
    if (!activeFolderId) return null;
    return enrichedFolders.find((f) => f.id === activeFolderId) || null;
  }, [activeFolderId, enrichedFolders]);

  // Filtered media items
  const filteredGaleri = useMemo(() => {
    return (galeri || []).filter((item) => {
      // Folder filter
      if (activeFolderId && item.folderId !== activeFolderId) return false;

      // Club filter
      if (selectedClub !== 'all' && item.club !== selectedClub) return false;

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Athlete tag filter
      if (selectedAthleteFilter !== 'all') {
        if (!item.taggedAthletes || !item.taggedAthletes.includes(selectedAthleteFilter)) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchClub = item.club.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q) || false;
        const matchFolder = item.folderName?.toLowerCase().includes(q) || false;
        const matchBranch = item.branch?.toLowerCase().includes(q) || false;
        const matchTagged = item.taggedAthletes?.some((a) => a.toLowerCase().includes(q)) || false;
        return matchTitle || matchClub || matchDesc || matchFolder || matchBranch || matchTagged;
      }
      return true;
    });
  }, [galeri, activeFolderId, selectedClub, selectedCategory, selectedAthleteFilter, searchQuery]);

  // Handle custom file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleTaggedAthlete = (athleteName: string) => {
    setFormTaggedAthletes((prev) =>
      prev.includes(athleteName)
        ? prev.filter((a) => a !== athleteName)
        : [...prev, athleteName]
    );
  };

  // Submit new media item
  const handleAddMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showNotification('Lütfen medya başlığı giriniz.');
      return;
    }

    const finalUrl =
      formImageUrl.trim() ||
      PRESET_GALLERY_IMAGES[Math.floor(Math.random() * PRESET_GALLERY_IMAGES.length)].url;

    const targetFolder = klasorler.find((f) => f.id === formFolderId);

    const newItem: KulupGaleriItem = {
      id: `gal-${Date.now()}`,
      title: formTitle.trim(),
      club: formClub,
      category: formCategory,
      date: formDate,
      imageUrl: finalUrl,
      description: formDescription.trim(),
      taggedAthletes: formTaggedAthletes,
      uploaderName: 'Kulüp Yöneticisi',
      folderId: formFolderId || 'folder-1',
      folderName: targetFolder ? targetFolder.name : 'Genel Medya',
      fileSize: `${(Math.random() * 3 + 1.5).toFixed(1)} MB`,
      mediaType: 'image',
      branch: formBranch,
      isKvkkApproved: formKvkkApproved,
    };

    const updated = [newItem, ...galeri];
    setGaleri(updated);
    saveStoredKulupGaleri(updated);

    // Reset Form
    setFormTitle('');
    setFormImageUrl('');
    setFormDescription('');
    setFormTaggedAthletes([]);
    setShowUploadModal(false);
    showNotification(`"${newItem.title}" medyası başarıyla klasöre yüklendi.`);
  };

  // Submit new folder
  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      showNotification('Lütfen klasör ismi giriniz.');
      return;
    }

    const newFolder: MedyaKlasorItem = {
      id: `folder-${Date.now()}`,
      name: folderName.trim(),
      description: folderDesc.trim() || 'Kulüp medya koleksiyonu',
      category: folderCategory,
      club: folderClub,
      branch: folderBranch,
      color: folderColor,
      itemCount: 0,
      totalSize: '0 MB',
      createdAt: formDate,
      coverImage: PRESET_GALLERY_IMAGES[Math.floor(Math.random() * PRESET_GALLERY_IMAGES.length)].url,
    };

    const updatedFolders = [...klasorler, newFolder];
    setKlasorler(updatedFolders);
    saveStoredMedyaKlasorler(updatedFolders);

    setFolderName('');
    setFolderDesc('');
    setShowFolderModal(false);
    showNotification(`"${newFolder.name}" klasörü oluşturuldu.`);
  };

  // Delete media item
  const handleDeleteMedia = (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`"${title}" medyasını silmek istediğinize emin misiniz?`)) {
      const updated = galeri.filter((item) => item.id !== id);
      setGaleri(updated);
      saveStoredKulupGaleri(updated);
      if (lightboxIndex !== null) setLightboxIndex(null);
      showNotification('Medya arşivden silindi.');
    }
  };

  // Delete folder
  const handleDeleteFolder = (folderId: string, folderName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`"${folderName}" klasörünü ve içindeki medya eşleşmelerini kaldırmak istediğinize emin misiniz?`)) {
      const updatedFolders = klasorler.filter((f) => f.id !== folderId);
      setKlasorler(updatedFolders);
      saveStoredMedyaKlasorler(updatedFolders);

      // Reassign or keep items
      const updatedMedia = galeri.map((m) =>
        m.folderId === folderId ? { ...m, folderId: 'folder-1', folderName: 'Genel' } : m
      );
      setGaleri(updatedMedia);
      saveStoredKulupGaleri(updatedMedia);

      if (activeFolderId === folderId) setActiveFolderId(null);
      showNotification(`"${folderName}" klasörü silindi.`);
    }
  };

  // Download media simulator
  const handleDownload = (item: KulupGaleriItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const link = document.createElement('a');
    link.href = item.imageUrl;
    link.download = `${item.title.toLowerCase().replace(/\s+/g, '_')}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`"${item.title}" görseli yüksek çözünürlükte indiriliyor.`);
  };

  // Share link copy
  const handleShare = (item: KulupGaleriItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard?.writeText(item.imageUrl);
    showNotification('Medya doğrudan bağlantısı panoya kopyalandı.');
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50/50 dark:bg-[#0b1320] text-slate-800 dark:text-slate-100 antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner / Header */}
      <div className="bg-white dark:bg-[#111c2e] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title & Hierarchy Breadcrumbs */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <button
                  onClick={() => setActiveFolderId(null)}
                  className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer ${
                    !activeFolderId ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
                  }`}
                >
                  <FolderTree className="w-3.5 h-3.5" />
                  <span>Medya Deposu</span>
                </button>
                {currentActiveFolder && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-900 dark:text-white font-bold flex items-center gap-1">
                      <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                      {currentActiveFolder.name}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Medya Yönetimi
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  KVKK Uyumlu Medya Havuzu
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Antrenman, maç ve kupa arşivinizi klasör hiyerarşisinde düzenleyin; sporcuları etiketleyip dijital karnelere aktarın.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => setShowFolderModal(true)}
                className="flex-1 sm:flex-initial min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-2xs"
              >
                <FolderPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Yeni Klasör</span>
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex-1 sm:flex-initial min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Medya Yükle</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="bg-slate-50 dark:bg-[#162238]/60 p-2.5 sm:p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Folder className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Toplam Klasör</div>
                <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">{klasorler.length} Klasör</div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#162238]/60 p-2.5 sm:p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Fotoğraf & Medya</div>
                <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">{galeri.length} Medya</div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#162238]/60 p-2.5 sm:p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">Etiketli Sporcu</div>
                <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {Array.from(new Set(galeri.flatMap((g) => g.taggedAthletes || []))).length} Sporcu
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-[#162238]/60 p-2.5 sm:p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Bulut Depolama</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">1.8 / 10 GB</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full w-[18%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        {/* 1. Klasörler Bölümü (Klasör Mantığı & Hızlı Erişim) */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Medya Klasörleri ({enrichedFolders.length})
              </h2>
            </div>
            {activeFolderId && (
              <button
                onClick={() => setActiveFolderId(null)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Tüm Klasörleri Göster</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Folder Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {enrichedFolders.map((folder) => {
              const isActive = activeFolderId === folder.id;
              const colorStyle = FOLDER_COLOR_CLASSES[folder.color || 'blue'] || FOLDER_COLOR_CLASSES.blue;

              return (
                <div
                  key={folder.id}
                  onClick={() => setActiveFolderId(isActive ? null : folder.id)}
                  className={`group relative p-4 rounded-2xl border transition-all cursor-pointer select-none text-left flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
                    isActive
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-[#111c2e] border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Top: Icon + Badge + Delete Button */}
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorStyle.gradient} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      {isActive ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {folder.club}
                      </span>
                      {klasorler.length > 1 && (
                        <button
                          onClick={(e) => handleDeleteFolder(folder.id, folder.name, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-all"
                          title="Klasörü Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Middle: Name & Description */}
                  <div className="my-3">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {folder.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {folder.description || 'Medya arşivi ve etkinlik fotoğrafları'}
                    </p>
                  </div>

                  {/* Bottom: Overlapping Preview Avatars & Stats */}
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center -space-x-2">
                      {folder.recentCovers && folder.recentCovers.length > 0 ? (
                        folder.recentCovers.map((c, i) => (
                          <img
                            key={i}
                            src={c}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-[#111c2e]"
                          />
                        ))
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-500">
                          0
                        </div>
                      )}
                    </div>

                    <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                      {folder.itemCount} Medya
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Filtreleme & Arama Araç Çubuğu */}
        <div className="bg-white dark:bg-[#111c2e] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Medya başlığı, sporcu adı, branş veya klasör ara..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters & View Switcher */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Club Dropdown */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">Tüm Kulüpler / Şubeler</option>
                  {clubList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sporcu Filtresi */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={selectedAthleteFilter}
                  onChange={(e) => setSelectedAthleteFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">Tüm Sporcular (Etiket)</option>
                  {safeSporcular.map((s) => (
                    <option key={s.id} value={s.name}>
                      👤 {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* View Switcher: Grid / List */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-[#111c2e] text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                  }`}
                  title="Izgara Görünümü"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-[#111c2e] text-blue-600 dark:text-blue-400 shadow-2xs'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                  }`}
                  title="Detaylı Liste Görünümü"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Quick Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Tüm Kategoriler
            </button>
            {(
              [
                'Antrenman',
                'Maç & Turnuva',
                'Kupa & Madalya',
                'Kamp & Etkinlik',
                'Tesis & Ekipman',
                'Portre & Lisans',
              ] as KulupGaleriKategori[]
            ).map((cat) => {
              const isCatActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isCatActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Medya Galerisi (Izgara veya Liste) */}
        <div>
          {/* Section Heading with active filters indicator */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {currentActiveFolder ? (
                  <span className="flex items-center gap-2">
                    <span>{currentActiveFolder.name} Medyaları</span>
                    <span className="text-xs font-semibold text-slate-400">({filteredGaleri.length} Öğe)</span>
                  </span>
                ) : (
                  <span>Tüm Medya Arşivi ({filteredGaleri.length})</span>
                )}
              </h2>
            </div>

            {(activeFolderId || selectedCategory !== 'all' || selectedClub !== 'all' || selectedAthleteFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setActiveFolderId(null);
                  setSelectedCategory('all');
                  setSelectedClub('all');
                  setSelectedAthleteFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Filtreleri Temizle</span>
              </button>
            )}
          </div>

          {filteredGaleri.length === 0 ? (
            <div className="bg-white dark:bg-[#111c2e] p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-4">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Bu Kriterlere Uygun Medya Bulunamadı</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Farklı bir arama kelimesi deneyebilir veya hemen kulübünüze yeni fotoğraflar yükleyebilirsiniz.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  + Medya Yükle
                </button>
                <button
                  onClick={() => {
                    setActiveFolderId(null);
                    setSelectedCategory('all');
                    setSelectedClub('all');
                    setSelectedAthleteFilter('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* Izgara Görünümü (Grid / Masonry Style) */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredGaleri.map((item, idx) => {
                const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Genel;

                return (
                  <div
                    key={item.id}
                    className="group bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Image Area with hover overlay */}
                    <div
                      onClick={() => setLightboxIndex(idx)}
                      className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-lg border backdrop-blur-md shadow-2xs ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          {item.category}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/60 text-white backdrop-blur-md">
                          {item.club}
                        </span>
                      </div>

                      {/* Bottom Quick Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                        <div className="text-white text-xs font-bold flex items-center gap-1.5">
                          <ZoomIn className="w-4 h-4" />
                          <span>Önizle &amp; Büyüt</span>
                        </div>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleDownload(item, e)}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md transition-colors cursor-pointer"
                            title="İndir"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleShare(item, e)}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md transition-colors cursor-pointer"
                            title="Bağlantıyı Kopyala"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteMedia(item.id, item.title, e)}
                            className="p-1.5 rounded-lg bg-rose-500/30 hover:bg-rose-600 text-white backdrop-blur-md transition-colors cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Folder Tag */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                          <span className="font-semibold flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <Folder className="w-3 h-3" />
                            {item.folderName || 'Klasörsüz'}
                          </span>
                          <span className="font-mono text-[10px]">{item.date}</span>
                        </div>

                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Tagged Athletes Pills */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1 flex-wrap">
                          {item.taggedAthletes && item.taggedAthletes.length > 0 ? (
                            item.taggedAthletes.map((athName, aIdx) => (
                              <button
                                key={aIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const found = safeSporcular.find((s) => s.name.toLowerCase() === athName.toLowerCase());
                                  if (found && onSelectSporcu) {
                                    onSelectSporcu(found);
                                  } else {
                                    setSelectedAthleteFilter(athName);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/60 dark:border-slate-700 transition-colors cursor-pointer"
                                title="Sporcuyu filtrele veya profilini aç"
                              >
                                <User className="w-2.5 h-2.5 text-blue-500" />
                                <span>{athName}</span>
                              </button>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Etiketli sporcu yok</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Liste Görünümü (Table View) */
            <div className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#162238] border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4 w-16">Önizleme</th>
                      <th className="py-3 px-4">Medya Başlığı &amp; Açıklama</th>
                      <th className="py-3 px-4">Klasör &amp; Kategori</th>
                      <th className="py-3 px-4">Etiketli Sporcular</th>
                      <th className="py-3 px-4">Kulüp &amp; Branş</th>
                      <th className="py-3 px-4">Tarih &amp; Boyut</th>
                      <th className="py-3 px-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredGaleri.map((item, idx) => {
                      const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Genel;

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setLightboxIndex(idx)}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        >
                          {/* Image Thumbnail */}
                          <td className="py-2.5 px-4">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-12 h-10 object-cover rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 shadow-2xs"
                            />
                          </td>

                          {/* Title & Desc */}
                          <td className="py-2.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                                {item.description}
                              </div>
                            )}
                          </td>

                          {/* Folder & Category */}
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                              <Folder className="w-3 h-3 text-blue-500" />
                              <span>{item.folderName || 'Genel'}</span>
                            </div>
                            <span
                              className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${catStyle.bg} ${catStyle.text}`}
                            >
                              {item.category}
                            </span>
                          </td>

                          {/* Tagged Athletes */}
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1 flex-wrap max-w-xs">
                              {item.taggedAthletes && item.taggedAthletes.length > 0 ? (
                                item.taggedAthletes.map((ath, aI) => (
                                  <span
                                    key={aI}
                                    className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold"
                                  >
                                    {ath}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 text-[10px]">-</span>
                              )}
                            </div>
                          </td>

                          {/* Club */}
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-slate-700 dark:text-slate-300">{item.club}</div>
                            <span className="text-[10px] text-slate-400">{item.branch || 'Basketbol'}</span>
                          </td>

                          {/* Date & Size */}
                          <td className="py-2.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                            <div>{item.date}</div>
                            <div className="text-[10px] text-slate-400">{item.fileSize || '3.2 MB'}</div>
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={(e) => handleDownload(item, e)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="İndir"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleShare(item, e)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Paylaş"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteMedia(item.id, item.title, e)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Fullscreen Media Modal */}
      {lightboxIndex !== null && filteredGaleri[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar inside Lightbox */}
          <div className="flex items-center justify-between gap-4 text-white z-10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white/10">
                {lightboxIndex + 1} / {filteredGaleri.length}
              </span>
              <span className="text-sm font-bold truncate max-w-xs sm:max-w-md">
                {filteredGaleri[lightboxIndex].title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(filteredGaleri[lightboxIndex])}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title="İndir"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">İndir</span>
              </button>
              <button
                onClick={() => handleShare(filteredGaleri[lightboxIndex])}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title="Bağlantıyı Kopyala"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Paylaş</span>
              </button>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                title="Kapat (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Central Image & Navigation */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            {/* Prev Button */}
            {lightboxIndex > 0 && (
              <button
                onClick={() => setLightboxIndex((prev) => (prev !== null ? prev - 1 : null))}
                className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-black/60 hover:bg-white text-white hover:text-black transition-all cursor-pointer shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Main Image */}
            <img
              src={filteredGaleri[lightboxIndex].imageUrl}
              alt={filteredGaleri[lightboxIndex].title}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
            />

            {/* Next Button */}
            {lightboxIndex < filteredGaleri.length - 1 && (
              <button
                onClick={() => setLightboxIndex((prev) => (prev !== null ? prev + 1 : null))}
                className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-black/60 hover:bg-white text-white hover:text-black transition-all cursor-pointer shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Info Bar inside Lightbox */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl max-w-4xl mx-auto w-full text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{filteredGaleri[lightboxIndex].title}</span>
                <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-bold text-[10px]">
                  {filteredGaleri[lightboxIndex].category}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  KVKK İzinli
                </span>
              </div>
              <p className="text-slate-300 line-clamp-1">{filteredGaleri[lightboxIndex].description}</p>
            </div>

            {/* Tagged Athletes Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-semibold text-[11px]">Etiketliler:</span>
              {filteredGaleri[lightboxIndex].taggedAthletes?.map((ath, aI) => (
                <span
                  key={aI}
                  className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] flex items-center gap-1"
                >
                  <User className="w-2.5 h-2.5" />
                  {ath}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Yeni Medya Yükle */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111c2e] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Klasöre Yeni Medya Yükle</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Fotoğraf, video veya maç kaydı ekleyip sporcuları etiketleyin.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMediaSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Hedef Klasör */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hedef Medya Klasörü <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formFolderId}
                  onChange={(e) => setFormFolderId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {klasorler.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name} ({f.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Medya Başlığı */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Medya Başlığı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: U16 Basketbol Çeyrek Final Galibiyeti"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Kulüp & Kategori & Branş */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kulüp</label>
                  <select
                    value={formClub}
                    onChange={(e) => setFormClub(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {clubList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as KulupGaleriKategori)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Antrenman">Antrenman</option>
                    <option value="Maç & Turnuva">Maç &amp; Turnuva</option>
                    <option value="Kupa & Madalya">Kupa &amp; Madalya</option>
                    <option value="Kamp & Etkinlik">Kamp &amp; Etkinlik</option>
                    <option value="Tesis & Ekipman">Tesis &amp; Ekipman</option>
                    <option value="Portre & Lisans">Portre &amp; Lisans</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Branş</label>
                  <select
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Basketbol">Basketbol</option>
                    <option value="Voleybol">Voleybol</option>
                    <option value="Futbol">Futbol</option>
                    <option value="Yüzme">Yüzme</option>
                    <option value="Cimnastik">Cimnastik</option>
                    <option value="Genel">Genel</option>
                  </select>
                </div>
              </div>

              {/* Görsel Seçimi / Hazır Presetler */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Fotoğraf Seçimi veya Dosya Yükleme
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-3">
                  {PRESET_GALLERY_IMAGES.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={img.title}
                      onClick={() => setFormImageUrl(img.url)}
                      className={`h-12 w-full object-cover rounded-xl cursor-pointer transition-all ${
                        formImageUrl === img.url
                          ? 'ring-3 ring-blue-600 scale-95 shadow-md'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Cihazdan Yükle</span>
                  </button>

                  <input
                    type="url"
                    placeholder="veya Görsel URL'si yapıştırın (https://...)"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Sporcu Etiketleme Multi-Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Fotoğraftaki Sporcuları Etiketle (Dijital Karneyle Eşleşir)
                </label>
                <div className="max-h-28 overflow-y-auto p-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl flex flex-wrap gap-1.5">
                  {safeSporcular.map((sp) => {
                    const isTagged = formTaggedAthletes.includes(sp.name);
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => handleToggleTaggedAthlete(sp.name)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                          isTagged
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isTagged && <Check className="w-3 h-3" />}
                        <span>{sp.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Açıklama &amp; Detaylar
                </label>
                <textarea
                  rows={2}
                  placeholder="Antrenmanda çalışılan konular veya müsabaka skoru..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* KVKK Onayı */}
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200/60 dark:border-blue-900 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="kvkkCheck"
                  checked={formKvkkApproved}
                  onChange={(e) => setFormKvkkApproved(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="kvkkCheck" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <strong>Veli KVKK ve Sosyal Medya İzni:</strong> Sporcuların bu fotoğrafta yer alması ve kulüp medyasında paylaşılması veli muvafakatnamesi kapsamında onaylanmıştır.
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer"
                >
                  Klasöre Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Yeni Klasör Oluştur */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111c2e] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Yeni Medya Klasörü Oluştur</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Görsellerinizi düzenlemek için özel klasör oluşturun.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFolderModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolderSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Klasör Adı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 2026 Antalya Yaz Gelişim Kampı"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Klasör Açıklaması
                </label>
                <input
                  type="text"
                  placeholder="Örn: U14 & U16 takımlarının kondisyon ve taktik kayıtları"
                  value={folderDesc}
                  onChange={(e) => setFolderDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <select
                    value={folderCategory}
                    onChange={(e) => setFolderCategory(e.target.value as KulupGaleriKategori)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Antrenman">Antrenman</option>
                    <option value="Maç & Turnuva">Maç &amp; Turnuva</option>
                    <option value="Kupa & Madalya">Kupa &amp; Madalya</option>
                    <option value="Kamp & Etkinlik">Kamp &amp; Etkinlik</option>
                    <option value="Tesis & Ekipman">Tesis &amp; Ekipman</option>
                    <option value="Portre & Lisans">Portre &amp; Lisans</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kulüp</label>
                  <select
                    value={folderClub}
                    onChange={(e) => setFolderClub(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {clubList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Renk Teması */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Klasör Renk Teması
                </label>
                <div className="flex items-center gap-3">
                  {(['blue', 'amber', 'emerald', 'purple', 'indigo', 'rose'] as const).map((colorKey) => {
                    const c = FOLDER_COLOR_CLASSES[colorKey];
                    return (
                      <button
                        key={colorKey}
                        type="button"
                        onClick={() => setFolderColor(colorKey)}
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center transition-all cursor-pointer ${
                          folderColor === colorKey ? 'ring-3 ring-offset-2 ring-blue-500 scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {folderColor === colorKey && <Check className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer"
                >
                  Klasör Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
