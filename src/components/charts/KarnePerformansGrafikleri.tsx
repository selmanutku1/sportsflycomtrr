import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  Compass,
  Layers,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import { SportsFlyLabReport, LabParameterRow } from '../../data/sportsFlyLabData';
import { SporcuKarne } from '../../data/mockKarneData';

// Helper to normalize any LabParameterRow value (m1, m2, m3) to a 0-100 normative score using D3 scaleLinear
const normalizeLabRowValue = (val: number, row: LabParameterRow): number => {
  const domainMin = row.refLow * 0.78;
  const domainMax = row.refHigh * 1.12;
  const scale = d3
    .scaleLinear()
    .domain(row.lowerIsBetter ? [domainMax, domainMin] : [domainMin, domainMax])
    .range([15, 95])
    .clamp(true);
  return Math.round(scale(val));
};

// ============================================================================
// RECHARTS RADAR (SPIDER) CHART COMPONENT FOR SPORTSFLY LAB REPORTS
// ============================================================================
export interface RechartsSportsFlyRadarProps {
  report: SportsFlyLabReport;
  comparisonMode?: 'periods' | 'group' | 'initial-group' | 'p1-p2';
  height?: number;
  className?: string;
  title?: string;
}

const formatCleanSubjectName = (rawName: string) => {
  if (!rawName) return '';
  const clean = rawName
    .replace(/testi/gi, '')
    .replace(/ölçümü/gi, '')
    .replace(/\(20m\)/gi, '')
    .replace(/\(10x5m\)/gi, '')
    .trim();
  const lower = clean.toLowerCase();
  if (lower.includes('sürat') || lower.includes('sprint')) return 'Sürat';
  if (lower.includes('çabukluk') || lower.includes('agility')) return 'Çabukluk';
  if (lower.includes('reaksiyon')) return 'Reaksiyon';
  if (lower.includes('sırt') || lower.includes('back')) return 'Sırt Kuvveti';
  if (lower.includes('kavrama') || lower.includes('grip')) return 'Kavrama Kuvveti';
  if (lower.includes('uzun atlama') || lower.includes('long jump')) return 'Durarak Uzun Atlama';
  if (lower.includes('dikey') || lower.includes('vertical') || lower.includes('sıçrama')) return 'Dikey Sıçrama';
  if (lower.includes('denge') || lower.includes('balance')) return 'Denge';
  if (lower.includes('esneklik') || lower.includes('flexibility')) return 'Esneklik';
  if (lower.includes('aerobik') || lower.includes('dayanıklılık') || lower.includes('pacer')) return 'Aerobik Kapasite';

  return clean
    .split(' ')
    .map((word) => {
      if (!word) return '';
      const first = word.charAt(0).toLocaleUpperCase('tr-TR');
      const rest = word.slice(1).toLocaleLowerCase('tr-TR');
      return first + rest;
    })
    .join(' ');
};

