import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  Scale,
  Ruler,
  Activity,
  Zap,
  CheckCircle2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { SportsFlyLabReport } from '../../data/sportsFlyLabData';

export interface SportsFlyLabAiGrowthForecastCardProps {
  report: SportsFlyLabReport;
  className?: string;
}

export interface GrowthTimelinePoint {
  month: number;
  monthLabel: string;
  height: number;
  weight: number;
  bmi: number;
}

export interface AiGrowthPredictionData {
  predictedMonth3Height: number;
  predictedMonth3Weight: number;
  predictedMonth3Bmi: number;
  predictedMonth6Height: number;
  predictedMonth6Weight: number;
  predictedMonth6Bmi: number;
  predictedMonth6BodyFat: number;
  growthVelocityNote: string;
  recommendedNutritionalFocus: string;
  recommendedTrainingFocus: string;
  aiConfidenceScore: number;
  timelinePoints: GrowthTimelinePoint[];
}

export const SportsFlyLabAiGrowthForecastCard: React.FC<SportsFlyLabAiGrowthForecastCardProps> = ({
  report,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [predictionData, setPredictionData] = useState<AiGrowthPredictionData | null>(null);

  const getRow = (id: string) => report.bodyComposition.find((r) => r.id === id);

  const heightVal = getRow('height')?.m3 ?? 149.5;
  const weightVal = getRow('weight')?.m3 ?? 43.2;
  const bmiVal = getRow('bmi')?.m3 ?? 18.2;
  const fatVal = getRow('bodyFat')?.m3 ?? 14.2;

  const m1H = getRow('height')?.m1 ?? 145.0;
  const m2H = getRow('height')?.m2 ?? 147.2;
  const m1W = getRow('weight')?.m1 ?? 41.4;
  const m2W = getRow('weight')?.m2 ?? 42.1;

  const fetchAiGrowthPrediction = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/growth-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteName: report.athleteName,
          gender: report.gender,
          ageYears: report.ageYears,
          sportBranch: report.sportBranch,
          currentHeight: heightVal,
          currentWeight: weightVal,
          currentBmi: bmiVal,
          currentBodyFat: fatVal,
          phvAge: report.phvAge,
          predictedAdultHeight: report.predictedAdultHeight,
          maturationStatus: report.maturationStatus,
          m1Height: m1H,
          m2Height: m2H,
          m1Weight: m1W,
          m2Weight: m2W,
        }),
      });

      const json = await res.json();
      if (json && json.success && json.data) {
        setPredictionData(json.data);
      }
    } catch (err) {
      console.warn('[AiGrowthForecastCard] Error fetching prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiGrowthPrediction();
  }, [report.id, heightVal, weightVal]);

  const hGain = predictionData
    ? +(predictionData.predictedMonth6Height - heightVal).toFixed(1)
    : 1.9;
  const wGain = predictionData
    ? +(predictionData.predictedMonth6Weight - weightVal).toFixed(1)
    : 1.3;

  return (
    <div className={`p-4 rounded-2xl border-2 border-indigo-200 bg-slate-900 text-white shadow-2xs space-y-3.5 ${className}`}>
      {/* Top Title & AI Action Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 font-black shadow-xs shrink-0">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                🤖 Yapay Zeka Gelecek Tahminleme &amp; 6 Aylık Gelişim Eğrisisi
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[9.5px] font-sans tabular-nums font-bold uppercase">
                AI Powered Model
              </span>
            </div>
            <p className="text-[10px] text-slate-300">
              Antropometrik geçmiş, PHV ({report.phvAge} yaş) ve olgunlaşma eğrisine dayalı 6 aylık boy &amp; kilo projeksiyonu
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAiGrowthPrediction}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-sans tabular-nums text-xs font-black flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Hesaplanıyor...' : 'Yeniden Hesapla'}</span>
        </button>
      </div>

      {/* 4 Summary Prediction Cards */}
      {predictionData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
            <div className="flex items-center justify-between text-[9.5px] text-sky-300 font-sans tabular-nums uppercase font-bold">
              <span>6 Aylık Tahmini Boy</span>
              <Ruler className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-lg font-black font-sans tabular-nums text-white mt-1">
              {predictionData.predictedMonth6Height} <span className="text-xs font-normal text-slate-300">cm</span>
            </div>
            <div className="text-[10px] font-sans tabular-nums text-emerald-400 font-bold mt-0.5">
              Bugün {heightVal} cm → +{hGain} cm
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
            <div className="flex items-center justify-between text-[9.5px] text-indigo-300 font-sans tabular-nums uppercase font-bold">
              <span>6 Aylık Tahmini Kilo</span>
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-lg font-black font-sans tabular-nums text-white mt-1">
              {predictionData.predictedMonth6Weight} <span className="text-xs font-normal text-slate-300">kg</span>
            </div>
            <div className="text-[10px] font-sans tabular-nums text-emerald-400 font-bold mt-0.5">
              Bugün {weightVal} kg → +{wGain} kg
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
            <div className="flex items-center justify-between text-[9.5px] text-amber-300 font-sans tabular-nums uppercase font-bold">
              <span>6 Aylık Tahmini BKİ</span>
              <Activity className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-black font-sans tabular-nums text-white mt-1">
              {predictionData.predictedMonth6Bmi} <span className="text-xs font-normal text-slate-300">kg/m²</span>
            </div>
            <div className="text-[10px] font-sans tabular-nums text-amber-300 font-bold mt-0.5">
              Optimal Fiziksel Denge
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700">
            <div className="flex items-center justify-between text-[9.5px] text-emerald-300 font-sans tabular-nums uppercase font-bold">
              <span>AI Güven Skoru</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-black font-sans tabular-nums text-emerald-300 mt-1">
              %{predictionData.aiConfidenceScore}
            </div>
            <div className="text-[10px] font-sans tabular-nums text-slate-300 font-bold mt-0.5">
              Mirwald &amp; Khamis-Roche
            </div>
          </div>
        </div>
      )}

      {/* 6-Month Recharts Projection Trajectory Chart */}
      {predictionData && predictionData.timelinePoints && (
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-sans tabular-nums font-bold text-slate-300 mb-1">
            <span>📊 ÖNÜMÜZDEKİ 6 AYLIK PROJEKSİYON EĞRİSİ (Aylık Büyüme Hızı)</span>
            <span className="text-sky-300">● Boy (cm) &nbsp;&nbsp; ● Kilo (kg)</span>
          </div>

          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictionData.timelinePoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="heightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="monthLabel" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as GrowthTimelinePoint;
                      return (
                        <div className="bg-slate-900 border border-slate-700 text-white text-[11px] p-2 rounded-lg font-sans tabular-nums shadow-md">
                          <div className="font-extrabold text-sky-300 border-b border-slate-700 pb-1 mb-1">
                            {data.monthLabel} Tahmini
                          </div>
                          <div>📏 Boy: <strong>{data.height} cm</strong></div>
                          <div>⚖️ Kilo: <strong>{data.weight} kg</strong></div>
                          <div>📊 BKİ: <strong>{data.bmi} kg/m²</strong></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="height" name="Boy (cm)" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#heightGrad)" />
                <Area type="monotone" dataKey="weight" name="Kilo (kg)" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#weightGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Qualitative Recommendations */}
      {predictionData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
            <div className="font-extrabold text-sky-300 text-[10.5px] uppercase font-sans tabular-nums flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>Büyüme Eğrisi Analizi</span>
            </div>
            <p className="text-[10.5px] text-slate-200 leading-snug">
              {predictionData.growthVelocityNote}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
            <div className="font-extrabold text-emerald-300 text-[10.5px] uppercase font-sans tabular-nums flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Beslenme &amp; Rejenerasyon</span>
            </div>
            <p className="text-[10.5px] text-slate-200 leading-snug">
              {predictionData.recommendedNutritionalFocus}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
            <div className="font-extrabold text-amber-300 text-[10.5px] uppercase font-sans tabular-nums flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Biyomekanik &amp; Yüklenme</span>
            </div>
            <p className="text-[10.5px] text-slate-200 leading-snug">
              {predictionData.recommendedTrainingFocus}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
