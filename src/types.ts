export type NavPage =
  | 'anasayfa'
  | 'sporsepeti-user'
  | 'sayfa-yonetimi'
  | 'paket-yonetimi'
  | 'tanimsiz-kullanicilar'
  | 'yetkilendirmeler'
  | 'kullanici-sozlesmeleri'
  | 'spor-okulu-basvurulari'
  | 'brans-yonetimi'
  | 'aktivite-yonetimi'
  | 'sporcular'
  | 'egitmenler'
  | 'gruplar'
  | 'antrenman-takvimi'
  | 'on-muhasebe'
  | 'gelir-gider-kategori'
  | 'gelir-gider-yonetimi'
  | 'odeme-plani-kontrol'
  | 'odeme-plani'
  | 'paketler'
  | 'fatura-adresi'
  | 'on-kayit'
  | 'yoneticiler'
  | 'uyeler'
  | 'mesaj-yonetimi'
  | 'subeler'
  | 'sube-ozet'
  | 'sporpuan-degerlendirmeler'
  | 'sporpuan-sporcu-degerlendirme'
  | 'sporpuan-dogrulamalar'
  | 'sporpuan-raporlar'
  | 'yoklama'
  | 'anket-yonetimi'
  | 'sporcu-karnesi'
  | 'egitim-planlama'
  | 'destek'
  | 'kulup-evraklari'
  | 'kulup-galerisi'
  | 'turnuva-yonetimi'
  | 'envanter-yonetimi'
  | 'referans-programi'
  | 'entegrasyonlar';

export interface EntegrasyonItem {
  id: string;
  name: string;
  category: string;
  description: string;
  logoUrl?: string;
  iconName?: string;
  badge?: string;
  isRecommended?: boolean;
  isActive: boolean;
  isInternalModule?: boolean;
  targetPage?: string;
  apiKey?: string;
  connectedAt?: string;
  supportUrl?: string;
}

export type EnvanterKategori =
  | 'Toplar'
  | 'Formalar & Yelekler'
  | 'Antrenman Ekipmanları'
  | 'Sağlık & Medikal'
  | 'Tesis & Saha Donanımı'
  | 'Elektronik & Ölçüm'
  | 'Diğer';

export type EnvanterDurum =
  | 'Yeni / Mükemmel'
  | 'İyi Durumda'
  | 'Yıpranmış / Kontrol'
  | 'Bakımda / Tamirde'
  | 'Hurda / Kullanım Dışı';

export interface EnvanterItem {
  id: string;
  code: string;
  name: string;
  category: EnvanterKategori;
  club: string;
  branch: string;
  subeId?: string;
  subeAd?: string;
  totalQuantity: number;
  inUseQuantity: number;
  inStorageQuantity: number;
  minQuantityAlert: number;
  unit: 'Adet' | 'Çift' | 'Set' | 'Koli' | 'Paket';
  condition: EnvanterDurum;
  location: string;
  assignedTo?: string;
  assignedDate?: string;
  lastCheckDate: string;
  lastCheckedBy: string;
  unitPrice?: number;
  notes?: string;
  photoUrl?: string;
}

export interface EnvanterTransferLog {
  id: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  fromSubeId: string;
  fromSubeAd: string;
  toSubeId: string;
  toSubeAd: string;
  quantity: number;
  unit: string;
  transferDate: string;
  transferredBy: string;
  notes?: string;
  status: 'Tamamlandı' | 'Yolda' | 'İptal';
}

export interface TurnuvaBasvuruItem {
  id: string;
  turnuvaId: string;
  teamName: string;
  clubName: string;
  contactName: string;
  phone: string;
  email: string;
  squadSize: number;
  notes?: string;
  appliedAt: string;
  status: 'Bekliyor' | 'Onaylandı' | 'Reddedildi';
  registrationCode: string;
}

