import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Smazání auth cookie
    cookies().delete('auth-token');

    return NextResponse.json({
      success: true,
      message: 'Odhlášení proběhlo úspěšně',
    });
  } catch (error) {
    console.error('Chyba při odhlašování:', error);
    return NextResponse.json(
      { error: 'Nastala chyba při odhlašování' },
      { status: 500 }
    );
  }
} 