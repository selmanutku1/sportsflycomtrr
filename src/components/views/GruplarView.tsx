import React, { useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Users,
  UserPlus,
  Trash2,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Filter,
  Download,
  Send,
  Share2,
  ChevronRight,
  ChevronDown,
  Check,
  AlertCircle,
  Phone,
  Mail,
  Award,
  Activity,
  FileSpreadsheet,
  Layers,
  LayoutGrid,
  List,
  ClipboardCheck,
  Building2,
  UserCheck,
} from 'lucide-react';
import { SportsFlyIcon } from '../SportsFlyLogo';
import { INITIAL_GRUPLAR } from '../../data/mockMuhasebeData';
import { INITIAL_SPORCULAR } from '../../data/mockData';
import { GrupItem, GrupMember, NavPage } from '../../types';

interface GruplarViewProps {
  onNavigate?: (page: NavPage) => void;
}

export const GruplarView: React.FC<GruplarViewProps> = ({ onNavigate }) => {
  const [gruplar, setGruplar] = useState<GrupItem[]>(INITIAL_GRUPLAR);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Modals
  const [detailModalGroup, setDetailModalGroup] = useState<GrupItem | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<'members' | 'schedule' | 'info'>('members');
  const [editingGroup, setEditingGroup] = useState<GrupItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTargetGroupId, setBroadcastTargetGroupId] = useState<string>('all');
  const [broadcastChannel, setBroadcastChannel] = useState<'sms' | 'email' | 'app'>('sms');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Group Form States
  const [newName, setNewName] = useState('');
  const [newInstructor, setNewInstructor] = useState('Selman Utku');
  const [newFacility, setNewFacility] = useState('SportsFly Ana Tesis');
  const [newBranch, setNewBranch] = useState('Basketbol');
  const [newCategory, setNewCategory] = useState('Altyapı Takımı');
  const [newAgeGroup, setNewAgeGroup] = useState('U14 (2010-2011)');
  const [newMaxCapacity, setNewMaxCapacity] = useState(15);
  const [newMonthlyFee, setNewMonthlyFee] = useState(3500);
  const [newScheduleDays, setNewScheduleDays] = useState<string[]>(['Pazartesi', 'Çarşamba', 'Cuma']);
  const [newScheduleTime, setNewScheduleTime] = useState('17:30 - 19:00');
  const [newScheduleLocation, setNewScheduleLocation] = useState('A Sahası');
  const [newDescription, setNewDescription] = useState('');

  // Edit Group Form States
  const [editName, setEditName] = useState('');
  const [editInstructor, setEditInstructor] = useState('');
  const [editFacility, setEditFacility] = useState('');
  const [editBranch, setEditBranch] = useState('Basketbol');
  const [editCategory, setEditCategory] = useState('Altyapı Takımı');
  const [editAgeGroup, setEditAgeGroup] = useState('');
  const [editMaxCapacity, setEditMaxCapacity] = useState(15);
  const [editMonthlyFee, setEditMonthlyFee] = useState(3000);
  const [editScheduleDays, setEditScheduleDays] = useState<string[]>([]);
  const [editScheduleTime, setEditScheduleTime] = useState('');
  const [editScheduleLocation, setEditScheduleLocation] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Add Member to Group Form (inside detail modal or edit modal)
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberParentName, setNewMemberParentName] = useState('');
  const [newMemberBirthYear, setNewMemberBirthYear] = useState<number>(2012);
  const [clubAthleteSearch, setClubAthleteSearch] = useState('');

  const weekDayOptions = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const branchOptions = ['Basketbol', 'Futbol', 'Yüzme', 'Tenis', 'Voleybol', 'Jimnastik'];
  const categoryOptions = ['Altyapı Takımı', 'Yarışmacı Takım', 'Spor Okulu', 'Gelişim Grubu', 'Hobi Grubu'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenEdit = (group: GrupItem) => {
    setEditingGroup(group);
    setEditName(group.name);
    setEditInstructor(group.instructorName);
    setEditFacility(group.facility);
    setEditBranch(group.branch || 'Basketbol');
    setEditCategory(group.category || 'Altyapı Takımı');
    setEditAgeGroup(group.ageGroup || '');
    setEditMaxCapacity(group.maxCapacity || 15);
    setEditMonthlyFee(group.monthlyFee || 3000);
    setEditScheduleDays(group.schedule?.days || ['Pazartesi', 'Çarşamba']);
    setEditScheduleTime(group.schedule?.time || '17:30 - 19:00');
    setEditScheduleLocation(group.schedule?.location || 'Ana Salon');
    setEditDescription(group.description || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;

    const updatedGroup: GrupItem = {
      ...editingGroup,
      name: editName,
      instructorName: editInstructor,
      facility: editFacility,
      branch: editBranch,
      category: editCategory,
      ageGroup: editAgeGroup,
      maxCapacity: Number(editMaxCapacity),
      monthlyFee: Number(editMonthlyFee),
      schedule: {
        days: editScheduleDays,
        time: editScheduleTime,
        location: editScheduleLocation,
      },
      description: editDescription,
    };

    setGruplar((prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));

    if (detailModalGroup?.id === updatedGroup.id) {
      setDetailModalGroup(updatedGroup);
    }

    showToast(`"${editName}" grubu başarıyla güncellendi.`);
    setEditingGroup(null);
  };

  const handleOpenDetailModal = (group: GrupItem, tab: 'members' | 'schedule' | 'info' = 'members') => {
    setDetailModalGroup(group);
    setDetailActiveTab(tab);
  };

  const handleAddMemberToGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const targetGroup = detailModalGroup || editingGroup;
    if (!targetGroup || !newMemberName.trim()) return;

    const newMem: GrupMember = {
      id: `m-${Date.now()}`,
      name: newMemberName.trim(),
      phone: newMemberPhone.trim() || '+90 5XX XXX XX XX',
      code: Math.floor(100000 + Math.random() * 900000).toString(),
      parentName: newMemberParentName.trim() || 'Veli',
      parentPhone: newMemberPhone.trim() || '+90 5XX XXX XX XX',
      birthYear: Number(newMemberBirthYear) || 2012,
      attendanceRate: 100,
      licenseNumber: `${targetGroup.branch ? targetGroup.branch.slice(0, 3).toUpperCase() : 'SPF'}-34-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    const updatedMembers = [...(targetGroup.members || []), newMem];
    const updatedGroup: GrupItem = {
      ...targetGroup,
      members: updatedMembers,
      memberCount: updatedMembers.length,
      status: updatedMembers.length >= (targetGroup.maxCapacity || 15) ? 'Dolu' : 'Aktif',
    };

    setGruplar((prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));

    if (detailModalGroup && detailModalGroup.id === updatedGroup.id) {
      setDetailModalGroup(updatedGroup);
    }
    if (editingGroup && editingGroup.id === updatedGroup.id) {
      setEditingGroup(updatedGroup);
    }

    setNewMemberName('');
    setNewMemberPhone('');
    setNewMemberParentName('');
    showToast(`${newMem.name} başarıyla "${updatedGroup.name}" kadrosuna eklendi.`);
  };

  const handleAddClubAthleteToGroup = (athlete: typeof INITIAL_SPORCULAR[0]) => {
    const targetGroup = detailModalGroup || editingGroup;
    if (!targetGroup) return;

    if (targetGroup.members?.some((m) => m.name.toLowerCase() === athlete.name.toLowerCase() || m.code === athlete.code)) {
      showToast(`${athlete.name} zaten bu grupta kayıtlı.`);
      return;
    }

    const newMem: GrupMember = {
      id: `m-${Date.now()}-${athlete.id}`,
      name: athlete.name,
      phone: '+90 532 555 44 33',
      code: athlete.code,
      parentName: `${athlete.name} Velisi`,
      parentPhone: '+90 532 555 44 33',
      birthYear: 2011,
      attendanceRate: 95,
      licenseNumber: `SPF-34-${athlete.code}`,
    };

    const updatedMembers = [...(targetGroup.members || []), newMem];
    const updatedGroup: GrupItem = {
      ...targetGroup,
      members: updatedMembers,
      memberCount: updatedMembers.length,
      status: updatedMembers.length >= (targetGroup.maxCapacity || 15) ? 'Dolu' : 'Aktif',
    };

    setGruplar((prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));

    if (detailModalGroup && detailModalGroup.id === updatedGroup.id) {
      setDetailModalGroup(updatedGroup);
    }

    showToast(`${athlete.name} kulüp havuzundan gruba dahil edildi.`);
  };

  const handleRemoveMember = (memberId: string) => {
    const targetGroup = detailModalGroup || editingGroup;
    if (!targetGroup) return;

    const removedMember = targetGroup.members?.find((m) => m.id === memberId);
    const updatedMembers = (targetGroup.members || []).filter((m) => m.id !== memberId);
    const updatedGroup: GrupItem = {
      ...targetGroup,
      members: updatedMembers,
      memberCount: updatedMembers.length,
      status: updatedMembers.length >= (targetGroup.maxCapacity || 15) ? 'Dolu' : 'Aktif',
    };

    setGruplar((prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));

    if (detailModalGroup && detailModalGroup.id === updatedGroup.id) {
      setDetailModalGroup(updatedGroup);
    }
    if (editingGroup && editingGroup.id === updatedGroup.id) {
      setEditingGroup(updatedGroup);
    }

    showToast(`${removedMember?.name || 'Sporcu'} gruptan çıkarıldı.`);
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    if (window.confirm(`"${groupName}" grubunu ve tüm kadro kaydını silmek istediğinize emin misiniz?`)) {
      setGruplar((prev) => prev.filter((g) => g.id !== groupId));
      if (detailModalGroup?.id === groupId) setDetailModalGroup(null);
      if (editingGroup?.id === groupId) setEditingGroup(null);
      showToast(`"${groupName}" grubu silindi.`);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newGroup: GrupItem = {
      id: `grp-${Date.now()}`,
      name: newName.trim(),
      instructorName: newInstructor.trim(),
      memberCount: 0,
      facility: newFacility.trim(),
      branch: newBranch,
      category: newCategory,
      ageGroup: newAgeGroup,
      maxCapacity: Number(newMaxCapacity) || 15,
      monthlyFee: Number(newMonthlyFee) || 3000,
      status: 'Aktif',
      schedule: {
        days: newScheduleDays,
        time: newScheduleTime,
        location: newScheduleLocation,
      },
      description: newDescription.trim(),
      members: [],
    };

    setGruplar([newGroup, ...gruplar]);
    setShowAddModal(false);
    setNewName('');
    setNewDescription('');
    showToast(`"${newGroup.name}" grubu başarıyla oluşturuldu.`);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    const targetLabel =
      broadcastTargetGroupId === 'all'
        ? 'Tüm gruplardaki sporcu ve velilere'
        : `"${gruplar.find((g) => g.id === broadcastTargetGroupId)?.name}" grubu velilerine`;

    showToast(`${targetLabel} ${broadcastChannel.toUpperCase()} bildirimi başarıyla gönderildi.`);
    setShowBroadcastModal(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  const handleExportCSV = () => {
    const rows = [
      ['Grup/Takım Adı', 'Branş', 'Kategori', 'Antrenör', 'Tesis', 'Mevcut', 'Kapasite', 'Antrenman Günleri', 'Saat'],
      ...filteredGruplar.map((g) => [
        `"${g.name}"`,
        `"${g.branch || ''}"`,
        `"${g.category || ''}"`,
        `"${g.instructorName}"`,
        `"${g.facility}"`,
        g.memberCount,
        g.maxCapacity || 15,
        `"${g.schedule?.days?.join(', ') || ''}"`,
        `"${g.schedule?.time || ''}"`,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SportsFly_Gruplar_Takimlar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Gruplar ve takımlar listesi CSV olarak dışa aktarıldı.');
  };

  // Toggle day for schedules
  const toggleDaySelection = (day: string, currentDays: string[], setter: (days: string[]) => void) => {
    if (currentDays.includes(day)) {
      setter(currentDays.filter((d) => d !== day));
    } else {
      setter([...currentDays, day]);
    }
  };

  // Branch stats
  const branchCounts = gruplar.reduce((acc, g) => {
    const b = g.branch || 'Basketbol';
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filtered groups
  const filteredGruplar = gruplar.filter((g) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      g.name.toLowerCase().includes(q) ||
      g.instructorName.toLowerCase().includes(q) ||
      g.facility.toLowerCase().includes(q) ||
      (g.branch && g.branch.toLowerCase().includes(q)) ||
      (g.category && g.category.toLowerCase().includes(q)) ||
      (g.ageGroup && g.ageGroup.toLowerCase().includes(q));

    const matchesBranch = selectedBranch === 'all' || g.branch === selectedBranch;
    const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;

    return matchesSearch && matchesBranch && matchesCategory;
  });

  // Aggregated Stats
  const totalMembers = gruplar.reduce((acc, g) => acc + (g.members?.length || g.memberCount || 0), 0);
  const totalCapacity = gruplar.reduce((acc, g) => acc + (g.maxCapacity || 15), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalMembers / totalCapacity) * 100) : 0;
  const activeBranchesCount = Object.keys(branchCounts).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 text-sm font-medium animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HERO & STATS HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Gruplar &amp; Takımlar
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
              title="CSV olarak indir"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Dışa Aktar</span>
            </button>

            <button
              onClick={() => {
                setBroadcastTargetGroupId('all');
                setShowBroadcastModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Velilere toplu duyuru veya SMS gönder"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>Toplu Duyuru / SMS</span>
            </button>

            <button
              id="btn-new-group-main"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Yeni Grup / Takım Ekle</span>
            </button>
          </div>
        </div>

        {/* 4 SUMMARY STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-5">
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aktif Gruplar</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">{gruplar.length} Takım</p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kayıtlı Sporcu</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">{totalMembers} Sporcu</p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ort. Doluluk</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-lg sm:text-xl font-black text-slate-900">%{occupancyRate}</p>
                <span className="text-[10px] font-semibold text-slate-500">({totalMembers}/{totalCapacity})</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-100/70 text-purple-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Spor Branşı</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">{activeBranchesCount} Branş</p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & VIEW CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
        {/* Branch Pills and View Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Branch Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedBranch('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedBranch === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              Tüm Branşlar ({gruplar.length})
            </button>
            {branchOptions.map((br) => {
              const count = branchCounts[br] || 0;
              return (
                <button
                  key={br}
                  onClick={() => setSelectedBranch(br)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedBranch === br
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span>{br}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedBranch === br ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* View Toggle Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tablo Görünümü (Varsayılan)"
            >
              <List className="w-3.5 h-3.5" />
              <span>Tablo</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Kart Görünümü"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartlar</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-group-input"
              type="text"
              placeholder="Grup adı, antrenör, tesis veya branşa göre ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-56 shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Tüm Kategoriler</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: GRID CARDS VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredGruplar.map((grup) => {
            const memberCount = grup.members?.length || grup.memberCount || 0;
            const capacity = grup.maxCapacity || 15;
            const percent = Math.min(100, Math.round((memberCount / capacity) * 100));
            const isFull = memberCount >= capacity;

            return (
              <div
                key={grup.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header & Badges */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                        {grup.branch || 'Basketbol'}
                      </span>
                      {grup.category && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {grup.category}
                        </span>
                      )}
                      {grup.ageGroup && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                          {grup.ageGroup}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(grup)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Grubu Düzenle"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(grup.id, grup.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Grubu Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3
                    onClick={() => handleOpenDetailModal(grup, 'members')}
                    className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors cursor-pointer line-clamp-1"
                    title={grup.name}
                  >
                    {grup.name}
                  </h3>

                  {grup.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[32px]">
                      {grup.description}
                    </p>
                  )}
                </div>

                {/* Trainer & Schedule details */}
                <div className="px-5 py-3 bg-slate-50/60 border-y border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 font-medium">Antrenör / Koç:</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      {grup.instructorName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-500 font-medium">Tesis:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[180px]" title={grup.facility}>
                      {grup.facility}
                    </span>
                  </div>

                  {/* Schedule days & hours */}
                  {grup.schedule && (
                    <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-[11px] truncate max-w-[160px]">
                          {grup.schedule.days?.join(', ') || 'Programlı Günler'}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[11px] text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {grup.schedule.time}
                      </span>
                    </div>
                  )}
                </div>

                {/* Capacity & Athlete Avatars */}
                <div className="p-5 pt-3.5 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>Kadro Mevcudu:</span>
                      </span>
                      <span className={isFull ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                        {memberCount} / {capacity} Sporcu ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFull
                            ? 'bg-rose-500'
                            : percent > 80
                            ? 'bg-amber-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Member avatars preview */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex -space-x-2 overflow-hidden">
                      {(grup.members || []).slice(0, 4).map((m, idx) => (
                        <div
                          key={m.id}
                          className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-700"
                          title={m.name}
                        >
                          {m.name.slice(0, 1)}
                        </div>
                      ))}
                      {(grup.members?.length || 0) > 4 && (
                        <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-800">
                          +{(grup.members?.length || 0) - 4}
                        </div>
                      )}
                      {(!grup.members || grup.members.length === 0) && (
                        <span className="text-[11px] text-slate-400 italic">Henüz sporcu eklenmedi</span>
                      )}
                    </div>

                    {grup.monthlyFee && (
                      <span className="text-xs font-extrabold text-slate-800">
                        ₺{grup.monthlyFee.toLocaleString('tr-TR')} <span className="text-[10px] text-slate-400 font-normal">/ay</span>
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => handleOpenDetailModal(grup, 'members')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Kadro &amp; Üyeler</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate('yoklama');
                        } else {
                          showToast(`"${grup.name}" için yoklama modülü açılıyor...`);
                        }
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      <span>Yoklama Al</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-800 bg-slate-50/70 select-none">
                  <th className="py-3.5 px-4 w-10 text-center"></th>
                  <th className="py-3.5 px-4">Grup / Takım</th>
                  <th className="py-3.5 px-4">Branş &amp; Kategori</th>
                  <th className="py-3.5 px-4">Antrenör &amp; Tesis</th>
                  <th className="py-3.5 px-4">Program &amp; Saat</th>
                  <th className="py-3.5 px-4">Doluluk</th>
                  <th className="py-3.5 px-4">Aidat</th>
                  <th className="py-3.5 px-4 text-right pr-6">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGruplar.map((grup) => {
                  const isSelected = selectedGroupId === grup.id;
                  const memberCount = grup.members?.length || grup.memberCount || 0;
                  const capacity = grup.maxCapacity || 15;
                  const percent = Math.min(100, Math.round((memberCount / capacity) * 100));

                  return (
                    <tr
                      key={grup.id}
                      onClick={() => setSelectedGroupId(isSelected ? null : grup.id)}
                      className={`transition-colors group hover:bg-slate-50/80 cursor-pointer ${
                        isSelected ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {/* Selection radio */}
                      <td className="py-4 px-4 text-center align-middle">
                        <div
                          className={`w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center mx-auto ${
                            isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </td>

                      {/* Name & Description */}
                      <td className="py-4 px-4 align-middle">
                        <p className="font-bold text-slate-900 text-sm">{grup.name}</p>
                        {grup.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">{grup.description}</p>
                        )}
                      </td>

                      {/* Branch & Category */}
                      <td className="py-4 px-4 align-middle">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80">
                            {grup.branch || 'Basketbol'}
                          </span>
                          {grup.category && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {grup.category}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Instructor & Facility */}
                      <td className="py-4 px-4 align-middle">
                        <p className="text-xs font-bold text-slate-900">{grup.instructorName}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[150px]">{grup.facility}</p>
                      </td>

                      {/* Schedule */}
                      <td className="py-4 px-4 align-middle">
                        {grup.schedule ? (
                          <div className="text-xs">
                            <p className="font-semibold text-slate-800">
                              {grup.schedule.days?.join(', ')}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">{grup.schedule.time}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>

                      {/* Capacity & Progress */}
                      <td className="py-4 px-4 align-middle">
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span className="text-slate-700">{memberCount}/{capacity}</span>
                            <span className="text-slate-500">%{percent}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Monthly Fee */}
                      <td className="py-4 px-4 align-middle text-xs font-bold text-slate-800">
                        {grup.monthlyFee ? `₺${grup.monthlyFee.toLocaleString('tr-TR')}` : '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 pr-6 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigate) {
                                onNavigate('yoklama');
                              } else {
                                showToast(`"${grup.name}" için yoklama modülü açılıyor...`);
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Yoklama Al"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span>Yoklama</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetailModal(grup, 'members');
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                            title="Kadro ve Üye Yönetimi"
                          >
                            Kadro
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(grup);
                            }}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Düzenle"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGroup(grup.id, grup.name);
                            }}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EMPTY SEARCH STATE */}
      {filteredGruplar.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-800">Arama Kriterine Uygun Grup Bulunamadı</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Arama metnini veya branş filtresini değiştirebilir ya da yeni bir grup/takım ekleyebilirsiniz.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedBranch('all');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}

      {/* FOOTER INFO BAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Sistemde toplam <strong>{gruplar.length}</strong> grup ve takım listelenmektedir.</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Toplam Sporcu: <strong>{totalMembers}</strong></span>
          <span>Genel Doluluk: <strong>%{occupancyRate}</strong></span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TEAM DETAIL & ROSTER MANAGEMENT (KADRO & SPORCULAR MODALI) */}
      {/* ========================================================================= */}
      {detailModalGroup && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">{detailModalGroup.name}</h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {detailModalGroup.branch || 'Basketbol'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Koç: <strong>{detailModalGroup.instructorName}</strong> • Tesis: {detailModalGroup.facility}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalGroup(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Nav Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 pt-3 pb-2 shrink-0">
              <button
                onClick={() => setDetailActiveTab('members')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  detailActiveTab === 'members'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Kadro &amp; Sporcular ({detailModalGroup.members?.length || 0})</span>
              </button>
              <button
                onClick={() => setDetailActiveTab('schedule')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  detailActiveTab === 'schedule'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Antrenman Programı</span>
              </button>
              <button
                onClick={() => setDetailActiveTab('info')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  detailActiveTab === 'info'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Grup Bilgileri &amp; İstatistikler</span>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {/* TAB 1: MEMBERS */}
              {detailActiveTab === 'members' && (
                <div className="space-y-4">
                  {/* Add Member Box */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                      <span>Hızlı Sporcu Ekle</span>
                    </p>

                    <form onSubmit={handleAddMemberToGroup} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <input
                        type="text"
                        required
                        placeholder="Sporcu Adı Soyadı *"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Veli Adı Soyadı"
                        value={newMemberParentName}
                        onChange={(e) => setNewMemberParentName(e.target.value)}
                        className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Telefon (Veli)"
                        value={newMemberPhone}
                        onChange={(e) => setNewMemberPhone(e.target.value)}
                        className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Kadroya Ekle</span>
                      </button>
                    </form>

                    {/* Club Athletes Directory Selector */}
                    <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Kulüp kayıtlı sporcuları arasından hızlı aktar:
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                        {INITIAL_SPORCULAR.slice(0, 4).map((ath) => (
                          <button
                            key={ath.id}
                            type="button"
                            onClick={() => handleAddClubAthleteToGroup(ath)}
                            className="px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-[11px] font-medium text-slate-700 transition-colors flex items-center gap-1 shrink-0"
                          >
                            <Plus className="w-3 h-3 text-blue-600" />
                            <span>{ath.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Members Roster Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Kayıtlı Sporcular ({detailModalGroup.members?.length || 0})</span>
                      <span className="text-slate-400 text-[11px]">
                        Kontenjan: {detailModalGroup.members?.length || 0} / {detailModalGroup.maxCapacity || 15}
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                      {detailModalGroup.members && detailModalGroup.members.length > 0 ? (
                        detailModalGroup.members.map((m, idx) => (
                          <div
                            key={m.id}
                            className="p-3 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-6 text-center font-bold text-slate-400 text-[11px]">
                                {idx + 1}
                              </span>
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
                                {m.name.slice(0, 1)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-sm truncate">{m.name}</p>
                                <p className="text-[11px] text-slate-500">
                                  Kod: <span className="font-mono text-slate-700">{m.code}</span>
                                  {m.parentName && ` • Veli: ${m.parentName}`}
                                  {m.birthYear && ` • D.Yılı: ${m.birthYear}`}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {m.phone && (
                                <a
                                  href={`tel:${m.phone}`}
                                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md"
                                  title="Veliyi Ara"
                                >
                                  <Phone className="w-3 h-3 text-blue-600" />
                                  <span>{m.phone}</span>
                                </a>
                              )}

                              {m.attendanceRate !== undefined && (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  %{m.attendanceRate} Devam
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveMember(m.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Kadro Çıkar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          Bu gruba henüz kayıtlı sporcu bulunmuyor. Yukarıdaki formdan ekleyebilirsiniz.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SCHEDULE */}
              {detailActiveTab === 'schedule' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Haftalık Antrenman Takvimi</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500">Antrenman Günleri:</span>
                        <p className="font-bold text-slate-900 text-sm">
                          {detailModalGroup.schedule?.days?.join(', ') || 'Belirtilmedi'}
                        </p>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500">Saat Aralığı:</span>
                        <p className="font-bold text-slate-900 text-sm font-mono">
                          {detailModalGroup.schedule?.time || '17:30 - 19:00'}
                        </p>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 sm:col-span-2">
                        <span className="text-[11px] font-semibold text-slate-500">Saha / Tesis Konumu:</span>
                        <p className="font-bold text-slate-900 text-sm">
                          {detailModalGroup.schedule?.location || detailModalGroup.facility}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          if (onNavigate) {
                            onNavigate('antrenman-takvimi');
                          } else {
                            showToast('Antrenman Takvimi sayfasına yönlendiriliyor...');
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Tam Antrenman Takvimini Aç</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: GROUP INFO & STATS */}
              {detailActiveTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Branş</span>
                      <p className="text-sm font-black text-slate-900 mt-1">{detailModalGroup.branch || 'Basketbol'}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Kategori</span>
                      <p className="text-sm font-black text-slate-900 mt-1">{detailModalGroup.category || 'Altyapı'}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Yaş Grubu</span>
                      <p className="text-sm font-black text-slate-900 mt-1">{detailModalGroup.ageGroup || 'Gençler'}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Maksimum Kontenjan</span>
                      <p className="text-sm font-black text-slate-900 mt-1">{detailModalGroup.maxCapacity || 15} Kişi</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Aylık Aidat</span>
                      <p className="text-sm font-black text-slate-900 mt-1">
                        ₺{(detailModalGroup.monthlyFee || 3000).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Durum</span>
                      <p className="text-sm font-black text-emerald-600 mt-1">{detailModalGroup.status || 'Aktif'}</p>
                    </div>
                  </div>

                  {detailModalGroup.description && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-700 block mb-1">Grup Açıklaması &amp; Hedefler</span>
                      <p className="text-xs text-slate-600 leading-relaxed">{detailModalGroup.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  setBroadcastTargetGroupId(detailModalGroup.id);
                  setShowBroadcastModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>Velilere SMS / Duyuru Gönder</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(detailModalGroup);
                    setDetailModalGroup(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Grubu Düzenle</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailModalGroup(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: YENİ GRUP / TAKIM OLUŞTUR */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Yeni Grup / Takım Oluştur</h3>
                  <p className="text-xs text-slate-500">Spor okulu veya yarışmacı takım tanımlayın</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Grup / Takım Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Anadolu Efes U14 Altyapı Hazırlık"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branş *</label>
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {branchOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Türü *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sorumlu Koç / Antrenör *</label>
                  <input
                    type="text"
                    required
                    value={newInstructor}
                    onChange={(e) => setNewInstructor(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Yaş Grubu / Seviye</label>
                  <input
                    type="text"
                    placeholder="Örn: U14 (2010-2011)"
                    value={newAgeGroup}
                    onChange={(e) => setNewAgeGroup(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maksimum Kontenjan (Kapasite)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newMaxCapacity}
                    onChange={(e) => setNewMaxCapacity(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Aylık Aidat / Ücret (₺)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={newMonthlyFee}
                    onChange={(e) => setNewMonthlyFee(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Days Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Antrenman Günleri</label>
                <div className="flex flex-wrap gap-1.5">
                  {weekDayOptions.map((day) => {
                    const isSelected = newScheduleDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDaySelection(day, newScheduleDays, setNewScheduleDays)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Antrenman Saati</label>
                  <input
                    type="text"
                    placeholder="Örn: 17:30 - 19:00"
                    value={newScheduleTime}
                    onChange={(e) => setNewScheduleTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tesis / Salon Konumu</label>
                  <input
                    type="text"
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Grup Açıklaması &amp; Hedefler</label>
                <textarea
                  rows={2}
                  placeholder="Grup seviyesi, yaş kriteri veya turnuva hedefleri..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Grubu Oluştur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: GRUP DÜZENLEME MODALI */}
      {/* ========================================================================= */}
      {editingGroup && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Grubu Düzenle</h3>
                  <p className="text-xs text-slate-500">{editingGroup.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingGroup(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Grup Adı *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branş</label>
                  <select
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white"
                  >
                    {branchOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Antrenör</label>
                  <input
                    type="text"
                    required
                    value={editInstructor}
                    onChange={(e) => setEditInstructor(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Yaş Grubu</label>
                  <input
                    type="text"
                    value={editAgeGroup}
                    onChange={(e) => setEditAgeGroup(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Maksimum Kontenjan</label>
                  <input
                    type="number"
                    min={1}
                    value={editMaxCapacity}
                    onChange={(e) => setEditMaxCapacity(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Aylık Aidat (₺)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={editMonthlyFee}
                    onChange={(e) => setEditMonthlyFee(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              {/* Edit Schedule Days */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Antrenman Günleri</label>
                <div className="flex flex-wrap gap-1.5">
                  {weekDayOptions.map((day) => {
                    const isSelected = editScheduleDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDaySelection(day, editScheduleDays, setEditScheduleDays)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Antrenman Saati</label>
                  <input
                    type="text"
                    value={editScheduleTime}
                    onChange={(e) => setEditScheduleTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tesis / Salon</label>
                  <input
                    type="text"
                    value={editFacility}
                    onChange={(e) => setEditFacility(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-2xs"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: TOPLU SMS & DUYURU GÖNDERİM MODALI */}
      {/* ========================================================================= */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Grup Velilerine Duyuru / SMS</h3>
                  <p className="text-xs text-slate-500">Antrenman saati, servis veya maç duyurusu iletin</p>
                </div>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hedef Grup / Takım</label>
                <select
                  value={broadcastTargetGroupId}
                  onChange={(e) => setBroadcastTargetGroupId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white"
                >
                  <option value="all">Tüm Gruplar ve Takımlar ({totalMembers} Sporcu / Veli)</option>
                  {gruplar.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.members?.length || g.memberCount || 0} Sporcu)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">İletim Kanalı</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastChannel('sms')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      broadcastChannel === 'sms'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>SMS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastChannel('email')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      broadcastChannel === 'email'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>E-Posta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastChannel('app')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      broadcastChannel === 'app'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <SportsFlyIcon className="w-3.5 h-3.5" />
                    <span>SportsFly App</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duyuru Başlığı</label>
                <input
                  type="text"
                  placeholder="Örn: Hafta Sonu Maç Saati Değişikliği"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mesaj Metni *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Sayın Velimiz, sporcumuzun bu haftaki antrenmanı..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
                <p className="text-[11px] text-slate-400 text-right mt-1">
                  {broadcastMessage.length} karakter • Tahmini 1 SMS
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Bildirimi Gönder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
