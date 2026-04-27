// Vercel Serverless Function — Admin Login
// Endpoint: POST /api/admin-login
//
// Required environment variables (set in Vercel project settings):
//   ADMIN_USERNAME  — admin username
//   ADMIN_PASSWORD  — admin password (plain string; consider hashing for higher security)
//   ADMIN_SECRET    — long random string used to sign session tokens (HMAC-SHA256)
//
// Returns:
//   200 { token: "<base64url payload>.<hex hmac>" }  on success
//   401 { error: "Invalid credentials" }            on failure
//   429 { error: "Too many attempts" }              when rate-limited (best-effort, in-memory)

import crypto from 'crypto';

// In-memory rate limiter (per warm instance — best-effort).
const attempts = new Map(); // key: ip → { count, firstTs }
const WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 8;

function timingSafeEqualStr(a, b) {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function signToken(secret, ttlMs = 1000 * 60 * 60 * 12) {
  const payload = {
    sub: 'admin',
    iat: Date.now(),
    exp: Date.now() + ttlMs,
    nonce: crypto.randomBytes(8).toString('hex'),
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
  return `${payloadStr}.${sig}`;
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SECRET } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_SECRET) {
    return res.status(500).json({ error: 'Server is missing admin configuration' });
  }

  // Rate limit by client IP (Vercel forwards real IP via x-forwarded-for).
  const ip =
    (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && now - rec.firstTs < WINDOW_MS) {
    if (rec.count >= MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many attempts. Try again in a minute.' });
    }
  } else {
    attempts.set(ip, { count: 0, firstTs: now });
  }

  // Parse body (Vercel auto-parses JSON for application/json).
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const username = (body && body.username) || '';
  const password = (body && body.password) || '';

  const userOk = timingSafeEqualStr(username, ADMIN_USERNAME);
  const passOk = timingSafeEqualStr(password, ADMIN_PASSWORD);

  if (!userOk || !passOk) {
    const r = attempts.get(ip);
    if (r) r.count += 1;
    // Constant-ish delay to flatten timing differences.
    await new Promise(r2 => setTimeout(r2, 250));
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Reset counter on success.
  attempts.delete(ip);

  const token = signToken(ADMIN_SECRET);
  return res.status(200).json({ token });
}
