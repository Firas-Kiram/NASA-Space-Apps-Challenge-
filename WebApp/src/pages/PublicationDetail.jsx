import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import dataService from '../services/dataService';

const PublicationDetail = () => {
  const { id } = useParams();
  const [showSources, setShowSources] = useState(false);
  const [publication, setPublication] = useState(null);

  useEffect(() => {
    const run = async () => {
      await dataService.loadPublications();
      const transformed = dataService.transformPublicationsForSearch(dataService.publications);
      // Match by title param (encoded) or fallback by id if available
      const decoded = decodeURIComponent(id);
      const found = transformed.find(p => p.title === decoded || p.pub_id === decoded);
      setPublication(found || null);
    };
    run();
  }, [id]);

  if (!publication) {
    return (
      <Layout>
        <div className="p-8">Loading publication…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Big Header Card */}
        <div className="bg-white rounded-2xl p-8 shadow-md">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {publication.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                <span className="font-medium">{Array.isArray(publication.authors) ? publication.authors.join(', ') : 'N/A'}</span>
                <span>•</span>
                <span>{publication.journal || 'N/A'}</span>
                <span>•</span>
                <span>{publication.year || 'N/A'}</span>
                <span>•</span>
                <span>{publication.citations || 0} citations</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {publication.tags && publication.tags[0] ? publication.tags[0] : 'Research'}
                </span>
                <span className="text-sm text-gray-500">PubMed Central</span>
              </div>
            </div>
            <div className="flex space-x-3 ml-6">
              <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors">
                Download PDF
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Cite
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Share
              </button>
            </div>
          </div>

          {/* Dataset Links - removed for real data */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Card with Provenance */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">AI-Generated Summary</h2>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    High Confidence
                  </span>
                  <button 
                    onClick={() => setShowSources(!showSources)}
                    className="px-3 py-1 text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    {showSources ? 'Hide Sources' : 'Show Sources'}
                  </button>
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none text-gray-700 mb-4">
                <p>{publication.summary || 'Click "Summarize" button to generate an AI summary of this publication.'}</p>
              </div>

              {showSources && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Source Evidence</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <span className="text-sm text-gray-600">Section 3.2: "Cellulose content decreased by 15% ± 2.3%"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <span className="text-sm text-gray-600">Section 3.4: "Pectin levels showed significant increase (23% ± 1.8%)"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <span className="text-sm text-gray-600">Discussion: "Structural adaptations indicate cellular response mechanisms"</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section Viewer - removed temporarily, will be implemented later */}
          </div>

          {/* Right Column: Dataset Viewer */}
          <div className="space-y-6">
            {/* Citation Metrics */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Citation Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Citations</span>
                  <span className="font-medium">{publication.citations || 0}</span>
                </div>
              </div>
            </div>

            {/* Related Publications */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Publications</h3>
              <div className="space-y-4">
                {[
                  { title: "Gravitational Effects on Plant Growth", citations: 45 },
                  { title: "Space Agriculture Systems", citations: 32 },
                  { title: "Microgravity Cell Biology", citations: 28 }
                ].map((related, index) => (
                  <div key={index} className="border-l-4 border-purple-200 pl-4">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{related.title}</h4>
                    <p className="text-xs text-gray-500">{related.citations} citations</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Add to Reading List
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Compare with Similar
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Export Citation
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Request Full Access
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PublicationDetail;
