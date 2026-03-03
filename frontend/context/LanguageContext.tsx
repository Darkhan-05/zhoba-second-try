'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ru, kk, type Language, type Translations } from '@/i18n';

const translations: Record<Language, Translations> = { ru, kk };

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('ru');

    useEffect(() => {
        const saved = localStorage.getItem('six-hats-language') as Language | null;
        if (saved && (saved === 'ru' || saved === 'kk')) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('six-hats-language', lang);
    }, []);

    const t = translations[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
