import { NavPage, PackagePlanType } from '../types';
import { ADMIN_GOOGLE_EMAIL } from './userProfile';
import { doc, setDoc, getDocs, collection, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface ConfigurableAreaItem {
  page: NavPage;
  label: string;
  category: 'Temel Yönetim' | 'Kadro & Branş' | 'Operasyon & Karne' | 'Finans & Muhasebe' | 'Sporpuan & Modüller';
  description: string;
}

export const ALL_CONFIGURABLE_SYSTEM_AREAS: ConfigurableAreaItem[] = [
  // Temel Yönetim
  { page: 'paketler', label: 'Paketler & Abonelik', category: 'Temel Yönetim', description: 'Abonelik paketlerini görüntüleme ve yükseltme ekranı' },
  { page: 'anasayfa', label: 'Anasayfa (Kontrol Paneli)', category: 'Temel Yönetim', description: 'Kulüp özet istatistikleri, grafikler ve hızlı aksiyonlar' },
  { page: 'on-kayit', label: 'Ön Kayıt & Başvurular', category: 'Temel Yönetim', description: 'Online sporcu ön kayıt ve deneme antrenmanı başvuruları' },
  { page: 'subeler', label: 'Şube & Tesis Yönetimi', category: 'Temel Yönetim', description: 'Çoklu şube, saha ve tesis tanımlama alanı' },
  { page: 'sube-ozet', label: 'Şube Özet & Analitik', category: 'Temel Yönetim', description: 'Şubeler arası karşılaştırmalı performans ve finans özeti' },
  { page: 'destek', label: 'Destek & Yardım Masası', category: 'Temel Yönetim', description: '7/24 teknik destek biletleri ve yardım merkezi' },

  // Kadro & Branş
  { page: 'sporcular', label: 'Sporcular', category: 'Kadro & Branş', description: 'Kayıtlı sporcu profilleri, veli bilgileri ve lisans takibi' },
  { page: 'gruplar', label: 'Gruplar & Takımlar', category: 'Kadro & Branş', description: 'Yaş ve seviye grupları, kontenjan ve kadro eşleştirmeleri' },
  { page: 'egitmenler', label: 'Eğitmenler & Antrenörler', category: 'Kadro & Branş', description: 'Antrenör kadrosu, uzmanlık ve grup atamaları' },
  { page: 'yoneticiler', label: 'Yöneticiler', category: 'Kadro & Branş', description: 'Kulüp ve şube yöneticileri erişim tanımları' },
  { page: 'brans-yonetimi', label: 'Branş Yönetimi', category: 'Kadro & Branş', description: 'Kulüp spor branşları ve kategori yapılandırması' },

  // Operasyon & Karne
  { page: 'yoklama', label: 'Yoklama & Katılım', category: 'Operasyon & Karne', description: 'Mobil yoklama, QR seans girişi ve devamsızlık takibi' },
  { page: 'sporcu-karnesi', label: 'Sporcu Karnesi', category: 'Operasyon & Karne', description: 'Dijital sporcu gelişim karnesi ve fiziksel ölçümler' },
  { page: 'antrenman-takvimi', label: 'Antrenman Takvimi', category: 'Operasyon & Karne', description: 'Haftalık saha/salon ders ve antrenman programı' },
  { page: 'egitim-planlama', label: 'Eğitim Planlama & Müfredat', category: 'Operasyon & Karne', description: 'Branş bazlı antrenman müfredatı ve taktik tahtası' },
  { page: 'anket-yonetimi', label: 'Anket Yönetimi', category: 'Operasyon & Karne', description: 'Veli ve sporcu memnuniyet anketleri' },
  { page: 'kulup-evraklari', label: 'Kulüp Evrakları', category: 'Operasyon & Karne', description: 'Sağlık raporları, lisans ve resmi kulüp belgeleri' },
  { page: 'kulup-galerisi', label: 'Kulüp Galerisi', category: 'Operasyon & Karne', description: 'Antrenman ve turnuva fotoğraf/medya arşivi' },
  { page: 'kullanici-sozlesmeleri', label: 'Kulüp Sözleşmeleri & KVKK', category: 'Operasyon & Karne', description: 'Dijital veli muvafakatname ve KVKK onay metinleri' },

  // Finans & Muhasebe
  { page: 'on-muhasebe', label: 'Ön Muhasebe (Genel)', category: 'Finans & Muhasebe', description: 'Kasa, banka ve genel gelir-gider finansal özeti' },
  { page: 'odeme-plani', label: 'Ödeme Planı & Aidat', category: 'Finans & Muhasebe', description: 'Sporcu aidat taksitlendirme ve ödeme planları' },
  { page: 'odeme-plani-kontrol', label: 'Ödeme Planı Kontrol', category: 'Finans & Muhasebe', description: 'Geciken tahsilatlar ve ödeme hatırlatma kontrolü' },
  { page: 'gelir-gider-yonetimi', label: 'Gelir / Gider Hareketleri', category: 'Finans & Muhasebe', description: 'Detaylı fatura, kira, maaş ve aidat hareketleri' },
  { page: 'gelir-gider-kategori', label: 'Gelir / Gider Kategorileri', category: 'Finans & Muhasebe', description: 'Muhasebe hesap planı ve kategori ağacı' },

  // Sporpuan & Modüller
  { page: 'entegrasyonlar', label: 'Entegrasyonlar & SportsFly Lab', category: 'Sporpuan & Modüller', description: 'SportsFly Lab Karne, SMS, Sanal POS ve modül entegrasyonları' },
  { page: 'sporpuan-sporcu-degerlendirme', label: 'Sporpuan · Sporcu Değerlendirme', category: 'Sporpuan & Modüller', description: 'Sporcu yetkinlik ve davranış puanlama motoru' },
  { page: 'sporpuan-degerlendirmeler', label: 'Sporpuan · İtibar Değerlendirmeleri', category: 'Sporpuan & Modüller', description: 'Kulüp ve eğitmen itibar değerlendirmeleri' },
  { page: 'sporpuan-dogrulamalar', label: 'Sporpuan · Doğrulamalar', category: 'Sporpuan & Modüller', description: 'Sertifika, rozet ve kazanım doğrulama ekranı' },
  { page: 'sporpuan-raporlar', label: 'Sporpuan · Analitik Raporlar', category: 'Sporpuan & Modüller', description: 'Sporpuan gelişim ve ödül analitik raporları' },
  { page: 'turnuva-yonetimi', label: 'Turnuva & Lig Yönetimi', category: 'Sporpuan & Modüller', description: 'Fikstür, maç sonuçları ve turnuva organizasyonu' },
  { page: 'envanter-yonetimi', label: 'Envanter & Malzeme', category: 'Sporpuan & Modüller', description: 'Forma, malzeme ve ekipman stok takibi' },
  { page: 'referans-programi', label: 'Referans Programı', category: 'Sporpuan & Modüller', description: 'Arkadaşını getir indirim ve sadakat yönetimi' },
];

export interface GoogleUserAccessRecord {
  id: string;
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  clubName: string;
  phone: string;
  firstLoginAt: string;
  lastLoginAt: string;
  assignedPlan: PackagePlanType | 'Paket Seçilmedi';
  allowedPages: NavPage[];
  isFullAccess: boolean;
  notes?: string;
}

const GOOGLE_USERS_STORAGE_KEY = 'sportsfly_google_users_access_v1';

export const INITIAL_GOOGLE_USERS: GoogleUserAccessRecord[] = [
  {
    id: 'guser-1',
    uid: 'google-uid-104829',
    name: 'Mertcan Demir',
    email: 'mertcan.demir.akademi@gmail.com',
    clubName: 'Boğaziçi Atletik Spor Okulu',
    phone: '+90 532 418 92 10',
    firstLoginAt: '28.09.2026 14:20',
    lastLoginAt: '30.09.2026 11:45',
    assignedPlan: 'Paket Seçilmedi',
    allowedPages: ['paketler'],
    isFullAccess: false,
    notes: 'Google ile giriş yaptı, paket seçimi veya admin alan yetkilendirmesi bekliyor.',
  },
  {
    id: 'guser-2',
    uid: 'google-uid-209412',
    name: 'Zeynep Karahan',
    email: 'zeynep.karahan.voleybol@gmail.com',
    clubName: 'Ege Yıldızları Voleybol Akademi',
    phone: '+90 544 712 38 55',
    firstLoginAt: '27.09.2026 09:15',
    lastLoginAt: '30.09.2026 13:10',
    assignedPlan: 'Başlangıç Kulübü',
    allowedPages: ['paketler', 'anasayfa', 'sporcular', 'yoklama', 'sporcu-karnesi', 'antrenman-takvimi'],
    isFullAccess: false,
    notes: 'Admin tarafından Temel Sporcu, Yoklama ve Karne alanları aktif edildi.',
  },
  {
    id: 'guser-3',
    uid: 'google-uid-318940',
    name: 'Burak Özkan',
    email: 'burak.ozkan.futbol@gmail.com',
    clubName: 'Marmara Gençlik Spor Kulübü',
    phone: '+90 533 891 04 22',
    firstLoginAt: '25.09.2026 17:40',
    lastLoginAt: '29.09.2026 19:05',
    assignedPlan: 'Paket Seçilmedi',
    allowedPages: ['paketler'],
    isFullAccess: false,
    notes: 'Yeni Google kaydı — yalnızca Paketler sayfası açık.',
  },
  {
    id: 'guser-4',
    uid: 'google-uid-492011',
    name: 'Elif Sönmez',
    email: 'elif.sonmez.cimnastik@gmail.com',
    clubName: 'Ataköy Cimnastik & Yüzme Merkezi',
    phone: '+90 535 604 19 88',
    firstLoginAt: '24.09.2026 10:30',
    lastLoginAt: '30.09.2026 14:50',
    assignedPlan: 'Kulüp & Akademi',
    allowedPages: [
      'paketler',
      'anasayfa',
      'on-kayit',
      'sporcular',
      'gruplar',
      'egitmenler',
      'yoklama',
      'sporcu-karnesi',
      'antrenman-takvimi',
      'entegrasyonlar',
    ],
    isFullAccess: false,
    notes: 'SportsFly Lab ve Kadro modülleri admin tarafından erişime açıldı.',
  },
];

export function getStoredGoogleUsers(): GoogleUserAccessRecord[] {
  if (typeof window === 'undefined') return INITIAL_GOOGLE_USERS;
  try {
    const raw = localStorage.getItem(GOOGLE_USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(
          (u: GoogleUserAccessRecord) => (u.email || '').trim().toLowerCase() !== ADMIN_GOOGLE_EMAIL
        );
      }
    }
  } catch (e) {
    console.error('Failed to read Google users access list:', e);
  }
  return INITIAL_GOOGLE_USERS;
}

