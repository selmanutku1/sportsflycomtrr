/**
 * Güvenli Tarayıcı Depolama (localStorage / sessionStorage) Yardımcıları
 * Bozuk JSON verileri, kota aşımı (QuotaExceededError) veya gizli sekme kısıtlamalarında
 * uygulamanın çökmesini engeller ve güvenli varsayılan değer (fallback) döndürür.
 */

const EPHEMERAL_CACHE_KEYS = [
  'sportsfly_demo_requests_v1',
  'sportsfly_demo_requests_v2',
  'sportsfly_club_applications_v1',
  'sportsfly_club_applications_v2',
];

export function safeGetStorageItem<T>(
  key: string,
  fallback: T,
  storageType: 'local' | 'session' = 'local',
  validator?: (val: unknown) => boolean
): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const storage = storageType === 'local' ? window.localStorage : window.sessionStorage;
    const raw = storage.getItem(key);
    if (raw === null || raw === undefined || raw === '') {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    if (validator && !validator(parsed)) {
      return fallback;
    }
    return parsed as T;
  } catch (err) {
    console.warn(`[SafeStorage] "${key}" okunurken bozuk veri tespit edildi, varsayılan değere dönülüyor.`);
    try {
      const storage = storageType === 'local' ? window.localStorage : window.sessionStorage;
      storage.removeItem(key);
    } catch (_) {}
    return fallback;
  }
}

export function safeSetStorageItem<T>(
  key: string,
  value: T,
  storageType: 'local' | 'session' = 'local'
): boolean {
  if (typeof window === 'undefined') return false;
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  const storage = storageType === 'local' ? window.localStorage : window.sessionStorage;

  try {
    storage.setItem(key, serialized);
    return true;
  } catch (err: any) {
    // Kota aşımı durumunda eski/geçici anahtarları temizleyip tekrar dene
    if (
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22
    ) {
      try {
        EPHEMERAL_CACHE_KEYS.forEach((oldKey) => {
          try {
            window.localStorage.removeItem(oldKey);
          } catch (_) {}
        });
        storage.setItem(key, serialized);
        return true;
      } catch (_) {
        return false;
      }
    }
    return false;
  }
}

/**
 * Uygulama açılışında bozuk JSON içeren localStorage kayıtlarını tarar ve temizler.
 */
export function sanitizeCorruptedStorageOnBoot(): void {
  if (typeof window === 'undefined') return;
  try {
    // Eski sürüm önbellek anahtarlarını temizle
    EPHEMERAL_CACHE_KEYS.forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch (_) {}
    });

    // JSON formatında olması gereken sportsfly_ anahtarlarını doğrula
    const keysToInspect: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith('sportsfly_')) {
        keysToInspect.push(k);
      }
    }

    keysToInspect.forEach((key) => {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return;
        const trimmed = raw.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          JSON.parse(trimmed);
        }
      } catch (_) {
        console.warn(`[SafeStorage] Bozuk önbellek anahtarı temizlendi: ${key}`);
        try {
          window.localStorage.removeItem(key);
        } catch (__) {}
      }
    });
  } catch (_) {}
}
