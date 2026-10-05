import React, { useState, useEffect, useMemo } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  ExternalLink,
  Shield,
  ShieldCheck,
  Building2,
  Headphones,
  Calendar,
  Send,
  ArrowRight,
  BookOpen,
  ChevronRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { SportsFlyIcon } from '../SportsFlyLogo';
import {
  SupportTicketFull,
  SupportTicketCategory,
  SupportTicketStatus,
  SupportTicketPriority,
  SupportAttachment,
} from '../../types/destek';
import {
  getStoredSupportTickets,
  saveStoredSupportTickets,
  SUPPORT_CATEGORIES,
  generateSpecialistAutoReply,
} from '../../data/mockDestekData';
import { getStoredUserProfile } from '../../data/userProfile';
import { getActiveSessionPlan, PACKAGE_DETAILS, isSuperAdminUser } from '../../data/packagePermissions';
import {
  getStoredNotifications,
  saveStoredNotifications,
  SportsFlyNotification,
} from '../../data/notifications';
import { NewTicketModal } from './destek/NewTicketModal';
import { TicketDetailModal } from './destek/TicketDetailModal';
import { FAQKnowledgeBaseView } from './destek/FAQKnowledgeBaseView';

export const DestekView: React.FC = () => {
  const [userProfile, setUserProfile] = useState(() => getStoredUserProfile());
  const activePlan = getActiveSessionPlan();
  const packageMeta = PACKAGE_DETAILS[activePlan];

  // Listen to profile updates (e.g. role change)
  useEffect(() => {
    const handleProfileChange = () => {
      setUserProfile(getStoredUserProfile());
    };
    window.addEventListener('sportsfly_profile_updated', handleProfileChange);
    window.addEventListener('storage', handleProfileChange);
    return () => {
      window.removeEventListener('sportsfly_profile_updated', handleProfileChange);
      window.removeEventListener('storage', handleProfileChange);
    };
  }, []);

  const isSuperAdmin = isSuperAdminUser(userProfile?.role);
  const [viewScope, setViewScope] = useState<'my_tickets' | 'all'>(() =>
    isSuperAdmin ? 'all' : 'my_tickets'
  );

  // Update viewScope if role switches
  useEffect(() => {
    if (!isSuperAdmin) {
      setViewScope('my_tickets');
    }
  }, [isSuperAdmin]);

  const [tickets, setTickets] = useState<SupportTicketFull[]>(() => getStoredSupportTickets());
  const [activeTab, setActiveTab] = useState<'talepler' | 'bilgi-bankasi' | 'iletisim'>('talepler');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketFull | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with storage events
  useEffect(() => {
    const handleSupportUpdate = (e: any) => {
      if (e.detail) {
        setTickets(e.detail);
      }
    };
    window.addEventListener('sportsfly_support_updated', handleSupportUpdate);
    return () => {
      window.removeEventListener('sportsfly_support_updated', handleSupportUpdate);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const addSupportNotification = (ticketId: string, subject: string, messagePreview: string) => {
    try {
      const adminNotifications = getStoredNotifications('admin');
      const newNotif: SportsFlyNotification = {
        id: `support-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category: 'support',
        title: 'Destek Talebi Cevaplandı',
        description: `Talep No #${ticketId} ("${subject}"): "${messagePreview.length > 70 ? messagePreview.substring(0, 70) + '...' : messagePreview}"`,
        time: 'Şimdi',
        isUnread: true,
        actionUrl: 'destek'
      };
      const updated = [newNotif, ...adminNotifications];
      saveStoredNotifications('admin', updated);
    } catch (err) {
      console.error('Failed to add support notification:', err);
    }
  };

  const handleCreateTicket = (newTicket: SupportTicketFull) => {
    const updated = [newTicket, ...tickets];
    setTickets(updated);
    saveStoredSupportTickets(updated);
    triggerToast(`"${newTicket.subject}" konulu destek talebiniz başarıyla oluşturuldu.`);

    // Automatically schedule an initial confirmation/reply from specialist after 1.5s
    setTimeout(() => {
      const autoReply = generateSpecialistAutoReply(newTicket, newTicket.messages[0].message);
      const ticketsNow = getStoredSupportTickets();
      const target = ticketsNow.find((t) => t.id === newTicket.id);
      if (target) {
        target.messages.push(autoReply);
        target.status = 'Yanitlandi';
        target.updatedAt = autoReply.createdAt;
        saveStoredSupportTickets([...ticketsNow]);
        
        // Trigger instant notification alert
        addSupportNotification(newTicket.id, newTicket.subject, autoReply.message);
      }
    }, 2000);
  };

  const handleSendMessage = (ticketId: string, messageText: string, attachments?: SupportAttachment[]) => {
    const now = new Date();
    const timeStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const isSystem = isSuperAdmin;
        const newMsg = {
          id: `msg-${Date.now()}`,
          ticketId,
          senderType: (isSystem ? 'system_admin' : 'club_admin') as any,
          senderName: isSystem ? 'SportsFly Destek Temsilcisi' : `${userProfile?.name || 'Kulüp Yöneticisi'} (${userProfile?.role || 'Yönetici'})`,
          senderRole: isSystem ? 'Sistem Yöneticisi' : userProfile?.role || 'Kulüp Yöneticisi',
          createdAt: timeStr,
          message: messageText,
          attachments,
        };
        const updatedTicket: SupportTicketFull = {
          ...t,
          status: isSystem ? 'Yanitlandi' : 'MusteriYaniti',
          updatedAt: timeStr,
          messages: [...t.messages, newMsg],
        };
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(updatedTicket);
        }

        if (isSystem) {
          // If a superadmin responds, trigger instant notification alert for club administrator
          addSupportNotification(t.id, t.subject, messageText);
        }

        return updatedTicket;
      }
      return t;
    });

    setTickets(updated);
    saveStoredSupportTickets(updated);

    if (isSuperAdmin) {
      triggerToast('Yanıtınız kulüp yöneticisine iletildi ve anlık bildirim gönderildi.');
    } else {
      triggerToast('Yanıtınız SportsFly destek temsilcisine iletildi.');
    }
  };

  const handleTriggerSimulatedAgentReply = (ticketId: string) => {
    const targetTicket = tickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    const lastMsg = targetTicket.messages[targetTicket.messages.length - 1];
    const autoReply = generateSpecialistAutoReply(targetTicket, lastMsg?.message || targetTicket.subject);

    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const updatedTicket: SupportTicketFull = {
          ...t,
          status: 'Yanitlandi',
          updatedAt: autoReply.createdAt,
          messages: [...t.messages, autoReply],
        };
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(updatedTicket);
        }
        return updatedTicket;
      }
      return t;
    });

    setTickets(updated);
    saveStoredSupportTickets(updated);
    triggerToast('SportsFly uzmanından yeni bir yanıt geldi.');

    // Add support notification to the club manager (admin)
    addSupportNotification(targetTicket.id, targetTicket.subject, autoReply.message);
  };

  const handleUpdateStatus = (
    ticketId: string,
    newStatus: SupportTicketStatus,
    feedback?: { rating: number; comment?: string; submittedAt: string }
  ) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        const updatedTicket: SupportTicketFull = {
          ...t,
          status: newStatus,
          closedAt: newStatus === 'Cozuldu' || newStatus === 'Kapali' ? new Date().toLocaleDateString('tr-TR') : undefined,
          feedback: feedback || t.feedback,
        };
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(updatedTicket);
        }
        return updatedTicket;
      }
      return t;
    });

    setTickets(updated);
    saveStoredSupportTickets(updated);
    triggerToast(`Talep durumu "${newStatus === 'Cozuldu' ? 'Çözüldü' : newStatus}" olarak güncellendi.`);
  };

  // Determine visible tickets based on user role & scope
  const visibleBaseTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (isSuperAdmin && viewScope === 'all') {
        return true;
      }
      const myEmail = userProfile?.email?.toLowerCase().trim();
      const creatorEmail = t.creatorEmail?.toLowerCase().trim();
      if (myEmail && creatorEmail && myEmail === creatorEmail) {
        return true;
      }
      const myName = userProfile?.name?.toLowerCase().trim();
      const creatorName = t.creatorName?.toLowerCase().trim();
      if (myName && creatorName && (creatorName.includes(myName) || myName.includes(creatorName))) {
        return true;
      }
      const myClub = userProfile?.club?.toLowerCase().trim();
      const ticketClub = t.clubName?.toLowerCase().trim();
      if (myClub && ticketClub && myClub === ticketClub) {
        return true;
      }
      return false;
    });
  }, [tickets, isSuperAdmin, viewScope, userProfile]);

  // Filtered tickets
  const filteredTickets = visibleBaseTickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.creatorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'open'
        ? t.status === 'Acik' || t.status === 'Yanitlandi' || t.status === 'MusteriYaniti' || t.status === 'Beklemede'
        : statusFilter === 'resolved'
        ? t.status === 'Cozuldu' || t.status === 'Kapali'
        : t.status === statusFilter;

    const matchesPriority = priorityFilter === 'all' ? true : t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' ? true : t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Counters
  const openCount = visibleBaseTickets.filter((t) => t.status === 'Acik' || t.status === 'MusteriYaniti').length;
  const repliedCount = visibleBaseTickets.filter((t) => t.status === 'Yanitlandi').length;
  const resolvedCount = visibleBaseTickets.filter((t) => t.status === 'Cozuldu' || t.status === 'Kapali').length;

  const getStatusBadge = (status: SupportTicketStatus) => {
    switch (status) {
      case 'Acik':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Yanitlandi':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'MusteriYaniti':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Beklemede':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Cozuldu':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'Kapali':
        return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusLabel = (status: SupportTicketStatus) => {
    switch (status) {
      case 'Acik':
        return 'Yeni / İncelemede';
      case 'Yanitlandi':
        return 'SportsFly Yanıtladı';
      case 'MusteriYaniti':
        return 'Kulüp Yanıtı Eklendi';
      case 'Beklemede':
        return 'Teknik İncelemede';
      case 'Cozuldu':
        return 'Çözüldü';
      case 'Kapali':
        return 'Kapatıldı';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs flex items-center gap-2.5 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Hero & Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold">
              <LifeBuoy className="w-3.5 h-3.5 text-blue-300" />
              <span>SportsFly 7/24 Kulüp Destek Merkezi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Destek &amp; Yardım Masası
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Teknik sorularınız, Sanal POS &amp; aidat yapılandırmaları, eğitim müfredatı veya lisans talepleriniz için SportsFly uzman ekibiyle anlık iletişim kurun.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setIsNewTicketModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-blue-50 text-blue-900 font-extrabold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Yeni Destek Talebi Aç</span>
            </button>
          </div>
        </div>

        {/* Live SLA & Package Support Benefit Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <SportsFlyIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">
                Paket Destek Seviyeniz: <span className="text-amber-300 font-extrabold">{activePlan}</span>
              </p>
              <p className="text-[11px] text-blue-200">
                {packageMeta?.limits?.supportLevel || '7/24 Öncelikli Canlı Destek & Kulüp Danışmanlığı'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-blue-200">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Ortalama Yanıt Süresi: <strong className="text-white">&lt; 15 Dakika</strong>
            </span>
            <span>Çözüm Oranı: <strong className="text-white">%99.4</strong></span>
          </div>
        </div>
      </div>

      {/* Role Perspective Scope Banner */}
      {!isSuperAdmin ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl text-xs text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>Kulüp Yöneticisi Görünümü:</strong> Yalnızca hesabınıza ve kulübünüze (<strong>{userProfile?.name}</strong> • <em>{userProfile?.email}</em>) ait destek talepleri listelenmektedir.
            </span>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 shrink-0 self-start sm:self-auto">
            Kulüp İzolasyonu Aktif
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 dark:bg-[#111c2e] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-bold text-slate-800 dark:text-slate-200">Yetki: Süper Admin</span>
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">| Görünüm Kapsamı:</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewScope('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewScope === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Tüm Talepler ({tickets.length})
            </button>
            <button
              onClick={() => setViewScope('my_tickets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewScope === 'my_tickets'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Kulüp Yöneticisi Görünümü
            </button>
          </div>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111c2e] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Toplam Talep</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{visibleBaseTickets.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <LifeBuoy className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111c2e] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Açık / İncelenen</p>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{openCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111c2e] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">SportsFly Yanıtladı</p>
            <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{repliedCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111c2e] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Çözümlenen Talepler</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{resolvedCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('talepler')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'talepler'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Destek Taleplerim ({visibleBaseTickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bilgi-bankasi')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'bilgi-bankasi'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Sıkça Sorulan Sorular &amp; Rehberler</span>
        </button>

        <button
          onClick={() => setActiveTab('iletisim')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'iletisim'
              ? 'bg-blue-600 text-white shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Canlı İletişim &amp; WhatsApp</span>
        </button>
      </div>

      {/* TAB 1: SUPPORT TICKETS LIST */}
      {activeTab === 'talepler' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-[#111c2e] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Talep konusu, bilet no veya isim ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-hidden"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="open">Açık / Devam Edenler</option>
                <option value="Yanitlandi">SportsFly Yanıtladı</option>
                <option value="MusteriYaniti">Kulüp Yanıtladı</option>
                <option value="resolved">Çözülenler</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer"
              >
                <option value="all">Tüm Öncelikler</option>
                <option value="Acil">Acil (1 saat)</option>
                <option value="Yuksek">Yüksek</option>
                <option value="Normal">Normal</option>
                <option value="Dusuk">Düşük</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer"
              >
                <option value="all">Tüm Kategoriler</option>
                {SUPPORT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsNewTicketModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Talep</span>
              </button>
            </div>
          </div>

          {/* Tickets List */}
          {filteredTickets.length > 0 ? (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => {
                const catMeta = SUPPORT_CATEGORIES.find((c) => c.id === ticket.category);
                const lastMessage = ticket.messages[ticket.messages.length - 1];
                const isReplied = ticket.status === 'Yanitlandi';

                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-2xs hover:shadow-md cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: ID, Subject, Category, Branch */}
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">
                            #{ticket.id}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(ticket.status)}`}>
                            {getStatusLabel(ticket.status)}
                          </span>

                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {catMeta?.name || ticket.category}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ticket.priority === 'Acil'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                : ticket.priority === 'Yuksek'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {ticket.subject}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          Son Mesaj: {lastMessage?.message || 'Mesaj detayı bulunamadı.'}
                        </p>
                      </div>

                      {/* Right: Assigned Agent, Timestamp, Message Count & Arrow */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                        {/* Assigned specialist pill */}
                        <div className="flex items-center gap-2 text-right">
                          <img
                            src={
                              ticket.assignedAgent?.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={ticket.assignedAgent?.name || 'Temsilci'}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <div className="text-left">
                            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                              {ticket.assignedAgent?.name || 'SportsFly Uzmanı'}
                            </p>
                            <p className="text-[10px] text-slate-400 leading-none">
                              {ticket.updatedAt}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-blue-500" />
                            {ticket.messages.length}
                          </span>

                          <button className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200 dark:border-slate-800">
              <LifeBuoy className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Filtrelere uygun destek talebi bulunamadı
              </h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Yeni bir soru sormak veya teknik bildirimde bulunmak için talep oluşturabilirsiniz.
              </p>
              <button
                onClick={() => setIsNewTicketModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Yeni Destek Talebi Aç
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FAQ & KNOWLEDGE BASE */}
      {activeTab === 'bilgi-bankasi' && (
        <FAQKnowledgeBaseView onOpenNewTicket={() => setIsNewTicketModalOpen(true)} />
      )}

      {/* TAB 3: DIRECT CONTACT & WHATSAPP */}
      {activeTab === 'iletisim' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Card 1: WhatsApp */}
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                SportsFly WhatsApp Canlı Destek Hattı
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Mobil telefonunuzdan ekran kaydı, fotoğraf veya sesli mesaj göndererek anlık destek alabilirsiniz.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#162238] rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <p className="text-slate-500">Doğrudan Hat:</p>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">+90 (850) 308 00 00</p>
              <p className="text-[11px] text-emerald-600 font-semibold">● 7/24 Nöbetçi Destek Aktif</p>
            </div>

            <a
              href="https://wa.me/908503080000"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp Sohbetini Başlat</span>
            </a>
          </div>

          {/* Contact Card 2: Email & Phone */}
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Kurumsal E-posta &amp; Santral
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Resmi yazışmalar, fatura/muhasebe mutabakatları ve sözleşme süreçleri için.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#162238] rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <p className="text-slate-500">Destek E-postası:</p>
              <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">destek@sportsfly.app</p>
              <p className="text-[11px] text-slate-400">Mesai Saatleri: Hafta içi 09:00 - 19:00</p>
            </div>

            <button
              onClick={() => setIsNewTicketModalOpen(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Sistem Üzerinden Talep Aç</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        onSubmit={handleCreateTicket}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onSendMessage={handleSendMessage}
        onUpdateStatus={handleUpdateStatus}
        onTriggerSimulatedAgentReply={handleTriggerSimulatedAgentReply}
      />
    </div>
  );
};
