import { Sube, getStoredSubeler, getActiveSubeId, setActiveSubeId } from './subeData';

export interface SubeSporcu {
  id: string;
  subeId: string;
  name: string;
  code: string;
  branch: string;
  group: string;
  parentName: string;
  parentPhone: string;
  monthlyFee: number;
  paymentStatus: 'Ödendi' | 'Bekliyor' | 'Gecikti';
  attendanceRate: number; // 0 - 100
  status: 'Aktif' | 'Pasif';
  registeredAt: string;
  avatarUrl?: string;
}

export interface SubeEgitmen {
  id: string;
  subeId: string;
  name: string;
  role: string;
  branch: string;
  phone: string;
  email: string;
  assignedAthletes: number;
  weeklySessions: number;
  monthlySalary: number;
  status: 'Aktif' | 'İzinli';
  rating: number;
  avatarUrl?: string;
}

export interface SubeGelirGiderItem {
  id: string;
  subeId: string;
  type: 'Gelir' | 'Gider';
  title: string;
  category: string;
  amount: number;
  date: string;
  status: 'Tamamlandı' | 'Bekliyor' | 'Gecikti';
  paymentMethod: 'Kredi Kartı' | 'Havale/EFT' | 'Nakit' | 'POS';
  payerOrPayee: string;
  description?: string;
}

export interface SubeAylikTrend {
  month: string;
  gelir: number;
  gider: number;
  netKar: number;
  sporcuSayisi: number;
}

