import {
  SupportTicketFull,
  SupportTicketCategory,
  FAQItem,
  SupportMessage,
} from '../types/destek';
import { PackagePlanType } from '../types';

export const SUPPORT_CATEGORIES: {
  id: SupportTicketCategory;
  name: string;
  description: string;
  iconName: string;
  color: string;
}[] = [
  {
    id: 'teknik',
    name: 'Teknik & Hata Bildirimi',
    description: 'Sistem hatası, sayfa açılmama, oturum veya bağlantı problemleri',
    iconName: 'Wrench',
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'muhasebe',
    name: 'Aidat, POS & Faturalandırma',
    description: 'Sanal POS tahsilatları, otomatik aidat takibi ve fatura soruları',
    iconName: 'CreditCard',
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'paket',
    name: 'Paket, Lisans & Kota Yükseltme',
    description: 'Sporcu kotası artırma, şube ekleme ve Pro Akademi geçişi',
    iconName: 'PackageCheck',
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'egitim-planlama',
    name: 'Eğitim & Taktik Planlama',
    description: 'Müfredat şablonları, taktik saha tahtası ve drill oluşturma',
    iconName: 'Target',
    color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  },
  {
    id: 'veli-karne',
    name: 'WhatsApp & Dijital Karne',
    description: 'Velilere otomatik karne gönderimi, SMS ve bildirim ayarları',
    iconName: 'MessageSquare',
    color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  },
  {
    id: 'entegrasyon',
    name: 'Mobil Uygulama & White-Label',
    description: 'Özel alan adı kurulumu, kulüp mobil uygulaması ve API erişimi',
    iconName: 'Smartphone',
    color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'oneri',
    name: 'Özellik Önerisi & Geliştirme',
    description: 'Sisteme eklenmesini istediğiniz yeni özellikler ve kulüp geri bildirimleri',
    iconName: 'SportsFlyIcon',
    color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  },
];

