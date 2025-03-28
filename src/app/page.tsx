'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { ICategory } from '@/models/Category';
import { IconComponent, renderIcon } from '@/utils/renderIcon';
import AdminGuard from '@/components/AdminGuard';
import BrandLogin from '@/components/BrandLogin';
import { fetchOptions } from '@/config/performance';

// Skeleton komponenta pro kategorii
const CategorySkeleton = () => (
  <div className="category-card block animate-pulse">
    <div className="flex items-center">
      <div className="category-icon bg-gray-600/30"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-600/30 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-600/20 rounded w-full"></div>
      </div>
      <div className="w-5 h-5 bg-gray-600/30 rounded"></div>
    </div>
  </div>
);

export default function Home() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  // Přidáme indikátor pro postupné načítání
  const [categoriesVisible, setCategoriesVisible] = useState<boolean>(false);

  // Použití useCallback pro memoizaci fetchCategories funkce
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      // Použijeme konfigurační nastavení pro fetch
      const response = await fetch('/api/categories', {
        ...fetchOptions.defaultOptions,
        // Nastavení timeoutu pro fetch požadavek
        signal: AbortSignal.timeout(5000) // 5 sekund limit
      });
      
      if (!response.ok) {
        throw new Error('Nepodařilo se načíst kategorie');
      }
      
      const data = await response.json();
      setCategories(data);

      // Krátké zpoždění před zobrazením kategorií pro redukci jumping UI
      setTimeout(() => {
        setCategoriesVisible(true);
      }, 100);
    } catch (err) {
      console.error('Chyba při načítání kategorií:', err);
      setError('Nastala chyba při načítání kategorií.');
      // V případě chyby také zobrazíme obsah
      setCategoriesVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimalizovaný useEffect pro obnovení dat s předdefinovaným nastavením
  useEffect(() => {
    // Implementace rychlejšího počátečního načtení
    const initialLoad = async () => {
      // Okamžitě zobrazíme skeletons
      setLoading(true);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('/api/categories', {
          ...fetchOptions.defaultOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error('Nepodařilo se načíst kategorie');
        }
        
        const data = await response.json();
        setCategories(data);
        
        // Krátké zpoždění před zobrazením kategorií pro redukci jumping UI
        setTimeout(() => {
          setCategoriesVisible(true);
          setLoading(false);
        }, 100);
      } catch (err) {
        console.error('Chyba při počátečním načítání:', err);
        setError('Nastala chyba při načítání kategorií.');
        setCategoriesVisible(true);
        setLoading(false);
      }
    };
    
    initialLoad();
    
    // Omezení četnosti event listenerů - debouncing
    let visibilityTimeout: NodeJS.Timeout;
    let focusTimeout: NodeJS.Timeout;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Použití timeoutu pro omezení příliš častého volání
        clearTimeout(visibilityTimeout);
        visibilityTimeout = setTimeout(() => {
          setRefreshKey(prevKey => prevKey + 1);
        }, 1000);
      }
    };

    const handleFocus = () => {
      // Použití timeoutu pro omezení příliš častého volání
      clearTimeout(focusTimeout);
      focusTimeout = setTimeout(() => {
        setRefreshKey(prevKey => prevKey + 1);
      }, 1000);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearTimeout(visibilityTimeout);
      clearTimeout(focusTimeout);
    };
  }, [fetchCategories]);

  // Použití useMemo pro filtrování kategorií - výpočet se provede pouze když se změní searchTerm nebo categories
  const filteredCategories = useMemo(() => 
    categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [categories, searchTerm]
  );

  // Memoizované doporučené kategorie
  const recommendedCategories = useMemo(() => 
    filteredCategories.filter(cat => cat.isRecommended === true).slice(0, 3),
    [filteredCategories]
  );

  // Generování náhodné barvy pro kategorie, které nemají nastavenou barvu
  const getColorClass = useCallback((color?: string) => {
    if (color) return color;
    const colors = ['#f8a287', '#e27d60', '#c38d9e', '#41b3a3', '#5c6bc0', '#8d6e63'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // Memoizovaný render item pro kategorii
  const CategoryItem = useCallback(({ category }: { category: ICategory }) => (
    <Link href={`/categories/${category._id}`} key={category._id?.toString()} className="category-card block">
      <div className="flex items-center">
        <div 
          className="category-icon"
          style={{ backgroundColor: getColorClass(category.color) }}
        >
          <IconComponent iconName={category.icon || 'academic-cap'} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{category.name}</h4>
          <p className="text-sm text-gray-500 line-clamp-1">{category.description}</p>
        </div>
        <div className="text-[#f8a287]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </Link>
  ), [getColorClass]);

  return (
    <div className="container mx-auto px-4">
      <div className="app-background"></div>
      <div className="desktop-container">
        <div className="mobile-container">
          <div className="sticky-header">
            <div className="flex justify-between items-center">
              <button className="back-button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <BrandLogin />
            </div>
          </div>
          
          <div className="mb-5">
            <h1 className="text-2xl font-bold mb-1">Vyhledávání</h1>
            <h2 className="text-2xl font-bold mb-3"></h2>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Hledat kategorie" 
                className="search-input pr-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-button absolute right-1 top-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="category-stat bg-[#e27d60]">
              <span className="text-2xl font-bold">{categories.length}</span>
              <span className="text-sm">Uloženo</span>
            </div>
            <div className="category-stat bg-[#c38d9e]">
              <span className="text-2xl font-bold">{Math.floor(categories.length / 2)}</span>
              <span className="text-sm">Oblíbené</span>
            </div>
            <div className="category-stat bg-[#f8a287]">
              <span className="text-2xl font-bold">{categories.length}</span>
              <span className="text-sm">Nové</span>
            </div>
          </div>
          
          <div className="mb-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Vaše Kategorie</h3>
              <AdminGuard>
                <Link href="/categories/manage" className="text-sm text-[#f8a287]">
                  Spravovat
                </Link>
              </AdminGuard>
            </div>
            
            {loading && !categoriesVisible ? (
              <div className="space-y-3">
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
              </div>
            ) : error ? (
              <div className="bg-red-800/50 text-red-200 px-4 py-3 rounded-xl mb-4">
                <p>{error}</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-6 bg-gray-800/30 rounded-xl mb-4">
                <h2 className="text-lg font-semibold mb-2">Žádné kategorie</h2>
                <p className="text-gray-400 mb-4 text-sm">
                  {searchTerm 
                    ? 'Nebyly nalezeny žádné kategorie odpovídající vašemu vyhledávání.' 
                    : 'Zatím nebyly vytvořeny žádné kategorie.'}
                </p>
                <AdminGuard>
                  <Link href="/categories/manage" className="text-[#f8a287] text-sm hover:underline">
                    Vytvořit kategorii
                  </Link>
                </AdminGuard>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCategories.slice(0, 3).map((category) => (
                  <CategoryItem key={category._id?.toString()} category={category} />
                ))}
              </div>
            )}
            
            {filteredCategories.length > 3 && (
              <Link href="/categories" className="text-center block w-full text-sm text-[#f8a287] mt-4 hover:underline">
                Zobrazit všechny kategorie ({filteredCategories.length})
              </Link>
            )}
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Doporučené Kategorie</h3>
            </div>
            
            {loading && !categoriesVisible ? (
              <div className="space-y-3">
                <CategorySkeleton />
                <CategorySkeleton />
              </div>
            ) : !loading && filteredCategories.length > 0 ? (
              <>
                {recommendedCategories.length > 0 ? (
                  <div className="space-y-3">
                    {recommendedCategories.map((category) => (
                      <CategoryItem key={category._id?.toString()} category={category} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-800/30 rounded-xl">
                    <p className="text-gray-400 text-sm">
                      Zatím nejsou k dispozici žádná doporučení.
                    </p>
                  </div>
                )}
              </>
            ) : !loading && (
              <div className="text-center py-6 bg-gray-800/30 rounded-xl">
                <p className="text-gray-400 text-sm">
                  Zatím nejsou k dispozici žádná doporučení.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 