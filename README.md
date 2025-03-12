# Platforma pro učení pracovních dovedností

Mobilně optimalizovaná webová aplikace pro organizaci a správu kategorií dovedností. Aplikace umožňuje uživatelům procházet, vytvářet, upravovat a mazat kategorie dovedností.

## Funkce

- Responzivní design optimalizovaný pro mobilní zařízení
- Přehledné zobrazení kategorií dovedností
- Detailní zobrazení jednotlivých kategorií
- Správa kategorií (CRUD operace)
- Vyhledávání kategorií
- Ukládání dat v MongoDB databázi

## Technologie

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Databáze**: MongoDB
- **Styling**: Tailwind CSS

## Instalace a spuštění

### Požadavky

- Node.js (verze 18 nebo novější)
- MongoDB (lokální instalace nebo MongoDB Atlas)

### Kroky instalace

1. Naklonujte repozitář:
   ```bash
   git clone <url-repozitáře>
   cd <název-složky>
   ```

2. Nainstalujte závislosti:
   ```bash
   npm install
   ```

3. Vytvořte soubor `.env.local` v kořenovém adresáři projektu a přidejte následující proměnné:
   ```
   MONGODB_URI=mongodb://localhost:27017/job-learning
   ```
   Pokud používáte MongoDB Atlas nebo jinou vzdálenou instanci MongoDB, upravte URI podle potřeby.

4. Spusťte vývojový server:
   ```bash
   npm run dev
   ```

5. Otevřete prohlížeč a přejděte na adresu [http://localhost:3000](http://localhost:3000)

## Struktura projektu

- `src/app` - Next.js stránky a API routes
- `src/components` - React komponenty
- `src/models` - MongoDB modely
- `src/lib` - Utility a pomocné funkce
- `public` - Statické soubory

## Databáze

Aplikace používá MongoDB pro ukládání dat. Kategorie jsou uloženy v kolekci `categories` s následující strukturou:

```typescript
interface ICategory {
  name: string;
  description: string;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpointy

- `GET /api/categories` - Získání všech kategorií
- `POST /api/categories` - Vytvoření nové kategorie
- `GET /api/categories/[id]` - Získání konkrétní kategorie
- `PUT /api/categories/[id]` - Aktualizace kategorie
- `DELETE /api/categories/[id]` - Smazání kategorie

## Nasazení

Aplikaci lze nasadit na platformy jako Vercel, Netlify nebo vlastní server. Před nasazením nezapomeňte nastavit proměnné prostředí pro produkční prostředí.

## Licence

ISC 