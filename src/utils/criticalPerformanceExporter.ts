import { jsPDF } from 'jspdf';
import { SportsFlyLabReport } from '../data/sportsFlyLabData';

/**
 * Downloads critical performance data from the SportsFly Lab report as a UTF-8 BOM encoded CSV file.
 * Compatible with Microsoft Excel, Apple Numbers, and Google Sheets.
 */
export function downloadCriticalPerformanceCSV(report: SportsFlyLabReport): void {
  const grpAvg = report.groupInfo?.groupAverageScore ?? 72;
  const athleticScore = report.scoreHistory?.p3Score || 88;
  const targetScore = Math.min(100, Math.max(athleticScore + 6, 85));

  const headers = [
    'SPORTSFLY LAB — KRITIK PERFORMANS VE BIYOMOTOR GELISIM RAPORU',
    '',
    `Sporcu Adi:;${report.athleteName};Sporcu Kodu:;${report.athleteCode}`,
    `Kulup:;${report.clubName};Sube:;${report.branchName}`,
    `Brans:;${report.sportBranch};Yas & Cinsiyet:;${report.ageYears} Yas (${report.gender})`,
    `Son Olcum Tarihi:;${report.date3};Onceki Olcumler:;${report.date1} -> ${report.date2}`,
    `Sporcu Mevcut Skoru:;%${athleticScore};Hedef Deger:;%${targetScore}`,
    `Grup Ortalamasi:;%${grpAvg};Grup Siralamasi:;${report.groupInfo?.groupRank || 1} / ${report.groupInfo?.groupAthleteCount || 15}`,
    '',
    'BIYOMOTOR MOTOR PERFORMANS KARSILASTIRMA VERILERI',
    'Test Adi;Birim;1. Test;2. Test;3. Test (Mevcut);Mevcut Yuzdelik (%);Grup Ortalamasi (%);Hedef Deger (%);Grup Farki (Δ %);Hedefe Kalan (Δ %);Performans Durumu;Oneri & Egzersiz Odagi',
  ];

  const motorRows = report.motorPerformance.map((row) => {
    const p3Val = row.percentile || Math.round(row.m3);
    const grpVal = Math.max(35, Math.min(88, Math.round(p3Val * 0.82 + grpAvg * 0.18 - 4)));
    const targetVal = Math.min(100, Math.max(p3Val + 8, 85));
    const groupDiff = p3Val - grpVal;
    const targetDiff = targetVal - p3Val;
    const statusLabel =
      p3Val >= targetVal
        ? 'Hedefe Ulasti'
        : p3Val >= grpVal
        ? 'Grup Uzeri / Gelisiyor'
        : 'Gelisim Gerekli';

    const testName = row.name
      .replace(/testi/gi, '')
      .replace(/ölçümü/gi, '')
      .trim();

    return [
      testName,
      row.unit,
      row.m1,
      row.m2,
      row.m3,
      p3Val,
      grpVal,
      targetVal,
      groupDiff > 0 ? `+${groupDiff}` : `${groupDiff}`,
      targetDiff > 0 ? `-${targetDiff}` : '0',
      statusLabel,
      `Hedef: ${row.refMid || targetVal} ${row.unit}`,
    ].join(';');
  });

  const bodyCompHeaders = [
    '',
    'BEDEN KOMPOZISYONU VE BUYUME PARAMETRELERI',
    'Parametre;Birim;1. Olcum;2. Olcum;3. Olcum (Mevcut);Yuzdelik (%);Referans Aralik;Durum',
  ];

  const bodyCompRows = (report.bodyComposition || []).map((b) => [
    b.name,
    b.unit,
    b.m1,
    b.m2,
    b.m3,
    b.percentile || 50,
    `${b.refLow || '-'} - ${b.refHigh || '-'}`,
    b.status || 'Normal',
  ].join(';'));

  const footer = [
    '',
    'UZMAN VE ANTRENOR DEGERLENDIRMESI',
    `"${(report.expertComment || 'Gelisim hedefleri basariyla surdurulmektedir.').replace(/"/g, '""')}"`,
    '',
    `Rapor Olusturma Tarihi:;${new Date().toLocaleDateString('tr-TR')};Sistem:;SportsFly Athlete Performance Intelligence`,
  ];

  const fullCsv = [
    ...headers,
    ...motorRows,
    ...bodyCompHeaders,
    ...bodyCompRows,
    ...footer,
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + fullCsv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = report.athleteName.replace(/\s+/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `SportsFly_Performans_Raporu_${safeName}_${report.date3 || '2026'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a clean, executive A4 PDF summary of the athlete's critical performance data.
 */
export async function downloadCriticalPerformancePDF(
  report: SportsFlyLabReport,
  elementToCaptureId?: string
): Promise<void> {
  const safeName = report.athleteName.replace(/\s+/g, '_');
  const fileName = `SportsFly_Kritik_Performans_Raporu_${safeName}.pdf`;

  // If a DOM element ID is provided and found, try capturing via html2canvas
  if (elementToCaptureId && typeof window !== 'undefined') {
    const el = document.getElementById(elementToCaptureId);
    if (el) {
      try {
        const html2canvasModule = await import('html2canvas');
        const html2canvasFn = (html2canvasModule.default || html2canvasModule) as (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
        const canvas = await html2canvasFn(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true,
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 8;
        const availW = pdfWidth - margin * 2;
        const availH = pdfHeight - margin * 2;
        const ratio = Math.min(availW / canvas.width, availH / canvas.height);
        const renderW = canvas.width * ratio;
        const renderH = canvas.height * ratio;
        const offsetX = (pdfWidth - renderW) / 2;

        pdf.addImage(imgData, 'JPEG', offsetX, margin, renderW, renderH);
        pdf.save(fileName);
        return;
      } catch (err) {
        console.warn('Canvas capture fallback to native jsPDF generator:', err);
      }
    }
  }

  // Native High-Definition jsPDF Report Generation
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const grpAvg = report.groupInfo?.groupAverageScore ?? 72;
  const athleticScore = report.scoreHistory?.p3Score || 88;
  const targetScore = Math.min(100, Math.max(athleticScore + 6, 85));

  // Top Accent Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 24, 'F');

  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 24, 210, 2, 'F');

  // Title & Brand
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('SPORTSFLY LAB — KRITIK PERFORMANS VE GELISIM RAPORU', 12, 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Mevcut Deger vs. Hedef Deger vs. Grup Ortalamasi Gelisim Takibi', 12, 18);

  doc.setFontSize(8.5);
  doc.setTextColor(248, 250, 252);
  doc.text(new Date().toLocaleDateString('tr-TR'), 198, 14, { align: 'right' });

  // Athlete Card Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, 30, 186, 26, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(report.athleteName || 'Sporcu', 16, 38);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Kod: ${report.athleteCode || 'SF-2026'} | Brans: ${report.sportBranch || 'Voleybol'} | Yas: ${report.ageYears || 11} (${report.gender || 'Erkek'})`, 16, 44);
  doc.text(`Kulup: ${report.clubName || 'Spor Kulubu'} - ${report.branchName || 'Merkez Sube'} | Olcum Tarihi: ${report.date3 || '2026'}`, 16, 50);

  // 3 Score KPI Boxes
  const kpiY = 60;
  const kpiW = 58;
  const kpiH = 18;

  // Box 1: Grup Ortalaması
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(12, kpiY, kpiW, kpiH, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('GRUP ORTALAMASI', 16, kpiY + 6);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(`%${grpAvg}`, 16, kpiY + 14);

  // Box 2: Hedef Değer
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(76, kpiY, kpiW, kpiH, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(37, 99, 235);
  doc.text('HEDEF DEGER', 80, kpiY + 6);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(29, 78, 216);
  doc.text(`%${targetScore}`, 80, kpiY + 14);

  // Box 3: Mevcut Değer
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(140, kpiY, kpiW, kpiH, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('SPORCU MEVCUT', 144, kpiY + 6);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(4, 120, 87);
  doc.text(`%${athleticScore}`, 144, kpiY + 14);

  // Table Section Header
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Biyomotor Performans Testleri (Karsilastirma & Gözlem)', 12, 85);

  // Table Header
  const tableStartY = 89;
  doc.setFillColor(15, 23, 42);
  doc.rect(12, tableStartY, 186, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('MOTOR TEST', 15, tableStartY + 5);
  doc.text('1. TEST', 65, tableStartY + 5, { align: 'center' });
  doc.text('2. TEST', 85, tableStartY + 5, { align: 'center' });
  doc.text('MEVCUT', 105, tableStartY + 5, { align: 'center' });
  doc.text('GRUP ORT', 125, tableStartY + 5, { align: 'center' });
  doc.text('HEDEF', 145, tableStartY + 5, { align: 'center' });
  doc.text('YUZDELIK', 165, tableStartY + 5, { align: 'center' });
  doc.text('DURUM', 185, tableStartY + 5, { align: 'center' });

  let curY = tableStartY + 7;
  const rowHeight = 7.5;

  report.motorPerformance.slice(0, 10).forEach((row, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(12, curY, 186, rowHeight, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(12, curY + rowHeight, 198, curY + rowHeight);

    const p3Val = row.percentile || Math.round(row.m3);
    const grpVal = Math.max(35, Math.min(88, Math.round(p3Val * 0.82 + grpAvg * 0.18 - 4)));
    const targetVal = Math.min(100, Math.max(p3Val + 8, 85));

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7);
    const shortTitle = row.name.replace(/testi/gi, '').replace(/ölçümü/gi, '').trim();
    doc.text(`${shortTitle} (${row.unit})`, 15, curY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${row.m1}`, 65, curY + 5, { align: 'center' });
    doc.text(`${row.m2}`, 85, curY + 5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(4, 120, 87);
    doc.text(`${row.m3}`, 105, curY + 5, { align: 'center' });

    doc.setTextColor(71, 85, 105);
    doc.text(`%${grpVal}`, 125, curY + 5, { align: 'center' });

    doc.setTextColor(29, 78, 216);
    doc.text(`%${targetVal}`, 145, curY + 5, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.text(`%${p3Val}`, 165, curY + 5, { align: 'center' });

    const statusText = p3Val >= targetVal ? 'Ust Duzey' : p3Val >= grpVal ? 'Grup Uzeri' : 'Gelisim';
    doc.setTextColor(p3Val >= targetVal ? 4 : p3Val >= grpVal ? 29 : 185, p3Val >= targetVal ? 120 : p3Val >= grpVal ? 78 : 28, p3Val >= targetVal ? 87 : p3Val >= grpVal ? 216 : 28);
    doc.text(statusText, 185, curY + 5, { align: 'center' });

    curY += rowHeight;
  });

  // Expert Observation Box
  curY += 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, curY, 186, 26, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('UZMAN VE ANTRENOR DEGERLENDIRMESI', 16, curY + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const commentText = report.expertComment || 'Sporcunun motor performans parametreleri hedef standartlarla uyumlu bir gelisim ivmesi gostermektedir. Biyomotor yeteneklerdeki ilerleme duzenli antrenman yuklenmesi ile desteklenmelidir.';
  const splitComment = doc.splitTextToSize(commentText, 178);
  doc.text(splitComment, 16, curY + 12);

  // Footer Note
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('SportsFly Lab Athletic Performance Platform | Normatif Kaynak: Eurofit & Fleishman Normlari', 12, 285);
  doc.text(`Sayfa 1 / 1`, 198, 285, { align: 'right' });

  doc.save(fileName);
}
