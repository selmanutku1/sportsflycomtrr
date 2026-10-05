import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { NavPage, PackagePlanType } from './types';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { INITIAL_SPORCULAR } from './data/mockData';
import { PackageAccessRestrictedView } from './components/views/PackageAccessRestrictedView';
import { LoginView } from './components/LoginView';
import { PointEarnedPushToast } from './components/notifications/PointEarnedPushToast';
import { ReminderPushToast } from './components/notifications/ReminderPushToast';
import {
  getActiveSessionPlan,
  isPageAllowedForPlan,
  getPageRestrictionInfo,
  isSuperAdminUser,
  isGoogleRestrictedUser,
  isGoogleUserPageUnlocked,
} from './data/packagePermissions';
import { getStoredUserProfile, saveStoredUserProfile, UserProfileData, ADMIN_GOOGLE_EMAIL } from './data/userProfile';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { fetchAndMergeGoogleUsersFromFirestore } from './data/googleUsersAccess';
import { syncGoogleProfileData } from './services/userService';

// Lazy-loaded view modules for instant initial load & code splitting
const DashboardView = lazy(() =>
  import('./components/views/DashboardView').then((m) => ({ default: m.DashboardView }))
);
const SporsepetiUserView = lazy(() =>
  import('./components/views/SporsepetiUserView').then((m) => ({ default: m.SporsepetiUserView }))
);
const SporcularView = lazy(() =>
  import('./components/views/SporcularView').then((m) => ({ default: m.SporcularView }))
);
const EgitmenlerView = lazy(() =>
  import('./components/views/EgitmenlerView').then((m) => ({ default: m.EgitmenlerView }))
);
const AntrenmanTakvimiView = lazy(() =>
  import('./components/views/AntrenmanTakvimiView').then((m) => ({ default: m.AntrenmanTakvimiView }))
);
const YoneticilerView = lazy(() =>
  import('./components/views/YoneticilerView').then((m) => ({ default: m.YoneticilerView }))
);
const SporpuanDegerlendirmelerView = lazy(() =>
  import('./components/views/sporpuan/SporpuanDegerlendirmelerView').then((m) => ({
    default: m.SporpuanDegerlendirmelerView,
  }))
);
const SporpuanSporcuDegerlendirmeView = lazy(() =>
  import('./components/views/sporpuan/SporpuanSporcuDegerlendirmeView').then((m) => ({
    default: m.SporpuanSporcuDegerlendirmeView,
  }))
);
const SporpuanDogrulamalarView = lazy(() =>
  import('./components/views/sporpuan/SporpuanDogrulamalarView').then((m) => ({
    default: m.SporpuanDogrulamalarView,
  }))
);
const SporpuanRaporlarView = lazy(() =>
  import('./components/views/sporpuan/SporpuanRaporlarView').then((m) => ({
    default: m.SporpuanRaporlarView,
  }))
);
const GruplarView = lazy(() =>
  import('./components/views/GruplarView').then((m) => ({ default: m.GruplarView }))
);
const OnMuhasebeView = lazy(() =>
  import('./components/views/OnMuhasebeView').then((m) => ({ default: m.OnMuhasebeView }))
);
const YoklamaView = lazy(() =>
  import('./components/views/YoklamaView').then((m) => ({ default: m.YoklamaView }))
);
const AnketYonetimiView = lazy(() =>
  import('./components/views/AnketYonetimiView').then((m) => ({ default: m.AnketYonetimiView }))
);
const SporcuKarnesiView = lazy(() =>
  import('./components/views/SporcuKarnesiView').then((m) => ({ default: m.SporcuKarnesiView }))
);
const EgitimPlanlamaView = lazy(() =>
  import('./components/views/EgitimPlanlamaView').then((m) => ({ default: m.EgitimPlanlamaView }))
);
const KulupSozlesmeleriView = lazy(() =>
  import('./components/views/KulupSozlesmeleriView').then((m) => ({ default: m.KulupSozlesmeleriView }))
);
const SporOkuluBasvurulariView = lazy(() =>
  import('./components/views/SporOkuluBasvurulariView').then((m) => ({
    default: m.SporOkuluBasvurulariView,
  }))
);
const KulupEvraklariView = lazy(() =>
  import('./components/views/sporcu/KulupEvraklariView').then((m) => ({
    default: m.KulupEvraklariView,
  }))
);
const KulupGalerisiView = lazy(() =>
  import('./components/views/sporcu/KulupGalerisiView').then((m) => ({
    default: m.KulupGalerisiView,
  }))
);
const TurnuvaYonetimiView = lazy(() =>
  import('./components/views/moduller/TurnuvaYonetimiView').then((m) => ({
    default: m.TurnuvaYonetimiView,
  }))
);
const EnvanterYonetimiView = lazy(() =>
  import('./components/views/moduller/EnvanterYonetimiView').then((m) => ({
    default: m.EnvanterYonetimiView,
  }))
);
const ReferralProgramView = lazy(() =>
  import('./components/views/moduller/ReferralProgramView').then((m) => ({
    default: m.ReferralProgramView,
  }))
);
const EntegrasyonlarView = lazy(() =>
  import('./components/views/EntegrasyonlarView').then((m) => ({ default: m.EntegrasyonlarView }))
);
const PaketlerView = lazy(() =>
  import('./components/views/PaketlerView').then((m) => ({ default: m.PaketlerView }))
);
const OnKayitView = lazy(() =>
  import('./components/views/OnKayitView').then((m) => ({ default: m.OnKayitView }))
);
const YetkilendirmelerView = lazy(() =>
  import('./components/views/YetkilendirmelerView').then((m) => ({ default: m.YetkilendirmelerView }))
);
const SubelerView = lazy(() =>
  import('./components/views/SubelerView').then((m) => ({ default: m.SubelerView }))
);
const SubeOzetView = lazy(() =>
  import('./components/views/SubeOzetView').then((m) => ({ default: m.SubeOzetView }))
);
const DestekView = lazy(() =>
  import('./components/views/DestekView').then((m) => ({ default: m.DestekView }))
);
const GenericPageView = lazy(() =>
  import('./components/views/GenericPageView').then((m) => ({ default: m.GenericPageView }))
);

