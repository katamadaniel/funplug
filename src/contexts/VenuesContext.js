// contexts/VenuesContext.js

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const VenuesContext = createContext();

export const VenuesProvider = ({ children }) => {
  const [totalBookings, setTotalBookings] = useState(0);
  const [mostBookedVenues, setMostBookedVenues] = useState([]);
  const [totalBookingAmount, setTotalBookingAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;
  const VENUE_BOOKINGS_API_URL = `${API_URL}/api/venue_bookings`;

  useEffect(() => {
    const fetchVenueStats = async () => {
      setLoading(true);
      try {
        const [
          totalBookingsRes,
          mostBookedVenuesRes,
          totalBookingAmountRes,
        ] = await Promise.all([
          axios.get(`${VENUE_BOOKINGS_API_URL}/total-bookings`),
          axios.get(`${VENUE_BOOKINGS_API_URL}/most-booked-venues`),
          axios.get(`${VENUE_BOOKINGS_API_URL}/total-booking-amount`),
        ]);

        setTotalBookings(totalBookingsRes.data.totalBookings);
        setMostBookedVenues(mostBookedVenuesRes.data.mostBookedVenues);
        setTotalBookingAmount(totalBookingAmountRes.data.totalBookingAmount);
        setError(null);
      } catch (err) {
        console.error('Error fetching venue stats:', err);
        setError(err.message || 'An error occurred while fetching venue stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchVenueStats();
  }, []);

  return (
    <VenuesContext.Provider
      value={{
        totalBookings,
        mostBookedVenues,
        totalBookingAmount,
        loading,
        error,
      }}
    >
      {children}
    </VenuesContext.Provider>
  );
};
