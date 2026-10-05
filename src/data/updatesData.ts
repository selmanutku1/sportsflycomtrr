import { NavPage } from '../types';

export type UpdateTargetRole = 'all' | 'yonetici' | 'antrenor' | 'veli' | 'sporcu';

export type UpdateCategory = 'feature' | 'improvement' | 'fix' | 'security';

export interface SystemUpdateItem {
  id: string;
  version: string;
  date: string;
  title: string;
  summary: string;
  targetRole: UpdateTargetRole;
  targetRoleLabel: string;
  category: UpdateCategory;
  categoryLabel: string;
  isNew?: boolean;
  actionPage?: NavPage;
  actionLabel?: string;
  details: string[];
  roleHighlight?: string;
}

export const SYSTEM_UPDATES: SystemUpdateItem[] = [
  // 1. Yöneticiye Özel
  {
    id: 'upd-001',
    version: 'v2.8.5',
    date: '21 Eylül 2026',
    title: 'Sporpuan Kulüp İtibar, Doğrulama & Raporlama Merkezi',
    summary: 'Sporcularınızın davranış ve gelişim puanlarını tek merkezden doğrulayın, kulüp genel itibar raporları üretin.',
    targetRole: 'yonetici',
    targetRoleLabel: 'Yöneticilere Özel',
    category: 'feature',
    categoryLabel: 'Yeni Özellik',
    isNew: true,
    actionPage: 'sporpuan-dogrulamalar',
    actionLabel: 'Doğrulama Masasını Aç',
    roleHighlight: 'Kulüp itibarınızı artıracak Sporpuan doğrulama ve analiz araçları aktif.',
    details: [
      'Antrenörler tarafından verilen puanların yönetici onayı ve itiraz denetimi.',
      'Şubeler arası karşılaştırmalı sporcu disiplin ve katılım analitiği.',
      'Tek tıkla PDF veya Excel formatında Sporpuan karne ihracı.',
    ],
  },
  {
    id: 'upd-002',
    version: 'v2.8.4',
    date: '18 Eylül 2026',
    title: 'Çoklu Şube Konsolide Finans & Kasa Özeti',
    summary: 'Tüm şubelerinizin toplam gelir, gider, aidat tahsilat oranı ve net karlılığını tek bakışta görün.',
    targetRole: 'yonetici',
    targetRoleLabel: 'Yöneticilere Özel',
    category: 'improvement',
    categoryLabel: 'Geliştirme',
    isNew: true,
    actionPage: 'sube-ozet',
    actionLabel: 'Şube Özetini İncele',
    roleHighlight: 'Tüm şubelerinizin finansal konsolidasyonu ve kasa grafikleri güncellendi.',
    details: [
      'Kadıköy, Beşiktaş ve Ataşehir şubelerinin konsolide kasa tablosu.',
      'Geciken aidatların otomatik şube bazlı gruplanması.',
      'Toplu veli SMS ve e-posta hatırlatma entegrasyonu.',
    ],
  },
  {
    id: 'upd-003',
    version: 'v2.8.2',
    date: '14 Eylül 2026',
    title: 'Sanal POS & Otomatik Aidat Takip Motoru',
    summary: 'Velilerin kredi kartıyla online taksitli ödeme yapmasını sağlayın, tahsilatları otomatik muhasebeleştirin.',
    targetRole: 'yonetici',
    targetRoleLabel: 'Yöneticilere Özel',
    category: 'feature',
    categoryLabel: 'Yeni Özellik',
    actionPage: 'odeme-plani-kontrol',
    actionLabel: 'Ödeme Kontrol Paneli',
    roleHighlight: 'Sanal POS ile velilerden gecikmesiz aidat tahsilatı yapabilirsiniz.',
    details: [
      '3D Secure destekli güvenli ödeme bağlantısı oluşturma.',
      'Günü gelen taksitler için velilere otomatik WhatsApp ödeme linki iletimi.',
      'Kasa gelir-gider modülüyle tam entegre otomatik muhasebe kaydı.',
    ],
  },

  // 2. Antrenörlere Özel
  {
    id: 'upd-004',
    version: 'v2.8.5',
    date: '21 Eylül 2026',
    title: 'Yeni Branş Bazlı Eğitim Planlama & Taktik Şablonları',
    summary: 'Basketbol, Voleybol, Futbol ve Yüzme branşlarında antrenman mikro-döngülerini kolayca planlayın.',
    targetRole: 'antrenor',
    targetRoleLabel: 'Antrenörlere Özel',
    category: 'feature',
    categoryLabel: 'Yeni Özellik',
    isNew: true,
    actionPage: 'egitim-planlama',
    actionLabel: 'Planlama Aracını Başlat',
    roleHighlight: 'Yeni antrenman şablonları ve taktik tahtası kullanımınıza hazır.',
    details: [
      'Haftalık ve aylık antrenman hedefleri belirleme sihirbazı.',
      'Hazır kondisyon, teknik ve taktik drilleri kütüphanesi.',
      'Seans sonrası antrenör değerlendirme notu ekleme ve puanlama.',
    ],
  },
  {
    id: 'upd-005',
    version: 'v2.8.3',
    date: '16 Eylül 2026',
    title: 'Mobil Uyumlu Hızlı QR Yoklama & Katılım Alarmı',
    summary: 'Antrenman başında sporcuların QR kodunu okutarak saniyeler içinde seans yoklaması alın.',
    targetRole: 'antrenor',
    targetRoleLabel: 'Antrenörlere Özel',
    category: 'improvement',
    categoryLabel: 'Geliştirme',
    isNew: true,
    actionPage: 'yoklama',
    actionLabel: 'Yoklama Ekranına Git',
    roleHighlight: 'Mobil telefonunuzdan hızlı QR kodla yoklama alabilirsiniz.',
    details: [
      'Kameradan hızlı barkod ve QR kod tarama desteği.',
      'Devamsızlık yapan sporcuların velilerine anında SMS uyarısı.',
      'Grup devamlılık yüzdelerinin anlık hesaplanması.',
    ],
  },
  {
    id: 'upd-006',
    version: 'v2.8.1',
    date: '10 Eylül 2026',
    title: 'Dijital Sporcu Karnesi & Performans Radar Grafiği',
    summary: 'Sporcularınızın fiziksel, teknik ve mental gelişimini radar grafikleri ile ölçümleyin ve velilerle paylaşın.',
    targetRole: 'antrenor',
    targetRoleLabel: 'Antrenörlere Özel',
    category: 'feature',
    categoryLabel: 'Yeni Özellik',
    actionPage: 'sporcu-karnesi',
    actionLabel: 'Karne Modülünü Aç',
    roleHighlight: 'Sporcularınız için yeni dönem gelişim karneleri hazırlandı.',
    details: [
      '6 eksenli gelişim radarı (Dayanıklılık, Çeviklik, Takım Oyunu, Teknik, vb.).',
      'Geçmiş dönemlerle karşılaştırmalı gelişim eğrisi.',
      'Antrenör özel tavsiye ve geribildirim alanı.',
    ],
  },

  // 3. Velilere Özel
  {
    id: 'upd-007',
    version: 'v2.8.5',
    date: '21 Eylül 2026',
    title: 'Velilere Özel Anlık WhatsApp Karne & Yoklama Bildirimi',
    summary: 'Çocuğunuzun seans katılımı ve antrenör gelişim değerlendirmeleri anında WhatsApp üzerinden cebinize gelsin.',
    targetRole: 'veli',
    targetRoleLabel: 'Velilere Özel',
    category: 'feature',
    categoryLabel: 'Yeni Özellik',
    isNew: true,
    actionPage: 'sporcu-karnesi',
    actionLabel: 'Karneyi Görüntüle',
    roleHighlight: 'Çocuğunuzun gelişim karnesi ve seans katılım raporu güncellendi.',
    details: [
      'Antrenmana giriş yapıldığı an veliye otomatik bildirim.',
      'Dönem sonu dijital karnenin yüksek çözünürlüklü PDF formatında teslimi.',
      'Antrenörle direkt mesajlaşma ve randevu talebi.',
    ],
  },
  {
    id: 'upd-008',
    version: 'v2.8.0',
    date: '08 Eylül 2026',
    title: 'Veli Ödeme Portalı: 3D Secure & Taksit Kolaylığı',
    summary: 'Aylık spor okulu aidatlarınızı sıra beklemeden, güvenli 3D Secure ile 12 aya varan taksitlerle ödeyin.',
    targetRole: 'veli',
    targetRoleLabel: 'Velilere Özel',
    category: 'improvement',
    categoryLabel: 'Geliştirme',
    actionPage: 'odeme-plani',
    actionLabel: 'Aidat Durumunu Gör',
    roleHighlight: 'Online aidat ödeme ve makbuz dökümü veli portalında aktif.',
    details: [
      'Tüm banka ve kredi kartlarıyla hızlı tek tıkla ödeme.',
      'Geçmiş tüm ödeme makbuzlarına ve faturalara anında erişim.',
      'Kardeş indirimi ve erken kayıt avantajlarının otomatik yansıtılması.',
    ],
  },

  // 4. Genel / Tüm Kullanıcılar
  {
    id: 'upd-009',
    version: 'v2.8.5',
    date: '21 Eylül 2026',
    title: 'SportsFly 2.8: Koyu/Açık Tema & Gelişmiş Bildirim Motoru',
    summary: 'Gözü yormayan modern Koyu Tema, anlık Sporpuan push bildirimleri ve ultra hızlı mobil arayüz.',
    targetRole: 'all',
    targetRoleLabel: 'Genel Sistem Güncellemesi',
    category: 'improvement',
    categoryLabel: 'Sistem Güncellemesi',
    isNew: true,
    actionPage: 'anasayfa',
    actionLabel: 'Ana Sayfaya Dön',
    roleHighlight: 'Sistem geneli performans optimizasyonu ve yeni arayüz geliştirmeleri tamamlandı.',
    details: [
      'Açık, Koyu ve Sistem temaları arasında anlık geçiş.',
      'Mobil cihazlarda sıfır taşmalı ve tam ekran uyumlu açılır menüler.',
      'Çoklu şube arasında anlık veri senkronizasyonu ve bildirim zili.',
    ],
  },
  {
    id: 'upd-010',
    version: 'v2.8.0',
    date: '01 Eylül 2026',
    title: '7/24 Kesintisiz SportsFly Canlı Destek & Ticket Masası',
    summary: 'Kulüp, antrenör veya veli sorularınız için ortalama 8 dakikada yanıt veren canlı destek sistemi yayında.',
    targetRole: 'all',
    targetRoleLabel: 'Tüm Kullanıcılar',
    category: 'feature',
    categoryLabel: 'Destek',
    actionPage: 'destek',
    actionLabel: 'Destek Masasını Aç',
    roleHighlight: 'Teknik destek veya operasyonel sorularınız için 7/24 yanınızdayız.',
    details: [
      'Kategori bazlı destek talebi açma (Finans, Sporcu, Teknik, vb.).',
      'Ekran görüntüsü ve evrak yükleme desteği.',
      'Talebin anlık çözüm durumunu takip etme.',
    ],
  },
];

