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
    
    // Najít subkategorii
    const subCategory = category.subCategories?.find(
      (sub: any) => sub._id.toString() === subCategoryId
    );
    
    if (!subCategory) {
      return NextResponse.json(
        { error: 'Subkategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    // Najít subcontent
    const subContent = subCategory.subContents?.find(
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
    
    // Najít index subkategorie
    const subCategoryIndex = category.subCategories?.findIndex(
      (sub: any) => sub._id.toString() === subCategoryId
    );
    
    if (subCategoryIndex === undefined || subCategoryIndex === -1 || !category.subCategories) {
      return NextResponse.json(
        { error: 'Subkategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    // Najít index subcontentu
    const subContentIndex = category.subCategories[subCategoryIndex].subContents?.findIndex(
      (content: any) => content._id.toString() === subContentId
    );
    
    if (subContentIndex === undefined || subContentIndex === -1 || 
        !category.subCategories[subCategoryIndex].subContents) {
      return NextResponse.json(
        { error: 'Subcontent nebyl nalezen' },
        { status: 404 }
      );
    }
    
    // Aktualizovat subcontent
    const subContents = category.subCategories[subCategoryIndex].subContents;
    
    subContents[subContentIndex].title = data.title;
    subContents[subContentIndex].icon = data.icon;
    subContents[subContentIndex].description = data.description || subContents[subContentIndex].description;
    subContents[subContentIndex].content = data.content || subContents[subContentIndex].content;
    subContents[subContentIndex].color = data.color || subContents[subContentIndex].color;
    
    await category.save();
    
    return NextResponse.json(category);
  } catch (error) {
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
    
    // Najít index subkategorie
    const subCategoryIndex = category.subCategories?.findIndex(
      (sub: any) => sub._id.toString() === subCategoryId
    );
    
    if (subCategoryIndex === undefined || subCategoryIndex === -1 || !category.subCategories) {
      return NextResponse.json(
        { error: 'Subkategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    // Najít index subcontentu
    const subContentIndex = category.subCategories[subCategoryIndex].subContents?.findIndex(
      (content: any) => content._id.toString() === subContentId
    );
    
    if (subContentIndex === undefined || subContentIndex === -1 || 
        !category.subCategories[subCategoryIndex].subContents) {
      return NextResponse.json(
        { error: 'Subcontent nebyl nalezen' },
        { status: 404 }
      );
    }
    
    // Odstranit subcontent
    category.subCategories[subCategoryIndex].subContents.splice(subContentIndex, 1);
    
    await category.save();
    
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: 'Nastala chyba při mazání subcontentu' },
      { status: 500 }
    );
  }
} 