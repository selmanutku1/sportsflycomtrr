import * as XLSX from 'xlsx';
import { secureFetch, sanitizeSpreadsheetCell } from '../utils/securityCore';

export interface LabParameterRow {
  id: string;
  name: string;
  unit: string;
  description: string;
  m1: number;
  m2: number;
  m3: number;
  percentile: number;
  status: 'düşük' | 'normal' | 'uzun' | 'yüksek' | 'mükemmel' | 'desteklenmeli' | 'iyi';
  sd: number;
  refLow: number;
  refMid: number;
  refHigh: number;
  lowerIsBetter?: boolean; // e.g., sprint time
}

export interface IpsativeTargetRow {
  parameter: string;
  unit: string;
  m1: number;
  m2: number;
  m3: number;
  target: number;
  groupRank: string;
}

export interface LabAiImprovementItem {
  metricName: string;
  category: string;
  currentValue: string;
  targetValue: string;
  percentile: number;
  sd: number;
  priority: string;
  analysis: string;
  drillRecommendation: string;
  weeklyFrequency: string;
}

export interface LabAiStrengthItem {
  metricName: string;
  currentValue: string;
  percentile: number;
  insight: string;
}

export interface LabAiPrescriptionItem {
  focusArea: string;
  microcycleGoal: string;
  recommendedDrills: string[];
  loadNote: string;
}

export interface LabAiPerformanceAnalysis {
  overallSummary: string;
  readinessScore: number;
  improvementAreas: LabAiImprovementItem[];
  strengths: LabAiStrengthItem[];
  trainingPrescription: LabAiPrescriptionItem[];
  nutritionAndRecoveryTip: string;
  generatedAt: string;
  source?: 'gemini-ai' | 'auto-engine';
}

export interface SportsFlyLabSchoolBranding {
  schoolName: string;
  branchName: string;
  logoDataUrl: string;
  updatedAt?: string;
}

export interface SportsFlyLabArchivedReport {
  archiveId: string;
  archiveTitle: string;
  archiveNote?: string;
  savedAt: string;
  savedTimestamp: number;
  reportSnapshot: SportsFlyLabReport;
}

export interface SportsFlyLabReport {
  id: string;
  athleteName: string;
  athleteCode: string;
  clubName: string;
  branchName: string;
  clubLogoUrl?: string;
  sportBranch: string;
  gender: 'Erkek' | 'Kadın';
  ageYears: number;
  ageMonths: number;
  date1: string;
  date2: string;
  date3: string;
  nextTargetDate: string;

  // Page 1: Body Composition & PHV Summary
  bodyComposition: LabParameterRow[];
  phvAge: number;
  phvHeight: number;
  predictedAdultHeight: number;
  sittingHeight: number;
  maturationStatus: string;

  // Page 2: Motor Performance & Overall Score Progression
  motorPerformance: LabParameterRow[];
  scoreHistory: {
    p1Date: string;
    p1Score: number;
    p2Date: string;
    p2Score: number;
    p3Date: string;
    p3Score: number;
  };

  // Page 3: Somatotype (Heath-Carter) & Potential Vector
  somatotype: {
    m1: { endo: number; meso: number; ecto: number; category: string };
    m2: { endo: number; meso: number; ecto: number; category: string };
    m3: { endo: number; meso: number; ecto: number; category: string };
    eliteRef: { sport: string; endo: number; meso: number; ecto: number; refScore: number };
  };
  potential: {
    directionDeg: number;
    speedScore: number;
    strengthScore: number;
    enduranceScore: number;
    dominantType: string;
  };

  // Page 4: Cardiorespiratory (PACER / VO2peak) & Anaerobic Power
  cardio: {
    test1Distance: number;
    test1Shuttles: number;
    test1Vo2: number;
    test1Status: string;
    test2Distance: number;
    test2Shuttles: number;
    test2Vo2: number;
    test2Status: string;
    test3Distance: number;
    test3Shuttles: number;
    test3Vo2: number;
    test3Status: string;
    totalRunTime: string;
    basalMetabolicRate: number; // kcal/day
    functionalCapacityMet: number; // MET
    maxHeartRate: number; // bpm
    verticalJumpAnaerobicWatt: number;
    verticalJumpRelativeWatt: number;
    sprint20mAnaerobicWatt: number;
    sprint20mRelativeWatt: number;
  };

  // Page 5: Ipsative Targets, Group Rankings & Expert Evaluation
  ipsativeTargets: IpsativeTargetRow[];
  groupInfo: {
    groupNo: number;
    ageRange: string;
    groupAthleteCount: number;
    groupRank: number;
    totalAthleteCount: number;
    totalRank: number;
    groupAverageScore?: number;
    groupPositionPercentile?: number;
  };
  expertComment: string;
  aiRecommendations?: LabAiPerformanceAnalysis;
}