// Initial Mock Data for Athletes linked to branches
export const INITIAL_SUBE_SPORCULAR: SubeSporcu[] = [
  // Kadıköy
  {
    id: 'sp-1',
    subeId: 'sube-kadikoy',
    name: 'Kaan Yıldırım',
    code: '108392',
    branch: 'Basketbol',
    group: 'U14 Altyapı A Takımı',
    parentName: 'Ahmet Yıldırım',
    parentPhone: '+90 532 111 22 33',
    monthlyFee: 3500,
    paymentStatus: 'Ödendi',
    attendanceRate: 95,
    status: 'Aktif',
    registeredAt: '04.09.2023',
    avatarUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sp-2',
    subeId: 'sube-kadikoy',
    name: 'Melis Aksoy',
    code: '782910',
    branch: 'Yüzme',
    group: 'Performans Kız Grubu',
    parentName: 'Zeynep Aksoy',
    parentPhone: '+90 546 222 33 44',
    monthlyFee: 3800,
    paymentStatus: 'Ödendi',
    attendanceRate: 92,
    status: 'Aktif',
    registeredAt: '15.09.2023',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sp-3',
    subeId: 'sube-kadikoy',
    name: 'Selman Utku',
    code: '422162',
    branch: 'Basketbol',
    group: 'U16 Gelişim',
    parentName: 'Kemal Utku',
    parentPhone: '+90 538 597 92 22',
    monthlyFee: 3500,
    paymentStatus: 'Ödendi',
    attendanceRate: 98,
    status: 'Aktif',
    registeredAt: '01.10.2023',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sp-4',
    subeId: 'sube-kadikoy',
    name: 'Caner Demir',
    code: '392019',
    branch: 'Voleybol',
    group: 'Yıldız Erkek',
    parentName: 'Hasan Demir',
    parentPhone: '+90 544 999 88 77',
    monthlyFee: 3200,
    paymentStatus: 'Bekliyor',
    attendanceRate: 88,
    status: 'Aktif',
    registeredAt: '12.11.2023',
  },
  {
    id: 'sp-5',
    subeId: 'sube-kadikoy',
    name: 'Defne Şahin',
    code: '654321',
    branch: 'Cimnastik',
    group: 'Minikler Temel Cimnastik',
    parentName: 'Tuba Şahin',
    parentPhone: '+90 533 222 11 33',
    monthlyFee: 3000,
    paymentStatus: 'Ödendi',
    attendanceRate: 94,
    status: 'Aktif',
    registeredAt: '05.01.2024',
  },
  {
    id: 'sp-6',
    subeId: 'sube-kadikoy',
    name: 'Arda Güler',
    code: '772101',
    branch: 'Basketbol',
    group: 'U14 Altyapı A Takımı',
    parentName: 'Serdar Güler',
    parentPhone: '+90 533 777 66 55',
    monthlyFee: 3500,
    paymentStatus: 'Gecikti',
    attendanceRate: 78,
    status: 'Aktif',
    registeredAt: '18.02.2024',
  },

  // Ataşehir
  {
    id: 'sp-7',
    subeId: 'sube-atasehir',
    name: 'Ali Özcan',
    code: '630020',
    branch: 'Basketbol',
    group: 'Ataşehir Genç Takım',
    parentName: 'Mustafa Özcan',
    parentPhone: '+90 507 254 71 47',
    monthlyFee: 3200,
    paymentStatus: 'Ödendi',
    attendanceRate: 96,
    status: 'Aktif',
    registeredAt: '12.02.2024',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sp-8',
    subeId: 'sube-atasehir',
    name: 'Ece Vural',
    code: '951753',
    branch: 'Voleybol',
    group: 'Ataşehir Kız Voleybol U12',
    parentName: 'Handan Vural',
    parentPhone: '+90 532 999 11 00',
    monthlyFee: 3100,
    paymentStatus: 'Ödendi',
    attendanceRate: 90,
    status: 'Aktif',
    registeredAt: '20.02.2024',
  },
  {
    id: 'sp-9',
    subeId: 'sube-atasehir',
    name: 'Burak Yılmaz',
    code: '551290',
    branch: 'Basketbol',
    group: 'Temel Basketbol Okulu',
    parentName: 'Fikret Yılmaz',
    parentPhone: '+90 535 666 77 88',
    monthlyFee: 2900,
    paymentStatus: 'Bekliyor',
    attendanceRate: 85,
    status: 'Aktif',
    registeredAt: '03.03.2024',
  },
  {
    id: 'sp-10',
    subeId: 'sube-atasehir',
    name: 'Seda Korkmaz',
    code: '419822',
    branch: 'Pilates',
    group: 'Yetişkin & Genç Pilates',
    parentName: 'Özlem Korkmaz',
    parentPhone: '+90 541 333 44 22',
    monthlyFee: 3400,
    paymentStatus: 'Ödendi',
    attendanceRate: 91,
    status: 'Aktif',
    registeredAt: '15.03.2024',
  },

  // Beşiktaş
  {
    id: 'sp-11',
    subeId: 'sube-besiktas',
    name: 'Emirhan Örnek',
    code: '284719',
    branch: 'Futbol',
    group: 'Beşiktaş U12 Akademi',
    parentName: 'Mehmet Örnek',
    parentPhone: '+90 539 444 55 66',
    monthlyFee: 3600,
    paymentStatus: 'Ödendi',
    attendanceRate: 97,
    status: 'Aktif',
    registeredAt: '10.11.2023',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sp-12',
    subeId: 'sube-besiktas',
    name: 'Semih Kılıçsoy',
    code: '884533',
    branch: 'Futbol',
    group: 'Beşiktaş U14 Elit Forvet',
    parentName: 'Kemal Kılıçsoy',
    parentPhone: '+90 530 999 11 22',
    monthlyFee: 3800,
    paymentStatus: 'Ödendi',
    attendanceRate: 100,
    status: 'Aktif',
    registeredAt: '12.11.2023',
  },
  {
    id: 'sp-13',
    subeId: 'sube-besiktas',
    name: 'Beren Yıldız',
    code: '357951',
    branch: 'Yüzme',
    group: 'Beşiktaş Yüzme Yıldızlar',
    parentName: 'Fatma Yıldız',
    parentPhone: '+90 542 333 44 55',
    monthlyFee: 3700,
    paymentStatus: 'Bekliyor',
    attendanceRate: 86,
    status: 'Aktif',
    registeredAt: '01.12.2023',
  },
  {
    id: 'sp-14',
    subeId: 'sube-besiktas',
    name: 'Deniz Aktaş',
    code: '419201',
    branch: 'Tenis',
    group: 'Akademi Tenis Gelişim',
    parentName: 'Sevgi Aktaş',
    parentPhone: '+90 544 123 45 67',
    monthlyFee: 4200,
    paymentStatus: 'Ödendi',
    attendanceRate: 93,
    status: 'Aktif',
    registeredAt: '18.01.2024',
  },

  // Çankaya
  {
    id: 'sp-15',
    subeId: 'sube-cankaya',
    name: 'Pınar Çakmakçı',
    code: '616179',
    branch: 'Basketbol',
    group: 'Çankaya Yıldız Takım',
    parentName: 'Ali Çakmakçı',
    parentPhone: '+90 532 888 77 66',
    monthlyFee: 3000,
    paymentStatus: 'Ödendi',
    attendanceRate: 94,
    status: 'Aktif',
    registeredAt: '02.06.2023',
  },
  {
    id: 'sp-16',
    subeId: 'sube-cankaya',
    name: 'Zeynep Su',
    code: '852963',
    branch: 'Cimnastik',
    group: 'Çankaya Ritmik Cimnastik',
    parentName: 'Kemal Su',
    parentPhone: '+90 544 777 88 99',
    monthlyFee: 3200,
    paymentStatus: 'Ödendi',
    attendanceRate: 89,
    status: 'Aktif',
    registeredAt: '15.06.2023',
  },
  {
    id: 'sp-17',
    subeId: 'sube-cankaya',
    name: 'Kerem Aktürkoğlu',
    code: '773422',
    branch: 'Masa Tenisi',
    group: 'Masa Tenisi Gençler',
    parentName: 'Faruk Aktürkoğlu',
    parentPhone: '+90 542 111 44 77',
    monthlyFee: 2600,
    paymentStatus: 'Bekliyor',
    attendanceRate: 82,
    status: 'Aktif',
    registeredAt: '20.08.2023',
  },
];