export interface TurnuvaTakimItem {
  id: string;
  name: string;
  club: string;
  group?: string; // e.g. 'A Grubu', 'B Grubu'
  seed?: number; // Kura seribaşı numarası
  logoUrl?: string;
  coachName?: string;
  contactPhone?: string;
  squadSize?: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number; // Atılan (Sayı / Gol / Puan)
  goalsAgainst: number; // Yenilen
  points: number;
  setsWon?: number; // Voleybol / Tenis için
  setsLost?: number;
}

export interface TurnuvaMacItem {
  id: string;
  turnuvaId: string;
  round: string; // e.g. '1. Hafta', 'Çeyrek Final', 'Yarı Final', 'Final'
  stage?: 'Grup' | 'Eleme' | 'Lig' | 'Final';
  group?: string; // 'A Grubu', 'B Grubu' vb.
  bracketMatchId?: string; // 'QF-1', 'QF-2', 'SF-1', 'SF-2', 'F-1'
  nextBracketMatchId?: string;
  date: string;
  time: string;
  venue: string;
  court?: string; // 'Saha 1', 'Masa 2', 'A Salonu'
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  periodScores?: {
    p1?: { home: number; away: number };
    p2?: { home: number; away: number };
    p3?: { home: number; away: number };
    p4?: { home: number; away: number };
  };
  setScores?: { home: number; away: number }[]; // Voleybol/Tenis set dökümleri örn. [{home:25, away:21}, {home:22, away:25}]
  penalties?: { home: number; away: number }; // Futbol penaltı atışları
  status: 'Oynanacak' | 'Canlı' | 'Bitti' | 'Ertelendi';
  mvp?: string;
  referee?: string;
  notes?: string;
}

export interface TurnuvaItem {
  id: string;
  name: string;
  organizerClub: string;
  branch: 'Futbol' | 'Basketbol' | 'Voleybol' | 'Tenis' | 'Yüzme' | 'Masa Tenisi' | string;
  ageCategory: string;
  season: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'Kayıt Açık' | 'Devam Ediyor' | 'Tamamlandı' | 'Planlandı';
  format: 'Lig Usulü' | 'Grup + Eleme' | 'Tek Maç Eleme' | 'Seri & Kulvar';
  teamsCount: number;
  maxTeams?: number;
  entryFee?: number;
  registrationOpen?: boolean;
  registrationDeadline?: string;
  registrationSlug?: string;
  description?: string;
  bannerUrl?: string;
  teams: TurnuvaTakimItem[];
  matches: TurnuvaMacItem[];
  applications?: TurnuvaBasvuruItem[];
}

export interface DashboardPackage {
  id: string;
  name: string;
  userCount: number;
  users: {
    name: string;
    code: string;
    email?: string;
  }[];
}

export interface FacilityStat {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  userName: string;
  userEmail: string;
  date: string;
  status: 'Açık' | 'Cevaplandı' | 'Beklemede' | 'Çözüldü';
  priority: 'Yüksek' | 'Orta' | 'Düşük';
}

export interface SporsepetiUserItem {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  tcKimlik: string;
  phone: string;
  city: string;
}

export interface YetkilendirmeItem {
  id: string;
  name: string;
  email: string;
  code: string;
  createdAt: string;
  phone: string;
  role: string;
  date: string;
}

export interface SporcuItem {
  id: string;
  name: string;
  email: string;
  code: string;
  date: string;
  facility: string;
  isActive: boolean;
  avatarUrl?: string;
  phone?: string;
  birthDate?: string;
  branch?: string;
  teamGroup?: string;
}

export type KulupEvrakKategori =
  | 'Lisans'
  | 'Sağlık Raporu'
  | 'Veli İzin Belgesi'
  | 'Kimlik & Kayıt'
  | 'Kulüp Sözleşmesi'
  | 'Diğer';

export interface KulupEvrakItem {
  id: string;
  title: string;
  club: string; // Kulüp / Tesis (örn: DigiMondi, Saraçgym)
  athleteId?: string;
  athleteName?: string;
  category: KulupEvrakKategori;
  documentNumber?: string; // Lisans No, Rapor No vb.
  issueDate: string; // Düzenleme tarihi
  expiryDate?: string; // Son geçerlilik tarihi
  status: 'Geçerli' | 'Süresi Yaklaşan' | 'Süresi Dolmuş' | 'Onay Bekliyor';
  fileType: 'pdf' | 'jpg' | 'png' | 'doc';
  fileSize: string;
  fileUrl?: string;
  uploadedBy: string;
  notes?: string;
}

