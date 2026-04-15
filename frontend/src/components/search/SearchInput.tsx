'use client';

import { Search, X, Loader2 } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  loading?: boolean;
  placeholder?: string;
}

export default function SearchInput({
  value,
  onChange,
  onClear,
  loading = false,
  placeholder = 'Search gatepasses, users, logs...',
}: SearchInputProps) {
  return (
    <div className="relative flex-1">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        {loading ? (
          <Loader2 className="w-5 h-5 text-[var(--text-tertiary)] animate-spin" />
        ) : (
          <Search className="w-5 h-5 text-[var(--text-tertiary)]" />
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 pl-12 pr-12 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
      />

      {value && (
        <button
          onClick={onClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4 text-[var(--text-tertiary)]" />
        </button>
      )}
    </div>
  );
}
