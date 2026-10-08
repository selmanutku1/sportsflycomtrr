import React, { useState, useRef, useMemo } from 'react';
import { 
  Award, 
  Search, 
  Download, 
  Share2, 
  TrendingUp, 
  Activity, 
  Target, 
  Brain,
  Printer,
  ChevronDown,
  FileText,
  HeartHandshake,
  ShieldCheck,
  Clock,
  Plus,
  X,
  MessageSquare,
  Smartphone,
  ShieldAlert,
  Moon,
  Users,
  Crown,
  Compass,
  Zap,
  Check,
  CheckCircle2,
  Filter,
  Tag,
  Trash2,
  Star,
  ClipboardCheck,
  Send,
  Sparkles,
  Flame,
  Trophy,
  Eye,
  BarChart3
} from 'lucide-react';
import { SporcuKarnePerformanceCharts } from '../charts/KarnePerformansGrafikleri';
import { SportsFlyIcon, SportsFlyVectorMark } from '../SportsFlyLogo';
import {
  RotaSportsFlyHeaderBadge,
  RotaSportsFlyFooterBadge,
} from '../common/RotaSportsFlyBranding';
import { ROTA_PERFORMANS_LOGO_DATA_URL } from '../../assets/rotaPerformansLogoDataUrl';
import { getStoredLabSchoolBranding } from '../../data/sportsFlyLabData';
import { exportContainerToSmartA4Pdf } from '../../utils/pdfExportHelper';
import { INITIAL_KARNELER, SporcuKarne, getStoredKarneler, saveStoredKarneler } from '../../data/mockKarneData';
import { SporcuProfil, getStoredSporcuProfilleri } from '../../data/sporcuProfilData';
import { INITIAL_SPORCULAR } from '../../data/mockData';
import { SporcuItem, NavPage } from '../../types';
import { getAthletePhotoUrl, getAthleteInitials } from '../../utils/athletePhotoResolver';
import { 
  KURUMSAL_ROZETLER, 
  KURUMSAL_ROZET_KATEGORILERI, 
  DavranissalRozet 
} from '../../data/rozetData';
import { getDynamicKarne, SporPuanKarneImpact } from '../../utils/sporpuanKarneBridge';
import { QuickPointAwardModal } from '../modals/QuickPointAwardModal';
import { VeliKarneGonderimModal } from './VeliKarneGonderimModal';

interface SporcuKarnesiViewProps {
  onNavigate?: (page: NavPage) => void;
}

