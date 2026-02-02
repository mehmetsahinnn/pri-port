// Vercel Serverless Function Example
// Endpoint: /api/hello
// Bu dosyayı ileride ihtiyacına göre genişletebilirsin

export default function handler(req, res) {
  const { method } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method === 'GET') {
    return res.status(200).json({
      message: 'Merhaba! Backend çalışıyor 🚀',
      timestamp: new Date().toISOString(),
      author: 'Mehmet Şahin'
    });
  }

  if (method === 'POST') {
    const { name } = req.body || {};
    return res.status(200).json({
      message: `Merhaba ${name || 'Ziyaretçi'}! 👋`,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
