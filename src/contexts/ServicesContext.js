import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ServicesContext = createContext();

export const ServicesProvider = ({ children }) => {
  const [totalBookings, setTotalBookings] = useState(0);
  const [mostBookedServices, setMostBookedServices] = useState([]);
  const [totalBookingAmount, setTotalBookingAmount] = useState(0);
  const [serviceTypeMonthlyBookings, setServiceTypeMonthlyBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL;
  const SERVICE_BOOKINGS_API_URL = `${API_URL}/api/service_bookings`;

useEffect(() => {
  const fetchServiceStats = async () => {
    setLoading(true);
    try {
      const [
        totalBookingsRes,
        mostBookedServicesRes,
        totalBookingAmountRes,
        serviceTypeMonthlyRes,
      ] = await Promise.all([
        axios.get(`${SERVICE_BOOKINGS_API_URL}/total-bookings?paymentStatus=Success`),
        axios.get(`${SERVICE_BOOKINGS_API_URL}/most-booked-services?paymentStatus=Success`),
        axios.get(`${SERVICE_BOOKINGS_API_URL}/total-booking-amount?paymentStatus=Success`),
        axios.get(`${SERVICE_BOOKINGS_API_URL}/stats/service-types-monthly?paymentStatus=Success`),
      ]);

      setTotalBookings(totalBookingsRes.data.totalBookings);
      setMostBookedServices(mostBookedServicesRes.data.mostBookedServices);
      setTotalBookingAmount(totalBookingAmountRes.data.totalBookingAmount);
      setServiceTypeMonthlyBookings(serviceTypeMonthlyRes.data.serviceTypeMonthlyBookings);
      setError(null);
    } catch (err) {
      console.error('Error fetching service stats:', err);
      setError(err.message || 'An error occurred while fetching service stats.');
    } finally {
      setLoading(false);
    }
  };

  fetchServiceStats();
}, []);

  return (
    <ServicesContext.Provider
      value={{
        totalBookings,
        mostBookedServices,
        totalBookingAmount,
        serviceTypeMonthlyBookings,
        loading,
        error,
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
};