export const DEFAULT_LAB_REPORTS: SportsFlyLabReport[] = [
  {
    id: 'lab-rep-1',
    athleteName: 'Ege Örnektir',
    athleteCode: 'SF-2026-108',
    clubName: 'ATAŞEHİR SPOR OKULLARI',
    branchName: 'Ataşehir Merkez',
    sportBranch: 'Voleybol / Çoklu Branş Gelişim',
    gender: 'Kadın',
    ageYears: 10.19,
    ageMonths: 122.3,
    date1: '01.02.2026',
    date2: '10.05.2026',
    date3: '10.08.2026',
    nextTargetDate: '08.11.2026',
    phvAge: 12.84,
    phvHeight: 165.8,
    predictedAdultHeight: 172.72,
    sittingHeight: 76.3,
    maturationStatus: 'Geç Ergen (Normal Büyüme Hızı)',
    bodyComposition: [
      {
        id: 'bmi',
        name: 'Beden Kütle İndeksi',
        unit: 'kg/m²',
        description: 'Yüksek BKİ olumsuz kardiyovasküler profil ile ilişkilidir. BKİ yüksek olarak değerlendirilmiştir.',
        m1: 19.82,
        m2: 19.30,
        m3: 19.33,
        percentile: 85,
        status: 'yüksek',
        sd: 1.04,
        refLow: 13.6,
        refMid: 16.7,
        refHigh: 22.8,
      },
      {
        id: 'height',
        name: 'Boy Uzunluğu',
        unit: 'cm',
        description: 'Sporcunun boy uzunluğu yaşıtlarına göre uzun (avantajlı) olarak değerlendirilmiştir.',
        m1: 142.6,
        m2: 146.1,
        m3: 149.5,
        percentile: 93,
        status: 'uzun',
        sd: 1.46,
        refLow: 127.2,
        refMid: 140.1,
        refHigh: 153.0,
      },
      {
        id: 'weight',
        name: 'Ağırlık',
        unit: 'kg',
        description: 'Sporcunun vücut ağırlığı sağlıklı fiziksel uygunluk bölgesinde (normal) değerlendirilmiştir.',
        m1: 40.3,
        m2: 41.2,
        m3: 43.2,
        percentile: 87,
        status: 'normal',
        sd: 1.14,
        refLow: 24.0,
        refMid: 33.7,
        refHigh: 54.3,
      },
      {
        id: 'body_fat',
        name: 'Beden Yağ %',
        unit: '%',
        description: 'Slaughter formülü deri altı yağ tahmini. Yüksek yağ yüzdesi dayanıklılık ve sıçrama verimini etkiler.',
        m1: 27.4,
        m2: 29.6,
        m3: 33.8,
        percentile: 97,
        status: 'yüksek',
        sd: 1.83,
        refLow: 16.0,
        refMid: 22.9,
        refHigh: 35.2,
      },
      {
        id: 'subscapula',
        name: 'Subscapula D.K.K.',
        unit: 'mm',
        description: 'Bedenin sırt bölgesindeki deri altı yağ oranını gösteren antropometrik ölçümdür.',
        m1: 16.8,
        m2: 14.4,
        m3: 9.2,
        percentile: 44,
        status: 'normal',
        sd: -0.15,
        refLow: 5.1,
        refMid: 9.7,
        refHigh: 26.1,
      },
      {
        id: 'triceps',
        name: 'Triceps D.K.K.',
        unit: 'mm',
        description: 'Üst kol arka bölgesi deri altı yağ kalınlığı ölçümüdür.',
        m1: 16.4,
        m2: 20.4,
        m3: 17.0,
        percentile: 61,
        status: 'normal',
        sd: 0.27,
        refLow: 8.4,
        refMid: 15.5,
        refHigh: 31.6,
      },
      {
        id: 'calf_skf',
        name: 'Calf D.K.K.',
        unit: 'mm',
        description: 'Baldırın iç yüzeyinde en geniş çevre seviyesinden alınan deri kıvrım ölçümüdür.',
        m1: 20.2,
        m2: 19.8,
        m3: 30.0,
        percentile: 93,
        status: 'yüksek',
        sd: 1.50,
        refLow: 9.5,
        refMid: 20.2,
        refHigh: 33.6,
      },
      {
        id: 'supraspinal',
        name: 'Supraspinal D.K.K.',
        unit: 'mm',
        description: 'Kalça üstü yan karın deri altı yağ kalınlığını izlemede kullanılır.',
        m1: 20.2,
        m2: 16.4,
        m3: 19.2,
        percentile: 91,
        status: 'yüksek',
        sd: 1.33,
        refLow: 4.0,
        refMid: 10.8,
        refHigh: 25.2,
      },
      {
        id: 'humerus',
        name: 'Humerus Çap',
        unit: 'cm',
        description: 'Üst ekstremite kemik gelişimi ve iskelet sağlamlığının (mezomorfi) belirlenmesinde kullanılır.',
        m1: 5.6,
        m2: 5.9,
        m3: 6.2,
        percentile: 98,
        status: 'yüksek',
        sd: 2.13,
        refLow: 4.7,
        refMid: 5.5,
        refHigh: 6.2,
      },
      {
        id: 'femur',
        name: 'Femur Çap',
        unit: 'cm',
        description: 'Alt ekstremite diz eklemi kemik genişliği ve büyüme takibinde kullanılır.',
        m1: 8.7,
        m2: 9.0,
        m3: 9.1,
        percentile: 79,
        status: 'normal',
        sd: 0.80,
        refLow: 7.2,
        refMid: 8.6,
        refHigh: 9.9,
      },
      {
        id: 'calf_girth',
        name: 'Calf Çevre',
        unit: 'cm',
        description: 'Alt bacak kas çevresi gelişimini ve patlayıcı kuvvet potansiyelini izlemede kullanılır.',
        m1: 30.6,
        m2: 32.8,
        m3: 31.1,
        percentile: 90,
        status: 'yüksek',
        sd: 1.27,
        refLow: 21.4,
        refMid: 27.5,
        refHigh: 33.1,
      },
      {
        id: 'biceps_girth',
        name: 'Biceps Çevre',
        unit: 'cm',
        description: 'Üst kol fleksiyonda kas çevresi ölçümüdür, üst gövde kas kütlesini yansıtır.',
        m1: 22.6,
        m2: 23.0,
        m3: 22.3,
        percentile: 78,
        status: 'normal',
        sd: 0.77,
        refLow: 15.9,
        refMid: 20.3,
        refHigh: 25.8,
      },
    ],
    motorPerformance: [
      {
        id: 'sprint',
        name: 'Sürat Testi (20m)',
        unit: 'sn',
        description: 'Anaerobik kapasite, ivmelenme ve maksimal hız yeteneği değerlendirilmiştir.',
        m1: 4.12,
        m2: 3.95,
        m3: 3.85,
        percentile: 89,
        status: 'yüksek',
        sd: 1.25,
        refLow: 5.12,
        refMid: 4.29,
        refHigh: 3.63,
        lowerIsBetter: true,
      },
      {
        id: 'agility',
        name: 'Çabukluk Testi (10x5m)',
        unit: 'sn',
        description: 'Hareket hızı, çeviklik, koordinasyon ve 180° yön değiştirme yeteneği değerlendirilmiştir.',
        m1: 24.1,
        m2: 19.5,
        m3: 20.3,
        percentile: 95,
        status: 'yüksek',
        sd: 1.61,
        refLow: 27.99,
        refMid: 23.42,
        refHigh: 19.85,
        lowerIsBetter: true,
      },
      {
        id: 'reaction',
        name: 'Reaksiyon Sürati Testi',
        unit: 'sn',
        description: 'Üst beden reaksiyon süresi ve el-göz koordinasyonu değerlendirilmiştir.',
        m1: 12.0,
        m2: 11.5,
        m3: 11.7,
        percentile: 89,
        status: 'yüksek',
        sd: 1.23,
        refLow: 17.90,
        refMid: 13.68,
        refHigh: 10.86,
        lowerIsBetter: true,
      },
      {
        id: 'back_strength',
        name: 'Sırt Kuvveti',
        unit: 'kg/m',
        description: 'İzometrik kas kasılması ile gövde ve sırt ekstansör kuvveti değerlendirilmiştir.',
        m1: 32.5,
        m2: 28.0,
        m3: 43.0,
        percentile: 62,
        status: 'normal',
        sd: 0.30,
        refLow: 22.75,
        refMid: 39.56,
        refHigh: 61.13,
      },
      {
        id: 'grip_strength',
        name: 'Kavrama Kuvveti',
        unit: 'kg/m',
        description: 'El ve ön kol kaslarının maksimum izometrik kavrama kuvveti değerlendirilmiştir.',
        m1: 19.0,
        m2: 19.9,
        m3: 23.8,
        percentile: 98,
        status: 'mükemmel',
        sd: 2.13,
        refLow: 9.68,
        refMid: 15.94,
        refHigh: 23.29,
      },
      {
        id: 'standing_long_jump',
        name: 'Durarak Uzun Atlama',
        unit: 'cm',
        description: 'Alt ve üst beden koordinasyonu ile yatay patlayıcı bacak gücü değerlendirilmiştir.',
        m1: 123,
        m2: 140,
        m3: 147,
        percentile: 78,
        status: 'normal',
        sd: 0.79,
        refLow: 88.14,
        refMid: 129.68,
        refHigh: 174.72,
      },
      {
        id: 'vertical_jump',
        name: 'Dikey Sıçrama Testi',
        unit: 'cm',
        description: 'Alt beden dikey patlayıcı kuvveti ve bacak kas gücü değerlendirilmiştir.',
        m1: 16.8,
        m2: 20.4,
        m3: 27.0,
        percentile: 91,
        status: 'yüksek',
        sd: 1.33,
        refLow: 11.18,
        refMid: 20.27,
        refHigh: 30.53,
      },
      {
        id: 'balance',
        name: 'Denge Testi',
        unit: 'sn',
        description: 'Dinamik dengenin yanı sıra bacak, pelvik ve gövde stabilizasyon gücü değerlendirilmiştir.',
        m1: 28,
        m2: 93,
        m3: 19,
        percentile: 19,
        status: 'normal',
        sd: -0.89,
        refLow: 1.0,
        refMid: 50.0,
        refHigh: 100.0,
      },
      {
        id: 'flexibility',
        name: 'Esneklik Testi',
        unit: 'cm',
        description: 'Sırt ve hamstring kaslarının esnekliğini ölçer. Yaralanma önleme ve postür için kritiktir.',
        m1: 37.0,
        m2: 40.0,
        m3: 40.5,
        percentile: 100,
        status: 'mükemmel',
        sd: 2.78,
        refLow: 3.56,
        refMid: 18.0,
        refHigh: 34.03,
      },
      {
        id: 'aerobic',
        name: 'Aerobik Kapasite Testi',
        unit: 'ml/kg/dk',
        description: 'Maksimal oksijen tüketimi (VO2peak) ve aerobik dayanıklılık kondisyonu değerlendirilmiştir.',
        m1: 23.0,
        m2: 30.3,
        m3: 35.0,
        percentile: 27,
        status: 'normal',
        sd: -0.63,
        refLow: 28.61,
        refMid: 39.0,
        refHigh: 60.59,
      },
    ],
    scoreHistory: {
      p1Date: '01.02.2026',
      p1Score: 64,
      p2Date: '10.05.2026',
      p2Score: 76,
      p3Date: '10.08.2026',
      p3Score: 88,
    },
    somatotype: {
      m1: { endo: 6.8, meso: 4.4, ecto: 1.9, category: 'Mezomorfik Endomorfi' },
      m2: { endo: 6.3, meso: 4.7, ecto: 2.4, category: 'Mezomorfik Endomorfi' },
      m3: { endo: 5.5, meso: 4.1, ecto: 2.6, category: 'Mezomorfik Endomorfi' },
      eliteRef: { sport: 'Elit Voleybol', endo: 3.9, meso: 2.2, ecto: 3.4, refScore: 94 },
    },
    potential: {
      directionDeg: 125,
      speedScore: 4.6,
      strengthScore: 4.1,
      enduranceScore: 1.32,
      dominantType: 'Throwing Power & Patlayıcı Kuvvet',
    },
    cardio: {
      test1Distance: 300,
      test1Shuttles: 15,
      test1Vo2: 23.0,
      test1Status: 'Zayıf',
      test2Distance: 680,
      test2Shuttles: 34,
      test2Vo2: 30.3,
      test2Status: 'Ortalama',
      test3Distance: 940,
      test3Shuttles: 47,
      test3Vo2: 35.0,
      test3Status: 'İyi (Healthy Fitness Zone)',
      totalRunTime: '00:05:53',
      basalMetabolicRate: 1291,
      functionalCapacityMet: 10,
      maxHeartRate: 210,
      verticalJumpAnaerobicWatt: 365,
      verticalJumpRelativeWatt: 9.0,
      sprint20mAnaerobicWatt: 303,
      sprint20mRelativeWatt: 7.0,
    },
    ipsativeTargets: [
      { parameter: 'Esneklik', unit: 'cm', m1: 36.5, m2: 39.5, m3: 40.5, target: 42.19, groupRank: '20/4' },
      { parameter: 'Kavrama Kuvveti', unit: 'kg/m', m1: 19.0, m2: 19.9, m3: 23.8, target: 24.6, groupRank: '20/3' },
      { parameter: 'Sırt Kuvveti', unit: 'kg/m', m1: 32.5, m2: 28.0, m3: 42.5, target: 47.62, groupRank: '20/8' },
      { parameter: 'Durarak Uzun Atlama', unit: 'cm', m1: 123, m2: 140, m3: 147, target: 156, groupRank: '20/3' },
      { parameter: 'Aerobik Kapasite', unit: 'ml/kg/dk', m1: 23.01, m2: 30.3, m3: 35.0, target: 39.91, groupRank: '20/11' },
      { parameter: 'Dikey Sıçrama', unit: 'cm', m1: 16.78, m2: 20.41, m3: 26.97, target: 29.87, groupRank: '20/9' },
    ],
    groupInfo: {
      groupNo: 3,
      ageRange: '10,02 - 10,99 Yaş',
      groupAthleteCount: 15,
      groupRank: 1,
      totalAthleteCount: 160,
      totalRank: 1,
      groupAverageScore: 72,
      groupPositionPercentile: 94,
    },
    expertComment:
      'Sporcumuzun 3 ölçüm periyodundaki genel sportif performans skoru %50 seviyesinden %75 seviyesine yükselmiştir. Sürat (%89), Çabukluk (%95), Kavrama Kuvveti (%98), Dikey Sıçrama (%91) ve Esneklik (%100) parametrelerinde yaşıtlarının oldukça üzerinde elit bir profil sergilemektedir. Somatotip analizinde endomorfi bileşeni 6,8\'den 5,5\'e gerileyerek sağlıklı kas-iskelet dengesine yaklaşmıştır. Aerobik dayanıklılık (VO2peak: 35,0 ml/kg/dk) ve tek ayak dinamik denge egzersizlerinin haftalık antrenman programında desteklenmesi, 12,84 PHV büyüme atağı öncesinde atletik potansiyelini maksimuma çıkaracaktır.',
  },
  {
    id: 'lab-rep-2',
    athleteName: 'Kaan Yıldırım',
    athleteCode: 'SF-2026-101',
    clubName: 'SPORTSFLY AKADEMİ',
    branchName: 'Kadıköy Merkez',
    sportBranch: 'Basketbol U14 Altyapı',
    gender: 'Erkek',
    ageYears: 12.4,
    ageMonths: 148.8,
    date1: '15.01.2026',
    date2: '15.04.2026',
    date3: '15.08.2026',
    nextTargetDate: '15.11.2026',
    phvAge: 13.6,
    phvHeight: 174.5,
    predictedAdultHeight: 186.4,
    sittingHeight: 83.2,
    maturationStatus: 'Zamanında Olgunlaşan (Ortalama PHV)',
    bodyComposition: [
      {
        id: 'bmi',
        name: 'Beden Kütle İndeksi',
        unit: 'kg/m²',
        description: 'Yaş grubuna göre ideal atletik beden kütle indeksi aralığındadır.',
        m1: 18.4,
        m2: 18.6,
        m3: 18.8,
        percentile: 64,
        status: 'normal',
        sd: 0.42,
        refLow: 14.5,
        refMid: 18.2,
        refHigh: 23.4,
      },
      {
        id: 'height',
        name: 'Boy Uzunluğu',
        unit: 'cm',
        description: 'Basketbol branşı için 95. persentil üzerinde üstün boy uzunluğu.',
        m1: 158.0,
        m2: 161.2,
        m3: 164.5,
        percentile: 96,
        status: 'uzun',
        sd: 1.78,
        refLow: 138.0,
        refMid: 152.0,
        refHigh: 166.0,
      },
      {
        id: 'weight',
        name: 'Ağırlık',
        unit: 'kg',
        description: 'Boy uzunluğu ile uyumlu sağlıklı kas-kilo dengesi.',
        m1: 46.0,
        m2: 48.3,
        m3: 50.8,
        percentile: 78,
        status: 'normal',
        sd: 0.85,
        refLow: 32.0,
        refMid: 44.5,
        refHigh: 60.0,
      },
      {
        id: 'body_fat',
        name: 'Beden Yağ %',
        unit: '%',
        description: 'Atletik performans için optimal deri altı yağ yüzdesi.',
        m1: 16.8,
        m2: 15.4,
        m3: 14.2,
        percentile: 42,
        status: 'normal',
        sd: -0.25,
        refLow: 10.0,
        refMid: 16.5,
        refHigh: 26.0,
      },
      {
        id: 'subscapula',
        name: 'Subscapula D.K.K.',
        unit: 'mm',
        description: 'Sırt bölgesi deri kıvrım kalınlığı normal aralıktadır.',
        m1: 9.4,
        m2: 8.8,
        m3: 8.2,
        percentile: 40,
        status: 'normal',
        sd: -0.22,
        refLow: 4.5,
        refMid: 8.9,
        refHigh: 20.0,
      },
      {
        id: 'triceps',
        name: 'Triceps D.K.K.',
        unit: 'mm',
        description: 'Üst kol deri altı yağ kalınlığı optimal seviyededir.',
        m1: 11.2,
        m2: 10.5,
        m3: 9.8,
        percentile: 46,
        status: 'normal',
        sd: -0.10,
        refLow: 6.0,
        refMid: 11.0,
        refHigh: 24.0,
      },
      {
        id: 'calf_skf',
        name: 'Calf D.K.K.',
        unit: 'mm',
        description: 'Alt bacak deri altı yağ ölçümü sağlıklı aralıktadır.',
        m1: 12.0,
        m2: 11.4,
        m3: 10.6,
        percentile: 48,
        status: 'normal',
        sd: -0.05,
        refLow: 6.5,
        refMid: 12.0,
        refHigh: 25.0,
      },
      {
        id: 'supraspinal',
        name: 'Supraspinal D.K.K.',
        unit: 'mm',
        description: 'Göbek yanı deri kıvrım kalınlığı atletik sınırlar içerisindedir.',
        m1: 9.8,
        m2: 9.1,
        m3: 8.4,
        percentile: 45,
        status: 'normal',
        sd: -0.14,
        refLow: 4.0,
        refMid: 9.5,
        refHigh: 22.0,
      },
      {
        id: 'humerus',
        name: 'Humerus Çap',
        unit: 'cm',
        description: 'Dirsek kemik çapı gelişimi yaş normlarının üzerindedir.',
        m1: 6.1,
        m2: 6.3,
        m3: 6.5,
        percentile: 88,
        status: 'yüksek',
        sd: 1.20,
        refLow: 5.0,
        refMid: 5.9,
        refHigh: 6.8,
      },
      {
        id: 'femur',
        name: 'Femur Çap',
        unit: 'cm',
        description: 'Diz eklemi kemik genişliği güçlü alt ekstremite yapısını gösterir.',
        m1: 9.2,
        m2: 9.4,
        m3: 9.6,
        percentile: 86,
        status: 'yüksek',
        sd: 1.12,
        refLow: 7.8,
        refMid: 9.0,
        refHigh: 10.2,
      },
      {
        id: 'calf_girth',
        name: 'Calf Çevre',
        unit: 'cm',
        description: 'Gastrocnemius kas çevresi düzenli artış göstermektedir.',
        m1: 32.4,
        m2: 33.1,
        m3: 34.0,
        percentile: 84,
        status: 'normal',
        sd: 0.98,
        refLow: 24.0,
        refMid: 30.5,
        refHigh: 36.5,
      },
      {
        id: 'biceps_girth',
        name: 'Biceps Çevre',
        unit: 'cm',
        description: 'Üst kol fleksiyonda kas çevresi gelişimi pozitiftir.',
        m1: 24.1,
        m2: 24.8,
        m3: 25.6,
        percentile: 82,
        status: 'normal',
        sd: 0.91,
        refLow: 18.0,
        refMid: 22.5,
        refHigh: 28.0,
      },
    ],
    motorPerformance: [
      {
        id: 'sprint',
        name: 'Sürat Testi (20m)',
        unit: 'sn',
        description: 'Kısa mesafe ivmelenme ve sprint hızı.',
        m1: 3.78,
        m2: 3.65,
        m3: 3.52,
        percentile: 94,
        status: 'yüksek',
        sd: 1.55,
        refLow: 4.80,
        refMid: 4.05,
        refHigh: 3.45,
        lowerIsBetter: true,
      },
      {
        id: 'agility',
        name: 'Çabukluk Testi (10x5m)',
        unit: 'sn',
        description: 'Çok yönlü yön değiştirme ve saha içi çeviklik.',
        m1: 19.8,
        m2: 18.9,
        m3: 18.2,
        percentile: 96,
        status: 'mükemmel',
        sd: 1.75,
        refLow: 25.5,
        refMid: 21.2,
        refHigh: 18.0,
        lowerIsBetter: true,
      },
      {
        id: 'reaction',
        name: 'Reaksiyon Sürati Testi',
        unit: 'sn',
        description: 'Görsel uyaranlara verilen motor tepki hızı.',
        m1: 11.2,
        m2: 10.8,
        m3: 10.4,
        percentile: 92,
        status: 'yüksek',
        sd: 1.40,
        refLow: 16.5,
        refMid: 12.8,
        refHigh: 10.0,
        lowerIsBetter: true,
      },
      {
        id: 'back_strength',
        name: 'Sırt Kuvveti',
        unit: 'kg/m',
        description: 'Core ve sırt izometrik kuvvet kapasitesi.',
        m1: 48.0,
        m2: 52.5,
        m3: 58.0,
        percentile: 84,
        status: 'yüksek',
        sd: 1.02,
        refLow: 30.0,
        refMid: 46.0,
        refHigh: 68.0,
      },
      {
        id: 'grip_strength',
        name: 'Kavrama Kuvveti',
        unit: 'kg/m',
        description: 'Top hakimiyeti ve üst ekstremite izometrik kuvveti.',
        m1: 24.5,
        m2: 26.8,
        m3: 29.2,
        percentile: 95,
        status: 'mükemmel',
        sd: 1.68,
        refLow: 14.0,
        refMid: 22.0,
        refHigh: 31.0,
      },
      {
        id: 'standing_long_jump',
        name: 'Durarak Uzun Atlama',
        unit: 'cm',
        description: 'Patlayıcı alt ekstremite sıçrama mesafesi.',
        m1: 158,
        m2: 168,
        m3: 176,
        percentile: 90,
        status: 'yüksek',
        sd: 1.28,
        refLow: 110,
        refMid: 148,
        refHigh: 190,
      },
      {
        id: 'vertical_jump',
        name: 'Dikey Sıçrama Testi',
        unit: 'cm',
        description: 'Ribaund ve blok yüksekliği için kritik dikey sıçrama.',
        m1: 28.5,
        m2: 32.0,
        m3: 36.4,
        percentile: 95,
        status: 'mükemmel',
        sd: 1.64,
        refLow: 16.0,
        refMid: 26.5,
        refHigh: 38.0,
      },
      {
        id: 'balance',
        name: 'Denge Testi',
        unit: 'sn',
        description: 'Tek ayak proprioseptif denge süresi.',
        m1: 45,
        m2: 62,
        m3: 78,
        percentile: 82,
        status: 'yüksek',
        sd: 0.92,
        refLow: 10.0,
        refMid: 50.0,
        refHigh: 100.0,
      },
      {
        id: 'flexibility',
        name: 'Esneklik Testi',
        unit: 'cm',
        description: 'Hamstring ve lomber esneklik erişim mesafesi.',
        m1: 26.0,
        m2: 28.5,
        m3: 31.0,
        percentile: 86,
        status: 'yüksek',
        sd: 1.08,
        refLow: 8.0,
        refMid: 21.0,
        refHigh: 35.0,
      },
      {
        id: 'aerobic',
        name: 'Aerobik Kapasite Testi',
        unit: 'ml/kg/dk',
        description: 'Mekik koşusu VO2peak kardiyorespiratuar dayanıklılık.',
        m1: 41.2,
        m2: 44.8,
        m3: 48.5,
        percentile: 88,
        status: 'yüksek',
        sd: 1.18,
        refLow: 32.0,
        refMid: 42.0,
        refHigh: 58.0,
      },
    ],
    scoreHistory: {
      p1Date: '15.01.2026',
      p1Score: 68,
      p2Date: '15.04.2026',
      p2Score: 79,
      p3Date: '15.08.2026',
      p3Score: 88,
    },
    somatotype: {
      m1: { endo: 3.2, meso: 4.8, ecto: 3.6, category: 'Ektomorfik Mezomorfi' },
      m2: { endo: 2.9, meso: 5.1, ecto: 3.7, category: 'Ektomorfik Mezomorfi' },
      m3: { endo: 2.6, meso: 5.4, ecto: 3.8, category: 'Ektomorfik Mezomorfi' },
      eliteRef: { sport: 'Elit Basketbol', endo: 2.5, meso: 5.2, ecto: 3.9, refScore: 94 },
    },
    potential: {
      directionDeg: 105,
      speedScore: 4.8,
      strengthScore: 4.5,
      enduranceScore: 3.9,
      dominantType: 'Take-Off & Acceleration Power',
    },
    cardio: {
      test1Distance: 840,
      test1Shuttles: 42,
      test1Vo2: 41.2,
      test1Status: 'Ortalama Üstü',
      test2Distance: 1120,
      test2Shuttles: 56,
      test2Vo2: 44.8,
      test2Status: 'İyi',
      test3Distance: 1400,
      test3Shuttles: 70,
      test3Vo2: 48.5,
      test3Status: 'Mükemmel (Elit Bölge)',
      totalRunTime: '00:08:25',
      basalMetabolicRate: 1540,
      functionalCapacityMet: 13.8,
      maxHeartRate: 206,
      verticalJumpAnaerobicWatt: 520,
      verticalJumpRelativeWatt: 10.2,
      sprint20mAnaerobicWatt: 445,
      sprint20mRelativeWatt: 8.8,
    },
    ipsativeTargets: [
      { parameter: 'Esneklik', unit: 'cm', m1: 26.0, m2: 28.5, m3: 31.0, target: 33.5, groupRank: '15/3' },
      { parameter: 'Kavrama Kuvveti', unit: 'kg/m', m1: 24.5, m2: 26.8, m3: 29.2, target: 31.5, groupRank: '15/1' },
      { parameter: 'Sırt Kuvveti', unit: 'kg/m', m1: 48.0, m2: 52.5, m3: 58.0, target: 63.0, groupRank: '15/2' },
      { parameter: 'Durarak Uzun Atlama', unit: 'cm', m1: 158, m2: 168, m3: 176, target: 185, groupRank: '15/2' },
      { parameter: 'Aerobik Kapasite', unit: 'ml/kg/dk', m1: 41.2, m2: 44.8, m3: 48.5, target: 51.0, groupRank: '15/2' },
      { parameter: 'Dikey Sıçrama', unit: 'cm', m1: 28.5, m2: 32.0, m3: 36.4, target: 39.5, groupRank: '15/1' },
    ],
    groupInfo: {
      groupNo: 1,
      ageRange: '12,00 - 12,99 Yaş',
      groupAthleteCount: 15,
      groupRank: 1,
      totalAthleteCount: 160,
      totalRank: 1,
      groupAverageScore: 72,
      groupPositionPercentile: 94,
    },
    expertComment:
      'Kaan, U14 Basketbol altyapı grubumuzda %88 genel performans puanı ve %94 Elit Basketbol Somatotip uyumu ile kulübün en yüksek potansiyelli sporcularından biridir. 186,4 cm yetişkin boy tahmini ve yüksek dikey sıçrama gücü (36,4 cm) ile forvet/kanat pozisyonu için ideal fiziksel profile sahiptir.',
  },
];

const LAB_REPORTS_STORAGE_KEY = 'sportsfly_lab_reports_v1';
const LAB_SCHOOL_BRANDING_KEY = 'sportsfly_lab_school_branding_v1';
const LAB_ARCHIVE_STORAGE_KEY = 'sportsfly_lab_archive_v1';

export const DEFAULT_LAB_SCHOOL_BRANDING: SportsFlyLabSchoolBranding = {
  schoolName: 'ATAŞEHİR SPOR OKULLARI',
  branchName: 'Ataşehir Merkez Kampüsü',
  logoDataUrl: '',
};

export function getStoredLabSchoolBranding(): SportsFlyLabSchoolBranding {
  try {
    const raw = localStorage.getItem(LAB_SCHOOL_BRANDING_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          schoolName:
            typeof parsed.schoolName === 'string' && parsed.schoolName.trim()
              ? parsed.schoolName
              : DEFAULT_LAB_SCHOOL_BRANDING.schoolName,
          branchName:
            typeof parsed.branchName === 'string'
              ? parsed.branchName
              : DEFAULT_LAB_SCHOOL_BRANDING.branchName,
          logoDataUrl: typeof parsed.logoDataUrl === 'string' ? parsed.logoDataUrl : '',
          updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : undefined,
        };
      }
    }
  } catch (e) {
    console.error('Spor okulu kurumsal kimlik ayarları okunamadı:', e);
  }
  return DEFAULT_LAB_SCHOOL_BRANDING;
}

/**
 * Applies the persisted school branding (school name, branch/campus, and logo)
 * to a single athlete report card.
 */
export function applyBrandingToReport(
  report: SportsFlyLabReport,
  branding?: SportsFlyLabSchoolBranding
): SportsFlyLabReport {
  const activeBranding = branding || getStoredLabSchoolBranding();
  const cleanSchool = activeBranding.schoolName.trim() || report.clubName || DEFAULT_LAB_SCHOOL_BRANDING.schoolName;
  const cleanBranch = activeBranding.branchName.trim() || report.branchName || DEFAULT_LAB_SCHOOL_BRANDING.branchName;
  const cleanLogo = activeBranding.logoDataUrl || '';

  const isLegacyDefaultGroup =
    (report.id === 'lab-rep-1' || report.id === 'lab-rep-2') &&
    report.groupInfo?.groupAverageScore === undefined;

  const updatedGroupInfo = isLegacyDefaultGroup
    ? {
        ...report.groupInfo,
        groupAthleteCount: 15,
        groupRank: 1,
        totalRank: 1,
        groupAverageScore: 72,
        groupPositionPercentile: 94,
      }
    : {
        ...report.groupInfo,
        groupAverageScore: report.groupInfo?.groupAverageScore ?? 72,
        groupPositionPercentile:
          report.groupInfo?.groupPositionPercentile ??
          Math.min(
            99,
            Math.max(
              10,
              Math.round(
                (((report.groupInfo?.groupAthleteCount || 15) -
                  (report.groupInfo?.groupRank || 1) +
                  0.1) /
                  Math.max(1, report.groupInfo?.groupAthleteCount || 15)) *
                  100
              )
            )
          ),
      };

  const updatedScoreHistory =
    isLegacyDefaultGroup && report.scoreHistory?.p3Score === 75
      ? {
          ...report.scoreHistory,
          p1Score: 64,
          p2Score: 76,
          p3Score: 88,
        }
      : report.scoreHistory;

  const updatedSomatotype =
    report.id === 'lab-rep-1' && report.somatotype?.eliteRef?.refScore === 87
      ? {
          ...report.somatotype,
          eliteRef: {
            ...report.somatotype.eliteRef,
            refScore: 94,
          },
        }
      : report.somatotype;

  return {
    ...report,
    clubName: cleanSchool,
    branchName: cleanBranch,
    clubLogoUrl: cleanLogo,
    groupInfo: updatedGroupInfo,
    scoreHistory: updatedScoreHistory,
    somatotype: updatedSomatotype,
  };
}

/**
 * Applies the persisted school branding to a list of athlete report cards.
 */
export function applyBrandingToReports(
  reports: SportsFlyLabReport[],
  branding?: SportsFlyLabSchoolBranding
): SportsFlyLabReport[] {
  const activeBranding = branding || getStoredLabSchoolBranding();
  return reports.map((r) => applyBrandingToReport(r, activeBranding));
}

