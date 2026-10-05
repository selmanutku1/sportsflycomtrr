import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  User,
  Layout,
  UserX,
  UserCheck,
  UserPlus,
  FileText,
  Building2,
  ChevronDown,
  ChevronRight,
  Activity,
  Award,
  Users,
  GraduationCap,
  Star,
  ShieldCheck,
  TrendingUp,
  X,
  CalendarDays,
  Receipt,
  CreditCard,
  Layers,
  FolderTree,
  Lock,
  ClipboardCheck,
  Image as ImageIcon,
  FileCheck,
  BarChart3,
  BookOpen,
  LifeBuoy,
  Headphones,
  Video,
  Settings,
  Trophy,
  Boxes,
  Package,
  Blocks,
  Sparkles,
} from 'lucide-react';
import { NavPage, PackagePlanType } from '../types';
import { SportsFlyLogo, SportsFlyIcon } from './SportsFlyLogo';
import {
  isPageAllowedForPlan,
  isSuperAdminUser,
  isGoogleRestrictedUser,
  isGoogleUserPageUnlocked,
  PACKAGE_DETAILS,
} from '../data/packagePermissions';
import { getStoredUserProfile, UserProfileData } from '../data/userProfile';
import { basvurularService } from '../services/firestoreService';
import { useLanguage } from '../i18n/LanguageContext';

