import { KulupEvrakItem, KulupGaleriItem, KulupEvrakKategori, KulupGaleriKategori, MedyaKlasorItem } from '../types';

export const PRESET_AVATARS = [
  {
    id: 'avatar-1',
    label: 'Genç Erkek Basketbolcu',
    url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-2',
    label: 'Genç Kadın Voleybolcu',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-3',
    label: 'Atletik Sporcu (Erkek)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-4',
    label: 'Atletik Sporcu (Kadın)',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-5',
    label: 'Yüzücü / Antrenman',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-6',
    label: 'Altyapı Forvet',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-7',
    label: 'Genç Kız Jimnastik/Voleybol',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-8',
    label: 'Takım Kaptanı',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_MEDYA_KLASORLER: MedyaKlasorItem[] = [
  {
    id: 'folder-1',
    name: '2025-2026 Sezonu Antrenmanları',
    description: 'A Takım ve Gelişim Grubu haftalık taktik, şut ve kondisyon antrenman kayıtları.',
    category: 'Antrenman',
    club: 'DigiMondi',
    branch: 'Basketbol',
    color: 'blue',
    itemCount: 4,
    totalSize: '24.8 MB',
    createdAt: '01.09.2024',
    coverImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'folder-2',
    name: 'Turnuvalar & Şampiyonluklar',
    description: 'İl Şampiyonası, bölge ligi müsabakaları, kupa törenleri ve madalya seremonileri.',
    category: 'Kupa & Madalya',
    club: 'DigiMondi',
    branch: 'Basketbol',
    color: 'amber',
    itemCount: 2,
    totalSize: '18.4 MB',
    createdAt: '15.06.2024',
    coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'folder-3',
    name: 'Yaz & Kış Gelişim Kampları',
    description: 'Antalya yaz kampı, Kartepe kondisyon kampı ve takım içi sosyal etkinlikler.',
    category: 'Kamp & Etkinlik',
    club: 'aicosports',
    branch: 'Voleybol',
    color: 'emerald',
    itemCount: 2,
    totalSize: '16.2 MB',
    createdAt: '10.07.2024',
    coverImage: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'folder-4',
    name: 'Sporcu Portre & Lisans Fotoğrafları',
    description: 'TBF / TVF resmi lisans işlemleri, oyuncu kimlik kartları ve medya günleri.',
    category: 'Portre & Lisans',
    club: 'Saraçgym',
    branch: 'Basketbol',
    color: 'indigo',
    itemCount: 3,
    totalSize: '12.6 MB',
    createdAt: '20.08.2024',
    coverImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'folder-5',
    name: 'Tesis, Salon & Ekipman Fotoğrafları',
    description: 'Kapalı spor salonu, yarı olimpik havuz, fitness salonu ve yenilenen ekipmanlar.',
    category: 'Tesis & Ekipman',
    club: 'DigiMondi',
    branch: 'Genel',
    color: 'purple',
    itemCount: 2,
    totalSize: '14.1 MB',
    createdAt: '05.08.2024',
    coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_KULUP_EVRAKLAR: KulupEvrakItem[] = [
  {
    id: 'evrak-1',
    title: 'TBF 2025/2026 Sezonu Resmi Yarışmacı Kulüp Lisansı',
    club: 'DigiMondi',
    athleteId: 's-1',
    athleteName: 'Selman Utku',
    category: 'Lisans',
    documentNumber: 'TR-IST-2024-42216',
    issueDate: '01.09.2024',
    expiryDate: '30.06.2025',
    status: 'Geçerli',
    fileType: 'pdf',
    fileSize: '1.2 MB',
    uploadedBy: 'Ali Özcan (Başantrenör)',
    notes: 'TBF İstanbul İl Temsilciliği vize onaylı resmi lisans belgesi.',
  },
  {
    id: 'evrak-2',
    title: 'Spor Hekimliği Kardiyoloji & EKG Sağlık Onay Raporu',
    club: 'DigiMondi',
    athleteId: 's-1',
    athleteName: 'Selman Utku',
    category: 'Sağlık Raporu',
    documentNumber: 'SR-2024-88192',
    issueDate: '15.09.2024',
    expiryDate: '15.09.2025',
    status: 'Geçerli',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    uploadedBy: 'Dr. Burak Aksoy',
    notes: 'Ağır eforlu müsabaka ve antrenman yapmaya uygundur kararı verilmiştir.',
  },
  {
    id: 'evrak-3',
    title: 'Veli Seyahat, Deplasman ve Acil Müdahale İzin Belgesi',
    club: 'DigiMondi',
    athleteId: 's-1',
    athleteName: 'Selman Utku',
    category: 'Veli İzin Belgesi',
    documentNumber: 'VM-2024-004',
    issueDate: '04.09.2024',
    expiryDate: '31.08.2025',
    status: 'Geçerli',
    fileType: 'pdf',
    fileSize: '890 KB',
    uploadedBy: 'Kemal Utku (Veli)',
    notes: 'Şehir dışı turnuvalar ve acil tıbbi müdahale onayı içeren ıslak imzalı muvafakatname.',
  },
  {
    id: 'evrak-4',
    title: 'Öğrenci Belgesi ve Nüfus Cüzdanı Fotokopisi',
    club: 'DigiMondi',
    athleteId: 's-1',
    athleteName: 'Selman Utku',
    category: 'Kimlik & Kayıt',
    documentNumber: 'NFS-422162',
    issueDate: '10.09.2024',
    expiryDate: '30.06.2025',
    status: 'Geçerli',
    fileType: 'jpg',
    fileSize: '1.8 MB',
    uploadedBy: 'Kulüp Sekreteryası',
    notes: 'E-Devlet barkodlu öğrenci belgesi ve kimlik sureti.',
  },
  {
    id: 'evrak-5',
    title: 'TBF Kulüp Gelişim Lisansı (Vize Süresi Yaklaşıyor)',
    club: 'Saraçgym',
    athleteId: 's-3',
    athleteName: 'Kaan Yıldırım',
    category: 'Lisans',
    documentNumber: 'TR-ANK-2024-10839',
    issueDate: '15.10.2023',
    expiryDate: '15.10.2024',
    status: 'Süresi Yaklaşan',
    fileType: 'pdf',
    fileSize: '950 KB',
    uploadedBy: 'Saraçgym İdari İşler',
    notes: 'Vize yenileme tarihi yaklaşmaktadır, federasyon harcının yatırılması gereklidir.',
  },
  {
    id: 'evrak-6',
    title: 'Yıllık Periyodik Sporcu Sağlık Raporu',
    club: 'Saraçgym',
    athleteId: 's-3',
    athleteName: 'Kaan Yıldırım',
    category: 'Sağlık Raporu',
    documentNumber: 'SH-2024-9182',
    issueDate: '10.05.2024',
    expiryDate: '10.05.2025',
    status: 'Geçerli',
    fileType: 'pdf',
    fileSize: '1.6 MB',
    uploadedBy: 'Saraçgym Sağlık Kurulu',
    notes: 'Solunum fonksiyon ve kan tahlili değerleri normaldir.',
  },
  {
    id: 'evrak-7',
    title: 'TVF Voleybol Federasyonu Sezonluk Sporcu Lisansı',
    club: 'aicosports',
    athleteId: 's-4',
    athleteName: 'Melis Aksoy',
    category: 'Lisans',
    documentNumber: 'TVF-2024-5541',
    issueDate: '15.06.2024',
    expiryDate: '15.06.2025',
    status: 'Geçerli',
    fileType: 'pdf',
    fileSize: '1.1 MB',
    uploadedBy: 'aicosports Yönetimi',
    notes: 'TVF Küçük Kızlar Ligi tescilli sporcu kartı.',
  },
  {
    id: 'evrak-8',
    title: 'Sporcu Muayene Formu (Süresi Dolmuş - Acil Yenileme)',
    club: 'Selman Utku',
    athleteId: 's-2',
    athleteName: 'Dhhbn',
    category: 'Sağlık Raporu',
    documentNumber: 'AH-2023-112',
    issueDate: '20.08.2023',
    expiryDate: '20.08.2024',
    status: 'Süresi Dolmuş',
    fileType: 'pdf',
    fileSize: '720 KB',
    uploadedBy: 'Sistem Uyarısı',
    notes: 'Sağlık raporu süresi dolmuştur, antrenmanlara katılabilmesi için yeni rapor zorunludur.',
  },
  {
    id: 'evrak-9',
    title: 'DigiMondi Kulüp Tüzüğü, Disiplin Talimatı ve KVKK Metni',
    club: 'DigiMondi',
    category: 'Kulüp Sözleşmesi',
    documentNumber: 'KLP-SOZ-2024-01',
    issueDate: '01.01.2024',
    status: 'Geçerli',
    fileType: 'pdf',
    fileSize: '3.5 MB',
    uploadedBy: 'Kulüp Yönetim Kurulu',
    notes: 'Kulüp sporcuları ve velileri için geçerli resmi sözleşme ve haklar şartnamesi.',
  },
  {
    id: 'evrak-10',
    title: 'Saraçgym Tesis Kullanım ve Sporcu Muvafakatnamesi',
    club: 'Saraçgym',
    category: 'Kulüp Sözleşmesi',
    documentNumber: 'SRCG-TESIS-24',
    issueDate: '01.02.2024',
    status: 'Geçerli',
    fileType: 'pdf',
    fileSize: '2.1 MB',
    uploadedBy: 'Saraçgym Yönetimi',
    notes: 'Kapalı spor salonu ve kondisyon alanı güvenlik taahhüt belgesi.',
  },
];

export const INITIAL_KULUP_GALERI: KulupGaleriItem[] = [
  {
    id: 'gal-1',
    title: 'U16 Basketbol Sezon Açılışı & Taktik İdmanı',
    club: 'DigiMondi',
    category: 'Antrenman',
    date: '14.09.2024',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1000&auto=format&fit=crop&q=80',
    description: 'Yeni sezon hazırlıklarında pas temposu ve hücum geçişleri çalışıldı.',
    taggedAthletes: ['Selman Utku', 'Dhhbn'],
    uploaderName: 'Ali Özcan',
    folderId: 'folder-1',
    folderName: '2025-2026 Sezonu Antrenmanları',
    fileSize: '3.4 MB',
    mediaType: 'image',
    branch: 'Basketbol',
    isKvkkApproved: true,
  },
  {
    id: 'gal-2',
    title: 'İstanbul İl Şampiyonası Kupa & Madalya Seremonisi',
    club: 'DigiMondi',
    category: 'Kupa & Madalya',
    date: '02.06.2024',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1000&auto=format&fit=crop&q=80',
    description: 'Final karşılaşmasını 74-68 kazanarak il şampiyonluğu kupasını kaldırdık.',
    taggedAthletes: ['Selman Utku'],
    uploaderName: 'Kulüp Medya',
    folderId: 'folder-2',
    folderName: 'Turnuvalar & Şampiyonluklar',
    fileSize: '4.8 MB',
    mediaType: 'image',
    branch: 'Basketbol',
    isKvkkApproved: true,
  },
  {
    id: 'gal-3',
    title: 'Hızlı Hücum ve Pota Altı Bitiriş Çalışması',
    club: 'DigiMondi',
    category: 'Antrenman',
    date: '08.09.2024',
    imageUrl: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=1000&auto=format&fit=crop&q=80',
    description: 'Yoğun tempoda geçen bire bir forvet ve oyun kurucu antrenmanı.',
    taggedAthletes: ['Selman Utku'],
    uploaderName: 'Ali Özcan',
    folderId: 'folder-1',
    folderName: '2025-2026 Sezonu Antrenmanları',
    fileSize: '2.9 MB',
    mediaType: 'image',
    branch: 'Basketbol',
    isKvkkApproved: true,
  },
  {
    id: 'gal-4',
    title: 'Saraçgym Altyapı Hazırlık Turnuvası Maçı',
    club: 'Saraçgym',
    category: 'Maç & Turnuva',
    date: '20.08.2024',
    imageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1000&auto=format&fit=crop&q=80',
    description: 'Sezon öncesi hazırlık maçında yüksek savunma disiplini sergilendi.',
    taggedAthletes: ['Kaan Yıldırım'],
    uploaderName: 'Saraçgym Antrenör Ekibi',
    folderId: 'folder-2',
    folderName: 'Turnuvalar & Şampiyonluklar',
    fileSize: '3.6 MB',
    mediaType: 'image',
    branch: 'Basketbol',
    isKvkkApproved: true,
  },
  {
    id: 'gal-5',
    title: 'Gelişim Grubu Şut & Denge Kondisyon Parkuru',
    club: 'Saraçgym',
    category: 'Antrenman',
    date: '10.09.2024',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1000&auto=format&fit=crop&q=80',
    description: 'Çeviklik merdiveni ve reaksiyon çalışmalarıyla hız gelişimi sağlandı.',
    taggedAthletes: ['Kaan Yıldırım'],
    uploaderName: 'Kondisyoner Cem',
    folderId: 'folder-1',
    folderName: '2025-2026 Sezonu Antrenmanları',
    fileSize: '3.1 MB',
    mediaType: 'image',
    branch: 'Basketbol',
    isKvkkApproved: true,
  },
  {
    id: 'gal-6',
    title: 'aicosports Yaz Gelişim Kampı & Takım Fotoğrafı',
    club: 'aicosports',
    category: 'Kamp & Etkinlik',
    date: '15.07.2024',
    imageUrl: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=1000&auto=format&fit=crop&q=80',
    description: 'Antalya yaz kampında teknik ve sosyal etkinlikler bir arada yürütüldü.',
    taggedAthletes: ['Melis Aksoy'],
    uploaderName: 'aicosports Ekibi',
    folderId: 'folder-3',
    folderName: 'Yaz & Kış Gelişim Kampları',
    fileSize: '4.2 MB',
    mediaType: 'image',
    branch: 'Voleybol',
    isKvkkApproved: true,
  },
  {
    id: 'gal-7',
    title: 'TVF Bölge Elemeleri Çeyrek Final Mücadelesi',
    club: 'aicosports',
    category: 'Maç & Turnuva',
    date: '28.08.2024',
    imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1000&auto=format&fit=crop&q=80',
    description: 'Çekişmeli geçen 5 setlik voleybol maçında yarı finale yükseldik.',
    taggedAthletes: ['Melis Aksoy'],
    uploaderName: 'Antrenör Nilgün',
    folderId: 'folder-3',
    folderName: 'Yaz & Kış Gelişim Kampları',
    fileSize: '3.9 MB',
    mediaType: 'image',
    branch: 'Voleybol',
    isKvkkApproved: true,
  },
  {
    id: 'gal-8',
    title: 'Turnuva İkincilik Madalya Seremonisi',
    club: 'Saraçgym',
    category: 'Kupa & Madalya',
    date: '18.06.2024',
    imageUrl: 'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=1000&auto=format&fit=crop&q=80',
    description: 'Sporcularımız turnuva boyunca gösterdikleri centilmenlikle takdir topladı.',
    taggedAthletes: ['Kaan Yıldırım'],
    uploaderName: 'Saraçgym Medya',
    folderId: 'folder-2',
    folderName: 'Turnuvalar & Şampiyonluklar',
    fileSize: '5.1 MB',
    mediaType: 'image',
    branch: 'Basketbol',
    isKvkkApproved: true,
  },
];

const EVRAKLAR_STORAGE_KEY = 'sportsfly_kulup_evraklari_v1';
const GALERI_STORAGE_KEY = 'sportsfly_kulup_galeri_v1';
const MEDYA_KLASORLER_STORAGE_KEY = 'sportsfly_medya_klasorler_v1';

export function getStoredKulupEvraklari(): KulupEvrakItem[] {
  try {
    const raw = localStorage.getItem(EVRAKLAR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Evraklar yüklenirken hata:', e);
  }
  return INITIAL_KULUP_EVRAKLAR;
}

export function saveStoredKulupEvraklari(items: KulupEvrakItem[]): void {
  try {
    localStorage.setItem(EVRAKLAR_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Evraklar kaydedilirken hata:', e);
  }
}

export function getStoredMedyaKlasorler(): MedyaKlasorItem[] {
  try {
    const raw = localStorage.getItem(MEDYA_KLASORLER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Medya klasörleri yüklenirken hata:', e);
  }
  return INITIAL_MEDYA_KLASORLER;
}

export function saveStoredMedyaKlasorler(items: MedyaKlasorItem[]): void {
  try {
    localStorage.setItem(MEDYA_KLASORLER_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Medya klasörleri kaydedilirken hata:', e);
  }
}

export function getStoredKulupGaleri(): KulupGaleriItem[] {
  try {
    const raw = localStorage.getItem(GALERI_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          ...item,
          taggedAthletes: Array.isArray(item.taggedAthletes) ? item.taggedAthletes : [],
          folderId: item.folderId || 'folder-1',
          folderName: item.folderName || '2025-2026 Sezonu Antrenmanları',
          fileSize: item.fileSize || '3.2 MB',
          mediaType: item.mediaType || 'image',
          isKvkkApproved: item.isKvkkApproved ?? true,
        }));
      }
    }
  } catch (e) {
    console.error('Galeri yüklenirken hata:', e);
  }
  return INITIAL_KULUP_GALERI;
}

export function saveStoredKulupGaleri(items: KulupGaleriItem[]): void {
  try {
    localStorage.setItem(GALERI_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Galeri kaydedilirken hata:', e);
  }
}
