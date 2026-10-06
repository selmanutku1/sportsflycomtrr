import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  Award,
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Share2,
  Phone,
  Mail,
  Clock,
  Sparkles,
  MapPin,
  BadgeCheck,
} from 'lucide-react';
import { EgitmenItem } from '../../../types';

interface TrainerPdfReportModalProps {
  mode: 'single' | 'all';
  trainer?: EgitmenItem | null;
  singleTrainer?: EgitmenItem | null;
  trainersList?: EgitmenItem[];
  trainers?: EgitmenItem[];
  isOpen?: boolean;
  onClose: () => void;
  onToast?: (msg: string) => void;
}

export const TrainerPdfReportModal: React.FC<TrainerPdfReportModalProps> = ({
  mode,
  trainer,
  singleTrainer,
  trainersList,
  trainers,
  isOpen = true,
  onClose,
  onToast = (_msg: string = '') => {},
}) => {
  if (isOpen === false) return null;

  const targetTrainer = singleTrainer || trainer || null;
  const list = trainersList || trainers || [];

  const [reportTitle, setReportTitle] = useState(
    mode === 'single' && targetTrainer
      ? `Antrenör Bilgi Formu & Karnesi - ${targetTrainer.name}`
      : 'SportsFly Kulübü - Resmi Eğitmen Kadrosu Raporu'
  );

  const currentDateStr = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    onToast('Yazdırma ve PDF kaydetme penceresi açılıyor...');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleDownloadOfflineHTML = () => {
    const fileName =
      mode === 'single' && targetTrainer
        ? `SportsFly_${targetTrainer.name.replace(/\s+/g, '_')}_Raporu.html`
        : `SportsFly_Egitmen_Kadrosu_${new Date().toISOString().slice(0, 10)}.html`;

    const printableContent = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>${reportTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 22px; font-weight: 900; color: #2563eb; }
    .title { font-size: 18px; font-weight: bold; margin: 10px 0 5px 0; }
    .meta { font-size: 12px; color: #64748b; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 15px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
    th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; font-weight: bold; }
    td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; }
    .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo"> SPORTSFLY ACADEMY</div>
      <div class="meta">Spor Akademisi &amp; Kulüp Yönetim Sistemi</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: bold;">Resmi Rapor</div>
      <div class="meta">Tarih: ${currentDateStr}</div>
    </div>
  </div>

  <h2>${reportTitle}</h2>

  ${
    mode === 'single' && targetTrainer
      ? `
    <div class="card">
      <h3 style="margin-top:0;">${targetTrainer.name} (${targetTrainer.code})</h3>
      <p><strong>Unvan:</strong> ${targetTrainer.title || 'Lisanslı Antrenör'} • <strong>Branş:</strong> ${targetTrainer.branch || 'Spor'}</p>
      <p><strong>Lisans Derecesi:</strong> ${targetTrainer.licenseLevel || 'UEFA / Federasyon Lisansı'} • <strong>Deneyim:</strong> ${targetTrainer.experienceYears || 5} Yıl</p>
      <p><strong>İletişim:</strong> ${targetTrainer.phone} | ${targetTrainer.email}</p>
      <p><strong>Görev Yeri:</strong> ${targetTrainer.facility} (${targetTrainer.city || 'İstanbul'})</p>
      <p><strong>Haftalık Seans Yükü:</strong> ${targetTrainer.weeklyHours || 18} Saat/Hafta | <strong>Aktif Sporcu:</strong> ~${targetTrainer.activeAthletesCount || 30} Kişi</p>
    </div>

    <h4>Sorumlu Olduğu Takımlar & Gruplar</h4>
    <ul>
      ${(targetTrainer.assignedGroups || [`${targetTrainer.branch || 'Futbol'} Akademi Grubu`]).map((g) => `<li><strong>${g}</strong> - Aktif Antrenman Grubu</li>`).join('')}
    </ul>

    <h4>Sertifika ve Resmi Evraklar</h4>
    <table>
      <thead>
        <tr>
          <th>Evrak / Sertifika Adı</th>
          <th>Türü</th>
          <th>Tarih</th>
          <th>Boyut</th>
        </tr>
      </thead>
      <tbody>
        ${(targetTrainer.documents || [
          { name: 'Federasyon_Antrenor_Lisansi.pdf', type: 'Sertifika', date: '14.01.2023', size: '2.4 MB' },
          { name: 'Kulup_Hizmet_Sozlesmesi.pdf', type: 'Sözleşme', date: '01.09.2024', size: '1.8 MB' },
        ])
          .map((d) => `<tr><td>${d.name}</td><td>${d.type}</td><td>${d.date}</td><td>${d.size}</td></tr>`)
          .join('')}
      </tbody>
    </table>
  `
      : `
    <div class="card">
      <strong>Özet:</strong> Toplam ${list.length} eğitmen kadrosu ve ${new Set(list.map((t) => t.branch)).size} spor branşı aktif durumdadır.
    </div>

    <table>
      <thead>
        <tr>
          <th>Eğitmen Adı</th>
          <th>Kod</th>
          <th>Branş / Pozisyon</th>
          <th>Lisans</th>
          <th>Telefon</th>
          <th>E-Posta</th>
          <th>Tesis</th>
          <th>Gruplar</th>
        </tr>
      </thead>
      <tbody>
        ${list
          .map(
            (t) => `
          <tr>
            <td><strong>${t.name}</strong></td>
            <td>${t.code}</td>
            <td>${t.branch || 'Futbol'} / ${t.title || 'Antrenör'}</td>
            <td>${t.licenseLevel || '-'}</td>
            <td>${t.phone}</td>
            <td>${t.email}</td>
            <td>${t.facility}</td>
            <td>${(t.assignedGroups || ['Akademi']).join(', ')}</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>
  `
  }

  <div class="footer">
    <div>SportsFly Kulüp Otomasyonu tarafından otomatik oluşturulmuştur.</div>
    <div>Sayfa 1 / 1</div>
  </div>
</body>
</html>`;

    const blob = new Blob([printableContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast(`Rapor dosyası ("${fileName}") başarıyla indirildi.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 max-h-[94vh] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {mode === 'single' ? 'Eğitmen PDF Raporu & Karnesi' : 'Eğitmen Kadrosu Toplu PDF Raporu'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Resmi kurumsal formatta PDF olarak kaydedebilir veya doğrudan yazdırabilirsiniz
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF Kaydet</span>
            </button>
            <button
              onClick={handleDownloadOfflineHTML}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rapor Dosyası İndir</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Preview Document Paper Container */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 text-slate-900 dark:text-slate-100">
            {/* Header branding */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-blue-600 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                    SF
                  </div>
                  <span className="text-xl font-black tracking-tight text-blue-600 dark:text-blue-400">
                    SPORTSFLY ACADEMY
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Resmi Spor Okulu &amp; Antrenör Yönetim Merkezi Raporu
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  RESMİ KULÜP EVRAKI
                </span>
                <p className="text-xs text-slate-500 font-medium">{currentDateStr}</p>
              </div>
            </div>

            {/* Mode 1: Single Trainer Detailed Dossier */}
            {mode === 'single' && targetTrainer && (
              <div className="space-y-6">
                {/* Trainer identity banner */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg font-black shrink-0 shadow-sm">
                      {targetTrainer.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">
                          {targetTrainer.name}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {targetTrainer.status || 'Aktif'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {targetTrainer.title || 'Başantrenör'} • {targetTrainer.branch || 'Futbol'} Branşı • Kod: <span className="font-sans tabular-nums">{targetTrainer.code}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs space-y-0.5">
                    <span className="text-slate-400 block text-[11px]">Tesis &amp; Lokasyon:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      {targetTrainer.facility}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {targetTrainer.city || 'İstanbul'}
                    </span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Lisans Derecesi</span>
                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5 block truncate">
                      {targetTrainer.licenseLevel || 'UEFA Lisans'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Deneyim</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                      {targetTrainer.experienceYears || 6} Yıl
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Haftalık Yük</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                      {targetTrainer.weeklyHours || 18} Saat / Hafta
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Sporcu Sayısı</span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      ~{targetTrainer.activeAthletesCount || 30} Sporcu
                    </span>
                  </div>
                </div>

                {/* Assigned Groups Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Sorumlu Olduğu Akademi &amp; Takım Grupları</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(targetTrainer.assignedGroups && targetTrainer.assignedGroups.length > 0
                      ? targetTrainer.assignedGroups
                      : [`${targetTrainer.branch || 'Futbol'} Akademi Grubu A`, `${targetTrainer.branch || 'Futbol'} Gelişim Takımı B`]
                    ).map((grp, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-white">{grp}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Aktif Kadro</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificates / Documents Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Kayıtlı Sertifika, Lisans &amp; Resmi Evraklar</span>
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-2.5 px-3">Evrak / Sertifika Başlığı</th>
                          <th className="py-2.5 px-3">Kategori</th>
                          <th className="py-2.5 px-3">Kayıt Tarihi</th>
                          <th className="py-2.5 px-3">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {(targetTrainer.documents || [
                          { name: 'Federasyon_Antrenor_Lisansi.pdf', type: 'Sertifika', date: '14.01.2023', size: '2.4 MB' },
                          { name: 'Kulup_Hizmet_Sozlesmesi.pdf', type: 'Sözleşme', date: '01.09.2024', size: '1.8 MB' },
                        ]).map((doc, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                              {doc.name}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">{doc.type}</td>
                            <td className="py-2.5 px-3 text-slate-500">{doc.date}</td>
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Geçerli</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Contact & Administrative Info */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">İletişim Bilgileri:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {targetTrainer.phone} • {targetTrainer.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Hesap Yetki &amp; Başlangıç:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                      Başlangıç: {targetTrainer.joinDate || '12.01.2022'} • Süre: {targetTrainer.accountDuration || 'Sınırsız'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: All Trainers Club Roster */}
            {mode === 'all' && (
              <div className="space-y-5">
                {/* Executive stats summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Toplam Eğitmen</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                      {list.length} Antrenör
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Aktif Branş</span>
                    <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5 block">
                      {new Set(list.map((t) => t.branch)).size} Branş
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Sorumlu Gruplar</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {list.reduce((acc, t) => acc + (t.assignedGroups?.length || 1), 0)} Grup
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Haftalık Yük</span>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                      {list.reduce((acc, t) => acc + (t.weeklyHours || 15), 0)} Saat / Hafta
                    </span>
                  </div>
                </div>

                {/* Table of all trainers */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-300 dark:border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">Eğitmen</th>
                        <th className="py-2.5 px-3">Kod</th>
                        <th className="py-2.5 px-3">Branş</th>
                        <th className="py-2.5 px-3">Lisans</th>
                        <th className="py-2.5 px-3">Telefon</th>
                        <th className="py-2.5 px-3">Tesis</th>
                        <th className="py-2.5 px-3">Gruplar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {list.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 dark:text-white block">{t.name}</span>
                            <span className="text-[10px] text-slate-400">{t.title || 'Antrenör'}</span>
                          </td>
                          <td className="py-2.5 px-3 font-sans tabular-nums text-[11px] text-slate-500">{t.code}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                              {t.branch || 'Futbol'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                            {t.licenseLevel || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{t.phone}</td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 truncate max-w-[130px]">
                            {t.facility}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-medium">
                            {(t.assignedGroups || ['Akademi']).join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Official Signature Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6 mt-6 text-xs text-slate-400">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300">SportsFly Kulüp Yönetim Kurulu</p>
                <p className="text-[11px] text-slate-400">Teknik Direktörlük &amp; Altyapı Koordinatörlüğü</p>
              </div>

              <div className="text-right">
                <div className="w-32 border-b border-slate-300 dark:border-slate-700 pb-5"></div>
                <span className="text-[10px] text-slate-400 block mt-1">Resmi Kaşe &amp; Onay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3.5 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Kapat
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadOfflineHTML}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Raporu İndir</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF Olarak Kaydet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
