import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category, ISubCategory, ISubContent } from '@/models/Category';
import mongoose from 'mongoose';

// POST /api/categories/[id]/subcontent - Přidání nového subcontentu ke kategorii
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Připojuji se k databázi...');
    await connectToDatabase();
    
    const { id } = params;
    console.log('ID kategorie:', id);
    
    // Kontrola platnosti ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('Neplatné ID kategorie:', id);
      return NextResponse.json(
        { error: 'Neplatné ID kategorie' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    console.log('Přijatá data:', data);
    
    // Validace dat
    if (!data.title || !data.icon || !data.subCategoryId) {
      console.error('Chybějící povinná data:', { 
        title: data.title, 
        icon: data.icon,
        subCategoryId: data.subCategoryId
      });
      return NextResponse.json(
        { error: 'Název, ikona a ID subkategorie jsou povinné' },
        { status: 400 }
      );
    }
    
    // Kontrola platnosti subCategoryId
    if (!mongoose.Types.ObjectId.isValid(data.subCategoryId)) {
      console.error('Neplatné ID subkategorie:', data.subCategoryId);
      return NextResponse.json(
        { error: 'Neplatné ID subkategorie' },
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
    
    // Kontrola, zda existují subkategorie
    if (!category.subCategories || category.subCategories.length === 0) {
      console.error('Kategorie nemá žádné subkategorie');
      return NextResponse.json(
        { error: 'Kategorie nemá žádné subkategorie' },
        { status: 404 }
      );
    }
    
    // Najít subkategorii podle ID
    const subCategoryIndex = category.subCategories.findIndex(
      (subCategory: ISubCategory) => 
        (subCategory._id as unknown as mongoose.Types.ObjectId).toString() === data.subCategoryId
    );
    
    if (subCategoryIndex === -1) {
      console.error('Subkategorie nebyla nalezena:', data.subCategoryId);
      return NextResponse.json(
        { error: 'Subkategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    console.log('Subkategorie nalezena:', category.subCategories[subCategoryIndex].name);
    
    // Inicializace pole subContents, pokud neexistuje
    if (!category.subCategories[subCategoryIndex].subContents) {
      category.subCategories[subCategoryIndex].subContents = [];
    }
    
    // Vytvoření nového subcontentu
    const newSubContent = {
      title: data.title,
      icon: data.icon,
      description: data.description || '',
      content: data.content || '',
      color: data.color || '#f8a287',
      imageUrls: data.imageUrls || [],
      alternativeTexts: data.alternativeTexts || [],
      imageContents: data.imageContents || []
    };
    
    console.log('Přidávám nový subcontent:', newSubContent);
    
    // Přidání subcontentu do subkategorie
    category.subCategories[subCategoryIndex].subContents.push(newSubContent as any);
    
    console.log('Ukládám změny...');
    await category.save();
    console.log('Změny uloženy');
    
    return NextResponse.json({ 
      message: 'Subcontent byl úspěšně přidán',
      categoryId: id,
      subCategoryId: data.subCategoryId,
      subcontent: newSubContent
    }, { status: 201 });
  } catch (error) {
    console.error('Chyba při přidávání subcontentu:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při přidávání subcontentu' },
      { status: 500 }
    );
  }
} 