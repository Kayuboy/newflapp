import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import mongoose from 'mongoose';

// POST /api/categories/[id]/subcategory/[subCategoryId]/subcontent - Přidání nového sub-contentu k subkategorii
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; subCategoryId: string } }
) {
  try {
    console.log('Připojuji se k databázi...');
    await connectToDatabase();
    
    const { id, subCategoryId } = params;
    console.log('ID kategorie:', id, 'ID subkategorie:', subCategoryId);
    
    // Kontrola platnosti ID
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(subCategoryId)) {
      console.error('Neplatné ID kategorie nebo subkategorie');
      return NextResponse.json(
        { error: 'Neplatné ID kategorie nebo subkategorie' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    console.log('Přijatá data:', data);
    
    // Validace dat
    if (!data.title || !data.icon) {
      console.error('Chybějící povinná data:', { title: data.title, icon: data.icon });
      return NextResponse.json(
        { error: 'Název a ikona jsou povinné' },
        { status: 400 }
      );
    }
    
    // Najít kategorii
    console.log('Hledám kategorii s ID:', id);
    const category = await Category.findById(id);
    
    if (!category) {
      console.error('Kategorie nebyla nalezena:', id);
      return NextResponse.json(
        { error: 'Kategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    console.log('Kategorie nalezena:', category.name);
    
    // Najít subkategorii
    const subCategoryIndex = category.subCategories?.findIndex(
      (sub: any) => sub._id.toString() === subCategoryId
    );
    
    if (subCategoryIndex === undefined || subCategoryIndex === -1) {
      console.error('Subkategorie nebyla nalezena:', subCategoryId);
      return NextResponse.json(
        { error: 'Subkategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    console.log('Subkategorie nalezena, index:', subCategoryIndex);
    
    // Přidání nového sub-contentu
    if (category.subCategories && category.subCategories[subCategoryIndex]) {
      // Inicializace pole subContents, pokud neexistuje
      if (!category.subCategories[subCategoryIndex].subContents) {
        category.subCategories[subCategoryIndex].subContents = [];
      }
      
      const newSubContent = {
        title: data.title,
        icon: data.icon,
        description: data.description || '',
        content: data.content || '',
        color: data.color || '#f8a287',
      };
      
      console.log('Přidávám nový subcontent k subkategorii:', newSubContent);
      category.subCategories[subCategoryIndex].subContents.push(newSubContent);
      
      console.log('Ukládám změny...');
      await category.save();
      console.log('Změny uloženy');
      
      return NextResponse.json(category);
    } else {
      console.error('Subkategorie nebyla nalezena v poli');
      return NextResponse.json(
        { error: 'Subkategorie nebyla nalezena' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Chyba při přidávání sub-contentu:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při přidávání sub-contentu' },
      { status: 500 }
    );
  }
} 