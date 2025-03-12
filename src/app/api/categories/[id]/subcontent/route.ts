import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category, ISubContent } from '@/models/Category';
import mongoose from 'mongoose';

// POST /api/categories/[id]/subcontent - Přidání nového sub-contentu ke kategorii
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
    if (!data.title || !data.icon) {
      console.error('Chybějící povinná data:', { title: data.title, icon: data.icon });
      return NextResponse.json(
        { error: 'Název a ikona jsou povinné' },
        { status: 400 }
      );
    }
    
    // Najít kategorii a přidat sub-content
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
    
    // Přidání nového sub-contentu
    category.subContents = category.subContents || [];
    
    const newSubContent = {
      title: data.title,
      icon: data.icon,
      description: data.description || '',
      content: data.content || '',
      color: data.color || '#f8a287',
    };
    
    console.log('Přidávám nový sub-content:', newSubContent);
    category.subContents.push(newSubContent);
    
    console.log('Ukládám změny...');
    await category.save();
    console.log('Změny uloženy');
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Chyba při přidávání sub-contentu:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při přidávání sub-contentu' },
      { status: 500 }
    );
  }
} 