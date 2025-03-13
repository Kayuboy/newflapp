import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Získání tokenu z cookies
    const token = cookies().get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    // Ověření tokenu
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'default-secret-key-for-development-only'
    );

    try {
      const { payload } = await jwtVerify(token, secret);
      
      // Získání aktuálních dat uživatele z databáze
      await connectToDatabase();
      const user = await User.findById(payload.id);
      
      if (!user) {
        return NextResponse.json(
          { authenticated: false, user: null },
          { status: 401 }
        );
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: user._id,
          username: user.username,
          isAdmin: user.isAdmin,
        },
      });
    } catch (err) {
      // Token je neplatný nebo vypršel
      cookies().delete('auth-token');
      
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Chyba při ověřování uživatele:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při ověřování uživatele' },
      { status: 500 }
    );
  }
} 