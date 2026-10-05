import React, { useState, useMemo, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit,
  UserCheck,
  Building,
  Download,
  ChevronRight,
  ShieldCheck,
  X,
  PlusCircle,
  MinusCircle,
  PackageCheck,
  Layers,
  MapPin,
  DollarSign,
  ArrowRightLeft,
  LayoutGrid,
  Table as TableIcon,
  BarChart3,
  History,
  Check,
  Send,
  Building2,
  ExternalLink,
  ArrowUpRight,
  Filter,
  Eye,
  RefreshCw,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { EnvanterItem, EnvanterKategori, EnvanterDurum, EnvanterTransferLog } from '../../../types';
import {
  getStoredEnvanter,
  saveStoredEnvanter,
  getStoredEnvanterTransfers,
  saveStoredEnvanterTransfers,
} from '../../../data/modullerData';
import { getStoredSubeler, Sube } from '../../../data/subeData';

interface EnvanterYonetimiViewProps {
  selectedClubFilter?: string;
  onToast?: (msg: string) => void;
}

type TabType = 'overview' | 'items' | 'transfers' | 'matrix';

export const EnvanterYonetimiView: React.FC<EnvanterYonetimiViewProps> = ({
  selectedClubFilter = 'all',
  onToast,
}) => {
  const [items, setItems] = useState<EnvanterItem[]>(() => getStoredEnvanter());
  const [transfers, setTransfers] = useState<EnvanterTransferLog[]>(() => getStoredEnvanterTransfers());
  const [subeler, setSubeler] = useState<Sube[]>(() => getStoredSubeler());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Filter States
  const [selectedSubeFilter, setSelectedSubeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EnvanterItem | null>(null);
  const [selectedItemDetail, setSelectedItemDetail] = useState<EnvanterItem | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showZimmetModal, setShowZimmetModal] = useState<EnvanterItem | null>(null);
  const [zimmetPersonInput, setZimmetPersonInput] = useState('');

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Partial<EnvanterItem>>({
    code: '',
    name: '',
    category: 'Toplar',
    club: 'DigiMondi',
    branch: 'Basketbol',
    subeId: 'sube-kadikoy',
    subeAd: 'Kadıköy Merkez Spor Tesisi',
    totalQuantity: 10,
    inUseQuantity: 8,
    inStorageQuantity: 2,
    minQuantityAlert: 4,
    unit: 'Adet',
    condition: 'Yeni / Mükemmel',
    location: 'A Salonu Malzeme Dolabı',
    assignedTo: '',
    unitPrice: 500,
    notes: '',
  });

  // Transfer Form State
  const [transferForm, setTransferForm] = useState({
    itemId: '',
    fromSubeId: '',
    toSubeId: '',
    quantity: 1,
    transferredBy: 'Sistem Yöneticisi',
    notes: '',
  });

  useEffect(() => {
    const handleSubelerUpdated = (e: CustomEvent<Sube[]>) => {
      if (e.detail) setSubeler(e.detail);
    };
    window.addEventListener('sportsfly_subeler_updated' as any, handleSubelerUpdated);
    return () => {
      window.removeEventListener('sportsfly_subeler_updated' as any, handleSubelerUpdated);
    };
  }, []);

  const showNotification = (msg: string) => {
    if (onToast) onToast(msg);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered items list
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedSubeFilter !== 'all' && (item.subeId || 'sube-kadikoy') !== selectedSubeFilter) {
        return false;
      }
      if (selectedClubFilter !== 'all' && item.club !== selectedClubFilter) {
        return false;
      }
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedCondition !== 'all' && item.condition !== selectedCondition) {
        return false;
      }
      if (onlyLowStock && item.totalQuantity > item.minQuantityAlert) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        const matchAssigned = item.assignedTo?.toLowerCase().includes(q) || false;
        const matchBranch = item.branch.toLowerCase().includes(q);
        const matchSube = item.subeAd?.toLowerCase().includes(q) || false;
        return matchName || matchCode || matchLoc || matchAssigned || matchBranch || matchSube;
      }
      return true;
    });
  }, [items, selectedSubeFilter, selectedClubFilter, selectedCategory, selectedCondition, onlyLowStock, searchQuery]);

  // Overall Statistics (respecting current branch filter)
  const stats = useMemo(() => {
    const baseItems = items.filter((item) => {
      if (selectedSubeFilter !== 'all' && (item.subeId || 'sube-kadikoy') !== selectedSubeFilter) return false;
      if (selectedClubFilter !== 'all' && item.club !== selectedClubFilter) return false;
      return true;
    });

    const totalTypes = baseItems.length;
    const totalUnits = baseItems.reduce((acc, i) => acc + (i.totalQuantity || 0), 0);
    const lowStockItems = baseItems.filter((i) => i.totalQuantity <= i.minQuantityAlert);
    const inUseCount = baseItems.reduce((acc, i) => acc + (i.inUseQuantity || 0), 0);
    const inStorageCount = baseItems.reduce((acc, i) => acc + (i.inStorageQuantity || 0), 0);
    const totalValue = baseItems.reduce((acc, i) => acc + (i.totalQuantity * (i.unitPrice || 0)), 0);

    return { totalTypes, totalUnits, lowStockItems, inUseCount, inStorageCount, totalValue };
  }, [items, selectedSubeFilter, selectedClubFilter]);

  // Branch summaries for Branch Cards
  const branchSummaries = useMemo(() => {
    return subeler.map((sube) => {
      const subeItems = items.filter((i) => (i.subeId || 'sube-kadikoy') === sube.id);
      const totalUnits = subeItems.reduce((acc, i) => acc + (i.totalQuantity || 0), 0);
      const totalValue = subeItems.reduce((acc, i) => acc + (i.totalQuantity * (i.unitPrice || 0)), 0);
      const lowStockCount = subeItems.filter((i) => i.totalQuantity <= i.minQuantityAlert).length;
      return {
        sube,
        itemCount: subeItems.length,
        totalUnits,
        totalValue,
        lowStockCount,
      };
    });
  }, [subeler, items]);

  // Quick Stock Adjustment (+ / -)
  const handleAdjustStock = (itemId: string, delta: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = items.map((item) => {
      if (item.id === itemId) {
        const newTotal = Math.max(0, item.totalQuantity + delta);
        const newInStorage = Math.max(0, item.inStorageQuantity + delta);
        return {
          ...item,
          totalQuantity: newTotal,
          inStorageQuantity: newInStorage,
          lastCheckDate: new Date().toLocaleDateString('tr-TR'),
          lastCheckedBy: 'Sistem Yöneticisi',
        };
      }
      return item;
    });
    setItems(updated);
    saveStoredEnvanter(updated);
    if (selectedItemDetail?.id === itemId) {
      setSelectedItemDetail(updated.find((i) => i.id === itemId) || null);
    }
    showNotification(delta > 0 ? 'Stok adedi +1 artırıldı.' : 'Stok adedi -1 azaltıldı.');
  };

  // Delete Item
  const handleDeleteItem = (itemId: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`"${name}" malzemesini silmek istediğinize emin misiniz?`)) {
      const updated = items.filter((i) => i.id !== itemId);
      setItems(updated);
      saveStoredEnvanter(updated);
      if (selectedItemDetail?.id === itemId) setSelectedItemDetail(null);
      showNotification(`"${name}" envanterden silindi.`);
    }
  };

  // Save Add/Edit Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showNotification('Lütfen malzeme adını giriniz.');
      return;
    }

    const matchedSube = subeler.find((s) => s.id === formData.subeId) || subeler[0];
    const subeAd = matchedSube ? matchedSube.ad : 'Kadıköy Merkez Spor Tesisi';
    const subeId = matchedSube ? matchedSube.id : 'sube-kadikoy';

    if (editingItem) {
      const updated = items.map((item) =>
        item.id === editingItem.id
          ? ({
              ...item,
              ...formData,
              subeId,
              subeAd,
              totalQuantity: Number(formData.totalQuantity || 0),
              inUseQuantity: Number(formData.inUseQuantity || 0),
              inStorageQuantity: Number(formData.inStorageQuantity || 0),
              minQuantityAlert: Number(formData.minQuantityAlert || 0),
              unitPrice: Number(formData.unitPrice || 0),
              lastCheckDate: new Date().toLocaleDateString('tr-TR'),
            } as EnvanterItem)
          : item
      );
      setItems(updated);
      saveStoredEnvanter(updated);
      showNotification(`"${formData.name}" güncellendi.`);
    } else {
      const nextCode = formData.code?.trim() || `ENV-${Date.now().toString().slice(-4)}`;
      const newItem: EnvanterItem = {
        id: `env-${Date.now()}`,
        code: nextCode,
        name: formData.name.trim(),
        category: (formData.category as EnvanterKategori) || 'Toplar',
        club: formData.club || 'DigiMondi',
        branch: formData.branch || 'Basketbol',
        subeId,
        subeAd,
        totalQuantity: Number(formData.totalQuantity || 1),
        inUseQuantity: Number(formData.inUseQuantity || 0),
        inStorageQuantity: Number(formData.inStorageQuantity || formData.totalQuantity || 1),
        minQuantityAlert: Number(formData.minQuantityAlert || 3),
        unit: formData.unit || 'Adet',
        condition: (formData.condition as EnvanterDurum) || 'Yeni / Mükemmel',
        location: formData.location || `${subeAd} Malzeme Odası`,
        assignedTo: formData.assignedTo || '',
        assignedDate: formData.assignedTo ? new Date().toLocaleDateString('tr-TR') : undefined,
        lastCheckDate: new Date().toLocaleDateString('tr-TR'),
        lastCheckedBy: 'Sistem Yöneticisi',
        unitPrice: Number(formData.unitPrice || 0),
        notes: formData.notes || '',
        photoUrl: formData.photoUrl || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80',
      };
      const updated = [newItem, ...items];
      setItems(updated);
      saveStoredEnvanter(updated);
      showNotification(`"${newItem.name}" eklendi.`);
    }

    setShowAddModal(false);
    setEditingItem(null);
  };

  // Perform Inter-Branch Transfer
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferForm.itemId || !transferForm.fromSubeId || !transferForm.toSubeId) {
      showNotification('Lütfen malzeme ve şubeleri seçiniz.');
      return;
    }
    if (transferForm.fromSubeId === transferForm.toSubeId) {
      showNotification('Çıkış ve varış şubesi aynı olamaz.');
      return;
    }

    const sourceItem = items.find((i) => i.id === transferForm.itemId);
    if (!sourceItem) {
      showNotification('Kaynak malzeme bulunamadı.');
      return;
    }

    const transferQty = Number(transferForm.quantity) || 1;
    if (sourceItem.totalQuantity < transferQty) {
      showNotification(`Yetersiz stok! Kaynak şubede ${sourceItem.totalQuantity} adet bulunmaktadır.`);
      return;
    }

    const fromSube = subeler.find((s) => s.id === transferForm.fromSubeId);
    const toSube = subeler.find((s) => s.id === transferForm.toSubeId);
    const fromSubeAd = fromSube ? fromSube.ad : 'Kaynak Şube';
    const toSubeAd = toSube ? toSube.ad : 'Hedef Şube';

    // Update source item
    let updatedItems = items.map((i) => {
      if (i.id === sourceItem.id) {
        return {
          ...i,
          totalQuantity: i.totalQuantity - transferQty,
          inStorageQuantity: Math.max(0, i.inStorageQuantity - transferQty),
          lastCheckDate: new Date().toLocaleDateString('tr-TR'),
          lastCheckedBy: transferForm.transferredBy || 'Transfer Amiri',
        };
      }
      return i;
    });

    // Add or update destination item
    const existingDestItem = updatedItems.find(
      (i) => i.name.toLowerCase() === sourceItem.name.toLowerCase() && i.subeId === transferForm.toSubeId
    );

    if (existingDestItem) {
      updatedItems = updatedItems.map((i) => {
        if (i.id === existingDestItem.id) {
          return {
            ...i,
            totalQuantity: i.totalQuantity + transferQty,
            inStorageQuantity: i.inStorageQuantity + transferQty,
            lastCheckDate: new Date().toLocaleDateString('tr-TR'),
          };
        }
        return i;
      });
    } else {
      const newDestItem: EnvanterItem = {
        ...sourceItem,
        id: `env-${Date.now()}`,
        code: `${sourceItem.code.split('-')[0] || 'ENV'}-${toSube?.kod || 'SUB'}-${Math.floor(100 + Math.random() * 900)}`,
        subeId: transferForm.toSubeId,
        subeAd: toSubeAd,
        totalQuantity: transferQty,
        inUseQuantity: 0,
        inStorageQuantity: transferQty,
        location: `${toSubeAd} Ana Depo`,
        assignedTo: '',
        lastCheckDate: new Date().toLocaleDateString('tr-TR'),
      };
      updatedItems.push(newDestItem);
    }

    // Transfer record
    const newLog: EnvanterTransferLog = {
      id: `trf-${Date.now()}`,
      itemId: sourceItem.id,
      itemName: sourceItem.name,
      itemCode: sourceItem.code,
      fromSubeId: transferForm.fromSubeId,
      fromSubeAd,
      toSubeId: transferForm.toSubeId,
      toSubeAd,
      quantity: transferQty,
      unit: sourceItem.unit,
      transferDate: new Date().toLocaleDateString('tr-TR'),
      transferredBy: transferForm.transferredBy || 'Sistem Yöneticisi',
      notes: transferForm.notes || 'Şubeler arası sevk',
      status: 'Tamamlandı',
    };

    const newTransfers = [newLog, ...transfers];
    setItems(updatedItems);
    saveStoredEnvanter(updatedItems);
    setTransfers(newTransfers);
    saveStoredEnvanterTransfers(newTransfers);
    setShowTransferModal(false);
    showNotification(`${transferQty} ${sourceItem.unit} "${sourceItem.name}" başarıyla sevk edildi.`);
  };

  // Zimmet Save
  const handleSaveZimmet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showZimmetModal) return;
    const updated = items.map((item) => {
      if (item.id === showZimmetModal.id) {
        return {
          ...item,
          assignedTo: zimmetPersonInput.trim(),
          assignedDate: zimmetPersonInput.trim() ? new Date().toLocaleDateString('tr-TR') : undefined,
          lastCheckDate: new Date().toLocaleDateString('tr-TR'),
        };
      }
      return item;
    });
    setItems(updated);
    saveStoredEnvanter(updated);
    showNotification(zimmetPersonInput.trim() ? `Zimmet ${zimmetPersonInput} kullanıcısına atandı.` : 'Zimmet kaydı kaldırıldı.');
    setShowZimmetModal(null);
    setZimmetPersonInput('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Kod', 'Malzeme Adı', 'Şube', 'Kategori', 'Toplam Adet', 'Kullanımda', 'Depoda', 'Durum', 'Konum', 'Zimmetli', 'Birim Fiyat', 'Toplam Tutar'];
    const rows = filteredItems.map((i) => [
      i.code,
      `"${i.name}"`,
      `"${i.subeAd || 'Merkez'}"`,
      i.category,
      i.totalQuantity,
      i.inUseQuantity,
      i.inStorageQuantity,
      i.condition,
      `"${i.location}"`,
      `"${i.assignedTo || '-'}"`,
      i.unitPrice || 0,
      i.totalQuantity * (i.unitPrice || 0),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `SportsFly_Envanter_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Envanter listesi CSV olarak indirildi.');
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50/50 dark:bg-[#0b1320] text-slate-800 dark:text-slate-100 antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700/60 flex items-center gap-3 animate-in fade-in duration-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP BAR: Clean, Quiet Header with Actions */}
      <header className="bg-white dark:bg-[#111c2e] border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title & Branch Context */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Yönetim &amp; Tesis</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Envanter ve Malzeme Yönetimi</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Envanter Yönetimi
                </h1>
                {/* Active Sube Quick Selector */}
                <select
                  value={selectedSubeFilter}
                  onChange={(e) => setSelectedSubeFilter(e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">🏢 Tüm Şubeler ({items.length} Kalem)</option>
                  {subeler.map((s) => {
                    const count = items.filter((i) => (i.subeId || 'sube-kadikoy') === s.id).length;
                    return (
                      <option key={s.id} value={s.id}>
                        📍 {s.ad} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setTransferForm({
                    itemId: items[0]?.id || '',
                    fromSubeId: items[0]?.subeId || 'sube-kadikoy',
                    toSubeId: subeler[1]?.id || 'sube-atasehir',
                    quantity: 1,
                    transferredBy: 'Sistem Yöneticisi',
                    notes: '',
                  });
                  setShowTransferModal(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Şubeler Arası Sevk</span>
              </button>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setFormData({
                    code: `ENV-${Math.floor(1000 + Math.random() * 9000)}`,
                    name: '',
                    category: 'Toplar',
                    club: 'DigiMondi',
                    branch: 'Basketbol',
                    subeId: selectedSubeFilter !== 'all' ? selectedSubeFilter : 'sube-kadikoy',
                    subeAd: subeler.find((s) => s.id === (selectedSubeFilter !== 'all' ? selectedSubeFilter : 'sube-kadikoy'))?.ad || 'Kadıköy Merkez Spor Tesisi',
                    totalQuantity: 10,
                    inUseQuantity: 8,
                    inStorageQuantity: 2,
                    minQuantityAlert: 4,
                    unit: 'Adet',
                    condition: 'Yeni / Mükemmel',
                    location: 'A Salonu Malzeme Dolabı',
                    assignedTo: '',
                    unitPrice: 750,
                    notes: '',
                  });
                  setShowAddModal(true);
                }}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Malzeme</span>
              </button>
            </div>
          </div>

          {/* Clean Segmented Navigation Tabs */}
          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 overflow-x-auto scrollbar-none">
            <button
              onClick={() => {
                setActiveTab('overview');
                setOnlyLowStock(false);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Genel Bakış</span>
            </button>

            <button
              onClick={() => setActiveTab('items')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'items'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Malzeme Kataloğu</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {filteredItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('transfers')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'transfers'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Transfer &amp; Sevk Geçmişi</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {transfers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Şube Stok Matrisi</span>
            </button>
          </div>
        </div>
      </header>

      {/* BODY CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        {/* ========================================================= */}
        {/* TAB 1: GENEL BAKIŞ (OVERVIEW) - SADE, DÜZENLİ VE ANLAŞILIR */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4 Clean Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#111c2e] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Toplam Ekipman</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {stats.totalUnits}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">({stats.totalTypes} çeşit)</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                  {selectedSubeFilter === 'all' ? 'Tüm şubeler kayıtlı' : 'Seçili şube stoğu'}
                </div>
              </div>

              <div className="bg-white dark:bg-[#111c2e] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Aktif Kullanımda</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    {stats.inUseCount}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/ {stats.inStorageCount} depoda</span>
                </div>
                <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Antrenman ve maçlarda</span>
                </div>
              </div>

              <div
                onClick={() => {
                  setOnlyLowStock(true);
                  setActiveTab('items');
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  stats.lowStockItems.length > 0
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                    : 'bg-white dark:bg-[#111c2e] border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Kritik Stok Uyarısı</div>
                  {stats.lowStockItems.length > 0 && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span
                    className={`text-2xl font-bold tracking-tight tabular-nums ${
                      stats.lowStockItems.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {stats.lowStockItems.length}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">ürün sınırda</span>
                </div>
                <div className="mt-2 text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                  <span>Listeyi filtrele</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>

              <div className="bg-white dark:bg-[#111c2e] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Toplam Envanter Değeri</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                    ₺{stats.totalValue.toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400">Demirbaş kayıt tutarı</div>
              </div>
            </div>

            {/* Quick Sube Cards: Clickable & Informative */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Şubelere Göre Envanter Dağılımı</h2>
                <span className="text-xs text-slate-500">Tıklayarak o şubenin malzemelerini açabilirsiniz</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {branchSummaries.map(({ sube, itemCount, totalUnits, totalValue, lowStockCount }) => {
                  const isFiltered = selectedSubeFilter === sube.id;
                  return (
                    <div
                      key={sube.id}
                      onClick={() => {
                        setSelectedSubeFilter(sube.id);
                        setActiveTab('items');
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-[#111c2e] hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-sm ${
                        isFiltered ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">{sube.ad}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{sube.sehir} · {sube.kod}</div>
                        </div>
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <Building className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Malzeme Adedi:</span>
                        <span className="font-bold text-slate-900 dark:text-white tabular-nums">{totalUnits} Adet ({itemCount} çeşit)</span>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Şube Değeri:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">₺{totalValue.toLocaleString('tr-TR')}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        {lowStockCount > 0 ? (
                          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {lowStockCount} kritik ürün
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Stoklar yeterli</span>
                        )}
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                          <span>İncele</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Two-Column Section: Critical Stock & Recent Transfers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Critical Stocks Box */}
              <div className="bg-white dark:bg-[#111c2e] p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      <span>Kritik ve Azalan Stoklar</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Minimum stok eşiğinin altına düşen veya bakım gerektiren ekipmanlar
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setOnlyLowStock(true);
                      setActiveTab('items');
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Tümünü Gör
                  </button>
                </div>

                {stats.lowStockItems.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    Harika! Tüm malzemelerin stok seviyeleri güvenli eşiğin üzerinde.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats.lowStockItems.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setSelectedItemDetail(item)}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.name}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{item.subeAd}</span>
                            <span>·</span>
                            <span>{item.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                              {item.totalQuantity} {item.unit}
                            </div>
                            <div className="text-[10px] text-slate-400">Min: {item.minQuantityAlert} {item.unit}</div>
                          </div>

                          <button
                            onClick={(e) => handleAdjustStock(item.id, 1, e)}
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-semibold"
                            title="+1 Stok Ekle"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Transfers Box */}
              <div className="bg-white dark:bg-[#111c2e] p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-indigo-500" />
                      <span>Son Şubeler Arası Sevkler</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Şubeler arası gerçekleştirilen son malzeme transfer kayıtları
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('transfers')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Tüm Geçmiş
                  </button>
                </div>

                {transfers.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Henüz şubeler arası sevk kaydı bulunmamaktadır.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transfers.slice(0, 5).map((log) => (
                      <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">{log.itemName}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{log.fromSubeAd.split(' ')[0]}</span>
                            <ArrowRightLeft className="w-2.5 h-2.5 text-slate-400" />
                            <span className="font-medium text-blue-600 dark:text-blue-400">{log.toSubeAd.split(' ')[0]}</span>
                            <span>·</span>
                            <span>{log.transferDate}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            {log.quantity} {log.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MALZEME KATALOĞU (ITEMS LIST VIEW) - TEMİZ TABLO */}
        {/* ========================================================= */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            {/* Clean Filter Toolbar */}
            <div className="bg-white dark:bg-[#111c2e] p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Malzeme adı, barkod, şube veya zimmetli kişi ara..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters & Export */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">Tüm Kategoriler</option>
                  <option value="Toplar">Toplar</option>
                  <option value="Formalar & Yelekler">Formalar &amp; Yelekler</option>
                  <option value="Antrenman Ekipmanları">Antrenman Ekipmanları</option>
                  <option value="Sağlık & Medikal">Sağlık &amp; Medikal</option>
                  <option value="Tesis & Saha Donanımı">Tesis &amp; Donanım</option>
                  <option value="Elektronik & Ölçüm">Elektronik &amp; Ölçüm</option>
                </select>

                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="px-2.5 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">Tüm Kondisyonlar</option>
                  <option value="Yeni / Mükemmel">Yeni / Mükemmel</option>
                  <option value="İyi Durumda">İyi Durumda</option>
                  <option value="Yıpranmış / Kontrol">Yıpranmış / Kontrol</option>
                  <option value="Bakımda / Tamirde">Bakımda / Tamirde</option>
                  <option value="Hurda / Kullanım Dışı">Hurda / Kullanım Dışı</option>
                </select>

                <button
                  onClick={() => setOnlyLowStock(!onlyLowStock)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    onlyLowStock
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Kritik Stoklar</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  title="CSV İndir"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Clear Filter Bar if active */}
            {(selectedCategory !== 'all' || selectedCondition !== 'all' || selectedSubeFilter !== 'all' || onlyLowStock || searchQuery) && (
              <div className="flex items-center justify-between text-xs px-1 text-slate-500">
                <span>
                  Filtrelenen sonuç: <strong className="text-slate-900 dark:text-white">{filteredItems.length}</strong> malzeme
                </span>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedCondition('all');
                    setSelectedSubeFilter('all');
                    setOnlyLowStock(false);
                    setSearchQuery('');
                  }}
                  className="text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Filtreleri Sıfırla</span>
                </button>
              </div>
            )}

            {/* Clean Data Table */}
            {filteredItems.length === 0 ? (
              <div className="bg-white dark:bg-[#111c2e] p-12 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
                <Boxes className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Malzeme Bulunamadı</h4>
                <p className="text-xs text-slate-500 mt-1">Arama kriterlerinizi değiştirebilir veya yeni malzeme ekleyebilirsiniz.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#111c2e] rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-[#162238]/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                        <th className="py-3 px-4">Malzeme Tanımı</th>
                        <th className="py-3 px-4">Bulunduğu Şube</th>
                        <th className="py-3 px-4">Kategori / Branş</th>
                        <th className="py-3 px-4 text-center">Stok (Toplam / Aktif / Depo)</th>
                        <th className="py-3 px-4">Kondisyon</th>
                        <th className="py-3 px-4">Zimmetli</th>
                        <th className="py-3 px-4 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredItems.map((item) => {
                        const isLowStock = item.totalQuantity <= item.minQuantityAlert;
                        return (
                          <tr
                            key={item.id}
                            onClick={() => setSelectedItemDetail(item)}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                          >
                            {/* Malzeme Adı & Kod */}
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.code}</div>
                            </td>

                            {/* Şube & Dolap */}
                            <td className="py-3 px-4">
                              <div className="font-medium text-slate-800 dark:text-slate-200">{item.subeAd}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{item.location}</div>
                            </td>

                            {/* Kategori & Branş */}
                            <td className="py-3 px-4">
                              <span className="text-slate-700 dark:text-slate-300 font-medium">{item.category}</span>
                              <div className="text-[11px] text-slate-400">{item.branch}</div>
                            </td>

                            {/* Stok Adetleri */}
                            <td className="py-3 px-4 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <span className={`font-bold tabular-nums ${isLowStock ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                                  {item.totalQuantity} {item.unit}
                                </span>
                                <span className="text-slate-400 text-[11px]">
                                  ({item.inUseQuantity} aktif / {item.inStorageQuantity} depo)
                                </span>
                              </div>
                              {isLowStock && (
                                <div className="text-[10px] text-rose-500 font-medium">Kritik Seviye (Min: {item.minQuantityAlert})</div>
                              )}
                            </td>

                            {/* Kondisyon */}
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    item.condition === 'Yeni / Mükemmel'
                                      ? 'bg-emerald-500'
                                      : item.condition === 'İyi Durumda'
                                      ? 'bg-blue-500'
                                      : item.condition === 'Yıpranmış / Kontrol'
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                />
                                {item.condition}
                              </span>
                            </td>

                            {/* Zimmetli */}
                            <td className="py-3 px-4">
                              {item.assignedTo ? (
                                <div className="text-slate-800 dark:text-slate-200 font-medium">{item.assignedTo}</div>
                              ) : (
                                <span className="text-slate-400 text-[11px]">- Zimmet Yok -</span>
                              )}
                            </td>

                            {/* Hızlı İşlemler */}
                            <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={(e) => handleAdjustStock(item.id, -1, e)}
                                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-white"
                                  title="-1 Azalt"
                                >
                                  <MinusCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleAdjustStock(item.id, 1, e)}
                                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-white"
                                  title="+1 Arttır"
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingItem(item);
                                    setFormData({ ...item });
                                    setShowAddModal(true);
                                  }}
                                  className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                                  title="Düzenle"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteItem(item.id, item.name, e)}
                                  className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-500"
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
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ŞUBELER ARASI TRANSFER (SEVK VE GEÇMİŞ) */}
        {/* ========================================================= */}
        {activeTab === 'transfers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Quick Transfer Form */}
            <div className="bg-white dark:bg-[#111c2e] p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                <span>Hızlı Sevk / Transfer Oluştur</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">Bir şubeden diğerine ekipman transferi gerçekleştirin.</p>

              <form onSubmit={handleExecuteTransfer} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Transfer Edilecek Malzeme</label>
                  <select
                    value={transferForm.itemId}
                    onChange={(e) => {
                      const selected = items.find((i) => i.id === e.target.value);
                      setTransferForm({
                        ...transferForm,
                        itemId: e.target.value,
                        fromSubeId: selected?.subeId || 'sube-kadikoy',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.subeAd} - {i.totalQuantity} {i.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Çıkış Şubesi</label>
                    <select
                      value={transferForm.fromSubeId}
                      onChange={(e) => setTransferForm({ ...transferForm, fromSubeId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      {subeler.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.ad}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hedef Şube</label>
                    <select
                      value={transferForm.toSubeId}
                      onChange={(e) => setTransferForm({ ...transferForm, toSubeId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      {subeler.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.ad}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sevk Edilecek Miktar</label>
                  <input
                    type="number"
                    min={1}
                    value={transferForm.quantity}
                    onChange={(e) => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sevk Gerekçesi / Not</label>
                  <input
                    type="text"
                    value={transferForm.notes}
                    onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                    placeholder="Örn: Hafta sonu turnuvası takviyesi"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transferi Tamamla</span>
                </button>
              </form>
            </div>

            {/* Right: Transfer History Log Table */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111c2e] p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Şubeler Arası Transfer Kayıtları</h3>
                  <p className="text-xs text-slate-500">Tamamlanan tüm malzeme sevkiyatları ve tutanakları</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">{transfers.length} Kayıt</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-[#162238]/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                      <th className="py-2.5 px-3">Tarih</th>
                      <th className="py-2.5 px-3">Malzeme</th>
                      <th className="py-2.5 px-3">Güzergah (Çıkış &rarr; Hedef)</th>
                      <th className="py-2.5 px-3 text-center">Miktar</th>
                      <th className="py-2.5 px-3">Sorumlu &amp; Not</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {transfers.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono text-slate-500">{log.transferDate}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{log.itemName}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-slate-700 dark:text-slate-300">{log.fromSubeAd}</span>
                          <span className="text-slate-400 mx-1.5">&rarr;</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{log.toSubeAd}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-white tabular-nums">
                          {log.quantity} {log.unit}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          <div>{log.transferredBy}</div>
                          {log.notes && <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{log.notes}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ŞUBE STOK MATRİSİ (MATRIX VIEW) */}
        {/* ========================================================= */}
        {activeTab === 'matrix' && (
          <div className="bg-white dark:bg-[#111c2e] p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Şubeler Arası Karşılaştırmalı Stok Matrisi</h3>
                <p className="text-xs text-slate-500">Tüm şubelerdeki malzeme adetlerinin konsolide görünümü</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Matrisi İndir</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-[#162238]/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Malzeme Adı</th>
                    <th className="py-3 px-4">Kategori</th>
                    {subeler.map((s) => (
                      <th key={s.id} className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        {s.ad}
                      </th>
                    ))}
                    <th className="py-3 px-4 text-center font-bold text-blue-600 dark:text-blue-400">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Array.from(new Set(items.map((i) => i.name))).map((name) => {
                    const matchedItems = items.filter((i) => i.name === name);
                    const sample = matchedItems[0];
                    const totalAcross = matchedItems.reduce((acc, i) => acc + i.totalQuantity, 0);

                    return (
                      <tr key={name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{name}</td>
                        <td className="py-3 px-4 text-slate-500">{sample?.category}</td>
                        {subeler.map((s) => {
                          const subeItem = items.find((i) => i.name === name && (i.subeId || 'sube-kadikoy') === s.id);
                          const qty = subeItem?.totalQuantity || 0;
                          return (
                            <td key={s.id} className="py-3 px-4 text-center tabular-nums">
                              {qty > 0 ? (
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {qty} {sample?.unit}
                                </span>
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600">-</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-3 px-4 text-center font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                          {totalAcross} {sample?.unit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* DRAWER / MODAL: ITEM DETAIL (MALZEME DETAY KARTI) */}
      {/* ========================================================= */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-slate-50 dark:bg-[#162238] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-400">{selectedItemDetail.code}</span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{selectedItemDetail.name}</h3>
              </div>
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-[#0b1320] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 text-[11px]">Bağlı Şube</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedItemDetail.subeAd}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Dolap &amp; Konum</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedItemDetail.location}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Kategori / Branş</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedItemDetail.category} · {selectedItemDetail.branch}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Kondisyon Durumu</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedItemDetail.condition}</div>
                </div>
              </div>

              {/* Stock quantities breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Toplam Stok</div>
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-300 tabular-nums">
                    {selectedItemDetail.totalQuantity} {selectedItemDetail.unit}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Aktif Kullanımda</div>
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                    {selectedItemDetail.inUseQuantity} {selectedItemDetail.unit}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] text-slate-500 font-medium">Depoda Hazır</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {selectedItemDetail.inStorageQuantity} {selectedItemDetail.unit}
                  </div>
                </div>
              </div>

              {/* Zimmet & Valuation */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Zimmetli Sorumlu:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedItemDetail.assignedTo || 'Atanmamış (Genel Kullanım)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Birim Fiyatı &amp; Toplam Değer:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ₺{selectedItemDetail.unitPrice?.toLocaleString('tr-TR')} / ₺{(selectedItemDetail.totalQuantity * (selectedItemDetail.unitPrice || 0)).toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Son Sayım / Kontrol:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {selectedItemDetail.lastCheckDate} ({selectedItemDetail.lastCheckedBy || 'Yetkili'})
                  </span>
                </div>
                {selectedItemDetail.notes && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                    <strong>Not:</strong> {selectedItemDetail.notes}
                  </div>
                )}
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => {
                    const item = selectedItemDetail;
                    setSelectedItemDetail(null);
                    setShowZimmetModal(item);
                    setZimmetPersonInput(item.assignedTo || '');
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Zimmet Ata</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const item = selectedItemDetail;
                      setSelectedItemDetail(null);
                      setEditingItem(item);
                      setFormData({ ...item });
                      setShowAddModal(true);
                    }}
                    className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Düzenle</span>
                  </button>

                  <button
                    onClick={() => setSelectedItemDetail(null)}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT ITEM FORM */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-slate-50 dark:bg-[#162238] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Malzeme Bilgilerini Düzenle' : 'Yeni Envanter Malzemesi Tanımla'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Malzeme Kodu</label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bağlı Şube</label>
                  <select
                    value={formData.subeId || 'sube-kadikoy'}
                    onChange={(e) => {
                      const match = subeler.find((s) => s.id === e.target.value);
                      setFormData({
                        ...formData,
                        subeId: e.target.value,
                        subeAd: match?.ad || 'Kadıköy Merkez Spor Tesisi',
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {subeler.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.ad}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Malzeme Adı *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Molten BG4500 Deri Basketbol Topu"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <select
                    value={formData.category || 'Toplar'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EnvanterKategori })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Toplar">Toplar</option>
                    <option value="Formalar & Yelekler">Formalar &amp; Yelekler</option>
                    <option value="Antrenman Ekipmanları">Antrenman Ekipmanları</option>
                    <option value="Sağlık & Medikal">Sağlık &amp; Medikal</option>
                    <option value="Tesis & Saha Donanımı">Tesis &amp; Donanım</option>
                    <option value="Elektronik & Ölçüm">Elektronik &amp; Ölçüm</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Branş</label>
                  <select
                    value={formData.branch || 'Basketbol'}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Basketbol">Basketbol</option>
                    <option value="Voleybol">Voleybol</option>
                    <option value="Futbol">Futbol</option>
                    <option value="Yüzme">Yüzme</option>
                    <option value="Genel">Genel / Tesis</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Toplam Stok Adedi</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.totalQuantity ?? 10}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      setFormData({
                        ...formData,
                        totalQuantity: total,
                        inStorageQuantity: Math.max(0, total - Number(formData.inUseQuantity || 0)),
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Aktif Kullanımda</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.inUseQuantity ?? 8}
                    onChange={(e) => {
                      const inUse = Number(e.target.value);
                      setFormData({
                        ...formData,
                        inUseQuantity: inUse,
                        inStorageQuantity: Math.max(0, Number(formData.totalQuantity || 0) - inUse),
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kritik Stok Uyarısı (Min)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minQuantityAlert ?? 3}
                    onChange={(e) => setFormData({ ...formData, minQuantityAlert: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Birim Fiyat (TL)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.unitPrice ?? 500}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Şube İçi Konum / Dolap</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Örn: A Salonu Top Arabası / Depo Dolap No: 4"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Zimmetli Antrenör / Personel</label>
                  <input
                    type="text"
                    value={formData.assignedTo || ''}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder="Örn: Selman Utku (Baş Antrenör)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  {editingItem ? 'Değişiklikleri Kaydet' : 'Envantere Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ZİMMET ATAMA */}
      {/* ========================================================= */}
      {showZimmetModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-slate-50 dark:bg-[#162238] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Zimmet Sorumlusu Belirle</span>
              </h3>
              <button onClick={() => setShowZimmetModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveZimmet} className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0b1320] border border-slate-100 dark:border-slate-800">
                <div className="text-[11px] text-slate-400">Seçili Malzeme</div>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{showZimmetModal.name}</div>
                <div className="text-[11px] text-slate-500">{showZimmetModal.subeAd}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Zimmetlenecek Antrenör / Yönetici Adı
                </label>
                <input
                  type="text"
                  value={zimmetPersonInput}
                  onChange={(e) => setZimmetPersonInput(e.target.value)}
                  placeholder="Örn: Selman Utku (Boş bırakılırsa zimmet kaldırılır)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowZimmetModal(null)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Zimmeti Onayla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TOP BAR QUICK TRANSFER MODAL */}
      {/* ========================================================= */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#111c2e] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-slate-50 dark:bg-[#162238] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                <span>Şubeler Arası Malzeme Sevkiyatı</span>
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Sevk Edilecek Malzeme</label>
                <select
                  value={transferForm.itemId}
                  onChange={(e) => {
                    const selected = items.find((i) => i.id === e.target.value);
                    setTransferForm({
                      ...transferForm,
                      itemId: e.target.value,
                      fromSubeId: selected?.subeId || 'sube-kadikoy',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.subeAd} - {i.totalQuantity} {i.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Çıkış Şubesi</label>
                  <select
                    value={transferForm.fromSubeId}
                    onChange={(e) => setTransferForm({ ...transferForm, fromSubeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {subeler.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.ad}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hedef Şube</label>
                  <select
                    value={transferForm.toSubeId}
                    onChange={(e) => setTransferForm({ ...transferForm, toSubeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {subeler.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.ad}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Miktar</label>
                <input
                  type="number"
                  min={1}
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Transfer Notu</label>
                <input
                  type="text"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  placeholder="Sevk sebebi / Tutanak no..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0b1320] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Sevki Gerçekleştir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
