require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));

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

// Hanya jalankan app.listen jika file ini dijalankan langsung (bukan via Vercel)
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server backend berjalan di http://localhost:${port}`);
    });
}

// Export module WAJIB dilakukan agar Vercel bisa membacanya sebagai Serverless Function
module.exports = app;
