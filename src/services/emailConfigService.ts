import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  providerPreset: 'custom' | 'gmail' | 'yandex' | 'outlook' | 'brevo' | 'sportsfly_corporate';
  sandboxMode: boolean;
  updatedAt?: string;
}

export interface EmailLogEntry {
  id: string;
  timestamp: string;
  to: string;
  from: string;
  subject: string;
  type: 'verification' | 'welcome' | 'approval' | 'password_reset' | 'test';
  status: 'sent' | 'simulated' | 'failed';
  messageId?: string;
  error?: string;
  codeSnippet?: string;
}

export interface EmailTestResult {
  success: boolean;
  message: string;
  messageId?: string;
  sampleCode?: string;
  transportLogs?: string[];
  isSandbox?: boolean;
}

const STORAGE_KEY = 'sportsfly_smtp_config_v1';
const LOGS_STORAGE_KEY = 'sportsfly_email_logs_v1';

export const PROVIDER_PRESETS: Record<
  SmtpConfig['providerPreset'],
  { name: string; host: string; port: number; secure: boolean; defaultFrom: string; guide: string }
> = {
  sportsfly_corporate: {
    name: 'SportsFly Kurumsal Mail Sunucusu (Önerilen)',
    host: 'mail.sportsfly.com.tr',
    port: 587,
    secure: false,
    defaultFrom: 'noreply@sportsfly.com.tr',
    guide: 'SportsFly resmi e-posta sunucusu üzerinden kurumsal kimlik doğrulamalı gönderim.',
  },
  gmail: {
    name: 'Google Workspace / Gmail (App Password)',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    defaultFrom: 'bildirim@sporokulu.com',
    guide: 'Google 2FA açıkken oluşturulan 16 haneli "Uygulama Şifresi" (App Password) ile bağlanır.',
  },
  yandex: {
    name: 'Yandex Kurumsal Mail (360)',
    host: 'smtp.yandex.com',
    port: 465,
    secure: true,
    defaultFrom: 'noreply@sporokulu.com',
    guide: 'Yandex Mail veya Yandex 360 için uygulama şifresi ile SSL 465 portu kullanılır.',
  },
  outlook: {
    name: 'Microsoft 365 / Outlook',
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    defaultFrom: 'info@sporokulu.com',
    guide: 'Microsoft Exchange / Office365 SMTP Relay protokolü üzerinden gönderim.',
  },
  brevo: {
    name: 'Brevo (Sendinblue) / Ücretsiz SMTP API',
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    defaultFrom: 'noreply@sportsfly.com.tr',
    guide: 'Günlük 300 adede kadar ücretsiz kurumsal e-posta gönderim desteği.',
  },
  custom: {
    name: 'Özel / Harici SMTP Sunucusu',
    host: 'smtp.alanadiniz.com',
    port: 587,
    secure: false,
    defaultFrom: 'noreply@sporokulu.com',
    guide: 'Hosting firmanızın veya özel e-posta sunucunuzun sağladığı SMTP bilgileri.',
  },
};

export const DEFAULT_SMTP_CONFIG: SmtpConfig = {
  host: 'mail.sportsfly.com.tr',
  port: 587,
  secure: false,
  user: 'noreply@sportsfly.com.tr',
  pass: '',
  fromName: 'SportsFly Doğrulama Servisi',
  fromEmail: 'noreply@sportsfly.com.tr',
  replyTo: 'destek@sportsfly.com.tr',
  providerPreset: 'sportsfly_corporate',
  sandboxMode: true,
  updatedAt: new Date().toISOString(),
};

/**
 * Get stored SMTP configuration
 */
export function getStoredSmtpConfig(): SmtpConfig {
  if (typeof window === 'undefined') return DEFAULT_SMTP_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SMTP_CONFIG, ...parsed };
    }
  } catch {}
  return DEFAULT_SMTP_CONFIG;
}

/**
 * Save SMTP configuration to local storage and sync with Firestore
 */
export async function saveSmtpConfig(config: SmtpConfig): Promise<void> {
  const updated: SmtpConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  // 1. Persist to Firestore system_settings/email_config
  try {
    const docRef = doc(db, 'system_settings', 'email_config');
    await setDoc(
      docRef,
      {
        ...updated,
        // Keep pass masked in firestore if empty to prevent overwriting with blank
        hasPassword: Boolean(updated.pass && updated.pass.trim().length > 0),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[EmailConfig] Firestore save warning:', err);
  }

  // 2. Sync to Node.js backend server memory
  try {
    await fetch('/api/email/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  } catch {}
}

/**
 * Fetch remote SMTP config from Firestore / Backend
 */
export async function fetchSmtpConfigFromFirestore(): Promise<SmtpConfig> {
  try {
    const docRef = doc(db, 'system_settings', 'email_config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const local = getStoredSmtpConfig();
      const merged: SmtpConfig = {
        ...local,
        host: data.host || local.host,
        port: Number(data.port) || local.port,
        secure: Boolean(data.secure),
        user: data.user || local.user,
        fromName: data.fromName || local.fromName,
        fromEmail: data.fromEmail || local.fromEmail,
        replyTo: data.replyTo || local.replyTo,
        providerPreset: data.providerPreset || local.providerPreset,
        sandboxMode: data.sandboxMode !== undefined ? Boolean(data.sandboxMode) : local.sandboxMode,
        updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : local.updatedAt,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    }
  } catch (err) {
    console.warn('[EmailConfig] fetch from Firestore error:', err);
  }
  return getStoredSmtpConfig();
}

/**
 * Send a Test Email via backend SMTP
 */
export async function sendTestEmail(targetEmail: string, customConfig?: SmtpConfig): Promise<EmailTestResult> {
  const currentConfig = customConfig || getStoredSmtpConfig();
  try {
    const res = await fetch('/api/email/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: targetEmail,
        config: currentConfig,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: data.error || data.message || 'SMTP test e-postası gönderilemedi.',
        transportLogs: data.logs || [],
      };
    }

    // Add to email logs
    addEmailLog({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      to: targetEmail,
      from: `${currentConfig.fromName} <${currentConfig.fromEmail}>`,
      subject: `SportsFly E-Posta Servis Testi — Örnek Doğrulama Kodu: ${data.sampleCode || '582914'}`,
      type: 'test',
      status: data.isSandbox ? 'simulated' : 'sent',
      messageId: data.messageId,
      codeSnippet: data.sampleCode,
    });

    return {
      success: true,
      message: data.message || 'Test e-postası başarıyla iletildi.',
      messageId: data.messageId,
      sampleCode: data.sampleCode,
      transportLogs: data.logs,
      isSandbox: data.isSandbox,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Bağlantı hatası: ${err?.message || err}`,
    };
  }
}

/**
 * Get stored email logs
 */
export function getStoredEmailLogs(): EmailLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Add a new log entry
 */
export function addEmailLog(entry: EmailLogEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const logs = getStoredEmailLogs();
    const updated = [entry, ...logs].slice(0, 50); // keep last 50
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}
