import { SporcuKarne } from './mockKarneData';

export type NotificationChannel = 'whatsapp' | 'sms';

export interface VeliBildirimLog {
  id: string;
  karneId: string;
  sporcuAdSoyad: string;
  veliAdSoyad: string;
  telefon: string;
  kanal: NotificationChannel;
  tarih: string; // ISO string or readable formatted string
  mesaj: string;
  durum: 'İletildi' | 'WhatsApp Açıldı' | 'SMS Gönderildi' | 'Hata';
  smsBaslik?: string;
  raporKodu?: string;
}

export type SmsSaglayici = 
  | 'sportsfly_cloud'
  | 'netgsm'
  | 'iletimerkezi'
  | 'mutlucell'
  | 'vatansms'
  | 'twilio';

export interface SmsAyarConfig {
  baslik: string; // Max 11 characters alphanumeric originator e.g. SPORTSFLY
  saglayici: SmsSaglayici;
  apiKullanici: string;
  apiSifre: string;
  bakiyeKredi: number;
  aktifDurum: boolean;
  otomatikVeliBildirimi: boolean;
  varsayilanGonderimYontemi: 'cihaz' | 'api';
}

export const DEFAULT_SMS_CONFIG: SmsAyarConfig = {
  baslik: 'SPORTSFLY',
  saglayici: 'sportsfly_cloud',
  apiKullanici: 'kulup_yonetici_01',
  apiSifre: '••••••••••••',
  bakiyeKredi: 1420,
  aktifDurum: true,
  otomatikVeliBildirimi: true,
  varsayilanGonderimYontemi: 'api',
};

export const SMS_SAGLAYICI_LISTESI: { id: SmsSaglayici; ad: string; aciklama: string; ulke: string }[] = [
  { id: 'sportsfly_cloud', ad: 'SportsFly Bulut SMS Gateway', aciklama: 'Kurumsal entegre hızlı SMS servisi (Önerilen)', ulke: 'TR' },
  { id: 'netgsm', ad: 'Netgsm', aciklama: 'Türkiye resmi SMS başlığı ve API desteği', ulke: 'TR' },
  { id: 'iletimerkezi', ad: 'İletiMerkezi', aciklama: 'Toplu SMS ve OTP altyapısı', ulke: 'TR' },
  { id: 'mutlucell', ad: 'Mutlucell', aciklama: 'Kurumsal SMS ve başlık yönetimi', ulke: 'TR' },
  { id: 'vatansms', ad: 'Vatan SMS', aciklama: 'Yerli SMS çözümü', ulke: 'TR' },
  { id: 'twilio', ad: 'Twilio Programmable SMS', aciklama: 'Global SMS gönderim altyapısı', ulke: 'Global' },
];

export interface MessageTemplate {
  id: string;
  baslik: string;
  aciklama: string;
  sablon: string;
}

export const WHATSAPP_SABLONLARI: MessageTemplate[] = [
  {
    id: 'wa_standart',
    baslik: 'Standart Karne Bildirimi',
    aciklama: 'Resmi ve detaylı dönem karnesi bilgilendirme metni',
    sablon: `Sayın {veli_adi},

Sporcumuz *{sporcu_adi}* için hazırlanan *{donem}* gelişim karnesi tamamlanmıştır.

📋 *Karne Özeti:*
• Genel Karne Notu: *{genel_not} / 10*
• Branş & Yaş Grubu: {brans} ({yas_grubu})
• Antrenman Katılımı: %{katilim} ({antrenman_sayisi} Antrenman)
• Antrenör: {antrenor}

💬 *Antrenör Notu:*
"{antrenor_notu}"

{gelisim_alanlari_bolumu}

Detaylı sporcu karnesi PDF belgesi ektedir. Sporcumuza gösterdiğiniz destek için teşekkür eder, başarılarının devamını dileriz. 🏅

*SportsFly Spor Kulübü*`,
  },
  {
    id: 'wa_tebrik',
    baslik: 'Tebrik & Üstün Başarı',
    aciklama: 'Yüksek motivasyon ve takdir odaklı veli mesajı',
    sablon: `Tebrikler Sayın {veli_adi}! 🌟

Sporcumuz *{sporcu_adi}*, bu dönem antrenmanlardaki azmi, yüksek disiplini ve *{genel_not} / 10* karne başarısıyla teknik ekibimizin takdirini kazandı.

🎯 *Öne Çıkan Gelişim:*
• Katılım Oranı: %{katilim}
• Antrenör Değerlendirmesi: "{antrenor_notu}"

Sporcumuzun spora olan sevgisini ve özverisini gönülden tebrik eder, kulübümüz adına teşekkür ederiz. Karne detayları PDF olarak hazırlanmıştır. 🏆

*SportsFly Spor Akademisi*`,
  },
  {
    id: 'wa_detayli',
    baslik: 'Kategori Bazlı Detaylı Rapor',
    aciklama: 'Teknik, fiziksel, taktik ve zihinsel puan kırılımları',
    sablon: `Sayın {veli_adi},

*{sporcu_adi}* sporcumuzun teknik heyetimiz tarafından hazırlanan detaylı performans karnesi verileri:

📊 *Performans Kırılımı (10 Üzerinden):*
• 🎯 Teknik Yetenek: *{teknik_not}/10*
•  Fiziksel Kapasite: *{fiziksel_not}/10*
• 🧠 Taktik & Oyun Görüşü: *{taktik_not}/10*
• 🛡️ Zihinsel & Karakter: *{zihinsel_not}/10*
• ⭐ Genel Ortalama: *{genel_not}/10*

Antrenör Görüşü: "{antrenor_notu}"

Detaylı karne grafikleri ve gelişim adımları PDF dosyasında mevcuttur. 📋

*SportsFly Spor Kulübü*`,
  },
  {
    id: 'wa_ozet',
    baslik: 'Kısa & Samimi Hatırlatma',
    aciklama: 'Hızlıca göz atmaya uygun özet mesaj',
    sablon: `Merhaba {veli_adi},

*{sporcu_adi}* sporcumuzun {donem} karnesi sisteme yüklendi. Genel notu *{genel_not} / 10* ve katılımı *%{katilim}*.

Antrenör Notu: "{antrenor_notu}"

Detaylı karne PDF dosyasını inceleyebilirsiniz. İyi günler dileriz! 🏀⚽`,
  },
];

