// Vercel Serverless Function - Hello API
// Endpoint: /api/hello

export default function handler(req, res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Merhaba! Backend çalışıyor 🚀',
      timestamp: new Date().toLocaleDateString('en-GB', {timeZone: 'Europe/Istanbul', hour12: false}),
      author: 'Mehmet Şahin'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
