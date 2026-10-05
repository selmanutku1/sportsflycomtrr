export interface SportsFlyNotification {
  id: string;
  category: 'system' | 'support' | 'payment' | 'message' | 'birthday' | 'training' | 'sporpuan';
  title: string;
  description: string;
  time: string;
  isUnread: boolean;
  actionUrl?: string;
  points?: number;
  sporcuName?: string;
  sporcuId?: string;
}

export const DEFAULT_NOTIFICATIONS: Record<string, SportsFlyNotification[]> = {
  admin: [
    {
      id: 'admin-1',
      category: 'system',
      title: 'Sistem Güncellemesi v3.4',
      description: 'Finansal Gelir-Gider raporlama hızı %40 artırıldı. Tüm şube hareketleri artık anlık hesaplanmaktadır.',
      time: '5 dakika önce',
      isUnread: true,
    },
    {
      id: 'admin-2',
      category: 'support',
      title: 'Destek Talebi Cevaplandı',
      description: 'Destek No #1084: "QR Yoklama entegrasyonu donanım uyumluluğu" talebiniz onaylandı.',
      time: '1 saat önce',
      isUnread: true,
    },
    {
      id: 'admin-3',
      category: 'payment',
      title: 'Kadıköy Şubesi Aidat Girişi',
      description: 'Eylül ayı için toplam 14.500 TL yeni aidat tahsil edildi. Ödeme planları güncellendi.',
      time: '3 saat önce',
      isUnread: true,
    },
    {
      id: 'admin-4',
      category: 'message',
      title: 'Yeni Veli Mesajı',
      description: 'Veli Hande Demirci: "Ödeme Planı ve taksit seçenekleri hakkında bilgi alabilir miyim?"',
      time: '5 saat önce',
      isUnread: false,
    },
    {
      id: 'admin-5',
      category: 'birthday',
      title: '🎂 Bugün 3 Doğum Günü Var!',
      description: 'Yiğit Yılmaz, Ömer Çelik ve Ege Demir bugün yeni yaşlarına bastılar. Kutlama SMS\'i göndermek için tıklayın.',
      time: 'Bugün',
      isUnread: false,
    },
    {
      id: 'admin-6',
      category: 'training',
      title: 'Karaköy Şubesi Yoklaması',
      description: 'Karaköy Voleybol B Grubu antrenman yoklaması girildi. Antrenör Ali Özcan (Katılan: 12/15).',
      time: 'Dün',
      isUnread: false,
    },
  ],
  trainer: [
    {
      id: 'trainer-1',
      category: 'system',
      title: 'Mobil Yoklama Optimizasyonu',
      description: 'Zayıf internet koşullarında internetsiz (offline) yoklama alma ve QR tarayıcı algılama hızı artırıldı.',
      time: '15 dakika önce',
      isUnread: true,
    },
    {
      id: 'trainer-2',
      category: 'support',
      title: 'Eğitmen Değerlendirme Güncellemesi',
      description: 'Gelişim karne şablonunuza yeni motor becerileri ve sporpuan kriterleri eklendi.',
      time: '3 saat önce',
      isUnread: true,
    },
    {
      id: 'trainer-3',
      category: 'training',
      title: 'Haftalık Müfredat Hedefleri',
      description: 'Sorumlu olduğunuz grupların "Sıçrama ve Pas Koordinasyonu" antrenman kazanım değerlendirmelerini girin.',
      time: '5 saat önce',
      isUnread: true,
    },
    {
      id: 'trainer-4',
      category: 'message',
      title: 'Yönetici Selman Utku: Toplantı Ertelendi',
      description: '"Yarın saat 10:00\'daki haftalık teknik koordinasyon toplantısı salon tadilatı sebebiyle 11:30\'a ertelenmiştir."',
      time: '7 saat önce',
      isUnread: false,
    },
    {
      id: 'trainer-5',
      category: 'birthday',
      title: '🎂 Grubunuzda Doğum Günü!',
      description: 'Sizin grubunuzda yer alan sporcu Can Erten\'in bugün doğum günü! Antrenmanda tebrik etmeyi unutmayın.',
      time: 'Bugün',
      isUnread: false,
    },
    {
      id: 'trainer-6',
      category: 'message',
      title: 'Veli Mehmet Kaya: Aras Katılamayacak',
      description: '"Hocam iyi günler, Aras hafif gribal enfeksiyon geçirdiği için bugün antrenmana katılamayacaktır."',
      time: 'Dün',
      isUnread: false,
    },
  ],
  parent: [
    {
      id: 'parent-1',
      category: 'system',
      title: 'Yeni Mobil Veli Portalı',
      description: 'Geliştirilmiş mobil karne, anlık yoklama bildirimleri ve sporpuan gelişim grafikleri yayına alındı.',
      time: '10 dakika önce',
      isUnread: true,
    },
    {
      id: 'parent-2',
      category: 'payment',
      title: 'Eylül Ayı Aidat Ödemesi Alındı',
      description: 'Eylül ayı Basketbol branşı aidat ödemesi (3.200 TL) başarıyla tahsil edilmiştir. Makbuzunuz hazır.',
      time: '2 saat önce',
      isUnread: true,
    },
    {
      id: 'parent-3',
      category: 'training',
      title: 'Antrenman Yoklama Bildirimi',
      description: 'Çocuğunuz bugün "Kadıköy Basketbol A Grubu" antrenmanına katılım sağladı (Yoklama: Katıldı).',
      time: '4 saat önce',
      isUnread: true,
    },
    {
      id: 'parent-4',
      category: 'message',
      title: 'Yönetici Duyurusu: Cumhuriyet Kupası',
      description: 'Selman Utku: "29 Ekim Cumhuriyet Kupası basketbol turnuvası kayıtlarımız başladı. Son katılım 15 Ekim."',
      time: '6 saat önce',
      isUnread: false,
    },
    {
      id: 'parent-5',
      category: 'birthday',
      title: '🎂 Mutlu Yıllar Sevgili Sporcumuz! 🎉',
      description: 'SportsFly ailesi olarak sevgili sporcumuzun doğum gününü kutlar, sağlık ve başarı dolu yeni bir yaş dileriz!',
      time: 'Bugün',
      isUnread: false,
    },
    {
      id: 'parent-6',
      category: 'support',
      title: 'Kardeş İndirimi Başvurunuz Onaylandı',
      description: 'Muhasebe onayı: İki çocuğunuz için geçerli %15 kardeş indirimi bir sonraki dönem aidatınıza yansıtıldı.',
      time: 'Dün',
      isUnread: false,
    },
  ],
};

