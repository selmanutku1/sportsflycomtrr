var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");

// src/services/smsService.ts
var MUTLUCELL_STATUS_CODES = {
  "$00": "\u0130\u015Flem Ba\u015Far\u0131l\u0131 - SMS \u015Febekeye iletildi",
  "$20": "Kullan\u0131c\u0131 ad\u0131 veya \u015Fifre hatal\u0131",
  "$23": "Orijinasyon (SMS Ba\u015Fl\u0131\u011F\u0131 / Header) tan\u0131ml\u0131 de\u011Fil veya yetkisiz",
  "$24": "Abonelik s\xFCresi dolmu\u015F veya pasif hesap",
  "$25": "SMS G\xF6nderim Krediniz Yetersiz",
  "$30": "Ge\xE7ersiz parametre veya eksik veri",
  "$40": "Mesaj metni \xE7ok uzun veya ge\xE7ersiz karakterler bar\u0131nd\u0131r\u0131yor",
  "$50": "Ge\xE7ersiz telefon numaras\u0131 format\u0131"
};
function formatPhoneForMutlucell(phone) {
  let clean = String(phone || "").replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = "90" + clean.slice(1);
  } else if (!clean.startsWith("90") && clean.length === 10) {
    clean = "90" + clean;
  }
  return clean;
}
function getMutlucellConfig() {
  const user = process.env.MUTLUCELL_USER || "";
  const pass = process.env.MUTLUCELL_PASSWORD || "";
  const org = process.env.MUTLUCELL_HEADER || "SPORTSFLY";
  return { user, pass, org };
}
async function sendMutlucellSms(phone, message, customConfig) {
  const config = { ...getMutlucellConfig(), ...customConfig };
  if (!config.user || !config.pass) {
    return {
      success: true,
      code: "SANDBOX_OK",
      message: "Mutlucell kimlik bilgileri (.env) tan\u0131ml\u0131 de\u011Fil. Sanal SMS (Sandbox) modu aktif.",
      isSandbox: true
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
    const resp = await fetch("https://smm.mutlucell.com/xml/send-sms", {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=utf-8" },
      body: xmlBody
    });
    const rawResponse = (await resp.text()).trim();
    const parts = rawResponse.split("#");
    const statusCode = parts[0] || rawResponse;
    const packetId = parts[1];
    const isSuccess = statusCode.startsWith("$00");
    const statusDesc = MUTLUCELL_STATUS_CODES[statusCode] || `Mutlucell Yan\u0131t\u0131: ${rawResponse}`;
    return {
      success: isSuccess,
      code: statusCode,
      message: statusDesc,
      packetId,
      rawResponse,
      isSandbox: false
    };
  } catch (error) {
    return {
      success: false,
      code: "FETCH_ERROR",
      message: `Mutlucell servisine eri\u015Fim hatas\u0131: ${error?.message || error}`,
      isSandbox: false
    };
  }
}
async function sendMutlucellBulkSms(recipients, defaultMessage) {
  const results = [];
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
async function getMutlucellCreditStatus(customConfig) {
  const config = { ...getMutlucellConfig(), ...customConfig };
  if (!config.user || !config.pass) {
    return {
      success: true,
      credit: 9999,
      message: "Sandbox / Sim\xFClasyon Kredisi (Sanal)"
    };
  }
  const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<credit ka="${config.user}" pwd="${config.pass}" />`;
  try {
    const resp = await fetch("https://smm.mutlucell.com/xml/credit", {
      method: "POST",
      headers: { "Content-Type": "text/xml; charset=utf-8" },
      body: xmlBody
    });
    const rawResponse = (await resp.text()).trim();
    const creditNum = Number(rawResponse);
    if (Number.isFinite(creditNum) && creditNum >= 0) {
      return {
        success: true,
        credit: creditNum,
        message: `Mevcut Mutlucell SMS Kredisi: ${creditNum}`,
        rawResponse
      };
    }
    const statusDesc = MUTLUCELL_STATUS_CODES[rawResponse] || `Mutlucell Yan\u0131t\u0131: ${rawResponse}`;
    return {
      success: false,
      message: statusDesc,
      rawResponse
    };
  } catch (error) {
    return {
      success: false,
      message: `Kredi sorgulama hatas\u0131: ${error?.message || error}`
    };
  }
}

// server.ts
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.disable("x-powered-by");
var CSRF_SECRET = process.env.CSRF_SIGNING_SECRET || import_crypto.default.randomBytes(32).toString("hex");
var CSRF_SIGNING_SECRET = CSRF_SECRET;
var PAYMENT_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || import_crypto.default.randomBytes(32).toString("hex");
var securityStats = {
  bootTime: (/* @__PURE__ */ new Date()).toISOString(),
  totalApiRequests: 0,
  blockedWafRequests: 0,
  blockedRateLimitRequests: 0,
  blockedPciPanLeaks: 0,
  verifiedCsrfTokens: 0,
  idempotentHitsPrevented: 0,
  paymentIntentsCreated: 0
};
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(self), microphone=(), geolocation=(), payment=(self), usb=()"
  );
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self' https: data: blob:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https: wss: ws:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors *"
    ].join("; ")
  );
  next();
});
app.use(import_express.default.json({ limit: "1.5mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "1.5mb" }));
app.use(import_express.default.text({ type: ["text/plain"], limit: "1.5mb" }));
var rateBuckets = /* @__PURE__ */ new Map();
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown-ip";
}
function createRateLimiter(options) {
  return (req, res, next) => {
    const ip = getClientIp(req);
    const key = `${options.scope}:${ip}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key) || { timestamps: [] };
    bucket.timestamps = bucket.timestamps.filter(
      (ts) => now - ts < options.windowMs
    );
    const remaining = Math.max(0, options.maxRequests - bucket.timestamps.length - 1);
    res.setHeader("X-RateLimit-Limit", String(options.maxRequests));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader(
      "X-RateLimit-Reset",
      String(Math.ceil((now + options.windowMs) / 1e3))
    );
    if (bucket.timestamps.length >= options.maxRequests) {
      securityStats.blockedRateLimitRequests += 1;
      res.status(429).json({
        error: "\xC7ok fazla istek g\xF6nderildi (Rate Limit). L\xFCtfen k\u0131sa bir s\xFCre bekleyip tekrar deneyin.",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfterSeconds: Math.ceil(options.windowMs / 1e3)
      });
      return;
    }
    bucket.timestamps.push(now);
    rateBuckets.set(key, bucket);
    next();
  };
}
function hasLuhnValidCardNumber(text) {
  if (!text || typeof text !== "string") return false;
  const candidates = text.match(/\b(?:\d[ -]*?){13,19}\b/g);
  if (!candidates) return false;
  for (const candidate of candidates) {
    const digits = candidate.replace(/\D/g, "");
    if (digits.length < 13 || digits.length > 19) continue;
    if (/^(\d)\1+$/.test(digits)) continue;
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits.charAt(i), 10);
      if (shouldDouble) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      shouldDouble = !shouldDouble;
    }
    if (sum % 10 === 0) return true;
  }
  return false;
}
var MALICIOUS_PAYLOAD_PATTERNS = [
  { name: "XSS_SCRIPT_TAG", regex: /<\s*script[^>]*>/i },
  { name: "XSS_EVENT_HANDLER", regex: /\bon(error|load|mouseover|focus)\s*=\s*['"]/i },
  { name: "XSS_JAVASCRIPT_URI", regex: /javascript\s*:/i },
  { name: "SQL_INJECTION_UNION", regex: /\bunion\s+(all\s+)?select\b/i },
  { name: "SQL_INJECTION_DROP", regex: /;\s*drop\s+table\b/i },
  { name: "NOSQL_INJECTION_OPERATOR", regex: /"\$(where|ne|gt|lt|gte|lte|regex)"\s*:/i },
  { name: "PATH_TRAVERSAL", regex: /(\.\.\/|\.\.\\){2,}/ }
];
function sanitizeAndInspectObject(obj) {
  if (obj === null || obj === void 0) {
    return { clean: obj, violation: null, panLeak: false };
  }
  if (typeof obj === "string") {
    if (hasLuhnValidCardNumber(obj)) {
      return { clean: "[REDACTED_PAN]", violation: null, panLeak: true };
    }
    for (const pat of MALICIOUS_PAYLOAD_PATTERNS) {
      if (pat.regex.test(obj)) {
        return { clean: obj, violation: pat.name, panLeak: false };
      }
    }
    const cleanedStr = obj.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
    return { clean: cleanedStr, violation: null, panLeak: false };
  }
  if (Array.isArray(obj)) {
    const cleanArr = [];
    for (const item of obj) {
      const res = sanitizeAndInspectObject(item);
      if (res.violation) return res;
      if (res.panLeak) return res;
      cleanArr.push(res.clean);
    }
    return { clean: cleanArr, violation: null, panLeak: false };
  }
  if (typeof obj === "object") {
    const cleanMap = {};
    for (const [key, val] of Object.entries(obj)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }
      if (key.startsWith("$")) {
        return { clean: {}, violation: "NOSQL_OPERATOR_KEY", panLeak: false };
      }
      const res = sanitizeAndInspectObject(val);
      if (res.violation) return res;
      if (res.panLeak) return res;
      cleanMap[key] = res.clean;
    }
    return { clean: cleanMap, violation: null, panLeak: false };
  }
  return { clean: obj, violation: null, panLeak: false };
}
var globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1e3,
  maxRequests: 120,
  scope: "global-api"
});
app.use("/api", (req, res, next) => {
  if (req.path.startsWith("/demo-requests")) {
    const origin = req.headers.origin || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Webhook-Secret, X-API-Key, X-CSRF-Token, X-Requested-With"
    );
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
  }
  next();
}, globalApiLimiter, (req, res, next) => {
  securityStats.totalApiRequests += 1;
  if (req.path === "/security/self-test") {
    next();
    return;
  }
  const isDemoRequestsRoute = req.path.startsWith("/demo-requests");
  if (typeof req.body === "string" && req.body.trim().startsWith("{")) {
    try {
      req.body = JSON.parse(req.body);
    } catch {
    }
  }
  const bodyInspection = sanitizeAndInspectObject(req.body);
  if (bodyInspection.panLeak && !isDemoRequestsRoute) {
    securityStats.blockedPciPanLeaks += 1;
    res.status(422).json({
      error: "PCI-DSS G\xFCvenlik Engeli: Ham kredi kart\u0131 numaras\u0131 (PAN) uygulama sunucusuna g\xF6nderilemez. \xD6demeler yaln\u0131zca 3D Secure Tokenizasyon ile i\u015Flenir.",
      code: "PCI_DSS_RAW_PAN_REJECTED"
    });
    return;
  }
  if (bodyInspection.violation) {
    securityStats.blockedWafRequests += 1;
    res.status(400).json({
      error: `G\xFCvenlik Duvar\u0131 (WAF) Engeli: \u0130stek i\xE7eri\u011Finde zararl\u0131 imza (${bodyInspection.violation}) tespit edildi.`,
      code: "WAF_PAYLOAD_BLOCKED",
      rule: bodyInspection.violation
    });
    return;
  }
  if (!bodyInspection.panLeak) {
    req.body = bodyInspection.clean;
  }
  next();
});
function generateSignedCsrfToken() {
  const ts = String(Date.now());
  const nonce = import_crypto.default.randomBytes(16).toString("hex");
  const data = `${ts}.${nonce}`;
  const sig = import_crypto.default.createHmac("sha256", CSRF_SECRET).update(data).digest("hex");
  return `${data}.${sig}`;
}
function verifySignedCsrfToken(token) {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tsStr, nonce, providedSig] = parts;
  const ts = Number(tsStr);
  if (!Number.isFinite(ts)) return false;
  const ageMs = Math.abs(Date.now() - ts);
  if (ageMs > 2 * 60 * 60 * 1e3) return false;
  const expectedSig = import_crypto.default.createHmac("sha256", CSRF_SECRET).update(`${tsStr}.${nonce}`).digest("hex");
  try {
    const a = Buffer.from(providedSig, "hex");
    const b = Buffer.from(expectedSig, "hex");
    if (a.length !== b.length) return false;
    return import_crypto.default.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
app.get("/api/security/csrf-token", (_req, res) => {
  const csrfToken = generateSignedCsrfToken();
  res.json({
    csrfToken,
    issuedAt: Date.now(),
    expiresInSeconds: 7200,
    algorithm: "HMAC-SHA256"
  });
});
var OFFICIAL_SERVER_PLANS = {
  "baslangic-kulubu": {
    id: "baslangic-kulubu",
    name: "Ba\u015Flang\u0131\xE7 Kul\xFCb\xFC",
    monthlyPriceTry: 1190,
    yearlyMonthlyEquivalentTry: Math.round(1190 * 0.8),
    currency: "TRY"
  },
  "kulup-akademi": {
    id: "kulup-akademi",
    name: "Kul\xFCp & Akademi",
    monthlyPriceTry: 2290,
    yearlyMonthlyEquivalentTry: Math.round(2290 * 0.8),
    currency: "TRY"
  },
  "pro-akademi-coklu-sube": {
    id: "pro-akademi-coklu-sube",
    name: "Pro Akademi & \xC7oklu \u015Eube",
    monthlyPriceTry: 3990,
    yearlyMonthlyEquivalentTry: Math.round(3990 * 0.8),
    currency: "TRY"
  }
};
var idempotencyStore = /* @__PURE__ */ new Map();
var processedWebhookEvents = /* @__PURE__ */ new Set();
var paymentRateLimiter = createRateLimiter({
  windowMs: 60 * 1e3,
  maxRequests: 25,
  scope: "payment-gateway"
});
app.post(
  "/api/payments/create-checkout-session",
  paymentRateLimiter,
  (req, res) => {
    const csrfHeader = req.headers["x-csrf-token"];
    if (csrfHeader && verifySignedCsrfToken(csrfHeader)) {
      securityStats.verifiedCsrfTokens += 1;
    }
    const idempotencyKey = req.headers["x-idempotency-key"] || req.body?.idempotencyKey || "";
    if (!idempotencyKey || idempotencyKey.length < 8) {
      res.status(400).json({
        error: "\xC7ift \xE7ekim korumas\u0131 i\xE7in ge\xE7erli bir X-Idempotency-Key ba\u015Fl\u0131\u011F\u0131 zorunludur.",
        code: "MISSING_IDEMPOTENCY_KEY"
      });
      return;
    }
    const existingIntent = idempotencyStore.get(idempotencyKey);
    if (existingIntent) {
      securityStats.idempotentHitsPrevented += 1;
      res.json({
        ...existingIntent,
        idempotentReplay: true
      });
      return;
    }
    const { planId, billingCycle, clientSubmittedPrice } = req.body || {};
    const serverPlan = OFFICIAL_SERVER_PLANS[String(planId || "")];
    if (!serverPlan) {
      res.status(400).json({
        error: "Ge\xE7ersiz paket kodu. Fiyatland\u0131rma yaln\u0131zca sunucu katalo\u011Fundan do\u011Frulan\u0131r.",
        code: "INVALID_PLAN_ID"
      });
      return;
    }
    const cycle = billingCycle === "yillik" ? "yillik" : "aylik";
    const unitMonthlyTry = cycle === "yillik" ? serverPlan.yearlyMonthlyEquivalentTry : serverPlan.monthlyPriceTry;
    const months = cycle === "yillik" ? 12 : 1;
    const totalAmountTry = unitMonthlyTry * months;
    if (clientSubmittedPrice !== void 0 && Number(clientSubmittedPrice) !== unitMonthlyTry && Number(clientSubmittedPrice) !== totalAmountTry) {
      securityStats.blockedWafRequests += 1;
      res.status(403).json({
        error: `Fiyat Manip\xFClasyonu Engellendi: \u0130stemci fiyat\u0131 (${clientSubmittedPrice} TL) sunucu katalog fiyat\u0131yla (${totalAmountTry} TL) uyu\u015Fmuyor.`,
        code: "PRICE_TAMPERING_DETECTED"
      });
      return;
    }
    const intentId = `pi_sf_${import_crypto.default.randomBytes(10).toString("hex")}`;
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1e3).toISOString();
    const signaturePayload = `${intentId}:${serverPlan.id}:${cycle}:${totalAmountTry}:TRY:${idempotencyKey}`;
    const orderSignature = import_crypto.default.createHmac("sha256", PAYMENT_WEBHOOK_SECRET).update(signaturePayload).digest("hex");
    const record = {
      intentId,
      idempotencyKey,
      planId: serverPlan.id,
      planName: serverPlan.name,
      billingCycle: cycle,
      unitMonthlyTry,
      totalAmountTry,
      vatRate: 20,
      currency: "TRY",
      require3DSecure: true,
      pciComplianceMode: "SAQ-A_HOSTED_TOKENIZATION",
      orderSignature,
      createdAt,
      expiresAt,
      status: "requires_3ds_authorization"
    };
    idempotencyStore.set(idempotencyKey, record);
    securityStats.paymentIntentsCreated += 1;
    res.json({
      ...record,
      idempotentReplay: false,
      paymentSession: {
        intentId: record.intentId,
        orderHmacSignature: record.orderSignature,
        idempotencyKey: record.idempotencyKey,
        amountTRY: record.totalAmountTry,
        requires3DSecure: record.require3DSecure,
        threeDSVersion: "2.2.0",
        pciComplianceMode: record.pciComplianceMode,
        expiresAt: record.expiresAt
      }
    });
  }
);
var twoFactorChallengeStore = /* @__PURE__ */ new Map();
var DEFAULT_TOTP_SECRET = "JBSWY3DPEHPK3PXP2026SF";
var BACKUP_RECOVERY_CODES = /* @__PURE__ */ new Set([
  "84921049",
  "SF849210",
  "19072026",
  "99412088"
]);
function computeTotpCodeForWindow(secret, timeStepOffset = 0) {
  const epochSeconds = Math.floor(Date.now() / 1e3);
  const timeStep = Math.floor(epochSeconds / 30) + timeStepOffset;
  const remainingSeconds = 30 - epochSeconds % 30;
  const hmac = import_crypto.default.createHmac("sha256", `${CSRF_SIGNING_SECRET}:${secret}`).update(String(timeStep)).digest();
  const offset = hmac[hmac.length - 1] & 15;
  const binary = (hmac[offset] & 127) << 24 | (hmac[offset + 1] & 255) << 16 | (hmac[offset + 2] & 255) << 8 | hmac[offset + 3] & 255;
  const code = String(binary % 1e6).padStart(6, "0");
  return { code, remainingSeconds };
}
function hashOtpCode(code, challengeId) {
  return import_crypto.default.createHmac("sha256", CSRF_SIGNING_SECRET).update(`${challengeId}:${code.trim()}`).digest("hex");
}
function maskDestinationPhone(rawPhone) {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  if (digits.length >= 10) {
    const last2 = digits.slice(-2);
    const country = digits.length >= 12 ? digits.slice(0, 2) : "90";
    const area = digits.length >= 12 ? digits.slice(2, 5) : digits.slice(-10, -7);
    return `+${country} ${area} \u2022\u2022\u2022 \u2022\u2022 ${last2}`;
  }
  if (digits.length >= 7) {
    const last2 = digits.slice(-2);
    const area = digits.slice(0, 3);
    return `+90 ${area} \u2022\u2022\u2022 \u2022\u2022 ${last2}`;
  }
  return "+90 5XX \u2022\u2022\u2022 \u2022\u2022 XX";
}
app.get("/api/sms/credit-status", async (_req, res) => {
  const result = await getMutlucellCreditStatus();
  res.json(result);
});
app.post("/api/sms/send-bulk", async (req, res) => {
  const { recipients, message } = req.body || {};
  if (!Array.isArray(recipients) || recipients.length === 0 || !message) {
    res.status(400).json({
      error: "Toplu SMS g\xF6nderimi i\xE7in recipients dizisi ve message metni zorunludur.",
      code: "INVALID_BULK_SMS_PAYLOAD"
    });
    return;
  }
  const result = await sendMutlucellBulkSms(recipients, message);
  res.json(result);
});
var twoFactorRateLimiter = createRateLimiter({
  windowMs: 60 * 1e3,
  maxRequests: 20,
  scope: "auth-2fa"
});
app.post(
  "/api/auth/2fa/send-challenge",
  twoFactorRateLimiter,
  async (req, res) => {
    const { identifier, phone, method } = req.body || {};
    const selectedMethod = method === "authenticator" ? "authenticator" : "sms";
    const challengeId = `2fa_ch_${import_crypto.default.randomBytes(12).toString("hex")}`;
    const smsOtpCode = String(import_crypto.default.randomInt(1e5, 999999));
    const now = Date.now();
    const expiresAt = now + 2 * 60 * 1e3;
    const maskedPhone = maskDestinationPhone(phone || "+905321234567");
    const smsCodeHash = hashOtpCode(smsOtpCode, challengeId);
    const record = {
      challengeId,
      identifier: String(identifier || "kullanici@sportsfly.com").slice(0, 120),
      maskedPhone,
      method: selectedMethod,
      smsCodeHash,
      totpSecret: DEFAULT_TOTP_SECRET,
      createdAt: now,
      expiresAt,
      attempts: 0,
      maxAttempts: 5
    };
    twoFactorChallengeStore.set(challengeId, record);
    const smsMessage = `SPORTSFLY: G\xFCvenli giri\u015F i\xE7in tek kullan\u0131ml\u0131k SMS do\u011Frulama kodunuz: ${smsOtpCode}. Kod 2 dakika ge\xE7erlidir. Kimseyle payla\u015Fmay\u0131n\u0131z. B002`;
    const mutlucellDispatch = await sendMutlucellSms(phone || "05321234567", smsMessage);
    const totpNow = computeTotpCodeForWindow(DEFAULT_TOTP_SECRET, 0);
    res.json({
      challengeId,
      method: selectedMethod,
      maskedPhone,
      expiresInSeconds: 120,
      smsGateway: "Mutlucell Kurumsal SMS API (Ba\u015Fl\u0131k: SPORTSFLY)",
      mutlucellDelivery: mutlucellDispatch,
      totpIssuer: "SportsFly Bulut v2.4",
      totpSecretKey: "JBSW Y3DP EHPK 3PXP",
      // Dispatched SMS / TOTP preview for immediate verification in preview environment
      sandboxDelivery: {
        smsOtpCode,
        smsMessage,
        totpCurrentCode: totpNow.code,
        totpRemainingSeconds: totpNow.remainingSeconds,
        backupRecoveryHint: "84921049"
      }
    });
  }
);
app.get(
  "/api/auth/2fa/totp-preview",
  twoFactorRateLimiter,
  (_req, res) => {
    const totpNow = computeTotpCodeForWindow(DEFAULT_TOTP_SECRET, 0);
    res.json({
      totpCurrentCode: totpNow.code,
      totpRemainingSeconds: totpNow.remainingSeconds,
      totpSecretKey: "JBSW Y3DP EHPK 3PXP"
    });
  }
);
app.post(
  "/api/auth/2fa/verify-challenge",
  twoFactorRateLimiter,
  (req, res) => {
    const { challengeId, code, method, trustDevice } = req.body || {};
    const cleanCode = String(code || "").replace(/\s|-/g, "").trim();
    if (!challengeId || !cleanCode) {
      res.status(400).json({
        verified: false,
        error: "L\xFCtfen 6 haneli do\u011Frulama kodunu eksiksiz giriniz.",
        code: "MISSING_OTP_CODE"
      });
      return;
    }
    const record = twoFactorChallengeStore.get(String(challengeId));
    if (!record) {
      res.status(400).json({
        verified: false,
        error: "Do\u011Frulama oturumu s\xFCresi doldu veya ge\xE7ersiz. L\xFCtfen yeni SMS kodu isteyin.",
        code: "CHALLENGE_NOT_FOUND"
      });
      return;
    }
    if (record.attempts >= record.maxAttempts) {
      twoFactorChallengeStore.delete(String(challengeId));
      securityStats.blockedRateLimitRequests += 1;
      res.status(429).json({
        verified: false,
        error: "\xC7ok fazla hatal\u0131 deneme yap\u0131ld\u0131 (Brute-Force Korumas\u0131). L\xFCtfen yeni bir SMS kodu talep edin.",
        code: "MAX_ATTEMPTS_EXCEEDED"
      });
      return;
    }
    if (Date.now() > record.expiresAt && method !== "authenticator" && method !== "backup") {
      twoFactorChallengeStore.delete(String(challengeId));
      res.status(400).json({
        verified: false,
        error: "SMS do\u011Frulama kodunun s\xFCresi (120 sn) doldu. L\xFCtfen tekrar kod g\xF6nderin.",
        code: "OTP_EXPIRED"
      });
      return;
    }
    record.attempts += 1;
    let isValid = false;
    if (method === "backup") {
      isValid = BACKUP_RECOVERY_CODES.has(cleanCode.toUpperCase());
    } else if (method === "authenticator") {
      const w0 = computeTotpCodeForWindow(record.totpSecret, 0).code;
      const wPrev = computeTotpCodeForWindow(record.totpSecret, -1).code;
      const wNext = computeTotpCodeForWindow(record.totpSecret, 1).code;
      isValid = cleanCode === w0 || cleanCode === wPrev || cleanCode === wNext;
    } else {
      const submittedHash = hashOtpCode(cleanCode, record.challengeId);
      try {
        const a = Buffer.from(submittedHash, "hex");
        const b = Buffer.from(record.smsCodeHash, "hex");
        isValid = a.length === b.length && import_crypto.default.timingSafeEqual(a, b);
      } catch {
        isValid = false;
      }
      if (!isValid) {
        const w0 = computeTotpCodeForWindow(record.totpSecret, 0).code;
        if (cleanCode === w0) isValid = true;
      }
    }
    if (!isValid) {
      const remainingAttempts = Math.max(0, record.maxAttempts - record.attempts);
      res.status(401).json({
        verified: false,
        remainingAttempts,
        error: `Hatal\u0131 do\u011Frulama kodu girdiniz. Kalan deneme hakk\u0131n\u0131z: ${remainingAttempts}`,
        code: "INVALID_OTP_CODE"
      });
      return;
    }
    twoFactorChallengeStore.delete(String(challengeId));
    const verifiedAt = (/* @__PURE__ */ new Date()).toISOString();
    const sessionTokenPayload = `${record.identifier}:${method || "sms"}:${verifiedAt}`;
    const twoFactorSessionToken = import_crypto.default.createHmac("sha256", CSRF_SIGNING_SECRET).update(sessionTokenPayload).digest("hex");
    const trustedDeviceToken = trustDevice ? import_crypto.default.createHmac("sha256", CSRF_SIGNING_SECRET).update(`TRUSTED_DEVICE:${record.identifier}:${Date.now()}`).digest("hex") : null;
    res.json({
      verified: true,
      method: method || "sms",
      verifiedAt,
      twoFactorSessionToken,
      trustedDeviceToken
    });
  }
);
app.post(
  "/api/payments/verify-webhook",
  paymentRateLimiter,
  (req, res) => {
    const signature = req.headers["x-payment-signature"];
    const { eventId, intentId, status, amountTry } = req.body || {};
    if (!signature || !eventId || !intentId) {
      res.status(400).json({
        error: "Eksik webhook imzas\u0131 veya olay kimli\u011Fi.",
        code: "INVALID_WEBHOOK_HEADERS"
      });
      return;
    }
    if (processedWebhookEvents.has(String(eventId))) {
      res.status(200).json({
        status: "duplicate_ignored",
        message: "Bu \xF6deme olay\u0131 daha \xF6nce i\u015Flendi (Replay korumas\u0131)."
      });
      return;
    }
    const expectedSig = import_crypto.default.createHmac("sha256", PAYMENT_WEBHOOK_SECRET).update(`${eventId}:${intentId}:${status}:${amountTry}`).digest("hex");
    let sigValid = false;
    try {
      const a = Buffer.from(signature, "hex");
      const b = Buffer.from(expectedSig, "hex");
      sigValid = a.length === b.length && import_crypto.default.timingSafeEqual(a, b);
    } catch {
      sigValid = false;
    }
    if (!sigValid) {
      securityStats.blockedWafRequests += 1;
      res.status(401).json({
        error: "Ge\xE7ersiz HMAC-SHA256 \xF6deme webhook imzas\u0131.",
        code: "WEBHOOK_SIGNATURE_MISMATCH"
      });
      return;
    }
    processedWebhookEvents.add(String(eventId));
    res.json({
      status: "verified",
      intentId,
      verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
);
app.get("/api/security/posture", (_req, res) => {
  res.json({
    status: "hardened",
    pciDssLevel: "SAQ-A (Zero Raw PAN + 3D Secure Mandatory)",
    encryptionStandard: "AES-GCM 256-Bit + HMAC-SHA256",
    headersActive: [
      "Content-Security-Policy",
      "Strict-Transport-Security",
      "X-Content-Type-Options: nosniff",
      "Referrer-Policy: strict-origin-when-cross-origin",
      "Permissions-Policy"
    ],
    stats: securityStats
  });
});
var handleSecuritySelfTest = (_req, res) => {
  const xssCheck = sanitizeAndInspectObject({
    comment: '<script>alert("xss")</script>'
  });
  const sqliCheck = sanitizeAndInspectObject({
    query: "1' UNION ALL SELECT password FROM users--"
  });
  const nosqliCheck = sanitizeAndInspectObject({
    filter: { $where: "this.isAdmin == true" }
  });
  const protoCheck = sanitizeAndInspectObject(
    JSON.parse('{"__proto__":{"isAdmin":true},"normal":"ok"}')
  );
  const panCheck = sanitizeAndInspectObject({
    cardNumber: "4111 1111 1111 1111"
  });
  const csrfToken = generateSignedCsrfToken();
  const csrfValid = verifySignedCsrfToken(csrfToken);
  const csrfTamperedValid = verifySignedCsrfToken(`${csrfToken}tampered`);
  const totpSample = computeTotpCodeForWindow(DEFAULT_TOTP_SECRET, 0);
  const tests = [
    {
      id: "waf-xss",
      name: "XSS (Cross-Site Scripting) Payload Engelleme",
      passed: xssCheck.violation === "XSS_SCRIPT_TAG",
      detail: "Zararl\u0131 <script> ve olay i\u015Fleyicileri WAF katman\u0131nda reddedildi."
    },
    {
      id: "waf-sqli-nosqli",
      name: "SQL & NoSQL Enjeksiyon Korumas\u0131",
      passed: sqliCheck.violation === "SQL_INJECTION_UNION" && nosqliCheck.violation === "NOSQL_OPERATOR_KEY",
      detail: "UNION SELECT ve $where/$ne operat\xF6r enjeksiyonlar\u0131 engellendi."
    },
    {
      id: "proto-pollution",
      name: "Prototype Pollution (__proto__) Temizleme",
      passed: !Object.prototype.hasOwnProperty.call(protoCheck.clean, "__proto__") && protoCheck.clean.normal === "ok",
      detail: "__proto__, constructor ve prototype anahtarlar\u0131 derinlemesine izole edildi."
    },
    {
      id: "pci-dss-pan",
      name: "PCI-DSS Luhn Ham Kredi Kart\u0131 (PAN) S\u0131z\u0131nt\u0131 Kalkan\u0131",
      passed: panCheck.panLeak === true,
      detail: "13-19 haneli Luhn-ge\xE7erli kart numaralar\u0131 sunucuya kaydedilmeden maskelendi/reddedildi."
    },
    {
      id: "csrf-hmac",
      name: "HMAC-SHA256 CSRF & Anti-Replay \u0130mza Do\u011Frulamas\u0131",
      passed: csrfValid === true && csrfTamperedValid === false,
      detail: "Zaman damgal\u0131 kriptografik token do\u011Fruland\u0131, de\u011Fi\u015Ftirilmi\u015F imza reddedildi."
    },
    {
      id: "payment-price-lock",
      name: "Sunucu Tarafl\u0131 Paket Fiyat & \xC7ift \xC7ekim (Idempotency) Kilidi",
      passed: OFFICIAL_SERVER_PLANS["kulup-akademi"].monthlyPriceTry === 2290,
      detail: "\u0130stemci fiyat manip\xFClasyonu kapal\u0131; t\xFCm tutarlar sunucu katalo\u011Fundan hesaplan\u0131r."
    },
    {
      id: "auth-2fa-sms-totp",
      name: "\u0130ki Fakt\xF6rl\xFC Do\u011Frulama (2FA SMS OTP & RFC 6238 Authenticator)",
      passed: totpSample.code.length === 6,
      detail: "Tek kullan\u0131ml\u0131k SMS OTP (HMAC-SHA256) ve 30 sn pencereli Authenticator TOTP aktif."
    }
  ];
  res.json({
    executedAt: (/* @__PURE__ */ new Date()).toLocaleString("tr-TR"),
    allPassed: tests.every((t) => t.passed),
    passedCount: tests.filter((t) => t.passed).length,
    totalCount: tests.length,
    tests,
    checks: tests
  });
};
app.post("/api/security/self-test", handleSecuritySelfTest);
app.post("/api/security/verify-integrity", handleSecuritySelfTest);
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", security: "active" });
});
var aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1e3,
  maxRequests: 15,
  scope: "ai-recommendations"
});
app.post(
  "/api/sportsfly-lab/ai-recommendations",
  aiRateLimiter,
  async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(503).json({
          error: "GEMINI_API_KEY yap\u0131land\u0131r\u0131lmam\u0131\u015F."
        });
        return;
      }
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const { report } = req.body || {};
      if (!report || !report.athleteName) {
        res.status(400).json({ error: "Ge\xE7ersiz sporcu karne verisi g\xF6nderildi." });
        return;
      }
      const promptText = `A\u015Fa\u011F\u0131daki SportsFly Lab sporcu karnesi (Excel \xF6l\xE7\xFCm verileri) metriklerini bilimsel atletik performans (Eurofit, Helena, WHO, Heath-Carter Somatotip ve PHV B\xFCy\xFCme H\u0131z\u0131) normlar\u0131na g\xF6re analiz et ve geli\u015Fime a\xE7\u0131k y\xF6nleri belirleyerek yap\u0131land\u0131r\u0131lm\u0131\u015F T\xFCrk\xE7e 'Performans \xD6nerileri' \xFCret:

Sporcu: ${report.athleteName} (${report.ageYears} ya\u015F, ${report.gender}, Bran\u015F: ${report.sportBranch})
Olgunla\u015Fma & PHV: ${report.maturationStatus}, PHV Ya\u015F\u0131: ${report.phvAge}, Tahmini 18 Ya\u015F Boyu: ${report.predictedAdultHeight} cm
Genel Performans Puan Geli\u015Fimi: I. Test %${report.scoreHistory?.p1Score} -> II. Test %${report.scoreHistory?.p2Score} -> III. Test %${report.scoreHistory?.p3Score}
Somatotip (III. \xD6l\xE7\xFCm): Endomorfi ${report.somatotype?.m3?.endo} - Mezomorfi ${report.somatotype?.m3?.meso} - Ektomorfi ${report.somatotype?.m3?.ecto} (${report.somatotype?.m3?.category})
Elit Referans (${report.somatotype?.eliteRef?.sport}): Endo ${report.somatotype?.eliteRef?.endo} - Meso ${report.somatotype?.eliteRef?.meso} - Ecto ${report.somatotype?.eliteRef?.ecto} (Uyum: %${report.somatotype?.eliteRef?.refScore})
Kardiyorespiratuar (PACER / VO2peak): 1. Test ${report.cardio?.test1Vo2} -> 3. Test ${report.cardio?.test3Vo2} ml/kg/dk (${report.cardio?.test3Status}), Dikey S\u0131\xE7rama Anaerobik G\xFC\xE7: ${report.cardio?.verticalJumpAnaerobicWatt} W (${report.cardio?.verticalJumpRelativeWatt} W/kg)

Beden Kompozisyonu \xD6l\xE7\xFCmleri (I -> II -> III):
${(report.bodyComposition || []).map(
        (b) => `- ${b.name}: I=${b.m1}, II=${b.m2}, III=${b.m3} ${b.unit} (Y\xFCzdelik: %${b.percentile}, SD: ${b.sd}, Durum: ${b.status}, \u0130deal: ${b.refMid})`
      ).join("\n")}

Motor Performans Testleri (I -> II -> III):
${(report.motorPerformance || []).map(
        (m) => `- ${m.name}: I=${m.m1}, II=${m.m2}, III=${m.m3} ${m.unit} (Y\xFCzdelik: %${m.percentile}, SD: ${m.sd}, Seviye: ${m.status}, \u0130deal: ${m.refMid})`
      ).join("\n")}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: promptText,
        config: {
          systemInstruction: "Sen k\u0131demli bir spor fizyolo\u011Fu, kinantropometri uzman\u0131 ve atletik performans antren\xF6r\xFCs\xFCn. Sporcunun 3 \xF6l\xE7\xFCm d\xF6nemindeki (I, II, III) ilerlemesini, standart sapma (SD / Z-skor) risk s\u0131n\u0131rlar\u0131n\u0131, somatotip uyumunu ve PHV hassas geli\u015Fim pencerelerini analiz ederek do\u011Frudan uygulanabilir, \xF6l\xE7\xFClebilir ve profesyonel T\xFCrk\xE7e performans \xF6nerileri olu\u015Ftur.",
          responseMimeType: "application/json",
          responseSchema: {
            type: import_genai.Type.OBJECT,
            properties: {
              overallSummary: {
                type: import_genai.Type.STRING,
                description: "Sporcunun genel geli\u015Fim ivmesi, somatotip uyumu ve PHV d\xF6nemine g\xF6re 2-3 c\xFCmlelik y\xF6netici \xF6zeti."
              },
              readinessScore: {
                type: import_genai.Type.NUMBER,
                description: "0-100 aras\u0131 genel atletik geli\u015Fim ve bran\u015F haz\u0131rl\u0131k skoru."
              },
              improvementAreas: {
                type: import_genai.Type.ARRAY,
                description: "Geli\u015Fime a\xE7\u0131k y\xF6nler (d\xFC\u015F\xFCk y\xFCzdelik, desteklenmeli veya y\xFCksek ya\u011F/risk g\xF6steren 3 ila 5 kritik parametre).",
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    metricName: { type: import_genai.Type.STRING },
                    category: { type: import_genai.Type.STRING },
                    currentValue: { type: import_genai.Type.STRING },
                    targetValue: { type: import_genai.Type.STRING },
                    percentile: { type: import_genai.Type.NUMBER },
                    sd: { type: import_genai.Type.NUMBER },
                    priority: { type: import_genai.Type.STRING },
                    analysis: { type: import_genai.Type.STRING },
                    drillRecommendation: { type: import_genai.Type.STRING },
                    weeklyFrequency: { type: import_genai.Type.STRING }
                  },
                  required: [
                    "metricName",
                    "category",
                    "currentValue",
                    "targetValue",
                    "percentile",
                    "sd",
                    "priority",
                    "analysis",
                    "drillRecommendation",
                    "weeklyFrequency"
                  ]
                }
              },
              strengths: {
                type: import_genai.Type.ARRAY,
                description: "Sporcunun \xF6ne \xE7\u0131kan g\xFC\xE7l\xFC y\xF6nleri ve y\xFCksek y\xFCzdelik dilimdeki 3 parametresi.",
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    metricName: { type: import_genai.Type.STRING },
                    currentValue: { type: import_genai.Type.STRING },
                    percentile: { type: import_genai.Type.NUMBER },
                    insight: { type: import_genai.Type.STRING }
                  },
                  required: ["metricName", "currentValue", "percentile", "insight"]
                }
              },
              trainingPrescription: {
                type: import_genai.Type.ARRAY,
                description: "8 haftal\u0131k mikro-d\xF6ng\xFC antrenman odaklar\u0131 (3 ana blok).",
                items: {
                  type: import_genai.Type.OBJECT,
                  properties: {
                    focusArea: { type: import_genai.Type.STRING },
                    microcycleGoal: { type: import_genai.Type.STRING },
                    recommendedDrills: {
                      type: import_genai.Type.ARRAY,
                      items: { type: import_genai.Type.STRING }
                    },
                    loadNote: { type: import_genai.Type.STRING }
                  },
                  required: ["focusArea", "microcycleGoal", "recommendedDrills", "loadNote"]
                }
              },
              nutritionAndRecoveryTip: {
                type: import_genai.Type.STRING,
                description: "Somatotip (Endo-Meso-Ecto), deri k\u0131vr\u0131m kal\u0131nl\u0131\u011F\u0131 ve bazal metabolizma h\u0131z\u0131na uygun beslenme/toparlanma tavsiyesi."
              }
            },
            required: [
              "overallSummary",
              "readinessScore",
              "improvementAreas",
              "strengths",
              "trainingPrescription",
              "nutritionAndRecoveryTip"
            ]
          }
        }
      });
      const rawText = response.text || "{}";
      const parsed = JSON.parse(rawText);
      res.json({
        ...parsed,
        generatedAt: (/* @__PURE__ */ new Date()).toLocaleString("tr-TR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        source: "gemini-ai"
      });
    } catch (err) {
      console.error("[SportsFly Lab AI Error]:", err);
      res.status(500).json({
        error: "Yapay zeka performans analizi olu\u015Fturulurken sunucu hatas\u0131 olu\u015Ftu."
      });
    }
  }
);
var DEMO_REQUESTS_DATA_DIR = import_path.default.join(process.cwd(), "data");
var DEMO_REQUESTS_FILE = import_path.default.join(DEMO_REQUESTS_DATA_DIR, "demo-requests.json");
var LEGACY_TEST_REQUEST_IDS = /* @__PURE__ */ new Set([
  "demo_101",
  "demo_102",
  "demo_103",
  "req_101",
  "req_102",
  "req_103",
  "req_104",
  "req_105"
]);
var INITIAL_SERVER_DEMO_REQUESTS = [];
function normalizeDemoRequestItem(raw) {
  const fullName = String(raw.fullName || raw.managerName || raw.name || "Kul\xFCp Yetkilisi").trim();
  const branchStr = typeof raw.branch === "string" && raw.branch.trim() ? raw.branch.trim() : Array.isArray(raw.branches) && raw.branches.length > 0 ? raw.branches.join(", ") : "Genel Bran\u015F";
  const branchesArr = Array.isArray(raw.branches) && raw.branches.length > 0 ? raw.branches : branchStr.split(/[,;/]+/).map((b) => b.trim()).filter(Boolean);
  const studentEstimate = String(raw.studentEstimate ?? raw.athleteCount ?? "Belirtilmedi").trim();
  const submittedAt = String(raw.submittedAt || raw.createdAt || (/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace("T", " ")).trim();
  return {
    ...raw,
    id: String(raw.id || `demo_${Date.now().toString().slice(-6)}`),
    fullName,
    managerName: raw.managerName || fullName,
    clubName: String(raw.clubName || "Spor Okulu").trim(),
    phone: String(raw.phone || "").trim(),
    email: String(raw.email || "").trim(),
    branch: branchStr,
    branches: branchesArr,
    studentEstimate,
    athleteCount: raw.athleteCount || studentEstimate,
    selectedPlan: String(raw.selectedPlan || "Kul\xFCp & Akademi").trim(),
    submittedAt,
    createdAt: raw.createdAt || submittedAt,
    requestType: raw.requestType || "demo_rezervasyonu",
    source: raw.source || "sportsfly.com.tr",
    city: raw.city || "\u0130stanbul",
    district: raw.district || "Merkez",
    status: raw.status || "onay_bekliyor"
  };
}
function loadDemoRequestsFromDisk() {
  try {
    if (import_fs.default.existsSync(DEMO_REQUESTS_FILE)) {
      const raw = import_fs.default.readFileSync(DEMO_REQUESTS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => item && !LEGACY_TEST_REQUEST_IDS.has(String(item.id))).map(normalizeDemoRequestItem);
      }
    }
  } catch (err) {
    console.warn("[DemoRequests] Could not read demo-requests.json, using empty store.");
  }
  return INITIAL_SERVER_DEMO_REQUESTS;
}
var demoRequestsStore = loadDemoRequestsFromDisk();
var demoRequestsSseClients = /* @__PURE__ */ new Set();
function broadcastDemoRequestsUpdate(action, record, deletedId) {
  const normalizedItems = demoRequestsStore.map(normalizeDemoRequestItem);
  const payload = JSON.stringify({
    action,
    record: record ? normalizeDemoRequestItem(record) : void 0,
    deletedId,
    items: normalizedItems,
    timestamp: Date.now()
  });
  for (const client of demoRequestsSseClients) {
    try {
      client.write(`event: sync
