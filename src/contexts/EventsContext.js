import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const EventsContext = createContext();

export const EventsProvider = ({ children }) => {
  const [highestSellingEvents, setHighestSellingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHighestSellingEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events/highest-selling');
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
