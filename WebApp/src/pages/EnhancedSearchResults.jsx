import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import FiltersPanel from '../components/FiltersPanel';
import ResultsList from '../components/ResultsList';
import MobileFiltersModal from '../components/MobileFiltersModal';
import { searchResults } from '../data/searchData';

const EnhancedSearchResults = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [savedItems, setSavedItems] = useState([]);
  const [compareItems, setCompareItems] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    organisms: [],
    platforms: [],
    years: [],
    confidence: [],
    tags: []
  });

  // Filter and search logic
  const filteredResults = useMemo(() => {
    return searchResults.filter(publication => {
      // Text search
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesTitle = publication.title.toLowerCase().includes(searchLower);
        const matchesSummary = publication.summary.toLowerCase().includes(searchLower);
        const matchesOrganism = publication.organism.toLowerCase().includes(searchLower);
        const matchesTags = publication.tags.some(tag => tag.toLowerCase().includes(searchLower));
        const matchesAuthors = publication.authors.some(author => author.toLowerCase().includes(searchLower));
        
        if (!matchesTitle && !matchesSummary && !matchesOrganism && !matchesTags && !matchesAuthors) {
          return false;
        }
      }

      // Organism filter
      if (filters.organisms.length > 0 && !filters.organisms.includes(publication.organism)) {
        return false;
      }

      // Platform filter
      if (filters.platforms.length > 0 && !filters.platforms.includes(publication.platform)) {
        return false;
      }

      // Year filter
      if (filters.years.length > 0 && !filters.years.includes(publication.year.toString())) {
        return false;
      }

      // Confidence filter
      if (filters.confidence.length > 0) {
        const matchesConfidence = filters.confidence.some(confLabel => {
          if (confLabel === 'High (>0.9)') return publication.confidence > 0.9;
          if (confLabel === 'Medium (0.7-0.9)') return publication.confidence >= 0.7 && publication.confidence <= 0.9;
          if (confLabel === 'Low (<0.7)') return publication.confidence < 0.7;
          return false;
        });
        if (!matchesConfidence) return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(filterTag => 
          publication.tags.includes(filterTag)
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  // Context panel data
  const contextItem = selectedItem ? {
    title: selectedItem.title,
    description: selectedItem.extendedSummary || selectedItem.summary,
    metadata: {
      authors: selectedItem.authors.join(', '),
      year: selectedItem.year,
      journal: selectedItem.journal,
      citations: selectedItem.citations,
      confidence: `${Math.round(selectedItem.confidence * 100)}%`,
      organism: selectedItem.organism,
      platform: selectedItem.platform
    },
    tags: [selectedItem.organism, selectedItem.platform, ...selectedItem.tags],
    relatedItems: [
      { title: 'Similar Research in Microgravity', type: 'Publication' },
      { title: 'Related Experiment Data', type: 'Dataset' },
      { title: 'Follow-up Study', type: 'Publication' }
    ]
  } : null;

  // Action handlers
  const handleSelect = (publication) => {
    setSelectedItem(publication);
  };

  const handleCompare = (publication) => {
    if (compareItems.length < 3 && !compareItems.find(item => item.pub_id === publication.pub_id)) {
      setCompareItems([...compareItems, publication]);
    }
  };

  const handleSave = (publication) => {
    if (!savedItems.find(item => item.pub_id === publication.pub_id)) {
      setSavedItems([...savedItems, publication]);
    }
  };

  return (
    <Layout showContextPanel={!!selectedItem} selectedItem={contextItem}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Publications</h1>
          <p className="text-gray-600">Explore NASA's bioscience research database with advanced filtering and AI-powered insights</p>
        </div>

        {/* Search Bar */}
        <SearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          resultsCount={filteredResults.length}
        />

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Filters</span>
            {(filters.organisms.length + filters.platforms.length + filters.years.length + filters.confidence.length + filters.tags.length) > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-purple-600 rounded-full">
                {filters.organisms.length + filters.platforms.length + filters.years.length + filters.confidence.length + filters.tags.length}
              </span>
            )}
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Filters Panel (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1">
            <FiltersPanel 
              filters={filters}
              onFilterChange={setFilters}
            />
          </div>

          {/* Main: Results List */}
          <div className="lg:col-span-3">
            <ResultsList
              results={filteredResults}
              selectedItem={selectedItem}
              onSelect={handleSelect}
              onCompare={handleCompare}
              onSave={handleSave}
            />
          </div>
        </div>

        {/* Mobile Filters Modal */}
        <MobileFiltersModal
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          filters={filters}
          onFilterChange={setFilters}
        />

        {/* Action Summary Bar */}
        {(savedItems.length > 0 || compareItems.length > 0) && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 z-40">
            <div className="flex items-center space-x-6">
              {savedItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v16l-5-2.5L5 21V5z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">{savedItems.length} saved</span>
                  <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                    View Collection
                  </button>
                </div>
              )}
              {compareItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">{compareItems.length} to compare</span>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Compare Now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EnhancedSearchResults;
