import fs from 'fs';
import path from 'path';

const TMP_FILE = path.join('/tmp', 'sportsfly-demo-requests.json');

const LEGACY_TEST_IDS = new Set([
  'demo_101',
  'demo_102',
  'demo_103',
  'req_101',
  'req_102',
  'req_103',
  'req_104',
  'req_105',
]);

function normalizeItem(raw = {}) {
  const fullName = String(
    raw.fullName ||
      raw.managerName ||
      raw.adSoyad ||
      raw.name ||
      raw.contactName ||
      raw.yetkiliAdi ||
      'Kulüp Yetkilisi'
  ).trim();

  const clubName = String(
    raw.clubName ||
      raw.kulupAdi ||
      raw.schoolName ||
      raw.sporOkuluAdi ||
      raw.organization ||
      'Spor Okulu'
  ).trim();

  const phone = String(raw.phone || raw.telefon || raw.tel || raw.gsm || '').trim();
  const email = String(raw.email || raw.eposta || raw.mail || 'Belirtilmedi').trim();
  const city = String(raw.city || raw.sehir || raw.il || 'İstanbul').trim();
  const district = String(raw.district || raw.ilce || 'Merkez').trim();

  let branches = ['Genel Branş'];
  const rawBranches = raw.branch || raw.branches || raw.branslar || raw.brans;
  if (Array.isArray(rawBranches) && rawBranches.length > 0) {
    branches = rawBranches.map((b) => String(b).trim()).filter(Boolean);
  } else if (typeof rawBranches === 'string' && rawBranches.trim()) {
    branches = rawBranches
      .split(/[,;/]+/)
      .map((b) => b.trim())
      .filter(Boolean);
  }
  const branch = branches.join(', ');

  const studentEstimate = String(
    raw.studentEstimate ?? raw.athleteCount ?? raw.sporcuSayisi ?? 'Belirtilmedi'
  ).trim();

  const selectedPlan = String(
    raw.selectedPlan || raw.plan || raw.paket || 'Kulüp & Akademi'
  ).trim();

  const nowFormatted = new Date()
    .toLocaleString('sv-SE', { timeZone: 'Europe/Istanbul' })
    .slice(0, 16);

  const submittedAt = String(raw.submittedAt || raw.createdAt || nowFormatted)
    .replace('T', ' ')
    .slice(0, 16);

  const rawType = String(raw.requestType || raw.type || '').toLowerCase();
  const requestType =
    rawType === 'spor_okulu_basvurusu' || rawType === 'kayit'
      ? 'spor_okulu_basvurusu'
      : 'demo_rezervasyonu';

  const source = String(raw.source || 'sportsfly.com.tr').trim();

  return {
    id: String(raw.id || `DEMO-${Date.now()}`),
    fullName,
    clubName,
    phone,
    email,
    branch,
    studentEstimate,
    selectedPlan,
    submittedAt,
    requestType,
    source,
    managerName: fullName,
    city,
    district,
    branches,
    athleteCount: studentEstimate,
    demoDate: raw.demoDate,
    demoTime: raw.demoTime,
    createdAt: submittedAt,
    status: raw.status || 'onay_bekliyor',
    notes:
      raw.notes ||
      'sportsfly.com.tr üzerinden demo / başvuru formu gönderildi.',
    rejectionReason: raw.rejectionReason,
    approvedAt: raw.approvedAt,
    smsSentAt: raw.smsSentAt,
  };
}

function loadStore() {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(TMP_FILE, 'utf-8'));
      if (Array.isArray(parsed)) {
        const cleaned = parsed
          .filter((item) => item && item.id && !LEGACY_TEST_IDS.has(String(item.id)))
          .map(normalizeItem);
        globalThis.__SPORTSFLY_DEMO_STORE__ = cleaned;
        return cleaned;
      }
    }
  } catch {
    // ignore read error
  }
  if (Array.isArray(globalThis.__SPORTSFLY_DEMO_STORE__)) {
    return globalThis.__SPORTSFLY_DEMO_STORE__;
  }
  globalThis.__SPORTSFLY_DEMO_STORE__ = [];
  return globalThis.__SPORTSFLY_DEMO_STORE__;
}

