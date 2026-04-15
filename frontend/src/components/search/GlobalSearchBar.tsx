'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Filter, X } from 'lucide-react';
import SearchInput from './SearchInput';
import FilterPanel from './FilterPanel';
import SearchResultsDropdown from './SearchResultsDropdown';
import { SearchFilters, SearchResult } from '@/types/search';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface GlobalSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string, filters: SearchFilters) => void;
}

export default function GlobalSearchBar({
  placeholder,
  onSearch,
}: GlobalSearchBarProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    status: [],
    userType: [],
    hostelBlock: [],
    gatepassType: [],
    dateRange: { from: '', to: '' },
    roomNumber: '',
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Count active filters
  const activeFilterCount =
    (filters.status?.length || 0) +
    (filters.userType?.length || 0) +
    (filters.hostelBlock?.length || 0) +
    (filters.gatepassType?.length || 0) +
    (filters.roomNumber ? 1 : 0) +
    (filters.dateRange?.from ? 1 : 0) +
    (filters.dateRange?.to ? 1 : 0);

  // Debounced search
  const performSearch = useCallback(
    async (searchQuery: string, searchFilters: SearchFilters) => {
      if (!searchQuery.trim() && activeFilterCount === 0) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      setShowResults(true);

      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (searchFilters.status?.length) {
          params.append('status', searchFilters.status.join(','));
        }
        if (searchFilters.userType?.length) {
          params.append('userType', searchFilters.userType.join(','));
        }
        if (searchFilters.hostelBlock?.length) {
          params.append('hostelBlock', searchFilters.hostelBlock.join(','));
        }
        if (searchFilters.gatepassType?.length) {
          params.append('gatepassType', searchFilters.gatepassType.join(','));
        }
        if (searchFilters.roomNumber) {
          params.append('roomNumber', searchFilters.roomNumber);
        }
        if (searchFilters.dateRange?.from) {
          params.append('dateFrom', searchFilters.dateRange.from);
        }
        if (searchFilters.dateRange?.to) {
          params.append('dateTo', searchFilters.dateRange.to);
        }

        // Call search API
        const response = await api.get(`/search?${params.toString()}`);
        setResults(response.data.data || []);

        // Call custom onSearch callback if provided
        if (onSearch) {
          onSearch(searchQuery, searchFilters);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [activeFilterCount, onSearch]
  );

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query, filters);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, filters, performSearch]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setQuery('');

    // Navigate based on result type
    switch (result.type) {
      case 'gatepass':
        router.push(`/student/gatepass/${result.id}`);
        break;
      case 'user':
        router.push(`/admin/users?id=${result.id}`);
        break;
      case 'log':
        router.push(`/security/logs?id=${result.id}`);
        break;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Close on Escape
    if (e.key === 'Escape') {
      setShowResults(false);
      setShowFilters(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-3xl">
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <SearchInput
          value={query}
          onChange={handleQueryChange}
          onClear={handleClearSearch}
          loading={loading}
          placeholder={placeholder}
        />

        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative flex-shrink-0 h-12 px-4 flex items-center gap-2 rounded-xl border-2 font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
            showFilters || activeFilterCount > 0
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline text-sm">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <button
            onClick={() =>
              setFilters({
                status: [],
                userType: [],
                hostelBlock: [],
                gatepassType: [],
                dateRange: { from: '', to: '' },
                roomNumber: '',
              })
            }
            className="flex-shrink-0 h-12 px-4 flex items-center gap-2 rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--surface-active)] text-[var(--text-secondary)] font-medium transition-colors"
            title="Clear all filters"
          >
            <X className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Clear</span>
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onClose={() => setShowFilters(false)}
        isOpen={showFilters}
      />

      {/* Search Results */}
      {showResults && (
        <SearchResultsDropdown
          results={results}
          loading={loading}
          query={query}
          onResultClick={handleResultClick}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