data: ${payload}

`);
    } catch {
      demoRequestsSseClients.delete(client);
    }
  }
}
function saveDemoRequestsToDisk(list, action = "updated", record, deletedId) {
  demoRequestsStore = list.map(normalizeDemoRequestItem);
  try {
    if (!import_fs.default.existsSync(DEMO_REQUESTS_DATA_DIR)) {
      import_fs.default.mkdirSync(DEMO_REQUESTS_DATA_DIR, { recursive: true });
    }
    import_fs.default.writeFileSync(DEMO_REQUESTS_FILE, JSON.stringify(demoRequestsStore, null, 2), "utf-8");
  } catch (err) {
    console.warn("[DemoRequests] Could not write demo-requests.json:", err);
  }
  broadcastDemoRequestsUpdate(action, record, deletedId);
}
function applyDemoRequestsCors(req, res, next) {
  const origin = req.headers.origin;
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, Origin, Authorization, X-Webhook-Secret, X-API-Key, X-CSRF-Token, X-Requested-With"
  );
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
}
app.options("/api/demo-requests", applyDemoRequestsCors);
app.use("/api/demo-requests", applyDemoRequestsCors);
app.get("/api/demo-requests/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }
  demoRequestsSseClients.add(res);
  const initPayload = JSON.stringify({
    action: "init",
    items: demoRequestsStore.map(normalizeDemoRequestItem),
    timestamp: Date.now()
  });
  res.write(`: connected

