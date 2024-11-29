// SearchBar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { useSearch } from './contexts/SearchContext';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { search } = useSearch();

  useEffect(() => {
    setQuery('');
    setIsExpanded(false);
  }, [location]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    if (query.trim() !== '') {
      search(query); // Update the global search query
      navigate('/searchResults'); // Redirect to search results page
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleSearchBar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`search-bar ${isExpanded ? 'expanded' : ''}`}>
      <FaSearch className="search-icon" onClick={toggleSearchBar} />
      {isExpanded && (
        <>
          <input
            type="text"
            className="search-input"
            value={query}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Search users, events, or venues..."
          />
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </>
      )}
    </div>
  );
};

export default SearchBar;
