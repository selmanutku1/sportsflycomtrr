import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  CreditCard,
  ClipboardCheck,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Award,
  AlertCircle,
  FileCheck,
  Bell,
  LifeBuoy,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  Send,
  MessageSquare,
  QrCode,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Lightbulb,
  X,
} from 'lucide-react';
import { NavPage } from '../../../types';
import { SportsFlyIcon } from '../../SportsFlyLogo';
import { ActiveAthletesQuickList } from './ActiveAthletesQuickList';
import { UpcomingEventsNotificationPanel } from '../../dashboard/UpcomingEventsNotificationPanel';
import { getStoredUserProfile } from '../../../data/userProfile';
import { getActiveSessionPlan, isPageAllowedForPlan, isSuperAdminUser } from '../../../data/packagePermissions';
import { getStoredSubeler, getActiveSubeId, setActiveSubeId } from '../../../data/subeData';
import { getStoredSubeSporcular, getStoredSubeEgitmenler, getStoredSubeGelirGider } from '../../../data/subeOzetData';
import { UpdatesModal } from '../../modals/UpdatesModal';
import { getRoleBannerText } from '../../../data/updatesData';

interface ClubManagerHomeViewProps {
  onNavigate?: (page: NavPage) => void;
}

export const ClubManagerHomeView: React.FC<ClubManagerHomeViewProps> = ({ onNavigate }) => {
  const [userProfile] = useState(() => getStoredUserProfile());
  const [activePlan] = useState(() => getActiveSessionPlan());
  const [showHint, setShowHint] = useState(true);
  const [isUpdatesModalOpen, setIsUpdatesModalOpen] = useState(false);
  const roleBanner = getRoleBannerText(userProfile?.role);

  // Real-time clock for top bar
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('');

  // Multi-Branch awareness
  const [activeBranchId, setActiveBranchId] = useState(() => getActiveSubeId());
  const [subeler, setSubeler] = useState(() => getStoredSubeler());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDateFormatted(
        now.toLocaleDateString('tr-TR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    const handleActiveBranchChange = () => {
      setActiveBranchId(getActiveSubeId());
    };
    const handleSubelerChange = () => {
      setSubeler(getStoredSubeler());
    };

    window.addEventListener('sportsfly_active_sube_changed', handleActiveBranchChange);
    window.addEventListener('sportsfly_subeler_updated', handleSubelerChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener('sportsfly_active_sube_changed', handleActiveBranchChange);
      window.removeEventListener('sportsfly_subeler_updated', handleSubelerChange);
    };
  }, []);

  const isSuperAdmin = isSuperAdminUser(userProfile?.role);
  
  // SECURE VISIBILITY SEPARATION:
  // If Süper Admin: resolve to currently active branch selection (which can be 'all' or specific branch).
  // If Kulüp Yöneticisi: strictly resolve to their assigned branch (sube-kadikoy), preventing any cross-branch data leak.
  const resolvedBranchId = isSuperAdmin ? activeBranchId : 'sube-kadikoy';

  // Dynamic statistics calculations
  const displaySubeObj = subeler.find(s => s.id === resolvedBranchId);
  const displaySubeName = resolvedBranchId === 'all'
    ? 'Tüm Şubeler Konsolide Genel Özet'
    : (displaySubeObj?.ad || 'Kadıköy Merkez Spor Tesisi');

  const displayActiveCount = resolvedBranchId === 'all'
    ? subeler.reduce((acc, s) => acc + s.sporcuSayisi, 0)
    : (displaySubeObj?.sporcuSayisi || 42);

  const displayTotalCount = resolvedBranchId === 'all'
    ? Math.round(subeler.reduce((acc, s) => acc + s.sporcuSayisi, 0) * 1.15)
    : Math.round((displaySubeObj?.sporcuSayisi || 42) * 1.15);

  const displayRevenue = resolvedBranchId === 'all'
    ? subeler.reduce((acc, s) => acc + (s.aylikCiro || 0), 0)
    : (displaySubeObj?.aylikCiro || 185000);

  const displayTrainingsCount = resolvedBranchId === 'all'
    ? 32
    : (resolvedBranchId === 'sube-atasehir' ? 6 : resolvedBranchId === 'sube-besiktas' ? 7 : resolvedBranchId === 'sube-cankaya' ? 4 : 8);

  const displayPreRegistrationCount = resolvedBranchId === 'all'
    ? 36
    : (resolvedBranchId === 'sube-atasehir' ? 8 : resolvedBranchId === 'sube-besiktas' ? 10 : resolvedBranchId === 'sube-cankaya' ? 6 : 12);

  // Today's Scheduled Trainings Mock (Branched & Filtered)
  const rawTrainings = [
    {
      id: 't-1',
      time: '16:00 - 17:15',
      branch: 'Basketbol',
      groupName: 'U14 Erkek Gelişim A',
      coach: 'Ali Özcan',
      facility: 'Merkez Kampüs Salon 1',
      athleteCount: 18,
      status: 'Tamamlandı',
      attendanceRate: '%94 (17/18)',
      subeId: 'sube-kadikoy',
      subeName: 'Kadıköy Merkez',
    },
    {
      id: 't-2',
      time: '17:30 - 18:45',
      branch: 'Voleybol',
      groupName: 'Midi Kız Takımı A',
      coach: 'Berkan Saraç',
      facility: 'Batı Tesisleri Salon B',
      athleteCount: 14,
      status: 'Devam Ediyor',
      attendanceRate: '%100 (14/14)',
      subeId: 'sube-atasehir',
      subeName: 'Ataşehir Doğu',
    },
    {
      id: 't-3',
      time: '18:00 - 19:15',
      branch: 'Yüzme',
      groupName: 'Yıldız Yüzme Grubu',
      coach: 'Zeynep Akın',
      facility: 'Yarı Olimpik Havuz',
      athleteCount: 12,
      status: 'Yaklaşıyor',
      attendanceRate: 'Bekleniyor',
      subeId: 'sube-besiktas',
      subeName: 'Beşiktaş Akademi',
    },
    {
      id: 't-4',
      time: '19:30 - 20:45',
      branch: 'Basketbol',
      groupName: 'Genç Takım (U18)',
      coach: 'Murat Kara',
      facility: 'Merkez Kampüs Salon 1',
      athleteCount: 16,
      status: 'Yaklaşıyor',
      attendanceRate: 'Bekleniyor',
      subeId: 'sube-kadikoy',
      subeName: 'Kadıköy Merkez',
    },
    {
      id: 't-5',
      time: '15:00 - 16:15',
      branch: 'Cimnastik',
      groupName: 'Minikler Seviye 1',
      coach: 'Selin Şen',
      facility: 'Çankaya Salon A',
      athleteCount: 10,
      status: 'Tamamlandı',
      attendanceRate: '%100 (10/10)',
      subeId: 'sube-cankaya',
      subeName: 'Ankara Çankaya',
    },
    {
      id: 't-6',
      time: '18:30 - 19:45',
      branch: 'Futbol',
      groupName: 'U12 Futbol Akademi',
      coach: 'Hakan Çelik',
      facility: 'Beşiktaş Halı Saha',
      athleteCount: 15,
      status: 'Yaklaşıyor',
      attendanceRate: 'Bekleniyor',
      subeId: 'sube-besiktas',
      subeName: 'Beşiktaş Akademi',
    },
  ];

  const todayTrainings = resolvedBranchId === 'all'
    ? rawTrainings
    : rawTrainings.filter(t => t.subeId === resolvedBranchId);

  const isSözlesmelerAllowed = isSuperAdmin && isPageAllowedForPlan('kullanici-sozlesmeleri', activePlan, userProfile?.role);

  // Dynamic Urgent Pending Tasks based on branch visibility
  const pendingTasks = [
    {
      id: 'p-1',
      title: 'Eylül Ayı Geciken Aidatlar',
      desc: resolvedBranchId === 'all'
        ? '9 sporcunun aidatı ödeme vadesini geçti.'
        : '4 sporcunun aidatı ödeme vadesini geçti.',
      actionText: 'Listele',
      page: 'odeme-plani-kontrol' as NavPage,
      badge: resolvedBranchId === 'all' ? '9 Sporcu' : '4 Sporcu',
      type: 'warning',
    },
    {
      id: 'p-2',
      title: 'Onay Bekleyen Veli Belgeleri',
      desc: resolvedBranchId === 'all'
        ? '7 yeni sporcu velisi KVKK ve sağlık formunu dijital imzaladı.'
        : '3 yeni sporcu velisi KVKK ve sağlık formunu dijital imzaladı.',
      actionText: 'Onayla',
      page: 'kullanici-sozlesmeleri' as NavPage,
      badge: resolvedBranchId === 'all' ? '7 Evrak' : '3 Evrak',
      type: 'info',
    },
    {
      id: 'p-3',
      title: 'Yeni Web Ön Kayıt Başvuruları',
      desc: resolvedBranchId === 'all'
        ? '8 yeni aday deneme antrenmanı için başvurdu.'
        : '2 yeni aday deneme antrenmanı için başvurdu.',
      actionText: 'İncele',
      page: 'on-kayit' as NavPage,
      badge: resolvedBranchId === 'all' ? '8 Başvuru' : '2 Başvuru',
      type: 'success',
    },
  ].filter(t => t.page !== 'kullanici-sozlesmeleri' || isSözlesmelerAllowed);

  return (
    <div className="space-y-6">
      {/* İpucu / Yeni Özellikleri Keşfedin Kartı (Tıklanabilir & Kullanıcı Rolüne Özel) */}
      {showHint && (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-50/95 via-indigo-50/80 to-blue-50/95 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-4 sm:p-4.5 shadow-xs transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div
              onClick={() => setIsUpdatesModalOpen(true)}
              className="flex items-start gap-3.5 flex-1 cursor-pointer group"
            >
              <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition-transform shrink-0 mt-0.5 flex items-center justify-center">
                <SportsFlyIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-blue-950 dark:text-blue-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    <span>{roleBanner.title}</span>
                  </h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-200/70 dark:bg-blue-900 text-blue-900 dark:text-blue-200 border border-blue-300/60 font-mono">
                    {roleBanner.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-blue-800/90 dark:text-blue-300/90 mt-1 leading-relaxed">
                  {roleBanner.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                id="btn-open-updates-modal"
                onClick={() => setIsUpdatesModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Yenilikleri Keşfet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowHint(false)}
                className="p-2 rounded-xl text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 1. Header Bar: Club Info & Live Time */}
      <div className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/60">
                Kulüp Yönetim Masası
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1 flex flex-wrap items-center gap-2">
              <span>{displaySubeName}</span>
              {resolvedBranchId === 'all' && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
                  Konsolide Özet
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kulübünüzün tüm sporcu havuzu, antrenman yoklamaları, aidat takibi ve operasyonel akışı.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-slate-50 dark:bg-[#162238] px-4 py-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                {currentTime || '12:00'}
              </div>
              <div className="text-[10px] text-slate-400">
                {currentDateFormatted}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top-level Bento Grid: Branch KPIs (Left) & Simplified Quick Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Branch KPIs (9 cols) */}
        <div className="lg:col-span-9 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Şube Aktif Sporcu &amp; Aylık Gelir Durumları
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subeler.map((sube) => {
              const isActive = resolvedBranchId === sube.id || (resolvedBranchId === 'all' && isSuperAdmin);
              const isOwnBranch = sube.id === 'sube-kadikoy';
              const canClick = isSuperAdmin;

              return (
                <div
                  key={sube.id}
                  onClick={() => {
                    if (canClick) {
                      setActiveSubeId(sube.id);
                      window.dispatchEvent(new CustomEvent('sportsfly_active_sube_changed', { detail: sube.id }));
                    }
                  }}
                  className={`relative rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between min-h-[110px] ${
                    isActive
                      ? 'border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-500/15 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 dark:from-blue-950/40 dark:via-[#111c2e] dark:to-blue-950/20'
                      : 'border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/70 hover:bg-white dark:bg-[#152033]/60 dark:hover:bg-[#152033]'
                  } ${canClick ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'}`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {sube.sehir} &bull; {sube.ilce}
                      </span>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {sube.ad.replace(' Spor Tesisi', '').replace(' Şubesi', '').replace(' Tesisleri', '')}
                      </h3>
                    </div>
                    
                    {isActive ? (
                      <span className="shrink-0 flex items-center gap-1 text-[9px] font-extrabold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-900/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        Aktif
                      </span>
                    ) : isOwnBranch && !isSuperAdmin ? (
                      <span className="shrink-0 text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-900/40">
                        Sizin
                      </span>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2.5 mt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                    <div>
                      <div className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">Sporcu</div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        {sube.sporcuSayisi}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">Aylık Gelir</div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                        ₺{sube.aylikCiro.toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Simplified Quick Actions (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Hızlı İşlemler
          </h2>
          
          <div className="bg-slate-50/70 dark:bg-[#152033]/60 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs h-[142px] flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-2 h-full">
              <button
                onClick={() => onNavigate?.('sporcular')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/80 hover:bg-blue-50 dark:bg-[#111c2e]/80 dark:hover:bg-blue-950/40 border border-slate-200/70 hover:border-blue-200 dark:border-slate-700/60 text-blue-700 dark:text-blue-300 transition-all cursor-pointer text-center group shadow-2xs"
              >
                <Plus className="w-4 h-4 mb-1 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">Sporcu Ekle</span>
              </button>
              
              <button
                onClick={() => onNavigate?.('yoklama')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/80 hover:bg-emerald-50 dark:bg-[#111c2e]/80 dark:hover:bg-emerald-950/40 border border-slate-200/70 hover:border-emerald-200 dark:border-slate-700/60 text-emerald-700 dark:text-emerald-300 transition-all cursor-pointer text-center group shadow-2xs"
              >
                <ClipboardCheck className="w-4 h-4 mb-1 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">Yoklama Al</span>
              </button>
              
              <button
                onClick={() => onNavigate?.('on-muhasebe')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/80 hover:bg-amber-50 dark:bg-[#111c2e]/80 dark:hover:bg-amber-950/40 border border-slate-200/70 hover:border-amber-200 dark:border-slate-700/60 text-amber-700 dark:text-amber-300 transition-all cursor-pointer text-center group shadow-2xs"
              >
                <CreditCard className="w-4 h-4 mb-1 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">Aidat Al</span>
              </button>
              
              <button
                onClick={() => onNavigate?.('on-kayit')}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/80 hover:bg-purple-50 dark:bg-[#111c2e]/80 dark:hover:bg-purple-950/40 border border-slate-200/70 hover:border-purple-200 dark:border-slate-700/60 text-purple-700 dark:text-purple-300 transition-all cursor-pointer text-center group shadow-2xs"
              >
                <UserCheck className="w-4 h-4 mb-1 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">Ön Kayıtlar</span>
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* 3. Sade ve Net Özet KPI Kartları (4 Temel Sütun - Farklı Şeffaf Renk Tonlarıyla Zenginleştirildi) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kart 1: Mevcut Aktif Sporcu (Şeffaf Mavi / Gökyüzü Tonu) */}
        <div
          onClick={() => onNavigate?.('sporcular')}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-white/95 to-sky-50/40 dark:from-blue-950/30 dark:via-[#111c2e] dark:to-sky-950/15 border border-blue-200/80 dark:border-blue-900/50 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mevcut Aktif Sporcu
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {displayActiveCount}
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
              Aktif Sporcu
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-blue-100/80 dark:border-blue-900/40">
            <span>Toplam: {displayTotalCount} Kayıtlı</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">Listele &gt;</span>
          </div>
        </div>

        {/* Kart 2: Bugünkü Antrenman Seansları (Şeffaf Zümrüt / Yeşil Tonu) */}
        <div
          onClick={() => onNavigate?.('antrenman-takvimi')}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white/95 to-teal-50/40 dark:from-emerald-950/30 dark:via-[#111c2e] dark:to-teal-950/15 border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-700 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bugünkü Antrenmanlar
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {displayTrainingsCount} Seans
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
              %94 Katılım
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-emerald-100/80 dark:border-emerald-900/40">
            <span>{Math.max(4, Math.round(displayTrainingsCount * 0.7))} Eğitmen Sahada</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline">Takvim &gt;</span>
          </div>
        </div>

        {/* Kart 3: Aylık Aidat Durumu (Şeffaf Kehribar / Amber Tonu) */}
        <div
          onClick={() => onNavigate?.('on-muhasebe')}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white/95 to-orange-50/40 dark:from-amber-950/30 dark:via-[#111c2e] dark:to-orange-950/15 border border-amber-200/80 dark:border-amber-900/50 shadow-xs hover:border-amber-400 dark:hover:border-amber-700 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {resolvedBranchId === 'all' ? 'Aylık Konsolide Ciro' : 'Aylık Şube Cirosu'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100/80 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              ₺{displayRevenue.toLocaleString('tr-TR')}
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
              %88
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-amber-100/80 dark:border-amber-900/40">
            <span>Bekleyen: ₺{Math.round(displayRevenue * 0.12).toLocaleString('tr-TR')}</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold group-hover:underline">Muhasebe &gt;</span>
          </div>
        </div>

        {/* Kart 4: Ön Kayıt & Deneme (Şeffaf Mor / Lila Tonu) */}
        <div
          onClick={() => onNavigate?.('on-kayit')}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 via-white/95 to-fuchsia-50/40 dark:from-purple-950/30 dark:via-[#111c2e] dark:to-fuchsia-950/15 border border-purple-200/80 dark:border-purple-900/50 shadow-xs hover:border-purple-400 dark:hover:border-purple-700 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ön Kayıt &amp; Deneme
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100/80 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {displayPreRegistrationCount} Aday
            </span>
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100/60 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
              {Math.max(2, Math.round(displayPreRegistrationCount * 0.3))} Görüşülecek
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-purple-100/80 dark:border-purple-900/40">
            <span>Deneme seansları hazır</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold group-hover:underline">İncele &gt;</span>
          </div>
        </div>
      </div>

      {/* 4. 🔔 BİLDİRİM MERKEZİ: YAKLAŞAN ANTRENMANLAR & SÖZLEŞME YENİLEME TAKVİMİ */}
      <UpcomingEventsNotificationPanel
        onNavigate={onNavigate}
        branchFilter={resolvedBranchId}
        defaultTab="all"
      />

      {/* 5. ⭐ MEVCUT AKTİF SPORCULAR LİSTESİ (SADE, NET, DOĞRUDAN LİSTE) */}
      <ActiveAthletesQuickList onNavigate={onNavigate} resolvedBranchId={resolvedBranchId} />

      {/* 6. Alt İki Sütun: Günün Antrenman Programı & Bekleyen Hatırlatmalar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sol Kolon: Günün Antrenman Seansları */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Bugünkü Antrenman Akışı &amp; Seanslar
              </h3>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('antrenman-takvimi')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Tüm Takvim</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {todayTrainings.map((session) => (
              <div
                key={session.id}
                className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#162238]/60 border border-slate-200/70 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-mono text-xs font-bold shrink-0">
                    {session.time}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {session.groupName}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {session.branch}
                      </span>
                      {resolvedBranchId === 'all' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50">
                          {session.subeName}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {session.facility} &bull; Antrenör: <strong className="text-slate-700 dark:text-slate-300">{session.coach}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        session.status === 'Tamamlandı'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : session.status === 'Devam Ediyor'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {session.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {session.attendanceRate}
                    </span>
                  </div>

                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('yoklama')}
                      className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Yoklama
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ Kolon: Bekleyen İşlemler & Hatırlatmalar */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Bekleyen İşlemler &amp; Aksiyonlar
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
              {pendingTasks.length} Madde
            </span>
          </div>

          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#162238]/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {task.title}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                      {task.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {task.desc}
                  </p>
                </div>

                {onNavigate && (
                  <button
                    onClick={() => onNavigate(task.page)}
                    className="px-2.5 py-1.5 bg-white dark:bg-[#111c2e] hover:bg-blue-50 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    {task.actionText}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Destek Kutusu */}
          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <LifeBuoy className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200 block">
                  Yardım &amp; Destek Masası
                </span>
                <span className="text-[11px] text-blue-700 dark:text-blue-400">
                  SportsFly teknik ekibine hızlı talep iletin
                </span>
              </div>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('destek')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Destek &gt;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sistem Güncellemeleri ve Yenilikler Modal */}
      <UpdatesModal
        isOpen={isUpdatesModalOpen}
        onClose={() => setIsUpdatesModalOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
