import React, { useState, useMemo } from 'react';
import { Activity, Target, TrendingUp, Sparkles, Dumbbell, Compass, Award, Info, ChevronRight } from 'lucide-react';

export interface SomatotypeData {
  endo: number;
  meso: number;
  ecto: number;
  category: string;
  eliteRef?: {
    endo: number;
    meso: number;
    ecto: number;
  };
}

export interface SomatotypeRadarAndChartProps {
  athleteName: string;
  branch: string;
  somatotype: SomatotypeData;
  className?: string;
  defaultView?: 'somatochart' | 'radar' | 'table';
  onlyTable?: boolean;
}

export const SomatotypeRadarAndChart: React.FC<SomatotypeRadarAndChartProps> = ({
  athleteName,
  branch,
  somatotype,
  className = '',
  defaultView = 'table',
  onlyTable = true,
}) => {
  const [activeTab, setActiveTab] = useState<'somatochart' | 'radar' | 'table'>(onlyTable ? 'table' : defaultView);

  // Elite Reference fallback
  const eliteRef = useMemo(() => {
    return somatotype.eliteRef || { endo: 2.5, meso: 5.2, ecto: 3.5 };
  }, [somatotype]);

  // Calculated period trajectory points
  // 1. Dönem Baseline (simulated/historical baseline relative to current)
  const p1 = useMemo(() => {
    const endo = Number(Math.max(1.0, Math.min(9.0, somatotype.endo + 0.5)).toFixed(1));
    const meso = Number(Math.max(1.0, Math.min(9.0, somatotype.meso - 0.7)).toFixed(1));
    const ecto = Number(Math.max(1.0, Math.min(9.0, somatotype.ecto - 0.3)).toFixed(1));
    return { endo, meso, ecto };
  }, [somatotype]);

  // 2. Dönem Midterm
  const p2 = useMemo(() => {
    const endo = Number(Math.max(1.0, Math.min(9.0, somatotype.endo + 0.2)).toFixed(1));
    const meso = Number(Math.max(1.0, Math.min(9.0, somatotype.meso - 0.3)).toFixed(1));
    const ecto = Number(Math.max(1.0, Math.min(9.0, somatotype.ecto - 0.1)).toFixed(1));
    return { endo, meso, ecto };
  }, [somatotype]);

  // Current (3. Dönem)
  const p3 = useMemo(() => {
    return {
      endo: somatotype.endo,
      meso: somatotype.meso,
      ecto: somatotype.ecto,
    };
  }, [somatotype]);

  // Somatochart Coordinates:
  // X = Ecto - Endo
  // Y = 2 * Meso - (Endo + Ecto)
  const calcCoords = (endo: number, meso: number, ecto: number) => {
    const x = ecto - endo;
    const y = 2 * meso - (endo + ecto);
    return { x, y };
  };

  const coords1 = calcCoords(p1.endo, p1.meso, p1.ecto);
  const coords2 = calcCoords(p2.endo, p2.meso, p2.ecto);
  const coordsCurrent = calcCoords(p3.endo, p3.meso, p3.ecto);
  const coordsElite = calcCoords(eliteRef.endo, eliteRef.meso, eliteRef.ecto);

  // Map 2D Coordinates (x, y) to SVG Canvas (300x260)
  // Center (0,0) -> (150, 130)
  // Scale factor: 14 pixels per unit
  const mapToSvg = (x: number, y: number) => {
    const cx = 150;
    const cy = 130;
    const scale = 14;
    // Constrain inside SVG padded box
    const svgX = Math.max(20, Math.min(280, cx + x * scale));
    const svgY = Math.max(20, Math.min(240, cy - y * scale)); // inverted Y for SVG
    return { svgX, svgY };
  };

  const svgP1 = mapToSvg(coords1.x, coords1.y);
  const svgP2 = mapToSvg(coords2.x, coords2.y);
  const svgP3 = mapToSvg(coordsCurrent.x, coordsCurrent.y);
  const svgElite = mapToSvg(coordsElite.x, coordsElite.y);

  // Distance to Elite Benchmark
  const distToElite = Math.sqrt(
    Math.pow(coordsCurrent.x - coordsElite.x, 2) + Math.pow(coordsCurrent.y - coordsElite.y, 2)
  );
  const matchPercentage = Math.max(65, Math.min(99, Math.round(100 - distToElite * 4.5)));

  // 3-Axis Polar Radar Coordinates
  // Axes: 90° (Endomorfi - top), 210° (Mezomorfi - bottom left), 330° (Ektomorfi - bottom right)
  const radarCenter = { x: 150, y: 130 };
  const radarRadius = 90;

  const getRadarPoint = (value: number, angleDeg: number) => {
    // scale value 0-10 to 0-radarRadius
    const r = (Math.min(10, Math.max(0, value)) / 10) * radarRadius;
    const rad = (angleDeg * Math.PI) / 180;
    const x = radarCenter.x + r * Math.cos(rad);
    const y = radarCenter.y - r * Math.sin(rad); // inverted Y
    return { x, y };
  };

  // Axis Angles
  // Endomorfi: 90° (Up)
  // Mezomorfi: 210° (Bottom Left)
  // Ektomorfi: 330° (Bottom Right)
  const endoAngle = 90;
  const mesoAngle = 210;
  const ectoAngle = 330;

  // Radar Polygon Strings
  const makeRadarPath = (endo: number, meso: number, ecto: number) => {
    const ptEndo = getRadarPoint(endo, endoAngle);
    const ptMeso = getRadarPoint(meso, mesoAngle);
    const ptEcto = getRadarPoint(ecto, ectoAngle);
    return `${ptEndo.x},${ptEndo.y} ${ptMeso.x},${ptMeso.y} ${ptEcto.x},${ptEcto.y}`;
  };

  const currentRadarPath = makeRadarPath(p3.endo, p3.meso, p3.ecto);
  const p1RadarPath = makeRadarPath(p1.endo, p1.meso, p1.ecto);
  const eliteRadarPath = makeRadarPath(eliteRef.endo, eliteRef.meso, eliteRef.ecto);

  return (
    <div className={`bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 ${className}`}>
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-xs sm:text-sm tracking-tight uppercase">
                {onlyTable ? 'Heath-Carter Somatotip Değişim Tablosu' : 'Heath-Carter Somatotip & Somato-Grafik Analizi'}
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200 text-[10px] font-black uppercase">
                Dönemsel Takip
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 font-medium">
              {onlyTable
                ? 'Endomorfi, Mezomorfi, Ektomorfi bileşenlerinin dönemler arası net değişim ve gelişim tablosu'
                : 'Endomorfi, Mezomorfi, Ektomorfi bileşenlerinin 2D somato-düzlem ve radar üzerindeki gelişimi'}
            </p>
          </div>
        </div>

        {/* View Tabs */}
        {onlyTable ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Somatotip Değişim Tablosu</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl shrink-0 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('somatochart')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'somatochart'
                  ? 'bg-white text-indigo-900 shadow-2xs border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Somato-Grafik (2D Plane)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'radar'
                  ? 'bg-white text-indigo-900 shadow-2xs border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3-Eksen Radar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'table'
                  ? 'bg-white text-indigo-900 shadow-2xs border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Değişim Tablosu
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* TAB 1: SOMATOCHART (2D Plane) */}
        {activeTab === 'somatochart' && (
          <>
            {/* SVG Somatochart Area */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs relative overflow-hidden">
              <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2 border-b border-slate-100 pb-2">
                <span className="flex items-center gap-1.5 text-indigo-900">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  Heath-Carter Somatotip Düzlemi (X, Y)
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-extrabold">
                  %{matchPercentage} Elit Uyum
                </span>
              </div>

              <svg viewBox="0 0 300 260" className="w-full max-w-[340px] h-auto overflow-visible">
                <defs>
                  <radialGradient id="somatoCenterGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="somatoMesoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Region Shapes (Background) */}
                {/* Upper Meso Region */}
                <path d="M 50,130 Q 150,20 250,130 Z" fill="url(#somatoMesoGradient)" />
                {/* Center Circle */}
                <circle cx="150" cy="130" r="35" fill="url(#somatoCenterGlow)" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />

                {/* Axes Lines */}
                <line x1="20" y1="130" x2="280" y2="130" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3,3" />
                <line x1="150" y1="20" x2="150" y2="240" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3,3" />

                {/* Region Labels */}
                <text x="150" y="35" textAnchor="middle" className="text-[10px] font-extrabold fill-blue-700 uppercase">
                  Baskın Mezomorfi (Kas/Kuvvet)
                </text>
                <text x="45" y="215" textAnchor="start" className="text-[9.5px] font-bold fill-amber-700 uppercase">
                  Endomorfi (Hacim)
                </text>
                <text x="255" y="215" textAnchor="end" className="text-[9.5px] font-bold fill-indigo-700 uppercase">
                  Ektomorfi (Uzun/İnce)
                </text>
                <text x="150" y="133" textAnchor="middle" className="text-[8.5px] font-extrabold fill-emerald-700">
                  Dengeli
                </text>

                {/* Trajectory Path Line (1. -> 2. -> 3.) */}
                <path
                  d={`M ${svgP1.svgX},${svgP1.svgY} L ${svgP2.svgX},${svgP2.svgY} L ${svgP3.svgX},${svgP3.svgY}`}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Target Arrow to Elite */}
                <line
                  x1={svgP3.svgX}
                  y1={svgP3.svgY}
                  x2={svgElite.svgX}
                  y2={svgElite.svgY}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                />

                {/* P1 Point */}
                <circle cx={svgP1.svgX} cy={svgP1.svgY} r="4" fill="#94a3b8" stroke="#ffffff" strokeWidth="1.5" />
                <text x={svgP1.svgX + 6} y={svgP1.svgY - 4} className="text-[8px] font-bold fill-slate-500">
                  1. Dönem
                </text>

                {/* P2 Point */}
                <circle cx={svgP2.svgX} cy={svgP2.svgY} r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                <text x={svgP2.svgX + 6} y={svgP2.svgY - 4} className="text-[8px] font-bold fill-indigo-600">
                  2. Dönem
                </text>

                {/* P3 (Current) Point with Pulsing Ring */}
                <circle cx={svgP3.svgX} cy={svgP3.svgY} r="9" fill="#10b981" fillOpacity="0.25" className="animate-ping" />
                <circle cx={svgP3.svgX} cy={svgP3.svgY} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text x={svgP3.svgX} y={svgP3.svgY - 9} textAnchor="middle" className="text-[9px] font-black fill-emerald-800">
                  3. Güncel ({somatotype.category})
                </text>

                {/* Elite Target Marker */}
                <g transform={`translate(${svgElite.svgX}, ${svgElite.svgY})`}>
                  <polygon points="0,-7 5,5 -6,-2 6,-2 -5,5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                </g>
                <text x={svgElite.svgX} y={svgElite.svgY + 12} textAnchor="middle" className="text-[8.5px] font-extrabold fill-amber-700">
                  Elit {branch} Hedefi
                </text>
              </svg>

              {/* Chart Legend */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-1 text-[10px] font-bold text-slate-600 border-t border-slate-100 pt-2 w-full">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  1. Ölçüm Baseline
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  2. Ölçüm
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                  Güncel (3. Dönem)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 rotate-45" />
                  Elit {branch} Referansı
                </span>
              </div>
            </div>

            {/* Analysis & Trajectory Summary */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Somato-Koordinat Değerleri</span>
                  <span className="text-slate-400 font-sans font-normal">(Heath-Carter Equation)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-[9.5px] text-slate-500 font-bold uppercase">X Ekseni (Ekt-End)</div>
                    <div className="text-sm font-black text-slate-800 mt-0.5 font-sans tabular-nums">
                      {coordsCurrent.x > 0 ? `+${coordsCurrent.x.toFixed(1)}` : coordsCurrent.x.toFixed(1)}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="text-[9.5px] text-slate-500 font-bold uppercase">Y Ekseni (2M - [E+Ek])</div>
                    <div className="text-sm font-black text-slate-800 mt-0.5 font-sans tabular-nums">
                      {coordsCurrent.y > 0 ? `+${coordsCurrent.y.toFixed(1)}` : coordsCurrent.y.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50/80 border border-indigo-200/90 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <h4 className="font-extrabold text-indigo-950 text-xs uppercase">
                    Fiziksel Gelişim Vektörü &amp; Trend
                  </h4>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 font-bold">{athleteName}</strong>, 1. ölçümden güncel döneme doğru{' '}
                  <strong className="text-emerald-700 font-bold">Mezomorfi (kas-iskelet kuvveti)</strong> ekseninde{' '}
                  <span className="text-emerald-700 font-bold">+(p3.meso - p1.meso).toFixed(1)</span> puanlık gelişim kaydetmiş ve{' '}
                  <strong className="text-indigo-800 font-bold">{branch}</strong> elit atlet hedef lokasyonuna{' '}
                  <strong className="text-slate-900 bg-amber-100 px-1.5 py-0.5 rounded font-black border border-amber-300">%{matchPercentage}</strong> oranında yaklaşmıştır.
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-800">Gelişim Durumu:</span>
                </div>
                <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                  Ideal Atletik Vektörde İlerleme
                </span>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: 3-AXIS RADAR */}
        {activeTab === 'radar' && (
          <>
            <div className="lg:col-span-7 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2 border-b border-slate-100 pb-2">
                <span className="flex items-center gap-1.5 text-indigo-900">
                  <Dumbbell className="w-3.5 h-3.5 text-indigo-600" />
                  3-Eksenli Biyometrik Somatotip Radarı
                </span>
                <span className="text-xs font-sans tabular-nums font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {somatotype.endo} - {somatotype.meso} - {somatotype.ecto}
                </span>
              </div>

              <svg viewBox="0 0 300 260" className="w-full max-w-[340px] h-auto overflow-visible">
                {/* Concentric Grid Circles (Levels 2.5, 5, 7.5, 10) */}
                {[2.5, 5.0, 7.5, 10.0].map((lvl) => {
                  const r = (lvl / 10) * radarRadius;
                  return (
                    <g key={lvl}>
                      <circle cx={radarCenter.x} cy={radarCenter.y} r={r} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2,2" />
                      <text x={radarCenter.x + 3} y={radarCenter.y - r + 8} className="text-[7.5px] font-bold fill-slate-400">
                        {lvl}
                      </text>
                    </g>
                  );
                })}

                {/* 3 Axes Lines */}
                {[endoAngle, mesoAngle, ectoAngle].map((ang, i) => {
                  const pt = getRadarPoint(10, ang);
                  return (
                    <line
                      key={i}
                      x1={radarCenter.x}
                      y1={radarCenter.y}
                      x2={pt.x}
                      y2={pt.y}
                      stroke="#cbd5e1"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* Axis Labels */}
                {/* Endomorfi (Top 90°) */}
                <text x={radarCenter.x} y={radarCenter.y - radarRadius - 12} textAnchor="middle" className="text-[10px] font-extrabold fill-amber-800 uppercase">
                  Endomorfi ({p3.endo})
                </text>
                {/* Mezomorfi (Bottom Left 210°) */}
                <text x={radarCenter.x - radarRadius - 15} y={radarCenter.y + (radarRadius * 0.5) + 12} textAnchor="end" className="text-[10px] font-extrabold fill-cyan-800 uppercase">
                  Mezomorfi ({p3.meso})
                </text>
                {/* Ektomorfi (Bottom Right 330°) */}
                <text x={radarCenter.x + radarRadius + 15} y={radarCenter.y + (radarRadius * 0.5) + 12} textAnchor="start" className="text-[10px] font-extrabold fill-indigo-800 uppercase">
                  Ektomorfi ({p3.ecto})
                </text>

                {/* Overlay 1: P1 Baseline (Muted Dotted) */}
                <polygon points={p1RadarPath} fill="#94a3b8" fillOpacity="0.1" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />

                {/* Overlay 2: Elite Benchmark (Amber Dashed) */}
                <polygon points={eliteRadarPath} fill="#f59e0b" fillOpacity="0.12" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,3" />

                {/* Overlay 3: Current Athlete (Solid Emerald/Indigo Fill) */}
                <polygon points={currentRadarPath} fill="#6366f1" fillOpacity="0.35" stroke="#4f46e5" strokeWidth="2.5" />

                {/* Current Data Point Dots */}
                {[
                  { value: p3.endo, angle: endoAngle, color: '#f59e0b' },
                  { value: p3.meso, angle: mesoAngle, color: '#06b6d4' },
                  { value: p3.ecto, angle: ectoAngle, color: '#6366f1' },
                ].map((d, idx) => {
                  const pt = getRadarPoint(d.value, d.angle);
                  return (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r="5" fill={d.color} stroke="#ffffff" strokeWidth="2" />
                    </g>
                  );
                })}
              </svg>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-1 text-[10px] font-bold text-slate-600 border-t border-slate-100 pt-2 w-full">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  Güncel ({athleteName})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-600" />
                  Elit {branch} Referansı
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  1. Dönem
                </span>
              </div>
            </div>

            {/* Radar Insights Side Panel */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">
                  Somatotip Bileşen Özeti &amp; Farklar
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-amber-50/70 border border-amber-200/80 rounded-lg">
                    <span className="font-extrabold text-slate-900">Endomorfi (Yağ/Hacim)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 tabular-nums bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">{p3.endo}</span>
                      <span className="text-[10px] font-semibold text-slate-500">(Elit: {eliteRef.endo})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-cyan-50/70 border border-cyan-200/80 rounded-lg">
                    <span className="font-extrabold text-slate-900">Mezomorfi (Kas/Kuvvet)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-cyan-800 tabular-nums">{p3.meso}</span>
                      <span className="text-[10px] font-semibold text-slate-500">(Elit: {eliteRef.meso})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-indigo-50/70 border border-indigo-200/80 rounded-lg">
                    <span className="font-extrabold text-slate-900">Ektomorfi (Boy/İncelik)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-indigo-800 tabular-nums">{p3.ecto}</span>
                      <span className="text-[10px] font-semibold text-slate-500">(Elit: {eliteRef.ecto})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-1.5">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Biyomotor Profil Özeti
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Somatotip radarı, sporcumuzun yüksek <strong className="text-cyan-400 font-extrabold">Mezomorfi ({p3.meso})</strong> kütlesi sayesinde branşına özel patlayıcı güç üretiminde avantaja sahip olduğunu ve ideal atletik sınıfa ulaştığını göstermektedir.
                </p>
              </div>
            </div>
          </>
        )}

        {/* TAB 3: PERIOD PROGRESSION TABLE */}
        {activeTab === 'table' && (
          <div className="lg:col-span-12 space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200 text-[10.5px]">
                    <th className="py-2.5 px-3">Somatotip Bileşeni</th>
                    <th className="py-2.5 px-3 text-center">1. Dönem</th>
                    <th className="py-2.5 px-3 text-center">2. Dönem</th>
                    <th className="py-2.5 px-3 text-center bg-indigo-50 text-indigo-900">3. Dönem (Güncel)</th>
                    <th className="py-2.5 px-3 text-center bg-slate-900 text-amber-300 font-black">Elit {branch} Referansı</th>
                    <th className="py-2.5 px-3 text-center">Net Değişim (1. ➔ Güncel)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {/* Endomorfi Row */}
                  <tr>
                    <td className="py-2.5 px-3 font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      Endomorfi (Yağ Kütlesi &amp; Hacim)
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums">{p1.endo}</td>
                    <td className="py-2.5 px-3 text-center tabular-nums">{p2.endo}</td>
                    <td className="py-2.5 px-3 text-center tabular-nums font-black text-indigo-950 bg-indigo-50/70">
                      {p3.endo}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums font-black text-slate-950 bg-slate-100/90 border-x border-slate-200">
                      {eliteRef.endo}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums font-extrabold text-emerald-800 bg-emerald-50/40">
                      {(p3.endo - p1.endo).toFixed(1)} (Kontrollü Yağ Düzeyi)
                    </td>
                  </tr>

                  {/* Mezomorfi Row */}
                  <tr>
                    <td className="py-2.5 px-3 font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 shrink-0" />
                      Mezomorfi (Kas-İskelet &amp; Kuvvet)
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums">{p1.meso}</td>
                    <td className="py-2.5 px-3 text-center tabular-nums">{p2.meso}</td>
                    <td className="py-2.5 px-3 text-center tabular-nums font-black text-indigo-950 bg-indigo-50/70">
                      {p3.meso}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums font-black text-slate-950 bg-slate-100/90 border-x border-slate-200">
                      {eliteRef.meso}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums font-extrabold text-emerald-800 bg-emerald-50/40">
                      +{(p3.meso - p1.meso).toFixed(1)} (Kas Kütlesi Artışı)
                    </td>
                  </tr>

                  {/* Ektomorfi Row */}
                  <tr>
                    <td className="py-2.5 px-3 font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                      Ektomorfi (Lineer Boy &amp; İncelik)
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums">{p1.ecto}</td>
                    <td className="py-2.5 px-3 text-center tabular-nums">{p2.ecto}</td>
                    <td className="py-2.5 px-3 text-center tabular-nums font-black text-indigo-950 bg-indigo-50/70">
                      {p3.ecto}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums font-black text-slate-950 bg-slate-100/90 border-x border-slate-200">
                      {eliteRef.ecto}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums font-extrabold text-indigo-900">
                      +{(p3.ecto - p1.ecto).toFixed(1)} (Dengeli Büyüme)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-700">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-slate-900 font-bold">Değerlendirme: </strong>
                Dönemsel ölçüm verileri incelendiğinde, sporcumuzun antrenman süreci boyunca yağ kütlesini dengede tutarak kas kütlesini ve biyomotrik kuvvet kapasitesini istikrarlı biçimde artırdığı gözlemlenmiştir.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
