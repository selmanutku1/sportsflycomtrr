export type SubeDurum = 'Aktif' | 'Pasif' | 'Tadilatta';

export type TesisTipi =
  | 'Spor Kompleksi'
  | 'Kapalı Spor Salonu'
  | 'Yarı Olimpik Havuz'
  | 'Futbol Sahası'
  | 'Cimnastik Salonu'
  | 'Stüdyo';

export interface Sube {
  id: string;
  ad: string;
  kod: string;
  sehir: string;
  ilce: string;
  adres: string;
  telefon: string;
  eposta: string;
  sorumluYonetici: string;
  sorumluAntrenor: string;
  antrenorSayisi: number;
  sporcuSayisi: number;
  kapasite: number;
  branslar: string[];
  tesisTipi: TesisTipi;
  durum: SubeDurum;
  acilisTarihi: string;
  aylikCiro?: number;
  ozellikler: string[];
}

export const INITIAL_SUBELER: Sube[] = [
  {
    id: 'sube-kadikoy',
    ad: 'Kadıköy Merkez Spor Tesisi',
    kod: 'KDK-01',
    sehir: 'İstanbul',
    ilce: 'Kadıköy',
    adres: 'Bağdat Caddesi No: 142, Kadıköy / İstanbul',
    telefon: '+90 216 385 40 10',
    eposta: 'kadikoy@sportsfly.com',
    sorumluYonetici: 'Selman Utku',
    sorumluAntrenor: 'Berkan Saraç',
    antrenorSayisi: 8,
    sporcuSayisi: 42,
    kapasite: 60,
    branslar: ['Basketbol', 'Yüzme', 'Voleybol', 'Cimnastik'],
    tesisTipi: 'Spor Kompleksi',
    durum: 'Aktif',
    acilisTarihi: '01.09.2021',
    aylikCiro: 185000,
    ozellikler: ['Otopark', 'Kafeterya', 'Kapalı Havuz', 'Soyunma Odası', 'Fizyoterapi'],
  },
  {
    id: 'sube-atasehir',
    ad: 'Ataşehir Doğu Spor Salonu',
    kod: 'ATS-02',
    sehir: 'İstanbul',
    ilce: 'Ataşehir',
    adres: 'Barbaros Mah. Mor Sümbül Sok. No: 8, Ataşehir / İstanbul',
    telefon: '+90 216 572 15 20',
    eposta: 'atasehir@sportsfly.com',
    sorumluYonetici: 'Pınar Çakmakçı',
    sorumluAntrenor: 'Ali Özcan',
    antrenorSayisi: 5,
    sporcuSayisi: 28,
    kapasite: 40,
    branslar: ['Basketbol', 'Voleybol', 'Pilates'],
    tesisTipi: 'Kapalı Spor Salonu',
    durum: 'Aktif',
    acilisTarihi: '15.02.2022',
    aylikCiro: 124000,
    ozellikler: ['Otopark', 'Kafeterya', 'Soyunma Odası'],
  },
  {
    id: 'sube-besiktas',
    ad: 'Beşiktaş Akademi Şubesi',
    kod: 'BJK-03',
    sehir: 'İstanbul',
    ilce: 'Beşiktaş',
    adres: 'Yıldız Cad. No: 24, Beşiktaş / İstanbul',
    telefon: '+90 212 258 77 90',
    eposta: 'besiktas@sportsfly.com',
    sorumluYonetici: 'Abdullah Acet',
    sorumluAntrenor: 'Emirhan Örnek',
    antrenorSayisi: 6,
    sporcuSayisi: 35,
    kapasite: 50,
    branslar: ['Futbol', 'Yüzme', 'Tenis'],
    tesisTipi: 'Spor Kompleksi',
    durum: 'Aktif',
    acilisTarihi: '10.11.2022',
    aylikCiro: 156000,
    ozellikler: ['Sentetik Çim', 'Yarı Olimpik Havuz', 'Tribün', 'Soyunma Odası'],
  },
  {
    id: 'sube-cankaya',
    ad: 'Ankara Çankaya Tesisleri',
    kod: 'ANK-04',
    sehir: 'Ankara',
    ilce: 'Çankaya',
    adres: 'Turan Güneş Bulv. No: 67, Çankaya / Ankara',
    telefon: '+90 312 440 33 22',
    eposta: 'ankara@sportsfly.com',
    sorumluYonetici: 'Kaan Yıldırım',
    sorumluAntrenor: 'Arif Emre Kaya',
    antrenorSayisi: 4,
    sporcuSayisi: 19,
    kapasite: 35,
    branslar: ['Basketbol', 'Cimnastik', 'Masa Tenisi'],
    tesisTipi: 'Kapalı Spor Salonu',
    durum: 'Aktif',
    acilisTarihi: '01.06.2023',
    aylikCiro: 92000,
    ozellikler: ['Otopark', 'Soyunma Odası', 'Kondisyon Salonu'],
  },
];

const SUBELER_STORAGE_KEY = 'sportsfly_club_subeler_v1';
const ACTIVE_SUBE_STORAGE_KEY = 'sportsfly_active_sube_id_v1';

export function getStoredSubeler(): Sube[] {
  if (typeof window === 'undefined') return INITIAL_SUBELER;
  try {
    const raw = localStorage.getItem(SUBELER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SUBELER_STORAGE_KEY, JSON.stringify(INITIAL_SUBELER));
      return INITIAL_SUBELER;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SUBELER;
  } catch (err) {
    console.error('Şube verileri yüklenirken hata:', err);
    return INITIAL_SUBELER;
  }
}

export function saveStoredSubeler(subeler: Sube[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SUBELER_STORAGE_KEY, JSON.stringify(subeler));
    window.dispatchEvent(new CustomEvent('sportsfly_subeler_updated', { detail: subeler }));
  } catch (err) {
    console.error('Şube verileri kaydedilirken hata:', err);
  }
}

export function getActiveSubeId(): string {
  if (typeof window === 'undefined') return 'all';
  try {
    return localStorage.getItem(ACTIVE_SUBE_STORAGE_KEY) || 'all';
  } catch {
    return 'all';
  }
}

export function setActiveSubeId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_SUBE_STORAGE_KEY, id);
    window.dispatchEvent(new CustomEvent('sportsfly_active_sube_changed', { detail: id }));
  } catch (err) {
    console.error('Aktif şube değiştirilirken hata:', err);
  }
}

export function getActiveSube(): Sube | null {
  const activeId = getActiveSubeId();
  if (activeId === 'all') return null;
  const subeler = getStoredSubeler();
  return subeler.find((s) => s.id === activeId) || null;
}
