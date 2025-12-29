"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { en } from '@/locales/en';
import { bn } from '@/locales/bn';
import { es } from '@/locales/es';

const LanguageContext = createContext();

const dictionaries = { en, bn, es };

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    // Load language from localStorage on mount
    useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && dictionaries[savedLanguage]) {
            setLanguage(savedLanguage);
        }
    }, []);

    const changeLanguage = (lang) => {
        if (dictionaries[lang]) {
            setLanguage(lang);
            localStorage.setItem('language', lang);
        }
    };

    const t = (path) => {
        const keys = path.split('.');
        let current = dictionaries[language];

        for (const key of keys) {
            if (current[key] === undefined) {
                return path; // Fallback to key if not found
            }
            current = current[key];
        }
        return current;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
