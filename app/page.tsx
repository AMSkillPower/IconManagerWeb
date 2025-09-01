'use client';

import { useState } from 'react';
import { UploadDialog } from './components/upload-dialog';
import { SearchBar } from './components/search-bar';
import { ImageGrid } from './components/image-grid';
import { Toaster } from '@/components/ui/sonner';
import { ImageIcon, Search, Upload } from 'lucide-react';

export default function Home() {
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Toaster />

      {/* Header */}
      <header className="flex-none bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <ImageIcon className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Gestione Immagini</h1>
        </div>
        <UploadDialog onUploadComplete={handleUploadComplete} />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden px-4 py-2 space-y-2">
        {/* Hero */}
        <div className="flex-none text-center">
          <h2 className="text-xl md:text-3xl font-bold text-slate-800 mb-1">SkillPower - Organizza le tue Immagini</h2>
          <p className="text-xs md:text-sm text-slate-600">
            Carica, organizza e scarica le tue immagini con facilità. Cerca per tag, converti in diversi formati e scegli la dimensione perfetta.
          </p>
        </div>

        {/* Search + Image Grid container */}
        <div className="flex-1 flex flex-col overflow-hidden space-y-2">
          {/* Search */}
          <div className="flex-none bg-white rounded-lg shadow-sm border border-slate-200 p-2 md:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Search className="h-4 w-4 text-slate-600"/>
              <h3 className="text-sm md:text-base font-semibold text-slate-800">Cerca Immagini</h3>
            </div>
            <SearchBar onSearch={setSearchTags} searchTags={searchTags}/>
          </div>

          {/* Images grid */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200 p-2 md:p-4 overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm md:text-base font-semibold text-slate-800">
                {searchTags.length>0 ? 'Risultati della ricerca' : 'Tutte le immagini'}
              </h3>
              <span className="text-xs text-slate-500">
                {searchTags.length>0 && `Filtrato per: ${searchTags.join(', ')}`}
              </span>
            </div>
            <div className="h-full">
              <ImageGrid searchTags={searchTags} refreshTrigger={refreshTrigger}/>
            </div>
          </div>
        </div>

        {/* Features info */}
        <div className="flex-none grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-2 md:p-4">
            <Upload className="h-8 w-8 text-blue-600 mx-auto mb-1"/>
            <h4 className="text-sm md:text-base font-semibold text-slate-800 mb-1">Upload Facile</h4>
            <p className="text-xs md:text-sm text-slate-600">Trascina o seleziona file fino a 10MB</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-2 md:p-4">
            <Search className="h-8 w-8 text-emerald-600 mx-auto mb-1"/>
            <h4 className="text-sm md:text-base font-semibold text-slate-800 mb-1">Ricerca Intelligente</h4>
            <p className="text-xs md:text-sm text-slate-600">Trova immagini rapidamente tramite tag</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 md:p-4">
            <ImageIcon className="h-8 w-8 text-amber-600 mx-auto mb-1"/>
            <h4 className="text-sm md:text-base font-semibold text-slate-800 mb-1">Conversione Avanzata</h4>
            <p className="text-xs md:text-sm text-slate-600">Scarica PNG, BMP, ICO o SVG in varie dimensioni</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-none bg-white border-t border-slate-200 py-2 text-center text-xs md:text-sm text-slate-600">
        © 2024 Gestione Immagini. Applicazione sviluppata con Next.js e Sharp.
      </footer>
    </div>
  );
}
