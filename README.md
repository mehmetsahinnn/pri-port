# Mehmet Şahin - Portfolio Website

Kişisel portfolio sitesi. Herkese açık bir vitrin ve yalnızca admin oturumuyla erişilen gizli araçlar (altın takibi, nazar duaları) içerir. Vercel üzerinde çalışır.

## Özellikler

- **Frontend**: Vanilla HTML/CSS/JS (ES modules), TR/EN dil desteği, koyu/açık tema
- **Backend**: Vercel Serverless Functions (Node.js)
- **Gizli araçlar**: Sunucu tarafında doğrulanan HttpOnly cookie oturumu arkasında
- **SEO**: meta/Open Graph/JSON-LD, `robots.txt`

## Proje yapısı

```
pri-port/
├── src/                          # Yayınlanan klasör
│   ├── index.html                # Herkese açık portfolio
│   ├── admin.html                # Yönetim paneli (veriyi API'den alır, oturum yoksa ana sayfaya atar)
│   ├── robots.txt, site.webmanifest, favicon*
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   │   ├── main.js           # Giriş noktası
│   │   │   └── modules/          # ui, theme, i18n, translations, admin, storage
│   │   ├── img/                  # WebP görseller
│   │   └── pdf/
│   └── api/                      # Serverless functions
│       ├── hello.js              # Herkese açık sağlık kontrolü
│       ├── gold.js               # Altın fiyatları (admin)
│       ├── admin-login.js        # POST: giriş, cookie set eder
│       ├── admin-verify.js       # GET: oturum geçerli mi
│       ├── admin-logout.js       # POST: cookie siler
│       ├── admin-tools.js        # GET: panel araç listesi (admin)
│       ├── private.js            # GET ?page=gold|nazar (admin)
│       ├── _lib/                 # auth yardımcıları, araç kaydı (endpoint değildir)
│       └── _private/pages.js     # ÜRETİLMİŞ dosya, elle düzenleme
├── private/                      # Gizli sayfaların kaynağı (yayınlanmaz)
│   ├── gold.html
│   └── nazar.html
├── scripts/build-private.mjs     # private/*.html -> src/api/_private/pages.js
├── vercel.json
└── package.json
```

## Gizli sayfalar ve admin paneli

`gold.html` ve `nazar.html` artık `src/` içinde değil; herkese açık klasörde bulunmazlar. Yalnızca geçerli admin cookie'siyle `/api/private?page=<ad>` üzerinden sunulur. Oturumu olmayan biri `404` alır.

Giriş: ana sayfanın altındaki "All rights reserved." yazısına 3 kez hızlı tıkla → giriş penceresi. Giriş sonrası menüde ve ana butonda **Admin Panel** çıkar, `/admin.html` açılır.

| Adres | Erişim |
|---|---|
| `/` , `/api/hello` | Herkese açık |
| `/admin.html` | Kabuk herkese açık, içeriği (`/api/admin-tools`) yalnızca admin |
| `/api/gold`, `/api/private?page=gold`, `/api/private?page=nazar` | Yalnızca admin |

### Yeni araç eklemek

1. Sayfaysa `private/<ad>.html` oluştur, `npm run build:private` çalıştır ve üretilen `src/api/_private/pages.js` dosyasını commit et.
2. `src/api/_lib/tools.js` içindeki `TOOLS` listesine kaydı ekle. Panelde otomatik görünür.

`private/` altında bir sayfayı değiştirdiysen `npm run build:private` çalıştırmayı unutma; yayınlanan kopya `pages.js`'tir.

## Ortam değişkenleri

Vercel proje ayarlarında tanımla (`.env` repoya girmez):

| Değişken | Açıklama |
|---|---|
| `ADMIN_USERNAME` | Admin kullanıcı adı |
| `ADMIN_PASSWORD` | Admin şifresi |
| `ADMIN_SECRET` | Oturum imzası için uzun rastgele metin (`openssl rand -hex 32`) |

Üçünden biri eksikse admin uçları `500` döner.

## Güvenlik notları

- Oturum `HttpOnly; Secure; SameSite=Strict` cookie'dedir, JavaScript okuyamaz. Süre: 12 saat.
- Giriş/çıkış uçları aynı-origin kontrolü yapar, CORS başlığı göndermez.
- Giriş denemeleri IP başına izlenir; 5 hatadan sonra kilit süresi 1, 2, 4… dakika (en fazla 1 saat) olarak artar. **Bu sayaç fonksiyon örneğinin belleğindedir**, tüm örnekler için global değildir. Kesin sınır için Vercel Firewall'da `/api/admin-login` için bir rate-limit kuralı ekle.
- Admin yanıtları `Cache-Control: private, no-store` ile gelir; CDN başkasına servis edemez.

## Geliştirme ve deploy

```bash
npm i -g vercel
npm run dev:local # Vercel girişi gerektirmez, API'ler dahil http://localhost:3000
                  # (admin için ADMIN_* değişkenlerini .env.local içine yaz)
vercel dev        # Vercel'i birebir taklit eder, `vercel login` gerekir
npx serve src     # sadece statik önizleme, API çalışmaz

vercel            # preview deploy
vercel --prod     # production deploy
```

## İletişim

- **LinkedIn**: [linkedin.com/in/msahinnn](https://www.linkedin.com/in/msahinnn/)
- **GitHub**: [github.com/mehmetsahinnn](https://github.com/mehmetsahinnn)
- **Email**: mehmetsahinn2002@gmail.com
