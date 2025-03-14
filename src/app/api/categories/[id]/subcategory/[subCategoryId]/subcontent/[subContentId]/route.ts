import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import mongoose from 'mongoose';

// GET /api/categories/[id]/subcategory/[subCategoryId]/subcontent/[subContentId] - Získání konkrétního subcontentu
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; subCategoryId: string; subContentId: string } }
) {
  try {
    await connectToDatabase();
    
    const { id, subCategoryId, subContentId } = params;
    
    // Kontrola platnosti ID
    if (!mongoose.Types.ObjectId.isValid(id) || 
        !mongoose.Types.ObjectId.isValid(subCategoryId) || 
        !mongoose.Types.ObjectId.isValid(subContentId)) {
      return NextResponse.json(
        { error: 'Neplatné ID kategorie, subkategorie nebo subcontentu' },
        { status: 400 }
      );
    }
    
    // Najít kategorii
    const category = await Category.findById(id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Kategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    // Kontrola, zda subCategories existuje
    if (!category.subCategories || category.subCategories.length === 0) {
      return NextResponse.json(
        { error: 'Kategorie nemá žádné subkategorie' },
        { status: 404 }
      );
    }
    
    // Najít subkategorii
    const subCategory = category.subCategories.find(
      (sub: any) => sub._id.toString() === subCategoryId
    );
    
    if (!subCategory) {
      return NextResponse.json(
        { error: 'Subkategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    // Kontrola, zda subContents existuje
    if (!subCategory.subContents || subCategory.subContents.length === 0) {
      return NextResponse.json(
        { error: 'Subkategorie nemá žádné subcontenty' },
        { status: 404 }
      );
    }
    
    // Najít subcontent
    const subContent = subCategory.subContents.find(
      (content: any) => content._id.toString() === subContentId
    );
    
    if (!subContent) {
      return NextResponse.json(
        { error: 'Subcontent nebyl nalezen' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(subContent);
  } catch (error) {
    console.error('Chyba při získávání subcontentu:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při získávání subcontentu' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id]/subcategory/[subCategoryId]/subcontent/[subContentId] - Aktualizace subcontentu
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; subCategoryId: string; subContentId: string } }
) {
  try {
    await connectToDatabase();
    
    const { id, subCategoryId, subContentId } = params;
    const data = await request.json();
    
    // Kontrola platnosti ID
    if (!mongoose.Types.ObjectId.isValid(id) || 
        !mongoose.Types.ObjectId.isValid(subCategoryId) || 
        !mongoose.Types.ObjectId.isValid(subContentId)) {
      return NextResponse.json(
        { error: 'Neplatné ID kategorie, subkategorie nebo subcontentu' },
        { status: 400 }
      );
    }
    
    // Validace dat
    if (!data.title || !data.icon) {
      return NextResponse.json(
        { error: 'Název a ikona jsou povinné' },
        { status: 400 }
      );
    }
    
    // Najít kategorii
    const category = await Category.findById(id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Kategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    // Kontrola, zda subCategories existuje
    if (!category.subCategories || category.subCategories.length === 0) {
      return NextResponse.json(
        { error: 'Kategorie nemá žádné subkategorie' },
        { status: 404 }
      );
    }
    
    // Najít index subkategorie
    const subCategoryIndex = category.subCategories.findIndex(
      (sub: any) => sub._id.toString() === subCategoryId
    );
    
    if (subCategoryIndex === -1) {
      return NextResponse.json(
        { error: 'Subkategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    const subCategory = category.subCategories[subCategoryIndex];
    
    // Kontrola, zda subContents existuje
    if (!subCategory.subContents || subCategory.subContents.length === 0) {
      return NextResponse.json(
        { error: 'Subkategorie nemá žádné subcontenty' },
        { status: 404 }
      );
    }
    
    // Najít index subcontentu
    const subContentIndex = subCategory.subContents.findIndex(
      (content: any) => content._id.toString() === subContentId
    );
    
    if (subContentIndex === -1) {
      return NextResponse.json(
        { error: 'Subcontent nebyl nalezen' },
        { status: 404 }
      );
    }
    
    // Aktualizovat subcontent
    const subContent = subCategory.subContents[subContentIndex];
    
    subContent.title = data.title;
    subContent.icon = data.icon;
    subContent.description = data.description || subContent.description;
    subContent.content = data.content || subContent.content;
    subContent.color = data.color || subContent.color;
    subContent.imageUrls = data.imageUrls || subContent.imageUrls;
    subContent.alternativeTexts = data.alternativeTexts || subContent.alternativeTexts;
    subContent.imageContents = data.imageContents || subContent.imageContents;
    
    await category.save();
    
    return NextResponse.json(subContent);
  } catch (error) {
    console.error('Chyba při aktualizaci subcontentu:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při aktualizaci subcontentu' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id]/subcategory/[subCategoryId]/subcontent/[subContentId] - Smazání subcontentu
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; subCategoryId: string; subContentId: string } }
) {
  try {
    const { id: categoryId, subCategoryId, subContentId } = params;
    
    // Kontrola platnosti ID
    if (!mongoose.Types.ObjectId.isValid(categoryId) || 
        !mongoose.Types.ObjectId.isValid(subCategoryId) || 
        !mongoose.Types.ObjectId.isValid(subContentId)) {
      return NextResponse.json(
        { error: 'Neplatné ID kategorie, subkategorie nebo subcontentu' },
        { status: 400 }
      );
    }
    
    // Připojení k databázi
    await connectToDatabase();
    
    // Najít kategorii
    const category = await Category.findById(categoryId);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Kategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    // Kontrola, zda subCategories existuje
    if (!category.subCategories || category.subCategories.length === 0) {
      return NextResponse.json(
        { error: 'Kategorie nemá žádné subkategorie' },
        { status: 404 }
      );
    }
    
    // Najít index subkategorie
    const subCategoryIndex = category.subCategories.findIndex(
      (sub: any) => sub._id.toString() === subCategoryId
    );
    
    if (subCategoryIndex === -1) {
      return NextResponse.json(
        { error: 'Subkategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    const subCategory = category.subCategories[subCategoryIndex];
    
    // Kontrola, zda subContents existuje
    if (!subCategory.subContents || subCategory.subContents.length === 0) {
      return NextResponse.json(
        { error: 'Subkategorie nemá žádné subcontenty' },
        { status: 404 }
      );
    }
    
    // Najít index subcontentu
    const subContentIndex = subCategory.subContents.findIndex(
      (content: any) => content._id.toString() === subContentId
    );
    
    if (subContentIndex === -1) {
      return NextResponse.json(
        { error: 'Subcontent nebyl nalezen' },
        { status: 404 }
      );
    }
    
    // Odstranit subcontent
    subCategory.subContents.splice(subContentIndex, 1);
    
    // Uložit změny
    await category.save();
    
    return NextResponse.json({ message: 'Subcontent úspěšně odstraněn' });
  } catch (error) {
    console.error('Chyba při mazání subcontentu:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při mazání subcontentu' },
      { status: 500 }
    );
  }
}

// PATCH /api/categories/[id]/subcategory/[subCategoryId]/subcontent/[subContentId] - Částečná aktualizace subcontentu
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; subCategoryId: string; subContentId: string } }
) {
  try {
    const { id: categoryId, subCategoryId, subContentId } = params;
    const updates = await request.json();
    
    // Kontrola platnosti ID
    if (!mongoose.Types.ObjectId.isValid(categoryId) || 
        !mongoose.Types.ObjectId.isValid(subCategoryId) || 
        !mongoose.Types.ObjectId.isValid(subContentId)) {
      return NextResponse.json(
        { error: 'Neplatné ID kategorie, subkategorie nebo subcontentu' },
        { status: 400 }
      );
    }
    
    // Připojení k databázi
    await connectToDatabase();

    // Ověření existence kategorie
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ error: 'Kategorie nenalezena' }, { status: 404 });
    }
    
    // Kontrola, zda subCategories existuje
    if (!category.subCategories || category.subCategories.length === 0) {
      return NextResponse.json({ error: 'Kategorie nemá žádné subkategorie' }, { status: 404 });
    }

    // Najít subkategorii
    const subCategoryIndex = category.subCategories.findIndex(
      (sub: any) => sub._id.toString() === subCategoryId
    );
    
    if (subCategoryIndex === -1) {
      return NextResponse.json({ error: 'Subkategorie nenalezena' }, { status: 404 });
    }
    
    const subCategory = category.subCategories[subCategoryIndex];
    
    // Kontrola, zda subContents existuje
    if (!subCategory.subContents || subCategory.subContents.length === 0) {
      return NextResponse.json({ error: 'Subkategorie nemá žádné subcontenty' }, { status: 404 });
    }

    // Najít subcontent
    const subContentIndex = subCategory.subContents.findIndex(
      (content: any) => content._id.toString() === subContentId
    );
    
    if (subContentIndex === -1) {
      return NextResponse.json({ error: 'Subcontent nenalezen' }, { status: 404 });
    }
    
    // Aktualizace polí subcontentu
    const subContent = subCategory.subContents[subContentIndex];
    
    // Aktualizovat jen ta pole, která byla poslána
    Object.keys(updates).forEach(key => {
      // @ts-ignore - Ignorujeme typové chyby pro dynamický přístup k vlastnostem
      if (subContent[key] !== undefined) {
        // @ts-ignore
        subContent[key] = updates[key];
      }
    });
    
    // Uložit změny
    await category.save();
    
    return NextResponse.json(subContent);
  } catch (error) {
    console.error('Chyba při částečné aktualizaci subcontentu:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při aktualizaci subcontentu' },
      { status: 500 }
    );
  }
} 