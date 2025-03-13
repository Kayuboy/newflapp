import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Cesty, které vyžadují autentizaci - každá cesta je definována jako objekt s URL a povolenými metodami
// Pokud je pole metod prázdné, jsou chráněny všechny metody
const PROTECTED_RESOURCES = [
  // Hlavní kategorie - POST (vytvoření), PUT a DELETE (aktualizace a mazání)
  { path: '/api/categories', methods: ['POST'] },
  { path: '/api/categories/[id]', methods: ['PUT', 'DELETE'] },
  
  // Subkategorie - všechny metody manipulující s daty
  { path: '/api/categories/[id]/subcategory', methods: ['POST'] },
  { path: '/api/categories/[id]/subcategory/[subCategoryId]', methods: ['PUT', 'DELETE'] },
  
  // Subcontenty - všechny metody manipulující s daty
  { path: '/api/categories/[id]/subcategory/[subCategoryId]/subcontent', methods: ['POST'] },
  { path: '/api/categories/[id]/subcategory/[subCategoryId]/subcontent/[subContentId]', methods: ['PUT', 'PATCH', 'DELETE'] },
  
  // Cesta pro upload souborů
  { path: '/api/upload', methods: [] },
];

// Kontrola, zda URL odpovídá chráněným cestám
function matchesProtectedResource(url: string, method: string): boolean {
  // Odstranění query parametrů
  const path = url.split('?')[0];
  
  // Kontrola proti definovaným chráněným zdrojům
  return PROTECTED_RESOURCES.some(resource => {
    const pathMatches = matchesPath(path, resource.path);
    const methodMatches = resource.methods.length === 0 || resource.methods.includes(method);
    
    return pathMatches && methodMatches;
  });
}

// Pomocná funkce pro porovnání cest včetně dynamických parametrů
function matchesPath(actualPath: string, protectedPath: string): boolean {
  // Přesná shoda
  if (actualPath === protectedPath) return true;
  
  // Kontrola pro dynamické cesty s [parametrem]
  if (protectedPath.includes('[')) {
    const protectedPathRegex = protectedPath
      .replace(/\//g, '\\/')  // Escape lomítek
      .replace(/\[([^\]]+)\]/g, '([^/]+)');  // Převod [id] na ([^/]+)
    
    return new RegExp(`^${protectedPathRegex}$`).test(actualPath);
  }
  
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  
  // Kontrola, zda cesta a metoda vyžadují autentizaci
  if (matchesProtectedResource(pathname, method)) {
    console.log(`Chráněný zdroj: ${method} ${pathname}`);
    
    const token = request.cookies.get('auth-token')?.value;
    
    // Pokud token neexistuje, vrátit 401
    if (!token) {
      console.log('Přístup odepřen - chybí autentizační token');
      return NextResponse.json(
        { error: 'Přístup odepřen. Vyžadována autentizace.' },
        { status: 401 }
      );
    }
    
    try {
      // Ověření JWT tokenu
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'default-secret-key-for-development-only'
      );
      const { payload } = await jwtVerify(token, secret);
      
      // Kontrola, zda je uživatel admin
      if (!payload.isAdmin) {
        console.log('Přístup odepřen - uživatel není admin');
        return NextResponse.json(
          { error: 'Přístup odepřen. Vyžadována administrátorská práva.' },
          { status: 403 }
        );
      }
      
      // Pokud je všechno v pořádku, pokračovat v požadavku
      console.log('Autorizace úspěšná');
      return NextResponse.next();
    } catch (error) {
      // Neplatný token
      console.log('Přístup odepřen - neplatný token');
      return NextResponse.json(
        { error: 'Přístup odepřen. Neplatný token.' },
        { status: 401 }
      );
    }
  }
  
  // Pro neautorizované cesty pokračovat
  return NextResponse.next();
}

// Konfigurace middleware - aplikovat na API cesty
export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 