'use client';

import { X, Calendar, User, Home, Hash, FileText } from 'lucide-react';
import FilterOption from './FilterOption';
import { SearchFilters } from '@/types/search';

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onClose: () => void;
  isOpen: boolean;
}

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Coordinator Approved', value: 'coordinator_approved' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' },
];

const userTypeOptions = [
  { label: 'Student', value: 'student' },
  { label: 'Coordinator', value: 'coordinator' },
  { label: 'Warden', value: 'warden' },
  { label: 'Security', value: 'security' },
  { label: 'Admin', value: 'admin' },
];

const hostelBlockOptions = [
  { label: 'Block A', value: 'A' },
  { label: 'Block B', value: 'B' },
  { label: 'Block C', value: 'C' },
  { label: 'Block D', value: 'D' },
];

const gatepassTypeOptions = [
  { label: 'Local', value: 'local' },
  { label: 'Home', value: 'home' },
  { label: 'Medical', value: 'medical' },
  { label: 'Emergency', value: 'emergency' },
];

export default function FilterPanel({
  filters,
  onFilterChange,
  onClose,
  isOpen,
}: FilterPanelProps) {
  if (!isOpen) return null;

  const handleStatusChange = (value: string, checked: boolean) => {
    const currentStatus = filters.status || [];
    const newStatus = checked
      ? [...currentStatus, value]
      : currentStatus.filter((s) => s !== value);
    onFilterChange({ ...filters, status: newStatus });
  };

  const handleUserTypeChange = (value: string, checked: boolean) => {
    const currentTypes = filters.userType || [];
    const newTypes = checked
      ? [...currentTypes, value]
      : currentTypes.filter((t) => t !== value);
    onFilterChange({ ...filters, userType: newTypes });
  };

  const handleHostelBlockChange = (value: string, checked: boolean) => {
    const currentBlocks = filters.hostelBlock || [];
    const newBlocks = checked
      ? [...currentBlocks, value]
      : currentBlocks.filter((b) => b !== value);
    onFilterChange({ ...filters, hostelBlock: newBlocks });
  };

  const handleGatepassTypeChange = (value: string, checked: boolean) => {
    const currentTypes = filters.gatepassType || [];
    const newTypes = checked
      ? [...currentTypes, value]
      : currentTypes.filter((t) => t !== value);
    onFilterChange({ ...filters, gatepassType: newTypes });
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    onFilterChange({
      ...filters,
      dateRange: {
        from: field === 'from' ? value : filters.dateRange?.from || '',
        to: field === 'to' ? value : filters.dateRange?.to || '',
      },
    });
  };

  const handleRoomNumberChange = (value: string) => {
    onFilterChange({ ...filters, roomNumber: value });
  };

  const clearAllFilters = () => {
    onFilterChange({
      status: [],
      userType: [],
      hostelBlock: [],
      gatepassType: [],
      dateRange: { from: '', to: '' },
      roomNumber: '',
    });
  };

  const hasActiveFilters =
    (filters.status?.length || 0) > 0 ||
    (filters.userType?.length || 0) > 0 ||
    (filters.hostelBlock?.length || 0) > 0 ||
    (filters.gatepassType?.length || 0) > 0 ||
    filters.roomNumber ||
    filters.dateRange?.from ||
    filters.dateRange?.to;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Filter Panel */}
      <div className="absolute lg:absolute right-0 top-full mt-2 w-full lg:w-96 max-h-[calc(100vh-200px)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slideDown overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Filters
            </h3>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar">
          <div className="p-4 space-y-6">
            {/* Status Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Status
                </h4>
              </div>
              <div className="space-y-1">
                {statusOptions.map((option) => (
                  <FilterOption
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    checked={filters.status?.includes(option.value) || false}
                    onChange={(checked) =>
                      handleStatusChange(option.value, checked)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Date Range
                </h4>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange?.from || ''}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange?.to || ''}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* User Type Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-900">
                  User Type
                </h4>
              </div>
              <div className="space-y-1">
                {userTypeOptions.map((option) => (
                  <FilterOption
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    checked={filters.userType?.includes(option.value) || false}
                    onChange={(checked) =>
                      handleUserTypeChange(option.value, checked)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Hostel Block Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-4 h-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Hostel Block
                </h4>
              </div>
              <div className="space-y-1">
                {hostelBlockOptions.map((option) => (
                  <FilterOption
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    checked={
                      filters.hostelBlock?.includes(option.value) || false
                    }
                    onChange={(checked) =>
                      handleHostelBlockChange(option.value, checked)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Room Number Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Room Number
                </h4>
              </div>
              <input
                type="text"
                value={filters.roomNumber || ''}
                onChange={(e) => handleRoomNumberChange(e.target.value)}
                placeholder="Enter room number"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Gatepass Type Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Gatepass Type
                </h4>
              </div>
              <div className="space-y-1">
                {gatepassTypeOptions.map((option) => (
                  <FilterOption
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    checked={
                      filters.gatepassType?.includes(option.value) || false
                    }
                    onChange={(checked) =>
                      handleGatepassTypeChange(option.value, checked)
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
