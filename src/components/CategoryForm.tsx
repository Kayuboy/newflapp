'use client';

import React, { useState } from 'react';
import { ICategory } from '@/models/Category';

interface CategoryFormProps {
  initialData?: Partial<ICategory>;
  onSubmit: (data: Partial<ICategory>) => void;
  onCancel: () => void;
}

export default function CategoryForm({ initialData, onSubmit, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState<Partial<ICategory>>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    color: initialData?.color || '#f8a287',
    icon: initialData?.icon || 'academic-cap',
    isRecommended: initialData ? initialData.isRecommended : false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: val }));
    
    // Odstranění chyby při změně hodnoty
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Název kategorie je povinný';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Popis kategorie je povinný';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Dostupné ikony
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
  ];

  // Dostupné barvy
  const colorOptions = [
    { value: '#f8a287', label: 'Korálová' },
    { value: '#e27d60', label: 'Terakota' },
    { value: '#c38d9e', label: 'Mauve' },
    { value: '#41b3a3', label: 'Tyrkysová' },
    { value: '#5c6bc0', label: 'Indigo' },
    { value: '#8d6e63', label: 'Hnědá' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Název kategorie
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 rounded-xl bg-gray-700/50 border ${
            errors.name ? 'border-red-500' : 'border-gray-600'
          } focus:outline-none focus:ring-2 focus:ring-[#f8a287] focus:border-transparent`}
          placeholder="Např. Programování"
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Popis kategorie
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className={`w-full px-4 py-2 rounded-xl bg-gray-700/50 border ${
            errors.description ? 'border-red-500' : 'border-gray-600'
          } focus:outline-none focus:ring-2 focus:ring-[#f8a287] focus:border-transparent`}
          placeholder="Stručný popis kategorie..."
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium mb-1">
          Barva kategorie
        </label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {colorOptions.map((color) => (
            <div
              key={color.value}
              className={`h-10 rounded-lg cursor-pointer flex items-center justify-center ${
                formData.color === color.value ? 'ring-2 ring-white' : ''
              }`}
              style={{ backgroundColor: color.value }}
              onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
            >
              {formData.color === color.value && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="icon" className="block text-sm font-medium mb-1">
          Ikona kategorie
        </label>
        <select
          id="icon"
          name="icon"
          value={formData.icon}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#f8a287] focus:border-transparent"
        >
          {iconOptions.map((icon) => (
            <option key={icon.value} value={icon.value}>
              {icon.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isRecommended"
            name="isRecommended"
            checked={formData.isRecommended === true}
            onChange={handleChange}
            className="h-4 w-4 text-[#f8a287] focus:ring-[#f8a287] rounded"
          />
          <label htmlFor="isRecommended" className="ml-2 block text-sm font-medium">
            Přidat do doporučených kategorií
          </label>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Doporučené kategorie se zobrazují na hlavní stránce a jsou zvýrazněny v seznamu kategorií.
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-colors"
        >
          Zrušit
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#f8a287] to-[#e27d60] text-white hover:opacity-90 transition-opacity"
        >
          {initialData ? 'Aktualizovat' : 'Vytvořit'}
        </button>
      </div>
    </form>
  );
} 