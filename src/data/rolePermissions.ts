import { NavPage } from '../types';
import {
  secureStorageGet,
  secureStorageSet,
  recordSecurityAuditEvent,
} from '../utils/securityCore';

export type UserRoleKey = 'super_admin' | 'kulup_yoneticisi' | 'egitmen' | 'veli' | 'sporcu';

export interface ModulePermissionConfig {
  moduleId: string;
  moduleName: string;
  category: string;
  iconName?: string;
  defaultDescription: string;
  // Dynamic action flags
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canNotify: boolean;
}

export interface UserRoleDefinition {
  key: UserRoleKey;
  title: string;
  badge: string;
  badgeColor: string;
  iconBg: string;
  shortDesc: string;
  fullDesc: string;
  dataScope: string;
  isSuperAdminExclusive: boolean;
  kvkkCompliant: boolean;
  financialAccess: boolean;
  modules: ModulePermissionConfig[];
}

export const ALL_PLATFORM_MODULES: {
  id: string;
  name: string;
  category: string;
  defaultDescription: string;
}[] = [
  // 1. Süper Admin & Sistem Modülleri
  { id: 'sporsepeti-user', name: 'Sporsepeti Kullanıcıları', category: 'Platform & Süper Admin', defaultDescription: 'Platform geneli tüm kayıtlı kullanıcı hesapları ve kimlik yönetimi' },
  { id: 'sayfa-yonetimi', name: 'Sayfa Yönetimi & CMS', category: 'Platform & Süper Admin', defaultDescription: 'Statik sayfalar, duyuru şablonları ve portal içerik yönetimi' },
  { id: 'paket-yonetimi', name: 'Paket & Lisans Yönetimi', category: 'Platform & Süper Admin', defaultDescription: 'Sistem kulüp lisansları, modül kısıtlamaları ve fiyatlandırma kuralları' },
  { id: 'tanimsiz-kullanicilar', name: 'Tanımsız Kullanıcılar', category: 'Platform & Süper Admin', defaultDescription: 'Kulüp bağımsız veya onay bekleyen kullanıcı kuyruğu' },
  { id: 'yetkilendirmeler', name: 'Yetkilendirme & Rol Matrisi', category: 'Platform & Süper Admin', defaultDescription: 'Kullanıcı türlerine göre değişken modül ve işlem yetki ataması' },
  { id: 'kullanici-sozlesmeleri', name: 'Kullanıcı & Kulüp Sözleşmeleri', category: 'Platform & Süper Admin', defaultDescription: 'KVKK, Gizlilik ve Üyelik sözleşme şablonları' },
  { id: 'merkezi-destek', name: 'Merkezi Destek Masası', category: 'Platform & Süper Admin', defaultDescription: 'Tüm kulüplerden gelen teknik destek talepleri' },

  // 2. Kulüp & Kadro Yönetimi
  { id: 'anasayfa', name: 'Dashboard / Gösterge Paneli', category: 'Yönetim, Tesis & Kadro', defaultDescription: 'Anlık kulüp cirosu, aktif sporcu sayısı ve günlük operasyon özeti' },
  { id: 'on-kayit', name: 'Ön Kayıt Başvuru Portalı', category: 'Yönetim, Tesis & Kadro', defaultDescription: 'Web ve mobilden gelen veli ön kayıtları ve kesin kayıt onayı' },
  { id: 'sporcular', name: 'Sporcu Yönetimi & Profilleri', category: 'Yönetim, Tesis & Kadro', defaultDescription: 'Tüm sporcu listesi, sağlık bilgileri, veli irtibatı ve grup atamaları' },
  { id: 'egitmenler', name: 'Eğitmen & Antrenör Yönetimi', category: 'Yönetim, Tesis & Kadro', defaultDescription: 'Kulüp antrenörleri, branş yetkileri ve seans atamaları' },
  { id: 'yoneticiler', name: 'Yöneticiler & Şube Müdürleri', category: 'Yönetim, Tesis & Kadro', defaultDescription: 'Kulüp içi idari yönetici hesapları ve şube atamaları' },
  { id: 'subeler', name: 'Şube & Tesis Yönetimi', category: 'Yönetim, Tesis & Kadro', defaultDescription: 'Çoklu şubeler, salonlar, kortlar ve antrenman alanları' },
  { id: 'sube-ozet', name: 'Şube Özet & Analitik', category: 'Yönetim, Tesis & Kadro', defaultDescription: 'Şube bazlı doluluk, ciro ve sporcu sayı karşılaştırmaları' },
  { id: 'brans-yonetimi', name: 'Branş & Yaş Grubu Yönetimi', category: 'Yönetim, Tesis & Kadro', defaultDescription: 'Futbol, Basketbol, Voleybol, Yüzme vb. branş ve yaş kategorileri' },
  { id: 'gruplar', name: 'Grup & Takım Yönetimi', category: 'Yönetim, Tesis & Kadro', defaultDescription: 'Antrenman grupları, lisanslı takımlar ve kontenjanlar' },

  // 3. Sportif Operasyon & Performans
  { id: 'antrenman-takvimi', name: 'Antrenman & Seans Takvimi', category: 'Sportif Operasyon', defaultDescription: 'Haftalık seans programı, saha tahsisleri ve etkinlik takvimi' },
  { id: 'yoklama', name: 'Mobil Hızlı Yoklama & QR', category: 'Sportif Operasyon', defaultDescription: 'Antrenörlerin tek dokunuşla seans katılımı ve devamsızlık alması' },
  { id: 'sporcu-karnesi', name: 'Dijital Sporcu Karnesi & PDF', category: 'Sportif Operasyon', defaultDescription: 'Dönemlik gelişim karneleri, radar grafikler ve WhatsApp/PDF paylaşımı' },
  { id: 'egitim-planlama', name: 'Eğitim Planlama & Taktik Tahtası', category: 'Sportif Operasyon', defaultDescription: 'Spiral müfredat planı, antrenman drilleri ve taktik saha tahtası' },
  { id: 'kulup-evraklari', name: 'Kulüp Evrakları & Lisans Takibi', category: 'Sportif Operasyon', defaultDescription: 'Sağlık raporları, lisans vizeleri ve veli muvafakatnameleri' },
  { id: 'kulup-galerisi', name: 'Medya Yönetimi & Arşiv', category: 'Sportif Operasyon', defaultDescription: 'Klasör mantığında antrenman, maç ve kupa medyası, sporcu etiketleme' },
  { id: 'anket-yonetimi', name: 'Veli & Sporcu Anketleri', category: 'Sportif Operasyon', defaultDescription: 'Kulüp ve antrenör memnuniyet ölçümleri' },

  // 4. Modüller & Entegrasyonlar
  { id: 'entegrasyonlar', name: 'Entegrasyonlar & Modül Portalı', category: 'Entegrasyonlar', defaultDescription: 'Sporpuan, Turnuva, Envanter, Sanal POS, SMS ve takvim entegrasyonlarının merkezi yönetimi' },
  { id: 'turnuva-yonetimi', name: 'Turnuva & Lig Yönetimi', category: 'Modüller', defaultDescription: 'Fikstür, maç takvimi, puan tablosu ve kupa/madalya takibi' },
  { id: 'envanter-yonetimi', name: 'Envanter & Malzeme Yönetimi', category: 'Modüller', defaultDescription: 'Kulüp malzeme stokları, zimmet takibi, durum kontrolü ve kritik stok uyarıları' },

  // 5. Sporpuan İtibar Portalı
  { id: 'sporpuan-sporcu-degerlendirme', name: 'Sporcu Değerlendirme & Yetkinlik', category: 'Sporpuan İtibar Portalı', defaultDescription: 'Teknik, taktik ve disiplin puanları ile Sporpuan verme' },
  { id: 'sporpuan-degerlendirmeler', name: 'Değerlendirme Geçmişi', category: 'Sporpuan İtibar Portalı', defaultDescription: 'Geçmiş değerlendirme seansları ve sporcu puan dökümü' },
  { id: 'sporpuan-dogrulamalar', name: 'Sporpuan Doğrulama & Onay', category: 'Sporpuan İtibar Portalı', defaultDescription: 'Federasyon ve kulüp yetkilisi onay mekanizması' },
  { id: 'sporpuan-raporlar', name: 'Sporpuan Gelişim Analitiği', category: 'Sporpuan İtibar Portalı', defaultDescription: 'Takım ve sporcu bazlı itibar gelişim raporları' },

  // 5. Finans & Ön Muhasebe
  { id: 'on-muhasebe', name: 'Ön Muhasebe & Kasa Özeti', category: 'Finans & Ön Muhasebe', defaultDescription: 'Kasa bakiyesi, banka hareketleri ve anlık nakit akışı' },
  { id: 'gelir-gider-kategori', name: 'Gelir/Gider Kategori Ağacı', category: 'Finans & Ön Muhasebe', defaultDescription: 'Maliyet merkezleri ve muhasebe gelir-gider hesap planı' },
  { id: 'gelir-gider-yonetimi', name: 'Kasa, Fatura & Gelir-Gider', category: 'Finans & Ön Muhasebe', defaultDescription: 'Gider faturaları, antrenör hakedişleri ve kasa çıkışları' },
  { id: 'odeme-plani-kontrol', name: 'Ödeme Planı Kontrolü & Tahsilat', category: 'Finans & Ön Muhasebe', defaultDescription: 'Vadesi geçmiş aidatlar, tahsilat raporları ve gecikme uyarıları' },
  { id: 'odeme-plani', name: 'Aidat & Sanal POS Ödeme Planı', category: 'Finans & Ön Muhasebe', defaultDescription: 'Taksitlendirme, kredi kartı ile otomatik online tahsilat' },
  { id: 'paketler', name: 'Paket & Abonelik Yönetimi', category: 'Finans & Ön Muhasebe', defaultDescription: 'Kulübün lisans paketi ve yükseltme seçenekleri' },

  // 6. Veli & Sporcu Özel Alanları
  { id: 'veli-portali', name: 'Veli Özel Portalı & Çocuk Takibi', category: 'Veli & Sporcu Portalı', defaultDescription: 'Velinin kendi çocuğunun karnesini, yoklamasını ve bildirimlerini görmesi' },
  { id: 'veli-odeme', name: 'Veli Online Aidat & Kartla Ödeme', category: 'Veli & Sporcu Portalı', defaultDescription: 'Sanal POS ile güvenli kredi kartı aidat ödeme ekranı' },
  { id: 'sporcu-portali', name: 'Sporcu Gelişim & Rozet Paneli', category: 'Veli & Sporcu Portalı', defaultDescription: 'Sporcunun kendi karne notları, rozetleri ve antrenman takvimi' },
  { id: 'destek', name: 'Yardım & Destek Masası', category: 'Genel', defaultDescription: 'Sistem kullanımı ve teknik yardım talepleri' },
];

