// Vercel Serverless Function — Admin Login
// Endpoint: POST /api/admin-login   body: { username, password }
//
// Required environment variables (set in Vercel project settings):
//   ADMIN_USERNAME  — admin username
//   ADMIN_PASSWORD  — admin password
//   ADMIN_SECRET    — long random string used to sign session tokens (HMAC-SHA256)
//
// On success the signed session is set as an HttpOnly, SameSite=Strict cookie
// (never exposed to page JavaScript) and the response is 200 { ok: true, exp }.
//   401 { error: "Invalid credentials" }  on failure
//   429 { error: "Too many attempts" }    when locked out
//
// No CORS headers are sent on purpose: only same-origin pages may call this.

import crypto from 'crypto';
import { SESSION_TTL_MS, isSameOrigin, setSessionCookie, signToken } from './_lib/auth.js';

// Failed-attempt tracking per client IP. This lives in the memory of a warm
// function instance, so it slows brute force but is NOT a global limit; pair it
// with a Vercel Firewall rate-limit rule on /api/admin-login for a hard cap.
const attempts = new Map(); // ip → { count, windowStart, lockedUntil }
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const BASE_LOCK_MS = 60 * 1000;
const MAX_TRACKED_IPS = 5000;

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest();
}

// Hashing first makes both buffers 32 bytes, so the comparison leaks neither
// content nor length.
function safeEqual(a, b) {
  return crypto.timingSafeEqual(sha256(a), sha256(b));
}

function clientIp(req) {
  return (
    (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function pruneAttempts(now) {
  if (attempts.size < MAX_TRACKED_IPS) return;
  for (const [ip, rec] of attempts) {
    if (now - rec.windowStart > WINDOW_MS && rec.lockedUntil < now) attempts.delete(ip);
  }
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SECRET } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_SECRET) {
    return res.status(500).json({ error: 'Server is missing admin configuration' });
  }

  const ip = clientIp(req);
  const now = Date.now();
  pruneAttempts(now);

  let rec = attempts.get(ip);
  if (!rec || now - rec.windowStart > WINDOW_MS) {
    rec = { count: 0, windowStart: now, lockedUntil: 0 };
    attempts.set(ip, rec);
  }
  if (rec.lockedUntil > now) {
    res.setHeader('Retry-After', String(Math.ceil((rec.lockedUntil - now) / 1000)));
    return res.status(429).json({ error: 'Too many attempts' });
  }

  // Vercel auto-parses JSON bodies; fall back for string bodies.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const username = (body && body.username) || '';
  const password = (body && body.password) || '';

  // Evaluate both so timing does not reveal which field was wrong.
  const userOk = safeEqual(username, ADMIN_USERNAME);
  const passOk = safeEqual(password, ADMIN_PASSWORD);

  if (!userOk || !passOk) {
    rec.count += 1;
    if (rec.count >= MAX_FAILURES) {
      // Lockout doubles with every further failure: 1m, 2m, 4m, ... capped at 1h.
      const over = rec.count - MAX_FAILURES;
      rec.lockedUntil = now + Math.min(BASE_LOCK_MS * 2 ** over, 60 * 60 * 1000);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  attempts.delete(ip);
  setSessionCookie(req, res, signToken(ADMIN_SECRET));
  return res.status(200).json({ ok: true, exp: Date.now() + SESSION_TTL_MS });
}
