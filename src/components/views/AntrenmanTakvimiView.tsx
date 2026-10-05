import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  XCircle,
  X,
  FileSpreadsheet,
  Filter,
  Download,
  Printer,
  FileCheck2,
  Check,
  Search,
  RotateCcw,
  Building2,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';
import { SportsFlyIcon } from '../SportsFlyLogo';
import { INITIAL_ANTRENMANLAR } from '../../data/mockAntrenmanlar';
import { AntrenmanItem, AntrenmanAttendee } from '../../types';
import {
  downloadTrainingAttendancePdfReport,
  downloadTrainingAttendanceCsvReport,
} from '../../utils/trainingAttendanceReportGenerator';

type CalendarViewMode = 'ay' | 'hafta' | 'gun';

export const AntrenmanTakvimiView: React.FC = () => {
  // State
  const [antrenmanlar, setAntrenmanlar] = useState<AntrenmanItem[]>(INITIAL_ANTRENMANLAR);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('ay');

  // Currently focused date: 2026-09-11 (matching screenshot and environment local time)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0-indexed: 8 is September (Eylül)
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-11');

  // Granular Filter State
  const [branchFilter, setBranchFilter] = useState<string>('Tümü');
  const [trainerFilter, setTrainerFilter] = useState<string>('Tümü');
  const [groupFilter, setGroupFilter] = useState<string>('Tümü');
  const [subeFilter, setSubeFilter] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<AntrenmanItem | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formBranch, setFormBranch] = useState('Basketbol');
  const [formGroup, setFormGroup] = useState('U14 Basketbol Akademi');
  const [formSube, setFormSube] = useState('Kadıköy Merkez Şube');
  const [formDate, setFormDate] = useState('2026-09-11');
  const [formStartTime, setFormStartTime] = useState('14:00');
  const [formEndTime, setFormEndTime] = useState('15:30');
  const [formTrainer, setFormTrainer] = useState('Can Aksoy');
  const [formFacility, setFormFacility] = useState('Saraçgym Nilüfer - A Salonu');
  const [formCapacity, setFormCapacity] = useState(16);
  const [formColor, setFormColor] = useState<'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'sky'>('blue');
  const [formNotes, setFormNotes] = useState('');

  // New Attendee in modal
  const [newAttendeeName, setNewAttendeeName] = useState('');
  const [newAttendeePhone, setNewAttendeePhone] = useState('');

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const currentMonthName = monthNames[currentMonth];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Dynamic filter options extracted from dataset + standard options
  const trainerOptions = useMemo(() => {
    const list = Array.from(new Set(antrenmanlar.map((a) => a.trainerName).filter(Boolean)));
    const defaults = ['Can Aksoy', 'Deniz Erdem', 'Selin Kara', 'Mert Koçak', 'Tolga Arıkan', 'Emre Yılmaz'];
    return ['Tümü', ...Array.from(new Set([...defaults, ...list]))];
  }, [antrenmanlar]);

  const groupOptions = useMemo(() => {
    const list = Array.from(new Set(antrenmanlar.map((a) => a.groupName).filter(Boolean) as string[]));
    const defaults = [
      'U14 Basketbol Akademi',
      'Minikler Basketbol Okulu (8-10 Yaş)',
      'Basketbol U16 Lig Takımı',
      'Yetişkin Yüzme Grubu',
      'Gençler Yüzme Grubu',
      'Reformer Pilates Grubu',
      'CrossFit & Kuvvet Grubu',
      'Altyapı Futbol Grubu',
      'Yetişkin Tenis Turnuva Grubu',
      'Tenis Orta Seviye Grubu',
      'HIIT & Fonksiyonel Kardiyo',
    ];
    return ['Tümü', ...Array.from(new Set([...defaults, ...list]))];
  }, [antrenmanlar]);

  const subeOptions = useMemo(() => {
    const list = Array.from(new Set(antrenmanlar.map((a) => a.sube).filter(Boolean) as string[]));
    const defaults = [
      'Kadıköy Merkez Şube',
      'Özlüce Yüzme Şubesi',
      'Ataşehir Şubesi',
      'Beşiktaş Şubesi',
      'Nilüfer Şube / Saraçgym',
    ];
    return ['Tümü', ...Array.from(new Set([...defaults, ...list]))];
  }, [antrenmanlar]);

  const branchOptions = useMemo(() => [
    'Tümü',
    'Basketbol',
    'Yüzme',
    'Fitness',
    'Pilates',
    'Tenis',
    'Futbol',
    'Voleybol',
  ], []);

  // Filtered antrenmanlar logic
  const filteredAntrenmanlar = useMemo(() => {
    return antrenmanlar.filter((a) => {
      // 1. Branch filter
      if (branchFilter !== 'Tümü' && a.branch !== branchFilter) return false;
      // 2. Trainer filter
      if (trainerFilter !== 'Tümü' && a.trainerName !== trainerFilter) return false;
      // 3. Group filter
      if (groupFilter !== 'Tümü' && a.groupName !== groupFilter) return false;
      // 4. Sube filter
      if (subeFilter !== 'Tümü' && a.sube !== subeFilter && a.facilityName !== subeFilter) return false;
      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = a.title.toLowerCase().includes(q);
        const matchTrainer = a.trainerName.toLowerCase().includes(q);
        const matchGroup = (a.groupName || '').toLowerCase().includes(q);
        const matchSube = (a.sube || '').toLowerCase().includes(q);
        const matchFacility = a.facilityName.toLowerCase().includes(q);
        const matchBranch = a.branch.toLowerCase().includes(q);
        const matchNotes = (a.notes || '').toLowerCase().includes(q);
        if (!matchTitle && !matchTrainer && !matchGroup && !matchSube && !matchFacility && !matchBranch && !matchNotes) {
          return false;
        }
      }
      return true;
    });
  }, [antrenmanlar, branchFilter, trainerFilter, groupFilter, subeFilter, searchQuery]);

  const hasActiveFilters =
    branchFilter !== 'Tümü' ||
    trainerFilter !== 'Tümü' ||
    groupFilter !== 'Tümü' ||
    subeFilter !== 'Tümü' ||
    searchQuery.trim() !== '';

  const resetAllFilters = () => {
    setBranchFilter('Tümü');
    setTrainerFilter('Tümü');
    setGroupFilter('Tümü');
    setSubeFilter('Tümü');
    setSearchQuery('');
  };

  // Navigate Date
  const handlePrev = () => {
    if (viewMode === 'ay') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    } else if (viewMode === 'gun') {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 1);
      const iso = d.toISOString().split('T')[0];
      setSelectedDate(iso);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 7);
      const iso = d.toISOString().split('T')[0];
      setSelectedDate(iso);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    }
  };

  const handleNext = () => {
    if (viewMode === 'ay') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    } else if (viewMode === 'gun') {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 1);
      const iso = d.toISOString().split('T')[0];
      setSelectedDate(iso);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    } else {
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 7);
      const iso = d.toISOString().split('T')[0];
      setSelectedDate(iso);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8); // September
    setSelectedDate('2026-09-11');
  };

  // Add Antrenman
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newAntrenman: AntrenmanItem = {
      id: `ant-${Date.now()}`,
      title: formTitle,
      branch: formBranch,
      groupName: formGroup || undefined,
      sube: formSube || undefined,
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      trainerName: formTrainer,
      facilityName: formFacility,
      capacity: Number(formCapacity) || 15,
      enrolledCount: 1,
      status: 'Planlandı',
      color: formColor,
      notes: formNotes,
      attendees: [
        { id: `att-${Date.now()}`, name: 'Kayıtlı Sporcu (Örnek)', present: false },
      ],
    };

    setAntrenmanlar((prev) => [newAntrenman, ...prev]);
    setShowAddModal(false);
    triggerToast('Yeni antrenman seansı başarıyla takvime eklendi!');
    // Reset
    setFormTitle('');
    setFormNotes('');
  };

  // Open session modal with automatic fallback roster if empty
  const openSessionModal = (session: AntrenmanItem) => {
    if (!session.attendees || session.attendees.length === 0) {
      const defaultAthletes = [
        { id: `${session.id}-a1`, name: 'Burak Yılmaz', phone: '+90 535 221 4455', present: true },
        { id: `${session.id}-a2`, name: 'Cenk Tosun', phone: '+90 532 667 8899', present: true },
        { id: `${session.id}-a3`, name: 'Kerem Aktürkoğlu', phone: '+90 542 331 5566', present: true },
        { id: `${session.id}-a4`, name: 'Semih Kılıçsoy', phone: '+90 530 442 6677', present: true },
        { id: `${session.id}-a5`, name: 'Melis Aksoy', phone: '+90 546 560 9505', present: true },
        { id: `${session.id}-a6`, name: 'Arda Güler', phone: '+90 533 900 1122', present: true },
        { id: `${session.id}-a7`, name: 'Barış Alper Yılmaz', phone: '+90 532 998 7766', present: true },
        { id: `${session.id}-a8`, name: 'Ferdi Kadıoğlu', phone: '+90 533 888 1122', present: true },
        { id: `${session.id}-a9`, name: 'Kenan Yıldız', phone: '+90 531 222 3344', present: true },
        { id: `${session.id}-a10`, name: 'İsmail Yüksek', phone: '+90 534 555 6677', present: true },
        { id: `${session.id}-a11`, name: 'Hakan Çalhanoğlu', phone: '+90 535 666 7788', present: true },
        { id: `${session.id}-a12`, name: 'Salih Özcan', phone: '+90 536 777 8899', present: false },
        { id: `${session.id}-a13`, name: 'Kaan Ayhan', phone: '+90 537 888 9900', present: true },
        { id: `${session.id}-a14`, name: 'Abdülkerim Bardakcı', phone: '+90 538 999 0011', present: true },
        { id: `${session.id}-a15`, name: 'Mert Müldür', phone: '+90 539 000 1122', present: true },
        { id: `${session.id}-a16`, name: 'Zeki Çelik', phone: '+90 541 111 2233', present: true },
        { id: `${session.id}-a17`, name: 'Yunus Akgün', phone: '+90 542 222 3344', present: true },
        { id: `${session.id}-a18`, name: 'Can Uzun', phone: '+90 543 333 4455', present: false },
        { id: `${session.id}-a19`, name: 'Ahmetcan Kaplan', phone: '+90 544 444 5566', present: true },
        { id: `${session.id}-a20`, name: 'Uğurcan Çakır', phone: '+90 545 555 6677', present: true },
      ].slice(0, Math.min(session.enrolledCount || 12, 20));

      const updated = {
        ...session,
        attendees: defaultAthletes,
      };
      setSelectedSession(updated);
      setAntrenmanlar((prev) => prev.map((s) => (s.id === session.id ? updated : s)));
    } else {
      setSelectedSession(session);
    }
  };

  // Download PDF Report
  const handleDownloadPdf = async (session: AntrenmanItem) => {
    setIsGeneratingPdf(true);
    try {
      await downloadTrainingAttendancePdfReport({
        session,
        reportDate: selectedDate,
      });
      triggerToast('✓ Resmi Seans Yoklama Raporu (PDF) başarıyla indirildi!');
    } catch (err) {
      console.error('PDF Generation Error:', err);
      triggerToast('Rapor oluşturulurken bir hata oluştu.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Download CSV Report
  const handleDownloadCsv = (session: AntrenmanItem) => {
    try {
      downloadTrainingAttendanceCsvReport(session);
      triggerToast('✓ Yoklama Listesi (Excel / CSV) indirildi!');
    } catch (err) {
      console.error('CSV Generation Error:', err);
    }
  };

  // Toggle Attendance
  const handleToggleAttendance = (sessionId: string, attendeeId: string) => {
    setAntrenmanlar((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const updatedAttendees = session.attendees.map((att) =>
          att.id === attendeeId ? { ...att, present: !att.present } : att
        );
        return { ...session, attendees: updatedAttendees };
      })
    );

    if (selectedSession && selectedSession.id === sessionId) {
      setSelectedSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          attendees: prev.attendees.map((att) =>
            att.id === attendeeId ? { ...att, present: !att.present } : att
          ),
        };
      });
    }
  };

  // Add attendee to session
  const handleAddAttendee = (sessionId: string) => {
    if (!newAttendeeName.trim()) return;
    const newAtt: AntrenmanAttendee = {
      id: `att-${Date.now()}`,
      name: newAttendeeName,
      phone: newAttendeePhone || undefined,
      present: true,
    };

    setAntrenmanlar((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          enrolledCount: s.enrolledCount + 1,
          attendees: [...s.attendees, newAtt],
        };
      })
    );

    if (selectedSession && selectedSession.id === sessionId) {
      setSelectedSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          enrolledCount: prev.enrolledCount + 1,
          attendees: [...prev.attendees, newAtt],
        };
      });
    }

    setNewAttendeeName('');
    setNewAttendeePhone('');
    triggerToast('Sporcu yoklama listesine eklendi!');
  };

  // Delete session
  const handleDeleteSession = (sessionId: string) => {
    setAntrenmanlar((prev) => prev.filter((s) => s.id !== sessionId));
    setSelectedSession(null);
    triggerToast('Antrenman takvimden kaldırıldı.');
  };

  // Color helper for badges
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100/90';
      case 'sky':
        return 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100/90';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/90';
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100/90';
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/90';
      case 'rose':
        return 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100/90';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100/90';
    }
  };

  // -------------------------------------------------------------
  // Left Column: Mini Calendar Calculation (Monday-first: PZT - PZR)
  // -------------------------------------------------------------
  const renderMiniCalendarGrid = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    const firstDayMonIndex = (firstDay.getDay() + 6) % 7;
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

    const cells: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      hasEvents: boolean;
    }[] = [];

    // Fill previous month days
    for (let i = firstDayMonIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === '2026-09-11',
        isSelected: dateStr === selectedDate,
        hasEvents: filteredAntrenmanlar.some((a) => a.date === dateStr),
      });
    }

    // Fill current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === '2026-09-11',
        isSelected: dateStr === selectedDate,
        hasEvents: filteredAntrenmanlar.some((a) => a.date === dateStr),
      });
    }

    // Fill next month days up to 42 cells
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({
        dayNumber: i,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === '2026-09-11',
        isSelected: dateStr === selectedDate,
        hasEvents: filteredAntrenmanlar.some((a) => a.date === dateStr),
      });
    }

    return cells;
  };

  const miniCalendarCells = renderMiniCalendarGrid();

  // -------------------------------------------------------------
  // Right Column: Main Month Calculation (Sunday-first: Paz - Cmt)
  // -------------------------------------------------------------
  const renderMainMonthGrid = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startSunIndex = firstDay.getDay();
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

    const cells: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    // Preceding days
    for (let i = startSunIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      cells.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === '2026-09-11',
        isSelected: dateStr === selectedDate,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === '2026-09-11',
        isSelected: dateStr === selectedDate,
      });
    }

    // Fill to 35 or 42 cells
    const targetLength = cells.length > 35 ? 42 : 35;
    const remaining = targetLength - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({
        dayNumber: i,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === '2026-09-11',
        isSelected: dateStr === selectedDate,
      });
    }

    return cells;
  };

  const mainMonthCells = renderMainMonthGrid();

  // Filtered sessions on the selected day
  const selectedDaySessions = useMemo(() => {
    return filteredAntrenmanlar.filter((a) => a.date === selectedDate);
  }, [filteredAntrenmanlar, selectedDate]);

  // Week View Days
  const getWeekDays = () => {
    const selected = new Date(selectedDate);
    const dayOfWeek = selected.getDay(); // 0 is Sunday
    const diff = (dayOfWeek + 6) % 7;
    const monday = new Date(selected);
    monday.setDate(selected.getDate() - diff);

    const week: { dateStr: string; dayName: string; dayNum: number }[] = [];
    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    for (let i = 0; i < 7; i++) {
      const curr = new Date(monday);
      curr.setDate(monday.getDate() + i);
      week.push({
        dateStr: curr.toISOString().split('T')[0],
        dayName: dayNames[i],
        dayNum: curr.getDate(),
      });
    }
    return week;
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <SportsFlyIcon className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & View Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Antrenman Takvimi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Eğitmen, grup ve şube bazlı filtreleme ile sadeleştirilmiş takvim ve seans yönetimi
          </p>
        </div>

        {/* Controls: Month Dropdown + View Pills + Today Nav + Antrenman Ekle Button */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Month Selector Dropdown */}
          <div className="relative">
            <select
              value={`${currentYear}-${currentMonth}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-').map(Number);
                setCurrentYear(y);
                setCurrentMonth(m);
              }}
              className="appearance-none bg-white border border-slate-200/90 hover:border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl pl-3.5 pr-8 py-2 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="2026-7">Ağustos 2026</option>
              <option value="2026-8">Eylül 2026</option>
              <option value="2026-9">Ekim 2026</option>
              <option value="2026-10">Kasım 2026</option>
            </select>
            <ChevronRight className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
          </div>

          {/* View Selector Pills: Ay, Hafta, Gün */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
            <button
              onClick={() => setViewMode('ay')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'ay'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Ay
            </button>
            <button
              onClick={() => setViewMode('hafta')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'hafta'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Hafta
            </button>
            <button
              onClick={() => setViewMode('gun')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'gun'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Gün
            </button>
          </div>

          {/* Navigation Controls: Bugün, <, Month Text, > */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handleToday}
              className="px-3.5 py-1.5 bg-blue-100/70 hover:bg-blue-200/80 text-blue-700 rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-2xs"
            >
              Bugün
            </button>

            <button
              onClick={handlePrev}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Önceki"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <span className="text-xs sm:text-sm font-bold text-slate-800 px-1 min-w-[85px] text-center">
              {currentMonthName} {currentYear}
            </span>

            <button
              onClick={handleNext}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Sonraki"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Antrenman Ekle Action Button */}
          <button
            onClick={() => {
              setFormDate(selectedDate);
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Antrenman Ekle</span>
          </button>
        </div>
      </div>

      {/* STREAMLINED FILTER BAR (Şube, Eğitmen, Grup & Branş Filtreleme) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Filter dropdowns grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 flex-1">
            {/* 1. ŞUBE FİLTRESİ */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-600" />
                Şube / Tesis
              </label>
              <select
                value={subeFilter}
                onChange={(e) => setSubeFilter(e.target.value)}
                className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  subeFilter !== 'Tümü'
                    ? 'bg-blue-50/70 border-blue-300 text-blue-900'
                    : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-800'
                }`}
              >
                {subeOptions.map((sube) => (
                  <option key={sube} value={sube}>
                    {sube === 'Tümü' ? 'Tüm Şubeler' : sube}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. EĞİTMEN FİLTRESİ */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-indigo-600" />
                Eğitmen / Antrenör
              </label>
              <select
                value={trainerFilter}
                onChange={(e) => setTrainerFilter(e.target.value)}
                className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  trainerFilter !== 'Tümü'
                    ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900'
                    : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-800'
                }`}
              >
                {trainerOptions.map((tr) => (
                  <option key={tr} value={tr}>
                    {tr === 'Tümü' ? 'Tüm Eğitmenler' : tr}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. GRUP / KATEGORİ FİLTRESİ */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                <Users className="w-3 h-3 text-purple-600" />
                Grup / Takım
              </label>
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  groupFilter !== 'Tümü'
                    ? 'bg-purple-50/70 border-purple-300 text-purple-900'
                    : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-800'
                }`}
              >
                {groupOptions.map((grp) => (
                  <option key={grp} value={grp}>
                    {grp === 'Tümü' ? 'Tüm Gruplar' : grp}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. BRANŞ FİLTRESİ */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-600" />
                Branş
              </label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  branchFilter !== 'Tümü'
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                    : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-800'
                }`}
              >
                {branchOptions.map((br) => (
                  <option key={br} value={br}>
                    {br === 'Tümü' ? 'Tüm Branşlar' : br}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Search Box */}
          <div className="lg:w-72">
            <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1">
              <Search className="w-3 h-3 text-slate-400" />
              Hızlı Seans Arama
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Başlık, eğitmen, grup ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-2 text-xs font-medium bg-slate-50 hover:bg-slate-100/60 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-1.5 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Pills and Counter Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 font-medium text-[11px] flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3 h-3 text-slate-400" />
              Aktif Filtreler:
            </span>

            {subeFilter !== 'Tümü' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                <span>Şube: {subeFilter}</span>
                <button onClick={() => setSubeFilter('Tümü')} className="hover:text-blue-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {trainerFilter !== 'Tümü' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                <span>Eğitmen: {trainerFilter}</span>
                <button onClick={() => setTrainerFilter('Tümü')} className="hover:text-indigo-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {groupFilter !== 'Tümü' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                <span>Grup: {groupFilter}</span>
                <button onClick={() => setGroupFilter('Tümü')} className="hover:text-purple-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {branchFilter !== 'Tümü' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span>Branş: {branchFilter}</span>
                <button onClick={() => setBranchFilter('Tümü')} className="hover:text-emerald-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <span>Arama: &quot;{searchQuery}&quot;</span>
                <button onClick={() => setSearchQuery('')} className="hover:text-amber-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {!hasActiveFilters && (
              <span className="text-[11px] text-slate-400 italic">
                Tüm şube, eğitmen ve gruplar gösteriliyor
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              Toplam <strong>{antrenmanlar.length}</strong> seanstan <strong>{filteredAntrenmanlar.length}</strong> tanesi listeleniyor
            </span>

            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Filtreleri Sıfırla
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout Grid: Left Mini Calendar (1/4) + Right Main Calendar (3/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Mini Calendar Card & Selected Day List */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Mini Calendar Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Weekdays Header: PZT, SAL, ÇAR, PER, CUM, CMR, PZR */}
            <div className="grid grid-cols-7 text-center border-b border-slate-100 pb-2.5">
              {['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMR', 'PZR'].map((day) => (
                <span
                  key={day}
                  className="text-[11px] font-extrabold text-slate-800 tracking-wider underline decoration-slate-300 decoration-1 underline-offset-4"
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Numbers Grid */}
            <div className="grid grid-cols-7 gap-y-2 text-center text-xs">
              {miniCalendarCells.map((cell, idx) => {
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(cell.dateStr);
                      const [y, m] = cell.dateStr.split('-').map(Number);
                      setCurrentYear(y);
                      setCurrentMonth(m - 1);
                    }}
                    className={`h-8 w-8 mx-auto flex flex-col items-center justify-center rounded-lg font-medium transition-all relative ${
                      cell.isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : cell.isToday
                        ? 'bg-blue-100 text-blue-700 font-bold border border-blue-300'
                        : cell.isCurrentMonth
                        ? 'text-slate-800 hover:bg-slate-100'
                        : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cell.dayNumber}</span>
                    {cell.hasEvents && !cell.isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute bottom-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mini Calendar Footer */}
            <div className="pt-2 text-center border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                {currentMonthName}, {currentYear}
              </span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {filteredAntrenmanlar.length} Seans Aktif
              </span>
            </div>
          </div>

          {/* Selected Day Overview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {selectedDate === '2026-09-11' ? 'Bugünün Seansları' : `${selectedDate} Seansları`}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {selectedDaySessions.length} Seans
              </span>
            </div>

            {selectedDaySessions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                {hasActiveFilters
                  ? 'Seçili filtrelerde bu tarihte antrenman yok.'
                  : 'Bu tarihte planlanmış antrenman bulunmuyor.'}
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {selectedDaySessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => openSessionModal(session)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${getColorClasses(
                      session.color
                    )}`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.startTime} - {session.endTime}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/90 font-bold border border-current">
                        {session.branch}
                      </span>
                    </div>

                    <p className="font-bold text-xs mt-1 text-slate-900 line-clamp-1">
                      {session.title}
                    </p>

                    {session.groupName && (
                      <p className="text-[10px] font-semibold text-purple-800 mt-0.5 flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" />
                        {session.groupName}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-600 mt-1 pt-1 border-t border-black/5">
                      <span className="flex items-center gap-1 truncate font-medium">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        {session.trainerName}
                      </span>
                      <span className="font-bold shrink-0">
                        {session.enrolledCount}/{session.capacity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Main Calendar Area */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* MONTH VIEW (AY) */}
          {viewMode === 'ay' && (
            <div className="overflow-x-auto">
              <div className="min-w-[640px] lg:min-w-0">
                {/* Header: Paz, Pzt, Sal, Çar, Per, Cum, Cmt */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70">
                  {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map((d) => (
                    <div
                      key={d}
                      className="py-3 text-center text-xs sm:text-sm font-bold text-slate-800"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day Grid */}
                <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
                  {mainMonthCells.map((cell, idx) => {
                    const dayEvents = filteredAntrenmanlar.filter(
                      (a) => a.date === cell.dateStr
                    );

                    const isTodayCell = cell.dateStr === '2026-09-11';
                    const isSelectedCell = cell.dateStr === selectedDate;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedDate(cell.dateStr)}
                        className={`min-h-[110px] sm:min-h-[130px] p-1.5 sm:p-2 flex flex-col transition-colors cursor-pointer group ${
                          isTodayCell
                            ? 'bg-blue-100/50 hover:bg-blue-100/80'
                            : isSelectedCell
                            ? 'bg-blue-50/40 hover:bg-blue-50/70'
                            : cell.isCurrentMonth
                            ? 'bg-white hover:bg-slate-50/80'
                            : 'bg-slate-50/40 text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {/* Top bar in cell: date number + add hover icon */}
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              isTodayCell
                                ? 'text-blue-900 font-black'
                                : cell.isCurrentMonth
                                ? 'text-slate-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {cell.dayNumber}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormDate(cell.dateStr);
                              setShowAddModal(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded-md text-slate-500 hover:text-blue-600 transition-opacity"
                            title="Bu güne antrenman ekle"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Training Badges inside day cell (Simplified & Streamlined) */}
                        <div className="flex-1 space-y-1 overflow-y-auto max-h-[90px] pr-0.5">
                          {dayEvents.slice(0, 2).map((session) => (
                            <div
                              key={session.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                openSessionModal(session);
                              }}
                              className={`px-1.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold border truncate transition-shadow hover:shadow-2xs ${getColorClasses(
                                session.color
                              )}`}
                              title={`${session.startTime} - ${session.title} (${session.trainerName}${session.groupName ? ` • ${session.groupName}` : ''})`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-slate-900 shrink-0">
                                  {session.startTime}
                                </span>
                                <span className="truncate text-left flex-1 font-medium">
                                  {session.title}
                                </span>
                              </div>
                              {session.trainerName && (
                                <div className="text-[9px] text-slate-600 font-normal truncate mt-0.5 flex items-center gap-1">
                                  <User className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                  <span>{session.trainerName}</span>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Overflow badge if > 2 events */}
                          {dayEvents.length > 2 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(cell.dateStr);
                                setViewMode('gun');
                              }}
                              className="w-full text-center py-0.5 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md transition-colors"
                            >
                              +{dayEvents.length - 2} seans daha
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* WEEK VIEW (HAFTA) */}
          {viewMode === 'hafta' && (
            <div className="overflow-x-auto">
              <div className="min-w-[700px] lg:min-w-0">
                {/* Header Days of Selected Week */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/60 divide-x divide-slate-100">
                  {weekDays.map((d) => (
                    <div
                      key={d.dateStr}
                      onClick={() => setSelectedDate(d.dateStr)}
                      className={`py-3 text-center cursor-pointer transition-colors ${
                        d.dateStr === '2026-09-11'
                          ? 'bg-blue-100/70 text-blue-900'
                          : d.dateStr === selectedDate
                          ? 'bg-blue-50 text-blue-800'
                          : 'text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-500">{d.dayName}</p>
                      <p className="text-base font-extrabold">{d.dayNum}</p>
                    </div>
                  ))}
                </div>

                {/* Week Schedule Columns */}
                <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[500px]">
                  {weekDays.map((d) => {
                    const dayEvents = filteredAntrenmanlar.filter(
                      (a) => a.date === d.dateStr
                    );
                    return (
                      <div
                        key={d.dateStr}
                        className="p-2 space-y-2 bg-white hover:bg-slate-50/40 transition-colors"
                      >
                        {dayEvents.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-2 text-[11px] text-slate-400">
                            <span>Seans yok</span>
                          </div>
                        ) : (
                          dayEvents.map((session) => (
                            <div
                              key={session.id}
                              onClick={() => openSessionModal(session)}
                              className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer shadow-2xs hover:scale-[1.01] transition-transform ${getColorClasses(
                                session.color
                              )}`}
                            >
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span>{session.startTime}</span>
                                <span className="text-[9px] px-1 py-0.5 rounded-sm bg-white/90 border">
                                  {session.branch}
                                </span>
                              </div>
                              <p className="font-bold text-slate-900 mt-1 line-clamp-2">
                                {session.title}
                              </p>
                              {session.groupName && (
                                <p className="text-[10px] text-purple-800 font-semibold mt-1 truncate">
                                  {session.groupName}
                                </p>
                              )}
                              <p className="text-[10px] text-slate-600 mt-1 flex items-center gap-1">
                                <User className="w-2.5 h-2.5 text-slate-400" />
                                {session.trainerName}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* DAY VIEW (GÜN) */}
          {viewMode === 'gun' && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedDate} Günlük Antrenman Programı
                  </h3>
                  <p className="text-xs text-slate-500">
                    Eğitmenler, gruplar ve şubeler için detaylı seans akışı
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFormDate(selectedDate);
                    setShowAddModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  Bu Güne Ekle
                </button>
              </div>

              {selectedDaySessions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CalendarIcon className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold">Bu tarihe ait uygun antrenman kaydı yok.</p>
                  {hasActiveFilters && (
                    <button
                      onClick={resetAllFilters}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      Filtreleri sıfırlayarak tüm seansları görün
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDaySessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => openSessionModal(session)}
                      className="p-4 rounded-2xl border border-slate-200/90 hover:border-blue-300 transition-all bg-white hover:shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-sm border border-blue-200/70 text-center shrink-0">
                          <div>{session.startTime}</div>
                          <div className="text-[10px] font-medium text-slate-500">
                            {session.endTime}
                          </div>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                              {session.branch}
                            </span>
                            {session.groupName && (
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                                {session.groupName}
                              </span>
                            )}
                            {session.sube && (
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
                                {session.sube}
                              </span>
                            )}
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {session.status}
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-base mt-1.5">
                            {session.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                            <span className="flex items-center gap-1 font-medium">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {session.trainerName}
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {session.facilityName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-medium">Kayıtlı / Kontenjan</p>
                          <p className="text-sm font-bold text-slate-900">
                            {session.enrolledCount} / {session.capacity} Sporcu
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openSessionModal(session);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs transition-colors"
                        >
                          Yoklama &amp; Detay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Yeni Antrenman Ekle */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Yeni Antrenman Planla
                  </h3>
                  <p className="text-xs text-slate-500">
                    Eğitmen, grup ve şube tanımlayarak yeni antrenman seansı ekleyin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Antrenman Adı / Başlık *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: U14 Basketbol Taktik & Şut Antrenmanı"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                />
              </div>

              {/* Branş & Grup */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Branş
                  </label>
                  <select
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Basketbol">Basketbol</option>
                    <option value="Yüzme">Yüzme</option>
                    <option value="Fitness">Fitness &amp; Kondisyon</option>
                    <option value="Pilates">Pilates &amp; Reformer</option>
                    <option value="Tenis">Tenis</option>
                    <option value="Futbol">Futbol</option>
                    <option value="Voleybol">Voleybol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Grup / Takım
                  </label>
                  <select
                    value={formGroup}
                    onChange={(e) => setFormGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="U14 Basketbol Akademi">U14 Basketbol Akademi</option>
                    <option value="Minikler Basketbol Okulu (8-10 Yaş)">Minikler Basketbol Okulu (8-10 Yaş)</option>
                    <option value="Basketbol U16 Lig Takımı">Basketbol U16 Lig Takımı</option>
                    <option value="Yetişkin Yüzme Grubu">Yetişkin Yüzme Grubu</option>
                    <option value="Gençler Yüzme Grubu">Gençler Yüzme Grubu</option>
                    <option value="Reformer Pilates Grubu">Reformer Pilates Grubu</option>
                    <option value="CrossFit & Kuvvet Grubu">CrossFit &amp; Kuvvet Grubu</option>
                    <option value="Altyapı Futbol Grubu">Altyapı Futbol Grubu</option>
                    <option value="Yetişkin Tenis Turnuva Grubu">Yetişkin Tenis Turnuva Grubu</option>
                    <option value="Tenis Orta Seviye Grubu">Tenis Orta Seviye Grubu</option>
                    <option value="Genel Gelişim Grubu">Genel Gelişim Grubu</option>
                  </select>
                </div>
              </div>

              {/* Şube & Eğitmen */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Şube
                  </label>
                  <select
                    value={formSube}
                    onChange={(e) => setFormSube(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Kadıköy Merkez Şube">Kadıköy Merkez Şube</option>
                    <option value="Özlüce Yüzme Şubesi">Özlüce Yüzme Şubesi</option>
                    <option value="Ataşehir Şubesi">Ataşehir Şubesi</option>
                    <option value="Beşiktaş Şubesi">Beşiktaş Şubesi</option>
                    <option value="Nilüfer Şube / Saraçgym">Nilüfer Şube / Saraçgym</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Eğitmen / Antrenör
                  </label>
                  <select
                    value={formTrainer}
                    onChange={(e) => setFormTrainer(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Can Aksoy">Can Aksoy</option>
                    <option value="Deniz Erdem">Deniz Erdem</option>
                    <option value="Selin Kara">Selin Kara</option>
                    <option value="Mert Koçak">Mert Koçak</option>
                    <option value="Tolga Arıkan">Tolga Arıkan</option>
                    <option value="Emre Yılmaz">Emre Yılmaz</option>
                  </select>
                </div>
              </div>

              {/* Tarih & Saatler */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tarih
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Başlangıç
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bitiş
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Tesis & Kontenjan */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tesis / Salon Alanı
                  </label>
                  <input
                    type="text"
                    value={formFacility}
                    onChange={(e) => setFormFacility(e.target.value)}
                    placeholder="Saraçgym Nilüfer - A Salonu"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kontenjan
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Antrenman Hedefleri &amp; Notlar
                </label>
                <textarea
                  rows={2}
                  placeholder="Antrenman içeriği, getirilecek ekipmanlar vb."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 resize-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                >
                  Antrenmanı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Antrenman Detay & Yoklama Listesi */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedSession.branch}
                  </span>
                  {selectedSession.groupName && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {selectedSession.groupName}
                    </span>
                  )}
                  {selectedSession.sube && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {selectedSession.sube}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-500">
                    {selectedSession.date} • {selectedSession.startTime} - {selectedSession.endTime}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg mt-1.5">
                  {selectedSession.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Eğitmen</span>
                <strong className="text-slate-800 font-bold truncate block">{selectedSession.trainerName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Grup / Takım</span>
                <strong className="text-slate-800 font-bold truncate block">{selectedSession.groupName || 'Genel Seans'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Tesis &amp; Şube</span>
                <strong className="text-slate-800 font-bold truncate block">{selectedSession.facilityName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Katılım</span>
                <strong className="text-slate-800 font-bold">
                  {selectedSession.enrolledCount} / {selectedSession.capacity} Sporcu
                </strong>
              </div>
            </div>

            {selectedSession.notes && (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-900">
                <span className="font-bold block mb-0.5">Antrenman Notu:</span>
                {selectedSession.notes}
              </div>
            )}

            {/* Yoklama / Sporcu Listesi */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  Yoklama &amp; Katılımcı Listesi
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Katılan: {selectedSession.attendees.filter((a) => a.present).length} / {selectedSession.attendees.length}
                </span>
              </div>

              {/* Attendee rows */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {selectedSession.attendees.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">
                    Henüz kayıtlı sporcu yok. Aşağıdan yeni sporcu ekleyebilirsiniz.
                  </p>
                ) : (
                  selectedSession.attendees.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                          {att.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{att.name}</p>
                          {att.phone && (
                            <p className="text-[10px] text-slate-400">{att.phone}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleAttendance(selectedSession.id, att.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors ${
                          att.present
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {att.present ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Katıldı
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            Yok
                          </>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add athlete to this session */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Sporcu Ad Soyad ekle..."
                  value={newAttendeeName}
                  onChange={(e) => setNewAttendeeName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-medium"
                />
                <button
                  type="button"
                  onClick={() => handleAddAttendee(selectedSession.id)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Ekle
                </button>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDeleteSession(selectedSession.id)}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Antrenmanı İptal Et
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                  Yoklama Raporu Al
                </button>

                <button
                  type="button"
                  disabled={isGeneratingPdf}
                  onClick={() => handleDownloadPdf(selectedSession)}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  title="Doğrudan PDF indir"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF İndir
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Tamam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Yoklama Raporu Önizleme, PDF ve Baskı Modalı */}
      {showReportModal && selectedSession && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Resmi Yoklama &amp; Katılım Raporu
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedSession.title} • {selectedSession.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-slate-600 hover:bg-slate-200/70 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Yazdır / Baskı Al"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Yazdır</span>
                </button>

                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Canvas Area */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
              {/* Report Document Header */}
              <div className="border border-slate-200 rounded-xl p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                      Resmi Seans Raporu
                    </span>
                    <h2 className="text-lg font-black mt-1">SPORTSFLY SPOR KULÜBÜ &amp; AKADEMİ</h2>
                    <p className="text-blue-200 text-xs mt-0.5">
                      {selectedSession.sube || 'Kadıköy Merkez Tesisleri'} • 2025 - 2026 Sezonu
                    </p>
                  </div>
                  <div className="text-left sm:text-right text-xs space-y-0.5">
                    <p className="font-bold text-white">Tarih: {selectedSession.date}</p>
                    <p className="text-blue-200">Saat: {selectedSession.startTime} - {selectedSession.endTime}</p>
                    <p className="text-blue-300 text-[11px]">Durum: {selectedSession.status}</p>
                  </div>
                </div>
              </div>

              {/* Session Meta Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Branş / Grup</span>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                    {selectedSession.branch} {selectedSession.groupName ? `• ${selectedSession.groupName}` : ''}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Sorumlu Eğitmen</span>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5">{selectedSession.trainerName}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Tesis &amp; Şube</span>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5 truncate">{selectedSession.facilityName}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Kapasite / Kayıt</span>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5">{selectedSession.enrolledCount} / {selectedSession.capacity}</p>
                </div>
              </div>

              {/* Quick Summary Highlights */}
              {(() => {
                const total = selectedSession.attendees.length;
                const present = selectedSession.attendees.filter((a) => a.present).length;
                const absent = total - present;
                const rate = total > 0 ? Math.round((present / total) * 100) : 100;
                return (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-950">
                      <div className="text-emerald-700 font-bold text-[10px] uppercase">Katılan Sporcu (VAR)</div>
                      <div className="text-xl font-black text-emerald-800 mt-0.5">{present} Kişi</div>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-950">
                      <div className="text-rose-700 font-bold text-[10px] uppercase">Devamsız Sporcu (YOK)</div>
                      <div className="text-xl font-black text-rose-800 mt-0.5">{absent} Kişi</div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-950">
                      <div className="text-blue-700 font-bold text-[10px] uppercase">Katılım Başarı Oranı</div>
                      <div className="text-xl font-black text-blue-800 mt-0.5">%{rate}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Attendee Roster Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Sporcu Adı Soyadı</th>
                      <th className="py-2.5 px-3">İletişim / Tel</th>
                      <th className="py-2.5 px-3 text-center">Durum</th>
                      <th className="py-2.5 px-3 text-right">Eğitmen Parafı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedSession.attendees.map((att, index) => (
                      <tr key={att.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                        <td className="py-2 px-3 text-center font-bold text-slate-400">{index + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{att.name}</td>
                        <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{att.phone || '+90 53X XXX XX XX'}</td>
                        <td className="py-2 px-3 text-center">
                          {att.present ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-700" />
                              Katıldı
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <X className="w-3 h-3 text-rose-700" />
                              Gelmedi
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="inline-block w-16 border-b border-dashed border-slate-300 h-3"></span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures Area */}
              <div className="pt-4 grid grid-cols-2 gap-8 border-t border-slate-200">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Sorumlu Antrenör / Eğitmen</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">{selectedSession.trainerName}</p>
                  <div className="mt-6 border-b border-slate-300 w-32"></div>
                  <span className="text-[10px] text-slate-400 block mt-1">İmza &amp; Tarih</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Kulüp &amp; Tesis Koordinatörü</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">SportsFly Yetkili Onayı</p>
                  <div className="mt-6 border-b border-slate-300 w-32"></div>
                  <span className="text-[10px] text-slate-400 block mt-1">İmza &amp; Mühür</span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isGeneratingPdf}
                  onClick={() => handleDownloadPdf(selectedSession)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  {isGeneratingPdf ? 'PDF Hazırlanıyor...' : 'PDF Raporu İndir'}
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadCsv(selectedSession)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Excel / CSV İndir
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
