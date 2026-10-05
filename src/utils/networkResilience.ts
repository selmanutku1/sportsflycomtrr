/**
 * Ağ Dayanıklılığı (Timeout Korumalı Fetch & Tekrar Deneme Yardımcıları)
 * Asılı kalan isteklerin tarayıcıyı kilitlemesini ve çift tıklama (double-submit)
 * kaynaklı mükerrer işlemleri önler.
 */

export interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number;
}

export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeoutMs = 8000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}
