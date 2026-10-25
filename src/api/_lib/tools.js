// Registry of everything the admin panel manages. Add a tool here and it shows
// up in /admin.html; nothing else needs to change. `page` entries are served
// through /api/private (admin cookie required); `api` entries are plain endpoints.

export const TOOLS = [
  {
    id: 'qualifications',
    type: 'manage',
    title: 'Qualifications',
    description: 'Eğitim ve iş deneyimi kayıtlarını ekle, düzenle, sil. Ana sayfa buna göre güncellenir.',
    icon: 'uil-graduation-cap',
    href: '/admin-qualifications.html',
  },
  {
    id: 'gold',
    type: 'page',
    title: 'Gold Tracker',
    description: 'Canlı altın ve gümüş fiyatları (bigpara kaynaklı, 5 dk önbellek).',
    icon: 'uil-chart-line',
    href: '/api/private?page=gold',
  },
  {
    id: 'nazar',
    type: 'page',
    title: 'Nazar Duaları',
    description: 'Ayetel Kürsi, Felak ve Nas sureleri.',
    icon: 'uil-shield-check',
    href: '/api/private?page=nazar',
  },
  {
    id: 'gold-api',
    type: 'api',
    title: 'Gold API',
    description: 'GET /api/gold — ham JSON çıktı.',
    icon: 'uil-brackets-curly',
    href: '/api/gold',
  },
  {
    id: 'hello-api',
    type: 'api',
    title: 'Hello API',
    description: 'GET /api/hello — sağlık kontrolü.',
    icon: 'uil-server',
    href: '/api/hello',
  },
];