// Initial Instructors per branch
export const INITIAL_SUBE_EGITMENLER: SubeEgitmen[] = [
  // Kadıköy
  {
    id: 'eg-1',
    subeId: 'sube-kadikoy',
    name: 'Berkan Saraç',
    role: 'Baş Antrenör',
    branch: 'Basketbol',
    phone: '+90 538 597 92 22',
    email: 'berkansarac@gmail.com',
    assignedAthletes: 18,
    weeklySessions: 14,
    monthlySalary: 38000,
    status: 'Aktif',
    rating: 4.9,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'eg-2',
    subeId: 'sube-kadikoy',
    name: 'Berke Kaan Durdu',
    role: 'Yüzme Direktörü',
    branch: 'Yüzme',
    phone: '+90 543 376 87 90',
    email: 'berkedurdu@gmail.com',
    assignedAthletes: 14,
    weeklySessions: 12,
    monthlySalary: 34000,
    status: 'Aktif',
    rating: 4.8,
  },
  {
    id: 'eg-3',
    subeId: 'sube-kadikoy',
    name: 'Elif Demir',
    role: 'Uzman Eğitmen',
    branch: 'Cimnastik',
    phone: '+90 535 440 22 11',
    email: 'elifdemir@sportsfly.com',
    assignedAthletes: 10,
    weeklySessions: 8,
    monthlySalary: 29000,
    status: 'Aktif',
    rating: 4.9,
  },

  // Ataşehir
  {
    id: 'eg-4',
    subeId: 'sube-atasehir',
    name: 'Ali Özcan',
    role: 'Baş Antrenör',
    branch: 'Basketbol & Voleybol',
    phone: '+90 507 254 71 47',
    email: 'alizcn07@gmail.com',
    assignedAthletes: 16,
    weeklySessions: 12,
    monthlySalary: 32000,
    status: 'Aktif',
    rating: 4.7,
  },
  {
    id: 'eg-5',
    subeId: 'sube-atasehir',
    name: 'Merve Yılmaz',
    role: 'Stüdyo Koordinatörü',
    branch: 'Pilates',
    phone: '+90 536 999 88 11',
    email: 'merveyilmaz@sportsfly.com',
    assignedAthletes: 12,
    weeklySessions: 10,
    monthlySalary: 28000,
    status: 'Aktif',
    rating: 4.9,
  },

  // Beşiktaş
  {
    id: 'eg-6',
    subeId: 'sube-besiktas',
    name: 'Emirhan Örnek',
    role: 'Futbol Direktörü',
    branch: 'Futbol',
    phone: '+90 539 417 61 51',
    email: 'emirhan@sportsfly.com',
    assignedAthletes: 20,
    weeklySessions: 15,
    monthlySalary: 36000,
    status: 'Aktif',
    rating: 4.9,
  },
  {
    id: 'eg-7',
    subeId: 'sube-besiktas',
    name: 'Ceyda Doğan',
    role: 'Tenis Antrenörü',
    branch: 'Tenis',
    phone: '+90 542 555 12 34',
    email: 'ceydadogan@sportsfly.com',
    assignedAthletes: 15,
    weeklySessions: 11,
    monthlySalary: 31000,
    status: 'Aktif',
    rating: 4.8,
  },

  // Çankaya
  {
    id: 'eg-8',
    subeId: 'sube-cankaya',
    name: 'Arif Emre Kaya',
    role: 'Tesis Baş Antrenörü',
    branch: 'Basketbol',
    phone: '+90 544 321 00 11',
    email: 'arifkaya@sportsfly.com',
    assignedAthletes: 11,
    weeklySessions: 9,
    monthlySalary: 30000,
    status: 'Aktif',
    rating: 4.8,
  },
  {
    id: 'eg-9',
    subeId: 'sube-cankaya',
    name: 'Sinem Vural',
    role: 'Antrenör',
    branch: 'Cimnastik & Masa Tenisi',
    phone: '+90 532 999 44 22',
    email: 'sinemvural@sportsfly.com',
    assignedAthletes: 8,
    weeklySessions: 8,
    monthlySalary: 26000,
    status: 'Aktif',
    rating: 4.7,
  },
];

