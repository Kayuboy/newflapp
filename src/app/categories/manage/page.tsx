'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ICategory } from '@/models/Category';
import CategoryForm from '@/components/CategoryForm';
import { renderIcon } from '@/utils/renderIcon';

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Načtení kategorií
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

  useEffect(() => {
    fetchCategories();
  }, []);

  // Vytvoření nové kategorie
  const handleCreateCategory = async (categoryData: Partial<ICategory>) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nepodařilo se vytvořit kategorii');
      }

      await fetchCategories();
      setShowForm(false);
      setFormMessage({ type: 'success', text: 'Kategorie byla úspěšně vytvořena!' });
      
      setTimeout(() => {
        setFormMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Chyba při vytváření kategorie:', err);
      setFormMessage({ type: 'error', text: err.message || 'Nastala chyba při vytváření kategorie.' });
    }
  };

  // Aktualizace kategorie
  const handleUpdateCategory = async (categoryData: Partial<ICategory>) => {
    if (!editingCategory?._id) return;

    try {
      const response = await fetch(`/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nepodařilo se aktualizovat kategorii');
      }

      await fetchCategories();
      setEditingCategory(null);
      setShowForm(false);
      setFormMessage({ type: 'success', text: 'Kategorie byla úspěšně aktualizována!' });
      
      setTimeout(() => {
        setFormMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Chyba při aktualizaci kategorie:', err);
      setFormMessage({ type: 'error', text: err.message || 'Nastala chyba při aktualizaci kategorie.' });
    }
  };

  // Smazání kategorie
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto kategorii?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nepodařilo se smazat kategorii');
      }

      await fetchCategories();
      setFormMessage({ type: 'success', text: 'Kategorie byla úspěšně smazána!' });
      
      setTimeout(() => {
        setFormMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Chyba při mazání kategorie:', err);
      setFormMessage({ type: 'error', text: err.message || 'Nastala chyba při mazání kategorie.' });
    }
  };

  // Otevření formuláře pro úpravu
  const handleEditCategory = (category: ICategory) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  // Zavření formuláře
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormMessage(null);
  };

  // Odeslání formuláře
  const handleSubmitForm = (data: Partial<ICategory>) => {
    if (editingCategory) {
      handleUpdateCategory(data);
    } else {
      handleCreateCategory(data);
    }
  };

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
              <div className="w-auto px-2 h-8 bg-[#f8a287] rounded-md flex items-center justify-center text-white text-xs">
                <div className="flex items-center gap-1">
                  <span>Crafted with</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                  </svg>
                  <span>by Woundy</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mt-3">Správa kategorií</h1>
          </div>
          
          {formMessage && (
            <div className={`mb-5 p-4 rounded-xl ${formMessage.type === 'success' ? 'bg-green-800/50 text-green-200' : 'bg-red-800/50 text-red-200'}`}>
              {formMessage.text}
            </div>
          )}

          {!showForm ? (
            <div className="mb-5">
              <button
                onClick={() => setShowForm(true)}
                className="apply-button mb-5"
              >
                <span>Vytvořit novou kategorii</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f8a287]"></div>
                </div>
              ) : error ? (
                <div className="bg-red-800/50 text-red-200 px-4 py-3 rounded-xl">
                  <p>{error}</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-xl">
                  <h2 className="text-xl font-semibold mb-4">Žádné kategorie</h2>
                  <p className="text-gray-400 mb-6">
                    Zatím nebyly vytvořeny žádné kategorie. Vytvořte první kategorii pomocí tlačítka výše.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category._id?.toString()} className="category-card mb-0">
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
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2 text-gray-600 hover:text-[#f8a287] transition-colors"
                          aria-label="Upravit kategorii"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category._id?.toString() || '')}
                          className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                          aria-label="Smazat kategorii"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-800/30 rounded-xl p-5 mb-5">
              <h2 className="text-xl font-semibold mb-3">
                {editingCategory ? 'Upravit kategorii' : 'Vytvořit novou kategorii'}
              </h2>
              <CategoryForm
                initialData={editingCategory || undefined}
                onSubmit={handleSubmitForm}
                onCancel={handleCancelForm}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
} 