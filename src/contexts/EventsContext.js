import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';

const API_URL = process.env.REACT_APP_API_URL;
const EVENTS_API_URL = `${API_URL}/api/events`;

export const EventsContext = createContext();

export const EventsProvider = ({ children }) => {
  const [highestSellingEvents, setHighestSellingEvents] = useState([]);
  const [eventCategoryTicketSales, setEventCategoryTicketSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const fetchEventStats = async () => {
      try {
        // Only fetch if admin is logged in
        if (!adminToken) {
          setLoading(false);
          return;
        }

        const [topEventsRes, eventCategoryRes] = await Promise.all([
          axiosInstance.get(`${EVENTS_API_URL}/highest-selling?paymentStatus=Success`),
          axiosInstance.get(`${EVENTS_API_URL}/stats/by-event-category?paymentStatus=Success`),
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
  }, [localStorage.getItem('adminToken')]);

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
