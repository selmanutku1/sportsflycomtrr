import React, { useState, useMemo } from 'react';
import {
  Plus,
  Send,
  Search,
  User,
  Image as ImageIcon,
  KeyRound,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Layers,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  Award,
  Users,
  Briefcase,
  FileText,
  Download,
  Filter,
  LayoutGrid,
  List,
  Edit3,
  Trash2,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Activity,
  ExternalLink,
  DollarSign,
  AlertCircle,
  MoreVertical,
  Check,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { INITIAL_EGITMENLER } from '../../data/mockData';
import { TURKEY_CITIES } from '../../data/turkeyCitiesData';
import { EgitmenItem } from '../../types';
import { SportsFlyIcon } from '../SportsFlyLogo';
import { TrainerAssignGroupModal } from './egitmen/TrainerAssignGroupModal';
import { TrainerAssignTrainingModal } from './egitmen/TrainerAssignTrainingModal';
import { TrainerAddDocumentModal } from './egitmen/TrainerAddDocumentModal';
import { TrainerPdfReportModal } from './egitmen/TrainerPdfReportModal';
import { TrainerDocumentPreviewModal } from './egitmen/TrainerDocumentPreviewModal';

// Branch Colors Mapping for clean visual hierarchy
const BRANCH_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Futbol: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  Basketbol: { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  Yüzme: { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
  Tenis: { bg: 'bg-lime-50 dark:bg-lime-950/40', text: 'text-lime-700 dark:text-lime-300', border: 'border-lime-200 dark:border-lime-800' },
  Pilates: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  Fitness: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  Jimnastik: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  Voleybol: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
};

export const EgitmenlerView: React.FC = () => {
  const [egitmenler, setEgitmenler] = useState<EgitmenItem[]>(INITIAL_EGITMENLER);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Categories / Branches
  const [categories, setCategories] = useState<string[]>([
    'Futbol',
    'Basketbol',
    'Yüzme',
    'Tenis',
    'Pilates',
    'Fitness',
    'Jimnastik',
    'Voleybol',
  ]);

  // Modal / Drawer States
  const [selectedTrainerDetail, setSelectedTrainerDetail] = useState<EgitmenItem | null>(null);
  const [editingEgitmen, setEditingEgitmen] = useState<EgitmenItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [detailTab, setDetailTab] = useState<'genel' | 'gruplar' | 'takvim' | 'belgeler' | 'performans'>('genel');

  // Interactive Action Modals
  const [assignGroupTrainer, setAssignGroupTrainer] = useState<EgitmenItem | null>(null);
  const [assignTrainingTrainer, setAssignTrainingTrainer] = useState<EgitmenItem | null>(null);
  const [addDocumentTrainer, setAddDocumentTrainer] = useState<EgitmenItem | null>(null);
  const [previewDocument, setPreviewDocument] = useState<{ trainerName: string; document: any } | null>(null);
  const [pdfReportModal, setPdfReportModal] = useState<{
    isOpen: boolean;
    mode: 'single' | 'all';
    trainer?: EgitmenItem | null;
  }>({
    isOpen: false,
    mode: 'all',
    trainer: null,
  });

  // New Category State
  const [newCategoryName, setNewCategoryName] = useState('');

  // Editing Trainer Form State
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBranch, setEditBranch] = useState('Futbol');
  const [editStatus, setEditStatus] = useState<'Aktif' | 'İzinli' | 'Ayrıldı'>('Aktif');
  const [editLicenseLevel, setEditLicenseLevel] = useState('');
  const [editExperienceYears, setEditExperienceYears] = useState<number>(5);
  const [editBio, setEditBio] = useState('');
  const [editGender, setEditGender] = useState('Erkek');
  const [editCity, setEditCity] = useState('İstanbul');
  const [editAddress, setEditAddress] = useState('');
  const [editHourlyRate, setEditHourlyRate] = useState<number>(600);
  const [editMonthlySalary, setEditMonthlySalary] = useState<number>(30000);
  const [editMailEnabled, setEditMailEnabled] = useState(true);
  const [editSmsEnabled, setEditSmsEnabled] = useState(true);

  // New Trainer Form State
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+90 5');
  const [newFacility, setNewFacility] = useState('aicosports');
  const [newBranch, setNewBranch] = useState('Futbol');
  const [newLicenseLevel, setNewLicenseLevel] = useState('Federasyon Lisanslı Antrenör');
  const [newExp, setNewExp] = useState<number>(3);
  const [newBio, setNewBio] = useState('');

  // Message Form State
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageChannel, setMessageChannel] = useState<'sms' | 'email' | 'both'>('both');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats Calculations
  const stats = useMemo(() => {
    const totalTrainers = egitmenler.length;
    const activeTrainers = egitmenler.filter((e) => (e.status || 'Aktif') === 'Aktif').length;
    const totalGroups = egitmenler.reduce((acc, curr) => acc + (curr.activeGroupsCount || (curr.assignedGroups?.length || 1)), 0);
    const totalWeeklyHours = egitmenler.reduce((acc, curr) => acc + (curr.weeklyHours || 15), 0);

    return { totalTrainers, activeTrainers, totalGroups, totalWeeklyHours };
  }, [egitmenler]);

  // Filtered trainers
  const filteredEgitmenler = useMemo(() => {
    return egitmenler.filter((e) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        e.facility.toLowerCase().includes(q) ||
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.branch && e.branch.toLowerCase().includes(q)) ||
        (e.specialties && e.specialties.some((s) => s.toLowerCase().includes(q)));

      const matchesCategory = selectedCategory === 'all' || e.branch === selectedCategory;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && (e.status || 'Aktif') === 'Aktif') ||
        (statusFilter === 'leave' && e.status === 'İzinli');

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [egitmenler, searchQuery, selectedCategory, statusFilter]);

  // Open Edit Form
  const handleOpenEdit = (egitmen: EgitmenItem) => {
    setEditingEgitmen(egitmen);
    setEditName(egitmen.name);
    setEditTitle(egitmen.title || `${egitmen.branch || 'Spor'} Antrenörü`);
    setEditPhone(egitmen.phone);
    setEditEmail(egitmen.email);
    setEditBranch(egitmen.branch || 'Futbol');
    setEditStatus(egitmen.status || 'Aktif');
    setEditLicenseLevel(egitmen.licenseLevel || 'Federasyon Lisansı');
    setEditExperienceYears(egitmen.experienceYears || 5);
    setEditBio(egitmen.bio || '');
    setEditGender(egitmen.gender || 'Erkek');
    setEditCity(egitmen.city || 'İstanbul');
    setEditAddress(egitmen.address || '');
    setEditHourlyRate(egitmen.hourlyRate || 650);
    setEditMonthlySalary(egitmen.monthlySalary || 35000);
    setEditMailEnabled(egitmen.mailEnabled ?? true);
    setEditSmsEnabled(egitmen.smsEnabled ?? true);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEgitmen) return;

    setEgitmenler((prev) =>
      prev.map((item) =>
        item.id === editingEgitmen.id
          ? {
              ...item,
              name: editName.trim(),
              title: editTitle.trim(),
              phone: editPhone.trim(),
              email: editEmail.trim(),
              branch: editBranch,
              status: editStatus,
              licenseLevel: editLicenseLevel,
              experienceYears: editExperienceYears,
              bio: editBio,
              gender: editGender,
              city: editCity,
              address: editAddress,
              hourlyRate: editHourlyRate,
              monthlySalary: editMonthlySalary,
              mailEnabled: editMailEnabled,
              smsEnabled: editSmsEnabled,
            }
          : item
      )
    );

    // If detail modal is currently showing the same trainer, update it as well
    if (selectedTrainerDetail && selectedTrainerDetail.id === editingEgitmen.id) {
      setSelectedTrainerDetail({
        ...selectedTrainerDetail,
        name: editName.trim(),
        title: editTitle.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
        branch: editBranch,
        status: editStatus,
        licenseLevel: editLicenseLevel,
        experienceYears: editExperienceYears,
        bio: editBio,
        gender: editGender,
        city: editCity,
        address: editAddress,
        hourlyRate: editHourlyRate,
        monthlySalary: editMonthlySalary,
        mailEnabled: editMailEnabled,
        smsEnabled: editSmsEnabled,
      });
    }

    showToast(`"${editName}" eğitmen profili ve çalışma bilgileri güncellendi.`);
    setEditingEgitmen(null);
  };

  // Add New Trainer
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newTrainer: EgitmenItem = {
      id: `e-${Date.now()}`,
      name: newName.trim(),
      title: newTitle.trim() || `${newBranch} Antrenörü`,
      email: newEmail.trim(),
      code: randomCode,
      phone: newPhone.trim(),
      facility: newFacility,
      branch: newBranch,
      status: 'Aktif',
      licenseLevel: newLicenseLevel,
      experienceYears: Number(newExp) || 3,
      rating: 5.0,
      reviewCount: 1,
      activeGroupsCount: 1,
      activeAthletesCount: 15,
      weeklyHours: 12,
      bio: newBio.trim() || `${newBranch} branşında lisanslı antrenör.`,
      specialties: [newBranch, 'Temel Teknik', 'Fiziksel Gelişim'],
      assignedGroups: [`${newBranch} Başlangıç Grubu`],
      joinDate: new Date().toLocaleDateString('tr-TR'),
      hourlyRate: 600,
      monthlySalary: 30000,
      gender: 'Belirtilmedi',
      city: 'İstanbul',
      address: '',
      mailEnabled: true,
      smsEnabled: true,
      documents: [
        { id: `doc-${Date.now()}`, name: `${newBranch}_Antrenor_Belgesi.pdf`, type: 'Sertifika', date: 'Yeni', size: '1.5 MB' },
      ],
      appointments: [],
    };

    setEgitmenler([newTrainer, ...egitmenler]);
    setShowAddModal(false);
    setNewName('');
    setNewTitle('');
    setNewEmail('');
    setNewPhone('+90 5');
    setNewBio('');
    showToast(`Yeni eğitmen "${newTrainer.name}" (${newTrainer.branch}) başarıyla eklendi.`);
  };

  // Add New Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      showToast('Bu kategori zaten mevcut.');
      return;
    }
    setCategories([...categories, trimmed]);
    setNewCategoryName('');
    showToast(`"${trimmed}" eğitmen branş kategorisi eklendi.`);
  };

  // Delete Category
  const handleDeleteCategory = (catName: string) => {
    setCategories(categories.filter((c) => c !== catName));
    if (selectedCategory === catName) setSelectedCategory('all');
    showToast(`"${catName}" kategorisi kaldırıldı.`);
  };

  // Bulk Selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredEgitmenler.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEgitmenler.map((e) => e.id));
    }
  };

  // Save groups for trainer
  const handleSaveGroups = (
    trainerId: string,
    updatedGroups: string[],
    updatedAthletesCount: number,
    updatedWeeklyHours: number
  ) => {
    setEgitmenler((prev) =>
      prev.map((item) => {
        if (item.id === trainerId) {
          return {
            ...item,
            assignedGroups: updatedGroups,
            activeGroupsCount: updatedGroups.length,
            activeAthletesCount: updatedAthletesCount,
            weeklyHours: updatedWeeklyHours,
          };
        }
        return item;
      })
    );

    if (selectedTrainerDetail && selectedTrainerDetail.id === trainerId) {
      setSelectedTrainerDetail((prev) =>
        prev
          ? {
              ...prev,
              assignedGroups: updatedGroups,
              activeGroupsCount: updatedGroups.length,
              activeAthletesCount: updatedAthletesCount,
              weeklyHours: updatedWeeklyHours,
            }
          : null
      );
    }
  };

  // Assign training session to trainer
  const handleAssignTraining = (
    trainerId: string,
    training: {
      id: string;
      title: string;
      branch: string;
      student: string;
      targetGroup: string;
      date: string;
      time: string;
      facility: string;
      notes?: string;
      status: string;
    }
  ) => {
    setEgitmenler((prev) =>
      prev.map((item) => {
        if (item.id === trainerId) {
          const existingApps = item.appointments || [];
          return {
            ...item,
            appointments: [training, ...existingApps],
            weeklyHours: (item.weeklyHours || 12) + 2,
          };
        }
        return item;
      })
    );

    if (selectedTrainerDetail && selectedTrainerDetail.id === trainerId) {
      setSelectedTrainerDetail((prev) =>
        prev
          ? {
              ...prev,
              appointments: [training, ...(prev.appointments || [])],
              weeklyHours: (prev.weeklyHours || 12) + 2,
            }
          : null
      );
    }
  };

  // Add document to trainer
  const handleAddDocument = (
    trainerId: string,
    newDoc: {
      id: string;
      name: string;
      type: string;
      date: string;
      size: string;
      issuer?: string;
      notes?: string;
    }
  ) => {
    setEgitmenler((prev) =>
      prev.map((item) => {
        if (item.id === trainerId) {
          const existingDocs = item.documents || [];
          return {
            ...item,
            documents: [newDoc, ...existingDocs],
          };
        }
        return item;
      })
    );

    if (selectedTrainerDetail && selectedTrainerDetail.id === trainerId) {
      setSelectedTrainerDetail((prev) =>
        prev
          ? {
              ...prev,
              documents: [newDoc, ...(prev.documents || [])],
            }
          : null
      );
    }
  };

  // Delete document from trainer
  const handleDeleteDocument = (trainerId: string, docId: string) => {
    setEgitmenler((prev) =>
      prev.map((item) => {
        if (item.id === trainerId) {
          const filteredDocs = (item.documents || []).filter((d) => d.id !== docId);
          return {
            ...item,
            documents: filteredDocs,
          };
        }
        return item;
      })
    );

    if (selectedTrainerDetail && selectedTrainerDetail.id === trainerId) {
      setSelectedTrainerDetail((prev) =>
        prev
          ? {
              ...prev,
              documents: (prev.documents || []).filter((d) => d.id !== docId),
            }
          : null
      );
    }
    showToast('Belge başarıyla silindi.');
  };

  // Download document simulation / file blob
  const handleDownloadDocument = (doc: { name: string; type: string; date: string }) => {
    const content = `SPORTSFLY RESMİ ANTRENÖR EVRAKI / BELGESİ\n==============================================\nBelge Adı: ${doc.name}\nKategori / Tür: ${doc.type}\nKayıt Tarihi: ${doc.date}\nDoğrulama Durumu: ONAYLI & GEÇERLİ\nSportsFly Spor Akademisi Bilgi Sistemi`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', doc.name.endsWith('.pdf') ? doc.name : `${doc.name}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`"${doc.name}" dosyası başarıyla indirildi.`);
  };

  // Add Appointment to trainer schedule
  const handleAddAppointment = (trainerId: string) => {
    const newApp = {
      id: `app-${Date.now()}`,
      title: 'Özel Bireysel Gelişim & Kondisyon Seansı',
      student: 'Canberk Özkan (U14 Forvet)',
      date: new Date().toLocaleDateString('tr-TR'),
      time: '17:30 - 18:30',
      status: 'Onaylandı',
    };
    setEgitmenler((prev) =>
      prev.map((t) => {
        if (t.id === trainerId) {
          return {
            ...t,
            appointments: [newApp, ...(t.appointments || [])],
          };
        }
        return t;
      })
    );
    if (selectedTrainerDetail && selectedTrainerDetail.id === trainerId) {
      setSelectedTrainerDetail((prev) =>
        prev
          ? {
              ...prev,
              appointments: [newApp, ...(prev.appointments || [])],
            }
          : null
      );
    }
    showToast('Yeni seans antrenör takvimine başarıyla eklendi.');
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const headers = [
      'Eğitmen Adı',
      'Unvan',
      'Branş',
      'E-Posta',
      'Telefon',
      'Kullanıcı Kodu',
      'Durum',
      'Kulüp/Tesis',
      'Lisans Seviyesi',
      'Deneyim (Yıl)',
      'Haftalık Saat',
      'Sporcu Sayısı',
      'Sorumlu Gruplar',
    ];
    const rows = filteredEgitmenler.map((e) => [
      `"${e.name}"`,
      `"${e.title || '-'}"`,
      `"${e.branch || 'Futbol'}"`,
      `"${e.email}"`,
      `"${e.phone}"`,
      `"${e.code}"`,
      `"${e.status || 'Aktif'}"`,
      `"${e.facility}"`,
      `"${e.licenseLevel || 'Federasyon Lisansı'}"`,
      `"${e.experienceYears || 5}"`,
      `"${e.weeklyHours || 18}"`,
      `"${e.activeAthletesCount || 30}"`,
      `"${(e.assignedGroups || [`${e.branch || 'Futbol'} Akademi`]).join(', ')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SportsFly_Egitmenler_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${filteredEgitmenler.length} eğitmen listesi Excel (.csv) formatında başarıyla indirildi.`);
  };

  // Export to PDF / Print Modal
  const handleExportPDF = () => {
    setPdfReportModal({
      isOpen: true,
      mode: 'all',
      trainer: null,
    });
  };

  // Send Message Submit
  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageBody.trim()) return;

    const count = selectedIds.length > 0 ? selectedIds.length : filteredEgitmenler.length;
    showToast(`${count} eğitmene ${messageChannel.toUpperCase()} bildirimi başarıyla iletildi.`);
    setShowMessageModal(false);
    setMessageSubject('');
    setMessageBody('');
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="egitmen-toast"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-950 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-bottom-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER & QUICK STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#111c2e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Toplam Eğitmen</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalTrainers}</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.activeTrainers} Aktif
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111c2e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Aktif Branşlar</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{categories.length}</span>
            <span className="text-[11px] text-slate-400">Kategori</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111c2e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sorumlu Gruplar</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalGroups}</span>
            <span className="text-[11px] text-slate-400">Akademi Takımı</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111c2e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Haftalık Seans</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalWeeklyHours}</span>
            <span className="text-[11px] text-slate-400">Saat / Hafta</span>
          </div>
        </div>
      </div>

      {/* CATEGORY / BRANCH PILLS & MANAGEMENT BAR */}
      <div className="bg-white dark:bg-[#111c2e] rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-hidden">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
              <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden xs:inline">Branşlar:</span>
            </div>

            {/* Horizontally scrollable pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[32px] ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Tümü ({egitmenler.length})
              </button>

              {categories.map((cat) => {
                const count = egitmenler.filter((e) => e.branch === cat).length;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap min-h-[32px] ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-white text-blue-700 font-extrabold'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manage Categories Button */}
          <button
            onClick={() => setShowCategoryModal(true)}
            className="w-full sm:w-auto justify-center px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer min-h-[34px]"
            title="Eğitmen Kategorilerini Yönet"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kategori Yönetimi</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER: SEARCH, CONTROLS, VIEW TOGGLE & ACTIONS */}
      <div className="bg-white dark:bg-[#111c2e] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-3.5 sm:p-5">
        {/* Top Action Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-5">
          {/* Left Buttons: Yeni Eğitmen + Mesaj Gönder */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              id="btn-add-egitmen"
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[40px]"
              title="Yeni Eğitmen Ekle"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Yeni Eğitmen Ekle</span>
            </button>

            <button
              id="btn-egitmen-send-message"
              onClick={() => setShowMessageModal(true)}
              className="bg-sky-500 hover:bg-sky-600 text-white px-3.5 py-2 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[40px]"
              title="Eğitmenlere Toplu / Özel Mesaj Gönder"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                Mesaj Gönder {selectedIds.length > 0 && `(${selectedIds.length})`}
              </span>
            </button>
          </div>

          {/* Right Controls: Search, Status Filter, View Toggle, Export */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60 min-w-[160px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-egitmen"
                type="text"
                placeholder="Eğitmen, unvan, branş ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] cursor-pointer"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktifler</option>
              <option value="leave">İzindekiler</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
                title="Kart Görünümü"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
                title="Liste / Tablo Görünümü"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Export Buttons */}
            <button
              id="btn-egitmen-pdf"
              onClick={handleExportPDF}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer min-h-[40px]"
              title="PDF / Yazdır"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              id="btn-egitmen-excel"
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-2xs cursor-pointer min-h-[40px]"
              title="Excel (CSV) Olarak İndir"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* BATCH SELECTION BAR (If any item is selected) */}
        {selectedIds.length > 0 && (
          <div className="mb-4 p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-900 dark:text-blue-200">
                {selectedIds.length} eğitmen seçildi
              </span>
              <button
                onClick={selectAll}
                className="text-blue-700 dark:text-blue-300 underline font-semibold cursor-pointer"
              >
                {selectedIds.length === filteredEgitmenler.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMessageModal(true)}
                className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>Toplu Mesaj</span>
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW 1: MODERN GRID / CARDS VIEW */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredEgitmenler.map((egitmen) => {
              const isSelected = selectedIds.includes(egitmen.id);
              const branchStyle =
                BRANCH_COLORS[egitmen.branch || 'Futbol'] || {
                  bg: 'bg-slate-100 dark:bg-slate-800',
                  text: 'text-slate-800 dark:text-slate-200',
                  border: 'border-slate-200 dark:border-slate-700',
                };
              const isActive = (egitmen.status || 'Aktif') === 'Aktif';

              return (
                <div
                  key={egitmen.id}
                  onClick={() => setSelectedTrainerDetail(egitmen)}
                  className={`group relative bg-white dark:bg-[#0f172a] rounded-2xl border transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Card Top Banner Accent */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 opacity-80" />

                  <div className="p-4 space-y-3.5">
                    {/* Header Row: Avatar, Info, Selection circle */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar with Status badge */}
                        <div className="relative shrink-0">
                          {egitmen.avatarUrl ? (
                            <img
                              src={egitmen.avatarUrl}
                              alt={egitmen.name}
                              referrerPolicy="no-referrer"
                              className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-xs"
                            />
                          ) : (
                            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
                              {egitmen.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-[#0f172a] ${
                              isActive ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            title={isActive ? 'Aktif Görevde' : 'İzinli / Dinlenmede'}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {egitmen.name}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                            {egitmen.title || `${egitmen.branch || 'Spor'} Antrenörü`}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${branchStyle.bg} ${branchStyle.text} ${branchStyle.border}`}
                            >
                              {egitmen.branch || 'Futbol'}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400">
                              {egitmen.licenseLevel || 'Lisanslı Antrenör'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Select / Checkbox Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(egitmen.id);
                        }}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    </div>

                    {/* Specialties / Tags */}
                    {egitmen.specialties && egitmen.specialties.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {egitmen.specialties.slice(0, 3).map((spec, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          >
                            {spec}
                          </span>
                        ))}
                        {egitmen.specialties.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{egitmen.specialties.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Micro Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-center">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-medium">Gruplar</span>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {egitmen.activeGroupsCount || (egitmen.assignedGroups?.length || 2)} Takım
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-medium">Sporcular</span>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {egitmen.activeAthletesCount || 35} Kişi
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-medium">Haftalık</span>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {egitmen.weeklyHours || 18} Saat
                        </span>
                      </div>
                    </div>

                    {/* Contact & Facility quick info */}
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Telefon:</span>
                        <a
                          href={`tel:${egitmen.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {egitmen.phone}
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Tesis / Kulüp:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                          {egitmen.facility}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="p-3 bg-slate-50/70 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${egitmen.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
                        title="Telefonla Ara"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignTrainingTrainer(egitmen);
                        }}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        title="Antrenman / Seans Ata"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignGroupTrainer(egitmen);
                        }}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        title="Grup / Takım Ata"
                      >
                        <Users className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPdfReportModal({ isOpen: true, mode: 'single', trainer: egitmen });
                        }}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        title="PDF Raporu Al"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(egitmen);
                        }}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrainerDetail(egitmen);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                    >
                      <span>Profili Gör</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 2: PROFESSIONAL TABLE / LIST VIEW */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 select-none bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="py-3 px-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={selectAll}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                        selectedIds.length === filteredEgitmenler.length && filteredEgitmenler.length > 0
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {selectedIds.length === filteredEgitmenler.length && filteredEgitmenler.length > 0 && (
                        <Check className="w-3 h-3 stroke-[3]" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3">Eğitmen / Antrenör</th>
                  <th className="py-3 px-3">Branş &amp; Unvan</th>
                  <th className="py-3 px-3">İletişim</th>
                  <th className="py-3 px-3">Kulüp &amp; Tesis</th>
                  <th className="py-3 px-3 text-center">Gruplar / Yük</th>
                  <th className="py-3 px-3 text-center">Durum</th>
                  <th className="py-3 px-3 text-right pr-4">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredEgitmenler.map((egitmen) => {
                  const isSelected = selectedIds.includes(egitmen.id);
                  const branchStyle =
                    BRANCH_COLORS[egitmen.branch || 'Futbol'] || {
                      bg: 'bg-slate-100 dark:bg-slate-800',
                      text: 'text-slate-800 dark:text-slate-200',
                      border: 'border-slate-200 dark:border-slate-700',
                    };
                  const isActive = (egitmen.status || 'Aktif') === 'Aktif';

                  return (
                    <tr
                      key={egitmen.id}
                      onClick={() => setSelectedTrainerDetail(egitmen)}
                      className={`transition-colors group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer ${
                        isSelected ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3.5 px-3 text-center align-middle"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelect(egitmen.id);
                        }}
                      >
                        <button
                          type="button"
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      </td>

                      {/* Trainer Avatar & Name */}
                      <td className="py-3.5 px-3 align-middle">
                        <div className="flex items-center gap-3">
                          {egitmen.avatarUrl ? (
                            <img
                              src={egitmen.avatarUrl}
                              alt={egitmen.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {egitmen.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {egitmen.name}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              Kod: {egitmen.code}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Branch & Title */}
                      <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border ${branchStyle.bg} ${branchStyle.text} ${branchStyle.border}`}
                          >
                            {egitmen.branch || 'Futbol'}
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate max-w-[180px]">
                            {egitmen.title || `${egitmen.branch} Antrenörü`}
                          </p>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-3 align-middle text-xs whitespace-nowrap">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {egitmen.phone}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">{egitmen.email}</div>
                      </td>

                      {/* Facility */}
                      <td className="py-3.5 px-3 align-middle text-xs text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        <div className="font-semibold">{egitmen.facility}</div>
                        <div className="text-slate-400">{egitmen.city || 'İstanbul'}</div>
                      </td>

                      {/* Groups & Weekly Load */}
                      <td className="py-3.5 px-3 align-middle text-center whitespace-nowrap text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {egitmen.activeGroupsCount || 2} Grup
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {egitmen.weeklyHours || 18} Saat/Hafta
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 align-middle text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{egitmen.status || 'Aktif'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 pr-4 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssignTrainingTrainer(egitmen);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Antrenman / Seans Ata"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssignGroupTrainer(egitmen);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Grup / Takım Ata"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPdfReportModal({ isOpen: true, mode: 'single', trainer: egitmen });
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="PDF Raporu Al"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(egitmen);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTrainerDetail(egitmen);
                            }}
                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer font-bold text-xs flex items-center gap-1"
                            title="Detaylı Profil"
                          >
                            <span>Detay</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {filteredEgitmenler.length === 0 && (
          <div className="py-14 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Search className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Arama kriterlerine uygun eğitmen bulunamadı.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Filtreleri veya arama kelimesini sıfırlayarak tekrar listeleyebilirsiniz.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setStatusFilter('all');
              }}
              className="mt-3 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Filtreleri Temizle
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <span>Toplam {filteredEgitmenler.length} profesyonel eğitmen listeleniyor</span>
          <div className="flex items-center gap-2 font-medium">
            <SportsFlyIcon className="w-3.5 h-3.5" />
            <span>SportsFly Antrenör &amp; Akademi Portalı</span>
          </div>
        </div>
      </div>

      {/* DETAILED TRAINER PROFILE DRAWER / MODAL */}
      {selectedTrainerDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Top Banner & Header */}
            <div className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 text-white shrink-0">
              <button
                onClick={() => setSelectedTrainerDetail(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {selectedTrainerDetail.avatarUrl ? (
                    <img
                      src={selectedTrainerDetail.avatarUrl}
                      alt={selectedTrainerDetail.name}
                      referrerPolicy="no-referrer"
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
                    />
                  ) : (
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl ring-4 ring-white/20 shadow-lg">
                      {selectedTrainerDetail.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        {selectedTrainerDetail.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/30 text-blue-200 border border-blue-400/40">
                        {selectedTrainerDetail.branch || 'Futbol'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {selectedTrainerDetail.status || 'Aktif'}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 font-medium">
                      {selectedTrainerDetail.title || `${selectedTrainerDetail.branch} Antrenörü`}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap pt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        Kod: {selectedTrainerDetail.code}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" />
                        {selectedTrainerDetail.facility}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <Award className="w-3.5 h-3.5 text-emerald-400" />
                        {selectedTrainerDetail.licenseLevel || 'Federasyon Lisansı'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons in Header */}
                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setPdfReportModal({ isOpen: true, mode: 'single', trainer: selectedTrainerDetail });
                    }}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    title="Bu Eğitmenin PDF Raporunu Al"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF Rapor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignGroupTrainer(selectedTrainerDetail);
                    }}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Grup / Takım Ata"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>Grup Ata</span>
                  </button>
                  <a
                    href={`tel:${selectedTrainerDetail.phone}`}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ara</span>
                  </a>
                  <button
                    onClick={() => {
                      handleOpenEdit(selectedTrainerDetail);
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Profili Düzenle</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Tabs Navigation */}
            <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => setDetailTab('genel')}
                className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  detailTab === 'genel'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Genel Bakış &amp; Biyografi
              </button>

              <button
                onClick={() => setDetailTab('gruplar')}
                className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  detailTab === 'gruplar'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>Sorumlu Gruplar</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold">
                  {selectedTrainerDetail.assignedGroups?.length || selectedTrainerDetail.activeGroupsCount || 2}
                </span>
              </button>

              <button
                onClick={() => setDetailTab('takvim')}
                className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  detailTab === 'takvim'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>Randevu &amp; Ders Takvimi</span>
                {selectedTrainerDetail.appointments && selectedTrainerDetail.appointments.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-extrabold">
                    {selectedTrainerDetail.appointments.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setDetailTab('belgeler')}
                className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  detailTab === 'belgeler'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>Sertifika &amp; Belgeler</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold">
                  {selectedTrainerDetail.documents?.length || 2}
                </span>
              </button>

              <button
                onClick={() => setDetailTab('performans')}
                className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  detailTab === 'performans'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Performans &amp; Puanlar
              </button>
            </div>

            {/* Tab Content Area (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: GENEL BAKIŞ */}
              {detailTab === 'genel' && (
                <div className="space-y-6">
                  {/* Bio block */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Antrenör Biyografisi &amp; Yaklaşımı
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {selectedTrainerDetail.bio ||
                        'Kulüp altyapısında sporcuların temel teknik, taktik ve zihinsel gelişimini destekleyen deneyimli antrenör.'}
                    </p>

                    {/* Specialties */}
                    {selectedTrainerDetail.specialties && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-500">Uzmanlık Alanları:</span>
                        {selectedTrainerDetail.specialties.map((spec, i) => (
                          <span
                            key={i}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2-Column Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Lisans ve Mesleki Detaylar */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span>Lisans &amp; Mesleki Bilgiler</span>
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-400 font-medium">Lisans Düzeyi:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {selectedTrainerDetail.licenseLevel || 'Federasyon Onaylı Başantrenör'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-400 font-medium">Mesleki Deneyim:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {selectedTrainerDetail.experienceYears || 6} Yıl
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-400 font-medium">Katılım / Başlangıç:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {selectedTrainerDetail.joinDate || '12.01.2022'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-400 font-medium">Hesap Yetki Süresi:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {selectedTrainerDetail.accountDuration || 'Sınırsız'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400 font-medium">Saatlik Özel Seans Ücreti:</span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">
                            {selectedTrainerDetail.hourlyRate || 650} ₺ / Saat
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: İletişim & Konum Bilgileri */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>İletişim &amp; Adres Bilgileri</span>
                      </h4>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-400 font-medium">Telefon:</span>
                          <a
                            href={`tel:${selectedTrainerDetail.phone}`}
                            className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {selectedTrainerDetail.phone}
                          </a>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-400 font-medium">E-Posta:</span>
                          <a
                            href={`mailto:${selectedTrainerDetail.email}`}
                            className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {selectedTrainerDetail.email}
                          </a>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-400 font-medium">Şehir / İlçe:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {selectedTrainerDetail.city || 'İstanbul'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                          <span className="text-slate-400 font-medium">Cinsiyet:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {selectedTrainerDetail.gender || 'Erkek'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400 font-medium">Adres:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300 text-right truncate max-w-[180px]">
                            {selectedTrainerDetail.address || 'Kulüp Ana Yerleşkesi'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SORUMLU GRUPLAR */}
              {detailTab === 'gruplar' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Sorumlu Olduğu Takımlar &amp; Gruplar
                      </h4>
                      <p className="text-xs text-slate-400">
                        Eğitmenin aktif olarak antrenman yaptırdığı akademi yaş grupları ve takımları
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAssignGroupTrainer(selectedTrainerDetail)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Grup Ata / Düzenle</span>
                      </button>
                    </div>
                  </div>

                  {selectedTrainerDetail.assignedGroups && selectedTrainerDetail.assignedGroups.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {selectedTrainerDetail.assignedGroups.map((grp, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 shadow-2xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                <Users className="w-5 h-5" />
                              </div>
                              <div>
                                <h5 className="font-bold text-sm text-slate-900 dark:text-white">{grp}</h5>
                                <p className="text-xs text-slate-400">{selectedTrainerDetail.branch || 'Spor'} Branşı</p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                              Aktif Sezon
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Sporcu Mevcudu:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {Math.round((selectedTrainerDetail.activeAthletesCount || 24) / Math.max(1, selectedTrainerDetail.assignedGroups?.length || 1))} Sporcu
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Antrenman:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">Haftada 3 Gün</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                      <Users className="w-8 h-8 text-slate-300 mx-auto" />
                      <div>
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                          Bu eğitmene henüz grup atanmamış.
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Eğitmeni takım ve yaş gruplarına atamak için butona tıklayınız.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAssignGroupTrainer(selectedTrainerDetail)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Grup / Takım Ata</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: TAKVİM & RANDEVULAR */}
              {detailTab === 'takvim' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Ders &amp; Özel Randevu Programı
                      </h4>
                      <p className="text-xs text-slate-400">
                        Bireysel gelişim seansları ve planlanmış antrenman randevuları
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAssignTrainingTrainer(selectedTrainerDetail)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Antrenman / Seans Ata</span>
                      </button>
                    </div>
                  </div>

                  {selectedTrainerDetail.appointments && selectedTrainerDetail.appointments.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedTrainerDetail.appointments.map((app) => (
                        <div
                          key={app.id}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                                {app.title}
                              </h5>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Sporcu: <strong className="text-slate-800 dark:text-slate-200">{app.student}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-right text-xs">
                              <span className="font-bold text-slate-900 dark:text-white block">{app.date}</span>
                              <span className="text-slate-400 font-mono text-[11px]">{app.time}</span>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {app.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                      <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                      <div>
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                          Kayıtlı aktif bireysel randevu bulunmuyor.
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Yeni bir gelişim seansı eklemek için butona tıklayabilirsiniz.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAssignTrainingTrainer(selectedTrainerDetail)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Antrenman / Seans Ata</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: BELGELER & SERTİFİKALAR */}
              {detailTab === 'belgeler' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Sertifikalar, Sözleşmeler &amp; Belgeler
                      </h4>
                      <p className="text-xs text-slate-400">
                        Resmi federasyon antrenör lisansları, sağlık raporları ve kulüp sözleşmeleri
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddDocumentTrainer(selectedTrainerDetail)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Belge / Sertifika Ekle</span>
                    </button>
                  </div>

                  {selectedTrainerDetail.documents && selectedTrainerDetail.documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedTrainerDetail.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {doc.name}
                              </h5>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.type}</span> • {doc.size || '1.5 MB'} • {doc.date}
                              </p>
                              {doc.issuer && (
                                <p className="text-[10px] text-blue-600 dark:text-blue-400 truncate mt-0.5">
                                  Kurum: {doc.issuer}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewDocument({
                                  trainerName: selectedTrainerDetail.name,
                                  document: doc,
                                })
                              }
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Belgeyi Önizle"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadDocument(doc)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
                              title="Belgeyi İndir"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(selectedTrainerDetail.id, doc.id)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Belgeyi Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <div>
                        <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                          Kayıtlı lisans veya sertifika belgesi bulunmuyor.
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Antrenör sözleşmesi veya federasyon lisansını sisteme ekleyebilirsiniz.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAddDocumentTrainer(selectedTrainerDetail)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Sertifika / Belge Yükle</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PERFORMANS & PUANLAR */}
              {detailTab === 'performans' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-xs text-slate-400 font-bold block">Toplam Verilen Sporpuan</span>
                      <span className="text-2xl font-black text-amber-500 mt-1 block">+1,450 SP</span>
                      <span className="text-[10px] text-slate-400">Sporculara dağıtılan motivasyon ödülü</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-xs text-slate-400 font-bold block">Yoklama &amp; Devam Oranı</span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">%96.8</span>
                      <span className="text-[10px] text-slate-400">Sezonluk ders katılım ortalaması</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-xs text-slate-400 font-bold block">Tamamlanan Seans</span>
                      <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">48 Seans</span>
                      <span className="text-[10px] text-slate-400">Bu sezon gerçekleştirilen ders</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 space-y-3">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Son Değerlendirme &amp; Gözlem Notları
                    </h5>
                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 dark:text-white">U12 Futbol Taktik Gelişimi</span>
                          <span className="text-slate-400 text-[10px]">10.09.2024</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                          Takım pas kombinasyonları ve savunma yerleşiminde %25 hızlanma sağlandı.
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 dark:text-white">Bireysel Motivasyon &amp; Sporpuan</span>
                          <span className="text-slate-400 text-[10px]">04.09.2024</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                          Fair-play ve haftalık tam devam kategorilerinde 12 sporcuya başarı puanı tanımlandı.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedTrainerDetail(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                Kapat
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPdfReportModal({ isOpen: true, mode: 'single', trainer: selectedTrainerDetail })}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF Raporu Al</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssignGroupTrainer(selectedTrainerDetail)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Grup Ata</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddDocumentTrainer(selectedTrainerDetail)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Belge Ekle</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(selectedTrainerDetail);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Bilgileri Düzenle</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TRAINER MODAL */}
      {editingEgitmen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Eğitmen Bilgilerini Düzenle
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingEgitmen.name} • Kod: {editingEgitmen.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingEgitmen(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ad Soyad */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Unvan / Pozisyon */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unvan / Antrenörlük Pozisyonu
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Örn: UEFA B Lisanslı Başantrenör"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Telefon */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Telefon *
                  </label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    E-Posta Adresi *
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Branş (Eğitmen Kategorisi) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Branş / Kategori
                  </label>
                  <select
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Durum */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Çalışma Durumu
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Aktif">Aktif Görevde</option>
                    <option value="İzinli">İzinli / Dinlenmede</option>
                    <option value="Ayrıldı">Ayrıldı / Pasif</option>
                  </select>
                </div>

                {/* Deneyim Yılı */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Deneyim (Yıl)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={editExperienceYears}
                    onChange={(e) => setEditExperienceYears(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Lisans & Sertifika */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lisans / Federasyon Yetki Belgesi
                </label>
                <input
                  type="text"
                  value={editLicenseLevel}
                  onChange={(e) => setEditLicenseLevel(e.target.value)}
                  placeholder="Örn: UEFA-B Lisans (TFF No: 54109)"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Biyografi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Antrenör Biyografisi &amp; Özgeçmiş
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Şehir & Adres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Şehir
                  </label>
                  <select
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {TURKEY_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Saatlik Özel Ders Ücreti (₺)
                  </label>
                  <input
                    type="number"
                    value={editHourlyRate}
                    onChange={(e) => setEditHourlyRate(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Checkboxes: SMS & Email Notification Permissions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={editMailEnabled}
                    onChange={(e) => setEditMailEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>E-Posta Bildirimleri Açık</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={editSmsEnabled}
                    onChange={(e) => setEditSmsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>SMS Bildirimleri Açık</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingEgitmen(null)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Değişiklikleri Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW TRAINER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Yeni Eğitmen / Antrenör Kaydı
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kulüp bünyesine yeni antrenör ekleyin ve yetkilendirin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Ahmet Yılmaz"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unvan / Pozisyon
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: UEFA B Lisanslı Başantrenör"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    E-Posta Adresi *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ornek@kulup.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Telefon Numarası *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Branş / Kategori
                  </label>
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kulüp / Tesis
                  </label>
                  <input
                    type="text"
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Deneyim (Yıl)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newExp}
                    onChange={(e) => setNewExp(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kısa Biyografi &amp; Uzmanlık Notu
                </label>
                <textarea
                  rows={2}
                  placeholder="Antrenörün geçmiş kariyeri ve uzmanlık alanları..."
                  value={newBio}
                  onChange={(e) => setNewBio(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Eğitmeni Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY / BRANCH MANAGEMENT MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Eğitmen Branş Kategorileri
                </h3>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add Category Form */}
            <form onSubmit={handleAddCategory} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Yeni branş / kategori adı..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ekle</span>
              </button>
            </form>

            {/* Existing Categories List */}
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const count = egitmenler.filter((e) => e.branch === cat).length;
                return (
                  <div
                    key={cat}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{cat}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {count} Eğitmen
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEND MESSAGE MODAL */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-sky-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Eğitmen Kadrosuna Mesaj Gönder
                </h3>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMessageSubmit} className="mt-4 space-y-3.5">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
                Alıcı Hedefi:{' '}
                <strong>
                  {selectedIds.length > 0
                    ? `${selectedIds.length} Seçili Eğitmen`
                    : `Tüm Filtrelenmiş Eğitmenler (${filteredEgitmenler.length})`}
                </strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  İletim Kanalı
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMessageChannel('both')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      messageChannel === 'both'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    SMS &amp; E-Posta
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageChannel('sms')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      messageChannel === 'sms'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Yalnızca SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageChannel('email')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      messageChannel === 'email'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Yalnızca E-Posta
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mesaj Başlığı / Konu
                </label>
                <input
                  type="text"
                  placeholder="Örn: Hafta Sonu Antrenman Takvimi Bilgilendirmesi"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mesaj Metni *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Eğitmen kadrosuna iletmek istediğiniz mesaj içeriğini yazınız..."
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Mesajı Gönder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Trainer Assign Training Modal */}
      {assignTrainingTrainer && (
        <TrainerAssignTrainingModal
          isOpen={!!assignTrainingTrainer}
          trainer={assignTrainingTrainer}
          onClose={() => setAssignTrainingTrainer(null)}
          onAssignTraining={handleAssignTraining}
          onToast={showToast}
        />
      )}

      {/* 2. Trainer Assign Group Modal */}
      {assignGroupTrainer && (
        <TrainerAssignGroupModal
          trainer={assignGroupTrainer}
          onClose={() => setAssignGroupTrainer(null)}
          onSaveGroups={handleSaveGroups}
          onToast={showToast}
        />
      )}

      {/* 3. Trainer Add Document / Certificate Modal */}
      {addDocumentTrainer && (
        <TrainerAddDocumentModal
          trainer={addDocumentTrainer}
          onClose={() => setAddDocumentTrainer(null)}
          onAddDocument={handleAddDocument}
          onToast={showToast}
        />
      )}

      {/* 4. Trainer Document Preview Modal */}
      {previewDocument && (
        <TrainerDocumentPreviewModal
          trainerName={previewDocument.trainerName}
          document={previewDocument.document}
          onClose={() => setPreviewDocument(null)}
          onDownload={handleDownloadDocument}
        />
      )}

      {/* 5. Trainer PDF Report Modal (Single or Full Catalog) */}
      <TrainerPdfReportModal
        isOpen={pdfReportModal.isOpen}
        onClose={() => setPdfReportModal({ isOpen: false, mode: 'all', trainer: null })}
        mode={pdfReportModal.mode}
        trainers={egitmenler}
        singleTrainer={pdfReportModal.trainer}
        onToast={showToast}
      />
    </div>
  );
};
