import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // Helper to handle zh-CN vs zh if needed, or just match exactly
  const currentLang = languages.find(l => i18n.language.startsWith(l.code)) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 border ${
          isDark 
            ? 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:text-white hover:border-yellow-500/50 hover:bg-zinc-800 shadow-lg shadow-black/20' 
            : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-yellow-400 hover:bg-yellow-50/30 shadow-sm'
        } hover:shadow-yellow-500/10 group`}
        title="Change Language"
      >
        <span className="text-xl leading-none filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{currentLang.flag}</span>
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:block opacity-90">{currentLang.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl border overflow-hidden z-50 backdrop-blur-xl ${
          isDark 
            ? 'bg-zinc-900/95 border-zinc-800' 
            : 'bg-white/95 border-zinc-200'
        } animate-in fade-in zoom-in-95 duration-200`}>
          <div className="py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full text-left px-5 py-3.5 text-sm font-medium flex items-center space-x-4 transition-all ${
                  i18n.language.startsWith(lang.code)
                    ? (isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-700')
                    : (isDark ? 'text-zinc-400 hover:bg-white/5 hover:text-white' : 'text-zinc-600 hover:bg-gray-50 hover:text-zinc-900')
                }`}
              >
                <span className="text-2xl filter drop-shadow-sm">{lang.flag}</span>
                <span className="flex-1">{lang.name}</span>
                {i18n.language.startsWith(lang.code) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