export type KulupGaleriKategori =
  | 'Antrenman'
  | 'Maç & Turnuva'
  | 'Kupa & Madalya'
  | 'Kamp & Etkinlik'
  | 'Tesis & Ekipman'
  | 'Portre & Lisans'
  | 'Sosyal Medya & Basın'
  | 'Genel';

export interface MedyaKlasorItem {
  id: string;
  name: string;
  description?: string;
  category: KulupGaleriKategori;
  club: string;
  branch?: string;
  color?: string; // 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo' | 'sky'
  itemCount?: number;
  totalSize?: string;
  createdAt?: string;
  coverImage?: string;
  iconName?: string;
}

export interface KulupGaleriItem {
  id: string;
  title: string;
  club: string;
  category: KulupGaleriKategori;
  date: string;
  imageUrl: string;
  description?: string;
  taggedAthletes?: string[];
  uploaderName?: string;
  folderId?: string;
  folderName?: string;
  fileSize?: string;
  mediaType?: 'image' | 'video' | 'document';
  videoUrl?: string;
  branch?: string;
  isKvkkApproved?: boolean;
}

export interface EgitmenItem {
  id: string;
  name: string;
  email: string;
  code: string;
  phone: string;
  facility: string;
  branch?: string; // Eğitmen Kategorisi / Branş (Futbol, Basketbol, vb.)
  title?: string; // e.g. "UEFA B Lisanslı Başantrenör"
  gender?: string;
  city?: string;
  address?: string;
  accountDuration?: string;
  mailEnabled?: boolean;
  smsEnabled?: boolean;
  avatarUrl?: string;
  status?: 'Aktif' | 'İzinli' | 'Ayrıldı';
  experienceYears?: number;
  rating?: number;
  reviewCount?: number;
  activeGroupsCount?: number;
  activeAthletesCount?: number;
  weeklyHours?: number;
  licenseLevel?: string;
  bio?: string;
  specialties?: string[];
  assignedGroups?: string[];
  joinDate?: string;
  hourlyRate?: number;
  monthlySalary?: number;
  documents?: {
    id: string;
    name: string;
    type: string;
    date: string;
    size: string;
  }[];
  appointments?: {
    id: string;
    title: string;
    date: string;
    time: string;
    student: string;
    status: string;
  }[];
}

export interface AntrenmanEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  trainer: string;
  facility: string;
  branch: string;
  participantsCount: number;
  maxCapacity: number;
  color?: string;
}

export interface FaturaAdresiItem {
  id: string;
  companyName: string;
  taxNumber: string;
  taxOffice: string;
  address: string;
  city: string;
  district: string;
  contactPerson: string;
  contactPhone: string;
}

export interface SubeItem {
  id: string;
  name: string;
  manager: string;
  phone: string;
  city: string;
  address: string;
  memberCount: number;
  status: 'Aktif' | 'Tadilatta' | 'Pasif';
}

export interface SporpuanReview {
  id: string;
  authorName: string;
  authorEmail: string;
  isVerifiedUser: boolean; // Sporpuan Doğrulanmış Gerçek Üye
  facilityName: string;
  branch: string;
  rating: number; // 1-5
  criteria: {
    hygiene: number;
    equipment: number;
    trainer: number;
    priceValue: number;
  };
  title: string;
  comment: string;
  date: string;
  status: 'Yayında' | 'Onay Bekliyor' | 'Şikayet Edildi' | 'Reddedildi';
  helpfulCount: number;
  reply?: {
    text: string;
    author: string;
    date: string;
  };
}

