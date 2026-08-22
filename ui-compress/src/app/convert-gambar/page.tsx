'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

type FileStatus = 'pending' | 'success' | 'error';

interface FileData {
  id: string;
  file: File;
  status: FileStatus;
  originalName: string;
  originalSize: number;
  previewUrl: string;
}

export default function ConvertGambar() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Bersihkan object URL untuk mencegah memory leak
  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const validFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
      const newFiles = validFiles.map(file => ({
        id: Math.random().toString(36).substring(7) + Date.now(),
        file,
        status: 'pending' as FileStatus,
        originalName: file.name,
        originalSize: file.size,
        previewUrl: URL.createObjectURL(file)
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: files.length > 0,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: true
  });

  const handleConvertAll = async () => {
    if (files.length === 0) return;
    setIsConverting(true);

    const formData = new FormData();
    files.forEach(fileData => {
      formData.append('images', fileData.file);
    });

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.post(`${API_URL}/api/convert-pdf`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Auto download PDF
      const link = document.createElement('a');
      link.href = url;
      link.download = 'hasil-convert.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Ubah status menjadi success
      setFiles(prev => prev.map(f => ({ ...f, status: 'success' })));

    } catch (err: any) {
      console.error('Error konversi:', err);
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' })));
      alert('Terjadi kesalahan saat mengonversi gambar ke PDF.');
    } finally {
      setIsConverting(false);
    }
  };

  const removeFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const Header = () => (
    <header className="h-16 bg-white border-b flex items-center px-4 sm:px-8 shrink-0 z-50 w-full justify-between relative shadow-sm">
      <div className="flex items-center space-x-8 w-full justify-between lg:justify-start">
        <a href="/" className="font-black text-2xl flex items-center cursor-pointer select-none">
          <span>I</span>
          <i className="fa-solid fa-heart mx-1.5 text-blue-500 text-xl"></i>
          <span>IMG</span>
        </a>
        
        <nav className="hidden lg:flex space-x-6 text-[13px] font-bold text-gray-600 h-16 items-center">
          <a href="/" className="hover:text-blue-500 transition-colors uppercase h-full flex items-center border-b-[3px] border-transparent">KOMPRES GAMBAR</a>
          <a href="/convert-gambar" className="text-blue-500 transition-colors uppercase h-full flex items-center border-b-[3px] border-blue-500 pt-[3px]">CONVERT GAMBAR</a>
          <a href="#" className="hover:text-blue-500 transition-colors uppercase h-full flex items-center border-b-[3px] border-transparent">HELP</a>
        </nav>

        <button 
          className="lg:hidden text-gray-600 text-2xl p-2 focus:outline-none hover:text-blue-500 transition-colors" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>

      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-30 lg:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-16 left-0 w-full bg-white border-b shadow-lg lg:hidden z-40 flex flex-col font-bold text-[13px] text-gray-700 animate-in slide-in-from-top-2">
            <a href="/" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b hover:bg-gray-50">KOMPRES GAMBAR</a>
            <a href="/convert-gambar" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b text-blue-500 bg-blue-50">CONVERT GAMBAR</a>
            <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="p-4 hover:bg-gray-50">HELP</a>
          </div>
        </>
      )}
    </header>
  );

  if (files.length === 0) {
    return (
      <main className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl md:text-[42px] lg:text-[48px] font-bold text-gray-800 mb-3 tracking-tight text-center uppercase">Convert ke PDF</h1>
          <p className="text-gray-600 text-base md:text-xl lg:text-2xl mb-10 text-center max-w-3xl px-4 font-light">
            Ubah gambar <span className="font-bold text-gray-700">JPG</span>, <span className="font-bold text-gray-700">PNG</span>, atau <span className="font-bold text-gray-700">WEBP</span> menjadi sebuah dokumen <span className="font-bold text-red-500">PDF</span>. <br className="hidden md:block"/>
            Gabungkan hingga 20 gambar sekaligus dengan cepat.
          </p>

          <div 
            {...getRootProps()} 
            className={`flex flex-col items-center justify-center w-full max-w-4xl h-[300px] md:h-[400px] rounded-xl transition-all mx-4 cursor-pointer
              ${isDragActive ? 'bg-red-50 border-4 border-dashed border-red-400 scale-[1.02]' : 'bg-transparent border-4 border-transparent hover:bg-white/50'}
            `}
          >
            <input {...getInputProps()} />
            
            <button 
              onClick={open}
              className="bg-[#ef4444] hover:bg-[#dc2626] text-white text-xl md:text-2xl font-bold py-5 px-10 md:py-6 md:px-14 rounded-lg shadow-[0_10px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_10px_25px_rgba(239,68,68,0.4)] transition-all transform active:scale-95 mb-4 md:mb-6 flex items-center"
            >
              Pilih Gambar
            </button>
            <p className="text-gray-400 font-medium text-sm md:text-base">atau letakkan gambar di sini</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] flex flex-col font-sans h-screen overflow-hidden">
      <Header />

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
        <div 
          {...getRootProps()}
          className="flex-1 overflow-y-auto p-4 md:p-8 relative"
        >
          <input {...getInputProps()} />
          
          {isDragActive && (
            <div className="absolute inset-0 bg-red-500/10 border-4 border-red-500 border-dashed z-50 flex items-center justify-center rounded-xl m-4">
              <p className="text-xl md:text-3xl font-bold text-red-600 bg-white/90 px-6 py-4 rounded-full shadow-lg text-center">Letakkan gambar di sini</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6 pb-6">
            {files.map((f, index) => (
              <div key={f.id} className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden hover:shadow-md transition-shadow relative group h-[220px] md:h-[260px]">
                
                {/* Nomor Urut */}
                <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">
                  {index + 1}
                </div>

                {!isConverting && (
                  <button 
                    onClick={(e) => removeFile(f.id, e)}
                    className="absolute top-2 right-2 z-10 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full shadow-sm opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all border border-gray-100"
                  >
                    <i className="fa-solid fa-xmark text-sm md:text-base"></i>
                  </button>
                )}

                <div className="h-28 md:h-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50 flex items-center justify-center overflow-hidden relative border-b border-gray-100">
                  <img src={f.previewUrl} alt={f.originalName} className="object-contain w-full h-full p-2" />
                  
                  {isConverting && f.status === 'pending' && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="bg-white p-3 rounded-full shadow-md text-red-500">
                        <i className="fa-solid fa-spinner fa-spin text-xl md:text-2xl"></i>
                      </div>
                    </div>
                  )}

                  {f.status === 'success' && (
                    <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center pointer-events-none">
                      <div className="bg-emerald-500 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md transform scale-110">
                        <i className="fa-solid fa-check text-lg"></i>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-2 md:p-3 flex flex-col items-center justify-center flex-1 bg-white">
                  <p className="text-[10px] md:text-xs text-gray-700 font-bold truncate w-full text-center mb-1" title={f.originalName}>
                    {f.originalName}
                  </p>
                  <span className="text-[10px] md:text-xs text-gray-500 font-medium">
                    {formatSize(f.originalSize)}
                  </span>
                </div>
              </div>
            ))}

            {!isConverting && (
              <div 
                onClick={(e) => { e.stopPropagation(); open(); }}
                className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-[220px] md:h-[260px] cursor-pointer hover:bg-gray-50 hover:border-red-400 hover:shadow-sm transition-all group"
              >
                <div className="bg-gray-100 text-gray-400 group-hover:bg-red-100 group-hover:text-red-500 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full mb-2 md:mb-3 transition-colors">
                  <i className="fa-solid fa-plus text-xl md:text-2xl"></i>
                </div>
                <p className="text-[11px] md:text-sm font-bold text-gray-500 group-hover:text-red-500 transition-colors text-center px-2">Tambah gambar</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-[340px] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col shrink-0 relative z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] lg:shadow-[-5px_0_15px_rgba(0,0,0,0.05)] max-h-[45vh] lg:max-h-full">
          <div className="p-4 md:p-6 border-b border-gray-100 overflow-y-auto">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center justify-center">
              Pengaturan PDF
            </h2>
            
            <div className="border border-red-200 rounded-lg overflow-hidden bg-red-50/50 p-4">
              <div className="flex items-start space-x-3 mb-2">
                <i className="fa-solid fa-circle-info text-red-500 mt-0.5"></i>
                <h3 className="font-bold text-gray-800 text-[13px] md:text-sm">Gabungkan Gambar</h3>
              </div>
              <p className="text-[11px] md:text-xs text-gray-600 leading-relaxed ml-7">
                Semua gambar di samping akan otomatis digabungkan menjadi <strong>1 file PDF</strong> berurutan dari nomor 1.
              </p>
            </div>
          </div>
          
          <div className="p-4 md:p-6 bg-white border-t border-gray-100 mt-auto">
            {files.length > 0 && files.every(f => f.status === 'success') ? (
               <div className="flex flex-col space-y-3">
                 <button 
                    onClick={() => setFiles([])}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-lg transition-all text-xs md:text-sm uppercase tracking-wide flex items-center justify-center"
                  >
                    <i className="fa-solid fa-rotate-right mr-2"></i> Konversi PDF Baru
                  </button>
              </div>
            ) : (
              <button 
                onClick={handleConvertAll}
                disabled={isConverting}
                className="w-full bg-[#ef4444] hover:bg-[#dc2626] disabled:bg-[#ef4444]/70 text-white font-bold py-3.5 md:py-4.5 rounded-lg shadow-[0_5px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_20px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center text-sm md:text-lg active:scale-95 uppercase tracking-wide"
              >
                {isConverting ? (
                  <><i className="fa-solid fa-spinner fa-spin text-lg md:text-xl mr-2"></i> Memproses PDF...</>
                ) : (
                  <>CONVERT KE PDF <i className="fa-solid fa-file-pdf text-lg md:text-xl ml-2"></i></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
