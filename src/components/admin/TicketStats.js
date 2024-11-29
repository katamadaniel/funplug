import React, { useContext, useState, useEffect } from 'react';
import { TicketsContext } from '../../contexts/TicketsContext';
import { Typography, Box, CircularProgress } from '@mui/material';

const TicketStats = () => {
  const { totalTicketsWeekly, totalTicketsMonthly } = useContext(TicketsContext);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assuming TicketsContext fetches the data and sets the context values
    // Simulate data fetching delay
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      setLoading(false); // Set loading to false after data is fetched
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Typography variant="h6">Total Tickets Sold (Weekly)</Typography>
      <Typography variant="h4">{totalTicketsWeekly}</Typography>
      <Typography variant="h6">Total Tickets Sold (Monthly)</Typography>
      <Typography variant="h4">{totalTicketsMonthly}</Typography>
    </div>
  );
};

export default TicketStats;