const STORAGE_KEY_PREFIX = 'sportsfly_notifications_';

export function getStoredNotifications(role: string): SportsFlyNotification[] {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATIONS.admin;
  
  // Detect category from role string
  let key = 'admin';
  const roleLower = role.toLowerCase();
  if (roleLower.includes('veli') || roleLower.includes('ebeveyn') || roleLower.includes('parent')) {
    key = 'parent';
  } else if (roleLower.includes('antrenör') || roleLower.includes('antrenor') || roleLower.includes('eğitmen') || roleLower.includes('coach') || roleLower.includes('trainer')) {
    key = 'trainer';
  }

  try {
    const cached = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error('Failed to parse notifications', err);
  }
  
  return DEFAULT_NOTIFICATIONS[key] || DEFAULT_NOTIFICATIONS.admin;
}

export function saveStoredNotifications(role: string, notifications: SportsFlyNotification[]): void {
  if (typeof window === 'undefined') return;

  let key = 'admin';
  const roleLower = role.toLowerCase();
  if (roleLower.includes('veli') || roleLower.includes('ebeveyn') || roleLower.includes('parent')) {
    key = 'parent';
  } else if (roleLower.includes('antrenör') || roleLower.includes('antrenor') || roleLower.includes('eğitmen') || roleLower.includes('coach') || roleLower.includes('trainer')) {
    key = 'trainer';
  }

  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(notifications));
    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('sportsfly_notifications_updated', { detail: { role, notifications } }));
  } catch (err) {
    console.error('Failed to save notifications', err);
  }
}

export function addSporPuanNotification(detail: {
  sporcuName: string;
  ruleName: string;
  points: number;
  category: string;
  note?: string;
  sporcuId?: string;
}): SportsFlyNotification {
  const newNotification: SportsFlyNotification = {
    id: `sporpuan-${Date.now()}`,
    category: 'sporpuan',
    title: 'Yeni Puan Kazanımı',
    description: `${detail.sporcuName} sporcusuna "${detail.ruleName}" kapsamında +${detail.points} SP puanı tanımlandı.${detail.note ? ` (Not: ${detail.note})` : ''}`,
    time: 'Şimdi',
    isUnread: true,
    points: detail.points,
    sporcuName: detail.sporcuName,
    sporcuId: detail.sporcuId,
    actionUrl: 'sporpuan-sporcu-degerlendirme',
  };

  // Add notification for admin, trainer and parent so all user roles see it in the notification center
  const roles = ['admin', 'trainer', 'parent'];
  roles.forEach((r) => {
    const current = getStoredNotifications(r);
    const updated = [newNotification, ...current];
    saveStoredNotifications(r, updated);
  });

  // Dispatch custom push event for instant mobile/desktop toast notification and haptic vibration
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sportsfly_point_earned', {
        detail: {
          ...detail,
          notificationId: newNotification.id,
          notification: newNotification,
        },
      })
    );
  }

  return newNotification;
}