/**
 * Generates default permission matrix for all 5 roles based on exact business logic
 */
export function getDefaultRoleDefinitions(): Record<UserRoleKey, UserRoleDefinition> {
  // Helper to build modules for a role
  const buildRoleModules = (
    allowedIds: string[],
    actionOverrides: Record<string, Partial<ModulePermissionConfig>> = {}
  ): ModulePermissionConfig[] => {
    return ALL_PLATFORM_MODULES.map((mod) => {
      const isAllowed = allowedIds.includes(mod.id);
      const overrides = actionOverrides[mod.id] || {};

      return {
        moduleId: mod.id,
        moduleName: mod.name,
        category: mod.category,
        defaultDescription: mod.defaultDescription,
        canView: overrides.canView ?? isAllowed,
        canCreate: overrides.canCreate ?? (isAllowed && !['sayfa-yonetimi', 'sporsepeti-user'].includes(mod.id)),
        canEdit: overrides.canEdit ?? isAllowed,
        canDelete: overrides.canDelete ?? isAllowed,
        canExport: overrides.canExport ?? isAllowed,
        canNotify: overrides.canNotify ?? isAllowed,
      };
    });
  };

  // 1. SÜPER ADMİN (Platform Sahibi)
  const superAdminModules = ALL_PLATFORM_MODULES.map((mod) => ({
    moduleId: mod.id,
    moduleName: mod.name,
    category: mod.category,
    defaultDescription: mod.defaultDescription,
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
    canNotify: true,
  }));

  // 2. KULÜP YÖNETİCİSİ (Kulüp Sahibi / İdari Amir)
  const kulupYoneticisiAllowedIds = [
    'anasayfa', 'on-kayit', 'sporcular', 'egitmenler', 'yoneticiler', 'subeler', 'sube-ozet',
    'brans-yonetimi', 'gruplar', 'antrenman-takvimi', 'yoklama', 'sporcu-karnesi', 'egitim-planlama',
    'kulup-evraklari', 'kulup-galerisi', 'anket-yonetimi', 'entegrasyonlar', 'turnuva-yonetimi', 'envanter-yonetimi',
    'sporpuan-sporcu-degerlendirme', 'sporpuan-degerlendirmeler', 'sporpuan-dogrulamalar', 'sporpuan-raporlar',
    'on-muhasebe', 'gelir-gider-kategori', 'gelir-gider-yonetimi', 'odeme-plani-kontrol', 'odeme-plani',
    'paketler', 'destek'
  ];
  const kulupYoneticisiModules = buildRoleModules(kulupYoneticisiAllowedIds);

  // 3. EĞİTMEN / ANTRENÖR (Coach)
  const egitmenAllowedIds = [
    'yoklama', 'antrenman-takvimi', 'egitim-planlama', 'sporcu-karnesi',
    'sporpuan-sporcu-degerlendirme', 'sporpuan-degerlendirmeler', 'gruplar',
    'kulup-evraklari', 'kulup-galerisi', 'entegrasyonlar', 'turnuva-yonetimi', 'envanter-yonetimi', 'destek'
  ];
  const egitmenOverrides: Record<string, Partial<ModulePermissionConfig>> = {
    'gruplar': { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false, canNotify: true },
    'kulup-evraklari': { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false, canNotify: false },
    'sporcu-karnesi': { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true, canNotify: true },
    'yoklama': { canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: false, canNotify: true },
  };
  const egitmenModules = buildRoleModules(egitmenAllowedIds, egitmenOverrides);

  // 4. VELİLER (Parent)
  const veliAllowedIds = [
    'veli-portali', 'sporcu-karnesi', 'antrenman-takvimi', 'veli-odeme',
    'kulup-galerisi', 'kulup-evraklari', 'anket-yonetimi', 'destek'
  ];
  const veliOverrides: Record<string, Partial<ModulePermissionConfig>> = {
    'sporcu-karnesi': { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true, canNotify: false },
    'antrenman-takvimi': { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false, canNotify: false },
    'kulup-evraklari': { canView: true, canCreate: true, canEdit: false, canDelete: false, canExport: false, canNotify: false },
    'kulup-galerisi': { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true, canNotify: false },
    'anket-yonetimi': { canView: true, canCreate: true, canEdit: false, canDelete: false, canExport: false, canNotify: false },
  };
  const veliModules = buildRoleModules(veliAllowedIds, veliOverrides);

  // 5. SPORCULAR (Athlete)
  const sporcuAllowedIds = [
    'sporcu-portali', 'sporcu-karnesi', 'antrenman-takvimi', 'kulup-galerisi', 'destek'
  ];
  const sporcuOverrides: Record<string, Partial<ModulePermissionConfig>> = {
    'sporcu-karnesi': { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false, canNotify: false },
    'antrenman-takvimi': { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false, canNotify: false },
    'kulup-galerisi': { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false, canNotify: false },
  };
  const sporcuModules = buildRoleModules(sporcuAllowedIds, sporcuOverrides);

  return {
    super_admin: {
      key: 'super_admin',
      title: 'Süper Admin',
      badge: 'Platform Sahibi',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300',
      iconBg: 'from-purple-600 to-indigo-700',
      shortDesc: 'Tüm kulüpler, sistem lisansları, CMS ve rol yetkilendirmelerine tam erişim.',
      fullDesc: 'SportsFly platformunun ana sahibidir. Tüm veritabanı, çoklu kulüpler, lisans paketleri, sözleşme metinleri ve yetki tanımlarını yönetir.',
      dataScope: 'Global Platform (Tüm Kulüpler & Şubeler)',
      isSuperAdminExclusive: true,
      kvkkCompliant: true,
      financialAccess: true,
      modules: superAdminModules,
    },
    kulup_yoneticisi: {
      key: 'kulup_yoneticisi',
      title: 'Kulüp Yöneticileri',
      badge: 'Kulüp & Şube Müdürü',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300',
      iconBg: 'from-blue-600 to-cyan-700',
      shortDesc: 'Kulübün idari, mali, operasyonel ve kadro süreçlerinin eksiksiz yönetimi.',
      fullDesc: 'Kendi kulübünün ve bağlı şubelerinin tüm sporcularını, antrenörlerini, ön muhasebesini, aidat tahsilatlarını ve karnelerini yönetir.',
      dataScope: 'Kendi Kulübü ve Bağlı Tüm Şubeler',
      isSuperAdminExclusive: false,
      kvkkCompliant: true,
      financialAccess: true,
      modules: kulupYoneticisiModules,
    },
    egitmen: {
      key: 'egitmen',
      title: 'Eğitmenler & Antrenörler',
      badge: 'Coach / Antrenör',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300',
      iconBg: 'from-emerald-600 to-teal-700',
      shortDesc: 'Mobil hızlı yoklama, taktik planlama, sporcu karne notları ve Sporpuan verme.',
      fullDesc: 'Yalnızca kendisine atanmış antrenman gruplarının yoklamasını alır, seans planlarını yürütür, sporcu performans notlarını ve Sporpuan değerlendirmelerini girer.',
      dataScope: 'Yalnızca Atandığı Branş ve Gruplar',
      isSuperAdminExclusive: false,
      kvkkCompliant: true,
      financialAccess: false,
      modules: egitmenModules,
    },
    veli: {
      key: 'veli',
      title: 'Veliler',
      badge: 'Veli Portalı',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300',
      iconBg: 'from-amber-600 to-orange-700',
      shortDesc: 'Çocuğun gelişim karnesi, antrenman devam takibi ve online kredi kartı aidat ödeme.',
      fullDesc: 'Yalnızca kendi kayıtlı çocuklarının antrenman takvimini, devamsızlık durumunu, dijital karnesini, kazanılan Sporpuanları ve aidat taksitlerini görüntüler. Sanal POS ile ödeme yapar.',
      dataScope: 'Yalnızca Kendi Kayıtlı Çocukları (KVKK İzolasyonu)',
      isSuperAdminExclusive: false,
      kvkkCompliant: true,
      financialAccess: false,
    modules: veliModules,
    },
    sporcu: {
      key: 'sporcu',
      title: 'Sporcular',
      badge: 'Sporcu Portalı',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300',
      iconBg: 'from-sky-500 to-indigo-600',
      shortDesc: 'Kişisel karne, Sporpuan rozetleri, takvim ve antrenman başarı serileri.',
      fullDesc: 'Kendi sporcu kartını, karne gelişim grafiklerini, Sporpuan liderlik seviyesini ve antrenman programını takip eder.',
      dataScope: 'Yalnızca Kendi Sporcu Profili',
      isSuperAdminExclusive: false,
      kvkkCompliant: true,
      financialAccess: false,
      modules: sporcuModules,
    },
  };
}

