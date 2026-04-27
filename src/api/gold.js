// Vercel Serverless Function - Altın ve Döviz Fiyatları API (Web Scraping)
// Endpoint: /api/gold

// Cache storage (5 minutes)
let cache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check cache
  const now = Date.now();
  if (cache && (now - cacheTimestamp) < CACHE_DURATION) {
    return res.status(200).json({
      ...cache,
      cached: true,
      cacheAge: Math.floor((now - cacheTimestamp) / 1000)
    });
  }

  try {
    // Fetch HTML from haremaltin.com
    const response = await fetch('https://www.haremaltin.com/', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from haremaltin.com');
    }

    const html = await response.text();

    // Parse HTML to extract gold prices
    const scrapedData = parseGoldData(html);

    if (!scrapedData || scrapedData.length === 0) {
      throw new Error('Failed to parse gold data');
    }

    const responseData = {
      success: true,
      source: 'haremaltin.com',
      timestamp: new Date().toISOString(),
      data: scrapedData
    };

    // Store in cache
    cache = responseData;
    cacheTimestamp = Date.now();

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Scraping error:', error);
    return res.status(200).json({
      success: true,
      source: 'fallback',
      timestamp: new Date().toISOString(),
      data: getFallbackData(),
      note: 'Scraping error, using fallback data'
    });
  }
}

// Parse HTML to extract gold and currency prices
function parseGoldData(html) {
  const data = [];

  try {
    // Extract GRAM ALTIN (Gram Gold)
    const gramAltinMatch = html.match(/id="tr__KULCEALTIN"[\s\S]*?id="alis__KULCEALTIN">([0-9.,]+)<[\s\S]*?id="satis__KULCEALTIN">([0-9.,]+)<[\s\S]*?id="yuzde__KULCEALTIN">%([0-9.,]+)</);
    if (gramAltinMatch) {
      data.push({
        name: 'Gram Altın',
        buying: Number.parseFloat(gramAltinMatch[1].replace('.', '').replace(',', '.')),
        selling: Number.parseFloat(gramAltinMatch[2].replace('.', '').replace(',', '.')),
        rate: Number.parseFloat(gramAltinMatch[3].replace(',', '.')),
        time: new Date().toLocaleString('tr-TR')
      });
    }

    // Extract USD (Dolar)
    const usdMatch = html.match(/id="tr__(USD|DOLAR)"[\s\S]*?id="alis__(USD|DOLAR)">([0-9.,]+)<[\s\S]*?id="satis__(USD|DOLAR)">([0-9.,]+)<[\s\S]*?id="yuzde__(USD|DOLAR)">%([0-9.,]+)/);
    if (usdMatch) {
      data.push({
        name: 'Amerikan Doları',
        buying: Number.parseFloat(usdMatch[3].replace('.', '').replace(',', '.')),
        selling: Number.parseFloat(usdMatch[5].replace('.', '').replace(',', '.')),
        rate: Number.parseFloat(usdMatch[7].replace(',', '.')),
        time: new Date().toLocaleString('tr-TR')
      });
    }

    // Extract EUR (Euro)
    const eurMatch = html.match(/id="tr__EUR"[\s\S]*?id="alis__EUR">([0-9.,]+)<[\s\S]*?id="satis__EUR">([0-9.,]+)<[\s\S]*?id="yuzde__EUR">%([0-9.,]+)/);
    if (eurMatch) {
      data.push({
        name: 'Euro',
        buying: Number.parseFloat(eurMatch[1].replace('.', '').replace(',', '.')),
        selling: Number.parseFloat(eurMatch[2].replace('.', '').replace(',', '.')),
        rate: Number.parseFloat(eurMatch[3].replace(',', '.')),
        time: new Date().toLocaleString('tr-TR')
      });
    }

  } catch (error) {
    console.error('Parse error:', error);
    return null;
  }

  return data.length > 0 ? data : null;
}

function getFallbackData() {
  return [
    { name: 'Amerikan Doları', buying: 43.583, selling: 43.702, rate: 0.36, time: '2026-02-03 1:1:1' },
    { name: 'Euro', buying: 51.287, selling: 51.539, rate: 0.54, time: '2026-02-03 1:1:1' },
    { name: 'Gram Altın', buying: 6860.41, selling: 6861.27, rate: 0.01, time: '2026-02-03 1:1:1' }
  ];
}
