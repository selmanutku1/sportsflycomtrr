// SporPuan ve Sporcu Karnesi Dinamik Köprüsü & Denge Motoru
// Hızlı Puan ve SporPuan kazanımlarının sporcu karnesine anlık yansıması

import { SporcuKarne, getStoredKarneler, saveStoredKarneler } from '../data/mockKarneData';

export interface SporPuanLogItem {
  id: string;
  sporcuId: string;
  sporcuName: string;
  category: 'Davranış' | 'Gelişim' | 'Liderlik' | 'Etkinlik' | 'Devam' | string;
  ruleName: string;
  points: number;
  date: string;
  source: 'Koç Onayı' | 'Otomatik' | 'Değerlendirme' | string;
  note?: string;
}

export interface SporPuanKarneImpact {
  totalSP: number;
  quickPointsCount: number;
  categoryPoints: {
    davranis: number;
    gelisim: number;
    liderlik: number;
    etkinlik: number;
    devam: number;
  };
  bonuses: {
    davranisBonus: number; // e.g. +0.4
    teknikBonus: number;    // e.g. +0.3
    fizikselBonus: number;  // e.g. +0.2
    taktikselBonus: number; // e.g. +0.2
    zihinselBonus: number;  // e.g. +0.4
    genelOrtalamaBonus: number; // e.g. +0.3
  };
  recentCoachObservations: {
    id: string;
    ruleName: string;
    category: string;
    points: number;
    date: string;
    note?: string;
  }[];
}

const STORAGE_KEY = 'sportsfly_sporpuan_logs_new';

export function getStoredSporPuanLogs(): SporPuanLogItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Calculates dynamic SporPuan impact and bonuses for a specific athlete
 */
export function calculateSporPuanImpact(
  athleteIdentifier: { id?: string; sporcuId?: string; name?: string }
): SporPuanKarneImpact {
  const logs = getStoredSporPuanLogs();
  
  const targetId = athleteIdentifier.id?.toLowerCase();
  const targetSporcuId = athleteIdentifier.sporcuId?.toLowerCase();
  const targetName = athleteIdentifier.name?.toLowerCase().trim();

  // Filter logs for this athlete matching by id, sporcuId, or name
  const athleteLogs = logs.filter((log) => {
    const lId = log.sporcuId?.toLowerCase();
    const lName = log.sporcuName?.toLowerCase().trim();
    if (targetId && (lId === targetId || lId === `k${targetId.replace(/\D/g, '')}`)) return true;
    if (targetSporcuId && (lId === targetSporcuId || lId === `s${targetSporcuId.replace(/\D/g, '')}`)) return true;
    if (targetName && lName && (lName === targetName || lName.includes(targetName) || targetName.includes(lName))) return true;
    return false;
  });

  // Base deterministic points so every athlete has dynamic activity even before first action
  const nameHash = (targetName || targetId || 'sportsfly')
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  
  const baseDavranis = (nameHash % 3) * 50 + 50; // 50 - 150 SP
  const baseGelisim = (nameHash % 4) * 40 + 40;   // 40 - 160 SP
  const baseLiderlik = (nameHash % 3) * 35 + 35;  // 35 - 105 SP
  const baseEtkinlik = (nameHash % 2) * 60 + 60;  // 60 - 120 SP
  const baseDevam = 175;

  let davranisSP = baseDavranis;
  let gelisimSP = baseGelisim;
  let liderlikSP = baseLiderlik;
  let etkinlikSP = baseEtkinlik;
  let devamSP = baseDevam;
  let quickCount = 2; // Initial baseline quick awards

  athleteLogs.forEach((log) => {
    const pts = Number(log.points) || 0;
    quickCount += 1;
    switch (log.category) {
      case 'Davranış':
        davranisSP += pts;
        break;
      case 'Gelişim':
        gelisimSP += pts;
        break;
      case 'Liderlik':
        liderlikSP += pts;
        break;
      case 'Etkinlik':
        etkinlikSP += pts;
        break;
      case 'Devam':
        devamSP += pts;
        break;
      default:
        davranisSP += Math.round(pts / 2);
        gelisimSP += Math.round(pts / 2);
    }
  });

  const totalSP = davranisSP + gelisimSP + liderlikSP + etkinlikSP + devamSP;

  // Compute smart, mathematically balanced bonuses (scaled to 10.0 scale, capped reasonably)
  // Each ~100 SP in Davranış provides +0.2 to behavior
  const davranisBonus = Math.min(1.4, Number(((davranisSP / 250) * 0.45).toFixed(2)));
  // Each ~100 SP in Gelişim provides +0.2 to technical and physical
  const teknikBonus = Math.min(1.2, Number(((gelisimSP / 250) * 0.38).toFixed(2)));
  const fizikselBonus = Math.min(1.2, Number(((gelisimSP / 250) * 0.35).toFixed(2)));
  // Tactical benefits from both leadership & development
  const taktikselBonus = Math.min(1.0, Number((((gelisimSP + liderlikSP) / 400) * 0.3).toFixed(2)));
  // Mental benefits from Leadership and Fair-Play
  const zihinselBonus = Math.min(1.5, Number((((liderlikSP + davranisSP) / 300) * 0.45).toFixed(2)));
  // Overall dynamic bonus
  const genelOrtalamaBonus = Math.min(
    1.2,
    Number(((davranisBonus + teknikBonus + fizikselBonus + taktikselBonus + zihinselBonus) / 5).toFixed(2))
  );

  const recentCoachObservations = athleteLogs
    .filter((l) => l.source === 'Koç Onayı' || l.note)
    .map((l) => ({
      id: l.id,
      ruleName: l.ruleName,
      category: l.category,
      points: l.points,
      date: l.date,
      note: l.note,
    }));

  return {
    totalSP,
    quickPointsCount: quickCount,
    categoryPoints: {
      davranis: davranisSP,
      gelisim: gelisimSP,
      liderlik: liderlikSP,
      etkinlik: etkinlikSP,
      devam: devamSP,
    },
    bonuses: {
      davranisBonus,
      teknikBonus,
      fizikselBonus,
      taktikselBonus,
      zihinselBonus,
      genelOrtalamaBonus,
    },
    recentCoachObservations,
  };
}

