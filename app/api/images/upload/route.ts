import { NextRequest, NextResponse } from 'next/server';
import { ImageDatabase } from '@/app/api/images/database';
import sharp from 'sharp';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const format = searchParams.get('format') || 'png';
    const size = parseInt(searchParams.get('size') || '100');
    
    if (!id) {
      return new NextResponse('ID immagine richiesto', { status: 400 });
    }

    const image = await ImageDatabase.getImageById(id);
    
    if (!image) {
      return new NextResponse('Immagine non trovata', { status: 404 });
    }

    let processedBuffer = image.buffer;
    
    // Se la dimensione richiesta è diversa da quella originale, ridimensiona
    if (size !== 100) {
      processedBuffer = await sharp(image.buffer)
        .resize(size, size, { fit: 'fill' })
        .toBuffer();
    }

    // Converti nel formato richiesto se necessario
    switch (format.toLowerCase()) {
      case 'png':
        processedBuffer = await sharp(processedBuffer).png().toBuffer();
        break;
      case 'bmp':
        // Sharp non supporta BMP direttamente, usa PNG
        processedBuffer = await sharp(processedBuffer).png().toBuffer();
        break;
      case 'ico':
        // Sharp non supporta ICO direttamente, usa PNG
        processedBuffer = await sharp(processedBuffer).png().toBuffer();
        break;
      case 'svg':
        // Per SVG, manteniamo PNG (Sharp non può convertire in SVG)
        processedBuffer = await sharp(processedBuffer).png().toBuffer();
        break;
      default:
        processedBuffer = await sharp(processedBuffer).png().toBuffer();
    }

    const mimeType = `image/${format === 'ico' ? 'x-icon' : format}`;
    
    return new NextResponse(processedBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${image.originalName.replace(/\.[^/.]+$/, '')}_${size}x${size}.${format}"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return new NextResponse('Errore durante il download', { status: 500 });
  }
}