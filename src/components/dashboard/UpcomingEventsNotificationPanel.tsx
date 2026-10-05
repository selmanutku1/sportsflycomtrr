import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Send,
  Users,
  Building2,
  Search,
  Filter,
  RefreshCw,
  Bell,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Check,
  X,
  Phone,
  MessageSquare,
  DollarSign,
  Flame,
  Award,
  CalendarCheck,
  FileCheck2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { NavPage } from '../../types';
import {
  SportsFlyNotification,
  getStoredNotifications,
  saveStoredNotifications,
} from '../../data/notifications';
import { getStoredUserProfile } from '../../data/userProfile';

export interface UpcomingTrainingItem {
  id: string;
  time: string;
  dateStr: string;
  daysDiff: number; // 0 = Bugün, 1 = Yarın, 2 = 2 gün sonra
  branch: string;
  groupName: string;
  coach: string;
  facility: string;
  court: string;
  totalAthletes: number;
  confirmedCount: number;
  status: 'Yaklaşıyor' | 'Devam Ediyor' | '1 Saat Kaldı' | 'Planlandı';
  subeName: string;
  athletesPreview: string[];
}

export interface ContractRenewalItem {
  id: string;
  contractNo: string;
  athleteId: string;
  athleteName: string;
  parentName: string;
  parentPhone: string;
  branch: string;
  groupName: string;
  contractType: string;
  startDate: string;
  endDate: string;
  daysRemaining: number; // e.g. 3, 5, 12, -2 (expired)
  monthlyFee: number;
  renewalFee: number;
  status: 'Kritik Süre' | 'Süresi Doldu' | 'Yaklaşıyor' | 'Yenilendi' | 'Veliye İletildi';
  subeName: string;
  autoRenewEnabled: boolean;
}

// Default realistic upcoming trainings
const DEFAULT_UPCOMING_TRAININGS: UpcomingTrainingItem[] = [
  {
    id: 'tr-1',
    time: '16:00 - 17:30',
    dateStr: 'Bugün',
    daysDiff: 0,
    branch: 'Basketbol',
    groupName: 'U14 Erkek Altyapı A',
    coach: 'Ali Özcan',
    facility: 'Kadıköy Merkez Spor Tesisi',
    court: 'Kapalı Salon A (Parke)',
    totalAthletes: 16,
    confirmedCount: 15,
    status: '1 Saat Kaldı',
    subeName: 'Kadıköy Merkez',
    athletesPreview: ['Kaan Yıldırım', 'Emirhan Örnek', 'Caner Demir', 'Arda Güler'],
  },
  {
    id: 'tr-2',
    time: '17:45 - 19:15',
    dateStr: 'Bugün',
    daysDiff: 0,
    branch: 'Voleybol',
    groupName: 'Midi Kız Takımı (2012-2013)',
    coach: 'Berkan Saraç',
    facility: 'Ataşehir Doğu Spor Kompleksi',
    court: 'Voleybol Sahası 2',
    totalAthletes: 14,
    confirmedCount: 14,
    status: 'Yaklaşıyor',
    subeName: 'Ataşehir Doğu',
    athletesPreview: ['Zeynep Yılmaz', 'Defne Kaya', 'Ece Demir', 'Melis Aksoy'],
  },
  {
    id: 'tr-3',
    time: '18:30 - 20:00',
    dateStr: 'Bugün',
    daysDiff: 0,
    branch: 'Yüzme',
    groupName: 'Performans & İleri Seviye',
    coach: 'Zeynep Akın',
    facility: 'Batı Tesisleri Olimpik Havuz',
    court: 'Kulvar 3-4-5',
    totalAthletes: 12,
    confirmedCount: 11,
    status: 'Yaklaşıyor',
    subeName: 'Beşiktaş Akademi',
    athletesPreview: ['Alp Korkmaz', 'Sarp Şen', 'Duru Çelik', 'Ege Baran'],
  },
  {
    id: 'tr-4',
    time: '10:00 - 11:30',
    dateStr: 'Yarın',
    daysDiff: 1,
    branch: 'Futbol',
    groupName: 'U12 Futbol Akademi Gelişim',
    coach: 'Hakan Çelik',
    facility: 'Kadıköy Açık Çim Saha',
    court: 'Çim Saha 1',
    totalAthletes: 18,
    confirmedCount: 16,
    status: 'Planlandı',
    subeName: 'Kadıköy Merkez',
    athletesPreview: ['Burak Yılmaz', 'Cenk Tosun', 'Kerem Aktürkoğlu', 'Semih Kılıçsoy'],
  },
  {
    id: 'tr-5',
    time: '14:30 - 16:00',
    dateStr: 'Yarın',
    daysDiff: 1,
    branch: 'Cimnastik',
    groupName: 'Minikler Seviye 1 (4-6 Yaş)',
    coach: 'Selin Şen',
    facility: 'Ankara Çankaya Salon A',
    court: 'Minder Alanı',
    totalAthletes: 10,
    confirmedCount: 10,
    status: 'Planlandı',
    subeName: 'Ankara Çankaya',
    athletesPreview: ['Mina Kurt', 'Derin Çetin', 'Ada Soylu', 'Lina Arıkan'],
  },
];

