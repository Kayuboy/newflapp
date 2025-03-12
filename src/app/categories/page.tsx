'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ICategory } from '@/models/Category';
import { renderIcon } from '@/utils/renderIcon';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Nepodařilo se načíst kategorie');
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Chyba při načítání kategorií:', err);
        setError('Nastala chyba při načítání kategorií. Zkuste to prosím později.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filtrování kategorií podle vyhledávacího termínu
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generování náhodné barvy pro kategorie, které nemají nastavenou barvu
  const getColorClass = (color?: string) => {
    if (color) return color;
    const colors = ['#f8a287', '#e27d60', '#c38d9e', '#41b3a3', '#5c6bc0', '#8d6e63'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <>
      <div className="app-background"></div>
      <div className="desktop-container">
        <div className="mobile-container">
          <div className="sticky-header">
            <div className="flex justify-between items-center">
              <Link href="/" className="back-button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </Link>
              <Link href="/categories/manage" className="w-auto px-2 h-8 bg-[#f8a287] rounded-md flex items-center justify-center text-white text-xs">
                <div className="flex items-center gap-1">
                  <span>Crafted with</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                  </svg>
                  <span>by Woundy</span>
                </div>
              </Link>
            </div>
          </div>
          
          <div className="mb-5">
            <h1 className="text-2xl font-bold mb-3">Kategorie</h1>
            
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

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f8a287]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-800/50 text-red-200 px-4 py-3 rounded-xl mb-4">
              <p>{error}</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Žádné kategorie</h2>
              <p className="text-gray-400 mb-6">
                {searchTerm 
                  ? 'Nebyly nalezeny žádné kategorie odpovídající vašemu vyhledávání.' 
                  : 'Zatím nebyly vytvořeny žádné kategorie.'}
              </p>
              <Link href="/categories/manage" className="apply-button inline-flex">
                <span>Vytvořit kategorii</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCategories.map((category) => (
                <Link 
                  href={`/categories/${category._id}`} 
                  key={category._id?.toString()} 
                  className="category-card block"
                >
                  <div className="flex items-center">
                    <div 
                      className="category-icon"
                      style={{ backgroundColor: getColorClass(category.color) }}
                    >
                      {renderIcon(category.icon || 'academic-cap')}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 