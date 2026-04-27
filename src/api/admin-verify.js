// Vercel Serverless Function — Verify Admin Session Token
// Endpoint: POST /api/admin-verify   body: { token }
// Returns 200 { ok: true } if signature + expiry are valid, 401 otherwise.

import crypto from 'crypto';

export default function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ADMIN_SECRET } = process.env;
  if (!ADMIN_SECRET) return res.status(500).json({ error: 'Missing server config' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const token = body && body.token;
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return res.status(401).json({ ok: false });
  }

  const [payloadStr, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(payloadStr).digest('hex');

  // Timing-safe compare on equal-length hex strings.
  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ ok: false });
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
  } catch {
    return res.status(401).json({ ok: false });
  }
  if (!payload || payload.sub !== 'admin' || typeof payload.exp !== 'number' || payload.exp < Date.now()) {
    return res.status(401).json({ ok: false });
  }

  return res.status(200).json({ ok: true, exp: payload.exp });
}
