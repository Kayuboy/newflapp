import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Kontrola povinných polí
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Uživatelské jméno a heslo jsou povinné' },
        { status: 400 }
      );
    }

    // Připojení k databázi
    await connectToDatabase();

    // Vyhledání uživatele
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'Nesprávné uživatelské jméno nebo heslo' },
        { status: 401 }
      );
    }

    // Ověření hesla
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Nesprávné uživatelské jméno nebo heslo' },
        { status: 401 }
      );
    }

    // Vytvoření JWT tokenu
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'default-secret-key-for-development-only'
    );
    
    const token = await new SignJWT({ 
      id: user._id.toString(),
      username: user.username,
      isAdmin: user.isAdmin 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // Nastavení cookie s tokenem
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hodin
      path: '/',
    });

    // Vytvoření odpovědi s informacemi o přihlášeném uživateli
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Chyba při přihlašování:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při přihlašování' },
      { status: 500 }
    );
  }
} 