function saveStore(list) {
  const cleaned = (Array.isArray(list) ? list : [])
    .filter((item) => item && item.id && !LEGACY_TEST_IDS.has(String(item.id)))
    .map(normalizeItem);
  globalThis.__SPORTSFLY_DEMO_STORE__ = cleaned;
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(cleaned, null, 2), 'utf-8');
  } catch {
    // ignore write error
  }
  return cleaned;
}

function applyCors(req, res) {
  const origin = req.headers?.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept, Origin, Authorization, X-Webhook-Secret, X-API-Key, X-CSRF-Token, X-Requested-With'
  );
}

function extractIdFromReq(req, body = {}) {
  if (req.query?.id && req.query.id !== 'stream') {
    return String(req.query.id);
  }
  if (body?.id) {
    return String(body.id);
  }
  const urlPath = String(req.url || '').split('?')[0];
  const parts = urlPath.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  if (last && last !== 'demo-requests' && last !== 'demo-request' && last !== 'stream') {
    return decodeURIComponent(last);
  }
  return '';
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const store = loadStore();
  const urlPath = String(req.url || '').split('?')[0];
  const isStreamRequest =
    req.query?.stream === '1' ||
    req.query?.id === 'stream' ||
    urlPath.endsWith('/stream') ||
    String(req.headers?.accept || '').includes('text/event-stream');

  if (req.method === 'GET' && isStreamRequest) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const payload = JSON.stringify({
      action: 'init',
      items: store,
      timestamp: Date.now(),
    });

    res.write(`retry: 2000\n\nevent: sync\ndata: ${payload}\n\n`);
    return res.end();
  }

  if (req.method === 'GET') {
    const total = store.length;
    const pending = store.filter((r) => r.status === 'onay_bekliyor').length;
    const approved = store.filter((r) => r.status === 'onaylandi').length;
    const rejected = store.filter(
      (r) => r.status === 'reddedildi' || r.status === 'askida'
    ).length;

    return res.status(200).json({
      success: true,
      endpoint: '/api/demo-requests',
      counts: {
        total,
        pending,
        approved,
        rejected,
      },
      items: store,
      data: store,
    });
  }

  if (req.method === 'POST') {
    let rawBody = req.body || {};
    if (typeof rawBody === 'string') {
      try {
        rawBody = JSON.parse(rawBody);
      } catch {
        rawBody = {};
      }
    }
    const body =
      rawBody && typeof rawBody.data === 'object' && !Array.isArray(rawBody.data)
        ? { ...rawBody, ...rawBody.data }
        : rawBody && typeof rawBody.payload === 'object' && !Array.isArray(rawBody.payload)
        ? { ...rawBody, ...rawBody.payload }
        : rawBody;

    const newRecord = normalizeItem(body);
    const filtered = store.filter((item) => item.id !== newRecord.id);
    const updated = saveStore([newRecord, ...filtered]);

    return res.status(201).json({
      success: true,
      message: 'Demo talebi başarıyla kaydedildi ve Admin paneline aktarıldı.',
      data: newRecord,
      items: updated,
    });
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    let rawBody = req.body || {};
    if (typeof rawBody === 'string') {
      try {
        rawBody = JSON.parse(rawBody);
      } catch {
        rawBody = {};
      }
    }
    const targetId = extractIdFromReq(req, rawBody);
    const index = store.findIndex((item) => item.id === targetId);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Başvuru bulunamadı.',
      });
    }
    const nowStr = new Date()
      .toLocaleString('sv-SE', { timeZone: 'Europe/Istanbul' })
      .slice(0, 16);
    const updatedItem = {
      ...store[index],
      status: rawBody.status || store[index].status,
      rejectionReason:
        rawBody.rejectionReason !== undefined
          ? rawBody.rejectionReason
          : store[index].rejectionReason,
      notes: rawBody.notes !== undefined ? rawBody.notes : store[index].notes,
      approvedAt:
        rawBody.status === 'onaylandi' ? nowStr : store[index].approvedAt,
    };
    const nextList = [...store];
    nextList[index] = updatedItem;
    saveStore(nextList);

    return res.status(200).json({
      success: true,
      data: updatedItem,
    });
  }

  if (req.method === 'DELETE') {
    const targetId = extractIdFromReq(req);
    const filtered = store.filter((item) => item.id !== targetId);
    saveStore(filtered);
    return res.status(200).json({
      success: true,
      deletedId: targetId,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