export interface SporpuanVerification {
  id: string;
  entityType: 'Tesis' | 'Eğitmen' | 'Kullanıcı Check-in';
  title: string;
  facilityName: string;
  verificationBadge: string;
  submittedDate: string;
  status: 'Onaylandı' | 'İncelemede' | 'Belge Bekleniyor' | 'Reddedildi';
  trustScore: number;
  documentsCount: number;
  verifiedBy?: string;
}

export interface AntrenmanAttendee {
  id: string;
  name: string;
  phone?: string;
  present?: boolean;
}

export interface AntrenmanItem {
  id: string;
  title: string;
  branch: string;
  groupName?: string;
  sube?: string;
  date: string;
  startTime: string;
  endTime: string;
  trainerName: string;
  facilityName: string;
  capacity: number;
  enrolledCount: number;
  status: 'Planlandı' | 'Devam Ediyor' | 'Tamamlandı' | 'İptal';
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo' | 'sky';
  notes?: string;
  attendees: AntrenmanAttendee[];
  googleCalendarEventId?: string;
  googleCalendarLink?: string;
}

export type PackagePlanType =
  | 'Başlangıç Kulübü'
  | 'Kulüp & Akademi'
  | 'Pro Akademi & Çoklu Şube'
  | 'Başlangıç'
  | 'Profesyonel'
  | 'Premium'
  | 'Kurumsal';

export interface PackageLimits {
  maxStudents: number | 'Sınırsız';
  maxTrainers: number | 'Sınırsız';
  maxManagers: number | 'Sınırsız';
  maxBranches: string;
  maxFacilities: number | 'Sınırsız';
  reportCards: 'Yılda 2 Dönem' | 'Sınırsız';
  whatsappDelivery: boolean;
  radarAnalytics: boolean;
  onlinePos: boolean;
  accounting: boolean;
  multiBranch: boolean;
  whiteLabel: boolean;
  sporpuanFeatures: string;
  supportLevel: string;
}

export interface YoneticiItem {
  id: string;
  name: string;
  email: string;
  code: string;
  createdAt: string;
  phone: string;
  role: string;
  schoolName: string;
  accessibility: 'Erişilebilir' | 'Erişilemez';
  packageType?: PackagePlanType;
  avatarUrl?: string;
  authProvider?: 'google' | 'email';
  activeStudents?: number;
  activeTrainers?: number;
  branches?: string[];
  lastLogin?: string;
}

export interface GrupMember {
  id: string;
  name: string;
  phone: string;
  code: string;
  birthYear?: number;
  parentName?: string;
  parentPhone?: string;
  attendanceRate?: number;
  licenseNumber?: string;
}

export interface GrupItem {
  id: string;
  name: string;
  instructorName: string;
  memberCount: number;
  facility: string;
  branch?: string;
  description?: string;
  category?: string; // 'Altyapı', 'Yarışmacı Takım', 'Spor Okulu', 'Gelişim Grubu', 'Hobi'
  ageGroup?: string; // 'U10', 'U12', 'U14', 'U16', 'U18', 'A Takım', '7-9 Yaş'
  maxCapacity?: number;
  monthlyFee?: number;
  status?: 'Aktif' | 'Dolu' | 'Askıda';
  schedule?: {
    days: string[];
    time: string;
    location?: string;
  };
  members?: GrupMember[];
}

export interface GelirGiderItem {
  id: string;
  type: 'Gelir' | 'Gider';
  title: string;
  category: string;
  amount: number;
  date: string;
  payerOrPayee: string;
  paymentMethod: 'Nakit' | 'Kredi Kartı' | 'Havale/EFT' | 'POS';
  status: 'Tamamlandı' | 'Beklemede' | 'İptal';
  description?: string;
}

export interface GelirGiderKategoriItem {
  id: string;
  name: string;
  type: 'Gelir' | 'Gider';
  itemCount: number;
  totalAmount: number;
  color: string;
}

export interface OdemePlaniItem {
  id: string;
  athleteName: string;
  athleteCode: string;
  planName: string;
  installment: string; // e.g. "3/6"
  dueDate: string;
  amount: number;
  status: 'Ödendi' | 'Bekliyor' | 'Gecikti';
  paidDate?: string;
  receiptNumber?: string;
  receiptDate?: string;
}

