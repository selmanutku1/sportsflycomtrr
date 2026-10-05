import React, { useState, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  ArrowRight,
  User,
  Users,
  Shield,
  Layers,
  Search,
  Check,
  Calendar,
  Zap,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';
import { NavPage } from '../../types';
import { SportsFlyIcon } from '../SportsFlyLogo';
import {
  SYSTEM_UPDATES,
  SystemUpdateItem,
  UpdateTargetRole,
  normalizeRoleKey,
} from '../../data/updatesData';
import { getStoredUserProfile } from '../../data/userProfile';

interface UpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: NavPage) => void;
  initialRoleFilter?: string;
}

export const UpdatesModal: React.FC<UpdatesModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  initialRoleFilter,
}) => {
  const [userProfile] = useState(() => getStoredUserProfile());
  const currentUserRoleKey = normalizeRoleKey(userProfile.role);

  const [activeTab, setActiveTab] = useState<'personalized' | 'all' | 'yonetici' | 'antrenor' | 'veli'>(
    'personalized'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredUpdates = useMemo(() => {
    return SYSTEM_UPDATES.filter((item) => {
      // Role Tab filtering
      if (activeTab === 'personalized') {
        const isMatched = item.targetRole === currentUserRoleKey || item.targetRole === 'all';
        if (!isMatched) return false;
      } else if (activeTab === 'yonetici') {
        if (item.targetRole !== 'yonetici') return false;
      } else if (activeTab === 'antrenor') {
        if (item.targetRole !== 'antrenor') return false;
      } else if (activeTab === 'veli') {
        if (item.targetRole !== 'veli' && item.targetRole !== 'sporcu') return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesSummary = item.summary.toLowerCase().includes(query);
        const matchesDetails = item.details.some((d) => d.toLowerCase().includes(query));
        const matchesRole = item.targetRoleLabel.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSummary && !matchesDetails && !matchesRole) {
          return false;
        }
      }

      return true;
    });
  }, [activeTab, selectedCategory, searchQuery, currentUserRoleKey]);

  if (!isOpen) return null;

  const getRoleBadgeStyle = (targetRole: UpdateTargetRole) => {
    switch (targetRole) {
      case 'yonetici':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-blue-200 dark:border-blue-800';
      case 'antrenor':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800';
      case 'veli':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-200 dark:border-amber-800';
      case 'sporcu':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border-purple-200 dark:border-purple-800';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'feature':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-600 text-white uppercase tracking-wider">
            Yeni Özellik
          </span>
        );
      case 'improvement':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">
            Geliştirme
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-700 text-white uppercase tracking-wider">
            Sistem
          </span>
        );
    }
  };

  const handleActionClick = (page?: NavPage) => {
    if (page && onNavigate) {
      onClose();
      onNavigate(page);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111c2e] w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-7 py-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
              <SportsFlyIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  Sistem Güncellemeleri &amp; Yenilikler
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white border border-white/30 font-mono">
                  v2.8.5
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Kullanıcı türünüze ve kulüp operasyonlarınıza özel en son geliştirmeler.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Highlight Bar */}
        <div className="px-5 sm:px-7 py-3 bg-indigo-50/80 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Aktif Rolünüz:</span>
            <span className="px-2.5 py-0.5 rounded-md font-bold bg-indigo-600 text-white shadow-2xs">
              {userProfile.role}
            </span>
            <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium hidden md:inline">
              &bull; Sizin rolünüze uygun bildirimler öncelikli olarak filtrelenmektedir.
            </span>
          </div>

          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Toplam <strong>{SYSTEM_UPDATES.length}</strong> güncelleme yayında
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-4 sm:px-7 sm:py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#162238]/50 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('personalized')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'personalized'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#111c2e] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              <SportsFlyIcon className="w-3.5 h-3.5" />
              <span>Size Özel ({userProfile.role})</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#111c2e] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              Tüm Güncellemeler
            </button>

            <button
              onClick={() => setActiveTab('yonetici')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'yonetici'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#111c2e] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              Yöneticiler
            </button>

            <button
              onClick={() => setActiveTab('antrenor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'antrenor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#111c2e] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              Antrenörler
            </button>

            <button
              onClick={() => setActiveTab('veli')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'veli'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#111c2e] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              Veliler &amp; Sporcular
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Özellik veya sürüm ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#111c2e] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Updates List */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-4 max-h-[55vh]">
          {filteredUpdates.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Seçilen kriterlere uygun güncelleme bulunamadı.
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Farklı bir sekme seçebilir veya arama filtrenizi temizleyebilirsiniz.
              </p>
              <button
                onClick={() => {
                  setActiveTab('all');
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 cursor-pointer"
              >
                Tüm Güncellemeleri Göster
              </button>
            </div>
          ) : (
            filteredUpdates.map((item) => {
              const isTargetUserMatch =
                item.targetRole === currentUserRoleKey ||
                (currentUserRoleKey === 'yonetici' && item.targetRole === 'yonetici');

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isTargetUserMatch
                      ? 'bg-gradient-to-br from-white to-blue-50/40 dark:from-[#111c2e] dark:to-blue-950/20 border-blue-200 dark:border-blue-900/80 shadow-xs ring-1 ring-blue-500/10'
                      : 'bg-white dark:bg-[#111c2e] border-slate-200 dark:border-slate-800 shadow-2xs'
                  }`}
                >
                  {/* Top Meta Line */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {getCategoryBadge(item.category)}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeStyle(
                          item.targetRole
                        )}`}
                      >
                        {item.targetRoleLabel}
                      </span>
                      {isTargetUserMatch && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 fill-indigo-600 text-indigo-600" />
                          <span>Rolünüze Özel</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-mono">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{item.version}</span>
                      <span>&bull;</span>
                      <span>{item.date}</span>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Detail Bullet Points */}
                  {item.details && item.details.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      {item.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action CTA */}
                  {item.actionPage && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        Bu özelliği hemen test edin:
                      </span>
                      <button
                        onClick={() => handleActionClick(item.actionPage)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer group"
                      >
                        <span>{item.actionLabel || 'Özelliğe Git'}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-4 bg-slate-50 dark:bg-[#162238]/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Sisteminiz otomatik olarak güncellenmektedir.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors cursor-pointer shadow-xs"
          >
            Tamam, Anladım
          </button>
        </div>
      </div>
    </div>
  );
};
