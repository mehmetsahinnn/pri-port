// Vercel Serverless Function — Qualifications admin (create / update / delete)
// Endpoint: /api/admin-qualifications   (admin cookie required)
//   GET                      -> { items, source, writable }
//   POST   { type, title, org, date, order? }        -> create
//   PUT    { id, type, title, org, date, order? }    -> replace item
//   DELETE ?id=<id>                                  -> remove item
// title / org / date are { en, tr }.

import { isSameOrigin, requireAdmin } from './_lib/auth.js';
import { StoreUnavailableError, isWritable } from './_lib/store.js';
import {
  ValidationError, defaultOrder, loadItems, newId, sanitizeFields, saveItems, sortItems,
} from './_lib/qualifications.js';

function parseBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  return body && typeof body === 'object' ? body : {};
}

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store');

  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'GET' && !isSameOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { items, source } = await loadItems();

    if (req.method === 'GET') {
      return res.status(200).json({ items: sortItems(items), source, writable: await isWritable() });
    }

    const body = parseBody(req);

    if (req.method === 'POST') {
      const fields = sanitizeFields(body);
      const item = {
        id: newId(),
        ...fields,
        order: fields.order ?? defaultOrder(items, fields.type),
      };
      await saveItems([...items, item]);
      return res.status(201).json({ item });
    }

    if (req.method === 'PUT') {
      const index = items.findIndex((i) => i.id === body.id);
      if (index === -1) return res.status(404).json({ error: 'Item not found' });
      const fields = sanitizeFields(body);
      const item = { id: body.id, ...fields, order: fields.order ?? items[index].order };
      const next = [...items];
      next[index] = item;
      await saveItems(next);
      return res.status(200).json({ item });
    }

    // DELETE
    const id = String(req.query?.id || body.id || '');
    if (!items.some((i) => i.id === id)) return res.status(404).json({ error: 'Item not found' });
    await saveItems(items.filter((i) => i.id !== id));
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
    if (err instanceof StoreUnavailableError) return res.status(503).json({ error: err.message });
    console.error('admin-qualifications failed', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