export const ROLE_PERMISSIONS_STORAGE_KEY = 'sportsfly_role_permissions_v1';

/**
 * Load role permissions from localStorage or return fresh defaults
 */
export function getStoredRoleDefinitions(): Record<UserRoleKey, UserRoleDefinition> {
  const defaults = getDefaultRoleDefinitions();
  if (typeof window === 'undefined') return defaults;
  try {
    const parsed = secureStorageGet<Record<UserRoleKey, UserRoleDefinition> | null>(
      ROLE_PERMISSIONS_STORAGE_KEY,
      null
    );
    if (
      parsed &&
      parsed.super_admin &&
      parsed.kulup_yoneticisi &&
      parsed.egitmen &&
      parsed.veli &&
      parsed.sporcu
    ) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load role permissions from storage', e);
  }
  return defaults;
}

/**
 * Save role permissions to localStorage with cryptographic integrity and broadcast event
 */
export function saveRoleDefinitions(roles: Record<UserRoleKey, UserRoleDefinition>) {
  if (typeof window === 'undefined') return;
  try {
    secureStorageSet(ROLE_PERMISSIONS_STORAGE_KEY, roles);
    recordSecurityAuditEvent({
      category: 'RBAC',
      severity: 'INFO',
      action: 'RBAC_MATRIX_SIGNED_AND_SAVED',
      actor: 'Süper Admin',
      details: '5 temel rol için modül erişim ve finans/KVKK izolasyon matrisi imzalanarak kaydedildi.',
    });
    window.dispatchEvent(
      new CustomEvent('sportsfly_roles_updated', { detail: { roles } })
    );
  } catch (e) {
    console.error('Failed to save role permissions to storage', e);
  }
}

