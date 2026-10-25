// Shared admin-session helpers. Files under a `_`-prefixed folder are not
// exposed as endpoints by Vercel; they are only bundled when imported.
//
// The session is an HMAC-signed token kept in an HttpOnly cookie, so page
// JavaScript (and any XSS) can never read it.

import crypto from 'crypto';

export const COOKIE_NAME = 'admin_session';
export const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

export function signToken(secret, ttlMs = SESSION_TTL_MS) {
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

// Returns the payload when signature and expiry are valid, otherwise null.
export function verifyToken(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;

  const [payloadStr, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!payload || payload.sub !== 'admin' || typeof payload.exp !== 'number' || payload.exp < Date.now()) {
    return null;
  }
  return payload;
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}

export function getSession(req) {
  const { ADMIN_SECRET } = process.env;
  if (!ADMIN_SECRET) return null;
  return verifyToken(readCookie(req, COOKIE_NAME), ADMIN_SECRET);
}

function isLocalhost(req) {
  const host = (req.headers.host || '').split(':')[0];
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

function cookie(req, value, maxAgeSec) {
  const parts = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAgeSec}`,
  ];
  // Safari refuses Secure cookies on plain-http localhost.
  if (!isLocalhost(req)) parts.push('Secure');
  return parts.join('; ');
}

export function setSessionCookie(req, res, token) {
  res.setHeader('Set-Cookie', cookie(req, token, Math.floor(SESSION_TTL_MS / 1000)));
}

export function clearSessionCookie(req, res) {
  res.setHeader('Set-Cookie', cookie(req, '', 0));
}

// Rejects cross-site state-changing requests. Browsers always send Origin on
// cross-origin POSTs; a mismatch with Host means the request is not ours.
export function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

// Guard for admin-only endpoints. Returns the session, or null after having
// already written the error response.
export function requireAdmin(req, res) {
  if (!process.env.ADMIN_SECRET) {
    res.status(500).json({ error: 'Missing server config' });
    return null;
  }
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return session;
}
