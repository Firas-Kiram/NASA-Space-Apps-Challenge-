import React from 'react';

const SearchBar = ({ searchQuery, onSearchChange, resultsCount }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search publications, organisms, or outcomes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all duration-200"
          aria-label="Search publications, organisms, or outcomes"
        />
      </div>
      
      
    </div>
  );
};

export default SearchBar;
