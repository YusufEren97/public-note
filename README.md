# Public Note

A simple, encrypted, public notepad. Inspired by the original publicnote.com — rebuilt from scratch.

[Türkçe](#turkce) | [English](#english)

---

<a id="english"></a>

## Overview

Public Note is a minimalist web application that lets anyone create and access encrypted notes using only a title. The title serves as both the access key and the encryption passphrase — no accounts, no passwords, no registration.

**Live Demo:** [yusuferenseyrek.com.tr](https://yusuferenseyrek.com.tr)

## How It Works

1. Enter a title on the home screen.
2. The title is hashed using **SHA-256** to generate a unique identifier.
3. This hash is used as the filename on the server and as the **AES-256** encryption key.
4. Notes are encrypted entirely on the client side before being sent to the server.
5. The server never sees plaintext content.

```
Title --> SHA-256 --> filename + AES key
                        |
               notes/{hash}.json (encrypted content)
```

## Features

- **Zero-knowledge architecture** — the server stores only encrypted data
- **Client-side AES-256 encryption** — powered by CryptoJS
- **Auto-save** — notes are saved automatically after 1 second of inactivity
- **No authentication required** — the title is your key
- **Single-page interface** — clean, distraction-free design
- **Custom 404 page** — consistent brand experience

## Installation

Deploy the files to any PHP-enabled web server. The `notes/` directory is created automatically on first use.

**Local development:**

```bash
php -S localhost:8000
```

## Project Structure

```
public-note/
├── index.html          # Single-page UI
├── api.php             # REST API for reading/writing notes
├── 404.html            # Custom 404 error page
├── assets/
│   ├── css/
│   │   └── style.css   # Stylesheet
│   ├── js/
│   │   └── app.js      # Client-side encryption/decryption logic (CryptoJS)
│   └── img/
│       └── favicon.png # Favicon
└── notes/              # Encrypted note storage (auto-generated)
```

## API Reference

| Method | Endpoint            | Body               | Description         |
|--------|---------------------|---------------------|---------------------|
| GET    | `api.php?id={hash}` | —                   | Retrieve a note     |
| POST   | `api.php`           | `{ id, content }`   | Save a note         |

**Response format:**

```json
{
  "success": true,
  "content": "encrypted_string"
}
```

## Security

- All encryption and decryption occurs in the browser. The server only handles storage of already-encrypted data.
- Note identifiers are SHA-256 hashes — the original title is never transmitted or stored.
- Input validation enforces a strict 64-character hexadecimal format for note IDs.

## License

MIT

---

<a id="turkce"></a>

## Genel Bakış

Public Note, yalnızca bir başlık kullanarak şifreli notlar oluşturup erişmenizi sağlayan minimalist bir web uygulamasıdır. Başlık hem erişim anahtarı hem de şifreleme parolası olarak kullanılır. Hesap, parola veya kayıt gerektirmez.

**Canlı Demo:** [yusuferenseyrek.com.tr](https://yusuferenseyrek.com.tr)

## Nasıl Çalışır

1. Ana ekranda bir başlık girin.
2. Başlık, benzersiz bir tanımlayıcı oluşturmak için **SHA-256** ile hashlenir.
3. Bu hash, sunucuda dosya adı ve **AES-256** şifreleme anahtarı olarak kullanılır.
4. Notlar sunucuya gönderilmeden önce tamamen istemci tarafında şifrelenir.
5. Sunucu hiçbir zaman düz metin içeriğe erişemez.

```
Başlık --> SHA-256 --> dosya adı + AES anahtarı
                         |
                notes/{hash}.json (şifreli içerik)
```

## Özellikler

- **Sıfır bilgi mimarisi** — sunucu yalnızca şifreli veri saklar
- **İstemci taraflı AES-256 şifreleme** — CryptoJS tabanlı
- **Otomatik kayıt** — 1 saniye hareketsizlikten sonra notlar otomatik kaydedilir
- **Kimlik doğrulama gerektirmez** — başlık sizin anahtarınızdır
- **Tek sayfa arayüz** — sade, dikkat dağıtmayan tasarım
- **Özel 404 sayfası** — tutarlı marka deneyimi

## Kurulum

Dosyaları PHP destekli herhangi bir web sunucusuna yükleyin. `notes/` dizini ilk kullanımda otomatik olarak oluşturulur.

**Yerel geliştirme:**

```bash
php -S localhost:8000
```

## Proje Yapısı

```
public-note/
├── index.html          # Tek sayfa arayüz
├── api.php             # Not okuma/yazma REST API
├── 404.html            # Özel 404 hata sayfası
├── assets/
│   ├── css/
│   │   └── style.css   # Stil dosyası
│   ├── js/
│   │   └── app.js      # İstemci taraflı şifreleme/çözme mantığı (CryptoJS)
│   └── img/
│       └── favicon.png # Site ikonu
└── notes/              # Şifreli not deposu (otomatik oluşturulur)
```

## API Referansı

| Metod | Endpoint            | Gövde                | Açıklama            |
|-------|---------------------|----------------------|---------------------|
| GET   | `api.php?id={hash}` | —                    | Notu getir          |
| POST  | `api.php`           | `{ id, content }`    | Notu kaydet         |

**Yanıt formatı:**

```json
{
  "success": true,
  "content": "şifreli_metin"
}
```

## Güvenlik

- Tüm şifreleme ve çözme işlemleri tarayıcıda gerçekleşir. Sunucu yalnızca önceden şifrelenmiş verilerin depolanmasını yönetir.
- Not tanımlayıcıları SHA-256 hashleridir — orijinal başlık asla iletilmez veya saklanmaz.
- Girdi doğrulaması, not kimlikleri için 64 karakterlik onaltılık formatı zorunlu kılar.

## Lisans

MIT
