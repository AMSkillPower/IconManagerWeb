'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Plus, ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

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
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

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
        if (img.width === 100 && img.height === 100) {
          setValidationStatus('valid');
          resolve(true);
        } else {
          setValidationStatus('invalid');
          console.error("L'immagine deve essere esattamente 100x100 pixel");
          resolve(false);
        }
      };
      img.onerror = () => {
        setValidationStatus('invalid');
        console.error("Impossibile leggere l'immagine");
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
      if (!droppedFile.type.startsWith('image/')) return console.error('Il file deve essere un\'immagine');
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
    if (!file) return console.error('Seleziona un\'immagine');
    if (tags.length === 0) return console.error('Aggiungi almeno un tag');

    setIsUploading(true);
    try {
      const formData = new FormData();
      const sanitizedFile = new File([file], sanitizeFileName(file.name), { type: file.type });
      formData.append('image', sanitizedFile);
      formData.append('tags', tags.join(','));

      const res = await fetch('/api/images/upload', { method: 'POST', body: formData });
      const result = await res.json();

      if (result.success) {
        console.log('Immagine caricata con successo!');
        setFile(null); setTags([]); setTagInput(''); setImageDimensions(null); setValidationStatus('idle');
        setIsOpen(false);
        onUploadComplete();
      } else console.error(result.error || 'Errore durante l\'upload');
    } catch {
      console.error('Errore durante l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTags([]);
    setTagInput('');
    setImageDimensions(null);
    setValidationStatus('idle');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3">
          <Upload className="h-5 w-5 mr-2"/>
          Carica Immagine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <DialogTitle className="text-xl font-bold text-gray-800">
            Carica Nuova Immagine
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">Solo immagini 100x100 pixel</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Drag & Drop Area migliorata */}
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden
              ${dragActive 
                ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 scale-105 shadow-lg' 
                : validationStatus === 'valid'
                  ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50'
                  : validationStatus === 'invalid'
                    ? 'border-red-400 bg-gradient-to-br from-red-50 to-pink-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md'
            }`}
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag} 
            onDragOver={handleDrag} 
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleFileSelect} 
              className="hidden"
            />
            
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-8 h-8 bg-blue-400 rounded-full"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 bg-indigo-400 rounded-full"></div>
              <div className="absolute top-1/2 left-8 w-4 h-4 bg-purple-400 rounded-full"></div>
            </div>

            {file ? (
              <div className="space-y-4 relative z-10">
                <div className="mx-auto w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                  {validationStatus === 'valid' ? (
                    <CheckCircle className="h-8 w-8 text-green-500"/>
                  ) : validationStatus === 'invalid' ? (
                    <AlertCircle className="h-8 w-8 text-red-500"/>
                  ) : (
                    <ImageIcon className="h-8 w-8 text-blue-500"/>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-800">{sanitizeFileName(file.name)}</p>
                  {imageDimensions && (
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className={`px-3 py-1 rounded-full ${
                        validationStatus === 'valid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {imageDimensions.width}x{imageDimensions.height}px
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {(file.size/1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}
                  {validationStatus === 'invalid' && (
                    <p className="text-sm text-red-600 font-medium">
                      L'immagine deve essere 100x100 pixel
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                <div className="mx-auto w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400"/>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-700">
                    Trascina o clicca per selezionare
                  </p>
                  <p className="text-sm text-gray-500">
                    Solo immagini 100x100 px • PNG, JPG, GIF
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tags Section migliorata */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Tag dell'immagine
            </Label>
            
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input 
                  value={tagInput} 
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="Aggiungi un tag descrittivo" 
                  className="pr-12 bg-white border-gray-300 focus:ring-2 focus:ring-indigo-400 rounded-xl"
                  onKeyPress={e => {
                    if(e.key === 'Enter'){
                      e.preventDefault(); 
                      addTag();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={addTag}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-indigo-500 hover:bg-indigo-50 rounded-lg"
                  disabled={!tagInput.trim()}
                >
                  <Plus className="h-4 w-4"/>
                </Button>
              </div>
            </div>
            
            {/* Tags display */}
            {tags.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700">Tag aggiunti:</span>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    {tags.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t,i) => (
                    <Badge 
                      key={i} 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 rounded-full px-3 py-1 text-sm flex items-center gap-2 transition-all duration-200"
                    >
                      {t} 
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-200 transition-colors" 
                        onClick={() => removeTag(t)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottoni migliorati */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || !file || tags.length === 0 || validationStatus !== 'valid'}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Caricamento...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4"/>
                  Carica Immagine
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}