// Vercel Serverless Function - Altın ve Döviz Fiyatları API
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
    const apiKey = process.env.RAPIDAPI_KEY || 'd3fa93a4e8msh300lacc9df3a0e622p169cf3jsnb58dfadc2d11';

    const response = await fetch('https://currency-and-gold-prices-api-in-turkish-lira.p.rapidapi.com/economy/currency/exchange-rate?code=USD%2Cgram-altin%2CEUR&type=gold', {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'currency-and-gold-prices-api-in-turkish-lira.p.rapidapi.com',
        'x-rapidapi-key': apiKey
      }
    });

    if (!response.ok) {
      return res.status(200).json({
        success: true,
        source: 'fallback',
        timestamp: new Date().toISOString(),
        data: getFallbackData()
      });
    }

    const data = await response.json();

    // API'den gelen veri array formatında
    const formattedData = Array.isArray(data) ? data.map(item => ({
      name: item.FullName,
      buying: item.buying,
      selling: item.selling,
      rate: item.changeRate,
      time: item.lastupdate
    })) : getFallbackData();

    const responseData = {
      success: true,
      source: 'live',
      timestamp: new Date().toISOString(),
      data: formattedData
    };

    // Store in cache
    cache = responseData;
    cacheTimestamp = Date.now();

    return res.status(200).json(responseData);

  } catch (error) {
    return res.status(200).json({
      success: true,
      source: 'fallback',
      timestamp: new Date().toISOString(),
      data: getFallbackData(),
      note: 'API error'
    });
  }
}

function getFallbackData() {
  return [
    { name: 'Amerikan Doları', buying: 43.583, selling: 43.702, rate: 0.36, time: '2026-02-03 22:00:08' },
    { name: 'Euro', buying: 51.287, selling: 51.539, rate: 0.54, time: '2026-02-03 22:00:08' },
    { name: 'Gram Altın', buying: 6860.41, selling: 6861.27, rate: 0.01, time: '2026-02-03 22:00:11' }
  ];
}
