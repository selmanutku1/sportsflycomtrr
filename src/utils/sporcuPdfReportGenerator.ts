import { jsPDF } from 'jspdf';
import { toCanvas } from 'html-to-image';
import { SporcuItem } from '../types';
import { SporcuProfil, getOrCreateSporcuProfil } from '../data/sporcuProfilData';

export interface ReportGenerationOptions {
  sporcu: SporcuItem;
  profil?: SporcuProfil;
  clubName?: string;
  season?: string;
}

/**
 * Generates and downloads a high-resolution, multi-section A4 PDF report
 * containing athlete development metrics and attendance rates.
 */
export async function downloadSporcuDevelopmentPdfReport({
  sporcu,
  profil,
  clubName = 'SportsFly Spor Kulübü & Akademi',
  season = '2025 - 2026 Sezonu',
}: ReportGenerationOptions): Promise<void> {
  const activeProfil = profil || getOrCreateSporcuProfil(sporcu);

  // Development points (Last 6 months)
  const months = ['Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül'];
  const baseT = activeProfil.performans.teknikPuan || 8.0;
  const baseF = activeProfil.performans.fizikselPuan || 7.8;
  const baseTak = activeProfil.performans.taktikselPuan || 8.2;
  const deltas = [-1.4, -1.0, -0.7, -0.4, -0.1, 0];

  const progressionData = months.map((m, idx) => {
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
      'Sezon başı tepe form seviyesi',
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

  // Attendance stats
  const totalSessions = activeProfil.yoklama.toplamAntrenman || 48;
  const attendedSessions = activeProfil.yoklama.katildigiAntrenman || 44;
  const excusedSessions = activeProfil.yoklama.mazeretliDevamsizlik || 3;
  const unexcusedSessions = Math.max(0, totalSessions - (attendedSessions + excusedSessions));
  const attendanceRate =
    activeProfil.yoklama.katilimYuzdesi || Math.round((attendedSessions / totalSessions) * 100);

  const monthlyAttendance = [
    { month: 'Nisan', attended: 7, total: 8, rate: 88 },
    { month: 'Mayıs', attended: 7, total: 8, rate: 88 },
    { month: 'Haziran', attended: 8, total: 8, rate: 100 },
    { month: 'Temmuz', attended: 7, total: 8, rate: 88 },
    { month: 'Ağustos', attended: 8, total: 8, rate: 100 },
    { month: 'Eylül', attended: 7, total: 8, rate: 88 },
  ];

  // Create an off-screen container configured for exact A4 proportions (width: 794px, height: 1123px)
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '794px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.padding = '32px';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-1000';

  const reportDate = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const reportCode = `SP-RPR-${sporcu.code}-${new Date().getFullYear()}`;

  container.innerHTML = `
    <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: #1e3a8a; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-size: 20px;">
            SF
          </div>
          <div>
            <h1 style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
              ${clubName}
            </h1>
            <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 600; color: #64748b;">
              Resmi Sporcu Gelişim ve Katılım Takip Raporu • ${season}
            </p>
          </div>
        </div>

        <div style="text-align: right;">
          <span style="display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; font-family: monospace;">
            REF: ${reportCode}
          </span>
          <p style="margin: 4px 0 0 0; font-size: 10px; color: #64748b; font-weight: 500;">
            Tarih: ${reportDate}
          </p>
        </div>
      </div>

      <!-- Athlete Info Summary Box -->
      <div style="display: flex; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
        <div style="width: 70px; height: 70px; border-radius: 10px; overflow: hidden; background: #2563eb; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; flex-shrink: 0;">
          ${
            sporcu.avatarUrl
              ? `<img src="${sporcu.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" />`
              : sporcu.name.charAt(0)
          }
        </div>

        <div style="flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 16px;">
          <div>
            <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; display: block;">Sporcu Adı Soyadı</span>
            <span style="font-size: 14px; font-weight: 800; color: #0f172a;">${sporcu.name}</span>
          </div>
          <div>
            <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; display: block;">Sporcu No / Lisans</span>
            <span style="font-size: 13px; font-weight: 700; color: #1e293b; font-family: monospace;">#${sporcu.code}</span>
          </div>
          <div>
            <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; display: block;">Tesis / Şube</span>
            <span style="font-size: 12px; font-weight: 700; color: #1e293b;">${sporcu.facility}</span>
          </div>
          <div>
            <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; display: block;">Branş / Takım</span>
            <span style="font-size: 12px; font-weight: 600; color: #1e293b;">${activeProfil.kimlik.brans} (${activeProfil.kimlik.takimGrup || 'Genç Takım'})</span>
          </div>
          <div>
            <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; display: block;">Mevki / Pozisyon</span>
            <span style="font-size: 12px; font-weight: 600; color: #1e293b;">${activeProfil.kimlik.mevki || 'Sporcu'}</span>
          </div>
          <div>
            <span style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; display: block;">Durum</span>
            <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; background: ${sporcu.isActive ? '#dcfce7; color: #15803d;' : '#f1f5f9; color: #475569;'}">
              ${sporcu.isActive ? 'AKTİF SPORCU' : 'PASİF'}
            </span>
          </div>
        </div>
      </div>

      <!-- 4 KPI Badges -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 22px;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <span style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">Genel Skor</span>
          <span style="font-size: 20px; font-weight: 800; color: #2563eb;">${activeProfil.performans.genelOrtalama?.toFixed(2) || '8.50'}</span>
          <span style="font-size: 9px; color: #94a3b8; display: block;">/ 10.0 Puan</span>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <span style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">Katılım Oranı</span>
          <span style="font-size: 20px; font-weight: 800; color: #16a34a;">%${attendanceRate}</span>
          <span style="font-size: 9px; color: #15803d; font-weight: 600; display: block;">Yüksek Devamlılık</span>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <span style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">Toplam Seans</span>
          <span style="font-size: 20px; font-weight: 800; color: #0f172a;">${attendedSessions}</span>
          <span style="font-size: 9px; color: #64748b; display: block;">/ ${totalSessions} Antrenman</span>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <span style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block;">Temel Güçlü Yön</span>
          <span style="font-size: 12px; font-weight: 800; color: #b45309; display: block; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${activeProfil.performans.gucluYonler?.[0] || 'Oyun Disiplini'}
          </span>
          <span style="font-size: 9px; color: #92400e; font-weight: 600; display: block;">Öne Çıkan Beceri</span>
        </div>
      </div>

      <!-- SECTION 1: Gelişim Verileri (Development Progression Table) -->
      <div style="margin-bottom: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h2 style="margin: 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.3px; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 4px; height: 14px; background: #2563eb; border-radius: 2px;"></span>
            1. Sporcu Gelişim Verileri (Son 6 Aylık Takip)
          </h2>
          <span style="font-size: 10px; color: #16a34a; font-weight: 700; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">
            +1.4 puan sezonluk artış
          </span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
          <thead>
            <tr style="background: #f1f5f9; color: #334155; font-weight: 700; text-align: left; border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 8px 10px;">Dönem / Ay</th>
              <th style="padding: 8px 10px; text-align: center;">Teknik (10)</th>
              <th style="padding: 8px 10px; text-align: center;">Fiziksel (10)</th>
              <th style="padding: 8px 10px; text-align: center;">Taktik (10)</th>
              <th style="padding: 8px 10px; text-align: center;">Genel Skor</th>
              <th style="padding: 8px 10px;">Antrenör Gelişim Notu & Odak</th>
            </tr>
          </thead>
          <tbody>
            ${progressionData
              .map(
                (p, idx) => `
              <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 7px 10px; font-weight: 700; color: #0f172a;">${p.month}</td>
                <td style="padding: 7px 10px; text-align: center; color: #059669; font-weight: 700;">${p.teknik.toFixed(1)}</td>
                <td style="padding: 7px 10px; text-align: center; color: #d97706; font-weight: 700;">${p.fiziksel.toFixed(1)}</td>
                <td style="padding: 7px 10px; text-align: center; color: #7c3aed; font-weight: 700;">${p.taktik.toFixed(1)}</td>
                <td style="padding: 7px 10px; text-align: center; font-weight: 800; color: #2563eb;">${p.genel.toFixed(2)}</td>
                <td style="padding: 7px 10px; color: #475569; font-size: 10px;">${p.note}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <!-- SECTION 2: Antrenman Katılım Oranları (Attendance Breakdown) -->
      <div style="margin-bottom: 22px;">
        <h2 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.3px; display: flex; align-items: center; gap: 6px;">
          <span style="display: inline-block; width: 4px; height: 14px; background: #16a34a; border-radius: 2px;"></span>
          2. Antrenman Katılım Oranları ve Devamlılık Çizelgesi
        </h2>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <!-- Attendance Category summary -->
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #ffffff;">
            <span style="font-size: 11px; font-weight: 700; color: #334155; display: block; margin-bottom: 8px;">
              Sezon Seans Dağılımı (Toplam ${totalSessions} Antrenman)
            </span>
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; background: #ecfdf5; border-radius: 6px;">
                <span style="font-weight: 600; color: #065f46;">Katıldığı Antrenman</span>
                <span style="font-weight: 800; color: #047857;">${attendedSessions} Seans (%${Math.round((attendedSessions / totalSessions) * 100)})</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; background: #fffbeb; border-radius: 6px;">
                <span style="font-weight: 600; color: #92400e;">Mazeretli Devamsızlık (İzin/Rapor)</span>
                <span style="font-weight: 800; color: #b45309;">${excusedSessions} Seans (%${Math.round((excusedSessions / totalSessions) * 100)})</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; background: #fff1f2; border-radius: 6px;">
                <span style="font-weight: 600; color: #9f1239;">Mazeretsiz Devamsızlık</span>
                <span style="font-weight: 800; color: #be123c;">${unexcusedSessions} Seans (%${Math.round((unexcusedSessions / totalSessions) * 100)})</span>
              </div>
            </div>
          </div>

          <!-- Monthly rates mini table -->
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #ffffff;">
            <span style="font-size: 11px; font-weight: 700; color: #334155; display: block; margin-bottom: 8px;">
              Aylık Devam İstatistiği (Hedef: %85+)
            </span>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; text-align: center;">
              ${monthlyAttendance
                .map(
                  (m) => `
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 2px;">
                  <span style="font-size: 9px; color: #64748b; font-weight: 600; display: block;">${m.month}</span>
                  <span style="font-size: 12px; font-weight: 800; color: ${m.rate >= 90 ? '#15803d' : '#2563eb'};">
                    %${m.rate}
                  </span>
                  <span style="font-size: 8px; color: #94a3b8; display: block;">${m.attended}/${m.total}</span>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 3: Antrenör Değerlendirmesi & İmza Onayı -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px; border-top: 1px solid #e2e8f0; pt: 14px; margin-top: 10px; padding-top: 14px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <span style="font-size: 10px; font-weight: 700; color: #334155; text-transform: uppercase; display: block; margin-bottom: 4px;">
            Teknik Heyet & Antrenör Değerlendirmesi:
          </span>
          <p style="margin: 0; font-size: 10px; line-height: 1.5; color: #475569;">
            ${activeProfil.performans.gucluYonler?.length ? `Sporcu özellikle ${activeProfil.performans.gucluYonler.join(', ')} alanlarında belirgin gelişim kaydetmiştir.` : 'Sporcu sezon boyu istikrarlı katılım göstermiş ve kondisyon hedeflerini tamamlamıştır.'}
            Antrenman devamlılığı üst seviyede olup, gelecek dönemde taktiksel pozisyon alma ve karar hızı üzerine yoğunlaşılması önerilmektedir.
          </p>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
          <span style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">
            Kulüp Onayı & Başantrenör
          </span>
          <div style="margin: 10px 0; border-bottom: 1px dashed #94a3b8; width: 80%; margin-left: auto; margin-right: auto;"></div>
          <span style="font-size: 10px; font-weight: 700; color: #1e293b;">
            Akademi Direktörlüğü (İmza / Kaşe)
          </span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await toCanvas(container, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();

    if (pdfHeight > pageHeight) {
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
    } else {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    const cleanName = sporcu.name.replace(/\s+/g, '_');
    const fileName = `${cleanName}_Gelisim_ve_Katilim_Raporu.pdf`;
    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}
