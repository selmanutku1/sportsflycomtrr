import { NavPage, PackagePlanType, PackageLimits } from '../types';
import { getStoredRoleDefinitions, UserRoleKey } from './rolePermissions';
import { getGoogleUserAccessByEmail, isPageAllowedForGoogleUser } from './googleUsersAccess';

export interface PackageDetail {
  id: string;
  name: PackagePlanType;
  level: number;
  badgeClass: string;
  dotColor: string;
  tagText?: string;
  tagColor?: string;
  maxStudents: number | 'Sınırsız';
  monthlyPrice: number;
  highlight: string;
  priceFormatted: string;
  maxTrainers: string;
  description: string;
  ctaText: string;
  features: string[];
  allowedModules: string[];
  restrictedFeatures: string[];
  restrictedModules: string[];
  limits: PackageLimits;
}

export const CANONICAL_PACKAGES: PackagePlanType[] = [
  'Başlangıç Kulübü',
  'Kulüp & Akademi',
  'Pro Akademi & Çoklu Şube',
];

export const PACKAGE_DETAILS: Record<PackagePlanType, PackageDetail> = {
  'Başlangıç Kulübü': {
    id: 'baslangic-kulubu',
    name: 'Başlangıç Kulübü',
    level: 1,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotColor: 'bg-slate-400',
    maxStudents: 100,
    monthlyPrice: 2199,
    priceFormatted: '2.199 ₺ / ay',
    maxTrainers: '2 Antrenör & 1 Yönetici',
    description: 'Tek şubeli, büyümekte olan butik spor okulları ve atölyeler için ideal.',
    highlight: '100 Sporcu • Tek Şube • Hızlı Yoklama & Karne',
    ctaText: 'HEMEN BAŞLA',
    features: [
      '100 Aktif Sporcuya Kadar',
      'Mobil Uyumlu Hızlı Yoklama',
      'Temel Veli Bildirimleri (SMS & Mail)',
      'Standart Sporpuan Entegrasyonu',
      '2 Antrenör & 1 Yönetici Hesabı',
      'E-posta ile Teknik Destek',
    ],
    allowedModules: [
      '100 Aktif Sporcu Yönetimi',
      'Mobil Uyumlu Hızlı Yoklama & QR Seans Girişi',
      'Temel Veli Bildirimleri (SMS & Mail)',
      'Dijital Sporcu Karnesi (Yılda 2 Dönem)',
      '2 Antrenör & 1 Yönetici Hesabı',
      'Antrenman Takvimi & Planlama',
      'Ön Kayıt Başvuru Portalı',
    ],
    restrictedFeatures: [
      'Sporpuan İtibar, Sporcu Değerlendirme & Doğrulama (Pro)',
      'Sanal POS & Otomatik Aidat Takibi',
      'Velilere Otomatik WhatsApp Karnesi Gönderimi',
      'Sınırsız Dijital Karne & Radar Grafikleri',
      'Çoklu Şube & Tesis Yönetimi',
      'Gelişmiş Finans, Kasa ve Muhasebe Entegrasyonu',
      'Branş Bazlı Eğitim Planlama & Taktik Şablonları',
    ],
    restrictedModules: [
      'Sporpuan Değerlendirmeler, Doğrulamalar & Raporlar',
      'Otomatik Aidat Takibi & Sanal POS Entegrasyonu',
      'Velilere Otomatik WhatsApp Karnesi Gönderimi',
      'Performans Radar Grafikleri ve Gelişim Analitiği',
      'Grup, Seviye & Takım Yönetimi',
      'Çoklu Şube & Tesis Yönetimi',
      'Şube Özet & Karşılaştırmalı Finans Paneli',
      'Ön Muhasebe & Kasa / Gelir-Gider Yönetimi',
      'Branş Bazlı Eğitim Planlama & Taktik Şablonları',
    ],
    limits: {
      maxStudents: 100,
      maxTrainers: 2,
      maxManagers: 1,
      maxBranches: 'Temel Branş',
      maxFacilities: 1,
      reportCards: 'Yılda 2 Dönem',
      whatsappDelivery: false,
      radarAnalytics: false,
      onlinePos: false,
      accounting: false,
      multiBranch: false,
      whiteLabel: false,
      sporpuanFeatures: 'Dahil Değil (Pro Paket)',
      supportLevel: 'E-posta ile Teknik Destek',
    },
  },

  'Kulüp & Akademi': {
    id: 'kulup-akademi',
    name: 'Kulüp & Akademi',
    level: 2,
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-400',
    dotColor: 'bg-blue-600',
    tagText: 'EN ÇOK TERCİH EDİLEN',
    tagColor: 'bg-blue-600 text-white',
    maxStudents: 350,
    monthlyPrice: 3699,
    priceFormatted: '3.699 ₺ / ay',
    maxTrainers: 'Sınırsız Antrenör & Branş',
    description: 'Devamlılığı ödüllendirmek, kurumsal veli iletişimi ve çoklu branş yönetimi isteyenler için.',
    highlight: '350 Sporcu • WhatsApp Karne • Sanal POS & Aidat',
    ctaText: 'HEMEN BAŞLA',
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
    allowedModules: [
      'Tüm Başlangıç Kulübü Özellikleri',
      '350 Aktif Sporcu Kapasitesi',
      'Gelişmiş Sporpuan & Ödül Kataloğu Modülü',
      '100 Sporcuya Kadar Dijital Sporcu Karnesi',
      'Velilere Otomatik WhatsApp Karnesi Gönderimi',
      'Performans Radar Grafikleri ve Gelişim Analitiği',
      'Otomatik Aidat Takibi & Veli Borç Bildirimleri',
      'Sınırsız Antrenör & Branş Hesabı',
      '7/24 Öncelikli Canlı Destek & Kulüp Eğitimi',
    ],
    restrictedFeatures: [
      'Sporpuan İtibar Portalı, Sporcu Değerlendirme & Doğrulama (Pro)',
      'Birden Fazla Tesis & Çoklu Şube Yönetimi',
      'Şube Özet & Karşılaştırmalı Finans Analitiği',
      'Gelişmiş Çift Taraflı Ön Muhasebe & Kasa Entegrasyonu',
      'Branş Bazlı Eğitim Planlama & Yaş Müfredat Şablonları',
      'White-Label Özel Alan Adı ve Mobil Uygulama',
      'Özel Sponsor ve Ödül Havuzu Entegrasyonu',
    ],
    restrictedModules: [
      'Sporpuan Değerlendirmeler, Doğrulamalar & Raporlar',
      'Çoklu Şube & Tesis Yönetimi',
      'Şube Özet & Karşılaştırmalı Finans Paneli',
      'Ön Muhasebe & Kasa / Gelir-Gider Yönetimi',
      'Gelir/Gider Kategori Ağacı',
      'Branş Bazlı Eğitim Planlama & Yaş Müfredat Şablonları',
      'Özel Formlar, Turnuva ve Kamp Yönetimi',
      'White-Label Kulüp Mobil Uygulaması',
    ],
    limits: {
      maxStudents: 350,
      maxTrainers: 'Sınırsız',
      maxManagers: 'Sınırsız',
      maxBranches: 'Sınırsız Branş',
      maxFacilities: 1,
      reportCards: '100 Sporcuya Kadar',
      whatsappDelivery: true,
      radarAnalytics: true,
      onlinePos: true,
      accounting: false,
      multiBranch: false,
      whiteLabel: false,
      sporpuanFeatures: 'Dahil Değil (Pro Paket)',
      supportLevel: '7/24 Öncelikli Canlı Destek & Kulüp Eğitimi',
    },
  },

  'Pro Akademi & Çoklu Şube': {
    id: 'pro-akademi-coklu-sube',
    name: 'Pro Akademi & Çoklu Şube',
    level: 3,
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-400',
    dotColor: 'bg-indigo-600',
    tagText: 'MAKSİMUM GÜÇ',
    tagColor: 'bg-blue-600 text-white',
    maxStudents: 'Sınırsız',
    monthlyPrice: 0,
    priceFormatted: 'Kurumsal Teklif',
    maxTrainers: 'Sınırsız Antrenör & Şube',
    description: 'Birden fazla tesisi, yüzlerce sporcusu ve özel marka kimliği olan büyük kulüpler için.',
    highlight: 'Sınırsız Sporcu & Şube • Tam Finans • White-Label App',
    ctaText: 'KURUMSAL GÖRÜŞME',
    features: [
      'Sınırsız Sporcu & Sınırsız Şube / Tesis',
      'Kendi Markanızla Web Sitesi & Özel Alan Adı (White-Label)',
      'Sanal POS & Online Kredi Kartı Tahsilat Entegrasyonu',
      'Özel Kulüp Mobil Uygulaması (iOS & Android)',
      'Kulübe Özel Sporpuan & Ödül Havuzu Yönetimi',
      'Gelişmiş Finans, Kasa ve Muhasebe Entegrasyonu',
      'Özel Müşteri Başarı Yöneticisi & Yerinde Kurulum Desteği',
    ],
    allowedModules: [
      'Sınırsız Sporcu & Sınırsız Şube / Tesis Yönetimi',
      'Sporpuan İtibar, Sporcu Değerlendirme & Yetkinlik Portalı',
      'Sporpuan Doğrulama & Resmi Federasyon Raporları',
      'Branş Bazlı Eğitim Planlama & Taktik Tahtası',
      'Şube Özet & Karşılaştırmalı Finans Analitiği',
      'Gelişmiş Finans, Kasa ve Muhasebe Entegrasyonu',
      'Gelir / Gider Kategori Ağacı & Fatura Hareketleri',
      'Kendi Alan Adınız ve Özel Kulüp Mobil Uygulaması (White-Label)',
      'Kulübe Özel Sporpuan Ödül Havuzu ve Sponsor Entegrasyonu',
      'Özel Formlar, Turnuva ve Kamp Yönetimi',
      'Otomatik Aidat Takibi & Sanal POS Entegrasyonu',
      'Sınırsız Dijital Karne & WhatsApp Otomasyonu',
      'Performans Radar Grafikleri ve Gelişim Analitiği',
      'Özel Müşteri Başarı Yöneticisi',
      'Yerinde Kurulum ve Veri Taşıma Desteği',
    ],
    restrictedFeatures: [],
    restrictedModules: [],
    limits: {
      maxStudents: 'Sınırsız',
      maxTrainers: 'Sınırsız',
      maxManagers: 'Sınırsız',
      maxBranches: 'Sınırsız Branş',
      maxFacilities: 'Sınırsız',
      reportCards: 'Sınırsız',
      whatsappDelivery: true,
      radarAnalytics: true,
      onlinePos: true,
      accounting: true,
      multiBranch: true,
      whiteLabel: true,
      sporpuanFeatures: 'Tam Kapsamlı Sporpuan, İtibar & Doğrulama Portalı',
      supportLevel: 'Özel Müşteri Başarı Yöneticisi + Yerinde Kurulum',
    },
  },

  // Legacy mappings for backwards compatibility
  Başlangıç: {
    id: 'baslangic',
    name: 'Başlangıç Kulübü',
    level: 1,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotColor: 'bg-slate-400',
    maxStudents: 100,
    monthlyPrice: 1190,
    priceFormatted: '1.190 ₺ / ay',
    maxTrainers: '2 Antrenör & 1 Yönetici',
    description: 'Tek şubeli, büyümekte olan butik spor okulları ve atölyeler için ideal.',
    highlight: '100 Sporcu • Tek Şube • Hızlı Yoklama',
    ctaText: '14 GÜN ÜCRETSİZ BAŞLA',
    features: [
      '100 Aktif Sporcuya Kadar',
      'Mobil Uyumlu Hızlı Yoklama',
      'Temel Veli Bildirimleri (SMS & Mail)',
      'Dijital Sporcu Karnesi (Yılda 2 Dönem)',
      'Standart Sporpuan Entegrasyonu',
      '2 Antrenör & 1 Yönetici Hesabı',
      'E-posta ile Teknik Destek',
    ],
    allowedModules: ['100 Aktif Sporcu Yönetimi', 'Hızlı Yoklama', 'Antrenman Takvimi'],
    restrictedFeatures: ['Sanal POS & Aidat', 'Çoklu Şube', 'Gelişmiş Muhasebe'],
    restrictedModules: ['Çoklu Şube', 'Ön Muhasebe', 'Sanal POS & Aidat'],
    limits: {
      maxStudents: 100,
      maxTrainers: 2,
      maxManagers: 1,
      maxBranches: 'Temel Branş',
      maxFacilities: 1,
      reportCards: 'Yılda 2 Dönem',
      whatsappDelivery: false,
      radarAnalytics: false,
      onlinePos: false,
      accounting: false,
      multiBranch: false,
      whiteLabel: false,
      sporpuanFeatures: 'Standart Sporpuan',
      supportLevel: 'E-posta ile Teknik Destek',
    },
  },
  Profesyonel: {
    id: 'profesyonel',
    name: 'Kulüp & Akademi',
    level: 2,
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-400',
    dotColor: 'bg-blue-600',
    tagText: 'EN ÇOK TERCİH EDİLEN',
    tagColor: 'bg-blue-600 text-white',
    maxStudents: 350,
    monthlyPrice: 2290,
    priceFormatted: '2.290 ₺ / ay',
    maxTrainers: 'Sınırsız Antrenör & Branş',
    description: 'Devamlılığı ödüllendirmek, kurumsal veli iletişimi ve çoklu branş yönetimi isteyenler için.',
    highlight: '350 Sporcu • WhatsApp Karne • Sanal POS',
    ctaText: 'HEMEN DENEYİN',
    features: [
      '350 Aktif Sporcuya Kadar',
      'Sınırsız Dijital Sporcu Karnesi Oluşturma',
      'Velilere Otomatik WhatsApp Karnesi Gönderimi',
      'Performans Radar Grafikleri ve Gelişim Analitiği',
      'Otomatik Aidat Takibi & Sanal POS Entegrasyonu',
      'Sınırsız Antrenör & Branş Hesabı',
      '7/24 Öncelikli Canlı Destek & Kulüp Eğitimi',
    ],
    allowedModules: ['Tüm Başlangıç Kulübü Özellikleri', '350 Aktif Sporcu', 'Sanal POS & Aidat', 'WhatsApp Karne'],
    restrictedFeatures: ['Sporpuan Modülü', 'Çoklu Şube', 'Ön Muhasebe'],
    restrictedModules: ['Sporpuan İtibar & Doğrulama', 'Çoklu Şube & Tesis Yönetimi', 'Ön Muhasebe & Kasa'],
    limits: {
      maxStudents: 350,
      maxTrainers: 'Sınırsız',
      maxManagers: 'Sınırsız',
      maxBranches: 'Sınırsız Branş',
      maxFacilities: 1,
      reportCards: 'Sınırsız',
      whatsappDelivery: true,
      radarAnalytics: true,
      onlinePos: true,
      accounting: false,
      multiBranch: false,
      whiteLabel: false,
      sporpuanFeatures: 'Dahil Değil (Pro Paket)',
      supportLevel: '7/24 Öncelikli Canlı Destek',
    },
  },
  Premium: {
    id: 'premium',
    name: 'Kulüp & Akademi',
    level: 2,
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-400',
    dotColor: 'bg-blue-600',
    maxStudents: 350,
    monthlyPrice: 2290,
    priceFormatted: '2.290 ₺ / ay',
    maxTrainers: 'Sınırsız Antrenör & Branş',
    description: 'Devamlılığı ödüllendirmek, kurumsal veli iletişimi ve çoklu branş yönetimi isteyenler için.',
    highlight: '350 Sporcu • WhatsApp Karne • Sanal POS',
    ctaText: 'HEMEN DENEYİN',
    features: [
      '350 Aktif Sporcuya Kadar',
      'Sınırsız Dijital Sporcu Karnesi Oluşturma',
      'Velilere Otomatik WhatsApp Karnesi Gönderimi',
      'Performans Radar Grafikleri ve Gelişim Analitiği',
      'Otomatik Aidat Takibi & Sanal POS Entegrasyonu',
      'Sınırsız Antrenör & Branş Hesabı',
      '7/24 Öncelikli Canlı Destek & Kulüp Eğitimi',
    ],
    allowedModules: ['Tüm Başlangıç Kulübü Özellikleri', '350 Aktif Sporcu', 'Sanal POS & Aidat'],
    restrictedFeatures: ['Sporpuan Modülü', 'Çoklu Şube', 'Ön Muhasebe'],
    restrictedModules: ['Sporpuan İtibar & Doğrulama', 'Çoklu Şube & Tesis Yönetimi', 'Ön Muhasebe & Kasa'],
    limits: {
      maxStudents: 350,
      maxTrainers: 'Sınırsız',
      maxManagers: 'Sınırsız',
      maxBranches: 'Sınırsız Branş',
      maxFacilities: 1,
      reportCards: 'Sınırsız',
      whatsappDelivery: true,
      radarAnalytics: true,
      onlinePos: true,
      accounting: false,
      multiBranch: false,
      whiteLabel: false,
      sporpuanFeatures: 'Dahil Değil (Pro Paket)',
      supportLevel: '7/24 Öncelikli Destek',
    },
  },
  Kurumsal: {
    id: 'kurumsal',
    name: 'Pro Akademi & Çoklu Şube',
    level: 3,
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-400',
    dotColor: 'bg-indigo-600',
    maxStudents: 'Sınırsız',
    monthlyPrice: 3990,
    priceFormatted: '3.990 ₺ / ay',
    maxTrainers: 'Sınırsız Antrenör & Şube',
    description: 'Birden fazla tesisi, yüzlerce sporcusu, Sporpuan modülü ve özel marka kimliği olan büyük kulüpler için.',
    highlight: 'Sınırsız Sporcu & Şube • Tam Finans • Sporpuan Modülü',
    ctaText: 'KURUMSAL GÖRÜŞME AYARLA',
    features: [
      'Sınırsız Sporcu & Sınırsız Şube / Tesis',
      'Sporpuan İtibar, Sporcu Değerlendirme & Doğrulama Portalı',
      'Kendi Alan Adınız ve Özel Kulüp Mobil Uygulaması (White-Label)',
      'Kulübe Özel Sporpuan Ödül Havuzu ve Sponsor Entegrasyonu',
      'Özel Formlar, Turnuva ve Kamp Yönetimi',
      'Gelişmiş Finans, Kasa ve Muhasebe Entegrasyonu',
      'Özel Müşteri Başarı Yöneticisi',
      'Yerinde Kurulum ve Veri Taşıma Desteği',
    ],
    allowedModules: ['Sınırsız Sporcu & Çoklu Şube / Tesis', 'Sporpuan Modülü', 'Ön Muhasebe & Kasa', 'White-Label'],
    restrictedFeatures: [],
    restrictedModules: [],
    limits: {
      maxStudents: 'Sınırsız',
      maxTrainers: 'Sınırsız',
      maxManagers: 'Sınırsız',
      maxBranches: 'Sınırsız Branş',
      maxFacilities: 'Sınırsız',
      reportCards: 'Sınırsız',
      whatsappDelivery: true,
      radarAnalytics: true,
      onlinePos: true,
      accounting: true,
      multiBranch: true,
      whiteLabel: true,
      sporpuanFeatures: 'Tam Kapsamlı Sporpuan & Özel Ödül Havuzu',
      supportLevel: 'Özel Müşteri Başarı Yöneticisi',
    },
  },
};

