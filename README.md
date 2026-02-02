# Mehmet Şahin - Portfolio Website

Kişisel portfolio websitesi - Vercel üzerinde deploy edilmek üzere hazırlandı.

## 🚀 Özellikler

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Vercel Serverless Functions (Node.js)
- **Hosting**: Vercel (Ücretsiz Hobby Plan)

## 📁 Proje Yapısı

```
pri-port/
├── src/                    # Static frontend dosyaları
│   ├── index.html
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   ├── img/
│   │   └── pdf/
│   └── favicon files...
├── api/                    # Vercel Serverless Functions
│   └── hello.js           # Örnek API endpoint
├── vercel.json            # Vercel konfigürasyonu
├── package.json
└── .gitignore
```

## 🛠️ Kurulum

### Lokal Geliştirme

```bash
# Vercel CLI'ı global olarak kur
npm i -g vercel

# Projeyi lokal olarak çalıştır
vercel dev
```

### Deploy

```bash
# Vercel'e deploy et (ilk seferde hesap bağlantısı kurar)
vercel

# Production'a deploy et
vercel --prod
```

## 🔗 API Endpoints

### GET /api/hello
Basit bir merhaba mesajı döner.

```json
{
  "message": "Merhaba! Backend çalışıyor 🚀",
  "timestamp": "2026-02-02T12:00:00.000Z",
  "author": "Mehmet Şahin"
}
```

### POST /api/hello
Body'de `name` gönderilirse kişiselleştirilmiş mesaj döner.

```json
// Request body: { "name": "Ali" }
{
  "message": "Merhaba Ali! 👋",
  "timestamp": "2026-02-02T12:00:00.000Z"
}
```

## 📝 Notlar

- Vercel Hobby Plan ücretsizdir ve ayda 100GB bandwidth + 100K function invocation içerir
- Serverless functions cold start süresi ~200-500ms civarındadır
- Custom domain eklemek için Vercel Dashboard'u kullan

## 👤 İletişim

- **LinkedIn**: [linkedin.com/in/msahinnn](https://www.linkedin.com/in/msahinnn/)
- **GitHub**: [github.com/mehmetsahinnn](https://github.com/mehmetsahinnn)
- **Email**: mehmetsahinn2002@gmail.com
