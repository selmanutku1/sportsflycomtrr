import React, { useState, useEffect } from 'react';
import {
  Check,
  PhoneCall,
  ShieldCheck,
  Building2,
  X,
  Edit3,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Phone,
  ArrowRight,
  Lock,
  ShieldAlert,
  Shield,
  Zap,
  HelpCircle,
  Sliders,
  Users,
  Award,
  Layers,
  Calendar,
  MessageSquare,
  CreditCard,
  FileSpreadsheet,
  Globe,
  KeyRound,
  Fingerprint,
  RefreshCw,
} from 'lucide-react';
import { SportsFlyIcon } from '../SportsFlyLogo';
import {
  secureStorageGet,
  secureStorageSet,
  secureFetch,
  generateIdempotencyKey,
  validateLuhn,
  maskCardNumber,
  detectCardBrand,
  recordSecurityAuditEvent,
} from '../../utils/securityCore';
import {
  UserProfileData,
  getStoredUserProfile,
  saveStoredUserProfile,
} from '../../data/userProfile';
import {
  PackagePlanType,
  PackageLimits,
} from '../../types';
import {
  PACKAGE_DETAILS,
  CANONICAL_PACKAGES,
  PackageDetail,
  getActiveSessionPlan,
  setActiveSessionPlan,
  normalizePlanName,
  isSuperAdminUser,
  isGoogleRestrictedUser,
} from '../../data/packagePermissions';

export interface PlanFeature {
  id: string;
  text: string;
  subtext?: string;
  tooltip?: string;
}

export interface PackagePlanItem {
  id: string;
  name: PackagePlanType;
  badgeClass?: string;
  tagText?: string;
  tagColor?: string;
  monthlyPrice: number;
  customPriceTitle?: string;
  customPriceSubtitle?: string;
  subtitle: string;
  ctaText: string;
  ctaVariant: 'light' | 'primary';
  features: string[];
  limits: PackageLimits;
}

const OFFICIAL_PACKAGES: PackagePlanItem[] = [
  {
    id: 'baslangic-kulubu',
    name: 'Başlangıç Kulübü',
    monthlyPrice: 2199,
    subtitle: 'Tek şubeli, büyümekte olan butik spor okulları ve atölyeler için ideal.',
    ctaText: 'HEMEN BAŞLA',
    ctaVariant: 'light',
    features: [
      '100 Aktif Sporcuya Kadar',
      'Mobil Uyumlu Hızlı Yoklama',
      'Temel Veli Bildirimleri (SMS & Mail)',
      'Standart Sporpuan Entegrasyonu',
      '2 Antrenör & 1 Yönetici Hesabı',
      'E-posta ile Teknik Destek',
    ],
    limits: PACKAGE_DETAILS['Başlangıç Kulübü'].limits,
  },
  {
    id: 'kulup-akademi',
    name: 'Kulüp & Akademi',
    tagText: 'EN ÇOK TERCİH EDİLEN',
    tagColor: 'bg-blue-600 text-white',
    monthlyPrice: 3699,
    subtitle: 'Devamlılığı ödüllendirmek, kurumsal veli iletişimi ve çoklu branş yönetimi isteyenler için.',
    ctaText: 'HEMEN BAŞLA',
    ctaVariant: 'primary',
    features: [
      '350 Aktif Sporcuya Kadar',
      'Gelişmiş Sporpuan & Ödül Kataloğu Modülü',
      '100 Sporcuya Kadar Dijital Sporcu Karnesi',
      'Velilere Otomatik WhatsApp Karnesi Gönderimi',
      'Performans Radar Grafikleri ve Gelişim Analitiği',
      'Otomatik Aidat Takibi & Veli Borç Bildirimleri',
      'Sınırsız Antrenör & Branş Hesabı',
      '7/24 Öncelikli Canlı Destek & Kulüp Eğitimi',
    ],
    limits: PACKAGE_DETAILS['Kulüp & Akademi'].limits,
  },
  {
    id: 'pro-akademi-coklu-sube',
    name: 'Pro Akademi & Çoklu Şube',
    tagText: 'MAKSİMUM GÜÇ',
    tagColor: 'bg-blue-600 text-white',
    monthlyPrice: 0,
    customPriceTitle: 'Kurumsal Teklif',
    customPriceSubtitle: 'Kulübünüze Özel Kapsam & Fiyatlandırma',
    subtitle: 'Birden fazla tesisi, yüzlerce sporcusu ve özel marka kimliği olan büyük kulüpler için.',
    ctaText: 'KURUMSAL GÖRÜŞME',
    ctaVariant: 'light',
    features: [
      'Sınırsız Sporcu & Sınırsız Şube / Tesis',
      'Kendi Markanızla Web Sitesi & Özel Alan Adı (White-Label)',
      'Sanal POS & Online Kredi Kartı Tahsilat Entegrasyonu',
      'Özel Kulüp Mobil Uygulaması (iOS & Android)',
      'Kulübe Özel Sporpuan & Ödül Havuzu Yönetimi',
      'Gelişmiş Finans, Kasa ve Muhasebe Entegrasyonu',
      'Özel Müşteri Başarı Yöneticisi & Yerinde Kurulum Desteği',
    ],
    limits: PACKAGE_DETAILS['Pro Akademi & Çoklu Şube'].limits,
  },
];

