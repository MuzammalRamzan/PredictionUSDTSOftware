import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { Filter, ChevronDown, Check, Globe } from 'lucide-react';
import Select from 'react-select';
import { getData } from 'country-list';

export default function FilterBar({ filters, setFilters }) {
  const { isDark } = useTheme();
  const { t } = useTranslation();

  const categories = ['All', 'Sports', 'Politics'];
  const sports = ['Cricket', 'Football', 'Other'];
  const levels = ['Government', 'Local'];
  const allCountries = getData().map(c => ({ value: c.name, label: c.name }));

  const getCategoryLabel = (val) => val === 'All' ? t('filter.all') : t(`categories.${val}`);
  const getSportLabel = (val) => val ? t(`filter.${val}`) : '';
  const getLevelLabel = (val) => val ? t(`filter.${val}`) : '';

  const handleCategoryChange = (cat) => {
    setFilters(prev => ({
      ...prev,
      category: cat === 'All' ? '' : cat,
      subcategory: '',
      country: '',
      level: ''
    }));
  };

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      background: 'transparent',
      borderColor: 'transparent',
      boxShadow: 'none',
      cursor: 'pointer',
      minHeight: '44px',
      '&:hover': {
        borderColor: 'transparent'
      }
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? '#a1a1aa' : '#52525b',
      fontWeight: 500,
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? '#e4e4e7' : '#18181b',
      fontWeight: 600,
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}`,
      borderRadius: '0.75rem',
      padding: '0.5rem',
      boxShadow: isDark ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      zIndex: 50
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? (isDark ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.1)')
        : state.isFocused
          ? (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)')
          : 'transparent',
      color: state.isSelected
        ? (isDark ? '#eab308' : '#ca8a04')
        : (isDark ? '#e4e4e7' : '#18181b'),
      borderRadius: '0.5rem',
      cursor: 'pointer',
      padding: '0.5rem 0.75rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      ':active': {
        backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : 'rgba(234, 179, 8, 0.1)'
      }
    }),
    input: (base) => ({
      ...base,
      color: isDark ? '#e4e4e7' : '#18181b',
    })
  };

  const Dropdown = ({ label, value, options, onChange, icon: Icon, placeholder = "Select", getLabel = (v) => v }) => {
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

    const displayValue = value ? getLabel(value) : placeholder;

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 w-full md:w-auto justify-between md:justify-start ${
            value
              ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 text-yellow-500 border border-yellow-500/50'
              : isDark
                ? 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-700 hover:border-yellow-500/30'
                : 'bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200 hover:border-yellow-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="w-4 h-4" />}
            <span>{label && <span className="opacity-70 font-medium mr-1">{label}:</span>}</span>
            <span>{displayValue}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className={`absolute z-50 mt-2 w-48 rounded-xl shadow-xl border overflow-hidden animate-fade-in-up ${
            isDark 
              ? 'bg-zinc-900 border-zinc-700 shadow-black/50' 
              : 'bg-white border-zinc-200 shadow-zinc-200/50'
          }`}>
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent p-1">
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    (value === option || (option === 'All' && !value && label === t('filter.category')))
                      ? isDark ? 'bg-yellow-500/10 text-yellow-500' : 'bg-yellow-50 text-yellow-600'
                      : isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <span>{getLabel(option)}</span>
                  {(value === option || (option === 'All' && !value && label === t('filter.category'))) && (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full mb-8 animate-fade-in-up relative z-40">
      <div className={`p-4 rounded-2xl border backdrop-blur-sm flex flex-wrap gap-4 items-center ${
        isDark 
          ? 'bg-zinc-900/30 border-zinc-800' 
          : 'bg-white/40 border-zinc-200'
      }`}>
        <div className="flex items-center text-yellow-500 mr-2">
            <Filter className="w-5 h-5" />
        </div>

        {/* Main Category Dropdown */}
        <Dropdown 
            label={t('filter.category')}
            value={filters.category || 'All'}
            options={categories}
            onChange={handleCategoryChange}
            getLabel={getCategoryLabel}
        />

        {/* Dynamic Sub-filters */}
        {filters.category === 'Sports' && (
            <div className="flex items-center gap-4 animate-slide-in-right">
                <div className="h-8 w-px bg-zinc-300 dark:bg-zinc-700 hidden md:block"></div>
                <Dropdown 
                    label={t('filter.sport')}
                    value={filters.subcategory}
                    options={sports}
                    placeholder={t('filter.allSports')}
                    getLabel={getSportLabel}
                    onChange={(val) => setFilters(prev => ({ ...prev, subcategory: val === filters.subcategory ? '' : val }))}
                />
            </div>
        )}

        {filters.category === 'Politics' && (
            <div className="flex items-center gap-4 animate-slide-in-right">
                <div className="h-8 w-px bg-zinc-300 dark:bg-zinc-700 hidden md:block"></div>
                
                <div className="w-56">
                  <Select
                    options={allCountries}
                    value={allCountries.find(c => c.value === filters.country) || null}
                    onChange={(option) => setFilters(prev => ({ 
                        ...prev, 
                        country: option ? option.value : '',
                        level: '' 
                    }))}
                    placeholder={t('filter.selectCountry')}
                    styles={selectStyles}
                    isClearable
                    components={{
                      IndicatorSeparator: () => null
                    }}
                  />
                </div>
                
                {filters.country && (
                    <Dropdown 
                        label={t('filter.level')}
                        value={filters.level}
                        options={levels}
                        placeholder={t('filter.allLevels')}
                        getLabel={getLevelLabel}
                        onChange={(val) => setFilters(prev => ({ ...prev, level: val === filters.level ? '' : val }))}
                    />
                )}
            </div>
        )}
      </div>
    </div>
  );
}
