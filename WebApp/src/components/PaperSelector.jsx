import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const PaperSelector = ({ selectedPapers, onPapersChange, onGenerateGraph }) => {
  const [allPapers, setAllPapers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [relatedPapers, setRelatedPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'search', 'related'

  // Load all papers on component mount
  useEffect(() => {
    const loadPapers = async () => {
      try {
        setLoading(true);
        const papers = await apiService.fetchAllPapers();
        setAllPapers(papers);
      } catch (error) {
        console.error('Error loading papers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPapers();
  }, []);

  // Load related papers when selected papers change
  useEffect(() => {
    const loadRelatedPapers = async () => {
      if (selectedPapers.length > 0) {
        try {
          const related = await apiService.fetchRelatedPapers(selectedPapers);
          setRelatedPapers(related);
        } catch (error) {
          console.error('Error loading related papers:', error);
        }
      } else {
        setRelatedPapers([]);
      }
    };

    loadRelatedPapers();
  }, [selectedPapers]);

  // Handle search
  const handleSearch = async (keyword) => {
    setSearchKeyword(keyword);
    if (keyword.trim()) {
      try {
        setLoading(true);
        const results = await apiService.searchPapers(keyword);
        setSearchResults(results);
        setActiveTab('search');
      } catch (error) {
        console.error('Error searching papers:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
      setActiveTab('all');
    }
  };

  // Handle paper selection
  const handlePaperToggle = (paper) => {
    const isSelected = selectedPapers.some(p => p.title === paper.title);
    if (isSelected) {
      onPapersChange(selectedPapers.filter(p => p.title !== paper.title));
    } else {
      onPapersChange([...selectedPapers, paper]);
    }
  };

  // Handle select all visible papers
  const handleSelectAll = () => {
    const currentPapers = activeTab === 'search' ? searchResults : 
                         activeTab === 'related' ? relatedPapers : allPapers;
    const newSelections = currentPapers.filter(paper => 
      !selectedPapers.some(selected => selected.title === paper.title)
    );
    onPapersChange([...selectedPapers, ...newSelections]);
  };

  // Handle clear all selections
  const handleClearAll = () => {
    onPapersChange([]);
  };

  const getCurrentPapers = () => {
    switch (activeTab) {
      case 'search':
        return searchResults;
      case 'related':
        return relatedPapers;
      default:
        return allPapers;
    }
  };

  const currentPapers = getCurrentPapers();

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Select Papers</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {selectedPapers.length} selected
          </span>
          {selectedPapers.length > 0 && (
            <button
              onClick={onGenerateGraph}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors text-sm"
            >
              Generate Graph
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search papers by title..."
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'all'
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Papers ({allPapers.length})
        </button>
        {searchResults.length > 0 && (
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'search'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Search Results ({searchResults.length})
          </button>
        )}
        {relatedPapers.length > 0 && (
          <button
            onClick={() => setActiveTab('related')}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'related'
                ? 'bg-purple-100 text-purple-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Related Papers ({relatedPapers.length})
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={handleSelectAll}
          disabled={currentPapers.length === 0}
          className="px-3 py-1 text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Select All Visible
        </button>
        <button
          onClick={handleClearAll}
          disabled={selectedPapers.length === 0}
          className="px-3 py-1 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear All
        </button>
      </div>

      {/* Papers List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : currentPapers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {activeTab === 'search' ? 'No papers found for your search.' : 'No papers available.'}
          </div>
        ) : (
          <div className="space-y-2">
            {currentPapers.map((paper, index) => {
              const isSelected = selectedPapers.some(p => p.title === paper.title);
              return (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handlePaperToggle(paper)}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handlePaperToggle(paper)}
                      className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {paper.title}
                      </h4>
                      <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                        <span>{paper.conceptCount} concepts</span>
                        {paper.url && (
                          <a
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Paper
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Papers Summary */}
      {selectedPapers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Papers:</h4>
          <div className="space-y-1">
            {selectedPapers.slice(0, 3).map((paper, index) => (
              <div key={index} className="text-xs text-gray-600 truncate">
                {paper.title}
              </div>
            ))}
            {selectedPapers.length > 3 && (
              <div className="text-xs text-gray-500">
                ... and {selectedPapers.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperSelector;
