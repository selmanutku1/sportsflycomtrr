import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Award,
  Search,
  Filter,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  Users,
  Target,
  Brain,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Clock,
  Trash2,
  Tag,
  Check,
  Crown,
  Zap,
  FileText,
  Sliders,
  Copy,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Settings2,
  Sparkles,
  X
} from 'lucide-react';
import { SportsFlyIcon } from '../../SportsFlyLogo';
import { NavPage } from '../../../types';
import { 
  SporcuKarne, 
  INITIAL_KARNELER, 
  getStoredKarneler, 
  saveStoredKarneler 
} from '../../../data/mockKarneData';
import { 
  KURUMSAL_ROZETLER, 
  KURUMSAL_ROZET_KATEGORILERI, 
  DavranissalRozet 
} from '../../../data/rozetData';
import {
  HAZIR_ANTRENOR_NOTLARI,
  HAZIR_GOZLEM_SABLONLARI,
  HAZIR_PUANLAMA_PROFILLERI,
  HAZIR_GELISIM_ETIKETLERI,
  ANTRENOR_NOTU_KATEGORILERI,
  AntrenorNotuSablon,
  GozlemSablon,
  PuanlamaProfiliSablon
} from '../../../data/degerlendirmeSablonlari';
import { getStoredUserProfile } from '../../../data/userProfile';
import { addSporPuanNotification } from '../../../data/notifications';
import { QuickPointAwardModal } from '../../modals/QuickPointAwardModal';

interface SporcuDegerlendirmeViewProps {
  onNavigate?: (page: NavPage) => void;
}

export interface SporPuanLog {
  id: string;
  sporcuId: string;
  sporcuName?: string;
  ruleId: string;
  category: 'Devam' | 'Seri' | 'Davranış' | 'Gelişim' | 'Aile ve İlişki' | 'Etkinlik';
  ruleName: string;
  points: number;
  date: string;
  source: 'Otomatik' | 'Koç Onayı';
  note?: string;
}

export const SPORPUAN_RULES = [
  { id: 'r1', category: 'Devam' as const, ruleName: 'Antrenmana katılım', points: 25, limit: 'Ders başına 1', trigger: 'Yoklama', source: 'Otomatik' as const },
  { id: 'r2', category: 'Devam' as const, ruleName: 'Zamanında gelme', points: 5, limit: 'Ders başına 1', trigger: 'Yoklama saati', source: 'Otomatik' as const },
  { id: 'r3', category: 'Devam' as const, ruleName: 'Telafi dersine katılım', points: 15, limit: 'Ayda 2', monthlyLimit: 2, trigger: 'Yoklama', source: 'Otomatik' as const },
  { id: 'r4', category: 'Devam' as const, ruleName: 'Haber vererek gelmeme', points: 5, limit: 'Ayda 3', monthlyLimit: 3, trigger: 'Uygulamadan bildirim', source: 'Otomatik' as const },
  { id: 'r5', category: 'Seri' as const, ruleName: '2 hafta seri', points: 25, limit: 'Ayda 1', monthlyLimit: 1, trigger: 'Kesintisiz katılım', source: 'Otomatik' as const },
  { id: 'r6', category: 'Seri' as const, ruleName: '4 hafta seri', points: 75, limit: 'Ayda 1', monthlyLimit: 1, trigger: 'Kesintisiz katılım', source: 'Otomatik' as const },
  { id: 'r7', category: 'Seri' as const, ruleName: '8 hafta seri', points: 200, limit: 'Sezonda 2', monthlyLimit: 1, trigger: 'Kesintisiz katılım', source: 'Otomatik' as const },
  { id: 'r8', category: 'Davranış' as const, ruleName: 'Fair-play ve örnek davranış', points: 50, limit: 'Ayda 1', monthlyLimit: 1, trigger: 'Koç takdiri', source: 'Koç Onayı' as const },
  { id: 'r9', category: 'Davranış' as const, ruleName: 'Takım arkadaşına yardım', points: 20, limit: 'Ayda 2', monthlyLimit: 2, trigger: 'Koç takdiri', source: 'Koç Onayı' as const },
  { id: 'r10', category: 'Gelişim' as const, ruleName: 'Seviye / beceri atlama', points: 100, limit: 'Seviye başına 1', monthlyLimit: 1, trigger: 'Değerlendirme', source: 'Koç Onayı' as const },
  { id: 'r11', category: 'Gelişim' as const, ruleName: 'Ölçümde kişisel gelişim', points: 50, limit: 'Dönemde 1', monthlyLimit: 1, trigger: 'Dönemlik test', source: 'Koç Onayı' as const },
  { id: 'r12', category: 'Aile ve İlişki' as const, ruleName: 'Aidatı zamanında ödeme', points: 30, limit: 'Ayda 1', monthlyLimit: 1, trigger: 'Ödeme kaydı', source: 'Otomatik' as const },
  { id: 'r13', category: 'Aile ve İlişki' as const, ruleName: 'Dönem yenileme', points: 150, limit: 'Dönemde 1', monthlyLimit: 1, trigger: 'Yenileme kaydı', source: 'Otomatik' as const },
  { id: 'r14', category: 'Aile ve İlişki' as const, ruleName: 'Erken kayıt', points: 50, limit: 'Dönemde 1', monthlyLimit: 1, trigger: 'Kayıt tarihi', source: 'Otomatik' as const },
  { id: 'r15', category: 'Aile ve İlişki' as const, ruleName: 'Arkadaş getirme', points: 200, limit: 'Sezonda 5', monthlyLimit: 5, trigger: 'Yeni sporcu ilk ayı tamamlayınca', source: 'Otomatik' as const },
  { id: 'r16', category: 'Aile ve İlişki' as const, ruleName: 'Profil ve sağlık formu tamamlama', points: 40, limit: 'Tek seferlik', monthlyLimit: 1, trigger: 'Uygulama', source: 'Otomatik' as const },
  { id: 'r17', category: 'Etkinlik' as const, ruleName: 'Turnuva veya etkinlik katılımı', points: 60, limit: 'Etkinlik başına 1', trigger: 'Etkinlik yoklaması', source: 'Koç Onayı' as const },
  { id: 'r18', category: 'Etkinlik' as const, ruleName: 'Doğum günü haftası', points: 25, limit: 'Yılda 1', monthlyLimit: 1, trigger: 'Takvim', source: 'Otomatik' as const }
];

const INITIAL_SPORPUAN_LOGS: SporPuanLog[] = [
  { id: 'sp-l1', sporcuId: 'k1', ruleId: 'r1', category: 'Devam', ruleName: 'Antrenmana katılım', points: 25, date: '15.09.2026', source: 'Otomatik' },
  { id: 'sp-l2', sporcuId: 'k1', ruleId: 'r2', category: 'Devam', ruleName: 'Zamanında gelme', points: 5, date: '15.09.2026', source: 'Otomatik' },
  { id: 'sp-l3', sporcuId: 'k1', ruleId: 'r8', category: 'Davranış', ruleName: 'Fair-play ve örnek davranış', points: 50, date: '10.09.2026', source: 'Koç Onayı', note: 'Antrenmandaki centilmence davranışı için' },
  { id: 'sp-l4', sporcuId: 'k1', ruleId: 'r16', category: 'Aile ve İlişki', ruleName: 'Profil ve sağlık formu tamamlama', points: 40, date: '01.09.2026', source: 'Otomatik' },
  
  { id: 'sp-l5', sporcuId: 'k2', ruleId: 'r1', category: 'Devam', ruleName: 'Antrenmana katılım', points: 25, date: '14.09.2026', source: 'Otomatik' },
  { id: 'sp-l6', sporcuId: 'k2', ruleId: 'r9', category: 'Davranış', ruleName: 'Takım arkadaşına yardım', points: 20, date: '12.09.2026', source: 'Koç Onayı', note: 'Sakatlanan arkadaşına destek oldu.' },
  { id: 'sp-l7', sporcuId: 'k2', ruleId: 'r12', category: 'Aile ve İlişki', ruleName: 'Aidatı zamanında ödeme', points: 30, date: '05.09.2026', source: 'Otomatik' }
];

