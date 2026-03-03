'use client';

import { useLanguage } from '@/context/LanguageContext';

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="lang-toggle">
            <button
                className={`lang-btn ${language === 'ru' ? 'active' : ''}`}
                onClick={() => setLanguage('ru')}
                aria-label="Русский язык"
            >
                RU
            </button>
            <button
                className={`lang-btn ${language === 'kk' ? 'active' : ''}`}
                onClick={() => setLanguage('kk')}
                aria-label="Қазақ тілі"
            >
                KZ
            </button>
        </div>
    );
}
