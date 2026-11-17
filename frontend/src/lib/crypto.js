// Dynamic QR Security: HMAC-SHA256 Token Generator & Verifier in Pure JavaScript
// Compliant with Section 2.1 in wardia.md: Worker_ID + Timestamp + Nonce + HMAC-SHA256

export const QR_REFRESH_INTERVAL_SECONDS = 15;
export const QR_TOLERANCE_SECONDS = 35; // Allow for transmission and scanning lag
const SECRET_SALT = 'wardia_secure_dynamic_salt_2026_shift_key';

/**
 * Generate HMAC-SHA256 hex string using Web Crypto API
 */
export async function generateHmacSha256(message, secret = SECRET_SALT) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates a signed dynamic QR token payload
 */
export async function createDynamicQrToken(workerId, bookingId) {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = Math.random().toString(36).substring(2, 10);
  const payloadToSign = `${workerId}:${bookingId}:${timestamp}:${nonce}`;
  const signature = await generateHmacSha256(payloadToSign);

  // Format: WARDIA:workerId:bookingId:timestamp:nonce:signature
  return `WARDIA:${payloadToSign}:${signature.substring(0, 16)}`;
}

/**
 * Verifies a dynamic QR token string
 */
export async function verifyDynamicQrToken(tokenString) {
  if (!tokenString || typeof tokenString !== 'string') {
    return {
      isValidFormat: false,
      isExpired: true,
      isAuthentic: false,
      reason: 'رمز فارغ أو غير صالح',
    };
  }

  const parts = tokenString.trim().split(':');
  if (parts.length !== 6 || parts[0] !== 'WARDIA') {
    return {
      isValidFormat: false,
      workerId: 0,
      bookingId: 0,
      timestamp: 0,
      nonce: '',
      signature: '',
      isExpired: true,
      isAuthentic: false,
      ageSeconds: 0,
      reason: 'تنسيق رمز الاستجابة السريعة (QR) غير صالح أو لا يتبع منظومة وردية',
    };
  }

  const workerId = parseInt(parts[1], 10);
  const bookingId = parseInt(parts[2], 10);
  const timestamp = parseInt(parts[3], 10);
  const nonce = parts[4];
  const providedSignature = parts[5];

  const nowSeconds = Math.floor(Date.now() / 1000);
  const ageSeconds = nowSeconds - timestamp;

  // Check expiration (Anti-replay window)
  if (ageSeconds > QR_TOLERANCE_SECONDS || ageSeconds < -10) {
    return {
      isValidFormat: true,
      workerId,
      bookingId,
      timestamp,
      nonce,
      signature: providedSignature,
      isExpired: true,
      isAuthentic: false,
      ageSeconds,
      reason: `انتهت صلاحية الرمز! مر على توليده ${ageSeconds} ثانية (الحد الأقصى ${QR_TOLERANCE_SECONDS} ثانية)`,
    };
  }

  // Verify HMAC-SHA256 signature
  const payloadToSign = `${workerId}:${bookingId}:${timestamp}:${nonce}`;
  const fullSignature = await generateHmacSha256(payloadToSign);
  const expectedSignaturePrefix = fullSignature.substring(0, 16);

  if (expectedSignaturePrefix !== providedSignature) {
    return {
      isValidFormat: true,
      workerId,
      bookingId,
      timestamp,
      nonce,
      signature: providedSignature,
      isExpired: false,
      isAuthentic: false,
      ageSeconds,
      reason: 'فشل التحقق من التوقيع الرقمي للرمز (تنبيه: محاولة تزوير أو تلاعب)',
    };
  }

  return {
    isValidFormat: true,
    workerId,
    bookingId,
    timestamp,
    nonce,
    signature: providedSignature,
    isExpired: false,
    isAuthentic: true,
    ageSeconds,
  };
}