// Map each restricted page to the minimum required package level
export interface PageRestrictionRule {
  minPlan: PackagePlanType;
  minLevel: number;
  featureTitle: string;
  description: string;
}

export const PAGE_RESTRICTIONS: Partial<Record<NavPage, PageRestrictionRule>> = {
  // Level 2 (Kulüp & Akademi) Requirements:
  // - 350 Sporcu, Sınırsız Antrenör/Branş
  // - Otomatik Aidat Takibi & Sanal POS
  // - Sınırsız Dijital Sporcu Karnesi & WhatsApp Gönderimi & Radar Grafikleri
  'odeme-plani': {
    minPlan: 'Kulüp & Akademi',
    minLevel: 2,
    featureTitle: 'Otomatik Aidat Takibi & Sanal POS Entegrasyonu',
    description: 'Sporcuların aylık aidat taksitleri, online sanal POS ödemeleri ve taksit takibi Kulüp & Akademi veya Pro Akademi paketi gerektirir.',
  },
  'odeme-plani-kontrol': {
    minPlan: 'Kulüp & Akademi',
    minLevel: 2,
    featureTitle: 'Ödeme Planı Kontrolü & Tahsilat Raporu',
    description: 'Ödeme gecikmelerinin takibi, banka/kart POS tahsilat raporlaması için Kulüp & Akademi paketi gereklidir.',
  },
  gruplar: {
    minPlan: 'Kulüp & Akademi',
    minLevel: 2,
    featureTitle: 'Grup, Seviye & Takım Yönetimi',
    description: 'Sporcuları branşlara, yaş kategorilerine ve yarışmacı takımlara ayırıp organize etmek için Kulüp & Akademi paketi gereklidir.',
  },
  'anket-yonetimi': {
    minPlan: 'Kulüp & Akademi',
    minLevel: 2,
    featureTitle: 'Veli & Sporcu Memnuniyet Anketleri',
    description: 'Kulüp içi memnuniyet ölçümleri, antrenör değerlendirme anketleri için Kulüp & Akademi paketi gereklidir.',
  },

  // Level 3 (Pro Akademi & Çoklu Şube) Requirements:
  // - Sınırsız Sporcu & Sınırsız Şube / Tesis
  // - Gelişmiş Finans, Kasa ve Muhasebe Entegrasyonu
  // - Sporpuan İtibar, Sporcu Değerlendirme, Rozet Doğrulama & Analitik Raporlar
  // - Branş Bazlı Eğitim Planlama & Taktik Şablonları
  // - Kendi Alan Adınız ve Özel Mobil Uygulama (White-Label)
  // - Özel Formlar, Turnuva ve Kamp Yönetimi
  'sporpuan-sporcu-degerlendirme': {
    minPlan: 'Pro Akademi & Çoklu Şube',
    minLevel: 3,
    featureTitle: 'Sporpuan Sporcu Yetkinlik & Değerlendirme Motoru',
    description: 'Karneden bağımsız periyodik sporcu yetkinlik puanlaması, alışkanlık ve hazır şablonlu değerlendirme motoru Pro Akademi & Çoklu Şube paketi gerektirir.',
  },
  'sporpuan-degerlendirmeler': {
    minPlan: 'Pro Akademi & Çoklu Şube',
    minLevel: 3,
    featureTitle: 'Sporpuan İtibar Değerlendirmeleri (Pro)',
    description: 'Kulüp itibar puanlaması, veli ve antrenör değerlendirme panelleri Pro Akademi & Çoklu Şube paketi gerektirir.',
  },
  'sporpuan-dogrulamalar': {
    minPlan: 'Pro Akademi & Çoklu Şube',
    minLevel: 3,
    featureTitle: 'Sporpuan Rozet & Sertifika Doğrulama Portalı (Pro)',
    description: 'Sporcu gelişim sertifikaları, check-in ve rozet doğrulamaları Pro Akademi & Çoklu Şube paketi yetkisindedir.',
  },
  'sporpuan-raporlar': {
    minPlan: 'Pro Akademi & Çoklu Şube',
    minLevel: 3,
    featureTitle: 'Sporpuan Gelişim Analitiği & Radar Grafikleri Raporu (Pro)',
    description: 'Sporcuların fiziksel ve teknik gelişim radar grafikleri, analitik raporları Pro Akademi & Çoklu Şube paketi kapsamındadır.',
  },
  subeler: {
    minPlan: 'Pro Akademi & Çoklu Şube',
    minLevel: 3,
    featureTitle: 'Çoklu Şube & Tesis Yönetimi',
    description: 'Birden fazla tesis ve şube tanımlamak, tesisler arası koordinasyon sağlamak için Pro Akademi & Çoklu Şube paketi gereklidir. (Başlangıç ve Kulüp paketleri tek şube ile sınırlıdır).',
  },
  'sube-ozet': {
    minPlan: 'Pro Akademi & Çoklu Şube',
    minLevel: 3,
    featureTitle: 'Şube Özet & Karşılaştırmalı Finans Paneli',
    description: 'Tüm şubelerin gelir, gider, sporcu ve eğitmen verilerini konsolide veya tesis bazlı filtreleyip karşılaştırmak için Pro Akademi & Çoklu Şube paketi gereklidir.',
  },
  'on-muhasebe': {
    minPlan: 'Pro Akademi & Çoklu Şube',
    minLevel: 3,
    featureTitle: 'Gelişmiş Finans, Kasa ve Muhasebe Entegrasyonu',
    description: 'Kulübün çift taraflı muhasebe kayıtları, kasa hareketleri, banka entegrasyonu ve finansal bilanço analizleri Pro Akademi & Çoklu Şube paketi gerektirir.',
  },
  'gelir-gider-kategori': {
    minPlan: 'Pro Akademi & Çoklu Şube',
    minLevel: 3,
    featureTitle: 'Gelir/Gider Kategori & Hesap Planı Ağacı',
    description: 'Finansal maliyet merkezlerini ve muhasebe kategori ağacını düzenlemek için Pro Akademi & Çoklu Şube paketi gereklidir.',
  },
  'gelir-gider-yonetimi': {
    minPlan: 'Pro Akademi & Çoklu Şube',
    minLevel: 3,
    featureTitle: 'Kasa, Fatura & Gelir-Gider Nakit Akış Yönetimi',
    description: 'Fatura hareketleri, kulüp masrafları ve nakit akışını kaydetmek için Pro Akademi & Çoklu Şube paketi gereklidir.',
  },
  'egitim-planlama': {
    minPlan: 'Pro Akademi & Çoklu Şube',
    minLevel: 3,
    featureTitle: 'Branş Bazlı Eğitim Planlama & Taktik Şablonları',
    description: 'Futbol, Basketbol ve Voleybol için yaş kategorilerine göre spiral antrenman şablonları, interaktif taktik saha tahtası ve 12 haftalık müfredat planlama Pro Akademi & Çoklu Şube paketi gerektirir.',
  },
  'kullanici-sozlesmeleri': {
    minPlan: 'Pro Akademi & Çoklu Şube',
    minLevel: 3,
    featureTitle: 'Kulüp Sözleşmeleri & Veli KVKK Form Yönetimi',
    description: 'Kulüp özel sözleşme şablonları, dijital KVKK onay formları ve veli imza takipleri Pro Akademi & Çoklu Şube paketi gerektirir.',
  },
};

