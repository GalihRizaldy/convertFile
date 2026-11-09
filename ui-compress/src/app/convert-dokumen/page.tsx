'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

interface ConvertedResult {
  fileName: string;
  url: string;
}

export default function ConvertDokumenPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConvertedResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setErrorMessage(null);
    setConversionResult(null);

    if (fileRejections.length > 0) {
      setErrorMessage('Format file tidak didukung. Harap pilih file Word (.docx, .doc), Excel (.xlsx, .xls), atau PowerPoint (.pptx, .ppt).');
      return;
    }

    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      // Limit 4.5 MB for Vercel serverless free tier
      if (selected.size > 4.5 * 1024 * 1024) {
        setErrorMessage('Ukuran file melebihi 4.5 MB. Harap unggah dokumen dengan ukuran maksimal 4.5 MB agar tidak terkena batas payload serverless.');
        return;
      }
      setFile(selected);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: !!file,
    multiple: false,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
    }
  });

  const getDocMeta = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'docx' || ext === 'doc') {
      return {
        label: 'Microsoft Word',
        icon: 'fa-file-word',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      };
    }
    if (ext === 'xlsx' || ext === 'xls') {
      return {
        label: 'Microsoft Excel',
        icon: 'fa-file-excel',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200'
      };
    }
    if (ext === 'pptx' || ext === 'ppt') {
      return {
        label: 'Microsoft PowerPoint',
        icon: 'fa-file-powerpoint',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200'
      };
    }
    return {
      label: 'Dokumen',
      icon: 'fa-file-lines',
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200'
    };
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsConverting(true);
    setErrorMessage(null);
    setConversionResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = 'Gagal mengonversi dokumen.';
        try {
          const errData = await res.json();
          errorMsg = errData.error || errorMsg;
        } catch {
          // Abaikan jika respons bukan JSON
        }
        throw new Error(errorMsg);
      }

      // Ubah response menjadi blob binary stream
      const blob = await res.blob();
      // Buat URL objek lokal dari blob tersebut
      const objectUrl = URL.createObjectURL(blob);

      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const pdfFileName = `${baseName}.pdf`;

      setConversionResult({
        fileName: pdfFileName,
        url: objectUrl,
      });

      // Trigger otomatis unduh
      const link = document.createElement('a');
      link.href = objectUrl;
      link.setAttribute('download', pdfFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error('Convert document error:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses dokumen.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    // Bersihkan URL objek lokal untuk mencegah memory leak
    if (conversionResult?.url) {
      URL.revokeObjectURL(conversionResult.url);
    }
    setFile(null);
    setConversionResult(null);
    setErrorMessage(null);
  };

  const Header = () => (
    <header className="h-16 bg-white border-b flex items-center px-4 sm:px-8 shrink-0 z-50 w-full justify-between relative shadow-sm">
      <div className="flex items-center space-x-8 w-full justify-between lg:justify-start">
        <a href="/" className="font-black text-2xl flex items-center cursor-pointer select-none">
          <span>I</span>
          <i className="fa-solid fa-heart mx-1.5 text-blue-500 text-xl"></i>
          <span>IMG</span>
        </a>
        
        {/* Desktop Menu */}
        <nav className="hidden lg:flex space-x-6 text-[13px] font-bold text-gray-600 h-16 items-center">
          <a href="/" className="hover:text-blue-500 transition-colors uppercase h-full flex items-center border-b-[3px] border-transparent">KOMPRES GAMBAR</a>
          <a href="/convert-gambar" className="hover:text-blue-500 transition-colors uppercase h-full flex items-center border-b-[3px] border-transparent">CONVERT GAMBAR</a>
          <a href="/convert-dokumen" className="text-emerald-600 transition-colors uppercase h-full flex items-center border-b-[3px] border-emerald-600 pt-[3px]">CONVERT DOKUMEN</a>
          <a href="/help" className="hover:text-blue-500 transition-colors uppercase h-full flex items-center border-b-[3px] border-transparent">HELP</a>
        </nav>

        {/* Mobile Hamburger Button */}
        <button 
          className="lg:hidden text-gray-600 text-2xl p-2 focus:outline-none hover:text-emerald-600 transition-colors" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-30 lg:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-16 left-0 w-full bg-white border-b shadow-lg lg:hidden z-40 flex flex-col font-bold text-[13px] text-gray-700 animate-in slide-in-from-top-2">
            <a href="/" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b hover:bg-gray-50">KOMPRES GAMBAR</a>
            <a href="/convert-gambar" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b hover:bg-gray-50">CONVERT GAMBAR</a>
            <a href="/convert-dokumen" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b text-emerald-600 bg-emerald-50">CONVERT DOKUMEN</a>
            <a href="/help" onClick={() => setIsMobileMenuOpen(false)} className="p-4 hover:bg-gray-50">HELP</a>
          </div>
        </>
      )}
    </header>
  );

  return (
    <main className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center p-4 py-10">
        
        {/* Title & Description */}
        <div className="text-center mb-8 max-w-2xl px-4">
          <h1 className="text-3xl md:text-[42px] lg:text-[46px] font-bold text-gray-800 mb-3 tracking-tight uppercase">
            Convert Dokumen ke PDF
          </h1>
          <p className="text-gray-600 text-base md:text-lg font-light">
            Ubah dokumen <span className="font-bold text-blue-600">Word</span> (.docx, .doc), <span className="font-bold text-emerald-600">Excel</span> (.xlsx, .xls), atau <span className="font-bold text-orange-600">PowerPoint</span> (.pptx, .ppt) menjadi file <span className="font-bold text-red-500">PDF</span> instan dan berkualitas tinggi.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="w-full max-w-xl mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-3 text-sm animate-in fade-in">
            <i className="fa-solid fa-circle-exclamation text-red-500 text-lg shrink-0"></i>
            <span className="flex-1">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-700">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}

        {/* State 1: Dropzone (Belum pilih file) */}
        {!file && (
          <div 
            {...getRootProps()} 
            className={`flex flex-col items-center justify-center w-full max-w-2xl h-[320px] md:h-[380px] rounded-2xl transition-all mx-4 cursor-pointer
              ${isDragActive ? 'bg-emerald-50 border-4 border-dashed border-emerald-400 scale-[1.02]' : 'bg-white border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:shadow-lg shadow-sm'}
            `}
          >
            <input {...getInputProps()} />

            <div className="flex items-center space-x-4 mb-6 text-4xl">
              <i className="fa-solid fa-file-word text-blue-500"></i>
              <i className="fa-solid fa-file-excel text-emerald-500"></i>
              <i className="fa-solid fa-file-powerpoint text-orange-500"></i>
            </div>
            
            <button 
              type="button"
              onClick={open}
              className="bg-[#059669] hover:bg-[#047857] text-white text-lg md:text-xl font-bold py-4 px-8 md:py-5 md:px-12 rounded-xl shadow-[0_8px_20px_rgba(5,150,105,0.25)] hover:shadow-[0_10px_25px_rgba(5,150,105,0.35)] transition-all transform active:scale-95 mb-3 flex items-center space-x-3"
            >
              <i className="fa-solid fa-upload text-base"></i>
              <span>Pilih Dokumen</span>
            </button>
            
            <p className="text-gray-400 font-medium text-sm md:text-base">atau seret file dokumen Anda ke sini</p>
            <p className="text-gray-400 text-xs mt-3">Mendukung: .docx, .doc, .xlsx, .xls, .pptx, .ppt (Maks 4.5 MB)</p>
          </div>
        )}

        {/* State 2: File Dipilih / Sedang Proses / Selesai */}
        {file && (
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 animate-in fade-in">
            {/* Header Card File */}
            <div className="flex items-center space-x-4 mb-6 p-4 rounded-xl border bg-gray-50/70">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-2xl ${getDocMeta(file.name).bg} ${getDocMeta(file.name).color} border ${getDocMeta(file.name).border}`}>
                <i className={`fa-solid ${getDocMeta(file.name).icon}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-base truncate">{file.name}</p>
                <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                  <span>{getDocMeta(file.name).label}</span>
                  <span>•</span>
                  <span>{formatSize(file.size)}</span>
                </div>
              </div>

              {!isConverting && !conversionResult && (
                <button 
                  onClick={handleReset}
                  className="text-gray-400 hover:text-red-500 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                  title="Ganti Dokumen"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              )}
            </div>

            {/* Hasil Konversi Sukses */}
            {conversionResult ? (
              <div className="text-center py-4 space-y-5">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Konversi Berhasil!</h3>
                  <p className="text-sm text-gray-500 truncate max-w-md mx-auto">{conversionResult.fileName}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <a 
                    href={conversionResult.url} 
                    target="_blank" 
                    rel="noreferrer"
                    download={conversionResult.fileName}
                    className="bg-[#059669] hover:bg-[#047857] text-white font-bold py-3.5 px-6 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all"
                  >
                    <i className="fa-solid fa-download"></i>
                    <span>Unduh PDF Sekarang</span>
                  </a>

                  <button 
                    onClick={handleReset}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-6 rounded-xl transition-all"
                  >
                    Konversi Dokumen Lain
                  </button>
                </div>
              </div>
            ) : (
              /* Tombol Konversi / Loading State */
              <div className="space-y-4">
                <button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-base md:text-lg flex items-center justify-center space-x-3 text-white transition-all shadow-md
                    ${isConverting ? 'bg-emerald-400 cursor-not-allowed' : 'bg-[#059669] hover:bg-[#047857] hover:shadow-lg active:scale-[0.99]'}
                  `}
                >
                  {isConverting ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      <span>Mengonversi ke PDF...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-file-pdf"></i>
                      <span>Convert ke PDF</span>
                    </>
                  )}
                </button>

                {isConverting && (
                  <p className="text-center text-xs text-gray-400 animate-pulse">
                    Mohon tunggu beberapa detik, iLovePDF sedang memproses dokumen Anda...
                  </p>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