export function saveStoredLabSchoolBranding(branding: SportsFlyLabSchoolBranding): SportsFlyLabSchoolBranding {
  const stamped: SportsFlyLabSchoolBranding = {
    schoolName: branding.schoolName,
    branchName: branding.branchName,
    logoDataUrl: branding.logoDataUrl || '',
    updatedAt:
      branding.updatedAt ||
      new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
  };
  try {
    localStorage.setItem(LAB_SCHOOL_BRANDING_KEY, JSON.stringify(stamped));

    // Automatically sync persisted reports in localStorage so every existing & future report carries this branding
    const rawReports = localStorage.getItem(LAB_REPORTS_STORAGE_KEY);
    if (rawReports) {
      const parsedReports = JSON.parse(rawReports);
      if (Array.isArray(parsedReports) && parsedReports.length > 0) {
        const syncedReports = applyBrandingToReports(parsedReports, stamped);
        localStorage.setItem(LAB_REPORTS_STORAGE_KEY, JSON.stringify(syncedReports));
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('sportsfly_lab_branding_updated', { detail: stamped })
      );
    }
  } catch (e) {
    console.error('Spor okulu kurumsal kimlik ayarları kaydedilemedi:', e);
  }
  return stamped;
}

export function getStoredLabReports(): SportsFlyLabReport[] {
  const activeBranding = getStoredLabSchoolBranding();
  try {
    const raw = localStorage.getItem(LAB_REPORTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return applyBrandingToReports(parsed, activeBranding);
      }
    }
  } catch (e) {
    console.error('SportsFly Lab raporları yüklenemedi:', e);
  }
  return applyBrandingToReports(DEFAULT_LAB_REPORTS, activeBranding);
}

export function saveStoredLabReports(reports: SportsFlyLabReport[]): void {
  try {
    const activeBranding = getStoredLabSchoolBranding();
    const brandedReports = applyBrandingToReports(reports, activeBranding);
    localStorage.setItem(LAB_REPORTS_STORAGE_KEY, JSON.stringify(brandedReports));
  } catch (e) {
    console.error('SportsFly Lab raporları kaydedilemedi:', e);
  }
}

/**
 * Returns default initial archive items so the 'Karne Arşivi' tab has realistic saved examples out-of-the-box.
 */
function getDefaultLabArchives(): SportsFlyLabArchivedReport[] {
  const activeBranding = getStoredLabSchoolBranding();
  return DEFAULT_LAB_REPORTS.map((rawRep, idx) => {
    const branded = applyBrandingToReport(rawRep, activeBranding);
    return {
      archiveId: `lab-arch-default-${idx + 1}`,
      archiveTitle: `${branded.athleteName} — ${branded.date3} 3. Dönem Performans Karnesi`,
      archiveNote: `${branded.sportBranch} · Genel Performans Puanı: %${branded.scoreHistory.p3Score}`,
      savedAt: `${branded.date3} 14:30`,
      savedTimestamp: Date.now() - idx * 86400000,
      reportSnapshot: branded,
    };
  });
}

export function getStoredLabArchives(): SportsFlyLabArchivedReport[] {
  const activeBranding = getStoredLabSchoolBranding();
  try {
    const raw = localStorage.getItem(LAB_ARCHIVE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item: SportsFlyLabArchivedReport) => ({
          ...item,
          reportSnapshot: applyBrandingToReport(item.reportSnapshot, activeBranding),
        }));
      }
    }
  } catch (e) {
    console.error('SportsFly Lab karne arşivi okunamadı:', e);
  }
  return getDefaultLabArchives();
}

export function saveStoredLabArchives(archives: SportsFlyLabArchivedReport[]): void {
  try {
    localStorage.setItem(LAB_ARCHIVE_STORAGE_KEY, JSON.stringify(archives));
  } catch (e) {
    console.error('SportsFly Lab karne arşivi kaydedilemedi:', e);
  }
}

export function archiveLabReport(
  report: SportsFlyLabReport,
  archiveTitle: string,
  archiveNote?: string
): SportsFlyLabArchivedReport[] {
  const activeBranding = getStoredLabSchoolBranding();
  const brandedSnapshot: SportsFlyLabReport = JSON.parse(
    JSON.stringify(applyBrandingToReport(report, activeBranding))
  );
  if (!brandedSnapshot.aiRecommendations) {
    brandedSnapshot.aiRecommendations = analyzeLabPerformanceMetrics(brandedSnapshot);
  }

  const now = new Date();
  const formattedDate = `${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  const cleanTitle =
    archiveTitle.trim() ||
    `${brandedSnapshot.athleteName} — ${brandedSnapshot.date3} Dönem Karnesi`;

  const newEntry: SportsFlyLabArchivedReport = {
    archiveId: `lab-arch-${Date.now()}`,
    archiveTitle: cleanTitle,
    archiveNote: archiveNote?.trim() || `${brandedSnapshot.sportBranch} · %${brandedSnapshot.scoreHistory.p3Score} Performans`,
    savedAt: formattedDate,
    savedTimestamp: Date.now(),
    reportSnapshot: brandedSnapshot,
  };

  const currentArchives = getStoredLabArchives();
  const nextArchives = [newEntry, ...currentArchives];
  saveStoredLabArchives(nextArchives);
  return nextArchives;
}

export function renameLabArchiveItem(
  archiveId: string,
  newTitle: string,
  newNote?: string
): SportsFlyLabArchivedReport[] {
  const currentArchives = getStoredLabArchives();
  const nextArchives = currentArchives.map((item) => {
    if (item.archiveId !== archiveId) return item;
    return {
      ...item,
      archiveTitle: newTitle.trim() || item.archiveTitle,
      archiveNote: newNote !== undefined ? newNote.trim() : item.archiveNote,
    };
  });
  saveStoredLabArchives(nextArchives);
  return nextArchives;
}

export function deleteLabArchiveItem(archiveId: string): SportsFlyLabArchivedReport[] {
  const currentArchives = getStoredLabArchives();
  const nextArchives = currentArchives.filter((item) => item.archiveId !== archiveId);
  saveStoredLabArchives(nextArchives);
  return nextArchives;
}

/**
 * Archives multiple report cards at once (Batch Archive) into Karne Arşivi (localStorage).
 */
export function archiveBatchLabReports(
  reportsToArchive: SportsFlyLabReport[],
  batchGroupTitle: string,
  batchNote?: string
): SportsFlyLabArchivedReport[] {
  const currentBranding = getStoredLabSchoolBranding();
  const currentArchives = getStoredLabArchives();
  const nowStr = new Date().toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const groupLabel = batchGroupTitle.trim() || `${new Date().toLocaleDateString('tr-TR')} Toplu Karne Grubu`;

  const newEntries: SportsFlyLabArchivedReport[] = reportsToArchive.map((rep, idx) => {
    const brandedSnapshot = applyBrandingToReport(rep, currentBranding);
    return {
      archiveId: `lab-arch-batch-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      archiveTitle: `${brandedSnapshot.athleteName} — ${groupLabel} (${brandedSnapshot.sportBranch})`,
      archiveNote:
        batchNote?.trim() ||
        `Toplu Excel Karne Üretimi · 3. Ölçüm Genel Performans: %${brandedSnapshot.scoreHistory.p3Score}`,
      savedAt: nowStr,
      savedTimestamp: Date.now() - idx,
      reportSnapshot: brandedSnapshot,
    };
  });

  const nextArchives = [...newEntries, ...currentArchives];
  saveStoredLabArchives(nextArchives);
  return nextArchives;
}

/**
 * Sample multi-athlete rows for Batch Excel Template and 1-Click Sample Batch Testing
 */
export const SAMPLE_BATCH_ATHLETE_ROWS: Record<string, string | number>[] = [
  {
    Sporcu_Adi: 'Ege Örnektir',
    Sporcu_Kodu: 'SF-2026-101',
    Brans: 'Voleybol / Çoklu Branş Gelişim',
    Cinsiyet: 'Erkek',
    Yas: 11.4,
    Olcum_1_Tarihi: '14.01.2026',
    Olcum_2_Tarihi: '18.05.2026',
    Olcum_3_Tarihi: '22.09.2026',
    Boy_1: 142.6,
    Boy_2: 146.1,
    Boy_3: 149.5,
    Agirlik_1: 40.3,
    Agirlik_2: 41.2,
    Agirlik_3: 43.2,
    BKI_1: 19.82,
    BKI_2: 19.3,
    BKI_3: 19.33,
    Yag_Yuzdesi_1: 24.4,
    Yag_Yuzdesi_2: 22.8,
    Yag_Yuzdesi_3: 20.6,
    Surat_1: 4.12,
    Surat_2: 3.95,
    Surat_3: 3.82,
    Cabukluk_1: 22.4,
    Cabukluk_2: 20.1,
    Cabukluk_3: 19.2,
    Sirt_Kuvveti_3: 45.0,
    Kavrama_Kuvveti_3: 24.5,
    Durarak_Uzun_Atlama_3: 154,
    Dikey_Sicrama_3: 29.5,
    Esneklik_3: 41.0,
    VO2max_3: 38.4,
    PACER_Mesafe_1: 360,
    PACER_Mesafe_2: 440,
    PACER_Mesafe_3: 540,
    Endomorfi: 3.8,
    Mezomorfi: 4.6,
    Ektomorfi: 2.9,
    PHV_Yasi: 13.8,
    PHV_Boyu: 163.5,
    Tahmini_18_Yas_Boyu: 181.2,
    Genel_Performans_Puani: 76,
    Brans_Referans_Puani: 82,
    Uzman_Gorusu:
      'Ege 3. ölçüm döneminde patlayıcı dikey sıçrama ve 20m sürat parametrelerinde belirgin ivme yakalamıştır. PHV öncesi koordinasyon penceresi verimli kullanılmaktadır.',
  },
  {
    Sporcu_Adi: 'Kerem Yılmaz',
    Sporcu_Kodu: 'SF-2026-102',
    Brans: 'Futbol / U12 Elit Akademi',
    Cinsiyet: 'Erkek',
    Yas: 11.8,
    Olcum_1_Tarihi: '14.01.2026',
    Olcum_2_Tarihi: '18.05.2026',
    Olcum_3_Tarihi: '22.09.2026',
    Boy_1: 145.0,
    Boy_2: 148.2,
    Boy_3: 151.4,
    Agirlik_1: 38.5,
    Agirlik_2: 40.1,
    Agirlik_3: 41.8,
    BKI_1: 18.31,
    BKI_2: 18.26,
    BKI_3: 18.23,
    Yag_Yuzdesi_1: 16.8,
    Yag_Yuzdesi_2: 15.9,
    Yag_Yuzdesi_3: 14.8,
    Surat_1: 3.88,
    Surat_2: 3.74,
    Surat_3: 3.61,
    Cabukluk_1: 19.8,
    Cabukluk_2: 18.6,
    Cabukluk_3: 17.7,
    Sirt_Kuvveti_3: 48.5,
    Kavrama_Kuvveti_3: 26.2,
    Durarak_Uzun_Atlama_3: 168,
    Dikey_Sicrama_3: 33.0,
    Esneklik_3: 39.5,
    VO2max_3: 44.2,
    PACER_Mesafe_1: 520,
    PACER_Mesafe_2: 640,
    PACER_Mesafe_3: 780,
    Endomorfi: 2.4,
    Mezomorfi: 5.1,
    Ektomorfi: 3.4,
    PHV_Yasi: 13.6,
    PHV_Boyu: 164.0,
    Tahmini_18_Yas_Boyu: 179.8,
    Genel_Performans_Puani: 85,
    Brans_Referans_Puani: 84,
    Uzman_Gorusu:
      'Kerem aerobik kapasite (VO2max 44.2 ml/kg/dk), 10x5m çabukluk ve 20m sprint değerlerinde yaş grubu elit futbol normlarının üzerine çıkmıştır.',
  },
  {
    Sporcu_Adi: 'Zeynep Kaya',
    Sporcu_Kodu: 'SF-2026-103',
    Brans: 'Yüzme / Olimpik Hazırlık',
    Cinsiyet: 'Kadın',
    Yas: 11.2,
    Olcum_1_Tarihi: '14.01.2026',
    Olcum_2_Tarihi: '18.05.2026',
    Olcum_3_Tarihi: '22.09.2026',
    Boy_1: 146.4,
    Boy_2: 149.8,
    Boy_3: 153.2,
    Agirlik_1: 39.0,
    Agirlik_2: 40.8,
    Agirlik_3: 42.5,
    BKI_1: 18.2,
    BKI_2: 18.18,
    BKI_3: 18.11,
    Yag_Yuzdesi_1: 18.2,
    Yag_Yuzdesi_2: 17.5,
    Yag_Yuzdesi_3: 16.9,
    Surat_1: 3.96,
    Surat_2: 3.84,
    Surat_3: 3.72,
    Cabukluk_1: 20.5,
    Cabukluk_2: 19.3,
    Cabukluk_3: 18.5,
    Sirt_Kuvveti_3: 46.0,
    Kavrama_Kuvveti_3: 25.4,
    Durarak_Uzun_Atlama_3: 161,
    Dikey_Sicrama_3: 31.0,
    Esneklik_3: 46.5,
    VO2max_3: 45.8,
    PACER_Mesafe_1: 540,
    PACER_Mesafe_2: 680,
    PACER_Mesafe_3: 820,
    Endomorfi: 2.6,
    Mezomorfi: 4.8,
    Ektomorfi: 3.7,
    PHV_Yasi: 12.3,
    PHV_Boyu: 159.5,
    Tahmini_18_Yas_Boyu: 173.4,
    Genel_Performans_Puani: 88,
    Brans_Referans_Puani: 85,
    Uzman_Gorusu:
      'Zeynep kulaç açıklığı, gövde esnekliği (46.5 cm) ve kardiyorespiratuar dayanıklılıkta üst yüzdelik dilimde yer almaktadır. PHV büyüme atağı dönemine yaklaşmaktadır.',
  },
  {
    Sporcu_Adi: 'Arda Demir',
    Sporcu_Kodu: 'SF-2026-104',
    Brans: 'Basketbol / Altyapı Performans',
    Cinsiyet: 'Erkek',
    Yas: 12.1,
    Olcum_1_Tarihi: '14.01.2026',
    Olcum_2_Tarihi: '18.05.2026',
    Olcum_3_Tarihi: '22.09.2026',
    Boy_1: 154.2,
    Boy_2: 158.0,
    Boy_3: 162.4,
    Agirlik_1: 45.0,
    Agirlik_2: 47.2,
    Agirlik_3: 49.5,
    BKI_1: 18.92,
    BKI_2: 18.91,
    BKI_3: 18.77,
    Yag_Yuzdesi_1: 19.4,
    Yag_Yuzdesi_2: 18.2,
    Yag_Yuzdesi_3: 17.1,
    Surat_1: 3.92,
    Surat_2: 3.79,
    Surat_3: 3.68,
    Cabukluk_1: 20.2,
    Cabukluk_2: 19.1,
    Cabukluk_3: 18.3,
    Sirt_Kuvveti_3: 52.0,
    Kavrama_Kuvveti_3: 28.4,
    Durarak_Uzun_Atlama_3: 174,
    Dikey_Sicrama_3: 35.5,
    Esneklik_3: 38.0,
    VO2max_3: 41.6,
    PACER_Mesafe_1: 480,
    PACER_Mesafe_2: 580,
    PACER_Mesafe_3: 700,
    Endomorfi: 2.5,
    Mezomorfi: 4.7,
    Ektomorfi: 3.9,
    PHV_Yasi: 13.9,
    PHV_Boyu: 174.0,
    Tahmini_18_Yas_Boyu: 192.5,
    Genel_Performans_Puani: 82,
    Brans_Referans_Puani: 83,
    Uzman_Gorusu:
      'Arda uzun boy projeksiyonu (192.5 cm) ve dikey sıçrama (35.5 cm) kapasitesiyle basketbol branşı için yüksek potansiyel taşımaktadır. Hamstring esnekliği desteklenmelidir.',
  },
  {
    Sporcu_Adi: 'Elif Şahin',
    Sporcu_Kodu: 'SF-2026-105',
    Brans: 'Tenis / Performans Grubu',
    Cinsiyet: 'Kadın',
    Yas: 10.9,
    Olcum_1_Tarihi: '14.01.2026',
    Olcum_2_Tarihi: '18.05.2026',
    Olcum_3_Tarihi: '22.09.2026',
    Boy_1: 139.5,
    Boy_2: 142.8,
    Boy_3: 146.2,
    Agirlik_1: 34.8,
    Agirlik_2: 36.1,
    Agirlik_3: 37.6,
    BKI_1: 17.88,
    BKI_2: 17.7,
    BKI_3: 17.59,
    Yag_Yuzdesi_1: 19.8,
    Yag_Yuzdesi_2: 18.9,
    Yag_Yuzdesi_3: 18.0,
    Surat_1: 4.05,
    Surat_2: 3.89,
    Surat_3: 3.75,
    Cabukluk_1: 19.6,
    Cabukluk_2: 18.4,
    Cabukluk_3: 17.6,
    Sirt_Kuvveti_3: 41.5,
    Kavrama_Kuvveti_3: 24.8,
    Durarak_Uzun_Atlama_3: 152,
    Dikey_Sicrama_3: 28.5,
    Esneklik_3: 43.5,
    VO2max_3: 40.5,
    PACER_Mesafe_1: 420,
    PACER_Mesafe_2: 520,
    PACER_Mesafe_3: 640,
    Endomorfi: 2.8,
    Mezomorfi: 4.5,
    Ektomorfi: 3.3,
    PHV_Yasi: 12.1,
    PHV_Boyu: 156.0,
    Tahmini_18_Yas_Boyu: 169.8,
    Genel_Performans_Puani: 79,
    Brans_Referans_Puani: 80,
    Uzman_Gorusu:
      'Elif yanal yön değiştirme (10x5m çabukluk: 17.6 sn) ve dominant el kavrama kuvvetinde tenis branşı gereksinimlerini başarıyla karşılamaktadır.',
  },
  {
    Sporcu_Adi: 'Canberk Aydın',
    Sporcu_Kodu: 'SF-2026-106',
    Brans: 'Atletizm / Sprint & Sıçrama',
    Cinsiyet: 'Erkek',
    Yas: 11.6,
    Olcum_1_Tarihi: '14.01.2026',
    Olcum_2_Tarihi: '18.05.2026',
    Olcum_3_Tarihi: '22.09.2026',
    Boy_1: 144.2,
    Boy_2: 147.9,
    Boy_3: 151.0,
    Agirlik_1: 37.9,
    Agirlik_2: 39.4,
    Agirlik_3: 41.0,
    BKI_1: 18.22,
    BKI_2: 18.01,
    BKI_3: 17.98,
    Yag_Yuzdesi_1: 15.6,
    Yag_Yuzdesi_2: 14.8,
    Yag_Yuzdesi_3: 13.9,
    Surat_1: 3.82,
    Surat_2: 3.68,
    Surat_3: 3.54,
    Cabukluk_1: 19.4,
    Cabukluk_2: 18.3,
    Cabukluk_3: 17.5,
    Sirt_Kuvveti_3: 47.0,
    Kavrama_Kuvveti_3: 25.8,
    Durarak_Uzun_Atlama_3: 178,
    Dikey_Sicrama_3: 36.0,
    Esneklik_3: 42.0,
    VO2max_3: 42.8,
    PACER_Mesafe_1: 480,
    PACER_Mesafe_2: 600,
    PACER_Mesafe_3: 720,
    Endomorfi: 2.1,
    Mezomorfi: 5.3,
    Ektomorfi: 3.5,
    PHV_Yasi: 13.7,
    PHV_Boyu: 165.0,
    Tahmini_18_Yas_Boyu: 182.0,
    Genel_Performans_Puani: 89,
    Brans_Referans_Puani: 85,
    Uzman_Gorusu:
      'Canberk 20m sürat (3.54 sn), durarak uzun atlama (178 cm) ve dikey sıçrama (36.0 cm) testlerinde yüksek patlayıcı güç profili sergilemektedir.',
  },
];


