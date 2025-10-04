import React, { useState } from 'react';

const ResultCard = ({ publication, onSelect, isSelected, onCompare, onSave }) => {
  const [isHovered, setIsHovered] = useState(false);

  const confidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(publication);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg p-4 shadow-md cursor-pointer transition-all duration-300 ease-out transform ${
        isHovered ? 'translate-y-[-4px] shadow-lg' : ''
      } ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : ''} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(publication)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${publication.title}`}
    >
      {/* Top line: Title and Year */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-bold text-gray-900 flex-1 mr-4 leading-tight">
          {publication.title}
        </h3>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 whitespace-nowrap">
          {publication.year}
        </span>
      </div>

      {/* Second line: Tags/Chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Organism chip removed per request */}
        {/* Platform chip removed per request */}
        {publication.tags.slice(0, isHovered ? 5 : 3).map((tag, index) => (
          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
            </svg>
            {tag}
          </span>
        ))}
        {publication.tags.length > (isHovered ? 5 : 3) && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            +{publication.tags.length - (isHovered ? 5 : 3)} more
          </span>
        )}
      </div>

      {/* Body: Evidence-first summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
          {isHovered && publication.extendedSummary ? publication.extendedSummary : publication.summary}
        </p>
        {isHovered && publication.extendedSummary && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Authors: {publication.authors.join(', ')}</span>
              <span>•</span>
              <span>Citations: {publication.citations}</span>
              <span>•</span>
              <span>Journal: {publication.journal}</span>
            </div>
          </div>
        )}
      </div>

      {/* ID row (confidence removed) */}
      <div className="flex items-center justify-end mb-4">
        <div className="text-xs text-gray-500">ID: {publication.pub_id}</div>
      </div>

      {/* Footer: Quick action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(publication);
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
            aria-label={`View full details for ${publication.title}`}
          >
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompare && onCompare(publication);
            }}
            className="px-3 py-1.5 border border-purple-300 text-purple-600 text-xs font-medium rounded-lg hover:bg-purple-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
            aria-label={`Compare ${publication.title} with other publications`}
          >
            Compare
          </button>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave && onSave(publication);
          }}
          className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 rounded"
          aria-label={`Save ${publication.title} to collection`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
