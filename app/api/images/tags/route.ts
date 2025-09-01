import { NextRequest, NextResponse } from 'next/server';
import { ImageDatabase } from '../database';

export async function GET(request: NextRequest) {
  try {
    console.log('Tags request received');
    
    const tags = await ImageDatabase.getAllTags();
    
    console.log(`Returning ${tags.length} tags`);
    
    return NextResponse.json({
      success: true,
      tags
    });

  } catch (error) {
    console.error('Tags retrieval error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Errore nel recupero dei tag' 
    });
  }
}