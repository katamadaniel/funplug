// SearchResults.js
import React from 'react';
import './SearchResults.css';

const SearchResults = ({ results }) => {
  return (
    <div className="search-results">
      {results.length > 0 ? (
        results.map((result, index) => (
          <div key={index} className="search-result-card">
            {result.type === 'user' ? (
              <>
                <img src={result.avatar} alt={result.name} className="result-avatar" />
                <h3>{result.name}</h3>
                <p>{result.details}</p>
              </>
            ) : (
              <>
                <img src={result.image} alt={result.title} className="result-image" />
                <h3>{result.title}</h3>
                <p>{result.description}</p>
                <p><strong>Venue:</strong> {result.venue}</p>
                <p><strong>Date:</strong> {result.date}</p>
                <p><strong>Time:</strong> {result.time}</p>
              </>
            )}
          </div>
        ))
      ) : (
        <p>No results found</p>
      )}
    </div>
  );
};

export default SearchResults;
