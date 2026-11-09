import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore - ilovepdf-nodejs types
import ILovePDFApi from '@ilovepdf/ilovepdf-nodejs';
// @ts-ignore - ilovepdf-nodejs types
import ILovePDFFile from '@ilovepdf/ilovepdf-nodejs/ILovePDFFile';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const tempDir = os.tmpdir();
  let inputFilePath = '';
  let outputFilePath = '';

  try {
    const publicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    const secretKey = process.env.ILOVEPDF_SECRET_KEY;

    if (!publicKey || !secretKey || publicKey.trim() === '' || secretKey.trim() === '') {
      return NextResponse.json(
        { error: 'ILOVEPDF_PUBLIC_KEY atau ILOVEPDF_SECRET_KEY belum dikonfigurasi di file environment (.env.local).' },
        { status: 500 }
      );
    }

    // 1. Tangkap file dari formData.get('file')
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Tidak ada file dokumen yang diunggah.' },
        { status: 400 }
      );
    }

    const originalName = file.name;
    const timestamp = Date.now();
    const safeInputName = `${timestamp}-${originalName}`;
    inputFilePath = path.join(tempDir, safeInputName);

    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const pdfFileName = `${baseName}.pdf`;
    outputFilePath = path.join(tempDir, `${timestamp}-${pdfFileName}`);

    // 2. Simpan sementara buffer file tersebut ke folder /tmp (os.tmpdir)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(inputFilePath, buffer);

    // 3. Inisialisasi ILovePDFApi menggunakan PUBLIC_KEY dan SECRET_KEY
    const api = new ILovePDFApi(publicKey, secretKey);

    // 4. Buat task baru menggunakan api.newTask('officepdf')
    const task = api.newTask('officepdf');
    await task.start();

    // 5. Tambahkan file lokal tersebut ke task (task.addFile)
    const iloveFile = new ILovePDFFile(inputFilePath);
    await task.addFile(iloveFile);

    // 6. Jalankan prosesnya (task.process())
    await task.process();

    // 7. Unduh hasil PDF-nya kembali ke folder /tmp (task.download())
    const downloadedData = await task.download();
    await fs.promises.writeFile(outputFilePath, Buffer.from(downloadedData));

    // 8. Baca file PDF hasil unduhan tersebut
    const pdfBuffer = await fs.promises.readFile(outputFilePath);

    // 9. Kirimkan langsung ke frontend sebagai Buffer menggunakan NextResponse
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfFileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error saat konversi iLovePDF:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan saat memproses konversi dokumen ke PDF via iLovePDF.' },
      { status: 500 }
    );
  } finally {
    // 10. Hapus semua file sementara di /tmp menggunakan fs.promises.unlink di dalam blok finally
    if (inputFilePath) {
      try {
        await fs.promises.unlink(inputFilePath);
      } catch (err) {
        // Abaikan jika file sudah tidak ada
      }
    }
    if (outputFilePath) {
      try {
        await fs.promises.unlink(outputFilePath);
      } catch (err) {
        // Abaikan jika file sudah tidak ada
      }
    }
  }
}
