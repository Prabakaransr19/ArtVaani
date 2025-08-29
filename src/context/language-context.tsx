
'use client';

import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import translations from '@/locales/en.json';
import hiTranslations from '@/locales/hi-IN.json';
import bnTranslations from '@/locales/bn-IN.json';
import teTranslations from '@/locales/te-IN.json';
import mrTranslations from '@/locales/mr-IN.json';
import taTranslations from '@/locales/ta-IN.json';
import kaTranslations from '@/locales/ka-IN.json';

const translationData: Record<string, any> = {
    'en': translations,
    'hi-IN': hiTranslations,
    'bn-IN': bnTranslations,
    'te-IN': teTranslations,
    'mr-IN': mrTranslations,
    'ta-IN': taTranslations,
    'ka-IN': kaTranslations,
};

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  translations: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('en');

  const currentTranslations = useMemo(() => {
    return translationData[language] || translations;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations: currentTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
