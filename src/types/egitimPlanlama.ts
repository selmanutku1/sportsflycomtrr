export type BranchType = 'Futbol' | 'Basketbol' | 'Voleybol';

export type AgeCategory = 'U6-U8' | 'U9-U11' | 'U12-U14' | 'U15-U17';

export type DifficultyLevel = 'Başlangıç' | 'Orta' | 'İleri' | 'Elit / Pro';

export type DrillPhase =
  | 'Isınma & Koordinasyon'
  | 'Temel Teknik (Dril 1)'
  | 'Taktik Gelişim (Dril 2)'
  | 'Maç & Oyun Simülasyonu'
  | 'Soğuma & Değerlendirme';

export type FieldDiagramType =
  | 'football-pitch'
  | 'football-rondo'
  | 'football-half'
  | 'basketball-court'
  | 'basketball-half'
  | 'volleyball-court'
  | 'volleyball-net';

export interface TacticalMarker {
  id: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  type: 'player-a' | 'player-b' | 'coach' | 'cone' | 'ball' | 'goal' | 'hoop' | 'target';
  label?: string;
  number?: number | string;
}

export interface TacticalLine {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: 'pass' | 'run' | 'dribble' | 'shot';
  curve?: number;
  label?: string;
}

export interface TacticalZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label?: string;
}

export interface DrillTacticalData {
  diagramType: FieldDiagramType;
  markers: TacticalMarker[];
  lines: TacticalLine[];
  zones?: TacticalZone[];
  coachNotes?: string;
}

export interface TrainingDrill {
  id: string;
  title: string;
  phase: DrillPhase;
  durationMinutes: number;
  intensity: 'Düşük' | 'Orta' | 'Yüksek' | 'Maksimum';
  playerCount: string;
  spaceRequired: string;
  equipment: string[];
  objective: string;
  instructions: string[];
  coachingPoints: string[];
  variations?: {
    easier?: string;
    harder?: string;
  };
  tacticalData?: DrillTacticalData;
}

export interface TrainingPlan {
  id: string;
  code: string;
  title: string;
  branch: BranchType;
  ageCategory: AgeCategory;
  ageGroupTitle: string; // e.g. "U9 - U11 Küçükler / Temel Teknik & Beceri"
  periodWeek: number; // 1 to 12
  sessionNumber: number;
  difficulty: DifficultyLevel;
  totalDurationMinutes: number; // e.g. 60, 75, 90
  seasonPhase: 'Sezon Başı / Hazırlık' | 'Temel Gelişim Dönemi' | 'Müsabaka & Taktik Dönemi' | 'Değerlendirme & Test';
  focusTags: string[];
  summary: string;
  learningOutcomes: string[];
  drills: TrainingDrill[];
  equipmentList: string[];
  coachTips: string;
  assignedGroups?: string[];
  isCustom?: boolean;
  authorName?: string;
  rating?: number;
  downloadCount?: number;
}

export interface CurriculumWeek {
  weekNumber: number;
  title: string;
  branch: BranchType;
  ageCategory: AgeCategory;
  seasonPhase: string;
  primaryObjective: string;
  keyConcepts: string[];
  suggestedPlanIds: string[];
  evaluationChecklist: string[];
}

export interface BranchAgeMetadata {
  branch: BranchType;
  ageCategory: AgeCategory;
  badgeColor: string;
  accentColor: string;
  philosophy: string;
  physicalFocus: string;
  technicalFocus: string;
  tacticalFocus: string;
  recommendedDuration: string;
  sessionsPerWeek: string;
}

export interface CompetencyRubricItem {
  id: string;
  branch: BranchType;
  ageCategory: AgeCategory;
  domain: 'Teknik' | 'Taktik' | 'Fiziksel / Motorik' | 'Mental & İletişim';
  title: string;
  description: string;
  evaluationCriteria: {
    level1: string; // Geliştirilmeli (1-2)
    level2: string; // Yeterli (3-4)
    level3: string; // Yetkin (5)
  };
}
