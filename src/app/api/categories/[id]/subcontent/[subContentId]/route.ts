import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category, ISubCategory, ISubContent } from '@/models/Category';
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
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(subContentId)) {
      console.error('Neplatné ID kategorie nebo subcontentu:', { id, subContentId });
      return NextResponse.json(
        { error: 'Neplatné ID kategorie nebo subcontentu' },
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
    
    // Kontrola, zda existují subkategorie
    if (!category.subCategories || category.subCategories.length === 0) {
      console.error('Kategorie nemá žádné subkategorie');
      return NextResponse.json(
        { error: 'Kategorie nemá žádné subkategorie' },
        { status: 404 }
      );
    }

    // Prohledat všechny subkategorie a najít subcontent
    let found = false;
    for (let i = 0; i < category.subCategories.length; i++) {
      const subCategory = category.subCategories[i];
      
      // Kontrola, zda existují subcontenty
      if (!subCategory.subContents || subCategory.subContents.length === 0) {
        continue;
      }
      
      // Najít index subcontentu
      const subContentIndex = subCategory.subContents.findIndex(
        (content: ISubContent) => (content._id as unknown as mongoose.Types.ObjectId).toString() === subContentId
      );
      
      if (subContentIndex !== -1) {
        // Našli jsme subcontent, aktualizujeme ho
        console.log('Nalezen subcontent v subkategorii:', subCategory.name);
        
        // Aktualizace subcontentu
        subCategory.subContents[subContentIndex].title = data.title;
        subCategory.subContents[subContentIndex].icon = data.icon;
        
        if (data.description !== undefined) {
          subCategory.subContents[subContentIndex].description = data.description;
        }
        
        if (data.content !== undefined) {
          subCategory.subContents[subContentIndex].content = data.content;
        }
        
        if (data.color !== undefined) {
          subCategory.subContents[subContentIndex].color = data.color;
        }
        
        if (data.imageUrls !== undefined) {
          subCategory.subContents[subContentIndex].imageUrls = data.imageUrls;
        }
        
        if (data.alternativeTexts !== undefined) {
          subCategory.subContents[subContentIndex].alternativeTexts = data.alternativeTexts;
        }
        
        if (data.imageContents !== undefined) {
          subCategory.subContents[subContentIndex].imageContents = data.imageContents;
        }
        
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.error('Subcontent nebyl nalezen:', subContentId);
      return NextResponse.json(
        { error: 'Subcontent nebyl nalezen' },
        { status: 404 }
      );
    }
    
    console.log('Ukládám změny...');
    await category.save();
    console.log('Změny uloženy');
    
    return NextResponse.json({ message: 'Subcontent byl úspěšně aktualizován' });
  } catch (error) {
    console.error('Chyba při aktualizaci subcontentu:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při aktualizaci subcontentu' },
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
    console.log('Mazání subcontentu:', { categoryId: id, subContentId });
    
    // Kontrola platnosti ID
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(subContentId)) {
      console.error('Neplatné ID kategorie nebo subcontentu:', { id, subContentId });
      return NextResponse.json(
        { error: 'Neplatné ID kategorie nebo subcontentu' },
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
    
    // Kontrola, zda existují subkategorie
    if (!category.subCategories || category.subCategories.length === 0) {
      console.error('Kategorie nemá žádné subkategorie');
      return NextResponse.json(
        { error: 'Kategorie nemá žádné subkategorie' },
        { status: 404 }
      );
    }

    // Prohledat všechny subkategorie a najít subcontent
    let found = false;
    for (let i = 0; i < category.subCategories.length; i++) {
      const subCategory = category.subCategories[i];
      
      // Kontrola, zda existují subcontenty
      if (!subCategory.subContents || subCategory.subContents.length === 0) {
        continue;
      }
      
      // Před odstraněním si zapamatovat počet subcontentů
      const originalLength = subCategory.subContents.length;
      
      // Odfiltrovat subcontent podle ID
      subCategory.subContents = subCategory.subContents.filter(
        (content: ISubContent) => (content._id as unknown as mongoose.Types.ObjectId).toString() !== subContentId
      );
      
      // Zkontrolovat, zda byl nějaký subcontent odstraněn
      if (subCategory.subContents.length < originalLength) {
        found = true;
        console.log(`Odstraněn subcontent z subkategorie: ${subCategory.name}`);
        break;
      }
    }
    
    if (!found) {
      console.error('Subcontent nebyl nalezen:', subContentId);
      return NextResponse.json(
        { error: 'Subcontent nebyl nalezen' },
        { status: 404 }
      );
    }
    
    console.log('Ukládám změny...');
    await category.save();
    console.log('Změny uloženy');
    
    return NextResponse.json({ message: 'Subcontent byl úspěšně odstraněn' });
  } catch (error) {
    console.error('Chyba při odstraňování subcontentu:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při odstraňování subcontentu' },
      { status: 500 }
    );
  }
} 