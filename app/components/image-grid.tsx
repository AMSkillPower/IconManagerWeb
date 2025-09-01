'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Eye, Clock, FileImage } from 'lucide-react';

interface ImageItem {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  tags: string[];
  uploadDate: string;
}

interface ImageGridProps {
  searchTags: string[];
  refreshTrigger: number;
}

export function ImageGrid({ searchTags, refreshTrigger }: ImageGridProps) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<string>('png');
  const [downloadSize, setDownloadSize] = useState<string>('100');
  const [quickDownloadFormat, setQuickDownloadFormat] = useState<string>('png');

  const sizes = [
    { value: '512', label: '512px' },
    { value: '256', label: '256px' },
    { value: '128', label: '128px' },
    { value: '100', label: '100px' },
    { value: '64', label: '64px' },
    { value: '32', label: '32px' },
    { value: '16', label: '16px' },
  ];

  const formats = [
    { value: 'png', label: 'PNG' },
    { value: 'bmp', label: 'BMP' },
    { value: 'ico', label: 'ICO' },
    { value: 'svg', label: 'SVG' },
  ];

  const fetchImages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTags.length > 0) params.append('tags', searchTags.join(','));
      const res = await fetch(`/api/images/search?${params}`);
      const result = await res.json();
      if (result.success) setImages(result.images);
      else console.error(result.error || 'Errore caricamento immagini');
    } catch {
      console.error('Errore caricamento immagini');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchImages(); }, [searchTags.join(','), refreshTrigger]);

  const handleDownload = async (imageId: string, originalName: string, format?: string, size?: string) => {
    try {
      const f = format || quickDownloadFormat;
      const s = size || '100';
      const params = new URLSearchParams({ id: imageId, format: f, size: s });
      const res = await fetch(`/api/images/download?${params}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
        a.download = `${nameWithoutExt}_${s}x${s}.${f}`;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        a.remove();
        console.log('Download iniziato!');
      } else console.error('Errore durante il download');
    } catch {
      console.error('Errore durante il download');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('it-IT', { year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit' });
  const formatFileSize = (b: number) => b===0?'0 B':`${(b/1024**Math.floor(Math.log(b)/Math.log(1024))).toFixed(2)} ${['B','KB','MB','GB'][Math.floor(Math.log(b)/Math.log(1024))]}`;

  if (loading) return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-3 p-4">
      {[...Array(24)].map((_,i)=>(
        <div key={i} className="animate-pulse bg-gray-200 aspect-square rounded-xl" />
      ))}
    </div>
  );

  if (images.length===0) return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mx-4 my-8">
      <div className="bg-white p-4 rounded-full shadow-lg mb-4">
        <FileImage className="h-12 w-12 text-gray-400"/>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-700">Nessuna immagine trovata</h3>
      <p className="text-gray-500">{searchTags.length>0?'Modifica i criteri di ricerca':'Carica la prima immagine'}</p>
    </div>
  );

  return (
    <div className="space-y-6 p-4">
      {/* Download rapido - Design migliorato */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-semibold text-blue-900">Download rapido:</span>
        </div>
        <Select value={quickDownloadFormat} onValueChange={setQuickDownloadFormat}>
          <SelectTrigger className="w-28 bg-white border-blue-200 focus:ring-2 focus:ring-blue-400 rounded-lg shadow-sm">
            <SelectValue/>
          </SelectTrigger>
          <SelectContent>
            {formats.map(f=><SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Griglia immagini compatta e moderna */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-3 max-h-[70vh] overflow-auto">
        {images.map(img => (
          <div key={img.id} className="group relative">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <img
                src={`/api/images/${img.id}`}
                alt={img.originalName}
                className="w-full aspect-square object-cover"
              />
              
              {/* Overlay con pulsanti */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300">
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-lg h-8 w-8 p-0" 
                    onClick={()=>setSelectedImage(img)}
                  >
                    <Eye className="h-4 w-4"/>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-lg h-8 w-8 p-0" 
                    onClick={()=>handleDownload(img.id,img.originalName)}
                  >
                    <Download className="h-4 w-4"/>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Tags sotto l'immagine - più compatti */}
            <div className="mt-2 flex flex-wrap gap-1 justify-center">
              {img.tags.slice(0,1).map((tag,i)=>(
                <Badge key={i} variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">{tag}</Badge>
              ))}
              {img.tags.length > 1 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-full border-gray-300">+{img.tags.length-1}</Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dialog info migliorato */}
      <Dialog open={!!selectedImage} onOpenChange={(open)=>{if(!open) setSelectedImage(null)}}>
        <DialogContent className="max-w-md sm:max-w-lg p-6 rounded-2xl shadow-2xl bg-gradient-to-br from-white to-gray-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 mb-4">{selectedImage?.originalName}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-6">
              <div className="relative">
                <img 
                  src={`/api/images/${selectedImage.id}`} 
                  alt={selectedImage.originalName} 
                  className="w-full object-contain rounded-xl shadow-md bg-gray-50"
                />
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Dimensione:</span>
                    <p className="text-gray-600">{formatFileSize(selectedImage.size)}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Tipo:</span>
                    <p className="text-gray-600">{selectedImage.mimetype}</p>
                  </div>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700">Upload:</span>
                  <p className="text-gray-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(selectedImage.uploadDate)}
                  </p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-700 mb-2 block">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedImage.tags.map((t,i)=>(
                      <Badge key={i} className="bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-full">{t}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Sezione download avanzata */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-3">Download personalizzato</h4>
                <div className="flex gap-3">
                  <Select value={downloadFormat} onValueChange={setDownloadFormat}>
                    <SelectTrigger className="flex-1 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map(f=><SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={downloadSize} onValueChange={setDownloadSize}>
                    <SelectTrigger className="flex-1 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map(s=><SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={()=>handleDownload(selectedImage.id, selectedImage.originalName, downloadFormat, downloadSize)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <Download className="h-4 w-4 mr-1"/>
                    Scarica
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}