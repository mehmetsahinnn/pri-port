// Vercel Serverless Function — Admin Tool Registry
// Endpoint: GET /api/admin-tools (admin cookie required)
// Feeds the cards on /admin.html.

import { requireAdmin } from './_lib/auth.js';
import { TOOLS } from './_lib/tools.js';

export default function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const session = requireAdmin(req, res);
  if (!session) return;

  return res.status(200).json({ tools: TOOLS, exp: session.exp });
}
