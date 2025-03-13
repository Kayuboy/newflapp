'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ICategory, ISubContent } from '@/models/Category';
import { Types } from 'mongoose';
import { renderIcon } from '@/utils/renderIcon';

// Rozšíření ISubContent pro správné typování _id
interface SubContentWithId extends ISubContent {
  _id: string;
}

// Ikony pro sub-content
const iconOptions = [
  { value: 'academic-cap', label: 'Akademická čepice' },
  { value: 'beaker', label: 'Zkumavka' },
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
];

export default function CategoryDetailPage({ params }: { params: { id: string } }) {
  const [category, setCategory] = useState<ICategory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingSubContent, setEditingSubContent] = useState<SubContentWithId | null>(null);
  const [addingSubContent, setAddingSubContent] = useState<boolean>(false);
  const [deletingSubContent, setDeletingSubContent] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  
  // Stav pro nový/editovaný sub-content
  const [subContentForm, setSubContentForm] = useState<{
    title: string;
    icon: string;
    description: string;
    content: string;
    color: string;
  }>({
    title: '',
    icon: 'academic-cap',
    description: '',
    content: '',
    color: '#f8a287',
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
  
  const handleAddSubContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category) return;
    
    try {
      setAddingSubContent(true);
      setAddError(null);
      
      console.log('Odesílám data:', subContentForm);
      console.log('Na endpoint:', `/api/categories/${params.id}/subcontent`);
      
      const response = await fetch(`/api/categories/${params.id}/subcontent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subContentForm),
      });
      
      const responseData = await response.json();
      console.log('Odpověď serveru:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Nepodařilo se přidat sub-content');
      }
      
      console.log('Sub-content úspěšně přidán');
      setCategory(responseData);
      setShowAddForm(false);
      resetSubContentForm();
    } catch (err: any) {
      console.error('Chyba při přidávání sub-contentu:', err);
      setAddError(err.message || 'Nastala chyba při přidávání sub-contentu. Zkuste to prosím později.');
    } finally {
      setAddingSubContent(false);
    }
  };
  
  const handleUpdateSubContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !editingSubContent?._id) return;
    
    try {
      setAddingSubContent(true);
      setAddError(null);
      
      const response = await fetch(`/api/categories/${params.id}/subcontent/${editingSubContent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subContentForm),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Nepodařilo se aktualizovat sub-content');
      }
      
      setCategory(responseData);
      setEditingSubContent(null);
      resetSubContentForm();
    } catch (err: any) {
      console.error('Chyba při aktualizaci sub-contentu:', err);
      setAddError(err.message || 'Nastala chyba při aktualizaci sub-contentu. Zkuste to prosím později.');
    } finally {
      setAddingSubContent(false);
    }
  };
  
  const handleDeleteSubContent = async (subContentId: string) => {
    if (!window.confirm('Opravdu chcete smazat tento obsah?')) return;
    
    try {
      setDeletingSubContent(subContentId);
      
      const response = await fetch(`/api/categories/${params.id}/subcontent/${subContentId}`, {
        method: 'DELETE',
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Nepodařilo se smazat sub-content');
      }
      
      setCategory(responseData);
    } catch (err: any) {
      console.error('Chyba při mazání sub-contentu:', err);
      alert(err.message || 'Nastala chyba při mazání sub-contentu. Zkuste to prosím později.');
    } finally {
      setDeletingSubContent(null);
    }
  };
  
  const startEditingSubContent = (subContent: SubContentWithId) => {
    setEditingSubContent(subContent);
    setSubContentForm({
      title: subContent.title,
      icon: subContent.icon,
      description: subContent.description || '',
      content: subContent.content || '',
      color: subContent.color || '#f8a287',
    });
  };
  
  const resetSubContentForm = () => {
    setSubContentForm({
      title: '',
      icon: 'academic-cap',
      description: '',
      content: '',
      color: '#f8a287',
    });
  };
  
  const cancelEditing = () => {
    setEditingSubContent(null);
    resetSubContentForm();
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
                <p className="text-gray-400 text-sm">Kategorie</p>
              </div>
              
              <div className="mb-5">
                <h2 className="text-lg font-semibold mb-2">Popis kategorie</h2>
                <p className="text-gray-300">
                  {category?.description}
                </p>
              </div>
              
              <div className="mb-5">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">Obsah kategorie</h2>
                  <button 
                    onClick={() => {
                      setShowAddForm(!showAddForm);
                      setEditingSubContent(null);
                      resetSubContentForm();
                    }} 
                    className="px-3 py-1 bg-[#f8a287] text-white rounded-lg text-sm hover:bg-[#e27d60] transition-colors"
                  >
                    {showAddForm ? 'Zrušit' : 'Přidat obsah'}
                  </button>
                </div>
                
                {/* Chybová hláška při přidávání */}
                {addError && (
                  <div className="bg-red-800/50 text-red-200 px-4 py-3 rounded-xl mb-4">
                    <p>{addError}</p>
                  </div>
                )}
                
                {/* Formulář pro přidání/úpravu sub-contentu */}
                {(showAddForm || editingSubContent) && (
                  <div className="subcontent-form mb-5">
                    <h3 className="text-md font-semibold mb-3">
                      {editingSubContent ? 'Upravit obsah' : 'Přidat nový obsah'}
                    </h3>
                    <form onSubmit={editingSubContent ? handleUpdateSubContent : handleAddSubContent}>
                      <div className="mb-3">
                        <label htmlFor="title" className="block text-sm font-medium mb-1">Název</label>
                        <input
                          type="text"
                          id="title"
                          className="subcontent-input"
                          value={subContentForm.title}
                          onChange={(e) => setSubContentForm({...subContentForm, title: e.target.value})}
                          required
                          maxLength={50}
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="icon" className="block text-sm font-medium mb-1">Ikona</label>
                        <select
                          id="icon"
                          className="subcontent-select"
                          value={subContentForm.icon}
                          onChange={(e) => setSubContentForm({...subContentForm, icon: e.target.value})}
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
                          value={subContentForm.description}
                          onChange={(e) => setSubContentForm({...subContentForm, description: e.target.value})}
                          rows={2}
                          maxLength={200}
                        ></textarea>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="content" className="block text-sm font-medium mb-1">Obsah</label>
                        <textarea
                          id="content"
                          className="subcontent-input"
                          value={subContentForm.content}
                          onChange={(e) => setSubContentForm({...subContentForm, content: e.target.value})}
                          rows={4}
                        ></textarea>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="color" className="block text-sm font-medium mb-1">Barva</label>
                        <input
                          type="color"
                          id="color"
                          className="w-full h-10 rounded-lg cursor-pointer"
                          value={subContentForm.color}
                          onChange={(e) => setSubContentForm({...subContentForm, color: e.target.value})}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          type="submit" 
                          className="subcontent-button flex-1 flex items-center justify-center"
                          disabled={addingSubContent}
                        >
                          {addingSubContent ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                              <span>{editingSubContent ? 'Upravuji...' : 'Přidávám...'}</span>
                            </>
                          ) : (
                            <span>{editingSubContent ? 'Uložit změny' : 'Přidat obsah'}</span>
                          )}
                        </button>
                        
                        {editingSubContent && (
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
                
                {/* Zobrazení sub-contentu přímo v containeru */}
                <div className="space-y-4">
                  {category?.subContents && category.subContents.length > 0 ? (
                    category.subContents.map((subContent, index) => {
                      // Kontrola, že subContent má _id a je to string
                      const subContentWithId = subContent as SubContentWithId;
                      return (
                        <div 
                          key={index} 
                          className="bg-[#3a2f39] rounded-xl p-4 border border-white/10"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center mr-3" 
                                style={{ backgroundColor: subContent.color || '#f8a287' }}
                              >
                                {renderIcon(subContent.icon, "subcontent-icon")}
                              </div>
                              <h3 className="text-lg font-semibold">{subContent.title}</h3>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => startEditingSubContent(subContentWithId)}
                                className="p-2 bg-blue-500/30 rounded-full text-white hover:bg-blue-600/30 transition-colors"
                                title="Upravit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                              </button>
                              
                              <button 
                                onClick={() => handleDeleteSubContent(String(subContentWithId._id))}
                                className="p-2 bg-red-500/30 rounded-full text-white hover:bg-red-600/30 transition-colors"
                                title="Smazat"
                                disabled={deletingSubContent === String(subContentWithId._id)}
                              >
                                {deletingSubContent === String(subContentWithId._id) ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                          
                          {subContent.description && (
                            <p className="text-gray-300 mb-3">{subContent.description}</p>
                          )}
                          
                          {subContent.content && (
                            <div className="bg-white/5 p-4 rounded-lg">
                              <p className="text-gray-200 whitespace-pre-line">{subContent.content}</p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center w-full py-4 text-gray-400">
                      <p>Zatím nebyl přidán žádný obsah. Přidejte první!</p>
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