interface SidebarProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
  currentPlan?: PackagePlanType;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpen,
  onCloseMobile,
  currentPlan,
}) => {
  const { t } = useLanguage();
  const [userProfile, setUserProfile] = useState<UserProfileData>(() => getStoredUserProfile());
  const [, setGoogleAccessVersion] = useState<number>(0);
  const [pendingBasvuruCount, setPendingBasvuruCount] = useState<number>(0);
  const [lockedToast, setLockedToast] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = basvurularService.subscribeToPending((count) => {
        setPendingBasvuruCount(count);
      });
    } catch (e) {
      console.error('Realtime pending application badge error:', e);
    }
    return () => {
      if (unsub) unsub();
    };
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setUserProfile(getStoredUserProfile());
      setGoogleAccessVersion((v) => v + 1);
    };
    window.addEventListener('storage', handleProfileUpdate);
    window.addEventListener('sportsfly_profile_updated', handleProfileUpdate);
    window.addEventListener('sportsfly_google_users_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('storage', handleProfileUpdate);
      window.removeEventListener('sportsfly_profile_updated', handleProfileUpdate);
      window.removeEventListener('sportsfly_google_users_updated', handleProfileUpdate);
    };
  }, []);

  const isGoogleRestricted = isGoogleRestrictedUser(userProfile?.role, userProfile?.email);
  const isSuperAdmin = !isGoogleRestricted && isSuperAdminUser(userProfile?.role, userProfile?.email);

  const isRestricted = (page: NavPage) => {
    if (isGoogleRestricted) {
      return !isGoogleUserPageUnlocked(page, userProfile?.email);
    }
    if (isSuperAdmin) return false;
    if (!currentPlan) return false;
    return !isPageAllowedForPlan(page, currentPlan, userProfile?.role, userProfile?.email);
  };

  // Show item in sidebar if allowed OR if Google restricted (so all categories are visible in locked state)
  const shouldShowItem = (page: NavPage) => {
    if (isGoogleRestricted) return true;
    return !isRestricted(page);
  };

  const visibleMuhasebeItems = (
    [
      'on-muhasebe',
      'gelir-gider-kategori',
      'gelir-gider-yonetimi',
      'odeme-plani-kontrol',
      'odeme-plani',
    ] as NavPage[]
  ).filter((page) => shouldShowItem(page));

  // Ensure "Kulüpler" sub-menu stays open if child is active
  const isBusinessChildActive = [
    'subeler',
    'yoneticiler',
    'on-kayit',
    'brans-yonetimi',
    'aktivite-yonetimi',
    'sporcular',
    'sporcu-karnesi',
    'egitim-planlama',
    'egitmenler',
    'gruplar',
    'antrenman-takvimi',
    'kulup-evraklari',
    'kulup-galerisi',
  ].includes(currentPage);

  // Ön Muhasebe child active state
  const isOnMuhasebeChildActive = [
    'on-muhasebe',
    'gelir-gider-kategori',
    'gelir-gider-yonetimi',
    'odeme-plani-kontrol',
    'odeme-plani',
  ].includes(currentPage);

  const [isBusinessesOpen, setIsBusinessesOpen] = useState(false);
  const [isOnMuhasebeOpen, setIsOnMuhasebeOpen] = useState(false);

  const triggerLockedNotice = (label?: string) => {
    setLockedToast(
      label
        ? `"${label}" kategorisi kilitlidir. Sistem özelliklerini açmak için lütfen bir paket seçin veya yöneticinizden alan yetkisi talep edin.`
        : 'Bu kategori kilitlidir. Sistem özelliklerini açmak için lütfen bir paket seçin.'
    );
    setTimeout(() => {
      setLockedToast(null);
    }, 3200);
  };

  const handleNavClick = (page: NavPage, label?: string) => {
    if (isGoogleRestricted && !isGoogleUserPageUnlocked(page, userProfile?.email)) {
      triggerLockedNotice(label);
      onSelectPage('paketler');
      return;
    }
    onSelectPage(page);
    if (onCloseMobile && window.innerWidth < 1024) {
      onCloseMobile();
    }
  };

  const renderLockedPill = () => (
    <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 shrink-0">
      <Lock className="w-2.5 h-2.5 text-amber-500 shrink-0" />
      <span>Kilitli</span>
    </span>
  );

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs z-40 lg:hidden"
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      {/* Desktop Compact Icon Rail when sidebar is collapsed (matches screenshot) */}
      {!isOpen && (
        <aside
          id="app-sidebar-compact"
          className="hidden lg:flex flex-col w-14 h-full bg-white dark:bg-[#111c2e] border-r border-slate-200/90 dark:border-slate-800 py-3 items-center shrink-0 z-30 justify-between select-none transition-colors"
        >
          {/* Top Section */}
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="p-1.5 cursor-pointer" onClick={() => handleNavClick('anasayfa')} title="SportsFly">
              <SportsFlyLogo className="w-8 h-8" />
            </div>

            {/* Manager Avatar Icon */}
            <div
              className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs"
              title="SportsFly Manager"
            >
              <SportsFlyIcon className="w-4 h-4" />
            </div>

            <div className="w-8 h-px bg-slate-100 dark:bg-slate-800 my-0.5" />

            {/* Navigation Icons */}
            <div className="flex flex-col items-center gap-1.5 w-full px-2 overflow-y-auto max-h-[calc(100vh-240px)] scrollbar-none">
              {isGoogleRestricted && (
                <button
                  onClick={() => handleNavClick('paketler')}
                  title="Paketler & Abonelik (Açık)"
                  className="p-2.5 rounded-xl transition-all cursor-pointer bg-blue-600 text-white shadow-xs"
                >
                  <Package className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => handleNavClick('anasayfa', 'Anasayfa')}
                title={isRestricted('anasayfa') ? 'Anasayfa (Kilitli)' : 'Anasayfa'}
                className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
                  !isGoogleRestricted && currentPage === 'anasayfa'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isRestricted('anasayfa')
                    ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Home className="w-4 h-4" />
                {isRestricted('anasayfa') && (
                  <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
                )}
              </button>

              {shouldShowItem('on-kayit') && (
                <button
                  onClick={() => handleNavClick('on-kayit', 'Ön Kayıt')}
                  title={isRestricted('on-kayit') ? 'Ön Kayıt (Kilitli)' : 'Ön Kayıt'}
                  className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
                    !isGoogleRestricted && currentPage === 'on-kayit'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isRestricted('on-kayit')
                      ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  {isRestricted('on-kayit') && (
                    <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
                  )}
                </button>
              )}

              <button
                onClick={() => handleNavClick('sporcular', 'Sporcular')}
                title={isRestricted('sporcular') ? 'Sporcular (Kilitli)' : 'Sporcular'}
                className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
                  !isGoogleRestricted && currentPage === 'sporcular'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isRestricted('sporcular')
                    ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                {isRestricted('sporcular') && (
                  <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
                )}
              </button>
              
              <button
                onClick={() => handleNavClick('sporcu-karnesi', 'Sporcu Karnesi')}
                title={isRestricted('sporcu-karnesi') ? 'Sporcu Karnesi (Kilitli)' : 'Sporcu Karnesi'}
                className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
                  !isGoogleRestricted && currentPage === 'sporcu-karnesi'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isRestricted('sporcu-karnesi')
                    ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                {isRestricted('sporcu-karnesi') && (
                  <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
                )}
              </button>

              <button
                onClick={() => handleNavClick('egitim-planlama', 'Eğitim Planlama')}
                title={isRestricted('egitim-planlama') ? 'Eğitim Planlama (Kilitli)' : 'Eğitim Planlama'}
                className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
                  !isGoogleRestricted && currentPage === 'egitim-planlama'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isRestricted('egitim-planlama')
                    ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                {isRestricted('egitim-planlama') && (
                  <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
                )}
              </button>

              {shouldShowItem('subeler') && (
                <button
                  onClick={() => handleNavClick('subeler', 'Şube & Tesis Yönetimi')}
                  title={isRestricted('subeler') ? 'Şube & Tesis Yönetimi (Kilitli)' : 'Şube & Tesis Yönetimi'}
                  className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
                    !isGoogleRestricted && currentPage === 'subeler'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isRestricted('subeler')
                      ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  {isRestricted('subeler') && (
                    <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
                  )}
                </button>
              )}

              {shouldShowItem('sube-ozet') && (
                <button
                  onClick={() => handleNavClick('sube-ozet', 'Şube Özet & Analitik')}
                  title={isRestricted('sube-ozet') ? 'Şube Özet & Analitik (Kilitli)' : 'Şube Özet & Analitik'}
                  className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
                    !isGoogleRestricted && currentPage === 'sube-ozet'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isRestricted('sube-ozet')
                      ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  {isRestricted('sube-ozet') && (
                    <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
                  )}
                </button>
              )}

              {shouldShowItem('brans-yonetimi') && (
                <button
                  onClick={() => handleNavClick('brans-yonetimi', 'Branş Yönetimi')}
                  title={isRestricted('brans-yonetimi') ? 'Branş Yönetimi (Kilitli)' : 'Branş Yönetimi'}
                  className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
                    !isGoogleRestricted && currentPage === 'brans-yonetimi'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isRestricted('brans-yonetimi')
                      ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  {isRestricted('brans-yonetimi') && (
                    <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
                  )}
                </button>
              )}

              {shouldShowItem('gruplar') && (
                <button
                  onClick={() => handleNavClick('gruplar', 'Gruplar')}
                  title={isRestricted('gruplar') ? 'Gruplar (Kilitli)' : 'Gruplar'}
                  className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
                    !isGoogleRestricted && currentPage === 'gruplar'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isRestricted('gruplar')
                      ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {isRestricted('gruplar') && (
                    <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
                  )}
                </button>
              )}

              {/* Ön Muhasebe */}
              {visibleMuhasebeItems.length > 0 && (
                <button
                  onClick={() => handleNavClick(visibleMuhasebeItems[0], 'Ön Muhasebe')}
                  title={isRestricted('on-muhasebe') ? 'Ön Muhasebe (Kilitli)' : 'Ön Muhasebe'}
                  className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
                    !isGoogleRestricted && isOnMuhasebeChildActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isRestricted('on-muhasebe')
                      ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  {isRestricted('on-muhasebe') && (
                    <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
                  )}
                </button>
              )}

              {/* Entegrasyonlar */}
              {shouldShowItem('entegrasyonlar') && (
                <button
                  onClick={() => handleNavClick('entegrasyonlar', 'Entegrasyonlar')}
                  title={isRestricted('entegrasyonlar') ? 'Entegrasyonlar (Kilitli)' : 'Entegrasyonlar & Modül Portalı'}
                  className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
                    !isGoogleRestricted && currentPage === 'entegrasyonlar'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : isRestricted('entegrasyonlar')
                      ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                      : 'text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Blocks className="w-4 h-4" />
                  {isRestricted('entegrasyonlar') && (
                    <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
                  )}
                </button>
              )}

              {/* Yöneticiler */}
              <button
                onClick={() => handleNavClick('yoneticiler', 'Yöneticiler')}
                title={isRestricted('yoneticiler') ? 'Yöneticiler (Kilitli)' : 'Yöneticiler (Spor Okulu Girişi)'}
                className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
                  !isGoogleRestricted && currentPage === 'yoneticiler'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isRestricted('yoneticiler')
                    ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                {isRestricted('yoneticiler') && (
                  <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
                )}
              </button>
            </div>
          </div>

          {/* Bottom Section (Destek, Başvurular, Ayarlar) */}
          <div className="flex flex-col items-center gap-1.5 w-full px-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Destek & Yardım */}
            <button
              onClick={() => handleNavClick('destek', 'Destek & Yardım Masası')}
              title={isRestricted('destek') ? 'Destek Masası (Kilitli)' : 'SportsFly Destek Masası (7/24)'}
              className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
                !isGoogleRestricted && currentPage === 'destek'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isRestricted('destek')
                  ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                  : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800'
              }`}
            >
              <LifeBuoy className="w-4 h-4" />
              {isRestricted('destek') ? (
                <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-1 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Spor Okulu Başvuruları */}
            {shouldShowItem('spor-okulu-basvurulari') && (
              <button
                onClick={() => handleNavClick('spor-okulu-basvurulari', 'Spor Okulu Başvuruları')}
                title={isRestricted('spor-okulu-basvurulari') ? 'Spor Okulu Başvuruları (Kilitli)' : 'Spor Okulu Başvuruları'}
                className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
                  !isGoogleRestricted && currentPage === 'spor-okulu-basvurulari'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : isRestricted('spor-okulu-basvurulari')
                    ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                {isRestricted('spor-okulu-basvurulari') ? (
                  <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
                ) : (
                  pendingBasvuruCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-600 absolute top-1.5 right-1.5 ring-1 ring-white dark:ring-slate-900" />
                  )
                )}
              </button>
            )}

            {/* Ayarlar & Yetkilendirmeler */}
            {(isSuperAdmin || isGoogleRestricted) && (
              <button
                onClick={() => handleNavClick('yetkilendirmeler', 'Ayarlar & Yetkilendirmeler')}
                title={isRestricted('yetkilendirmeler') ? 'Ayarlar (Kilitli)' : 'Ayarlar > Yetkilendirme & Roller'}
                className={`p-2.5 rounded-xl transition-all relative cursor-pointer ${
                  !isGoogleRestricted && currentPage === 'yetkilendirmeler'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isRestricted('yetkilendirmeler')
                    ? 'text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 opacity-75'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                {isRestricted('yetkilendirmeler') && (
                  <Lock className="w-2.5 h-2.5 text-amber-500 absolute top-1 right-1" />
                )}
              </button>
            )}
          </div>
        </aside>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            id="app-sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-[#111c2e] border-r border-slate-200/90 dark:border-slate-800 flex flex-col shadow-2xl lg:static lg:w-64 lg:shadow-none lg:shrink-0"
          >
        {/* Brand Logo matching the screenshots */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <SportsFlyLogo className="w-9 h-9" />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                SportsFly
              </span>
            </div>
          </div>
          {/* Mobile Close Button (44px touch target) */}
          <button
            id="sidebar-close-mobile-btn"
            onClick={onCloseMobile}
            className="w-10 h-10 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Menüyü Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Manager / Account status badge */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80 dark:bg-[#162238]/70 border border-slate-200/60 dark:border-slate-700 transition-colors">
            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              {isGoogleRestricted ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <SportsFlyIcon className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {isGoogleRestricted ? userProfile.name || 'Google Kullanıcısı' : 'SportsFly Manager'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {isGoogleRestricted ? 'Google Hesabı' : 'Admin Portalı'}
              </p>
            </div>
          </div>
        </div>

        {/* Locked Toast Notice inside Sidebar when a locked category is clicked */}
        {lockedToast && (
          <div className="mx-3 mt-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2 animate-in fade-in duration-150">
            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span className="font-semibold leading-snug">{lockedToast}</span>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-sm">
          {/* Paketler & Abonelik — Always Unlocked and Active for Google Users */}
          {isGoogleRestricted && (
            <div className="pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleNavClick('paketler')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all cursor-pointer bg-blue-600 text-white shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 shrink-0" />
                  <span>Paketler &amp; Abonelik</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500 text-white">
                  Açık
                </span>
              </button>
              <div className="mt-2.5 px-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-500" />
                  Kilitli Kategoriler
                </span>
                <span>Paket Gerekli</span>
              </div>
            </div>
          )}

          {/* Anasayfa */}
          <button
            onClick={() => handleNavClick('anasayfa', t('sidebar.dashboard'))}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
              !isGoogleRestricted && currentPage === 'anasayfa'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : isRestricted('anasayfa')
                ? 'text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Home className="w-4 h-4 shrink-0" />
              <span>{t('sidebar.dashboard')}</span>
            </div>
            {isRestricted('anasayfa') && renderLockedPill()}
          </button>

          {/* Ön Kayıt */}
          {shouldShowItem('on-kayit') && (
            <button
              onClick={() => handleNavClick('on-kayit', t('sidebar.preRegistration'))}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                !isGoogleRestricted && currentPage === 'on-kayit'
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : isRestricted('on-kayit')
                  ? 'text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>{t('sidebar.preRegistration')}</span>
              </div>
              {isRestricted('on-kayit') ? (
                renderLockedPill()
              ) : (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  currentPage === 'on-kayit'
                    ? 'bg-blue-700 text-white'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                }`}>
                  Yeni
                </span>
              )}
            </button>
          )}

          {/* Kulüpler (Accordion) */}
          <div className="pt-1">
            <button
              onClick={() => {
                setIsBusinessesOpen(!isBusinessesOpen);
                if (isGoogleRestricted && !isBusinessesOpen) {
                  triggerLockedNotice(t('sidebar.clubs'));
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                !isGoogleRestricted && isBusinessChildActive
                  ? 'text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-900/30 font-semibold'
                  : isGoogleRestricted
                  ? 'text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 shrink-0" />
                <span>{t('sidebar.clubs')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isGoogleRestricted && renderLockedPill()}
                {isBusinessesOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {/* Sub-menu items */}
            {isBusinessesOpen && (
              <div className="ml-5 mt-1 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-4">
                {/* 1. Kadro & Yapılanma */}
                <div className="space-y-1">
                  <div className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pb-1 pt-0.5 flex items-center justify-between">
                    <span>KADRO &amp; YAPILANMA</span>
                    {isGoogleRestricted && <Lock className="w-2.5 h-2.5 text-amber-500" />}
                  </div>
                  {shouldShowItem('sporcular') && (
                    <button
                      onClick={() => handleNavClick('sporcular', t('sidebar.athletes'))}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'sporcular'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('sporcular')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{t('sidebar.athletes')}</span>
                      </div>
                      {isRestricted('sporcular') && renderLockedPill()}
                    </button>
                  )}
                  {shouldShowItem('gruplar') && (
                    <button
                      onClick={() => handleNavClick('gruplar', t('sidebar.groups'))}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'gruplar'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('gruplar')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{t('sidebar.groups')}</span>
                      </div>
                      {isRestricted('gruplar') && renderLockedPill()}
                    </button>
                  )}
                  {shouldShowItem('egitmenler') && (
                    <button
                      onClick={() => handleNavClick('egitmenler', t('sidebar.trainers'))}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'egitmenler'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('egitmenler')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>{t('sidebar.trainers')}</span>
                      </div>
                      {isRestricted('egitmenler') && renderLockedPill()}
                    </button>
                  )}
                  {shouldShowItem('yoneticiler') && (
                    <button
                      onClick={() => handleNavClick('yoneticiler', 'Yöneticiler')}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'yoneticiler'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('yoneticiler')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-3.5 h-3.5 shrink-0" />
                        <span>Yöneticiler</span>
                      </div>
                      {isRestricted('yoneticiler') ? (
                        renderLockedPill()
                      ) : (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            currentPage === 'yoneticiler'
                              ? 'bg-blue-700 text-white'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400'
                          }`}
                        >
                          Erişim
                        </span>
                      )}
                    </button>
                  )}
                </div>

                {/* 2. Planlama & Etkinlik */}
                <div className="space-y-1">
                  <div className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pb-1 pt-1.5 flex items-center justify-between">
                    <span>PLANLAMA &amp; ETKİNLİK</span>
                    {isGoogleRestricted && <Lock className="w-2.5 h-2.5 text-amber-500" />}
                  </div>
                  {shouldShowItem('subeler') && (
                    <button
                      onClick={() => handleNavClick('subeler', 'Şube Yönetimi')}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'subeler'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('subeler')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Şube Yönetimi</span>
                      </div>
                      {isRestricted('subeler') ? (
                        renderLockedPill()
                      ) : (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            currentPage === 'subeler'
                              ? 'bg-blue-700 text-white'
                              : 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800'
                          }`}
                        >
                          Çoklu
                        </span>
                      )}
                    </button>
                  )}
                  {shouldShowItem('brans-yonetimi') && (
                    <button
                      onClick={() => handleNavClick('brans-yonetimi', 'Branş Yönetimi')}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'brans-yonetimi'
                          ? 'bg-blue-600 text-white font-semibold'
                          : isRestricted('brans-yonetimi')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>Branş Yönetimi</span>
                      </div>
                      {isRestricted('brans-yonetimi') && renderLockedPill()}
                    </button>
                  )}
                  {shouldShowItem('egitim-planlama') && (
                    <button
                      onClick={() => handleNavClick('egitim-planlama', t('sidebar.trainingPlanning'))}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'egitim-planlama'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('egitim-planlama')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{t('sidebar.trainingPlanning')}</span>
                      </div>
                      {isRestricted('egitim-planlama') ? (
                        renderLockedPill()
                      ) : (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            currentPage === 'egitim-planlama'
                              ? 'bg-blue-700 text-white'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400'
                          }`}
                        >
                          Müfredat
                        </span>
                      )}
                    </button>
                  )}
                  {shouldShowItem('antrenman-takvimi') && (
                    <button
                      onClick={() => handleNavClick('antrenman-takvimi', t('sidebar.calendar'))}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'antrenman-takvimi'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('antrenman-takvimi')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>{t('sidebar.calendar')}</span>
                      </div>
                      {isRestricted('antrenman-takvimi') && renderLockedPill()}
                    </button>
                  )}
                </div>

                {/* 3. Operasyon & Analitik */}
                <div className="space-y-1">
                  <div className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pb-1 pt-1.5 flex items-center justify-between">
                    <span>OPERASYON &amp; ANALİTİK</span>
                    {isGoogleRestricted && <Lock className="w-2.5 h-2.5 text-amber-500" />}
                  </div>
                  {shouldShowItem('yoklama') && (
                    <button
                      onClick={() => handleNavClick('yoklama', t('sidebar.attendance'))}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'yoklama'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('yoklama')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>{t('sidebar.attendance')}</span>
                      </div>
                      {isRestricted('yoklama') && renderLockedPill()}
                    </button>
                  )}
                  {shouldShowItem('sporcu-karnesi') && (
                    <button
                      onClick={() => handleNavClick('sporcu-karnesi', 'Sporcu Karnesi')}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'sporcu-karnesi'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('sporcu-karnesi')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>Sporcu Karnesi</span>
                      </div>
                      {isRestricted('sporcu-karnesi') && renderLockedPill()}
                    </button>
                  )}
                  {shouldShowItem('sube-ozet') && (
                    <button
                      onClick={() => handleNavClick('sube-ozet', 'Şube Özeti & Finans')}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'sube-ozet'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('sube-ozet')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Şube Özeti &amp; Finans</span>
                      </div>
                      {isRestricted('sube-ozet') ? (
                        renderLockedPill()
                      ) : (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            currentPage === 'sube-ozet'
                              ? 'bg-blue-700 text-white'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800'
                          }`}
                        >
                          Özet
                        </span>
                      )}
                    </button>
                  )}
                </div>

                {/* 4. İletişim & Belgeler */}
                <div className="space-y-1">
                  <div className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 pb-1 pt-1.5 flex items-center justify-between">
                    <span>İLETİŞİM &amp; BELGELER</span>
                    {isGoogleRestricted && <Lock className="w-2.5 h-2.5 text-amber-500" />}
                  </div>
                  {shouldShowItem('kulup-evraklari') && (
                    <button
                      onClick={() => handleNavClick('kulup-evraklari', 'Kulüp Evrakları')}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'kulup-evraklari'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('kulup-evraklari')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Kulüp Evrakları</span>
                      </div>
                      {isRestricted('kulup-evraklari') && renderLockedPill()}
                    </button>
                  )}
                  {shouldShowItem('kulup-galerisi') && (
                    <button
                      onClick={() => handleNavClick('kulup-galerisi', 'Medya Yönetimi')}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'kulup-galerisi'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('kulup-galerisi')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FolderTree className="w-3.5 h-3.5" />
                        <span>Medya Yönetimi</span>
                      </div>
                      {isRestricted('kulup-galerisi') ? (
                        renderLockedPill()
                      ) : (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            currentPage === 'kulup-galerisi'
                              ? 'bg-blue-700 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Klasör
                        </span>
                      )}
                    </button>
                  )}
                  {shouldShowItem('anket-yonetimi') && (
                    <button
                      onClick={() => handleNavClick('anket-yonetimi', 'Anket Yönetimi')}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'anket-yonetimi'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('anket-yonetimi')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Anket Yönetimi</span>
                      </div>
                      {isRestricted('anket-yonetimi') && renderLockedPill()}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ENTEGRASYONLAR */}
          {shouldShowItem('entegrasyonlar') && (
            <div className="pt-2">
              <button
                onClick={() => handleNavClick('entegrasyonlar', 'Entegrasyonlar')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                  !isGoogleRestricted && currentPage === 'entegrasyonlar'
                    ? 'text-white bg-gradient-to-r from-orange-500 to-amber-600 font-bold shadow-xs'
                    : isRestricted('entegrasyonlar')
                    ? 'text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Blocks className={`w-4 h-4 shrink-0 ${!isGoogleRestricted && currentPage === 'entegrasyonlar' ? 'text-white' : isRestricted('entegrasyonlar') ? 'text-slate-400' : 'text-orange-500'}`} />
                  <span className="font-semibold">Entegrasyonlar</span>
                </div>
                {isRestricted('entegrasyonlar') ? (
                  renderLockedPill()
                ) : (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      currentPage === 'entegrasyonlar'
                        ? 'bg-orange-700 text-white'
                        : 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300'
                    }`}
                  >
                    Yeni
                  </span>
                )}
              </button>
            </div>
          )}

          {/* ÖN MUHASEBE (Accordion) */}
          {visibleMuhasebeItems.length > 0 && (
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsOnMuhasebeOpen(!isOnMuhasebeOpen);
                  if (isGoogleRestricted && !isOnMuhasebeOpen) {
                    triggerLockedNotice('Ön Muhasebe');
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                  !isGoogleRestricted && isOnMuhasebeChildActive
                    ? 'text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 font-bold'
                    : isGoogleRestricted
                    ? 'text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Receipt className={`w-4 h-4 shrink-0 ${isGoogleRestricted ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`} />
                  <span className={`font-semibold ${isGoogleRestricted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>Ön Muhasebe</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isGoogleRestricted && renderLockedPill()}
                  {isOnMuhasebeOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Ön Muhasebe Sub-items */}
              {isOnMuhasebeOpen && (
                <div className="ml-5 mt-1 pl-3 border-l-2 border-slate-200 dark:border-slate-800 space-y-1">
                  {shouldShowItem('on-muhasebe') && (
                    <button
                      onClick={() => handleNavClick('on-muhasebe', t('sidebar.finance'))}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'on-muhasebe'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('on-muhasebe')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Receipt className="w-3.5 h-3.5 shrink-0" />
                        <span>{t('sidebar.finance')}</span>
                      </div>
                      {isRestricted('on-muhasebe') && renderLockedPill()}
                    </button>
                  )}

                  {shouldShowItem('gelir-gider-kategori') && (
                    <button
                      onClick={() => handleNavClick('gelir-gider-kategori', 'Gelir/Gider Kategori')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'gelir-gider-kategori'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('gelir-gider-kategori')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-3.5 h-3.5 shrink-0" />
                        <span className="leading-snug">Gelir/Gider Kategori</span>
                      </div>
                      {isRestricted('gelir-gider-kategori') && renderLockedPill()}
                    </button>
                  )}

                  {shouldShowItem('gelir-gider-yonetimi') && (
                    <button
                      onClick={() => handleNavClick('gelir-gider-yonetimi', 'Gelir/Gider Yönetimi')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'gelir-gider-yonetimi'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('gelir-gider-yonetimi')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <FolderTree className="w-3.5 h-3.5 shrink-0" />
                        <span>Gelir/Gider Yönetimi</span>
                      </div>
                      {isRestricted('gelir-gider-yonetimi') && renderLockedPill()}
                    </button>
                  )}

                  {shouldShowItem('odeme-plani-kontrol') && (
                    <button
                      onClick={() => handleNavClick('odeme-plani-kontrol', 'Ödeme Planı Kontrol')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'odeme-plani-kontrol'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('odeme-plani-kontrol')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Receipt className="w-3.5 h-3.5 shrink-0" />
                        <span>Ödeme Planı Kontrol</span>
                      </div>
                      {isRestricted('odeme-plani-kontrol') && renderLockedPill()}
                    </button>
                  )}

                  {shouldShowItem('odeme-plani') && (
                    <button
                      onClick={() => handleNavClick('odeme-plani', 'Ödeme Planı')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        !isGoogleRestricted && currentPage === 'odeme-plani'
                          ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                          : isRestricted('odeme-plani')
                          ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                        <span>Ödeme Planı</span>
                      </div>
                      {isRestricted('odeme-plani') && renderLockedPill()}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SportsFly Destek & Yardım Masası */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
            <button
              onClick={() => handleNavClick('destek', 'Destek & Yardım Masası')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isGoogleRestricted && currentPage === 'destek'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isRestricted('destek')
                  ? 'text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 font-medium'
                  : 'bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LifeBuoy className={`w-4 h-4 ${isRestricted('destek') ? 'text-slate-400' : 'text-blue-500 dark:text-blue-300'}`} />
                <span>Destek &amp; Yardım Masası</span>
              </div>
              {isRestricted('destek') ? (
                renderLockedPill()
              ) : (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                    currentPage === 'destek'
                      ? 'bg-blue-700 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  7/24
                </span>
              )}
            </button>
          </div>

          {/* Spor Okulu Başvuruları */}
          {shouldShowItem('spor-okulu-basvurulari') && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
              <button
                onClick={() => handleNavClick('spor-okulu-basvurulari', 'Spor Okulu Başvuruları')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isGoogleRestricted && currentPage === 'spor-okulu-basvurulari'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : isRestricted('spor-okulu-basvurulari')
                    ? 'text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 font-medium'
                    : 'bg-amber-50/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className={`w-4 h-4 shrink-0 ${isRestricted('spor-okulu-basvurulari') ? 'text-slate-400' : 'text-amber-600 dark:text-amber-400'}`} />
                  <span>Spor Okulu Başvuruları</span>
                </div>
                {isRestricted('spor-okulu-basvurulari') ? (
                  renderLockedPill()
                ) : (
                  pendingBasvuruCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-red-600 text-white animate-bounce shadow-xs">
                      {pendingBasvuruCount}
                    </span>
                  )
                )}
              </button>
            </div>
          )}

          {/* AYARLAR (Sol Menüde En Altta) */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 mt-2 space-y-1">
            <div className="px-3 py-1 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                Ayarlar
              </span>
              {isGoogleRestricted && <Lock className="w-3 h-3 text-amber-500" />}
            </div>

            {/* Yetkilendirme & Roller */}
            {(isSuperAdmin || isGoogleRestricted) && (
              <button
                onClick={() => handleNavClick('yetkilendirmeler', 'Yetkilendirme & Roller')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  !isGoogleRestricted && currentPage === 'yetkilendirmeler'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : isRestricted('yetkilendirmeler')
                    ? 'text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>Yetkilendirme &amp; Roller</span>
                </div>
                {isRestricted('yetkilendirmeler') && renderLockedPill()}
              </button>
            )}

            {/* Kulüp Sözleşmeleri */}
            {(isSuperAdmin || isGoogleRestricted) && shouldShowItem('kullanici-sozlesmeleri') && (
              <button
                onClick={() => handleNavClick('kullanici-sozlesmeleri', 'Kulüp Sözleşmeleri')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !isGoogleRestricted && currentPage === 'kullanici-sozlesmeleri'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : isRestricted('kullanici-sozlesmeleri')
                    ? 'text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>Kulüp Sözleşmeleri</span>
                </div>
                {isRestricted('kullanici-sozlesmeleri') && renderLockedPill()}
              </button>
            )}
          </div>
        </div>

        {/* Active Package Status Card & Footer info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b1320]/60">
          {isGoogleRestricted ? (
            <div className="mb-2.5 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Üyelik Durumu
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Kilitli
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Paket Seçilmedi
                </span>
                <button
                  onClick={() => handleNavClick('paketler')}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Paket Seç &gt;
                </button>
              </div>
            </div>
          ) : (
            currentPlan && (
              <div className="mb-2.5 p-2.5 rounded-xl bg-white dark:bg-[#162238] border border-slate-200/90 dark:border-slate-700 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Aktif Paket
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                    {PACKAGE_DETAILS[currentPlan]?.priceFormatted}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {currentPlan}
                  </span>
                  <button
                    onClick={() => handleNavClick('paketler')}
                    className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline cursor-pointer"
                    title="Paketleri incele ve yükselt"
                  >
                    Yükselt
                  </button>
                </div>
              </div>
            )
          )}

          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            Sporsepeti &amp; SportsFly &copy; 2026
          </p>
        </div>
      </motion.aside>
      )}
    </AnimatePresence>
    </>
  );
};
