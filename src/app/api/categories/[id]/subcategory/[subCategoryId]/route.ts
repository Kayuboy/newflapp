import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category, ISubCategory } from '@/models/Category';
import mongoose from 'mongoose';

// GET /api/categories/[id]/subcategory/[subCategoryId] - Získání konkrétní subkategorie
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; subCategoryId: string } }
) {
  try {
    await connectToDatabase();
    
    const { id, subCategoryId } = params;
    
    // Kontrola platnosti ID
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(subCategoryId)) {
      return NextResponse.json(
        { error: 'Neplatné ID kategorie nebo subkategorie' },
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
    
    // Najít subkategorii v kategorii
    const subCategory = category.subCategories?.find(
      (sub: any) => sub._id.toString() === subCategoryId
    );
    
    if (!subCategory) {
      return NextResponse.json(
        { error: 'Subkategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(subCategory);
  } catch (error) {
    return NextResponse.json(
      { error: 'Nastala chyba při získávání subkategorie' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id]/subcategory/[subCategoryId] - Aktualizace subkategorie
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; subCategoryId: string } }
) {
  try {
    await connectToDatabase();
    
    const { id, subCategoryId } = params;
    const data = await request.json();
    
    // Kontrola platnosti ID
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(subCategoryId)) {
      return NextResponse.json(
        { error: 'Neplatné ID kategorie nebo subkategorie' },
        { status: 400 }
      );
    }
    
    // Validace dat
    if (!data.name || !data.description) {
      return NextResponse.json(
        { error: 'Název a popis jsou povinné' },
        { status: 400 }
      );
    }
    
    // Najít a aktualizovat kategorii
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
    
    if (subCategoryIndex === undefined || subCategoryIndex === -1) {
      return NextResponse.json(
        { error: 'Subkategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    // Aktualizovat subkategorii
    if (category.subCategories && category.subCategories[subCategoryIndex]) {
      category.subCategories[subCategoryIndex].name = data.name;
      category.subCategories[subCategoryIndex].description = data.description;
      category.subCategories[subCategoryIndex].icon = data.icon || category.subCategories[subCategoryIndex].icon;
      category.subCategories[subCategoryIndex].color = data.color || category.subCategories[subCategoryIndex].color;
      
      await category.save();
      
      return NextResponse.json(category);
    } else {
      return NextResponse.json(
        { error: 'Subkategorie nebyla nalezena' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Nastala chyba při aktualizaci subkategorie' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id]/subcategory/[subCategoryId] - Smazání subkategorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; subCategoryId: string } }
) {
  try {
    await connectToDatabase();
    
    const { id, subCategoryId } = params;
    
    // Kontrola platnosti ID
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(subCategoryId)) {
      return NextResponse.json(
        { error: 'Neplatné ID kategorie nebo subkategorie' },
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
    
    if (subCategoryIndex === undefined || subCategoryIndex === -1) {
      return NextResponse.json(
        { error: 'Subkategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    // Odebrat subkategorii
    if (category.subCategories) {
      category.subCategories.splice(subCategoryIndex, 1);
      await category.save();
      
      return NextResponse.json(category);
    } else {
      return NextResponse.json(
        { error: 'Subkategorie nebyla nalezena' },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Nastala chyba při mazání subkategorie' },
      { status: 500 }
    );
  }
} 