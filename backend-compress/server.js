require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));

// Keamanan: Menyembunyikan header Express dan mencegah XSS
app.use(helmet());

// Keamanan: Rate Limiter (Mencegah Spam/DDoS level aplikasi)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 60, // Limit 60 request per IP (dinaikkan karena kompresi gambar dikirim 1 per 1 dari frontend)
    message: 'Terlalu banyak permintaan dari IP ini, coba lagi dalam 15 menit.',
    standardHeaders: true, 
    legacyHeaders: false,
});
app.use(limiter);

// Gunakan Memory Storage (File disimpan di RAM sementara, bukan di disk)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // Batas ukuran 20MB
});

app.post('/api/compress', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('Tidak ada file gambar yang diunggah.');
        }

        const quality = parseInt(req.body.quality) || 60;
        const mimeType = req.file.mimetype;

        let sharpInstance = sharp(req.file.buffer);

        // Atur kualitas berdasarkan format asli
        if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
            sharpInstance = sharpInstance.jpeg({ quality });
        } else if (mimeType === 'image/png') {
            sharpInstance = sharpInstance.png({ quality });
        } else if (mimeType === 'image/webp') {
            sharpInstance = sharpInstance.webp({ quality });
        }

        // Proses langsung ke buffer (TIDAK LAGI MENYIMPAN KE FILE)
        const outputBuffer = await sharpInstance.toBuffer();

        // Kirim langsung ke client sebagai file unduhan
        res.type(mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="compressed-${req.file.originalname}"`);
        res.send(outputBuffer);

    } catch (error) {
        console.error('Error saat kompresi:', error);
        res.status(500).send('Terjadi kesalahan saat memproses gambar.');
    }
});
// ENDPOINT: CONVERT GAMBAR KE PDF
app.post('/api/convert-pdf', upload.array('images', 20), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('Tidak ada file gambar yang diunggah.');
        }

        // Inisialisasi dokumen PDF baru
        const pdfDoc = await PDFDocument.create();

        // Looping untuk setiap gambar yang diunggah
        for (const file of req.files) {
            // Memaksa gambar menggunakan sharp dan mengambil metadata
            const sharpImage = sharp(file.buffer);
            
            // Konversi ke format JPEG (paling ringan & paling kompatibel untuk embed PDF)
            const jpegBuffer = await sharpImage.jpeg().toBuffer();
            
            // Baca ulang metadata dari jpegBuffer untuk mendapatkan dimensi final
            const metadata = await sharp(jpegBuffer).metadata();
            
            // Embed JPEG buffer ke PDF
            const jpgImage = await pdfDoc.embedJpg(jpegBuffer);
            
            // Tambahkan halaman baru dengan ukuran sesuai dimensi gambar
            const page = pdfDoc.addPage([metadata.width, metadata.height]);
            
            // Gambar image menutupi seluruh halaman
            page.drawImage(jpgImage, {
                x: 0,
                y: 0,
                width: metadata.width,
                height: metadata.height,
            });
        }

        // Simpan PDF menjadi buffer Uint8Array lalu konversi ke Node Buffer
        const pdfBytes = await pdfDoc.save();
        const pdfBuffer = Buffer.from(pdfBytes);

        // Kirimkan buffer PDF ke client
        res.type('application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="hasil-convert.pdf"');
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error saat konversi ke PDF:', error);
        res.status(500).send('Terjadi kesalahan saat mengonversi gambar ke PDF.');
    }
});

// Hanya jalankan app.listen jika file ini dijalankan langsung (bukan via Vercel)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server backend berjalan di http://localhost:${port}`);
    });
}

// Export module WAJIB dilakukan agar Vercel bisa membacanya sebagai Serverless Function
module.exports = app;