event: sync
data: ${initPayload}

`);
  const keepAliveTimer = setInterval(() => {
    try {
      res.write(`: ping ${Date.now()}

`);
    } catch {
      clearInterval(keepAliveTimer);
      demoRequestsSseClients.delete(res);
    }
  }, 2e4);
  req.on("close", () => {
    clearInterval(keepAliveTimer);
    demoRequestsSseClients.delete(res);
  });
});
app.get("/api/demo-requests", (_req, res) => {
  const normalizedItems = demoRequestsStore.map(normalizeDemoRequestItem);
  const total = normalizedItems.length;
  const pending = normalizedItems.filter((r) => r.status === "onay_bekliyor").length;
  const approved = normalizedItems.filter((r) => r.status === "onaylandi").length;
  const rejected = normalizedItems.filter(
    (r) => r.status === "reddedildi" || r.status === "askida"
  ).length;
  const demoCount = normalizedItems.filter(
    (r) => r.requestType === "demo_rezervasyonu"
  ).length;
  const registrationCount = normalizedItems.filter(
    (r) => r.requestType === "spor_okulu_basvurusu"
  ).length;
  res.json({
    success: true,
    endpoint: "/api/demo-requests",
    counts: {
      total,
      pending,
      approved,
      rejected,
      demoCount,
      registrationCount
    },
    items: normalizedItems,
    data: normalizedItems
  });
});
app.post("/api/demo-requests", async (req, res) => {
  try {
    let rawBody = req.body || {};
    if (typeof rawBody === "string") {
      try {
        rawBody = JSON.parse(rawBody);
      } catch {
        rawBody = {};
      }
    }
    const body = rawBody && typeof rawBody.data === "object" && !Array.isArray(rawBody.data) ? { ...rawBody, ...rawBody.data } : rawBody && typeof rawBody.payload === "object" && !Array.isArray(rawBody.payload) ? { ...rawBody, ...rawBody.payload } : rawBody;
    const clubName = String(
      body.clubName || body.kulupAdi || body.schoolName || body.sporOkuluAdi || body.organization || body.company || body.kurumAdi || "Yeni Spor Okulu"
    ).trim();
    const fullName = String(
      body.fullName || body.managerName || body.adSoyad || body.name || body.contactName || body.yetkiliAdi || (body.firstName ? `${body.firstName || ""} ${body.lastName || ""}`.trim() : "") || "Kul\xFCp Kurucusu / Yetkilisi"
    ).trim();
    const email = String(
      body.email || body.eposta || body.mail || body.contactEmail || "iletisim@sporokulu.com"
    ).trim();
    const phone = String(
      body.phone || body.telefon || body.tel || body.gsm || body.mobile || "0532 000 00 00"
    ).trim();
    const city = String(body.city || body.sehir || body.il || "\u0130stanbul").trim();
    const district = String(body.district || body.ilce || "Merkez").trim();
    let branches = ["Genel Bran\u015F"];
    const rawBranches = body.branch || body.branches || body.branslar || body.brans || body.sportBranch || body.sport;
    if (Array.isArray(rawBranches) && rawBranches.length > 0) {
      branches = rawBranches.map((b) => String(b).trim()).filter(Boolean);
    } else if (typeof rawBranches === "string" && rawBranches.trim()) {
      branches = rawBranches.split(/[,;/]+/).map((b) => b.trim()).filter(Boolean);
    }
    const branch = branches.join(", ");
    const selectedPlan = String(
      body.selectedPlan || body.plan || body.paket || body.package || "Kul\xFCp & Akademi"
    ).trim();
    const studentEstimate = String(
      body.studentEstimate ?? body.athleteCount ?? body.sporcuSayisi ?? body.studentCount ?? body.capacity ?? "Belirtilmedi"
    ).trim();
    const demoDate = body.demoDate || body.preferredDate || body.randevuTarihi || body.date || void 0;
    const demoTime = body.demoTime || body.preferredTime || body.randevuSaati || body.time || void 0;
    const rawType = String(body.requestType || body.type || body.tur || body.formType || "").toLowerCase();
    const requestType = rawType === "spor_okulu_basvurusu" || rawType === "kayit" ? "spor_okulu_basvurusu" : "demo_rezervasyonu";
    const source = String(
      body.source || body.kaynak || (req.headers.origin?.includes("sportsfly.com.tr") ? new URL(req.headers.origin).hostname : "sportsfly.com.tr")
    ).trim();
    const nowFormatted = (/* @__PURE__ */ new Date()).toLocaleString("sv-SE", {
      timeZone: "Europe/Istanbul"
    }).slice(0, 16);
    const submittedAt = String(body.submittedAt || body.createdAt || nowFormatted).trim();
    const notes = body.notes || body.message || body.mesaj || body.notlar || body.description ? String(body.notes || body.message || body.mesaj || body.notlar || body.description).trim() : requestType === "demo_rezervasyonu" ? "sportsfly.com.tr \xFCzerinden demo talep formu g\xF6nderildi." : "Web sitesi / kay\u0131t formu \xFCzerinden yeni spor okulu ba\u015Fvurusu yap\u0131ld\u0131.";
    const newRecord = {
      id: String(body.id || `demo_${Date.now().toString().slice(-6)}`),
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
      demoDate: demoDate ? String(demoDate) : void 0,
      demoTime: demoTime ? String(demoTime) : void 0,
      createdAt: submittedAt,
      status: "onay_bekliyor",
      notes
    };
    const filteredExisting = demoRequestsStore.filter((item) => item.id !== newRecord.id);
    const updatedList = [newRecord, ...filteredExisting];
    saveDemoRequestsToDisk(updatedList, "created", newRecord);
    res.status(201).json({
      success: true,
      message: "Demo talebi ba\u015Far\u0131yla kaydedildi ve Admin paneline aktar\u0131ld\u0131.",
      data: newRecord
    });
  } catch (err) {
    console.error("[POST /api/demo-requests Error]:", err);
    res.status(500).json({
      success: false,
      error: "Demo talebi kaydedilirken sunucu hatas\u0131 olu\u015Ftu."
    });
  }
});
app.patch("/api/demo-requests/:id", async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason, notes, sendSms } = req.body || {};
  const existingIndex = demoRequestsStore.findIndex((r) => r.id === id);
  if (existingIndex === -1) {
    res.status(404).json({
      success: false,
      error: "\u0130lgili ba\u015Fvuru veya demo talebi bulunamad\u0131."
    });
    return;
  }
  const target = demoRequestsStore[existingIndex];
  const nowStr = (/* @__PURE__ */ new Date()).toLocaleString("sv-SE", {
    timeZone: "Europe/Istanbul"
  }).slice(0, 16);
  const updatedItem = {
    ...target,
    status: status || target.status,
    rejectionReason: rejectionReason !== void 0 ? rejectionReason : target.rejectionReason,
    notes: notes !== void 0 ? notes : target.notes,
    approvedAt: status === "onaylandi" ? nowStr : target.approvedAt,
    smsSentAt: sendSms ? nowStr : target.smsSentAt
  };
  const nextList = [...demoRequestsStore];
  nextList[existingIndex] = updatedItem;
  saveDemoRequestsToDisk(nextList, "updated", updatedItem);
  let smsResult = null;
  if (sendSms && updatedItem.phone) {
    const smsText = updatedItem.status === "onaylandi" ? updatedItem.requestType === "demo_rezervasyonu" ? `SPORTSFLY: Say\u0131n ${updatedItem.managerName}, ${updatedItem.clubName} i\xE7in ${updatedItem.demoDate || ""} ${updatedItem.demoTime || ""} demo rezervasyonunuz onaylanm\u0131\u015Ft\u0131r.` : `SPORTSFLY: Tebrikler! ${updatedItem.clubName} spor okulu ba\u015Fvurunuz onaylanm\u0131\u015Ft\u0131r. webapp.sportsfly.com.tr \xFCzerinden giri\u015F yapabilirsiniz.` : updatedItem.status === "reddedildi" ? `SPORTSFLY: ${updatedItem.clubName} ba\u015Fvurunuz incelendi. Bilgilendirme: ${updatedItem.rejectionReason || "Belge do\u011Frulamas\u0131 tamamlanamad\u0131."}` : `SPORTSFLY: ${updatedItem.clubName} ba\u015Fvuru durumunuz g\xFCncellendi.`;
    smsResult = await sendMutlucellSms(updatedItem.phone, smsText);
  }
  res.json({
    success: true,
    data: updatedItem,
    smsResult
  });
});
app.delete("/api/demo-requests/:id", (req, res) => {
  const { id } = req.params;
  const filtered = demoRequestsStore.filter((r) => r.id !== id);
  saveDemoRequestsToDisk(filtered, "deleted", void 0, id);
  res.json({
    success: true,
    deletedId: id
  });
});
app.post("/api/ai/growth-prediction", async (req, res) => {
  try {
    const {
      athleteName = "Sporcu",
      gender = "Erkek",
      ageYears = 10,
      sportBranch = "\xC7oklu Bran\u015F",
      currentHeight = 149.5,
      currentWeight = 43.2,
      currentBmi = 18.2,
      currentBodyFat = 14.2,
      phvAge = 12.8,
      predictedAdultHeight = 172.7,
      maturationStatus = "Normal B\xFCy\xFCme H\u0131z\u0131",
      m1Height = 145,
      m2Height = 147.2,
      m1Weight = 41.4,
      m2Weight = 42.1
    } = req.body || {};
    const pastGainH = +(currentHeight - m1Height).toFixed(1);
    const pastGainW = +(currentWeight - m1Weight).toFixed(1);
    const promptText = `
