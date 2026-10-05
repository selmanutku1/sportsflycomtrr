// SportsFly - Her Gün Sabah Saat 10:00 Aktif Sporcu Sayımı (Snapshot) Veri Modeli ve Yönetimi

export interface DailySnapshotItem {
  id: string;
  date: string; // YYYY-MM-DD
  dateFormatted: string; // DD.MM.YYYY
  dayName: string;
  time: string; // "10:00:00"
  totalAthletes: number;
  activeAthletes: number;
  passiveAthletes: number;
  trialAthletes: number;
  newlyJoinedToday: number;
  leftOrFrozenToday: number;
  netChange: number;
  growthRatePercent: number;
  branchBreakdown: {
    branchName: string;
    count: number;
    color: string;
  }[];
  facilityBreakdown: {
    facilityName: string;
    count: number;
  }[];
  notes?: string;
  systemStatus: 'automatic' | 'manual_override';
  verifiedBy: string;
}

const STORAGE_KEY = 'sportsfly_daily_10am_snapshots_v2';

// 14 günlük gerçekçi 10:00 verisi (Bugüne kadar olan geçmiş)
export const SEED_DAILY_SNAPSHOTS: DailySnapshotItem[] = [
  {
    id: 'snap-2026-09-19',
    date: '2026-09-19',
    dateFormatted: '19.09.2026',
    dayName: 'Cumartesi',
    time: '10:00:00',
    totalAthletes: 164,
    activeAthletes: 148,
    passiveAthletes: 8,
    trialAthletes: 8,
    newlyJoinedToday: 3,
    leftOrFrozenToday: 0,
    netChange: 3,
    growthRatePercent: 2.07,
    branchBreakdown: [
      { branchName: 'Basketbol', count: 62, color: '#2563eb' },
      { branchName: 'Voleybol', count: 41, color: '#7c3aed' },
      { branchName: 'Yüzme', count: 28, color: '#0284c7' },
      { branchName: 'Jimnastik', count: 17, color: '#10b981' },
    ],
    facilityBreakdown: [
      { facilityName: 'Merkez Kampüs Spor Salonu', count: 88 },
      { facilityName: 'Batı Tesisleri & Havuz', count: 42 },
      { facilityName: 'Doğu Akademi Kortları', count: 18 },
    ],
    notes: 'Sabah 10:00 sayımında hafta sonu seanslarına 3 yeni sporcu eklendi.',
    systemStatus: 'automatic',
    verifiedBy: 'SportsFly Cron Engine (v2.4)',
  },
  {
    id: 'snap-2026-09-18',
    date: '2026-09-18',
    dateFormatted: '18.09.2026',
    dayName: 'Cuma',
    time: '10:00:00',
    totalAthletes: 161,
    activeAthletes: 145,
    passiveAthletes: 9,
    trialAthletes: 7,
    newlyJoinedToday: 2,
    leftOrFrozenToday: 1,
    netChange: 1,
    growthRatePercent: 0.69,
    branchBreakdown: [
      { branchName: 'Basketbol', count: 60, color: '#2563eb' },
      { branchName: 'Voleybol', count: 40, color: '#7c3aed' },
      { branchName: 'Yüzme', count: 28, color: '#0284c7' },
      { branchName: 'Jimnastik', count: 17, color: '#10b981' },
    ],
    facilityBreakdown: [
      { facilityName: 'Merkez Kampüs Spor Salonu', count: 86 },
      { facilityName: 'Batı Tesisleri & Havuz', count: 41 },
      { facilityName: 'Doğu Akademi Kortları', count: 18 },
    ],
    notes: 'Kayıt yenileme dönemi tamamlandı.',
    systemStatus: 'automatic',
    verifiedBy: 'SportsFly Cron Engine (v2.4)',
  },
  {
    id: 'snap-2026-09-17',
    date: '2026-09-17',
    dateFormatted: '17.09.2026',
    dayName: 'Perşembe',
    time: '10:00:00',
    totalAthletes: 160,
    activeAthletes: 144,
    passiveAthletes: 10,
    trialAthletes: 6,
    newlyJoinedToday: 4,
    leftOrFrozenToday: 0,
    netChange: 4,
    growthRatePercent: 2.85,
    branchBreakdown: [
      { branchName: 'Basketbol', count: 59, color: '#2563eb' },
      { branchName: 'Voleybol', count: 40, color: '#7c3aed' },
      { branchName: 'Yüzme', count: 28, color: '#0284c7' },
      { branchName: 'Jimnastik', count: 17, color: '#10b981' },
    ],
    facilityBreakdown: [
      { facilityName: 'Merkez Kampüs Spor Salonu', count: 85 },
      { facilityName: 'Batı Tesisleri & Havuz', count: 41 },
      { facilityName: 'Doğu Akademi Kortları', count: 18 },
    ],
    notes: 'Okul açılış haftası yeni deneme kayıtları aktif üyeliğe geçti.',
    systemStatus: 'automatic',
    verifiedBy: 'SportsFly Cron Engine (v2.4)',
  },
  {
    id: 'snap-2026-09-16',
    date: '2026-09-16',
    dateFormatted: '16.09.2026',
    dayName: 'Çarşamba',
    time: '10:00:00',
    totalAthletes: 156,
    activeAthletes: 140,
    passiveAthletes: 11,
    trialAthletes: 5,
    newlyJoinedToday: 2,
    leftOrFrozenToday: 0,
    netChange: 2,
    growthRatePercent: 1.45,
    branchBreakdown: [
      { branchName: 'Basketbol', count: 57, color: '#2563eb' },
      { branchName: 'Voleybol', count: 39, color: '#7c3aed' },
      { branchName: 'Yüzme', count: 28, color: '#0284c7' },
      { branchName: 'Jimnastik', count: 16, color: '#10b981' },
    ],
    facilityBreakdown: [
      { facilityName: 'Merkez Kampüs Spor Salonu', count: 83 },
      { facilityName: 'Batı Tesisleri & Havuz', count: 40 },
      { facilityName: 'Doğu Akademi Kortları', count: 17 },
    ],
    notes: 'Rutin otomatik sayım.',
    systemStatus: 'automatic',
    verifiedBy: 'SportsFly Cron Engine (v2.4)',
  },
  {
    id: 'snap-2026-09-15',
    date: '2026-09-15',
    dateFormatted: '15.09.2026',
    dayName: 'Salı',
    time: '10:00:00',
    totalAthletes: 154,
    activeAthletes: 138,
    passiveAthletes: 11,
    trialAthletes: 5,
    newlyJoinedToday: 1,
    leftOrFrozenToday: 1,
    netChange: 0,
    growthRatePercent: 0,
    branchBreakdown: [
      { branchName: 'Basketbol', count: 56, color: '#2563eb' },
      { branchName: 'Voleybol', count: 39, color: '#7c3aed' },
      { branchName: 'Yüzme', count: 27, color: '#0284c7' },
      { branchName: 'Jimnastik', count: 16, color: '#10b981' },
    ],
    facilityBreakdown: [
      { facilityName: 'Merkez Kampüs Spor Salonu', count: 82 },
      { facilityName: 'Batı Tesisleri & Havuz', count: 39 },
      { facilityName: 'Doğu Akademi Kortları', count: 17 },
    ],
    notes: 'Stabil seviye.',
    systemStatus: 'automatic',
    verifiedBy: 'SportsFly Cron Engine (v2.4)',
  },
  {
    id: 'snap-2026-09-14',
    date: '2026-09-14',
    dateFormatted: '14.09.2026',
    dayName: 'Pazartesi',
    time: '10:00:00',
    totalAthletes: 154,
    activeAthletes: 138,
    passiveAthletes: 12,
    trialAthletes: 4,
    newlyJoinedToday: 5,
    leftOrFrozenToday: 0,
    netChange: 5,
    growthRatePercent: 3.76,
    branchBreakdown: [
      { branchName: 'Basketbol', count: 56, color: '#2563eb' },
      { branchName: 'Voleybol', count: 39, color: '#7c3aed' },
      { branchName: 'Yüzme', count: 27, color: '#0284c7' },
      { branchName: 'Jimnastik', count: 16, color: '#10b981' },
    ],
    facilityBreakdown: [
      { facilityName: 'Merkez Kampüs Spor Salonu', count: 82 },
      { facilityName: 'Batı Tesisleri & Havuz', count: 39 },
      { facilityName: 'Doğu Akademi Kortları', count: 17 },
    ],
    notes: 'Pazartesi yeni dönem başlangıcı toplu kayıtlar.',
    systemStatus: 'automatic',
    verifiedBy: 'SportsFly Cron Engine (v2.4)',
  },
  {
    id: 'snap-2026-09-13',
    date: '2026-09-13',
    dateFormatted: '13.09.2026',
    dayName: 'Pazar',
    time: '10:00:00',
    totalAthletes: 149,
    activeAthletes: 133,
    passiveAthletes: 12,
    trialAthletes: 4,
    newlyJoinedToday: 2,
    leftOrFrozenToday: 0,
    netChange: 2,
    growthRatePercent: 1.53,
    branchBreakdown: [
      { branchName: 'Basketbol', count: 54, color: '#2563eb' },
      { branchName: 'Voleybol', count: 38, color: '#7c3aed' },
      { branchName: 'Yüzme', count: 26, color: '#0284c7' },
      { branchName: 'Jimnastik', count: 15, color: '#10b981' },
    ],
    facilityBreakdown: [
      { facilityName: 'Merkez Kampüs Spor Salonu', count: 79 },
      { facilityName: 'Batı Tesisleri & Havuz', count: 38 },
      { facilityName: 'Doğu Akademi Kortları', count: 16 },
    ],
    notes: 'Hafta sonu müsabaka dönemi.',
    systemStatus: 'automatic',
    verifiedBy: 'SportsFly Cron Engine (v2.4)',
  },
  {
    id: 'snap-2026-09-12',
    date: '2026-09-12',
    dateFormatted: '12.09.2026',
    dayName: 'Cumartesi',
    time: '10:00:00',
    totalAthletes: 147,
    activeAthletes: 131,
    passiveAthletes: 13,
    trialAthletes: 3,
    newlyJoinedToday: 3,
    leftOrFrozenToday: 0,
    netChange: 3,
    growthRatePercent: 2.34,
    branchBreakdown: [
      { branchName: 'Basketbol', count: 53, color: '#2563eb' },
      { branchName: 'Voleybol', count: 37, color: '#7c3aed' },
      { branchName: 'Yüzme', count: 26, color: '#0284c7' },
      { branchName: 'Jimnastik', count: 15, color: '#10b981' },
    ],
    facilityBreakdown: [
      { facilityName: 'Merkez Kampüs Spor Salonu', count: 78 },
      { facilityName: 'Batı Tesisleri & Havuz', count: 37 },
      { facilityName: 'Doğu Akademi Kortları', count: 16 },
    ],
    notes: 'Cumartesi antrenman başlangıcı.',
    systemStatus: 'automatic',
    verifiedBy: 'SportsFly Cron Engine (v2.4)',
  },
  {
    id: 'snap-2026-09-11',
    date: '2026-09-11',
    dateFormatted: '11.09.2026',
    dayName: 'Cuma',
    time: '10:00:00',
    totalAthletes: 144,
    activeAthletes: 128,
    passiveAthletes: 13,
    trialAthletes: 3,
    newlyJoinedToday: 1,
    leftOrFrozenToday: 1,
    netChange: 0,
    growthRatePercent: 0,
    branchBreakdown: [
      { branchName: 'Basketbol', count: 52, color: '#2563eb' },
      { branchName: 'Voleybol', count: 36, color: '#7c3aed' },
      { branchName: 'Yüzme', count: 25, color: '#0284c7' },
      { branchName: 'Jimnastik', count: 15, color: '#10b981' },
    ],
    facilityBreakdown: [
      { facilityName: 'Merkez Kampüs Spor Salonu', count: 76 },
      { facilityName: 'Batı Tesisleri & Havuz', count: 36 },
      { facilityName: 'Doğu Akademi Kortları', count: 16 },
    ],
    notes: 'Otomatik 10:00 sayımı.',
    systemStatus: 'automatic',
    verifiedBy: 'SportsFly Cron Engine (v2.4)',
  },
  {
    id: 'snap-2026-09-10',
    date: '2026-09-10',
    dateFormatted: '10.09.2026',
    dayName: 'Perşembe',
    time: '10:00:00',
    totalAthletes: 144,
    activeAthletes: 128,
    passiveAthletes: 14,
    trialAthletes: 2,
    newlyJoinedToday: 2,
    leftOrFrozenToday: 0,
    netChange: 2,
    growthRatePercent: 1.58,
    branchBreakdown: [
      { branchName: 'Basketbol', count: 52, color: '#2563eb' },
      { branchName: 'Voleybol', count: 36, color: '#7c3aed' },
      { branchName: 'Yüzme', count: 25, color: '#0284c7' },
      { branchName: 'Jimnastik', count: 15, color: '#10b981' },
    ],
    facilityBreakdown: [
      { facilityName: 'Merkez Kampüs Spor Salonu', count: 76 },
      { facilityName: 'Batı Tesisleri & Havuz', count: 36 },
      { facilityName: 'Doğu Akademi Kortları', count: 16 },
    ],
    notes: 'Perşembe grup yoklamaları sonrası teyit.',
    systemStatus: 'automatic',
    verifiedBy: 'SportsFly Cron Engine (v2.4)',
  },
];

