# Cara Deploy — Backend Sudah Ditambahkan

Situs ini sekarang punya backend beneran (bukan cuma static HTML lagi):
- **Form kontak** → tersimpan jadi "leads" di database
- **Admin panel** di `/admin` → kelola leads, lihat analytics, edit konten
- **Analytics** → tracking pengunjung otomatis

Backend-nya jalan di atas **Netlify Functions** (serverless) + **Netlify Blobs**
(database key-value bawaan Netlify). Keduanya gratis di plan Netlify free.

## File baru yang ditambahkan

```
netlify.toml                     ← config Netlify (lokasi functions, dll)
package.json                     ← daftar dependency buat functions
netlify/functions/auth.mjs       ← login/logout admin
netlify/functions/content.mjs    ← simpan & ambil konten (CMS)
netlify/functions/leads.mjs      ← simpan & ambil pesan masuk
netlify/functions/analytics.mjs  ← tracking & ambil data pengunjung
netlify/functions/lib/utils.mjs  ← helper bersama (auth, koneksi database)
admin.html / admin.js / admin.css ← halaman admin panel
```

File lama (`index.html`, `main.js`, `style.css`, `data.js`) juga ada
penyesuaian kecil: nambah form kontak, manggil analytics, dan fetch
konten dari backend.

**Penting:** kalau backend belum sempat di-deploy atau lagi error, situs
utama tetap jalan normal pakai konten default yang ada di HTML — gak bakal
blank atau rusak. Backend ini sifatnya "tambahan", bukan pengganti.

## ⚠️ Cara deploy SEKARANG BEDA dari sebelumnya

Dulu lo bisa drag & drop file ke Netlify "Deploys" page. **Sekarang gak
bisa lagi** — karena drag & drop manual gak bisa proses folder
`netlify/functions`. Functions cuma akan jalan kalau di-deploy lewat salah
satu dari dua cara ini:

### Cara 1 — Connect ke GitHub (paling direkomendasikan)

1. Push semua file (termasuk `netlify.toml`, `package.json`, folder
   `netlify/`, dan `admin.*`) ke repo GitHub.
2. Di Netlify dashboard → **Add new site → Import an existing project** →
   pilih repo itu.
3. Build command: kosongin aja (situs ini gak perlu build step).
   Publish directory: `.`
4. Netlify otomatis `npm install` dan bundle functions-nya tiap kali lo
   push perubahan baru.

### Cara 2 — Netlify CLI (kalau gak mau pakai GitHub)

```bash
npm install -g netlify-cli
cd folder-project-lo
npm install              # install @netlify/blobs dulu, WAJIB sebelum deploy
netlify login
netlify link              # hubungkan ke site Netlify yang sudah ada
netlify deploy --prod     # bundle functions + upload
```

## Setelah deploy: WAJIB set environment variable

Backend ini butuh 1 environment variable buat password admin:

1. Netlify dashboard → site lo → **Site configuration → Environment variables**
2. Tambah variable baru:
   - Key: `ADMIN_PASSWORD`
   - Value: password yang lo mau pakai buat login ke `/admin` (pilih yang kuat, jangan yang gampang ditebak)
3. **Redeploy** site (env var baru cuma kebaca setelah deploy ulang)

Kalau variable ini belum di-set, halaman `/admin` akan kasih tau lewat
pesan error pas lo coba login — bukan diem-diem error.

## Cara pakai admin panel

1. Buka `https://situs-lo.netlify.app/admin`
2. Masukin password (`ADMIN_PASSWORD` yang lo set di atas)
3. Tab yang tersedia:
   - **Pesan Masuk** — semua submission dari form kontak, bisa ubah status (Baru/Dibaca/Dibalas/Selesai)
   - **Analytics** — total kunjungan, visitor unik, halaman terpopuler, breakdown device
   - **Konten** — info kontak (WA/email/sosmed), teks 3 hero slide, dan harga + fitur tiap paket pricing
   - **Portofolio** — tambah/hapus/urutkan project, edit judul/kategori/deskripsi/video/thumbnail
   - **Video Reels** — tambah/hapus/urutkan video reel
   - **Artikel** — tulis/edit/hapus artikel blog (artikel paling atas otomatis jadi featured)
   - **Galeri** — tambah/hapus/urutkan foto galeri

## Batasan yang perlu lo tau

- Di tab Konten, harga Starter & Business yang asalnya punya opsi
  "per bulan / per tahun" (dengan diskon) disederhanakan jadi 1 harga
  saja kalau diedit lewat admin — toggle bulan/tahun di halaman utama
  tetap ada tapi akan nampilin angka yang sama di kedua mode.
- Upload gambar belum ada di admin panel ini — field gambar (thumbnail
  portfolio, cover artikel, foto galeri, dll) diisi pakai **URL gambar**
  (misalnya link dari Unsplash, atau gambar yang udah lo upload ke
  layanan lain). Kalau butuh upload file langsung dari admin, bilang aja,
  bisa ditambahin pakai Netlify Blobs juga.
- Analytics itu hitungan sederhana (page view + visitor unik via IP
  yang di-hash), bukan analytics selengkap Google Analytics — cukup buat
  pantau tren kunjungan harian.
