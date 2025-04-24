import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const EVENTS_API_URL = `${API_URL}/api/events`;

export const EventsContext = createContext();

export const EventsProvider = ({ children }) => {
  const [highestSellingEvents, setHighestSellingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHighestSellingEvents = async () => {
      try {
        const response = await axios.get(`${EVENTS_API_URL}/highest-selling`);
        setHighestSellingEvents(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch events');
        setLoading(false);
      }
    };

    fetchHighestSellingEvents();
  }, []);

  return (
    <EventsContext.Provider value={{ highestSellingEvents, loading, error }}>
      {children}
    </EventsContext.Provider>
  );
};
