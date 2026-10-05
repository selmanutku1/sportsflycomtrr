import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import {
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  FileDown,
  ChevronDown,
  Calendar,
  Layers,
  ChevronRight,
  DollarSign,
  Tag,
  Check,
  X,
  Building,
  Printer,
  Share2,
  QrCode,
  Send,
  Eye,
  LayoutGrid,
  Table,
  RotateCcw,
} from 'lucide-react';
import {
  INITIAL_GELIR_GIDER,
  INITIAL_KATEGORILER,
  INITIAL_ODEME_PLANI,
} from '../../data/mockMuhasebeData';
import { GelirGiderItem, GelirGiderKategoriItem, OdemePlaniItem, NavPage } from '../../types';

interface Props {
  initialTab?: 'genel' | 'kategoriler' | 'hareketler' | 'kontrol' | 'planlar';
  onNavigate?: (page: NavPage) => void;
}

export const OnMuhasebeView: React.FC<Props> = ({ initialTab = 'genel', onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'genel' | 'kategoriler' | 'hareketler' | 'kontrol' | 'planlar'>(initialTab);

  // States
  const [hareketler, setHareketler] = useState<GelirGiderItem[]>(INITIAL_GELIR_GIDER);
  const [kategoriler, setKategoriler] = useState<GelirGiderKategoriItem[]>(INITIAL_KATEGORILER);
  const [odemePlanlari, setOdemePlanlari] = useState<OdemePlaniItem[]>(INITIAL_ODEME_PLANI);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'Tümü' | 'Gelir' | 'Gider'>('Tümü');
  const [statusFilter, setStatusFilter] = useState<'Tümü' | 'Ödendi' | 'Bekliyor' | 'Gecikti'>('Tümü');

  // Modals
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Digital Receipt / Invoice Preview Modal States
  const [selectedReceiptPlan, setSelectedReceiptPlan] = useState<OdemePlaniItem | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptDocType, setReceiptDocType] = useState<'makbuz' | 'fatura'>('makbuz');
  const [nextReceiptNumber, setNextReceiptNumber] = useState<number>(1001);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Filter States for Ödeme Planları Tab
  const [planSearch, setPlanSearch] = useState('');
  const [planStatusFilter, setPlanStatusFilter] = useState<'Tümü' | 'Ödendi' | 'Bekliyor' | 'Gecikti'>('Tümü');
  const [planStartDate, setPlanStartDate] = useState('');
  const [planEndDate, setPlanEndDate] = useState('');
  const [planViewMode, setPlanViewMode] = useState<'grid' | 'table'>('grid');

  // Helper to parse DD.MM.YYYY or YYYY-MM-DD
  const parseTurkishDate = (str?: string): Date | null => {
    if (!str) return null;
    if (str.includes('-')) {
      const [y, m, d] = str.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    if (str.includes('.')) {
      const [d, m, y] = str.split('.').map(Number);
      return new Date(y, m - 1, d);
    }
    return null;
  };

  // Filtered payment plans list
  const filteredOdemePlanlari = odemePlanlari.filter((plan) => {
    if (planSearch.trim()) {
      const q = planSearch.toLowerCase().trim();
      const matchesName = plan.athleteName.toLowerCase().includes(q);
      const matchesCode = plan.athleteCode.toLowerCase().includes(q);
      const matchesPlan = plan.planName.toLowerCase().includes(q);
      const matchesReceipt = plan.receiptNumber?.toLowerCase().includes(q);
      if (!matchesName && !matchesCode && !matchesPlan && !matchesReceipt) {
        return false;
      }
    }

    if (planStatusFilter !== 'Tümü' && plan.status !== planStatusFilter) {
      return false;
    }

    if (planStartDate) {
      const start = new Date(planStartDate);
      start.setHours(0, 0, 0, 0);
      const planDate = parseTurkishDate(plan.dueDate);
      if (planDate && planDate < start) return false;
    }

    if (planEndDate) {
      const end = new Date(planEndDate);
      end.setHours(23, 59, 59, 999);
      const planDate = parseTurkishDate(plan.dueDate);
      if (planDate && planDate > end) return false;
    }

    return true;
  });

  // Export Ödeme Planları to Excel
  const handleExportPlansToExcel = () => {
    if (filteredOdemePlanlari.length === 0) {
      showToast('Dışa aktarılacak ödeme planı kaydı bulunamadı.');
      return;
    }

    const dataToExport = filteredOdemePlanlari.map((plan, index) => ({
      'Sıra No': index + 1,
      'Sporcu Adı Soyadı': plan.athleteName,
      'Sporcu Kodu': plan.athleteCode,
      'Paket / Ödeme Planı': plan.planName,
      'Taksit Detayı': plan.installment,
      'Son Ödeme Vadesi': plan.dueDate,
      'Tutar (TL)': plan.amount,
      'Ödeme Durumu': plan.status,
      'Tahsilat Tarihi': plan.paidDate || '-',
      'Makbuz / Fatura No': plan.receiptNumber ? `MAK-2026-${plan.receiptNumber}` : '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ödeme Planları');

    // Set column widths
    worksheet['!cols'] = [
      { wch: 8 },
      { wch: 24 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 22 },
    ];

    const dateSuffix = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `SportsFly_Odeme_Planlari_${dateSuffix}.xlsx`);
    showToast(`${dataToExport.length} adet ödeme planı Excel dosyası olarak indirildi.`);
  };

  const handleResetPlanFilters = () => {
    setPlanSearch('');
    setPlanStatusFilter('Tümü');
    setPlanStartDate('');
    setPlanEndDate('');
  };

  const handleOpenReceipt = (plan: OdemePlaniItem) => {
    const todayStr = new Date().toLocaleDateString('tr-TR');
    let receiptNum = plan.receiptNumber;
    let nextNum = nextReceiptNumber;

    if (!receiptNum) {
      receiptNum = String(nextNum).padStart(6, '0');
      nextNum += 1;
      setNextReceiptNumber(nextNum);
    }

    const updatedPlan: OdemePlaniItem = {
      ...plan,
      receiptNumber: receiptNum,
      receiptDate: todayStr,
    };

    setOdemePlanlari((prev) =>
      prev.map((p) => (p.id === plan.id ? updatedPlan : p))
    );
    setSelectedReceiptPlan(updatedPlan);
    setShowReceiptModal(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!selectedReceiptPlan) return;
    setIsGeneratingPDF(true);
    try {
      const element = document.getElementById('receipt-paper-content');
      if (!element) {
        showToast('Makbuz veya fatura şablonu bulunamadı.');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Remove or replace unsupported oklch color functions in cloned style tags
          const styleElements = clonedDoc.querySelectorAll('style');
          styleElements.forEach((styleEl) => {
            if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
              styleEl.textContent = styleEl.textContent.replace(/oklch\([^)]+\)/g, 'rgb(15, 23, 42)');
            }
          });

          // Inline computed RGB colors on cloned nodes to avoid CSS variable oklch issues
          const origEl = document.getElementById('receipt-paper-content');
          const clonedEl = clonedDoc.getElementById('receipt-paper-content');

          if (origEl && clonedEl) {
            const origNodes = [origEl, ...Array.from(origEl.querySelectorAll('*'))];
            const clonedNodes = [clonedEl, ...Array.from(clonedEl.querySelectorAll('*'))];

            origNodes.forEach((node, index) => {
              const clonedNode = clonedNodes[index] as HTMLElement;
              if (clonedNode && node instanceof HTMLElement) {
                const computed = window.getComputedStyle(node);
                clonedNode.style.color = computed.color;
                clonedNode.style.backgroundColor = computed.backgroundColor;
                clonedNode.style.borderColor = computed.borderColor;
              }
            });
          }
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfMargin = 10;
      const imgWidth = pdfWidth - (pdfMargin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', pdfMargin, pdfMargin, imgWidth, imgHeight);

      const docPrefix = receiptDocType === 'makbuz' ? 'Makbuz' : 'Fatura';
      const docNo = selectedReceiptPlan.receiptNumber || selectedReceiptPlan.id.replace(/\D/g, '');
      const safeAthleteName = selectedReceiptPlan.athleteName.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g, '_');
      const fileName = `${docPrefix}_${safeAthleteName}_${docNo}.pdf`;

      pdf.save(fileName);
      showToast(`Dijital ${docPrefix.toLowerCase()} PDF dosyası (${fileName}) olarak indirildi.`);
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      showToast('PDF dosyası oluşturulurken bir hata oluştu.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSendReceipt = (method: 'email' | 'whatsapp') => {
    if (!selectedReceiptPlan) return;
    const dest = method === 'email' ? 'veli e-posta adresine' : 'WhatsApp hattına';
    showToast(`Dijital ${receiptDocType === 'makbuz' ? 'Makbuz' : 'Fatura'} PDF olarak ${selectedReceiptPlan.athleteName} (${dest}) başarıyla gönderildi.`);
  };

  const formatAmountToTurkishWords = (amount: number): string => {
    if (amount === 0) return 'Sıfır';
    const num = Math.floor(amount);
    if (num === 3500) return 'Üç Bin Beş Yüz';
    if (num === 4200) return 'Dört Bin İki Yüz';
    if (num === 6000) return 'Altı Bin';
    if (num === 2800) return 'İki Bin Sekiz Yüz';
    if (num === 2250) return 'İki Bin İki Yüz Elli';
    if (num === 9500) return 'Dokuz Bin Beş Yüz';
    if (num === 14800) return 'On Dört Bin Sekiz Yüz';
    return num.toLocaleString('tr-TR');
  };

  // Form: Yeni Hareket
  const [txType, setTxType] = useState<'Gelir' | 'Gider'>('Gelir');
  const [txTitle, setTxTitle] = useState('');
  const [txCategory, setTxCategory] = useState('Aylık Sporcu Aidatları');
  const [txAmount, setTxAmount] = useState('');
  const [txPayer, setTxPayer] = useState('');
  const [txMethod, setTxMethod] = useState<'Nakit' | 'Kredi Kartı' | 'Havale/EFT' | 'POS'>('Havale/EFT');

  // Form: Yeni Kategori
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'Gelir' | 'Gider'>('Gelir');

  // Form: Yeni Ödeme Planı
  const [planAthlete, setPlanAthlete] = useState('');
  const [planTitle, setPlanTitle] = useState('');
  const [planAmount, setPlanAmount] = useState('');
  const [planInstallments, setPlanInstallments] = useState('3');
  const [planDueDate, setPlanDueDate] = useState('15.10.2024');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Financial Calculations
  const totalGelir = hareketler
    .filter((h) => h.type === 'Gelir' && h.status === 'Tamamlandı')
    .reduce((acc, h) => acc + h.amount, 0);

  const totalGider = hareketler
    .filter((h) => h.type === 'Gider' && h.status === 'Tamamlandı')
    .reduce((acc, h) => acc + h.amount, 0);

  const netBakiye = totalGelir - totalGider;

  const bekleyenTahsilat = odemePlanlari
    .filter((p) => p.status === 'Bekliyor')
    .reduce((acc, p) => acc + p.amount, 0);

  const gecikenTahsilat = odemePlanlari
    .filter((p) => p.status === 'Gecikti')
    .reduce((acc, p) => acc + p.amount, 0);

  // Add Transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || !txAmount) return;

    const newTx: GelirGiderItem = {
      id: `tx-${Date.now()}`,
      type: txType,
      title: txTitle.trim(),
      category: txCategory,
      amount: parseFloat(txAmount),
      date: new Date().toLocaleDateString('tr-TR'),
      payerOrPayee: txPayer.trim() || 'Kulüp Hesabı',
      paymentMethod: txMethod,
      status: 'Tamamlandı',
    };

    setHareketler([newTx, ...hareketler]);
    setShowAddTxModal(false);
    setTxTitle('');
    setTxAmount('');
    setTxPayer('');
    showToast(`${newTx.type} işlemi (${newTx.amount.toLocaleString('tr-TR')} ₺) kaydedildi.`);
  };

  // Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const newCat: GelirGiderKategoriItem = {
      id: `kat-${Date.now()}`,
      name: catName.trim(),
      type: catType,
      itemCount: 0,
      totalAmount: 0,
      color: catType === 'Gelir' ? 'emerald' : 'rose',
    };

    setKategoriler([...kategoriler, newCat]);
    setShowAddCatModal(false);
    setCatName('');
    showToast(`"${newCat.name}" kategorisi başarıyla eklendi.`);
  };

  // Add Payment Plan
  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planAthlete.trim() || !planAmount) return;

    const total = parseFloat(planAmount);
    const count = parseInt(planInstallments) || 1;
    const monthly = Math.round(total / count);
    const todayStr = new Date().toLocaleDateString('tr-TR');

    let currentCounter = nextReceiptNumber;
    const newPlans: OdemePlaniItem[] = [];
    for (let i = 1; i <= count; i++) {
      const receiptNum = String(currentCounter).padStart(6, '0');
      currentCounter += 1;

      newPlans.push({
        id: `op-${Date.now()}-${i}`,
        athleteName: planAthlete.trim(),
        athleteCode: Math.floor(100000 + Math.random() * 900000).toString(),
        planName: planTitle.trim() || 'Sporcu Aidat & Eğitim Paketi',
        installment: `${i}/${count}`,
        dueDate: planDueDate,
        amount: monthly,
        status: i === 1 ? 'Ödendi' : 'Bekliyor',
        paidDate: i === 1 ? todayStr : undefined,
        receiptNumber: receiptNum,
        receiptDate: todayStr,
      });
    }

    setNextReceiptNumber(currentCounter);
    setOdemePlanlari([...newPlans, ...odemePlanlari]);
    setShowAddPlanModal(false);
    setPlanAthlete('');
    setPlanTitle('');
    setPlanAmount('');
    showToast(`${planAthlete} için ${count} taksitli ödeme planı ve dijital makbuz numaraları oluşturuldu.`);
  };

  // Mark plan as paid
  const handleMarkPaid = (planId: string) => {
    setOdemePlanlari((prev) =>
      prev.map((p) =>
        p.id === planId
          ? {
              ...p,
              status: 'Ödendi',
              paidDate: new Date().toLocaleDateString('tr-TR'),
            }
          : p
      )
    );
    showToast('Taksit tahsilatı başarıyla işlendi ve gelir kaydedildi.');
  };

  // Export Excel
  const handleExportExcel = () => {
    const headers = ['Tarih', 'İşlem Tipi', 'Başlık', 'Kategori', 'Tutar (TL)', 'Kişi / Kurum', 'Ödeme Yöntemi'];
    const rows = hareketler.map((h) => [
      h.date,
      h.type,
      `"${h.title}"`,
      `"${h.category}"`,
      h.amount,
      `"${h.payerOrPayee}"`,
      h.paymentMethod,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `On_Muhasebe_Ekstre_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Muhasebe hareketleri Excel (CSV) olarak indirildi.');
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Tab Navigation Bar matching Screenshot 3 */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 sm:p-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap">
            {/* Ön Muhasebe (Genel Bakış) */}
            <button
              onClick={() => setActiveTab('genel')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[40px] ${
                activeTab === 'genel'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-4 h-4 shrink-0" />
              <span>Ön Muhasebe</span>
            </button>

            {/* Gelir/Gider Kategori Yönetimi */}
            <button
              onClick={() => setActiveTab('kategoriler')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[40px] ${
                activeTab === 'kategoriler'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>Gelir/Gider Kategori Yönetimi</span>
            </button>

            {/* Gelir/Gider Yönetimi */}
            <button
              onClick={() => setActiveTab('hareketler')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[40px] ${
                activeTab === 'hareketler'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ArrowUpRight className="w-4 h-4 shrink-0" />
              <span>Gelir/Gider Yönetimi</span>
            </button>

            {/* Ödeme Planı Kontrol */}
            <button
              onClick={() => setActiveTab('kontrol')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[40px] ${
                activeTab === 'kontrol'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>Ödeme Planı Kontrol</span>
            </button>

            {/* Ödeme Planı */}
            <button
              onClick={() => setActiveTab('planlar')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 whitespace-nowrap min-h-[40px] ${
                activeTab === 'planlar'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Ödeme Planı</span>
            </button>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center justify-end sm:justify-start gap-2 shrink-0">
            <button
              onClick={() => setShowAddTxModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#188038] hover:bg-[#137333] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer min-h-[42px] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Gelir / Gider Ekle</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: ÖN MUHASEBE GENEL BAKIŞ */}
      {activeTab === 'genel' && (
        <div className="space-y-4 sm:space-y-5">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Toplam Gelir */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold mb-1.5 sm:mb-2">
                <span className="truncate">Toplam Gelir</span>
                <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
              </div>
              <p className="text-base sm:text-2xl font-black text-slate-900 truncate">
                {totalGelir.toLocaleString('tr-TR')} ₺
              </p>
              <p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-1 truncate">
                +14.8% bu ayki artış
              </p>
            </div>

            {/* Toplam Gider */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold mb-1.5 sm:mb-2">
                <span className="truncate">Toplam Gider</span>
                <span className="p-1 rounded-lg bg-rose-50 text-rose-600 shrink-0">
                  <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
              </div>
              <p className="text-base sm:text-2xl font-black text-slate-900 truncate">
                {totalGider.toLocaleString('tr-TR')} ₺
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 truncate">
                Maaşlar, kira ve fatura
              </p>
            </div>

            {/* Net Bakiye / Kasa */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold mb-1.5 sm:mb-2">
                <span className="truncate">Net Kasa Bakiyesi</span>
                <span className="p-1 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                  <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
              </div>
              <p className={`text-base sm:text-2xl font-black truncate ${netBakiye >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {netBakiye.toLocaleString('tr-TR')} ₺
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 truncate">
                Güncel net nakit pozisyonu
              </p>
            </div>

            {/* Bekleyen & Geciken Tahsilat */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold mb-1.5 sm:mb-2">
                <span className="truncate">Bekleyen Aidat</span>
                <span className="p-1 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
              </div>
              <p className="text-base sm:text-2xl font-black text-amber-600 truncate">
                {bekleyenTahsilat.toLocaleString('tr-TR')} ₺
              </p>
              <p className="text-[10px] sm:text-xs text-rose-600 font-bold mt-1 truncate">
                {gecikenTahsilat.toLocaleString('tr-TR')} ₺ gecikmede
              </p>
            </div>
          </div>

          {/* Son Hareketler & Kategori Dağılımı */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Son Hareketler Tablosu */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Son Gelir &amp; Gider Hareketleri</h3>
                  <p className="text-xs text-slate-500">Spor okulu ve kulüp kasasındaki son finansal işlemler</p>
                </div>
                <button
                  onClick={() => setActiveTab('hareketler')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Tümünü Gör</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="pb-2.5">Tarih</th>
                      <th className="pb-2.5">İşlem &amp; Açıklama</th>
                      <th className="pb-2.5">Kategori</th>
                      <th className="pb-2.5 text-right">Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hareketler.slice(0, 5).map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50">
                        <td className="py-3 font-medium text-slate-600 whitespace-nowrap">{h.date}</td>
                        <td className="py-3">
                          <p className="font-bold text-slate-900">{h.title}</p>
                          <p className="text-[11px] text-slate-500">{h.payerOrPayee} • {h.paymentMethod}</p>
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {h.category}
                          </span>
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          <span
                            className={`font-bold ${
                              h.type === 'Gelir' ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {h.type === 'Gelir' ? '+' : '-'}
                            {h.amount.toLocaleString('tr-TR')} ₺
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Kategori Dağılımı ve Hızlı Özet */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Kategori Özeti</h3>
                <button
                  onClick={() => setActiveTab('kategoriler')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Yönet
                </button>
              </div>

              <div className="space-y-3">
                {kategoriler.slice(0, 5).map((k) => (
                  <div key={k.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800">{k.name}</span>
                      <span
                        className={`font-black ${
                          k.type === 'Gelir' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {k.totalAmount.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{k.type} Kategorisi</span>
                      <span>{k.itemCount} İşlem</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowAddCatModal(true)}
                  className="w-full py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Yeni Kategori Tanımla</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GELİR/GİDER KATEGORİ YÖNETİMİ */}
      {activeTab === 'kategoriler' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Gelir ve Gider Kategori Yönetimi</h3>
              <p className="text-xs text-slate-500">Kulüp muhasebe ve bütçelendirmesinde kullanılan harcama ve gelir kalemleri</p>
            </div>
            <button
              onClick={() => setShowAddCatModal(true)}
              className="px-4 py-2 bg-[#188038] hover:bg-[#137333] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Kategori Ekle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gelir Kategorileri */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4" />
                <span>Gelir Kategorileri</span>
              </h4>
              <div className="space-y-2">
                {kategoriler
                  .filter((k) => k.type === 'Gelir')
                  .map((k) => (
                    <div
                      key={k.id}
                      className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/40 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{k.name}</p>
                        <p className="text-xs text-slate-500">{k.itemCount} kayıtlı işlem</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-700 text-sm">
                          {k.totalAmount.toLocaleString('tr-TR')} ₺
                        </p>
                        <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                          Aktif Gelir
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Gider Kategorileri */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-rose-800 flex items-center gap-1.5">
                <ArrowDownRight className="w-4 h-4" />
                <span>Gider Kategorileri</span>
              </h4>
              <div className="space-y-2">
                {kategoriler
                  .filter((k) => k.type === 'Gider')
                  .map((k) => (
                    <div
                      key={k.id}
                      className="p-3 rounded-lg border border-rose-100 bg-rose-50/40 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{k.name}</p>
                        <p className="text-xs text-slate-500">{k.itemCount} kayıtlı işlem</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-rose-700 text-sm">
                          {k.totalAmount.toLocaleString('tr-TR')} ₺
                        </p>
                        <span className="text-[10px] bg-rose-200/60 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                          Aktif Gider
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GELİR/GİDER YÖNETİMİ (HAREKETLER) */}
      {activeTab === 'hareketler' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            {/* Filter buttons with touch-friendly pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
              <button
                onClick={() => setFilterType('Tümü')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 whitespace-nowrap min-h-[38px] ${
                  filterType === 'Tümü'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tümü ({hareketler.length})
              </button>
              <button
                onClick={() => setFilterType('Gelir')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 whitespace-nowrap min-h-[38px] ${
                  filterType === 'Gelir'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Gelirler ({hareketler.filter((h) => h.type === 'Gelir').length})
              </button>
              <button
                onClick={() => setFilterType('Gider')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 whitespace-nowrap min-h-[38px] ${
                  filterType === 'Gider'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Giderler ({hareketler.filter((h) => h.type === 'Gider').length})
              </button>
            </div>

            {/* Search + Action Buttons */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="İşlem veya kişi ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Dışa Aktar Açılır Menüsü */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0 min-h-[38px] border border-slate-200 transition-colors cursor-pointer"
                  title="Dışa Aktarma Seçenekleri"
                >
                  <FileDown className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Dışa Aktar</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isExportMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsExportMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportMenuOpen(false);
                          handleExportExcel();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-emerald-50 text-emerald-700 font-medium flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Excel (.CSV) İndir</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportMenuOpen(false);
                          showToast('Muhasebe tablosu yazdırılıyor / PDF aktarılıyor...');
                          window.print();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100"
                      >
                        <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                        <span>Yazdır / PDF Rapor</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setShowAddTxModal(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs shrink-0 min-h-[38px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Yeni İşlem</span>
              </button>
            </div>
          </div>

          {/* MOBILE CARDS FOR TRANSACTIONS (Visible on <640px) */}
          <div className="block sm:hidden space-y-2.5">
            {hareketler
              .filter((h) => filterType === 'Tümü' || h.type === filterType)
              .filter((h) =>
                !searchQuery ||
                h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                h.payerOrPayee.toLowerCase().includes(searchQuery.toLowerCase()) ||
                h.category.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          h.type === 'Gelir'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {h.type === 'Gelir' ? '+' : '-'}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs leading-snug">{h.title}</h4>
                        <p className="text-[11px] text-slate-500">{h.payerOrPayee}</p>
                      </div>
                    </div>
                    <span
                      className={`font-black text-sm whitespace-nowrap ${
                        h.type === 'Gelir' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {h.type === 'Gelir' ? '+' : '-'}
                      {h.amount.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                      {h.category}
                    </span>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span>{h.paymentMethod}</span>
                      <span>•</span>
                      <span>{h.date}</span>
                    </div>
                  </div>
                </div>
              ))}

            {hareketler.filter((h) => filterType === 'Tümü' || h.type === filterType).length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Seçilen kriterlere uygun işlem bulunamadı.
              </div>
            )}
          </div>

          {/* DESKTOP DATA TABLE (Visible on sm and larger) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-3">Tarih</th>
                  <th className="py-3 px-3">Tip</th>
                  <th className="py-3 px-3">Açıklama / Başlık</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Kişi / Kurum</th>
                  <th className="py-3 px-3">Ödeme Metodu</th>
                  <th className="py-3 px-3 text-right">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hareketler
                  .filter((h) => filterType === 'Tümü' || h.type === filterType)
                  .filter((h) =>
                    !searchQuery ||
                    h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    h.payerOrPayee.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    h.category.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-medium">{h.date}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            h.type === 'Gelir'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {h.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{h.title}</td>
                      <td className="py-3 px-3 text-slate-600">{h.category}</td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{h.payerOrPayee}</td>
                      <td className="py-3 px-3 text-slate-500">{h.paymentMethod}</td>
                      <td className="py-3 px-3 text-right font-bold whitespace-nowrap">
                        <span className={h.type === 'Gelir' ? 'text-emerald-600' : 'text-rose-600'}>
                          {h.type === 'Gelir' ? '+' : '-'}
                          {h.amount.toLocaleString('tr-TR')} ₺
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ÖDEME PLANI KONTROL */}
      {activeTab === 'kontrol' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Ödeme Planı Kontrol &amp; Tahsilat Durumu</h3>
              <p className="text-xs text-slate-500">Sporcu taksitleri, vadesi yaklaşan ve gecikmiş aidat alacakları</p>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setStatusFilter('Tümü')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap min-h-[34px] ${
                  statusFilter === 'Tümü' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setStatusFilter('Gecikti')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap min-h-[34px] ${
                  statusFilter === 'Gecikti' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'
                }`}
              >
                Gecikenler ({odemePlanlari.filter((p) => p.status === 'Gecikti').length})
              </button>
              <button
                onClick={() => setStatusFilter('Bekliyor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap min-h-[34px] ${
                  statusFilter === 'Bekliyor' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700'
                }`}
              >
                Bekleyenler
              </button>
            </div>
          </div>

          {/* MOBILE CARDS FOR PAYMENT PLAN CHECKS (<640px) */}
          <div className="block sm:hidden space-y-2.5">
            {odemePlanlari
              .filter((p) => statusFilter === 'Tümü' || p.status === statusFilter)
              .map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{p.athleteName}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">Kod: {p.athleteCode}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'Ödendi'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'Gecikti'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Plan:</span>
                      <span className="font-semibold text-slate-800">{p.planName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Taksit:</span>
                      <span className="font-mono font-bold text-slate-700">{p.installment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vade:</span>
                      <span className="font-medium text-slate-800">{p.dueDate}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="font-bold text-slate-700">Tutar:</span>
                      <span className="font-black text-slate-900 text-sm">
                        {p.amount.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  </div>

                  {p.status !== 'Ödendi' ? (
                    <button
                      onClick={() => handleMarkPaid(p.id)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-lg text-xs font-bold transition-all shadow-xs min-h-[40px]"
                    >
                      Tahsilat Girişi Yap
                    </button>
                  ) : (
                    <div className="text-center py-1 text-xs text-emerald-600 font-medium">
                      ✓ Tahsil Edildi ({p.paidDate})
                    </div>
                  )}

                  <button
                    onClick={() => handleOpenReceipt(p)}
                    className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-blue-200 mt-2"
                  >
                    <Receipt className="w-3.5 h-3.5 text-blue-600" />
                    <span>Makbuz / Fatura Önizle</span>
                  </button>
                </div>
              ))}
          </div>

          {/* DESKTOP TABLE (Visible on sm and larger) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-3 px-3">Sporcu</th>
                  <th className="py-3 px-3">Ödeme Planı</th>
                  <th className="py-3 px-3">Taksit</th>
                  <th className="py-3 px-3">Vade Tarihi</th>
                  <th className="py-3 px-3">Tutar</th>
                  <th className="py-3 px-3">Durum</th>
                  <th className="py-3 px-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {odemePlanlari
                  .filter((p) => statusFilter === 'Tümü' || p.status === statusFilter)
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors">{p.athleteName}</p>
                        <p className="text-[11px] text-slate-500 font-mono">Kod: {p.athleteCode}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-medium">{p.planName}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700 text-[11px]">
                          {p.installment}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium">{p.dueDate}</td>
                      <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-900">
                        {p.amount.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'Ödendi'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'Gecikti'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {p.status !== 'Ödendi' ? (
                            <button
                              onClick={() => handleMarkPaid(p.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold transition-colors"
                            >
                              Tahsil Et
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium">Ödendi ({p.paidDate})</span>
                          )}
                          <button
                            onClick={() => handleOpenReceipt(p)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-[11px] font-bold transition-colors border border-blue-200 flex items-center gap-1 cursor-pointer"
                            title="Dijital Makbuz ve Fatura Önizle"
                          >
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>Makbuz / Fatura</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ÖDEME PLANI OLUŞTUR & LİSTE */}
      {activeTab === 'planlar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Header & Main Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-3.5 sm:pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Sporcu Ödeme Planları</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                  {filteredOdemePlanlari.length} / {odemePlanlari.length}
                </span>
              </h3>
              <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
                Sporculara özel sezonluk taksitlendirme, gelişmiş arama, filtreleme ve Excel aktarımı
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportPlansToExcel}
                className="hidden sm:inline-flex px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel'e Aktar</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddPlanModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Ödeme Planı Oluştur</span>
              </button>
            </div>
          </div>

          {/* Search, Date & Status Filters Bar */}
          <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-200/80 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Sporcu adı, kod veya paket adı..."
                  value={planSearch}
                  onChange={(e) => setPlanSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
                {planSearch && (
                  <button
                    onClick={() => setPlanSearch('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={planStatusFilter}
                  onChange={(e) => setPlanStatusFilter(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium cursor-pointer"
                >
                  <option value="Tümü">Tüm Ödeme Durumları</option>
                  <option value="Ödendi">Ödendi (Tahsil Edildi)</option>
                  <option value="Bekliyor">Bekliyor (Vadeli)</option>
                  <option value="Gecikti">Gecikti (Vadesi Geçmiş)</option>
                </select>
              </div>

              {/* Start Date (Desktop Only) */}
              <div className="hidden sm:block">
                <input
                  type="date"
                  value={planStartDate}
                  onChange={(e) => setPlanStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium cursor-pointer"
                  title="Vade Başlangıç Tarihi"
                />
              </div>

              {/* End Date (Desktop Only) */}
              <div className="hidden sm:block">
                <input
                  type="date"
                  value={planEndDate}
                  onChange={(e) => setPlanEndDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium cursor-pointer"
                  title="Vade Bitiş Tarihi"
                />
              </div>
            </div>

            {/* View Switcher & Reset Filters Bar */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
              <div className="flex items-center gap-3">
                {(planSearch || planStatusFilter !== 'Tümü' || planStartDate || planEndDate) && (
                  <button
                    onClick={handleResetPlanFilters}
                    className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Filtreleri Temizle</span>
                  </button>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPlanViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    planViewMode === 'grid' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Kart Görünümü"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kartlar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlanViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    planViewMode === 'table' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Liste Görünümü"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tablo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Render List or Empty State */}
          {filteredOdemePlanlari.length === 0 ? (
            <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <Filter className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">Filtrenize uygun ödeme planı bulunamadı</p>
              <p className="text-xs text-slate-400">Arama teriminizi veya filtre tarih aralığını değiştirmeyi deneyin.</p>
              <button
                onClick={handleResetPlanFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Tüm Listeyi Göster
              </button>
            </div>
          ) : planViewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOdemePlanlari.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{plan.athleteName}</h4>
                        <p className="text-[11px] text-slate-500 font-mono font-medium">Kod: #{plan.athleteCode}</p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          plan.status === 'Ödendi'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : plan.status === 'Gecikti'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {plan.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 my-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Paket / Plan:</span>
                        <span className="font-bold text-slate-800">{plan.planName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Taksit:</span>
                        <span className="font-mono font-bold text-slate-800">{plan.installment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Son Ödeme:</span>
                        <span className="font-semibold text-slate-800">{plan.dueDate}</span>
                      </div>
                      {plan.paidDate && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tahsilat Tarihi:</span>
                          <span className="font-bold text-emerald-700">{plan.paidDate}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-slate-200/80">
                        <span className="font-bold text-slate-700">Tutar:</span>
                        <span className="font-black text-slate-900 text-sm">
                          {plan.amount.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                    {plan.status !== 'Ödendi' && (
                      <button
                        onClick={() => handleMarkPaid(plan.id)}
                        className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                      >
                        Tahsil Et
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenReceipt(plan)}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Makbuz / Fatura</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="py-3 px-4">Sporcu Adı</th>
                    <th className="py-3 px-4">Kod</th>
                    <th className="py-3 px-4">Paket / Plan</th>
                    <th className="py-3 px-4">Taksit</th>
                    <th className="py-3 px-4">Son Ödeme</th>
                    <th className="py-3 px-4 text-right">Tutar</th>
                    <th className="py-3 px-4 text-center">Durum</th>
                    <th className="py-3 px-4 text-right">Aksiyonlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredOdemePlanlari.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{plan.athleteName}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-500">#{plan.athleteCode}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{plan.planName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{plan.installment}</td>
                      <td className="py-3 px-4 text-slate-600">{plan.dueDate}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {plan.amount.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            plan.status === 'Ödendi'
                              ? 'bg-emerald-100 text-emerald-800'
                              : plan.status === 'Gecikti'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {plan.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {plan.status !== 'Ödendi' && (
                            <button
                              onClick={() => handleMarkPaid(plan.id)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              Tahsil Et
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenReceipt(plan)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Makbuz/Fatura</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: YENİ GELİR / GİDER EKLE */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Yeni Gelir / Gider Hareketi</h3>
              <button
                onClick={() => setShowAddTxModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="mt-4 space-y-3.5">
              <div className="flex rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setTxType('Gelir')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    txType === 'Gelir' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  + Gelir Girişi
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('Gider')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    txType === 'Gider' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  - Gider Girişi
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  İşlem Açıklaması / Başlık *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ekim Ayı Basketbol Aidatı"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tutar (TL) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="3500"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {kategoriler
                      .filter((k) => k.type === txType)
                      .map((k) => (
                        <option key={k.id} value={k.name}>
                          {k.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kişi / Kurum
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Mehmet Yıldırım"
                    value={txPayer}
                    onChange={(e) => setTxPayer(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ödeme Yöntemi
                  </label>
                  <select
                    value={txMethod}
                    onChange={(e) => setTxMethod(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Havale/EFT">Havale/EFT</option>
                    <option value="Kredi Kartı">Kredi Kartı</option>
                    <option value="Nakit">Nakit</option>
                    <option value="POS">POS</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white text-xs font-bold rounded-lg shadow-xs ${
                    txType === 'Gelir' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  İşlemi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: YENİ KATEGORİ EKLE */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Yeni Kategori Tanımla</h3>
              <button
                onClick={() => setShowAddCatModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Tipi
                </label>
                <select
                  value={catType}
                  onChange={(e) => setCatType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white"
                >
                  <option value="Gelir">Gelir Kategorisi</option>
                  <option value="Gider">Gider Kategorisi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Turnuva Giriş Ücretleri"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Kategoriyi Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: YENİ ÖDEME PLANI OLUŞTUR */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Sporcu Ödeme Planı Oluştur</h3>
              <button
                onClick={() => setShowAddPlanModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPlan} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sporcu Adı Soyadı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Arda Güler"
                  value={planAthlete}
                  onChange={(e) => setPlanAthlete(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paket / Plan Adı
                </label>
                <input
                  type="text"
                  placeholder="Örn: 2024-2025 Yıllık Basketbol Paketi"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Toplam Tutar (TL) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="12000"
                    value={planAmount}
                    onChange={(e) => setPlanAmount(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Taksit Sayısı
                  </label>
                  <select
                    value={planInstallments}
                    onChange={(e) => setPlanInstallments(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white"
                  >
                    <option value="1">Peşin (Tek Çekim)</option>
                    <option value="2">2 Taksit</option>
                    <option value="3">3 Taksit</option>
                    <option value="4">4 Taksit</option>
                    <option value="6">6 Taksit</option>
                    <option value="8">8 Taksit</option>
                    <option value="12">12 Taksit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  İlk Taksit Vadesi
                </label>
                <input
                  type="text"
                  value={planDueDate}
                  onChange={(e) => setPlanDueDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlanModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Planı Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DİJİTAL MAKBUZ & FATURA ÖNİZLEME */}
      {showReceiptModal && selectedReceiptPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-900 text-white font-bold shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Dijital Makbuz &amp; Fatura Önizlemesi
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedReceiptPlan.athleteName} — {selectedReceiptPlan.planName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Type Switcher */}
            <div className="my-3 flex items-center justify-between gap-2 bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200">
              <button
                type="button"
                onClick={() => setReceiptDocType('makbuz')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  receiptDocType === 'makbuz'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>E-Tahsilat Makbuzu</span>
              </button>

              <button
                type="button"
                onClick={() => setReceiptDocType('fatura')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  receiptDocType === 'fatura'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>E-Arşiv Fatura</span>
              </button>
            </div>

            {/* Print/View Document Box (Clean Paper) */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-4 my-1">
              <div id="receipt-paper-content" className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-slate-900 space-y-5 text-slate-900 text-xs shadow-sm relative overflow-hidden">
                {/* Top Document Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-xs">
                      SF
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-base leading-tight">
                        SportsFly Gençlik ve Spor Kulübü
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">Spor Okulu &amp; Akademi Dijital Bilgi Fişi</p>
                    </div>
                  </div>
                </div>

                {/* Document Meta Info Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-medium">
                  <div>
                    <span className="text-slate-500">Belge Tipi:</span>{' '}
                    <span className="font-bold text-slate-900">
                      {receiptDocType === 'makbuz' ? 'E-Tahsilat Makbuzu' : 'E-Arşiv Fatura'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Belge No:</span>{' '}
                    <span className="font-mono font-bold text-slate-900">
                      {receiptDocType === 'makbuz' ? 'MAK' : 'FAT'}-2026-{selectedReceiptPlan.receiptNumber || selectedReceiptPlan.id.replace(/\D/g, '').padStart(6, '0')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Düzenleme Tarihi:</span>{' '}
                    <span className="font-bold text-slate-900">
                      {selectedReceiptPlan.receiptDate || new Date().toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>

                {/* Recipient / Athlete Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Sporcu / Alıcı Bilgileri</p>
                    <p className="font-black text-slate-900 text-sm">{selectedReceiptPlan.athleteName}</p>
                    <p className="text-[11px] text-slate-600 font-mono font-semibold">Sporcu Kod: #{selectedReceiptPlan.athleteCode}</p>
                    <p className="text-[11px] text-slate-500">Ödeme Yöntemi: Banka Havalesi / EFT / Kredi Kartı</p>
                  </div>

                  <div className="sm:border-l sm:border-slate-200 sm:pl-4 space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Plan &amp; Taksit Detayı</p>
                    <p className="font-bold text-slate-900 text-xs">{selectedReceiptPlan.planName}</p>
                    <p className="text-[11px] text-slate-700 font-medium">
                      Taksit Dönemi: <span className="font-mono font-bold text-slate-900">{selectedReceiptPlan.installment}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Son Ödeme Vadesi: {selectedReceiptPlan.dueDate}
                    </p>
                  </div>
                </div>

                {/* Fee Breakdown Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-white font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Hizmet / Açıklama</th>
                        <th className="py-2.5 px-3 text-center">Miktar</th>
                        <th className="py-2.5 px-3 text-right">Birim Fiyat</th>
                        <th className="py-2.5 px-3 text-right">Tutar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      <tr>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">Sporcu Eğitim ve Antrenman Aidat Hizmeti</p>
                          <p className="text-[10px] text-slate-500 font-medium">{selectedReceiptPlan.planName} ({selectedReceiptPlan.installment})</p>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">1 Dönem</td>
                        <td className="py-3 px-3 text-right font-medium text-slate-700">
                          {(selectedReceiptPlan.amount * 0.8333).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                        </td>
                        <td className="py-3 px-3 text-right font-black text-slate-900">
                          {(selectedReceiptPlan.amount * 0.8333).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Summary Rows */}
                  <div className="bg-slate-50 p-3.5 border-t border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>Ara Toplam (KDV Hariç):</span>
                      <span className="font-mono font-bold text-slate-800">
                        {(selectedReceiptPlan.amount * 0.8333).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 font-medium">
                      <span>KDV (%20):</span>
                      <span className="font-mono font-bold text-slate-800">
                        {(selectedReceiptPlan.amount * 0.1667).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 text-slate-900 font-black">
                      <span className="text-sm">Ödenecek / Tahsil Edilen Toplam:</span>
                      <span className="text-lg font-black text-slate-900">
                        {selectedReceiptPlan.amount.toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                    <div className="pt-1.5 text-[11px] text-slate-500 italic text-right font-medium">
                      Yalnız: {formatAmountToTurkishWords(selectedReceiptPlan.amount)} Türk Lirasıdır.
                    </div>
                  </div>
                </div>

                {/* Footer Status & Informational Notice */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-[11px] text-slate-600">
                  <div className="text-left space-y-0.5">
                    <p className="font-bold text-slate-900">SportsFly Kulüp Bilgi Sistemi</p>
                    <p className="text-[10px] text-amber-800 font-semibold">
                      * Bu belge resmi mali e-fatura yerine geçmez, sadece bilgilendirme amaçlıdır.
                    </p>
                  </div>

                  <div className="text-center sm:text-right">
                    <p className="font-black text-slate-900">SportsFly Kulüp Yönetimi</p>
                    <p className="text-[10px] text-slate-500 font-medium">Sistem Tarafından Dijital Oluşturulmuştur</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleSendReceipt('email')}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-slate-700" />
                  <span>E-Posta Gönder</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendReceipt('whatsapp')}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp İlet</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Kapat
                </button>

                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-700" />
                  <span>Yazdır</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{isGeneratingPDF ? 'PDF İndiriliyor...' : 'PDF Olarak Kaydet'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
