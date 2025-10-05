import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import dataService from '../services/dataService';
import apiService from '../services/apiService';

// Function to render markdown-formatted summary as HTML
const renderMarkdownSummary = (text) => {
  if (!text) return null;
  
  const parseInlineBold = (lineText) => {
    const parts = [];
    let lastIndex = 0;
    lineText.replace(/\*\*(.*?)\*\*/g, (match, p1, offset) => {
      if (offset > lastIndex) {
        parts.push(lineText.substring(lastIndex, offset));
      }
      parts.push(<strong key={`bold-${offset}`} className="text-purple-900 font-semibold">{p1}</strong>);
      lastIndex = offset + match.length;
      return ''; // Replace to ensure correct offset for next match
    });
    if (lastIndex < lineText.length) {
      parts.push(lineText.substring(lastIndex));
    }
    return parts;
  };

  const lines = text.split('\n');
  const elements = [];
  let currentParagraph = [];
  let currentList = [];
  let listType = null;
  
  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === 'ul') {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc list-inside mb-4 space-y-1">
            {currentList}
          </ul>
        );
      } else if (listType === 'ol') {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal list-inside mb-4 space-y-1">
            {currentList}
          </ol>
        );
      }
      currentList = [];
      listType = null;
    }
  };
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('## ')) {
      // Main title (##)
      flushList();
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${index}`} className="text-gray-700 leading-relaxed mb-4">
            {parseInlineBold(currentParagraph.join(' '))}
          </p>
        );
        currentParagraph = [];
      }
      elements.push(
        <h2 key={`h2-${index}`} className="text-2xl font-bold text-purple-900 mb-6 mt-2">
          {parseInlineBold(trimmed.substring(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      // Section headers (###)
      flushList();
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${index}`} className="text-gray-700 leading-relaxed mb-4">
            {parseInlineBold(currentParagraph.join(' '))}
          </p>
        );
        currentParagraph = [];
      }
      elements.push(
        <h3 key={`h3-${index}`} className="text-xl font-semibold text-purple-800 mb-4 mt-2">
          {parseInlineBold(trimmed.substring(4))}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      // Bullet points
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${index}`} className="text-gray-700 leading-relaxed mb-4">
            {parseInlineBold(currentParagraph.join(' '))}
          </p>
        );
        currentParagraph = [];
      }
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      currentList.push(
        <li key={`li-${index}`} className="text-gray-700">
          {parseInlineBold(trimmed.substring(2))}
        </li>
      );
    } else if (trimmed.match(/^\d+\.\s/)) {
      // Numbered lists
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${index}`} className="text-gray-700 leading-relaxed mb-4">
            {parseInlineBold(currentParagraph.join(' '))}
          </p>
        );
        currentParagraph = [];
      }
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentList.push(
        <li key={`li-${index}`} className="text-gray-700">
          {parseInlineBold(trimmed.substring(trimmed.indexOf('.') + 1).trim())}
        </li>
      );
    } else if (trimmed === '') {
      // Empty line, end current paragraph and flush list
      flushList();
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${index}`} className="text-gray-700 leading-relaxed mb-4">
            {parseInlineBold(currentParagraph.join(' '))}
          </p>
        );
        currentParagraph = [];
      }
    } else {
      // Regular paragraph text
      flushList();
      currentParagraph.push(trimmed);
    }
  });
  
  // Flush any remaining list or paragraph
  flushList();

  // Add any remaining paragraph
  if (currentParagraph.length > 0) {
    elements.push(
      <p key={`p-final`} className="text-gray-700 leading-relaxed mb-4">
        {parseInlineBold(currentParagraph.join(' '))}
      </p>
    );
  }
  return <div className="markdown-content">{elements}</div>;
};

const PublicationDetail = () => {
  const { id } = useParams();
  const [showSources, setShowSources] = useState(false);
  const [publication, setPublication] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    const run = async () => {
      await dataService.loadPublications();
      const transformed = dataService.transformPublicationsForSearch(dataService.publications);
      const decoded = decodeURIComponent(id);
      const found = transformed.find(p => p.title === decoded || p.pub_id === decoded);
      setPublication(found || null);
    };
    run();
  }, [id]);

  const handleSummarize = async () => {
    if (!publication) return;
    
    setLoadingSummary(true);
    setSummaryError(null);
    
    try {
      const result = await apiService.summarizePaper(publication.title);
      setSummary(result.summary);
    } catch (error) {
      console.error('Summarization error:', error);
      setSummaryError(error.message || 'Failed to generate summary');
    } finally {
      setLoadingSummary(false);
    }
  };

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
              <button 
                onClick={() => {
                  if (publication.link) {
                    const pdfUrl = publication.link.endsWith('/') 
                      ? `${publication.link}pdf` 
                      : `${publication.link}/pdf`;
                    window.open(pdfUrl, '_blank');
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors"
              >
                View PDF
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
                  <button 
                    onClick={handleSummarize}
                    disabled={loadingSummary}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingSummary ? 'Generating...' : 'Summarize'}
                  </button>
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none text-gray-700 mb-4">
                {loadingSummary && (
                  <div className="flex items-center space-x-2 text-purple-600">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating AI summary...</span>
                  </div>
                )}
                
                {!loadingSummary && summaryError && (
                  <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                    <p className="font-medium">Error generating summary</p>
                    <p className="text-sm">{summaryError}</p>
                  </div>
                )}
                
                {!loadingSummary && !summaryError && summary && (
                  <div className="markdown-content">
                    {renderMarkdownSummary(summary)}
                  </div>
                )}
                
                {!loadingSummary && !summaryError && !summary && (
                  <p className="text-gray-500">Click "Summarize" button to generate an AI summary of this publication using data from the paper's abstract, introduction, methods, results, and conclusion.</p>
                )}
              </div>
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