/**
 * Returns a dynamically balanced SporcuKarne where scores incorporate the live SporPuan bonuses
 */
export function getDynamicKarne(karne: SporcuKarne): SporcuKarne & { sporpuanImpact: SporPuanKarneImpact } {
  const impact = calculateSporPuanImpact({
    id: karne.id,
    sporcuId: karne.sporcuId,
    name: karne.adSoyad,
  });

  const clamp = (val: number, max = 10) => Math.min(max, Math.max(1, Number(val.toFixed(1))));

  // Dynamic Technical
  const dynTeknikOrt = clamp(karne.teknik.ortalama + impact.bonuses.teknikBonus);
  const dynTeknik = {
    ...karne.teknik,
    topKontrolu: karne.teknik.topKontrolu !== undefined ? clamp(karne.teknik.topKontrolu + impact.bonuses.teknikBonus) : undefined,
    pasBasarisi: karne.teknik.pasBasarisi !== undefined ? clamp(karne.teknik.pasBasarisi + impact.bonuses.teknikBonus) : undefined,
    sut: karne.teknik.sut !== undefined ? clamp(karne.teknik.sut + impact.bonuses.teknikBonus) : undefined,
    topSurme: karne.teknik.topSurme !== undefined ? clamp(karne.teknik.topSurme + impact.bonuses.teknikBonus) : undefined,
    savunma: karne.teknik.savunma !== undefined ? clamp(karne.teknik.savunma + impact.bonuses.teknikBonus) : undefined,
    ortalama: dynTeknikOrt,
  };

  // Dynamic Physical
  const dynFizikselOrt = clamp(karne.fiziksel.ortalama + impact.bonuses.fizikselBonus);
  const dynFiziksel = {
    ...karne.fiziksel,
    hiz: karne.fiziksel.hiz !== undefined ? clamp(karne.fiziksel.hiz + impact.bonuses.fizikselBonus) : undefined,
    dayaniklilik: karne.fiziksel.dayaniklilik !== undefined ? clamp(karne.fiziksel.dayaniklilik + impact.bonuses.fizikselBonus) : undefined,
    guc: karne.fiziksel.guc !== undefined ? clamp(karne.fiziksel.guc + impact.bonuses.fizikselBonus) : undefined,
    ceviklik: karne.fiziksel.ceviklik !== undefined ? clamp(karne.fiziksel.ceviklik + impact.bonuses.fizikselBonus) : undefined,
    ortalama: dynFizikselOrt,
  };

  // Dynamic Tactical
  const dynTaktikselOrt = clamp(karne.taktiksel.ortalama + impact.bonuses.taktikselBonus);
  const dynTaktiksel = {
    ...karne.taktiksel,
    oyunZekasi: karne.taktiksel.oyunZekasi !== undefined ? clamp(karne.taktiksel.oyunZekasi + impact.bonuses.taktikselBonus) : undefined,
    pozisyonAlma: karne.taktiksel.pozisyonAlma !== undefined ? clamp(karne.taktiksel.pozisyonAlma + impact.bonuses.taktikselBonus) : undefined,
    kararVerme: karne.taktiksel.kararVerme !== undefined ? clamp(karne.taktiksel.kararVerme + impact.bonuses.taktikselBonus) : undefined,
    ortalama: dynTaktikselOrt,
  };

  // Dynamic Mental
  const dynZihinselOrt = clamp(karne.zihinsel.ortalama + impact.bonuses.zihinselBonus);
  const dynZihinsel = {
    ...karne.zihinsel,
    disiplin: karne.zihinsel.disiplin !== undefined ? clamp(karne.zihinsel.disiplin + impact.bonuses.zihinselBonus) : undefined,
    ozguven: karne.zihinsel.ozguven !== undefined ? clamp(karne.zihinsel.ozguven + impact.bonuses.zihinselBonus) : undefined,
    takimUyumu: karne.zihinsel.takimUyumu !== undefined ? clamp(karne.zihinsel.takimUyumu + impact.bonuses.zihinselBonus) : undefined,
    liderlik: karne.zihinsel.liderlik !== undefined ? clamp(karne.zihinsel.liderlik + impact.bonuses.zihinselBonus) : undefined,
    ortalama: dynZihinselOrt,
  };

  // Dynamic Behavioral
  const baseKriterler = karne.davranissal?.kriterler || {
    fairPlay: 8,
    sorumlulukEkipman: 8,
    saygiIletisim: 8,
    yonergeyeUyum: 8,
    duyguKontrolu: 8,
    ortalama: 8,
  };

  const dynDavranisOrt = clamp(baseKriterler.ortalama + impact.bonuses.davranisBonus);
  const dynDavranissalKriterler = {
    ...baseKriterler,
    fairPlay: clamp(baseKriterler.fairPlay + impact.bonuses.davranisBonus),
    sorumlulukEkipman: clamp(baseKriterler.sorumlulukEkipman + (impact.bonuses.davranisBonus * 0.8)),
    saygiIletisim: clamp(baseKriterler.saygiIletisim + impact.bonuses.davranisBonus),
    yonergeyeUyum: clamp(baseKriterler.yonergeyeUyum + (impact.bonuses.davranisBonus * 0.7)),
    duyguKontrolu: clamp(baseKriterler.duyguKontrolu + (impact.bonuses.davranisBonus * 0.9)),
    ortalama: dynDavranisOrt,
  };

  return {
    ...karne,
    teknik: dynTeknik,
    fiziksel: dynFiziksel,
    taktiksel: dynTaktiksel,
    zihinsel: dynZihinsel,
    davranissal: {
      ...karne.davranissal,
      kriterler: dynDavranissalKriterler,
    },
    sporpuanImpact: impact,
  };
}

