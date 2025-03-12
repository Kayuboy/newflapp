import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import mongoose from 'mongoose';

// GET /api/categories/[id] - Získání konkrétní kategorie
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Kontrola platnosti ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Neplatné ID kategorie' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const category = await Category.findById(id);
    
    if (!category) {
      return NextResponse.json(
        { message: 'Kategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Chyba při získávání kategorie:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při získávání kategorie' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Aktualizace kategorie
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Kontrola platnosti ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Neplatné ID kategorie' },
        { status: 400 }
      );
    }
    
    // Validace vstupních dat
    if (!body.name || !body.description) {
      return NextResponse.json(
        { message: 'Název a popis kategorie jsou povinné' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: body.name,
        description: body.description,
        icon: body.icon,
        color: body.color,
        isRecommended: body.isRecommended || false,
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return NextResponse.json(
        { message: 'Kategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedCategory);
  } catch (error: any) {
    console.error('Chyba při aktualizaci kategorie:', error);
    
    // Zpracování chyb validace z Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { message: 'Chyba validace', errors: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Nastala chyba při aktualizaci kategorie' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Smazání kategorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Kontrola platnosti ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Neplatné ID kategorie' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    const deletedCategory = await Category.findByIdAndDelete(id);
    
    if (!deletedCategory) {
      return NextResponse.json(
        { message: 'Kategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Kategorie byla úspěšně smazána' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chyba při mazání kategorie:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při mazání kategorie' },
      { status: 500 }
    );
  }
} 