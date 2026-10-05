import React, { useState } from 'react';
import { DrillTacticalData, TacticalMarker, TacticalLine } from '../../../types/egitimPlanlama';
import { Play, RotateCcw, ZoomIn, ZoomOut, Eye, Layers } from 'lucide-react';

interface TacticalCourtCanvasProps {
  tacticalData?: DrillTacticalData;
  branch: 'Futbol' | 'Basketbol' | 'Voleybol';
  className?: string;
  title?: string;
}

export const TacticalCourtCanvas: React.FC<TacticalCourtCanvasProps> = ({
  tacticalData,
  branch,
  className = '',
  title = 'Taktik Saha / Yerleşim Tahtası',
}) => {
  const [showLabels, setShowLabels] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Default markers if none provided in drill
  const defaultMarkers: TacticalMarker[] = [
    { id: 'def1', x: 25, y: 40, type: 'player-a', label: 'Oyuncu 1', number: '1' },
    { id: 'def2', x: 40, y: 60, type: 'player-a', label: 'Oyuncu 2', number: '2' },
    { id: 'def3', x: 60, y: 40, type: 'player-b', label: 'Savunma 1', number: '3' },
    { id: 'def4', x: 75, y: 60, type: 'player-a', label: 'Oyuncu 3', number: '4' },
    { id: 'cone1', x: 30, y: 25, type: 'cone' },
    { id: 'cone2', x: 70, y: 25, type: 'cone' },
    { id: 'ball1', x: 27, y: 42, type: 'ball' },
  ];

  const markers = tacticalData?.markers || defaultMarkers;
  const lines = tacticalData?.lines || [
    { id: 'l1', from: { x: 25, y: 40 }, to: { x: 40, y: 60 }, type: 'pass' },
    { id: 'l2', from: { x: 40, y: 60 }, to: { x: 75, y: 60 }, type: 'run' },
  ];

  const getMarkerColor = (type: TacticalMarker['type']) => {
    switch (type) {
      case 'player-a':
        return 'bg-blue-600 border-white text-white shadow-md';
      case 'player-b':
        return 'bg-rose-600 border-white text-white shadow-md';
      case 'coach':
        return 'bg-amber-500 border-white text-white shadow-md font-bold';
      case 'cone':
        return 'bg-amber-400 border-amber-600 text-amber-900';
      case 'ball':
        return 'bg-white border-slate-900 text-slate-900 shadow-sm';
      case 'goal':
      case 'hoop':
      case 'target':
        return 'bg-emerald-500 border-white text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  const renderFieldBackground = () => {
    if (branch === 'Futbol') {
      return (
        <div className="absolute inset-0 bg-emerald-700 dark:bg-emerald-900/90 rounded-xl overflow-hidden border-2 border-emerald-600/60 dark:border-emerald-700/80 shadow-inner">
          {/* Grass stripes */}
          <div className="absolute inset-0 grid grid-cols-6 opacity-15 pointer-events-none">
            <div className="bg-emerald-500" />
            <div className="bg-emerald-800" />
            <div className="bg-emerald-500" />
            <div className="bg-emerald-800" />
            <div className="bg-emerald-500" />
            <div className="bg-emerald-800" />
          </div>
          {/* Pitch Lines */}
          <svg className="absolute inset-0 w-full h-full stroke-white/40 fill-none" strokeWidth="2">
            {/* Outer border */}
            <rect x="4%" y="4%" width="92%" height="92%" rx="4" />
            {/* Half line */}
            <line x1="50%" y1="4%" x2="50%" y2="96%" />
            {/* Center circle */}
            <circle cx="50%" cy="50%" r="18%" />
            <circle cx="50%" cy="50%" r="1.5%" className="fill-white/60" />
            {/* Left Penalty Area */}
            <rect x="4%" y="22%" width="18%" height="56%" />
            <rect x="4%" y="36%" width="7%" height="28%" />
            {/* Right Penalty Area */}
            <rect x="78%" y="22%" width="18%" height="56%" />
            <rect x="89%" y="36%" width="7%" height="28%" />
          </svg>
        </div>
      );
    }

    if (branch === 'Basketbol') {
      return (
        <div className="absolute inset-0 bg-amber-800/90 dark:bg-amber-950 rounded-xl overflow-hidden border-2 border-amber-700/60 shadow-inner">
          {/* Parquet floor texture lines */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:16px_100%] opacity-40 pointer-events-none" />
          {/* Court Lines */}
          <svg className="absolute inset-0 w-full h-full stroke-white/50 fill-none" strokeWidth="2">
            {/* Outer border */}
            <rect x="4%" y="4%" width="92%" height="92%" rx="4" />
            {/* Center Line */}
            <line x1="50%" y1="4%" x2="50%" y2="96%" />
            <circle cx="50%" cy="50%" r="15%" />
            {/* Left Key (Boyalı Alan) */}
            <rect x="4%" y="30%" width="22%" height="40%" className="fill-amber-900/30" />
            <path d="M 26% 30% A 20% 20% 0 0 1 26% 70%" />
            {/* Left 3-Point Arc */}
            <path d="M 4% 15% L 18% 15% A 34% 34% 0 0 1 18% 85% L 4% 85%" />
            {/* Left Hoop */}
            <circle cx="9%" cy="50%" r="3%" className="fill-orange-500/80 stroke-white" strokeWidth="1.5" />
            <line x1="4%" y1="43%" x2="4%" y2="57%" strokeWidth="4" />

            {/* Right Key */}
            <rect x="74%" y="30%" width="22%" height="40%" className="fill-amber-900/30" />
            <path d="M 74% 30% A 20% 20% 0 0 0 74% 70%" />
            {/* Right 3-Point Arc */}
            <path d="M 96% 15% L 82% 15% A 34% 34% 0 0 0 82% 85% L 96% 85%" />
            {/* Right Hoop */}
            <circle cx="91%" cy="50%" r="3%" className="fill-orange-500/80 stroke-white" strokeWidth="1.5" />
            <line x1="96%" y1="43%" x2="96%" y2="57%" strokeWidth="4" />
          </svg>
        </div>
      );
    }

    // Voleybol
    return (
      <div className="absolute inset-0 bg-blue-700 dark:bg-blue-950 rounded-xl overflow-hidden border-2 border-blue-600/70 shadow-inner">
        {/* Court surface color split */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-amber-600/30 border-r border-white/40" />
          <div className="w-1/2 bg-amber-600/30" />
        </div>
        <svg className="absolute inset-0 w-full h-full stroke-white/60 fill-none" strokeWidth="2">
          {/* Outer court */}
          <rect x="6%" y="8%" width="88%" height="84%" />
          {/* Net in the center */}
          <line x1="50%" y1="6%" x2="50%" y2="94%" strokeWidth="4" className="stroke-white" />
          {/* 3m Attack Lines */}
          <line x1="35%" y1="8%" x2="35%" y2="92%" strokeDasharray="6,4" />
          <line x1="65%" y1="8%" x2="65%" y2="92%" strokeDasharray="6,4" />
        </svg>
      </div>
    );
  };

  return (
    <div className={`bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white flex flex-col ${className}`}>
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">{title}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium uppercase tracking-wider">
            {branch}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowLabels(!showLabels)}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              showLabels ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="İsimleri Aç / Kapat"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Etiketler</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTrajectory(!showTrajectory)}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              showTrajectory ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Pas / Koşu Yollarını Göster"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Yollar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSimulating(!isSimulating)}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              isSimulating ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Hareketi Canlandır"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSimulating ? 'Durdur' : 'Canlandır'}</span>
          </button>
        </div>
      </div>

      {/* Main Pitch / Court Stage */}
      <div className="relative w-full aspect-16/10 rounded-xl overflow-hidden select-none">
        {renderFieldBackground()}

        {/* Tactical Lines (SVG Layer) */}
        {showTrajectory && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              <marker id="arrow-pass" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
              </marker>
              <marker id="arrow-run" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
              </marker>
              <marker id="arrow-dribble" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#ec4899" />
              </marker>
            </defs>

            {lines.map((line) => {
              const isPass = line.type === 'pass';
              const isRun = line.type === 'run';
              const isDribble = line.type === 'dribble';

              let strokeColor = '#38bdf8';
              let markerId = 'arrow-pass';
              let strokeDasharray = 'none';

              if (isRun) {
                strokeColor = '#fbbf24';
                markerId = 'arrow-run';
                strokeDasharray = '5,4';
              } else if (isDribble) {
                strokeColor = '#ec4899';
                markerId = 'arrow-dribble';
                strokeDasharray = '2,3';
              }

              return (
                <g key={line.id}>
                  <line
                    x1={`${line.from.x}%`}
                    y1={`${line.from.y}%`}
                    x2={`${line.to.x}%`}
                    y2={`${line.to.y}%`}
                    stroke={strokeColor}
                    strokeWidth="2.5"
                    strokeDasharray={strokeDasharray}
                    markerEnd={`url(#${markerId})`}
                    className={isSimulating ? 'animate-pulse' : ''}
                  />
                  {line.label && (
                    <text
                      x={`${(line.from.x + line.to.x) / 2}%`}
                      y={`${(line.from.y + line.to.y) / 2 - 2}%`}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="bg-black/80 px-1 rounded"
                    >
                      {line.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* Tactical Markers (Players, Cones, Balls) */}
        <div className="absolute inset-0 z-20">
          {markers.map((marker) => {
            const isBall = marker.type === 'ball';
            const isCone = marker.type === 'cone';

            return (
              <div
                key={marker.id}
                style={{
                  left: `${marker.x}%`,
                  top: `${marker.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute flex flex-col items-center group cursor-pointer"
              >
                {/* Visual Icon / Disc */}
                {isBall ? (
                  <div className="w-4 h-4 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-125">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                  </div>
                ) : isCone ? (
                  <div className="w-3.5 h-3.5 bg-amber-400 rotate-45 border border-amber-600 shadow-md flex items-center justify-center transform transition-transform group-hover:scale-125">
                    <span className="w-1 h-1 rounded-full bg-amber-800" />
                  </div>
                ) : (
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-transform group-hover:scale-125 ${getMarkerColor(
                      marker.type
                    )} ${isSimulating ? 'animate-bounce' : ''}`}
                  >
                    {marker.number || (marker.type === 'coach' ? 'K' : '•')}
                  </div>
                )}

                {/* Optional Label */}
                {showLabels && marker.label && (
                  <span className="mt-1 px-1.5 py-0.2 bg-slate-900/90 text-slate-100 text-[10px] font-medium rounded-sm whitespace-nowrap shadow-sm border border-slate-700/60 pointer-events-none">
                    {marker.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white" />
            <span>Hücum / Takım A</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 border border-white" />
            <span>Savunma / Takım B</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-white border border-slate-900" />
            <span>Top</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-amber-400 rotate-45" />
            <span>Huni / Engel</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-sky-400" /> Pas
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-amber-400 border-b border-dashed" /> Koşu
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-pink-500 border-b border-dotted" /> Dribling
          </span>
        </div>
      </div>
    </div>
  );
};
