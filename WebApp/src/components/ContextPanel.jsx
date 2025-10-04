import React from 'react';

const ContextPanel = ({ isOpen, onClose, selectedItem }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-18 h-full w-80 bg-gray-50 z-30 transform transition-transform duration-300 ease-in-out">
      <div className="p-4 h-full">
        {/* Inner white card panel */}
        <div className="bg-white rounded-2xl shadow-md h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Item Preview</h3>
            <button 
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedItem ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                    {selectedItem.title || 'Selected Item'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedItem.description || 'No description available.'}
                  </p>
                </div>

                {selectedItem.metadata && (
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-900">Metadata</h5>
                    {Object.entries(selectedItem.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key}:</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedItem.tags && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Tags</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.relatedItems && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Related Items</h5>
                    <div className="space-y-2">
                      {selectedItem.relatedItems.map((item, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-600">{item.type}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Item Selected</h4>
                <p className="text-gray-600">Select an item to view its details and related information.</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {selectedItem && (
            <div className="p-6 border-t border-gray-100">
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-sm font-medium">
                  View Full Details
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Add to Collection
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Share Item
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContextPanel;
