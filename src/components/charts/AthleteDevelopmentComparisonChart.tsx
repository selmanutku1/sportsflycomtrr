import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  BarChart2,
  Download,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Target,
  Users,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { SportsFlyLabReport } from '../../data/sportsFlyLabData';
import {
  downloadCriticalPerformanceCSV,
  downloadCriticalPerformancePDF,
} from '../../utils/criticalPerformanceExporter';

export interface AthleteDevelopmentComparisonChartProps {
  report: SportsFlyLabReport;
  className?: string;
  height?: number;
  onToast?: (message: string) => void;
  defaultChartType?: 'bar' | 'line';
  initialFilterMode?: 'critical' | 'all';
}

const cleanSubjectName = (rawName: string): string => {
  const clean = rawName
    .replace(/testi/gi, '')
    .replace(/ölçümü/gi, '')
    .replace(/\(20m\)/gi, '')
    .replace(/\(10x5m\)/gi, '')
    .trim();
  const lower = clean.toLowerCase();
  if (lower.includes('sürat') || lower.includes('sprint')) return 'Sürat (20m)';
  if (lower.includes('çabukluk') || lower.includes('agility') || lower.includes('çeviklik')) return 'Çeviklik (10x5m)';
  if (lower.includes('reaksiyon')) return 'Reaksiyon';
  if (lower.includes('sırt') || lower.includes('back')) return 'Sırt Kuvveti';
  if (lower.includes('kavrama') || lower.includes('grip')) return 'El Kavrama';
  if (lower.includes('uzun atlama') || lower.includes('long jump')) return 'Uzun Atlama';
  if (lower.includes('dikey') || lower.includes('vertical')) return 'Dikey Sıçrama';
  if (lower.includes('denge') || lower.includes('balance')) return 'Statik Denge';
  if (lower.includes('esneklik') || lower.includes('flexibility')) return 'Esneklik';
  if (lower.includes('aerobik') || lower.includes('dayanıklılık') || lower.includes('pacer')) return 'Dayanıklılık (Pacer)';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

// Determines if a test is considered one of the top critical motor metrics
const isCriticalMetric = (name: string): boolean => {
  const lower = name.toLowerCase();
  return (
    lower.includes('sürat') ||
    lower.includes('sprint') ||
    lower.includes('dikey') ||
    lower.includes('sıçrama') ||
    lower.includes('çabukluk') ||
    lower.includes('çeviklik') ||
    lower.includes('10x5') ||
    lower.includes('aerobik') ||
    lower.includes('dayanıklılık') ||
    lower.includes('pacer')
  );
};

export const AthleteDevelopmentComparisonChart: React.FC<AthleteDevelopmentComparisonChartProps> = ({
  report,
  className = '',
  height = 320,
  onToast,
  defaultChartType = 'bar',
  initialFilterMode = 'critical',
}) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>(defaultChartType);
  const [filterMode, setFilterMode] = useState<'critical' | 'all'>(initialFilterMode);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const grpAvgScore = report.groupInfo?.groupAverageScore ?? 72;
  const athleticScore = report.scoreHistory?.p3Score || 88;
  const targetScore = Math.min(100, Math.max(athleticScore + 6, 85));
  const groupDifference = athleticScore - grpAvgScore;
  const targetRemaining = targetScore - athleticScore;

  // Process and filter chart data
  const chartData = useMemo(() => {
    if (!report.motorPerformance || report.motorPerformance.length === 0) return [];

    const rows = report.motorPerformance.map((row) => {
      const p3Val = row.percentile || Math.round(row.m3);
      const grpVal = Math.max(35, Math.min(88, Math.round(p3Val * 0.82 + grpAvgScore * 0.18 - 4)));
      const targetVal = Math.min(100, Math.max(p3Val + 8, 85));
      const label = cleanSubjectName(row.name);
      const isCritical = isCriticalMetric(row.name);

      return {
        subject: label,
        fullName: row.name,
        isCritical,
        'Mevcut Değer': p3Val,
        'Hedef Değer': targetVal,
        'Grup Ortalaması': grpVal,
        rawM3: row.m3,
        unit: row.unit,
        deltaGroup: p3Val - grpVal,
        deltaTarget: targetVal - p3Val,
      };
    });

    if (filterMode === 'critical') {
      const criticalRows = rows.filter((r) => r.isCritical);
      return criticalRows.length >= 3 ? criticalRows.slice(0, 4) : rows.slice(0, 4);
    }

    return rows.slice(0, 10);
  }, [report, grpAvgScore, filterMode]);

  const handleExportCSV = () => {
    try {
      downloadCriticalPerformanceCSV(report);
      onToast?.(`${report.athleteName} performans verileri CSV formatında indirildi.`);
      setShowExportMenu(false);
    } catch (err) {
      console.error(err);
      onToast?.('CSV indirilirken bir hata oluştu.');
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);
      await downloadCriticalPerformancePDF(report, 'sportsfly-critical-performance-chart');
      onToast?.(`${report.athleteName} kritik performans raporu PDF olarak indirildi.`);
    } catch (err) {
      console.error(err);
      onToast?.('PDF indirilirken bir hata oluştu.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      id="sportsfly-critical-performance-chart"
      className={`bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-xs text-slate-900 space-y-4 font-sans ${className}`}
    >
      {/* 1. Header Toolbar: Title, View Switcher (Line vs Bar), Filter (4 Critical vs All), and 'Rapor İndir' Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-sans text-[10px] font-bold uppercase tracking-wider">
              Gelişim Takip Modeli
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Mevcut Değer vs Hedef vs Grup Ortalaması
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Performans Gelişim ve Karşılaştırma Analizi
          </h3>
        </div>

        {/* Action Controls: Filter Toggle, Chart Toggle & Rapor İndir Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Critical vs All Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setFilterMode('critical')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'critical'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="En Kritik 4 Performans Verisine Odaklan"
            >
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Kritik 4 Veri</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tüm Motorik Testleri Göster"
            >
              <span>Tüm Testler</span>
            </button>
          </div>

          {/* Line vs Bar Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Çubuk Grafikte Göster"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Çubuk</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === 'line'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Çizgi Grafikte Göster"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Çizgi</span>
            </button>
          </div>

          {/* Dedicated 'Rapor İndir' Button with Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isExporting ? 'Hazırlanıyor...' : 'Rapor İndir'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-40 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  İndirme Formatı Seçin
                </div>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  <div>
                    <div className="text-slate-900 font-bold">PDF Raporu İndir</div>
                    <div className="text-[10px] text-slate-500 font-normal">Kritik Performans Özeti (A4)</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="text-slate-900 font-bold">CSV Veri Tablosu İndir</div>
                    <div className="text-[10px] text-slate-500 font-normal">Excel Uyumlu Test Tablosu</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Chips (Clean, Uncluttered, High Contrast Sans Typography) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
            <span>Grup Ortalaması</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-extrabold text-slate-700 mt-1 tabular-nums">
            %{grpAvgScore}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Yaş & Cinsiyet Akran Normu</p>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
          <div className="flex items-center justify-between text-[11px] font-bold text-blue-800 uppercase">
            <span>Hedef Değer</span>
            <Target className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-blue-700 mt-1 tabular-nums">
            %{targetScore}
          </div>
          <p className="text-[10px] text-blue-600 mt-0.5">Biyomotorik Gelişim Eşiği</p>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-300">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 uppercase">
            <span>Mevcut Değer</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 mt-1 tabular-nums">
            %{athleticScore}
          </div>
          <p className="text-[10px] text-emerald-800 font-semibold mt-0.5">O Anki Güncel Başarı</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 text-white border border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 uppercase">
            <span>Gelişim Farkı</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white mt-1 tabular-nums">
            {groupDifference >= 0 ? `+${groupDifference}` : groupDifference}%
          </div>
          <p className="text-[10px] text-slate-300 mt-0.5">
            Grup Önünde · Hedefe {Math.max(0, targetRemaining)}%
          </p>
        </div>
      </div>

      {/* 3. Recharts Container: Single Clear Bar Chart or Line Chart */}
      <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-3.5 pt-4">
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="subject"
                  tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
                  interval={0}
                  textAnchor="middle"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(val) => `%${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl border border-slate-700 shadow-xl space-y-1.5 font-sans min-w-[210px]">
                          <div className="font-extrabold text-white border-b border-slate-800 pb-1 flex items-center justify-between">
                            <span>{data.fullName}</span>
                            <span className="text-[10.5px] text-slate-400 tabular-nums">({data.unit})</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                              <span>Grup Ortalaması:</span>
                            </span>
                            <strong className="tabular-nums">%{data['Grup Ortalaması']}</strong>
                          </div>
                          <div className="flex items-center justify-between text-blue-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              <span>Hedef Değer:</span>
                            </span>
                            <strong className="tabular-nums">%{data['Hedef Değer']}</strong>
                          </div>
                          <div className="flex items-center justify-between text-emerald-300 font-bold pt-1 border-t border-slate-800">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>Mevcut Değer:</span>
                            </span>
                            <span className="font-bold tabular-nums">
                              {data.rawM3} {data.unit} (%{data['Mevcut Değer']})
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', fontWeight: 700 }}
                />
                <Line
                  type="monotone"
                  name="Grup Ortalaması"
                  dataKey="Grup Ortalaması"
                  stroke="#64748b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3.5, fill: '#64748b' }}
                />
                <Line
                  type="monotone"
                  name="Hedef Değer"
                  dataKey="Hedef Değer"
                  stroke="#2563eb"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4.5, fill: '#2563eb' }}
                />
                <Line
                  type="monotone"
                  name="Mevcut Değer"
                  dataKey="Mevcut Değer"
                  stroke="#059669"
                  strokeWidth={3.5}
                  dot={{ r: 5.5, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="subject"
                  tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
                  interval={0}
                  textAnchor="middle"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(val) => `%${val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl border border-slate-700 shadow-xl space-y-1.5 font-sans min-w-[210px]">
                          <div className="font-extrabold text-white border-b border-slate-800 pb-1 flex items-center justify-between">
                            <span>{data.fullName}</span>
                            <span className="text-[10.5px] text-slate-400 tabular-nums">({data.unit})</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-slate-400" />
                              <span>Grup Ortalaması:</span>
                            </span>
                            <strong className="tabular-nums">%{data['Grup Ortalaması']}</strong>
                          </div>
                          <div className="flex items-center justify-between text-blue-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              <span>Hedef Değer:</span>
                            </span>
                            <strong className="tabular-nums">%{data['Hedef Değer']}</strong>
                          </div>
                          <div className="flex items-center justify-between text-emerald-300 font-bold pt-1 border-t border-slate-800">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>Mevcut Değer:</span>
                            </span>
                            <span className="font-bold tabular-nums">
                              {data.rawM3} {data.unit} (%{data['Mevcut Değer']})
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="rect"
                  wrapperStyle={{ fontSize: '11px', fontWeight: 700 }}
                />
                <Bar
                  name="Grup Ortalaması"
                  dataKey="Grup Ortalaması"
                  fill="#94a3b8"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  name="Hedef Değer"
                  dataKey="Hedef Değer"
                  fill="#3b82f6"
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  name="Mevcut Değer"
                  dataKey="Mevcut Değer"
                  fill="#059669"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Mini Summary of Top Strengths vs Focus Areas (Zero Typewriter Font, Clean Professional Badges) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <div className="text-[10.5px] font-bold text-emerald-900 uppercase">
            Hedefe Ulaşılan / Üst Düzey
          </div>
          <div className="text-xs font-extrabold text-emerald-800 mt-1 tabular-nums">
            {chartData.filter((d) => d['Mevcut Değer'] >= d['Hedef Değer']).length} Motor Test
          </div>
          <p className="text-[10px] text-emerald-700 mt-0.5">
            Hedef norm eşiğini geçen biyomotor parametreler
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
          <div className="text-[10.5px] font-bold text-blue-900 uppercase">
            Grup Üzeri Gelişim
          </div>
          <div className="text-xs font-extrabold text-blue-800 mt-1 tabular-nums">
            {chartData.filter((d) => d['Mevcut Değer'] >= d['Grup Ortalaması']).length} Motor Test
          </div>
          <p className="text-[10px] text-blue-700 mt-0.5">
            Akran grubu ortalamasının üzerinde seyreden alanlar
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
          <div className="text-[10.5px] font-bold text-slate-800 uppercase">
            Öncelikli Gelişim Odakları
          </div>
          <div className="text-xs font-extrabold text-slate-700 mt-1 tabular-nums">
            {chartData.filter((d) => d['Mevcut Değer'] < d['Hedef Değer']).length} Gelişim Hedefi
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Antrenman drilleriyle geliştirilmesi hedeflenen testler
          </p>
        </div>
      </div>
    </div>
  );
};
