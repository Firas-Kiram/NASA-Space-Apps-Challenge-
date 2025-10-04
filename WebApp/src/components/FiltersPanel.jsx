import React, { useState } from 'react';
import { filterOptions } from '../data/searchData';

const FiltersPanel = ({ filters, onFilterChange, availableKeywords = [] }) => {
  const [keywordSearchQuery, setKeywordSearchQuery] = useState('');
  
  // Filter keywords based on search query
  const filteredKeywords = keywordSearchQuery
    ? availableKeywords.filter(kw => kw.toLowerCase().includes(keywordSearchQuery.toLowerCase()))
    : availableKeywords;
  
  // Show all filtered keywords
  const displayKeywords = filteredKeywords;
  // Platform filter removed per request

  const handleTagChange = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFilterChange({ ...filters, tags: newTags });
  };

  const clearAllFilters = () => {
    onFilterChange({
      years: [],
      confidence: [],
      tags: []
    });
  };

  return (
    <div className="sticky top-24 space-y-4">
      {/* Filter Header */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={clearAllFilters}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Removed Organisms Filter per request */}

      {/* Removed Platform Filter per request */}

      {/* Year Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Publication Year</h4>
        <select
          multiple
          value={filters.years}
          onChange={(e) => {
            const selectedYears = Array.from(e.target.selectedOptions, option => option.value);
            onFilterChange({ ...filters, years: selectedYears });
          }}
          className="w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm"
          size="4"
        >
          {filterOptions.years.map((year) => (
            <option key={year} value={year} className="py-1">
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Confidence Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Confidence Level</h4>
        <div className="space-y-2">
          {filterOptions.confidence.map((conf, index) => (
            <label key={index} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.confidence.includes(conf.label)}
                onChange={() => {
                  const newConfidence = filters.confidence.includes(conf.label)
                    ? filters.confidence.filter(c => c !== conf.label)
                    : [...filters.confidence, conf.label];
                  onFilterChange({ ...filters, confidence: newConfidence });
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
              />
              <span className="ml-2 text-sm text-gray-700">{conf.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Keywords Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Keywords</h4>
        
        {/* Keyword Search Box */}
        {availableKeywords.length > 20 && (
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search keywords..."
              value={keywordSearchQuery}
              onChange={(e) => setKeywordSearchQuery(e.target.value)}
              className="w-full text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 px-3 py-2"
            />
          </div>
        )}
        
        {/* Selected Keywords Display */}
        {filters.tags.length > 0 && (
          <div className="mb-3 p-2 bg-purple-50 rounded-lg">
            <div className="text-xs font-medium text-purple-900 mb-1">Selected ({filters.tags.length}):</div>
            <div className="flex flex-wrap gap-1">
              {filters.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagChange(tag)}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                >
                  {tag}
                  <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Available Keywords List */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {displayKeywords.length > 0 ? (
            displayKeywords.map((tag) => (
              <label key={tag} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.tags.includes(tag)}
                  onChange={() => handleTagChange(tag)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-gray-700 line-clamp-1">{tag}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">
              {keywordSearchQuery ? 'No keywords match your search' : 'No keywords available'}
            </p>
          )}
        </div>
        
        {filteredKeywords.length > 20 && (
          <p className="mt-2 text-xs text-gray-500">
            Showing {displayKeywords.length} of {filteredKeywords.length} keywords
          </p>
        )}
      </div>

      {/* Active Filters Summary */}
      {(filters.years.length > 0 || filters.confidence.length > 0 || filters.tags.length > 0) && (
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
          <h4 className="text-sm font-medium text-purple-900 mb-2">Active Filters</h4>
          <div className="flex flex-wrap gap-1">
            {[...filters.years, ...filters.confidence, ...filters.tags].map((filter, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                {filter}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltersPanel;
