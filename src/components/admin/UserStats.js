import React, { useContext, useState, useEffect } from 'react';
import { UsersContext } from '../../contexts/UsersContext';
import { Typography, Box, List, ListItem, ListItemText, CircularProgress } from '@mui/material';

const UserStats = () => {
  const { totalUsers, dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers, highestSellingUsers } = useContext(UsersContext);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assuming UsersContext fetches the data and sets the context values
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
    <Box>
      <Typography variant="h6">Total Users</Typography>
      <Typography variant="h4">{totalUsers}</Typography>

      <Typography variant="h6" mt={2}>Daily Active Users</Typography>
      <Typography variant="h4">{dailyActiveUsers}</Typography>

      <Typography variant="h6" mt={2}>Weekly Active Users</Typography>
      <Typography variant="h4">{weeklyActiveUsers}</Typography>

      <Typography variant="h6" mt={2}>Monthly Active Users</Typography>
      <Typography variant="h4">{monthlyActiveUsers}</Typography>

      <Typography variant="h6" mt={2}>Highest Selling Users</Typography>
      <List>
        {highestSellingUsers.map((user, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={`${user.username}`}
              secondary={`Tickets Sold: ${user.totalTicketCount}, Venues Booked: ${user.totalBookingCount}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default UserStats;
