import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { username, password, adminKey } = await request.json();

    // Kontrola povinných polí
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Uživatelské jméno a heslo jsou povinné' },
        { status: 400 }
      );
    }

    // Zde můžete mít vlastní klíč pro vytvoření admin účtu
    const correctAdminKey = 'secret-admin-key-123'; // V produkci by toto mělo být v env proměnných
    const isAdmin = adminKey === correctAdminKey;

    // Připojení k databázi
    await connectToDatabase();

    // Kontrola, zda uživatel již existuje
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Uživatel s tímto jménem již existuje' },
        { status: 400 }
      );
    }

    // Vytvoření nového uživatele
    const newUser = new User({
      username,
      password,
      isAdmin,
    });

    await newUser.save();

    // Nevracíme heslo v odpovědi
    const userData = {
      id: newUser._id,
      username: newUser.username,
      isAdmin: newUser.isAdmin,
    };

    return NextResponse.json({
      success: true,
      message: 'Uživatel byl úspěšně vytvořen',
      user: userData,
    });
  } catch (error) {
    console.error('Chyba při registraci uživatele:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při registraci uživatele' },
      { status: 500 }
    );
  }
} 