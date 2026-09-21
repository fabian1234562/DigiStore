'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryFilter } from './CategoryFilter';

export type SecuritySort = 'trending' | 'stars' | 'forks' | 'updated' | 'newest';

const SORT_OPTIONS: { value: SecuritySort; label: string; emoji: string }[] = [
  { value: 'trending', label: 'Trending', emoji: '🔥' },
  { value: 'stars', label: 'Más estrellas', emoji: '⭐' },
  { value: 'forks', label: 'Más forks', emoji: '🍴' },
  { value: 'updated', label: 'Actualizados', emoji: '🔄' },
  { value: 'newest', label: 'Más nuevos', emoji: '🆕' },
];

interface SearchBarProps {
  /** Initial search value */
  initialQuery?: string;
  /** Initial category */
  initialCategory?: string;
  /** Initial sort */
  initialSort?: SecuritySort;
  /** Debounced callback fired when search/category/sort change */
  onChange: (params: { q: string; category: string; sort: SecuritySort }) => void;
  /** Results count for the current filter */
  resultsCount?: number;
  /** Loading state */
  loading?: boolean;
  /** Whether to show the category pills inline (default: true) */
  showCategories?: boolean;
  className?: string;
}

export function SearchBar({
  initialQuery = '',
  initialCategory = 'all',
  initialSort = 'trending',
  onChange,
  resultsCount,
  loading = false,
  showCategories = true,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<SecuritySort>(initialSort);

  // Debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEmittedRef = useRef<string>('');

  const emit = useCallback(
    (params: { q: string; category: string; sort: SecuritySort }) => {
      const sig = `${params.q}|${params.category}|${params.sort}`;
      if (sig === lastEmittedRef.current) return;
      lastEmittedRef.current = sig;
      onChange(params);
    },
    [onChange],
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      emit({ q: query.trim(), category, sort });
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, category, sort, emit]);

  const handleClear = () => {
    setQuery('');
    setCategory('all');
    setSort('trending');
  };

  const hasFilters = query.trim() !== '' || category !== 'all' || sort !== 'trending';

  return (
    <div className={cn('w-full', className)}>
      {/* Search input + sort */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar herramientas, proyectos y recursos de ciberseguridad..."
            aria-label="Buscar proyectos de seguridad"
            className={cn(
              'w-full rounded-xl bg-gray-900/80 border border-gray-800',
              'py-3 pl-10 pr-10 text-sm text-gray-100 placeholder-gray-500',
              'outline-none transition-colors',
              'focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20',
            )}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative shrink-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SecuritySort)}
            aria-label="Ordenar resultados"
            className={cn(
              'appearance-none w-full sm:w-48 rounded-xl bg-gray-900/80 border border-gray-800',
              'py-3 pl-4 pr-9 text-sm text-gray-200 cursor-pointer outline-none',
              'focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20',
              'transition-colors',
            )}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-gray-900 text-gray-100">
                {opt.emoji} {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" aria-hidden="true" />
        </div>
      </div>

      {/* Category filter pills */}
      {showCategories && (
        <div className="mt-3.5">
          <CategoryFilter active={category} onChange={setCategory} />
        </div>
      )}

      {/* Results count + clear */}
      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-400">
        <div>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
              Buscando en GitHub…
            </span>
          ) : typeof resultsCount === 'number' ? (
            <span>
              <strong className="text-violet-300">{resultsCount}</strong>{' '}
              {resultsCount === 1 ? 'proyecto encontrado' : 'proyectos encontrados'}
            </span>
          ) : (
            <span className="text-gray-600">Listo</span>
          )}
        </div>
        {hasFilters && (
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 font-semibold transition-colors"
          >
            <X className="w-3 h-3" />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
