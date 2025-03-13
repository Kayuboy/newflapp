'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ICategory, ISubCategory, ISubContent } from '@/models/Category';
import { renderIcon } from '@/utils/renderIcon';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AdminGuard from '@/components/AdminGuard';

// Rozšíření ISubContent pro správné typování _id
interface SubContentWithId extends ISubContent {
  _id: string;
  // Explicitně uvedu, že používáme pole pro obrázky
  imageUrls?: string[];
  alternativeTexts?: string[];
  imageContents?: string[]; // Přidání nového pole pro obsah obrázků
}

export default function SubCategoryDetailPage({ params }: { params: { id: string; subCategoryId: string } }) {
  const router = useRouter();
  const [category, setCategory] = useState<ICategory | null>(null);
  const [subCategory, setSubCategory] = useState<ISubCategory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingSubContent, setEditingSubContent] = useState<SubContentWithId | null>(null);
  const [addingSubContent, setAddingSubContent] = useState<boolean>(false);
  const [deletingSubContent, setDeletingSubContent] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  
  // Stav pro lightbox
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<string>('');
  const [lightboxAlt, setLightboxAlt] = useState<string>('');
  
  // Stav pro nový/editovaný sub-content
  const [subContentForm, setSubContentForm] = useState<{
    title: string;
    icon: string;
    description: string;
    content: string;
    color: string;
    imageUrls: string[];
    alternativeTexts: string[];
    imageContents: string[]; // Přidání pole pro obsah obrázků
  }>({
    title: '',
    icon: 'academic-cap',
    description: '',
    content: '',
    color: '#f8a287',
    imageUrls: [],
    alternativeTexts: [],
    imageContents: [], // Inicializace prázdného pole
  });

  // Funkce pro otevření lightboxu
  const openLightbox = (imageUrl: string, alt: string = '') => {
    setLightboxImage(imageUrl);
    setLightboxAlt(alt);
    setLightboxOpen(true);
    // Zamezit scrollování stránky když je lightbox otevřený
    document.body.style.overflow = 'hidden';
  };
  
  // Funkce pro zavření lightboxu
  const closeLightbox = () => {
    setLightboxOpen(false);
    // Vrátit scrollování stránky
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    const fetchSubCategory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/categories/${params.id}/subcategory/${params.subCategoryId}`);
        
        if (!response.ok) {
          throw new Error('Nepodařilo se načíst subkategorii');
        }
        
        const data = await response.json();
        console.log('Načtená subkategorie:', data);
        setSubCategory(data);
        
        // Načtení kategorie pro breadcrumbs
        const categoryResponse = await fetch(`/api/categories/${params.id}`);
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          setCategory(categoryData);
        }
      } catch (err) {
        console.error('Chyba při načítání subkategorie:', err);
        setError('Nastala chyba při načítání subkategorie. Zkuste to prosím později.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategory();
  }, [params.id, params.subCategoryId]);

  const handleAddSubContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category) return;
    
    try {
      setAddingSubContent(true);
      setAddError(null);
      
      console.log('Odesílám data:', subContentForm);
      console.log('Na endpoint:', `/api/categories/${params.id}/subcategory/${params.subCategoryId}/subcontent`);
      
      const response = await fetch(`/api/categories/${params.id}/subcategory/${params.subCategoryId}/subcontent`, {
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
      
      // Aktualizace kategorie a vyhledání správné subkategorie
      setCategory(responseData);
      const updatedSubCategory = responseData.subCategories?.find(
        (sub: any) => sub._id.toString() === params.subCategoryId
      );
      
      if (updatedSubCategory) {
        setSubCategory(updatedSubCategory);
      }
      
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
      
      const response = await fetch(`/api/categories/${params.id}/subcategory/${params.subCategoryId}/subcontent/${editingSubContent._id}`, {
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
      
      // Aktualizace kategorie a vyhledání správné subkategorie
      setCategory(responseData);
      const updatedSubCategory = responseData.subCategories?.find(
        (sub: any) => sub._id.toString() === params.subCategoryId
      );
      
      if (updatedSubCategory) {
        setSubCategory(updatedSubCategory);
      }
      
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
      
      const response = await fetch(`/api/categories/${params.id}/subcategory/${params.subCategoryId}/subcontent/${subContentId}`, {
        method: 'DELETE',
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Nepodařilo se smazat sub-content');
      }
      
      // Aktualizace kategorie a vyhledání správné subkategorie
      setCategory(responseData);
      const updatedSubCategory = responseData.subCategories?.find(
        (sub: any) => sub._id.toString() === params.subCategoryId
      );
      
      if (updatedSubCategory) {
        setSubCategory(updatedSubCategory);
      }
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
      imageUrls: subContent.imageUrls || [],
      alternativeTexts: subContent.alternativeTexts || [],
      imageContents: subContent.imageContents || [], // Přidání obsahu obrázků z databáze
    });
  };
  
  const resetSubContentForm = () => {
    setSubContentForm({
      title: '',
      icon: 'academic-cap',
      description: '',
      content: '',
      color: '#f8a287',
      imageUrls: [],
      alternativeTexts: [],
      imageContents: [], // Reset pole s obsahem
    });
  };
  
  const cancelEditing = () => {
    setEditingSubContent(null);
    resetSubContentForm();
  };

  // Funkce pro nahrání obrázku
  const uploadImage = async (file: File) => {
    try {
      setAddError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Chyba při nahrávání obrázku');
      }
      
      return data.imageUrl;
    } catch (err: any) {
      setAddError(err.message || 'Nastala chyba při nahrávání obrázku');
      return null;
    }
  };
  
  // Přidání nového obrázku
  const addImage = (imageUrl: string, altText: string = '', imageContent: string = '') => {
    setSubContentForm({
      ...subContentForm,
      imageUrls: [...subContentForm.imageUrls, imageUrl],
      alternativeTexts: [...subContentForm.alternativeTexts, altText],
      imageContents: [...subContentForm.imageContents, imageContent],
    });
  };

  // Odstranění obrázku
  const removeImage = (index: number) => {
    const newImageUrls = [...subContentForm.imageUrls];
    const newAltTexts = [...subContentForm.alternativeTexts];
    const newImageContents = [...subContentForm.imageContents];
    
    newImageUrls.splice(index, 1);
    newAltTexts.splice(index, 1);
    newImageContents.splice(index, 1);
    
    setSubContentForm({
      ...subContentForm,
      imageUrls: newImageUrls,
      alternativeTexts: newAltTexts,
      imageContents: newImageContents,
    });
  };

  // Aktualizace alternativního textu
  const updateAltText = (index: number, text: string) => {
    const newAltTexts = [...subContentForm.alternativeTexts];
    newAltTexts[index] = text;
    
    setSubContentForm({
      ...subContentForm,
      alternativeTexts: newAltTexts,
    });
  };

  // Aktualizace obsahu obrázku
  const updateImageContent = (index: number, content: string) => {
    const newImageContents = [...subContentForm.imageContents];
    newImageContents[index] = content;
    
    setSubContentForm({
      ...subContentForm,
      imageContents: newImageContents,
    });
  };
  
  // Zpracování změny souboru
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Vytvoření náhledu pro okamžité zobrazení
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        
        // Nahrání obrázku na server
        const imageUrl = await uploadImage(file);
        if (imageUrl) {
          addImage(imageUrl, '', '');
        } else {
          // Fallback na lokální náhled, pokud nahrání selže
          addImage(result, '', '');
        }
      };
      reader.readAsDataURL(file);
    }
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
          ) : !subCategory ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">Subkategorie nenalezena</h2>
              <p className="text-gray-400 mb-6">Požadovaná subkategorie neexistuje nebo byla smazána.</p>
              <Link href={`/categories/${params.id}`} className="apply-button inline-flex">
                <span>Zpět na kategorii</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </Link>
            </div>
          ) : (
            <>
              <div className="sticky-header">
                <div className="flex justify-between items-center">
                  <Link href={`/categories/${params.id}`} className="back-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              {/* Breadcrumbs navigace */}
              <div className="mb-4 flex items-center text-sm text-gray-400">
                <Link href="/categories" className="hover:text-white transition-colors">
                  Kategorie
                </Link>
                <span className="mx-2">/</span>
                <Link href={`/categories/${params.id}`} className="hover:text-white transition-colors">
                  {category?.name || 'Kategorie'}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-white">{subCategory.name}</span>
              </div>
              
              <div className="relative mb-8 mt-3">
                <div className="h-28 w-full bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl"></div>
                
                <div className="company-logo absolute -bottom-8 left-4" style={{ backgroundColor: subCategory.color || '#87b8f8' }}>
                  {renderIcon(subCategory.icon || 'puzzle', "w-8 h-8 text-white")}
                </div>
              </div>
              
              <div className="mt-10 mb-5">
                <h1 className="text-2xl font-bold mb-1">{subCategory.name}</h1>
                <p className="text-gray-400 text-sm">Subkategorie</p>
              </div>
              
              <div className="mb-5">
                <h2 className="text-lg font-semibold mb-2">Popis subkategorie</h2>
                <p className="text-gray-300">
                  {subCategory.description}
                </p>
              </div>
              
              <div className="mb-5">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold">Obsah subkategorie</h2>
                  <AdminGuard>
                    <button 
                      onClick={() => {
                        setShowAddForm(!showAddForm);
                        setEditingSubContent(null);
                        resetSubContentForm();
                      }} 
                      className="px-3 py-1 bg-[#87b8f8] text-white rounded-lg text-sm hover:bg-[#6493d4] transition-colors"
                    >
                      {showAddForm ? 'Zrušit' : 'Přidat obsah'}
                    </button>
                  </AdminGuard>
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
                          <option value="academic-cap">Akademická čepice</option>
                          <option value="adjustments">Nastavení</option>
                          <option value="annotation">Anotace</option>
                          <option value="archive">Archiv</option>
                          <option value="arrow-down">Šipka dolů</option>
                          <option value="arrow-up">Šipka nahoru</option>
                          <option value="bell">Zvonek</option>
                          <option value="book-open">Otevřená kniha</option>
                          <option value="briefcase">Kufřík</option>
                          <option value="calculator">Kalkulačka</option>
                          <option value="calendar">Kalendář</option>
                          <option value="camera">Fotoaparát</option>
                          <option value="cash">Peníze</option>
                          <option value="chart-bar">Graf</option>
                          <option value="chart-pie">Koláčový graf</option>
                          <option value="chat">Chat</option>
                          <option value="check-circle">Zaškrtávací kolečko</option>
                          <option value="cloud">Mrak</option>
                          <option value="code">Kód</option>
                          <option value="cog">Ozubené kolo</option>
                          <option value="collection">Kolekce</option>
                          <option value="color-swatch">Barva</option>
                          <option value="credit-card">Kreditní karta</option>
                          <option value="cube">Kostka</option>
                          <option value="database">Databáze</option>
                          <option value="desktop-computer">Počítač</option>
                          <option value="document">Dokument</option>
                          <option value="download">Stáhnout</option>
                          <option value="exclamation">Vykřičník</option>
                          <option value="external-link">Externí odkaz</option>
                          <option value="eye">Oko</option>
                          <option value="filter">Filtr</option>
                          <option value="folder">Složka</option>
                          <option value="globe">Globus</option>
                          <option value="home">Domů</option>
                          <option value="inbox">Inbox</option>
                          <option value="information-circle">Informace</option>
                          <option value="key">Klíč</option>
                          <option value="library">Knihovna</option>
                          <option value="light-bulb">Žárovka</option>
                          <option value="lightning-bolt">Blesk</option>
                          <option value="link">Odkaz</option>
                          <option value="location-marker">Místo</option>
                          <option value="lock-closed">Zamčený zámek</option>
                          <option value="lock-open">Otevřený zámek</option>
                          <option value="mail">E-mail</option>
                          <option value="map">Mapa</option>
                          <option value="menu">Menu</option>
                          <option value="microphone">Mikrofon</option>
                          <option value="minus">Minus</option>
                          <option value="moon">Měsíc</option>
                          <option value="music-note">Hudební nota</option>
                          <option value="newspaper">Noviny</option>
                          <option value="office-building">Budova</option>
                          <option value="paper-airplane">Papírové letadlo</option>
                          <option value="paper-clip">Sponka</option>
                          <option value="pencil">Tužka</option>
                          <option value="phone">Telefon</option>
                          <option value="photograph">Fotografie</option>
                          <option value="plus">Plus</option>
                          <option value="puzzle">Puzzle</option>
                          <option value="refresh">Obnovit</option>
                          <option value="search">Hledat</option>
                          <option value="share">Sdílet</option>
                          <option value="shield-check">Štít s kontrolou</option>
                          <option value="shopping-bag">Nákupní taška</option>
                          <option value="shopping-cart">Nákupní košík</option>
                          <option value="star">Hvězda</option>
                          <option value="sun">Slunce</option>
                          <option value="support">Podpora</option>
                          <option value="tag">Tag</option>
                          <option value="thumb-up">Palec nahoru</option>
                          <option value="ticket">Lístek</option>
                          <option value="translate">Přeložit</option>
                          <option value="trash">Koš</option>
                          <option value="trending-up">Rostoucí trend</option>
                          <option value="truck">Nákladní auto</option>
                          <option value="upload">Nahrát</option>
                          <option value="user">Uživatel</option>
                          <option value="users">Uživatelé</option>
                          <option value="video-camera">Video kamera</option>
                          <option value="view-grid">Mřížka</option>
                          <option value="volume-up">Zvuk nahoru</option>
                          <option value="wifi">Wi-Fi</option>
                          <option value="x-circle">X v kruhu</option>
                          <option value="zoom-in">Přiblížit</option>
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
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Obrázky</label>
                        <div className="mb-2">
                          <label htmlFor="image" className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 border-dashed rounded-md cursor-pointer bg-white hover:bg-gray-50">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <span>Přidat obrázek</span>
                            <input
                              type="file"
                              id="image"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Podporované formáty: JPG, PNG, GIF, WEBP, SVG. Max. velikost: 5MB
                          </p>
                        </div>
                        
                        {/* Seznam nahraných obrázků */}
                        {subContentForm.imageUrls.length > 0 && (
                          <div className="space-y-4 mt-3">
                            <h4 className="text-sm font-medium">Nahrané obrázky:</h4>
                            {subContentForm.imageUrls.map((url, index) => (
                              <div key={index} className="flex flex-col md:flex-row gap-3 p-3 bg-white/10 rounded-lg">
                                <div className="w-full md:w-40 h-40 relative rounded-lg overflow-hidden border border-gray-700">
                                  <Image
                                    src={url}
                                    alt={subContentForm.alternativeTexts[index] || ''}
                                    fill
                                    sizes="(max-width: 640px) 100vw, 160px"
                                    className="object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                                <div className="flex-1 flex flex-col space-y-3">
                                  <div>
                                    <label className="block text-sm font-medium mb-1">
                                      Alternativní text pro obrázek {index + 1}
                                    </label>
                                    <input
                                      type="text"
                                      className="subcontent-input"
                                      value={subContentForm.alternativeTexts[index] || ''}
                                      onChange={(e) => updateAltText(index, e.target.value)}
                                      placeholder="Popis obrázku pro přístupnost"
                                      maxLength={100}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      Max. 100 znaků. Popis pomáhá uživatelům se zrakovým omezením.
                                    </p>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">
                                      Obsah k obrázku {index + 1}
                                    </label>
                                    <textarea
                                      className="subcontent-input"
                                      value={subContentForm.imageContents[index] || ''}
                                      onChange={(e) => updateImageContent(index, e.target.value)}
                                      placeholder="Zadejte text, který se zobrazí u tohoto obrázku"
                                      rows={3}
                                    ></textarea>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          type="submit" 
                          className="subcontent-button flex-1 flex items-center justify-center"
                          style={{ backgroundColor: subCategory?.color || '#87b8f8' }}
                          disabled={addingSubContent}
                        >
                          {addingSubContent ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
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
                  {subCategory?.subContents && subCategory.subContents.length > 0 ? (
                    subCategory.subContents.map((subContent, index) => {
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
                                {renderIcon(subContent.icon, "w-5 h-5 text-white")}
                              </div>
                              <h3 className="text-lg font-semibold">{subContent.title}</h3>
                            </div>
                            
                            <div className="actions flex space-x-2">
                              <AdminGuard>
                                <button
                                  onClick={() => startEditingSubContent(subContentWithId)}
                                  className="p-2 bg-gray-700/30 rounded-full text-white hover:bg-gray-600/30 transition-colors"
                                  title="Upravit"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
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
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                  )}
                                </button>
                              </AdminGuard>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            {/* Zobrazení obrázků, pokud existují */}
                            {subContent.imageUrls && subContent.imageUrls.length > 0 && (
                              <div className="my-3 space-y-6">
                                {subContent.imageUrls.map((imageUrl, index) => (
                                  <div key={index} className="flex flex-col md:flex-row gap-4 bg-white/5 p-3 rounded-lg">
                                    <div 
                                      className="w-full md:w-40 h-40 flex-shrink-0 cursor-pointer" 
                                      onClick={() => {
                                        const altText = subContent.alternativeTexts?.[index] || (subContent.title ? subContent.title : '');
                                        if (imageUrl) {
                                          openLightbox(imageUrl, altText);
                                        }
                                      }}
                                    >
                                      <div className="relative h-40 w-full rounded-lg overflow-hidden border border-gray-700">
                                        <Image
                                          src={imageUrl}
                                          alt={subContent.alternativeTexts?.[index] || subContent.title || ''}
                                          fill
                                          sizes="(max-width: 640px) 100vw, 160px"
                                          className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-white">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                          </svg>
                                        </div>
                                      </div>
                                      {subContent.alternativeTexts?.[index] && (
                                        <p className="text-xs text-gray-400 mt-1">{subContent.alternativeTexts[index]}</p>
                                      )}
                                    </div>
                                    
                                    <div className="flex-1">
                                      {index === 0 && (
                                        <>
                                          {subContent.description && (
                                            <p className="text-gray-300 mb-3">{subContent.description}</p>
                                          )}
                                          
                                          {subContent.content && (
                                            <div className="bg-white/5 p-4 rounded-lg mb-3">
                                              <p className="text-gray-200 whitespace-pre-line">{subContent.content}</p>
                                            </div>
                                          )}
                                        </>
                                      )}
                                      
                                      {/* Zobrazit obsah konkrétního obrázku, pokud existuje */}
                                      {subContent.imageContents?.[index] && (
                                        <div className="bg-white/5 p-4 rounded-lg mt-2">
                                          <p className="text-gray-200 whitespace-pre-line">{subContent.imageContents[index]}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
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
          
          {/* Lightbox pro zobrazení zvětšeného obrázku */}
          {lightboxOpen && (
            <div 
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={closeLightbox}
            >
              <button 
                className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                onClick={closeLightbox}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="relative max-w-4xl max-h-[80vh] w-full" onClick={(e) => e.stopPropagation()}>
                <Image
                  src={lightboxImage}
                  alt={lightboxAlt}
                  width={1200}
                  height={800}
                  className="object-contain mx-auto max-h-[80vh]"
                  onClick={(e) => e.stopPropagation()}
                />
                {lightboxAlt && (
                  <p className="text-white text-center mt-2">{lightboxAlt}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 