export const ACTIVE_PLAN_STORAGE_KEY = 'sportsfly_active_plan_v3';

/**
 * Normalizes any plan name or legacy alias to one of the 3 canonical packages
 */
export function normalizePlanName(plan?: string | null): PackagePlanType {
  if (!plan) return 'Kulüp & Akademi';
  const p = plan.trim();
  if (p === 'Başlangıç Kulübü' || p === 'Başlangıç') {
    return 'Başlangıç Kulübü';
  }
  if (p === 'Kulüp & Akademi' || p === 'Profesyonel' || p === 'Premium') {
    return 'Kulüp & Akademi';
  }
  if (p === 'Pro Akademi & Çoklu Şube' || p === 'Kurumsal') {
    return 'Pro Akademi & Çoklu Şube';
  }
  return 'Kulüp & Akademi';
}

/**
 * Get current active session plan
 */
export function getActiveSessionPlan(): PackagePlanType {
  if (typeof window === 'undefined') return 'Kulüp & Akademi';
  try {
    const stored = localStorage.getItem(ACTIVE_PLAN_STORAGE_KEY);
    if (stored) {
      return normalizePlanName(stored);
    }
    // Fallback to legacy storage key if exists
    const legacyStored = localStorage.getItem('sportsfly_active_plan_v2');
    if (legacyStored) {
      return normalizePlanName(legacyStored);
    }
  } catch (e) {}
  return 'Kulüp & Akademi';
}

