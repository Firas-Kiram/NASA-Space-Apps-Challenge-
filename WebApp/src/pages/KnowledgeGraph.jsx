import React, { useState } from 'react';
import Layout from '../components/Layout';

const KnowledgeGraph = () => {
  const [frameKey, setFrameKey] = useState(0);
  return (
    <Layout>
      {/* Full-page iframe under header and beside sidebar */}
      <div className="fixed top-18 bottom-0 left-0 lg:left-72 right-0 bg-gray-50">
        {/* Top toolbar over the iframe area */}
        <div className="h-12 px-4 flex items-center justify-between bg-white border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-gray-900">Knowledge Graph Explorer</span>
            <span className="hidden sm:inline text-xs text-gray-500">Embedded view</span>
          </div>
          <div className="flex items-center space-x-2">
              <button 
              onClick={() => setFrameKey(k => k + 1)}
              className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Refresh
            </button>
          </div>
        </div>
        {/* Iframe fills remaining height */}
        <iframe
          key={frameKey}
          src="https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/d7d05d265e01af9fd9015f69519912d3/14e78d75-870f-4455-b7ed-f8c80d83adf7/index.html"
          title="Knowledge Graph"
          className="w-full block"
          style={{ height: 'calc(100% - 3rem)' }}
          frameBorder="0"
          allowFullScreen
        />
      </div>
    </Layout>
  );
};

export default KnowledgeGraph;