export const SporpuanSporcuDegerlendirmeView: React.FC<SporcuDegerlendirmeViewProps> = ({ onNavigate }) => {
  const [karneler, setKarneler] = useState<SporcuKarne[]>(() => getStoredKarneler());
  const [selectedKarneId, setSelectedKarneId] = useState<string>(() => {
    const list = getStoredKarneler();
    return list[0]?.id || INITIAL_KARNELER[0]?.id || '';
  });

  // Gamification (SporPuan) logs state
  const currentUser = getStoredUserProfile();
  const isSuperAdmin = currentUser.role === 'Süper Admin' || currentUser.role.toLowerCase().includes('süper') || currentUser.role.toLowerCase().includes('super');

  const [sporpuanLogs, setSporpuanLogs] = useState<SporPuanLog[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sportsfly_sporpuan_logs_new');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return INITIAL_SPORPUAN_LOGS;
  });

  // Gamification central rules state (Scoring Matrix)
  const [sporpuanRules, setSporpuanRules] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sportsfly_sporpuan_rules_new_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return SPORPUAN_RULES;
  });

  const [viewMode, setViewMode] = useState<'degerlendirme' | 'hesaplayici' | 'kriterler'>('degerlendirme');
  const [quickPointTarget, setQuickPointTarget] = useState<{ id: string; name: string; branch?: string; teamGroup?: string } | null>(null);

  // SporPuan Simulation Calculator state
  const [calcAgeGroup, setCalcAgeGroup] = useState<'5-8' | '9-12' | '13-17'>('9-12');
  const [calcMonthlyTraining, setCalcMonthlyTraining] = useState<number>(10);
  const [calcQuantities, setCalcQuantities] = useState<Record<string, number>>({
    r1: 10,  // Antrenmana katılım
    r2: 10,  // Zamanında gelme
    r6: 1,   // 4 hafta seri
    r8: 1,   // Fair-play ve örnek davranış
    r12: 1,  // Aidatı zamanında ödeme
  });

  // Custom new rule modal/state
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRuleCategory, setNewRuleCategory] = useState<'Devam' | 'Seri' | 'Davranış' | 'Gelişim' | 'Aile ve İlişki' | 'Etkinlik'>('Gelişim');
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePoints, setNewRulePoints] = useState<number>(50);
  const [newRuleLimit, setNewRuleLimit] = useState('Ayda 1');
  const [newRuleMonthlyLimit, setNewRuleMonthlyLimit] = useState<number>(1);
  const [newRuleTrigger, setNewRuleTrigger] = useState('Koç takdiri');
  const [newRuleSource, setNewRuleSource] = useState<'Otomatik' | 'Koç Onayı'>('Koç Onayı');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sportsfly_sporpuan_logs_new', JSON.stringify(sporpuanLogs));
    }
  }, [sporpuanLogs]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sportsfly_sporpuan_rules_new_v2', JSON.stringify(sporpuanRules));
    }
  }, [sporpuanRules]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('Tümü');
  const [selectedGroup, setSelectedGroup] = useState<string>('Tümü');

  // Matrix-specific filters
  const [matrixCategoryFilter, setMatrixCategoryFilter] = useState<string>('Tümü');
  const [matrixSearch, setMatrixSearch] = useState<string>('');

  // Form editing state for the selected athlete
  const [currentEdit, setCurrentEdit] = useState<SporcuKarne | null>(null);
  const [activeTab, setActiveTab] = useState<'teknik' | 'fiziksel' | 'taktiksel' | 'zihinsel' | 'davranissal' | 'olcumler' | 'rozetler' | 'sporpuan'>('teknik');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // New observation state
  const [newObservationPeriod, setNewObservationPeriod] = useState('3. Dönem (Aralık)');
  const [newObservationFocus, setNewObservationFocus] = useState('');
  const [newObservationStatus, setNewObservationStatus] = useState<'Gelişiyor' | 'Hedefe Ulaştı' | 'Örnek Davranış'>('Hedefe Ulaştı');
  const [newObservationNotes, setNewObservationNotes] = useState('');

  // Badge selection search/filter
  const [badgeFilterCategory, setBadgeFilterCategory] = useState<string>('Tümü');
  const [badgeSearch, setBadgeSearch] = useState('');

  // Quick evaluation template modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchGroup, setBatchGroup] = useState('U14 Anadolu Efes Altyapı');
  const [batchCategory, setBatchCategory] = useState<'teknik' | 'fiziksel' | 'zihinsel'>('teknik');
  const [batchScore, setBatchScore] = useState<number>(8);

  // Quick Templates (Hızlı Şablonlar) modal & states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateModalTab, setTemplateModalTab] = useState<'notlar' | 'gozlemler' | 'puanlar' | 'etiketler'>('notlar');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('Tümü');

  // Gamification input states
  const [selectedRuleId, setSelectedRuleId] = useState<string>('r1');
  const [sporpuanNote, setSporpuanNote] = useState<string>('');

  const handleAwardPoints = () => {
    if (!currentEdit) return;
    const rule = sporpuanRules.find((r) => r.id === selectedRuleId);
    if (!rule) return;

    // Optional Check for limit exceeding
    const countInMonth = sporpuanLogs.filter(log => log.sporcuId === currentEdit.id && log.ruleId === rule.id).length;
    if (rule.monthlyLimit !== undefined && countInMonth >= rule.monthlyLimit) {
      if (!window.confirm(`⚠️ Bu kural için aylık sınır (${rule.monthlyLimit}) zaten doldurulmuş durumda. Yine de puan eklemek istiyor musunuz?`)) {
        return;
      }
    }

    const newLog: SporPuanLog = {
      id: `sp-l-${Date.now()}`,
      sporcuId: currentEdit.id,
      sporcuName: currentEdit.adSoyad,
      ruleId: rule.id,
      category: rule.category,
      ruleName: rule.ruleName,
      points: rule.points,
      date: new Date().toLocaleDateString('tr-TR'),
      source: 'Koç Onayı',
      note: sporpuanNote.trim() || undefined
    };

    setSporpuanLogs([newLog, ...sporpuanLogs]);
    setSporpuanNote('');

    // Trigger notification center update and instant push/toast alert
    addSporPuanNotification({
      sporcuId: currentEdit.id,
      sporcuName: currentEdit.adSoyad,
      ruleName: rule.ruleName,
      points: rule.points,
      category: rule.category,
      note: sporpuanNote.trim() || undefined,
    });

    showToast(`${currentEdit.adSoyad} için +${rule.points} SP puanı başarıyla tanımlandı ve bildirim merkezine iletildi!`);
  };

  const handleDeleteLog = (logId: string) => {
    if (window.confirm('Bu puan kazanım kaydını silmek istediğinize emin misiniz?')) {
      const updated = sporpuanLogs.filter(log => log.id !== logId);
      setSporpuanLogs(updated);
      showToast('Puan kaydı başarıyla silindi.');
    }
  };

  // Matrix management helper methods
  const handleUpdateRulePoints = (ruleId: string, newPoints: number) => {
    if (!isSuperAdmin) {
      showToast('Hata: Bu işlemi yapmak için Süper Admin yetkisine sahip olmalısınız.');
      return;
    }
    setSporpuanRules(prev => prev.map(r => r.id === ruleId ? { ...r, points: Math.max(0, newPoints) } : r));
  };

  const handleUpdateRuleMonthlyLimit = (ruleId: string, limitVal: number) => {
    if (!isSuperAdmin) {
      showToast('Hata: Bu işlemi yapmak için Süper Admin yetkisine sahip olmalısınız.');
      return;
    }
    setSporpuanRules(prev => prev.map(r => r.id === ruleId ? { ...r, monthlyLimit: limitVal > 0 ? limitVal : undefined } : r));
  };

  const handleUpdateRuleLimitText = (ruleId: string, limitText: string) => {
    if (!isSuperAdmin) return;
    setSporpuanRules(prev => prev.map(r => r.id === ruleId ? { ...r, limit: limitText } : r));
  };

  const handleUpdateRuleTriggerText = (ruleId: string, triggerText: string) => {
    if (!isSuperAdmin) return;
    setSporpuanRules(prev => prev.map(r => r.id === ruleId ? { ...r, trigger: triggerText } : r));
  };

  const handleUpdateRuleSource = (ruleId: string, sourceVal: 'Otomatik' | 'Koç Onayı') => {
    if (!isSuperAdmin) {
      showToast('Hata: Bu işlemi yapmak için Süper Admin yetkisine sahip olmalısınız.');
      return;
    }
    setSporpuanRules(prev => prev.map(r => r.id === ruleId ? { ...r, source: sourceVal } : r));
  };

  const handleResetRulesToDefault = () => {
    if (!isSuperAdmin) {
      showToast('Hata: Bu işlemi yapmak için Süper Admin yetkisine sahip olmalısınız.');
      return;
    }
    if (window.confirm('Tüm puanlama kriterlerini başlangıç ayarlarına sıfırlamak istediğinize emin misiniz?')) {
      setSporpuanRules(SPORPUAN_RULES);
      showToast('Puan kriterleri başarıyla varsayılan ayarlara sıfırlandı.');
    }
  };

  const handleAddNewCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      showToast('Hata: Bu işlemi yapmak için Süper Admin yetkisine sahip olmalısınız.');
      return;
    }
    if (!newRuleName.trim()) {
      alert('Lütfen kural adı girin.');
      return;
    }

    const newRule = {
      id: `r-${Date.now()}`,
      category: newRuleCategory,
      ruleName: newRuleName.trim(),
      points: Number(newRulePoints) || 0,
      limit: newRuleLimit.trim() || 'Ayda 1',
      monthlyLimit: Number(newRuleMonthlyLimit) || undefined,
      trigger: newRuleTrigger.trim() || 'Koç Onayı',
      source: newRuleSource
    };

    setSporpuanRules([...sporpuanRules, newRule]);
    setShowAddRuleModal(false);
    setNewRuleName('');
    showToast(`Yeni kural "${newRule.ruleName}" puan matrisine başarıyla eklendi!`);
  };

  const handleDeleteCustomRule = (ruleId: string) => {
    if (!isSuperAdmin) {
      showToast('Hata: Bu işlemi yapmak için Süper Admin yetkisine sahip olmalısınız.');
      return;
    }
    if (window.confirm('Bu puanlama kuralını matristen silmek istediğinize emin misiniz?')) {
      setSporpuanRules(prev => prev.filter(r => r.id !== ruleId));
      showToast('Kriter başarıyla matristen kaldırıldı.');
    }
  };
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync with global store changes
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e?.detail?.karneler) {
        setKarneler(e.detail.karneler);
      } else {
        setKarneler(getStoredKarneler());
      }
    };
    window.addEventListener('sportsfly_karneler_updated', handleUpdate);
    return () => window.removeEventListener('sportsfly_karneler_updated', handleUpdate);
  }, []);

  // When selectedKarneId changes, clone data into currentEdit
  useEffect(() => {
    const found = karneler.find((k) => k.id === selectedKarneId) || karneler[0] || null;
    if (found) {
      // Deep clone so user can edit safely without mutating until Save is clicked
      setCurrentEdit(JSON.parse(JSON.stringify(found)));
      setHasUnsavedChanges(false);
    }
  }, [selectedKarneId, karneler]);

  // Unique branches and groups
  const branches = ['Tümü', ...Array.from(new Set(karneler.map((k) => k.brans)))];
  const groups = ['Tümü', ...Array.from(new Set(karneler.map((k) => k.grup)))];

  const filteredKarneler = karneler.filter((k) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      k.adSoyad.toLowerCase().includes(q) ||
      k.grup.toLowerCase().includes(q) ||
      k.brans.toLowerCase().includes(q);
    const matchBranch = selectedBranch === 'Tümü' || k.brans === selectedBranch;
    const matchGroup = selectedGroup === 'Tümü' || k.grup === selectedGroup;
    return matchSearch && matchBranch && matchGroup;
  });

  // Calculate averages dynamically
  const calculateCategoryAverage = (scores: (number | undefined)[]) => {
    const valid = scores.filter((s): s is number => typeof s === 'number' && !isNaN(s));
    if (valid.length === 0) return 0;
    const sum = valid.reduce((a, b) => a + b, 0);
    return Number((sum / valid.length).toFixed(2));
  };

  // Updaters for currentEdit
  const handleScoreChange = (
    category: 'teknik' | 'fiziksel' | 'taktiksel' | 'zihinsel',
    field: string,
    value: number
  ) => {
    if (!currentEdit) return;
    const updatedCategory = {
      ...currentEdit[category],
      [field]: value,
    };

    // Recalculate category average
    const keys = Object.keys(updatedCategory).filter((k) => k !== 'ortalama');
    const values = keys.map((k) => (updatedCategory as any)[k]);
    updatedCategory.ortalama = calculateCategoryAverage(values);

    setCurrentEdit({
      ...currentEdit,
      [category]: updatedCategory,
    });
    setHasUnsavedChanges(true);
  };

  const handleDavranissalKriterChange = (field: string, value: number) => {
    if (!currentEdit) return;
    const updatedKriterler = {
      ...currentEdit.davranissal.kriterler,
      [field]: value,
    };
    const keys = Object.keys(updatedKriterler).filter((k) => k !== 'ortalama');
    const values = keys.map((k) => (updatedKriterler as any)[k]);
    updatedKriterler.ortalama = calculateCategoryAverage(values);

    setCurrentEdit({
      ...currentEdit,
      davranissal: {
        ...currentEdit.davranissal,
        kriterler: updatedKriterler,
      },
    });
    setHasUnsavedChanges(true);
  };

  const handleHabitChange = (
    habitKey: 'ekranDengesi' | 'zararliAliskanlik' | 'uykuVeDinlenme',
    field: 'puan' | 'seviye' | 'aciklama',
    val: any
  ) => {
    if (!currentEdit) return;
    const currentHabits = currentEdit.davranissal.bagimlilikVeAliskanlik || {
      ekranDengesi: { puan: 8, seviye: 'Dengeli & Bilinçli', aciklama: '' },
      zararliAliskanlik: { puan: 10, seviye: 'Bilinçli (Örnek)', aciklama: '' },
      uykuVeDinlenme: { puan: 8, seviye: 'Düzenli (8+ Saat)', aciklama: '' },
      genelFarkindalik: 'Dengeli',
      egitmenGorus: '',
    };

    const targetHabit = {
      ...currentHabits[habitKey],
      [field]: val,
    };

    setCurrentEdit({
      ...currentEdit,
      davranissal: {
        ...currentEdit.davranissal,
        bagimlilikVeAliskanlik: {
          ...currentHabits,
          [habitKey]: targetHabit,
        },
      },
    });
    setHasUnsavedChanges(true);
  };

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEdit || !newObservationFocus.trim()) return;

    const newStep = {
      donem: newObservationPeriod,
      tarih: new Date().toISOString().split('T')[0],
      durum: newObservationStatus,
      odakKonusu: newObservationFocus.trim(),
      gozlem: newObservationNotes.trim() || 'Antrenör tarafından dönemsel gelişim gözlemi kaydedildi.',
    };

    setCurrentEdit({
      ...currentEdit,
      davranissal: {
        ...currentEdit.davranissal,
        surecTakibi: [...currentEdit.davranissal.surecTakibi, newStep],
      },
    });
    setHasUnsavedChanges(true);
    setNewObservationFocus('');
    setNewObservationNotes('');
    showToast('Yeni gelişim periyot gözlemi eklendi.');
  };

  const handleRemoveObservation = (index: number) => {
    if (!currentEdit) return;
    const updated = currentEdit.davranissal.surecTakibi.filter((_, i) => i !== index);
    setCurrentEdit({
      ...currentEdit,
      davranissal: {
        ...currentEdit.davranissal,
        surecTakibi: updated,
      },
    });
    setHasUnsavedChanges(true);
  };

  const handleToggleBadge = (rozet: DavranissalRozet) => {
    if (!currentEdit) return;
    const kazanimlar = currentEdit.davranissal.kazanimlar || [];
    const isEarned = kazanimlar.some(
      (k) => k.rozetId === rozet.id || k.baslik.toLowerCase() === rozet.baslik.toLowerCase()
    );

    let updatedKazanimlar = [...kazanimlar];
    if (isEarned) {
      updatedKazanimlar = updatedKazanimlar.filter(
        (k) => k.rozetId !== rozet.id && k.baslik.toLowerCase() !== rozet.baslik.toLowerCase()
      );
    } else {
      updatedKazanimlar.push({
        id: `kzn-${Date.now()}`,
        rozetId: rozet.id,
        baslik: rozet.baslik,
        aciklama: rozet.aciklama,
        kategori: rozet.kategori,
        tarih: new Date().toISOString().split('T')[0],
        onemDerecesi: rozet.onemDerecesi,
      });
    }

    setCurrentEdit({
      ...currentEdit,
      davranissal: {
        ...currentEdit.davranissal,
        kazanimlar: updatedKazanimlar,
      },
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveCurrentEdit = () => {
    if (!currentEdit) return;

    const updatedList = karneler.map((item) =>
      item.id === currentEdit.id ? { ...currentEdit, tarih: new Date().toISOString().split('T')[0] } : item
    );

    setKarneler(updatedList);
    saveStoredKarneler(updatedList);
    setHasUnsavedChanges(false);
    showToast(`${currentEdit.adSoyad} için değerlendirme puanları ve karne başarıyla güncellendi!`);
  };

  // Quick batch score apply
  const handleApplyBatchScore = () => {
    const updatedList = karneler.map((item) => {
      if (item.grup === batchGroup) {
        const cat = { ...item[batchCategory] };
        Object.keys(cat).forEach((k) => {
          (cat as any)[k] = batchScore;
        });
        return {
          ...item,
          [batchCategory]: cat,
          tarih: new Date().toISOString().split('T')[0],
        };
      }
      return item;
    });

    setKarneler(updatedList);
    saveStoredKarneler(updatedList);
    if (currentEdit && currentEdit.grup === batchGroup) {
      const match = updatedList.find((k) => k.id === currentEdit.id);
      if (match) setCurrentEdit(JSON.parse(JSON.stringify(match)));
    }
    setShowBatchModal(false);
    showToast(`${batchGroup} grubuna toplu ${batchCategory} puanı (${batchScore}/10) uygulandı!`);
  };

  // Quick templates handlers
  const handleApplyCoachNoteTemplate = (template: AntrenorNotuSablon, append = false) => {
    if (!currentEdit) return;
    const newNote = append && currentEdit.antrenorNotu?.trim()
      ? `${currentEdit.antrenorNotu.trim()}\n\n${template.metin}`
      : template.metin;

    // Merge recommended tags if not already present
    const currentTags = currentEdit.gelisimAlanlari || [];
    const mergedTags = [...currentTags];
    template.onerilenGelisimAlanlari.forEach((tag) => {
      if (!mergedTags.includes(tag)) {
        mergedTags.push(tag);
      }
    });

    setCurrentEdit({
      ...currentEdit,
      antrenorNotu: newNote,
      gelisimAlanlari: mergedTags,
    });
    setHasUnsavedChanges(true);
    showToast(`"${template.baslik}" şablonu karne notuna aktarıldı.`);
  };

  const handleApplyObservationTemplate = (template: GozlemSablon, directAdd = false) => {
    if (!currentEdit) return;
    if (directAdd) {
      const newObs = {
        donem: newObservationPeriod || '2024 Güz - 1. Periyot',
        odakKonusu: template.odakKonusu,
        durum: template.durum,
        gozlem: template.gozlem,
        tarih: new Date().toISOString().split('T')[0],
      };
      setCurrentEdit({
        ...currentEdit,
        davranissal: {
          ...currentEdit.davranissal,
          surecTakibi: [newObs, ...(currentEdit.davranissal.surecTakibi || [])],
        },
      });
      setHasUnsavedChanges(true);
      showToast(`"${template.baslik}" gözlemi süreç takibine doğrudan eklendi!`);
    } else {
      setNewObservationFocus(template.odakKonusu);
      setNewObservationStatus(template.durum);
      setNewObservationNotes(template.gozlem);
      setActiveTab('davranissal');
      showToast(`"${template.baslik}" şablonu gözlem formuna dolduruldu.`);
    }
  };

  const handleApplyScoringProfile = (profile: PuanlamaProfiliSablon, withCoachNote = true) => {
    if (!currentEdit) return;

    // Recalculate averages for each category
    const teknikKeys = Object.keys(profile.teknik).filter((k) => k !== 'ortalama');
    const teknikAvg = calculateCategoryAverage(teknikKeys.map((k) => (profile.teknik as any)[k]));

    const fizikselKeys = Object.keys(profile.fiziksel).filter((k) => k !== 'ortalama');
    const fizikselAvg = calculateCategoryAverage(fizikselKeys.map((k) => (profile.fiziksel as any)[k]));

    const taktikselKeys = Object.keys(profile.taktiksel).filter((k) => k !== 'ortalama');
    const taktikselAvg = calculateCategoryAverage(taktikselKeys.map((k) => (profile.taktiksel as any)[k]));

    const zihinselKeys = Object.keys(profile.zihinsel).filter((k) => k !== 'ortalama');
    const zihinselAvg = calculateCategoryAverage(zihinselKeys.map((k) => (profile.zihinsel as any)[k]));

    const davrKeys = Object.keys(profile.davranissalKriterler).filter((k) => k !== 'ortalama');
    const davrAvg = calculateCategoryAverage(davrKeys.map((k) => (profile.davranissalKriterler as any)[k]));

    // Match or fallback to a relevant coach note template
    const matchingNote = HAZIR_ANTRENOR_NOTLARI.find((n) =>
      profile.baslik.toLowerCase().includes(n.kategori.toLowerCase()) ||
      n.baslik.toLowerCase().includes(profile.baslik.toLowerCase())
    ) || HAZIR_ANTRENOR_NOTLARI[0];

    const noteToApply = profile.antrenorNotu || matchingNote?.metin || currentEdit.antrenorNotu;

    const currentTags = currentEdit.gelisimAlanlari || [];
    const mergedTags = [...currentTags];
    if (matchingNote?.onerilenGelisimAlanlari) {
      matchingNote.onerilenGelisimAlanlari.forEach((tag) => {
        if (!mergedTags.includes(tag)) {
          mergedTags.push(tag);
        }
      });
    }

    setCurrentEdit({
      ...currentEdit,
      teknik: {
        ...profile.teknik,
        ortalama: teknikAvg,
      },
      fiziksel: {
        ...profile.fiziksel,
        ortalama: fizikselAvg,
      },
      taktiksel: {
        ...profile.taktiksel,
        ortalama: taktikselAvg,
      },
      zihinsel: {
        ...profile.zihinsel,
        ortalama: zihinselAvg,
      },
      davranissal: {
        ...currentEdit.davranissal,
        kriterler: {
          ...profile.davranissalKriterler,
          ortalama: davrAvg,
        },
      },
      ...(withCoachNote ? { antrenorNotu: noteToApply } : {}),
      ...(profile.katilimYuzdesi ? { katilimYuzdesi: profile.katilimYuzdesi } : {}),
      gelisimAlanlari: mergedTags,
    });
    setHasUnsavedChanges(true);
    showToast(`"${profile.baslik}" şablonu ve metin bloğu kutucuklara tek tıkla dolduruldu!`);
  };

  const handleToggleDevelopmentTag = (tag: string) => {
    if (!currentEdit) return;
    const currentList = currentEdit.gelisimAlanlari || [];
    let updated: string[];
    if (currentList.includes(tag)) {
      updated = currentList.filter((t) => t !== tag);
    } else {
      updated = [...currentList, tag];
    }
    setCurrentEdit({
      ...currentEdit,
      gelisimAlanlari: updated,
    });
    setHasUnsavedChanges(true);
  };

  const handleQuickCategoryScore = (
    category: 'teknik' | 'fiziksel' | 'taktiksel' | 'zihinsel',
    score: number
  ) => {
    if (!currentEdit) return;
    const currentCat = { ...currentEdit[category] };
    const keys = Object.keys(currentCat).filter((k) => k !== 'ortalama');
    keys.forEach((k) => {
      (currentCat as any)[k] = score;
    });
    currentCat.ortalama = score;

    setCurrentEdit({
      ...currentEdit,
      [category]: currentCat,
    });
    setHasUnsavedChanges(true);
    showToast(`${category.toUpperCase()} için tüm kriterlere ${score} puan uygulandı.`);
  };

  const handleCopyTemplateText = (id: string, text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedTemplateId(id);
      setTimeout(() => setCopiedTemplateId(null), 2000);
      showToast('Şablon metni panoya kopyalandı.');
    }
  };

  const renderScoringRow = (
    category: 'teknik' | 'fiziksel' | 'taktiksel' | 'zihinsel',
    item: { key: string; label: string; desc: string }
  ) => {
    if (!currentEdit) return null;
    const val = (currentEdit[category] as any)[item.key] ?? 7;

    return (
      <div
        key={item.key}
        className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-2.5 hover:border-slate-300 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-800">{item.label}</span>
            <p className="text-[11px] text-slate-500">{item.desc}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick 1-click score buttons */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 font-semibold px-1 hidden sm:inline">Hızlı:</span>
              {[6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleScoreChange(category, item.key, score)}
                  title={`${item.label} kutucuğuna ${score} puan ata`}
                  className={`w-6 h-6 rounded text-[11px] font-black transition-all flex items-center justify-center cursor-pointer ${
                    val === score
                      ? 'bg-blue-600 text-white shadow-2xs scale-105'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>

            {/* Direct number input box */}
            <div className="flex items-center bg-white rounded-lg border border-slate-200 px-2 py-1 shadow-2xs">
              <input
                type="number"
                min={1}
                max={10}
                value={val}
                onChange={(e) => {
                  const num = Math.max(1, Math.min(10, Number(e.target.value) || 1));
                  handleScoreChange(category, item.key, num);
                }}
                className={`w-8 text-center text-sm font-black outline-none ${
                  val >= 8 ? 'text-emerald-600' : val >= 6 ? 'text-blue-600' : 'text-amber-600'
                }`}
              />
              <span className="text-[10px] text-slate-400 font-normal">/10</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 w-3 text-center">1</span>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={val}
            onChange={(e) => handleScoreChange(category, item.key, Number(e.target.value))}
            className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <span className="text-[10px] font-bold text-slate-400 w-4 text-center">10</span>
        </div>
      </div>
    );
  };

  const renderDavranissalRow = (crit: { key: string; label: string }) => {
    if (!currentEdit) return null;
    const val = (currentEdit.davranissal.kriterler as any)?.[crit.key] ?? 8;

    return (
      <div
        key={crit.key}
        className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-2 hover:border-slate-300 transition-colors"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800">{crit.label}</span>

          <div className="flex items-center gap-2">
            {/* Quick 1-click score buttons */}
            <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
              {[6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleDavranissalKriterChange(crit.key, score)}
                  title={`${crit.label} kutucuğuna ${score} puan ata`}
                  className={`w-6 h-6 rounded text-[11px] font-black transition-all flex items-center justify-center cursor-pointer ${
                    val === score
                      ? 'bg-blue-600 text-white shadow-2xs scale-105'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>

            {/* Direct number input box */}
            <div className="flex items-center bg-white rounded-lg border border-slate-200 px-2 py-0.5 shadow-2xs">
              <input
                type="number"
                min={1}
                max={10}
                value={val}
                onChange={(e) => {
                  const num = Math.max(1, Math.min(10, Number(e.target.value) || 1));
                  handleDavranissalKriterChange(crit.key, num);
                }}
                className={`w-7 text-center text-xs font-black outline-none ${
                  val >= 8 ? 'text-emerald-600' : val >= 6 ? 'text-blue-600' : 'text-amber-600'
                }`}
              />
              <span className="text-[10px] text-slate-400">/10</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min={1}
            max={10}
            value={val}
            onChange={(e) => handleDavranissalKriterChange(crit.key, Number(e.target.value))}
            className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    );
  };

  // Overall combined rating of selected athlete
  const overallAverage = currentEdit
    ? (
        (currentEdit.teknik.ortalama +
          currentEdit.fiziksel.ortalama +
          currentEdit.taktiksel.ortalama +
          currentEdit.zihinsel.ortalama +
          (currentEdit.davranissal.kriterler?.ortalama || 8.0)) /
          5
      ).toFixed(1)
    : '0.0';

  const selectedAthleteLogs = currentEdit ? sporpuanLogs.filter(log => log.sporcuId === currentEdit.id) : [];
  const totalSporPuan = selectedAthleteLogs.reduce((sum, log) => sum + log.points, 0);

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto w-full space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header matching Sporpuan Style */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 font-bold text-[11px] uppercase tracking-wider border border-amber-400/30 flex items-center gap-1.5 shadow-2xs">
              <SportsFlyIcon className="w-3.5 h-3.5" />
              Sporpuan Gelişim &amp; Yetkinlik Motoru
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Antrenör Değerlendirme Modülü
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-400" />
            Sporcu Değerlendirme &amp; Yetkinlik Takibi
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Antrenörlerin sporcuların teknik, fiziksel, taktiksel, zihinsel ve davranışsal yetkinliklerini 
            puanlayarak anlık olarak Sporcu Karnesi'ne ve Sporpuan itibar profiline aktardığı kontrol merkezi.
          </p>
        </div>

        {/* Quick action shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10 w-full sm:w-auto">
          <button
            onClick={() => {
              setTemplateModalTab('notlar');
              setShowTemplateModal(true);
            }}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Hazır Şablonlar</span>
          </button>
          <button
            onClick={() => setShowBatchModal(true)}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600/80 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Toplu Puan Girişi</span>
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate('sporcu-karnesi')}
              className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Sporcu Karnesi Görünümü</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-3 max-w-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setViewMode('degerlendirme')}
          className={`py-2 px-1.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
            viewMode === 'degerlendirme'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">Değerlendirme</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('hesaplayici')}
          className={`py-2 px-1.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
            viewMode === 'hesaplayici'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="truncate">Hesaplayıcı</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('kriterler')}
          className={`py-2 px-1.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
            viewMode === 'kriterler'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Kriterler</span>
        </button>
      </div>

      {viewMode === 'degerlendirme' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Athlete Selection & Filters (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Sporcular ({filteredKarneler.length})
              </h2>
              <span className="text-[11px] font-semibold text-slate-400">
                Puanlama İçin Seçin
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="İsim, branş veya takım ara..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Filter selects */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Branş</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Takım / Grup</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none truncate"
                >
                  {groups.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Athlete List */}
            <div className="space-y-2 max-h-[calc(100vh-340px)] overflow-y-auto pr-1">
              {filteredKarneler.map((k) => {
                const isSelected = selectedKarneId === k.id;
                const avg = (
                  (k.teknik.ortalama +
                    k.fiziksel.ortalama +
                    k.taktiksel.ortalama +
                    k.zihinsel.ortalama) /
                  4
                ).toFixed(1);

                return (
                  <div
                    key={k.id}
                    className={`w-full p-2.5 sm:p-3 rounded-xl transition-all border flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50/90 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 ring-2 ring-blue-100 dark:ring-blue-900 shadow-xs'
                        : 'bg-white dark:bg-[#111c2e] border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedKarneId(k.id)}
                      className="min-w-0 flex-1 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">
                          {k.adSoyad}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded">
                          {k.yasGubu}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{k.grup}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Antrenör: {k.antrenor || 'Selman Utku'}
                      </p>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* HIZLI PUAN KISAYOL BUTONU - Geniş Dokunmatik Alan (min 44px) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedKarneId(k.id);
                          setQuickPointTarget({
                            id: k.id,
                            name: k.adSoyad,
                            branch: k.brans,
                            teamGroup: k.grup,
                          });
                        }}
                        className="min-w-[44px] min-h-[44px] p-2 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 rounded-xl flex items-center justify-center transition-all shadow-xs cursor-pointer"
                        title={`${k.adSoyad} için Hızlı Puan Ver`}
                        aria-label={`${k.adSoyad} için Hızlı Puan Ver`}
                      >
                        <Zap className="w-5 h-5 fill-slate-950 text-slate-950" />
                      </button>

                      {/* Not Ortalaması & Katılım */}
                      <div
                        onClick={() => setSelectedKarneId(k.id)}
                        className="text-right shrink-0 cursor-pointer min-w-[54px]"
                      >
                        <div className="text-xs font-black text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/60 px-1.5 py-0.5 rounded-md flex items-center justify-end gap-1">
                          <span>{avg}</span>
                          <span className="text-[9px] text-blue-500 dark:text-blue-400 font-normal">/10</span>
                        </div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block truncate">
                          %{k.katilimYuzdesi}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredKarneler.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  Arama kriterlerine uygun sporcu bulunamadı.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Athlete Comprehensive Grading Form (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {currentEdit ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              {/* Selected Athlete Top Summary Card */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                    {currentEdit.adSoyad
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-800">
                        {currentEdit.adSoyad}
                      </h2>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                        {currentEdit.brans}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {currentEdit.grup} • Boy: {currentEdit.boy} cm • Kilo: {currentEdit.kilo} kg
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right border-r border-slate-200 pr-3">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Karne Ortalaması</div>
                    <div className="text-lg font-black text-slate-800 flex items-center justify-end gap-1">
                      <span className="text-blue-600">{overallAverage}</span>
                      <span className="text-xs text-slate-400 font-normal">/10</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Toplam Sporpuan</div>
                    <div className="text-lg font-black text-amber-600 flex items-center justify-end gap-1">
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                      <span>{totalSporPuan} SP</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Compact Quick Profile Selector */}
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        const foundProfile = HAZIR_PUANLAMA_PROFILLERI.find((p) => p.id === val);
                        if (foundProfile) {
                          handleApplyScoringProfile(foundProfile, true);
                        }
                        e.target.value = '';
                      }}
                      defaultValue=""
                      className="text-xs py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors max-w-[200px] truncate"
                      title="Hazır Puanlama Profili Uygula"
                    >
                      <option value="" disabled> Hazır Profil Seç...</option>
                      {HAZIR_PUANLAMA_PROFILLERI.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.baslik} ({p.rozet})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        setTemplateModalTab('notlar');
                        setShowTemplateModal(true);
                      }}
                      className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Şablon Kütüphanesini Aç"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleSaveCurrentEdit}
                      disabled={!hasUnsavedChanges}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                        hasUnsavedChanges
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      <span>{hasUnsavedChanges ? 'Değişiklikleri Kaydet' : 'Kaydedildi'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="px-5 border-b border-slate-100 bg-white flex overflow-x-auto custom-scrollbar gap-1 pt-2">
                {[
                  { id: 'teknik', label: 'Teknik Gelişim', icon: Activity, avg: currentEdit.teknik.ortalama },
                  { id: 'fiziksel', label: 'Fiziksel Yetkinlik', icon: TrendingUp, avg: currentEdit.fiziksel.ortalama },
                  { id: 'taktiksel', label: 'Taktiksel Zeka', icon: Target, avg: currentEdit.taktiksel.ortalama },
                  { id: 'zihinsel', label: 'Zihinsel & Karakter', icon: Brain, avg: currentEdit.zihinsel.ortalama },
                  { id: 'davranissal', label: 'Davranış & Periyot', icon: ShieldCheck, avg: currentEdit.davranissal.kriterler?.ortalama || 8 },
                  { id: 'rozetler', label: `Rozetler (${currentEdit.davranissal.kazanimlar?.length || 0})`, icon: Award },
                  { id: 'olcumler', label: 'Fiziki Ölçüm & Not', icon: Info },
                  { id: 'sporpuan', label: 'Sporpuan (SP)', icon: Zap },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                        isActive
                          ? 'border-blue-600 text-blue-600 font-bold'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                      {typeof tab.avg === 'number' && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {tab.avg}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents */}
              <div className="p-6">
                {/* 1. TEKNİK TAB */}
                {activeTab === 'teknik' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Teknik Beceriler Puanlaması</h3>
                        <p className="text-xs text-slate-500">
                          1-10 arası sürgüleri kullanarak antrenmandaki teknik uygulamaları puanlayın.
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black rounded-lg">
                        Ortalama: {currentEdit.teknik.ortalama} / 10
                      </div>
                    </div>

                    {/* Quick Category Score Presets */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Kategoriye Hızlı Puan Doldur:</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { score: 10, label: '10 Mükemmel', bg: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200' },
                          { score: 9, label: '9 Elit', bg: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200' },
                          { score: 8, label: '8 Çok İyi', bg: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200' },
                          { score: 7, label: '7 Gelişiyor', bg: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200' },
                          { score: 6, label: '6 Temel', bg: 'hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200' },
                        ].map((btn) => (
                          <button
                            key={btn.score}
                            type="button"
                            onClick={() => handleQuickCategoryScore('teknik', btn.score)}
                            className={`px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors shadow-2xs ${btn.bg}`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: 'topKontrolu', label: 'Top Kontrolü & Hakimiyet', desc: 'Top saklama, temas yumuşaklığı ve top sürüş güveni' },
                        { key: 'pasBasarisi', label: 'Pas İsabeti & Zamanlama', desc: 'Kısa ve uzun paslarda yön, şiddet ve doğru arkadaşı bulma' },
                        { key: 'sut', label: 'Şut & Bitiricilik', desc: 'Pozisyon aldığında skora dönüştürme ve şut mekaniği' },
                        { key: 'topSurme', label: 'Dribbling & Birebir', desc: 'Rakipten sıyrılma, top sürme hızı ve yön değiştirme' },
                        { key: 'savunma', label: 'Bireysel Savunma Tekniği', desc: 'Duruş pozisyonu, ayak hareketleri ve top kapma' },
                      ].map((item) => renderScoringRow('teknik', item))}
                    </div>
                  </div>
                )}

                {/* 2. FİZİKSEL TAB */}
                {activeTab === 'fiziksel' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Fiziksel Parametreler</h3>
                        <p className="text-xs text-slate-500">
                          Kondisyon, patlayıcı güç, çabukluk ve aerobik kapasite takibi.
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black rounded-lg">
                        Ortalama: {currentEdit.fiziksel.ortalama} / 10
                      </div>
                    </div>

                    {/* Quick Category Score Presets */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Kategoriye Hızlı Puan Doldur:</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { score: 10, label: '10 Mükemmel', bg: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200' },
                          { score: 9, label: '9 Elit', bg: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200' },
                          { score: 8, label: '8 Çok İyi', bg: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200' },
                          { score: 7, label: '7 Gelişiyor', bg: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200' },
                          { score: 6, label: '6 Temel', bg: 'hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200' },
                        ].map((btn) => (
                          <button
                            key={btn.score}
                            type="button"
                            onClick={() => handleQuickCategoryScore('fiziksel', btn.score)}
                            className={`px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors shadow-2xs ${btn.bg}`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: 'hiz', label: 'Hız & Sprint Kapasitesi', desc: 'Mesafe kat etme ve ani ivmelenme yeteneği' },
                        { key: 'dayaniklilik', label: 'Dayanıklılık & Kondisyon', desc: 'Maç veya antrenman sonuna dek performansı koruma' },
                        { key: 'guc', label: 'Fiziksel Güç & İkili Mücadele', desc: 'Omuz omuza pozisyonlarda ayakta kalma gücü' },
                        { key: 'ceviklik', label: 'Çeviklik & Koordinasyon', desc: 'Vücut ağırlık merkezini hızlı yönlendirme ve esneklik' },
                      ].map((item) => renderScoringRow('fiziksel', item))}
                    </div>
                  </div>
                )}

                {/* 3. TAKTİKSEL TAB */}
                {activeTab === 'taktiksel' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Taktiksel Anlayış ve Oyun Bilgisi</h3>
                        <p className="text-xs text-slate-500">
                          Saha içi yerleşim, antrenör direktiflerine sadakat ve karar alma.
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black rounded-lg">
                        Ortalama: {currentEdit.taktiksel.ortalama} / 10
                      </div>
                    </div>

                    {/* Quick Category Score Presets */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Kategoriye Hızlı Puan Doldur:</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { score: 10, label: '10 Mükemmel', bg: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200' },
                          { score: 9, label: '9 Elit', bg: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200' },
                          { score: 8, label: '8 Çok İyi', bg: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200' },
                          { score: 7, label: '7 Gelişiyor', bg: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200' },
                          { score: 6, label: '6 Temel', bg: 'hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200' },
                        ].map((btn) => (
                          <button
                            key={btn.score}
                            type="button"
                            onClick={() => handleQuickCategoryScore('taktiksel', btn.score)}
                            className={`px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors shadow-2xs ${btn.bg}`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: 'oyunZekasi', label: 'Oyun Zekası & Görüşü', desc: 'Boş alanları görebilme ve rakip hamlelerini önceden sezme' },
                        { key: 'pozisyonAlma', label: 'Pozisyon Alma & Alan Paylaşımı', desc: 'Toplu ve topsuz oyunda doğru konumlanma' },
                        { key: 'kararVerme', label: 'Baskı Altında Karar Verme', desc: 'Zaman kısıtı altında doğru opsiyonu seçebilme becerisi' },
                      ].map((item) => renderScoringRow('taktiksel', item))}
                    </div>
                  </div>
                )}

                {/* 4. ZİHİNSEL TAB */}
                {activeTab === 'zihinsel' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Zihinsel Dayanıklılık &amp; Karakter</h3>
                        <p className="text-xs text-slate-500">
                          Özgüven, liderlik, disiplin ve takım içi uyum seviyeleri.
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black rounded-lg">
                        Ortalama: {currentEdit.zihinsel.ortalama} / 10
                      </div>
                    </div>

                    {/* Quick Category Score Presets */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Kategoriye Hızlı Puan Doldur:</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { score: 10, label: '10 Mükemmel', bg: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200' },
                          { score: 9, label: '9 Elit', bg: 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200' },
                          { score: 8, label: '8 Çok İyi', bg: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200' },
                          { score: 7, label: '7 Gelişiyor', bg: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200' },
                          { score: 6, label: '6 Temel', bg: 'hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200' },
                        ].map((btn) => (
                          <button
                            key={btn.score}
                            type="button"
                            onClick={() => handleQuickCategoryScore('zihinsel', btn.score)}
                            className={`px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors shadow-2xs ${btn.bg}`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: 'disiplin', label: 'Çalışma Disiplini & Ciddiyet', desc: 'Antrenmana odaklanma ve süreklilik gösterme' },
                        { key: 'ozguven', label: 'Özgüven & Sorumluluk Alma', desc: 'Zorlu anlarda sorumluluk almaktan çekinmeme' },
                        { key: 'takimUyumu', label: 'Takım Uyumu & Yardımlaşma', desc: 'Arkadaşlarıyla iletişim ve pozitif enerji yayma' },
                        { key: 'liderlik', label: 'Saha İçi Liderlik & İletişim', desc: 'Takım arkadaşlarını yönlendirme ve saha içi ses verme' },
                      ].map((item) => renderScoringRow('zihinsel', item))}
                    </div>
                  </div>
                )}

                {/* 5. DAVRANIŞSAL & PERİYOT TAB */}
                {activeTab === 'davranissal' && (
                  <div className="space-y-6">
                    {/* Davranışsal Kriterler Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800">Davranışsal Kriterler</h3>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                          Ort: {currentEdit.davranissal.kriterler?.ortalama || 8.0} / 10
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { key: 'fairPlay', label: 'Fair-Play & Centilmenlik' },
                          { key: 'sorumlulukEkipman', label: 'Sorumluluk & Ekipman Düzeni' },
                          { key: 'saygiIletisim', label: 'Antrenör & Hakem Saygısı' },
                          { key: 'yonergeyeUyum', label: 'Yönerge & Taktik Sadakati' },
                          { key: 'duyguKontrolu', label: 'Öfke & Duygu Kontrolü' },
                        ].map((crit) => renderDavranissalRow(crit))}
                      </div>
                    </div>

                    {/* Sağlık & Alışkanlıklar Puanlaması */}
                    <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                        <SportsFlyIcon className="w-4 h-4" />
                        Sağlıklı Yaşam &amp; Alışkanlık Takibi
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Ekran Dengesi */}
                        <div className="bg-white p-3 rounded-lg border border-amber-200/60 space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-800">
                            <span>Ekran Süresi Dengesi</span>
                            <span className="text-amber-700">
                              {currentEdit.davranissal.bagimlilikVeAliskanlik?.ekranDengesi?.puan || 8}/10
                            </span>
                          </div>
                          <select
                            value={currentEdit.davranissal.bagimlilikVeAliskanlik?.ekranDengesi?.seviye || 'Dengeli & Bilinçli'}
                            onChange={(e) => handleHabitChange('ekranDengesi', 'seviye', e.target.value)}
                            className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-md"
                          >
                            <option value="Dengeli & Bilinçli">Dengeli &amp; Bilinçli</option>
                            <option value="Geliştirilmeli">Geliştirilmeli</option>
                            <option value="Riskli">Riskli</option>
                          </select>
                        </div>

                        {/* Zararlı Maddeler ve Alışkanlık */}
                        <div className="bg-white p-3 rounded-lg border border-amber-200/60 space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-800">
                            <span>Zararlı Alışkanlık Bilinci</span>
                            <span className="text-emerald-700">
                              {currentEdit.davranissal.bagimlilikVeAliskanlik?.zararliAliskanlik?.puan || 10}/10
                            </span>
                          </div>
                          <select
                            value={
                              currentEdit.davranissal.bagimlilikVeAliskanlik?.zararliAliskanlik?.seviye === 'Temiz Spor (Örnek)'
                                ? 'Bilinçli (Örnek)'
                                : currentEdit.davranissal.bagimlilikVeAliskanlik?.zararliAliskanlik?.seviye || 'Bilinçli (Örnek)'
                            }
                            onChange={(e) => handleHabitChange('zararliAliskanlik', 'seviye', e.target.value)}
                            className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-md"
                          >
                            <option value="Bilinçli (Örnek)">Bilinçli (Örnek)</option>
                            <option value="Takip Ediliyor">Takip Ediliyor</option>
                            <option value="Riskli">Riskli</option>
                          </select>
                        </div>

                        {/* Uyku ve Dinlenme */}
                        <div className="bg-white p-3 rounded-lg border border-amber-200/60 space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-800">
                            <span>Uyku &amp; Dinlenme</span>
                            <span className="text-blue-700">
                              {currentEdit.davranissal.bagimlilikVeAliskanlik?.uykuVeDinlenme?.puan || 8}/10
                            </span>
                          </div>
                          <select
                            value={currentEdit.davranissal.bagimlilikVeAliskanlik?.uykuVeDinlenme?.seviye || 'Düzenli (8+ Saat)'}
                            onChange={(e) => handleHabitChange('uykuVeDinlenme', 'seviye', e.target.value)}
                            className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-md"
                          >
                            <option value="Düzenli (8+ Saat)">Düzenli (8+ Saat)</option>
                            <option value="Düzensiz">Düzensiz</option>
                            <option value="Yetersiz">Yetersiz</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Periyodik Süreç Takibi (Dönem Gözlemleri) */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                        <span>Dönemsel Gelişim Periyotları ({currentEdit.davranissal.surecTakibi?.length || 0})</span>
                      </h4>

                      {/* Add Observation Form */}
                      <form onSubmit={handleAddObservation} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5 text-blue-600" />
                            <span>Yeni Gelişim / Periyot Gözlemi Ekle</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <select
                              onChange={(e) => {
                                const found = HAZIR_GOZLEM_SABLONLARI.find((t) => t.id === e.target.value);
                                if (found) handleApplyObservationTemplate(found, false);
                                e.target.value = '';
                              }}
                              defaultValue=""
                              className="text-[11px] py-1 px-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium cursor-pointer"
                            >
                              <option value="" disabled> Hazır Gözlem Şablonu...</option>
                              {HAZIR_GOZLEM_SABLONLARI.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.baslik} ({t.durum})
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => {
                                setTemplateModalTab('gozlemler');
                                setShowTemplateModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
                              title="Tüm gözlem şablonlarını aç"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={newObservationPeriod}
                            onChange={(e) => setNewObservationPeriod(e.target.value)}
                            placeholder="Dönem (Örn: 2024 Güz - 1. Periyot)"
                            className="text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                            required
                          />
                          <input
                            type="text"
                            value={newObservationFocus}
                            onChange={(e) => setNewObservationFocus(e.target.value)}
                            placeholder="Odak Konusu (Örn: Pas & Şut Zamanlaması)"
                            className="text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                            required
                          />
                          <select
                            value={newObservationStatus}
                            onChange={(e) => setNewObservationStatus(e.target.value as any)}
                            className="text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                          >
                            <option value="Gelişiyor">Gelişiyor</option>
                            <option value="Hedefe Ulaştı">Hedefe Ulaştı</option>
                            <option value="Örnek Davranış">Örnek Davranış</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newObservationNotes}
                            onChange={(e) => setNewObservationNotes(e.target.value)}
                            placeholder="Antrenör gözlem notu..."
                            className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                          >
                            Ekle
                          </button>
                        </div>
                      </form>

                      {/* Observation list */}
                      <div className="space-y-2">
                        {currentEdit.davranissal.surecTakibi?.map((step, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-800">{step.donem}</span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    step.durum === 'Örnek Davranış'
                                      ? 'bg-purple-100 text-purple-700'
                                      : step.durum === 'Hedefe Ulaştı'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {step.durum}
                                </span>
                                <span className="text-[10px] text-slate-400">{step.tarih}</span>
                              </div>
                              <div className="text-xs font-semibold text-blue-800">{step.odakKonusu}</div>
                              <p className="text-xs text-slate-600">{step.gozlem}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveObservation(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. ROZETLER TAB */}
                {activeTab === 'rozetler' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Sporcu Rozetleri ve Başarıları</h3>
                        <p className="text-xs text-slate-500">
                          Sporcunun hak ettiği rozetleri tıklayarak karnesine tanımlayın veya kaldırın.
                        </p>
                      </div>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                        {currentEdit.davranissal.kazanimlar?.length || 0} Rozet Aktif
                      </span>
                    </div>

                    {/* Filter and search */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={badgeSearch}
                          onChange={(e) => setBadgeSearch(e.target.value)}
                          placeholder="Rozet ara..."
                          className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                        />
                      </div>
                      <select
                        value={badgeFilterCategory}
                        onChange={(e) => setBadgeFilterCategory(e.target.value)}
                        className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                      >
                        {KURUMSAL_ROZET_KATEGORILERI.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Badges Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {KURUMSAL_ROZETLER.filter((r) => {
                        const matchCat = badgeFilterCategory === 'Tümü' || r.kategori === badgeFilterCategory;
                        const matchQ = r.baslik.toLowerCase().includes(badgeSearch.toLowerCase()) || r.aciklama.toLowerCase().includes(badgeSearch.toLowerCase());
                        return matchCat && matchQ;
                      }).map((rozet) => {
                        const isEarned = (currentEdit.davranissal.kazanimlar || []).some(
                          (k) => k.rozetId === rozet.id || k.baslik.toLowerCase() === rozet.baslik.toLowerCase()
                        );

                        return (
                          <div
                            key={rozet.id}
                            onClick={() => handleToggleBadge(rozet)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                              isEarned
                                ? 'bg-blue-50/80 border-blue-400 shadow-2xs ring-2 ring-blue-100'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Award className={`w-4 h-4 ${isEarned ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span className="text-xs font-bold text-slate-800">{rozet.baslik}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-snug">{rozet.aciklama}</p>
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                                  {rozet.kategori}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 font-bold">
                                  {rozet.onemDerecesi}
                                </span>
                              </div>
                            </div>

                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                                isEarned
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'border-slate-300 bg-white text-transparent'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 7. ÖLÇÜMLER & NOTLAR TAB */}
                {activeTab === 'olcumler' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Fiziki Ölçümler ve Antrenör Değerlendirme Notu</h3>
                        <p className="text-xs text-slate-500">
                          Boy, kilo, katılım bilgileri ve veliye iletilecek antrenör geri bildirimi.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="text-xs font-bold text-slate-700 block mb-1">Boy (cm)</label>
                        <input
                          type="number"
                          value={currentEdit.boy}
                          onChange={(e) => {
                            setCurrentEdit({ ...currentEdit, boy: Number(e.target.value) });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none"
                        />
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="text-xs font-bold text-slate-700 block mb-1">Kilo (kg)</label>
                        <input
                          type="number"
                          value={currentEdit.kilo}
                          onChange={(e) => {
                            setCurrentEdit({ ...currentEdit, kilo: Number(e.target.value) });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none"
                        />
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="text-xs font-bold text-slate-700 block mb-1">Antrenman Katılım (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={currentEdit.katilimYuzdesi}
                          onChange={(e) => {
                            setCurrentEdit({ ...currentEdit, katilimYuzdesi: Number(e.target.value) });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-xs font-bold text-slate-700 block">
                          Antrenör Değerlendirme Notu (Karneye Yazılır)
                        </label>
                        
                        <div className="flex items-center gap-1.5">
                          <select
                            onChange={(e) => {
                              const found = HAZIR_ANTRENOR_NOTLARI.find((n) => n.id === e.target.value);
                              if (found) handleApplyCoachNoteTemplate(found, false);
                              e.target.value = '';
                            }}
                            defaultValue=""
                            className="text-xs py-1 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 font-medium cursor-pointer max-w-[220px] truncate"
                          >
                            <option value="" disabled> Hazır Not Şablonu Ekle...</option>
                            {HAZIR_ANTRENOR_NOTLARI.map((tpl) => (
                              <option key={tpl.id} value={tpl.id}>
                                [{tpl.kategori}] {tpl.baslik}
                              </option>
                            ))}
                          </select>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setTemplateModalTab('notlar');
                              setShowTemplateModal(true);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
                            title="Şablon Kütüphanesini Aç"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={4}
                        value={currentEdit.antrenorNotu}
                        onChange={(e) => {
                          setCurrentEdit({ ...currentEdit, antrenorNotu: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Sporcunun genel performansı, takımdaki duruşu ve bir sonraki dönem hedefleri..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 block">
                          Öncelikli Gelişim Alanları
                        </label>
                        <span className="text-[10px] text-slate-400">Virgülle ayırarak yazın veya aşağıdaki etiketlere tıklayın</span>
                      </div>
                      <input
                        type="text"
                        value={currentEdit.gelisimAlanlari?.join(', ') || ''}
                        onChange={(e) => {
                          const list = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          setCurrentEdit({ ...currentEdit, gelisimAlanlari: list });
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Örn: Karar Verme, Sol El Dribbling, Maç Konsantrasyonu"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white"
                      />
                      {/* Clickable Quick Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 self-center">Hazır Etiketler:</span>
                        {HAZIR_GELISIM_ETIKETLERI.map((tag) => {
                          const isSelected = currentEdit.gelisimAlanlari?.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleToggleDevelopmentTag(tag)}
                              className={`text-[10px] px-2 py-0.5 rounded-md font-medium border transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 font-bold'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'sporpuan' && (() => {
                  const selectedRule = sporpuanRules.find((r) => r.id === selectedRuleId) || sporpuanRules[0];
                  return (
                    <div className="space-y-6">
                      {/* Upper Metrics Dashboard */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                            <Zap className="w-6 h-6 fill-amber-300 text-amber-100" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Mevcut Sporpuan</div>
                            <div className="text-2xl font-black text-slate-800">{totalSporPuan} <span className="text-xs font-semibold text-slate-500">SP</span></div>
                            <p className="text-[10px] text-amber-600 mt-0.5">Kazanılan toplam ödül puanı</p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                            <Award className="w-6 h-6 text-blue-100" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Kazanılan Rozetler</div>
                            <div className="text-2xl font-black text-slate-800">{currentEdit.davranissal.kazanimlar?.length || 0} <span className="text-xs font-semibold text-slate-500">Adet</span></div>
                            <p className="text-[10px] text-blue-600 mt-0.5">Aktif rozet ve başarılar</p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                            <Activity className="w-6 h-6 text-emerald-100" />
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Katılım Yüzdesi</div>
                            <div className="text-2xl font-black text-slate-800">%{currentEdit.katilimYuzdesi}</div>
                            <p className="text-[10px] text-emerald-600 mt-0.5">Toplam {currentEdit.antrenmanSayisi} antrenman</p>
                          </div>
                        </div>
                      </div>

                      {/* Left: Award Point Form, Right: Rules List */}
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        {/* Interactive Scoring Console (7 cols) */}
                        <div className="xl:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              <Plus className="w-4 h-4 text-blue-600" />
                              Yeni Sporpuan (SP) Girişi
                            </h3>
                            <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold">Koç Yetkisi</span>
                          </div>

                          {/* Rules selection */}
                          <div className="space-y-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-500 block mb-1">Puan Kazanım Kuralı Seçin</label>
                              <select
                                id="sporpuan-rule-select"
                                value={selectedRuleId}
                                onChange={(e) => setSelectedRuleId(e.target.value)}
                                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                              >
                                {sporpuanRules.map((rule) => {
                                  const countInMonth = selectedAthleteLogs.filter(log => log.ruleId === rule.id).length;
                                  const isLimitReached = rule.monthlyLimit !== undefined && countInMonth >= rule.monthlyLimit;
                                  return (
                                    <option key={rule.id} value={rule.id}>
                                      [{rule.category}] {rule.ruleName} (+{rule.points} SP) {rule.monthlyLimit ? ` - Limit: ${countInMonth}/${rule.monthlyLimit}` : ''} {isLimitReached ? ' ⚠️ Sınır Doldu' : ''}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            {/* Rule details card */}
                            {selectedRule && (() => {
                              const countInMonth = selectedAthleteLogs.filter(log => log.ruleId === selectedRule.id).length;
                              const isLimitReached = selectedRule.monthlyLimit !== undefined && countInMonth >= selectedRule.monthlyLimit;
                              return (
                                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-700">{selectedRule.ruleName}</span>
                                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-lg">+{selectedRule.points} SP</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                                    <div>
                                      <strong className="text-slate-600 block">Kategori / Kaynak:</strong>
                                      {selectedRule.category} / {selectedRule.source}
                                    </div>
                                    <div>
                                      <strong className="text-slate-600 block">Limit / Kullanılan:</strong>
                                      {selectedRule.limit} {selectedRule.monthlyLimit ? `(Kullanılan: ${countInMonth}/${selectedRule.monthlyLimit})` : ''}
                                    </div>
                                    <div>
                                      <strong className="text-slate-600 block">Tetikleyici:</strong>
                                      {selectedRule.trigger}
                                    </div>
                                    <div>
                                      <strong className="text-slate-600 block">Durum:</strong>
                                      {isLimitReached ? (
                                        <span className="text-rose-600 font-bold flex items-center gap-1">⚠️ Sınır Aşıldı</span>
                                      ) : (
                                        <span className="text-emerald-600 font-bold flex items-center gap-1">✓ Kazanılabilir</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Coach comment */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-slate-500">Değerlendirme Notu / Açıklama (İsteğe Bağlı)</label>
                                <span className="text-[10px] text-slate-400">Örn: "Ders içi gösterdiği üstün yardımlaşma."</span>
                              </div>
                              <input
                                type="text"
                                value={sporpuanNote}
                                onChange={(e) => setSporpuanNote(e.target.value)}
                                placeholder="Not ekleyin..."
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            {/* Add button */}
                            <button
                              type="button"
                              onClick={handleAwardPoints}
                              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                            >
                              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span>{currentEdit.adSoyad} Sporcusuna Puanı Tanımla</span>
                            </button>
                          </div>
                        </div>

                        {/* Score rules table summary (5 cols) */}
                        <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                              Sporpuan Sistemi Tablosu
                            </h3>
                            <span className="text-[10px] text-slate-400">{sporpuanRules.length} Kural Akışı</span>
                          </div>

                          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                            {sporpuanRules.map((rule) => {
                              const countInMonth = selectedAthleteLogs.filter(log => log.ruleId === rule.id).length;
                              const isLimitReached = rule.monthlyLimit !== undefined && countInMonth >= rule.monthlyLimit;
                              return (
                                <div key={rule.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded uppercase">
                                        {rule.category}
                                      </span>
                                      <span className="font-semibold text-slate-800 truncate">{rule.ruleName}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                      Sınır: {rule.limit} • {rule.trigger}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="font-bold text-amber-600">+{rule.points} SP</div>
                                    {rule.monthlyLimit && (
                                      <div className={`text-[9px] font-medium ${isLimitReached ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                                        {countInMonth}/{rule.monthlyLimit} Limit
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Point History Log for Selected Athlete */}
                      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-600" />
                            Sporcu Puan Kazanım Geçmişi ({selectedAthleteLogs.length} Kayıt)
                          </h3>
                          <span className="text-[11px] font-bold text-amber-600">Toplam: {totalSporPuan} SP</span>
                        </div>

                        {selectedAthleteLogs.length === 0 ? (
                          <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
                            Bu sporcuya henüz hiç puan tanımlanmamış. Yukarıdaki konsoldan puan ekleyebilirsiniz.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold bg-slate-50/50">
                                  <th className="py-2.5 px-3">Kategori</th>
                                  <th className="py-2.5 px-3">Kural / Kazanım Gerekçesi</th>
                                  <th className="py-2.5 px-3">Puan</th>
                                  <th className="py-2.5 px-3">Tarih</th>
                                  <th className="py-2.5 px-3">Kaynak</th>
                                  <th className="py-2.5 px-3">Açıklama</th>
                                  <th className="py-2.5 px-3 text-right">İşlem</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedAthleteLogs.map((log) => (
                                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3 px-3">
                                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-[10px] uppercase">
                                        {log.category}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 font-semibold text-slate-800">{log.ruleName}</td>
                                    <td className="py-3 px-3">
                                      <span className="font-bold text-emerald-600">+{log.points} SP</span>
                                    </td>
                                    <td className="py-3 px-3 text-slate-500">{log.date}</td>
                                    <td className="py-3 px-3">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                        log.source === 'Otomatik' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                                      }`}>
                                        {log.source}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-slate-500 italic max-w-xs truncate" title={log.note}>
                                      {log.note || '-'}
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteLog(log.id)}
                                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                        title="Puan kaydını sil"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Bottom Sticky Action Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Son Kayıt Tarihi: {currentEdit.tarih}</span>
                </div>

                <div className="flex items-center gap-3">
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('sporcu-karnesi')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-3 py-2 cursor-pointer"
                    >
                      Karnede Görüntüle
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveCurrentEdit}
                    disabled={!hasUnsavedChanges}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer ${
                      hasUnsavedChanges
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Değerlendirmeyi Kaydet
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Lütfen soldaki listeden değerlendirmek istediğiniz sporcuyu seçin.
            </div>
          )}
        </div>
      </div>
      ) : viewMode === 'hesaplayici' ? (
        (() => {
          const getMultiplierForCategory = (category: string, age: '5-8' | '9-12' | '13-17') => {
            const multipliers = {
              'Devam': { '5-8': 1.0, '9-12': 1.0, '13-17': 1.0 },
              'Seri': { '5-8': 1.5, '9-12': 1.0, '13-17': 1.0 },
              'Davranış': { '5-8': 1.2, '9-12': 1.0, '13-17': 1.0 },
              'Gelişim': { '5-8': 0.8, '9-12': 1.2, '13-17': 1.2 },
              'Aile ve İlişki': { '5-8': 1.0, '9-12': 1.0, '13-17': 1.0 },
              'Etkinlik': { '5-8': 1.0, '9-12': 1.0, '13-17': 1.2 }
            };
            const catKey = category as keyof typeof multipliers;
            return multipliers[catKey]?.[age] ?? 1.0;
          };

          const handleUpdateCalcQuantity = (ruleId: string, val: number) => {
            const rule = sporpuanRules.find(r => r.id === ruleId);
            if (!rule) return;
            let max = 100;
            if (ruleId === 'r1' || ruleId === 'r2') {
              max = calcMonthlyTraining;
            } else if (rule.monthlyLimit) {
              max = rule.monthlyLimit;
            }
            const finalVal = Math.max(0, Math.min(max, val));
            setCalcQuantities(prev => ({ ...prev, [ruleId]: finalVal }));
          };

          const handleUpdateMonthlyTraining = (newVal: number) => {
            const clampedVal = Math.max(1, Math.min(31, newVal));
            setCalcMonthlyTraining(clampedVal);
            setCalcQuantities(prev => {
              const next = { ...prev };
              if (prev.r1 !== undefined) next.r1 = Math.min(clampedVal, prev.r1);
              if (prev.r2 !== undefined) next.r2 = Math.min(clampedVal, prev.r2);
              return next;
            });
          };

          // Calculate dynamic stats
          const totalBeforeCap = sporpuanRules.reduce((acc, rule) => {
            const qty = calcQuantities[rule.id] ?? 0;
            const multiplier = getMultiplierForCategory(rule.category, calcAgeGroup);
            return acc + Math.round(rule.points * qty * multiplier);
          }, 0);
          const monthlyCap = 700;
          const estimatedGain = Math.min(totalBeforeCap, monthlyCap);
          const isCapped = totalBeforeCap >= monthlyCap;

          return (
            <div className="space-y-6">
              {/* Sporpuan Kazanç Hesaplayıcı Header */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-emerald-600" />
                      Sporpuan Kazanç Hesaplayıcı &amp; Ödül Simülatörü
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                      Sporcuların yaş gruplarına ve aylık antrenman sayılarına göre kazanacakları puanları simüle edin, hedefledikleri ödüllere ulaşma durumlarını anlık olarak izleyin.
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200/60 rounded-xl px-3.5 py-2 text-[11px] text-amber-800 flex items-center gap-2 shrink-0 max-w-xs">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Mavi yazılı/sarı zeminli hücreler simülasyon için değiştirilebilir.</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (8 cols): Inputs and Interactive Calculator List */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Setup Configuration Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Age Group Selector (Mavi yazılı / sarı zeminli hücreleri simüle eden) */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Yaş Grubu Seçimi (Çarpan Belirler)
                      </label>
                      <div className="bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-amber-950">Yaş grubu:</span>
                        <div className="flex items-center gap-1.5 bg-amber-100/60 p-1 rounded-lg">
                          {(['5-8', '9-12', '13-17'] as const).map(age => (
                            <button
                              key={age}
                              type="button"
                              onClick={() => setCalcAgeGroup(age)}
                              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                calcAgeGroup === age
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-slate-700 hover:bg-amber-200/60'
                              }`}
                            >
                              {age} yaş
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Monthly Training Count */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Aylık Toplam Antrenman Sayısı
                      </label>
                      <div className="bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl flex items-center justify-between gap-4">
                        <span className="text-xs font-black text-amber-950">Aylık antrenman sayısı:</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateMonthlyTraining(calcMonthlyTraining - 1)}
                            className="w-10 h-10 rounded-lg bg-amber-100/80 hover:bg-amber-200/80 text-amber-950 font-black flex items-center justify-center text-lg cursor-pointer select-none border border-amber-200"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={calcMonthlyTraining}
                            readOnly
                            className="w-12 h-10 bg-white border border-amber-200 text-center font-black text-blue-700 rounded-lg text-sm outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateMonthlyTraining(calcMonthlyTraining + 1)}
                            className="w-10 h-10 rounded-lg bg-amber-100/80 hover:bg-amber-200/80 text-amber-950 font-black flex items-center justify-center text-lg cursor-pointer select-none border border-amber-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Interactive Matrix list */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        Kural Bazlı Kazanım Hesaplama Cetveli
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400">
                        Ölçümleri değiştirmek için adetleri artırın/azaltın
                      </span>
                    </div>

                    {/* Desktop view (Hidden on mobile) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="py-3 px-4">Kural</th>
                            <th className="py-3 px-4">Kategori</th>
                            <th className="py-3 px-4 text-center">Birim Puan</th>
                            <th className="py-3 px-4 text-center">Aylık Sınır</th>
                            <th className="py-3 px-4 text-center">Bu Ay Adet</th>
                            <th className="py-3 px-4 text-center">Çarpan</th>
                            <th className="py-3 px-4 text-right">Kazanılan SP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                          {sporpuanRules.map(rule => {
                            const qty = calcQuantities[rule.id] ?? 0;
                            const multiplier = getMultiplierForCategory(rule.category, calcAgeGroup);
                            const earnedSP = Math.round(rule.points * qty * multiplier);

                            return (
                              <tr key={rule.id} className="hover:bg-slate-50/40 text-xs transition-colors">
                                <td className="py-3.5 px-4 font-semibold text-slate-800">{rule.ruleName}</td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    rule.category === 'Devam' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                    rule.category === 'Seri' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                    rule.category === 'Davranış' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                    rule.category === 'Gelişim' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                    rule.category === 'Aile ve İlişki' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                    'bg-slate-50 text-slate-700 border border-slate-100'
                                  }`}>
                                    {rule.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center font-bold text-slate-600">{rule.points} SP</td>
                                <td className="py-3.5 px-4 text-center text-slate-500 font-medium">{rule.limit}</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center justify-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg p-1 max-w-[100px] mx-auto">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCalcQuantity(rule.id, qty - 1)}
                                      className="w-6 h-6 rounded bg-amber-100/80 hover:bg-amber-200 text-amber-950 font-black flex items-center justify-center text-xs cursor-pointer select-none"
                                    >
                                      -
                                    </button>
                                    <span className="w-6 text-center font-black text-blue-700 text-xs">{qty}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCalcQuantity(rule.id, qty + 1)}
                                      className="w-6 h-6 rounded bg-amber-100/80 hover:bg-amber-200 text-amber-950 font-black flex items-center justify-center text-xs cursor-pointer select-none"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-center font-bold text-slate-500">x{multiplier.toFixed(1)}</td>
                                <td className="py-3.5 px-4 text-right font-black text-blue-600 text-sm">
                                  {earnedSP} SP
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile list view (Shows on mobile, hidden on desktop) - satisfies specific user request */}
                    <div className="block md:hidden divide-y divide-slate-100 p-3 space-y-3 bg-white">
                      {sporpuanRules.map(rule => {
                        const qty = calcQuantities[rule.id] ?? 0;
                        const multiplier = getMultiplierForCategory(rule.category, calcAgeGroup);
                        const earnedSP = Math.round(rule.points * qty * multiplier);

                        return (
                          <div key={rule.id} className="pt-3 first:pt-0 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-slate-800 leading-tight">{rule.ruleName}</h4>
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">
                                    {rule.category}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    {rule.points} SP × x{multiplier.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-black text-blue-600 block">{earnedSP} SP</span>
                                <span className="text-[9px] text-slate-400 font-medium block">{rule.limit}</span>
                              </div>
                            </div>

                            {/* Quantity picker wrapper optimized for touch (at least 44px layout height) */}
                            <div className="flex items-center justify-between bg-amber-50/50 border border-amber-200/60 p-1.5 rounded-xl">
                              <span className="text-[11px] font-black text-amber-900 ml-1">Bu Ayki Adet:</span>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCalcQuantity(rule.id, qty - 1)}
                                  className="w-10 h-10 rounded-lg bg-amber-100 active:bg-amber-200 text-amber-950 font-black flex items-center justify-center text-sm cursor-pointer select-none border border-amber-200"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center font-black text-blue-700 text-sm">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCalcQuantity(rule.id, qty + 1)}
                                  className="w-10 h-10 rounded-lg bg-amber-100 active:bg-amber-200 text-amber-950 font-black flex items-center justify-center text-sm cursor-pointer select-none border border-amber-200"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column (4 cols): Live Results and Milestones */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Score summary Card */}
                  <div className="bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Aylık Kazanılan SP
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isCapped 
                          ? 'bg-amber-400 text-slate-950' 
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isCapped ? 'Tavanda' : 'Tavan Altında'}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-semibold text-slate-400">Toplam (tavan öncesi)</span>
                        <span className="text-base font-black text-slate-200">{totalBeforeCap}</span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-semibold text-slate-400">Aylık puan tavanı</span>
                        <span className="text-xs font-bold text-amber-400">{monthlyCap}</span>
                      </div>

                      <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 text-center space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                          TAHMİNİ AYLIK KAZANÇ (SP)
                        </span>
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                          {estimatedGain}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between text-[11px]">
                        <span className="font-semibold text-slate-400">Durum:</span>
                        <span className={`font-black ${isCapped ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {isCapped ? 'Tavanda' : 'Tavan altında'}
                        </span>
                      </div>

                      {/* Progress meter to Cap */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                          <span>Tavana İlerleme</span>
                          <span>{Math.min(100, Math.round((totalBeforeCap / monthlyCap) * 100))}%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCapped ? 'bg-amber-400' : 'bg-emerald-500'
                            }`} 
                            style={{ width: `${Math.min(100, (totalBeforeCap / monthlyCap) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ödüllere Ulaşma Durumu Tracker */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Award className="w-5 h-5 text-amber-500" />
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Ödüllere Ulaşma Durumu
                      </h3>
                    </div>

                    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                      {[
                        { name: 'Rozet / çıkartma seti', tier: 'Küçük', required: 300 },
                        { name: 'SportsFly Profesyonel Termos Suluk', tier: 'Küçük', required: 450 },
                        { name: 'SportsFly Dry-Fit Antrenman Tişörtü', tier: 'Orta', required: 750 },
                        { name: 'SportsFly Su Geçirmez Sırt & Krampon Çantası', tier: 'Orta', required: 950 },
                        { name: 'Koç ile 1-e-1 Bireysel Şut / Beceri Kliniği (45 dk)', tier: 'Orta', required: 1200 },
                        { name: 'Ayın Fair-Play & Örnek Sporcu Kristal Plaketi', tier: 'Büyük', required: 1500 },
                        { name: 'Aidat indirimi (ör. aylık aidatın %10\'u)', tier: 'Büyük', required: 1800 },
                        { name: 'Süper Lig / EuroLeague Maç Bileti (2 kişilik)', tier: 'Büyük', required: 2000 },
                      ].map((reward, idx) => {
                        const remaining = Math.max(0, reward.required - estimatedGain);
                        const progress = Math.min(100, Math.round((estimatedGain / reward.required) * 100));
                        const monthsNeeded = estimatedGain <= 0 
                          ? 'Süresiz' 
                          : Math.ceil(reward.required / estimatedGain) === 1 
                            ? '1 ay' 
                            : `${Math.ceil(reward.required / estimatedGain)} ay`;

                        return (
                          <div key={idx} className="space-y-2 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <span className="text-[11px] font-black text-slate-800 block leading-tight border-b border-transparent">
                                  {reward.name}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 rounded px-1.5 py-0.2">
                                  {reward.tier}
                                </span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[11px] font-bold text-slate-700 block">Gereken SP: {reward.required}</span>
                                <span className="text-[10px] font-bold text-emerald-600 block">{monthsNeeded}</span>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${progress}%` }} 
                                />
                              </div>
                              <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                                <span>İlerleme: %{progress}</span>
                                <span>Kalan SP: {remaining}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reference Matrices (Image 2 & Image 4 grids) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Age Group Multipliers table (Image 2) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <Sliders className="w-4 h-4 text-emerald-500" />
                    Yaş Grubuna Göre Puan Çarpanı
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100">
                          <th className="py-2.5 px-3">Kategori</th>
                          <th className="py-2.5 px-3 text-center">5-8 yaş</th>
                          <th className="py-2.5 px-3 text-center">9-12 yaş</th>
                          <th className="py-2.5 px-3 text-center">13-17 yaş</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/80 font-medium text-slate-700">
                        {[
                          { cat: 'Devam', g1: '1.0', g2: '1.0', g3: '1.0' },
                          { cat: 'Seri', g1: '1.5', g2: '1.0', g3: '1.0' },
                          { cat: 'Davranış', g1: '1.2', g2: '1.0', g3: '1.0' },
                          { cat: 'Gelişim', g1: '0.8', g2: '1.2', g3: '1.2' },
                          { cat: 'Aile ve İlişki', g1: '1.0', g2: '1.0', g3: '1.0' },
                          { cat: 'Etkinlik', g1: '1.0', g2: '1.0', g3: '1.2' },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-bold text-slate-800">{row.cat}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-blue-600">{row.g1}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{row.g2}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-purple-600">{row.g3}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed italic font-medium">
                    * Varsayım: Küçük yaşta seri ve davranış, büyük yaşta gelişim ve etkinlik ağırlığı yüksektir.
                  </p>
                </div>

                {/* System settings details grid (Image 4) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <Settings2 className="w-4 h-4 text-slate-500" />
                    Sistem Ayarları
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100">
                          <th className="py-2.5 px-3">Ayar</th>
                          <th className="py-2.5 px-3 text-center">Değer</th>
                          <th className="py-2.5 px-3">Açıklama</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/80 font-medium text-slate-700">
                        {[
                          { param: 'Aylık toplam puan tavanı (SP / sporcu)', val: '700', desc: 'Hesaplayıcıda kullanılır. Öneri değerdir.' },
                          { param: 'Puan geçerlilik süresi (ay)', val: '12', desc: 'Kayan süre: her puan kazanıldığı tarihten itibaren geçerli.' },
                          { param: 'Seri koruma hakkı (ay başına)', val: '1', desc: 'Mazeretli 1 devamsızlık seriyi bozmaz.' },
                          { param: 'Puan silme', val: 'Yok', desc: 'Devamsızlıkta sadece kazanma durur; ceza yok.' },
                          { param: 'Öznel puan kaydı', val: 'Gerekçe zorunlu', desc: 'Koç puan verirken listeden gerekçe seçer (ör. yardımseverlik).' },
                          { param: 'Sıralama tablosu', val: 'Takma ad / baş harf', desc: 'Veli rızasıyla; çocuk verisi KVKK kapsamındadır.' },
                          { param: 'Bildirim', val: 'Veliye', desc: 'Puan kazanıldığında ve ödül açıldığında.' },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-bold text-slate-800">{row.param}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-blue-600 bg-blue-50/30">{row.val}</td>
                            <td className="py-2.5 px-3 text-slate-500 leading-normal">{row.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        <div className="space-y-6">
          {/* Header Card for Central Scoring Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-blue-600 animate-spin-slow" />
                  Merkezi Puanlama Matrisi &amp; Başarı Kriterleri
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                  Sporcuların antrenman katılımı, maç performansı, fiziksel/taktiksel gelişim seviyeleri gibi başarıları karşılığında kazanacağı ödül puanlarını, limitlerini ve tetikleyicilerini buradan yönetebilirsiniz. Güncellemeler anlık olarak tüm sisteme yansıtılır.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!isSuperAdmin}
                  onClick={() => setShowAddRuleModal(true)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
                    isSuperAdmin
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed'
                  }`}
                  title={!isSuperAdmin ? 'Bu işlem için Süper Admin yetkisi gerekmektedir' : undefined}
                >
                  <Plus className="w-4 h-4" />
                  Yeni Kriter Tanımla
                </button>
                <button
                  type="button"
                  disabled={!isSuperAdmin}
                  onClick={handleResetRulesToDefault}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    isSuperAdmin
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      : 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
                  }`}
                  title={!isSuperAdmin ? 'Bu işlem için Süper Admin yetkisi gerekmektedir' : undefined}
                >
                  <Clock className="w-4 h-4 text-slate-500" />
                  Varsayılanlara Sıfırla
                </button>
              </div>
            </div>

            {!isSuperAdmin && (
              <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-3.5 text-xs text-amber-800 flex items-start gap-3">
                <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-amber-950">Yetki Sınırlandırması:</span>
                  <span className="leading-relaxed">
                    Puanlama kriterlerini güncelleme, yeni kural ekleme veya silme yetkisi yalnızca <strong>Süper Admin</strong> yetkisine sahip kullanıcılara aittir. Kulüp Yöneticisi rolü ile bu ayarları sadece görüntüleyebilirsiniz.
                  </span>
                </div>
              </div>
            )}

            {/* Filters Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {['Tümü', 'Devam', 'Seri', 'Davranış', 'Gelişim', 'Aile ve İlişki', 'Etkinlik'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMatrixCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      matrixCategoryFilter === cat
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Criteria Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Kriter adı veya kod ara..."
                  value={matrixSearch}
                  onChange={(e) => setMatrixSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Central Scoring Matrix Table Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black bg-slate-50/70 tracking-wider">
                    <th className="py-3 px-4 w-36">Kategori</th>
                    <th className="py-3 px-4 min-w-[180px]">Kriter Adı / Başarı Tanımı</th>
                    <th className="py-3 px-4 w-32">Kazanılan Puan (SP)</th>
                    <th className="py-3 px-4 w-36">Görünen Sınır</th>
                    <th className="py-3 px-4 w-28">Aylık Sayısal Sınır</th>
                    <th className="py-3 px-4 min-w-[150px]">Kriter Tetikleyicisi</th>
                    <th className="py-3 px-4 w-32">Puan Kaynağı</th>
                    <th className="py-3 px-4 text-right w-16">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const filteredRules = sporpuanRules.filter((rule) => {
                      const matchesCategory = matrixCategoryFilter === 'Tümü' || rule.category === matrixCategoryFilter;
                      const matchesSearch = rule.ruleName.toLowerCase().includes(matrixSearch.toLowerCase()) || rule.category.toLowerCase().includes(matrixSearch.toLowerCase());
                      return matchesCategory && matchesSearch;
                    });

                    if (filteredRules.length === 0) {
                      return (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            Arama kriterlerine uygun puanlama kuralı bulunamadı.
                          </td>
                        </tr>
                      );
                    }

                    return filteredRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Category Badge */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-1 font-bold rounded-md text-[10px] uppercase tracking-wide ${
                            rule.category === 'Devam' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            rule.category === 'Seri' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                            rule.category === 'Davranış' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            rule.category === 'Gelişim' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            rule.category === 'Aile ve İlişki' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            'bg-pink-50 text-pink-700 border border-pink-200'
                          }`}>
                            {rule.category}
                          </span>
                        </td>

                        {/* Rule/Achievement Name */}
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          <input
                            type="text"
                            value={rule.ruleName}
                            disabled={!isSuperAdmin}
                            onChange={(e) => {
                              const updatedName = e.target.value;
                              setSporpuanRules(prev => prev.map(r => r.id === rule.id ? { ...r, ruleName: updatedName } : r));
                            }}
                            className={`w-full bg-transparent border-b border-transparent font-bold outline-none pb-0.5 ${
                              isSuperAdmin ? 'hover:border-slate-300 focus:border-blue-500 text-slate-800' : 'text-slate-500 cursor-not-allowed'
                            }`}
                          />
                        </td>

                        {/* Point Value (SP) */}
                        <td className="py-3.5 px-4">
                          <div className={`flex items-center gap-1.5 border rounded-lg px-2 py-1 max-w-[100px] shadow-2xs ${
                            isSuperAdmin ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-100 cursor-not-allowed'
                          }`}>
                            <input
                              type="number"
                              min={0}
                              max={1000}
                              value={rule.points}
                              disabled={!isSuperAdmin}
                              onChange={(e) => handleUpdateRulePoints(rule.id, Number(e.target.value) || 0)}
                              className={`w-full bg-transparent text-center font-black outline-none text-xs ${
                                isSuperAdmin ? 'text-slate-800' : 'text-slate-400 cursor-not-allowed'
                              }`}
                            />
                            <span className={`text-[10px] font-bold ${isSuperAdmin ? 'text-amber-600' : 'text-amber-600/50'}`}>SP</span>
                          </div>
                        </td>

                        {/* Visible limit (text descriptor) */}
                        <td className="py-3.5 px-4">
                          <input
                            type="text"
                            value={rule.limit}
                            disabled={!isSuperAdmin}
                            onChange={(e) => handleUpdateRuleLimitText(rule.id, e.target.value)}
                            placeholder="Sınır girin..."
                            className={`w-full text-xs font-medium bg-transparent border-b border-transparent outline-none pb-0.5 ${
                              isSuperAdmin ? 'hover:border-slate-300 focus:border-blue-500 text-slate-700' : 'text-slate-400 cursor-not-allowed'
                            }`}
                          />
                        </td>

                        {/* Monthly limit (numerical) */}
                        <td className="py-3.5 px-4">
                          <div className={`flex items-center gap-1.5 border rounded-lg px-2 py-1 max-w-[80px] shadow-2xs ${
                            isSuperAdmin ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-100'
                          }`}>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={rule.monthlyLimit ?? ''}
                              placeholder="Sınırsız"
                              disabled={!isSuperAdmin}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                handleUpdateRuleMonthlyLimit(rule.id, val);
                              }}
                              className={`w-full bg-transparent text-center font-semibold outline-none text-xs ${
                                isSuperAdmin ? 'text-slate-700' : 'text-slate-400 cursor-not-allowed'
                              }`}
                            />
                          </div>
                        </td>

                        {/* Trigger trigger condition */}
                        <td className="py-3.5 px-4 text-slate-500">
                          <input
                            type="text"
                            value={rule.trigger}
                            disabled={!isSuperAdmin}
                            onChange={(e) => handleUpdateRuleTriggerText(rule.id, e.target.value)}
                            placeholder="Tetikleyici..."
                            className={`w-full text-xs bg-transparent border-b border-transparent outline-none pb-0.5 ${
                              isSuperAdmin ? 'hover:border-slate-300 focus:border-blue-500 text-slate-600 font-medium' : 'text-slate-400 cursor-not-allowed'
                            }`}
                          />
                        </td>

                        {/* Source Selection (Otomatik vs Koç Onayı) */}
                        <td className="py-3.5 px-4">
                          <select
                            value={rule.source}
                            disabled={!isSuperAdmin}
                            onChange={(e) => handleUpdateRuleSource(rule.id, e.target.value as any)}
                            className={`text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg py-1 px-1.5 outline-none ${
                              isSuperAdmin ? 'focus:ring-2 focus:ring-blue-500/20 text-slate-700' : 'text-slate-400 cursor-not-allowed opacity-80'
                            }`}
                          >
                            <option value="Koç Onayı">Koç Onayı</option>
                            <option value="Otomatik">Otomatik</option>
                          </select>
                        </td>

                        {/* Delete criterion action */}
                        <td className="py-3.5 px-4 text-right">
                          {rule.id.startsWith('r-') ? (
                            <button
                              type="button"
                              disabled={!isSuperAdmin}
                              onClick={() => handleDeleteCustomRule(rule.id)}
                              className={`p-1.5 transition-colors cursor-pointer ${
                                isSuperAdmin ? 'text-slate-400 hover:text-rose-600' : 'text-slate-200 cursor-not-allowed'
                              }`}
                              title={isSuperAdmin ? 'Kriteri matristen sil' : 'Süper Admin yetkisi gerekir'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-300 italic">Sistem</span>
                          )}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Informative Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-blue-800 leading-relaxed">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-1">💡 Değerli Yönetici:</strong>
              Merkezi puanlama matrisi üzerinde yaptığınız değişiklikler anlık olarak tarayıcınıza kaydedilir ve koçların kullandığı <strong>"Sporcu Değerlendirme &amp; Kazanım Girişi"</strong> ekranındaki tüm kurallarla senkronize çalışır. Örneğin, antrenman katılımını veya bir maç performans kriter puanını yükselttiğinizde yeni tanımlamalar otomatik olarak güncel puandan hesaplanır.
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Scoring Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleAddNewCustomRule}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Yeni Puan Kriteri Tanımla
              </h3>
              <button
                type="button"
                onClick={() => setShowAddRuleModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Başarı Kategorisi</label>
                <select
                  value={newRuleCategory}
                  onChange={(e) => setNewRuleCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="Devam">Devam &amp; Katılım</option>
                  <option value="Seri">Seri İstikrar</option>
                  <option value="Davranış">Davranış &amp; Karakter</option>
                  <option value="Gelişim">Gelişim Seviyesi</option>
                  <option value="Aile ve İlişki">Aile &amp; Kulüp İlişkisi</option>
                  <option value="Etkinlik">Etkinlik &amp; Turnuva</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kriter / Başarı Tanımı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Hafta içi antrenman katılımı, Maç MVP seçilme..."
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kazanılacak SP Puanı</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    required
                    value={newRulePoints}
                    onChange={(e) => setNewRulePoints(Number(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Aylık Sınır (Sayısal)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newRuleMonthlyLimit}
                    onChange={(e) => setNewRuleMonthlyLimit(Number(e.target.value) || 1)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Görünür Sınır Açıklaması</label>
                <input
                  type="text"
                  placeholder="Örn: Ayda 1, Sezonda 2, Her ders başına..."
                  value={newRuleLimit}
                  onChange={(e) => setNewRuleLimit(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kriter Tetikleyicisi</label>
                  <input
                    type="text"
                    placeholder="Örn: Koç takdiri, Yoklama..."
                    value={newRuleTrigger}
                    onChange={(e) => setNewRuleTrigger(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Puanlama Kaynağı</label>
                  <select
                    value={newRuleSource}
                    onChange={(e) => setNewRuleSource(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                  >
                    <option value="Koç Onayı">Koç Onayı (Manuel)</option>
                    <option value="Otomatik">Otomatik (Sistem)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddRuleModal(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Kriteri Matrise Ekle
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Batch Score Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Toplu Puan Girişi &amp; Şablon
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Seçilen antrenman grubundaki tüm sporculara tek tıkla periyodik baz puan atayın.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Hedef Grup</label>
                <select
                  value={batchGroup}
                  onChange={(e) => setBatchGroup(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  {groups.filter((g) => g !== 'Tümü').map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
                <select
                  value={batchCategory}
                  onChange={(e) => setBatchCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="teknik">Teknik Beceriler</option>
                  <option value="fiziksel">Fiziksel Yetkinlik</option>
                  <option value="zihinsel">Zihinsel &amp; Disiplin</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Atanacak Puan</span>
                  <span className="text-blue-600 font-black">{batchScore} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={batchScore}
                  onChange={(e) => setBatchScore(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Bu işlem gruptaki tüm sporcuların seçilen kategorideki kriterlerini güncelleyecektir.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleApplyBatchScore}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Toplu Uygula &amp; Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Templates Modal (Hızlı Şablonlar Kütüphanesi) */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-2xs">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Hızlı Değerlendirme Şablonları</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/30 text-amber-300 border border-amber-400/30">
                      Tek Tıkla Doldur
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {currentEdit ? (
                      <span>
                        Seçili Sporcu: <strong className="text-white">{currentEdit.adSoyad}</strong> ({currentEdit.pozisyon} - {currentEdit.kategori})
                      </span>
                    ) : (
                      'Puanlama ve metin bloklarını forma anında aktarın.'
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Bar */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 overflow-x-auto">
              {[
                { id: 'notlar', label: 'Antrenör Notları', count: HAZIR_ANTRENOR_NOTLARI.length, icon: FileText },
                { id: 'gozlemler', label: 'Dönem Gözlemleri', count: HAZIR_GOZLEM_SABLONLARI.length, icon: Target },
                { id: 'puanlar', label: 'Puanlama Profilleri', count: HAZIR_PUANLAMA_PROFILLERI.length, icon: SportsFlyIcon },
                { id: 'etiketler', label: 'Gelişim Alanları', count: HAZIR_GELISIM_ETIKETLERI.length, icon: CheckCircle2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = templateModalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTemplateModalTab(tab.id as any)}
                    className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? 'border-blue-600 text-blue-600 bg-white shadow-2xs'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body with scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* TAB 1: ANTRENÖR NOTLARI */}
              {templateModalTab === 'notlar' && (
                <div className="space-y-4">
                  {/* Category filters */}
                  <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                      <Filter className="w-3 h-3 text-slate-400" />
                      Filtrele:
                    </span>
                    {ANTRENOR_NOTU_KATEGORILERI.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTemplateCategoryFilter(cat)}
                        className={`text-xs px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          templateCategoryFilter === cat
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Template Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {HAZIR_ANTRENOR_NOTLARI.filter(
                      (t) => templateCategoryFilter === 'Tümü' || t.kategori === templateCategoryFilter
                    ).map((template) => (
                      <div
                        key={template.id}
                        className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 p-4 space-y-3 transition-all flex flex-col justify-between hover:shadow-sm"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200/60">
                              {template.kategori}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyTemplateText(template.id, template.metin)}
                              title="Metni Kopyala"
                              className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
                            >
                              {copiedTemplateId === template.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 leading-snug">{template.baslik}</h4>
                          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed font-normal italic">
                            "{template.metin}"
                          </p>

                          {/* Recommended development tags */}
                          {template.onerilenGelisimAlanlari && template.onerilenGelisimAlanlari.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 pt-1">
                              <span className="text-[10px] text-slate-400 font-semibold">Gelişim Alanları:</span>
                              {template.onerilenGelisimAlanlari.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200/60 rounded font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApplyCoachNoteTemplate(template, true)}
                            className="px-2.5 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            + Mevcut Nota Ekle
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyCoachNoteTemplate(template, false)}
                            className="px-3 py-1.5 text-white bg-blue-600 hover:bg-blue-500 rounded-lg text-[11px] font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Karne Notuna Aktar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: DÖNEM GÖZLEMLERİ */}
              {templateModalTab === 'gozlemler' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                    <div>
                      <strong>Periyot Gözlemi Şablonları:</strong> Şablonu seçip forma doldurabilir veya doğrudan seçili sporcunun süreç takibi listesine ekleyebilirsiniz.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {HAZIR_GOZLEM_SABLONLARI.map((template) => {
                      const statusColor =
                        template.durum === 'Örnek Davranış'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : template.durum === 'Hedefe Ulaştı'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200';

                      return (
                        <div
                          key={template.id}
                          className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 p-4 space-y-3 transition-all flex flex-col justify-between hover:shadow-sm"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {template.donem}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                                {template.durum}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900">{template.baslik}</h4>
                            <div className="text-[11px] font-semibold text-blue-700">
                              Odak: {template.odakKonusu}
                            </div>
                            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                              "{template.gozlem}"
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleApplyObservationTemplate(template, false)}
                              className="px-2.5 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Gözlem Formuna Doldur
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplyObservationTemplate(template, true)}
                              className="px-3 py-1.5 text-white bg-blue-600 hover:bg-blue-500 rounded-lg text-[11px] font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Doğrudan Listeye Ekle</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: PUANLAMA PROFİLLERİ */}
              {templateModalTab === 'puanlar' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                    <SportsFlyIcon className="w-4 h-4 shrink-0" />
                    <span>
                      <strong>Tam Puanlama Profilleri:</strong> Tek tıkla Teknik, Fiziksel, Taktiksel, Zihinsel ve Karne Notu alanlarını tutarlı bir değerlendirme şablonuyla günceller.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {HAZIR_PUANLAMA_PROFILLERI.map((profile) => (
                      <div
                        key={profile.id}
                        className="bg-white rounded-xl border border-slate-200 hover:border-amber-300 p-4 space-y-3 transition-all flex flex-col justify-between hover:shadow-sm"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">{profile.baslik}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/60">
                              {profile.etiket}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{profile.aciklama}</p>

                          {/* Quick score pills */}
                          <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                            <div>
                              <div className="text-[9px] text-slate-400 font-bold uppercase">Teknik</div>
                              <div className="text-xs font-black text-blue-600">{profile.teknik.ortalama}/10</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-400 font-bold uppercase">Fizik</div>
                              <div className="text-xs font-black text-emerald-600">{profile.fiziksel.ortalama}/10</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-400 font-bold uppercase">Taktik</div>
                              <div className="text-xs font-black text-indigo-600">{profile.taktiksel.ortalama}/10</div>
                            </div>
                            <div>
                              <div className="text-[9px] text-slate-400 font-bold uppercase">Zihin</div>
                              <div className="text-xs font-black text-purple-600">{profile.zihinsel.ortalama}/10</div>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500 bg-white p-2 rounded border border-slate-100 italic">
                            "{profile.antrenorNotu}"
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Katılım: %{profile.katilimYuzdesi}</span>
                          <button
                            type="button"
                            onClick={() => handleApplyScoringProfile(profile)}
                            className="px-3.5 py-1.5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-[11px] font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <SportsFlyIcon className="w-3.5 h-3.5 text-white" />
                            <span>Bu Profili Sporcuya Uygula</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: GELİŞİM ETİKETLERİ */}
              {templateModalTab === 'etiketler' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                    Sporcunun karnesinde yer alacak <strong>Öncelikli Gelişim Alanları</strong> etiketlerini aşağıdan tıklayarak ekleyin veya kaldırın.
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800">
                      Mevcut Seçili Gelişim Alanları ({currentEdit?.gelisimAlanlari?.length || 0}):
                    </h4>
                    <div className="flex flex-wrap gap-1.5 p-3 bg-blue-50/50 border border-blue-200 rounded-xl min-h-12 items-center">
                      {currentEdit?.gelisimAlanlari && currentEdit.gelisimAlanlari.length > 0 ? (
                        currentEdit.gelisimAlanlari.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleDevelopmentTag(tag)}
                              className="hover:text-red-200 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Henüz bir gelişim alanı seçilmedi. Aşağıdaki etiketlere tıklayarak ekleyebilirsiniz.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800">Önceden Tanımlanmış Yetkinlik &amp; Gelişim Etiketleri:</h4>
                    <div className="flex flex-wrap gap-2">
                      {HAZIR_GELISIM_ETIKETLERI.map((tag) => {
                        const isSelected = currentEdit?.gelisimAlanlari?.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleDevelopmentTag(tag)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                            }`}
                          >
                            <span className="text-xs">{isSelected ? '✓' : '+'}</span>
                            <span>{tag}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <SportsFlyIcon className="w-4 h-4" />
                <span>Şablon uygulandıktan sonra alt kısımdaki <strong>"Değerlendirmeyi Kaydet"</strong> butonuna basarak kalıcı hale getirin.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tamamla &amp; Kapat
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Hızlı Puan Ver (SporPuan) Modal */}
      <QuickPointAwardModal
        isOpen={!!quickPointTarget}
        onClose={() => setQuickPointTarget(null)}
        sporcu={quickPointTarget}
        onSuccess={(msg) => {
          showToast(msg);
          const updated = localStorage.getItem('sportsfly_sporpuan_logs_new');
          if (updated) {
            try {
              setSporpuanLogs(JSON.parse(updated));
            } catch (e) {
              console.error(e);
            }
          }
        }}
      />
    </div>
  );
};
