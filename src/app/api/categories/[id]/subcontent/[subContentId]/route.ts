import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import mongoose from 'mongoose';

// PUT /api/categories/[id]/subcontent/[subContentId] - Aktualizace sub-contentu v kategorii
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; subContentId: string } }
) {
  try {
    await connectToDatabase();
    
    const { id, subContentId } = params;
    console.log('Aktualizace sub-contentu:', { categoryId: id, subContentId });
    
    // Kontrola platnosti ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('Neplatné ID kategorie:', id);
      return NextResponse.json(
        { error: 'Neplatné ID kategorie' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    console.log('Přijatá data pro aktualizaci:', data);
    
    // Validace dat
    if (!data.title || !data.icon) {
      console.error('Chybějící povinná data:', { title: data.title, icon: data.icon });
      return NextResponse.json(
        { error: 'Název a ikona jsou povinné' },
        { status: 400 }
      );
    }
    
    // Najít kategorii
    const category = await Category.findById(id);
    
    if (!category) {
      console.error('Kategorie nebyla nalezena:', id);
      return NextResponse.json(
        { error: 'Kategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    // Aktualizace sub-contentu
    if (category.subContents && category.subContents.length > 0) {
      const subContentIndex = category.subContents.findIndex(
        // @ts-ignore - Ignorujeme typovou chybu, protože víme, že _id existuje
        (sc) => sc._id && sc._id.toString() === subContentId
      );
      
      if (subContentIndex === -1) {
        console.error('Sub-content nebyl nalezen:', subContentId);
        return NextResponse.json(
          { error: 'Sub-content nebyl nalezen' },
          { status: 404 }
        );
      }
      
      console.log('Nalezen sub-content na indexu:', subContentIndex);
      
      // Aktualizace sub-contentu
      category.subContents[subContentIndex].title = data.title;
      category.subContents[subContentIndex].icon = data.icon;
      category.subContents[subContentIndex].description = data.description || '';
      category.subContents[subContentIndex].content = data.content || '';
      category.subContents[subContentIndex].color = data.color || '#f8a287';
      
      console.log('Ukládám změny...');
      await category.save();
      console.log('Změny uloženy');
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Chyba při aktualizaci sub-contentu:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při aktualizaci sub-contentu' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id]/subcontent/[subContentId] - Odstranění sub-contentu z kategorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; subContentId: string } }
) {
  try {
    await connectToDatabase();
    
    const { id, subContentId } = params;
    console.log('Mazání sub-contentu:', { categoryId: id, subContentId });
    
    // Kontrola platnosti ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('Neplatné ID kategorie:', id);
      return NextResponse.json(
        { error: 'Neplatné ID kategorie' },
        { status: 400 }
      );
    }
    
    // Najít kategorii a odstranit sub-content
    const category = await Category.findById(id);
    
    if (!category) {
      console.error('Kategorie nebyla nalezena:', id);
      return NextResponse.json(
        { error: 'Kategorie nebyla nalezena' },
        { status: 404 }
      );
    }
    
    // Odstranění sub-contentu
    if (category.subContents && category.subContents.length > 0) {
      const subContentCount = category.subContents.length;
      category.subContents = category.subContents.filter(
        // @ts-ignore - Ignorujeme typovou chybu, protože víme, že _id existuje
        (sc) => sc._id && sc._id.toString() !== subContentId
      );
      
      console.log(`Odstraněno ${subContentCount - category.subContents.length} sub-contentů`);
      
      await category.save();
      console.log('Změny uloženy');
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Chyba při odstraňování sub-contentu:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při odstraňování sub-contentu' },
      { status: 500 }
    );
  }
} 