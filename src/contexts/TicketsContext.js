import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

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
        const weeklyResponse = await axios.get('http://localhost:5000/api/ticket_purchases/total/weekly');
        setTotalTicketsWeekly(weeklyResponse.data);

        // Fetch total tickets sold monthly
        const monthlyResponse = await axios.get('http://localhost:5000/api/ticket_purchases/total/monthly');
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
