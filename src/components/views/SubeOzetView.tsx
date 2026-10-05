import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  PieChart,
  BarChart3,
  Layers,
  X,
  CreditCard,
  ShieldCheck,
  Check,
  ExternalLink,
} from 'lucide-react';
import { NavPage } from '../../types';
import {
  Sube,
  getStoredSubeler,
  getActiveSubeId,
  setActiveSubeId,
} from '../../data/subeData';
import {
  SubeSporcu,
  SubeEgitmen,
  SubeGelirGiderItem,
  getStoredSubeSporcular,
  saveStoredSubeSporcular,
  getStoredSubeEgitmenler,
  saveStoredSubeEgitmenler,
  getStoredSubeGelirGider,
  saveStoredSubeGelirGider,
  SUBE_MONTHLY_TRENDS,
} from '../../data/subeOzetData';
import { jsPDF } from 'jspdf';

interface SubeOzetViewProps {
  onNavigate?: (page: NavPage) => void;
}

type TabType = 'genel' | 'sporcular' | 'egitmenler' | 'finans' | 'kiyaslama';

export const SubeOzetView: React.FC<SubeOzetViewProps> = ({ onNavigate }) => {
  // Master data state
  const [subeler, setSubeler] = useState<Sube[]>(() => getStoredSubeler());
  const [activeBranchId, setActiveBranchId] = useState<string>(() => getActiveSubeId());
  const [sporcular, setSporcular] = useState<SubeSporcu[]>(() => getStoredSubeSporcular());
  const [egitmenler, setEgitmenler] = useState<SubeEgitmen[]>(() => getStoredSubeEgitmenler());
  const [hareketler, setHareketler] = useState<SubeGelirGiderItem[]>(() => getStoredSubeGelirGider());

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('genel');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [branchSportFilter, setBranchSportFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'Gelir' | 'Gider'>('all');

  // Modal: Add Transaction
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [newTxType, setNewTxType] = useState<'Gelir' | 'Gider'>('Gelir');
  const [newTxTitle, setNewTxTitle] = useState('');
  const [newTxCategory, setNewTxCategory] = useState('Aylık Sporcu Aidatları');
  const [newTxAmount, setNewTxAmount] = useState<number | ''>(3500);
  const [newTxPayer, setNewTxPayer] = useState('');
  const [newTxMethod, setNewTxMethod] = useState<'Kredi Kartı' | 'Havale/EFT' | 'Nakit' | 'POS'>('Kredi Kartı');

  // Modal: Add Athlete
  const [isAddAthleteModalOpen, setIsAddAthleteModalOpen] = useState(false);
  const [newAthName, setNewAthName] = useState('');
  const [newAthBranch, setNewAthBranch] = useState('Basketbol');
  const [newAthGroup, setNewAthGroup] = useState('Gelişim Grubu');
  const [newAthFee, setNewAthFee] = useState<number | ''>(3500);
  const [newAthParent, setNewAthParent] = useState('');
  const [newAthPhone, setNewAthPhone] = useState('+90 532 ');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Listen to cross-window or header branch changes
  useEffect(() => {
    const handleActiveChange = (e: any) => {
      if (e.detail) {
        setActiveBranchId(e.detail);
      }
    };
    const handleSubelerChange = (e: any) => {
      if (e.detail) {
        setSubeler(e.detail);
      }
    };
    const handleDataChange = () => {
      setSporcular(getStoredSubeSporcular());
      setEgitmenler(getStoredSubeEgitmenler());
      setHareketler(getStoredSubeGelirGider());
    };

    window.addEventListener('sportsfly_active_sube_changed', handleActiveChange);
    window.addEventListener('sportsfly_subeler_updated', handleSubelerChange);
    window.addEventListener('sportsfly_sube_data_changed', handleDataChange);

    return () => {
      window.removeEventListener('sportsfly_active_sube_changed', handleActiveChange);
      window.removeEventListener('sportsfly_subeler_updated', handleSubelerChange);
      window.removeEventListener('sportsfly_sube_data_changed', handleDataChange);
    };
  }, []);

  // Handle branch switch
  const handleBranchSelect = (id: string) => {
    setActiveBranchId(id);
    setActiveSubeId(id);
    const targetBranch = subeler.find((s) => s.id === id);
    showToast(
      id === 'all'
        ? 'Tüm kulüp şubeleri konsolide özeti yüklendi'
        : `"${targetBranch?.ad || 'Seçilen Şube'}" özet verileri yüklendi`
    );
  };

  // Selected Branch Object
  const currentBranch = useMemo(() => {
    if (activeBranchId === 'all') return null;
    return subeler.find((s) => s.id === activeBranchId) || null;
  }, [subeler, activeBranchId]);

  // Filtered Athletes by branch
  const filteredAthletes = useMemo(() => {
    return sporcular.filter((a) => {
      const matchBranch = activeBranchId === 'all' || a.subeId === activeBranchId;
      const matchSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.group.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSport = branchSportFilter === 'all' || a.branch === branchSportFilter;
      const matchPayment = paymentStatusFilter === 'all' || a.paymentStatus === paymentStatusFilter;

      return matchBranch && matchSearch && matchSport && matchPayment;
    });
  }, [sporcular, activeBranchId, searchQuery, branchSportFilter, paymentStatusFilter]);

  // Filtered Instructors by branch
  const filteredInstructors = useMemo(() => {
    return egitmenler.filter((e) => {
      return activeBranchId === 'all' || e.subeId === activeBranchId;
    });
  }, [egitmenler, activeBranchId]);

  // Filtered Transactions by branch
  const filteredTransactions = useMemo(() => {
    return hareketler.filter((tx) => {
      const matchBranch = activeBranchId === 'all' || tx.subeId === activeBranchId;
      const matchType = txTypeFilter === 'all' || tx.type === txTypeFilter;
      const matchSearch =
        tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.payerOrPayee.toLowerCase().includes(searchQuery.toLowerCase());

      return matchBranch && matchType && matchSearch;
    });
  }, [hareketler, activeBranchId, txTypeFilter, searchQuery]);

  // Branch-specific Metrics calculation
  const branchMetrics = useMemo(() => {
    const rawAthletes = activeBranchId === 'all'
      ? sporcular
      : sporcular.filter((a) => a.subeId === activeBranchId);

    const rawInstructors = activeBranchId === 'all'
      ? egitmenler
      : egitmenler.filter((e) => e.subeId === activeBranchId);

    const rawTxs = activeBranchId === 'all'
      ? hareketler
      : hareketler.filter((tx) => tx.subeId === activeBranchId);

    const totalIncome = rawTxs
      .filter((t) => t.type === 'Gelir' && t.status === 'Tamamlandı')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = rawTxs
      .filter((t) => t.type === 'Gider' && t.status === 'Tamamlandı')
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

    // Athlete fee calculations
    const paidAthletes = rawAthletes.filter((a) => a.paymentStatus === 'Ödendi').length;
    const pendingAthletes = rawAthletes.filter((a) => a.paymentStatus === 'Bekliyor').length;
    const overdueAthletes = rawAthletes.filter((a) => a.paymentStatus === 'Gecikti').length;

    const pendingAmount = rawAthletes
      .filter((a) => a.paymentStatus !== 'Ödendi')
      .reduce((sum, a) => sum + a.monthlyFee, 0);

    const avgAttendance = rawAthletes.length > 0
      ? Math.round(rawAthletes.reduce((sum, a) => sum + a.attendanceRate, 0) / rawAthletes.length)
      : 0;

    // Capacity calculation
    let capacity = 0;
    if (activeBranchId === 'all') {
      capacity = subeler.reduce((acc, s) => acc + s.kapasite, 0);
    } else {
      capacity = currentBranch?.kapasite || 50;
    }
    const occupancyRate = capacity > 0 ? Math.round((rawAthletes.length / capacity) * 100) : 0;

    // Weekly sessions
    const totalWeeklySessions = rawInstructors.reduce((acc, e) => acc + e.weeklySessions, 0);

    return {
      athleteCount: rawAthletes.length,
      paidAthletes,
      pendingAthletes,
      overdueAthletes,
      pendingAmount,
      avgAttendance,
      instructorCount: rawInstructors.length,
      totalWeeklySessions,
      totalIncome,
      totalExpense,
      netProfit,
      profitMargin,
      capacity,
      occupancyRate,
    };
  }, [activeBranchId, sporcular, egitmenler, hareketler, subeler, currentBranch]);

  // Sport distribution breakdown
  const sportDistribution = useMemo(() => {
    const list = activeBranchId === 'all'
      ? sporcular
      : sporcular.filter((a) => a.subeId === activeBranchId);

    const counts: Record<string, number> = {};
    list.forEach((a) => {
      counts[a.branch] = (counts[a.branch] || 0) + 1;
    });

    const total = list.length || 1;
    return Object.entries(counts).map(([sport, count]) => ({
      sport,
      count,
      percent: Math.round((count / total) * 100),
    }));
  }, [activeBranchId, sporcular]);

  // Trend data for current branch
  const monthlyTrend = useMemo(() => {
    if (activeBranchId !== 'all' && SUBE_MONTHLY_TRENDS[activeBranchId]) {
      return SUBE_MONTHLY_TRENDS[activeBranchId];
    }
    // Consolidated aggregate for 'all'
    const months = ['Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül (Anlık)'];
    return months.map((m, idx) => {
      let g = 0;
      let exp = 0;
      let sp = 0;
      Object.values(SUBE_MONTHLY_TRENDS).forEach((trendList) => {
        if (trendList[idx]) {
          g += trendList[idx].gelir;
          exp += trendList[idx].gider;
          sp += trendList[idx].sporcuSayisi;
        }
      });
      return {
        month: m,
        gelir: g,
        gider: exp,
        netKar: g - exp,
        sporcuSayisi: sp,
      };
    });
  }, [activeBranchId]);

  // Add Transaction Handler
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxTitle.trim() || !newTxAmount) {
      showToast('Lütfen başlık ve tutar giriniz');
      return;
    }

    const branchIdToUse = activeBranchId === 'all' ? subeler[0]?.id || 'sube-kadikoy' : activeBranchId;

    const newTx: SubeGelirGiderItem = {
      id: `tx-custom-${Date.now()}`,
      subeId: branchIdToUse,
      type: newTxType,
      title: newTxTitle.trim(),
      category: newTxCategory,
      amount: Number(newTxAmount),
      date: new Date().toLocaleDateString('tr-TR'),
      status: 'Tamamlandı',
      paymentMethod: newTxMethod,
      payerOrPayee: newTxPayer.trim() || 'Kulüp Üyesi / Şube',
      description: 'Yönetici tarafından doğrudan işlendi',
    };

    const updated = [newTx, ...hareketler];
    setHareketler(updated);
    saveStoredSubeGelirGider(updated);
    setIsAddTxModalOpen(false);
    setNewTxTitle('');
    setNewTxPayer('');
    showToast(`✓ ${newTxType === 'Gelir' ? 'Gelir' : 'Gider'} kaydı başarıyla eklendi.`);
  };

  // Add Athlete Handler
  const handleSaveAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAthName.trim()) {
      showToast('Lütfen sporcu adını giriniz');
      return;
    }

    const branchIdToUse = activeBranchId === 'all' ? subeler[0]?.id || 'sube-kadikoy' : activeBranchId;

    const newAth: SubeSporcu = {
      id: `sp-custom-${Date.now()}`,
      subeId: branchIdToUse,
      name: newAthName.trim(),
      code: `${Math.floor(100000 + Math.random() * 900000)}`,
      branch: newAthBranch,
      group: newAthGroup.trim() || 'Temel Eğitim Grubu',
      parentName: newAthParent.trim() || 'Veli Belirtilmedi',
      parentPhone: newAthPhone.trim(),
      monthlyFee: Number(newAthFee) || 3500,
      paymentStatus: 'Ödendi',
      attendanceRate: 100,
      status: 'Aktif',
      registeredAt: new Date().toLocaleDateString('tr-TR'),
    };

    const updated = [newAth, ...sporcular];
    setSporcular(updated);
    saveStoredSubeSporcular(updated);
    setIsAddAthleteModalOpen(false);
    setNewAthName('');
    setNewAthParent('');
    showToast(`✓ "${newAth.name}" seçilen şubeye başarıyla kaydedildi.`);
  };

  // Export PDF Summary Report
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const branchTitle = currentBranch ? currentBranch.ad : 'Tüm Kulüp Şubeleri (Konsolide)';

      doc.setFontSize(18);
      doc.setTextColor(30, 41, 59);
      doc.text('SPORTSFLY KULUP VE TESIS YONETIMI', 14, 20);

      doc.setFontSize(13);
      doc.setTextColor(37, 99, 235);
      doc.text(`Sube Performans ve Finans Ozeti: ${branchTitle}`, 14, 28);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')} | Hazirlayan: SportsFly Yonetim Paneli`, 14, 34);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 38, 196, 38);

      // Section: Key Metrics
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('1. TEMEL PERFORMANS GOSTERGELERI (KPI)', 14, 46);

      doc.setFontSize(10);
      doc.text(`Toplam Sporcu Sayisi: ${branchMetrics.athleteCount}`, 16, 54);
      doc.text(`Aktif Egitmen Sayisi: ${branchMetrics.instructorCount}`, 16, 61);
      doc.text(`Haftalik Antrenman Seansi: ${branchMetrics.totalWeeklySessions} Seans`, 16, 68);
      doc.text(`Tesis Doluluk Orani: %${branchMetrics.occupancyRate} (${branchMetrics.athleteCount} / ${branchMetrics.capacity})`, 16, 75);
      doc.text(`Ortalama Devam Orani: %${branchMetrics.avgAttendance}`, 16, 82);

      // Section: Financials
      doc.setFontSize(11);
      doc.text('2. AYLIK FINANSAL AKIS VE TAHSIILAT DURUMU', 14, 94);

      doc.setFontSize(10);
      doc.text(`Toplam Tahsil Edilen Gelir: ${branchMetrics.totalIncome.toLocaleString('tr-TR')} TL`, 16, 102);
      doc.text(`Toplam Tesis ve Maas Gideri: ${branchMetrics.totalExpense.toLocaleString('tr-TR')} TL`, 16, 109);
      doc.text(`Net Kasa Bakiyesi / Kar: ${branchMetrics.netProfit.toLocaleString('tr-TR')} TL (%${branchMetrics.profitMargin})`, 16, 116);
      doc.text(`Bekleyen Aidat Alacagi: ${branchMetrics.pendingAmount.toLocaleString('tr-TR')} TL (${branchMetrics.pendingAthletes + branchMetrics.overdueAthletes} Sporcu)`, 16, 123);

      // Section: Athlete List Preview
      doc.setFontSize(11);
      doc.text('3. SUBE SPORCU KADROSU (ILK 10 KAYIT)', 14, 135);

      let yPos = 144;
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Sporcu Adi', 16, yPos);
      doc.text('Brans', 70, yPos);
      doc.text('Grup', 105, yPos);
      doc.text('Aidat Tutari', 150, yPos);
      doc.text('Durum', 178, yPos);
      doc.line(14, yPos + 2, 196, yPos + 2);

      yPos += 7;
      filteredAthletes.slice(0, 10).forEach((ath) => {
        doc.text(ath.name, 16, yPos);
        doc.text(ath.branch, 70, yPos);
        doc.text(ath.group.slice(0, 20), 105, yPos);
        doc.text(`${ath.monthlyFee} TL`, 150, yPos);
        doc.text(ath.paymentStatus, 178, yPos);
        yPos += 6;
      });

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('SportsFly Kurumsal Yonetim Sistemi tarafindan otomatik olusturulmustur.', 14, 285);

      doc.save(`SportsFly_${branchTitle.replace(/\s+/g, '_')}_Ozet_Raporu.pdf`);
      showToast('✓ Şube Özet PDF Raporu başarıyla indirildi.');
    } catch (err) {
      console.error('PDF oluşturulurken hata:', err);
      showToast('PDF oluşturulurken bir hata oluştu');
    }
  };

  // Export Excel CSV
  const handleExportCSV = () => {
    const branchTitle = currentBranch ? currentBranch.ad : 'Tum_Subeler_Konsolide';
    let csv = `Sporcu Adi,Sube,Brans,Grup,Veli,Telefon,Aylik Aidat,Odeme Durumu,Devam Orani\n`;
    filteredAthletes.forEach((a) => {
      const sName = subeler.find((s) => s.id === a.subeId)?.ad || 'Şube';
      csv += `"${a.name}","${sName}","${a.branch}","${a.group}","${a.parentName}","${a.parentPhone}",${a.monthlyFee},"${a.paymentStatus}",%${a.attendanceRate}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SportsFly_${branchTitle}_Sporcu_Listesi.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Şube sporcu ve aidat verileri CSV/Excel olarak indirildi.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Interactive Branch Switcher Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60">
                <Building2 className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Kulüp Yöneticisi Konsolu
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Şube Özet & Performans Paneli</span>
              {currentBranch && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100/70 text-blue-800 font-mono">
                  {currentBranch.kod}
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl font-medium">
              Kulübünüze bağlı şubelerin sporcu mevcudunu, eğitmen dağılımını, aylık aidat tahsilatlarını
              ve net kar/zarar akışını anlık olarak tek ekranda filtreleyin ve yönetin.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
            <button
              onClick={handleExportPDF}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Şube Özet Raporunu PDF Olarak İndir"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Rapor İndir</span> (PDF)
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Sporcu ve Finans Verilerini Excel Olarak İndir"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            <button
              onClick={() => setIsAddTxModalOpen(true)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tahsilat / Gider Ekle</span>
            </button>

            <button
              onClick={() => setIsAddAthleteModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Şubeye Sporcu Ekle</span>
            </button>
          </div>
        </div>

        {/* Real-time Branch Switcher Pills */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            <span className="text-xs font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              Aktif Şube Filtresi:
            </span>

            <button
              onClick={() => handleBranchSelect('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeBranchId === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tüm Şubeler (Konsolide)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 text-white font-mono">
                {subeler.length}
              </span>
            </button>

            {subeler.map((sube) => {
              const isSelected = activeBranchId === sube.id;
              return (
                <button
                  key={sube.id}
                  onClick={() => handleBranchSelect(sube.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-emerald-300' : 'bg-emerald-500'
                    }`}
                  />
                  <span>{sube.ad}</span>
                  <span
                    className={`text-[10px] font-mono px-1 rounded ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {sube.kod}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5 Real-Time KPI Cards for Selected Branch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Sporcular */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Kayıtlı Sporcular
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{branchMetrics.athleteCount}</span>
              <span className="text-xs font-bold text-emerald-600">
                %{branchMetrics.avgAttendance} Devam
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {branchMetrics.paidAthletes} Ödendi • {branchMetrics.pendingAthletes + branchMetrics.overdueAthletes} Bekleyen
            </p>
          </div>
        </div>

        {/* Card 2: Eğitmen Kadrosu */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Eğitmen Kadrosu
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{branchMetrics.instructorCount}</span>
              <span className="text-xs font-bold text-purple-600">Antrenör</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Haftalık {branchMetrics.totalWeeklySessions} Seans Antrenman
            </p>
          </div>
        </div>

        {/* Card 3: Aylık Gelir (Ciro) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tahsil Edilen Gelir
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-600">
                ₺{branchMetrics.totalIncome.toLocaleString('tr-TR')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
              <span>Aidat + Özel Seanslar</span>
              <span className="font-semibold text-amber-600">
                +₺{branchMetrics.pendingAmount.toLocaleString('tr-TR')} Bekliyor
              </span>
            </p>
          </div>
        </div>

        {/* Card 4: Net Kasa & Karlılık */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Net Kasa / Kar
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                ₺{branchMetrics.netProfit.toLocaleString('tr-TR')}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                %{branchMetrics.profitMargin} Marj
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Giderler: ₺{branchMetrics.totalExpense.toLocaleString('tr-TR')}
            </p>
          </div>
        </div>

        {/* Card 5: Tesis Kapasitesi */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Kapasite Doluluğu
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                %{branchMetrics.occupancyRate}
              </span>
              <span className="text-xs font-medium text-slate-500">
                ({branchMetrics.athleteCount} / {branchMetrics.capacity})
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  branchMetrics.occupancyRate >= 90
                    ? 'bg-rose-500'
                    : branchMetrics.occupancyRate >= 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, branchMetrics.occupancyRate)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5">
        {/* Tab Navigation Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('genel')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'genel'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Genel Bakış & Analitik</span>
            </button>

            <button
              onClick={() => setActiveTab('sporcular')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sporcular'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sporcular ({filteredAthletes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('egitmenler')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'egitmenler'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
              <span>Eğitmenler ({filteredInstructors.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('finans')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'finans'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              <span>Gelir & Gider Kasa ({filteredTransactions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('kiyaslama')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'kiyaslama'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Şubeler Arası Karşılaştırma</span>
            </button>
          </div>

          {/* Quick Context indicator */}
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>
              {activeBranchId === 'all'
                ? 'Tüm Kulüp Şubeleri Dahil'
                : `${currentBranch?.ad} Seçili`}
            </span>
          </div>
        </div>

        {/* TAB 1: GENEL BAKIŞ & ANALİTİK */}
        {activeTab === 'genel' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Grid: Financial Flow Bar + Sports Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Monthly Trend / Cashflow Visual */}
              <div className="lg:col-span-2 bg-slate-50/70 rounded-xl p-4 sm:p-5 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Son 6 Aylık Finansal Büyüme & Gelir/Gider Trendi
                    </h3>
                    <p className="text-xs text-slate-500">
                      Aylık tahsil edilen aidatlar ile personel/tesis giderleri karşılaştırması
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                      Gelir
                    </span>
                    <span className="flex items-center gap-1 text-rose-700">
                      <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
                      Gider
                    </span>
                  </div>
                </div>

                {/* Simulated Chart Bars */}
                <div className="space-y-3 pt-2">
                  {monthlyTrend.map((item) => {
                    const maxVal = 200000;
                    const gelirWidth = Math.min(100, Math.round((item.gelir / maxVal) * 100));
                    const giderWidth = Math.min(100, Math.round((item.gider / maxVal) * 100));

                    return (
                      <div key={item.month} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 w-24">{item.month}</span>
                          <div className="flex items-center gap-3 text-[11px] font-mono">
                            <span className="text-emerald-700 font-bold">
                              +₺{item.gelir.toLocaleString('tr-TR')}
                            </span>
                            <span className="text-rose-600">
                              -₺{item.gider.toLocaleString('tr-TR')}
                            </span>
                            <span className="text-slate-800 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              Net: ₺{item.netKar.toLocaleString('tr-TR')}
                            </span>
                          </div>
                        </div>

                        {/* Visual dual bar */}
                        <div className="w-full bg-slate-200/80 h-2.5 rounded-full flex overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full transition-all duration-500"
                            style={{ width: `${gelirWidth}%` }}
                            title={`Gelir: ₺${item.gelir.toLocaleString('tr-TR')}`}
                          />
                          <div
                            className="bg-rose-400 h-full transition-all duration-500 opacity-80"
                            style={{ width: `${giderWidth}%` }}
                            title={`Gider: ₺${item.gider.toLocaleString('tr-TR')}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Branş Dağılımı ve Sporcu Oranları */}
              <div className="bg-slate-50/70 rounded-xl p-4 sm:p-5 border border-slate-200/80 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-purple-600" />
                    Branş Bazlı Sporcu Dağılımı
                  </h3>
                  <p className="text-xs text-slate-500">
                    Seçili şubede aktif branşlara kayıtlı sporcu yoğunluğu
                  </p>

                  <div className="space-y-3 mt-4">
                    {sportDistribution.map((item, idx) => {
                      const colors = [
                        'bg-blue-600',
                        'bg-purple-600',
                        'bg-emerald-600',
                        'bg-amber-500',
                        'bg-rose-500',
                      ];
                      const color = colors[idx % colors.length];

                      return (
                        <div key={item.sport} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800">{item.sport}</span>
                            <span className="font-bold text-slate-900">
                              {item.count} Sporcu (%{item.percent})
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${color}`}
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Facility & Branch Info summary */}
                <div className="pt-3 border-t border-slate-200/80 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Tesis Tipi:</span>
                    <span className="font-bold text-slate-800">
                      {currentBranch?.tesisTipi || 'Spor Kompleksleri Ağı'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Yönetici:</span>
                    <span className="font-bold text-slate-800">
                      {currentBranch?.sorumluYonetici || 'Merkez Yönetim'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Baş Antrenör:</span>
                    <span className="font-bold text-slate-800">
                      {currentBranch?.sorumluAntrenor || 'Baş Antrenör Heyeti'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Athlete & Coach Highlight Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Aidat Tahsilat Durumu Özeti */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    Aidat Tahsilat ve Alacak Takibi
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    %{Math.round((branchMetrics.paidAthletes / (branchMetrics.athleteCount || 1)) * 100)} Başarı
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Ödenen</span>
                    <span className="text-base font-black text-emerald-800">{branchMetrics.paidAthletes}</span>
                    <span className="text-[10px] text-emerald-600 block">Sporcu</span>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-2.5">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">Bekleyen</span>
                    <span className="text-base font-black text-amber-800">{branchMetrics.pendingAthletes}</span>
                    <span className="text-[10px] text-amber-600 block">Sporcu</span>
                  </div>

                  <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-2.5">
                    <span className="text-[10px] uppercase font-bold text-rose-700 block">Geciken</span>
                    <span className="text-base font-black text-rose-800">{branchMetrics.overdueAthletes}</span>
                    <span className="text-[10px] text-rose-600 block">Sporcu</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Toplam Bekleyen Tahsilat:</span>
                  <span className="font-black text-amber-700 font-mono">
                    ₺{branchMetrics.pendingAmount.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Şube Tesis ve İletişim Bilgileri */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    Tesis ve Konum Bilgileri
                  </h4>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('subeler')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Tüm Şubeler</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {currentBranch ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span>{currentBranch.adres}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{currentBranch.telefon}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{currentBranch.eposta}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {currentBranch.ozellikler?.map((oz) => (
                        <span
                          key={oz}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                        >
                          ✓ {oz}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-3 space-y-1">
                    <p className="font-semibold text-slate-700">
                      Şu anda kulübün tüm şubeleri konsolide olarak listelenmektedir.
                    </p>
                    <p>
                      Yukarıdaki şube filtre çubuğundan Kadıköy, Ataşehir, Beşiktaş veya Çankaya şubelerini
                      seçerek tek bir tesise özel derinlemesine verilere odaklanabilirsiniz.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SPORCULAR */}
        {activeTab === 'sporcular' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Filter and Search Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Sporcu adı, kod veya veli ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Branş Filtresi */}
                <select
                  value={branchSportFilter}
                  onChange={(e) => setBranchSportFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Tüm Branşlar</option>
                  <option value="Basketbol">Basketbol</option>
                  <option value="Voleybol">Voleybol</option>
                  <option value="Futbol">Futbol</option>
                  <option value="Yüzme">Yüzme</option>
                  <option value="Cimnastik">Cimnastik</option>
                  <option value="Tenis">Tenis</option>
                  <option value="Pilates">Pilates</option>
                  <option value="Masa Tenisi">Masa Tenisi</option>
                </select>

                {/* Ödeme Durumu Filtresi */}
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Tüm Ödeme Durumları</option>
                  <option value="Ödendi">Ödendi</option>
                  <option value="Bekliyor">Bekliyor</option>
                  <option value="Gecikti">Gecikti</option>
                </select>

                <button
                  onClick={() => setIsAddAthleteModalOpen(true)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Sporcu</span>
                </button>
              </div>
            </div>

            {/* Athletes Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/90 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Sporcu Adı & Kod</th>
                    <th className="px-4 py-3">Şube</th>
                    <th className="px-4 py-3">Branş & Grup</th>
                    <th className="px-4 py-3">Veli Bilgisi</th>
                    <th className="px-4 py-3">Aylık Aidat</th>
                    <th className="px-4 py-3">Ödeme Durumu</th>
                    <th className="px-4 py-3">Devam Oranı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredAthletes.length > 0 ? (
                    filteredAthletes.map((ath) => {
                      const athSube = subeler.find((s) => s.id === ath.subeId);

                      return (
                        <tr key={ath.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              {ath.avatarUrl ? (
                                <img
                                  src={ath.avatarUrl}
                                  alt={ath.name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                                  {ath.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-slate-900">{ath.name}</div>
                                <div className="text-[10px] font-mono text-slate-400">#{ath.code}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 font-medium text-slate-700">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {athSube?.kod || 'Şube'}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="font-semibold text-slate-800 block">{ath.branch}</span>
                            <span className="text-[11px] text-slate-400">{ath.group}</span>
                          </td>

                          <td className="px-4 py-3">
                            <span className="font-medium text-slate-800 block">{ath.parentName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{ath.parentPhone}</span>
                          </td>

                          <td className="px-4 py-3 font-bold text-slate-900 font-mono">
                            ₺{ath.monthlyFee.toLocaleString('tr-TR')}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                ath.paymentStatus === 'Ödendi'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : ath.paymentStatus === 'Bekliyor'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  ath.paymentStatus === 'Ödendi'
                                    ? 'bg-emerald-500'
                                    : ath.paymentStatus === 'Bekliyor'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              />
                              {ath.paymentStatus}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800">%{ath.attendanceRate}</span>
                              <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-blue-600 h-full rounded-full"
                                  style={{ width: `${ath.attendanceRate}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Seçilen filtrelerde sporcu kaydı bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: EĞİTMENLER */}
        {activeTab === 'egitmenler' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Şube Eğitmen ve Antrenör Kadrosu
                </h3>
                <p className="text-xs text-slate-500">
                  Bu şubede görevli baş antrenörler, uzman eğitmenler ve seans yükleri
                </p>
              </div>

              {onNavigate && (
                <button
                  onClick={() => onNavigate('egitmenler')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Tüm Eğitmenleri Yönet</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInstructors.map((coach) => {
                const cSube = subeler.find((s) => s.id === coach.subeId);

                return (
                  <div
                    key={coach.id}
                    className="bg-slate-50/70 border border-slate-200/90 hover:border-blue-300 rounded-xl p-4 transition-all shadow-2xs hover:shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {coach.avatarUrl ? (
                          <img
                            src={coach.avatarUrl}
                            alt={coach.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-black flex items-center justify-center text-sm">
                            {coach.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{coach.name}</h4>
                          <p className="text-xs text-purple-700 font-semibold">{coach.role}</p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {cSube?.ad || 'Tesis'}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        ★ {coach.rating}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Uzmanlık
                        </span>
                        <span className="font-bold text-slate-800">{coach.branch}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Haftalık Seans
                        </span>
                        <span className="font-bold text-slate-800">{coach.weeklySessions} Seans / Hafta</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Atanmış Sporcu
                        </span>
                        <span className="font-bold text-slate-800">{coach.assignedAthletes} Sporcu</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Aylık Hakediş
                        </span>
                        <span className="font-bold text-slate-800 font-mono">
                          ₺{coach.monthlySalary.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                      <span className="truncate">{coach.phone}</span>
                      <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {coach.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: GELİR & GİDER KASA HAREKETLERİ */}
        {activeTab === 'finans' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Financial Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setTxTypeFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    txTypeFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tüm Hareketler ({filteredTransactions.length})
                </button>
                <button
                  onClick={() => setTxTypeFilter('Gelir')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    txTypeFilter === 'Gelir'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  Yalnızca Gelirler
                </button>
                <button
                  onClick={() => setTxTypeFilter('Gider')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    txTypeFilter === 'Gider'
                      ? 'bg-white text-rose-700 shadow-2xs'
                      : 'text-slate-600 hover:text-rose-700'
                  }`}
                >
                  Yalnızca Giderler
                </button>
              </div>

              <button
                onClick={() => setIsAddTxModalOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni Kasa Hareketi Ekle</span>
              </button>
            </div>

            {/* Financial Ledger Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/90 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Tarih</th>
                    <th className="px-4 py-3">İşlem & Açıklama</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Muhatap (Ödeyen / Alıcı)</th>
                    <th className="px-4 py-3">Ödeme Metodu</th>
                    <th className="px-4 py-3">Durum</th>
                    <th className="px-4 py-3 text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-500">{tx.date}</td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`p-1 rounded-md shrink-0 ${
                                tx.type === 'Gelir'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-rose-50 text-rose-600'
                              }`}
                            >
                              {tx.type === 'Gelir' ? (
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              ) : (
                                <ArrowDownRight className="w-3.5 h-3.5" />
                              )}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900">{tx.title}</div>
                              {tx.description && (
                                <div className="text-[10px] text-slate-400">{tx.description}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-700">{tx.category}</span>
                        </td>

                        <td className="px-4 py-3 font-medium text-slate-800">{tx.payerOrPayee}</td>

                        <td className="px-4 py-3">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {tx.paymentMethod}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {tx.status}
                          </span>
                        </td>

                        <td
                          className={`px-4 py-3 text-right font-black font-mono text-sm ${
                            tx.type === 'Gelir' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {tx.type === 'Gelir' ? '+' : '-'}₺{tx.amount.toLocaleString('tr-TR')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Bu filtreye uygun finansal hareket bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ŞUBELER ARASI KARŞILAŞTIRMA */}
        {activeTab === 'kiyaslama' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Şubeler Arası Performans ve Finansal Karşılaştırma Matrisi
              </h3>
              <p className="text-xs text-slate-500">
                Kulübe bağlı tüm şubelerin sporcu mevcudu, eğitmen sayısı, kapasite doluluğu ve aylık ciro kıyaslaması
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/90 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Şube Adı</th>
                    <th className="px-4 py-3">Şehir / İlçe</th>
                    <th className="px-4 py-3">Tesis Tipi</th>
                    <th className="px-4 py-3">Sporcu / Kapasite</th>
                    <th className="px-4 py-3">Doluluk</th>
                    <th className="px-4 py-3">Antrenör</th>
                    <th className="px-4 py-3">Aylık Tahmini Ciro</th>
                    <th className="px-4 py-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {subeler.map((sube) => {
                    const subeSporcular = sporcular.filter((a) => a.subeId === sube.id);
                    const subeCoaches = egitmenler.filter((e) => e.subeId === sube.id);
                    const subeOcc = Math.round((subeSporcular.length / (sube.kapasite || 1)) * 100);

                    return (
                      <tr
                        key={sube.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          activeBranchId === sube.id ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{sube.ad}</div>
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {sube.kod}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-medium text-slate-700">
                          {sube.ilce}, {sube.sehir}
                        </td>

                        <td className="px-4 py-3 font-medium text-slate-600">{sube.tesisTipi}</td>

                        <td className="px-4 py-3 font-bold text-slate-900">
                          {subeSporcular.length} / {sube.kapasite}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">%{subeOcc}</span>
                            <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  subeOcc >= 90
                                    ? 'bg-rose-500'
                                    : subeOcc >= 70
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, subeOcc)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 font-bold text-slate-800">{subeCoaches.length} Eğitmen</td>

                        <td className="px-4 py-3 font-black text-emerald-600 font-mono">
                          ₺{(sube.aylikCiro || 120000).toLocaleString('tr-TR')}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              handleBranchSelect(sube.id);
                              setActiveTab('genel');
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
                          >
                            Özetini Aç
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: YENİ TAHSİLAT VEYA GİDER HAREKETİ EKLE */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Yeni Kasa Hareketi Ekle</h3>
                  <p className="text-xs text-slate-500">
                    Seçili şubeye anlık gelir veya gider girişi yapın.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddTxModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-3.5 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewTxType('Gelir')}
                  className={`py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    newTxType === 'Gelir' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-700'
                  }`}
                >
                  Gelir (Tahsilat)
                </button>
                <button
                  type="button"
                  onClick={() => setNewTxType('Gider')}
                  className={`py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                    newTxType === 'Gider' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-700'
                  }`}
                >
                  Gider (Ödeme)
                </button>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Açıklama / İşlem Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ekim Ayı Basketbol Aidatı"
                  value={newTxTitle}
                  onChange={(e) => setNewTxTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tutar (TL) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newTxAmount}
                    onChange={(e) => setNewTxAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Ödeme Metodu</label>
                  <select
                    value={newTxMethod}
                    onChange={(e) => setNewTxMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-hidden cursor-pointer"
                  >
                    <option value="Kredi Kartı">Kredi Kartı</option>
                    <option value="Havale/EFT">Havale/EFT</option>
                    <option value="Nakit">Nakit</option>
                    <option value="POS">POS Cihazı</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Kategori</label>
                <select
                  value={newTxCategory}
                  onChange={(e) => setNewTxCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-hidden cursor-pointer"
                >
                  <option value="Aylık Sporcu Aidatları">Aylık Sporcu Aidatları</option>
                  <option value="Bireysel Özel Dersler">Bireysel Özel Dersler</option>
                  <option value="Ürün & Forma Satışı">Ürün & Forma Satışı</option>
                  <option value="Turnuva & Kamp Katılım">Turnuva & Kamp Katılım</option>
                  <option value="Antrenör & Eğitmen Maaşları">Antrenör & Eğitmen Maaşları</option>
                  <option value="Tesis Bakım & Onarım">Tesis Bakım & Onarım</option>
                  <option value="Elektrik, Su, Isıtma Faturaları">Elektrik, Su, Isıtma Faturaları</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Muhatap (Ödeyen veya Alıcı)</label>
                <input
                  type="text"
                  placeholder="Örn: Kaan Yıldırım Velisi"
                  value={newTxPayer}
                  onChange={(e) => setNewTxPayer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTxModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ŞUBEYE YENİ SPORCU KAYDET */}
      {isAddAthleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Şubeye Yeni Sporcu Ekle</h3>
                  <p className="text-xs text-slate-500">
                    {currentBranch?.ad || 'Seçili Kulüp Şubesi'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddAthleteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAthlete} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Sporcu Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Yiğit Kaya"
                  value={newAthName}
                  onChange={(e) => setNewAthName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Branş</label>
                  <select
                    value={newAthBranch}
                    onChange={(e) => setNewAthBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-hidden cursor-pointer"
                  >
                    <option value="Basketbol">Basketbol</option>
                    <option value="Voleybol">Voleybol</option>
                    <option value="Futbol">Futbol</option>
                    <option value="Yüzme">Yüzme</option>
                    <option value="Cimnastik">Cimnastik</option>
                    <option value="Tenis">Tenis</option>
                    <option value="Pilates">Pilates</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Aylık Aidat (TL)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newAthFee}
                    onChange={(e) => setNewAthFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Grup / Takım</label>
                <input
                  type="text"
                  placeholder="Örn: U12 Altyapı A Grubu"
                  value={newAthGroup}
                  onChange={(e) => setNewAthGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Veli Adı</label>
                  <input
                    type="text"
                    placeholder="Veli Adı Soyadı"
                    value={newAthParent}
                    onChange={(e) => setNewAthParent(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Veli Telefonu</label>
                  <input
                    type="text"
                    value={newAthPhone}
                    onChange={(e) => setNewAthPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAthleteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  Sporcuyu Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