// Initial Transactions per branch
export const INITIAL_SUBE_GELIR_GIDER: SubeGelirGiderItem[] = [
  // Kadıköy
  {
    id: 'tx-k1',
    subeId: 'sube-kadikoy',
    type: 'Gelir',
    title: 'Eylül Ayı Basketbol ve Yüzme Aidatları',
    category: 'Aylık Sporcu Aidatları',
    amount: 147000,
    date: '12.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Kredi Kartı',
    payerOrPayee: '38 Sporcu Velisi',
    description: 'Kadıköy Merkez Şube toplu aidat tahsilatları',
  },
  {
    id: 'tx-k2',
    subeId: 'sube-kadikoy',
    type: 'Gelir',
    title: 'Bireysel Performans Özel Dersleri',
    category: 'Bireysel Özel Dersler',
    amount: 24500,
    date: '10.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Havale/EFT',
    payerOrPayee: 'Özel Seans Katılımcıları',
    description: 'Koç Berkan & Berke Kaan bireysel antrenman seansları',
  },
  {
    id: 'tx-k3',
    subeId: 'sube-kadikoy',
    type: 'Gelir',
    title: 'Sporcu Formaları ve Kulüp Mağazası',
    category: 'Ürün & Forma Satışı',
    amount: 13500,
    date: '08.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'POS',
    payerOrPayee: 'Kulüp Mağazası Satışları',
    description: 'Yeni sezon maç formaları ve antrenman ekipmanı',
  },
  {
    id: 'tx-k4',
    subeId: 'sube-kadikoy',
    type: 'Gider',
    title: 'Antrenör ve Personel Aylık Hakedişleri',
    category: 'Antrenör & Eğitmen Maaşları',
    amount: 72000,
    date: '05.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Havale/EFT',
    payerOrPayee: 'Kadıköy Antrenör Kadrosu',
    description: 'Ağustos hakediş ve antrenör seans ücretleri',
  },
  {
    id: 'tx-k5',
    subeId: 'sube-kadikoy',
    type: 'Gider',
    title: 'Yarı Olimpik Havuz ve Tesis Bakımı',
    category: 'Tesis Bakım & Onarım',
    amount: 18500,
    date: '03.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Havale/EFT',
    payerOrPayee: 'Akva Su Tesisat & Bakım A.Ş.',
    description: 'Havuz filtre değişimi ve salon parke cilalama',
  },

  // Ataşehir
  {
    id: 'tx-a1',
    subeId: 'sube-atasehir',
    type: 'Gelir',
    title: 'Ataşehir Eylül Ayı Sporcu Aidatları',
    category: 'Aylık Sporcu Aidatları',
    amount: 86800,
    date: '11.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Kredi Kartı',
    payerOrPayee: '28 Sporcu Velisi',
  },
  {
    id: 'tx-a2',
    subeId: 'sube-atasehir',
    type: 'Gelir',
    title: 'Pilates Stüdyosu Grup Paketleri',
    category: 'Bireysel Özel Dersler',
    amount: 22400,
    date: '09.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'POS',
    payerOrPayee: 'Pilates Grubu Üyeleri',
  },
  {
    id: 'tx-a3',
    subeId: 'sube-atasehir',
    type: 'Gelir',
    title: 'Ataşehir Kafeterya Gelir Payı',
    category: 'Kafeterya & Yan Gelirler',
    amount: 14800,
    date: '06.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Nakit',
    payerOrPayee: 'Kafeterya İşletmesi',
  },
  {
    id: 'tx-a4',
    subeId: 'sube-atasehir',
    type: 'Gider',
    title: 'Ataşehir Salon Kirası ve Aidat',
    category: 'Tesis & Salon Kirası',
    amount: 38000,
    date: '02.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Havale/EFT',
    payerOrPayee: 'Tesis Mülk Sahibi',
  },
  {
    id: 'tx-a5',
    subeId: 'sube-atasehir',
    type: 'Gider',
    title: 'Ataşehir Eğitmen Maaşları',
    category: 'Antrenör & Eğitmen Maaşları',
    amount: 42000,
    date: '05.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Havale/EFT',
    payerOrPayee: 'Ataşehir Eğitmen Kadrosu',
  },

  // Beşiktaş
  {
    id: 'tx-b1',
    subeId: 'sube-besiktas',
    type: 'Gelir',
    title: 'Beşiktaş Futbol & Tenis Akademisi Aidatları',
    category: 'Aylık Sporcu Aidatları',
    amount: 126000,
    date: '12.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Kredi Kartı',
    payerOrPayee: '35 Sporcu Velisi',
  },
  {
    id: 'tx-b2',
    subeId: 'sube-besiktas',
    type: 'Gelir',
    title: 'Hafta Sonu Turnuva & Maç Katılım Bedelleri',
    category: 'Turnuva & Kamp Katılım',
    amount: 18000,
    date: '08.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Havale/EFT',
    payerOrPayee: 'Turnuva Katılımcı Takımları',
  },
  {
    id: 'tx-b3',
    subeId: 'sube-besiktas',
    type: 'Gelir',
    title: 'Açık Tenis Kortu Rezervasyon Gelirleri',
    category: 'Saha Kiralama Gelirleri',
    amount: 12000,
    date: '07.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'POS',
    payerOrPayee: 'Üye Olmayan Rezervasyonlar',
  },
  {
    id: 'tx-b4',
    subeId: 'sube-besiktas',
    type: 'Gider',
    title: 'Sentetik Çim Saha Bakımı & Granül Dolumu',
    category: 'Tesis Bakım & Onarım',
    amount: 16500,
    date: '04.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Havale/EFT',
    payerOrPayee: 'Saha Bakım Hizmetleri',
  },
  {
    id: 'tx-b5',
    subeId: 'sube-besiktas',
    type: 'Gider',
    title: 'Beşiktaş Antrenör Kadrosu Hakedişleri',
    category: 'Antrenör & Eğitmen Maaşları',
    amount: 54000,
    date: '05.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Havale/EFT',
    payerOrPayee: 'Beşiktaş Antrenörleri',
  },

  // Çankaya
  {
    id: 'tx-c1',
    subeId: 'sube-cankaya',
    type: 'Gelir',
    title: 'Çankaya Tesis Aidat Tahsilatları',
    category: 'Aylık Sporcu Aidatları',
    amount: 57000,
    date: '10.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Kredi Kartı',
    payerOrPayee: '19 Sporcu Velisi',
  },
  {
    id: 'tx-c2',
    subeId: 'sube-cankaya',
    type: 'Gelir',
    title: 'Bireysel Masa Tenisi ve Kondisyon Seansları',
    category: 'Bireysel Özel Dersler',
    amount: 18000,
    date: '09.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'POS',
    payerOrPayee: 'Özel Ders Alan Sporcular',
  },
  {
    id: 'tx-c3',
    subeId: 'sube-cankaya',
    type: 'Gelir',
    title: 'Kulüp Spor Ekipmanı Satışı',
    category: 'Ürün & Forma Satışı',
    amount: 17000,
    date: '06.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Kredi Kartı',
    payerOrPayee: 'Sporcu Velileri',
  },
  {
    id: 'tx-c4',
    subeId: 'sube-cankaya',
    type: 'Gider',
    title: 'Çankaya Tesis Elektrik ve Isıtma Gideri',
    category: 'Elektrik, Su, Isıtma Faturaları',
    amount: 14200,
    date: '03.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Havale/EFT',
    payerOrPayee: 'Başkent Enerji Dağıtım',
  },
  {
    id: 'tx-c5',
    subeId: 'sube-cankaya',
    type: 'Gider',
    title: 'Çankaya Antrenör Hakediş Ödemeleri',
    category: 'Antrenör & Eğitmen Maaşları',
    amount: 36000,
    date: '05.09.2024',
    status: 'Tamamlandı',
    paymentMethod: 'Havale/EFT',
    payerOrPayee: 'Çankaya Eğitmenleri',
  },
];

