import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const SearchContext = createContext();
const API_URL = process.env.REACT_APP_API_URL;

const USERS_API_URL = `${API_URL}/api/users`;
const EVENTS_API_URL = `${API_URL}/api/events`;
const VENUES_API_URL = `${API_URL}/api/venues`;
const PERFORMANCE_API_URL = `${API_URL}/api/performances`;
const SERVICES_API_URL = `${API_URL}/api/services`;
const USER_PROFILE_API_URL = `${API_URL}/api/search/user`;

export const SearchProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState(null);
  const [nearMe, setNearMe] = useState(false);

  const [user, setUser] = useState(null);
  const [userCollections, setUserCollections] = useState({
    events: [],
    venues: [],
    performances: [],
    services: [],
  });

const search = async (query = "") => {
  setSearchQuery(query);
  setSearchError(null);

  try {
    let results = [];

    // ===============================
    // 📍 NEAR ME SEARCH
    // ===============================
    if (nearMe) {
      const loc = await getUserLocationWithFallback();

      const params = {
        ...(loc.lat && { lat: loc.lat }),
        ...(loc.lng && { lng: loc.lng }),
        ...(loc.city && { city: loc.city }),
        ...(loc.country && { country: loc.country }),
        radius: 100,
      };

      const [events, venues, performances, services] = await Promise.all([
        axios.get(`${API_URL}/api/search/nearby/event`, { params }),
        axios.get(`${API_URL}/api/search/nearby/venue`, { params }),
        axios.get(`${API_URL}/api/search/nearby/performance`, { params }),
        axios.get(`${API_URL}/api/search/nearby/service`, { params }),
      ]);

      results = [
        ...events.data.map(e => ({ ...e, type: "event" })),
        ...venues.data.map(v => ({ ...v, type: "venue" })),
        ...performances.data.map(p => ({ ...p, type: "performance" })),
        ...services.data.map(s => ({ ...s, type: "service" })),
      ];
    }

    // ===============================
    // 🔎 NORMAL TEXT SEARCH
    // ===============================
    else {
      const [
        usersResponse,
        eventsResponse,
        venuesResponse,
        performanceResponse,
        serviceResponse
      ] = await Promise.all([
        axios.get(`${USERS_API_URL}?username=${query}`),
        axios.get(`${EVENTS_API_URL}?title=${query}`),
        axios.get(`${VENUES_API_URL}?name=${query}`),
        axios.get(`${PERFORMANCE_API_URL}?artType=${query}`),
        axios.get(`${SERVICES_API_URL}?serviceType=${query}`)
      ]);

      results = [
        ...usersResponse.data.map(u => ({ ...u, type: "user" })),
        ...eventsResponse.data.map(e => ({ ...e, type: "event" })),
        ...venuesResponse.data.map(v => ({ ...v, type: "venue" })),
        ...performanceResponse.data.map(p => ({ ...p, type: "performance" })),
        ...serviceResponse.data.map(s => ({ ...s, type: "service" })),
      ];
    }

    setSearchResults(results);
  } catch (error) {
    console.error("Search error:", error);
    setSearchError("Failed to fetch search results");
  }
};

const getUserLocationWithFallback = async () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({});
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      async () => {
        try {
          const res = await axios.get("https://ipapi.co/json/");
          resolve({
            city: res.data.city,
            country: res.data.country_name,
          });
        } catch {
          resolve({});
        }
      },
      { timeout: 7000 }
    );
  });
};

  //USER PROFILE FETCH
  const fetchUserProfile = async (userId) => {
    try {
      const response = await axios.get(`${USER_PROFILE_API_URL}/${userId}`);

      setUser(response.data.user);
      setUserCollections({
        events: response.data.events || [],
        venues: response.data.venues || [],
        performances: response.data.performances || [],
        services: response.data.services || [],
      });

    } catch (err) {
      console.error("Error fetching user profile:", err);
      setSearchError("Profile fetch error");
    }
  };

  return (
          <SearchContext.Provider
            value={{
              searchResults,
              searchQuery,
              searchError,
              search,
              nearMe,
              setNearMe,
              fetchUserProfile,
              user,
              userCollections,
            }}
          >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
