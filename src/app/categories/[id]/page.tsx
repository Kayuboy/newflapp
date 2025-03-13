'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ICategory, ISubCategory } from '@/models/Category';
import { Types } from 'mongoose';
import { renderIcon } from '@/utils/renderIcon';
import AdminGuard from '@/components/AdminGuard';

// Rozšíření ISubCategory pro správné typování _id
interface SubCategoryWithId extends ISubCategory {
  _id: string;
}

// Ikony pro sub-kategorie
const iconOptions = [
  { value: 'academic-cap', label: 'Akademická čepice' },
  { value: 'beaker', label: 'Zkumavka' },
  { value: 'book-open', label: 'Otevřená kniha' },
  { value: 'calculator', label: 'Kalkulačka' },
  { value: 'chart-bar', label: 'Graf' },
  { value: 'code', label: 'Kód' },
  { value: 'cog', label: 'Ozubené kolo' },
  { value: 'computer-desktop', label: 'Počítač' },
  { value: 'document-text', label: 'Dokument' },
  { value: 'globe', label: 'Globus' },
  { value: 'light-bulb', label: 'Žárovka' },
  { value: 'pencil', label: 'Tužka' },
  { value: 'presentation-chart-line', label: 'Prezentace' },
  { value: 'wrench', label: 'Nářadí' },
  { value: 'puzzle', label: 'Puzzle' },
  { value: 'star', label: 'Hvězda' },
  { value: 'user-group', label: 'Skupina uživatelů' },
  { value: 'video-camera', label: 'Kamera' },
  { value: 'heart', label: 'Srdce' },
  { value: 'trophy', label: 'Trofej' },
  { value: 'lock-closed', label: 'Zámek' },
  { value: 'currency-dollar', label: 'Dolar' },
  { value: 'cloud', label: 'Mrak' },
  { value: 'shopping-cart', label: 'Nákupní košík' },
  { value: 'device-phone-mobile', label: 'Mobilní telefon' },
  { value: 'photo', label: 'Fotografie' },
  { value: 'musical-note', label: 'Hudební nota' },
  { value: 'chat-bubble-left-right', label: 'Konverzace' },
  { value: 'map', label: 'Mapa' },
  { value: 'rocket-launch', label: 'Raketa' },
];

