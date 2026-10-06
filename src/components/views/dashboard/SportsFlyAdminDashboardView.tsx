import React, { useState } from 'react';
import {
  Package,
  Users,
  Building,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Filter,
  Plus,
  Send,
  Building2,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  LifeBuoy,
} from 'lucide-react';
import {
  INITIAL_PACKAGES,
  INITIAL_FACILITY_STATS,
  INITIAL_SUPPORT_TICKETS,
} from '../../../data/mockData';
import { SupportTicket, NavPage } from '../../../types';
import { UpcomingEventsNotificationPanel } from '../../dashboard/UpcomingEventsNotificationPanel';
import { GoogleUsersAccessManagerPanel } from '../../admin/GoogleUsersAccessManagerPanel';

interface SportsFlyAdminDashboardViewProps {
  onNavigate?: (page: NavPage) => void;
}

export const SportsFlyAdminDashboardView: React.FC<SportsFlyAdminDashboardViewProps> = ({
  onNavigate,
}) => {
  const [packages, setPackages] = useState(INITIAL_PACKAGES);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('baslangic-kulubu');
  const [facilityStats, setFacilityStats] = useState(INITIAL_FACILITY_STATS);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showReplySuccess, setShowReplySuccess] = useState(false);

  const selectedPackage =
    packages.find((p) => p.id === selectedPackageId) || packages[0];

  const filteredUsers = selectedPackage.users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.code.includes(userSearchQuery) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id ? { ...t, status: 'Cevaplandı' as const } : t
      )
    );
    setShowReplySuccess(true);
    setReplyText('');
    setTimeout(() => {
      setShowReplySuccess(false);
      setSelectedTicket(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Platform Executive Overview Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-slate-700/60">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                SportsFly Platform Admin Konsolu
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Sistem Sağlığı: %99.98
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-1">
              Merkezi Platform &amp; Kulüp Lisans Yönetimi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Türkiye geneli kayıtlı spor kulüpleri, paket abonelikleri, tesis sayıları ve müşteri destek talepleri.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onNavigate && (
              <button
                onClick={() => onNavigate('destek')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <LifeBuoy className="w-4 h-4" />
                <span>Destek Masası Paneli</span>
              </button>
            )}
          </div>
        </div>

        {/* Platform KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-700/60 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
              Toplam Kayıtlı Kulüp
            </span>
            <span className="text-2xl font-extrabold text-white mt-1 block">34 Kulüp</span>
            <span className="text-emerald-400 text-[11px] font-semibold mt-0.5 block">+3 bu ay</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
              Platform Geneli Sporcu
            </span>
            <span className="text-2xl font-extrabold text-blue-300 mt-1 block">1.482 Sporcu</span>
            <span className="text-blue-200 text-[11px] font-semibold mt-0.5 block">Aktif lisanslı sporcu havuzu</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
              Aktif Lisans Hacmi
            </span>
            <span className="text-2xl font-extrabold text-emerald-300 mt-1 block">₺428.000</span>
            <span className="text-emerald-200 text-[11px] font-semibold mt-0.5 block">Aylık Lisans Geliri</span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block">
              Açık Destek Talepleri
            </span>
            <span className="text-2xl font-extrabold text-amber-300 mt-1 block">
              {supportTickets.filter((t) => t.status === 'Açık').length} Bekleyen
            </span>
            <span className="text-amber-200 text-[11px] font-semibold mt-0.5 block">Ort. yanıt süresi: 8 dk</span>
          </div>
        </div>
      </div>

      {/* Google İle Giriş Yapan Kullanıcılar & Alan Yetkilendirme Listesi */}
      <GoogleUsersAccessManagerPanel onNavigate={onNavigate} />

      {/* Merkezi Bildirim Merkezi & Yaklaşan Olaylar */}
      <UpcomingEventsNotificationPanel onNavigate={onNavigate} defaultTab="all" />

      {/* 1. Paketler & Kullanıcı Listesi (Screenshot 5) */}
      <div className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-100" />
            <h2 className="text-xl font-bold tracking-tight">
              Paketler &amp; Kullanıcı Listesi
            </h2>
          </div>
          <span className="text-xs font-medium bg-blue-500/50 px-3 py-1 rounded-full text-blue-50 border border-blue-400/30">
            Aktif Yönetim
          </span>
        </div>

        {/* 3 Columns Layout matching Screenshot 5 */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Column 1: Packages List */}
          <div className="md:col-span-3 p-4 bg-slate-50/50 dark:bg-[#162238]/40">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
              Paket Türü
            </h3>
            <div className="space-y-1.5">
              {packages.map((pkg) => {
                const isSelected = pkg.id === selectedPackageId;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-[#111c2e] text-slate-900 dark:text-slate-100 shadow-xs font-bold border border-slate-200 dark:border-slate-700 ring-2 ring-blue-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-[#111c2e] hover:text-slate-900 dark:hover:text-white border border-transparent font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Package
                        className={`w-4 h-4 ${
                          isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-sm truncate">{pkg.name}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                          : 'bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {pkg.users.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 2: Users in Selected Package */}
          <div className="md:col-span-5 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Kullanıcılar ({selectedPackage.name})
                </h3>
                <span className="text-xs text-slate-500">
                  {filteredUsers.length} kişi
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Kullanıcı ara (isim veya kod)..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#162238] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Users List with Delete/Action */}
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                {filteredUsers.map((user) => (
                  <div
                    key={user.code}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {user.name}
                        </span>
                        <span className="text-[10px] font-sans tabular-nums bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/40">
                          {user.code}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {user.email}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setPackages((prev) =>
                          prev.map((p) =>
                            p.id === selectedPackageId
                              ? {
                                  ...p,
                                  users: p.users.filter((u) => u.code !== user.code),
                                }
                              : p
                          )
                        );
                      }}
                      className="text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      title="Paketten Çıkar"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination / Count summary */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Toplam: {selectedPackage.users.length} Kullanıcı</span>
            </div>
          </div>

          {/* Column 3: Facility / Sport School Distribution */}
          <div className="md:col-span-4 p-4 bg-slate-50/30 dark:bg-[#162238]/30">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
              Tesis &amp; Spor Okulu Dağılımı
            </h3>
            <div className="space-y-2">
              {facilityStats.map((stat) => (
                <div
                  key={stat.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#111c2e] border border-slate-200/80 dark:border-slate-700 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {stat.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {stat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Platform Destek Talepleri Yönetimi (Screenshot 5) */}
      <div className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-100" />
            <h2 className="text-xl font-bold tracking-tight">
              Kulüp Destek Talepleri Masası
            </h2>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium bg-blue-500/50 px-3 py-1 rounded-full text-blue-50 border border-blue-400/30">
              {supportTickets.filter((t) => t.status === 'Açık').length} Bekleyen Talep
            </span>
            {onNavigate && (
              <button
                onClick={() => onNavigate('destek')}
                className="text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Tüm Destek Sistemine Git</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tickets Content */}
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Talep No &amp; Konu</th>
                  <th className="pb-3 px-3">Kullanıcı &amp; Kulüp</th>
                  <th className="pb-3 px-3">Tarih</th>
                  <th className="pb-3 px-3">Öncelik</th>
                  <th className="pb-3 px-3">Durum</th>
                  <th className="pb-3 px-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {supportTickets.map((ticket) => {
                  const getStatusBadge = (status: SupportTicket['status']) => {
                    switch (status) {
                      case 'Açık':
                        return 'bg-rose-50 text-rose-700 border-rose-200';
                      case 'Cevaplandı':
                        return 'bg-blue-50 text-blue-700 border-blue-200';
                      case 'Beklemede':
                        return 'bg-amber-50 text-amber-700 border-amber-200';
                      case 'Çözüldü':
                        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    }
                  };

                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {ticket.subject}
                        </div>
                        <span className="text-xs font-sans tabular-nums text-slate-400">
                          {ticket.id}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {ticket.userName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {ticket.userEmail}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-slate-600 dark:text-slate-400">
                        {ticket.date}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            ticket.priority === 'Yüksek'
                              ? 'bg-rose-100 text-rose-800'
                              : ticket.priority === 'Orta'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Yanıtla / İncele
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                  Destek Talebini Yanıtla
                </h3>
                <p className="text-xs text-slate-400 font-sans tabular-nums">
                  {selectedTicket.id} - {selectedTicket.userName}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="bg-slate-50 dark:bg-[#162238] p-3 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500 uppercase">
                  Konu:
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedTicket.subject}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Kullanıcı: {selectedTicket.userName} ({selectedTicket.userEmail})
                </p>
              </div>

              {showReplySuccess ? (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Yanıt başarıyla kulübe iletildi.</span>
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      SportsFly Uzman Yanıtı
                    </label>
                    <textarea
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Kulüp yetkilisine iletilecek çözüm veya bilgilendirme mesajı..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#162238] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Yanıtı Gönder</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
