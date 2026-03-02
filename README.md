# Public Note

publicnote.com'u hatırlayanlar bilir - basit, şifreli, herkese açık not defteri. Kapandığı için kendim yazdım.

# Demo

yusuferenseyrek.com.tr

## Kullanım

Bir başlık gir, not yaz, bu kadar. Başlık hem erişim hem şifreleme anahtarı. Aynı başlığı bilen herkes aynı notu görür.

## Kurulum

Dosyaları PHP destekli sunucuya at. `notes/` klasörü kendisi oluşur.

Lokalde denemek için:
```bash
php -S localhost:8000
```

## Teknik

Başlık girince SHA-256 hash'i alınıyor, bu hash hem dosya adı hem şifreleme anahtarı oluyor. Yani sunucuda `notes/a3f2b8c9...json` gibi dosyalar var ama içindeki veri AES-256 ile şifreli.

```
başlık → SHA-256 → dosya adı + AES anahtarı
                 ↓
        notes/{hash}.json (şifreli içerik)
```

**Dosyalar:**
- `index.html` - tek sayfa UI
- `app.js` - CryptoJS ile şifreleme/çözme
- `api.php` - GET/POST ile not okuma/yazma
- `notes/` - notların tutulduğu klasör

**API:**
- `GET api.php?id={hash}` - notu getir
- `POST api.php` - `{id, content}` ile kaydet

## Lisans

MIT
