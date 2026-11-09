# I❤️IMG Clone - ConvertFile

Aplikasi web pengolah file lengkap berbasis **Next.js (App Router)** dan **Express.js (Serverless di Vercel)**.

---

## 🚀 Fitur Utama

1. **Kompres Gambar (`/`)**:
   - Kompresi gambar JPG, PNG, WEBP menggunakan **Sharp**.
   - Pengaturan persentase kualitas kompresi secara visual.
   - Preview ukuran sebelum & sesudah kompresi beserta tombol unduh instan.
   - Proteksi ukuran dan validasi maksimal 20 gambar sekaligus.

2. **Convert Gambar ke PDF (`/convert-gambar`)**:
   - Menggabungkan banyak gambar (hingga 20 file) menjadi satu dokumen PDF standar menggunakan **pdf-lib**.
   - Penomoran urutan halaman dinamis di antarmuka sebelum dikonversi.
   - Pengunduhan PDF otomatis.

3. **Convert Dokumen ke PDF (`/convert-dokumen`)**:
   - Mengonversi dokumen perkantoran (Microsoft Word `.docx`/`.doc`, Excel `.xlsx`/`.xls`, PowerPoint `.pptx`/`.ppt`) ke PDF berkualitas tinggi menggunakan **iLovePDF API** (`@ilovepdf/ilovepdf-nodejs`).
   - Penanganan serverless in-memory menggunakan direktori `/tmp` dengan pembersihan otomatis (*auto-cleanup*).
   - Pengunduhan PDF instan tanpa membebani memori browser (*blob URL revocation*).

4. **Pusat Bantuan (`/help`)**:
   - Panduan ringkas penggunaan setiap fitur.
   - Batasan sistem (maksimal 20 file gambar & payload serverless 4.5 MB).
   - Informasi pengembang.

---

## 🛠️ Arsitektur & Teknologi

* **Frontend (`ui-compress`)**:
  - Framework: **Next.js 16** (App Router, Turbopack)
  - Styling: **Tailwind CSS**
  - Ikon: **FontAwesome**
  - Komponen Upload: **react-dropzone**
  - Layanan Dokumen: **@ilovepdf/ilovepdf-nodejs**

* **Backend (`backend-compress`)**:
  - Runtime: **Node.js + Express.js**
  - Arsitektur: **Serverless Function (Vercel)**
  - Pengolah Gambar: **Sharp**
  - Pembuat PDF: **pdf-lib**
  - Keamanan: **Helmet** (HTTP Security Headers) & **express-rate-limit** (Anti-Spam/DDoS)

---

## ⚙️ Konfigurasi Environment Variable

### 1. Frontend (`ui-compress/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
ILOVEPDF_PUBLIC_KEY=masukkan_public_key_ilovepdf_anda
ILOVEPDF_SECRET_KEY=masukkan_secret_key_ilovepdf_anda
```

### 2. Backend (`backend-compress/.env`)
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

## 📦 Menjalankan Proyek di Lokal

1. **Jalankan Backend**:
   ```bash
   cd backend-compress
   npm install
   npm start
   ```

2. **Jalankan Frontend**:
   ```bash
   cd ui-compress
   npm install
   npm run dev
   ```

3. Buka browser di `http://localhost:3000`.

---

## 🛡️ Lisensi & Developer
Dikembangkan oleh [Galih Rizaldy](https://github.com/GalihRizaldy).
