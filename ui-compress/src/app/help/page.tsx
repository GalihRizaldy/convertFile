'use client';

import { useState } from 'react';

export default function HelpPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Komponen Header agar seragam
  const Header = () => (
    <header className="h-16 bg-white border-b flex items-center px-4 sm:px-8 shrink-0 z-50 w-full justify-between relative shadow-sm fixed top-0">
      <div className="flex items-center space-x-8 w-full justify-between lg:justify-start">
        <a href="/" className="font-black text-2xl flex items-center cursor-pointer select-none">
          <span>I</span>
          <i className="fa-solid fa-heart mx-1.5 text-blue-500 text-xl"></i>
          <span>IMG</span>
        </a>
        
        <nav className="hidden lg:flex space-x-6 text-[13px] font-bold text-gray-600 h-16 items-center">
          <a href="/" className="hover:text-blue-500 transition-colors uppercase h-full flex items-center border-b-[3px] border-transparent">KOMPRES GAMBAR</a>
          <a href="/convert-gambar" className="hover:text-blue-500 transition-colors uppercase h-full flex items-center border-b-[3px] border-transparent">CONVERT GAMBAR</a>
          <a href="/help" className="text-blue-500 transition-colors uppercase h-full flex items-center border-b-[3px] border-blue-500 pt-[3px]">HELP</a>
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
            <a href="/convert-gambar" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b hover:bg-gray-50">CONVERT GAMBAR</a>
            <a href="/help" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b text-blue-500 bg-blue-50">HELP</a>
          </div>
        </>
      )}
    </header>
  );

  return (
    <main className="min-h-screen bg-[#f3f4f6] font-sans pt-16">
      <Header />
      
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        
        {/* Header Section */}
        <div className="text-center mb-10 mt-6">
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-3 uppercase tracking-tight">Pusat Bantuan</h1>
          <p className="text-gray-500 text-base md:text-lg">Panduan lengkap, batasan sistem, dan informasi pengembang.</p>
        </div>

        {/* 1. Panduan Pengguna */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-blue-50 border-b border-blue-100 p-4 md:p-5 flex items-center space-x-3">
            <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <i className="fa-solid fa-book"></i>
            </div>
            <h2 className="text-lg font-bold text-blue-900">Panduan Pengguna</h2>
          </div>
          
          <div className="p-4 md:p-6 space-y-5">
            <div>
              <h3 className="font-bold text-gray-800 mb-2 flex items-center"><i className="fa-solid fa-compress text-blue-500 w-5"></i> Kompres Gambar</h3>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-1">
                <li>Upload gambar.</li>
                <li>Pilih kualitas kompresi.</li>
                <li>Klik tombol kompres & unduh hasilnya.</li>
              </ul>
            </div>
            
            <hr className="border-gray-100" />
            
            <div>
              <h3 className="font-bold text-gray-800 mb-2 flex items-center"><i className="fa-solid fa-file-pdf text-red-500 w-5"></i> Convert ke PDF</h3>
              <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 ml-1">
                <li>Upload gambar (urutan gambar menentukan urutan halaman PDF).</li>
                <li>Klik tombol convert & unduh file PDF Anda.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Batasan Sistem */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-orange-50 border-b border-orange-100 p-4 flex items-center space-x-3">
            <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h2 className="text-lg font-bold text-orange-900">Batasan Sistem</h2>
          </div>
          
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-orange-100 bg-orange-50/30 rounded-lg p-5 text-center">
              <p className="text-xs text-orange-700 font-bold uppercase tracking-widest mb-1">Batas File</p>
              <h4 className="font-black text-orange-600 text-2xl">Maks 20 Gambar</h4>
            </div>
            
            <div className="border border-orange-100 bg-orange-50/30 rounded-lg p-5 text-center">
              <p className="text-xs text-orange-700 font-bold uppercase tracking-widest mb-1">Batas Total Ukuran</p>
              <h4 className="font-black text-orange-600 text-2xl">Maks 4.5 MB</h4>
            </div>
          </div>
        </section>

        {/* 3. Informasi Developer */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-12">
          <div className="bg-gray-50 border-b border-gray-200 p-4 md:p-5 flex items-center space-x-3">
            <div className="bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <i className="fa-solid fa-code"></i>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Informasi Developer</h2>
          </div>
          
          <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Dikembangkan dengan ❤️ oleh</p>
              <a href="https://github.com/GalihRizaldy" target="_blank" rel="noreferrer" className="text-lg font-bold text-blue-600 hover:underline flex items-center">
                <i className="fa-brands fa-github mr-2"></i> Galih Rizaldy
              </a>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Next.js</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Tailwind</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Express.js</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">Sharp</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">pdf-lib</span>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
