import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category } from '@/models/Category';

// GET /api/categories - Získání všech kategorií
export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Chyba při získávání kategorií:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při získávání kategorií' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Vytvoření nové kategorie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validace vstupních dat
    if (!body.name || !body.description) {
      return NextResponse.json(
        { message: 'Název a popis kategorie jsou povinné' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Vytvoření nové kategorie
    const newCategory = await Category.create({
      name: body.name,
      description: body.description,
      icon: body.icon || 'academic-cap',
      color: body.color || '#f8a287',
      isRecommended: body.isRecommended || false,
    });
    
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error('Chyba při vytváření kategorie:', error);
    
    // Zpracování chyb validace z Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { message: 'Chyba validace', errors: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Nastala chyba při vytváření kategorie' },
      { status: 500 }
    );
  }
} 