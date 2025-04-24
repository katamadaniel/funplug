import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const TICKET_PURCHASES_API_URL = `${API_URL}/api/ticket_purchases`;

export const TicketsContext = createContext();

export const TicketsProvider = ({ children }) => {
  const [totalTicketsWeekly, setTotalTicketsWeekly] = useState(0);
  const [totalTicketsMonthly, setTotalTicketsMonthly] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketsData = async () => {
      try {
        // Fetch total tickets sold weekly
        const weeklyResponse = await axios.get(`${TICKET_PURCHASES_API_URL}/total/weekly`);
        setTotalTicketsWeekly(weeklyResponse.data);

        // Fetch total tickets sold monthly
        const monthlyResponse = await axios.get(`${TICKET_PURCHASES_API_URL}/total/monthly`);
        setTotalTicketsMonthly(monthlyResponse.data);

        setLoading(false); // Set loading to false once data is fetched
      } catch (err) {
        setError('Failed to load ticket data');
        setLoading(false); // Set loading to false if there's an error
      }
    };

    fetchTicketsData();
  }, []);

  return (
    <TicketsContext.Provider
      value={{ totalTicketsWeekly, totalTicketsMonthly, loading, error, setLoading, setError }}
    >
      {children}
    </TicketsContext.Provider>
  );
};
