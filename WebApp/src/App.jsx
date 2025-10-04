import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import OverviewDashboard from './pages/OverviewDashboard';
import SearchResults from './pages/SearchResults';
import EnhancedSearchResults from './pages/EnhancedSearchResults';
import PublicationDetail from './pages/PublicationDetail';
import KnowledgeGraph from './pages/KnowledgeGraph';
import CompareExperiments from './pages/CompareExperiments';
import InsightsGaps from './pages/InsightsGaps';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <OverviewDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <OverviewDashboard />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <EnhancedSearchResults />
              </ProtectedRoute>
            } />
            <Route path="/search-old" element={
              <ProtectedRoute>
                <SearchResults />
              </ProtectedRoute>
            } />
            <Route path="/publication/:id" element={
              <ProtectedRoute>
                <PublicationDetail />
              </ProtectedRoute>
            } />
            <Route path="/knowledge-graph" element={
              <ProtectedRoute>
                <KnowledgeGraph />
              </ProtectedRoute>
            } />
            <Route path="/compare" element={
              <ProtectedRoute>
                <CompareExperiments />
              </ProtectedRoute>
            } />
            <Route path="/insights" element={
              <ProtectedRoute>
                <InsightsGaps />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;