export const SMS_SABLONLARI: MessageTemplate[] = [
  {
    id: 'sms_standart',
    baslik: 'Standart SMS Bildirimi (1 Boyut)',
    aciklama: 'Kısa ve net 160 karaktere optimize SMS metni',
    sablon: `Sn. {veli_adi}, sporcumuz {sporcu_adi} donem karnesi hazirlandi. Karne Notu: {genel_not}/10. Katilim: %{katilim}. Antrenor: {antrenor}. Detaylar PDF karnede. B002`,
  },
  {
    id: 'sms_linkli',
    baslik: 'Online Karne Linkli SMS',
    aciklama: 'Velinin portala tek tıkla girmesini sağlayan bağlantı',
    sablon: `Sn. {veli_adi}, {sporcu_adi} gelisim karnesi notu: {genel_not}/10. Antrenor degerlendirmesini ve PDF karnenizi goruntulemek icin: https://sportsfly.app/k/{sporcu_id}`,
  },
  {
    id: 'sms_tebrik',
    baslik: 'Tebrik & Başarı SMS',
    aciklama: 'Tebrik içerikli kısa kulüp SMS bildirimi',
    sablon: `Tebrikler! Sn. {veli_adi}, sporcumuz {sporcu_adi} donemi {genel_not}/10 karne basarisi ve %{katilim} katilimla tamamlamistir. SportsFly Spor Kulubu`,
  },
];

// Helper functions for storage and message formatting
const SMS_CONFIG_STORAGE_KEY = 'sportsfly_sms_config_v1';
const BILDIRIM_LOGS_STORAGE_KEY = 'sportsfly_veli_bildirim_logs_v1';

export function getStoredSmsConfig(): SmsAyarConfig {
  if (typeof window === 'undefined') return DEFAULT_SMS_CONFIG;
  try {
    const raw = localStorage.getItem(SMS_CONFIG_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SMS_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error reading SMS config from storage', e);
  }
  return DEFAULT_SMS_CONFIG;
}

export function saveStoredSmsConfig(cfg: SmsAyarConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SMS_CONFIG_STORAGE_KEY, JSON.stringify(cfg));
    window.dispatchEvent(new CustomEvent('sportsfly_sms_config_updated', { detail: cfg }));
  } catch (e) {
    console.error('Error saving SMS config to storage', e);
  }
}