/**
 * Save active session plan and notify listeners
 */
export function setActiveSessionPlan(plan: PackagePlanType) {
  if (typeof window === 'undefined') return;
  const canonical = normalizePlanName(plan);
  try {
    localStorage.setItem(ACTIVE_PLAN_STORAGE_KEY, canonical);
    localStorage.setItem('sportsfly_active_plan_v2', canonical); // keep sync
    window.dispatchEvent(
      new CustomEvent('sportsfly_plan_updated', { detail: { plan: canonical } })
    );
    window.dispatchEvent(
      new CustomEvent('sportsfly_plan_changed', { detail: { plan: canonical } })
    );
  } catch (e) {}
}

export const SUPER_ADMIN_EMAIL = 'selmanutkumarmara@gmail.com';

export function resolveActiveUserEmail(email?: string): string {
  if (email && email.trim()) return email.trim().toLowerCase();
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('sportsfly_user_profile_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email) {
          return String(parsed.email).trim().toLowerCase();
        }
      }
    } catch (e) {}
  }
  return '';
}

/**
 * Helper to determine if current session user signed up / logged in via Google and is subject to Google user area restrictions.
 * Note: selmanutkumarmara@gmail.com is the Super Admin account and always has full system access.
 */
export function isGoogleRestrictedUser(role?: string, email?: string): boolean {
  const activeEmail = resolveActiveUserEmail(email);
  if (activeEmail === SUPER_ADMIN_EMAIL) {
    return false;
  }

  // Check if Admin granted full system access to this Google user
  if (activeEmail) {
    const googleRecord = getGoogleUserAccessByEmail(activeEmail);
    if (googleRecord && googleRecord.isFullAccess) {
      return false;
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('sportsfly_user_profile_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedEmail = (parsed?.email || '').trim().toLowerCase();
        if (storedEmail === SUPER_ADMIN_EMAIL) {
          return false;
        }
        const r = (parsed?.role || '').toLowerCase();
        if (r.includes('google') && parsed?.hasActivePackage !== true) {
          return true;
        }
        if (parsed?.authProvider === 'google' && parsed?.hasActivePackage !== true) {
          return true;
        }
      }
    } catch (e) {}
  }
  if (role) {
    const r = role.toLowerCase();
    if (r.includes('google')) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a specific page is unlocked for a Google-restricted user (either Paketler or explicitly enabled by Admin)
 */
export function isGoogleUserPageUnlocked(page: NavPage, email?: string): boolean {
  const activeEmail = resolveActiveUserEmail(email);
  if (activeEmail === SUPER_ADMIN_EMAIL) return true;
  return isPageAllowedForGoogleUser(page, activeEmail);
}

/**
 * Helper to determine if current session user or passed role has Super Admin privileges
 */
export function isSuperAdminUser(role?: string, email?: string): boolean {
  if (email && email.trim().toLowerCase() === SUPER_ADMIN_EMAIL) {
    return true;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('sportsfly_user_profile_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedEmail = (parsed?.email || '').trim().toLowerCase();
        if (storedEmail === SUPER_ADMIN_EMAIL) {
          return true;
        }
      }
    } catch (e) {}
  }
  if (isGoogleRestrictedUser(role, email)) {
    return false;
  }
  if (role) {
    const r = role.toLowerCase();
    return r.includes('süper') || r.includes('super') || r.includes('admin') || r.includes('kurucu');
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('sportsfly_user_profile_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.role) {
          const r = parsed.role.toLowerCase();
          if (r.includes('google') || parsed?.authProvider === 'google') {
            return false;
          }
          return r.includes('süper') || r.includes('super') || r.includes('admin') || r.includes('kurucu');
        }
      }
    } catch (e) {}
  }
  return true; // Default profile role in SportsFly is 'Süper Admin'
}

