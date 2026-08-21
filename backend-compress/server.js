require('dotenv').config(); // Load environment variables dari .env
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
// Gunakan PORT dari .env, atau fallback ke 5000 jika tidak ada
const port = process.env.PORT || 5000;

// Aktifkan CORS secara dinamis (mengizinkan akses dari URL Vercel atau Localhost)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));

// Pastikan folder temp/ tersedia
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

// Konfigurasi Multer untuk menyimpan file sementara di folder temp/
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        // Tambahkan timestamp untuk menghindari bentrok nama file
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Endpoint untuk kompresi gambar
app.post('/api/compress', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
    }

    // Ambil quality dari form data, default ke 60 jika tidak ada
    const qualityParam = req.body.quality ? parseInt(req.body.quality, 10) : 60;
    // Validasi quality agar berada di antara 1-100
    const finalQuality = isNaN(qualityParam) ? 60 : Math.max(1, Math.min(100, qualityParam));

    const inputPath = req.file.path;
    const outputFilename = `compressed-${req.file.filename}`;
    const outputPath = path.join(tempDir, outputFilename);

    try {
        // Kompres gambar menggunakan Sharp
        let sharpProcess = sharp(inputPath);
        
        // Sesuaikan kualitas berdasarkan tipe file gambar
        if (req.file.mimetype === 'image/png') {
            sharpProcess = sharpProcess.png({ quality: finalQuality });
        } else if (req.file.mimetype === 'image/webp') {
            sharpProcess = sharpProcess.webp({ quality: finalQuality });
        } else {
            // Default ke JPEG
            sharpProcess = sharpProcess.jpeg({ quality: finalQuality });
        }

        await sharpProcess.toFile(outputPath);

        // Kirimkan file hasil kompresi kembali ke client untuk diunduh
        res.download(outputPath, outputFilename, (err) => {
            if (err) {
                console.error('Error saat mengirim file ke client:', err);
            }

            // SANGAT PENTING: Hapus file asli dan hasil kompresi setelah dikirim
            try {
                if (fs.existsSync(inputPath)) {
                    fs.unlinkSync(inputPath);
                }
                if (fs.existsSync(outputPath)) {
                    fs.unlinkSync(outputPath);
                }
                console.log('File temporary berhasil dihapus dari storage.');
            } catch (unlinkErr) {
                console.error('Error saat menghapus file temporary:', unlinkErr);
            }
        });
    } catch (error) {
        console.error('Error saat mengompres gambar:', error);
        
        // Hapus file asli jika terjadi error saat proses kompresi
        try {
            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
            }
        } catch (unlinkErr) {
            console.error('Error saat menghapus file temporary (error blok):', unlinkErr);
        }

        res.status(500).json({ error: 'Terjadi kesalahan saat mengompres gambar.' });
    }
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
