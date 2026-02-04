import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const EVENTS_API_URL = `${API_URL}/api/events`;

export const EventsContext = createContext();

export const EventsProvider = ({ children }) => {
  const [highestSellingEvents, setHighestSellingEvents] = useState([]);
  const [eventCategoryTicketSales, setEventCategoryTicketSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventStats = async () => {
      try {
        const [topEventsRes, eventCategoryRes] = await Promise.all([
          axios.get(`${EVENTS_API_URL}/highest-selling?paymentStatus=Success`),
          axios.get(`${EVENTS_API_URL}/stats/by-event-category?paymentStatus=Success`),
        ]);

        setHighestSellingEvents(topEventsRes.data);
        setEventCategoryTicketSales(eventCategoryRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch event stats');
        setLoading(false);
      }
    };

    fetchEventStats();
  }, []);

  return (
    <EventsContext.Provider
      value={{
        highestSellingEvents,
        eventCategoryTicketSales,
        loading,
        error,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};
