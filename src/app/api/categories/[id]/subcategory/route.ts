import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import mongoose from 'mongoose';

// POST /api/categories/[id]/subcategory - Přidání nové subkategorie ke kategorii
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
    if (!data.name || !data.description) {
      console.error('Chybějící povinná data:', { name: data.name, description: data.description });
      return NextResponse.json(
        { error: 'Název a popis jsou povinné' },
        { status: 400 }
      );
    }
    
    // Najít kategorii a přidat subkategorii
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
    
    // Přidání nové subkategorie
    category.subCategories = category.subCategories || [];
    
    const newSubCategory = {
      name: data.name,
      description: data.description,
      icon: data.icon || 'puzzle',
      color: data.color || '#87b8f8',
      subContents: [],
    };
    
    console.log('Přidávám novou subkategorii:', newSubCategory);
    category.subCategories.push(newSubCategory);
    
    console.log('Ukládám změny...');
    await category.save();
    console.log('Změny uloženy');
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Chyba při přidávání subkategorie:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při přidávání subkategorie' },
      { status: 500 }
    );
  }
} 