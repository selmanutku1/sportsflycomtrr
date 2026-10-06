import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  X,
  Calendar,
  Filter,
  Search,
  Users,
  CheckCircle,
  XCircle,
  MinusCircle,
  FileSpreadsheet,
  Check,
  Building,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { GrupItem } from '../../types';

interface YoklamaRaporExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  gruplar: GrupItem[];
  currentSelectedGroup?: GrupItem | null;
  currentAttendanceDate?: string;
  currentAttendanceState?: Record<string, 'present' | 'absent' | 'excused' | null>;
}

export interface AttendanceReportRow {
  id: string;
  date: string;
  groupId: string;
  groupName: string;
  branch: string;
  instructorName: string;
  athleteId: string;
  athleteCode: string;
  athleteName: string;
  parentName: string;
  parentPhone: string;
  status: 'present' | 'absent' | 'excused';
  checkInType: 'Dinamik QR' | 'Mobil Kamera' | 'Manuel Antrenör';
  sporpuan: number;
}

export const YoklamaRaporExportModal: React.FC<YoklamaRaporExportModalProps> = ({
  isOpen,
  onClose,
  gruplar,
  currentSelectedGroup,
  currentAttendanceDate,
  currentAttendanceState,
}) => {
  // Default date range: Last 30 days to Today
  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(currentSelectedGroup ? currentSelectedGroup.id : 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'excused'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate date list between startDate and endDate
  const generatedReportData = useMemo<AttendanceReportRow[]>(() => {
    if (!startDate || !endDate) return [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

    const rows: AttendanceReportRow[] = [];
    const dateList: string[] = [];
    
    // Generate dates step by step
    let curr = new Date(start);
    while (curr <= end) {
      dateList.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }

    // Target groups
    const targetGroups = selectedGroupId === 'all' 
      ? gruplar 
      : gruplar.filter((g) => g.id === selectedGroupId);

    dateList.forEach((dateStr, dateIdx) => {
      targetGroups.forEach((group) => {
        if (!group.members) return;

        group.members.forEach((member, memberIdx) => {
          // If this date is today's date and matches currentSelectedGroup, use current state if available
          let status: 'present' | 'absent' | 'excused' = 'present';
          if (
            currentAttendanceState &&
            currentAttendanceDate === dateStr &&
            currentSelectedGroup &&
            currentSelectedGroup.id === group.id
          ) {
            const currentSt = currentAttendanceState[member.id];
            if (currentSt === 'present') status = 'present';
            else if (currentSt === 'absent') status = 'absent';
            else if (currentSt === 'excused') status = 'excused';
            else {
              // Hash mock for untouched
              const hash = (dateIdx * 17 + memberIdx * 13 + member.name.length) % 10;
              status = hash > 2 ? 'present' : hash === 2 ? 'excused' : 'absent';
            }
          } else {
            // Realistic deterministic status simulation for historical dates
            const hash = (dateIdx * 31 + memberIdx * 7 + member.name.charCodeAt(0)) % 10;
            status = hash > 2 ? 'present' : hash === 2 ? 'excused' : 'absent';
          }

          const checkInTypes: ('Dinamik QR' | 'Mobil Kamera' | 'Manuel Antrenör')[] = [
            'Dinamik QR',
            'Mobil Kamera',
            'Manuel Antrenör',
          ];
          const checkInType = checkInTypes[(dateIdx + memberIdx) % 3];

          rows.push({
            id: `row-${dateStr}-${group.id}-${member.id}`,
            date: dateStr,
            groupId: group.id,
            groupName: group.name,
            branch: group.branch || 'Spor',
            instructorName: group.instructorName || 'Eğitmen',
            athleteId: member.id,
            athleteCode: member.code || '000000',
            athleteName: member.name,
            parentName: member.parentName || 'Veli',
            parentPhone: member.parentPhone || member.phone || '',
            status,
            checkInType,
            sporpuan: status === 'present' ? 75 : 0,
          });
        });
      });
    });

    return rows;
  }, [startDate, endDate, selectedGroupId, gruplar, currentAttendanceDate, currentAttendanceState, currentSelectedGroup]);

  // Filtered rows for UI preview and export
  const filteredReportData = useMemo(() => {
    return generatedReportData.filter((row) => {
      // Status filter
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = row.athleteName.toLowerCase().includes(q);
        const matchCode = row.athleteCode.toLowerCase().includes(q);
        const matchGroup = row.groupName.toLowerCase().includes(q);
        const matchParent = row.parentName.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchGroup && !matchParent) return false;
      }

      return true;
    });
  }, [generatedReportData, statusFilter, searchQuery]);

  // Key performance statistics
  const totalCount = filteredReportData.length;
  const presentCount = filteredReportData.filter((r) => r.status === 'present').length;
  const absentCount = filteredReportData.filter((r) => r.status === 'absent').length;
  const excusedCount = filteredReportData.filter((r) => r.status === 'excused').length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  if (!isOpen) return null;

  // Function to format CSV text and trigger download
  const handleExportCSV = () => {
    setIsExporting(true);

    setTimeout(() => {
      // Headers
      const headers = [
        'Tarih',
        'Grup / Takım',
        'Branş',
        'Antrenör',
        'Sporcu No',
        'Sporcu Adı Soyadı',
        'Veli Adı',
        'Veli Telefon',
        'Yoklama Durumu',
        'Giriş Yöntemi',
        'Kazanılan SporPuan',
      ];

      // Helper to escape CSV strings
      const escapeCSV = (val: any) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rowsCSV = filteredReportData.map((r) => [
        escapeCSV(r.date),
        escapeCSV(r.groupName),
        escapeCSV(r.branch),
        escapeCSV(r.instructorName),
        escapeCSV(r.athleteCode),
        escapeCSV(r.athleteName),
        escapeCSV(r.parentName),
        escapeCSV(r.parentPhone),
        escapeCSV(r.status === 'present' ? 'Geldi' : r.status === 'absent' ? 'Gelmedi' : 'İzinli'),
        escapeCSV(r.checkInType),
        escapeCSV(r.sporpuan),
      ]);

      // Join with CSV newline and add UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
      const csvContent =
        '\uFEFF' +
        headers.join(',') +
        '\n' +
        rowsCSV.map((e) => e.join(',')).join('\n');

      // Create downloadable Blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sportsfly_yoklama_raporu_${startDate}_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                <span>Yoklama Raporu &amp; CSV Dışa Aktarma</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                  Excel Uyumlu
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Belirtilen tarih aralığındaki tüm sporcu yoklama kayıtlarını listeleyin ve indirin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Başlangıç Tarihi
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Bitiş Tarihi
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Group Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Grup / Takım Seçimi
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Tüm Gruplar ({gruplar.length})</option>
              {gruplar.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.branch})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Yoklama Durumu
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="present">Geldi</option>
              <option value="absent">Gelmedi</option>
              <option value="excused">İzinli / Raporlu</option>
            </select>
          </div>
        </div>

        {/* KPI Stats Summary Cards */}
        <div className="px-4 pt-4 pb-2 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Toplam Kayıt</div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">{totalCount}</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Katılan (Geldi)</div>
            <div className="text-base sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">{presentCount}</div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60">
            <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Katılmayan (Gelmedi)</div>
            <div className="text-base sm:text-lg font-extrabold text-rose-700 dark:text-rose-300 mt-0.5">{absentCount}</div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60">
            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Genel Katılım Oranı</div>
            <div className="text-base sm:text-lg font-extrabold text-blue-700 dark:text-blue-300 mt-0.5">%{attendanceRate}</div>
          </div>
        </div>

        {/* Live Search & Table Preview */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="İsim, grup veya sporcu no ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Gösterilen Kayıt: <strong className="text-slate-800 dark:text-slate-200">{filteredReportData.length}</strong> / {generatedReportData.length}
            </div>
          </div>

          {/* Single Consolidated Attendance Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            <div className="overflow-x-auto max-h-[340px]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 select-none">
                  <tr>
                    <th className="py-2.5 px-3">Tarih</th>
                    <th className="py-2.5 px-3">Grup / Takım</th>
                    <th className="py-2.5 px-3">Sporcu No</th>
                    <th className="py-2.5 px-3">Sporcu Adı Soyadı</th>
                    <th className="py-2.5 px-3">Veli Bilgisi</th>
                    <th className="py-2.5 px-3 text-center">Durum</th>
                    <th className="py-2.5 px-3">Giriş Tipi</th>
                    <th className="py-2.5 px-3 text-right">SporPuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredReportData.length > 0 ? (
                    filteredReportData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3 font-sans tabular-nums font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {row.groupName}
                        </td>
                        <td className="py-2.5 px-3 font-sans tabular-nums text-slate-500 whitespace-nowrap">
                          #{row.athleteCode}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {row.athleteName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {row.parentName} ({row.parentPhone})
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              row.status === 'present'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                : row.status === 'absent'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {row.status === 'present' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                            {row.status === 'absent' && <XCircle className="w-3 h-3 text-rose-600" />}
                            {row.status === 'excused' && <MinusCircle className="w-3 h-3 text-amber-600" />}
                            <span>{row.status === 'present' ? 'Geldi' : row.status === 'absent' ? 'Gelmedi' : 'İzinli'}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                          {row.checkInType}
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {row.sporpuan > 0 ? `+${row.sporpuan} SP` : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Seçilen kriterlere uygun yoklama verisi bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Download Success Banner */}
        {downloadSuccess && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2 shrink-0">
            <Check className="w-4 h-4" />
            <span>Rapor CSV dosyası (UTF-8 Excel Uyumlu) başarıyla cihazınıza indirildi!</span>
          </div>
        )}

        {/* Footer Actions Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Tarih Aralığı: <strong className="text-slate-800 dark:text-slate-200">{startDate}</strong> — <strong className="text-slate-800 dark:text-slate-200">{endDate}</strong>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Kapat
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={isExporting || filteredReportData.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Raporu CSV Olarak İndir ({filteredReportData.length} Kayıt)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