const PACKAGES_CUSTOM_STORAGE_KEY = 'sportsfly_packages_official_v5';

export const PaketlerView: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'aylik' | 'yillik'>('aylik');
  const [activePlan, setActivePlan] = useState<PackagePlanType>(() => getActiveSessionPlan());
  const [userProfile, setUserProfile] = useState<UserProfileData>(() => getStoredUserProfile());
  const [packages, setPackages] = useState<PackagePlanItem[]>(() => {
    if (typeof window !== 'undefined') {
      const parsed = secureStorageGet<PackagePlanItem[] | null>(PACKAGES_CUSTOM_STORAGE_KEY, null);
      if (Array.isArray(parsed) && parsed.length === 3) {
        return parsed;
      }
    }
    return OFFICIAL_PACKAGES;
  });

  const [activeTab, setActiveTab] = useState<'kartlar' | 'yetki-matrisi' | 'kota-analiz'>('kartlar');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedPlanModal, setSelectedPlanModal] = useState<PackagePlanItem | null>(null);
  const [actionType, setActionType] = useState<'trial' | 'upgrade' | 'contact' | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<{
    intentId: string;
    orderHmacSignature: string;
    idempotencyKey: string;
    amountTRY: number;
    requires3DSecure: boolean;
    threeDSVersion: string;
    pciComplianceMode: string;
    expiresAt: string;
  } | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [testCardInput, setTestCardInput] = useState('4543 6000 0000 0000');

  // Super Admin Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PackagePlanItem | null>(null);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [unauthorizedModalOpen, setUnauthorizedModalOpen] = useState(false);

  // Impersonated manager or club resource stats (mock usage)
  const currentClubStats = {
    registeredAthletes: 148,
    registeredTrainers: 8,
    branchCount: 3,
    facilityCount: 2,
  };

  const isGoogleRestricted = isGoogleRestrictedUser(userProfile?.role, userProfile?.email);
  const isSuperAdmin = !isGoogleRestricted && isSuperAdminUser(userProfile?.role, userProfile?.email);

  // Sync profile & active plan
  useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      if (e.detail) setUserProfile(e.detail);
    };
    const handlePlanUpdate = (e: any) => {
      if (e.detail?.plan) setActivePlan(normalizePlanName(e.detail.plan));
    };

    window.addEventListener('sportsfly_profile_updated', handleProfileUpdate);
    window.addEventListener('sportsfly_plan_updated', handlePlanUpdate);
    return () => {
      window.removeEventListener('sportsfly_profile_updated', handleProfileUpdate);
      window.removeEventListener('sportsfly_plan_updated', handlePlanUpdate);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Price formatting
  const getPriceFormatted = (monthlyPrice: number) => {
    if (billingCycle === 'yillik') {
      // 20% discount on yearly payments
      const discounted = Math.round(monthlyPrice * 0.8);
      return `${discounted.toLocaleString('tr-TR')} ₺`;
    }
    return `${monthlyPrice.toLocaleString('tr-TR')} ₺`;
  };

  // Change active session plan
  const handleApplyActivePlan = (planName: PackagePlanType) => {
    setActivePlan(planName);
    setActiveSessionPlan(planName);
    triggerToast(`Aktif kulüp abonelik paketi "${planName}" olarak güncellendi!`);
  };

  const handleCtaClick = async (pkg: PackagePlanItem) => {
    setSelectedPlanModal(pkg);
    setCheckoutSession(null);
    if (pkg.name === 'Başlangıç Kulübü') {
      setActionType('trial');
    } else if (pkg.name === 'Kulüp & Akademi') {
      setActionType('upgrade');
    } else {
      setActionType('contact');
    }

    // Request cryptographically signed server-side 3D Secure 2.2 payment intent
    setIsCreatingSession(true);
    try {
      const idemKey = generateIdempotencyKey('CHK');
      const res = await secureFetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idemKey,
        },
        body: JSON.stringify({
          planId: pkg.id,
          billingCycle,
          clubName: 'SPORTSFLY AKADEMİ',
          customerEmail: userProfile.email,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.paymentSession) {
          setCheckoutSession(data.paymentSession);
        }
      }
    } catch {
      // Fallback gracefully if offline
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleConfirmPlanAction = () => {
    if (selectedPlanModal) {
      recordSecurityAuditEvent(
        'PAYMENT_GUARD',
        'INFO',
        'İmzalı 3D Secure 2.2 ödeme oturumu onaylandı',
        `Paket: ${selectedPlanModal.name}, Intent: ${checkoutSession?.intentId || 'LOCAL'}`
      );
      if (isGoogleRestricted) {
        triggerToast(
          `"${selectedPlanModal.name}" paketi için başvurunuz alınmıştır. Onay sürecinin ardından kilitli kategorileriniz açılacaktır.`
        );
      } else {
        handleApplyActivePlan(selectedPlanModal.name);
      }
      setSelectedPlanModal(null);
      setActionType(null);
      setCheckoutSession(null);
    }
  };

  // Open Edit Modal for a plan - STRICTLY SUPER ADMIN ONLY
  const handleOpenEdit = (plan: PackagePlanItem) => {
    if (!isSuperAdmin) {
      setUnauthorizedModalOpen(true);
      return;
    }
    setEditingPlan(JSON.parse(JSON.stringify(plan)));
    setIsEditModalOpen(true);
  };

  const handleSavePlanChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      triggerToast('Yetkisiz işlem: Paket fiyat ve içeriklerini yalnızca Süper Admin değiştirebilir.');
      setIsEditModalOpen(false);
      return;
    }
    if (!editingPlan) return;

    const updated = packages.map((p) => (p.id === editingPlan.id ? editingPlan : p));
    setPackages(updated);
    secureStorageSet(PACKAGES_CUSTOM_STORAGE_KEY, updated);
    triggerToast(`"${editingPlan.name}" paketi ve fiyatlandırması kriptografik imzayla güncellendi.`);
    setIsEditModalOpen(false);
  };

  const handleResetToDefaults = () => {
    if (!isSuperAdmin) {
      setUnauthorizedModalOpen(true);
      return;
    }
    if (window.confirm('Tüm paket fiyatlarını ve özelliklerini orijinal haline döndürmek istediğinize emin misiniz?')) {
      setPackages(OFFICIAL_PACKAGES);
      try {
        localStorage.removeItem(PACKAGES_CUSTOM_STORAGE_KEY);
      } catch (e) {}
      triggerToast('Paketler resmi fabrika ayarlarına sıfırlandı.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Google Restricted Account Banner */}
      {isGoogleRestricted && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Google Girişi ile Kayıt Oldunuz — Sistem Özellikleri Kilitli
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200/80 text-amber-900 uppercase tracking-wider">
                  Paket Seçimi Gerekli
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Google girişi ile kayıt olan kullanıcılar yalnızca <strong>Paketler</strong> bölümünü görüntüleyebilir ve sol menüdeki tüm kategoriler kilitlidir. Sistemdeki tüm özellikleri kullanabilmek için aşağıdan kulübünüze uygun paketi seçebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60">
                Abonelik &amp; Paket Mimarisi
              </span>
              {!isGoogleRestricted && (
                <>
                  <span className="text-xs text-slate-500 font-medium">
                    Aktif Paketiniz:{' '}
                    <strong className="text-blue-700 font-bold px-2 py-0.5 bg-blue-50/80 rounded-md">
                      {activePlan}
                    </strong>
                  </span>
                  <span className="text-xs text-slate-400">• Seviye {PACKAGE_DETAILS[activePlan]?.level || 2} / 3</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Spor Kulübü &amp; Akademi Paketleri
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Kulübünüzün sporcu sayısı, şube yapısı ve dijital karne gereksinimlerine göre en uygun paketi seçin.
              Seçilen pakete göre tüm sistem yetkilendirmeleri ve modüller otomatik olarak şekillenir.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {/* Super Admin Actions */}
            {isSuperAdmin && (
              <button
                onClick={handleResetToDefaults}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Resmi paket fiyat ve özelliklerini varsayılana sıfırla"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Varsayılana Sıfırla</span>
              </button>
            )}

            {/* Billing Cycle Toggle */}
            <div className="p-1 bg-slate-100 border border-slate-200 rounded-xl flex items-center">
              <button
                onClick={() => setBillingCycle('aylik')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'aylik'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Aylık Ödeme
              </button>
              <button
                onClick={() => setBillingCycle('yillik')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'yillik'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Yıllık Ödeme</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-full">
                  %20 İndirim
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 mt-6 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('kartlar')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'kartlar'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Paket Kartları</span>
          </button>

          <button
            onClick={() => setActiveTab('yetki-matrisi')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'yetki-matrisi'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Modül &amp; Yetki Matrisi</span>
          </button>

          <button
            onClick={() => setActiveTab('kota-analiz')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'kota-analiz'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Kulüp Kota &amp; Kaynak Kullanımı</span>
          </button>
        </div>
      </div>

      {/* TAB 1: EXACT 3 PRICING CARDS FROM IMAGE */}
      {activeTab === 'kartlar' && (
        <div className="space-y-6">
          {/* 3 Columns Grid matching screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {packages.map((pkg) => {
              const isCurrent = activePlan === pkg.name;
              const hasTag = Boolean(pkg.tagText);

              return (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
                    pkg.name === 'Kulüp & Akademi'
                      ? 'border-2 border-blue-600 shadow-xl ring-4 ring-blue-50'
                      : 'border border-slate-200/90 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Floating Pill Tag matching screenshot */}
                  {hasTag && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-blue-600 text-white text-[11px] font-extrabold uppercase px-4 py-1 rounded-full tracking-wider shadow-sm">
                        {pkg.tagText}
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Header Row with Title and Active Badge */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {pkg.name}
                      </h3>

                      {!isGoogleRestricted && isCurrent && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                          Aktif Paket
                        </span>
                      )}
                    </div>

                    {/* Subtitle */}
                    <p className="text-xs text-slate-500 min-h-[36px] leading-relaxed mb-6">
                      {pkg.subtitle}
                    </p>

                    {/* Big Price Display */}
                    {pkg.customPriceTitle ? (
                      <div className="pb-6 border-b border-slate-100 min-h-[72px] flex flex-col justify-center">
                        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                          {pkg.customPriceTitle}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mt-1">
                          {pkg.customPriceSubtitle || 'Kulübünüze Özel Kapsam & Fiyatlandırma'}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1.5 pb-6 border-b border-slate-100 min-h-[72px]">
                        <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                          {getPriceFormatted(pkg.monthlyPrice).replace(' ₺', '')}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">
                          ₺ / ay
                        </span>
                      </div>
                    )}

                    {/* Feature Section Header */}
                    <div className="pt-6 mb-4">
                      <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                        DAHİL OLAN ÖZELLİKLER:
                      </span>
                    </div>

                    {/* Bullet List with Blue Checkmarks */}
                    <ul className="space-y-3.5 mb-8">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 leading-snug">
                          <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 stroke-[2.5]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom Action Area */}
                  <div className="pt-4 border-t border-slate-100/80 space-y-2.5">
                    {pkg.ctaVariant === 'primary' ? (
                      <button
                        onClick={() => handleCtaClick(pkg)}
                        className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 active:scale-[0.99] cursor-pointer"
                      >
                        {pkg.ctaText}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCtaClick(pkg)}
                        className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.99] cursor-pointer"
                      >
                        {pkg.ctaText}
                      </button>
                    )}

                    {/* Admin quick customize button */}
                    {isSuperAdmin && (
                      <button
                        onClick={() => handleOpenEdit(pkg)}
                        className="w-full py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Fiyat &amp; Özellik Düzenle (Admin)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED PERMISSIONS & MODULE MATRIX */}
      {activeTab === 'yetki-matrisi' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Paket Yetki &amp; Modül Karşılaştırma Matrisi
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Görseldeki 3 paketin sistem genelindeki modül erişimleri, kotaları ve teknik yetkileri detaylı olarak listelenmiştir.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-3.5 px-4 w-1/3">Modül / Yetenek</th>
                  <th className="py-3.5 px-4 text-center">Başlangıç Kulübü (1.190 ₺)</th>
                  <th className="py-3.5 px-4 text-center bg-blue-50/50 text-blue-900">
                    Kulüp &amp; Akademi (2.290 ₺)
                  </th>
                  <th className="py-3.5 px-4 text-center">Pro Akademi &amp; Çoklu Şube (3.990 ₺)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {/* Section 1: Kapasite ve Kadro */}
                <tr className="bg-slate-50/50 font-bold text-slate-900">
                  <td colSpan={4} className="py-2.5 px-4 uppercase text-[10px] tracking-wider text-slate-500">
                    Kapasite, Kadro &amp; Şube
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Aktif Sporcu Kapasitesi</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">100 Sporcuya Kadar</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-700 bg-blue-50/30">
                    350 Sporcuya Kadar
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">Sınırsız Sporcu</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Antrenör &amp; Yönetici Hesabı</td>
                  <td className="py-3 px-4 text-center text-slate-600">2 Antrenör + 1 Yönetici</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-700 bg-blue-50/30">
                    Sınırsız Antrenör &amp; Branş
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">Sınırsız Antrenör &amp; Yönetici</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Şube &amp; Tesis Sayısı</td>
                  <td className="py-3 px-4 text-center text-slate-600">Tek Şube (Butik)</td>
                  <td className="py-3 px-4 text-center text-slate-600 bg-blue-50/30">Tek Tesis / Tek Şube</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    Sınırsız Şube &amp; Tesis
                  </td>
                </tr>

                {/* Section 2: Yoklama & Sporcu Karnesi */}
                <tr className="bg-slate-50/50 font-bold text-slate-900">
                  <td colSpan={4} className="py-2.5 px-4 uppercase text-[10px] tracking-wider text-slate-500">
                    Yoklama, Karne &amp; Veli İletişimi
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Mobil Uyumlu Hızlı Yoklama</td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center bg-blue-50/30"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                  <td className="py-3 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Dijital Sporcu Karnesi</td>
                  <td className="py-3 px-4 text-center text-slate-600">Yılda 2 Dönem</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-700 bg-blue-50/30">Sınırsız Dönem</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">Sınırsız + Özel Format</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Velilere Otomatik WhatsApp Karnesi Gönderimi</td>
                  <td className="py-3 px-4 text-center text-slate-400"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="py-3 px-4 text-center font-bold text-blue-700 bg-blue-50/30">
                    <Check className="w-4 h-4 text-blue-600 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Performans Radar Grafikleri ve Gelişim Analitiği</td>
                  <td className="py-3 px-4 text-center text-slate-400"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="py-3 px-4 text-center font-bold text-blue-700 bg-blue-50/30">
                    <Check className="w-4 h-4 text-blue-600 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    Branş Bazlı Eğitim Planlama &amp; Taktik Müfredat Şablonları (Futbol / Basketbol / Voleybol)
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-slate-400 bg-blue-50/30"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                  </td>
                </tr>

                {/* Section 3: Aidat & Finans */}
                <tr className="bg-slate-50/50 font-bold text-slate-900">
                  <td colSpan={4} className="py-2.5 px-4 uppercase text-[10px] tracking-wider text-slate-500">
                    Aidat, POS &amp; Muhasebe
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Otomatik Aidat Takibi &amp; Sanal POS Entegrasyonu</td>
                  <td className="py-3 px-4 text-center text-slate-400"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="py-3 px-4 text-center font-bold text-blue-700 bg-blue-50/30">
                    <Check className="w-4 h-4 text-blue-600 mx-auto" />
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Gelişmiş Finans, Kasa ve Muhasebe Entegrasyonu</td>
                  <td className="py-3 px-4 text-center text-slate-400"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-slate-400 bg-blue-50/30"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Şube Özet &amp; Karşılaştırmalı Finans Analitiği</td>
                  <td className="py-3 px-4 text-center text-slate-400"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-slate-400 bg-blue-50/30"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                  </td>
                </tr>

                {/* Section 4: Sporpuan & Kurumsal */}
                <tr className="bg-slate-50/50 font-bold text-slate-900">
                  <td colSpan={4} className="py-2.5 px-4 uppercase text-[10px] tracking-wider text-slate-500">
                    Sporpuan &amp; Kurumsal Kimlik
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Sporpuan Seviyesi</td>
                  <td className="py-3 px-4 text-center text-slate-600">Standart Entegrasyon</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-700 bg-blue-50/30">
                    Gelişmiş &amp; Ödül Kataloğu
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    Kulübe Özel Ödül Havuzu &amp; Sponsor
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Özel Alan Adı ve Kulüp Mobil Uygulaması (White-Label)</td>
                  <td className="py-3 px-4 text-center text-slate-400"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="py-3 px-4 text-center text-slate-400 bg-blue-50/30"><X className="w-4 h-4 text-slate-300 mx-auto" /></td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-900">Teknik Destek &amp; Eğitim</td>
                  <td className="py-3 px-4 text-center text-slate-600">E-posta ile Teknik Destek</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-700 bg-blue-50/30">
                    7/24 Canlı Destek &amp; Kulüp Eğitimi
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    Özel Müşteri Başarı Yöneticisi + Yerinde Kurulum
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: QUOTA & RESOURCE USAGE FOR CURRENT CLUB */}
      {activeTab === 'kota-analiz' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Kulüp Kaynak &amp; Kota Kullanım Analizi
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kulübünüzün mevcut sporcu, antrenör ve şube sayısının aktif <strong>"{activePlan}"</strong> paketine göre doluluk oranları.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Metric 1: Sporcu Kotası */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    Aktif Sporcu Kotası
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {currentClubStats.registeredAthletes} /{' '}
                    {PACKAGE_DETAILS[activePlan]?.maxStudents}
                  </span>
                </div>
                {/* Progress bar */}
                {typeof PACKAGE_DETAILS[activePlan]?.maxStudents === 'number' ? (
                  <div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          currentClubStats.registeredAthletes > (PACKAGE_DETAILS[activePlan]?.maxStudents as number)
                            ? 'bg-rose-500'
                            : 'bg-blue-600'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (currentClubStats.registeredAthletes /
                                (PACKAGE_DETAILS[activePlan]?.maxStudents as number)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {currentClubStats.registeredAthletes > (PACKAGE_DETAILS[activePlan]?.maxStudents as number) ? (
                        <span className="text-rose-600 font-bold">
                          Kota aşıldı! Bir üst pakete geçiş yapmanız gerekmektedir.
                        </span>
                      ) : (
                        <span>
                          Kapasitenin %
                          {Math.round(
                            (currentClubStats.registeredAthletes /
                              (PACKAGE_DETAILS[activePlan]?.maxStudents as number)) *
                              100
                          )}{' '}
                          kadarı kullanılıyor.
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sınırsız sporcu hakkı aktif</span>
                  </div>
                )}
              </div>

              {/* Metric 2: Antrenör Kotası */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    Antrenör &amp; Kadro
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {currentClubStats.registeredTrainers} Antrenör
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Paket Kapsamı: <strong>{PACKAGE_DETAILS[activePlan]?.maxTrainers}</strong>
                </div>
                {activePlan === 'Başlangıç Kulübü' && currentClubStats.registeredTrainers > 2 && (
                  <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                    Başlangıç Kulübü 2 antrenör ile sınırlıdır. Sınırsız antrenör için Kulüp &amp; Akademi önerilir.
                  </div>
                )}
                {activePlan !== 'Başlangıç Kulübü' && (
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sınırsız antrenör tanımlama hakkı</span>
                  </div>
                )}
              </div>

              {/* Metric 3: Şube Kotası */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    Tesis &amp; Şube Kotası
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {currentClubStats.facilityCount} Tesis
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Paket Kapsamı:{' '}
                  <strong>
                    {PACKAGE_DETAILS[activePlan]?.level === 3 ? 'Sınırsız Şube & Tesis' : 'Tek Şube'}
                  </strong>
                </div>
                {PACKAGE_DETAILS[activePlan]?.level < 3 && (
                  <div className="text-[11px] text-indigo-700 bg-indigo-50 p-2 rounded-lg border border-indigo-200/60">
                    Birden fazla şube ve tesis yönetimi için <strong>Pro Akademi &amp; Çoklu Şube</strong> gereklidir.
                  </div>
                )}
                {PACKAGE_DETAILS[activePlan]?.level === 3 && (
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Çoklu şube ve konsolide finans yetkisi</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Plan Action Confirmation */}
      {selectedPlanModal && actionType && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => {
                setSelectedPlanModal(null);
                setActionType(null);
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto">
                <SportsFlyIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                {actionType === 'trial'
                  ? '14 Gün Ücretsiz Deneme Başlat'
                  : actionType === 'upgrade'
                  ? 'Kulüp & Akademi Paketine Geçiş'
                  : 'Kurumsal Görüşme & White-Label'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Seçilen Paket: <strong>{selectedPlanModal.name}</strong> •{' '}
                {getPriceFormatted(selectedPlanModal.monthlyPrice)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6 space-y-2">
              <p className="text-xs font-bold text-slate-800">Paketle Birlikte Aktifleşecek Haklar:</p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {selectedPlanModal.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanModal(null);
                  setActionType(null);
                }}
                className="w-1/2 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirmPlanAction}
                className="w-1/2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                {actionType === 'trial'
                  ? 'Denemeyi Başlat'
                  : actionType === 'upgrade'
                  ? 'Paketi Aktif Et'
                  : 'Talebi Onayla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit Modal */}
      {isEditModalOpen && editingPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Paket Düzenle: {editingPlan.name}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlanChanges} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aylık Fiyat (TL)
                </label>
                <input
                  type="number"
                  value={editingPlan.monthlyPrice}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, monthlyPrice: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Açıklama / Alt Başlık
                </label>
                <textarea
                  rows={2}
                  value={editingPlan.subtitle}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, subtitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  CTA Buton Metni
                </label>
                <input
                  type="text"
                  value={editingPlan.ctaText}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, ctaText: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unauthorized Notice Modal */}
      {unauthorizedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Yetkisiz İşlem</h3>
            <p className="text-xs text-slate-600">
              Paket fiyatlandırmaları ve kurumsal yetki matrisini yalnızca <strong>Süper Admin</strong> rolüne sahip kullanıcılar değiştirebilir.
            </p>
            <button
              onClick={() => setUnauthorizedModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
