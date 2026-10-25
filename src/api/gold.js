// Vercel Serverless Function — Altın Fiyatları (Web Scraping)
// Source : https://bigpara.hurriyet.com.tr/altin/
// Endpoint: GET /api/gold

// Admin only (HttpOnly session cookie). Cache-Control is `private` so a shared
// CDN cache can never hand one visitor's authorised response to another.

import { requireAdmin } from './_lib/auth.js';

let cache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const SOURCE_URL = 'https://bigpara.hurriyet.com.tr/altin/';

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  const now = Date.now();
  if (cache && (now - cacheTimestamp) < CACHE_DURATION) {
    return res.status(200).json({
      ...cache,
      cached: true,
      cacheAge: Math.floor((now - cacheTimestamp) / 1000)
    });
  }

  try {
    const response = await fetch(SOURCE_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) throw new Error(`Upstream returned ${response.status}`);

    const html = await response.text();
    const parsed = parseBigpara(html);

    if (!parsed.gold || parsed.gold.length === 0) {
      throw new Error('No rows parsed from upstream');
    }

    const responseData = {
      success: true,
      source: 'bigpara.hurriyet.com.tr',
      sourceUrl: SOURCE_URL,
      timestamp: new Date().toISOString(),
      data: parsed.gold,
      silver: parsed.silver,
      cached: false
    };

    cache = responseData;
    cacheTimestamp = Date.now();

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Scraping error:', error?.message || error);

    // Serve last good cache if it exists, even if expired
    if (cache) {
      return res.status(200).json({
        ...cache,
        cached: true,
        stale: true,
        cacheAge: Math.floor((Date.now() - cacheTimestamp) / 1000),
        note: 'Upstream unreachable, serving stale cache'
      });
    }

    return res.status(200).json({
      success: true,
      source: 'fallback',
      timestamp: new Date().toISOString(),
      data: getFallbackData(),
      silver: [],
      note: 'Upstream unreachable, using fallback'
    });
  }
}

// ──────────────────────────────────────────────────────────────
// Parser
// ──────────────────────────────────────────────────────────────
function parseBigpara(html) {
  const result = { gold: [], silver: [] };

  // Grab every <table class="tableBox"> ... </table>
  const tableRe = /<table[^>]*class="[^"]*\btableBox\b[^"]*"[^>]*>([\s\S]*?)<\/table>/gi;
  const tables = [];
  let m;
  while ((m = tableRe.exec(html)) !== null) tables.push(m[1]);

  if (tables.length === 0) return result;

  // First tableBox = gold prices, second = silver (per current bigpara layout)
  const goldRows = parseRows(tables[0]);
  result.gold = goldRows;

  if (tables.length > 1) {
    result.silver = parseRows(tables[1]);
  }

  return result;
}

function parseRows(tableHtml) {
  const rows = [];
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let tr;
  while ((tr = trRe.exec(tableHtml)) !== null) {
    const inner = tr[1];

    // Skip the header row — it doesn't have <td> children
    if (!/<td[\s>]/i.test(inner)) continue;

    // Name cell — usually <td class="cell010 tal"> with an <a> inside
    const nameCellMatch = inner.match(/<td[^>]*class="[^"]*\bcell010\b[^"]*"[^>]*>([\s\S]*?)<\/td>/i);
    if (!nameCellMatch) continue;
    const name = stripTags(nameCellMatch[1]).trim();
    if (!name) continue;

    // Value cells — every <td class="cell009 ..."> in document order
    const valueCells = [...inner.matchAll(/<td[^>]*class="[^"]*\bcell009\b[^"]*"[^>]*>([\s\S]*?)<\/td>/gi)]
      .map(c => stripTags(c[1]).trim());

    if (valueCells.length < 2) continue;

    const buying  = parseTRNumber(valueCells[0]);
    const selling = parseTRNumber(valueCells[1]);
    const rate    = parseTRPercent(valueCells[2] || '');
    const time    = (valueCells[3] || '').replace(/\s+/g, ' ').trim();

    rows.push({
      name: cleanName(name),
      buying,
      selling,
      rate,
      time
    });
  }
  return rows;
}

function stripTags(s) {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanName(n) {
  // Bigpara names sometimes look like "ALTIN (TL/GR) ALTIN_TL_GR" — keep just the human label
  return n.replace(/\s{2,}.*$/, '').trim();
}

function parseTRNumber(s) {
  if (!s) return null;
  // Turkish format: "5.123,45" => 5123.45
  const cleaned = s.replace(/[^\d,.\-]/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseTRPercent(s) {
  if (!s) return 0;
  const cleaned = s.replace(/[^\d,.\-+]/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function getFallbackData() {
  return [
    { name: 'ALTIN (TL/GR)',    buying: 6860.41, selling: 6861.27, rate: 0.01, time: '--:--' },
    { name: 'Çeyrek Altın',     buying: 11250.00, selling: 11380.00, rate: 0.05, time: '--:--' },
    { name: 'Yarım Altın',      buying: 22500.00, selling: 22760.00, rate: 0.05, time: '--:--' },
    { name: 'Tam Altın',        buying: 45000.00, selling: 45520.00, rate: 0.05, time: '--:--' },
    { name: 'Cumhuriyet Altını',buying: 46500.00, selling: 47000.00, rate: 0.04, time: '--:--' },
    { name: '22 Ayar Bilezik',  buying: 6450.00,  selling: 6520.00,  rate: 0.02, time: '--:--' }
  ];
}