/**
 * Directly synchronizes a Quick Point award into the Athlete's Karne (adding timeline item & triggering live updates)
 */
export function syncQuickPointToKarne(
  sporcuId: string,
  sporcuName: string,
  category: 'Davranış' | 'Gelişim' | 'Liderlik' | 'Etkinlik' | string,
  ruleTitle: string,
  points: number,
  note?: string
) {
  if (typeof window === 'undefined') return;

  try {
    const karneler = getStoredKarneler();
    const updated = karneler.map((k) => {
      const match =
        k.sporcuId === sporcuId ||
        k.id === sporcuId ||
        k.adSoyad.toLowerCase() === sporcuName.toLowerCase();

      if (!match) return k;

      // Add a dynamic observation step to process tracking
      const newStep = {
        donem: 'Canlı Saha Gözlemi (Hızlı Puan)',
        tarih: new Date().toISOString().split('T')[0],
        durum: (points >= 50 ? 'Örnek Davranış' : 'Hedefe Ulaştı') as 'Gelişiyor' | 'Hedefe Ulaştı' | 'Örnek Davranış',
        odakKonusu: `${ruleTitle} (+${points} SP)`,
        gozlem: note
          ? `${note} (Hızlı Puan: +${points} SP ile taltif edildi)`
          : `Antrenör tarafından sahada '${ruleTitle}' kazanımı için +${points} SP tanımlandı.`,
      };

      const surecTakibi = k.davranissal?.surecTakibi ? [newStep, ...k.davranissal.surecTakibi] : [newStep];

      // If note exists, also enrich trainer notes
      const antrenorNotuEnriched = note
        ? `${k.antrenorNotu} [Son Gözlem: ${note}]`
        : k.antrenorNotu;

      return {
        ...k,
        antrenorNotu: antrenorNotuEnriched,
        davranissal: {
          ...k.davranissal,
          surecTakibi,
        },
      };
    });

    saveStoredKarneler(updated);

    // Notify all listening views
    window.dispatchEvent(new CustomEvent('sportsfly_sporpuan_updated', {
      detail: { sporcuId, sporcuName, category, points, ruleTitle, note }
    }));
  } catch (err) {
    console.error('Failed to sync quick point to karne', err);
  }
}