// Default realistic contract renewals
const DEFAULT_CONTRACT_RENEWALS: ContractRenewalItem[] = [
  {
    id: 'cr-1',
    contractNo: 'SZL-2025-084',
    athleteId: 'm-1',
    athleteName: 'Kaan Yıldırım',
    parentName: 'Ahmet Yıldırım',
    parentPhone: '0532 101 20 30',
    branch: 'Basketbol',
    groupName: 'U14 Erkek Altyapı A',
    contractType: '12 Aylık Lisanslı Sporcu Sözleşmesi',
    startDate: '01.10.2025',
    endDate: '25.09.2026',
    daysRemaining: 3,
    monthlyFee: 3500,
    renewalFee: 3850,
    status: 'Kritik Süre',
    subeName: 'Kadıköy Merkez',
    autoRenewEnabled: true,
  },
  {
    id: 'cr-2',
    contractNo: 'SZL-2025-112',
    athleteId: 'm-8',
    athleteName: 'Melis Aksoy',
    parentName: 'Zeynep Aksoy',
    parentPhone: '0546 560 95 05',
    branch: 'Voleybol',
    groupName: 'Midi Kız Takımı',
    contractType: '6 Aylık Akademi Eğitim Sözleşmesi',
    startDate: '28.03.2026',
    endDate: '28.09.2026',
    daysRemaining: 6,
    monthlyFee: 3200,
    renewalFee: 3500,
    status: 'Yaklaşıyor',
    subeName: 'Ataşehir Doğu',
    autoRenewEnabled: false,
  },
  {
    id: 'cr-3',
    contractNo: 'SZL-2025-045',
    athleteId: 'm-3',
    athleteName: 'Caner Demir',
    parentName: 'Hasan Demir',
    parentPhone: '0544 210 33 44',
    branch: 'Basketbol',
    groupName: 'U14 Erkek Altyapı A',
    contractType: '12 Aylık Performans Sözleşmesi',
    startDate: '15.09.2025',
    endDate: '20.09.2026',
    daysRemaining: -2,
    monthlyFee: 3500,
    renewalFee: 3850,
    status: 'Süresi Doldu',
    subeName: 'Kadıköy Merkez',
    autoRenewEnabled: true,
  },
  {
    id: 'cr-4',
    contractNo: 'SZL-2025-164',
    athleteId: 'm-9',
    athleteName: 'Burak Yılmaz',
    parentName: 'Fikret Yılmaz',
    parentPhone: '0535 221 44 55',
    branch: 'Futbol',
    groupName: 'U12 Futbol Akademi',
    contractType: 'Sezonluk Futbol Okulu Kaydı',
    startDate: '10.10.2025',
    endDate: '05.10.2026',
    daysRemaining: 13,
    monthlyFee: 2800,
    renewalFee: 3100,
    status: 'Yaklaşıyor',
    subeName: 'Kadıköy Merkez',
    autoRenewEnabled: false,
  },
  {
    id: 'cr-5',
    contractNo: 'SZL-2025-201',
    athleteId: 'm-12',
    athleteName: 'Semih Kılıçsoy',
    parentName: 'Kemal Kılıçsoy',
    parentPhone: '0530 442 66 77',
    branch: 'Futbol',
    groupName: 'U12 Futbol Akademi',
    contractType: 'Yıllık Lisans & Tesis Kullanım',
    startDate: '15.10.2025',
    endDate: '12.10.2026',
    daysRemaining: 20,
    monthlyFee: 2800,
    renewalFee: 3100,
    status: 'Yaklaşıyor',
    subeName: 'Kadıköy Merkez',
    autoRenewEnabled: true,
  },
];