/**
 * Normalizes user role string to one of the target roles
 */
export function normalizeRoleKey(role?: string): UpdateTargetRole {
  if (!role) return 'yonetici';
  const r = role.toLowerCase();
  if (r.includes('admin') || r.includes('yönetici') || r.includes('yonetici') || r.includes('süper') || r.includes('baskan')) {
    return 'yonetici';
  }
  if (r.includes('antrenör') || r.includes('antrenor') || r.includes('koç') || r.includes('koc') || r.includes('egitmen') || r.includes('eğitmen') || r.includes('trainer')) {
    return 'antrenor';
  }
  if (r.includes('veli') || r.includes('ebeveyn') || r.includes('parent') || r.includes('aile')) {
    return 'veli';
  }
  if (r.includes('sporcu') || r.includes('öğrenci') || r.includes('ogrenci') || r.includes('athlete')) {
    return 'sporcu';
  }
  return 'yonetici';
}

/**
 * Returns banner highlight copy tailored to the user's role
 */
export function getRoleBannerText(role?: string): {
  title: string;
  description: string;
  badge: string;
  highlightUpdate: SystemUpdateItem;
} {
  const roleKey = normalizeRoleKey(role);
  const roleUpdates = SYSTEM_UPDATES.filter(
    (u) => u.targetRole === roleKey || (roleKey === 'yonetici' && u.targetRole === 'yonetici')
  );
  const primaryUpdate = roleUpdates[0] || SYSTEM_UPDATES[0];

  switch (roleKey) {
    case 'yonetici':
      return {
        title: 'Yöneticilere Özel Yeni Özellikler Yayında!',
        description: 'Sporpuan Kulüp Doğrulama Masası, çoklu şube konsolide finans raporları ve otomatik aidat takibi devreye alındı.',
        badge: 'Yönetici Güncellemesi v2.8.5',
        highlightUpdate: primaryUpdate,
      };
    case 'antrenor':
      return {
        title: 'Antrenörler İçin Yeni Eğitim & Yoklama Araçları!',
        description: 'Yeni branş bazlı antrenman planlama aracı, QR kodlu hızlı mobil yoklama ve sporcu gelişim radarı kullanımınıza hazır.',
        badge: 'Antrenör Güncellemesi v2.8.5',
        highlightUpdate: primaryUpdate,
      };
    case 'veli':
      return {
        title: 'Velilere Özel Anlık WhatsApp Karne & Bildirimler!',
        description: 'Çocuğunuzun seans devamlılığı, dijital karnesi ve online aidat ödeme kolaylığı veli portalında güncellendi.',
        badge: 'Veli Güncellemesi v2.8.5',
        highlightUpdate: primaryUpdate,
      };
    case 'sporcu':
      return {
        title: 'Sporcular İçin Yeni Rozetler & Gelişim Karnesi!',
        description: 'Sporpuan seviye rozetleri, kişisel başarı puanları ve antrenman performans grafikleri profilinize eklendi.',
        badge: 'Sporcu Güncellemesi v2.8.5',
        highlightUpdate: primaryUpdate,
      };
    default:
      return {
        title: 'Yeni Özellikleri Keşfedin!',
        description: 'Sporcularınızın gelişimini Sporpuan ile değerlendirebilir ve yeni Eğitim Planlama aracı ile antrenmanlarınızı organize edebilirsiniz.',
        badge: 'Sistem Güncellemesi v2.8.5',
        highlightUpdate: primaryUpdate,
      };
  }
}
