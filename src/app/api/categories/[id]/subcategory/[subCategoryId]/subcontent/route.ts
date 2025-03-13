import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import { Category } from '@/models/Category';

// POST /api/categories/[id]/subcategory/[subCategoryId]/subcontent - Přidání nového sub-contentu k subkategorii
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; subCategoryId: string } }
) {
  try {
    const categoryId = params.id;
    const subCategoryId = params.subCategoryId;

    // Ověření platného categoryId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      console.log('Neplatné ID kategorie:', categoryId);
      return NextResponse.json({ error: 'Neplatné ID kategorie' }, { status: 400 });
    }

    // Ověření platného subCategoryId
    if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
      console.log('Neplatné ID subkategorie:', subCategoryId);
      return NextResponse.json({ error: 'Neplatné ID subkategorie' }, { status: 400 });
    }

    // Připojení k databázi
    await connectToDatabase();
    console.log('Připojeno k databázi');

    // Ověření existence kategorie
    const category = await Category.findById(categoryId);
    if (!category) {
      console.log('Kategorie nenalezena:', categoryId);
      return NextResponse.json({ error: 'Kategorie nenalezena' }, { status: 404 });
    }

    // Ověření existence subkategorie
    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory) {
      console.log('Subkategorie nenalezena:', subCategoryId);
      return NextResponse.json({ error: 'Subkategorie nenalezena' }, { status: 404 });
    }

    // Zpracování dat z požadavku
    const data = await request.json();
    console.log('Přijatá data:', data);

    // Ověření povinných polí
    if (!data.title || !data.icon) {
      console.log('Chybí povinná pole');
      return NextResponse.json(
        { error: 'Název a ikona jsou povinné' },
        { status: 400 }
      );
    }

    // Přidání nového subobsahu
    const newSubContent = {
      title: data.title,
      icon: data.icon,
      description: data.description || '',
      content: data.content || '',
      color: data.color || '#f8a287',
      imageUrls: data.imageUrls || [],
      alternativeTexts: data.alternativeTexts || [],
      imageContents: data.imageContents || []
    };

    subCategory.subContents.push(newSubContent);

    // Uložení změn
    await category.save();
    console.log('Subcontent byl úspěšně přidán');

    return NextResponse.json(
      { message: 'Subcontent byl úspěšně přidán' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Chyba při zpracování požadavku:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při zpracování požadavku' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; subCategoryId: string; subContentId: string } }
) {
  try {
    const categoryId = params.id;
    const subCategoryId = params.subCategoryId;
    const subContentId = params.subContentId;

    // Ověření platnosti ID
    if (!mongoose.Types.ObjectId.isValid(categoryId) || 
        !mongoose.Types.ObjectId.isValid(subCategoryId) ||
        !mongoose.Types.ObjectId.isValid(subContentId)) {
      return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 });
    }

    // Připojení k databázi
    await connectToDatabase();

    // Ověření existence kategorie
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ error: 'Kategorie nenalezena' }, { status: 404 });
    }

    // Ověření existence subkategorie
    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory) {
      return NextResponse.json({ error: 'Subkategorie nenalezena' }, { status: 404 });
    }

    // Ověření existence subcontentu
    const subContent = subCategory.subContents.id(subContentId);
    if (!subContent) {
      return NextResponse.json({ error: 'Subcontent nenalezen' }, { status: 404 });
    }

    // Zpracování dat z požadavku
    const data = await request.json();

    // Ověření povinných polí
    if (!data.title || !data.icon) {
      return NextResponse.json(
        { error: 'Název a ikona jsou povinné' },
        { status: 400 }
      );
    }

    // Aktualizace subcontentu
    subContent.title = data.title || subContent.title;
    subContent.icon = data.icon || subContent.icon;
    subContent.description = data.description !== undefined ? data.description : subContent.description;
    subContent.content = data.content !== undefined ? data.content : subContent.content;
    subContent.color = data.color || subContent.color;
    subContent.imageUrls = data.imageUrls || subContent.imageUrls;
    subContent.alternativeTexts = data.alternativeTexts || subContent.alternativeTexts;
    subContent.imageContents = data.imageContents || subContent.imageContents;

    // Uložení změn
    await category.save();

    return NextResponse.json(
      { message: 'Subcontent byl úspěšně aktualizován' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chyba při aktualizaci subcontentu:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při aktualizaci subcontentu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; subCategoryId: string; subContentId: string } }
) {
  try {
    const categoryId = params.id;
    const subCategoryId = params.subCategoryId;
    const subContentId = params.subContentId;

    // Ověření platnosti ID
    if (!mongoose.Types.ObjectId.isValid(categoryId) || 
        !mongoose.Types.ObjectId.isValid(subCategoryId) ||
        !mongoose.Types.ObjectId.isValid(subContentId)) {
      return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 });
    }

    // Připojení k databázi
    await connectToDatabase();

    // Ověření existence kategorie
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ error: 'Kategorie nenalezena' }, { status: 404 });
    }

    // Ověření existence subkategorie
    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory) {
      return NextResponse.json({ error: 'Subkategorie nenalezena' }, { status: 404 });
    }

    // Ověření existence subcontentu
    const subContent = subCategory.subContents.id(subContentId);
    if (!subContent) {
      return NextResponse.json({ error: 'Subcontent nenalezen' }, { status: 404 });
    }

    // Odstranění subcontentu
    subContent.deleteOne();

    // Uložení změn
    await category.save();

    return NextResponse.json(
      { message: 'Subcontent byl úspěšně odstraněn' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chyba při mazání subcontentu:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při mazání subcontentu' },
      { status: 500 }
    );
  }
} 