export const INITIAL_SUPPORT_TICKETS_FULL: SupportTicketFull[] = [
  {
    id: 'SF-1048',
    ticketNumber: 1048,
    subject: 'Sanal POS Entegrasyonu ve Aidat Hatırlatma SMS Ayarları',
    category: 'muhasebe',
    priority: 'Yuksek',
    status: 'Yanitlandi',
    clubName: 'Gelecek Yıldızlar Spor Kulübü',
    clubPackage: 'Pro Akademi & Çoklu Şube',
    clubBranch: 'Merkez Kampüs',
    creatorName: 'Selman Utku',
    creatorEmail: 'selmanutkumarmara@gmail.com',
    creatorPhone: '+90 532 900 12 34',
    createdAt: '19.09.2026 09:15',
    updatedAt: '19.09.2026 10:42',
    preferredContact: 'panel',
    assignedAgent: {
      name: 'Emre Yılmaz',
      title: 'SportsFly Kıdemli Destek Uzmanı',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      status: 'online',
    },
    messages: [
      {
        id: 'msg-1',
        ticketId: 'SF-1048',
        senderType: 'club_admin',
        senderName: 'Selman Utku (Kulüp Yöneticisi)',
        senderRole: 'Kulüp Yöneticisi',
        createdAt: '19.09.2026 09:15',
        message:
          'Merhaba SportsFly Ekibi,\n\nYeni açılan Kadıköy şubemiz için Sanal POS tanımlaması yaptık. Velilere vadesi geçen aidatlar için otomatik WhatsApp/SMS hatırlatması göndermek istiyoruz. Bu şubeye özel SMS başlığı ve ödeme linki parametrelerini nasıl aktif hale getirebiliriz?',
        attachments: [
          {
            name: 'pos_entegrasyon_ekran.png',
            size: '2.4 MB',
            type: 'image/png',
          },
        ],
      },
      {
        id: 'msg-2',
        ticketId: 'SF-1048',
        senderType: 'sportsfly_agent',
        senderName: 'Emre Yılmaz (SportsFly Kıdemli Destek Uzmanı)',
        senderRole: 'SportsFly Kıdemli Destek Uzmanı',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        createdAt: '19.09.2026 10:42',
        message:
          'Merhaba Selman Bey,\n\nPro Akademi & Çoklu Şube lisansınız kapsamında Kadıköy şubenizin Sanal POS onayını az önce tamamladık. \n\nOtomatik hatırlatıcılar için:\n1. Sol menüden **Şube Yönetimi > Kadıköy Şubesi** sekmesini açın.\n2. **Ödeme & POS Ayarları** bölümünden "Vadesinden 3 Gün Önce Otomatik WhatsApp Gönderimi" kutucuğunu işaretleyin.\n3. SMS başlığınız BTK onaylı olarak sisteminize tanımlandı. \n\nHerhangi bir test ödemesi gerçekleştirmek isterseniz 1 TL test modunu açabiliriz. Başka bir sorunuz olursa memnuniyetle yardımcı oluruz!',
      },
    ],
  },
  {
    id: 'SF-1045',
    ticketNumber: 1045,
    subject: 'U14 Basketbol Branşı İçin Taktik Saha Şablonu Aktarımı',
    category: 'egitim-planlama',
    priority: 'Normal',
    status: 'MusteriYaniti',
    clubName: 'Gelecek Yıldızlar Spor Kulübü',
    clubPackage: 'Pro Akademi & Çoklu Şube',
    clubBranch: 'Kadıköy Şubesi',
    creatorName: 'Burak Demir (Baş Antrenör)',
    creatorEmail: 'burak.demir@kartalyuzme.com',
    creatorPhone: '+90 533 444 55 66',
    createdAt: '18.09.2026 14:20',
    updatedAt: '18.09.2026 16:05',
    preferredContact: 'whatsapp',
    assignedAgent: {
      name: 'Gizem Kaya',
      title: 'Akademi Müfredat Danışmanı',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
      status: 'online',
    },
    messages: [
      {
        id: 'msg-3',
        ticketId: 'SF-1045',
        senderType: 'club_admin',
        senderName: 'Burak Demir (Baş Antrenör)',
        senderRole: 'Antrenör',
        createdAt: '18.09.2026 14:20',
        message:
          'Eğitim Planlama modülünde 12 haftalık Spiral Basketbol müfredatını kendi U14 takımımıza kopyaladık. Taktik tahtasında çizdiğimiz hücum setlerini antrenör yardımcılarımızın mobil uygulamasında görebilmesi için yetki verme adımı var mıdır?',
      },
      {
        id: 'msg-4',
        ticketId: 'SF-1045',
        senderType: 'sportsfly_agent',
        senderName: 'Gizem Kaya (SportsFly Danışmanı)',
        senderRole: 'Akademi Müfredat Danışmanı',
        senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
        createdAt: '18.09.2026 15:10',
        message:
          'Merhabalar Burak Hocam,\n\nEğitim planı detay sayfasında sağ üstteki **"Takıma / Gruba Ata"** butonunu kullanarak ilgili U14 grubunu seçtiğinizde, o grubun antrenör listesindeki tüm eğitmenlerin ekranına taktik tahtası ve drill kartları otomatik olarak senkronize olmaktadır.',
      },
      {
        id: 'msg-5',
        ticketId: 'SF-1045',
        senderType: 'club_admin',
        senderName: 'Burak Demir (Baş Antrenör)',
        senderRole: 'Antrenör',
        createdAt: '18.09.2026 16:05',
        message:
          'Harika, şimdi denedim ve tüm yardımcı antrenörlerimizin tabletinde anında göründü. Çok teşekkür ederim!',
      },
    ],
  },
  {
    id: 'SF-1039',
    ticketNumber: 1039,
    subject: 'WhatsApp Dijital Sporcu Karnesi Toplu Gönderim Hızı',
    category: 'veli-karne',
    priority: 'Normal',
    status: 'Cozuldu',
    clubName: 'Gelecek Yıldızlar Spor Kulübü',
    clubPackage: 'Pro Akademi & Çoklu Şube',
    creatorName: 'Selman Utku',
    creatorEmail: 'selmanutkumarmara@gmail.com',
    creatorPhone: '+90 532 900 12 34',
    createdAt: '15.09.2026 11:00',
    updatedAt: '15.09.2026 12:30',
    closedAt: '15.09.2026 13:15',
    preferredContact: 'panel',
    assignedAgent: {
      name: 'Emre Yılmaz',
      title: 'SportsFly Kıdemli Destek Uzmanı',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      status: 'online',
    },
    feedback: {
      rating: 5,
      comment: 'Çok hızlı çözüm sağlandı, velilerimize 150 adet karne 2 dakikada ulaştı.',
      submittedAt: '15.09.2026 13:20',
    },
    messages: [
      {
        id: 'msg-6',
        ticketId: 'SF-1039',
        senderType: 'club_admin',
        senderName: 'Selman Utku',
        senderRole: 'Kulüp Yöneticisi',
        createdAt: '15.09.2026 11:00',
        message:
          'Dönem sonu karnelerini velilerimize toplu göndermek istiyoruz. 250 sporcunun tamamına tek tıkla gönderildiğinde WhatsApp hız limiti kısıtlaması yaşanır mı?',
      },
      {
        id: 'msg-7',
        ticketId: 'SF-1039',
        senderType: 'sportsfly_agent',
        senderName: 'Emre Yılmaz (SportsFly)',
        senderRole: 'SportsFly Kıdemli Destek Uzmanı',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        createdAt: '15.09.2026 12:30',
        message:
          'Selman Bey merhaba,\n\nSportsFly WhatsApp Business API altyapımız kurumsal kuyruk mekanizması ile çalışır. 250 karneniz sistem tarafından saniyede 15 mesaj hızında güvenle dağıtılır ve spam filtresine takılmadan velilerin cebine PDF formatında teslim edilir. Raporu "Karne Yönetimi > Gönderim Günlüğü" alanından canlı izleyebilirsiniz.',
      },
    ],
  },
  {
    id: 'SF-1032',
    ticketNumber: 1032,
    subject: 'Mobil Uygulama App Store & Google Play Özel Kulüp Yayını',
    category: 'entegrasyon',
    priority: 'Dusuk',
    status: 'Cozuldu',
    clubName: 'Gelecek Yıldızlar Spor Kulübü',
    clubPackage: 'Pro Akademi & Çoklu Şube',
    creatorName: 'Selman Utku',
    creatorEmail: 'selmanutkumarmara@gmail.com',
    creatorPhone: '+90 532 900 12 34',
    createdAt: '10.09.2026 16:40',
    updatedAt: '11.09.2026 10:15',
    closedAt: '11.09.2026 14:00',
    preferredContact: 'email',
    assignedAgent: {
      name: 'Mert Aksoy',
      title: 'Mobil & White-Label Geliştirici',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      status: 'offline',
    },
    feedback: {
      rating: 5,
      comment: 'Logo ve renklerimiz tam istediğimiz gibi uygulandı.',
      submittedAt: '11.09.2026 14:05',
    },
    messages: [
      {
        id: 'msg-8',
        ticketId: 'SF-1032',
        senderType: 'club_admin',
        senderName: 'Selman Utku',
        senderRole: 'Kulüp Yöneticisi',
        createdAt: '10.09.2026 16:40',
        message:
          'Pro Akademi paketimizdeki White-Label mobil uygulama yayınlama süreci için kulüp logolarımızı ve renk kodlarımızı hangi adrese iletmeliyiz?',
      },
      {
        id: 'msg-9',
        ticketId: 'SF-1032',
        senderType: 'sportsfly_agent',
        senderName: 'Mert Aksoy (SportsFly Mobil Ekibi)',
        senderRole: 'Mobil Geliştirici',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        createdAt: '11.09.2026 10:15',
        message:
          'Selman Bey merhaba,\n\nKulüp logo ve ikon setinizi doğrudan bu destek talebine ekleyebilir veya mobil@sportsfly.app adresimize iletebilirsiniz. Ortalama 48 saat içinde iOS & Android test sürümlerini kulüp yöneticilerinizin telefonlarına test amaçlı göndereceğiz.',
      },
    ],
  },
];

