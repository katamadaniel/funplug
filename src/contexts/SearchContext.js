import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const SearchContext = createContext();

const EVENTS_API_URL = 'http://localhost:5000/api/events';
const USERS_API_URL = 'http://localhost:5000/api/users';
const VENUES_API_URL = 'http://localhost:5000/api/venues';
const USER_PROFILE_API_URL = 'http://localhost:5000/api/search/user';

export const SearchProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState(null);
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);

  // General search function for users, events, and venues
  const search = async (query) => {
    setSearchQuery(query);
    try {
      const [usersResponse, eventsResponse, venuesResponse] = await Promise.all([
        axios.get(`${USERS_API_URL}?username=${query}`),
        axios.get(`${EVENTS_API_URL}?title=${query}`),
        axios.get(`${VENUES_API_URL}?name=${query}`),
      ]);

      const results = [
        ...usersResponse.data.map(user => ({ ...user, type: 'user' })),
        ...eventsResponse.data.map(event => ({ ...event, type: 'event' })),
        ...venuesResponse.data.map(venue => ({ ...venue, type: 'venue' })),
      ];

      setSearchResults(results);
      setSearchError(null);
    } catch (error) {
      console.error('Error fetching search results:', error.message);
      setSearchError(error.message);
    }
  };

  // Fetch a user's profile and events by user ID
  const fetchUserProfile = async (userId) => {
    try {
      const response = await axios.get(`${USER_PROFILE_API_URL}/${userId}`);
      setUser(response.data.user);
      setEvents(response.data.events); // Populate the events associated with the user
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      setSearchError(error.message);
    }
  };

  return (
    <SearchContext.Provider 
      value={{ 
        searchResults, 
        setSearchResults, 
        searchQuery,
        searchError, 
        search, 
        fetchUserProfile, 
        user, 
        events
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

// Hook to access SearchContext
export const useSearch = () => useContext(SearchContext);
