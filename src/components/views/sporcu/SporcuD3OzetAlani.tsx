import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  TrendingUp,
  Award,
  CalendarCheck,
  User,
  ChevronDown,
  ChevronUp,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  FileDown,
  FileText,
} from 'lucide-react';
import { SporcuItem } from '../../../types';
import { SporcuProfil, getOrCreateSporcuProfil } from '../../../data/sporcuProfilData';
import { downloadSporcuDevelopmentPdfReport } from '../../../utils/sporcuPdfReportGenerator';

interface SporcuD3OzetAlaniProps {
  sporcular: SporcuItem[];
  selectedSporcuId: string | null;
  onSelectSporcu: (sporcuId: string) => void;
  onOpenProfile: (sporcu: SporcuItem) => void;
}

interface MonthlyProgressionPoint {
  month: string;
  teknik: number;
  fiziksel: number;
  taktik: number;
  genel: number;
  note: string;
}

interface MonthlyAttendancePoint {
  month: string;
  attended: number;
  total: number;
  rate: number;
}

// Generate progression points dynamically based on the athlete's base stats
function generateAthleteProgression(profil: SporcuProfil): MonthlyProgressionPoint[] {
  const months = ['Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül'];
  const baseT = profil.performans.teknikPuan || 8.0;
  const baseF = profil.performans.fizikselPuan || 7.8;
  const baseTak = profil.performans.taktikselPuan || 8.2;
  const baseG = profil.performans.genelOrtalama || 8.0;

  // Progressive growth curve leading up to current score
  const deltas = [-1.4, -1.0, -0.7, -0.4, -0.1, 0];

  return months.map((m, idx) => {
    const d = deltas[idx];
    const t = Math.max(4.0, Math.min(10.0, +(baseT + d + (idx % 2 === 0 ? 0.1 : -0.1)).toFixed(1)));
    const f = Math.max(4.0, Math.min(10.0, +(baseF + d * 0.9 + (idx === 3 ? 0.2 : 0)).toFixed(1)));
    const tak = Math.max(4.0, Math.min(10.0, +(baseTak + d * 0.85).toFixed(1)));
    const genel = Math.max(4.0, Math.min(10.0, +((t + f + tak) / 3).toFixed(2)));

    const notes = [
      'Temel dayanıklılık ve adaptasyon fazı',
      'Teknik koordinasyon ve çeviklik artışı',
      'Yaz kampı & maç kondisyonu',
      'Yüksek yoğunluklu taktik drilleri',
      'Pozisyonel hakimiyet ve karar hızı',
      'Sezon başı tepe performans formu',
    ];

    return {
      month: m,
      teknik: t,
      fiziksel: f,
      taktik: tak,
      genel,
      note: notes[idx],
    };
  });
}

function generateAthleteAttendanceHistory(profil: SporcuProfil): MonthlyAttendancePoint[] {
  const months = ['Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül'];
  const totalAtt = profil.yoklama.katildigiAntrenman || 42;
  const totalSessions = profil.yoklama.toplamAntrenman || 48;
  const overallRate = totalSessions > 0 ? totalAtt / totalSessions : 0.9;

  // Monthly breakdown around 8 sessions per month
  const distribution = [
    { total: 8, attRate: Math.min(1, overallRate - 0.08) },
    { total: 8, attRate: Math.min(1, overallRate - 0.04) },
    { total: 8, attRate: Math.min(1, overallRate + 0.02) },
    { total: 8, attRate: Math.min(1, overallRate - 0.02) },
    { total: 8, attRate: Math.min(1, overallRate + 0.05) },
    { total: 8, attRate: Math.min(1, overallRate + 0.06) },
  ];

  return months.map((m, i) => {
    const item = distribution[i];
    const attended = Math.round(item.total * item.attRate);
    return {
      month: m,
      total: item.total,
      attended,
      rate: Math.round((attended / item.total) * 100),
    };
  });
}

