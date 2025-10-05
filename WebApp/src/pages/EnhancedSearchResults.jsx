import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import FiltersPanel from '../components/FiltersPanel';
import ResultsList from '../components/ResultsList';
import MobileFiltersModal from '../components/MobileFiltersModal';
import dataService from '../services/dataService';

const EnhancedSearchResults = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [savedItems, setSavedItems] = useState([]);
  const [compareItems, setCompareItems] = useState([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableKeywords, setAvailableKeywords] = useState([]);
  const [filters, setFilters] = useState({
    years: [],
    confidence: [],
    tags: []
  });

  // Load publications data on component mount
  useEffect(() => {
    const loadPublications = async () => {
      try {
        setLoading(true);
        await dataService.loadPublications();
        const transformedData = dataService.transformPublicationsForSearch(dataService.publications);
        setSearchResults(transformedData);
        
        // Get unique keywords from the API endpoint
        const keywords = await dataService.getUniqueKeywords();
        setAvailableKeywords(keywords);
        
        setError(null);
      } catch (err) {
        console.error('Error loading publications:', err);
        setError('Failed to load publications from server');
      } finally {
        setLoading(false);
      }
    };

    loadPublications();
  }, []);

  // Filter and search logic
  const filteredResults = useMemo(() => {
    return searchResults.filter(publication => {
      // Text search
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesTitle = publication.title.toLowerCase().includes(searchLower);
        const matchesSummary = publication.summary.toLowerCase().includes(searchLower);
        // organism removed from search
        const matchesTags = publication.tags.some(tag => tag.toLowerCase().includes(searchLower));
        const matchesAuthors = publication.authors.some(author => author.toLowerCase().includes(searchLower));
        
        if (!matchesTitle && !matchesSummary && !matchesTags && !matchesAuthors) {
          return false;
        }
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

      // Keywords (tags) filter - case-insensitive ALL selected must match
      if (filters.tags.length > 0) {
        const publicationKeywords = (publication.tags || []).map(t => t.toLowerCase());
        const selectedKeywords = filters.tags.map(t => t.toLowerCase());
        const hasMatchingTag = selectedKeywords.every(tag => publicationKeywords.includes(tag));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [searchResults, searchQuery, filters]);

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
    // Navigate to the publication detail page
    navigate(`/publication/${encodeURIComponent(publication.title)}`);
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading publications...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Publications</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

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
            {(filters.years.length + filters.confidence.length + filters.tags.length) > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-purple-600 rounded-full">
                {filters.years.length + filters.confidence.length + filters.tags.length}
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
              availableKeywords={availableKeywords}
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
          availableKeywords={availableKeywords}
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
