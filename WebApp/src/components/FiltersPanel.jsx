import React from 'react';
import { filterOptions } from '../data/searchData';

const FiltersPanel = ({ filters, onFilterChange }) => {
  const handleOrganismChange = (organism) => {
    const newOrganisms = filters.organisms.includes(organism)
      ? filters.organisms.filter(o => o !== organism)
      : [...filters.organisms, organism];
    onFilterChange({ ...filters, organisms: newOrganisms });
  };

  const handlePlatformChange = (platform) => {
    const newPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform];
    onFilterChange({ ...filters, platforms: newPlatforms });
  };

  const handleTagChange = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFilterChange({ ...filters, tags: newTags });
  };

  const clearAllFilters = () => {
    onFilterChange({
      organisms: [],
      platforms: [],
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

      {/* Organisms Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Organisms</h4>
        <div className="space-y-2">
          {filterOptions.organisms.map((organism) => (
            <label key={organism} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.organisms.includes(organism)}
                onChange={() => handleOrganismChange(organism)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
              />
              <span className="ml-2 text-sm text-gray-700">{organism}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Platform Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Platform</h4>
        <div className="space-y-2">
          {filterOptions.platforms.map((platform) => (
            <label key={platform} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.platforms.includes(platform)}
                onChange={() => handlePlatformChange(platform)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
              />
              <span className="ml-2 text-sm text-gray-700">{platform}</span>
            </label>
          ))}
        </div>
      </div>

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

      {/* Tags Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Research Tags</h4>
        <div className="space-y-2">
          {filterOptions.tags.map((tag) => (
            <label key={tag} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.tags.includes(tag)}
                onChange={() => handleTagChange(tag)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
              />
              <span className="ml-2 text-sm text-gray-700">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.organisms.length > 0 || filters.platforms.length > 0 || filters.years.length > 0 || filters.confidence.length > 0 || filters.tags.length > 0) && (
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
          <h4 className="text-sm font-medium text-purple-900 mb-2">Active Filters</h4>
          <div className="flex flex-wrap gap-1">
            {[...filters.organisms, ...filters.platforms, ...filters.years, ...filters.confidence, ...filters.tags].map((filter, index) => (
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
