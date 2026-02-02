// Vercel Serverless Function - Altın Fiyatları API
// Endpoint: /api/gold

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.COLLECTAPI_KEY;

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        source: 'fallback',
        timestamp: new Date().toISOString(),
        data: getFallbackData(),
        note: 'API key not configured'
      });
    }

    const response = await fetch('https://api.collectapi.com/economy/goldPrice', {
      headers: {
        'content-type': 'application/json',
        'authorization': `apikey ${apiKey}`
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

    return res.status(200).json({
      success: true,
      source: 'live',
      timestamp: new Date().toISOString(),
      data: data.result || getFallbackData()
    });

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
    { name: 'Gram Altın', buying: 6525.20, selling: 6526.79, rate: -0.24, time: '00:00:00' },
    { name: 'ONS Altın', buying: 4680.41, selling: 4681.88, rate: 0.57, time: '00:00:00' },
    { name: 'Çeyrek Altın', buying: 10595.80, selling: 10765.02, rate: 0.56, time: '00:00:00' },
    { name: 'Yarım Altın', buying: 21191.60, selling: 21562.76, rate: 0.56, time: '00:00:00' },
    { name: 'Tam Altın', buying: 42252.38, selling: 42929.20, rate: 0.56, time: '00:00:00' },
    { name: 'Cumhuriyet Altını', buying: 43233.47, selling: 43976.25, rate: 0.56, time: '00:00:00' },
    { name: '22 Ayar Bilezik', buying: 5951.96, selling: 6151.44, rate: 0.56, time: '00:00:00' },
    { name: 'Gümüş', buying: 111.51, selling: 111.69, rate: -0.97, time: '00:00:00' }
  ];
}
