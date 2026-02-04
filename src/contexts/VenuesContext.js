import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const VenuesContext = createContext();

export const VenuesProvider = ({ children }) => {
  const [totalBookings, setTotalBookings] = useState(0);
  const [mostBookedVenues, setMostBookedVenues] = useState([]);
  const [totalBookingAmount, setTotalBookingAmount] = useState(0);
  const [venueTypeMonthlyBookings, setVenueTypeMonthlyBookings] = useState([]);

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
          venueTypeMonthlyRes,
        ] = await Promise.all([
          axios.get(`${VENUE_BOOKINGS_API_URL}/total-bookings?paymentStatus=Success`),
          axios.get(`${VENUE_BOOKINGS_API_URL}/most-booked-venues?paymentStatus=Success`),
          axios.get(`${VENUE_BOOKINGS_API_URL}/total-booking-amount?paymentStatus=Success`),
          axios.get(`${VENUE_BOOKINGS_API_URL}/stats/venue-types-monthly?paymentStatus=Success`),
        ]);

        setTotalBookings(totalBookingsRes.data.totalBookings);
        setMostBookedVenues(mostBookedVenuesRes.data.mostBookedVenues);
        setTotalBookingAmount(totalBookingAmountRes.data.totalBookingAmount);
        setVenueTypeMonthlyBookings(
          venueTypeMonthlyRes.data.venueTypeMonthlyBookings
        );

        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error fetching venue stats');
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
        venueTypeMonthlyBookings,
        loading,
        error,
      }}
    >
      {children}
    </VenuesContext.Provider>
  );
};