/**
 * Creates a brand-new 7-page SportsFlyLabReport and automatically applies
 * the persisted localStorage school branding (logo, school name, branch).
 */
export function createNewLabReportWithBranding(params: {
  athleteName: string;
  sportBranch: string;
  gender: 'Erkek' | 'Kadın';
  ageYears: number;
  baseTemplate?: SportsFlyLabReport;
}): SportsFlyLabReport {
  const activeBranding = getStoredLabSchoolBranding();
  const template = params.baseTemplate || DEFAULT_LAB_REPORTS[0];
  const cloned: SportsFlyLabReport = JSON.parse(JSON.stringify(template));
  const today = new Date().toLocaleDateString('tr-TR');

  cloned.id = `lab-new-${Date.now()}`;
  cloned.athleteName = params.athleteName.trim() || 'Yeni Sporcu';
  cloned.athleteCode = `SF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  cloned.sportBranch = params.sportBranch.trim() || template.sportBranch;
  cloned.gender = params.gender;
  cloned.ageYears = Number(params.ageYears) || 11.0;
  cloned.ageMonths = Number((cloned.ageYears * 12).toFixed(1));
  cloned.date3 = today;

  // Automatically apply persisted school branding (logo, school name, branch)
  const branded = applyBrandingToReport(cloned, activeBranding);
  branded.aiRecommendations = analyzeLabPerformanceMetrics(branded);
  return branded;
}

/**
 * Downloads a comprehensive 2-sheet Excel template (.xlsx) so the user can either:
 * 1) Fill out the "Parametre_Tablosu" sheet for an athlete (exact match to the PDF structure)
 * 2) Fill out the "Toplu_Sporcu_Listesi" sheet with multiple athletes (1 row per athlete)
 */
export function downloadSportsFlyLabExcelTemplate(currentReport: SportsFlyLabReport): void {
  const wb = XLSX.utils.book_new();
  const activeBranding = getStoredLabSchoolBranding();
  const brandedCurrent = applyBrandingToReport(currentReport, activeBranding);

  // Sheet 1: Detailed Parameter Sheet for the active athlete (very easy to edit!)
  const paramRows: Record<string, string | number>[] = [
    {
      Kategori: 'SPORCU BİLGİLERİ',
      Parametre_Kodu: 'athlete_info',
      Parametre_Adi: brandedCurrent.athleteName,
      Birim: brandedCurrent.sportBranch,
      Olcum_1: brandedCurrent.date1,
      Olcum_2: brandedCurrent.date2,
      Olcum_3: brandedCurrent.date3,
      Yuzdelik: brandedCurrent.ageYears,
      SD_Skoru: brandedCurrent.phvAge,
      Durum: brandedCurrent.clubName,
      Beklenen_Hedef: brandedCurrent.predictedAdultHeight,
    },
    ...currentReport.bodyComposition.map((row) => ({
      Kategori: '1. BEDEN KOMPOZİSYONU',
      Parametre_Kodu: row.id,
      Parametre_Adi: row.name,
      Birim: row.unit,
      Olcum_1: row.m1,
      Olcum_2: row.m2,
      Olcum_3: row.m3,
      Yuzdelik: row.percentile,
      SD_Skoru: row.sd,
      Durum: row.status,
      Beklenen_Hedef: row.refMid,
    })),
    ...currentReport.motorPerformance.map((row) => {
      const ips = currentReport.ipsativeTargets.find((t) =>
        row.name.toLowerCase().includes(t.parameter.toLowerCase())
      );
      return {
        Kategori: '2. MOTOR PERFORMANS',
        Parametre_Kodu: row.id,
        Parametre_Adi: row.name,
        Birim: row.unit,
        Olcum_1: row.m1,
        Olcum_2: row.m2,
        Olcum_3: row.m3,
        Yuzdelik: row.percentile,
        SD_Skoru: row.sd,
        Durum: row.status,
        Beklenen_Hedef: ips ? ips.target : row.refHigh,
      };
    }),
    {
      Kategori: '3. SOMATOTİP (HEATH-CARTER)',
      Parametre_Kodu: 'somatotype_endo',
      Parametre_Adi: 'Endomorfi',
      Birim: 'puan',
      Olcum_1: currentReport.somatotype.m1.endo,
      Olcum_2: currentReport.somatotype.m2.endo,
      Olcum_3: currentReport.somatotype.m3.endo,
      Yuzdelik: currentReport.somatotype.eliteRef.refScore,
      SD_Skoru: 0,
      Durum: currentReport.somatotype.m3.category,
      Beklenen_Hedef: currentReport.somatotype.eliteRef.endo,
    },
    {
      Kategori: '3. SOMATOTİP (HEATH-CARTER)',
      Parametre_Kodu: 'somatotype_meso',
      Parametre_Adi: 'Mezomorfi',
      Birim: 'puan',
      Olcum_1: currentReport.somatotype.m1.meso,
      Olcum_2: currentReport.somatotype.m2.meso,
      Olcum_3: currentReport.somatotype.m3.meso,
      Yuzdelik: currentReport.somatotype.eliteRef.refScore,
      SD_Skoru: 0,
      Durum: currentReport.somatotype.m3.category,
      Beklenen_Hedef: currentReport.somatotype.eliteRef.meso,
    },
    {
      Kategori: '3. SOMATOTİP (HEATH-CARTER)',
      Parametre_Kodu: 'somatotype_ecto',
      Parametre_Adi: 'Ektomorfi',
      Birim: 'puan',
      Olcum_1: currentReport.somatotype.m1.ecto,
      Olcum_2: currentReport.somatotype.m2.ecto,
      Olcum_3: currentReport.somatotype.m3.ecto,
      Yuzdelik: currentReport.somatotype.eliteRef.refScore,
      SD_Skoru: 0,
      Durum: currentReport.somatotype.m3.category,
      Beklenen_Hedef: currentReport.somatotype.eliteRef.ecto,
    },
    {
      Kategori: '4. KARDİYORESPİRATUAR (PACER)',
      Parametre_Kodu: 'pacer_distance',
      Parametre_Adi: 'Shuttle Run Koşu Mesafesi',
      Birim: 'metre',
      Olcum_1: currentReport.cardio.test1Distance,
      Olcum_2: currentReport.cardio.test2Distance,
      Olcum_3: currentReport.cardio.test3Distance,
      Yuzdelik: 75,
      SD_Skoru: 0.6,
      Durum: currentReport.cardio.test3Status,
      Beklenen_Hedef: currentReport.cardio.test3Distance + 160,
    },
    {
      Kategori: '5. KATEGORİ PERFORMANS PUANLARI',
      Parametre_Kodu: 'score_teknik',
      Parametre_Adi: 'Teknik Beceriler Puanı',
      Birim: '0-10 Puan',
      Olcum_1: '-',
      Olcum_2: '-',
      Olcum_3: 8.2,
      Yuzdelik: 85,
      SD_Skoru: 0.8,
      Durum: 'İyi Düzey',
      Beklenen_Hedef: 9.0,
    },
    {
      Kategori: '5. KATEGORİ PERFORMANS PUANLARI',
      Parametre_Kodu: 'score_fiziksel',
      Parametre_Adi: 'Fiziksel Performans Puanı',
      Birim: '0-10 Puan',
      Olcum_1: '-',
      Olcum_2: '-',
      Olcum_3: 8.5,
      Yuzdelik: 88,
      SD_Skoru: 0.9,
      Durum: 'Yüksek Performans',
      Beklenen_Hedef: 9.2,
    },
    {
      Kategori: '5. KATEGORİ PERFORMANS PUANLARI',
      Parametre_Kodu: 'score_taktiksel',
      Parametre_Adi: 'Taktiksel Oyun Zekası Puanı',
      Birim: '0-10 Puan',
      Olcum_1: '-',
      Olcum_2: '-',
      Olcum_3: 8.0,
      Yuzdelik: 82,
      SD_Skoru: 0.7,
      Durum: 'Gelişiyor',
      Beklenen_Hedef: 8.8,
    },
    {
      Kategori: '5. KATEGORİ PERFORMANS PUANLARI',
      Parametre_Kodu: 'score_zihinsel',
      Parametre_Adi: 'Zihinsel Beceriler & Disiplin',
      Birim: '0-10 Puan',
      Olcum_1: '-',
      Olcum_2: '-',
      Olcum_3: 8.8,
      Yuzdelik: 90,
      SD_Skoru: 1.1,
      Durum: 'Örnek Düzey',
      Beklenen_Hedef: 9.5,
    },
    {
      Kategori: '6. UZMAN GÖRÜŞÜ VE AKADEMİ NOTLARI',
      Parametre_Kodu: 'expert_comment',
      Parametre_Adi: 'Uzman Değerlendirme Görüşü',
      Birim: 'Metin',
      Olcum_1: '-',
      Olcum_2: '-',
      Olcum_3: currentReport.expertComment || 'Uzman görüşü henüz tanımlanmamıştır.',
      Yuzdelik: '-',
      SD_Skoru: '-',
      Durum: 'Tamamlandı',
      Beklenen_Hedef: '-',
    },
  ];

  const wsParams = XLSX.utils.json_to_sheet(paramRows);
  wsParams['!cols'] = [
    { wch: 28 },
    { wch: 20 },
    { wch: 28 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 24 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsParams, 'Parametre_Bazli_Karne');

  // Sheet 2: Multi-Athlete Flat List (1 row = 1 athlete, pre-populated with 6 sample athletes)
  const flatRows = SAMPLE_BATCH_ATHLETE_ROWS.map((row) => ({
    Sporcu_Adi: row.Sporcu_Adi,
    Sporcu_Kodu: row.Sporcu_Kodu,
    Kulup_Adi: activeBranding.schoolName || brandedCurrent.clubName,
    Sube: activeBranding.branchName || brandedCurrent.branchName,
    Brans: row.Brans,
    Cinsiyet: row.Cinsiyet,
    Yas: row.Yas,
    Olcum_1_Tarihi: row.Olcum_1_Tarihi,
    Olcum_2_Tarihi: row.Olcum_2_Tarihi,
    Olcum_3_Tarihi: row.Olcum_3_Tarihi,
    Boy_1: row.Boy_1,
    Boy_2: row.Boy_2,
    Boy_3: row.Boy_3,
    Agirlik_1: row.Agirlik_1,
    Agirlik_2: row.Agirlik_2,
    Agirlik_3: row.Agirlik_3,
    BKI_1: row.BKI_1,
    BKI_2: row.BKI_2,
    BKI_3: row.BKI_3,
    Yag_Yuzdesi_1: row.Yag_Yuzdesi_1,
    Yag_Yuzdesi_2: row.Yag_Yuzdesi_2,
    Yag_Yuzdesi_3: row.Yag_Yuzdesi_3,
    Surat_1: row.Surat_1,
    Surat_2: row.Surat_2,
    Surat_3: row.Surat_3,
    Cabukluk_1: row.Cabukluk_1,
    Cabukluk_2: row.Cabukluk_2,
    Cabukluk_3: row.Cabukluk_3,
    Sirt_Kuvveti_3: row.Sirt_Kuvveti_3,
    Kavrama_Kuvveti_3: row.Kavrama_Kuvveti_3,
    Durarak_Uzun_Atlama_3: row.Durarak_Uzun_Atlama_3,
    Dikey_Sicrama_3: row.Dikey_Sicrama_3,
    Esneklik_3: row.Esneklik_3,
    VO2max_3: row.VO2max_3,
    PACER_Mesafe_1: row.PACER_Mesafe_1,
    PACER_Mesafe_2: row.PACER_Mesafe_2,
    PACER_Mesafe_3: row.PACER_Mesafe_3,
    Endomorfi: row.Endomorfi,
    Mezomorfi: row.Mezomorfi,
    Ektomorfi: row.Ektomorfi,
    PHV_Yasi: row.PHV_Yasi,
    PHV_Boyu: row.PHV_Boyu,
    Tahmini_18_Yas_Boyu: row.Tahmini_18_Yas_Boyu,
    Genel_Performans_Puani: row.Genel_Performans_Puani,
    Brans_Referans_Puani: row.Brans_Referans_Puani,
    Uzman_Gorusu: row.Uzman_Gorusu,
  }));

  const wsFlat = XLSX.utils.json_to_sheet(flatRows);
  XLSX.utils.book_append_sheet(wb, wsFlat, 'Toplu_Sporcu_Listesi');

  XLSX.writeFile(wb, `SportsFly_Lab_Karne_Sablonu_${currentReport.athleteName.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Downloads a dedicated Multi-Athlete Batch Excel template (.xlsx) where the primary sheet
 * is "Toplu_Sporcu_Listesi" (1 row = 1 athlete, pre-populated with 6 sample athletes across branches)
 * and the second sheet is "Sutun_Kilavuzu" (column reference guide).
 */
export function downloadBatchSportsFlyLabExcelTemplate(baseTemplate: SportsFlyLabReport): void {
  const wb = XLSX.utils.book_new();
  const activeBranding = getStoredLabSchoolBranding();
  const brandedCurrent = applyBrandingToReport(baseTemplate, activeBranding);

  const batchRows = SAMPLE_BATCH_ATHLETE_ROWS.map((row) => ({
    Sporcu_Adi: row.Sporcu_Adi,
    Sporcu_Kodu: row.Sporcu_Kodu,
    Kulup_Adi: activeBranding.schoolName || brandedCurrent.clubName,
    Sube: activeBranding.branchName || brandedCurrent.branchName,
    Brans: row.Brans,
    Cinsiyet: row.Cinsiyet,
    Yas: row.Yas,
    Olcum_1_Tarihi: row.Olcum_1_Tarihi,
    Olcum_2_Tarihi: row.Olcum_2_Tarihi,
    Olcum_3_Tarihi: row.Olcum_3_Tarihi,
    Boy_1: row.Boy_1,
    Boy_2: row.Boy_2,
    Boy_3: row.Boy_3,
    Agirlik_1: row.Agirlik_1,
    Agirlik_2: row.Agirlik_2,
    Agirlik_3: row.Agirlik_3,
    BKI_1: row.BKI_1,
    BKI_2: row.BKI_2,
    BKI_3: row.BKI_3,
    Yag_Yuzdesi_1: row.Yag_Yuzdesi_1,
    Yag_Yuzdesi_2: row.Yag_Yuzdesi_2,
    Yag_Yuzdesi_3: row.Yag_Yuzdesi_3,
    Surat_1: row.Surat_1,
    Surat_2: row.Surat_2,
    Surat_3: row.Surat_3,
    Cabukluk_1: row.Cabukluk_1,
    Cabukluk_2: row.Cabukluk_2,
    Cabukluk_3: row.Cabukluk_3,
    Sirt_Kuvveti_3: row.Sirt_Kuvveti_3,
    Kavrama_Kuvveti_3: row.Kavrama_Kuvveti_3,
    Durarak_Uzun_Atlama_3: row.Durarak_Uzun_Atlama_3,
    Dikey_Sicrama_3: row.Dikey_Sicrama_3,
    Esneklik_3: row.Esneklik_3,
    VO2max_3: row.VO2max_3,
    PACER_Mesafe_1: row.PACER_Mesafe_1,
    PACER_Mesafe_2: row.PACER_Mesafe_2,
    PACER_Mesafe_3: row.PACER_Mesafe_3,
    Endomorfi: row.Endomorfi,
    Mezomorfi: row.Mezomorfi,
    Ektomorfi: row.Ektomorfi,
    PHV_Yasi: row.PHV_Yasi,
    PHV_Boyu: row.PHV_Boyu,
    Tahmini_18_Yas_Boyu: row.Tahmini_18_Yas_Boyu,
    Genel_Performans_Puani: row.Genel_Performans_Puani,
    Brans_Referans_Puani: row.Brans_Referans_Puani,
    Uzman_Gorusu: row.Uzman_Gorusu,
  }));

  const wsBatch = XLSX.utils.json_to_sheet(batchRows);
  wsBatch['!cols'] = [
    { wch: 22 },
    { wch: 15 },
    { wch: 26 },
    { wch: 22 },
    { wch: 28 },
    { wch: 10 },
    { wch: 8 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, wsBatch, 'Toplu_Sporcu_Listesi');

  const guideRows = [
    { Sutun_Adi: 'Sporcu_Adi', Zorunlu: 'Evet', Birim: 'Metin', Aciklama: 'Sporcunun Adı ve Soyadı (Her satır 1 sporcu karnesi oluşturur)' },
    { Sutun_Adi: 'Sporcu_Kodu', Zorunlu: 'İsteğe Bağlı', Birim: 'Kod', Aciklama: 'Lisans veya akademi sporcu numarası (Boş bırakılırsa otomatik atanır)' },
    { Sutun_Adi: 'Brans', Zorunlu: 'Evet', Birim: 'Metin', Aciklama: 'Spor branşı ve grup adı (Örn: Futbol / U12 Elit Akademi)' },
    { Sutun_Adi: 'Cinsiyet', Zorunlu: 'Evet', Birim: 'Erkek / Kadın', Aciklama: 'Normatif referans ve PHV hesaplaması için cinsiyet' },
    { Sutun_Adi: 'Yas', Zorunlu: 'Evet', Birim: 'Yıl (Ondalık)', Aciklama: 'Sporcunun takvim yaşı (Örn: 11.4)' },
    { Sutun_Adi: 'Boy_1 / Boy_2 / Boy_3', Zorunlu: 'Evet', Birim: 'cm', Aciklama: '1., 2. ve 3. ölçüm boy uzunluğu değerleri' },
    { Sutun_Adi: 'Agirlik_1 / Agirlik_2 / Agirlik_3', Zorunlu: 'Evet', Birim: 'kg', Aciklama: '1., 2. ve 3. ölçüm vücut ağırlığı değerleri' },
    { Sutun_Adi: 'Yag_Yuzdesi_1 / 2 / 3', Zorunlu: 'İsteğe Bağlı', Birim: '%', Aciklama: 'Deri altı yağ yüzdesi ölçümleri' },
    { Sutun_Adi: 'Surat_1 / Surat_2 / Surat_3', Zorunlu: 'Evet', Birim: 'saniye', Aciklama: '20 metre sürat koşusu süreleri (Düşük süre daha iyidir)' },
    { Sutun_Adi: 'Cabukluk_1 / Cabukluk_2 / Cabukluk_3', Zorunlu: 'Evet', Birim: 'saniye', Aciklama: '10x5m mekik çabukluk testi süreleri' },
    { Sutun_Adi: 'Sirt_Kuvveti_3 / Kavrama_Kuvveti_3', Zorunlu: 'İsteğe Bağlı', Birim: 'kg', Aciklama: 'Dinamometre sırt ve el kavrama kuvveti 3. ölçüm değerleri' },
    { Sutun_Adi: 'Durarak_Uzun_Atlama_3 / Dikey_Sicrama_3', Zorunlu: 'Evet', Birim: 'cm', Aciklama: 'Patlayıcı alt ekstremite sıçrama değerleri' },
    { Sutun_Adi: 'Esneklik_3 / VO2max_3', Zorunlu: 'İsteğe Bağlı', Birim: 'cm / ml-kg-dk', Aciklama: 'Otur-eriş esneklik ve aerobik kapasite değerleri' },
    { Sutun_Adi: 'Endomorfi / Mezomorfi / Ektomorfi', Zorunlu: 'İsteğe Bağlı', Birim: 'Puan', Aciklama: 'Heath-Carter somatotip bileşenleri' },
    { Sutun_Adi: 'PHV_Yasi / Tahmini_18_Yas_Boyu', Zorunlu: 'İsteğe Bağlı', Birim: 'Yaş / cm', Aciklama: 'Büyüme atağı yaşı ve 18 yaş tahmini yetişkin boyu' },
    { Sutun_Adi: 'Genel_Performans_Puani', Zorunlu: 'İsteğe Bağlı', Birim: '0-100 Puan', Aciklama: 'Boş bırakılırsa yüzdelik dilimlerden otomatik hesaplanır' },
  ];
  const wsGuide = XLSX.utils.json_to_sheet(guideRows);
  wsGuide['!cols'] = [{ wch: 34 }, { wch: 14 }, { wch: 16 }, { wch: 64 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Sutun_Kilavuzu');

  XLSX.writeFile(wb, 'SportsFly_Lab_Toplu_Sporcu_Karne_Sablonu.xlsx');
}

/**
 * Scientific Data Validation and Auto-Correction layer to ensure absolute data consistency
 * across all report parameters, averages, chronological test histories, and metrics.
 * Eliminates any mathematical contradictions or data anomalies before final rendering/saving.
 */
export function ensureDataConsistency(report: SportsFlyLabReport): void {
  if (!report) return;

  // 1. Maturation (PHV) Height vs Predicted Adult Height Consistency
  // Predicted Adult Height (18 Yaş Boyu) MUST be greater than current height (Boy_3)
  const heightRow = report.bodyComposition.find(x => x.id === 'height');
  if (heightRow) {
    const currentHeight = heightRow.m3 || heightRow.m2 || heightRow.m1 || 160;
    if (report.predictedAdultHeight <= currentHeight) {
      // Auto-correct to a realistic mature height based on current height and gender
      report.predictedAdultHeight = Math.round(currentHeight + (report.gender === 'Erkek' ? 14 : 9));
    }
  }

  // 2. Basal Metabolic Rate (BMR) Consistency with Weight and Height
  // BMR should match the calculated physiological formulas based on gender and age
  const weightRow = report.bodyComposition.find(x => x.id === 'weight');
  if (heightRow && weightRow) {
    const w = weightRow.m3 || 50;
    const h = heightRow.m3 || 160;
    // Mifflin-St Jeor or Harris-Benedict formula for consistent BMR
    const calculatedBMR = Math.round(10 * w + 6.25 * h - 5 * report.ageYears + (report.gender === 'Erkek' ? 5 : -161));
    report.cardio.basalMetabolicRate = calculatedBMR;
  }

  // 3. Maturation (PHV) Age Sanitization
  // Peak Height Velocity age must reside within realistic pediatric developmental windows
  if (!report.phvAge || report.phvAge < 9.5 || report.phvAge > 16.5) {
    report.phvAge = report.gender === 'Erkek' ? 13.8 : 12.2;
  }

  // 4. Chronological Performance Score (p1Score, p2Score, p3Score) Trend Consistency
  // Ensures overall scores align logically with the average performance metrics of Test 1, 2, and 3
  const motorPerformance = report.motorPerformance;
  if (motorPerformance.length > 0) {
    let sumM1 = 0, sumM2 = 0, sumM3 = 0, count = 0;
    motorPerformance.forEach(m => {
      if (m.m1 !== undefined) { sumM1 += m.m1; }
      if (m.m2 !== undefined) { sumM2 += m.m2; }
      if (m.m3 !== undefined) { sumM3 += m.m3; }
      count++;
    });
    if (count > 0) {
      const avgM1 = sumM1 / count;
      const avgM2 = sumM2 / count;
      const avgM3 = sumM3 / count;

      if (avgM1 > 0 && avgM2 > 0 && avgM3 > 0) {
        const p3 = report.scoreHistory.p3Score || 85;
        const ratio1 = avgM1 / avgM3;
        const ratio2 = avgM2 / avgM3;
        // Auto-correct scores to align with the real performance development trend
        report.scoreHistory.p1Score = Math.max(15, Math.min(98, Math.round(p3 * ratio1)));
        report.scoreHistory.p2Score = Math.max(report.scoreHistory.p1Score, Math.min(99, Math.round(p3 * ratio2)));

        // Ensure logical bounds (no score exceeds 100)
        report.scoreHistory.p1Score = Math.max(15, Math.min(100, report.scoreHistory.p1Score));
        report.scoreHistory.p2Score = Math.max(15, Math.min(100, report.scoreHistory.p2Score));
        report.scoreHistory.p3Score = Math.max(15, Math.min(100, report.scoreHistory.p3Score));
      }
    }
  }

  // 5. Cardiorespiratory (Aerobic VO2max) Integration Consistency
  // Cardio page VO2max values must exactly match the aerobic parameter values on Page 2
  const aerobicRow = report.motorPerformance.find(x => x.id === 'aerobic');
  if (aerobicRow) {
    if (report.cardio.test1Vo2 !== aerobicRow.m1) report.cardio.test1Vo2 = aerobicRow.m1 || 0;
    if (report.cardio.test2Vo2 !== aerobicRow.m2) report.cardio.test2Vo2 = aerobicRow.m2 || 0;
    if (report.cardio.test3Vo2 !== aerobicRow.m3) report.cardio.test3Vo2 = aerobicRow.m3 || 0;
  }
}

/**
 * Helper to convert a single flat Excel row into a complete, biomechanically calculated 7-page SportsFlyLabReport.
 */
function buildLabReportFromExcelRow(
  r: Record<string, any>,
  idx: number,
  brandedTemplate: SportsFlyLabReport,
  activeBranding: SportsFlyLabSchoolBranding
): SportsFlyLabReport | null {
  const toNum = (val: unknown, fallback: number): number => {
    if (typeof val === 'number' && !Number.isNaN(val)) return val;
    if (typeof val === 'string') {
      const cleaned = val.trim().replace(',', '.').replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return fallback;
  };

  const athleteName = String(
    sanitizeSpreadsheetCell(
      r.Sporcu_Adi ||
        r['Sporcu Adı'] ||
        r.Ad_Soyad ||
        r['Ad Soyad'] ||
        r.Isim ||
        r['İsim'] ||
        r['Öğrenci Adı'] ||
        ''
    ) || ''
  );
  if (!athleteName) return null;

  const cloned: SportsFlyLabReport = JSON.parse(JSON.stringify(brandedTemplate));
  cloned.id = `lab-batch-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`;
  cloned.athleteName = athleteName;
  cloned.athleteCode = String(
    sanitizeSpreadsheetCell(r.Sporcu_Kodu || r['Sporcu Kodu'] || '') ||
    `SF-${new Date().getFullYear()}-${101 + idx}`
  );

  if (r.Kulup_Adi || r['Kulüp']) cloned.clubName = String(sanitizeSpreadsheetCell(r.Kulup_Adi || r['Kulüp']));
  if (r.Sube || r['Şube']) cloned.branchName = String(sanitizeSpreadsheetCell(r.Sube || r['Şube']));
  if (r.Brans || r['Branş']) cloned.sportBranch = String(sanitizeSpreadsheetCell(r.Brans || r['Branş']));

  const rawGender = String(r.Cinsiyet || r.cinsiyet || '').trim().toLowerCase();
  if (rawGender.startsWith('k') || rawGender.includes('kız') || rawGender.includes('kadın')) {
    cloned.gender = 'Kadın';
  } else if (rawGender.startsWith('e') || rawGender.includes('erkek')) {
    cloned.gender = 'Erkek';
  }

  if (r.Yas || r['Yaş']) {
    cloned.ageYears = toNum(r.Yas || r['Yaş'], cloned.ageYears);
    cloned.ageMonths = Number((cloned.ageYears * 12).toFixed(1));
  }
  if (r.Olcum_1_Tarihi) cloned.date1 = String(r.Olcum_1_Tarihi);
  if (r.Olcum_2_Tarihi) cloned.date2 = String(r.Olcum_2_Tarihi);
  if (r.Olcum_3_Tarihi) cloned.date3 = String(r.Olcum_3_Tarihi);

  const setB = (id: string, v1: any, v2: any, v3: any) => {
    const item = cloned.bodyComposition.find((x) => x.id === id);
    if (!item) return;
    if (v1 !== undefined && v1 !== '') item.m1 = toNum(v1, item.m1);
    if (v2 !== undefined && v2 !== '') item.m2 = toNum(v2, item.m2);
    if (v3 !== undefined && v3 !== '') {
      item.m3 = toNum(v3, item.m3);
      const span = Math.max(0.1, (item.refHigh - item.refLow) / 4);
      item.sd = Number(((item.m3 - item.refMid) / span).toFixed(2));
      item.percentile = Math.max(3, Math.min(99, Math.round(50 + item.sd * 24)));
      if (id === 'body_fat' || id === 'bmi') {
        item.status = item.sd > 1.0 ? 'yüksek' : item.sd < -1.0 ? 'düşük' : 'normal';
      } else if (id === 'height') {
        item.status = item.sd > 0.8 ? 'uzun' : item.sd < -1.0 ? 'düşük' : 'normal';
      }
    }
  };

  setB('height', r.Boy_1, r.Boy_2, r.Boy_3 ?? r.Boy);
  setB('weight', r.Agirlik_1, r.Agirlik_2, r.Agirlik_3 ?? r.Kilo ?? r.Agirlik);

  // Auto-calculate BMI if Boy & Agirlik are updated and BKI is not explicitly given
  const hItem = cloned.bodyComposition.find((x) => x.id === 'height');
  const wItem = cloned.bodyComposition.find((x) => x.id === 'weight');
  const calcBmi = (hCm: number, wKg: number) =>
    hCm > 50 ? Number((wKg / Math.pow(hCm / 100, 2)).toFixed(2)) : 18.5;

  const bmi1 = r.BKI_1 !== undefined && r.BKI_1 !== '' ? r.BKI_1 : hItem && wItem ? calcBmi(hItem.m1, wItem.m1) : undefined;
  const bmi2 = r.BKI_2 !== undefined && r.BKI_2 !== '' ? r.BKI_2 : hItem && wItem ? calcBmi(hItem.m2, wItem.m2) : undefined;
  const bmi3 =
    (r.BKI_3 ?? r.BKI) !== undefined && (r.BKI_3 ?? r.BKI) !== ''
      ? r.BKI_3 ?? r.BKI
      : hItem && wItem
      ? calcBmi(hItem.m3, wItem.m3)
      : undefined;

  setB('bmi', bmi1, bmi2, bmi3);
  setB('body_fat', r.Yag_Yuzdesi_1, r.Yag_Yuzdesi_2, r.Yag_Yuzdesi_3 ?? r.Yag_Yuzdesi);

  // Proportionally scale sitting height & arm span if height was provided, or use explicit mapped values
  if (hItem) {
    const sitItem = cloned.bodyComposition.find((x) => x.id === 'sitting_height');
    const armItem = cloned.bodyComposition.find((x) => x.id === 'arm_span');
    if (sitItem) {
      sitItem.m1 = Number((hItem.m1 * 0.522).toFixed(1));
      sitItem.m2 = Number((hItem.m2 * 0.523).toFixed(1));
      sitItem.m3 =
        r.Oturma_Boyu_3 !== undefined && r.Oturma_Boyu_3 !== ''
          ? toNum(r.Oturma_Boyu_3, Number((hItem.m3 * 0.525).toFixed(1)))
          : Number((hItem.m3 * 0.525).toFixed(1));
    }
    if (armItem) {
      armItem.m1 = Number((hItem.m1 * 1.005).toFixed(1));
      armItem.m2 = Number((hItem.m2 * 1.008).toFixed(1));
      armItem.m3 =
        r.Kulac_3 !== undefined && r.Kulac_3 !== ''
          ? toNum(r.Kulac_3, Number((hItem.m3 * 1.012).toFixed(1)))
          : Number((hItem.m3 * 1.012).toFixed(1));
    }
  }

  const setM = (id: string, v1: any, v2: any, v3: any) => {
    const item = cloned.motorPerformance.find((x) => x.id === id);
    if (!item) return;
    if (v1 !== undefined && v1 !== '') item.m1 = toNum(v1, item.m1);
    if (v2 !== undefined && v2 !== '') item.m2 = toNum(v2, item.m2);
    if (v3 !== undefined && v3 !== '') {
      item.m3 = toNum(v3, item.m3);
      // If v1 and v2 were not supplied, estimate realistic progression
      if (v1 === undefined || v1 === '') {
        item.m1 = Number((item.lowerIsBetter ? item.m3 * 1.06 : item.m3 * 0.91).toFixed(2));
      }
      if (v2 === undefined || v2 === '') {
        item.m2 = Number((item.lowerIsBetter ? item.m3 * 1.03 : item.m3 * 0.96).toFixed(2));
      }
      const span = Math.max(0.05, (item.refHigh - item.refLow) / 4);
      const rawDiff = item.lowerIsBetter ? item.refMid - item.m3 : item.m3 - item.refMid;
      item.sd = Number((rawDiff / span).toFixed(2));
      item.percentile = Math.max(5, Math.min(99, Math.round(50 + item.sd * 24)));
      item.status =
        item.percentile >= 80
          ? 'mükemmel'
          : item.percentile >= 65
          ? 'iyi'
          : item.percentile >= 40
          ? 'normal'
          : 'desteklenmeli';

      // Keep ipsativeTargets synced with updated motor values
      const ips = cloned.ipsativeTargets.find((t) =>
        item.name.toLowerCase().includes(t.parameter.toLowerCase())
      );
      if (ips) {
        ips.m1 = item.m1;
        ips.m2 = item.m2;
        ips.m3 = item.m3;
        ips.target = Number((item.lowerIsBetter ? item.m3 * 0.96 : item.m3 * 1.06).toFixed(2));
      }
    }
  };

  setM('sprint', r.Surat_1, r.Surat_2, r.Surat_3 ?? r.Surat);
  setM('agility', r.Cabukluk_1, r.Cabukluk_2, r.Cabukluk_3 ?? r.Cabukluk);
  setM('reaction', r.Reaksiyon_1, r.Reaksiyon_2, r.Reaksiyon_3 ?? r.Reaksiyon);
  setM('back_strength', r.Sirt_Kuvveti_1, r.Sirt_Kuvveti_2, r.Sirt_Kuvveti_3 ?? r.Sirt_Kuvveti);
  setM('grip_strength', r.Kavrama_Kuvveti_1, r.Kavrama_Kuvveti_2, r.Kavrama_Kuvveti_3 ?? r.Kavrama_Kuvveti);
  setM(
    'standing_long_jump',
    r.Durarak_Uzun_Atlama_1,
    r.Durarak_Uzun_Atlama_2,
    r.Durarak_Uzun_Atlama_3 ?? r.Uzun_Atlama
  );
  setM('vertical_jump', r.Dikey_Sicrama_1, r.Dikey_Sicrama_2, r.Dikey_Sicrama_3 ?? r.Dikey_Sicrama);
  setM('balance', r.Denge_1, r.Denge_2, r.Denge_3 ?? r.Denge);
  setM('flexibility', r.Esneklik_1, r.Esneklik_2, r.Esneklik_3 ?? r.Esneklik);
  setM('aerobic', r.VO2max_1, r.VO2max_2, r.VO2max_3 ?? r.VO2max);

  // Update Cardio / Anaerobic Power / BMR based on athlete's row metrics
  const aeroItem = cloned.motorPerformance.find((x) => x.id === 'aerobic');
  const vjItem = cloned.motorPerformance.find((x) => x.id === 'vertical_jump');
  if (r.PACER_Mesafe_1) cloned.cardio.test1Distance = toNum(r.PACER_Mesafe_1, cloned.cardio.test1Distance);
  if (r.PACER_Mesafe_2) cloned.cardio.test2Distance = toNum(r.PACER_Mesafe_2, cloned.cardio.test2Distance);
  if (r.PACER_Mesafe_3) cloned.cardio.test3Distance = toNum(r.PACER_Mesafe_3, cloned.cardio.test3Distance);
  if (aeroItem) {
    cloned.cardio.test1Vo2 = aeroItem.m1;
    cloned.cardio.test2Vo2 = aeroItem.m2;
    cloned.cardio.test3Vo2 = aeroItem.m3;
    cloned.cardio.test3Status = aeroItem.m3 >= 42 ? 'Mükemmel' : aeroItem.m3 >= 37 ? 'İyi' : 'Normal';
  }
  if (vjItem && wItem) {
    // Lewis / Sayers approximation for youth anaerobic peak power
    const watt = Math.round(Math.max(650, 21.67 * wItem.m3 * Math.sqrt(vjItem.m3 / 100) + 420));
    cloned.cardio.verticalJumpAnaerobicWatt = watt;
    cloned.cardio.verticalJumpRelativeWatt = Number((watt / Math.max(25, wItem.m3)).toFixed(2));
  }
  if (hItem && wItem) {
    cloned.cardio.basalMetabolicRate = Math.round(
      66.5 + 13.75 * wItem.m3 + 5.003 * hItem.m3 - 6.75 * cloned.ageYears
    );
  }

  // Update Somatotype
  if (r.Endomorfi) cloned.somatotype.m3.endo = toNum(r.Endomorfi, cloned.somatotype.m3.endo);
  if (r.Mezomorfi) cloned.somatotype.m3.meso = toNum(r.Mezomorfi, cloned.somatotype.m3.meso);
  if (r.Ektomorfi) cloned.somatotype.m3.ecto = toNum(r.Ektomorfi, cloned.somatotype.m3.ecto);
  const { endo, meso, ecto } = cloned.somatotype.m3;
  if (meso >= endo && meso >= ecto) {
    cloned.somatotype.m3.category = endo > ecto + 0.5 ? 'Endomorfik Mezomorf' : ecto > endo + 0.5 ? 'Ektomorfik Mezomorf' : 'Dengeli Mezomorf';
  } else if (ecto > meso && ecto > endo) {
    cloned.somatotype.m3.category = 'Mezomorfik Ektomorf';
  } else {
    cloned.somatotype.m3.category = 'Mezomorf-Endomorf';
  }

  if (r.PHV_Yasi) cloned.phvAge = toNum(r.PHV_Yasi, cloned.phvAge);
  if (r.PHV_Boyu) cloned.phvHeight = toNum(r.PHV_Boyu, cloned.phvHeight);
  if (r.Tahmini_18_Yas_Boyu) {
    cloned.predictedAdultHeight = toNum(r.Tahmini_18_Yas_Boyu, cloned.predictedAdultHeight);
  }

  // Compute or assign overall performance scores
  const avgMotorPct = Math.round(
    cloned.motorPerformance.reduce((acc, m) => acc + m.percentile, 0) /
      Math.max(1, cloned.motorPerformance.length)
  );
  if (r.Genel_Performans_Puani) {
    cloned.scoreHistory.p3Score = toNum(r.Genel_Performans_Puani, avgMotorPct);
  } else {
    cloned.scoreHistory.p3Score = avgMotorPct;
  }
  cloned.scoreHistory.p2Score = Math.max(25, Math.round(cloned.scoreHistory.p3Score - 8));
  cloned.scoreHistory.p1Score = Math.max(20, Math.round(cloned.scoreHistory.p3Score - 17));

  if (r.Brans_Referans_Puani) {
    cloned.somatotype.eliteRef.refScore = toNum(
      r.Brans_Referans_Puani,
      cloned.somatotype.eliteRef.refScore
    );
  }
  if (r.Uzman_Gorusu) cloned.expertComment = String(r.Uzman_Gorusu);

  const finalRowReport = applyBrandingToReport(cloned, activeBranding);
  ensureDataConsistency(finalRowReport);
  finalRowReport.aiRecommendations = analyzeLabPerformanceMetrics(finalRowReport);
  return finalRowReport;
}

/**
 * Generates the 6 sample athlete reports for 1-click batch testing in the UI.
 */
export function generateSampleBatchLabReports(baseTemplate: SportsFlyLabReport): SportsFlyLabReport[] {
  const activeBranding = getStoredLabSchoolBranding();
  const brandedTemplate = applyBrandingToReport(baseTemplate, activeBranding);
  return SAMPLE_BATCH_ATHLETE_ROWS.map((row, idx) =>
    buildLabReportFromExcelRow(row, idx, brandedTemplate, activeBranding)
  ).filter((item): item is SportsFlyLabReport => item !== null);
}

/**
 * Column Mapping Schema for Flexible Multi-Format Batch Excel Import
 */
export type LabBatchFieldCategory = 'identity' | 'body' | 'motor' | 'advanced';

export interface LabBatchMappableField {
  key: string; // Canonical row property expected by buildLabReportFromExcelRow (e.g. 'Sporcu_Adi', 'Boy_3', 'Surat_3')
  label: string;
  category: LabBatchFieldCategory;
  categoryLabel: string;
  unit: string;
  required?: boolean;
  description: string;
  aliases: string[];
}

export const LAB_BATCH_MAPPABLE_FIELDS: LabBatchMappableField[] = [
  // 1. Kimlik & Dönem Bilgileri
  {
    key: 'Sporcu_Adi',
    label: 'Sporcu Adı Soyadı',
    category: 'identity',
    categoryLabel: '1. Kimlik & Dönem',
    unit: 'Metin',
    required: true,
    description: 'Karne sahibinin tam adı (Zorunlu alan)',
    aliases: ['Sporcu_Adi', 'Sporcu Adı', 'Ad Soyad', 'Ad_Soyad', 'Öğrenci Adı Soyadı', 'Öğrenci Adı', 'İsim', 'Isim', 'Adı Soyadı', 'Name', 'Athlete'],
  },
  {
    key: 'Sporcu_Kodu',
    label: 'Sporcu / Lisans Kodu',
    category: 'identity',
    categoryLabel: '1. Kimlik & Dönem',
    unit: 'Kod',
    description: 'Lisans veya kulüp kayıt numarası',
    aliases: ['Sporcu_Kodu', 'Sporcu Kodu', 'Kayıt No', 'Lisans No', 'Öğrenci No', 'Kod', 'Numara', 'ID', 'Code'],
  },
  {
    key: 'Brans',
    label: 'Spor Branşı / Grup',
    category: 'identity',
    categoryLabel: '1. Kimlik & Dönem',
    unit: 'Metin',
    description: 'Sporcunun branşı veya yaş grubu (Örn: Futbol / U12)',
    aliases: ['Brans', 'Branş', 'Branş / Takım', 'Spor Branşı', 'Grup', 'Takım', 'Kategori', 'Branch', 'Sport'],
  },
  {
    key: 'Cinsiyet',
    label: 'Cinsiyet',
    category: 'identity',
    categoryLabel: '1. Kimlik & Dönem',
    unit: 'Erkek / Kadın',
    description: 'Normatif yüzdelik ve PHV hesabı için cinsiyet',
    aliases: ['Cinsiyet', 'Cinsiyeti', 'K/E', 'E/K', 'Gender', 'Sex'],
  },
  {
    key: 'Yas',
    label: 'Takvim Yaşı (Yıl)',
    category: 'identity',
    categoryLabel: '1. Kimlik & Dönem',
    unit: 'Yıl',
    description: 'Sporcunun ondalık takvim yaşı (Örn: 11.4)',
    aliases: ['Yas', 'Yaş', 'Yaşı', 'Takvim Yaşı', 'Age'],
  },
  {
    key: 'Kulup_Adi',
    label: 'Kulüp / Spor Okulu Adı',
    category: 'identity',
    categoryLabel: '1. Kimlik & Dönem',
    unit: 'Metin',
    description: 'Boş bırakılırsa üstteki kurumsal okul adı uygulanır',
    aliases: ['Kulup_Adi', 'Kulüp', 'Kulüp Adı', 'Spor Okulu', 'Okul Adı', 'Club'],
  },
  {
    key: 'Sube',
    label: 'Şube / Kampüs',
    category: 'identity',
    categoryLabel: '1. Kimlik & Dönem',
    unit: 'Metin',
    description: 'Kampüs veya tesis bilgisi',
    aliases: ['Sube', 'Şube', 'Kampüs', 'Tesis', 'Birim'],
  },
  {
    key: 'Olcum_1_Tarihi',
    label: '1. Ölçüm Tarihi',
    category: 'identity',
    categoryLabel: '1. Kimlik & Dönem',
    unit: 'Tarih',
    description: '1. test dönemi tarihi',
    aliases: ['Olcum_1_Tarihi', '1. Ölçüm Tarihi', 'İlk Ölçüm Tarihi', 'Tarih 1', 'Date 1'],
  },
  {
    key: 'Olcum_2_Tarihi',
    label: '2. Ölçüm Tarihi',
    category: 'identity',
    categoryLabel: '1. Kimlik & Dönem',
    unit: 'Tarih',
    description: '2. test dönemi tarihi',
    aliases: ['Olcum_2_Tarihi', '2. Ölçüm Tarihi', 'Ara Ölçüm Tarihi', 'Tarih 2', 'Date 2'],
  },
  {
    key: 'Olcum_3_Tarihi',
    label: '3. Ölçüm Tarihi (Güncel)',
    category: 'identity',
    categoryLabel: '1. Kimlik & Dönem',
    unit: 'Tarih',
    description: 'Güncel / son test dönemi tarihi',
    aliases: ['Olcum_3_Tarihi', '3. Ölçüm Tarihi', 'Ölçüm Tarihi', 'Son Ölçüm Tarihi', 'Tarih', 'Tarih 3', 'Date'],
  },

  // 2. Beden Kompozisyonu
  {
    key: 'Boy_1',
    label: 'Boy Uzunluğu — 1. Ölçüm',
    category: 'body',
    categoryLabel: '2. Beden Kompozisyonu',
    unit: 'cm',
    description: '1. dönem boy ölçümü',
    aliases: ['Boy_1', '1. Boy', 'Boy 1', 'İlk Boy (cm)', 'İlk Boy', 'Height 1'],
  },
  {
    key: 'Boy_2',
    label: 'Boy Uzunluğu — 2. Ölçüm',
    category: 'body',
    categoryLabel: '2. Beden Kompozisyonu',
    unit: 'cm',
    description: '2. dönem boy ölçümü',
    aliases: ['Boy_2', '2. Boy', 'Boy 2', 'Ara Boy', 'Height 2'],
  },
  {
    key: 'Boy_3',
    label: 'Boy Uzunluğu — 3. Ölçüm (Güncel)',
    category: 'body',
    categoryLabel: '2. Beden Kompozisyonu',
    unit: 'cm',
    description: 'Güncel boy uzunluğu (Tek boy sütunu varsa buraya eşleştirin)',
    aliases: ['Boy_3', '3. Boy', 'Boy 3', 'Son Boy Ölçümü (cm)', 'Güncel Boy', 'Boy (cm)', 'Boy', 'Boy Uzunluğu', 'Height'],
  },
  {
    key: 'Agirlik_1',
    label: 'Vücut Ağırlığı (Kilo) — 1. Ölçüm',
    category: 'body',
    categoryLabel: '2. Beden Kompozisyonu',
    unit: 'kg',
    description: '1. dönem vücut ağırlığı',
    aliases: ['Agirlik_1', 'Ağırlık 1', 'Kilo 1', 'İlk Kilo (kg)', 'İlk Kilo', 'Weight 1'],
  },
  {
    key: 'Agirlik_2',
    label: 'Vücut Ağırlığı (Kilo) — 2. Ölçüm',
    category: 'body',
    categoryLabel: '2. Beden Kompozisyonu',
    unit: 'kg',
    description: '2. dönem vücut ağırlığı',
    aliases: ['Agirlik_2', 'Ağırlık 2', 'Kilo 2', 'Ara Kilo', 'Weight 2'],
  },
  {
    key: 'Agirlik_3',
    label: 'Vücut Ağırlığı (Kilo) — 3. Ölçüm (Güncel)',
    category: 'body',
    categoryLabel: '2. Beden Kompozisyonu',
    unit: 'kg',
    description: 'Güncel vücut ağırlığı (Tek kilo sütunu varsa buraya eşleştirin)',
    aliases: ['Agirlik_3', 'Ağırlık 3', 'Kilo 3', 'Güncel Kilo (kg)', 'Kilosu', 'Kilo (kg)', 'Kilo', 'Ağırlık', 'Vücut Ağırlığı', 'Weight'],
  },
  {
    key: 'BKI_3',
    label: 'Beden Kütle İndeksi (BKİ) — 3. Ölçüm',
    category: 'body',
    categoryLabel: '2. Beden Kompozisyonu',
    unit: 'kg/m²',
    description: 'Eşleştirilmezse Boy ve Kilo değerlerinden otomatik hesaplanır',
    aliases: ['BKI_3', 'BKİ 3', 'BKI', 'BKİ', 'BMI', 'Vücut Kitle İndeksi'],
  },
  {
    key: 'Yag_Yuzdesi_1',
    label: 'Beden Yağ Yüzdesi — 1. Ölçüm',
    category: 'body',
    categoryLabel: '2. Beden Kompozisyonu',
    unit: '%',
    description: '1. dönem yağ oranı',
    aliases: ['Yag_Yuzdesi_1', 'Yağ 1', 'İlk Yağ Oranı'],
  },
  {
    key: 'Yag_Yuzdesi_2',
    label: 'Beden Yağ Yüzdesi — 2. Ölçüm',
    category: 'body',
    categoryLabel: '2. Beden Kompozisyonu',
    unit: '%',
    description: '2. dönem yağ oranı',
    aliases: ['Yag_Yuzdesi_2', 'Yağ 2', 'Ara Yağ Oranı'],
  },
  {
    key: 'Yag_Yuzdesi_3',
    label: 'Beden Yağ Yüzdesi — 3. Ölçüm (Güncel)',
    category: 'body',
    categoryLabel: '2. Beden Kompozisyonu',
    unit: '%',
    description: 'Güncel deri altı yağ yüzdesi',
    aliases: ['Yag_Yuzdesi_3', 'Yag_Yuzdesi', 'Yağ Oranı (%)', 'Yağ Oranı', 'Yağ Yüzdesi', 'Yağ %', 'Body Fat'],
  },
  {
    key: 'Oturma_Boyu_3',
    label: 'Oturma (Büst) Boyu — 3. Ölçüm',
    category: 'body',
    categoryLabel: '2. Beden Kompozisyonu',
    unit: 'cm',
    description: 'Eşleştirilmezse boy uzunluğuyla orantılı hesaplanır',
    aliases: ['Oturma_Boyu_3', 'Oturma Boyu', 'Büst Boyu', 'Sitting Height'],
  },
  {
    key: 'Kulac_3',
    label: 'Kulaç Uzunluğu — 3. Ölçüm',
    category: 'body',
    categoryLabel: '2. Beden Kompozisyonu',
    unit: 'cm',
    description: 'Eşleştirilmezse boy uzunluğuyla orantılı hesaplanır',
    aliases: ['Kulac_3', 'Kulaç Uzunluğu', 'Kulaç', 'Arm Span'],
  },

  // 3. Motor Performans
  {
    key: 'Surat_1',
    label: '20m Sürat Koşusu — 1. Ölçüm',
    category: 'motor',
    categoryLabel: '3. Motor Performans',
    unit: 'sn',
    description: '1. dönem 20m sprint süresi',
    aliases: ['Surat_1', 'Sürat 1', 'İlk 20m Sürat', 'Sprint 1'],
  },
  {
    key: 'Surat_2',
    label: '20m Sürat Koşusu — 2. Ölçüm',
    category: 'motor',
    categoryLabel: '3. Motor Performans',
    unit: 'sn',
    description: '2. dönem 20m sprint süresi',
    aliases: ['Surat_2', 'Sürat 2', 'Ara 20m Sürat', 'Sprint 2'],
  },
  {
    key: 'Surat_3',
    label: '20m Sürat Koşusu — 3. Ölçüm (Güncel)',
    category: 'motor',
    categoryLabel: '3. Motor Performans',
    unit: 'sn',
    description: 'Güncel 20m sürat süresi (Tek sürat sütunu varsa buraya eşleştirin)',
    aliases: ['Surat_3', 'Surat', 'Sürat', '20 Metre Koşu (sn)', '20m Sürat', '20m Sprint', 'Sprint'],
  },
  {
    key: 'Cabukluk_1',
    label: '10x5m Çabukluk Testi — 1. Ölçüm',
    category: 'motor',
    categoryLabel: '3. Motor Performans',
    unit: 'sn',
    description: '1. dönem 10x5m yön değiştirme süresi',
    aliases: ['Cabukluk_1', 'Çabukluk 1', 'Agility 1'],
  },
  {
    key: 'Cabukluk_2',
    label: '10x5m Çabukluk Testi — 2. Ölçüm',
    category: 'motor',
    categoryLabel: '3. Motor Performans',
    unit: 'sn',
    description: '2. dönem 10x5m yön değiştirme süresi',
    aliases: ['Cabukluk_2', 'Çabukluk 2', 'Agility 2'],
  },
  {
    key: 'Cabukluk_3',
    label: '10x5m Çabukluk Testi — 3. Ölçüm (Güncel)',
    category: 'motor',
    categoryLabel: '3. Motor Performans',
    unit: 'sn',
    description: 'Güncel 10x5m çabukluk süresi',
    aliases: ['Cabukluk_3', 'Cabukluk', 'Çabukluk', '10x5m Çabukluk (sn)', '10x5m', 'Çeviklik', 'Agility'],
  },
  {
    key: 'Reaksiyon_3',
    label: 'Görsel Reaksiyon Sürati — 3. Ölçüm',
    category: 'motor',
    categoryLabel: '3. Motor Performans',
    unit: 'sn',
    description: 'Görsel reaksiyon testi süresi',
    aliases: ['Reaksiyon_3', 'Reaksiyon', 'Reaksiyon Sürati', 'Reaction'],
  },
  {
    key: 'Sirt_Kuvveti_3',
    label: 'Sırt Kuvveti — 3. Ölçüm',
    category: 'motor',
    categoryLabel: '3. Motor Performans',
    unit: 'kg',
    description: 'Sırt dinamometre kuvvet ölçümü',
    aliases: ['Sirt_Kuvveti_3', 'Sirt_Kuvveti', 'Sırt Kuvveti', 'Sırt Dinamometre (kg)', 'Back Strength'],
  },
  {
    key: 'Kavrama_Kuvveti_3',
    label: 'El Kavrama (Pençe) Kuvveti — 3. Ölçüm',
    category: 'motor',
    categoryLabel: '3. Motor Performans',
    unit: 'kg',
    description: 'Dominant el kavrama kuvvet ölçümü',
    aliases: ['Kavrama_Kuvveti_3', 'Kavrama_Kuvveti', 'Kavrama Kuvveti', 'Pençe Kuvveti (kg)', 'Pençe Kuvveti', 'El Kavrama', 'Handgrip'],
  },
  {
    key: 'Durarak_Uzun_Atlama_3',
    label: 'Durarak Uzun Atlama — 3. Ölçüm',
    category: 'motor',
    categoryLabel: '3. Motor Performans',
    unit: 'cm',
    description: 'Çift ayak yatay sıçrama mesafesi',
    aliases: ['Durarak_Uzun_Atlama_3', 'Durarak Uzun Atlama (cm)', 'Durarak Uzun Atlama', 'Uzun_Atlama', 'Uzun Atlama', 'Broad Jump'],
  },
  {
    key: 'Dikey_Sicrama_3',
    label: 'Dikey Sıçrama — 3. Ölçüm',
    category: 'motor',
    categoryLabel: '3. Motor Performans',
    unit: 'cm',
    description: 'Dikey sıçrama yüksekliği (Anaerobik güç W/kg hesabında da kullanılır)',
    aliases: ['Dikey_Sicrama_3', 'Dikey_Sicrama', 'Dikey Sıçrama Testi (cm)', 'Dikey Sıçrama', 'CMJ', 'Vertical Jump'],
  },
  {
    key: 'Denge_3',
    label: 'Flamingo Denge Testi — 3. Ölçüm',
    category: 'motor',
    categoryLabel: '3. Motor Performans',
    unit: 'hata',
    description: '60 sn tek ayak denge hata sayısı',
    aliases: ['Denge_3', 'Denge', 'Flamingo Denge', 'Balance'],
  },
  {
    key: 'Esneklik_3',
    label: 'Otur-Eriş Esneklik — 3. Ölçüm',
    category: 'motor',
    categoryLabel: '3. Motor Performans',
    unit: 'cm',
    description: 'Otur-eriş sehpası esneklik ölçümü',
    aliases: ['Esneklik_3', 'Esneklik', 'Otur Eriş Esneklik (cm)', 'Otur Eriş', 'Flexibility'],
  },
  {
    key: 'VO2max_3',
    label: 'VO2max / Aerobik Kapasite — 3. Ölçüm',
    category: 'motor',
    categoryLabel: '3. Motor Performans',
    unit: 'ml/kg/dk',
    description: 'Maksimal oksijen tüketimi (VO2peak)',
    aliases: ['VO2max_3', 'VO2max', 'Mekik VO2max', 'VO2peak', 'Aerobik Güç'],
  },

  // 4. Somatotip, PACER, PHV & Genel Puan
  {
    key: 'PACER_Mesafe_3',
    label: 'PACER / Mekik Koşu Mesafesi — 3. Ölçüm',
    category: 'advanced',
    categoryLabel: '4. Somatotip, PHV & Puan',
    unit: 'metre',
    description: '20m mekik koşusu toplam mesafesi',
    aliases: ['PACER_Mesafe_3', 'Mekik Mesafesi (m)', 'Mekik Mesafesi', 'PACER', 'Shuttle Run'],
  },
  {
    key: 'Endomorfi',
    label: 'Endomorfi (Somatotip)',
    category: 'advanced',
    categoryLabel: '4. Somatotip, PHV & Puan',
    unit: 'puan',
    description: 'Heath-Carter Endomorfi bileşeni',
    aliases: ['Endomorfi', 'Endo', 'Endomorphy'],
  },
  {
    key: 'Mezomorfi',
    label: 'Mezomorfi (Somatotip)',
    category: 'advanced',
    categoryLabel: '4. Somatotip, PHV & Puan',
    unit: 'puan',
    description: 'Heath-Carter Mezomorfi (kas-iskelet) bileşeni',
    aliases: ['Mezomorfi', 'Mezo', 'Meso', 'Mesomorphy'],
  },
  {
    key: 'Ektomorfi',
    label: 'Ektomorfi (Somatotip)',
    category: 'advanced',
    categoryLabel: '4. Somatotip, PHV & Puan',
    unit: 'puan',
    description: 'Heath-Carter Ektomorfi (doğrusallık) bileşeni',
    aliases: ['Ektomorfi', 'Ekto', 'Ecto', 'Ectomorphy'],
  },
  {
    key: 'PHV_Yasi',
    label: 'PHV (Tepe Boy Hızı) Yaşı',
    category: 'advanced',
    categoryLabel: '4. Somatotip, PHV & Puan',
    unit: 'Yaş',
    description: 'Tahmini büyüme atağı (Peak Height Velocity) yaşı',
    aliases: ['PHV_Yasi', 'PHV Yaşı', 'PHV', 'Büyüme Atağı Yaşı'],
  },
  {
    key: 'Tahmini_18_Yas_Boyu',
    label: 'Tahmini 18 Yaş Yetişkin Boyu',
    category: 'advanced',
    categoryLabel: '4. Somatotip, PHV & Puan',
    unit: 'cm',
    description: 'Khamis-Roche / Mirwald 18 yaş boy projeksiyonu',
    aliases: ['Tahmini_18_Yas_Boyu', 'Tahmini Yetişkin Boyu', '18 Yaş Boyu', 'Tahmini Boy', 'Hedef Boy'],
  },
  {
    key: 'Genel_Performans_Puani',
    label: 'Genel Performans Puanı (3. Ölçüm)',
    category: 'advanced',
    categoryLabel: '4. Somatotip, PHV & Puan',
    unit: '0-100',
    description: 'Boş bırakılırsa motor test yüzdeliklerinden otomatik hesaplanır',
    aliases: ['Genel_Performans_Puani', 'Genel Skor', 'Performans Puanı', 'Genel Puan', 'Toplam Puan', 'Score'],
  },
  {
    key: 'Uzman_Gorusu',
    label: 'Uzman / Antrenör Görüşü',
    category: 'advanced',
    categoryLabel: '4. Somatotip, PHV & Puan',
    unit: 'Metin',
    description: 'Karne 7. sayfasında yer alan uzman değerlendirme metni',
    aliases: ['Uzman_Gorusu', 'Antrenör Değerlendirmesi', 'Uzman Görüşü', 'Antrenör Notu', 'Yorum', 'Açıklama'],
  },
];

/**
 * Sample rows using a DIFFERENT / CUSTOM school Excel format (non-standard Turkish headers)
 * so users can test how the Column Mapping UI adapts to different Excel structures.
 */
export const CUSTOM_FORMAT_SAMPLE_ROWS: Record<string, string | number>[] = [
  {
    'Öğrenci Adı Soyadı': 'Doruk Çelik',
    'Kayıt No': 'AKD-2026-401',
    'Branş / Takım': 'Basketbol / U13 Performans',
    Cinsiyeti: 'Erkek',
    Yaşı: 12.4,
    'Ölçüm Tarihi': '25.09.2026',
    'İlk Boy (cm)': 156.0,
    'Son Boy Ölçümü (cm)': 163.8,
    'Güncel Kilo (kg)': 50.4,
    'Yağ Oranı (%)': 16.2,
    '20 Metre Koşu (sn)': 3.64,
    '10x5m Çabukluk (sn)': 18.1,
    'Dikey Sıçrama Testi (cm)': 36.5,
    'Durarak Uzun Atlama (cm)': 176,
    'Pençe Kuvveti (kg)': 29.1,
    'Sırt Dinamometre (kg)': 54.0,
    'Otur Eriş Esneklik (cm)': 39.0,
    'Mekik VO2max': 43.1,
    'Mekik Mesafesi (m)': 740,
    'Tahmini Yetişkin Boyu': 194.2,
    'Genel Skor': 86,
    'Antrenör Değerlendirmesi':
      'Doruk ribaund sıçrama yüksekliği ve açık saha geçiş süratinde U13 grubunun en üst dilimindedir.',
  },
  {
    'Öğrenci Adı Soyadı': 'Defne Öztürk',
    'Kayıt No': 'AKD-2026-402',
    'Branş / Takım': 'Voleybol / U12 Yıldız Aday',
    Cinsiyeti: 'Kadın',
    Yaşı: 11.7,
    'Ölçüm Tarihi': '25.09.2026',
    'İlk Boy (cm)': 149.2,
    'Son Boy Ölçümü (cm)': 155.6,
    'Güncel Kilo (kg)': 43.8,
    'Yağ Oranı (%)': 17.8,
    '20 Metre Koşu (sn)': 3.78,
    '10x5m Çabukluk (sn)': 18.7,
    'Dikey Sıçrama Testi (cm)': 32.0,
    'Durarak Uzun Atlama (cm)': 163,
    'Pençe Kuvveti (kg)': 25.0,
    'Sırt Dinamometre (kg)': 45.5,
    'Otur Eriş Esneklik (cm)': 45.0,
    'Mekik VO2max': 41.4,
    'Mekik Mesafesi (m)': 660,
    'Tahmini Yetişkin Boyu': 177.5,
    'Genel Skor': 84,
    'Antrenör Değerlendirmesi':
      'Defne blok sıçrama zamanlaması ve gövde esnekliğinde belirgin gelişim göstermiştir.',
  },
  {
    'Öğrenci Adı Soyadı': 'Mertcan Polat',
    'Kayıt No': 'AKD-2026-403',
    'Branş / Takım': 'Futbol / U11 Akademi',
    Cinsiyeti: 'Erkek',
    Yaşı: 10.8,
    'Ölçüm Tarihi': '25.09.2026',
    'İlk Boy (cm)': 138.4,
    'Son Boy Ölçümü (cm)': 143.5,
    'Güncel Kilo (kg)': 36.2,
    'Yağ Oranı (%)': 15.1,
    '20 Metre Koşu (sn)': 3.69,
    '10x5m Çabukluk (sn)': 17.9,
    'Dikey Sıçrama Testi (cm)': 30.5,
    'Durarak Uzun Atlama (cm)': 159,
    'Pençe Kuvveti (kg)': 22.8,
    'Sırt Dinamometre (kg)': 41.0,
    'Otur Eriş Esneklik (cm)': 40.5,
    'Mekik VO2max': 44.8,
    'Mekik Mesafesi (m)': 800,
    'Tahmini Yetişkin Boyu': 178.4,
    'Genel Skor': 87,
    'Antrenör Değerlendirmesi':
      'Mertcan dar alan çevikliği (17.9 sn) ve mekik koşusu dayanıklılığında yaş grubunun lideridir.',
  },
  {
    'Öğrenci Adı Soyadı': 'Nilsu Aksoy',
    'Kayıt No': 'AKD-2026-404',
    'Branş / Takım': 'Yüzme / Performans Takımı',
    Cinsiyeti: 'Kadın',
    Yaşı: 11.3,
    'Ölçüm Tarihi': '25.09.2026',
    'İlk Boy (cm)': 145.0,
    'Son Boy Ölçümü (cm)': 151.8,
    'Güncel Kilo (kg)': 41.0,
    'Yağ Oranı (%)': 16.5,
    '20 Metre Koşu (sn)': 3.74,
    '10x5m Çabukluk (sn)': 18.4,
    'Dikey Sıçrama Testi (cm)': 31.5,
    'Durarak Uzun Atlama (cm)': 162,
    'Pençe Kuvveti (kg)': 26.0,
    'Sırt Dinamometre (kg)': 47.0,
    'Otur Eriş Esneklik (cm)': 47.0,
    'Mekik VO2max': 46.2,
    'Mekik Mesafesi (m)': 840,
    'Tahmini Yetişkin Boyu': 174.0,
    'Genel Skor': 89,
    'Antrenör Değerlendirmesi':
      'Nilsu aerobik kapasite (VO2max 46.2) ve omuz-gövde esnekliğinde elit yüzücü normlarını yakalamıştır.',
  },
];

const LAB_COLUMN_MAPPING_STORAGE_KEY = 'sportsfly_lab_excel_column_mapping_v1';

export function getStoredLabColumnMapping(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LAB_COLUMN_MAPPING_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveStoredLabColumnMapping(mapping: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LAB_COLUMN_MAPPING_STORAGE_KEY, JSON.stringify(mapping));
  } catch (err) {
    console.warn('Sütun eşleştirme ayarları kaydedilemedi:', err);
  }
}

/**
 * Normalizes a header string (lowercase, Turkish chars folded, punctuation/spaces removed)
 * for high-accuracy fuzzy matching between Excel headers and system report card fields.
 */
function normalizeHeaderToken(str: string): string {
  return str
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Automatically matches each mappable system field (`field.key`) to the best column header
 * present in `excelHeaders`.
 */
export function autoDetectExcelColumnMapping(
  excelHeaders: string[],
  useSavedPreferences: boolean = true
): Record<string, string> {
  const mapping: Record<string, string> = {};
  const savedMapping = useSavedPreferences ? getStoredLabColumnMapping() : {};
  const usedHeaders = new Set<string>();

  const normalizedExcelHeaders = excelHeaders.map((h) => ({
    raw: h,
    norm: normalizeHeaderToken(h),
  }));

  // Pass 1: Exact normalized match with saved preference or field key / aliases
  LAB_BATCH_MAPPABLE_FIELDS.forEach((field) => {
    // Check saved user mapping first if that column exists in the current Excel file
    const savedCol = savedMapping[field.key];
    if (savedCol && excelHeaders.includes(savedCol) && !usedHeaders.has(savedCol)) {
      mapping[field.key] = savedCol;
      usedHeaders.add(savedCol);
      return;
    }

    const candidateNorms = [field.key, ...field.aliases].map(normalizeHeaderToken);
    for (const cand of candidateNorms) {
      const hit = normalizedExcelHeaders.find(
        (eh) => eh.norm === cand && !usedHeaders.has(eh.raw)
      );
      if (hit) {
        mapping[field.key] = hit.raw;
        usedHeaders.add(hit.raw);
        return;
      }
    }
  });

  // Pass 2: Substring / partial match for any still-unmapped fields
  LAB_BATCH_MAPPABLE_FIELDS.forEach((field) => {
    if (mapping[field.key]) return;
    const candidateNorms = field.aliases
      .map(normalizeHeaderToken)
      .filter((c) => c.length >= 4);

    for (const cand of candidateNorms) {
      const hit = normalizedExcelHeaders.find(
        (eh) =>
          !usedHeaders.has(eh.raw) &&
          (eh.norm.includes(cand) || (eh.norm.length >= 4 && cand.includes(eh.norm)))
      );
      if (hit) {
        mapping[field.key] = hit.raw;
        usedHeaders.add(hit.raw);
        return;
      }
    }
  });

  return mapping;
}

export interface ParsedExcelSheetData {
  sheetName: string;
  headers: string[];
  rows: Record<string, any>[];
  isParameterVerticalSheet: boolean;
}

/**
 * Extracts all tabular sheets, their headers, and raw row objects from an uploaded Excel file
 * so the user can inspect and map columns interactively.
 */
export function extractExcelWorkbookSheets(buffer: ArrayBuffer): ParsedExcelSheetData[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheets: ParsedExcelSheetData[] = [];

  for (const sheetName of wb.SheetNames) {
    if (sheetName.toLowerCase().includes('kilavuz') || sheetName.toLowerCase().includes('kılavuz')) {
      continue;
    }
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
    if (!rows || rows.length === 0) continue;

    const headers = Object.keys(rows[0]).filter((h) => h && !h.startsWith('__EMPTY'));
    if (headers.length === 0) continue;

    const lowerKeys = headers.map((k) => k.toLowerCase());
    const isParameterVerticalSheet =
      lowerKeys.some((k) => k.includes('parametre')) &&
      lowerKeys.some((k) => k.includes('olcum') || k.includes('ölçüm') || k === 'i' || k === 'iii');

    sheets.push({
      sheetName,
      headers,
      rows,
      isParameterVerticalSheet,
    });
  }

  return sheets;
}

/**
 * Builds an array of 7-page SportsFlyLabReport items from raw Excel rows using the user's
 * interactive `columnMapping` (systemFieldKey -> excelHeaderName).
 */
export function buildBatchReportsFromMappedRows(
  rawRows: Record<string, any>[],
  columnMapping: Record<string, string>,
  baseTemplate: SportsFlyLabReport
): SportsFlyLabReport[] {
  const activeBranding = getStoredLabSchoolBranding();
  const brandedTemplate = applyBrandingToReport(baseTemplate, activeBranding);
  const results: SportsFlyLabReport[] = [];

  rawRows.forEach((rawRow, idx) => {
    const mappedRow: Record<string, any> = {};

    // Copy original row properties as fallback, then override with explicit user column mappings
    Object.assign(mappedRow, rawRow);

    Object.entries(columnMapping).forEach(([systemKey, excelHeader]) => {
      if (excelHeader && rawRow[excelHeader] !== undefined) {
        mappedRow[systemKey] = rawRow[excelHeader];
      }
    });

    const rep = buildLabReportFromExcelRow(mappedRow, idx, brandedTemplate, activeBranding);
    if (rep) {
      results.push(rep);
    }
  });

  return results;
}

/**
 * Parses an uploaded Excel (.xlsx / .xls / .csv) file and returns updated/created SportsFlyLabReport items.
 * Supports both Parameter-based sheets ("Parametre_Bazli_Karne") and Flat Athlete Row sheets ("Toplu_Sporcu_Listesi" or custom Excel files).
 */
export function parseSportsFlyLabExcel(
  buffer: ArrayBuffer,
  baseTemplate: SportsFlyLabReport,
  preferBatchSheet: boolean = false
): SportsFlyLabReport[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const paramResults: SportsFlyLabReport[] = [];
  const flatBatchResults: SportsFlyLabReport[] = [];
  const activeBranding = getStoredLabSchoolBranding();
  const brandedTemplate = applyBrandingToReport(baseTemplate, activeBranding);

  // Helper to safely parse numbers (supporting Turkish comma decimals like "19,33")
  const toNum = (val: unknown, fallback: number): number => {
    if (typeof val === 'number' && !Number.isNaN(val)) return val;
    if (typeof val === 'string') {
      const cleaned = val.trim().replace(',', '.').replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return fallback;
  };

  for (const sheetName of wb.SheetNames) {
    // Skip reference guide sheet
    if (sheetName.toLowerCase().includes('kilavuz') || sheetName.toLowerCase().includes('kılavuz')) {
      continue;
    }

    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
    if (!rows || rows.length === 0) continue;

    const firstRowKeys = Object.keys(rows[0]).map((k) => k.toLowerCase());

    // Case 1: Parameter-by-Parameter vertical table (has Parametre_Adi / Parametre_Kodu / Olcum_1 / Olcum_2 / Olcum_3)
    const isParamSheet =
      firstRowKeys.some((k) => k.includes('parametre')) &&
      firstRowKeys.some((k) => k.includes('olcum') || k.includes('ölçüm') || k === 'i' || k === 'iii');

    if (isParamSheet) {
      const cloned: SportsFlyLabReport = JSON.parse(JSON.stringify(brandedTemplate));
      cloned.id = `lab-excel-${Date.now()}`;

      rows.forEach((r) => {
        const code = String(r.Parametre_Kodu || r.parametre_kodu || '').trim().toLowerCase();
        const name = String(r.Parametre_Adi || r.Parametre || r.parametre_adi || '').trim();
        const m1 = r.Olcum_1 ?? r['1. Ölçüm'] ?? r.I;
        const m2 = r.Olcum_2 ?? r['2. Ölçüm'] ?? r.II;
        const m3 = r.Olcum_3 ?? r['3. Ölçüm'] ?? r.III;
        const pct = r.Yuzdelik ?? r['Yüzdelik'];
        const sd = r.SD_Skoru ?? r.SD;
        const status = r.Durum ?? r['Değerlendirme'];
        const target = r.Beklenen_Hedef ?? r.Hedef;

        if (code === 'athlete_info') {
          if (name) cloned.athleteName = name;
          if (r.Birim) cloned.sportBranch = String(r.Birim);
          if (m1) cloned.date1 = String(m1);
          if (m2) cloned.date2 = String(m2);
          if (m3) cloned.date3 = String(m3);
          if (pct) cloned.ageYears = toNum(pct, cloned.ageYears);
          if (sd) cloned.phvAge = toNum(sd, cloned.phvAge);
          if (status) cloned.clubName = String(status);
          if (target) cloned.predictedAdultHeight = toNum(target, cloned.predictedAdultHeight);
          return;
        }

        // Match in bodyComposition
        const bodyItem = cloned.bodyComposition.find(
          (b) => b.id === code || b.name.toLowerCase() === name.toLowerCase()
        );
        if (bodyItem) {
          bodyItem.m1 = toNum(m1, bodyItem.m1);
          bodyItem.m2 = toNum(m2, bodyItem.m2);
          bodyItem.m3 = toNum(m3, bodyItem.m3);
          bodyItem.percentile = toNum(pct, bodyItem.percentile);
          bodyItem.sd = toNum(sd, bodyItem.sd);
          if (status) bodyItem.status = String(status).toLowerCase() as any;
          return;
        }

        // Match in motorPerformance
        const motorItem = cloned.motorPerformance.find(
          (m) => m.id === code || m.name.toLowerCase().includes(name.toLowerCase())
        );
        if (motorItem && name) {
          motorItem.m1 = toNum(m1, motorItem.m1);
          motorItem.m2 = toNum(m2, motorItem.m2);
          motorItem.m3 = toNum(m3, motorItem.m3);
          motorItem.percentile = toNum(pct, motorItem.percentile);
          motorItem.sd = toNum(sd, motorItem.sd);
          if (status) motorItem.status = String(status).toLowerCase() as any;

          const ips = cloned.ipsativeTargets.find((t) =>
            motorItem.name.toLowerCase().includes(t.parameter.toLowerCase())
          );
          if (ips) {
            ips.m1 = motorItem.m1;
            ips.m2 = motorItem.m2;
            ips.m3 = motorItem.m3;
            if (target !== undefined && target !== '') {
              ips.target = toNum(target, ips.target);
            }
          }
          return;
        }

        if (code === 'somatotype_endo' || name.toLowerCase().includes('endomorfi')) {
          cloned.somatotype.m1.endo = toNum(m1, cloned.somatotype.m1.endo);
          cloned.somatotype.m2.endo = toNum(m2, cloned.somatotype.m2.endo);
          cloned.somatotype.m3.endo = toNum(m3, cloned.somatotype.m3.endo);
        } else if (code === 'somatotype_meso' || name.toLowerCase().includes('mezomorfi')) {
          cloned.somatotype.m1.meso = toNum(m1, cloned.somatotype.m1.meso);
          cloned.somatotype.m2.meso = toNum(m2, cloned.somatotype.m2.meso);
          cloned.somatotype.m3.meso = toNum(m3, cloned.somatotype.m3.meso);
        } else if (code === 'somatotype_ecto' || name.toLowerCase().includes('ektomorfi')) {
          cloned.somatotype.m1.ecto = toNum(m1, cloned.somatotype.m1.ecto);
          cloned.somatotype.m2.ecto = toNum(m2, cloned.somatotype.m2.ecto);
          cloned.somatotype.m3.ecto = toNum(m3, cloned.somatotype.m3.ecto);
        } else if (code === 'pacer_distance') {
          cloned.cardio.test1Distance = toNum(m1, cloned.cardio.test1Distance);
          cloned.cardio.test2Distance = toNum(m2, cloned.cardio.test2Distance);
          cloned.cardio.test3Distance = toNum(m3, cloned.cardio.test3Distance);
        } else if (code === 'expert_comment' || name.toLowerCase().includes('uzman görüşü') || name.toLowerCase().includes('uzman değerlendirme')) {
          const val = m3 || m2 || m1;
          if (val && String(val).trim() !== '-') {
            cloned.expertComment = String(val).trim();
          }
        }
      });

      const finalParamReport = applyBrandingToReport(cloned, activeBranding);
      finalParamReport.aiRecommendations = analyzeLabPerformanceMetrics(finalParamReport);
      paramResults.push(finalParamReport);
    } else if (
      firstRowKeys.some(
        (k) => k.includes('sporcu') || k.includes('ad') || k.includes('name') || k.includes('boy')
      )
    ) {
      // Case 2: Flat Multi-Athlete Sheet (Each row is an athlete)
      rows.forEach((r, idx) => {
        const rep = buildLabReportFromExcelRow(r, idx, brandedTemplate, activeBranding);
        if (rep) {
          flatBatchResults.push(rep);
        }
      });
    }
  }

  // If the user uploaded from the Batch creator or if the flat multi-athlete sheet has multiple athletes,
  // return the multi-athlete list cleanly without duplicating the single-athlete parameter sheet
  if (preferBatchSheet && flatBatchResults.length > 0) {
    return flatBatchResults;
  }
  if (flatBatchResults.length > 1) {
    return flatBatchResults;
  }
  if (paramResults.length > 0) {
    return paramResults;
  }
  return flatBatchResults;
}

/**
 * Automatically analyzes the athlete's Excel performance metrics (Motor Performance, Body Composition,
 * Somatotype, PHV & Cardio) and identifies areas for improvement, strengths, and training prescriptions.
 */
export function analyzeLabPerformanceMetrics(report: SportsFlyLabReport): LabAiPerformanceAnalysis {
  const drillCatalog: Record<string, { drill: string; freq: string; targetFactor: number }> = {
    sprint: {
      drill: '10m-20m çıkış ivmelenmesi, dirençli sprint (sled/lastik) ve A-Skip/B-Skip koşu mekaniği drilleri',
      freq: 'Haftada 2 Gün · 4x20m Tam Dinlenmeli',
      targetFactor: 0.96,
    },
    agility: {
      drill: '10x5m Pro-Agility yön değiştirme, deselerasyon-akselerasyon frenleme ve çabuk ayak merdiven kombinasyonları',
      freq: 'Haftada 3 Gün · 3 Set x 4 Tekrar',
      targetFactor: 0.95,
    },
    reaction: {
      drill: 'Görsel-işitsel uyaranlı ışık/renk reaksiyon drilleri ve bilişsel karar verme çabukluk oyunları',
      freq: 'Haftada 3 Gün · Antrenman Isınma Bloğu (10 dk)',
      targetFactor: 0.93,
    },
    back_strength: {
      drill: 'Posterior zincir izometrik gövde stabilizasyonu, Superman hold, glute bridge ve core anti-rotasyon egzersizleri',
      freq: 'Haftada 3 Gün · 3x12 Tekrar / 30 sn İzometrik',
      targetFactor: 1.08,
    },
    grip_strength: {
      drill: 'İzometrik kavrama (hand-grip), barfiks barında asılı kalma (dead hang) ve sağlık topu sıkma-fırlatma çalışmaları',
      freq: 'Haftada 2-3 Gün · 3x25 sn',
      targetFactor: 1.08,
    },
    standing_long_jump: {
      drill: 'Yatay pliometrik çift bacak sıçrama (broad jump), pogo hops ve eksantrik iniş mekaniği (landing) drilleri',
      freq: 'Haftada 2 Gün · 4x5 Patlayıcı Tekrar',
      targetFactor: 1.06,
    },
    vertical_jump: {
      drill: 'Countermovement Jump (CMJ), kutu sıçramaları (box jump) ve ayak bileği reaktif sertlik (stiffness) pliometriği',
      freq: 'Haftada 2 Gün · 4x6 Tekrar',
      targetFactor: 1.07,
    },
    balance: {
      drill: 'Tek ayak proprioseptif denge (BOSU / denge pedi), gözler kapalı stabilizasyon ve Y-Balance uzanma drilleri',
      freq: 'Haftada 3 Gün · 3x30 sn (Sağ/Sol)',
      targetFactor: 0.85,
    },
    flexibility: {
      drill: 'Hamstring-lomber zincir PNF esnetme, kalça fleksör mobilitesi ve antrenman sonu statik miyofasyal gevşetme',
      freq: 'Her Antrenman Sonu · 12-15 dk',
      targetFactor: 1.05,
    },
    aerobic: {
      drill: 'Yüksek yoğunluklu aralıklı koşu (HIIT 15sn/15sn MAS), 20m mekik tempo koşuları ve aerobik baz dayanıklılık oyunları',
      freq: 'Haftada 2 Gün · 2x6 dk Aralıklı Yüklenme',
      targetFactor: 1.06,
    },
  };

  const improvementAreas: LabAiImprovementItem[] = [];

  // 1. Scan Motor Performance metrics sorted by lowest percentile / SD
  const sortedMotor = [...report.motorPerformance].sort((a, b) => a.percentile - b.percentile);
  sortedMotor.forEach((m) => {
    const isWeak =
      m.percentile < 60 ||
      m.status === 'desteklenmeli' ||
      m.status === 'düşük' ||
      m.sd < 0;

    if (isWeak && improvementAreas.length < 4) {
      const catInfo = drillCatalog[m.id] || {
        drill: `${m.name} odaklı spesifik koordinasyon, kuvvet ve nöromüsküler gelişim drilleri`,
        freq: 'Haftada 2-3 Gün · 3 Set',
        targetFactor: m.lowerIsBetter ? 0.96 : 1.06,
      };

      const ipsMatch = report.ipsativeTargets.find((t) =>
        m.name.toLowerCase().includes(t.parameter.toLowerCase())
      );
      const computedTarget = ipsMatch
        ? ipsMatch.target
        : Number((m.m3 * catInfo.targetFactor).toFixed(2));

      const deltaFromM1 = m.lowerIsBetter ? m.m1 - m.m3 : m.m3 - m.m1;
      const trendText =
        deltaFromM1 > 0
          ? `1. ölçümden (${m.m1} ${m.unit}) 3. ölçüme (${m.m3} ${m.unit}) gelişim gösterse de normatif yüzdelik dilimi (%${m.percentile}) yaş grubu ortalamasının altındadır.`
          : `1. ölçümden (${m.m1} ${m.unit}) 3. ölçüme (${m.m3} ${m.unit}) ivme kaybı tespit edilmiştir (%${m.percentile} yüzdelik, ${m.sd} SD).`;

      improvementAreas.push({
        metricName: m.name,
        category: 'Motor Performans',
        currentValue: `${m.m3} ${m.unit}`,
        targetValue: `${computedTarget} ${m.unit}`,
        percentile: m.percentile,
        sd: m.sd,
        priority: m.percentile <= 35 || m.sd <= -0.5 ? 'Yüksek Öncelik' : 'Orta Öncelik',
        analysis: trendText,
        drillRecommendation: catInfo.drill,
        weeklyFrequency: catInfo.freq,
      });
    }
  });

  // 2. Scan Body Composition for high body fat / skinfolds or BMI imbalances
  const fatRow = report.bodyComposition.find((b) => b.id === 'body_fat');
  const bmiRow = report.bodyComposition.find((b) => b.id === 'bmi');
  if (fatRow && (fatRow.status === 'yüksek' || fatRow.sd > 0.9 || fatRow.percentile > 80)) {
    improvementAreas.push({
      metricName: `Beden Yağ Oranı (${fatRow.name})`,
      category: 'Beden Kompozisyonu',
      currentValue: `%${fatRow.m3} (${fatRow.sd > 0 ? '+' : ''}${fatRow.sd} SD)`,
      targetValue: `%${fatRow.refMid} (İdeal HFZ)`,
      percentile: fatRow.percentile,
      sd: fatRow.sd,
      priority: fatRow.sd > 1.4 ? 'Yüksek Öncelik' : 'Orta Öncelik',
      analysis: `Deri altı yağ yüzdesi I. ölçümde %${fatRow.m1} iken III. ölçümde %${fatRow.m3} seviyesindedir. Relatif patlayıcı güç (W/kg) ve mekik koşusu ekonomisini doğrudan sınırlamaktadır.`,
      drillRecommendation:
        'Antrenman sonu 12-15 dk aerobik yağ oksidasyon (Zone-2) koşuları, metabolik istasyon çalışmaları ve rafine karbonhidrat kısıtlaması',
      weeklyFrequency: 'Haftada 3 Gün · 15 dk Ek Aerobik Blok',
    });
  } else if (bmiRow && (bmiRow.status === 'yüksek' || bmiRow.status === 'düşük')) {
    improvementAreas.push({
      metricName: bmiRow.name,
      category: 'Beden Kompozisyonu',
      currentValue: `${bmiRow.m3} ${bmiRow.unit}`,
      targetValue: `${bmiRow.refMid} ${bmiRow.unit}`,
      percentile: bmiRow.percentile,
      sd: bmiRow.sd,
      priority: 'Gelişim Takibi',
      analysis: `BKİ değeri (${bmiRow.m3} kg/m²) sağlıklı uygunluk merkezi olan ${bmiRow.refMid} kg/m² değerine yaklaştırılmalıdır.`,
      drillRecommendation: 'Yağsız kas kütlesini (Mezomorfi) artırıcı vücut ağırlığı direnç egzersizleri ve dengeli enerji alımı',
      weeklyFrequency: 'Haftada 3 Gün · Fonksiyonel Kuvvet',
    });
  }

  // Ensure at least 3 improvement areas even for high-performing athletes (focusing on lowest relative metrics)
  if (improvementAreas.length < 3) {
    sortedMotor.slice(0, 3).forEach((m) => {
      if (!improvementAreas.some((item) => item.metricName === m.name)) {
        const catInfo = drillCatalog[m.id] || {
          drill: `${m.name} elit branş normuna geçiş drilleri`,
          freq: 'Haftada 2 Gün',
          targetFactor: m.lowerIsBetter ? 0.96 : 1.05,
        };
        improvementAreas.push({
          metricName: m.name,
          category: 'Motor Performans',
          currentValue: `${m.m3} ${m.unit}`,
          targetValue: `${Number((m.m3 * catInfo.targetFactor).toFixed(2))} ${m.unit}`,
          percentile: m.percentile,
          sd: m.sd,
          priority: 'Gelişim Takibi',
          analysis: `Mevcut seviye (%${m.percentile}) iyi olmakla birlikte üst elit dilime (%85+) taşınması için ipsatif hedef odaklı çalışılmalıdır.`,
          drillRecommendation: catInfo.drill,
          weeklyFrequency: catInfo.freq,
        });
      }
    });
  }

  // 3. Identify Top Strengths
  const strengths: LabAiStrengthItem[] = [...report.motorPerformance, ...report.bodyComposition]
    .filter((row) => row.id !== 'body_fat' && row.id !== 'bmi' && row.id !== 'calf_skf' && row.id !== 'supraspinal')
    .sort((a, b) => b.percentile - a.percentile)
    .slice(0, 3)
    .map((row) => ({
      metricName: row.name,
      currentValue: `${row.m3} ${row.unit}`,
      percentile: row.percentile,
      insight: `Yaş grubunda %${row.percentile} yüzdelik dilimde (${row.sd > 0 ? `+${row.sd}` : row.sd} SD) yer alarak branş için önemli bir biyomekanik avantaj sağlamaktadır.`,
    }));

  // 4. Build 8-Week Training Prescription based on PHV & Somatotype
  const phvDiff = Number((report.phvAge - report.ageYears).toFixed(1));
  const phvWindowNote =
    phvDiff > 0.8
      ? `Sporcu PHV (Tepe Boy Hızı: ${report.phvAge} yaş) öncesi dönemde (${phvDiff} yıl var) olduğundan sinir-kas koordinasyonu, reaksiyon ve çabukluk kazanımı maksimum düzeydedir.`
      : `Sporcu PHV büyüme atağı penceresine yakın olduğundan büyüme plaklarını koruyucu eksantrik kontrol ve esneklik çalışmaları önceliklendirilmelidir.`;

  const trainingPrescription: LabAiPrescriptionItem[] = [
    {
      focusArea: '1. Blok: Nöromüsküler Çabukluk & Patlayıcı Kuvvet',
      microcycleGoal: improvementAreas[0]
        ? `${improvementAreas[0].metricName} metriğini ${improvementAreas[0].currentValue} seviyesinden ${improvementAreas[0].targetValue} hedefine taşımak`
        : 'İlk adım çabukluğu ve dikey/yatay sıçrama reaktif kuvvetini artırmak',
      recommendedDrills: [
        improvementAreas[0]?.drillRecommendation || '10x5m yön değiştirme ve reaktif pliometrik sıçrama serileri',
        'Kısa mesafe (5m-10m-20m) görsel uyaranlı reaksiyon çıkışları',
      ],
      loadNote: 'Yüksek kalite, tam dinlenme (1:5 iş/dinlenme oranı), haftada 2 seans',
    },
    {
      focusArea: '2. Blok: Kor Stabilizasyonu & Somatotip Dengesi (Mezomorfi Artışı)',
      microcycleGoal: `Somatotip profilini (${report.somatotype.m3.endo}-${report.somatotype.m3.meso}-${report.somatotype.m3.ecto}) branş elit referansına (${report.somatotype.eliteRef.endo}-${report.somatotype.eliteRef.meso}-${report.somatotype.eliteRef.ecto}) yaklaştırmak`,
      recommendedDrills: [
        'Vücut ağırlığıyla fonksiyonel core, posterior zincir (sırt/kalça) ve skapular stabilizasyon',
        'Tek bacak denge (Flamingo propriosepsiyon) ve diz-ayak bileği eksen kontrolü',
      ],
      loadNote: 'Orta yoğunluk, kontrollü tempo, haftada 3 seans (15-20 dk)',
    },
    {
      focusArea: '3. Blok: Kardiyorespiratuar Kapasite (VO2peak) & Büyüme Uyumu',
      microcycleGoal: `PACER VO2peak değerini (${report.cardio.test3Vo2} ml/kg/dk) ve anaerobik güç devamlılığını (${report.cardio.verticalJumpRelativeWatt} W/kg) geliştirmek`,
      recommendedDrills: [
        'Branşa özgü dar alan yüksek tempolu oyunlar ve 20m mekik (shuttle) dayanıklılık blokları',
        'Hamstring ve kalça çevresi PNF esneklik / mobilite rutini',
      ],
      loadNote: phvWindowNote,
    },
  ];

  const overallSummary = `${report.athleteName}, 1. testten (%${report.scoreHistory.p1Score}) 3. teste (%${report.scoreHistory.p3Score}) genel sportif performans endeksinde anlamlı bir ivme yakalamıştır. Ölçüm verileri incelendiğinde ${strengths
    .map((s) => s.metricName)
    .slice(0, 2)
    .join(' ve ')} parametreleri güçlü yönler olarak öne çıkarken; ${improvementAreas
    .map((i) => i.metricName)
    .slice(0, 3)
    .join(', ')} alanlarında hedeflenen elit normlara ulaşmak için odaklanmış antrenman müdahalesi önerilmektedir.`;

  const nutritionAndRecoveryTip = `Sporcunun bazal metabolik hızı ${report.cardio.basalMetabolicRate} kcal/gün ve güncel somatotipi ${report.somatotype.m3.category} (${report.somatotype.m3.endo}-${report.somatotype.m3.meso}-${report.somatotype.m3.ecto}) olarak ölçülmüştür. Endomorfi bileşenini (${report.somatotype.m3.endo}) kontrol altında tutup kas-iskelet sağlamlığını (Mezomorfi: ${report.somatotype.m3.meso}) desteklemek için antrenman sonrası ilk 45 dakikada kaliteli protein + kompleks karbonhidrat alımı ve büyüme hormonu salınımı için günde en az 9 saat gece uykusu önerilir.`;

  return {
    overallSummary,
    readinessScore: report.scoreHistory.p3Score,
    improvementAreas,
    strengths,
    trainingPrescription,
    nutritionAndRecoveryTip,
    generatedAt: new Date().toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    source: 'auto-engine',
  };
}

/**
 * Calls the server-side Gemini API endpoint (/api/sportsfly-lab/ai-recommendations)
 * to generate deep AI performance recommendations from the athlete's Excel metrics.
 */
export async function fetchGeminiLabRecommendations(
  report: SportsFlyLabReport
): Promise<LabAiPerformanceAnalysis> {
  const response = await secureFetch('/api/sportsfly-lab/ai-recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Sunucu hatası (${response.status})`);
  }

  return (await response.json()) as LabAiPerformanceAnalysis;
}
