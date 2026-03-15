'use client';

import { useState } from 'react';

export default function SearchFilter({ 
  onSearch, 
  onFilterChange, 
  filters = [],
  placeholder = "Search...",
  showDateRange = false 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    onFilterChange(filter, dateFrom, dateTo);
  };

  const handleDateChange = () => {
    onFilterChange(activeFilter, dateFrom, dateTo);
  };

  return (
    <div className="card mb-6 space-y-4">
      {/* Search Bar */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="input pl-10"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
            🔍
          </span>
        </div>
        
        {showDateRange && (
          <>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input"
              placeholder="From"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input"
              placeholder="To"
            />
            <button onClick={handleDateChange} className="btn btn-primary">
              Apply
            </button>
          </>
        )}
      </div>

      {/* Filter Buttons */}
      {filters.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleFilterChange(filter.value)}
              className={`btn ${
                activeFilter === filter.value ? 'btn-primary' : 'btn-outline'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
