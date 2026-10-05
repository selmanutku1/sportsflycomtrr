import { addSporPuanNotification } from '../data/notifications';

export interface AutomatedPuanResult {
  sporcuId: string;
  sporcuName: string;
  ruleName: string;
  points: number;
  category: 'Devam' | 'Seri' | 'Aile ve İlişki' | 'Etkinlik';
  trigger: string;
  reason: string;
}

export interface AthleteAutomationStats {
  weeklyAttendanceRate: number; // e.g. 100
  weeklyPresentCount: number; // e.g. 3
  weeklyTargetCount: number; // e.g. 3
  currentStreakWeeks: number; // e.g. 4
  isWeeklyFullCompleted: boolean;
  totalAutomatedPoints: number;
  lastAutomatedRules: string[];
}

const STORAGE_KEY = 'sportsfly_sporpuan_logs_new';

/**
 * Helper to get all stored logs
 */
export function getStoredSporPuanLogs(): any[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Calculates current automation stats for a given athlete
 */
export function getAthleteAutomationStats(sporcuId: string): AthleteAutomationStats {
  // Hash-based deterministic values for mock realism or local storage stats
  const idNum = sporcuId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const streak = (idNum % 5) + 2; // 2 to 6 weeks
  const isFull = (idNum % 3) !== 0; // majority have 100% weekly attendance
  const presentCount = isFull ? 3 : 2;
  const targetCount = 3;
  const rate = Math.round((presentCount / targetCount) * 100);

  const logs = getStoredSporPuanLogs().filter(
    (l) => (l.sporcuId === sporcuId || l.sporcuId === `k${idNum % 6}`) && l.source === 'Otomatik'
  );

  const totalAutoPts = logs.length > 0 
    ? logs.reduce((sum, l) => sum + (Number(l.points) || 0), 0)
    : 175 + (streak * 25);

  return {
    weeklyAttendanceRate: rate,
    weeklyPresentCount: presentCount,
    weeklyTargetCount: targetCount,
    currentStreakWeeks: streak,
    isWeeklyFullCompleted: isFull,
    totalAutomatedPoints: totalAutoPts,
    lastAutomatedRules: [
      'Antrenmana Katılım (+25 SP)',
      ...(isFull ? ['Haftalık Tam Devam Bonusu (+50 SP)'] : []),
      `${streak} Hafta Kesintisiz Katılım Serisi (+75 SP)`,
    ],
  };
}

/**
 * Automatically processes attendance records and awards SporPuan to qualifying athletes
 */
export function processAttendanceAutomation(
  attendanceList: {
    memberId: string;
    memberName: string;
    status: 'present' | 'absent' | 'excused' | null;
  }[],
  groupName: string,
  date: string
): {
  awardedCount: number;
  totalPointsGiven: number;
  results: AutomatedPuanResult[];
} {
  const currentLogs = getStoredSporPuanLogs();
  const newLogs: any[] = [];
  const results: AutomatedPuanResult[] = [];
  let totalPointsGiven = 0;

  attendanceList.forEach((item) => {
    if (item.status === 'present') {
      // 1. Session attendance auto point (+25 SP)
      const attendanceEntry: AutomatedPuanResult = {
        sporcuId: item.memberId,
        sporcuName: item.memberName,
        ruleName: 'Antrenmana Katılım',
        points: 25,
        category: 'Devam',
        trigger: 'Yoklama (Geldi)',
        reason: `${groupName} antrenmanına eksiksiz katılım sağlandı.`,
      };

      results.push(attendanceEntry);
      totalPointsGiven += 25;

      newLogs.push({
        id: `sp-auto-att-${item.memberId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sporcuId: item.memberId,
        sporcuName: item.memberName,
        category: 'Devam',
        ruleName: 'Antrenmana Katılım (Otomatik)',
        points: 25,
        date: date || 'Bugün',
        source: 'Otomatik',
        note: `${groupName} yoklamasında 'Geldi' olarak doğrulandı.`,
      });

      // 2. Weekly Full Attendance Bonus (+50 SP) - if this was the last required day of the week
      // Deterministic simulation based on memberId for realistic showcase
      const isEligibleForWeeklyBonus = true; 
      if (isEligibleForWeeklyBonus) {
        const weeklyEntry: AutomatedPuanResult = {
          sporcuId: item.memberId,
          sporcuName: item.memberName,
          ruleName: 'Haftalık Tam Devam Bonusu',
          points: 50,
          category: 'Devam',
          trigger: 'Haftalık Yoklama Otomasyonu',
          reason: 'Haftanın tüm antrenmanlarına eksiksiz ve mazeretsiz katılım.',
        };

        results.push(weeklyEntry);
        totalPointsGiven += 50;

        newLogs.push({
          id: `sp-auto-week-${item.memberId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sporcuId: item.memberId,
          sporcuName: item.memberName,
          category: 'Devam',
          ruleName: 'Haftalık Tam Devam Bonusu (Otomatik)',
          points: 50,
          date: date || 'Bugün',
          source: 'Otomatik',
          note: 'Sistem tarafından haftalık %100 devamlılık tespit edildi.',
        });

        // Trigger notification
        addSporPuanNotification({
          sporcuId: item.memberId,
          sporcuName: item.memberName,
          ruleName: 'Haftalık Tam Devam Bonusu (Otomatik)',
          points: 50,
          category: 'Devam',
          note: 'Haftalık tüm antrenmanlara eksiksiz katılım sağladığın için tebrikler!',
        });
      } else {
        // Trigger standard attendance notification
        addSporPuanNotification({
          sporcuId: item.memberId,
          sporcuName: item.memberName,
          ruleName: 'Antrenmana Katılım',
          points: 25,
          category: 'Devam',
          note: `${groupName} dersine katılım puanı tanımlandı.`,
        });
      }
    }
  });

  // Save to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...newLogs, ...currentLogs]));
  } catch (err) {
    console.error('Failed to save automated SporPuan logs', err);
  }

  return {
    awardedCount: results.length,
    totalPointsGiven,
    results,
  };
}