export const FAQ_KNOWLEDGE_BASE: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'teknik',
    question: 'Mobil uyumlu yoklama nasıl alınır ve QR kod okutma nasıl çalışır?',
    summary: 'Antrenörler cep telefonlarından seans yoklamasını saniyeler içinde tamamlayabilir.',
    readTime: '2 dk okuma',
    tags: ['Yoklama', 'QR Kod', 'Mobil', 'Antrenör'],
    content: [
      'Sol menüden "Yoklama" sayfasına geçiş yapın.',
      'Günün antrenman seansını ve grubunu seçin.',
      '"QR Kod Göster" butonuna basarak salondaki ekrana veya panoya QR kodu yansıtabilirsiniz.',
      'Sporcular kulüp uygulamasından QR kodu okuttuklarında yoklama otomatik yeşile döner veya antrenör listeden manuel "Geldi / Gelmedi / İzinli" işaretlemesi yapabilir.',
    ],
  },
  {
    id: 'faq-2',
    category: 'muhasebe',
    question: 'Sanal POS ile velilerden kredi kartıyla otomatik aidat tahsilatı nasıl yapılır?',
    summary: 'İyzico / PayTR veya banka Sanal POS entegrasyonu ile aidatlar otomatik tahsil edilir.',
    readTime: '3 dk okuma',
    tags: ['Sanal POS', 'Aidat', 'Tahsilat', 'Fatura'],
    content: [
      'Kulüp & Akademi ve Pro Akademi paketlerinde "Ön Muhasebe > Sanal POS Ayarları" sekmesine gidin.',
      'Banka veya aracı kurumunuzun API anahtarlarını girin ve "Test Modunu Doğrula" butonuna tıklayın.',
      'Velilere SMS veya WhatsApp ile giden aidat bildirimlerinde "Güvenli Online Öde" butonu otomatik eklenir.',
      'Ödeme tamamlandığında sporcunun aidat durumu anında "Ödendi" olarak güncellenir ve kulüp kasasına işlenir.',
    ],
  },
  {
    id: 'faq-3',
    category: 'egitim-planlama',
    question: 'Futbol, Basketbol ve Voleybol için hazır müfredat şablonları nasıl kullanılır?',
    summary: 'Pro Akademi paketine dahil spiral yaş kategorisi şablonlarını tek tıkla takımlarınıza atayın.',
    readTime: '4 dk okuma',
    tags: ['Eğitim Planlama', 'Taktik Tahtası', 'Müfredat', 'Drill'],
    content: [
      'Sol menüdeki "Eğitim Planlama" sayfasına tıklayın.',
      'Futbol, Basketbol veya Voleybol sekmelerinden yaş grubunuza (U8-U10, U11-U13, U14-U16, U17+) uygun hazır 12 haftalık plana göz atın.',
      '"Bu Şablonu Kullan / Kopyala" butonuna basarak antrenman hedefleri, ısınma, ana evre ve soğuma drill\'lerini özelleştirin.',
      'İnteraktif Taktik Tahtası üzerinde oyuncu hareketlerini, pas yollarını ve konileri çizerek antrenörlerinize iletin.',
    ],
  },
  {
    id: 'faq-4',
    category: 'veli-karne',
    question: 'Sporcu karnesi nasıl oluşturulur ve velilere WhatsApp ile nasıl iletilir?',
    summary: 'Yıldız puanlama, teknik-taktik radar grafikleri ve öğretmen notları içeren dijital karne.',
    readTime: '2 dk okuma',
    tags: ['Sporcu Karnesi', 'WhatsApp', 'Radar Grafiği', 'Gelişim'],
    content: [
      'Sol menüden "Sporcu Karnesi" modülüne gidin.',
      '"Yeni Dönem Karnesi Oluştur" butonuna basıp branş ve kriterleri (Top Sürme, Pas, Şut, Kondisyon, Disiplin) belirleyin.',
      'Antrenör puanlamaları tamamlandığında "Toplu WhatsApp Gönder" butonuna basın.',
      'Her veliye özel link ve grafik kart içeren WhatsApp mesajı SportsFly kurumsal hattı üzerinden otomatik iletilir.',
    ],
  },
  {
    id: 'faq-5',
    category: 'paket',
    question: 'Paketimi yükselttiğimde geçmiş verilerim ve sporcu kayıtlarım korunur mu?',
    summary: 'Paket yükseltmelerinde hiçbir veri kaybı olmadan tüm kotalar ve yeni modüller anında açılır.',
    readTime: '1 dk okuma',
    tags: ['Paket Yükseltme', 'Kota', 'Pro Akademi', 'Lisans'],
    content: [
      'Evet! Başlangıç Kulübü veya Kulüp & Akademi paketinden Pro Akademi paketine geçtiğiniz anda mevcut tüm sporcularınız, aidat geçmişiniz ve yoklamalarınız korunur.',
      'Yeni şubeler ekleme, sınırsız sporcu kapasitesi, eğitim planlama ve gelişmiş ön muhasebe modülleri anında aktif olur.',
    ],
  },
];