const ViewLoadingSkeleton: React.FC = () => (
  <div className="w-full space-y-4 animate-pulse py-2">
    <div className="h-20 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60 w-full" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      <div className="h-24 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
      <div className="h-24 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
      <div className="h-24 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
      <div className="h-24 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60" />
    </div>
    <div className="h-80 rounded-2xl bg-slate-200/70 dark:bg-slate-800/60 w-full" />
  </div>
);

export default function App() {
  // Authentication State: defaults to false so user immediately sees the identical login page
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('sportsfly_auth_active');
        if (stored === 'true') return true;
        if (stored === 'false') return false;
      } catch (e) {}
    }
    return false;
  });

  const handleLoginSuccess = async (userData: { email: string; name: string; photoURL?: string; uid?: string; role?: string }) => {
    // If it's a Google login (has email and name), sync it
    if (userData.email && userData.name) {
        await syncGoogleProfileData(userData.email, userData.name, userData.photoURL, userData.uid);
    }

    const freshProfile = getStoredUserProfile();
    setUserProfile(freshProfile);
    setIsAuthenticated(true);
    if (isGoogleRestrictedUser(userData.role || freshProfile?.role, freshProfile?.email)) {
      setCurrentPage('paketler');
      try {
        sessionStorage.setItem('sportsfly_active_page', 'paketler');
      } catch (e) {}
    } else if (!isSuperAdminUser(userData.role || freshProfile?.role, freshProfile?.email)) {
      setCurrentPage((prev) =>
        prev === 'spor-okulu-basvurulari' ? 'anasayfa' : prev
      );
    }
    try {
      sessionStorage.setItem('sportsfly_auth_active', 'true');
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('sportsfly_auth_channel');
        ch.postMessage({ type: 'LOGIN', role: userData.role || freshProfile?.role });
        ch.close();
      }
    } catch (e) {}
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    signOut(auth).catch(() => {});
    try {
      sessionStorage.setItem('sportsfly_auth_active', 'false');
      sessionStorage.removeItem('sportsfly_active_page');
      if (typeof BroadcastChannel !== 'undefined') {
        const ch = new BroadcastChannel('sportsfly_auth_channel');
        ch.postMessage({ type: 'LOGOUT' });
        ch.close();
      }
    } catch (e) {}
  };

  const mainScrollRef = useRef<HTMLElement | null>(null);

  const [currentPage, setCurrentPage] = useState<NavPage>(() => {
    if (typeof window !== 'undefined') {
      try {
        const activeSessionPage = sessionStorage.getItem('sportsfly_active_page');
        if (activeSessionPage) {
          return activeSessionPage as NavPage;
        }
        const stored = localStorage.getItem('sportsfly_user_profile_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.preferences?.defaultPage) {
            return parsed.preferences.defaultPage as NavPage;
          }
        }
      } catch (e) {}
    }
    return 'gruplar';
  });

  const [currentPlan, setCurrentPlan] = useState<PackagePlanType>(() => getActiveSessionPlan());
  const [userProfile, setUserProfile] = useState<UserProfileData>(() => {
    const prof = getStoredUserProfile();
    if (prof.email?.trim().toLowerCase() === ADMIN_GOOGLE_EMAIL) {
      const upgraded: UserProfileData = {
        ...prof,
        email: ADMIN_GOOGLE_EMAIL,
        role: 'Süper Admin',
        hasActivePackage: true,
      };
      saveStoredUserProfile(upgraded);
      return upgraded;
    }
    return prof;
  });

  // Listen for plan, profile, cross-tab auth, browser back/forward, and Escape key
  useEffect(() => {
    const handlePlanUpdate = () => {
      setCurrentPlan(getActiveSessionPlan());
    };

    const handleProfileUpdate = () => {
      setUserProfile(getStoredUserProfile());
    };

    const handleGoogleUsersUpdate = () => {
      setUserProfile(getStoredUserProfile());
    };

    const handlePopState = (event: PopStateEvent) => {
      const targetPage = event.state?.sportsflyPage as NavPage | undefined;
      if (targetPage) {
        setCurrentPage(targetPage);
        try {
          sessionStorage.setItem('sportsfly_active_page', targetPage);
        } catch (e) {}
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };

    let authChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        authChannel = new BroadcastChannel('sportsfly_auth_channel');
        authChannel.onmessage = (ev) => {
          if (ev.data?.type === 'LOGOUT') {
            setIsAuthenticated(false);
            try {
              sessionStorage.setItem('sportsfly_auth_active', 'false');
              sessionStorage.removeItem('sportsfly_active_page');
            } catch (e) {}
          } else if (ev.data?.type === 'LOGIN') {
            setUserProfile(getStoredUserProfile());
            setIsAuthenticated(true);
            try {
              sessionStorage.setItem('sportsfly_auth_active', 'true');
            } catch (e) {}
          }
        };
      } catch (e) {}
    }

    window.addEventListener('storage', handlePlanUpdate);
    window.addEventListener('sportsfly_plan_changed', handlePlanUpdate);
    window.addEventListener('sportsfly_plan_updated', handlePlanUpdate);
    window.addEventListener('sportsfly_profile_updated', handleProfileUpdate);
    window.addEventListener('sportsfly_google_users_updated', handleGoogleUsersUpdate);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    // Firebase Auth session listener & Firestore sync
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const storedAuthActive = sessionStorage.getItem('sportsfly_auth_active');
        if (storedAuthActive !== 'false') {
          setIsAuthenticated(true);
        }
        fetchAndMergeGoogleUsersFromFirestore().catch(() => {});
      } else {
        const storedAuthActive = sessionStorage.getItem('sportsfly_auth_active');
        if (storedAuthActive === 'false') {
          setIsAuthenticated(false);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (authChannel) authChannel.close();
      window.removeEventListener('storage', handlePlanUpdate);
      window.removeEventListener('sportsfly_plan_changed', handlePlanUpdate);
      window.removeEventListener('sportsfly_plan_updated', handlePlanUpdate);
      window.removeEventListener('sportsfly_profile_updated', handleProfileUpdate);
      window.removeEventListener('sportsfly_google_users_updated', handleGoogleUsersUpdate);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  React.useEffect(() => {
    let prevWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (prevWidth < 1024 && currentWidth >= 1024) {
        setIsSidebarOpen(true);
      } else if (prevWidth >= 1024 && currentWidth < 1024) {
        setIsSidebarOpen(false);
      }
      prevWidth = currentWidth;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handlePageSelect = (page: NavPage) => {
    const isGoogleRestricted = isGoogleRestrictedUser(userProfile?.role, userProfile?.email);
    const targetPage: NavPage =
      isGoogleRestricted && !isGoogleUserPageUnlocked(page, userProfile?.email)
        ? 'paketler'
        : page;
    setCurrentPage(targetPage);
    try {
      sessionStorage.setItem('sportsfly_active_page', targetPage);
      if (typeof window !== 'undefined' && window.history?.pushState) {
        window.history.pushState({ sportsflyPage: targetPage }, '', window.location.pathname);
      }
    } catch (e) {}
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const PAGE_SEO_MAP: Partial<Record<NavPage, { title: string; description: string }>> = {
      anasayfa: {
        title: 'Kontrol Paneli | SportsFly — Spor Okulu & Akademi Yönetimi',
        description:
          'Kulübünüzün anlık sporcu sayısı, aidat tahsilat oranı, yoklama istatistikleri ve finansal performans özeti.',
      },
      'on-kayit': {
        title: 'Ön Kayıt & Başvurular | SportsFly Yönetim Sistemi',
        description:
          'Online sporcu ön kayıt başvurularını, deneme antrenmanı taleplerini ve kesin kayıt onaylarını yönetin.',
      },
      sporcular: {
        title: 'Sporcu Yönetimi | SportsFly — Spor Okulu & Akademi Yönetimi',
        description:
          'Kayıtlı sporcu profilleri, veli iletişim bilgileri, sağlık evrakları, grup atamaları ve aidat durumları.',
      },
      'sporcu-karnesi': {
        title: 'Dijital Sporcu Karnesi & Performans | SportsFly',
        description:
          'Antropometrik ölçümler, atletik performans testleri, gelişim grafikleri ve velilere özel dijital sporcu karnesi.',
      },
      'egitim-planlama': {
        title: 'Eğitim Planlama & Antrenman Müfredatı | SportsFly',
        description:
          'Branş ve yaş gruplarına özel haftalık antrenman planları, taktik tahtası ve sezonluk gelişim müfredatı.',
      },
      subeler: {
        title: 'Şube & Tesis Yönetimi | SportsFly',
        description:
          'Çoklu şube, spor tesisi, saha/salon kapasiteleri ve şube bazlı doluluk oranlarını tek merkezden yönetin.',
      },
      'sube-ozet': {
        title: 'Şube Özet & Karşılaştırmalı Analitik | SportsFly',
        description:
          'Şubeler arası sporcu sayısı, tahsilat performansı ve gelir-gider karşılaştırma raporları.',
      },
      egitmenler: {
        title: 'Eğitmen & Antrenör Kadrosu | SportsFly',
        description:
          'Antrenör profilleri, uzmanlık branşları, sorumlu olunan gruplar ve ders programı yönetimi.',
      },
      gruplar: {
        title: 'Grup & Takım Yönetimi | SportsFly',
        description:
          'Yaş kategorileri ve seviyelere göre antrenman grupları, kontenjan takibi ve sporcu-grup eşleştirmeleri.',
      },
      'antrenman-takvimi': {
        title: 'Antrenman & Ders Takvimi | SportsFly',
        description:
          'Haftalık saha ve salon antrenman programı, ders saatleri ve tesis kullanım takvimi.',
      },
      yoklama: {
        title: 'Mobil Yoklama & Katılım Takibi | SportsFly',
        description:
          'Hızlı antrenman yoklaması, devamsızlık bildirimleri ve sporcu devamlılık istatistikleri.',
      },
      'on-muhasebe': {
        title: 'Ön Muhasebe & Finans Yönetimi | SportsFly',
        description:
          'Aidat tahsilatları, gelir-gider takibi, kasa/banka hareketleri ve ödeme planı kontrolü.',
      },
      'gelir-gider-kategori': {
        title: 'Gelir & Gider Kategorileri | SportsFly Ön Muhasebe',
        description:
          'Kulüp muhasebesi için gelir ve gider kalemlerini, maliyet merkezlerini yapılandırın.',
      },
      'gelir-gider-yonetimi': {
        title: 'Gelir & Gider Hareketleri | SportsFly Ön Muhasebe',
        description:
          'Fatura, kira, personel ve aidat nakit akışı hareketlerini detaylı olarak takip edin.',
      },
      'odeme-plani-kontrol': {
        title: 'Ödeme Planı & Tahsilat Kontrolü | SportsFly',
        description:
          'Vadesi gelen ve geciken sporcu aidatlarını takip edin, otomatik ödeme hatırlatmaları gönderin.',
      },
      'odeme-plani': {
        title: 'Aidat & Ödeme Planları | SportsFly',
        description:
          'Sporcu bazlı taksitli aidat planları ve online kredi kartı tahsilat yapılandırması.',
      },
      entegrasyonlar: {
        title: 'Entegrasyonlar & Modüller | SportsFly',
        description:
          'Sanal POS, SMS başlığı, WhatsApp bildirimleri ve ek kulüp modüllerini tek tıkla etkinleştirin.',
      },
      'spor-okulu-basvurulari': {
        title: 'Spor Okulu Başvuruları | SportsFly Süper Admin',
        description:
          'Web sitesi ve kayıt formlarından gelen kurumsal spor okulu başvurularını anlık inceleyin ve onaylayın.',
      },
      yetkilendirmeler: {
        title: 'Yetkilendirme & Roller | SportsFly',
        description:
          'Yönetici, antrenör, veli ve sporcu rollerinin modül erişim ve işlem yetkilerini yapılandırın.',
      },
      'kullanici-sozlesmeleri': {
        title: 'Kulüp Sözleşmeleri & KVKK Metinleri | SportsFly',
        description:
          'Kayıt sözleşmeleri, veli muvafakatnameleri ve KVKK aydınlatma metinlerini dijital olarak yönetin.',
      },
      paketler: {
        title: 'Lisans Paketleri & Abonelik | SportsFly',
        description:
          'Kulübünüzün büyüklüğüne uygun SportsFly abonelik paketlerini inceleyin ve yükseltin.',
      },
      destek: {
        title: '7/24 Destek & Yardım Merkezi | SportsFly',
        description:
          'SportsFly teknik destek ekibiyle iletişime geçin, eğitim rehberlerine ve sıkça sorulan sorulara ulaşın.',
      },
    };

    const defaultSeo = {
      title: 'SportsFly — Spor Okulu, Akademi & Kulüp Yönetim Sistemi',
      description:
        'Spor okulları, akademiler ve kulüpler için yeni nesil yönetim yazılımı. Otomatik aidat tahsilatı, mobil yoklama, eğitmen ve veli panelleri, Sporpuan ödül sistemi ve dijital sporcu karneleri.',
    };

    const activeSeo = !isAuthenticated
      ? {
          title: 'Giriş Yap | SportsFly — Spor Okulu, Akademi & Kulüp Yönetim Sistemi',
          description: defaultSeo.description,
        }
      : PAGE_SEO_MAP[currentPage] || defaultSeo;

    document.title = activeSeo.title;

    const setMetaTag = (selector: string, content: string) => {
      const el = document.querySelector(selector);
      if (el) {
        el.setAttribute('content', content);
      }
    };

    setMetaTag('meta[name="description"]', activeSeo.description);
    setMetaTag('meta[property="og:title"]', activeSeo.title);
    setMetaTag('meta[property="og:description"]', activeSeo.description);
    setMetaTag('meta[name="twitter:title"]', activeSeo.title);
    setMetaTag('meta[name="twitter:description"]', activeSeo.description);
  }, [currentPage, isAuthenticated]);

  const renderActiveView = () => {
    // 0. Users registered/logged in via Google (except Super Admin selmanutkumarmara@gmail.com) can see Packages + Admin-enabled areas
    if (
      isGoogleRestrictedUser(userProfile?.role, userProfile?.email) &&
      !isGoogleUserPageUnlocked(currentPage, userProfile?.email)
    ) {
      return <PaketlerView />;
    }

    // 1. Enforce package-tier access limits (Süper Admin has full access to Sporpuan modules regardless of plan)
    if (!isPageAllowedForPlan(currentPage, currentPlan, userProfile?.role)) {
      const restrictionInfo = getPageRestrictionInfo(currentPage, currentPlan, userProfile?.role);
      return (
        <PackageAccessRestrictedView
          page={currentPage}
          currentPlan={currentPlan}
          restriction={restrictionInfo}
          restrictionInfo={restrictionInfo}
          onNavigate={handlePageSelect}
          onUpgradeRequest={() => {
            handlePageSelect('paketler');
          }}
        />
      );
    }

    switch (currentPage) {
      case 'anasayfa':
        return <DashboardView onNavigate={handlePageSelect} />;
      case 'sporsepeti-user':
        return <SporsepetiUserView />;
      case 'sporcular':
        return <SporcularView onNavigate={handlePageSelect} />;
      case 'egitmenler':
        return <EgitmenlerView />;
      case 'gruplar':
        return <GruplarView onNavigate={handlePageSelect} />;
      case 'yoklama':
        return <YoklamaView />;
      case 'anket-yonetimi':
        return <AnketYonetimiView />;
      case 'sporcu-karnesi':
        return <SporcuKarnesiView onNavigate={handlePageSelect} />;
      case 'egitim-planlama':
        return <EgitimPlanlamaView />;
      case 'antrenman-takvimi':
        return <AntrenmanTakvimiView />;
      case 'on-muhasebe':
        return <OnMuhasebeView key="on-muhasebe-genel" initialTab="genel" onNavigate={handlePageSelect} />;
      case 'gelir-gider-kategori':
        return <OnMuhasebeView key="on-muhasebe-kategoriler" initialTab="kategoriler" onNavigate={handlePageSelect} />;
      case 'gelir-gider-yonetimi':
        return <OnMuhasebeView key="on-muhasebe-hareketler" initialTab="hareketler" onNavigate={handlePageSelect} />;
      case 'odeme-plani-kontrol':
        return <OnMuhasebeView key="on-muhasebe-kontrol" initialTab="kontrol" onNavigate={handlePageSelect} />;
      case 'odeme-plani':
        return <OnMuhasebeView key="on-muhasebe-planlar" initialTab="planlar" onNavigate={handlePageSelect} />;
      case 'yoneticiler':
        return <YoneticilerView />;
      case 'sporpuan-sporcu-degerlendirme':
        return <SporpuanSporcuDegerlendirmeView onNavigate={handlePageSelect} />;
      case 'sporpuan-degerlendirmeler':
        return <SporpuanDegerlendirmelerView onNavigate={handlePageSelect} />;
      case 'sporpuan-dogrulamalar':
        return <SporpuanDogrulamalarView />;
      case 'sporpuan-raporlar':
        return <SporpuanRaporlarView />;
      case 'kullanici-sozlesmeleri':
        return <KulupSozlesmeleriView />;
      case 'spor-okulu-basvurulari':
        return <SporOkuluBasvurulariView />;
      case 'yetkilendirmeler':
        return <YetkilendirmelerView />;
      case 'kulup-evraklari':
        return (
          <KulupEvraklariView
            sporcular={(() => {
              try {
                const saved = localStorage.getItem('sportsfly_sporcular');
                if (saved) return JSON.parse(saved);
              } catch (e) {}
              return INITIAL_SPORCULAR;
            })()}
            onNavigate={handlePageSelect}
          />
        );
      case 'kulup-galerisi':
        return (
          <KulupGalerisiView
            sporcular={(() => {
              try {
                const saved = localStorage.getItem('sportsfly_sporcular');
                if (saved) return JSON.parse(saved);
              } catch (e) {}
              return INITIAL_SPORCULAR;
            })()}
            onNavigate={handlePageSelect}
          />
        );
      case 'turnuva-yonetimi':
        return <TurnuvaYonetimiView />;
      case 'envanter-yonetimi':
        return <EnvanterYonetimiView />;
      case 'referans-programi':
        return <ReferralProgramView onNavigate={handlePageSelect} />;
      case 'entegrasyonlar':
        return <EntegrasyonlarView onNavigate={handlePageSelect} />;
      case 'paketler':
      case 'paket-yonetimi':
        return <PaketlerView />;
      case 'on-kayit':
        return <OnKayitView />;
      case 'subeler':
        return <SubelerView onNavigate={handlePageSelect} />;
      case 'sube-ozet':
        return <SubeOzetView onNavigate={handlePageSelect} />;
      case 'destek':
        return <DestekView />;

      default:
        return <GenericPageView page={currentPage} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen h-[100dvh] print:h-auto print:overflow-visible print:static bg-slate-50 dark:bg-[#0b1320] text-slate-800 dark:text-slate-100 flex flex-col antialiased relative transition-colors duration-200 overflow-hidden">
      {/* Mobile/Desktop Instant Point Award Push Notification Toast */}
      <PointEarnedPushToast onNavigate={handlePageSelect} />
      {/* Mobile/Desktop Automatic Yoklama Reminder Push Toast */}
      <ReminderPushToast onNavigate={handlePageSelect} />

      <div className="flex flex-1 overflow-hidden h-full print:h-auto print:overflow-visible print:block">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={handlePageSelect}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
          currentPlan={currentPlan}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden print:h-auto print:overflow-visible print:block">
          {/* Header - Permanently pinned at the top on both web & mobile */}
          <Header
            currentPage={currentPage}
            onToggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            onNavigate={handlePageSelect}
            onLogout={handleLogout}
          />

          {/* Body Content - Dedicated scrollable viewport */}
          <main
            ref={mainScrollRef}
            className="flex-1 p-3.5 sm:p-4 lg:p-6 w-full overflow-y-auto overflow-x-hidden print:p-0 print:overflow-visible print:h-auto"
          >
            <AppErrorBoundary
              key={currentPage}
              onResetToHome={() => handlePageSelect('anasayfa')}
            >
              <Suspense fallback={<ViewLoadingSkeleton />}>
                {renderActiveView()}
              </Suspense>
            </AppErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
}
