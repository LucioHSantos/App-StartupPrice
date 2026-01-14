
import React from 'react';
import { useStore } from '../store';
import { Language } from '../types';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useStore();

  const langs: { code: Language; flag: string }[] = [
    { code: 'en', flag: '🇺🇸' },
    { code: 'pt', flag: '🇧🇷' },
    { code: 'es', flag: '🇪🇸' },
  ];

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-full shadow-inner">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLanguage(l.code)}
          className={`px-2 py-1 rounded-full text-lg transition-all ${
            language === l.code ? 'bg-white shadow-sm scale-110' : 'opacity-50 hover:opacity-100'
          }`}
        >
          {l.flag}
        </button>
      ))}
    </div>
  );
};
