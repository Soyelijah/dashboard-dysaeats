'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Importar los tipos manualmente para asegurar consistencia
import enDictionary from '@/public/locales/en/common.json';

// Definir el tipo basado en la estructura del diccionario en inglés
export type DictionaryType = typeof enDictionary;

// Función para cargar los diccionarios de manera dinámica
const loadDictionary = async (locale: string): Promise<DictionaryType> => {
  try {
    // Importación dinámica basada en el locale
    const module = await import(`@/public/locales/${locale}/common.json`);
    return module.default as DictionaryType;
  } catch (error) {
    console.error(`Error loading dictionary for locale: ${locale}`, error);
    // Fallback a inglés si hay error
    const fallback = await import('@/public/locales/en/common.json');
    return fallback.default as DictionaryType;
  }
};

export const useDictionary = () => {
  const params = useParams();
  const [dictionary, setDictionary] = useState<DictionaryType | null>(null);
  
  useEffect(() => {
    const lang = (params?.lang as string) || 'en';
    
    // Cargar el diccionario según el idioma
    loadDictionary(lang)
      .then((dict) => {
        setDictionary(dict as DictionaryType);
      })
      .catch((error) => {
        console.error('Failed to load dictionary:', error);
        // En caso de error, intentar cargar el inglés como fallback
        loadDictionary('en').then(dict => setDictionary(dict as DictionaryType));
      });
  }, [params?.lang]);
  
  // Fallback a un objeto vacío como DictionaryType si el diccionario no se ha cargado
  return dictionary || {} as DictionaryType;
};