interface UpcomingEventsNotificationPanelProps {
  onNavigate?: (page: NavPage) => void;
  branchFilter?: string;
  defaultTab?: 'all' | 'trainings' | 'contracts' | 'system';
}

export const UpcomingEventsNotificationPanel: React.FC<UpcomingEventsNotificationPanelProps> = ({
  onNavigate,
  branchFilter,
  defaultTab = 'all',
}) => {
  const [userProfile] = useState(() => getStoredUserProfile());
  const [activeTab, setActiveTab] = useState<'all' | 'trainings' | 'contracts' | 'system'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  
  // Local state persisted in localStorage
  const [trainings, setTrainings] = useState<UpcomingTrainingItem[]>(() => {
    try {
      const saved = localStorage.getItem('sportsfly_upcoming_trainings_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_UPCOMING_TRAININGS;
  });

  const [contracts, setContracts] = useState<ContractRenewalItem[]>(() => {
    try {
      const saved = localStorage.getItem('sportsfly_contract_renewals_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_CONTRACT_RENEWALS;
  });

  const [notifications, setNotifications] = useState<SportsFlyNotification[]>(() =>
    getStoredNotifications(userProfile.role)
  );

  // Modals & Action Feedback
  const [selectedContractForRenew, setSelectedContractForRenew] = useState<ContractRenewalItem | null>(null);
  const [renewing, setRenewing] = useState(false);
  const [selectedTrainingForRoster, setSelectedTrainingForRoster] = useState<UpcomingTrainingItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bulkSmsSent, setBulkSmsSent] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Sync listener with global notifications
  useEffect(() => {
    const handleNotifUpdate = () => {
      setNotifications(getStoredNotifications(userProfile.role));
    };
    window.addEventListener('sportsfly_notifications_updated', handleNotifUpdate);
    return () => window.removeEventListener('sportsfly_notifications_updated', handleNotifUpdate);
  }, [userProfile.role]);

  // Filtered upcoming trainings
  const filteredTrainings = useMemo(() => {
    return trainings.filter((t) => {
      const matchesSearch =
        t.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.coach.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.branch.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch =
        selectedBranch === 'all' ||
        t.branch.toLowerCase() === selectedBranch.toLowerCase();

      const matchesSube =
        !branchFilter ||
        branchFilter === 'all' ||
        t.subeName.toLowerCase().includes(branchFilter.replace('sube-', ''));

      return matchesSearch && matchesBranch && matchesSube;
    });
  }, [trainings, searchQuery, selectedBranch, branchFilter]);

  // Filtered contract renewals
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchesSearch =
        c.athleteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contractNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.groupName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch =
        selectedBranch === 'all' ||
        c.branch.toLowerCase() === selectedBranch.toLowerCase();

      return matchesSearch && matchesBranch;
    });
  }, [contracts, searchQuery, selectedBranch]);

  // Counts for Badges
  const urgentContractsCount = useMemo(() => {
    return contracts.filter((c) => c.daysRemaining <= 7 && c.status !== 'Yenilendi').length;
  }, [contracts]);

  const upcomingTrainingsCount = useMemo(() => {
    return trainings.filter((t) => t.daysDiff <= 1).length;
  }, [trainings]);

  // Handle Contract Renewal
  const handleConfirmRenewal = (contractId: string, renewalPeriodMonths: number = 12) => {
    setRenewing(true);
    setTimeout(() => {
      const updated = contracts.map((c) => {
        if (c.id === contractId) {
          return {
            ...c,
            status: 'Yenilendi' as const,
            startDate: '22.09.2026',
            endDate: `22.09.${2026 + Math.floor(renewalPeriodMonths / 12)}`,
            daysRemaining: renewalPeriodMonths * 30,
          };
        }
        return c;
      });

      setContracts(updated);
      try {
        localStorage.setItem('sportsfly_contract_renewals_v1', JSON.stringify(updated));
      } catch (e) {}

      // Add to system notifications
      const target = contracts.find((c) => c.id === contractId);
      if (target) {
        const notif: SportsFlyNotification = {
          id: `renewal-success-${Date.now()}`,
          category: 'payment',
          title: `Sözleşme Yenilendi: ${target.athleteName}`,
          description: `${target.athleteName} sporcusunun ${target.contractType} sözleşmesi +${renewalPeriodMonths} ay başarıyla uzatıldı ve aidat planı yenilendi.`,
          time: 'Şimdi',
          isUnread: true,
          actionUrl: 'kullanici-sozlesmeleri',
        };
        const currentNotifs = getStoredNotifications(userProfile.role);
        saveStoredNotifications(userProfile.role, [notif, ...currentNotifs]);
      }

      setRenewing(false);
      setSelectedContractForRenew(null);
      showToast(`✓ ${target?.athleteName} için sözleşme başarıyla yenilendi ve veliye onay SMS'i gönderildi.`);
    }, 600);
  };

  // Handle Send Reminder to Parent
  const handleSendReminder = (contract: ContractRenewalItem) => {
    const updated = contracts.map((c) =>
      c.id === contract.id ? { ...c, status: 'Veliye İletildi' as const } : c
    );
    setContracts(updated);
    try {
      localStorage.setItem('sportsfly_contract_renewals_v1', JSON.stringify(updated));
    } catch (e) {}

    showToast(
      `📱 Veli ${contract.parentName} (${contract.parentPhone}) numarasına sözleşme yenileme hatırlatma mesajı ve dijital onay linki iletildi.`
    );
  };

  // Bulk Notification to all upcoming sessions / expiring contracts
  const handleBulkRemindAll = () => {
    setBulkSmsSent(true);
    setTimeout(() => {
      setBulkSmsSent(false);
      showToast(
        `🚀 Toplu Bildirim: Bugün ve yarın antrenmanı olan ${upcomingTrainingsCount} seansın antrenörlerine ve sözleşmesi kritik olan ${urgentContractsCount} sporcu velisine anlık bildirim/SMS iletildi!`
      );
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* 1. Header Bar with Tabs & Search */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 dark:from-[#131f33] dark:via-[#111c2e] dark:to-blue-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                  Bildirim Merkezi &amp; Yaklaşan Olaylar
                </h3>
                {urgentContractsCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    {urgentContractsCount} Kritik Yenileme
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Yaklaşan antrenman seansları, süresi dolan sporcu sözleşmeleri ve anlık sistem aksiyonları.
              </p>
            </div>
          </div>

          {/* Quick Bulk Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkRemindAll}
              disabled={bulkSmsSent}
              className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Send className={`w-3.5 h-3.5 ${bulkSmsSent ? 'animate-spin' : ''}`} />
              <span>{bulkSmsSent ? 'Gönderiliyor...' : 'Toplu Hatırlatma Gönder'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tüm Akış &amp; Özet</span>
            </button>

            <button
              onClick={() => setActiveTab('trainings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'trainings'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Yaklaşan Antrenmanlar</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20 dark:bg-slate-900/40">
                {filteredTrainings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('contracts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'contracts'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Sözleşme Yenilemeleri</span>
              {urgentContractsCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500 text-white font-bold">
                  {urgentContractsCount}
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20 dark:bg-slate-900/40">
                  {filteredContracts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'system'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Sistem Bildirimleri</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20 dark:bg-slate-900/40">
                {notifications.length}
              </span>
            </button>
          </div>

          {/* Search Filter */}
          <div className="relative w-full sm:w-60 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sporcu, grup, branş ara..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 2. Content Area based on Tab */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* TAB 1: ALL OVERVIEW (Bento style highlight of both trainings & contract renewals) */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {/* Top Alert Banner for expiring contracts */}
            {urgentContractsCount > 0 && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 dark:from-rose-950/40 dark:via-amber-950/30 dark:to-orange-950/20 border border-rose-200/90 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-200 block">
                      Yaklaşan &amp; Süresi Dolan {urgentContractsCount} Sporcu Sözleşmesi Bulunmaktadır!
                    </span>
                    <span className="text-[11px] text-rose-700 dark:text-rose-300">
                      Yeni dönem öncesi sözleşme yenileme evraklarını velilere dijital olarak gönderebilirsiniz.
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('contracts')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>Sözleşmeleri İncele</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Split Grid: Upcoming Trainings (Left) & Upcoming Contract Renewals (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left: Yaklaşan Antrenman Seansları (6 cols) */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Yaklaşan Antrenman Seansları
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveTab('trainings')}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Tümünü Gör ({trainings.length})</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {filteredTrainings.slice(0, 3).map((training) => (
                    <div
                      key={training.id}
                      className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#162238]/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 font-mono text-xs font-extrabold shrink-0 mt-0.5">
                            {training.time}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {training.groupName}
                              </h5>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {training.branch}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {training.facility} &bull; Antrenör: <strong className="text-slate-700 dark:text-slate-300">{training.coach}</strong>
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                            training.status === '1 Saat Kaldı'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 ring-1 ring-amber-400/40'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                          }`}
                        >
                          {training.dateStr} &bull; {training.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          <span>Kadro: <strong>{training.confirmedCount}/{training.totalAthletes} Sporcu</strong></span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedTrainingForRoster(training)}
                            className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          >
                            Kadro
                          </button>
                          {onNavigate && (
                            <button
                              onClick={() => onNavigate('yoklama')}
                              className="px-2.5 py-1 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
                            >
                              Yoklama
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Sözleşme & Üyelik Yenilemeleri (6 cols) */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Sözleşme &amp; Aidat Yenileme Takvimi
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveTab('contracts')}
                    className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Tümünü Gör ({contracts.length})</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {filteredContracts.slice(0, 3).map((contract) => (
                    <div
                      key={contract.id}
                      className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#162238]/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {contract.athleteName}
                            </h5>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                              {contract.contractNo}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {contract.contractType} &bull; Veli: {contract.parentName}
                          </p>
                        </div>

                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                            contract.daysRemaining <= 0
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                              : contract.daysRemaining <= 7
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {contract.daysRemaining <= 0
                            ? 'Süresi Doldu'
                            : `${contract.daysRemaining} Gün Kaldı`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                        <div className="text-slate-600 dark:text-slate-300 font-semibold">
                          Bitiş: <strong className="text-slate-900 dark:text-white">{contract.endDate}</strong> (₺{contract.monthlyFee.toLocaleString('tr-TR')}/Ay)
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSendReminder(contract)}
                            className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Veliye Hatırlatma SMS'i İlet"
                          >
                            <MessageSquare className="w-3 h-3 text-slate-500" />
                            <span>Hatırlat</span>
                          </button>
                          <button
                            onClick={() => setSelectedContractForRenew(contract)}
                            className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                          >
                            Yenile
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED UPCOMING TRAININGS */}
        {activeTab === 'trainings' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Toplam <strong>{filteredTrainings.length}</strong> yaklaşan antrenman seansı listeleniyor
              </div>
              <div className="flex items-center gap-1.5">
                {['all', 'Basketbol', 'Voleybol', 'Yüzme', 'Futbol', 'Cimnastik'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBranch(b)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedBranch === b
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {b === 'all' ? 'Tüm Branşlar' : b}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTrainings.map((training) => (
                <div
                  key={training.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 font-mono text-xs font-black shrink-0">
                        {training.time}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {training.groupName}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50">
                            {training.branch}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <strong>Tesis:</strong> {training.facility} ({training.court})
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <strong>Sorumlu Antrenör:</strong> {training.coach} &bull; Şube: {training.subeName}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full shrink-0 ${
                        training.status === '1 Saat Kaldı'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 ring-2 ring-amber-400/30 animate-pulse'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {training.dateStr} &bull; {training.status}
                    </span>
                  </div>

                  {/* Athlete preview badges */}
                  <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Örnek Sporcular ({training.confirmedCount}/{training.totalAthletes} Onaylı):
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {training.athletesPreview.map((name, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                        >
                          {name}
                        </span>
                      ))}
                      <span className="text-[10px] text-slate-400 font-bold">
                        +{training.totalAthletes - training.athletesPreview.length} Diğer
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        showToast(`📱 ${training.groupName} sporcu velilerine seans hatırlatma SMS'i iletildi.`);
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      <span>Velilere Hatırlat</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTrainingForRoster(training)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      >
                        Kadro Detayı
                      </button>
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('yoklama')}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Yoklamayı Aç</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DETAILED CONTRACT RENEWALS */}
        {activeTab === 'contracts' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Toplam <strong>{filteredContracts.length}</strong> sporcu sözleşmesi / üyelik kaydı listeleniyor
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Kritik Vade:</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                  {urgentContractsCount} Sporcu
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#162238]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5">Sporcu &amp; Sözleşme</th>
                    <th className="p-3.5">Veli İletişim</th>
                    <th className="p-3.5">Sözleşme Türü</th>
                    <th className="p-3.5">Bitiş Tarihi</th>
                    <th className="p-3.5">Kalan Gün</th>
                    <th className="p-3.5">Aylık Aidat</th>
                    <th className="p-3.5 text-right">Aksiyonlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredContracts.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {c.athleteName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {c.contractNo} &bull; {c.groupName}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {c.parentName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.parentPhone}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {c.contractType}
                        </span>
                        <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                          {c.branch}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {c.endDate}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Başlangıç: {c.startDate}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-full inline-block ${
                            c.daysRemaining <= 0
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                              : c.daysRemaining <= 7
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {c.daysRemaining <= 0 ? 'Süresi Doldu' : `${c.daysRemaining} Gün`}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100">
                          ₺{c.monthlyFee.toLocaleString('tr-TR')}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          Yenileme: ₺{c.renewalFee.toLocaleString('tr-TR')}
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSendReminder(c)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Veliye Hatırlat"
                          >
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => setSelectedContractForRenew(c)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-all shadow-2xs cursor-pointer"
                          >
                            Sözleşme Yenile
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM NOTIFICATIONS STREAM */}
        {activeTab === 'system' && (
          <div className="space-y-2.5">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  notif.isUnread
                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900'
                    : 'bg-slate-50/50 dark:bg-[#162238]/60 border-slate-200/70 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {notif.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                </div>

                {notif.actionUrl && onNavigate && (
                  <button
                    onClick={() => onNavigate(notif.actionUrl as NavPage)}
                    className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 cursor-pointer"
                  >
                    Detay &gt;
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: SÖZLEŞME YENİLEME MODALI */}
      {selectedContractForRenew && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedContractForRenew(null)}
        >
          <div
            className="bg-white dark:bg-[#111c2e] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                    Sözleşme Yenileme &amp; Dönem Uzatma
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedContractForRenew.athleteName} &bull; {selectedContractForRenew.contractNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedContractForRenew(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sporcu:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedContractForRenew.athleteName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Veli İletişim:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedContractForRenew.parentName} ({selectedContractForRenew.parentPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mevcut Bitiş Tarihi:</span>
                  <span className="font-bold text-rose-600">{selectedContractForRenew.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Yenileme Ücreti:</span>
                  <span className="font-bold text-emerald-600">₺{selectedContractForRenew.renewalFee.toLocaleString('tr-TR')} / Ay</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Yenileme Süresi Seçin:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '3 Aylık Dönem', months: 3 },
                    { label: '6 Aylık Sezon', months: 6 },
                    { label: '12 Aylık Yıllık', months: 12 },
                  ].map((period) => (
                    <button
                      key={period.months}
                      type="button"
                      onClick={() => handleConfirmRenewal(selectedContractForRenew.id, period.months)}
                      disabled={renewing}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 text-center transition-all cursor-pointer group"
                    >
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block group-hover:text-emerald-700">
                        {period.label}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        +{period.months} Ay Uzat
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#162238] border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedContractForRenew(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ANTRENMAN KADRO DETAYI */}
      {selectedTrainingForRoster && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedTrainingForRoster(null)}
        >
          <div
            className="bg-white dark:bg-[#111c2e] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {selectedTrainingForRoster.groupName} Kadrosu
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedTrainingForRoster.time} &bull; {selectedTrainingForRoster.court}
                </p>
              </div>
              <button
                onClick={() => setSelectedTrainingForRoster(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Seansa Kayıtlı Sporcular ({selectedTrainingForRoster.confirmedCount}/{selectedTrainingForRoster.totalAthletes}):
              </div>
              <div className="space-y-1.5">
                {[
                  ...selectedTrainingForRoster.athletesPreview,
                  'Mert Hakan',
                  'Barış Alper',
                  'Deniz Aktaş',
                  'Ege Baran',
                  'Alp Korkmaz',
                ].slice(0, selectedTrainingForRoster.totalAthletes).map((name, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {i + 1}. {name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Katılım Onaylı
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#162238] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedTrainingForRoster(null);
                  if (onNavigate) onNavigate('yoklama');
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Yoklama Ekranına Geç
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 z-50">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-200 leading-relaxed">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
};
