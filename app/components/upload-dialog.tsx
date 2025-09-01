'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface UploadDialogProps {
  onUploadComplete: () => void;
}

export function UploadDialog({ onUploadComplete }: UploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        if (img.width === 100 && img.height === 100) resolve(true);
        else {
          toast.error("L'immagine deve essere esattamente 100x100 pixel");
          resolve(false);
        }
      };
      img.onerror = () => {
        toast.error("Impossibile leggere l'immagine");
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const sanitizeFileName = (fileName: string) => fileName.replace(/_\d+x\d+/, '');

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.type.startsWith('image/')) return toast.error('Il file deve essere un\'immagine');
      const isValid = await validateImage(droppedFile);
      if (isValid) setFile(droppedFile);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const selectedFile = e.target.files[0];
    const isValid = await validateImage(selectedFile);
    if (isValid) setFile(selectedFile);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Seleziona un\'immagine');
    if (tags.length === 0) return toast.error('Aggiungi almeno un tag');

    setIsUploading(true);
    try {
      const formData = new FormData();
      const sanitizedFile = new File([file], sanitizeFileName(file.name), { type: file.type });
      formData.append('image', sanitizedFile);
      formData.append('tags', tags.join(','));

      const res = await fetch('/api/images/upload', { method: 'POST', body: formData });
      const result = await res.json();

      if (result.success) {
        toast.success('Immagine caricata con successo!');
        setFile(null); setTags([]); setTagInput(''); setImageDimensions(null);
        setIsOpen(false);
        onUploadComplete();
      } else toast.error(result.error || 'Errore durante l\'upload');
    } catch {
      toast.error('Errore durante l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1">
          <Upload className="h-4 w-4"/> Carica Immagine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-4 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>Carica Nuova Immagine (100x100px)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drag & Drop */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
              ${dragActive ? 'border-blue-500 bg-blue-50' : file ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'}
            `}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden"/>
            {file ? (
              <div className="space-y-1">
                <ImageIcon className="mx-auto h-10 w-10 text-emerald-500"/>
                <p className="text-sm font-medium text-emerald-700">{sanitizeFileName(file.name)}</p>
                {imageDimensions && <p className="text-xs text-emerald-600">Dimensioni: {imageDimensions.width}x{imageDimensions.height}px</p>}
                <p className="text-xs text-gray-500">{(file.size/1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="mx-auto h-10 w-10 text-gray-400"/>
                <p className="text-sm font-medium">Trascina o clicca per selezionare</p>
                <p className="text-xs text-gray-500">Solo immagini 100x100 px</p>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <Label>Tag</Label>
            <div className="flex gap-2">
              <Input value={tagInput} onChange={e=>setTagInput(e.target.value)}
                     placeholder="Aggiungi un tag" onKeyPress={e=>{if(e.key==='Enter'){e.preventDefault(); addTag();}}}/>
              <Button type="button" variant="outline" size="sm" onClick={addTag}><Plus className="h-4 w-4"/></Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {tags.map((t,i)=><Badge key={i} variant="secondary" className="text-xs px-1 py-0.5 flex items-center gap-1">
                {t} <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={()=>removeTag(t)}/>
              </Badge>)}
            </div>
          </div>

          {/* Bottoni */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={()=>setIsOpen(false)}>Annulla</Button>
            <Button type="submit" disabled={isUploading || !file || tags.length===0}>
              {isUploading ? 'Caricamento...' : 'Carica'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
