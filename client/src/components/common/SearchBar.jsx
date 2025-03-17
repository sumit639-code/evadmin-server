import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Categories for search
  const categories = [
    { name: 'Riders', path: '/rider' },
    { name: 'Rentals', path: '/rental' },
    { name: 'Earnings', path: '/earnings' },
    { name: 'Incentives', path: '/incentive' }
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    // Click outside handler
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;

    // Save to recent searches
    const newRecentSearches = [
      searchTerm,
      ...recentSearches.filter(s => s !== searchTerm)
    ].slice(0, 5);

    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    // Mock search results - replace with actual API call
    const results = categories.map(category => ({
      ...category,
      results: [
        { id: 1, title: `${searchTerm} result 1 in ${category.name}` },
        { id: 2, title: `${searchTerm} result 2 in ${category.name}` }
      ]
    })).filter(cat => cat.results.length > 0);

    setSearchResults(results);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const navigateToResult = (path) => {
    navigate(path);
    setShowResults(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
        <FiSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onKeyPress={handleKeyPress}
          placeholder="Search..."
          className="bg-transparent outline-none w-64"
        />
        {query && (
          <button onClick={clearSearch} className="text-gray-500 hover:text-gray-700">
            <FiX />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border p-2 z-50">
          {query && searchResults.length > 0 ? (
            // Search Results
            <div className="space-y-4">
              {searchResults.map((category, index) => (
                <div key={index}>
                  <h3 className="text-sm font-medium text-gray-500 px-3 mb-1">
                    {category.name}
                  </h3>
                  {category.results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => navigateToResult(category.path)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded"
                    >
                      <span className="text-sm">{result.title}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            // Recent Searches
            <div>
              <h3 className="text-sm font-medium text-gray-500 px-3 mb-2">
                Recent Searches
              </h3>
              {recentSearches.length > 0 ? (
                recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search);
                      handleSearch(search);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center"
                  >
                    <FiSearch className="text-gray-400 mr-2" />
                    <span className="text-sm">{search}</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500 px-3 py-2">No recent searches</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
