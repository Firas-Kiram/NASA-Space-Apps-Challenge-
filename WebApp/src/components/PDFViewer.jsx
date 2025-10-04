import React, { useState, useEffect } from 'react';

const PDFViewer = ({ pdfUrl, title, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localPdfPath, setLocalPdfPath] = useState(null);

  // Download PDF when component mounts
  useEffect(() => {
    const downloadPDF = async () => {
      setLoading(true);
      setError(null);

      // Build candidate URLs
      const baseUrl = pdfUrl || '';
      const withPdf = baseUrl.endsWith('/pdf') ? baseUrl : (baseUrl.endsWith('/') ? `${baseUrl}pdf` : `${baseUrl}/pdf`);
      const pmcMatch = baseUrl.match(/PMC\d+/);
      const pmcId = pmcMatch ? pmcMatch[0] : null;
      const candidates = [
        withPdf,
        pmcId ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcId}/pdf/${pmcId}.pdf` : null,
        pmcId ? `https://pmc.ncbi.nlm.nih.gov/articles/${pmcId}/pdf/${pmcId}.pdf` : null
      ].filter(Boolean);

      try {
        console.log('PDF download candidates:', candidates);
        let success = false;
        for (const cand of candidates) {
          try {
            const resp = await fetch(`http://localhost:3000/api/download-pdf?url=${encodeURIComponent(cand)}`);
            let data;
            try { data = await resp.json(); } catch { data = {}; }
            if (resp.ok && data && data.success && data.localPath) {
              console.log('PDF downloaded successfully:', data.localPath);
              setLocalPdfPath(`http://localhost:3000${data.localPath}`);
              success = true;
              break;
            } else {
              console.warn('Download attempt failed:', resp.status, data && data.error);
            }
          } catch (e) {
            console.warn('Attempt error:', e);
          }
        }
        if (!success) {
          throw new Error('Failed to download PDF');
        }
      } catch (err) {
        console.error('Error downloading PDF:', err);
        setError(err.message || 'Failed to download PDF');
      } finally {
        setLoading(false);
      }
    };

    if (pdfUrl) {
      downloadPDF();
    }
  }, [pdfUrl]);

  // Handle keyboard events (ESC to close)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleOpenInNewTab = () => {
    if (localPdfPath) {
      window.open(localPdfPath, '_blank');
    }
  };

  const handleDownload = () => {
    if (localPdfPath) {
      const link = document.createElement('a');
      link.href = localPdfPath;
      link.download = `${title || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {title || 'PDF Document'}
              </h2>
              <p className="text-sm text-gray-500">PubMed Central Article</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download PDF"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            
            {/* Open in New Tab Button */}
            <button
              onClick={handleOpenInNewTab}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Open in New Tab"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close (ESC)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 relative bg-gray-100">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Downloading PDF...</p>
                <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the document</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load PDF</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={onClose}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {!loading && !error && localPdfPath && (
            <iframe
              src={localPdfPath}
              className="w-full h-full border-0"
              title="PDF Viewer"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-3">
              {localPdfPath && (
                <>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Loaded from local server
                  </span>
                  <span>•</span>
                  <span>Source: PubMed Central</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-gray-200 px-2 py-1 rounded">Press ESC to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;

