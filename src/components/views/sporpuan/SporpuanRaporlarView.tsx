import React, { useState } from 'react';
import {
  TrendingUp,
  Star,
  Award,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  PieChart as PieChartIcon,
  Smile,
  Frown,
  Meh,
  FileSpreadsheet,
  FileText,
  Calendar,
  Building,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { SportsFlyIcon } from '../../SportsFlyLogo';
import { isSuperAdminUser } from '../../../data/packagePermissions';
import { getStoredUserProfile } from '../../../data/userProfile';

export const SporpuanRaporlarView: React.FC = () => {
  const isSuperAdmin = isSuperAdminUser(getStoredUserProfile()?.role);
  const [dateRange, setDateRange] = useState('Son 30 Gün');
  const [selectedFacility, setSelectedFacility] = useState('Tümü');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExportPDF = () => {
    triggerToast('Sporpuan İtibar Karnesi PDF olarak hazırlanıyor...');
    setTimeout(() => {
      window.print();
    }, 600);
  };

  const handleExportExcel = () => {
    triggerToast('Sporpuan metrikleri ve duygu analizleri Excel olarak indirildi.');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-xs flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-200" />
              Sporpuan İtibar &amp; Performans Raporu
            </span>
            {isSuperAdmin && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/30 flex items-center gap-1 shadow-2xs backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                Süper Admin Yetkisiyle Açık
              </span>
            )}
            <span className="text-xs text-emerald-100 font-medium">
              sporpuan.com Analitik Motoru
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Sporcu Memnuniyeti &amp; Tesis İtibar Karnesi
          </h1>
          <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
            Sporcularınızın deneyimlerinden elde edilen kriter puanları, duygu analitiği ve Net Promoter Score (NPS) ile spor salonunuzun rekabet gücünü artırın.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4 text-emerald-700" />
            İtibar Karnesi İndir (PDF)
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-emerald-800/80 hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Dönem:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-medium"
          >
            <option value="Son 7 Gün">Son 7 Gün</option>
            <option value="Son 30 Gün">Son 30 Gün</option>
            <option value="Son 90 Gün">Son 90 Gün (Çeyrek)</option>
            <option value="Tüm Zamanlar">Tüm Zamanlar (Yıllık)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Tesis Filtresi:</span>
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-medium"
          >
            <option value="Tümü">Tüm Tesisler &amp; Şubeler</option>
            <option value="Saraçgym Nilüfer">Saraçgym Nilüfer</option>
            <option value="DigiMondi Levent">DigiMondi Levent</option>
            <option value="aicosports Koşuyolu">aicosports Koşuyolu</option>
          </select>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Sporpuan */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Genel Sporpuan Skoru</span>
            <span className="flex items-center text-emerald-600 font-bold gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +0.2 puan
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">4.8</span>
            <span className="text-slate-400 font-bold text-sm">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-amber-400" />
            ))}
            <span className="text-xs font-bold text-slate-700 ml-1">
              Mükemmel Düzey
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            184 doğrulanmış sporcu deneyimine dayalıdır.
          </p>
        </div>

        {/* Metric 2: Net Promoter Score (NPS) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Net Promoter Score (NPS)</span>
            <span className="flex items-center text-emerald-600 font-bold gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +4
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600">+78</span>
            <span className="text-slate-400 font-bold text-xs">(-100 ile +100)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '89%' }} />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Sporcuların %89&apos;u tesisinizi arkadaşlarına tavsiye ediyor.
          </p>
        </div>

        {/* Metric 3: Verified Check-in Rate */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Doğrulanmış Üye Oranı</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">%92.4</span>
          </div>
          <p className="text-xs font-semibold text-emerald-700 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Turnike &amp; QR Tescilli
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Manipülasyonsuz organik yorum güvencesi.
          </p>
        </div>

        {/* Metric 4: Cevaplama Oranı */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Kulüp Yanıt Oranı</span>
            <span className="text-emerald-600 font-bold text-xs">Ort. 2.4 saat</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">%96</span>
          </div>
          <p className="text-xs font-semibold text-slate-700 mt-2">
            48 / 50 Değerlendirme Yanıtlandı
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            sporpuan.com rozet puanına doğrudan +0.4 katkı sağlar.
          </p>
        </div>
      </div>

      {/* Criteria Breakdown & Sentiment Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Sporpuan 5 Kriter Analizi */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                Sporpuan Kriter Performansı
              </h3>
              <p className="text-xs text-slate-500">
                Sporcuların ayrıntılı kriter puanlama ortalamaları
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 px-2.5 py-1 bg-slate-100 rounded-lg">
              5.0 Üzerinden
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {[
              { label: 'Temizlik & Hijyen Standartları', score: 4.9, color: 'bg-emerald-500' },
              { label: 'Eğitmen & Antrenör İlgisi', score: 4.8, color: 'bg-blue-600' },
              { label: 'Ekipman Çeşitliliği & Bakımı', score: 4.7, color: 'bg-amber-500' },
              { label: 'Soyunma Odaları & Havalandırma', score: 4.4, color: 'bg-indigo-500' },
              { label: 'Fiyat / Performans Dengesi', score: 4.6, color: 'bg-teal-500' },
            ].map((crit, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{crit.label}</span>
                  <span className="font-bold text-slate-900">{crit.score} / 5.0</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${crit.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${(crit.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Sporcu Duygu Analizi & Öne Çıkan Konular */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-blue-600" />
                Sporcu Duygu &amp; Memnuniyet Analitiği
              </h3>
              <p className="text-xs text-slate-500">
                Yorum metinlerinin doğal dil işleme analiz sonuçları
              </p>
            </div>
          </div>

          {/* Sentiment bars */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <Smile className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              <div className="text-xl font-black text-emerald-800">%89</div>
              <span className="text-[11px] font-semibold text-emerald-700">
                Pozitif (Övgü)
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <Meh className="w-6 h-6 text-slate-500 mx-auto mb-1" />
              <div className="text-xl font-black text-slate-800">%8</div>
              <span className="text-[11px] font-semibold text-slate-600">
                Nötr (Öneri)
              </span>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
              <Frown className="w-6 h-6 text-rose-600 mx-auto mb-1" />
              <div className="text-xl font-black text-rose-800">%3</div>
              <span className="text-[11px] font-semibold text-rose-700">
                Geliştirilmeli
              </span>
            </div>
          </div>

          {/* Highlights & Weak points */}
          <div className="space-y-3 pt-2">
            <div>
              <span className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                <SportsFlyIcon className="w-3.5 h-3.5" />
                En Çok Övgü Alan Noktalar (Sporpuan Etiketleri):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Güler yüzlü hocalar',
                  'Ferah havalandırma',
                  'Yeni nesil Reformer',
                  'Temiz duşlar',
                  'Otopark kolaylığı',
                  'Sporsepeti anlık rezervasyon',
                ].map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    + {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-800 block mb-1.5">
                Geliştirme Tavsiyeleri:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '18:30-20:00 arası kardiyo yoğunluğu',
                  'Ekstra dolap anahtarı talebi',
                  'Kafeterya protein bar çeşitliliği',
                ].map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                  >
                    • {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Building className="w-5 h-5 text-slate-700" />
              Tesisler &amp; Şubeler İtibar Karşılaştırması
            </h3>
            <p className="text-xs text-slate-500">
              Sporpuan platformundaki şube bazlı puan ve güven sıralaması
            </p>
          </div>
          <a
            href="https://www.sporpuan.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            sporpuan.com&apos;da İncele
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-700 bg-slate-50/70">
                <th className="py-3 px-4">Tesis Adı</th>
                <th className="py-3 px-4">Sporpuan Skoru</th>
                <th className="py-3 px-4">Toplam Yorum</th>
                <th className="py-3 px-4">NPS Oranı</th>
                <th className="py-3 px-4">Doğrulama Rozeti</th>
                <th className="py-3 px-4">Genel Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                {
                  name: 'Saraçgym Nilüfer',
                  score: 4.9,
                  reviews: 94,
                  nps: '+82',
                  badge: 'Doğrulanmış Altın Rozet',
                  status: 'Lider Tesis',
                },
                {
                  name: 'DigiMondi Levent',
                  score: 4.8,
                  reviews: 52,
                  nps: '+79',
                  badge: 'Doğrulanmış Hijyenik Tesis',
                  status: 'Çok Başarılı',
                },
                {
                  name: 'DigiMondi Suadiye',
                  score: 4.7,
                  reviews: 24,
                  nps: '+75',
                  badge: 'Doğrulanmış Tesis',
                  status: 'Başarılı',
                },
                {
                  name: 'aicosports Koşuyolu',
                  score: 4.5,
                  reviews: 14,
                  nps: '+68',
                  badge: 'İnceleme Sürecinde',
                  status: 'Gelişme Aşamasında',
                },
              ].map((fac, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{fac.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      {fac.score}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-semibold">
                    {fac.reviews} Yorum
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-700">{fac.nps}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      <Award className="w-3 h-3 text-blue-600" />
                      {fac.badge}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {fac.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
