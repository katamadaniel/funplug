import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';

export const PerformanceContext = createContext();

export const PerformanceProvider = ({ children }) => {
  const [totalBookings, setTotalBookings] = useState(0);
  const [mostBookedCards, setMostBookedCards] = useState([]);
  const [totalBookingAmount, setTotalBookingAmount] = useState(0);
  const [artTypeMonthlyBookings, setArtTypeMonthlyBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;
  const PERFORMANCE_BOOKINGS_API_URL = `${API_URL}/api/performance_bookings`;

useEffect(() => {
  const adminToken = localStorage.getItem('adminToken');
  const fetchCardStats = async () => {
    // Only fetch if admin is logged in
    if (!adminToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [
        totalBookingsRes,
        mostBookedCardsRes,
        totalBookingAmountRes,
        artTypeMonthlyRes,
      ] = await Promise.all([
        axiosInstance.get(`${PERFORMANCE_BOOKINGS_API_URL}/total-bookings?paymentStatus=Success`),
        axiosInstance.get(`${PERFORMANCE_BOOKINGS_API_URL}/most-booked-cards?paymentStatus=Success`),
        axiosInstance.get(`${PERFORMANCE_BOOKINGS_API_URL}/total-booking-amount?paymentStatus=Success`),
        axiosInstance.get(`${PERFORMANCE_BOOKINGS_API_URL}/stats/art-types-monthly?paymentStatus=Success`),
      ]);

      setTotalBookings(totalBookingsRes.data.totalBookings);
      setMostBookedCards(mostBookedCardsRes.data.mostBookedCards);
      setTotalBookingAmount(totalBookingAmountRes.data.totalBookingAmount);
      setArtTypeMonthlyBookings(artTypeMonthlyRes.data.artTypeMonthlyBookings);
      setError(null);
    } catch (err) {
      console.error('Error fetching performance stats:', err);
      setError(err.message || 'An error occurred while fetching performance stats.');
    } finally {
      setLoading(false);
    }
  };

  fetchCardStats();
}, [localStorage.getItem('adminToken')]);

  return (
    <PerformanceContext.Provider
      value={{
        totalBookings,
        mostBookedCards,
        totalBookingAmount,
        artTypeMonthlyBookings,
        loading,
        error,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
};
