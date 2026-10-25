// Vercel Serverless Function — Admin Logout
// Endpoint: POST /api/admin-logout — clears the session cookie.

import { clearSessionCookie, isSameOrigin } from './_lib/auth.js';

export default function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isSameOrigin(req)) return res.status(403).json({ error: 'Forbidden' });

  clearSessionCookie(req, res);
  return res.status(200).json({ ok: true });
}