export function getStoredDailySnapshots(): DailySnapshotItem[] {
  if (typeof window === 'undefined') return SEED_DAILY_SNAPSHOTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DAILY_SNAPSHOTS));
      return SEED_DAILY_SNAPSHOTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Error loading daily snapshots', e);
  }
  return SEED_DAILY_SNAPSHOTS;
}

export function saveDailySnapshots(snapshots: DailySnapshotItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
    window.dispatchEvent(new CustomEvent('sportsfly_daily_snapshots_updated', { detail: snapshots }));
  } catch (e) {
    console.error('Error saving daily snapshots', e);
  }
}

export function addOrUpdateTodaySnapshot(newActiveCount?: number): DailySnapshotItem {
  const current = getStoredDailySnapshots();
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  const dateFormatted = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`;
  
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const dayName = dayNames[today.getDay()];

  const existingIdx = current.findIndex((s) => s.date === dateStr);
  const previousSnapshot = current[existingIdx >= 0 ? existingIdx + 1 : 0];
  const prevCount = previousSnapshot ? previousSnapshot.activeAthletes : 145;

  const countToSet = newActiveCount !== undefined ? newActiveCount : (existingIdx >= 0 ? current[existingIdx].activeAthletes : 148);
  const net = countToSet - prevCount;
  const growthRate = prevCount > 0 ? parseFloat(((net / prevCount) * 100).toFixed(2)) : 0;

  const updatedItem: DailySnapshotItem = {
    id: `snap-${dateStr}`,
    date: dateStr,
    dateFormatted,
    dayName,
    time: '10:00:00',
    totalAthletes: countToSet + 16,
    activeAthletes: countToSet,
    passiveAthletes: 8,
    trialAthletes: 8,
    newlyJoinedToday: net > 0 ? net : 1,
    leftOrFrozenToday: net < 0 ? Math.abs(net) : 0,
    netChange: net,
    growthRatePercent: growthRate,
    branchBreakdown: [
      { branchName: 'Basketbol', count: Math.round(countToSet * 0.42), color: '#2563eb' },
      { branchName: 'Voleybol', count: Math.round(countToSet * 0.28), color: '#7c3aed' },
      { branchName: 'Yüzme', count: Math.round(countToSet * 0.19), color: '#0284c7' },
      { branchName: 'Jimnastik', count: Math.max(1, countToSet - Math.round(countToSet * 0.42) - Math.round(countToSet * 0.28) - Math.round(countToSet * 0.19)), color: '#10b981' },
    ],
    facilityBreakdown: [
      { facilityName: 'Merkez Kampüs Spor Salonu', count: Math.round(countToSet * 0.59) },
      { facilityName: 'Batı Tesisleri & Havuz', count: Math.round(countToSet * 0.29) },
      { facilityName: 'Doğu Akademi Kortları', count: Math.max(1, countToSet - Math.round(countToSet * 0.59) - Math.round(countToSet * 0.29)) },
    ],
    notes: 'Saat 10:00 otomatik sistem konsolidasyon kaydı.',
    systemStatus: 'automatic',
    verifiedBy: 'SportsFly Cron Engine (v2.4)',
  };

  let updatedList: DailySnapshotItem[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = updatedItem;
  } else {
    updatedList = [updatedItem, ...current];
  }

  saveDailySnapshots(updatedList);
  return updatedItem;
}