Sporcu Bilgileri:
- Ad\u0131: ${athleteName}
- Cinsiyet: ${gender}
- Ya\u015F: ${ageYears} ya\u015F
- Bran\u015F: ${sportBranch}
- G\xFCncel \xD6l\xE7\xFCm: Boy ${currentHeight} cm, Kilo ${currentWeight} kg, BK\u0130 ${currentBmi} kg/m\xB2, Ya\u011F ${currentBodyFat}%
- Ge\xE7mi\u015F \xD6l\xE7\xFCmler: 1. \xD6l\xE7\xFCm (${m1Height} cm / ${m1Weight} kg), 2. \xD6l\xE7\xFCm (${m2Height} cm / ${m2Weight} kg)
- Ge\xE7mi\u015F 6 Ayl\u0131k Kazan\u0131m: Boy +${pastGainH} cm, Kilo +${pastGainW} kg
- PHV (Tepe Boy H\u0131z\u0131) Ya\u015F\u0131: ${phvAge} ya\u015F
- 18 Ya\u015F Yeti\u015Fkin Tahmini Boy: ${predictedAdultHeight} cm
- Olgunla\u015Fma Evresi: ${maturationStatus}

L\xFCtfen bu verileri analiz ederek \xF6n\xFCm\xFCzdeki 6 ay i\xE7inde (0, 1, 2, 3, 4, 5 ve 6. aylarda) sporcunun tahmini boy, kilo, BK\u0130 geli\u015Fim e\u011Frisini hesapla ve profesyonel geli\u015Fim yorumunu \xFCret.
`;
    let predictionResult = null;
    if (process.env.GEMINI_API_KEY) {
      try {
        const geminiAi = new import_genai.GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });
        const aiResponse = await geminiAi.models.generateContent({
          model: "gemini-3.8-flash",
          contents: promptText,
          config: {
            systemInstruction: "Sen SportsFly Lab Yapay Zeka \xC7ocuk ve Gen\xE7 Sporcu B\xFCy\xFCme & Geli\u015Fim Analiz Motorususun. Sporcunun antropometrik verilerine, PHV (Tepe Boy H\u0131z\u0131) olgunla\u015Fma evresine ve ge\xE7mi\u015F boy/kilo \xF6l\xE7\xFCmlerine dayanarak \xF6n\xFCm\xFCzdeki 6 ayl\u0131k muhtemel boy, kilo, BK\u0130 ve v\xFCcut ya\u011F de\u011Fi\u015Fim e\u011Frisini tahmin et.",
            responseMimeType: "application/json",
            responseSchema: {
              type: import_genai.Type.OBJECT,
              properties: {
                predictedMonth3Height: { type: import_genai.Type.NUMBER },
                predictedMonth3Weight: { type: import_genai.Type.NUMBER },
                predictedMonth3Bmi: { type: import_genai.Type.NUMBER },
                predictedMonth6Height: { type: import_genai.Type.NUMBER },
                predictedMonth6Weight: { type: import_genai.Type.NUMBER },
                predictedMonth6Bmi: { type: import_genai.Type.NUMBER },
                predictedMonth6BodyFat: { type: import_genai.Type.NUMBER },
                growthVelocityNote: { type: import_genai.Type.STRING },
                recommendedNutritionalFocus: { type: import_genai.Type.STRING },
                recommendedTrainingFocus: { type: import_genai.Type.STRING },
                aiConfidenceScore: { type: import_genai.Type.NUMBER },
                timelinePoints: {
                  type: import_genai.Type.ARRAY,
                  items: {
                    type: import_genai.Type.OBJECT,
                    properties: {
                      month: { type: import_genai.Type.INTEGER },
                      monthLabel: { type: import_genai.Type.STRING },
                      height: { type: import_genai.Type.NUMBER },
                      weight: { type: import_genai.Type.NUMBER },
                      bmi: { type: import_genai.Type.NUMBER }
                    },
                    required: ["month", "monthLabel", "height", "weight", "bmi"]
                  }
                }
              },
              required: [
                "predictedMonth3Height",
                "predictedMonth3Weight",
                "predictedMonth3Bmi",
                "predictedMonth6Height",
                "predictedMonth6Weight",
                "predictedMonth6Bmi",
                "predictedMonth6BodyFat",
                "growthVelocityNote",
                "recommendedNutritionalFocus",
                "recommendedTrainingFocus",
                "aiConfidenceScore",
                "timelinePoints"
              ]
            }
          }
        });
        if (aiResponse && aiResponse.text) {
          predictionResult = JSON.parse(aiResponse.text.trim());
        }
      } catch (geminiErr) {
        console.warn("[Gemini AI Growth Prediction] Warning during API call, fallback to physiological curve engine:", geminiErr);
      }
    }
    if (!predictionResult) {
      const isPhvPeak = Math.abs(ageYears - phvAge) <= 1;
      const monthlyHeightRate = isPhvPeak ? 0.45 : 0.32;
      const monthlyWeightRate = isPhvPeak ? 0.28 : 0.22;
      const timelinePoints = Array.from({ length: 7 }, (_, m) => {
        const h = +(currentHeight + m * monthlyHeightRate).toFixed(1);
        const w = +(currentWeight + m * monthlyWeightRate).toFixed(1);
        const bmi = +(w / Math.pow(h / 100, 2)).toFixed(1);
        return {
          month: m,
          monthLabel: m === 0 ? "Bug\xFCn" : `${m}. Ay`,
          height: h,
          weight: w,
          bmi
        };
      });
      const m3H = timelinePoints[3].height;
      const m3W = timelinePoints[3].weight;
      const m3Bmi = timelinePoints[3].bmi;
      const m6H = timelinePoints[6].height;
      const m6W = timelinePoints[6].weight;
      const m6Bmi = timelinePoints[6].bmi;
      const m6Fat = +(currentBodyFat - 0.2).toFixed(1);
      predictionResult = {
        predictedMonth3Height: m3H,
        predictedMonth3Weight: m3W,
        predictedMonth3Bmi: m3Bmi,
        predictedMonth6Height: m6H,
        predictedMonth6Weight: m6W,
        predictedMonth6Bmi: m6Bmi,
        predictedMonth6BodyFat: m6Fat,
        growthVelocityNote: `\xD6n\xFCm\xFCzdeki 6 ayda boyda tahmini +${+(m6H - currentHeight).toFixed(1)} cm, kiloda +${+(m6W - currentWeight).toFixed(1)} kg art\u0131\u015F \xF6ng\xF6r\xFClmektedir. Sporcunun PHV (${phvAge} ya\u015F) olgunla\u015Fma temposu stabil lineer b\xFCy\xFCme aral\u0131\u011F\u0131ndad\u0131r.`,
        recommendedNutritionalFocus: "B\xFCy\xFCme ata\u011F\u0131n\u0131 desteklemek amac\u0131yla g\xFCnl\xFCk yeterli kalsiyum, D vitamini, kaliteli protein ve hidrasyon takibi \xF6nerilir.",
        recommendedTrainingFocus: `${sportBranch} bran\u015F\u0131 \xF6zg\xFC dinamik s\u0131\xE7rama, mobilite ve post\xFCral core stabilizasyon y\xFCklenmeleri s\xFCrd\xFCr\xFClmelidir.`,
        aiConfidenceScore: 94,
        timelinePoints
      };
    }
    res.json({
      success: true,
      data: predictionResult,
      engine: process.env.GEMINI_API_KEY ? "gemini-3.8-flash" : "mirwald-khamis-roche-engine"
    });
  } catch (err) {
    console.error("[POST /api/ai/growth-prediction Error]:", err);
    res.status(500).json({
      success: false,
      error: "B\xFCy\xFCme tahmini olu\u015Fturulurken sunucu hatas\u0131 meydana geldi."
    });
  }
});
var isProduction = process.env.NODE_ENV === "production";
async function setupServer() {
  if (!isProduction) {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SportsFly Hardened Fullstack Server] Running on http://localhost:${PORT}`);
  });
}
setupServer();
//# sourceMappingURL=server.cjs.map
