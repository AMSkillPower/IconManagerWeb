'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Eye, Clock, FileImage } from 'lucide-react';
import { toast } from 'sonner';

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
      else toast.error(result.error || 'Errore caricamento immagini');
    } catch {
      toast.error('Errore caricamento immagini');
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
        toast.success('Download iniziato!');
      } else toast.error('Errore durante il download');
    } catch {
      toast.error('Errore durante il download');
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('it-IT', { year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit' });
  const formatFileSize = (b: number) => b===0?'0 B':`${(b/1024**Math.floor(Math.log(b)/Math.log(1024))).toFixed(2)} ${['B','KB','MB','GB'][Math.floor(Math.log(b)/Math.log(1024))]}`;

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {[...Array(12)].map((_,i)=>(
        <Card key={i} className="animate-pulse h-32 rounded-lg" />
      ))}
    </div>
  );

  if (images.length===0) return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <FileImage className="h-16 w-16 mb-2"/>
      <h3 className="text-lg font-medium mb-1">Nessuna immagine trovata</h3>
      <p className="text-sm">{searchTags.length>0?'Modifica i criteri di ricerca':'Carica la prima immagine'}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Download rapido */}
      <div className="flex items-center gap-4 p-2 bg-gray-100 rounded-lg">
        <span className="text-sm font-semibold text-gray-700">Download rapido:</span>
        <Select value={quickDownloadFormat} onValueChange={setQuickDownloadFormat}>
          <SelectTrigger className="w-24 border-gray-300 focus:ring-2 focus:ring-blue-400 rounded-md">
            <SelectValue/>
          </SelectTrigger>
          <SelectContent>
            {formats.map(f=><SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Griglia immagini */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-[calc(100vh-150px)] overflow-auto p-2">
        {images.map(img => (
          <Card key={img.id} className="rounded-lg overflow-hidden shadow hover:shadow-lg group relative">
            <img
              src={`/api/images/${img.id}`}
              alt={img.originalName}
              className="w-full aspect-square object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition duration-300 gap-1">
              <Button size="sm" variant="ghost" className="bg-white bg-opacity-20 hover:bg-opacity-40 text-white" onClick={()=>setSelectedImage(img)}>
                <Eye className="h-4 w-4 mr-1"/> Info
              </Button>
              <Button size="sm" variant="ghost" className="bg-white bg-opacity-20 hover:bg-opacity-40 text-white" onClick={()=>handleDownload(img.id,img.originalName)}>
                <Download className="h-4 w-4 mr-1"/> {quickDownloadFormat.toUpperCase()}
              </Button>
            </div>
            <div className="p-1 flex flex-wrap gap-1">
              {img.tags.slice(0,2).map((tag,i)=>(
                <Badge key={i} variant="secondary" className="text-xs px-1 py-0.5">{tag}</Badge>
              ))}
              {img.tags.length>2 && <Badge variant="outline" className="text-xs px-1 py-0.5">+{img.tags.length-2}</Badge>}
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog info */}
      <Dialog open={!!selectedImage} onOpenChange={(open)=>{if(!open) setSelectedImage(null)}}>
        <DialogContent className="max-w-md sm:max-w-lg p-4 rounded-lg shadow-xl overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedImage?.originalName}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-3">
              <img src={`/api/images/${selectedImage.id}`} alt={selectedImage.originalName} className="w-full object-contain rounded-lg"/>
              <div className="text-sm space-y-1">
                <p><strong>Dimensione:</strong> {formatFileSize(selectedImage.size)}</p>
                <p><strong>Tipo:</strong> {selectedImage.mimetype}</p>
                <p><strong>Upload:</strong> {formatDate(selectedImage.uploadDate)}</p>
                <div className="flex flex-wrap gap-1">
                  {selectedImage.tags.map((t,i)=><Badge key={i} className="text-xs px-1 py-0.5">{t}</Badge>)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