export const INITIAL_BILDIRIM_LOGS: VeliBildirimLog[] = [
  {
    id: 'log-1',
    karneId: 'k1',
    sporcuAdSoyad: 'Kaan Yıldırım',
    veliAdSoyad: 'Murat Yıldırım',
    telefon: '+90 532 456 78 90',
    kanal: 'whatsapp',
    tarih: '2026-09-15 14:30',
    mesaj: 'Sayın Murat Yıldırım, sporcumuz Kaan Yıldırım için gelişim karnesi hazırlanmıştır. Genel Karne Notu: 8.0 / 10...',
    durum: 'WhatsApp Açıldı',
  },
  {
    id: 'log-2',
    karneId: 'k2',
    sporcuAdSoyad: 'Emirhan Örnek',
    veliAdSoyad: 'Aysel Örnek',
    telefon: '+90 533 987 65 43',
    kanal: 'sms',
    tarih: '2026-09-14 11:15',
    mesaj: 'Sn. Aysel Örnek, sporcumuz Emirhan Örnek dönem karnesi hazırlandı. Karne Notu: 8.2/10. Katılım: %92. B002',
    durum: 'İletildi',
    smsBaslik: 'SPORTSFLY',
    raporKodu: 'SF-94812',
  },
];

export function getStoredBildirimLogs(): VeliBildirimLog[] {
  if (typeof window === 'undefined') return INITIAL_BILDIRIM_LOGS;
  try {
    const raw = localStorage.getItem(BILDIRIM_LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading bildirim logs from storage', e);
  }
  return INITIAL_BILDIRIM_LOGS;
}

export function saveStoredBildirimLogs(logs: VeliBildirimLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BILDIRIM_LOGS_STORAGE_KEY, JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('sportsfly_bildirim_logs_updated', { detail: logs }));
  } catch (e) {
    console.error('Error saving bildirim logs to storage', e);
  }
}

export function addBildirimLog(newLog: Omit<VeliBildirimLog, 'id' | 'tarih'>): VeliBildirimLog {
  const current = getStoredBildirimLogs();
  const dateStr = new Date().toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const created: VeliBildirimLog = {
    ...newLog,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    tarih: dateStr,
  };
  const updated = [created, ...current];
  saveStoredBildirimLogs(updated);
  return created;
}

export function cleanPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  // If starts with 0 and 11 digits (TR mobile e.g. 05321234567), change 0 to 90
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '9' + cleaned;
  } else if (cleaned.length === 10 && cleaned.startsWith('5')) {
    // 5321234567 -> 905321234567
    cleaned = '90' + cleaned;
  }
  return cleaned;
}

export function cleanPhoneForSms(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('90') && cleaned.length === 12) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '+9' + cleaned;
  }
  if (cleaned.length === 10 && cleaned.startsWith('5')) {
    return '+90' + cleaned;
  }
  return phone.trim();
}

export function formatTemplate(template: string, karne: SporcuKarne, veliOverride?: { adSoyad?: string; telefon?: string }): string {
  const veliAdi = veliOverride?.adSoyad || karne.veliAdSoyad || 'Değerli Velimiz';
  
  const genelNot = (
    (
      karne.teknik.ortalama +
      karne.fiziksel.ortalama +
      karne.taktiksel.ortalama +
      karne.zihinsel.ortalama +
      (karne.davranissal?.kriterler?.ortalama || 8)
    ) / 5
  ).toFixed(1);

  const donem = new Date(karne.tarih).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) + ' Değerlendirmesi';
  
  const gelisimAlanlari = (karne.gelisimAlanlari || []).join(', ');
  const gelisimBolumu = gelisimAlanlari ? `📌 *Öne Çıkan Gelişim Odakları:* ${gelisimAlanlari}` : '';

  return template
    .replace(/{sporcu_adi}/g, karne.adSoyad)
    .replace(/{sporcu_id}/g, karne.sporcuId || karne.id)
    .replace(/{veli_adi}/g, veliAdi)
    .replace(/{donem}/g, donem)
    .replace(/{brans}/g, karne.brans)
    .replace(/{yas_grubu}/g, karne.yasGubu || 'Altyapı')
    .replace(/{grup}/g, karne.grup)
    .replace(/{genel_not}/g, genelNot)
    .replace(/{teknik_not}/g, (karne.teknik.ortalama || 7.5).toFixed(1))
    .replace(/{fiziksel_not}/g, (karne.fiziksel.ortalama || 7.5).toFixed(1))
    .replace(/{taktik_not}/g, (karne.taktiksel.ortalama || 7.5).toFixed(1))
    .replace(/{zihinsel_not}/g, (karne.zihinsel.ortalama || 7.5).toFixed(1))
    .replace(/{katilim}/g, String(karne.katilimYuzdesi || 95))
    .replace(/{antrenman_sayisi}/g, String(karne.antrenmanSayisi || 24))
    .replace(/{antrenor}/g, karne.antrenor || 'Teknik Heyet')
    .replace(/{antrenor_notu}/g, karne.antrenorNotu || 'Sporcumuz antrenman sürecinde azimli ve gelişime açık bir tutum sergilemektedir.')
    .replace(/{gelisim_alanlari_bolumu}/g, gelisimBolumu);
}
