// SearchBox.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBox.css';

const SearchBox = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    onSearch(query);
    navigate('/search');
  };

  return (
    <div className="search-box">
      <input 
        type="text" 
        value={query} 
        onChange={handleInputChange} 
        placeholder="Search users or events..." 
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBox;
