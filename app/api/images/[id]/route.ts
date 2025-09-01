import { NextRequest, NextResponse } from 'next/server';
import { ImageDatabase } from '../database';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('Image request received for ID:', params.id);
    
    const image = await ImageDatabase.getImage(params.id);
    
    if (!image) {
      return NextResponse.json({ 
        success: false, 
        error: 'Immagine non trovata' 
      }, { status: 404 });
    }

    // Restituisce l'immagine come risposta binaria
    return new NextResponse(image.buffer, {
      headers: {
        'Content-Type': image.mimetype,
        'Content-Length': image.size.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache per 1 anno
      },
    });

  } catch (error) {
    console.error('Image retrieval error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Errore nel recupero dell\'immagine' 
    }, { status: 500 });
  }
}