export const SporcuD3OzetAlani: React.FC<SporcuD3OzetAlaniProps> = ({
  sporcular,
  selectedSporcuId,
  onSelectSporcu,
  onOpenProfile,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeMetric, setActiveMetric] = useState<'genel' | 'teknik' | 'fiziksel' | 'taktik' | 'all'>('genel');
  const [attendanceChartType, setAttendanceChartType] = useState<'donut' | 'bars'>('donut');
  const [hoveredPoint, setHoveredPoint] = useState<MonthlyProgressionPoint | null>(null);
  const [hoveredDonutSlice, setHoveredDonutSlice] = useState<{ label: string; count: number; percentage: number } | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfToast, setPdfToast] = useState<string | null>(null);

  const showPdfToast = (msg: string) => {
    setPdfToast(msg);
    setTimeout(() => setPdfToast(null), 3500);
  };

  // Active athlete & profile
  const activeSporcu =
    sporcular.find((s) => s.id === selectedSporcuId) || sporcular[0];
  const activeProfil = activeSporcu ? getOrCreateSporcuProfil(activeSporcu) : null;

  const handleDownloadPDFReport = async () => {
    if (!activeSporcu || !activeProfil || isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      showPdfToast(`${activeSporcu.name} için gelişim & katılım PDF raporu hazırlanıyor...`);
      await downloadSporcuDevelopmentPdfReport({
        sporcu: activeSporcu,
        profil: activeProfil,
      });
      showPdfToast(`✓ ${activeSporcu.name} PDF raporu başarıyla indirildi!`);
    } catch (err) {
      console.error('PDF indirme hatası:', err);
      showPdfToast('PDF oluşturulurken bir hata meydana geldi.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // SVG Refs
  const progressionSvgRef = useRef<SVGSVGElement | null>(null);
  const progressionContainerRef = useRef<HTMLDivElement | null>(null);
  const attendanceSvgRef = useRef<SVGSVGElement | null>(null);
  const attendanceContainerRef = useRef<HTMLDivElement | null>(null);

  // Dimensions state
  const [progressionDimensions, setProgressionDimensions] = useState({ width: 500, height: 260 });
  const [attendanceDimensions, setAttendanceDimensions] = useState({ width: 280, height: 260 });

  // ResizeObserver for Progression container
  useEffect(() => {
    if (!progressionContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 50) {
          setProgressionDimensions({
            width: Math.floor(width),
            height: 250,
          });
        }
      }
    });
    observer.observe(progressionContainerRef.current);
    return () => observer.disconnect();
  }, [isExpanded]);

  // ResizeObserver for Attendance container
  useEffect(() => {
    if (!attendanceContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 50) {
          setAttendanceDimensions({
            width: Math.floor(width),
            height: 250,
          });
        }
      }
    });
    observer.observe(attendanceContainerRef.current);
    return () => observer.disconnect();
  }, [isExpanded]);

  // D3 Render: Progression Chart (Line & Area Chart)
  useEffect(() => {
    if (!progressionSvgRef.current || !activeProfil || !isExpanded) return;

    const data = generateAthleteProgression(activeProfil);
    const svg = d3.select(progressionSvgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const { width, height } = progressionDimensions;
    const margin = { top: 25, right: 25, bottom: 35, left: 42 };
    const innerWidth = Math.max(80, width - margin.left - margin.right);
    const innerHeight = Math.max(80, height - margin.top - margin.bottom);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const xScale = d3
      .scalePoint<string>()
      .domain(data.map((d) => d.month))
      .range([0, innerWidth])
      .padding(0.2);

    // Y Scale (0 - 10)
    const yScale = d3.scaleLinear().domain([4, 10]).range([innerHeight, 0]).nice();

    // Defs for gradients
    const defs = svg.append('defs');

    // Gradient for General line area
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'd3-progression-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.35);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6')
      .attr('stop-opacity', 0.0);

    // Horizontal grid lines
    const yTicks = yScale.ticks(5);
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', '#e2e8f0')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-width', 1);

    // X Axis
    const xAxis = d3.axisBottom(xScale).tickSize(0);
    const gx = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    gx.select('.domain').attr('stroke', '#cbd5e1');
    gx.selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('dy', '10px');

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}`);
    const gy = g.append('g').call(yAxis);
    gy.select('.domain').remove();
    gy.selectAll('line').remove();
    gy.selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('dx', '-4px');

    // Lines & Area definitions
    const areaGen = d3
      .area<MonthlyProgressionPoint>()
      .x((d) => xScale(d.month) || 0)
      .y0(innerHeight)
      .y1((d) => yScale(d[activeMetric === 'all' ? 'genel' : activeMetric]))
      .curve(d3.curveMonotoneX);

    // Fill area under the main metric curve
    g.append('path')
      .datum(data)
      .attr('fill', 'url(#d3-progression-gradient)')
      .attr('d', areaGen);

    // Line drawing helper
    const drawLine = (
      key: 'genel' | 'teknik' | 'fiziksel' | 'taktik',
      color: string,
      strokeWidth: number,
      dash?: string
    ) => {
      const lineGen = d3
        .line<MonthlyProgressionPoint>()
        .x((d) => xScale(d.month) || 0)
        .y((d) => yScale(d[key]))
        .curve(d3.curveMonotoneX);

      const path = g
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', strokeWidth)
        .attr('d', lineGen);

      if (dash) {
        path.attr('stroke-dasharray', dash);
      }
    };

    if (activeMetric === 'all') {
      drawLine('teknik', '#10b981', 2, '4,3'); // Emerald
      drawLine('fiziksel', '#f59e0b', 2, '4,3'); // Amber
      drawLine('taktik', '#8b5cf6', 2, '4,3'); // Violet
      drawLine('genel', '#2563eb', 3); // Royal Blue
    } else {
      const metricColorMap = {
        genel: '#2563eb',
        teknik: '#10b981',
        fiziksel: '#f59e0b',
        taktik: '#8b5cf6',
      };
      drawLine(activeMetric, metricColorMap[activeMetric], 3);
    }

    // Circles and interactive overlay for hover
    const dotsGroup = g.append('g').attr('class', 'dots');

    data.forEach((d) => {
      const cx = xScale(d.month) || 0;
      const primaryKey = activeMetric === 'all' ? 'genel' : activeMetric;
      const cy = yScale(d[primaryKey]);

      // Outer halo circle
      dotsGroup
        .append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 5)
        .attr('fill', '#ffffff')
        .attr('stroke', activeMetric === 'all' ? '#2563eb' : '#3b82f6')
        .attr('stroke-width', 2.5)
        .attr('class', 'transition-transform duration-150 cursor-pointer')
        .on('mouseenter', () => setHoveredPoint(d))
        .on('mouseleave', () => setHoveredPoint(null));

      // Value label on the point
      dotsGroup
        .append('text')
        .attr('x', cx)
        .attr('y', cy - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', '#1e293b')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .text(d[primaryKey].toFixed(1));
    });

    // Reference target line (e.g. 8.5 Elite line)
    const eliteY = yScale(8.5);
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', eliteY)
      .attr('y2', eliteY)
      .attr('stroke', '#cbd5e1')
      .attr('stroke-dasharray', '2,2');

    g.append('text')
      .attr('x', innerWidth)
      .attr('y', eliteY - 4)
      .attr('text-anchor', 'end')
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px')
      .attr('font-weight', '600')
      .text('Hedef: 8.5');
  }, [activeProfil, progressionDimensions, activeMetric, isExpanded]);

  // D3 Render: Attendance Chart (Donut or Bars)
  useEffect(() => {
    if (!attendanceSvgRef.current || !activeProfil || !isExpanded) return;

    const svg = d3.select(attendanceSvgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = attendanceDimensions;

    if (attendanceChartType === 'donut') {
      // Donut Chart
      const margin = 15;
      const radius = Math.min(width, height) / 2 - margin;
      const innerRadius = radius * 0.65;

      const g = svg
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

      const total = activeProfil.yoklama.toplamAntrenman || 48;
      const attended = activeProfil.yoklama.katildigiAntrenman || 44;
      const excused = activeProfil.yoklama.mazeretliDevamsizlik || 3;
      const unexcused = Math.max(0, total - (attended + excused));

      const pieData = [
        { label: 'Katıldı', count: attended, color: '#10b981' },
        { label: 'Mazeretli', count: excused, color: '#f59e0b' },
        { label: 'Gelmedi', count: unexcused, color: '#f43f5e' },
      ].filter((d) => d.count > 0);

      const pie = d3
        .pie<{ label: string; count: number; color: string }>()
        .value((d) => d.count)
        .sort(null);

      const arc = d3
        .arc<d3.PieArcDatum<{ label: string; count: number; color: string }>>()
        .innerRadius(innerRadius)
        .outerRadius(radius)
        .cornerRadius(4)
        .padAngle(0.04);

      const arcs = g
        .selectAll('.arc')
        .data(pie(pieData))
        .enter()
        .append('g')
        .attr('class', 'arc cursor-pointer');

      arcs
        .append('path')
        .attr('d', arc)
        .attr('fill', (d) => d.data.color)
        .attr('class', 'transition-all duration-200 hover:opacity-85')
        .on('mouseenter', (_, d) => {
          const percentage = total > 0 ? Math.round((d.data.count / total) * 100) : 0;
          setHoveredDonutSlice({
            label: d.data.label,
            count: d.data.count,
            percentage,
          });
        })
        .on('mouseleave', () => setHoveredDonutSlice(null));

      // Center text: Rate percentage
      const rate = activeProfil.yoklama.katilimYuzdesi || Math.round((attended / total) * 100);

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.1em')
        .attr('fill', '#0f172a')
        .attr('font-size', '24px')
        .attr('font-weight', '800')
        .text(`%${rate}`);

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.4em')
        .attr('fill', '#64748b')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .text('Katılım Oranı');
    } else {
      // Monthly Attendance Bars Chart
      const data = generateAthleteAttendanceHistory(activeProfil);
      const margin = { top: 20, right: 15, bottom: 35, left: 35 };
      const innerWidth = Math.max(80, width - margin.left - margin.right);
      const innerHeight = Math.max(80, height - margin.top - margin.bottom);

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const xScale = d3
        .scaleBand()
        .domain(data.map((d) => d.month))
        .range([0, innerWidth])
        .padding(0.25);

      const yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

      // X Axis
      const xAxis = d3.axisBottom(xScale).tickSize(0);
      const gx = g
        .append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis);
      gx.select('.domain').attr('stroke', '#cbd5e1');
      gx.selectAll('text')
        .attr('fill', '#64748b')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('dy', '8px');

      // Y Axis
      const yAxis = d3.axisLeft(yScale).ticks(4).tickFormat((d) => `%${d}`);
      const gy = g.append('g').call(yAxis);
      gy.select('.domain').remove();
      gy.selectAll('line').attr('stroke', '#f1f5f9');
      gy.selectAll('text')
        .attr('fill', '#94a3b8')
        .attr('font-size', '9px')
        .attr('font-weight', '600')
        .attr('dx', '-3px');

      // Bars
      g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar cursor-pointer transition-all duration-150')
        .attr('x', (d) => xScale(d.month) || 0)
        .attr('y', (d) => yScale(d.rate))
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => innerHeight - yScale(d.rate))
        .attr('rx', 4)
        .attr('fill', (d) => (d.rate >= 90 ? '#10b981' : d.rate >= 75 ? '#3b82f6' : '#f59e0b'))
        .on('mouseenter', (_, d) => {
          setHoveredDonutSlice({
            label: `${d.month} Katılımı`,
            count: d.attended,
            percentage: d.rate,
          });
        })
        .on('mouseleave', () => setHoveredDonutSlice(null));

      // Bar Top Labels
      g.selectAll('.bar-label')
        .data(data)
        .enter()
        .append('text')
        .attr('x', (d) => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d.rate) - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#334155')
        .attr('font-size', '9px')
        .attr('font-weight', '700')
        .text((d) => `%${d.rate}`);

      // 85% Target Line
      const targetY = yScale(85);
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', targetY)
        .attr('y2', targetY)
        .attr('stroke', '#cbd5e1')
        .attr('stroke-dasharray', '2,2');
    }
  }, [activeProfil, attendanceDimensions, attendanceChartType, isExpanded]);

  if (!activeSporcu || !activeProfil) {
    return null;
  }

  return (
    <div
      id="sporcu-d3-ozet-paneli"
      className="mb-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden transition-all duration-200"
    >
      {/* Top Banner & Control Bar */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Athlete Info */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              {activeSporcu.avatarUrl ? (
                <img
                  src={activeSporcu.avatarUrl}
                  alt={activeSporcu.name}
                  className="w-13 h-13 rounded-xl object-cover ring-2 ring-blue-400/40 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-13 h-13 rounded-xl bg-blue-600/40 border border-blue-400/40 flex items-center justify-center font-bold text-white text-lg">
                  {activeSporcu.name.charAt(0)}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[9px] font-bold ring-2 ring-slate-900 shadow-2xs">
                {activeSporcu.isActive ? 'AKTİF' : 'PASİF'}
              </span>
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/30">
                  D3 Performans & Katılım Özeti
                </span>
                <span className="text-[11px] text-slate-300 font-mono font-semibold">
                  #{activeSporcu.code}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white truncate flex items-center gap-2">
                {activeSporcu.name}
                <span className="text-xs font-normal text-slate-300 hidden sm:inline">
                  • {activeProfil.kimlik.brans} ({activeProfil.kimlik.takimGrup || activeSporcu.facility})
                </span>
              </h3>
              <p className="text-xs text-slate-300 truncate">
                {activeSporcu.facility} • {activeProfil.kimlik.mevki || 'Sporcu'} • Yaş: {activeProfil.kimlik.yas || 16}
              </p>
            </div>
          </div>

          {/* Quick Select Dropdown & Actions */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            {/* Athlete selector dropdown */}
            <div className="relative">
              <label htmlFor="select-athlete-d3" className="sr-only">Sporcu Seç</label>
              <select
                id="select-athlete-d3"
                value={activeSporcu.id}
                onChange={(e) => onSelectSporcu(e.target.value)}
                className="bg-slate-800/90 hover:bg-slate-700/90 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer appearance-none pr-8"
              >
                {sporcular.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.name} ({s.facility})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Profile Button */}
            <button
              onClick={() => onOpenProfile(activeSporcu)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
              title="Tam Sporcu Profilini Aç"
            >
              <User className="w-3.5 h-3.5" />
              <span>Profili İncele</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
            </button>

            {/* Rapor İndir (PDF) Button */}
            <button
              id="btn-d3-rapor-indir"
              onClick={handleDownloadPDFReport}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
              title="Gelişim verilerini ve antrenman katılım oranlarını tek tıkla PDF olarak indir"
            >
              {isGeneratingPdf ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? 'PDF Hazırlanıyor...' : 'Rapor İndir'}</span>
            </button>

            {/* Toggle Expand/Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition-colors shrink-0"
              title={isExpanded ? 'Grafikleri Daralt' : 'Grafikleri Genişlet'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 4 KPI Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-3 border-t border-slate-700/60">
          <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/50">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Genel Performans</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-extrabold text-blue-400">
                {activeProfil.performans.genelOrtalama?.toFixed(2) || '8.50'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">/ 10.0</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/50">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Antrenman Katılımı</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-extrabold text-emerald-400">
                %{activeProfil.yoklama.katilimYuzdesi || 94}
              </span>
              <span className="text-[10px] text-emerald-300 font-medium">Yüksek</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/50">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Seans Devamlılığı</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-extrabold text-white">
                {activeProfil.yoklama.katildigiAntrenman || 45}
              </span>
              <span className="text-[10px] text-slate-400">
                / {activeProfil.yoklama.toplamAntrenman || 48} Seans
              </span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/50">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Öne Çıkan Güçlü Yön</span>
            <div className="truncate mt-0.5">
              <span className="text-xs font-bold text-amber-300 truncate">
                {activeProfil.performans.gucluYonler?.[0] || 'Oyun Vizyonu'}
              </span>
            </div>
          </div>
        </div>

        {/* PDF Status Toast if present */}
        {pdfToast && (
          <div className="mt-3 p-2.5 bg-blue-600/95 text-white text-xs font-semibold rounded-xl flex items-center gap-2 border border-blue-400/30 shadow-md animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{pdfToast}</span>
          </div>
        )}
      </div>

      {/* Collapsible Graphic Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-50/50">
          {/* LEFT 7 COLS: D3 Development & Progression Line Chart */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between">
            <div>
              {/* Header with metric toggles */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>D3 Gelişim ve Performans Eğrisi</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Son 6 aylık periyotta sporcunun gelişim ivmesi
                  </p>
                </div>

                {/* Metric Selector Pills */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                  {(
                    [
                      { id: 'genel', label: 'Genel' },
                      { id: 'teknik', label: 'Teknik' },
                      { id: 'fiziksel', label: 'Fiziksel' },
                      { id: 'taktik', label: 'Taktik' },
                      { id: 'all', label: 'Tümü' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setActiveMetric(m.id)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        activeMetric === m.id
                          ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* D3 Line Chart SVG Canvas */}
              <div
                ref={progressionContainerRef}
                className="w-full h-64 relative mt-2 flex items-center justify-center"
              >
                <svg
                  ref={progressionSvgRef}
                  className="w-full h-full overflow-visible"
                  style={{ minHeight: '240px' }}
                />

                {/* Dynamic Tooltip on Hover */}
                {hoveredPoint && (
                  <div className="absolute top-2 right-2 bg-slate-900/90 text-white p-2.5 rounded-xl text-xs shadow-lg border border-slate-700 pointer-events-none z-10 max-w-xs animate-in fade-in duration-100">
                    <div className="font-bold text-blue-300 flex items-center justify-between gap-4">
                      <span>{hoveredPoint.month} Ayı Performansı</span>
                      <span>Skor: {hoveredPoint.genel.toFixed(1)}/10</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-1.5 text-[10px] border-t border-slate-700/60 pt-1.5">
                      <div>Teknik: <span className="font-bold text-emerald-400">{hoveredPoint.teknik}</span></div>
                      <div>Fiziksel: <span className="font-bold text-amber-400">{hoveredPoint.fiziksel}</span></div>
                      <div>Taktik: <span className="font-bold text-indigo-400">{hoveredPoint.taktik}</span></div>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1.5 italic">
                      "{hoveredPoint.note}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Legend & Summary Info */}
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                  Genel Skor
                </span>
                {activeMetric === 'all' && (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                      Teknik
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                      Fiziksel
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block"></span>
                      Taktik
                    </span>
                  </>
                )}
              </div>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                +1.4 puan son 6 ayda artış
              </span>
            </div>
          </div>

          {/* RIGHT 5 COLS: D3 Attendance & Participation Rates */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between">
            <div>
              {/* Header with Donut/Bar toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <CalendarCheck className="w-4 h-4 text-emerald-600" />
                    <span>D3 Katılım Oranları</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Antrenman ve müsabaka devamlılığı
                  </p>
                </div>

                {/* Switch between Donut and Bar */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                  <button
                    onClick={() => setAttendanceChartType('donut')}
                    className={`p-1.5 rounded-md text-xs font-semibold transition-all ${
                      attendanceChartType === 'donut'
                        ? 'bg-white text-emerald-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Halka (Donut) Görünümü"
                  >
                    <PieChartIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAttendanceChartType('bars')}
                    className={`p-1.5 rounded-md text-xs font-semibold transition-all ${
                      attendanceChartType === 'bars'
                        ? 'bg-white text-emerald-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Aylık Çubuk (Bar) Görünümü"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* D3 Attendance SVG Canvas */}
              <div
                ref={attendanceContainerRef}
                className="w-full h-56 relative mt-2 flex items-center justify-center"
              >
                <svg
                  ref={attendanceSvgRef}
                  className="w-full h-full overflow-visible"
                  style={{ minHeight: '220px' }}
                />

                {/* Hover Slice tooltip */}
                {hoveredDonutSlice && (
                  <div className="absolute top-1 bg-slate-900/90 text-white px-2.5 py-1.5 rounded-lg text-xs shadow-md border border-slate-700 pointer-events-none z-10">
                    <span className="font-bold">{hoveredDonutSlice.label}:</span>{' '}
                    <span>{hoveredDonutSlice.count} Seans (%{hoveredDonutSlice.percentage})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Legend & Statistics */}
            <div className="pt-3 mt-2 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-bold block">Katıldı</span>
                  <span className="text-xs font-extrabold text-emerald-900">
                    {activeProfil.yoklama.katildigiAntrenman || 44} İdman
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-100">
                  <span className="text-[10px] text-amber-700 font-bold block">Mazeretli</span>
                  <span className="text-xs font-extrabold text-amber-900">
                    {activeProfil.yoklama.mazeretliDevamsizlik || 3} İdman
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-rose-50/80 border border-rose-100">
                  <span className="text-[10px] text-rose-700 font-bold block">Gelmedi</span>
                  <span className="text-xs font-extrabold text-rose-900">
                    {activeProfil.yoklama.mazeretsizDevamsizlik || 1} İdman
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
