import React from 'react';
import ResultCard from './ResultCard';

const ResultsList = ({ results, selectedItem, onSelect, onCompare, onSave }) => {
  if (results.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-md text-center">
        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 6c-3.037 0-5.789 1.696-7.149 4.377-.87 1.724-.87 3.78 0 5.504A7.965 7.965 0 0012 18a7.96 7.96 0 005.149-1.877L19 17l-2-2z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
        <p className="text-gray-600 mb-6">
          We couldn't find any publications matching your search criteria.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>Try adjusting your search terms or filters:</p>
          <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
            <li>Use broader search terms</li>
            <li>Remove some filters</li>
            <li>Check spelling and try synonyms</li>
            <li>Search for specific organisms or platforms</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-900">
          Search Results ({results.length})
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Showing {results.length} of {results.length} results</span>
        </div>
      </div>

      {/* Results grid */}
      <div className="space-y-4">
        {results.map((publication) => (
          <ResultCard
            key={publication.pub_id}
            publication={publication}
            isSelected={selectedItem?.pub_id === publication.pub_id}
            onSelect={onSelect}
            onCompare={onCompare}
            onSave={onSave}
          />
        ))}
      </div>

      {/* Load more button (for pagination) */}
      {results.length > 0 && (
        <div className="text-center pt-6">
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
            Load More Results
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsList;