export default function CategoryDetailPage({ params }: { params: { id: string } }) {
  const [category, setCategory] = useState<ICategory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategoryWithId | null>(null);
  const [addingSubCategory, setAddingSubCategory] = useState<boolean>(false);
  const [deletingSubCategory, setDeletingSubCategory] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  
  // Stav pro novou/editovanou subkategorii
  const [subCategoryForm, setSubCategoryForm] = useState<{
    name: string;
    icon: string;
    description: string;
    color: string;
  }>({
    name: '',
    icon: 'puzzle',
    description: '',
    color: '#87b8f8',
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/categories/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Nepodařilo se načíst kategorii');
        }
        
        const data = await response.json();
        console.log('Načtená kategorie:', data);
        setCategory(data);
      } catch (err) {
        console.error('Chyba při načítání kategorie:', err);
        setError('Nastala chyba při načítání kategorie. Zkuste to prosím později.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [params.id]);

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Zde by byla implementace ukládání záložky do databáze
  };
  
  const handleAddSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category) return;
    
    try {
      setAddingSubCategory(true);
      setAddError(null);
      
      console.log('Odesílám data:', subCategoryForm);
      console.log('Na endpoint:', `/api/categories/${params.id}/subcategory`);
      
      const response = await fetch(`/api/categories/${params.id}/subcategory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subCategoryForm),
      });
      
      const responseData = await response.json();
      console.log('Odpověď serveru:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Nepodařilo se přidat subkategorii');
      }
      
      console.log('Subkategorie úspěšně přidána');
      setCategory(responseData);
      setShowAddForm(false);
      resetSubCategoryForm();
    } catch (err: any) {
      console.error('Chyba při přidávání subkategorie:', err);
      setAddError(err.message || 'Nastala chyba při přidávání subkategorie. Zkuste to prosím později.');
    } finally {
      setAddingSubCategory(false);
    }
  };
  
  const handleUpdateSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !editingSubCategory?._id) return;
    
    try {
      setAddingSubCategory(true);
      setAddError(null);
      
      const response = await fetch(`/api/categories/${params.id}/subcategory/${editingSubCategory._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subCategoryForm),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Nepodařilo se aktualizovat subkategorii');
      }
      
      setCategory(responseData);
      setEditingSubCategory(null);
      resetSubCategoryForm();
    } catch (err: any) {
      console.error('Chyba při aktualizaci subkategorie:', err);
      setAddError(err.message || 'Nastala chyba při aktualizaci subkategorie. Zkuste to prosím později.');
    } finally {
      setAddingSubCategory(false);
    }
  };
  
  const handleDeleteSubCategory = async (subCategoryId: string) => {
    if (!window.confirm('Opravdu chcete smazat tuto subkategorii? Budou smazány také všechny její obsahy.')) return;
    
    try {
      setDeletingSubCategory(subCategoryId);
      
      const response = await fetch(`/api/categories/${params.id}/subcategory/${subCategoryId}`, {
        method: 'DELETE',
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Nepodařilo se smazat subkategorii');
      }
      
      setCategory(responseData);
    } catch (err: any) {
      console.error('Chyba při mazání subkategorie:', err);
      alert(err.message || 'Nastala chyba při mazání subkategorie. Zkuste to prosím později.');
    } finally {
      setDeletingSubCategory(null);
    }
  };
  
  const startEditingSubCategory = (subCategory: SubCategoryWithId) => {
    setEditingSubCategory(subCategory);
    setSubCategoryForm({
      name: subCategory.name,
      icon: subCategory.icon || 'puzzle',
      description: subCategory.description,
      color: subCategory.color || '#87b8f8',
    });
  };
  
  const resetSubCategoryForm = () => {
    setSubCategoryForm({
      name: '',
      icon: 'puzzle',
      description: '',
      color: '#87b8f8',
    });
  };
  
  const cancelEditing = () => {
    setEditingSubCategory(null);
    resetSubCategoryForm();
  };

  return (
    <>
      <div className="app-background"></div>
      <div className="desktop-container">
        <div className="mobile-container">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f8a287]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-800/50 text-red-200 px-4 py-3 rounded-xl mb-4">
              <p>{error}</p>
            </div>
          ) : !category ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">Kategorie nenalezena</h2>
              <p className="text-gray-400 mb-6">Požadovaná kategorie neexistuje nebo byla smazána.</p>
              <Link href="/categories" className="apply-button inline-flex">
                <span>Zpět na seznam kategorií</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </Link>
            </div>
          ) : (
            <>
              <div className="sticky-header">
                <div className="flex justify-between items-center">
                  <Link href="/" className="back-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                  </Link>
                  <Link 
                    href={`/categories/manage?edit=${params.id}`}
                    className="bookmark-button"
                    aria-label="Upravit kategorii"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div className="relative mb-8 mt-3">
                <div className="h-28 w-full bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl"></div>
                
                <div className="company-logo absolute -bottom-8 left-4" style={{ backgroundColor: category.color || '#f8a287' }}>
                  {renderIcon(category.icon || 'academic-cap', "w-8 h-8 text-white")}
                </div>
              </div>
              
              <div className="mt-10 mb-5">
                <h1 className="text-2xl font-bold mb-1">{category?.name}</h1>
                <p className="text-gray-400 text-sm">Kategorie dovedností</p>
              </div>
              
              <div className="mb-5">
                <h2 className="text-lg font-semibold mb-2">Popis kategorie</h2>
                <p className="text-gray-300">
                  {category?.description}
                </p>
              </div>
              
              <div className="mb-5">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">Subkategorie</h2>
                  <AdminGuard>
                    <button 
                      onClick={() => {
                        setShowAddForm(!showAddForm);
                        setEditingSubCategory(null);
                        resetSubCategoryForm();
                      }} 
                      className="px-3 py-1 bg-[#f8a287] text-white rounded-lg text-sm hover:bg-[#e27d60] transition-colors"
                    >
                      {showAddForm ? 'Zrušit' : 'Přidat subkategorii'}
                    </button>
                  </AdminGuard>
                </div>
                
                {/* Chybová hláška při přidávání */}
                {addError && (
                  <div className="bg-red-800/50 text-red-200 px-4 py-3 rounded-xl mb-4">
                    <p>{addError}</p>
                  </div>
                )}
                
                {/* Formulář pro přidání/úpravu subkategorie */}
                {(showAddForm || editingSubCategory) && (
                  <div className="subcategory-form mb-5">
                    <h3 className="text-md font-semibold mb-3">
                      {editingSubCategory ? 'Upravit subkategorii' : 'Přidat novou subkategorii'}
                    </h3>
                    <form onSubmit={editingSubCategory ? handleUpdateSubCategory : handleAddSubCategory}>
                      <div className="mb-3">
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Název</label>
                        <input
                          type="text"
                          id="name"
                          className="subcontent-input"
                          value={subCategoryForm.name}
                          onChange={(e) => setSubCategoryForm({...subCategoryForm, name: e.target.value})}
                          required
                          maxLength={100}
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="icon" className="block text-sm font-medium mb-1">Ikona</label>
                        <select
                          id="icon"
                          className="subcontent-select"
                          value={subCategoryForm.icon}
                          onChange={(e) => setSubCategoryForm({...subCategoryForm, icon: e.target.value})}
                        >
                          {iconOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="description" className="block text-sm font-medium mb-1">Popis</label>
                        <textarea
                          id="description"
                          className="subcontent-input"
                          value={subCategoryForm.description}
                          onChange={(e) => setSubCategoryForm({...subCategoryForm, description: e.target.value})}
                          rows={3}
                          maxLength={300}
                          required
                        ></textarea>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="color" className="block text-sm font-medium mb-1">Barva</label>
                        <input
                          type="color"
                          id="color"
                          className="w-full h-10 rounded-lg cursor-pointer"
                          value={subCategoryForm.color}
                          onChange={(e) => setSubCategoryForm({...subCategoryForm, color: e.target.value})}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          type="submit" 
                          className="subcontent-button flex-1 flex items-center justify-center"
                          disabled={addingSubCategory}
                        >
                          {addingSubCategory ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                              <span>{editingSubCategory ? 'Upravuji...' : 'Přidávám...'}</span>
                            </>
                          ) : (
                            <span>{editingSubCategory ? 'Uložit změny' : 'Přidat subkategorii'}</span>
                          )}
                        </button>
                        
                        {editingSubCategory && (
                          <button 
                            type="button" 
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            onClick={cancelEditing}
                          >
                            Zrušit
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}
                
                {/* Zobrazení subkategorií */}
                <div className="space-y-3">
                  {category?.subCategories && category.subCategories.length > 0 ? (
                    category.subCategories.map((subCategory, index) => {
                      // Kontrola, že subCategory má _id a je to string
                      const subCategoryWithId = subCategory as SubCategoryWithId;
                      const subContentCount = subCategory.subContents?.length || 0;
                      
                      return (
                        <Link 
                          href={`/categories/${params.id}/subcategory/${subCategoryWithId._id}`}
                          key={index} 
                          className="category-card block"
                        >
                          <div className="flex items-center">
                            <div 
                              className="category-icon"
                              style={{ backgroundColor: subCategory.color || '#87b8f8' }}
                            >
                              {renderIcon(subCategory.icon || 'puzzle', "w-5 h-5 text-white")}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{subCategory.name}</h4>
                              <p className="text-sm text-gray-500 line-clamp-1">{subCategory.description}</p>
                            </div>
                            <div className="flex space-x-2">
                              <AdminGuard>
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    startEditingSubCategory(subCategoryWithId);
                                  }}
                                  className="p-2 bg-gray-700/30 rounded-full text-white hover:bg-gray-600/30 transition-colors"
                                  title="Upravit"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                  </svg>
                                </button>
                                
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteSubCategory(String(subCategoryWithId._id));
                                  }}
                                  className="p-2 bg-red-500/30 rounded-full text-white hover:bg-red-600/30 transition-colors"
                                  title="Smazat"
                                  disabled={deletingSubCategory === String(subCategoryWithId._id)}
                                >
                                  {deletingSubCategory === String(subCategoryWithId._id) ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                  )}
                                </button>
                              </AdminGuard>
                            </div>
                            <div className="text-[#87b8f8] ml-2">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 bg-gray-800/30 rounded-xl mb-4">
                      <h2 className="text-lg font-semibold mb-2">Žádné subkategorie</h2>
                      <p className="text-gray-400 mb-4 text-sm">
                        Zatím nebyly vytvořeny žádné subkategorie.
                      </p>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="text-[#f8a287] text-sm hover:underline"
                      >
                        Vytvořit subkategorii
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
} 