export interface KulupSozlesmesi {
  id: string;
  sozlesmeNo: string;
  yonetici: string;
  firmaTip: string;
  tcKimlik: string;
  dogumTarihi: string;
  il: string;
  ilce: string;
  eposta?: string;
  vergiDairesi: string;
  ibanUnvan: string;
  adSoyad: string;
  firmaUnvani: string;
  telefon: string;
  website?: string;
  iban: string;
  status: 'Onaylandı' | 'İmza Bekliyor' | 'İnceleniyor';
  createdAt: string;
}

export type OnKayitDurumu =
  | 'Ön Kayıt'
  | 'Görüşme Yapıldı'
  | 'Deneme Antrenmanı'
  | 'Sözleşme Bekleniyor'
  | 'Kayıt Oldu'
  | 'Kayıt Olmadı'
  | 'İptal';

export interface OnKayitItem {
  id: string;
  // 1. Yönetici / Ön Kayıt Bilgileri
  bagliOnKayit?: string;
  onKayitTarihi: string;
  onKayitNo: string;
  sube: string;
  brans: string;

  // 2. Sporcu Bilgileri
  sporcuAdSoyad: string;
  cinsiyet: 'Erkek' | 'Kız';
  tcKimlikNo: string;
  dogumTarihi: string;
  telefon?: string;
  il?: string;
  ilce?: string;
  adres: string;
  boy?: string;
  kilo?: string;

  // 3. Veli Bilgileri
  veliAdSoyad: string;
  veliTelefon: string;
  veliEposta: string;
  veliMeslek?: string;
  veliEgitimDurumu?: string;

  // 4. Sporcu Sağlık ve Özel Durum Bilgileri
  saglikDurumu?: string;
  alerjiDurumu?: string;
  kronikRahatsizlik?: string;
  davranissalOzelDurum?: string;
  duzenliKullanilanIlac?: string;
  acilDurumAranacakKisi: string;
  acilDurumTelefonu: string;

  // 5. Kulübe Ulaşma / Pazarlama Bilgileri
  ulasmaTuru:
    | 'Referans / Tavsiye'
    | 'Sosyal Medya'
    | 'Sporsepeti.com.tr'
    | 'Google / İnternet'
    | 'Afiş / Billboard'
    | 'Mail / SMS'
    | 'Etkinlik'
    | 'Diğer';
  referansVerenKisi?: string;
  ekAciklama?: string;

  // 6. Görüşme Bilgileri
  gorusmeYapan?: string;
  gorusmeTuru?: 'Online' | 'Yüz Yüze' | 'Telefon';
  gorusmeTarihi?: string;
  gorusmeNotlari?: string;
  ilgilenilenBrans?: string;
  tercihEdilenGunler?: string[];
  tercihEdilenSaatler?: string;

  // 7. Satış / Sözleşme Bilgileri
  beklenenSozlesmeTutari?: number;
  sozlesmeOlasiligi?: 'Yüksek' | 'Orta' | 'Düşük';
  gerceklesenSozlesmeTutari?: number;
  sozlesmeTarihi?: string;
  odemeDurumu?: 'Ödendi' | 'Bekliyor' | 'Kısmi Ödeme' | 'Ödenmedi';
  odemeYontemi?: 'Kredi Kartı' | 'Havale / EFT' | 'Nakit' | 'Taksit';
  indirimKampanya?: string;
  kaybedilmeNedeni?: string;

  // 8. KVKK / Onaylar
  kvkkAydinlatmaOnay: boolean;
  acikRizaOnay: boolean;
  fotografVideoIzni: boolean;
  iletisimKampanyaIzni: boolean;
  veliOnayi: boolean;

  // 9. Sistemsel Alanlar
  kayitOlusturanKullanici: string;
  kayitTarihi: string;
  sonGuncellemeTarihi: string;
  kayitDurumu: OnKayitDurumu;
}


