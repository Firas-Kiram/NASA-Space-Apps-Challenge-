import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import searchService from '../services/searchService';

const Header = ({ onToggleContextPanel, showContextToggle = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const { logout, user } = useAuth();

  // Load publications when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        await searchService.loadPublications();
      } catch (error) {
        console.error('Failed to load publications for search:', error);
      }
    };
    loadData();
  }, []);

  // Handle search input changes
  const handleSearchChange = async (value) => {
    setSearchQuery(value);
    
    if (value.length >= 2) {
      setLoading(true);
      try {
        const newSuggestions = searchService.getSearchSuggestions(value, 5);
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error getting suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

      // Handle suggestion selection
      const handleSuggestionSelect = (suggestion) => {
        setSearchQuery(suggestion.title);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        
        if (suggestion.type === 'publication') {
          navigate(`/publication/${encodeURIComponent(suggestion.title)}`);
        }
      };

      // (removed PDF modal handling)

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-18">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left: Small Logo */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-3 group" aria-label="Go to dashboard">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:opacity-90 transition-opacity">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5.5a1 1 0 10-2 0V12a1 1 0 00.293.707l3 3a1 1 0 101.414-1.414L13 11.586V7.5z" />
              </svg>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">NASA Bioscience</h1>
            </div>
          </Link>
        </div>

        {/* Center/Left: Global Search Input */}
        <div className="flex-1 max-w-2xl mx-6">
          <div className="relative" ref={suggestionsRef}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search publications, authors, experiments..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all duration-200"
              autoComplete="off"
            />
            
            {/* Loading indicator and results count */}
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-2">
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              )}
              {!loading && suggestions.length > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {suggestions.length} found
                </span>
              )}
            </div>

            {/* Search suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-purple-50 transition-colors ${
                      index === selectedIndex ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {suggestion.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-gray-500">
                            Publication
                          </p>
                          <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <p className="text-xs text-red-500 font-medium">
                            Click to view PDF
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Footer with search hint */}
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                  <p className="text-xs text-gray-500">
                    Press <kbd className="px-1 py-0.5 text-xs bg-gray-200 rounded">Enter</kbd> to search, 
                    <kbd className="px-1 py-0.5 text-xs bg-gray-200 rounded ml-1">↑↓</kbd> to navigate, 
                    <kbd className="px-1 py-0.5 text-xs bg-gray-200 rounded ml-1">Esc</kbd> to close
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Context Panel Toggle, Notifications, User Avatar, Role Selector */}
        <div className="flex items-center space-x-3">
          {/* Context Panel Toggle */}
          {showContextToggle && (
            <button 
              onClick={onToggleContextPanel}
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg transition-colors"
              title="Toggle Context Panel"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </button>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h0z" />
              </svg>
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">3</span>
              </span>
            </button>
            
            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-gray-50">
                    <p className="text-sm text-gray-900">New publication added to Astrobiology</p>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50">
                    <p className="text-sm text-gray-900">Research gap analysis completed</p>
                    <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-gray-50">
                    <p className="text-sm text-gray-900">Weekly report is ready</p>
                    <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-sm font-medium text-white">
              {user ? user.name.charAt(0) : 'U'}
            </span>
          </div>

          {/* Role Selector Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg transition-colors"
            >
              <span className="hidden sm:block">{user ? user.role : 'Researcher'}</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Role selector dropdown */}
            {showRoleSelector && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user ? user.name : 'User'}</p>
                  <p className="text-xs text-gray-500">{user ? user.email : 'user@nasa.gov'}</p>
                </div>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Researcher
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Administrator
                </button>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Analyst
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Settings
                  </button>
                  <button 
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* PDF modal removed; navigation to detail page instead */}
    </>
  );
};

export default Header;