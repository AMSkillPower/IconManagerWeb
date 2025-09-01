'use client';
import Image from 'next/image';
import { useState } from 'react';
import { UploadDialog } from './components/upload-dialog';
import { SearchBar } from './components/search-bar';
import { ImageGrid } from './components/image-grid';
import { Sparkles, Zap } from 'lucide-react';
import NextImage from 'next/image';

export default function Home() {
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-20"></div>
                <div className="relative p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                  {/* solo logo SkillPower */}
                  <NextImage
                    src="/SkillPower.svg"
                    alt="SkillPower Logo"
                    width={28}
                    height={28}
                    className="h-7 w-7"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  SkillPower Gallery
                </h1>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Gestione intelligente delle tue immagini
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  100x100px Perfect
                </span>
              </div>
              <UploadDialog onUploadComplete={handleUploadComplete} />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section compatta */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full text-sm font-medium text-blue-800">
            <Zap className="h-4 w-4" />
            Organizza • Cerca • Converti
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 leading-tight">
            Le tue immagini,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              organizzate perfettamente
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Carica, organizza e scarica le tue immagini con facilità. Ricerca intelligente per tag, 
            conversione in diversi formati e dimensioni personalizzate.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <Image className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Ricerca Immagini</h3>
                <p className="text-sm text-slate-500">Filtra per tag e trova quello che cerchi</p>
              </div>
            </div>
          </div>
          
          <div className="p-0">
            <SearchBar onSearch={setSearchTags} searchTags={searchTags}/>
          </div>
        </div>

        {/* Images Grid Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/50 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                  <Image className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {searchTags.length > 0 ? 'Risultati della ricerca' : 'La tua collezione'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {searchTags.length > 0 
                      ? `Filtrato per: ${searchTags.join(', ')}` 
                      : 'Tutte le tue immagini organizzate'
                    }
                  </p>
                </div>
              </div>
              
              {searchTags.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700">
                    {searchTags.length} filtri attivi
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="min-h-[60vh]">
            <ImageGrid searchTags={searchTags} refreshTrigger={refreshTrigger}/>
          </div>
        </div>

        {/* Stats/Info bar compatta */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl p-6 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h4 className="text-xl font-bold mb-1">Gestione Professionale</h4>
              <p className="text-slate-300">Upload sicuro • Ricerca intelligente • Conversione avanzata</p>
            </div>
            
            <div className="flex items-center gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">100x100</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Formato Ottimale</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">PNG/ICO</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Multi Formato</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">16-512px</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Dimensioni Flessibili</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                {/* solo logo SkillPower */}
                <NextImage
                  src="/SkillPower.svg"
                  alt="SkillPower Logo"
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
              </div>
              <span className="text-sm text-slate-600">SkillPower Gallery</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-slate-500">
                © 2024 Gestione Immagini • Sviluppato con Next.js e Sharp
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}