export function saveStoredGoogleUsers(list: GoogleUserAccessRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    const filtered = list.filter(
      (u) => (u.email || '').trim().toLowerCase() !== ADMIN_GOOGLE_EMAIL
    );
    localStorage.setItem(GOOGLE_USERS_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('sportsfly_google_users_updated', { detail: filtered }));
  } catch (e) {
    console.error('Failed to save Google users access list:', e);
  }
}

/**
 * Syncs a Google user record to Firestore (/googleUsers/{id}) if authenticated
 */
export async function syncGoogleUserToFirestore(record: GoogleUserAccessRecord): Promise<void> {
  try {
    if (!auth.currentUser) return;
    const docId = record.id.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 128);
    await setDoc(
      doc(db, 'googleUsers', docId),
      {
        id: docId,
        uid: record.uid || docId,
        name: record.name.slice(0, 120),
        email: record.email.slice(0, 160),
        clubName: (record.clubName || 'Belirtilmedi').slice(0, 140),
        phone: (record.phone || '-').slice(0, 32),
        assignedPlan: record.assignedPlan,
        allowedPages: record.allowedPages,
        isFullAccess: Boolean(record.isFullAccess),
        firstLoginAt: record.firstLoginAt,
        lastLoginAt: record.lastLoginAt,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Fallback silently to localStorage if Firestore rules or offline prevent write
  }
}

/**
 * Loads Google users from Firestore and merges with localStorage
 */
export async function fetchAndMergeGoogleUsersFromFirestore(): Promise<GoogleUserAccessRecord[]> {
  const localList = getStoredGoogleUsers();
  try {
    if (!auth.currentUser) return localList;
    const snap = await getDocs(collection(db, 'googleUsers'));
    if (snap.empty) return localList;

    const map = new Map<string, GoogleUserAccessRecord>();
    localList.forEach((item) => map.set(item.email.toLowerCase(), item));

    snap.docs.forEach((d) => {
      const data = d.data() as Partial<GoogleUserAccessRecord>;
      if (data.email) {
        const key = data.email.trim().toLowerCase();
        const existing = map.get(key);
        const isAdmin = key === ADMIN_GOOGLE_EMAIL;
        map.set(key, {
          id: data.id || d.id,
          uid: data.uid || existing?.uid || d.id,
          name: data.name || existing?.name || (isAdmin ? 'Selman Utku' : 'Google Kullanıcısı'),
          email: data.email.trim(),
          avatarUrl: data.avatarUrl || existing?.avatarUrl,
          clubName: data.clubName || existing?.clubName || (isAdmin ? 'SportsFly Kadıköy Merkez Şube' : 'Paket Seçimi Bekleniyor'),
          phone: data.phone || existing?.phone || '+90 532 000 00 00',
          firstLoginAt: data.firstLoginAt || existing?.firstLoginAt || '30.09.2026 12:00',
          lastLoginAt: data.lastLoginAt || existing?.lastLoginAt || '30.09.2026 15:00',
          assignedPlan: data.assignedPlan || existing?.assignedPlan || (isAdmin ? 'Pro Akademi & Çoklu Şube' : 'Paket Seçilmedi'),
          allowedPages: Array.isArray(data.allowedPages) && data.allowedPages.length > 0
            ? (data.allowedPages as NavPage[])
            : existing?.allowedPages || (isAdmin ? ['anasayfa', 'sporcular', 'gruplar', 'egitmenler', 'yoklama', 'sporcu-karnesi', 'on-muhasebe', 'paketler', 'yetkilendirmeler'] : ['paketler']),
          isFullAccess: Boolean(data.isFullAccess ?? existing?.isFullAccess ?? isAdmin),
          notes: data.notes || existing?.notes || (isAdmin ? 'Süper Admin (Google OAuth ile doğrulandı)' : undefined),
        });
      }
    });

    const merged = Array.from(map.values());
    saveStoredGoogleUsers(merged);
    return merged;
  } catch {
    return localList;
  }
}

/**
 * Called whenever a non-admin user signs in with Google
 */
export function registerOrUpdateGoogleLoginUser(params: {
  uid?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  clubName?: string;
  phone?: string;
}): GoogleUserAccessRecord | null {
  const cleanEmail = (params.email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return null;
  }
  const isAdmin = cleanEmail === ADMIN_GOOGLE_EMAIL;

  const now = new Date();
  const formattedNow = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  const list = getStoredGoogleUsers();
  const existingIdx = list.findIndex((u) => u.email.trim().toLowerCase() === cleanEmail);

  if (existingIdx >= 0) {
    const updated: GoogleUserAccessRecord = {
      ...list[existingIdx],
      name: params.name || list[existingIdx].name,
      avatarUrl: params.avatarUrl || list[existingIdx].avatarUrl,
      lastLoginAt: formattedNow,
      isFullAccess: isAdmin || list[existingIdx].isFullAccess,
    };
    const nextList = [...list];
    nextList[existingIdx] = updated;
    saveStoredGoogleUsers(nextList);
    syncGoogleUserToFirestore(updated);
    return updated;
  }

  const newRecord: GoogleUserAccessRecord = {
    id: isAdmin ? 'guser-admin' : `guser-${Date.now()}`,
    uid: params.uid || (isAdmin ? 'admin-google-selman' : `google-uid-${Date.now()}`),
    name: params.name || (isAdmin ? 'Selman Utku' : 'Google Kullanıcısı'),
    email: cleanEmail,
    avatarUrl: params.avatarUrl,
    clubName: params.clubName || (isAdmin ? 'SportsFly Kadıköy Merkez Şube' : 'Paket Seçimi Bekleniyor'),
    phone: params.phone || (isAdmin ? '0216 850 1907' : '+90 532 000 00 00'),
    firstLoginAt: formattedNow,
    lastLoginAt: formattedNow,
    assignedPlan: isAdmin ? 'Pro Akademi & Çoklu Şube' : 'Paket Seçilmedi',
    allowedPages: isAdmin
      ? ['anasayfa', 'sporcular', 'gruplar', 'egitmenler', 'yoklama', 'sporcu-karnesi', 'on-muhasebe', 'paketler', 'yetkilendirmeler']
      : ['paketler'],
    isFullAccess: isAdmin,
    notes: isAdmin
      ? 'Süper Admin (Google OAuth ile doğrulandı - Tam Sistem Erişimi)'
      : 'Google ile giriş yaptı — Admin tarafından alan yetkilendirmesi yapılabilir.',
  };

  const nextList = [newRecord, ...list];
  saveStoredGoogleUsers(nextList);
  syncGoogleUserToFirestore(newRecord);
  return newRecord;
}

/**
 * Returns the GoogleUserAccessRecord for a given email if found
 */
export function getGoogleUserAccessByEmail(email?: string): GoogleUserAccessRecord | null {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  if (!clean || clean === ADMIN_GOOGLE_EMAIL) return null;
  const list = getStoredGoogleUsers();
  return list.find((u) => u.email.trim().toLowerCase() === clean) || null;
}

/**
 * Checks if a specific NavPage is enabled by the Admin for this Google user
 */
export function isPageAllowedForGoogleUser(page: NavPage, email?: string): boolean {
  if (page === 'paketler' || page === 'paket-yonetimi') return true;
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (clean === ADMIN_GOOGLE_EMAIL) return true;

  const record = getGoogleUserAccessByEmail(clean);
  if (!record) return false;
  if (record.isFullAccess) return true;
  return record.allowedPages.includes(page);
}

/**
 * Delete a Google user record
 */
export async function deleteGoogleUserRecord(id: string): Promise<void> {
  const list = getStoredGoogleUsers().filter((u) => u.id !== id);
  saveStoredGoogleUsers(list);
  try {
    if (auth.currentUser) {
      await deleteDoc(doc(db, 'googleUsers', id));
    }
  } catch {
    // ignore offline
  }
}
