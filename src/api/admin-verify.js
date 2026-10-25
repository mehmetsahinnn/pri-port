// Vercel Serverless Function — Check Admin Session
// Endpoint: GET /api/admin-verify
// Reads the HttpOnly session cookie. 200 { ok: true, exp } when the signature
// and expiry are valid, 401 { ok: false } otherwise.

import { getSession } from './_lib/auth.js';

export default function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.ADMIN_SECRET) return res.status(500).json({ error: 'Missing server config' });

  const session = getSession(req);
  if (!session) return res.status(401).json({ ok: false });
  return res.status(200).json({ ok: true, exp: session.exp });
}