export const SporcuKarnesiView: React.FC<SporcuKarnesiViewProps> = ({ onNavigate }) => {
  const [karneler, setKarneler] = useState<SporcuKarne[]>(() => getStoredKarneler());
  const [sporcular, setSporcular] = useState<SporcuItem[]>(() => {
    try {
      const saved = localStorage.getItem('sportsfly_sporcular');
      return saved ? JSON.parse(saved) : INITIAL_SPORCULAR;
    } catch (e) {
      return INITIAL_SPORCULAR;
    }
  });
  const [profiller, setProfiller] = useState<Record<string, SporcuProfil>>(() => {
    return getStoredSporcuProfilleri();
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sporpuanRefreshKey, setSporpuanRefreshKey] = useState(0);
  const [isQuickPointModalOpen, setIsQuickPointModalOpen] = useState(false);
  const [selectedKarneId, setSelectedKarneId] = useState<string>(() => {
    const list = getStoredKarneler();
    return list[0]?.id || INITIAL_KARNELER[0]?.id || '';
  });

  // Keep state synced with localStorage & SporPuan updates
  React.useEffect(() => {
    const handleSporcularSync = () => {
      try {
        const saved = localStorage.getItem('sportsfly_sporcular');
        if (saved) {
          setSporcular(JSON.parse(saved));
        }
      } catch (e) {}
    };

    const handleProfillerSync = () => {
      setProfiller(getStoredSporcuProfilleri());
    };

    const handleUpdate = (e: any) => {
      if (e?.detail?.karneler) {
        setKarneler(e.detail.karneler);
      } else {
        setKarneler(getStoredKarneler());
      }
      handleSporcularSync();
      handleProfillerSync();
      setSporpuanRefreshKey(k => k + 1);
    };

    const handleSporPuanUpdate = () => {
      setSporpuanRefreshKey(k => k + 1);
      setKarneler(getStoredKarneler());
      handleSporcularSync();
      handleProfillerSync();
    };

    const handleBrandingUpdate = () => {
      setSporpuanRefreshKey(k => k + 1);
    };

    window.addEventListener('sportsfly_karneler_updated', handleUpdate);
    window.addEventListener('sportsfly_sporcular_updated', handleSporcularSync);
    window.addEventListener('sportsfly_sporcu_profilleri_updated', handleProfillerSync);
    window.addEventListener('sportsfly_sporpuan_updated', handleSporPuanUpdate);
    window.addEventListener('sportsfly_lab_branding_updated', handleBrandingUpdate);
    window.addEventListener('storage', () => {
      handleSporcularSync();
      handleProfillerSync();
      handleUpdate(null);
      handleBrandingUpdate();
    });

    return () => {
      window.removeEventListener('sportsfly_karneler_updated', handleUpdate);
      window.removeEventListener('sportsfly_sporcular_updated', handleSporcularSync);
      window.removeEventListener('sportsfly_sporcu_profilleri_updated', handleProfillerSync);
      window.removeEventListener('sportsfly_sporpuan_updated', handleSporPuanUpdate);
      window.removeEventListener('sportsfly_lab_branding_updated', handleBrandingUpdate);
    };
  }, []);

  const updateAndSaveKarneler = (updater: (prev: SporcuKarne[]) => SporcuKarne[]) => {
    setKarneler(prev => {
      const updated = updater(prev);
      saveStoredKarneler(updated);
      return updated;
    });
  };
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPdfPreviewMode, setIsPdfPreviewMode] = useState(false);
  const [showPerformanceCharts, setShowPerformanceCharts] = useState(true);
  const [isSimplifiedView, setIsSimplifiedView] = useState(false);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [isVeliModalOpen, setIsVeliModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeReportPage, setActiveReportPage] = useState<number | 'all'>('all');
  const schoolBranding = useMemo(() => getStoredLabSchoolBranding(), [sporpuanRefreshKey]);

  React.useEffect(() => {
    const handleBeforePrint = () => {
      setShowPerformanceCharts(true);
      setPdfZoom(100);
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    return () => window.removeEventListener('beforeprint', handleBeforePrint);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };
  const [isAddObservationOpen, setIsAddObservationOpen] = useState(false);
  const [newObservation, setNewObservation] = useState({
    donem: '',
    odakKonusu: '',
    durum: 'Hedefe Ulaştı' as 'Gelişiyor' | 'Hedefe Ulaştı' | 'Örnek Davranış',
    gozlem: ''
  });

  // Badge Management States
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [badgeSearchQuery, setBadgeSearchQuery] = useState('');
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<string>('Tümü');
  const [isCustomBadgeOpen, setIsCustomBadgeOpen] = useState(false);
  const [customBadge, setCustomBadge] = useState({
    baslik: '',
    kategori: 'Karakter & Etik' as DavranissalRozet['kategori'],
    aciklama: '',
    onemDerecesi: 'Özel Başarı' as DavranissalRozet['onemDerecesi']
  });
  
  const karneRef = useRef<HTMLDivElement>(null);

  const selectedKarne = karneler.find(k => k.id === selectedKarneId) || karneler[0] || null;
  const dynamicKarne = useMemo(() => {
    if (!selectedKarne) return null;
    return getDynamicKarne(selectedKarne);
  }, [selectedKarne, sporpuanRefreshKey]);

  const activeKarne = dynamicKarne || selectedKarne;
  const sporpuanImpact = dynamicKarne?.sporpuanImpact;

  // Resolve profile photo dynamically from athlete profiles and sportsfly_sporcular
  const profilePhotoUrl = useMemo(() => {
    return getAthletePhotoUrl(activeKarne, sporcular, profiller);
  }, [activeKarne, sporcular, profiller]);

  const renderBadgeIcon = (iconName: string, className: string = "w-4 h-4") => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Users': return <Users className={className} />;
      case 'Clock': return <Clock className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      case 'Smartphone': return <Smartphone className={className} />;
      case 'Brain': return <Brain className={className} />;
      case 'Crown': return <Crown className={className} />;
      case 'SportsFlyIcon': return <SportsFlyIcon className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'HeartHandshake': return <HeartHandshake className={className} />;
      case 'Moon': return <Moon className={className} />;
      default: return <Award className={className} />;
    }
  };

  const getBadgeDetails = (kazanim: { baslik: string; aciklama: string; rozetId?: string; kategori?: string; }) => {
    const match = KURUMSAL_ROZETLER.find(
      r => r.id === kazanim.rozetId || 
           r.baslik.toLowerCase() === kazanim.baslik.toLowerCase() ||
           (r.id === 'rozet-temiz-spor' && (kazanim.baslik.toLowerCase().includes('temiz spor') || kazanim.rozetId === 'rozet-temiz-spor'))
    );
    return match;
  };

  const handleToggleBadge = (rozet: DavranissalRozet) => {
    if (!selectedKarne) return;

    const isAlreadyEarned = selectedKarne.davranissal.kazanimlar.some(
      k => k.rozetId === rozet.id || k.baslik.toLowerCase() === rozet.baslik.toLowerCase()
    );

    updateAndSaveKarneler(prev => prev.map(k => {
      if (k.id === selectedKarne.id) {
        let updatedKazanimlar = [...k.davranissal.kazanimlar];
        if (isAlreadyEarned) {
          updatedKazanimlar = updatedKazanimlar.filter(
            item => item.rozetId !== rozet.id && item.baslik.toLowerCase() !== rozet.baslik.toLowerCase()
          );
        } else {
          updatedKazanimlar.push({
            id: `kzn-${Date.now()}`,
            rozetId: rozet.id,
            baslik: rozet.baslik,
            aciklama: rozet.aciklama,
            kategori: rozet.kategori,
            tarih: new Date().toISOString().split('T')[0],
            onemDerecesi: rozet.onemDerecesi
          });
        }

        return {
          ...k,
          davranissal: {
            ...k.davranissal,
            kazanimlar: updatedKazanimlar
          }
        };
      }
      return k;
    }));
  };

  const handleRemoveBadge = (kazanimBaslik: string) => {
    if (!selectedKarne) return;

    updateAndSaveKarneler(prev => prev.map(k => {
      if (k.id === selectedKarne.id) {
        return {
          ...k,
          davranissal: {
            ...k.davranissal,
            kazanimlar: k.davranissal.kazanimlar.filter(
              item => item.baslik !== kazanimBaslik
            )
          }
        };
      }
      return k;
    }));
  };

  const handleAddCustomBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKarne || !customBadge.baslik.trim() || !customBadge.aciklama.trim()) return;

    const newBadgeItem = {
      id: `custom-${Date.now()}`,
      baslik: customBadge.baslik.trim(),
      aciklama: customBadge.aciklama.trim(),
      kategori: customBadge.kategori,
      onemDerecesi: customBadge.onemDerecesi,
      tarih: new Date().toISOString().split('T')[0]
    };

    updateAndSaveKarneler(prev => prev.map(k => {
      if (k.id === selectedKarne.id) {
        return {
          ...k,
          davranissal: {
            ...k.davranissal,
            kazanimlar: [...k.davranissal.kazanimlar, newBadgeItem]
          }
        };
      }
      return k;
    }));

    setCustomBadge({
      baslik: '',
      kategori: 'Karakter & Etik',
      aciklama: '',
      onemDerecesi: 'Özel Başarı'
    });
    setIsCustomBadgeOpen(false);
  };

  const filteredKarneler = karneler.filter(k => 
    k.adSoyad.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.brans.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.grup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectKarne = (karne: SporcuKarne) => {
    setSelectedKarneId(karne.id);
  };

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKarne || !newObservation.donem.trim() || !newObservation.odakKonusu.trim()) return;

    const newStep = {
      donem: newObservation.donem.trim(),
      tarih: new Date().toISOString().split('T')[0],
      durum: newObservation.durum,
      odakKonusu: newObservation.odakKonusu.trim(),
      gozlem: newObservation.gozlem.trim() || 'Dönemsel davranış gözlemi kaydedildi.'
    };

    updateAndSaveKarneler(prev => prev.map(k => {
      if (k.id === selectedKarne.id) {
        return {
          ...k,
          davranissal: {
            ...k.davranissal,
            surecTakibi: [...k.davranissal.surecTakibi, newStep]
          }
        };
      }
      return k;
    }));

    setNewObservation({
      donem: '',
      odakKonusu: '',
      durum: 'Hedefe Ulaştı',
      gozlem: ''
    });
    setIsAddObservationOpen(false);
  };

  const handleDownloadPDF = async () => {
    if (!karneRef.current || !selectedKarne || isDownloading) return;

    const prevCharts = showPerformanceCharts;
    const prevZoom = pdfZoom;

    try {
      setIsDownloading(true);
      if (!showPerformanceCharts || pdfZoom !== 100) {
        setShowPerformanceCharts(true);
        setPdfZoom(100);
        await new Promise((r) => setTimeout(r, 250));
      } else {
        await new Promise((r) => setTimeout(r, 80));
      }

      showToast(`${selectedKarne.adSoyad} için tüm sporcu karnesi PDF olarak hazırlanıyor...`);

      const fileName = `${selectedKarne.adSoyad.replace(/\s+/g, '_')}_Tum_Sporcu_Karnesi.pdf`;
      await exportContainerToSmartA4Pdf({
        containerEl: karneRef.current,
        fileName,
      });

      showToast(`✓ ${fileName} (Tüm Karne) başarıyla indirildi!`);
    } catch (error) {
      console.error('PDF oluşturulurken hata:', error);
      showToast('PDF oluşturulurken bir hata oluştu. Tarayıcınızın "Yazdır" seçeneğini kullanabilirsiniz.');
    } finally {
      setIsDownloading(false);
      setShowPerformanceCharts(prevCharts);
      setPdfZoom(prevZoom);
    }
  };

  const handleTogglePdfPreview = () => {
    setIsPdfPreviewMode((prev) => {
      const next = !prev;
      if (next) {
        setShowPerformanceCharts(true);
        setActiveReportPage('all');
        showToast('Karne A4 PDF önizleme moduna alındı.');
        setTimeout(() => {
          const el = document.getElementById('sporcu-karne-print-area') || document.getElementById('sporcu-karne-preview-bar');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        showToast('Normal çalışma görünümüne dönüldü.');
      }
      return next;
    });
  };

  const handlePrintKarne = () => {
    setShowPerformanceCharts(true);
    setActiveReportPage('all');
    setPdfZoom(100);
    setIsPdfPreviewMode(true);
    showToast('A4 Yazdırma diyaloğu hazırlanıyor...');
    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.warn('window.print çağrısı uyarısı:', err);
        showToast('Tarayıcı yazdırma penceresi açılamadı. "Tüm Karneyi İndir" ile temiz A4 PDF dosyasını indirebilirsiniz.');
      }
    }, 250);
  };

  const getProgressHex = (colorClass: string) => {
    if (colorClass.includes('emerald')) return '#10b981';
    if (colorClass.includes('purple')) return '#9333ea';
    if (colorClass.includes('amber')) return '#f59e0b';
    if (colorClass.includes('indigo')) return '#4f46e5';
    if (colorClass.includes('rose')) return '#e11d48';
    return '#3b82f6';
  };

  const renderProgressBar = (label: string, value: number, colorClass: string, bonus?: number) => {
    const barHex = getProgressHex(colorClass);
    const pctWidth = Math.max(4, Math.min(200, value * 20));
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
          <span className="text-slate-600">{label}</span>
          <div className="flex items-center gap-1.5">
            {bonus !== undefined && bonus > 0 && (
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                +{bonus} SP
              </span>
            )}
            <span className="text-slate-800 font-bold">{value}/10</span>
          </div>
        </div>
        <svg viewBox="0 0 200 8" preserveAspectRatio="none" className="w-full h-2 rounded-full overflow-hidden block">
          <rect x="0" y="0" width="200" height="8" rx="4" fill="#f1f5f9" />
          <rect x="0" y="0" width={pctWidth} height="8" rx="4" fill={barHex} />
        </svg>
      </div>
    );
  };

  const genelOrtalama = activeKarne ? (
    (
      activeKarne.teknik.ortalama +
      activeKarne.fiziksel.ortalama +
      activeKarne.taktiksel.ortalama +
      activeKarne.zihinsel.ortalama +
      (activeKarne.davranissal?.kriterler?.ortalama || 8)
    ) / 5
  ).toFixed(1) : '0.0';

  const renderPageWatermark = () => (
    <div
      className="absolute inset-0 pointer-events-none select-none flex flex-col items-center justify-center overflow-hidden z-0"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center justify-center opacity-[0.065] -rotate-12">
        <div className="w-[380px] h-[380px] sm:w-[440px] sm:h-[440px] rounded-full border-[5px] border-dashed border-cyan-600 flex flex-col items-center justify-center p-8">
          <img
            src={ROTA_PERFORMANS_LOGO_DATA_URL}
            alt="Rota Performans Logo"
            className="w-[250px] h-[250px] sm:w-[290px] sm:h-[290px] object-contain"
          />
          <div className="mt-2 text-center text-2xl sm:text-3xl font-black tracking-tight uppercase text-slate-900">
            ROTA <span className="text-cyan-600">PERFORMANS</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPageHeaderBadge = (pageNo: number) => (
    <>
      {renderPageWatermark()}
      <div className="bg-white px-6 md:px-8 pt-4 pb-3 border-b border-slate-200 a4-avoid-break relative z-10">
      <svg
        viewBox="0 0 600 6"
        preserveAspectRatio="none"
        className="w-full h-1.5 rounded-full overflow-hidden block mb-3"
        aria-hidden="true"
      >
        <rect x="0" y="0" width="348" height="6" fill="#0f172a" />
        <rect x="348" y="0" width="144" height="6" fill="#0ea5e9" />
        <rect x="492" y="0" width="108" height="6" fill="#e11d48" />
      </svg>

      <div className="flex flex-col sm:flex-row print:flex-row sm:items-center print:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {schoolBranding.logoDataUrl ? (
            <div className="w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 p-1 flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={schoolBranding.logoDataUrl}
                alt={schoolBranding.schoolName}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">
              {(schoolBranding.schoolName || 'SK').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-[10px] font-sans tabular-nums font-bold tracking-widest text-sky-700 uppercase">
              RESMİ SPORCU GELİŞİM &amp; PERFORMANS KARNESİ · {schoolBranding.branchName || 'Merkez Kampüs'}
            </div>
            <div className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
              {schoolBranding.schoolName || 'ATAŞEHİR SPOR OKULLARI AKADEMİSİ'}
            </div>
          </div>
        </div>

        <RotaSportsFlyHeaderBadge
          isDark={false}
          pageNo={pageNo}
          totalReportPages={5}
          effectiveSecondaryHex="#0284c7"
        />
      </div>
    </div>
    </>
  );

  const renderPageFooterBadge = (pageNo: number) => (
    <div className="pt-3 pb-3 px-6 md:px-8 border-t border-slate-200/90 bg-white a4-avoid-break">
      <RotaSportsFlyFooterBadge
        primaryHex="#0284c7"
        clubName={schoolBranding.schoolName || 'SPOR OKULU AKADEMİSİ'}
        athleteCode={activeKarne?.id}
        pageText={`Sayfa 0${pageNo} / 05`}
      />
    </div>
  );

  return (
    <div className="flex-1 p-4 lg:p-8 pt-6 overflow-y-auto w-full h-full print:p-0 print:overflow-visible print:h-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 print:hidden">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Award className="w-8 h-8 text-blue-600" />
            Sporcu Karnesi
          </h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 print:block">
        
        {/* Left Panel - Selection List */}
        <div className={`w-full lg:w-80 shrink-0 print:hidden ${isPdfPreviewMode ? 'hidden' : ''}`}>
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/60 p-4 sticky top-6">
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Sporcu, grup veya branş ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
            
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
              Karnesi Çıkan Sporcular
            </div>

            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
              {filteredKarneler.map(karne => {
                const itemPhoto = getAthletePhotoUrl(karne, sporcular, profiller);
                const initials = getAthleteInitials(karne.adSoyad);
                const isSelected = selectedKarne?.id === karne.id;
                return (
                  <button
                    key={karne.id}
                    onClick={() => handleSelectKarne(karne)}
                    className={`w-full text-left p-3 rounded-xl transition-all border flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-200 shadow-xs ring-1 ring-blue-400/30'
                        : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-black shrink-0 overflow-hidden shadow-2xs border border-slate-200/80">
                      {itemPhoto ? (
                        <img
                          src={itemPhoto}
                          alt={karne.adSoyad}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-800 text-sm truncate">{karne.adSoyad}</div>
                      <div className="text-xs text-slate-500 truncate">{karne.grup}</div>
                      <div className="text-[10px] font-semibold text-slate-400 mt-0.5 flex gap-1.5 items-center">
                        <span className="text-blue-600 font-bold">{karne.brans}</span>
                        <span>•</span>
                        <span>{new Date(karne.tarih).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredKarneler.length === 0 && (
                <div className="text-center py-6 text-sm text-slate-500">
                  Sonuç bulunamadı.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Report Card View */}
        {selectedKarne ? (
          <div className="flex-1 min-w-0">
            {/* Toolbar — Structured into Action Groups & Mobile Responsive Grid */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 mb-4 shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 print:hidden">
              {/* Left Group: Point & Chart Controls */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setIsQuickPointModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
                  title="Sporcuya tek tıkla saha içi hızlı puan ver ve karnesine anında yansıt"
                >
                  <Zap className="w-4 h-4 fill-slate-950 shrink-0" />
                  <span>Hızlı Puan Ver</span>
                </button>

                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('sporpuan-sporcu-degerlendirme')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                  >
                    <ClipboardCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="hidden sm:inline">Puanları Değerlendir</span>
                    <span className="sm:hidden">Değerlendir</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowPerformanceCharts(prev => !prev)}
                  className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer whitespace-nowrap ${
                    showPerformanceCharts
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="D3 Radar Grafik ve Çizgi Grafiklerle görselleştirilen Performans Grafikleri panelini göster/gizle"
                >
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span>Performans Grafikleri</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSimplifiedView(prev => !prev)}
                  className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap ${
                    isSimplifiedView
                      ? 'bg-amber-100 border border-amber-300 text-amber-800 font-extrabold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Karnedeki yoğun/renkli panelleri sadeleştirip minimal şık tasarıma geçirir"
                >
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{isSimplifiedView ? 'Sade Görünüm: Açık' : 'Sade Görünüm'}</span>
                </button>
              </div>

              {/* Right Group: PDF / Print / Parent Share Actions */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                <button 
                  type="button"
                  onClick={handleTogglePdfPreview}
                  className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap ${
                    isPdfPreviewMode
                      ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400/40'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  title="Sporcu karnesini A4 PDF formatında web üzerinde görüntüleyin ve yazdırın"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>{isPdfPreviewMode ? 'PDF Görünümünü Kapat' : 'PDF Olarak Görüntüle'}</span>
                  {isPdfPreviewMode && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-sans tabular-nums font-black bg-white/20 text-white">
                      Açık
                    </span>
                  )}
                </button>

                <button 
                  type="button"
                  onClick={handlePrintKarne}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
                  title="Tarayıcı yazdırma modunu kullanarak arka plan grafikleri ve SportsFly Lab markalamasıyla A4 çıktı alın"
                >
                  <Printer className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>A4 Yazdır</span>
                </button>

                <button 
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-colors shadow-xs disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  title="Tüm karne sayfalarını ve performans grafiklerini kapsayan temiz A4 PDF belgesini indirin"
                >
                  {isDownloading ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin shrink-0" />
                  ) : (
                    <Download className="w-4 h-4 text-sky-400 shrink-0" />
                  )}
                  <span>
                    {isDownloading ? 'Tüm Karne İndiriliyor...' : 'Tüm Karneyi İndir'}
                  </span>
                </button>

                <button 
                  type="button"
                  onClick={() => setIsVeliModalOpen(true)}
                  className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                  title="Veliye WhatsApp veya SMS üzerinden karnenin özetini ve PDF'ini gönderin"
                >
                  <Share2 className="w-4 h-4 shrink-0" />
                  <span>Veliye Gönder (WhatsApp / SMS)</span>
                </button>
              </div>
            </div>

            {/* Interactive A4 PDF Document Preview Bar (Shown when 'PDF Olarak Görüntüle' is active) */}
            {isPdfPreviewMode && (
              <div id="sporcu-karne-preview-bar" className="mb-4 bg-slate-900 text-white rounded-2xl p-3.5 sm:px-5 border border-slate-700 flex flex-wrap items-center justify-between gap-3 shadow-lg print:hidden animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold tracking-tight flex items-center gap-2">
                      <span>A4 PDF Önizleme Modu — {activeKarne.adSoyad}</span>
                      <span className="text-[11px] font-sans tabular-nums font-normal text-slate-300">
                        (210 × 297 mm · A4 Baskı Formatı)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Karnenin A4 yazdırma görünümünü inceliyorsunuz. Doğrudan A4 yazdırabilir veya PDF indirebilirsiniz.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                    {[90, 100, 110].map((z) => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => setPdfZoom(z)}
                        className={`px-2.5 py-1 rounded-lg font-sans tabular-nums font-bold transition-colors cursor-pointer ${
                          pdfZoom === z ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        %{z}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handlePrintKarne}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>A4 Yazdır / PDF Çıktısı Al</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>{isDownloading ? 'İndiriliyor...' : 'Tüm Karneyi İndir'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPdfPreviewMode(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Kapat</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5-Page Unified Report Card Navigation Bar */}
            <div className="bg-white dark:bg-[#111c2e] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  5P
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">
                    Tek Parça 5 Sayfalık Dijital Sporcu Karnesi
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Ayrı versiyonlar olmaksızın, tüm detayları içeren tek birleşik 5 sayfalık gelişim raporu.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { page: 1, title: 'Sayfa 1: Özet & Künye' },
                  { page: 2, title: 'Sayfa 2: Fiziksel & Ölçüm' },
                  { page: 3, title: 'Sayfa 3: Teknik & Taktik' },
                  { page: 4, title: 'Sayfa 4: Rozetler & Süreç' },
                  { page: 5, title: 'Sayfa 5: Gelişim & Notlar' },
                  { page: 'all', title: 'Tüm 5 Sayfa (Tek Karne)' },
                ].map((p) => (
                  <button
                    key={String(p.page)}
                    type="button"
                    onClick={() => setActiveReportPage(p.page as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeReportPage === p.page
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Print Area Container (A4 Styled when in PDF Preview or @media print) */}
            <div
              className={
                isPdfPreviewMode
                  ? 'bg-slate-800/95 p-4 sm:p-8 rounded-2xl border border-slate-700 shadow-2xl overflow-x-auto print:bg-white print:p-0 print:border-0 print:shadow-none'
                  : ''
              }
            >
              <div
                ref={karneRef}
                id="sporcu-karne-print-area"
                className={`bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden relative print:rounded-none print:shadow-none print:border-slate-300 ${
                  isPdfPreviewMode ? 'max-w-[210mm] mx-auto ring-1 ring-slate-300 shadow-2xl' : ''
                }`}
                style={
                  isPdfPreviewMode && pdfZoom !== 100
                    ? { zoom: `${pdfZoom}%` }
                    : undefined
                }
              >
              {/* ======================================================== */}
              {/* SAYFA 1: ÖZET, KÜNYE & PERFORMANS DENGESİ */}
              {/* ======================================================== */}
              {(activeReportPage === 'all' || activeReportPage === 1) && (
                <div
                  id="sporcu-karne-sayfa-1"
                  className="a4-print-page bg-white relative overflow-hidden flex flex-col justify-between mb-8 print:mb-0 shadow-xs print:shadow-none border border-slate-200 print:border-none rounded-2xl print:rounded-none"
                >
                  <div>
                    {renderPageHeaderBadge(1)}

                    {/* Report Header */}
                    <div className="bg-slate-900 text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                      <div className="flex items-center gap-5 relative z-10">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-black shadow-md border-2 border-slate-700 shrink-0 overflow-hidden text-white">
                          {profilePhotoUrl ? (
                            <img
                              src={profilePhotoUrl}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              alt={activeKarne.adSoyad}
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span>{getAthleteInitials(activeKarne.adSoyad)}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
                            {activeKarne.brans} • {activeKarne.yasGubu}
                          </div>
                          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1.5 tracking-tight">
                            {activeKarne.adSoyad}
                          </h2>
                          <div className="flex flex-wrap gap-2 text-xs md:text-sm text-slate-300 font-medium">
                            <span>Takım: {activeKarne.grup}</span>
                            <span className="text-slate-500">•</span>
                            <span>{activeKarne.boy} cm</span>
                            <span className="text-slate-500">•</span>
                            <span>{activeKarne.kilo} kg</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-emerald-300">
                              Veli: <strong className="text-white font-semibold">{activeKarne.veliAdSoyad || 'Kayıtlı Veli'}</strong> ({activeKarne.veliTelefon || '+90 532...'})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 flex flex-wrap md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
                        <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/60 text-left md:text-right">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Değerlendirme Tarihi</div>
                          <div className="text-sm font-bold text-white mt-0.5">
                            {new Date(activeKarne.tarih).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="text-xs text-slate-300 mt-0.5">
                            Antrenör: <span className="font-semibold text-white">{activeKarne.antrenor}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="bg-blue-950/60 border border-blue-800/50 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
                            <span className="text-[11px] font-medium text-blue-300">Genel Karne Notu:</span>
                            <span className="text-sm font-black text-blue-400">{genelOrtalama}</span>
                            <span className="text-[10px] text-blue-300/70">/ 10</span>
                            {sporpuanImpact && sporpuanImpact.bonuses.genelOrtalamaBonus > 0 && (
                              <span className="ml-1 text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                                +{sporpuanImpact.bonuses.genelOrtalamaBonus} SP
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsVeliModalOpen(true)}
                            className="print:hidden flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Veliye İlet</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Dinamik SporPuan & Karne Dengesi Canlı Paneli */}
                    {sporpuanImpact && (
                      isSimplifiedView ? (
                        <div className="mx-6 md:mx-8 mt-5 p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                              <div>
                                <span className="text-xs font-bold text-slate-800">Sporpuan &amp; Karne Dengesi (Sade Özet)</span>
                                <p className="text-[10px] text-slate-500">Antrenör puanları ve devamlılık durumu</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-5 text-xs">
                              <div>
                                <span className="text-slate-400 font-semibold mr-1">TOPLAM:</span>
                                <strong className="text-amber-600 font-extrabold">{sporpuanImpact.totalSP} SP</strong>
                              </div>
                              <div className="w-px h-4 bg-slate-200" />
                              <div>
                                <span className="text-slate-400 font-semibold mr-1">KATKI:</span>
                                <strong className="text-emerald-600 font-extrabold flex items-center gap-0.5 inline-flex">
                                  <TrendingUp className="w-3.5 h-3.5" />
                                  +{sporpuanImpact.bonuses.genelOrtalamaBonus} Not
                                </strong>
                              </div>
                              <div className="w-px h-4 bg-slate-200" />
                              <div>
                                <span className="text-slate-400 font-semibold mr-1">KATILIM:</span>
                                <strong className="text-slate-700 font-extrabold">%{activeKarne.katilimYuzdesi}</strong>
                              </div>
                              <button
                                type="button"
                                onClick={() => setIsQuickPointModalOpen(true)}
                                className="print:hidden text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
                              >
                                + Hızlı Puan Ver
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mx-6 md:mx-8 mt-5 p-4 md:p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-blue-500/10 rounded-2xl border border-amber-200/80">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 font-black flex items-center justify-center shadow-md shrink-0">
                                <Zap className="w-6 h-6 fill-slate-950 text-slate-950" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-extrabold text-slate-900 text-sm md:text-base flex items-center gap-1.5">
                                    Sporpuan &amp; Karne Dinamik Dengesi
                                  </h3>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    Canlı Senkronize
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5">
                                  Antrenörün verdiği hızlı puanlar ve devamlılık puanları sporcu karnesine dinamik not artışı olarak yansır.
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="bg-white/90 border border-amber-200 px-3.5 py-2 rounded-xl text-center shadow-2xs">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Toplam Sporpuan</span>
                                <span className="text-base font-black text-amber-600">
                                  {sporpuanImpact.totalSP} SP
                                </span>
                              </div>

                              <div className="bg-white/90 border border-emerald-200 px-3.5 py-2 rounded-xl text-center shadow-2xs">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block">Karne Not Katkısı</span>
                                <span className="text-base font-black text-emerald-600 flex items-center justify-center gap-0.5">
                                  <TrendingUp className="w-3.5 h-3.5" />
                                  +{sporpuanImpact.bonuses.genelOrtalamaBonus} Not
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => setIsQuickPointModalOpen(true)}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 print:hidden"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span>+ Hızlı Puan Ver</span>
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-amber-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="p-2 bg-white/70 rounded-lg border border-slate-200/60">
                              <span className="text-[10px] font-bold text-slate-500 block">Davranış &amp; Fair-Play</span>
                              <span className="font-black text-slate-800">{sporpuanImpact.categoryPoints.davranis} SP</span>
                              <span className="text-[10px] text-indigo-600 font-bold ml-1">
                                (+{sporpuanImpact.bonuses.davranisBonus})
                              </span>
                            </div>
                            <div className="p-2 bg-white/70 rounded-lg border border-slate-200/60">
                              <span className="text-[10px] font-bold text-slate-500 block">Teknik &amp; Gelişim</span>
                              <span className="font-black text-slate-800">{sporpuanImpact.categoryPoints.gelisim} SP</span>
                              <span className="text-[10px] text-blue-600 font-bold ml-1">
                                (+{sporpuanImpact.bonuses.teknikBonus})
                              </span>
                            </div>
                            <div className="p-2 bg-white/70 rounded-lg border border-slate-200/60">
                              <span className="text-[10px] font-bold text-slate-500 block">Liderlik &amp; Zihin</span>
                              <span className="font-black text-slate-800">{sporpuanImpact.categoryPoints.liderlik} SP</span>
                              <span className="text-[10px] text-amber-600 font-bold ml-1">
                                (+{sporpuanImpact.bonuses.zihinselBonus})
                              </span>
                            </div>
                            <div className="p-2 bg-white/70 rounded-lg border border-slate-200/60">
                              <span className="text-[10px] font-bold text-slate-500 block">Antrenman Devamı</span>
                              <span className="font-black text-emerald-700">{sporpuanImpact.categoryPoints.devam} SP</span>
                              <span className="text-[10px] text-emerald-600 font-bold ml-1">
                                (%{activeKarne.katilimYuzdesi})
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    {/* Attendance & Group Comparison & Trainer Summary */}
                    <div className="p-6 md:p-8 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Attendance */}
                        <div className="flex items-center justify-between bg-slate-50/80 border border-slate-200 rounded-xl p-4 shadow-2xs">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">Antrenman Devamlılığı</h4>
                            <div className="text-xs font-medium text-slate-500 mt-0.5">
                              Toplam {activeKarne.antrenmanSayisi} antrenman tamamlandı
                            </div>
                          </div>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-black ${
                            activeKarne.katilimYuzdesi >= 90 ? 'bg-emerald-100 text-emerald-700' :
                            activeKarne.katilimYuzdesi >= 75 ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            %{activeKarne.katilimYuzdesi}
                          </div>
                        </div>

                        {/* Trainer Summary */}
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                          <h4 className="font-bold text-blue-900 mb-1 text-sm flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-blue-600" />
                            Antrenör Değerlendirmesi
                          </h4>
                          <p className="text-xs text-slate-700 leading-relaxed line-clamp-3 italic">
                            "{activeKarne.antrenorNotu}"
                          </p>
                        </div>
                      </div>

                      {/* Grup Karşılaştırması */}
                      {isSimplifiedView ? (
                        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2.5 mb-2.5">
                            <div>
                              <h4 className="font-bold text-slate-800 text-xs">Grup Karşılaştırması &amp; Genel Konum</h4>
                              <p className="text-[10px] text-slate-500">
                                Sporcunun kendi yaş ve branş grubu içerisindeki başarı dengesi
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                              Grup İçi Konum: %94
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-center">
                            <div>
                              <div className="text-[10px] text-slate-400 font-semibold uppercase">Sporcu Sayısı</div>
                              <div className="text-sm font-extrabold text-slate-700 mt-0.5">15</div>
                            </div>
                            <div className="border-l border-slate-200 hidden sm:block h-6 my-auto" />
                            <div>
                              <div className="text-[10px] text-amber-600 font-semibold uppercase">Genel Sıralama</div>
                              <div className="text-sm font-extrabold text-amber-600 mt-0.5">1 / 15</div>
                            </div>
                            <div className="border-l border-slate-200 hidden sm:block h-6 my-auto" />
                            <div>
                              <div className="text-[10px] text-blue-600 font-semibold uppercase">Performans</div>
                              <div className="text-sm font-extrabold text-blue-600 mt-0.5">%88</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-indigo-50/40 border border-indigo-200 rounded-xl p-4 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-indigo-950 text-xs sm:text-sm">Grup Karşılaştırması &amp; Genel Konum</h4>
                              <p className="text-[11px] text-slate-600">
                                Sporcunun kendi yaş ve branş grubu içerisindeki başarı dengesi
                              </p>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-extrabold">
                              Grup İçi Konum: %94
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                            <div className="bg-white p-2.5 rounded-xl border border-indigo-100 text-center">
                              <div className="text-[9.5px] font-bold text-slate-500 uppercase">Grup Sporcu Sayısı</div>
                              <div className="text-base font-black font-sans tabular-nums text-slate-900 mt-0.5">15</div>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-amber-200 text-center">
                              <div className="text-[9.5px] font-bold text-amber-800 uppercase">Genel Sıralama</div>
                              <div className="text-base font-black font-sans tabular-nums text-amber-600 mt-0.5">1.</div>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-blue-200 text-center">
                              <div className="text-[9.5px] font-bold text-blue-800 uppercase">Sportif Performans</div>
                              <div className="text-base font-black font-sans tabular-nums text-blue-600 mt-0.5">%88</div>
                            </div>
                            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                              <div className="text-[9.5px] font-bold text-slate-500 uppercase">Grup Ortalaması</div>
                              <div className="text-base font-black font-sans tabular-nums text-slate-700 mt-0.5">%72</div>
                            </div>
                            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-300 text-center">
                              <div className="text-[9.5px] font-bold text-emerald-900 uppercase">Grup İçi Konum</div>
                              <div className="text-base font-black font-sans tabular-nums text-emerald-700 mt-0.5">%94</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {renderPageFooterBadge(1)}
                </div>
              )}

              {/* ======================================================== */}
              {/* SAYFA 2: FİZİKSEL PERFORMANS, BİYOMOTOR & GELİŞİM GRAFİKLERİ */}
              {/* ======================================================== */}
              {(activeReportPage === 'all' || activeReportPage === 2) && (
                <div
                  id="sporcu-karne-sayfa-2"
                  className="a4-print-page bg-white relative overflow-hidden flex flex-col justify-between mb-8 print:mb-0 shadow-xs print:shadow-none border border-slate-200 print:border-none rounded-2xl print:rounded-none"
                >
                  <div>
                    {renderPageHeaderBadge(2)}

                    {/* Sub-header banner */}
                    {isSimplifiedView ? (
                      <div className="px-6 md:px-8 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
                        <div>
                          <div className="text-[10px] font-sans tabular-nums font-bold tracking-widest text-emerald-600 uppercase">
                            BİYOMOTOR KAPASİTE &amp; KONDİSYON GELİŞİMİ
                          </div>
                          <div className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight">
                            Sayfa 2: Fiziksel Performans &amp; Biyomotor Ölçüm Analizi
                          </div>
                        </div>
                        <div className="text-right text-xs font-sans tabular-nums text-slate-500">
                          {activeKarne.adSoyad} · Genel Fiziksel: <span className="text-emerald-600 font-bold">{activeKarne.fiziksel.ortalama}/10</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900 text-white px-6 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-sans tabular-nums font-bold tracking-widest text-emerald-400 uppercase">
                            BİYOMOTOR KAPASİTE &amp; KONDİSYON GELİŞİMİ
                          </div>
                          <div className="text-sm sm:text-base font-extrabold tracking-tight">
                            Sayfa 2: Fiziksel Performans &amp; Biyomotor Ölçüm Analizi
                          </div>
                        </div>
                        <div className="text-right text-xs font-sans tabular-nums text-slate-300">
                          {activeKarne.adSoyad} · Genel Fiziksel: <span className="text-emerald-400 font-bold">{activeKarne.fiziksel.ortalama}/10</span>
                        </div>
                      </div>
                    )}

                    {/* D3 Radar & Progression Line Charts Panel */}
                    {showPerformanceCharts && (
                      <SporcuKarnePerformanceCharts karne={activeKarne} />
                    )}

                    {/* Physical Skills Grid */}
                    <div className="p-6 md:p-8">
                      <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                            <Activity className="w-4 h-4 text-emerald-600" />
                            Fiziksel Gelişim &amp; Biyomotor Test Parametreleri
                          </h3>
                          <div className="flex items-center gap-1.5">
                            {sporpuanImpact && sporpuanImpact.bonuses.fizikselBonus > 0 && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                +{sporpuanImpact.bonuses.fizikselBonus} SP
                              </span>
                            )}
                            <div className="bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-md text-xs">
                              {activeKarne.fiziksel.ortalama} / 10
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                          <div>
                            {activeKarne.fiziksel.hiz !== undefined && renderProgressBar('Hız / Çabukluk Testi', activeKarne.fiziksel.hiz, 'bg-emerald-500', sporpuanImpact?.bonuses.fizikselBonus)}
                            {activeKarne.fiziksel.dayaniklilik !== undefined && renderProgressBar('Dayanıklılık (Aerobik Kondisyon)', activeKarne.fiziksel.dayaniklilik, 'bg-emerald-500', sporpuanImpact?.bonuses.fizikselBonus)}
                          </div>
                          <div>
                            {activeKarne.fiziksel.guc !== undefined && renderProgressBar('Kuvvet & Patlayıcı Güç', activeKarne.fiziksel.guc, 'bg-emerald-500', sporpuanImpact?.bonuses.fizikselBonus)}
                            {activeKarne.fiziksel.ceviklik !== undefined && renderProgressBar('Çeviklik & Koordinasyon Testi', activeKarne.fiziksel.ceviklik, 'bg-emerald-500', sporpuanImpact?.bonuses.fizikselBonus)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {renderPageFooterBadge(2)}
                </div>
              )}

              {/* ======================================================== */}
              {/* SAYFA 3: TEKNİK BECERİLER & TAKTİKSEL OYUN ZEKASI */}
              {/* ======================================================== */}
              {(activeReportPage === 'all' || activeReportPage === 3) && (
                <div
                  id="sporcu-karne-sayfa-3"
                  className="a4-print-page bg-white relative overflow-hidden flex flex-col justify-between mb-8 print:mb-0 shadow-xs print:shadow-none border border-slate-200 print:border-none rounded-2xl print:rounded-none"
                >
                  <div>
                    {renderPageHeaderBadge(3)}

                    {/* Sub-header banner */}
                    {isSimplifiedView ? (
                      <div className="px-6 md:px-8 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
                        <div>
                          <div className="text-[10px] font-sans tabular-nums font-bold tracking-widest text-sky-600 uppercase">
                            BRANŞ BİLGİSİ, OYUN OKUMA &amp; SAHA UYGULAMASI
                          </div>
                          <div className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight">
                            Sayfa 3: Teknik Gelişim &amp; Taktiksel Oyun Zekası
                          </div>
                        </div>
                        <div className="text-right text-xs font-sans tabular-nums text-slate-500">
                          Teknik: <span className="text-blue-600 font-bold">{activeKarne.teknik.ortalama}/10</span> · Taktik: <span className="text-purple-600 font-bold">{activeKarne.taktiksel.ortalama}/10</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900 text-white px-6 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-sans tabular-nums font-bold tracking-widest text-sky-400 uppercase">
                            BRANŞ BİLGİSİ, OYUN OKUMA &amp; SAHA UYGULAMASI
                          </div>
                          <div className="text-sm sm:text-base font-extrabold tracking-tight">
                            Sayfa 3: Teknik Gelişim &amp; Taktiksel Oyun Zekası
                          </div>
                        </div>
                        <div className="text-right text-xs font-sans tabular-nums text-slate-300">
                          Teknik: <span className="text-blue-400 font-bold">{activeKarne.teknik.ortalama}/10</span> · Taktik: <span className="text-purple-400 font-bold">{activeKarne.taktiksel.ortalama}/10</span>
                        </div>
                      </div>
                    )}

                    <div className="p-6 md:p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Technical Skills */}
                        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                              <Target className="w-4 h-4 text-blue-600" />
                              Teknik Gelişim Becerileri
                            </h3>
                            <div className="flex items-center gap-1.5">
                              {sporpuanImpact && sporpuanImpact.bonuses.teknikBonus > 0 && (
                                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                                  +{sporpuanImpact.bonuses.teknikBonus} SP
                                </span>
                              )}
                              <div className="bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-md text-xs">
                                {activeKarne.teknik.ortalama} / 10
                              </div>
                            </div>
                          </div>
                          <div>
                            {activeKarne.teknik.topKontrolu !== undefined && renderProgressBar('Top Kontrolü', activeKarne.teknik.topKontrolu, 'bg-blue-500', sporpuanImpact?.bonuses.teknikBonus)}
                            {activeKarne.teknik.pasBasarisi !== undefined && renderProgressBar('Pas Başarısı', activeKarne.teknik.pasBasarisi, 'bg-blue-500', sporpuanImpact?.bonuses.teknikBonus)}
                            {activeKarne.teknik.sut !== undefined && renderProgressBar('Şut / Bitiricilik', activeKarne.teknik.sut, 'bg-blue-500', sporpuanImpact?.bonuses.teknikBonus)}
                            {activeKarne.teknik.topSurme !== undefined && renderProgressBar('Top Sürme', activeKarne.teknik.topSurme, 'bg-blue-500', sporpuanImpact?.bonuses.teknikBonus)}
                            {activeKarne.teknik.savunma !== undefined && renderProgressBar('Birebir Savunma', activeKarne.teknik.savunma, 'bg-blue-500', sporpuanImpact?.bonuses.teknikBonus)}
                          </div>
                        </div>

                        {/* Tactical Skills */}
                        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                              <TrendingUp className="w-4 h-4 text-purple-600" />
                              Taktiksel Gelişim &amp; Pozisyon
                            </h3>
                            <div className="flex items-center gap-1.5">
                              {sporpuanImpact && sporpuanImpact.bonuses.taktikselBonus > 0 && (
                                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                                  +{sporpuanImpact.bonuses.taktikselBonus} SP
                                </span>
                              )}
                              <div className="bg-purple-100 text-purple-700 font-bold px-2.5 py-0.5 rounded-md text-xs">
                                {activeKarne.taktiksel.ortalama} / 10
                              </div>
                            </div>
                          </div>
                          <div>
                            {activeKarne.taktiksel.oyunZekasi !== undefined && renderProgressBar('Oyun Zekası', activeKarne.taktiksel.oyunZekasi, 'bg-purple-500', sporpuanImpact?.bonuses.taktikselBonus)}
                            {activeKarne.taktiksel.pozisyonAlma !== undefined && renderProgressBar('Pozisyon Alma', activeKarne.taktiksel.pozisyonAlma, 'bg-purple-500', sporpuanImpact?.bonuses.taktikselBonus)}
                            {activeKarne.taktiksel.kararVerme !== undefined && renderProgressBar('Karar Verme', activeKarne.taktiksel.kararVerme, 'bg-purple-500', sporpuanImpact?.bonuses.taktikselBonus)}
                          </div>
                        </div>
                      </div>

                      {/* Technical Tactical Guidance Banner */}
                      <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                          ✓
                        </div>
                        <div>
                          <div className="text-xs font-bold text-sky-950 uppercase tracking-wider mb-0.5">
                            Saha İçi Uygulama &amp; Antrenman Hedefleri
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Sporcumuz antrenmanlarda teknik istasyon çalışmalarına yüksek odaklanma göstermektedir. Taktiksel karar verme ve baskı altında pas açısı oluşturma alanlarında planlanan özel driller uygulanacaktır.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {renderPageFooterBadge(3)}
                </div>
              )}

              {/* ======================================================== */}
              {/* SAYFA 4: DAVRANIŞSAL GELİŞİM, KARAKTER & ROZETLER */}
              {/* ======================================================== */}
              {(activeReportPage === 'all' || activeReportPage === 4) && (
                <div
                  id="sporcu-karne-sayfa-4"
                  className="a4-print-page bg-white relative overflow-hidden flex flex-col justify-between mb-8 print:mb-0 shadow-xs print:shadow-none border border-slate-200 print:border-none rounded-2xl print:rounded-none"
                >
                  <div>
                    {renderPageHeaderBadge(4)}

                    {/* Sub-header banner */}
                    {isSimplifiedView ? (
                      <div className="px-6 md:px-8 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
                        <div>
                          <div className="text-[10px] font-sans tabular-nums font-bold tracking-widest text-indigo-600 uppercase">
                            FAIR-PLAY, DİSİPLİN &amp; KULÜP KÜLTÜRÜ
                          </div>
                          <div className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight">
                            Sayfa 4: Davranışsal Gelişim, Karakter &amp; Rozetler
                          </div>
                        </div>
                        <div className="text-right text-xs font-sans tabular-nums text-slate-500">
                          Davranış: <span className="text-indigo-600 font-bold">{activeKarne.davranissal?.kriterler.ortalama || 9}/10</span> · Rozet: <span className="text-amber-600 font-bold">{activeKarne.davranissal?.kazanimlar.length || 0} Adet</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900 text-white px-6 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-sans tabular-nums font-bold tracking-widest text-indigo-400 uppercase">
                            FAIR-PLAY, DİSİPLİN &amp; KULÜP KÜLTÜRÜ
                          </div>
                          <div className="text-sm sm:text-base font-extrabold tracking-tight">
                            Sayfa 4: Davranışsal Gelişim, Karakter &amp; Rozetler
                          </div>
                        </div>
                        <div className="text-right text-xs font-sans tabular-nums text-slate-300">
                          Davranış: <span className="text-indigo-400 font-bold">{activeKarne.davranissal?.kriterler.ortalama || 9}/10</span> · Rozet: <span className="text-amber-400 font-bold">{activeKarne.davranissal?.kazanimlar.length || 0} Adet</span>
                        </div>
                      </div>
                    )}

                    {activeKarne.davranissal && (
                      <div className="p-6 md:p-8 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Left: Criteria */}
                          <div className="lg:col-span-6 space-y-5">
                            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                  Temel Davranış Kriterleri
                                </h4>
                                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                  Puan / 10
                                </span>
                              </div>
                              <div className="space-y-1">
                                {renderProgressBar('Fair-Play & Centilmenlik', activeKarne.davranissal.kriterler.fairPlay, 'bg-indigo-500', sporpuanImpact?.bonuses.davranisBonus)}
                                {renderProgressBar('Sorumluluk & Malzeme Düzeni', activeKarne.davranissal.kriterler.sorumlulukEkipman, 'bg-indigo-500', sporpuanImpact?.bonuses.davranisBonus)}
                                {renderProgressBar('Saygı & Yapıcı İletişim', activeKarne.davranissal.kriterler.saygiIletisim, 'bg-indigo-500', sporpuanImpact?.bonuses.davranisBonus)}
                                {renderProgressBar('Dinleme & Yönergelere Uyum', activeKarne.davranissal.kriterler.yonergeyeUyum, 'bg-indigo-500', sporpuanImpact?.bonuses.davranisBonus)}
                                {renderProgressBar('Duygu Kontrolü & Sakinlik', activeKarne.davranissal.kriterler.duyguKontrolu, 'bg-indigo-500', sporpuanImpact?.bonuses.davranisBonus)}
                              </div>
                            </div>

                            {/* Badges - Kazanılan Rozetler */}
                            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs">
                              <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
                                    <SportsFlyIcon className="w-4 h-4" />
                                  </div>
                                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Kazanılan Rozetler
                                  </h4>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                    {activeKarne.davranissal.kazanimlar.length} Rozet
                                  </span>
                                  <button
                                    onClick={() => setIsBadgeModalOpen(true)}
                                    className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer print:hidden"
                                    data-html2canvas-ignore="true"
                                    title="Sporcuya rozet ver veya düzenle"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Rozet Ver / Düzenle</span>
                                  </button>
                                </div>
                              </div>

                              {activeKarne.davranissal.kazanimlar.length === 0 ? (
                                <div className="text-center py-6 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                  <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                  <p className="text-xs font-semibold text-slate-700">Henüz rozet atanmadı</p>
                                  <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                                    Sporcunun örnek duruşunu ve kulüp içi disiplinini ödüllendirmek için rozet verebilirsiniz.
                                  </p>
                                  <button
                                    onClick={() => setIsBadgeModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer print:hidden"
                                    data-html2canvas-ignore="true"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    Rozet Kataloğundan Seç
                                  </button>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {activeKarne.davranissal.kazanimlar.map((kazanim, idx) => {
                                    const badgeMeta = getBadgeDetails(kazanim);
                                    const iconName = (badgeMeta?.ikon as any) || 'Award';
                                    const colors = badgeMeta?.renkTema || {
                                       bg: 'bg-amber-50/70',
                                       border: 'border-amber-200/80',
                                       badgeBg: 'bg-amber-100',
                                       badgeText: 'text-amber-800',
                                       iconBg: 'bg-amber-100',
                                       iconColor: 'text-amber-700',
                                       activeBorder: 'border-amber-400'
                                    };

                                    const displayBaslik = kazanim.baslik.toLowerCase().includes('temiz spor')
                                      ? 'Sağlıklı Yaşam & Sporcu Disiplini'
                                      : kazanim.baslik;

                                    return (
                                      <div 
                                        key={idx} 
                                        className={`p-3 rounded-xl ${colors.bg} border ${colors.border} flex items-start gap-2.5 relative group transition-all`}
                                      >
                                        <div className={`w-8 h-8 rounded-lg ${colors.iconBg} flex items-center justify-center shrink-0 ${colors.iconColor} mt-0.5 shadow-2xs`}>
                                          {renderBadgeIcon(iconName, "w-4 h-4")}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-xs font-bold text-slate-800 leading-tight">
                                              {displayBaslik}
                                            </span>
                                            {(kazanim.kategori || badgeMeta?.kategori) && (
                                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${colors.badgeBg} ${colors.badgeText}`}>
                                                {kazanim.kategori || badgeMeta?.kategori}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[11px] text-slate-600 leading-snug mt-1">
                                            {kazanim.aciklama}
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveBadge(kazanim.baslik)}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md shrink-0 cursor-pointer print:hidden"
                                          data-html2canvas-ignore="true"
                                          title="Rozeti Geri Al / Kaldır"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Milestone Timeline */}
                          <div className="lg:col-span-6 flex flex-col">
                            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex-1 flex flex-col">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-indigo-500" />
                                  Dönem Gözlemleri &amp; Süreç Takibi
                                </h4>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {activeKarne.davranissal.surecTakibi.length} Aşama
                                </span>
                              </div>

                              <div className="space-y-4 relative flex-1 before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-0.5 before:bg-indigo-100">
                                {activeKarne.davranissal.surecTakibi.map((adim, index) => {
                                  const statusConfig = {
                                    'Örnek Davranış': {
                                      dot: 'bg-emerald-500 ring-4 ring-emerald-100',
                                      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    },
                                    'Hedefe Ulaştı': {
                                      dot: 'bg-blue-500 ring-4 ring-blue-100',
                                      badge: 'bg-blue-50 text-blue-700 border-blue-200'
                                    },
                                    'Gelişiyor': {
                                      dot: 'bg-amber-500 ring-4 ring-amber-100',
                                      badge: 'bg-amber-50 text-amber-700 border-amber-200'
                                    }
                                  }[adim.durum] || {
                                    dot: 'bg-slate-400 ring-4 ring-slate-100',
                                    badge: 'bg-slate-100 text-slate-700 border-slate-200'
                                  };

                                  return (
                                    <div key={index} className="relative z-10 flex items-start gap-4">
                                      <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${statusConfig.dot}`} />
                                      <div className="flex-1 bg-slate-50/90 hover:bg-slate-50 transition-colors rounded-xl p-3.5 border border-slate-200/70">
                                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                                          <span className="text-xs font-bold text-slate-800">{adim.donem}</span>
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusConfig.badge}`}>
                                            {adim.durum}
                                          </span>
                                        </div>
                                        <div className="text-xs font-semibold text-indigo-700 mb-1">
                                          Odak: {adim.odakKonusu}
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                          {adim.gozlem}
                                        </p>
                                        <div className="text-[10px] text-slate-400 mt-2 font-medium">
                                          Tarih: {new Date(adim.tarih).toLocaleDateString('tr-TR')}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {renderPageFooterBadge(4)}
                </div>
              )}

              {/* ======================================================== */}
              {/* SAYFA 5: ZİHİNSEL GELİŞİM, SAĞLIKLI YAŞAM, METODOLOJİ & İMZALAR */}
              {/* ======================================================== */}
              {(activeReportPage === 'all' || activeReportPage === 5) && (
                <div
                  id="sporcu-karne-sayfa-5"
                  className="a4-print-page bg-white relative overflow-hidden flex flex-col justify-between mb-8 print:mb-0 shadow-xs print:shadow-none border border-slate-200 print:border-none rounded-2xl print:rounded-none"
                >
                  <div>
                    {renderPageHeaderBadge(5)}

                    {/* Sub-header banner */}
                    {isSimplifiedView ? (
                      <div className="px-6 md:px-8 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
                        <div>
                          <div className="text-[10px] font-sans tabular-nums font-bold tracking-widest text-amber-600 uppercase">
                            ZİHİNSEL DİSİPLİN, ALIŞKANLIKLAR &amp; AKADEMİ ONAYI
                          </div>
                          <div className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-tight">
                            Sayfa 5: Gelişim Alanları, Metodoloji &amp; Resmi Onay
                          </div>
                        </div>
                        <div className="text-right text-xs font-sans tabular-nums text-slate-500">
                          Zihinsel: <span className="text-amber-600 font-bold">{activeKarne.zihinsel.ortalama}/10</span> · Genel Not: <span className="text-sky-600 font-bold">{genelOrtalama}/10</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900 text-white px-6 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-sans tabular-nums font-bold tracking-widest text-amber-400 uppercase">
                            ZİHİNSEL DİSİPLİN, ALIŞKANLIKLAR &amp; AKADEMİ ONAYI
                          </div>
                          <div className="text-sm sm:text-base font-extrabold tracking-tight">
                            Sayfa 5: Gelişim Alanları, Metodoloji &amp; Resmi Onay
                          </div>
                        </div>
                        <div className="text-right text-xs font-sans tabular-nums text-slate-300">
                          Zihinsel: <span className="text-amber-400 font-bold">{activeKarne.zihinsel.ortalama}/10</span> · Genel Not: <span className="text-sky-400 font-bold">{genelOrtalama}/10</span>
                        </div>
                      </div>
                    )}

                    <div className="p-6 md:p-8 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Mental Skills */}
                        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                              <Brain className="w-4 h-4 text-amber-600" />
                              Zihinsel Beceriler &amp; Odaklanma
                            </h3>
                            <div className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-md text-xs">
                              {activeKarne.zihinsel.ortalama} / 10
                            </div>
                          </div>
                          <div>
                            {activeKarne.zihinsel.disiplin !== undefined && renderProgressBar('Antrenman Disiplini', activeKarne.zihinsel.disiplin, 'bg-amber-500', sporpuanImpact?.bonuses.zihinselBonus)}
                            {activeKarne.zihinsel.ozguven !== undefined && renderProgressBar('Özgüven', activeKarne.zihinsel.ozguven, 'bg-amber-500', sporpuanImpact?.bonuses.zihinselBonus)}
                            {activeKarne.zihinsel.takimUyumu !== undefined && renderProgressBar('Takım Uyumu', activeKarne.zihinsel.takimUyumu, 'bg-amber-500', sporpuanImpact?.bonuses.zihinselBonus)}
                            {activeKarne.zihinsel.liderlik !== undefined && renderProgressBar('Liderlik', activeKarne.zihinsel.liderlik, 'bg-amber-500', sporpuanImpact?.bonuses.zihinselBonus)}
                          </div>
                        </div>

                        {/* Focus Areas & Attitude */}
                        <div className="space-y-4">
                          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4">
                            <h4 className="font-bold text-rose-900 mb-2 text-xs uppercase tracking-wider flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-rose-600" />
                              Öncelikli Gelişim Alanları
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {activeKarne.gelisimAlanlari.map((alan, index) => (
                                <span key={index} className="bg-white border border-rose-200 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs">
                                  {alan}
                                </span>
                              ))}
                            </div>
                          </div>

                          {activeKarne.davranissal?.genelDegerlendirme && (
                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 flex items-start gap-2.5">
                              <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                              <div>
                                <div className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider mb-0.5">
                                  Karakter ve Tutum Değerlendirmesi
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed italic">
                                  "{activeKarne.davranissal.genelDegerlendirme}"
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sağlıklı Yaşam & Alışkanlık Takibi */}
                      {activeKarne.davranissal?.bagimlilikVeAliskanlik && (
                        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
                          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              Sağlıklı Yaşam &amp; Alışkanlık Takibi
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800">
                              {activeKarne.davranissal.bagimlilikVeAliskanlik.genelFarkindalik}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                              <div className="text-slate-600 font-bold mb-0.5 flex items-center justify-between">
                                <span>Ekran Süresi:</span>
                                <span className="text-indigo-600 font-black">{activeKarne.davranissal.bagimlilikVeAliskanlik.ekranDengesi.puan}/10</span>
                              </div>
                              <div className="text-[11px] text-slate-500">{activeKarne.davranissal.bagimlilikVeAliskanlik.ekranDengesi.seviye}</div>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                              <div className="text-slate-600 font-bold mb-0.5 flex items-center justify-between">
                                <span>Sağlıklı Yaşam:</span>
                                <span className="text-emerald-600 font-black">{activeKarne.davranissal.bagimlilikVeAliskanlik.zararliAliskanlik.puan}/10</span>
                              </div>
                              <div className="text-[11px] text-slate-500">{activeKarne.davranissal.bagimlilikVeAliskanlik.zararliAliskanlik.seviye}</div>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                              <div className="text-slate-600 font-bold mb-0.5 flex items-center justify-between">
                                <span>Uyku Düzeni:</span>
                                <span className="text-blue-600 font-black">{activeKarne.davranissal.bagimlilikVeAliskanlik.uykuVeDinlenme.puan}/10</span>
                              </div>
                              <div className="text-[11px] text-slate-500">{activeKarne.davranissal.bagimlilikVeAliskanlik.uykuVeDinlenme.seviye}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Uzman Görüşü Bölümü */}
                      <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider block border-b border-slate-200 pb-2">
                          Uzman Görüşü
                        </span>
                        <div className="text-[11px] sm:text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {activeKarne.expertComment || 'Bu sporcu için henüz uzman görüşü aktarılmamıştır. SportsFly Lab modülünden "Karne Uzman Görüşüne Aktar" butonu ile buraya veri aktarabilirsiniz.'}
                        </div>
                      </div>

                      {/* 12. Referans ve Metodoloji Bölümü */}
                      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 text-[10.5px] text-slate-500 leading-relaxed">
                        <span className="font-bold text-slate-700 uppercase tracking-wider block mb-0.5">
                          12. Referans ve Metodoloji:
                        </span>
                        Değerlendirmeler uluslararası ISAK ve Eurofit normatif referansları kullanılarak gerçekleştirilmiştir. Beden sağlığı, motor kabiliyetler ve gelişim takibi Rota Performans analiz sistemi ile doğrulanmıştır.
                      </div>

                      {/* Footer Signature Area */}
                      <div className="bg-slate-50/90 rounded-xl p-4 border border-slate-200 flex flex-col gap-4 pt-5 pb-3">
                        <div className="flex items-center justify-around">
                          <div className="text-center">
                            <div className="w-36 h-px bg-slate-400 mb-2 mx-auto"></div>
                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Değerlendiren Antrenör</div>
                            <div className="text-xs text-slate-900 font-bold mt-0.5">{activeKarne.antrenor}</div>
                          </div>
                          <div className="text-center">
                            <div className="w-36 h-px bg-slate-400 mb-2 mx-auto"></div>
                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Veli / Sporcu İmza</div>
                            <div className="text-xs text-slate-700 font-medium mt-0.5">{activeKarne.veliAdSoyad || 'Kayıtlı Veli'}</div>
                          </div>
                        </div>

                        {/* Rota Performans Corporate Text */}
                        <div className="pt-3 border-t border-slate-200/60 text-[9.5px] sm:text-[10px] leading-relaxed text-slate-500 font-semibold italic text-center flex flex-wrap items-center justify-center gap-1.5">
                          <span>Bu karnedeki teknik analizler ve ölçümler</span>
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs not-italic uppercase tracking-wider">
                            ROTA PERFORMANS
                          </span>
                          <span>tarafından gelişim takibi amacıyla hassasiyetle yapılmıştır; kesinlikle tıbbi tanı, teşhis, tedavi veya bir hekim raporu niteliği taşımamaktadır.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {renderPageFooterBadge(5)}
                </div>
              )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center min-h-[400px]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Award className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Sporcu Karnesi Seçin</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Detaylı analiz, eğitmen notları ve puanlamaları görüntülemek için sol taraftaki listeden bir sporcu seçiniz.
            </p>
          </div>
        )}
      </div>

      {/* Add Observation Modal */}
      {isAddObservationOpen && selectedKarne && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    Yeni Davranışsal Gözlem Ekle
                  </h3>
                  <p className="text-xs text-slate-500">Sporcu: {selectedKarne.adSoyad}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddObservationOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddObservation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Dönem / Periyot Bilgisi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 4. Dönem (Aralık)"
                  value={newObservation.donem}
                  onChange={e => setNewObservation({ ...newObservation, donem: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Odak / Gelişim Alanı <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Maç Sonu Centilmenliği & Hakem Saygısı"
                  value={newObservation.odakKonusu}
                  onChange={e => setNewObservation({ ...newObservation, odakKonusu: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gözlemlenen Durum Seviyesi <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newObservation.durum}
                  onChange={e => setNewObservation({ ...newObservation, durum: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="Gelişiyor">Gelişiyor (Geliştirilmeye Açık)</option>
                  <option value="Hedefe Ulaştı">Hedefe Ulaştı (Beklenen Düzey)</option>
                  <option value="Örnek Davranış">Örnek Davranış (Rol Model)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Eğitmen Gözlem & Süreç Notu <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Sporcunun tutum, sportmenlik, sorumluluk veya antrenman ciddiyeti hakkındaki değerlendirmeniz..."
                  value={newObservation.gozlem}
                  onChange={e => setNewObservation({ ...newObservation, gozlem: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddObservationOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Gözlemi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Badge Awarding & Management Modal for Trainers */}
      {isBadgeModalOpen && selectedKarne && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-base">
                      Davranışsal Rozet Kataloğu & Rozet Verme
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Antrenör Paneli
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sporcu: <span className="font-semibold text-slate-700">{selectedKarne.adSoyad}</span> ({selectedKarne.brans} - {selectedKarne.grup})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBadgeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info / Status Banner */}
            <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <SportsFlyIcon className="w-4 h-4 shrink-0" />
                <span className="text-xs text-slate-600">
                  Sporcunun örnek davranışlarını kurumsal rozetlerle ödüllendirebilir veya gerektiğinde geri alabilirsiniz.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-700">Aktif Rozet:</span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {selectedKarne.davranissal.kazanimlar.length} / {KURUMSAL_ROZETLER.length}
                </span>
              </div>
            </div>

            {/* Search & Action Toolbar */}
            <div className="mt-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rozet adı, kategori veya açıklama ara..."
                  value={badgeSearchQuery}
                  onChange={e => setBadgeSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
                {badgeSearchQuery && (
                  <button
                    onClick={() => setBadgeSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsCustomBadgeOpen(!isCustomBadgeOpen)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer shrink-0 ${
                  isCustomBadgeOpen 
                    ? 'bg-amber-50 border-amber-300 text-amber-800' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                <span>Özel Rozet Tanımla</span>
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
              {KURUMSAL_ROZET_KATEGORILERI.map(cat => (
                <button
                  key={cat}
                  onClick={() => setBadgeCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    badgeCategoryFilter === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Custom Badge Collapsible Form */}
            {isCustomBadgeOpen && (
              <form onSubmit={handleAddCustomBadge} className="mt-3 p-4 rounded-xl bg-amber-50/50 border border-amber-200 shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <SportsFlyIcon className="w-3.5 h-3.5" />
                    Kulübe / Maça Özel Yeni Rozet Tanımla
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsCustomBadgeOpen(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Rozet Başlığı *</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Turnuva Centilmeni"
                      value={customBadge.baslik}
                      onChange={e => setCustomBadge({ ...customBadge, baslik: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kategori</label>
                    <select
                      value={customBadge.kategori}
                      onChange={e => setCustomBadge({ ...customBadge, kategori: e.target.value as any })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Karakter & Etik">Karakter & Etik</option>
                      <option value="Disiplin & Sorumluluk">Disiplin & Sorumluluk</option>
                      <option value="Sağlık & Yaşam Tarzı">Sağlık & Yaşam Tarzı</option>
                      <option value="Liderlik & Sosyal">Liderlik & Sosyal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Önem Seviyesi</label>
                    <select
                      value={customBadge.onemDerecesi}
                      onChange={e => setCustomBadge({ ...customBadge, onemDerecesi: e.target.value as any })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Standart">Standart</option>
                      <option value="Özel Başarı">Özel Başarı</option>
                      <option value="Üstün Karakter">Üstün Karakter</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kazanım Açıklaması *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sporcunun bu rozeti hak eden tutumunu kısaca özetleyin..."
                    value={customBadge.aciklama}
                    onChange={e => setCustomBadge({ ...customBadge, aciklama: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCustomBadgeOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors shadow-2xs cursor-pointer"
                  >
                    Rozeti Ekle & Sporcuya Ver
                  </button>
                </div>
              </form>
            )}

            {/* Badge Catalog Grid (Scrollable) */}
            <div className="mt-3.5 flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-[260px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {KURUMSAL_ROZETLER
                  .filter(rozet => {
                    const matchesCat = badgeCategoryFilter === 'Tümü' || rozet.kategori === badgeCategoryFilter;
                    const matchesQuery = 
                      rozet.baslik.toLowerCase().includes(badgeSearchQuery.toLowerCase()) ||
                      rozet.aciklama.toLowerCase().includes(badgeSearchQuery.toLowerCase()) ||
                      rozet.kategori.toLowerCase().includes(badgeSearchQuery.toLowerCase());
                    return matchesCat && matchesQuery;
                  })
                  .map(rozet => {
                    const isEarned = selectedKarne.davranissal.kazanimlar.some(
                      k => k.rozetId === rozet.id || k.baslik.toLowerCase() === rozet.baslik.toLowerCase()
                    );
                    const colors = rozet.renkTema;

                    return (
                      <div
                        key={rozet.id}
                        className={`rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                          isEarned 
                            ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-200/80 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-9 h-9 rounded-xl ${colors.iconBg} ${colors.iconColor} flex items-center justify-center shrink-0 shadow-2xs`}>
                                {renderBadgeIcon(rozet.ikon, "w-4 h-4")}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 leading-tight">
                                  {rozet.baslik}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${colors.badgeBg} ${colors.badgeText}`}>
                                    {rozet.kategori}
                                  </span>
                                  <span className="text-[9px] font-medium text-slate-400 flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />
                                    {rozet.onemDerecesi}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {isEarned && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                <Check className="w-3 h-3 text-emerald-600" />
                                Verildi
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-600 leading-relaxed mt-2 mb-3">
                            {rozet.aciklama}
                          </p>
                        </div>

                        {/* Card Footer Action */}
                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 italic">
                            {isEarned ? 'Sporcu karnesinde aktif' : 'Henüz verilmedi'}
                          </span>

                          {isEarned ? (
                            <button
                              type="button"
                              onClick={() => handleToggleBadge(rozet)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                            >
                              Geri Al
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleBadge(rozet)}
                              className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Rozeti Ver</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500 hidden sm:block">
                Toplam <span className="font-semibold text-slate-700">{selectedKarne.davranissal.kazanimlar.length}</span> rozet aktif.
              </div>
              <button
                type="button"
                onClick={() => setIsBadgeModalOpen(false)}
                className="w-full sm:w-auto px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Kapat & Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Veliye Karne Gönderim & Bildirim Merkezi Modal (WhatsApp / SMS) */}
      {selectedKarne && (
        <VeliKarneGonderimModal
          isOpen={isVeliModalOpen}
          onClose={() => setIsVeliModalOpen(false)}
          selectedKarne={selectedKarne}
          onUpdateKarne={(updated) => {
            updateAndSaveKarneler((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
          }}
          onDownloadPDF={handleDownloadPDF}
          isDownloadingPDF={isDownloading}
        />
      )}

      {/* Hızlı SporPuan Verme & Dinamik Karne Denge Modalı */}
      {selectedKarne && isQuickPointModalOpen && (
        <QuickPointAwardModal
          isOpen={isQuickPointModalOpen}
          onClose={() => setIsQuickPointModalOpen(false)}
          onSuccess={() => {
            setSporpuanRefreshKey(k => k + 1);
            setKarneler(getStoredKarneler());
            showToast(`✓ ${selectedKarne.adSoyad} için Sporpuan başarıyla verildi ve karnesine yansıtıldı!`);
          }}
          initialAthleteId={selectedKarne.sporcuId}
          initialBranch={selectedKarne.brans}
          initialGroup={selectedKarne.grup}
        />
      )}

      {/* Global Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