// Historical trends by branch
export const SUBE_MONTHLY_TRENDS: Record<string, SubeAylikTrend[]> = {
  'sube-kadikoy': [
    { month: 'Nisan', gelir: 165000, gider: 82000, netKar: 83000, sporcuSayisi: 36 },
    { month: 'Mayıs', gelir: 172000, gider: 85000, netKar: 87000, sporcuSayisi: 38 },
    { month: 'Haziran', gelir: 178000, gider: 88000, netKar: 90000, sporcuSayisi: 40 },
    { month: 'Temmuz', gelir: 182000, gider: 89000, netKar: 93000, sporcuSayisi: 41 },
    { month: 'Ağustos', gelir: 185000, gider: 91000, netKar: 94000, sporcuSayisi: 42 },
    { month: 'Eylül (Anlık)', gelir: 185000, gider: 90500, netKar: 94500, sporcuSayisi: 42 },
  ],
  'sube-atasehir': [
    { month: 'Nisan', gelir: 105000, gider: 72000, netKar: 33000, sporcuSayisi: 22 },
    { month: 'Mayıs', gelir: 112000, gider: 74000, netKar: 38000, sporcuSayisi: 24 },
    { month: 'Haziran', gelir: 118000, gider: 77000, netKar: 41000, sporcuSayisi: 26 },
    { month: 'Temmuz', gelir: 120000, gider: 78000, netKar: 42000, sporcuSayisi: 27 },
    { month: 'Ağustos', gelir: 122000, gider: 80000, netKar: 42000, sporcuSayisi: 28 },
    { month: 'Eylül (Anlık)', gelir: 124000, gider: 80000, netKar: 44000, sporcuSayisi: 28 },
  ],
  'sube-besiktas': [
    { month: 'Nisan', gelir: 135000, gider: 64000, netKar: 71000, sporcuSayisi: 29 },
    { month: 'Mayıs', gelir: 142000, gider: 66000, netKar: 76000, sporcuSayisi: 31 },
    { month: 'Haziran', gelir: 148000, gider: 68000, netKar: 80000, sporcuSayisi: 33 },
    { month: 'Temmuz', gelir: 152000, gider: 69000, netKar: 83000, sporcuSayisi: 34 },
    { month: 'Ağustos', gelir: 154000, gider: 70000, netKar: 84000, sporcuSayisi: 35 },
    { month: 'Eylül (Anlık)', gelir: 156000, gider: 70500, netKar: 85500, sporcuSayisi: 35 },
  ],
  'sube-cankaya': [
    { month: 'Nisan', gelir: 78000, gider: 46000, netKar: 32000, sporcuSayisi: 16 },
    { month: 'Mayıs', gelir: 82000, gider: 48000, netKar: 34000, sporcuSayisi: 17 },
    { month: 'Haziran', gelir: 86000, gider: 49000, netKar: 37000, sporcuSayisi: 18 },
    { month: 'Temmuz', gelir: 89000, gider: 50000, netKar: 39000, sporcuSayisi: 18 },
    { month: 'Ağustos', gelir: 90000, gider: 50000, netKar: 40000, sporcuSayisi: 19 },
    { month: 'Eylül (Anlık)', gelir: 92000, gider: 50200, netKar: 41800, sporcuSayisi: 19 },
  ],
};

