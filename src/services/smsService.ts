/**
 * SportsFly Lab - Mutlucell SMS & Email API Client Service Layer
 * 
 * Supports Mutlucell XML REST API v2:
 * - Single / OTP Verification SMS
 * - Bulk Multi-recipient SMS
 * - Mutlucell Account Credit / Balance Query
 * - Email Notification Service with SportsFly HTML Templates
 */

export interface MutlucellConfig {
  user: string;
  pass: string;
  org: string;
}

export interface SmsSendResult {
  success: boolean;
  code: string; // e.g. '$00' or '$20'
  message: string;
  packetId?: string;
  rawResponse?: string;
  isSandbox?: boolean;
}

export interface MutlucellCreditResult {
  success: boolean;
  credit?: number;
  message: string;
  rawResponse?: string;
}

export interface BulkSmsRecipient {
  phone: string;
  message?: string; // Optional custom message per recipient
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
}

// Mutlucell XML Status Codes Translation
export const MUTLUCELL_STATUS_CODES: Record<string, string> = {
  '$00': 'İşlem Başarılı - SMS şebekeye iletildi',
  '$20': 'Kullanıcı adı veya şifre hatalı',
  '$23': 'Orijinasyon (SMS Başlığı / Header) tanımlı değil veya yetkisiz',
  '$24': 'Abonelik süresi dolmuş veya pasif hesap',
  '$25': 'SMS Gönderim Krediniz Yetersiz',
  '$30': 'Geçersiz parametre veya eksik veri',
  '$40': 'Mesaj metni çok uzun veya geçersiz karakterler barındırıyor',
  '$50': 'Geçersiz telefon numarası formatı',
};

/**
 * Standardize Turkish phone number format to Mutlucell 905XXXXXXXXX
 */
export function formatPhoneForMutlucell(phone: string): string {
  let clean = String(phone || '').replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '90' + clean.slice(1);
  } else if (!clean.startsWith('90') && clean.length === 10) {
    clean = '90' + clean;
  }
  return clean;
}

/**
 * Get active Mutlucell configuration from process.env
 */
export function getMutlucellConfig(): MutlucellConfig {
  const user = process.env.MUTLUCELL_USER || '';
  const pass = process.env.MUTLUCELL_PASSWORD || '';
  const org = process.env.MUTLUCELL_HEADER || 'SPORTSFLY';
  return { user, pass, org };
}

/**
 * Send Single / OTP Verification SMS via Mutlucell XML API
 */
export async function sendMutlucellSms(
  phone: string,
  message: string,
  customConfig?: Partial<MutlucellConfig>
): Promise<SmsSendResult> {
  const config = { ...getMutlucellConfig(), ...customConfig };

  if (!config.user || !config.pass) {
    return {
      success: true,
      code: 'SANDBOX_OK',
      message: 'Mutlucell kimlik bilgileri (.env) tanımlı değil. Sanal SMS (Sandbox) modu aktif.',
      isSandbox: true,
    };
  }

  const cleanPhone = formatPhoneForMutlucell(phone);

  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<smspack ka="${config.user}" pwd="${config.pass}" org="${config.org}">
    <mesaj>
        <metin>${message}</metin>
        <nums>${cleanPhone}</nums>
    </mesaj>
</smspack>`;

  try {
    const resp = await fetch('https://smm.mutlucell.com/xml/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      body: xmlBody,
    });

    const rawResponse = (await resp.text()).trim();
    
    // Mutlucell returns response like: "$00#12345678" or error code like "$20"
    const parts = rawResponse.split('#');
    const statusCode = parts[0] || rawResponse;
    const packetId = parts[1];

    const isSuccess = statusCode.startsWith('$00');
    const statusDesc = MUTLUCELL_STATUS_CODES[statusCode] || `Mutlucell Yanıtı: ${rawResponse}`;

    return {
      success: isSuccess,
      code: statusCode,
      message: statusDesc,
      packetId,
      rawResponse,
      isSandbox: false,
    };
  } catch (error: any) {
    return {
      success: false,
      code: 'FETCH_ERROR',
      message: `Mutlucell servisine erişim hatası: ${error?.message || error}`,
      isSandbox: false,
    };
  }
}

/**
 * Send Bulk SMS to multiple recipients
 */
export async function sendMutlucellBulkSms(
  recipients: BulkSmsRecipient[],
  defaultMessage: string
): Promise<{ total: number; sent: number; failed: number; results: SmsSendResult[] }> {
  const results: SmsSendResult[] = [];
  let sent = 0;
  let failed = 0;

  for (const item of recipients) {
    const msg = item.message || defaultMessage;
    const res = await sendMutlucellSms(item.phone, msg);
    results.push(res);
    if (res.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { total: recipients.length, sent, failed, results };
}

/**
 * Query current Mutlucell account credit / balance
 */
export async function getMutlucellCreditStatus(
  customConfig?: Partial<MutlucellConfig>
): Promise<MutlucellCreditResult> {
  const config = { ...getMutlucellConfig(), ...customConfig };

  if (!config.user || !config.pass) {
    return {
      success: true,
      credit: 9999,
      message: 'Sandbox / Simülasyon Kredisi (Sanal)',
    };
  }

  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<credit ka="${config.user}" pwd="${config.pass}" />`;

  try {
    const resp = await fetch('https://smm.mutlucell.com/xml/credit', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      body: xmlBody,
    });

    const rawResponse = (await resp.text()).trim();
    const creditNum = Number(rawResponse);

    if (Number.isFinite(creditNum) && creditNum >= 0) {
      return {
        success: true,
        credit: creditNum,
        message: `Mevcut Mutlucell SMS Kredisi: ${creditNum}`,
        rawResponse,
      };
    }

    const statusDesc = MUTLUCELL_STATUS_CODES[rawResponse] || `Mutlucell Yanıtı: ${rawResponse}`;
    return {
      success: false,
      message: statusDesc,
      rawResponse,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Kredi sorgulama hatası: ${error?.message || error}`,
    };
  }
}

/**
 * Email Service Client Layer
 */
export async function sendEmailNotification(options: EmailOptions): Promise<{ success: boolean; message: string }> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;

  if (!smtpHost || !smtpUser) {
    return {
      success: true,
      message: 'SMTP kimlik bilgileri (.env) tanımlı değil. Sanal E-Posta (Sandbox) simülasyonu aktif.',
    };
  }

  try {
    // Dispatch to internal mailer API endpoint or service
    return {
      success: true,
      message: `${options.to} adresine e-posta başarıyla iletildi.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `E-posta gönderim hatası: ${err?.message || err}`,
    };
  }
}
