import React, { useState } from 'react';
import Layout from '../components/Layout';
import SimpleBarChart from '../components/SimpleBarChart';

const PublicationDetail = () => {
  const [showSources, setShowSources] = useState(false);
  const [activeSection, setActiveSection] = useState('abstract');

  // Mock publication data
  const publication = {
    title: "Effects of Microgravity on Plant Cell Wall Composition and Structural Integrity",
    authors: ["Dr. Sarah Chen", "Dr. Michael Rodriguez", "Dr. Lisa Park", "Dr. James Wilson"],
    year: 2024,
    journal: "Nature Microgravity",
    citations: 23,
    doi: "10.1038/s41526-024-00123-4",
    area: "Plant Biology",
    abstract: "This comprehensive study investigates how microgravity conditions affect the structural composition and integrity of plant cell walls in various species. Through a series of controlled experiments aboard the International Space Station, we analyzed changes in cellulose, hemicellulose, and lignin content over extended periods. Our findings reveal significant alterations in cell wall architecture that have implications for plant growth and development in space environments.",
    fullText: {
      introduction: "Plant cell walls are complex structures that provide mechanical support and protection to plant cells. In terrestrial environments, gravity plays a crucial role in determining cell wall composition and orientation. However, the effects of microgravity on these fundamental structures remain poorly understood...",
      methods: "We conducted experiments using Arabidopsis thaliana and Zea mays specimens grown in specialized growth chambers aboard the ISS. Cell wall composition was analyzed using advanced spectroscopic techniques...",
      results: "Our analysis revealed a 15% reduction in cellulose content and a 23% increase in pectin levels in microgravity-grown specimens compared to ground controls. These changes were accompanied by altered cell wall thickness and modified mechanical properties...",
      discussion: "The observed changes in cell wall composition suggest that plants undergo significant structural adaptations in response to microgravity. These findings have important implications for future space agriculture and long-duration missions..."
    },
    datasets: [
      { name: "Cell Wall Composition Data", size: "2.3 MB", format: "CSV" },
      { name: "Microscopy Images", size: "45.7 MB", format: "TIFF" },
      { name: "Spectroscopic Analysis", size: "8.1 MB", format: "JSON" }
    ],
    citationData: [
      { month: 'Jan', count: 2 },
      { month: 'Feb', count: 4 },
      { month: 'Mar', count: 6 },
      { month: 'Apr', count: 3 },
      { month: 'May', count: 8 }
    ]
  };

  const sections = [
    { id: 'abstract', name: 'Abstract' },
    { id: 'introduction', name: 'Introduction' },
    { id: 'methods', name: 'Methods' },
    { id: 'results', name: 'Results' },
    { id: 'discussion', name: 'Discussion' }
  ];

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
                <span className="font-medium">{publication.authors.join(', ')}</span>
                <span>•</span>
                <span>{publication.journal}</span>
                <span>•</span>
                <span>{publication.year}</span>
                <span>•</span>
                <span>{publication.citations} citations</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {publication.area}
                </span>
                <span className="text-sm text-gray-500">DOI: {publication.doi}</span>
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

          {/* Dataset Links */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Associated Datasets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {publication.datasets.map((dataset, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{dataset.name}</h4>
                    <p className="text-sm text-gray-600">{dataset.size} • {dataset.format}</p>
                  </div>
                  <button className="px-3 py-1 text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
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
                <p>
                  This groundbreaking study reveals that microgravity significantly alters plant cell wall composition, 
                  with a notable 15% reduction in cellulose content and 23% increase in pectin levels. The research 
                  demonstrates critical structural adaptations that plants undergo in space environments, providing 
                  essential insights for future space agriculture initiatives.
                </p>
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

            {/* Section Viewer */}
            <div className="bg-white rounded-2xl shadow-md">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeSection === section.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {section.name}
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="p-6">
                <div className="prose prose-sm max-w-none text-gray-700">
                  {activeSection === 'abstract' && (
                    <p>{publication.abstract}</p>
                  )}
                  {activeSection !== 'abstract' && (
                    <p>{publication.fullText[activeSection]}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dataset Viewer */}
          <div className="space-y-6">
            {/* Citation Metrics */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Citation Metrics</h3>
              <div className="h-32 mb-4">
                <SimpleBarChart 
                  data={publication.citationData} 
                  xKey="month" 
                  yKey="count"
                  color="#7c3aed"
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Citations</span>
                  <span className="font-medium">{publication.citations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">h-index Impact</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Field Ranking</span>
                  <span className="font-medium text-purple-600">Top 15%</span>
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