const SUBE_SPORCULAR_STORAGE = 'sportsfly_sube_sporcular_v1';
const SUBE_EGITMENLER_STORAGE = 'sportsfly_sube_egitmenler_v1';
const SUBE_GELIR_GIDER_STORAGE = 'sportsfly_sube_gelir_gider_v1';

export function getStoredSubeSporcular(): SubeSporcu[] {
  if (typeof window === 'undefined') return INITIAL_SUBE_SPORCULAR;
  try {
    const raw = localStorage.getItem(SUBE_SPORCULAR_STORAGE);
    if (!raw) {
      localStorage.setItem(SUBE_SPORCULAR_STORAGE, JSON.stringify(INITIAL_SUBE_SPORCULAR));
      return INITIAL_SUBE_SPORCULAR;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SUBE_SPORCULAR;
  } catch {
    return INITIAL_SUBE_SPORCULAR;
  }
}

export function saveStoredSubeSporcular(data: SubeSporcu[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUBE_SPORCULAR_STORAGE, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('sportsfly_sube_data_changed'));
  } catch (err) {
    console.error('Sporcu kaydedilirken hata:', err);
  }
}

export function getStoredSubeEgitmenler(): SubeEgitmen[] {
  if (typeof window === 'undefined') return INITIAL_SUBE_EGITMENLER;
  try {
    const raw = localStorage.getItem(SUBE_EGITMENLER_STORAGE);
    if (!raw) {
      localStorage.setItem(SUBE_EGITMENLER_STORAGE, JSON.stringify(INITIAL_SUBE_EGITMENLER));
      return INITIAL_SUBE_EGITMENLER;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SUBE_EGITMENLER;
  } catch {
    return INITIAL_SUBE_EGITMENLER;
  }
}

export function saveStoredSubeEgitmenler(data: SubeEgitmen[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUBE_EGITMENLER_STORAGE, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('sportsfly_sube_data_changed'));
  } catch (err) {
    console.error('Eğitmen kaydedilirken hata:', err);
  }
}

export function getStoredSubeGelirGider(): SubeGelirGiderItem[] {
  if (typeof window === 'undefined') return INITIAL_SUBE_GELIR_GIDER;
  try {
    const raw = localStorage.getItem(SUBE_GELIR_GIDER_STORAGE);
    if (!raw) {
      localStorage.setItem(SUBE_GELIR_GIDER_STORAGE, JSON.stringify(INITIAL_SUBE_GELIR_GIDER));
      return INITIAL_SUBE_GELIR_GIDER;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SUBE_GELIR_GIDER;
  } catch {
    return INITIAL_SUBE_GELIR_GIDER;
  }
}

export function saveStoredSubeGelirGider(data: SubeGelirGiderItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUBE_GELIR_GIDER_STORAGE, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('sportsfly_sube_data_changed'));
  } catch (err) {
    console.error('Gelir/gider kaydedilirken hata:', err);
  }
}