const STORAGE_KEY_DESTEK = 'sportsfly_support_tickets_v2';

export function getStoredSupportTickets(): SupportTicketFull[] {
  if (typeof window === 'undefined') return INITIAL_SUPPORT_TICKETS_FULL;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DESTEK);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_DESTEK, JSON.stringify(INITIAL_SUPPORT_TICKETS_FULL));
      return INITIAL_SUPPORT_TICKETS_FULL;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Error parsing stored support tickets:', err);
  }
  return INITIAL_SUPPORT_TICKETS_FULL;
}

export function saveStoredSupportTickets(tickets: SupportTicketFull[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_DESTEK, JSON.stringify(tickets));
    window.dispatchEvent(
      new CustomEvent('sportsfly_support_updated', {
        detail: tickets,
      })
    );
  } catch (err) {
    console.error('Error saving support tickets:', err);
  }
}

/**
 * Intelligent dynamic simulated response from SportsFly support specialist
 */
export function generateSpecialistAutoReply(
  ticket: SupportTicketFull,
  userMessageText: string
): SupportMessage {
  const agentName = ticket.assignedAgent?.name || 'Emre Yılmaz';
  const agentRole = ticket.assignedAgent?.title || 'SportsFly Kıdemli Destek Uzmanı';

  let replyText = '';
  const lower = userMessageText.toLowerCase();

  if (ticket.category === 'muhasebe' || lower.includes('pos') || lower.includes('aidat') || lower.includes('fatura')) {
    replyText = `Sayın ${ticket.creatorName},\n\nÖdeme ve aidat entegrasyonu talebinizi inceledik. ${ticket.clubName} kulübünüzün Sanal POS loglarını kontrol ettiğimizde banka onay protokolünün aktif olduğunu görmekteyiz. \n\nGeciken ödemeler ve otomatik tahsilat kurallarını Ön Muhasebe sekmesinden anlık olarak yönetebilirsiniz. Herhangi bir dekont veya ekstreyi buraya ekleyerek incelenmesini talep edebilirsiniz.`;
  } else if (ticket.category === 'egitim-planlama' || lower.includes('antrenman') || lower.includes('taktik') || lower.includes('drill')) {
    replyText = `Merhabalar ${ticket.creatorName},\n\nEğitim planlama ve branş bazlı taktik şablonları hakkında ilettiğiniz detayları kaydettik. Hazır spiral müfredat şablonları tüm şube ve antrenörlerinizle gerçek zamanlı senkronize çalışır.\n\nİstediğiniz takdirde kulübünüzün antrenör kadrosu için 15 dakikalık canlı ekran paylaşımı ile eğitim oturumu planlayabiliriz.`;
  } else if (ticket.category === 'veli-karne' || lower.includes('whatsapp') || lower.includes('karne') || lower.includes('sms')) {
    replyText = `Merhaba ${ticket.creatorName},\n\nWhatsApp dijital sporcu karnesi ve veli bildirim sunucularımız 7/24 aktif durumdadır. Mesaj şablonlarınız BTK & Meta onaylı kurumsal hat üzerinden velilerin telefonlarına güvenle ulaştırılmaktadır. Karne PDF linkleri 30 gün boyunca güvenli bulutta saklanmaktadır.`;
  } else if (ticket.category === 'entegrasyon' || lower.includes('mobil') || lower.includes('white-label') || lower.includes('uygulama')) {
    replyText = `Selamlar ${ticket.creatorName},\n\n${ticket.clubName} adına özel mobil uygulama ve alan adı yapılandırma talebiniz teknik ekibimiz tarafından sıraya alındı. Kurumsal renkleriniz ve logonuz hazırlandığında test bağlantısı bu mesajlaşma ekranına iletilecektir.`;
  } else {
    replyText = `Sayın ${ticket.creatorName},\n\nİlettiğiniz "${ticket.subject}" konulu destek talebiniz SportsFly Müşteri Başarı ekibimiz tarafından incelenmektedir. Talebiniz en kısa sürede çözümlenerek bu panel üzerinden ve tercih ettiğiniz iletişim kanalıyla size bilgi verilecektir.\n\nSportsFly Destek Ekibi olarak her zaman yanınızdayız.`;
  }

  const now = new Date();
  const timeStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return {
    id: `msg-${Date.now()}`,
    ticketId: ticket.id,
    senderType: 'sportsfly_agent',
    senderName: `${agentName} (${agentRole})`,
    senderRole: agentRole,
    senderAvatar:
      ticket.assignedAgent?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    createdAt: timeStr,
    message: replyText,
  };
}
