import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nebyl poskytnut žádný soubor' },
        { status: 400 }
      );
    }
    
    // Kontrola typu souboru
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Nepodporovaný typ souboru. Povolené typy jsou: ' + allowedTypes.join(', ') },
        { status: 400 }
      );
    }
    
    // Maximální velikost souboru (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Soubor je příliš velký. Maximální povolená velikost je 5MB' },
        { status: 400 }
      );
    }
    
    // Zajistit, že složka pro uploady existuje
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Vygenerovat unikátní název souboru
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Přečíst obsah souboru
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Zapsat soubor na disk
    await writeFile(filePath, buffer);
    
    // Vrátit URL na nahraný soubor
    const imageUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({
      success: true,
      imageUrl,
      message: 'Soubor byl úspěšně nahrán'
    });
    
  } catch (error) {
    console.error('Chyba při nahrávání souboru:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při nahrávání souboru' },
      { status: 500 }
    );
  }
}

// Nastavení maximální velikosti požadavku
export const config = {
  api: {
    bodyParser: false,
  },
}; 