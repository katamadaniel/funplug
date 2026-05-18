import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';

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
    const adminToken = localStorage.getItem('adminToken');
    const fetchVenueStats = async () => {
      // Only fetch if admin is logged in
      if (!adminToken) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [
          totalBookingsRes,
          mostBookedVenuesRes,
          totalBookingAmountRes,
          venueTypeMonthlyRes,
        ] = await Promise.all([
          axiosInstance.get(`${VENUE_BOOKINGS_API_URL}/total-bookings?paymentStatus=Success`),
          axiosInstance.get(`${VENUE_BOOKINGS_API_URL}/most-booked-venues?paymentStatus=Success`),
          axiosInstance.get(`${VENUE_BOOKINGS_API_URL}/total-booking-amount?paymentStatus=Success`),
          axiosInstance.get(`${VENUE_BOOKINGS_API_URL}/stats/venue-types-monthly?paymentStatus=Success`),
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
  }, [localStorage.getItem('adminToken')]);

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
