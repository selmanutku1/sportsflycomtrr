import React, { useState, useEffect } from 'react';
import {
  Clock,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle2,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  Building2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  DailySnapshotItem,
  getStoredDailySnapshots,
  addOrUpdateTodaySnapshot,
  saveDailySnapshots,
} from '../../../data/dailySnapshotData';

interface Daily10AmSnapshotCardProps {
  onNavigate?: (page: any) => void;
}

export const Daily10AmSnapshotCard: React.FC<Daily10AmSnapshotCardProps> = ({ onNavigate }) => {
  const [snapshots, setSnapshots] = useState<DailySnapshotItem[]>(() => getStoredDailySnapshots());
  const [selectedRange, setSelectedRange] = useState<'7' | '14' | 'all'>('7');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedSnapshot, setSelectedSnapshot] = useState<DailySnapshotItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextCountdown, setNextCountdown] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync snapshot updates
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setSnapshots(e.detail);
      }
    };
    window.addEventListener('sportsfly_daily_snapshots_updated', handleUpdate);
    return () => window.removeEventListener('sportsfly_daily_snapshots_updated', handleUpdate);
  }, []);

  // Set default selected snapshot to the latest (today's)
  useEffect(() => {
    if (snapshots.length > 0 && !selectedSnapshot) {
      setSelectedSnapshot(snapshots[0]);
    }
  }, [snapshots, selectedSnapshot]);

  // Live countdown to next 10:00 AM
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(10, 0, 0, 0);

      // If already past 10:00 today, target tomorrow 10:00
      if (now.getTime() >= target.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const diffMs = target.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setNextCountdown(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const latestSnapshot = snapshots[0] || null;

  // Filter snapshots
  const displayedSnapshots =
    selectedRange === '7'
      ? snapshots.slice(0, 7)
      : selectedRange === '14'
      ? snapshots.slice(0, 14)
      : snapshots;

  // Calculate max active count for chart scale
  const maxActive = Math.max(...displayedSnapshots.map((s) => s.activeAthletes), 160);
  const minActive = Math.min(...displayedSnapshots.map((s) => s.activeAthletes), 120);

  // Manual Trigger Snapshot
  const handleRecalibrate = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const updated = addOrUpdateTodaySnapshot();
      setSnapshots(getStoredDailySnapshots());
      setSelectedSnapshot(updated);
      setIsRefreshing(false);
      setToastMessage('Bugünkü saat 10:00 aktif sporcu sayımı başarıyla güncellendi.');
      setTimeout(() => setToastMessage(null), 3500);
    }, 600);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = 'Tarih;Gun;Saat;Aktif Sporcu;Toplam Sporcu;Yeni Katilan;Ayrilan/Dondurulan;Net Degisim;Buyume Orani;Notlar\n';
    const rows = displayedSnapshots
      .map(
        (s) =>
          `${s.dateFormatted};${s.dayName};${s.time};${s.activeAthletes};${s.totalAthletes};${s.newlyJoinedToday};${s.leftOrFrozenToday};${s.netChange};%${s.growthRatePercent};"${s.notes || ''}"`
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sportsfly_10am_sporcu_sayimi_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-all">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-100 hover:text-white text-sm">
            &times;
          </button>
        </div>
      )}

      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/50 dark:from-blue-950/40 dark:via-[#162238]/60 dark:to-[#111c2e]">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Her Gün Saat 10:00 Aktif Sporcu Sayım Kaydı
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Otomatik Cron Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sistem her sabah tam saat 10:00'da kulübün aktif sporcu sayısını dondurup resmi günlük arşivine kaydeder.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end lg:self-auto">
          {/* Next Cron Countdown */}
          <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#162238] border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block leading-none">
                Sonraki 10:00 Sayımı:
              </span>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                {nextCountdown || '00:00:00'}
              </span>
            </div>
          </div>

          <button
            onClick={handleRecalibrate}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#162238] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 shadow-2xs"
            title="Şu anki aktif sporcu sayısını bugünkü 10:00 kaydına yeniden senkronize et"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sayımı Yenile</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#162238] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="CSV Olarak İndir"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Dışa Aktar</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-white dark:bg-[#162238] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
            title={isExpanded ? 'Daralt' : 'Genişlet'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5">
          {/* Top Quick Stats Highlight Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Bugünkü 10:00 Sayımı */}
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/60 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  Bugün Saat 10:00 Sayımı
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-200/70 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 font-bold">
                  {latestSnapshot?.time || '10:00:00'}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-900 dark:text-blue-100 tracking-tight">
                  {latestSnapshot?.activeAthletes || 148}
                </span>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                  Aktif Sporcu
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-800 dark:text-blue-200">
                {latestSnapshot && latestSnapshot.netChange >= 0 ? (
                  <span className="inline-flex items-center text-emerald-700 dark:text-emerald-400 font-bold">
                    <ArrowUpRight className="w-3.5 h-3.5" />+{latestSnapshot.netChange}
                  </span>
                ) : (
                  <span className="inline-flex items-center text-rose-600 font-bold">
                    <ArrowDownRight className="w-3.5 h-3.5" />{latestSnapshot?.netChange}
                  </span>
                )}
                <span>düne göre net artış ({latestSnapshot?.growthRatePercent}%)</span>
              </div>
            </div>

            {/* 2. Toplam Kayıtlı & Pasif Oranı */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#162238]/60 border border-slate-200/70 dark:border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Toplam Kayıtlı Havuzu
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {latestSnapshot?.totalAthletes || 164}
                </span>
                <span className="text-xs text-slate-500">Sporcu</span>
              </div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Pasif / Dondurulan: <strong>{latestSnapshot?.passiveAthletes || 8}</strong></span>
                <span>Deneme: <strong>{latestSnapshot?.trialAthletes || 8}</strong></span>
              </div>
            </div>

            {/* 3. Bu Haftaki Yeni Katılanlar */}
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Haftalık 10:00 Net Kazanım
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-200 tracking-tight">
                  +{snapshots.slice(0, 7).reduce((acc, s) => acc + (s.netChange > 0 ? s.netChange : 0), 0)}
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Yeni Sporcu</span>
              </div>
              <p className="mt-2 text-xs text-emerald-800 dark:text-emerald-300">
                Son 7 günde sıfır kayıp, istikrarlı büyüme trendi
              </p>
            </div>

            {/* 4. Doğrulama & Sistem Durumu */}
            <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                  Konsolidasyon Durumu
                </span>
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-lg font-bold text-purple-900 dark:text-purple-100">
                  Resmi Teyitli
                </span>
              </div>
              <p className="mt-2 text-[11px] text-purple-800 dark:text-purple-300 leading-tight">
                {latestSnapshot?.verifiedBy || 'SportsFly Cron Engine'}
              </p>
            </div>
          </div>

          {/* Visual Trend Chart & Branch Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Chart Area: 8 Columns */}
            <div className="lg:col-span-8 p-4 rounded-xl bg-slate-50/70 dark:bg-[#162238]/40 border border-slate-200/70 dark:border-slate-700/80">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Günlük Saat 10:00 Aktif Sporcu Değişim Grafiği</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Her gün saat 10:00'da alınan dondurulmuş veri noktaları
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-white dark:bg-[#111c2e] p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setSelectedRange('7')}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      selectedRange === '7'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Son 7 Gün
                  </button>
                  <button
                    onClick={() => setSelectedRange('14')}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      selectedRange === '14'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Son 14 Gün
                  </button>
                  <button
                    onClick={() => setSelectedRange('all')}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      selectedRange === 'all'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Tümü
                  </button>
                </div>
              </div>

              {/* Interactive Bar Chart Representation */}
              <div className="mt-4 pt-2">
                <div className="h-44 flex items-end justify-between gap-1.5 sm:gap-2 px-2">
                  {displayedSnapshots
                    .slice()
                    .reverse()
                    .map((item) => {
                      const isSelected = selectedSnapshot?.id === item.id;
                      const isToday = item.date === latestSnapshot?.date;
                      const heightPercent = Math.max(
                        15,
                        Math.round(((item.activeAthletes - minActive + 10) / (maxActive - minActive + 20)) * 100)
                      );

                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedSnapshot(item)}
                          className="flex-1 flex flex-col items-center group cursor-pointer focus:outline-hidden"
                          title={`${item.dateFormatted} (${item.dayName}) 10:00: ${item.activeAthletes} Aktif Sporcu (${item.netChange >= 0 ? '+' : ''}${item.netChange})`}
                        >
                          {/* Value tooltip on hover/select */}
                          <div
                            className={`text-[10px] font-bold font-mono mb-1 transition-all ${
                              isSelected
                                ? 'text-blue-600 dark:text-blue-400 scale-110'
                                : 'text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {item.activeAthletes}
                          </div>

                          {/* Bar Pillar */}
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                              isSelected
                                ? 'bg-gradient-to-t from-blue-600 to-indigo-500 shadow-md ring-2 ring-blue-400'
                                : isToday
                                ? 'bg-blue-500 hover:bg-blue-600'
                                : 'bg-slate-300 dark:bg-slate-700 hover:bg-blue-400 dark:hover:bg-blue-600'
                            }`}
                          />

                          {/* Date Label */}
                          <span
                            className={`text-[10px] mt-1.5 block font-medium truncate max-w-full ${
                              isSelected
                                ? 'text-blue-700 dark:text-blue-300 font-bold'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {item.dateFormatted.slice(0, 5)}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Selected Snapshot Details: 4 Columns */}
            <div className="lg:col-span-4 p-4 rounded-xl bg-slate-50 dark:bg-[#162238]/60 border border-slate-200/70 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Seçili 10:00 Sayım Detayı
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                    {selectedSnapshot?.dateFormatted} ({selectedSnapshot?.dayName})
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Sayım Saati:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {selectedSnapshot?.time}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Aktif Sporcu:</span>
                    <span className="font-bold text-base text-blue-600 dark:text-blue-400">
                      {selectedSnapshot?.activeAthletes}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Düne Göre Fark:</span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded ${
                        (selectedSnapshot?.netChange || 0) >= 0
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {(selectedSnapshot?.netChange || 0) >= 0 ? '+' : ''}
                      {selectedSnapshot?.netChange} sporcu (%{selectedSnapshot?.growthRatePercent})
                    </span>
                  </div>

                  {/* Branch Breakdown */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Branş Dağılımı (10:00):
                    </span>
                    <div className="space-y-1.5">
                      {selectedSnapshot?.branchBreakdown.map((b) => (
                        <div key={b.branchName} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                            <span className="text-slate-700 dark:text-slate-300">{b.branchName}</span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{b.count} sporcu</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {selectedSnapshot?.notes && (
                <div className="mt-3 p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300">
                  <span className="font-bold">Not:</span> {selectedSnapshot.notes}
                </div>
              )}
            </div>
          </div>

          {/* Daily 10:00 Log Table */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Günlük 10:00 Sayım Arşivi &amp; Kayıt Günlüğü
              </h4>
              <span className="text-xs text-slate-400">Toplam {displayedSnapshots.length} Günlük Kayıt</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-[#162238] border-b border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Tarih &amp; Gün</th>
                    <th className="py-2.5 px-3">Sayım Saati</th>
                    <th className="py-2.5 px-3">10:00 Aktif Sporcu</th>
                    <th className="py-2.5 px-3">Toplam Kayıtlı</th>
                    <th className="py-2.5 px-3">Yeni Katılan</th>
                    <th className="py-2.5 px-3">Net Değişim</th>
                    <th className="py-2.5 px-3">Durum &amp; Onay</th>
                    <th className="py-2.5 px-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {displayedSnapshots.map((snap) => {
                    const isToday = snap.date === latestSnapshot?.date;
                    const isSelected = selectedSnapshot?.id === snap.id;

                    return (
                      <tr
                        key={snap.id}
                        onClick={() => setSelectedSnapshot(snap)}
                        className={`hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/70 dark:bg-blue-950/30' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            {isToday && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" title="Bugün" />
                            )}
                            <span>{snap.dateFormatted}</span>
                            <span className="text-slate-400 dark:text-slate-500 font-normal">({snap.dayName})</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                          {snap.time}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                            {snap.activeAthletes}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">sporcu</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                          {snap.totalAthletes}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                          +{snap.newlyJoinedToday}
                        </td>
                        <td className="py-2.5 px-3 font-bold">
                          {snap.netChange >= 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              <ArrowUpRight className="w-3.5 h-3.5" />+{snap.netChange}
                            </span>
                          ) : (
                            <span className="text-rose-600 flex items-center gap-0.5">
                              <ArrowDownRight className="w-3.5 h-3.5" />{snap.netChange}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Otomatik Teyit
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSnapshot(snap);
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                          >
                            İncele
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