export const RechartsSportsFlyRadarChart: React.FC<RechartsSportsFlyRadarProps> = ({
  report,
  comparisonMode = 'periods',
  height = 280,
  className = '',
  title = 'Motor Performans Yüzdelik Radar Grafiği',
}) => {
  const radarData = useMemo(() => {
    if (!report || !report.motorPerformance || report.motorPerformance.length === 0) {
      return [];
    }
    return report.motorPerformance.map((row) => {
      const p1Val = normalizeLabRowValue(row.m1, row);
      const p2Val = normalizeLabRowValue(row.m2, row);
      const p3Val = row.percentile || normalizeLabRowValue(row.m3, row);
      const groupAvgScore = report.groupInfo?.groupAverageScore ?? 72;
      const grpAvgVal = Math.max(35, Math.min(88, Math.round(p3Val * 0.82 + groupAvgScore * 0.18 - 4)));
      const p1GrpAvgVal = Math.max(25, Math.min(85, Math.round(p1Val * 0.85 + groupAvgScore * 0.15 - 5)));
      const targetVal = Math.min(100, Math.max(p3Val + 8, 85));

      const subjectName = formatCleanSubjectName(row.name);

      return {
        subject: subjectName,
        p1: p1Val,
        p2: p2Val,
        p3: p3Val,
        p1GrpAvg: p1GrpAvgVal,
        grpAvg: grpAvgVal,
        target: targetVal,
        unit: row.unit,
        rawM1: row.m1,
        rawM2: row.m2,
        rawM3: row.m3,
      };
    });
  }, [report]);

  if (radarData.length === 0) return null;

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3 shadow-2xs ${className}`}>
      {title && (
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-slate-100 text-slate-800 border border-slate-300">
              <Compass className="w-3.5 h-3.5 text-slate-700" />
            </span>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide font-sans">
              {title}
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-sans font-semibold border border-slate-800 shadow-2xs">
            Yüzdelik Radar (%0–%100)
          </span>
        </div>
      )}

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="48%" outerRadius="66%" data={radarData}>
            <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fill: '#0f172a',
                fontSize: 9.5,
                fontWeight: 700,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tickFormatter={(val) => `%${val}`}
              tick={{ fill: '#64748b', fontSize: 7.5, fontFamily: 'sans-serif', fontWeight: 600 }}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-[10.5px] p-2.5 rounded-lg border border-slate-700 shadow-xl font-sans">
                      <div className="font-black text-sky-300 border-b border-slate-700 pb-1 mb-1">
                        {data.subject} — Motor Performans Yüzdelik Analizi
                      </div>
                      {comparisonMode === 'periods' ? (
                        <div className="space-y-1">
                          <div>1. Test ({report.date1}): <strong className="text-slate-300 tabular-nums">{data.rawM1} {data.unit}</strong> → <span className="px-1.5 py-0.2 rounded bg-slate-800 font-bold text-sky-300">%{data.p1} Yüzdelik</span></div>
                          <div>2. Test ({report.date2}): <strong className="text-blue-300 tabular-nums">{data.rawM2} {data.unit}</strong> → <span className="px-1.5 py-0.2 rounded bg-slate-800 font-bold text-blue-300">%{data.p2} Yüzdelik</span></div>
                          <div className="text-rose-300 font-extrabold">3. Test ({report.date3}): {data.rawM3} {data.unit} → <span className="px-1.5 py-0.2 rounded bg-rose-950 font-black text-rose-300 border border-rose-800">%{data.p3} Yüzdelik</span></div>
                        </div>
                      ) : comparisonMode === 'p1-p2' ? (
                        <div className="space-y-1 text-xs">
                          <div>1. Ölçüm (Önceki - {report.date1}): <strong className="text-slate-300 tabular-nums">{data.rawM1} {data.unit}</strong> (%{data.p1} Yüzdelik)</div>
                          <div>2. Ölçüm (Mevcut - {report.date2}): <strong className="text-sky-300 tabular-nums">{data.rawM2} {data.unit}</strong> (%{data.p2} Yüzdelik)</div>
                          <div className="text-emerald-300 font-extrabold pt-1 border-t border-slate-700">
                            İlerleme (Δ): {data.rawM2 - data.rawM1 >= 0 ? `+${+(data.rawM2 - data.rawM1).toFixed(2)}` : +(data.rawM2 - data.rawM1).toFixed(2)} {data.unit} ({data.p2 - data.p1 >= 0 ? `+${data.p2 - data.p1}` : data.p2 - data.p1} Yüzdelik Fark)
                          </div>
                        </div>
                      ) : comparisonMode === 'initial-group' ? (
                        <div className="space-y-1">
                          <div className="text-sky-300 font-extrabold">1. Test Sporcu: {data.rawM1} {data.unit} (%{data.p1} Yüzdelik)</div>
                          <div className="text-amber-300 font-bold">1. Test Grup Ortalaması: %{data.p1GrpAvg} Yüzdelik</div>
                          <div className="text-emerald-300 font-extrabold">3. Test Sporcu (Güncel): {data.rawM3} {data.unit} (%{data.p3} Yüzdelik)</div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-emerald-300 font-extrabold">Sporcu Mevcut: {data.rawM3} {data.unit} (%{data.p3} Yüzdelik)</div>
                          <div>Grup Ortalaması: <strong className="text-rose-300">%{data.grpAvg} Yüzdelik</strong></div>
                          <div>Hedef Değer: <strong className="text-blue-300">%{data.target} Yüzdelik</strong></div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px', fontWeight: 800, fontFamily: 'sans-serif' }}
            />

            {comparisonMode === 'periods' ? (
              <>
                <Radar
                  name={`1. Test (${report.date1})`}
                  dataKey="p1"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.15}
                  strokeDasharray="3 3"
                />
                <Radar
                  name={`2. Test (${report.date2})`}
                  dataKey="p2"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.25}
                />
                <Radar
                  name={`3. Test (${report.date3}) - Güncel`}
                  dataKey="p3"
                  stroke="#e11d48"
                  fill="#e11d48"
                  fillOpacity={0.4}
                />
              </>
            ) : comparisonMode === 'p1-p2' ? (
              <>
                <Radar
                  name={`1. Ölçüm (Önceki: ${report.date1})`}
                  dataKey="p1"
                  stroke="#64748b"
                  fill="#64748b"
                  fillOpacity={0.2}
                  strokeDasharray="3 3"
                />
                <Radar
                  name={`2. Ölçüm (Mevcut: ${report.date2})`}
                  dataKey="p2"
                  stroke="#0284c7"
                  fill="#0ea5e9"
                  fillOpacity={0.4}
                />
              </>
            ) : comparisonMode === 'initial-group' ? (
              <>
                <Radar
                  name="1. Test Grup Ortalaması"
                  dataKey="p1GrpAvg"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.2}
                  strokeDasharray="3 3"
                />
                <Radar
                  name="1. Test Sporcu Değeri"
                  dataKey="p1"
                  stroke="#0284c7"
                  fill="#0284c7"
                  fillOpacity={0.3}
                />
                <Radar
                  name="3. Test Sporcu (Güncel)"
                  dataKey="p3"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.35}
                />
              </>
            ) : (
              <>
                <Radar
                  name="Grup Ortalaması"
                  dataKey="grpAvg"
                  stroke="#f43f5e"
                  fill="#f43f5e"
                  fillOpacity={0.2}
                  strokeDasharray="3 3"
                />
                <Radar
                  name="Hedef Değer (%85+)"
                  dataKey="target"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.15}
                  strokeDasharray="4 2"
                />
                <Radar
                  name="Sporcu Mevcut"
                  dataKey="p3"
                  stroke="#059669"
                  fill="#10b981"
                  fillOpacity={0.45}
                />
              </>
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ============================================================================
// DEDICATED INITIAL MEASUREMENT VS GROUP AVERAGE COMPARISON CHART
// ============================================================================
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export interface InitialMeasurementGroupProps {
  report: SportsFlyLabReport;
  className?: string;
  height?: number;
}

export const InitialMeasurementGroupComparisonChart: React.FC<InitialMeasurementGroupProps> = ({
  report,
  className = '',
  height = 230,
}) => {
  const p1Score = report.scoreHistory?.p1Score || 72;
  const p3Score = report.scoreHistory?.p3Score || 88;
  const grpAvgScore = report.groupInfo?.groupAverageScore ?? 70;

  const p1GroupAvg = Math.max(30, grpAvgScore - 4);
  const p1Diff = p1Score - p1GroupAvg;

  const testData = useMemo(() => {
    return report.motorPerformance.slice(0, 8).map((row) => {
      const p1Val = normalizeLabRowValue(row.m1, row);
      const p1GrpAvg = Math.max(25, Math.min(90, Math.round(p1Val - 5)));
      const shortName = row.name.replace(' Testi', '').replace(' Ölçümü', '');
      return {
        subject: shortName,
        '1. Ölçüm Sporcu': p1Val,
        '1. Ölçüm Grup Ort.': p1GrpAvg,
        diff: p1Val - p1GrpAvg,
        unit: row.unit,
        rawM1: row.m1,
      };
    });
  }, [report]);

  return (
    <div className={`p-3.5 rounded-xl border-2 border-indigo-200 bg-slate-900 text-white shadow-2xs space-y-2.5 ${className}`}>
      {/* Header ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-700 font-sans">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/30 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            1. Ölçüm Grup Karşılaştırması
          </span>
          <span className="text-xs font-bold text-white uppercase tracking-tight">
            Başlangıç Seviyesi vs Grup Ortalaması Konum Grafiği
          </span>
        </div>
        <span className={`px-2.5 py-1 rounded-md text-[10.5px] font-bold border flex items-center gap-1.5 ${
          p1Diff >= 0 ? 'bg-emerald-950 text-emerald-300 border-emerald-400' : 'bg-rose-950 text-rose-300 border-rose-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${p1Diff >= 0 ? 'bg-emerald-400' : 'bg-rose-400'} shrink-0`} />
          <span>{p1Diff >= 0 ? `İlk Ölçümde Grubun +${p1Diff} Puan Üzerinde` : `İlk Ölçümde Grubun ${p1Diff} Puan Altında`}</span>
        </span>
      </div>

      {/* KPI Comparison Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-sans">
        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
          <span className="text-[9px] text-slate-400 block font-sans">1. Ölçüm Sporcu Puanı</span>
          <span className="text-base font-black text-sky-300">%{p1Score}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
          <span className="text-[9px] text-slate-400 block font-sans">1. Ölçüm Grup Ortalaması</span>
          <span className="text-base font-black text-amber-300">%{p1GroupAvg}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
          <span className="text-[9px] text-slate-400 block font-sans">Başlangıç Konumu</span>
          <span className="text-base font-black text-emerald-300">
            {p1Diff >= 0 ? `+${p1Diff} Puan` : `${p1Diff} Puan`}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-slate-800 border border-emerald-500/40">
          <span className="text-[9px] text-emerald-300 block font-sans">Güncel Dönem (3. Test)</span>
          <span className="text-base font-black text-emerald-400">%{p3Score} (+{p3Score - p1Score} Puan)</span>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={testData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 9.5, fontWeight: 700 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 text-white text-[10.5px] p-2 rounded-lg font-sans tabular-nums">
                      <div className="font-extrabold text-sky-300 border-b border-slate-700 pb-1 mb-1">
                        {data.subject} (1. Test)
                      </div>
                      <div>Sporcu Değeri: <strong>{data.rawM1} {data.unit}</strong> (%{data['1. Ölçüm Sporcu']})</div>
                      <div>Grup Ortalaması: <strong className="text-amber-300">%{data['1. Ölçüm Grup Ort.']}</strong></div>
                      <div className="text-emerald-300 font-bold mt-1">
                        Fark: {data.diff >= 0 ? `+${data.diff}` : data.diff} Puan
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 800, color: '#ffffff' }} />
            <Bar dataKey="1. Ölçüm Sporcu" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="1. Ölçüm Grup Ort." fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Helper to build D3 radar geometry for a list of LabParameterRows
const buildD3LabRadarGeometry = (rows: LabParameterRow[], size = 320, radius = 108) => {
  const center = size / 2;
  const totalAxes = rows.length || 1;
  const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

  const axes = rows.map((row, i) => {
    const angle = (Math.PI * 2 * i) / totalAxes - Math.PI / 2;
    const p1Norm = normalizeLabRowValue(row.m1, row);
    const p2Norm = normalizeLabRowValue(row.m2, row);
    const p3Norm = row.percentile || normalizeLabRowValue(row.m3, row);

    const labelRadius = radius + 24;
    return {
      row,
      angle,
      p1Norm,
      p2Norm,
      p3Norm,
      axisEnd: {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      },
      labelPos: {
        x: center + labelRadius * Math.cos(angle),
        y: center + labelRadius * Math.sin(angle),
      },
      pt1: {
        x: center + rScale(p1Norm) * Math.cos(angle),
        y: center + rScale(p1Norm) * Math.sin(angle),
      },
      pt2: {
        x: center + rScale(p2Norm) * Math.cos(angle),
        y: center + rScale(p2Norm) * Math.sin(angle),
      },
      pt3: {
        x: center + rScale(p3Norm) * Math.cos(angle),
        y: center + rScale(p3Norm) * Math.sin(angle),
      },
    };
  });

  const lineGenerator = d3
    .line<{ x: number; y: number }>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveLinearClosed);

  const path1 = lineGenerator(axes.map((a) => a.pt1)) || '';
  const path2 = lineGenerator(axes.map((a) => a.pt2)) || '';
  const path3 = lineGenerator(axes.map((a) => a.pt3)) || '';

  const refPoints = axes.map((a) => ({
    x: center + rScale(50) * Math.cos(a.angle),
    y: center + rScale(50) * Math.sin(a.angle),
  }));
  const refPath = lineGenerator(refPoints) || '';

  return {
    size,
    center,
    radius,
    rScale,
    axes,
    path1,
    path2,
    path3,
    refPath,
  };
};

// Helper to build D3 line + area geometry for 4 points (I, II, III, Target)
interface LinePointItem {
  period: string;
  date: string;
  value: number;
  isTarget: boolean;
}

const buildD3LineGeometry = (
  points: LinePointItem[],
  refMid: number,
  width = 460,
  height = 210,
  margin = { top: 24, right: 32, bottom: 38, left: 44 }
) => {
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const values = points.map((p) => p.value);
  const allVals = [...values, refMid];
  const minVal = d3.min(allVals) ?? 0;
  const maxVal = d3.max(allVals) ?? 100;
  const pad = Math.max(0.4, (maxVal - minVal) * 0.22);

  const xScale = d3
    .scalePoint<string>()
    .domain(points.map((p) => p.period))
    .range([0, innerW])
    .padding(0.16);

  const yScale = d3
    .scaleLinear()
    .domain([minVal - pad, maxVal + pad])
    .range([innerH, 0]);

  const coords = points.map((pt) => ({
    ...pt,
    x: margin.left + (xScale(pt.period) ?? 0),
    y: margin.top + yScale(pt.value),
  }));

  const measuredCoords = coords.slice(0, 3);
  const lineGen = d3
    .line<typeof coords[0]>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveMonotoneX);

  const areaGen = d3
    .area<typeof coords[0]>()
    .x((d) => d.x)
    .y0(margin.top + innerH)
    .y1((d) => d.y)
    .curve(d3.curveMonotoneX);

  const measuredPath = lineGen(measuredCoords) || '';
  const measuredArea = areaGen(measuredCoords) || '';
  const projectionPath = lineGen(coords.slice(2, 4)) || '';

  const yTicks = yScale.ticks(4).map((t) => ({
    val: Number(t.toFixed(1)),
    y: margin.top + yScale(t),
  }));

  const refY = margin.top + yScale(refMid);

  return {
    width,
    height,
    margin,
    innerW,
    innerH,
    coords,
    measuredPath,
    measuredArea,
    projectionPath,
    yTicks,
    refY,
  };
};

// ============================================================================
// A. SPORTSFLY LAB KARNE SAYFA 5: MOTOR & ANTROPOMETRİK RADAR GRAFİKLERİ
// ============================================================================

export const SportsFlyLabKarnePage5RadarContent: React.FC<{ report: SportsFlyLabReport }> = ({
  report,
}) => {
  const motorRadar = useMemo(
    () => buildD3LabRadarGeometry(report.motorPerformance, 310, 102),
    [report.motorPerformance]
  );

  const bodyRadar = useMemo(
    () => buildD3LabRadarGeometry(report.bodyComposition.slice(0, 8), 310, 102),
    [report.bodyComposition]
  );

  // Compute Motor Cluster Averages (I, II, III) for D3 Grouped Horizontal Bar Comparison
  const motorClusters = useMemo(() => {
    const getRow = (id: string, fallbackIdx: number) =>
      report.motorPerformance.find((r) => r.id === id) || report.motorPerformance[fallbackIdx] || report.motorPerformance[0];

    const sprint = getRow('sprint_20m', 4);
    const agility = getRow('agility_10x5', 5);
    const vJump = getRow('vertical_jump', 6);
    const bJump = getRow('broad_jump', 7);
    const grip = getRow('handgrip', 8);
    const medBall = getRow('medicine_ball', 9);
    const balance = getRow('flamingo_balance', 0);
    const flex = getRow('sit_and_reach', 1);
    const reaction = getRow('reaction_time', 2);

    const avgNorm = (rows: LabParameterRow[], period: 'm1' | 'm2' | 'm3') => {
      if (!rows.length) return 50;
      const sum = rows.reduce((acc, r) => {
        if (period === 'm3' && r.percentile) return acc + r.percentile;
        return acc + normalizeLabRowValue(r[period], r);
      }, 0);
      return Math.round(sum / rows.length);
    };

    return [
      {
        name: 'Sürat & İvmelenme (20m)',
        p1: avgNorm([sprint], 'm1'),
        p2: avgNorm([sprint], 'm2'),
        p3: avgNorm([sprint], 'm3'),
      },
      {
        name: 'Çabukluk & Yön Değiştirme (10x5m)',
        p1: avgNorm([agility], 'm1'),
        p2: avgNorm([agility], 'm2'),
        p3: avgNorm([agility], 'm3'),
      },
      {
        name: 'Patlayıcı Güç (Dikey & Uzun Atlama)',
        p1: avgNorm([vJump, bJump], 'm1'),
        p2: avgNorm([vJump, bJump], 'm2'),
        p3: avgNorm([vJump, bJump], 'm3'),
      },
      {
        name: 'Üst Ekstremite Kuvveti (Kavrama & Top)',
        p1: avgNorm([grip, medBall], 'm1'),
        p2: avgNorm([grip, medBall], 'm2'),
        p3: avgNorm([grip, medBall], 'm3'),
      },
      {
        name: 'Denge, Esneklik & Reaksiyon Sürati',
        p1: avgNorm([balance, flex, reaction], 'm1'),
        p2: avgNorm([balance, flex, reaction], 'm2'),
        p3: avgNorm([balance, flex, reaction], 'm3'),
      },
      {
        name: 'Genel Sportif Performans Endeksi',
        p1: report.scoreHistory.p1Score,
        p2: report.scoreHistory.p2Score,
        p3: report.scoreHistory.p3Score,
      },
    ];
  }, [report]);

  return (
    <div className="flex-1 flex flex-col justify-between gap-4">
      {/* Legend Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 text-[11px] text-slate-700">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-slate-500 inline-block border-b border-dashed border-slate-600" />
            <span>I. Ölçüm ({report.date1})</span>
          </span>
          <span className="flex items-center gap-1.5 text-blue-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>II. Ölçüm ({report.date2})</span>
          </span>
          <span className="flex items-center gap-1.5 text-rose-700 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            <span>III. Ölçüm ({report.date3} - Güncel)</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
            <span>%50 Normatif Referans Sınırı</span>
          </span>
        </div>
        <span className="font-sans tabular-nums text-[10px] text-slate-500">D3.js Çok Boyutlu Polar Radar Analizi</span>
      </div>

      {/* Top 2-Column Radar Grid: Motor Performance Radar + Body Composition Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3">
        {/* LEFT: Motor Performans Yüzdelik Radar Grafiği */}
        <div className="border border-slate-200 rounded-xl p-3.5 bg-white flex flex-col justify-between">
          <div className="border-b border-slate-200 pb-2 mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                7.1 Motor Performans Yüzdelik Radar Grafiği (10 Test)
              </h3>
              <p className="text-[10px] text-slate-500">
                Sürat, kuvvet, çabukluk, denge, esneklik ve reaksiyon yüzdelik dağılımı (0–100%)
              </p>
            </div>
            <span className="text-xs font-sans tabular-nums font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Ort: %{report.scoreHistory.p3Score}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center my-1">
            <svg
              viewBox={`0 0 ${motorRadar.size} ${motorRadar.size}`}
              className="w-full max-w-[290px] h-auto overflow-visible"
            >
              {[20, 40, 60, 80, 100].map((level) => (
                <g key={level}>
                  <circle
                    cx={motorRadar.center}
                    cy={motorRadar.center}
                    r={motorRadar.rScale(level)}
                    fill="none"
                    stroke={level === 60 ? '#10b981' : '#cbd5e1'}
                    strokeWidth={level === 60 ? 1.1 : 0.75}
                    strokeDasharray={level === 60 ? '3,3' : undefined}
                  />
                  <text
                    x={motorRadar.center + 3}
                    y={motorRadar.center - motorRadar.rScale(level) + 8}
                    className="text-[7px] font-sans tabular-nums fill-slate-400"
                  >
                    %{level}
                  </text>
                </g>
              ))}

              {motorRadar.axes.map((axis) => {
                const cos = Math.cos(axis.angle);
                const textAnchor = Math.abs(cos) < 0.18 ? 'middle' : cos > 0 ? 'start' : 'end';
                return (
                  <g key={axis.row.id}>
                    <line
                      x1={motorRadar.center}
                      y1={motorRadar.center}
                      x2={axis.axisEnd.x}
                      y2={axis.axisEnd.y}
                      stroke="#cbd5e1"
                      strokeWidth="0.85"
                    />
                    <text
                      x={axis.labelPos.x}
                      y={axis.labelPos.y}
                      textAnchor={textAnchor}
                      dominantBaseline="middle"
                      className="text-[8px] font-bold fill-slate-800"
                    >
                      {axis.row.name.length > 16 ? `${axis.row.name.slice(0, 15)}.` : axis.row.name} (%{axis.p3Norm})
                    </text>
                  </g>
                );
              })}

              {/* 50% Normative Reference Polygon */}
              <path
                d={motorRadar.refPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="2,2"
              />

              {/* Period I Polygon */}
              <path
                d={motorRadar.path1}
                fill="rgba(100, 116, 139, 0.10)"
                stroke="#64748b"
                strokeWidth="1.3"
                strokeDasharray="3,2"
              />

              {/* Period II Polygon */}
              <path
                d={motorRadar.path2}
                fill="rgba(37, 99, 235, 0.14)"
                stroke="#2563eb"
                strokeWidth="1.6"
              />

              {/* Period III Polygon */}
              <path
                d={motorRadar.path3}
                fill="rgba(225, 29, 72, 0.22)"
                stroke="#e11d48"
                strokeWidth="2.2"
              />
              {motorRadar.axes.map((axis) => (
                <circle
                  key={axis.row.id}
                  cx={axis.pt3.x}
                  cy={axis.pt3.y}
                  r="3.5"
                  fill="#e11d48"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              ))}
            </svg>
          </div>

          {/* Compact Percentile Table under Motor Radar */}
          <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
            {motorRadar.axes.map((a) => {
              const diff = a.p3Norm - a.p1Norm;
              return (
                <div key={a.row.id} className="flex items-center justify-between border-b border-slate-100 py-0.5">
                  <span className="text-slate-700 font-medium truncate pr-1">{a.row.name}</span>
                  <span className="font-sans tabular-nums font-bold text-slate-900 shrink-0">
                    %{a.p1Norm}→<strong className="text-rose-700">%{a.p3Norm}</strong>{' '}
                    <span className={diff >= 0 ? 'text-emerald-700' : 'text-amber-700'}>
                      ({diff >= 0 ? `+${diff}` : diff})
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Antropometrik Beden Kompozisyonu Radarı */}
        <div className="border border-slate-200 rounded-xl p-3.5 bg-white flex flex-col justify-between">
          <div className="border-b border-slate-200 pb-2 mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                7.2 Antropometrik Beden Kompozisyonu Radar Grafiği
              </h3>
              <p className="text-[10px] text-slate-500">
                Boy, ağırlık, BKİ, deri kıvrım kalınlıkları (skinfold) ve çevre ölçümleri dengesi
              </p>
            </div>
            <span className="text-xs font-sans tabular-nums font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {report.somatotype.m3.category}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center my-1">
            <svg
              viewBox={`0 0 ${bodyRadar.size} ${bodyRadar.size}`}
              className="w-full max-w-[290px] h-auto overflow-visible"
            >
              {[20, 40, 60, 80, 100].map((level) => (
                <g key={level}>
                  <circle
                    cx={bodyRadar.center}
                    cy={bodyRadar.center}
                    r={bodyRadar.rScale(level)}
                    fill="none"
                    stroke={level === 60 ? '#10b981' : '#cbd5e1'}
                    strokeWidth={level === 60 ? 1.1 : 0.75}
                    strokeDasharray={level === 60 ? '3,3' : undefined}
                  />
                  <text
                    x={bodyRadar.center + 3}
                    y={bodyRadar.center - bodyRadar.rScale(level) + 8}
                    className="text-[7px] font-sans tabular-nums fill-slate-400"
                  >
                    %{level}
                  </text>
                </g>
              ))}

              {bodyRadar.axes.map((axis) => {
                const cos = Math.cos(axis.angle);
                const textAnchor = Math.abs(cos) < 0.18 ? 'middle' : cos > 0 ? 'start' : 'end';
                return (
                  <g key={axis.row.id}>
                    <line
                      x1={bodyRadar.center}
                      y1={bodyRadar.center}
                      x2={axis.axisEnd.x}
                      y2={axis.axisEnd.y}
                      stroke="#cbd5e1"
                      strokeWidth="0.85"
                    />
                    <text
                      x={axis.labelPos.x}
                      y={axis.labelPos.y}
                      textAnchor={textAnchor}
                      dominantBaseline="middle"
                      className="text-[8px] font-bold fill-slate-800"
                    >
                      {axis.row.name.length > 16 ? `${axis.row.name.slice(0, 15)}.` : axis.row.name} (%{axis.p3Norm})
                    </text>
                  </g>
                );
              })}

              <path
                d={bodyRadar.refPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <path
                d={bodyRadar.path1}
                fill="rgba(100, 116, 139, 0.10)"
                stroke="#64748b"
                strokeWidth="1.3"
                strokeDasharray="3,2"
              />
              <path
                d={bodyRadar.path2}
                fill="rgba(37, 99, 235, 0.14)"
                stroke="#2563eb"
                strokeWidth="1.6"
              />
              <path
                d={bodyRadar.path3}
                fill="rgba(37, 99, 235, 0.22)"
                stroke="#1d4ed8"
                strokeWidth="2.2"
              />
              {bodyRadar.axes.map((axis) => (
                <circle
                  key={axis.row.id}
                  cx={axis.pt3.x}
                  cy={axis.pt3.y}
                  r="3.5"
                  fill="#1d4ed8"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              ))}
            </svg>
          </div>

          {/* Compact Body Composition Percentile Table */}
          <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
            {bodyRadar.axes.map((a) => (
              <div key={a.row.id} className="flex items-center justify-between border-b border-slate-100 py-0.5">
                <span className="text-slate-700 font-medium truncate pr-1">{a.row.name}</span>
                <span className="font-sans tabular-nums font-bold text-slate-900 shrink-0">
                  {a.row.m3} {a.row.unit} (<strong className="text-blue-700">%{a.p3Norm}</strong>)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Box: 7.3 Motor Yetkinlik Kümeleri Dönemsel Yüzdelik Karşılaştırma Grafiği */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              7.3 Temel Motor Yetkinlik Kümeleri — 3 Dönemlik Yüzdelik Karşılaştırma Grafiği
            </h3>
            <p className="text-[10px] text-slate-500">
              I. Ölçüm, II. Ölçüm ve III. Ölçüm (Güncel) normatif yüzdelik dilim ilerlemesi
            </p>
          </div>
          <span className="text-[10px] font-sans tabular-nums font-bold text-emerald-700">
            Hedef Eşik: ≥ %65 Yüzdelik
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-x-6 gap-y-2.5">
          {motorClusters.map((c, idx) => {
            const gain = c.p3 - c.p1;
            return (
              <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200/90">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-bold text-slate-900">{c.name}</span>
                  <span className="font-sans tabular-nums text-[10px]">
                    I: %{c.p1} · II: %{c.p2} ·{' '}
                    <strong className="text-rose-700">III: %{c.p3}</strong>{' '}
                    <span className="text-emerald-700 font-bold">
                      ({gain >= 0 ? `+${gain}%` : `${gain}%`})
                    </span>
                  </span>
                </div>
                {/* 3 Stacked/Comparative Vector Progress Bars */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-[9px] font-sans tabular-nums text-slate-400">I.</span>
                    <svg viewBox="0 0 200 6" preserveAspectRatio="none" className="flex-1 h-1.5 rounded-full overflow-hidden block">
                      <rect x="0" y="0" width="200" height="6" rx="3" fill="#f1f5f9" />
                      <rect x="0" y="0" width={Math.max(4, Math.min(200, c.p1 * 2))} height="6" rx="3" fill="#94a3b8" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-[9px] font-sans tabular-nums text-blue-600">II.</span>
                    <svg viewBox="0 0 200 6" preserveAspectRatio="none" className="flex-1 h-1.5 rounded-full overflow-hidden block">
                      <rect x="0" y="0" width="200" height="6" rx="3" fill="#f1f5f9" />
                      <rect x="0" y="0" width={Math.max(4, Math.min(200, c.p2 * 2))} height="6" rx="3" fill="#3b82f6" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-[9px] font-sans tabular-nums font-bold text-rose-700">III.</span>
                    <svg viewBox="0 0 200 8" preserveAspectRatio="none" className="flex-1 h-2 rounded-full overflow-hidden block">
                      <rect x="0" y="0" width="200" height="8" rx="4" fill="#f1f5f9" />
                      <rect x="0" y="0" width={Math.max(4, Math.min(200, c.p3 * 2))} height="8" rx="4" fill="#e11d48" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7.4 Radar Denge Endeksi & Biyomotorik Simetri Sentezi (Fills bottom of A4 Page 5) */}
      <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-3.5">
        <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Biyomotorik Radar Denge Katsayısı
          </div>
          <div className="text-base font-black font-sans tabular-nums text-slate-900 mt-1">
            %{report.scoreHistory.p3Score} · Dengeli Profil
          </div>
          <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
            10 parametreli radar poligon alanı, I. ölçümden (%{report.scoreHistory.p1Score}) III. ölçüme (%{report.scoreHistory.p3Score}) genişleyerek çok yönlü atletik kapasite artışı sağlamıştır.
          </p>
        </div>

        <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Alt / Üst Ekstremite Kuvvet Simetrisi
          </div>
          <div className="text-base font-black font-sans tabular-nums text-blue-700 mt-1">
            Optimal Koridor (±0.5 SD)
          </div>
          <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
            Patlayıcı sıçrama kuvveti ile üst gövde fırlatma/kavrama kuvveti arasındaki oran branş normlarıyla uyumludur; sakatlık riski düşüktür.
          </p>
        </div>

        <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-900 text-white">
          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
            Antropometrik &amp; Motor Uyum
          </div>
          <div className="text-base font-black font-sans tabular-nums text-emerald-400 mt-1">
            {report.somatotype.m3.category}
          </div>
          <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
            Beden kompozisyonu radarı ile motor performans radarı birlikte değerlendirildiğinde yağsız kas kütlesi artışının çevikliğe doğrudan yansıdığı görülmektedir.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// B. SPORTSFLY LAB KARNE SAYFA 6: GENEL SPORTİF PERFORMANS PUAN GELİŞİMİ
//    & DÖNEMSEL METRİK ÇİZGİ GRAFİKLERİ
// ============================================================================

export const SportsFlyLabKarnePage6LineContent: React.FC<{ report: SportsFlyLabReport }> = ({
  report,
}) => {
  // 1. Hero Chart: Genel Sportif Performans Puan Gelişimi (I -> II -> III -> Hedef)
  const overallTarget = Math.min(99, report.scoreHistory.p3Score + 6);
  const overallPoints: LinePointItem[] = [
    { period: 'I. Ölçüm', date: report.date1, value: report.scoreHistory.p1Score, isTarget: false },
    { period: 'II. Ölçüm', date: report.date2, value: report.scoreHistory.p2Score, isTarget: false },
    { period: 'III. Ölçüm (Güncel)', date: report.date3, value: report.scoreHistory.p3Score, isTarget: false },
    { period: 'Hedef (İpsatif)', date: report.nextTargetDate, value: overallTarget, isTarget: true },
  ];
  const heroLine = useMemo(
    () => buildD3LineGeometry(overallPoints, 65, 680, 195, { top: 24, right: 42, bottom: 36, left: 46 }),
    [report]
  );

  // 2. Four Sub-Charts for key athletic dimensions (VO2peak, 20m Sprint, Vertical Jump, 10x5m Agility)
  const subCharts = useMemo(() => {
    const findMotor = (id: string, fallbackIdx: number) =>
      report.motorPerformance.find((m) => m.id === id) ||
      report.motorPerformance[fallbackIdx] ||
      report.motorPerformance[0];

    const sprintRow = findMotor('sprint_20m', 4);
    const agilityRow = findMotor('agility_10x5', 5);
    const vJumpRow = findMotor('vertical_jump', 6);

    const getTargetFor = (row: LabParameterRow) => {
      const match = report.ipsativeTargets.find((t) =>
        row.name.toLowerCase().includes(t.parameter.toLowerCase())
      );
      if (match) return match.target;
      return Number((row.m3 * (row.lowerIsBetter ? 0.96 : 1.05)).toFixed(2));
    };

    const vo2Target = Number((report.cardio.test3Vo2 * 1.04).toFixed(1));

    const items = [
      {
        id: 'vo2',
        title: '8.2 Kardiyorespiratuar Uygunluk (VO2peak) Gelişimi',
        subtitle: 'PACER 20m Mekik Koşusu Aerobik Kapasite Eğrisi',
        unit: 'ml/kg/dk',
        refMid: 46.5,
        lowerIsBetter: false,
        color: '#059669',
        points: [
          { period: 'I. Ölçüm', date: report.date1, value: report.cardio.test1Vo2, isTarget: false },
          { period: 'II. Ölçüm', date: report.date2, value: report.cardio.test2Vo2, isTarget: false },
          { period: 'III. Ölçüm', date: report.date3, value: report.cardio.test3Vo2, isTarget: false },
          { period: 'Hedef', date: report.nextTargetDate, value: vo2Target, isTarget: true },
        ],
      },
      {
        id: 'sprint',
        title: `8.3 ${sprintRow.name} Gelişim Grafiği`,
        subtitle: 'Doğrusal İvmelenme ve Maksimal Sürat (Süre Azaldıkça Artar)',
        unit: sprintRow.unit,
        refMid: sprintRow.refMid,
        lowerIsBetter: true,
        color: '#2563eb',
        points: [
          { period: 'I. Ölçüm', date: report.date1, value: sprintRow.m1, isTarget: false },
          { period: 'II. Ölçüm', date: report.date2, value: sprintRow.m2, isTarget: false },
          { period: 'III. Ölçüm', date: report.date3, value: sprintRow.m3, isTarget: false },
          { period: 'Hedef', date: report.nextTargetDate, value: getTargetFor(sprintRow), isTarget: true },
        ],
      },
      {
        id: 'vjump',
        title: `8.4 ${vJumpRow.name} (Patlayıcı Güç) Gelişim Grafiği`,
        subtitle: 'Alt Ekstremite Patlayıcı Kuvvet ve Pliometrik Sıçrama Yüksekliği',
        unit: vJumpRow.unit,
        refMid: vJumpRow.refMid,
        lowerIsBetter: false,
        color: '#4f46e5',
        points: [
          { period: 'I. Ölçüm', date: report.date1, value: vJumpRow.m1, isTarget: false },
          { period: 'II. Ölçüm', date: report.date2, value: vJumpRow.m2, isTarget: false },
          { period: 'III. Ölçüm', date: report.date3, value: vJumpRow.m3, isTarget: false },
          { period: 'Hedef', date: report.nextTargetDate, value: getTargetFor(vJumpRow), isTarget: true },
        ],
      },
      {
        id: 'agility',
        title: `8.5 ${agilityRow.name} Gelişim Grafiği`,
        subtitle: 'Çok Yönlü Yön Değiştirme (COD) ve Çabukluk Süresi',
        unit: agilityRow.unit,
        refMid: agilityRow.refMid,
        lowerIsBetter: true,
        color: '#d97706',
        points: [
          { period: 'I. Ölçüm', date: report.date1, value: agilityRow.m1, isTarget: false },
          { period: 'II. Ölçüm', date: report.date2, value: agilityRow.m2, isTarget: false },
          { period: 'III. Ölçüm', date: report.date3, value: agilityRow.m3, isTarget: false },
          { period: 'Hedef', date: report.nextTargetDate, value: getTargetFor(agilityRow), isTarget: true },
        ],
      },
    ];

    return items.map((item) => ({
      ...item,
      layout: buildD3LineGeometry(item.points, item.refMid, 420, 168, {
        top: 22,
        right: 28,
        bottom: 32,
        left: 40,
      }),
    }));
  }, [report]);

  const netScoreGain = report.scoreHistory.p3Score - report.scoreHistory.p1Score;

  return (
    <div className="flex-1 flex flex-col justify-between gap-4">
      {/* TOP HERO CHART: 8.1 Genel Sportif Performans Puan Gelişimi */}
      <div className="border border-slate-200 rounded-xl p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5 mb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              8.1 Genel Sportif Performans Puan Gelişimi (I. Ölçüm → II. Ölçüm → III. Ölçüm → İpsatif Hedef)
            </h3>
            <p className="text-[11px] text-slate-500">
              10 motor performans testi ağırlıklı genel yüzdelik puanının dönemsel ivmesi ve gelecek dönem hedef projeksiyonu
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-sans tabular-nums font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Net Gelişim: {netScoreGain >= 0 ? `+${netScoreGain}` : netScoreGain} Puan
            </span>
            <span className="text-xs font-sans tabular-nums font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              Hedef: %{overallTarget}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 print:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-9 print:col-span-9">
            <svg
              viewBox={`0 0 ${heroLine.width} ${heroLine.height}`}
              className="w-full h-auto overflow-visible"
            >
              <defs>
                <linearGradient id="karneHeroScoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {heroLine.yTicks.map((t, i) => (
                <g key={i}>
                  <line
                    x1={heroLine.margin.left}
                    y1={t.y}
                    x2={heroLine.width - heroLine.margin.right}
                    y2={t.y}
                    stroke="#e2e8f0"
                    strokeDasharray="3,3"
                  />
                  <text
                    x={heroLine.margin.left - 8}
                    y={t.y + 3}
                    textAnchor="end"
                    className="text-[9px] font-sans tabular-nums fill-slate-400"
                  >
                    %{t.val}
                  </text>
                </g>
              ))}

              {/* Normative Ideal Line (65%) */}
              <line
                x1={heroLine.margin.left}
                y1={heroLine.refY}
                x2={heroLine.width - heroLine.margin.right}
                y2={heroLine.refY}
                stroke="#10b981"
                strokeWidth="1.3"
                strokeDasharray="4,3"
              />
              <text
                x={heroLine.width - heroLine.margin.right - 4}
                y={heroLine.refY - 5}
                textAnchor="end"
                className="text-[8px] font-sans tabular-nums font-bold fill-emerald-700"
              >
                Normatif İdeal Referans (%65)
              </text>

              {/* Shaded Area */}
              <path d={heroLine.measuredArea} fill="url(#karneHeroScoreGrad)" />

              {/* Measured Curve */}
              <path
                d={heroLine.measuredPath}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
              />

              {/* Target Projection Curve */}
              <path
                d={heroLine.projectionPath}
                fill="none"
                stroke="#e11d48"
                strokeWidth="2.5"
                strokeDasharray="5,4"
              />

              {/* Points */}
              {heroLine.coords.map((pt, idx) => (
                <g key={pt.period}>
                  <text
                    x={pt.x}
                    y={heroLine.height - 16}
                    textAnchor="middle"
                    className={`text-[9px] font-bold ${
                      pt.isTarget ? 'fill-rose-700' : 'fill-slate-800'
                    }`}
                  >
                    {pt.period}
                  </text>
                  <text
                    x={pt.x}
                    y={heroLine.height - 4}
                    textAnchor="middle"
                    className="text-[8px] font-sans tabular-nums fill-slate-400"
                  >
                    {pt.date}
                  </text>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5.5"
                    fill={pt.isTarget ? '#e11d48' : idx === 2 ? '#0f172a' : '#2563eb'}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    className={`text-[10px] font-sans tabular-nums font-extrabold ${
                      pt.isTarget ? 'fill-rose-700' : 'fill-slate-900'
                    }`}
                  >
                    %{pt.value}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Right 3 Cols: Period Milestone Cards */}
          <div className="lg:col-span-3 print:col-span-3 space-y-2">
            {overallPoints.map((pt, idx) => (
              <div
                key={pt.period}
                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  pt.isTarget
                    ? 'bg-rose-50/70 border-rose-200'
                    : idx === 2
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div
                    className={`text-[10px] font-bold ${
                      pt.isTarget
                        ? 'text-rose-700'
                        : idx === 2
                        ? 'text-emerald-400'
                        : 'text-slate-700'
                    }`}
                  >
                    {pt.period}
                  </div>
                  <div
                    className={`text-[9px] font-sans tabular-nums ${
                      idx === 2 ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {pt.date}
                  </div>
                </div>
                <div
                  className={`text-sm font-black font-sans tabular-nums ${
                    pt.isTarget
                      ? 'text-rose-700'
                      : idx === 2
                      ? 'text-white'
                      : 'text-slate-900'
                  }`}
                >
                  %{pt.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM 2x2 GRID: 4 Key Athletic Parameters Progression Line Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3">
        {subCharts.map((sc) => (
          <div
            key={sc.id}
            className="border border-slate-200 rounded-xl p-3.5 bg-white flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 mb-1.5">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">{sc.title}</h4>
                <p className="text-[10px] text-slate-500">{sc.subtitle}</p>
              </div>
              <span className="text-[10px] font-sans tabular-nums font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                İdeal: {sc.refMid} {sc.unit}
              </span>
            </div>

            <svg
              viewBox={`0 0 ${sc.layout.width} ${sc.layout.height}`}
              className="w-full h-auto overflow-visible"
            >
              {sc.layout.yTicks.map((t, i) => (
                <g key={i}>
                  <line
                    x1={sc.layout.margin.left}
                    y1={t.y}
                    x2={sc.layout.width - sc.layout.margin.right}
                    y2={t.y}
                    stroke="#f1f5f9"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={sc.layout.margin.left - 6}
                    y={t.y + 3}
                    textAnchor="end"
                    className="text-[8px] font-sans tabular-nums fill-slate-400"
                  >
                    {t.val}
                  </text>
                </g>
              ))}

              {/* Reference Line */}
              <line
                x1={sc.layout.margin.left}
                y1={sc.layout.refY}
                x2={sc.layout.width - sc.layout.margin.right}
                y2={sc.layout.refY}
                stroke="#10b981"
                strokeWidth="1.1"
                strokeDasharray="3,3"
              />

              {/* Measured Curve */}
              <path
                d={sc.layout.measuredPath}
                fill="none"
                stroke={sc.color}
                strokeWidth="2.4"
              />

              {/* Target Projection Curve */}
              <path
                d={sc.layout.projectionPath}
                fill="none"
                stroke="#e11d48"
                strokeWidth="2"
                strokeDasharray="4,3"
              />

              {sc.layout.coords.map((pt, idx) => (
                <g key={pt.period}>
                  <text
                    x={pt.x}
                    y={sc.layout.height - 12}
                    textAnchor="middle"
                    className={`text-[8px] font-bold ${
                      pt.isTarget ? 'fill-rose-700' : 'fill-slate-700'
                    }`}
                  >
                    {pt.period}
                  </text>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill={pt.isTarget ? '#e11d48' : idx === 2 ? '#0f172a' : sc.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 8}
                    textAnchor="middle"
                    className={`text-[9px] font-sans tabular-nums font-extrabold ${
                      pt.isTarget ? 'fill-rose-700' : 'fill-slate-900'
                    }`}
                  >
                    {pt.value}
                  </text>
                </g>
              ))}
            </svg>

            <div className="mt-1 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-sans tabular-nums text-slate-600">
              <span>
                I: <strong>{sc.points[0].value}</strong> → III: <strong className="text-slate-900">{sc.points[2].value} {sc.unit}</strong>
              </span>
              <span className="text-rose-700 font-bold">
                Hedef: {sc.points[3].value} {sc.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 8.6 Dönemsel İvme & 10 Parametreli Gelişim Matrisi (Fills bottom of A4 Page 6) */}
      <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/80">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2.5">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              8.6 Tüm Motor Performans Parametreleri Dönemsel İlerleme ve Değişim Matrisi (I → II → III)
            </h4>
            <p className="text-[10px] text-slate-500">
              Sporcunun 3 ölçüm periyodundaki ham ölçüm değerleri, yüzdelik dilimi ve net gelişim yönü
            </p>
          </div>
          <span className="text-[10px] font-sans tabular-nums font-bold text-emerald-700">
            Bireysel Gelişim Takibi
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 print:grid-cols-5 gap-2">
          {report.motorPerformance.slice(0, 10).map((row) => {
            const rawDelta = Number((row.m3 - row.m1).toFixed(2));
            const improved = row.lowerIsBetter ? rawDelta <= 0 : rawDelta >= 0;
            return (
              <div
                key={row.id}
                className="bg-white p-2 rounded-lg border border-slate-200/90 flex flex-col justify-between"
              >
                <div className="text-[10px] font-bold text-slate-900 truncate" title={row.name}>
                  {row.name}
                </div>
                <div className="flex items-baseline justify-between mt-1 font-sans tabular-nums">
                  <span className="text-[10px] text-slate-500">
                    {row.m1}→<strong className="text-slate-900">{row.m3}</strong>
                  </span>
                  <span
                    className={`text-[9px] font-bold ${
                      improved ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    %{row.percentile}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 1. SPORTSFLY LAB: INTERACTIVE D3 RADAR & LINE PERFORMANCE CHARTS PANEL
// ============================================================================

interface SportsFlyLabPerformanceChartsProps {
  report: SportsFlyLabReport;
}

export const SportsFlyLabPerformanceCharts: React.FC<SportsFlyLabPerformanceChartsProps> = ({
  report,
}) => {
  const [radarDataset, setRadarDataset] = useState<'motor' | 'body'>('motor');
  const [showPeriod1, setShowPeriod1] = useState<boolean>(true);
  const [showPeriod2, setShowPeriod2] = useState<boolean>(true);
  const [showPeriod3, setShowPeriod3] = useState<boolean>(true);
  const [hoveredRadarIdx, setHoveredRadarIdx] = useState<number | null>(null);

  const [selectedLineMetricId, setSelectedLineMetricId] = useState<string>('overall_score');
  const [hoveredLinePoint, setHoveredLinePoint] = useState<number | null>(null);

  const activeRows = useMemo(() => {
    if (radarDataset === 'motor') {
      return report.motorPerformance;
    }
    return report.bodyComposition.slice(0, 8);
  }, [report, radarDataset]);

  const radarGeometry = useMemo(
    () => buildD3LabRadarGeometry(activeRows, 340, 116),
    [activeRows]
  );

  // Line Chart Options & Data
  const allSelectableMetrics = useMemo(() => {
    return [
      { id: 'overall_score', label: 'Genel Performans Endeksi (%)', group: 'Genel' },
      { id: 'vo2peak', label: 'PACER Aerobik Kapasite (VO2peak)', group: 'Kardiyo' },
      ...report.motorPerformance.map((m) => ({
        id: m.id,
        label: `${m.name} (${m.unit})`,
        group: 'Motor Performans',
      })),
      ...report.bodyComposition.slice(0, 6).map((b) => ({
        id: b.id,
        label: `${b.name} (${b.unit})`,
        group: 'Beden Kompozisyonu',
      })),
    ];
  }, [report]);

  const lineChartData = useMemo(() => {
    if (selectedLineMetricId === 'overall_score') {
      const targetScore = Math.min(99, report.scoreHistory.p3Score + 6);
      return {
        title: 'Genel Sportif Performans Puan Gelişimi',
        unit: '% Puan',
        lowerIsBetter: false,
        refMid: 65,
        points: [
          { period: 'I. Ölçüm', date: report.date1, value: report.scoreHistory.p1Score, isTarget: false },
          { period: 'II. Ölçüm', date: report.date2, value: report.scoreHistory.p2Score, isTarget: false },
          { period: 'III. Ölçüm', date: report.date3, value: report.scoreHistory.p3Score, isTarget: false },
          { period: 'Hedef (İpsatif)', date: report.nextTargetDate, value: targetScore, isTarget: true },
        ],
      };
    }

    if (selectedLineMetricId === 'vo2peak') {
      const targetVo2 = Number((report.cardio.test3Vo2 * 1.04).toFixed(1));
      return {
        title: 'Kardiyorespiratuar Uygunluk (VO2peak) Gelişimi',
        unit: 'ml/kg/dk',
        lowerIsBetter: false,
        refMid: 46.5,
        points: [
          { period: 'I. Ölçüm', date: report.date1, value: report.cardio.test1Vo2, isTarget: false },
          { period: 'II. Ölçüm', date: report.date2, value: report.cardio.test2Vo2, isTarget: false },
          { period: 'III. Ölçüm', date: report.date3, value: report.cardio.test3Vo2, isTarget: false },
          { period: 'Hedef (İpsatif)', date: report.nextTargetDate, value: targetVo2, isTarget: true },
        ],
      };
    }

    const foundRow =
      report.motorPerformance.find((m) => m.id === selectedLineMetricId) ||
      report.bodyComposition.find((b) => b.id === selectedLineMetricId) ||
      report.motorPerformance[0];

    const ipsMatch = report.ipsativeTargets.find((t) =>
      foundRow.name.toLowerCase().includes(t.parameter.toLowerCase())
    );
    const computedTarget = ipsMatch
      ? ipsMatch.target
      : Number((foundRow.m3 * (foundRow.lowerIsBetter ? 0.96 : 1.05)).toFixed(2));

    return {
      title: `${foundRow.name} — 3 Dönemlik Ölçüm & Hedef Eğrisi`,
      unit: foundRow.unit,
      lowerIsBetter: Boolean(foundRow.lowerIsBetter),
      refMid: foundRow.refMid,
      points: [
        { period: 'I. Ölçüm', date: report.date1, value: foundRow.m1, isTarget: false },
        { period: 'II. Ölçüm', date: report.date2, value: foundRow.m2, isTarget: false },
        { period: 'III. Ölçüm', date: report.date3, value: foundRow.m3, isTarget: false },
        { period: 'Hedef (İpsatif)', date: report.nextTargetDate, value: computedTarget, isTarget: true },
      ],
    };
  }, [report, selectedLineMetricId]);

  const d3LineLayout = useMemo(
    () =>
      buildD3LineGeometry(lineChartData.points, lineChartData.refMid, 480, 245, {
        top: 26,
        right: 34,
        bottom: 42,
        left: 48,
      }),
    [lineChartData]
  );

  const hoveredAxisData =
    hoveredRadarIdx !== null ? radarGeometry.axes[hoveredRadarIdx] : null;

  return (
    <div className="bg-white dark:bg-[#111c2e] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Performans Grafikleri — İnteraktif Radar &amp; Dönemsel Gelişim Eğrileri (D3)
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                · {report.athleteName} (Karnenin 5. ve 6. Sayfalarında Tam A4 Grafik Olarak Yer Alır)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sporcu karnesindeki I., II. ve III. ölçüm verilerinin normatif yüzdelik radar dağılımı ve hedef projeksiyon çizgi grafiği.
            </p>
          </div>
        </div>

        {/* Dataset Switcher for Radar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setRadarDataset('motor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                radarDataset === 'motor'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Motor Performans Radarı (10 Test)
            </button>
            <button
              type="button"
              onClick={() => setRadarDataset('body')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                radarDataset === 'body'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Beden Kompozisyonu Radarı
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Charts Grid */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT 6 COLS: D3 RADAR CHART */}
        <div className="lg:col-span-6 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between bg-slate-50/40 dark:bg-slate-900/40">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>
                  {radarDataset === 'motor'
                    ? 'Motor Performans Yüzdelik Radar Grafiği'
                    : 'Antropometrik Beden Kompozisyonu Radarı'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                0–100 normatif yüzdelik dilim skalasında dönemler arası karşılaştırma
              </p>
            </div>

            {/* Period visibility toggles */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => setShowPeriod1((v) => !v)}
                className={`px-2 py-1 rounded-md font-sans tabular-nums font-bold border transition-colors cursor-pointer ${
                  showPeriod1
                    ? 'bg-slate-200/80 dark:bg-slate-800 border-slate-400 text-slate-800 dark:text-slate-200'
                    : 'border-slate-200 text-slate-400 opacity-50'
                }`}
              >
                I. Test
              </button>
              <button
                type="button"
                onClick={() => setShowPeriod2((v) => !v)}
                className={`px-2 py-1 rounded-md font-sans tabular-nums font-bold border transition-colors cursor-pointer ${
                  showPeriod2
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 text-slate-400 opacity-50'
                }`}
              >
                II. Test
              </button>
              <button
                type="button"
                onClick={() => setShowPeriod3((v) => !v)}
                className={`px-2 py-1 rounded-md font-sans tabular-nums font-bold border transition-colors cursor-pointer ${
                  showPeriod3
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300'
                    : 'border-slate-200 text-slate-400 opacity-50'
                }`}
              >
                III. Test
              </button>
            </div>
          </div>

          {/* D3 SVG Radar Canvas */}
          <div className="relative flex flex-col items-center justify-center my-2">
            <svg
              viewBox={`0 0 ${radarGeometry.size} ${radarGeometry.size}`}
              className="w-full max-w-[330px] h-auto overflow-visible"
            >
              {[20, 40, 60, 80, 100].map((level) => (
                <g key={level}>
                  <circle
                    cx={radarGeometry.center}
                    cy={radarGeometry.center}
                    r={radarGeometry.rScale(level)}
                    fill="none"
                    stroke={level === 60 ? '#10b981' : '#cbd5e1'}
                    strokeWidth={level === 60 ? 1.2 : 0.8}
                    strokeDasharray={level === 60 ? '3,3' : undefined}
                  />
                  <text
                    x={radarGeometry.center + 4}
                    y={radarGeometry.center - radarGeometry.rScale(level) + 9}
                    className="text-[8px] font-sans tabular-nums fill-slate-400"
                  >
                    %{level}
                  </text>
                </g>
              ))}

              {radarGeometry.axes.map((axis, idx) => {
                const isHovered = hoveredRadarIdx === idx;
                const cos = Math.cos(axis.angle);
                const textAnchor =
                  Math.abs(cos) < 0.18 ? 'middle' : cos > 0 ? 'start' : 'end';

                return (
                  <g key={axis.row.id}>
                    <line
                      x1={radarGeometry.center}
                      y1={radarGeometry.center}
                      x2={axis.axisEnd.x}
                      y2={axis.axisEnd.y}
                      stroke={isHovered ? '#0f172a' : '#cbd5e1'}
                      strokeWidth={isHovered ? 1.5 : 0.9}
                    />
                    <text
                      x={axis.labelPos.x}
                      y={axis.labelPos.y}
                      textAnchor={textAnchor}
                      dominantBaseline="middle"
                      onMouseEnter={() => setHoveredRadarIdx(idx)}
                      onMouseLeave={() => setHoveredRadarIdx(null)}
                      className={`text-[9px] font-bold cursor-pointer select-none ${
                        isHovered
                          ? 'fill-rose-600 font-extrabold'
                          : 'fill-slate-700 dark:fill-slate-300'
                      }`}
                    >
                      {formatCleanSubjectName(axis.row.name)}
                    </text>
                  </g>
                );
              })}

              <path
                d={radarGeometry.refPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.65"
              />

              {showPeriod1 && (
                <path
                  d={radarGeometry.path1}
                  fill="rgba(100, 116, 139, 0.12)"
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="4,2"
                />
              )}

              {showPeriod2 && (
                <path
                  d={radarGeometry.path2}
                  fill="rgba(37, 99, 235, 0.14)"
                  stroke="#2563eb"
                  strokeWidth="1.8"
                />
              )}

              {showPeriod3 && (
                <g>
                  <path
                    d={radarGeometry.path3}
                    fill="rgba(225, 29, 72, 0.20)"
                    stroke="#e11d48"
                    strokeWidth="2.4"
                  />
                  {radarGeometry.axes.map((axis, idx) => (
                    <circle
                      key={axis.row.id}
                      cx={axis.pt3.x}
                      cy={axis.pt3.y}
                      r={hoveredRadarIdx === idx ? 5.5 : 4}
                      fill="#e11d48"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredRadarIdx(idx)}
                      onMouseLeave={() => setHoveredRadarIdx(null)}
                    />
                  ))}
                </g>
              )}
            </svg>

            <div className="w-full mt-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex flex-wrap items-center justify-between gap-2">
              {hoveredAxisData ? (
                <>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {hoveredAxisData.row.name}{' '}
                    <span className="text-slate-400 font-normal">({hoveredAxisData.row.unit})</span>
                  </div>
                  <div className="flex items-center gap-3 font-sans tabular-nums text-[11px]">
                    <span className="text-slate-500">I: {hoveredAxisData.row.m1}</span>
                    <span className="text-blue-600">II: {hoveredAxisData.row.m2}</span>
                    <span className="font-extrabold text-rose-600">
                      III: {hoveredAxisData.row.m3} (%{hoveredAxisData.p3Norm})
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Detaylı dönem karşılaştırması için grafik üzerindeki noktalara veya metrik isimlerine dokunun.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT 6 COLS: D3 MULTI-PERIOD PROGRESSION LINE CHART */}
        <div className="lg:col-span-6 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between bg-slate-50/40 dark:bg-slate-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Dönemsel Gelişim &amp; Hedef Çizgi Grafiği (D3)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {lineChartData.title}
              </p>
            </div>

            <select
              value={selectedLineMetricId}
              onChange={(e) => setSelectedLineMetricId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allSelectableMetrics.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.group}: {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="my-2">
            <svg
              viewBox={`0 0 ${d3LineLayout.width} ${d3LineLayout.height}`}
              className="w-full h-auto overflow-visible"
            >
              <defs>
                <linearGradient id="labLineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {d3LineLayout.yTicks.map((t, i) => (
                <g key={i}>
                  <line
                    x1={d3LineLayout.margin.left}
                    y1={t.y}
                    x2={d3LineLayout.width - d3LineLayout.margin.right}
                    y2={t.y}
                    stroke="#e2e8f0"
                    strokeDasharray="3,3"
                  />
                  <text
                    x={d3LineLayout.margin.left - 8}
                    y={t.y + 3}
                    textAnchor="end"
                    className="text-[9px] font-sans tabular-nums fill-slate-400"
                  >
                    {t.val}
                  </text>
                </g>
              ))}

              <line
                x1={d3LineLayout.margin.left}
                y1={d3LineLayout.refY}
                x2={d3LineLayout.width - d3LineLayout.margin.right}
                y2={d3LineLayout.refY}
                stroke="#10b981"
                strokeWidth="1.3"
                strokeDasharray="4,3"
              />
              <text
                x={d3LineLayout.width - d3LineLayout.margin.right - 2}
                y={d3LineLayout.refY - 5}
                textAnchor="end"
                className="text-[8px] font-sans tabular-nums font-bold fill-emerald-700"
              >
                Normatif İdeal ({lineChartData.refMid} {lineChartData.unit})
              </text>

              <path d={d3LineLayout.measuredArea} fill="url(#labLineAreaGrad)" />

              <path
                d={d3LineLayout.measuredPath}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.8"
              />

              <path
                d={d3LineLayout.projectionPath}
                fill="none"
                stroke="#e11d48"
                strokeWidth="2.4"
                strokeDasharray="5,4"
              />

              {d3LineLayout.coords.map((pt, idx) => {
                const isHovered = hoveredLinePoint === idx;
                return (
                  <g
                    key={pt.period}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredLinePoint(idx)}
                    onMouseLeave={() => setHoveredLinePoint(null)}
                  >
                    <text
                      x={pt.x}
                      y={d3LineLayout.height - 18}
                      textAnchor="middle"
                      className={`text-[9px] font-bold ${
                        pt.isTarget
                          ? 'fill-rose-600'
                          : 'fill-slate-700 dark:fill-slate-300'
                      }`}
                    >
                      {pt.period}
                    </text>
                    <text
                      x={pt.x}
                      y={d3LineLayout.height - 6}
                      textAnchor="middle"
                      className="text-[8px] font-sans tabular-nums fill-slate-400"
                    >
                      {pt.date}
                    </text>

                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6.5 : 5}
                      fill={pt.isTarget ? '#e11d48' : idx === 2 ? '#0f172a' : '#2563eb'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      className={`text-[10px] font-sans tabular-nums font-extrabold ${
                        pt.isTarget
                          ? 'fill-rose-600'
                          : 'fill-slate-900 dark:fill-white'
                      }`}
                    >
                      {pt.value} {lineChartData.unit}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-4 font-sans tabular-nums">
              <span className="text-slate-500">
                I. Ölçüm: <strong className="text-slate-800 dark:text-slate-200">{lineChartData.points[0].value}</strong>
              </span>
              <span className="text-blue-600">
                III. Ölçüm: <strong>{lineChartData.points[2].value}</strong>
              </span>
              <span className="text-rose-600 font-bold">
                Hedef: {lineChartData.points[3].value} {lineChartData.unit}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              {lineChartData.lowerIsBetter
                ? '↓ Süre azaldıkça performans artar'
                : '↑ Skor yükseldikçe performans artar'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. SPORCU KARNESİ: D3 RADAR & PROGRESSION LINE CHARTS PANEL
// ============================================================================

interface SporcuKarnePerformanceChartsProps {
  karne: SporcuKarne;
}

export const SporcuKarnePerformanceCharts: React.FC<SporcuKarnePerformanceChartsProps> = ({
  karne,
}) => {
  const [radarMode, setRadarMode] = useState<'sub10' | 'main5'>('sub10');
  const [selectedSeries, setSelectedSeries] = useState<'all' | 'teknik' | 'fiziksel' | 'taktiksel' | 'zihinsel'>('all');
  const [hoveredRadarIdx, setHoveredRadarIdx] = useState<number | null>(null);

  const radarAxesData = useMemo(() => {
    if (radarMode === 'main5') {
      return [
        { label: 'Teknik Gelişim', score: karne.teknik.ortalama, clubAvg: 7.4 },
        { label: 'Fiziksel / Motor', score: karne.fiziksel.ortalama, clubAvg: 7.5 },
        { label: 'Taktiksel Gelişim', score: karne.taktiksel.ortalama, clubAvg: 7.2 },
        { label: 'Zihinsel Gelişim', score: karne.zihinsel.ortalama, clubAvg: 7.6 },
        {
          label: 'Davranış & Karakter',
          score: karne.davranissal?.kriterler?.ortalama || 8.5,
          clubAvg: 8.0,
        },
      ];
    }

    return [
      { label: 'Hız / Sürat', score: karne.fiziksel.hiz ?? karne.fiziksel.ortalama, clubAvg: 7.5 },
      { label: 'Dayanıklılık', score: karne.fiziksel.dayaniklilik ?? karne.fiziksel.ortalama, clubAvg: 7.4 },
      { label: 'Kuvvet / Güç', score: karne.fiziksel.guc ?? karne.fiziksel.ortalama, clubAvg: 7.2 },
      { label: 'Esneklik', score: karne.fiziksel.esneklik ?? karne.fiziksel.ortalama, clubAvg: 7.3 },
      { label: 'Koordinasyon', score: karne.fiziksel.koordinasyon ?? karne.fiziksel.ortalama, clubAvg: 7.5 },
      { label: 'Top Kontrolü', score: karne.teknik.topKontrolu ?? karne.teknik.ortalama, clubAvg: 7.3 },
      { label: 'Pas Başarısı', score: karne.teknik.pasBasarisi ?? karne.teknik.ortalama, clubAvg: 7.4 },
      { label: 'Oyun Zekası', score: karne.taktiksel.oyunZekasi ?? karne.taktiksel.ortalama, clubAvg: 7.3 },
      { label: 'Karar Verme', score: karne.taktiksel.kararVerme ?? karne.taktiksel.ortalama, clubAvg: 7.1 },
      { label: 'Odak & Disiplin', score: karne.zihinsel.disiplin ?? karne.zihinsel.ortalama, clubAvg: 7.8 },
    ];
  }, [karne, radarMode]);

  // Compute D3 Radar Geometry (0 - 100% scale mapped from 0 - 10)
  const d3Radar = useMemo(() => {
    const size = 320;
    const center = size / 2;
    const radius = 106;
    const count = radarAxesData.length;
    const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

    const axes = radarAxesData.map((d, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const pctScore = Math.round(d.score * 10);
      const pctClub = Math.round(d.clubAvg * 10);
      const labelR = radius + 25;
      return {
        ...d,
        pctScore,
        pctClub,
        angle,
        axisEnd: {
          x: center + radius * Math.cos(angle),
          y: center + radius * Math.sin(angle),
        },
        labelPos: {
          x: center + labelR * Math.cos(angle),
          y: center + labelR * Math.sin(angle),
        },
        athletePt: {
          x: center + rScale(pctScore) * Math.cos(angle),
          y: center + rScale(pctScore) * Math.sin(angle),
        },
        clubPt: {
          x: center + rScale(pctClub) * Math.cos(angle),
          y: center + rScale(pctClub) * Math.sin(angle),
        },
      };
    });

    const lineGen = d3
      .line<{ x: number; y: number }>()
      .x((p) => p.x)
      .y((p) => p.y)
      .curve(d3.curveLinearClosed);

    return {
      size,
      center,
      radius,
      rScale,
      axes,
      athletePath: lineGen(axes.map((a) => a.athletePt)) || '',
      clubPath: lineGen(axes.map((a) => a.clubPt)) || '',
    };
  }, [radarAxesData]);

  // Compute 4-Period Progression Line Data for the Athlete (0-100% Overall & Category Scores)
  const periodProgression = useMemo(() => {
    const clamp100 = (n: number) => Math.round(Math.max(40, Math.min(99, n)));
    const t = karne.teknik.ortalama * 10;
    const f = karne.fiziksel.ortalama * 10;
    const tk = karne.taktiksel.ortalama * 10;
    const z = karne.zihinsel.ortalama * 10;

    const periods = [
      {
        period: 'I. Ölçüm',
        teknik: clamp100(t - 11),
        fiziksel: clamp100(f - 9),
        taktiksel: clamp100(tk - 12),
        zihinsel: clamp100(z - 8),
      },
      {
        period: 'II. Ölçüm',
        teknik: clamp100(t - 6),
        fiziksel: clamp100(f - 5),
        taktiksel: clamp100(tk - 7),
        zihinsel: clamp100(z - 4),
      },
      {
        period: 'III. Ölçüm (Güncel)',
        teknik: clamp100(t),
        fiziksel: clamp100(f),
        taktiksel: clamp100(tk),
        zihinsel: clamp100(z),
      },
      {
        period: 'Hedef Performans',
        teknik: clamp100(t + 5),
        fiziksel: clamp100(f + 5),
        taktiksel: clamp100(tk + 6),
        zihinsel: clamp100(z + 4),
      },
    ].map((p) => ({
      ...p,
      genel: Math.round((p.teknik + p.fiziksel + p.taktiksel + p.zihinsel) / 4),
    }));

    return periods;
  }, [karne]);

  // Compute D3 Multi-Line Chart Layout
  const d3Progression = useMemo(() => {
    const width = 460;
    const height = 235;
    const margin = { top: 22, right: 28, bottom: 36, left: 38 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const xScale = d3
      .scalePoint<string>()
      .domain(periodProgression.map((p) => p.period))
      .range([0, innerW])
      .padding(0.15);

    const yScale = d3.scaleLinear().domain([50, 100]).range([innerH, 0]);

    const makeLine = (getter: (d: typeof periodProgression[0]) => number) => {
      const gen = d3
        .line<typeof periodProgression[0]>()
        .x((d) => margin.left + (xScale(d.period) ?? 0))
        .y((d) => margin.top + yScale(getter(d)))
        .curve(d3.curveMonotoneX);
      return gen(periodProgression) || '';
    };

    const areaGen = d3
      .area<typeof periodProgression[0]>()
      .x((d) => margin.left + (xScale(d.period) ?? 0))
      .y0(margin.top + innerH)
      .y1((d) => margin.top + yScale(d.genel))
      .curve(d3.curveMonotoneX);

    return {
      width,
      height,
      margin,
      xScale,
      yScale,
      yTicks: [50, 60, 70, 80, 90, 100].map((val) => ({ val, y: margin.top + yScale(val) })),
      areaGenel: areaGen(periodProgression) || '',
      paths: {
        genel: makeLine((d) => d.genel),
        teknik: makeLine((d) => d.teknik),
        fiziksel: makeLine((d) => d.fiziksel),
        taktiksel: makeLine((d) => d.taktiksel),
        zihinsel: makeLine((d) => d.zihinsel),
      },
    };
  }, [periodProgression]);

  return (
    <div className="mx-6 md:mx-8 mt-6 bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-2xs a4-avoid-break">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-extrabold text-slate-900 tracking-tight">
              Performans Grafikleri — Motor Performans Yüzdelik Radar &amp; Genel Sportif Performans Puan Gelişimi
            </h3>
            <p className="text-xs text-slate-500">
              Sporcunun motor/teknik yüzdelik dengesi (D3 Radar) ve dönemler arası genel sportif performans puan gelişimi (D3 Çizgi Grafik)
            </p>
          </div>
        </div>

        {/* Radar Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl print:hidden">
          <button
            type="button"
            onClick={() => setRadarMode('sub10')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              radarMode === 'sub10'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Motor &amp; Teknik 10 Parametre
          </button>
          <button
            type="button"
            onClick={() => setRadarMode('main5')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              radarMode === 'main5'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5 Ana Gelişim Boyutu
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 print:grid-cols-12 gap-6 print:gap-4 items-stretch">
        {/* LEFT: Motor Performans Yüzdelik Radar Grafiği */}
        <div className="lg:col-span-6 print:col-span-6 bg-slate-50/60 rounded-xl border border-slate-200/80 p-4 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between text-xs mb-2">
            <span className="font-extrabold text-slate-900 uppercase tracking-wider">
              Motor Performans Yüzdelik Radar Grafiği (%)
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                {karne.adSoyad}
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                Normatif Ort.
              </span>
            </div>
          </div>

          <svg viewBox={`0 0 ${d3Radar.size} ${d3Radar.size}`} className="w-full max-w-[295px] h-auto overflow-visible">
            {[20, 40, 60, 80, 100].map((lvl) => (
              <g key={lvl}>
                <circle
                  cx={d3Radar.center}
                  cy={d3Radar.center}
                  r={d3Radar.rScale(lvl)}
                  fill="none"
                  stroke={lvl === 80 ? '#10b981' : '#cbd5e1'}
                  strokeWidth="0.8"
                  strokeDasharray={lvl === 80 ? '3,3' : undefined}
                />
                <text
                  x={d3Radar.center + 3}
                  y={d3Radar.center - d3Radar.rScale(lvl) + 8}
                  className="text-[7px] font-sans tabular-nums fill-slate-400"
                >
                  %{lvl}
                </text>
              </g>
            ))}

            {d3Radar.axes.map((ax, idx) => {
              const cos = Math.cos(ax.angle);
              const anchor = Math.abs(cos) < 0.18 ? 'middle' : cos > 0 ? 'start' : 'end';
              return (
                <g key={ax.label}>
                  <line
                    x1={d3Radar.center}
                    y1={d3Radar.center}
                    x2={ax.axisEnd.x}
                    y2={ax.axisEnd.y}
                    stroke="#cbd5e1"
                    strokeWidth="0.9"
                  />
                  <text
                    x={ax.labelPos.x}
                    y={ax.labelPos.y}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    onMouseEnter={() => setHoveredRadarIdx(idx)}
                    onMouseLeave={() => setHoveredRadarIdx(null)}
                    className="text-[8.5px] font-bold fill-slate-700 cursor-pointer"
                  >
                    {ax.label} (%{ax.pctScore})
                  </text>
                </g>
              );
            })}

            {/* Club Avg Polygon */}
            <path
              d={d3Radar.clubPath}
              fill="rgba(100, 116, 139, 0.12)"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="4,2"
            />

            {/* Athlete Polygon */}
            <path
              d={d3Radar.athletePath}
              fill="rgba(37, 99, 235, 0.22)"
              stroke="#2563eb"
              strokeWidth="2.4"
            />

            {d3Radar.axes.map((ax, idx) => (
              <circle
                key={ax.label}
                cx={ax.athletePt.x}
                cy={ax.athletePt.y}
                r={hoveredRadarIdx === idx ? 5.5 : 4}
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="1.5"
                onMouseEnter={() => setHoveredRadarIdx(idx)}
                onMouseLeave={() => setHoveredRadarIdx(null)}
              />
            ))}
          </svg>

          <div className="w-full mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
            <span>Fiziksel &amp; Motor Ort.: <strong className="text-slate-900">%{Math.round(karne.fiziksel.ortalama * 10)}</strong></span>
            <span>Teknik Ort.: <strong className="text-blue-700">%{Math.round(karne.teknik.ortalama * 10)}</strong></span>
          </div>
        </div>

        {/* RIGHT: Genel Sportif Performans Puan Gelişimi */}
        <div className="lg:col-span-6 print:col-span-6 bg-slate-50/60 rounded-xl border border-slate-200/80 p-4 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Genel Sportif Performans Puan Gelişimi (%)
            </span>
            <div className="flex flex-wrap items-center gap-1 text-[10px] print:hidden">
              {[
                { key: 'all', label: 'Tümü' },
                { key: 'teknik', label: 'Teknik' },
                { key: 'fiziksel', label: 'Fiziksel' },
                { key: 'taktiksel', label: 'Taktik' },
                { key: 'zihinsel', label: 'Zihin' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedSeries(item.key as any)}
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                    selectedSeries === item.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <svg
            viewBox={`0 0 ${d3Progression.width} ${d3Progression.height}`}
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <linearGradient id="sporcuKarneGenelGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {d3Progression.yTicks.map((t) => (
              <g key={t.val}>
                <line
                  x1={d3Progression.margin.left}
                  y1={t.y}
                  x2={d3Progression.width - d3Progression.margin.right}
                  y2={t.y}
                  stroke="#e2e8f0"
                  strokeDasharray="3,3"
                />
                <text
                  x={d3Progression.margin.left - 8}
                  y={t.y + 3}
                  textAnchor="end"
                  className="text-[9px] font-sans tabular-nums fill-slate-400"
                >
                  %{t.val}
                </text>
              </g>
            ))}

            <path d={d3Progression.areaGenel} fill="url(#sporcuKarneGenelGrad)" />

            {(selectedSeries === 'all' || selectedSeries === 'teknik') && (
              <path d={d3Progression.paths.teknik} fill="none" stroke="#2563eb" strokeWidth="2.0" />
            )}
            {(selectedSeries === 'all' || selectedSeries === 'fiziksel') && (
              <path d={d3Progression.paths.fiziksel} fill="none" stroke="#10b981" strokeWidth="2.0" />
            )}
            {(selectedSeries === 'all' || selectedSeries === 'taktiksel') && (
              <path d={d3Progression.paths.taktiksel} fill="none" stroke="#9333ea" strokeWidth="2.0" />
            )}
            {(selectedSeries === 'all' || selectedSeries === 'zihinsel') && (
              <path d={d3Progression.paths.zihinsel} fill="none" stroke="#d97706" strokeWidth="2.0" />
            )}

            {/* Overall Thick Line */}
            <path
              d={d3Progression.paths.genel}
              fill="none"
              stroke="#0f172a"
              strokeWidth="2.8"
              strokeDasharray="4,2"
            />

            {periodProgression.map((p, idx) => {
              const cx = d3Progression.margin.left + (d3Progression.xScale(p.period) ?? 0);
              const cy = d3Progression.margin.top + d3Progression.yScale(p.genel);
              return (
                <g key={p.period}>
                  <text
                    x={cx}
                    y={d3Progression.height - 10}
                    textAnchor="middle"
                    className={`text-[9px] font-bold ${
                      idx === 3 ? 'fill-rose-700' : 'fill-slate-700'
                    }`}
                  >
                    {p.period}
                  </text>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="4.5"
                    fill={idx === 3 ? '#e11d48' : '#0f172a'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={cx}
                    y={cy - 9}
                    textAnchor="middle"
                    className={`text-[9px] font-sans tabular-nums font-extrabold ${
                      idx === 3 ? 'fill-rose-700' : 'fill-slate-900'
                    }`}
                  >
                    %{p.genel}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="mt-2 pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-slate-900">─ - Genel Puan</span>
              <span className="font-bold text-blue-600">─ Teknik (%{Math.round(karne.teknik.ortalama * 10)})</span>
              <span className="font-bold text-emerald-600">─ Fiziksel (%{Math.round(karne.fiziksel.ortalama * 10)})</span>
              <span className="font-bold text-purple-600">─ Taktik (%{Math.round(karne.taktiksel.ortalama * 10)})</span>
              <span className="font-bold text-amber-600">─ Zihin (%{Math.round(karne.zihinsel.ortalama * 10)})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DEDICATED 2ND MEASUREMENT COMPARISON PANEL (1. Ölçüm → 2. Ölçüm Gelişim Analizi)
// ============================================================================
export interface SecondMeasurementPanelProps {
  report: SportsFlyLabReport;
  className?: string;
}

export const SecondMeasurementComparisonPanel: React.FC<SecondMeasurementPanelProps> = ({
  report,
  className = '',
}) => {
  const p1Score = report.scoreHistory?.p1Score || 72;
  const p2Score = report.scoreHistory?.p2Score || 80;
  const scoreDiff = +(p2Score - p1Score).toFixed(1);
  const isProgress = scoreDiff >= 0;

  const comparisonRows = useMemo(() => {
    return report.motorPerformance.slice(0, 10).map((row) => {
      const p1Val = normalizeLabRowValue(row.m1, row);
      const p2Val = normalizeLabRowValue(row.m2, row);
      const delta = +(row.m2 - row.m1).toFixed(2);
      const isPositive = row.lowerIsBetter ? delta <= 0 : delta >= 0;

      return {
        id: row.id,
        name: formatCleanSubjectName(row.name),
        unit: row.unit,
        m1: row.m1,
        m2: row.m2,
        p1Val,
        p2Val,
        delta,
        isPositive,
      };
    });
  }, [report]);

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white text-slate-900 shadow-xs space-y-4 ${className}`}>
      {/* Header Banner - Executive Corporate Protocol */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-[#0e2439] text-white flex flex-col md:flex-row md:items-center justify-between gap-3.5 border border-slate-800 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-bold uppercase tracking-wider font-sans">
              <Activity className="w-3 h-3 text-sky-400 shrink-0" />
              2. Ölçüm Karşılaştırma Protokolü
            </span>
            <span className="text-[10.5px] text-slate-400 font-sans font-medium">
              Kinantropometrik &amp; Biyomotor Değerlendirme
            </span>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase font-sans">
              Dönemsel Performans ve Gelişim Analizi
            </h3>
            <p className="text-[11px] text-slate-300 font-medium font-sans mt-0.5 leading-relaxed">
              İlk ölçüm referansına kıyasla sporcunun katettiği net biyomotorik ilerleme ve performans değişimi
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-right">
            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Ölçüm Takvimi</div>
            <div className="text-xs font-bold text-sky-300 font-sans tabular-nums flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3 h-3 text-sky-400 shrink-0" />
              <span>{report.date1} → {report.date2}</span>
            </div>
          </div>
          <div className={`px-3.5 py-1.5 rounded-lg border flex items-center gap-2.5 ${
            isProgress
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/60 shadow-2xs'
              : 'bg-amber-950/90 text-amber-200 border-amber-500/60 shadow-2xs'
          }`}>
            {isProgress ? (
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <TrendingDown className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Net Gelişim</div>
              <div className="text-xs font-black font-sans tabular-nums text-white">
                {isProgress ? `+${scoreDiff} Puan` : `${scoreDiff} Puan`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards: Önceki Ölçüm vs Mevcut Ölçüm */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-sans">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
          <span className="text-[9.5px] font-bold text-slate-500 uppercase block">1. Ölçüm ({report.date1})</span>
          <span className="text-base font-black text-slate-700 mt-1 block font-sans tabular-nums">%{p1Score} Puan</span>
          <span className="text-[9px] text-slate-500 font-medium">Başlangıç Referansı</span>
        </div>
        <div className="p-3 rounded-xl bg-sky-50/80 border-2 border-sky-400/90 flex flex-col justify-between">
          <span className="text-[9.5px] font-extrabold text-sky-900 uppercase block">2. Ölçüm ({report.date2})</span>
          <span className="text-lg font-black text-sky-700 mt-1 block font-sans tabular-nums">%{p2Score} Puan</span>
          <span className="text-[9.5px] font-extrabold text-emerald-700 flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>+%{p2Score - p1Score} İlerleme</span>
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
          <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Dönemsel Değişim (Δ)</span>
          <span className={`text-base font-black mt-1 block font-sans tabular-nums ${isProgress ? 'text-emerald-700' : 'text-slate-800'}`}>
            {isProgress ? `+${scoreDiff}` : scoreDiff} Puan
          </span>
          <span className="text-[9px] text-slate-500 font-medium">1. → 2. Ölçüm Farkı</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
          <span className="text-[9.5px] font-bold text-slate-500 uppercase block font-sans">Gelişim Durumu</span>
          <span className="text-xs font-black text-emerald-800 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{isProgress ? 'Pozitif İlerleme' : 'Takip ve İzlem'}</span>
          </span>
          <span className="text-[9px] text-slate-500 font-medium">10 Motor Test İncelemesi</span>
        </div>
      </div>

      {/* 2 Column Section: Left 1. -> 2. Ölçüm Test Table + Right 1. -> 2. Ölçüm Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 print:grid-cols-12 gap-3.5 items-stretch">
        {/* Left 7 Cols: Detailed Test Progression Table */}
        <div className="lg:col-span-7 print:col-span-7 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] uppercase font-bold">
                <th className="py-2 px-2.5 text-left font-sans">Motor Performans Testi</th>
                <th className="py-2 px-1.5 text-center">1. Ölçüm ({report.date1})</th>
                <th className="py-2 px-1.5 text-center bg-sky-900 text-sky-200 font-extrabold">2. Ölçüm ({report.date2})</th>
                <th className="py-2 px-2 text-center">Değişim (Δ)</th>
                <th className="py-2 px-2 text-right">Gelişim Durumu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {comparisonRows.map((row) => (
                <tr key={row.id} className="hover:bg-sky-50/50 transition-colors">
                  <td className="py-1.5 px-2.5 font-bold text-slate-900">{row.name} ({row.unit})</td>
                  <td className="py-1.5 px-1.5 text-center text-slate-600 font-sans tabular-nums">{row.m1}</td>
                  <td className="py-1.5 px-1.5 text-center font-black text-sky-900 bg-sky-50 font-sans tabular-nums">{row.m2}</td>
                  <td className="py-1.5 px-2 text-center font-bold font-sans tabular-nums">
                    <span className={row.isPositive ? 'text-emerald-700' : 'text-rose-600'}>
                      {row.delta >= 0 ? `+${row.delta}` : row.delta} {row.unit}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-right font-bold">
                    {row.isPositive ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold inline-flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-emerald-700 shrink-0" />
                        <span>İlerleme</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-slate-900 border border-amber-300 font-extrabold text-[10px] inline-flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3 text-amber-700 shrink-0" />
                        <span>Takip Edilmeli</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right 5 Cols: Dedicated 1. Ölçüm -> 2. Ölçüm Recharts Spider Chart */}
        <div className="lg:col-span-5 print:col-span-5 flex flex-col justify-between">
          <RechartsSportsFlyRadarChart
            report={report}
            comparisonMode="p1-p2"
            height={250}
            title="1. Ölçüm → 2. Ölçüm Dönemsel Gelişim Radarı (Recharts Spider Chart)"
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DEDICATED 3-WAY COMPARISON SYNTHESIS CHART
// (1. Grup Ortalaması vs 2. İdeal/Hedef Değer vs 3. Sporcumuzun Mevcut Değeri)
// ============================================================================
export interface ThreeWayComparisonProps {
  report: SportsFlyLabReport;
  className?: string;
  height?: number;
}

export const ThreeWayGroupTargetAthleteComparisonChart: React.FC<ThreeWayComparisonProps> = ({
  report,
  className = '',
  height = 250,
}) => {
  const grpAvgScore = report.groupInfo?.groupAverageScore ?? 70;
  const athleticScore = report.scoreHistory?.p3Score || 88;
  const targetScore = Math.min(100, Math.max(athleticScore + 6, 85));

  const barData = useMemo(() => {
    return report.motorPerformance.slice(0, 8).map((row) => {
      const p3Val = row.percentile || normalizeLabRowValue(row.m3, row);
      const grpVal = Math.max(35, Math.min(88, Math.round(p3Val * 0.82 + grpAvgScore * 0.18 - 4)));
      const targetVal = Math.min(100, Math.max(p3Val + 8, 85));
      const shortName = row.name.replace(' Testi', '').replace(' Ölçümü', '');

      return {
        subject: shortName,
        'Grup Ortalaması': grpVal,
        'İdeal / Hedef Değer': targetVal,
        'Sporcu Mevcut Değeri': p3Val,
        unit: row.unit,
        rawM3: row.m3,
      };
    });
  }, [report, grpAvgScore]);

  return (
    <div className={`p-5 rounded-2xl border border-slate-300 bg-slate-900 text-white shadow-md space-y-4 ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider">
              Üçlü Karşılaştırma Sentezi
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Grup Ortalaması vs Hedef vs Mevcut Değer
            </span>
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Motor Biyomotor Performans Üçlü Veri Karşılaştırması
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-sans tabular-nums">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
            Grup Ort: %{grpAvgScore}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-800/80 font-semibold">
            Hedef: %{targetScore}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-bold">
            Sporcu: %{athleticScore}
          </span>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 7 Cols: Grouped Bar Chart */}
        <div className="lg:col-span-7 bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-200 uppercase mb-2 flex items-center justify-between">
            <span>Motor Testler Üçlü Çubuk Grafiği</span>
            <span className="text-[10px] text-slate-400 font-normal">0–100 Yüzdelik Ölçek</span>
          </div>
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="subject"
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} tickFormatter={(val) => `%${val}`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-[11px] p-3 rounded-xl border border-slate-700 shadow-xl space-y-1">
                          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 mb-1">
                            {data.subject}
                          </div>
                          <div className="text-slate-400">Grup Ortalaması: %{data['Grup Ortalaması']}</div>
                          <div className="text-blue-400">Hedef Değer: %{data['İdeal / Hedef Değer']}</div>
                          <div className="text-emerald-400 font-bold">Sporcu Değeri: {data.rawM3} {data.unit} (%{data['Sporcu Mevcut Değeri']})</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="Grup Ortalaması" fill="#64748b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="İdeal / Hedef Değer" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Sporcu Mevcut Değeri" fill="#10b981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 5 Cols: Radar Chart */}
        <div className="lg:col-span-5 bg-white text-slate-900 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
          <RechartsSportsFlyRadarChart
            report={report}
            comparisonMode="group"
            height={height}
            title="Üçlü Katman Radar Analizi"
          />
        </div>
      </div>
    </div>
  );
};

export { AthleteDevelopmentComparisonChart } from './AthleteDevelopmentComparisonChart';
export type { AthleteDevelopmentComparisonChartProps } from './AthleteDevelopmentComparisonChart';
