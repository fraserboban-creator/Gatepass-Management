'use client';

import { FileText, User, Activity, Clock, ArrowRight } from 'lucide-react';
import { SearchResult } from '@/types/search';

interface SearchResultsDropdownProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
  onResultClick: (result: SearchResult) => void;
  onClose: () => void;
}

const iconMap = {
  gatepass: FileText,
  user: User,
  log: Activity,
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  coordinator_approved: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
};

export default function SearchResultsDropdown({
  results,
  loading,
  query,
  onResultClick,
  onClose,
}: SearchResultsDropdownProps) {
  if (!query && !loading) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Results Dropdown */}
      <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slideDown overflow-hidden max-h-[500px]">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm text-gray-600">
              Searching...
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              No results found
            </h4>
            <p className="text-xs text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[450px] custom-scrollbar">
            {/* Results Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <p className="text-xs font-medium text-gray-600">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Results List */}
            <div className="p-2">
              {results.map((result) => {
                const Icon = iconMap[result.type] || FileText;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => onResultClick(result)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group text-left"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {result.title}
                        </h4>
                        {result.status && (
                          <span
                            className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${
                              statusColors[
                                result.status as keyof typeof statusColors
                              ] || statusColors.pending
                            }`}
                          >
                            {result.status.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                        {result.subtitle}
                      </p>
                      {result.timestamp && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {result.timestamp}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* View All Footer */}
            {results.length >= 10 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  View all results
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