/**
 * Check if a page is allowed for a given package type and user role
 * NOTE: Süper Admin has unrestricted access to Sporpuan and all modules
 */
export function isPageAllowedForPlan(
  page: NavPage,
  plan: PackagePlanType,
  userRole?: string,
  userEmail?: string
): boolean {
  // Users who registered / logged in via Google can see Packages page + any areas explicitly activated by Admin
  if (isGoogleRestrictedUser(userRole, userEmail)) {
    return isGoogleUserPageUnlocked(page, userEmail);
  }

  const roleStr = (userRole || '').toLowerCase();

  // Spor Okulu Başvuruları is available for Admins and Club Managers
  if (page === 'spor-okulu-basvurulari') {
    return (
      isSuperAdminUser(userRole) ||
      roleStr.includes('yönetici') ||
      roleStr.includes('yonetici') ||
      roleStr.includes('admin') ||
      !roleStr
    );
  }

  // Super Admin / Admin / Kurucu has full access to all modules
  if (isSuperAdminUser(userRole)) {
    return true;
  }

  // Check dynamic role permissions saved in localStorage via YetkilendirmelerView
  try {
    const roleDefs = getStoredRoleDefinitions();
    let roleKey: UserRoleKey = 'kulup_yoneticisi';
    if (roleStr.includes('veli') || roleStr.includes('ebeveyn')) {
      roleKey = 'veli';
    } else if (roleStr.includes('sporcu')) {
      roleKey = 'sporcu';
    } else if (roleStr.includes('eğitmen') || roleStr.includes('antrenor') || roleStr.includes('antrenör')) {
      roleKey = 'egitmen';
    } else if (roleStr.includes('şube') || roleStr.includes('sube') || roleStr.includes('kulüp yöneticisi') || roleStr.includes('yonetici')) {
      roleKey = 'kulup_yoneticisi';
    }

    const currentRoleDef = roleDefs[roleKey];
    if (currentRoleDef && currentRoleDef.modules) {
      const modConfig = currentRoleDef.modules.find((m) => m.moduleId === page);
      if (modConfig) {
        return modConfig.canView;
      }
    }
  } catch (e) {}
  
  // Role-based custom module visibility restriction
  if (roleStr.includes('veli') || roleStr.includes('ebeveyn')) {
    const allowedForVeli: NavPage[] = [
      'sporcu-karnesi',
      'antrenman-takvimi',
      'odeme-plani',
      'referans-programi',
      'kulup-galerisi',
      'anasayfa',
    ];
    return allowedForVeli.includes(page);
  }

  if (roleStr.includes('sporcu')) {
    const allowedForSporcu: NavPage[] = [
      'sporsepeti-user',
      'antrenman-takvimi',
      'turnuva-yonetimi',
      'referans-programi',
      'kulup-galerisi',
      'destek',
      'anasayfa',
    ];
    return allowedForSporcu.includes(page);
  }

  if (roleStr.includes('şube') || roleStr.includes('sube')) {
    const allowedForSube: NavPage[] = [
      'sube-ozet',
      'subeler',
      'antrenman-takvimi',
      'yoklama',
      'envanter-yonetimi',
      'sporcular',
      'entegrasyonlar',
      'referans-programi',
      'destek',
      'anasayfa',
    ];
    return allowedForSube.includes(page);
  }

  const isSuper = isSuperAdminUser(userRole);

  // If user is explicitly in Super Admin mode and not testing a lower package:
  if (isSuper && (!plan || plan === 'Pro Akademi & Çoklu Şube')) {
    return true;
  }

  const restriction = PAGE_RESTRICTIONS[page];
  if (!restriction) return true; // No restriction defined, open to all

  const currentLevel = PACKAGE_DETAILS[plan]?.level || 2;
  return currentLevel >= restriction.minLevel;
}

/**
 * Get restriction info for a page if restricted
 */
export function getPageRestrictionInfo(
  page: NavPage,
  plan?: PackagePlanType,
  userRole?: string,
  userEmail?: string
): PageRestrictionRule | null {
  if (isGoogleRestrictedUser(userRole, userEmail)) {
    if (isGoogleUserPageUnlocked(page, userEmail)) {
      return null;
    }
    return {
      minPlan: 'Başlangıç Kulübü',
      minLevel: 1,
      featureTitle: 'Google Hesabı — Paket Seçimi veya Admin Yetkisi Gerekli',
      description:
        'Google girişi ile kayıt olan kullanıcılar yalnızca Paketler sayfasını ve sistem yöneticisi tarafından aktif edilen alanları görüntüleyebilir.',
    };
  }

  const isSuper = isSuperAdminUser(userRole);

  if (isSuper && (!plan || plan === 'Pro Akademi & Çoklu Şube')) {
    return null;
  }

  const restriction = PAGE_RESTRICTIONS[page];
  if (!restriction) return null;

  if (plan) {
    const currentLevel = PACKAGE_DETAILS[plan]?.level || 2;
    if (currentLevel < restriction.minLevel) {
      return restriction;
    }
    return null;
  }

  return restriction;
}
