// Vercel Serverless Function — Private Pages
// Endpoint: GET /api/private?page=<name>   (admin cookie required)
//
// Pages such as the gold tracker live outside the public folder (see
// /private and scripts/build-private.mjs) and are only ever sent to a browser
// holding a valid admin session. Everyone else gets a plain 404 so the pages
// do not even reveal that they exist.

import { getSession } from './_lib/auth.js';
import pages from './_private/pages.js';

export default function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const name = String(req.query?.page || '');
  const html = Object.prototype.hasOwnProperty.call(pages, name) ? pages[name] : null;

  if (!process.env.ADMIN_SECRET || !getSession(req) || !html) {
    return res.status(404).send('Not found');
  }

  // The pages use site-relative asset paths; this URL lives under /api/.
  const withBase = html.replace(/<head>/i, '<head>\n    <base href="/">');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(withBase);
}
