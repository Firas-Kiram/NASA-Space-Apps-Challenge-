import React, { useState } from 'react';
import Layout from '../components/Layout';
import { recentPublications } from '../data/mockData';

const FiltersPanel = ({ filters, onFilterChange }) => {
  return (
    <div className="sticky top-20 bg-white rounded-2xl p-6 shadow-md h-fit">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
      
      {/* Research Areas */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Research Areas</h4>
        <div className="space-y-2">
          {['Astrobiology', 'Space Medicine', 'Plant Biology', 'Microbiology', 'Radiation Biology'].map((area) => (
            <label key={area} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.areas.includes(area)}
                onChange={(e) => {
                  const newAreas = e.target.checked 
                    ? [...filters.areas, area]
                    : filters.areas.filter(a => a !== area);
                  onFilterChange({ ...filters, areas: newAreas });
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-600">{area}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Publication Year */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Publication Year</h4>
        <select 
          value={filters.year}
          onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
          className="w-full rounded-lg border-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">All Years</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
        </select>
      </div>

      {/* Citation Range */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Citations</h4>
        <div className="space-y-2">
          {['High Impact (50+)', 'Medium Impact (10-49)', 'Emerging (1-9)', 'New (0)'].map((range) => (
            <label key={range} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.citations.includes(range)}
                onChange={(e) => {
                  const newCitations = e.target.checked 
                    ? [...filters.citations, range]
                    : filters.citations.filter(c => c !== range);
                  onFilterChange({ ...filters, citations: newCitations });
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-600">{range}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => onFilterChange({ areas: [], year: '', citations: [] })}
        className="w-full px-4 py-2 text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
};

const ResultCard = ({ publication, onSelect, isSelected }) => {
  return (
    <div 
      className={`bg-white rounded-2xl p-6 shadow-md hover-lift cursor-pointer transition-all duration-200 ${
        isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : ''
      }`}
      onClick={() => onSelect(publication)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-4">
          {publication.title}
        </h3>
        <span className="text-sm text-gray-500 whitespace-nowrap">{publication.year}</span>
      </div>
      
      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
        <span>{publication.authors.join(', ')}</span>
        <span>•</span>
        <span>{publication.citations} citations</span>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {publication.area}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {publication.journal}
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
        {publication.abstract}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
            View Details
          </button>
          <button className="px-3 py-1 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Add to Compare
          </button>
        </div>
        <button className="p-1 text-gray-400 hover:text-purple-600 transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const SearchResults = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    areas: [],
    year: '',
    citations: []
  });

  const filteredResults = recentPublications.filter(pub => {
    if (searchQuery && !pub.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.areas.length > 0 && !filters.areas.includes(pub.area)) {
      return false;
    }
    if (filters.year && pub.year.toString() !== filters.year) {
      return false;
    }
    return true;
  });

  const contextItem = selectedItem ? {
    title: selectedItem.title,
    description: selectedItem.abstract,
    metadata: {
      authors: selectedItem.authors.join(', '),
      year: selectedItem.year,
      journal: selectedItem.journal,
      citations: selectedItem.citations
    },
    tags: [selectedItem.area, 'NASA', 'Research'],
    relatedItems: [
      { title: 'Similar Research Paper', type: 'Publication' },
      { title: 'Related Experiment', type: 'Experiment' },
      { title: 'Connected Dataset', type: 'Dataset' }
    ]
  } : null;

  return (
    <Layout showContextPanel={!!selectedItem} selectedItem={contextItem}>
      <div className="flex gap-6">
        {/* Left Sidebar: Filters Panel */}
        <div className="w-80 flex-shrink-0">
          <FiltersPanel filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search publications, authors, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                {filteredResults.length} results found
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500">
                  <option>Relevance</option>
                  <option>Date (Newest)</option>
                  <option>Date (Oldest)</option>
                  <option>Citations</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-6">
            {filteredResults.map((publication) => (
              <ResultCard 
                key={publication.id} 
                publication={publication}
                onSelect={setSelectedItem}
                isSelected={selectedItem?.id === publication.id}
              />
            ))}
            
            {filteredResults.length === 0 && (
              <div className="bg-white rounded-2xl p-12 shadow-md text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 6c-3.037 0-5.789 1.696-7.149 4.377-.87 1.724-.87 3.78 0 5.504A7.965 7.965 0 0012 18a7.96 7.96 0 005.149-1.877L19 17l-2-2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SearchResults;
