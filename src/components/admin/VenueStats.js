// components/VenueStats.js

import React, { useContext } from 'react';
import { VenuesContext } from '../../contexts/VenuesContext';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';

const VenueStats = () => {
  const {
    totalBookings,
    mostBookedVenues,
    totalBookingAmount,
    loading,
    error,
  } = useContext(VenuesContext);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box mt={4}>
      {/* Total Bookings */}
      <Typography variant="h5" gutterBottom>
        Total Venue Bookings
      </Typography>
      <Typography variant="h4" color="primary" gutterBottom>
        {totalBookings}
      </Typography>

      {/* Total Booking Amount */}
      <Typography variant="h5" gutterBottom>
        Total Amount from Bookings
      </Typography>
      <Typography variant="h4" color="secondary" gutterBottom>
        Ksh.{totalBookingAmount.toFixed(2)}
      </Typography>

      {/* Most Booked Venues */}
      <Typography variant="h5" gutterBottom>
        Top 10 Most Booked Venues
      </Typography>
      <List>
        {mostBookedVenues.map((venue, index) => (
          <React.Fragment key={venue._id}>
            <ListItem>
              <ListItemText
                primary={`${index + 1}. ${venue.name}`}
                secondary={`Bookings: ${venue.bookingCount}, Total Amount: Ksh.${venue.totalAmount.toFixed(2)}`}
              />
            </ListItem>
            {index < mostBookedVenues.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
        </Box>
  );
};

export default VenueStats;
