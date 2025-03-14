/**
 * Konfigurační soubor pro nastavení výkonu aplikace
 */

// Cache nastavení pro fetch požadavky
export const fetchOptions = {
  // Výchozí nastavení pro většinu požadavků
  defaultOptions: {
    cache: 'no-store' as RequestCache,
    headers: {
      'Cache-Control': 'no-cache',
    },
    next: { revalidate: 0 }
  },
  
  // Nastavení pro statická data, která se nemění často
  staticDataOptions: {
    cache: 'force-cache' as RequestCache,
    next: { revalidate: 3600 } // revalidace po 1 hodině
  }
};

// Časové limity pro debouncing a throttling
export const timeouts = {
  // Pro vyhledávání
  searchDebounce: 300, // ms
  
  // Pro obnovení stránky
  pageRefresh: 1000, // ms
  
  // Pro kontrolu autentizace
  authCheck: 5 * 60 * 1000, // 5 minut
};

// Nastavení pro optimalizaci vykreslování komponent
export const renderingSettings = {
  // Kolik položek vykreslit na jednu stránku
  pageSize: 10,
  
  // Výchozí kvalita obrázků
  imageQuality: 75,
  
  // Prioritní načítání určitých obrázků
  priorityImages: ['logo', 'banner', 'hero'],
};

// Strategie načítání kategorií
export const categoryLoadingStrategy = {
  // Načíst populární kategorie při startu
  loadPopularOnStart: true,
  
  // Líně načítat ostatní kategorie
  lazyLoadOthers: true,
  
  // Předběžně načíst související kategorie
  prefetchRelated: true,
};

export default {
  fetchOptions,
  timeouts,
  renderingSettings,
  categoryLoadingStrategy
}; 