/**
 * Reset role permissions to system default
 */
export function resetRoleDefinitions(): Record<UserRoleKey, UserRoleDefinition> {
  const defaults = getDefaultRoleDefinitions();
  saveRoleDefinitions(defaults);
  return defaults;
}

/**
 * Automated security & role audit check helper
 */
export interface RoleAuditResult {
  roleKey: UserRoleKey;
  roleTitle: string;
  totalModules: number;
  activeModulesCount: number;
  kvkkPassed: boolean;
  financialIsolationPassed: boolean;
  notes: string[];
}

export function performRoleSecurityAudit(
  roles: Record<UserRoleKey, UserRoleDefinition>
): RoleAuditResult[] {
  return (Object.keys(roles) as UserRoleKey[]).map((key) => {
    const r = roles[key];
    const activeMods = r.modules.filter((m) => m.canView);
    const notes: string[] = [];

    let kvkkPassed = true;
    let financialIsolationPassed = true;

    // Check financial isolation for Coach, Parent, Athlete
    if (['egitmen', 'veli', 'sporcu'].includes(key)) {
      const hasAccounting = activeMods.some((m) =>
        ['on-muhasebe', 'gelir-gider-kategori', 'gelir-gider-yonetimi'].includes(m.moduleId)
      );
      if (hasAccounting) {
        financialIsolationPassed = false;
        notes.push('⚠️ UYARI: Bu role kulüp ön muhasebe/kasa erişimi verilmiş!');
      } else {
        notes.push('✅ Finansal kasa ve muhasebe izolasyonu tam korumalı.');
      }
    }

    // Check KVKK isolation for Parent & Athlete
    if (['veli', 'sporcu'].includes(key)) {
      const hasOtherStudents = activeMods.some((m) =>
        ['sporcular', 'yoneticiler', 'egitmenler', 'sporsepeti-user'].includes(m.moduleId)
      );
      if (hasOtherStudents) {
        kvkkPassed = false;
        notes.push('⚠️ UYARI: Veli/Sporcuya diğer sporcuların listesi açılmış (KVKK Riski)!');
      } else {
        notes.push('✅ Yalnızca kendi çocuk/sporcu verisi izole şekilde erişilebilir.');
      }
    }

    // Check Super admin modules isolation
    if (key !== 'super_admin') {
      const hasSuperAdminModule = activeMods.some((m) =>
        ['sporsepeti-user', 'sayfa-yonetimi', 'paket-yonetimi', 'yetkilendirmeler'].includes(
          m.moduleId
        )
      );
      if (hasSuperAdminModule) {
        notes.push('⚠️ DİKKAT: Süper Admin yetkilendirme modülü bu role atanmış.');
      }
    }

    return {
      roleKey: key,
      roleTitle: r.title,
      totalModules: r.modules.length,
      activeModulesCount: activeMods.length,
      kvkkPassed,
      financialIsolationPassed,
      notes,
    };
  });
}
