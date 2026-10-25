// Vercel Serverless Function — Public Qualifications
// Endpoint: GET /api/qualifications
// Returns the education / work items the site renders. Edited from the admin
// panel (see admin-qualifications.js). Falls back to the built-in defaults if
// storage is empty or unreachable, so the page never ends up blank.

import { DEFAULT_ITEMS, loadItems, sortItems } from './_lib/qualifications.js';

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let items;
  try {
    ({ items } = await loadItems());
  } catch (err) {
    console.error('qualifications: storage read failed, using defaults', err?.message || err);
    items = DEFAULT_ITEMS;
  }

  // Edits show up within a minute at the CDN; stale copies are served meanwhile.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  const sorted = sortItems(items);
  return res.status(200).json({
    education: sorted.filter((i) => i.type === 'education'),
    work: sorted.filter((i) => i.type === 'work'),
  });
}
