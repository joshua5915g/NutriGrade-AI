'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Loader2,
  X,
  Sparkles,
  Package,
  ChevronRight,
  Filter,
  Flame,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { SearchProductResult, NutriScoreGrade, NovaGroup } from '../types/nutrition';

interface GlobalSearchBarProps {
  onSelectProduct: (product: SearchProductResult) => void;
  className?: string;
  placeholder?: string;
}

const CATEGORIES = [
  { id: '', label: 'All Categories' },
  { id: 'beverages', label: 'Beverages' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'cereals', label: 'Cereals' },
  { id: 'bakery', label: 'Bakery' },
  { id: 'sauces', label: 'Sauces' },
];

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  onSelectProduct,
  className = '',
  placeholder = 'Search products by name or brand (e.g., Oats, Soda, Greek Yogurt)...',
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [results, setResults] = useState<SearchProductResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 1. 300ms Debounce Handler for Query Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // 2. Fetch Search Products API when debounced query or selected category changes
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Cancel previous inflight fetch request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      setIsOpen(true);

      try {
        const url = `/api/search-products?q=${encodeURIComponent(
          debouncedQuery
        )}&page=1${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`;

        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          throw new Error('Search service temporarily unavailable');
        }

        const data = await res.json();
        if (data.products) {
          setResults(data.products);
        } else {
          setResults([]);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Global Search fetch error:', err);
          setError('Unable to fetch search results. Please try again.');
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    performSearch();
  }, [debouncedQuery, selectedCategory]);

  // 3. Click Outside Handler to Close Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (product: SearchProductResult) => {
    setIsOpen(false);
    onSelectProduct(product);
  };

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setIsOpen(false);
  };

  // Nutri-Score Pill Style Mapper
  const getNutriScoreBadgeStyle = (grade: NutriScoreGrade) => {
    switch (grade) {
      case 'A':
        return 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20';
      case 'B':
        return 'bg-teal-500 text-white shadow-sm shadow-teal-500/20';
      case 'C':
        return 'bg-amber-400 text-slate-900 shadow-sm shadow-amber-400/20';
      case 'D':
        return 'bg-orange-500 text-white shadow-sm shadow-orange-500/20';
      case 'E':
        return 'bg-rose-500 text-white shadow-sm shadow-rose-500/20';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  // NOVA Group Tag Style Mapper
  const getNovaTagStyle = (novaGroup: NovaGroup) => {
    switch (novaGroup) {
      case 1:
        return {
          label: 'NOVA 1',
          desc: 'Unprocessed',
          className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 2:
        return {
          label: 'NOVA 2',
          desc: 'Processed Ingredient',
          className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
        };
      case 3:
        return {
          label: 'NOVA 3',
          desc: 'Processed',
          className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 4:
        return {
          label: 'NOVA 4',
          desc: 'Ultra-Processed',
          className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        };
      default:
        return {
          label: `NOVA ${novaGroup}`,
          desc: '',
          className: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
        };
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* SEARCH INPUT CONTAINER */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || query.trim().length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-white/80 dark:bg-brand-darkCard/90 backdrop-blur-xl border border-slate-200/80 dark:border-brand-cream/20 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-brand-cream/60 text-sm font-medium transition-all duration-200 shadow-lg shadow-slate-900/5 focus:outline-none focus:ring-2 focus:ring-brand-lime/40 focus:border-brand-lime dark:focus:border-brand-lime"
        />

        {/* RIGHT ACTION CONTROLS */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
          {query && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-brand-forest/30 text-slate-400 hover:text-slate-600 dark:hover:text-brand-cream transition-all"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-brand-darkBg border border-slate-200/60 dark:border-brand-cream/20 text-[10px] font-semibold text-slate-500 dark:text-brand-cream">
            <Search className="w-3 h-3 text-brand-lime" />
            <span>Search Database</span>
          </div>
        </div>
      </div>

      {/* FLOATING RESULTS DROPDOWN */}
      {isOpen && (query.trim().length > 0 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-white/95 dark:bg-brand-darkCard/95 backdrop-blur-xl border border-slate-200/80 dark:border-brand-cream/20 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[520px] flex flex-col">
          {/* CATEGORY FILTER PILLS BAR */}
          <div className="p-3 border-b border-slate-200/60 dark:border-brand-cream/20 bg-slate-50/50 dark:bg-brand-darkBg/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 dark:text-brand-cream/70 uppercase tracking-wider px-2 flex items-center gap-1">
              <Filter className="w-3 h-3 text-brand-lime" />
              Filter:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-brand-forest text-brand-lime border-brand-lime/40 shadow-sm'
                    : 'bg-white dark:bg-brand-darkBg text-slate-600 dark:text-brand-cream border-slate-200 dark:border-brand-cream/20 hover:bg-slate-100 dark:hover:bg-brand-forest/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* RESULTS CONTENT LIST */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              <div className="p-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Searching global regulatory food database...
                </p>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-xs font-medium text-rose-500 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Package className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No products found for "{query}"
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                  Try checking spelling, searching by brand (e.g. Ferrero), or selecting another category filter.
                </p>
              </div>
            ) : (
              results.map((product) => {
                const novaTag = getNovaTagStyle(product.novaGroup);

                return (
                  <div
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className="p-3.5 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                  >
                    {/* LEFT: THUMBNAIL & METADATA */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Thumbnail Image */}
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 overflow-hidden flex items-center justify-center shrink-0">
                        {product.imageThumbUrl ? (
                          <img
                            src={product.imageThumbUrl}
                            alt={product.productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              // Fallback on image load error
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Package className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                        )}
                      </div>

                      {/* Title & Details */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {product.productName}
                        </span>

                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                          {product.brand || 'Global Food Database'}
                        </span>

                        {/* Macros Pill Bar */}
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {product.rawData.calories} kcal
                          </span>
                          <span>•</span>
                          <span>{product.rawData.sugars}g sugar</span>
                          <span>•</span>
                          <span>{product.rawData.protein}g protein</span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: NUTRI-SCORE & NOVA BADGES */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* Nutri-Score Pill */}
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">
                          Nutri-Score
                        </span>
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center mt-0.5 ${getNutriScoreBadgeStyle(
                            product.nutriScoreGrade
                          )}`}
                        >
                          {product.nutriScoreGrade}
                        </span>
                      </div>

                      {/* NOVA Tag */}
                      <div className="hidden sm:flex flex-col items-end">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${novaTag.className}`}
                        >
                          {novaTag.label}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                          {novaTag.desc}
                        </span>
                      </div>

                      {/* Arrow Icon */}
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* FOOTER BAR */}
          {results.length > 0 && (
            <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Showing top {results.length} verified products
              </span>
              <span>Click any item to view full nutrition analysis</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
