import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category } from '@/models/Category';

// Cache pro uložení výsledků dotazů
let categoriesCache: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minuta v ms

// GET /api/categories - Získání všech kategorií
export async function GET() {
  try {
    // Kontrola, zda máme platná data v cache
    const currentTime = Date.now();
    if (categoriesCache.length > 0 && currentTime - lastFetchTime < CACHE_DURATION) {
      console.log('Vracím kategorie z cache');
      return NextResponse.json(categoriesCache, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    await connectToDatabase();
    
    // Omezíme množství navrácených dat na pouze potřebné pole
    // Použijeme lean() pro získání pouze čistých JavaScript objektů místo Mongoose dokumentů
    const categories = await Category.find({})
      .select('name description icon color isRecommended createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();
    
    // Aktualizace cache
    categoriesCache = categories;
    lastFetchTime = currentTime;
    
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
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
    
    // Vynulování cache po vytvoření nové kategorie
    categoriesCache = [];
    
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