import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';

const API_URL = process.env.REACT_APP_API_URL;
const TICKET_PURCHASES_API_URL = `${API_URL}/api/ticket_purchases`;

export const TicketsContext = createContext();

/* ===== Helpers ===== */
const toNumber = (v) => Number(v) || 0;
const toArray = (v) => (Array.isArray(v) ? v : []);

export const TicketsProvider = ({ children }) => {
  const [state, setState] = useState({
    totalTicketsWeekly: 0,
    totalTicketsMonthly: 0,
    dailyTicketSales: [],
    yearlyTicketTrend: [],

    totalRevenueWeekly: 0,
    totalRevenueMonthly: 0,
    dailyRevenue: [],
    yearlyRevenueTrend: [],

    loading: true,
    error: null,
  });

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    let mounted = true;

    const fetchTicketsData = async () => {
      try {
        // Only fetch if admin is logged in
        if (!adminToken) {
          if (mounted) {
            setState(s => ({ ...s, loading: false, error: null }));
          }
          return;
        }

        setState(s => ({ ...s, loading: true, error: null }));

        const [
          ticketsWeekly,
          ticketsMonthly,
          ticketsDaily,
          ticketsYearly,
          revenueWeekly,
          revenueMonthly,
          revenueDaily,
          revenueYearly,
        ] = await Promise.all([
          axiosInstance.get(`${TICKET_PURCHASES_API_URL}/total/weekly?paymentStatus=Success`),
          axiosInstance.get(`${TICKET_PURCHASES_API_URL}/total/monthly?paymentStatus=Success`),
          axiosInstance.get(`${TICKET_PURCHASES_API_URL}/total/daily?paymentStatus=Success`),
          axiosInstance.get(`${TICKET_PURCHASES_API_URL}/trend/yearly?paymentStatus=Success`),

          axiosInstance.get(`${TICKET_PURCHASES_API_URL}/revenue/weekly?paymentStatus=Success`),
          axiosInstance.get(`${TICKET_PURCHASES_API_URL}/revenue/monthly?paymentStatus=Success`),
          axiosInstance.get(`${TICKET_PURCHASES_API_URL}/revenue/daily?paymentStatus=Success`),
          axiosInstance.get(`${TICKET_PURCHASES_API_URL}/revenue/trend/yearly?paymentStatus=Success`),
        ]);

        if (!mounted) return;

        setState({
          totalTicketsWeekly: toNumber(ticketsWeekly.data?.total || ticketsWeekly.data),
          totalTicketsMonthly: toNumber(ticketsMonthly.data?.total || ticketsMonthly.data),
          dailyTicketSales: toArray(ticketsDaily.data),
          yearlyTicketTrend: toArray(ticketsYearly.data),

          totalRevenueWeekly: toNumber(revenueWeekly.data?.total || revenueWeekly.data),
          totalRevenueMonthly: toNumber(revenueMonthly.data?.total || revenueMonthly.data),
          dailyRevenue: toArray(revenueDaily.data),
          yearlyRevenueTrend: toArray(revenueYearly.data),

          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('TicketsContext error:', err);
        if (!mounted) return;

        setState(s => ({
          ...s,
          loading: false,
          error: 'Failed to load ticket analytics',
        }));
      }
    };

    fetchTicketsData();
    return () => { mounted = false; };
  }, [localStorage.getItem('adminToken')]);

  return (
    <TicketsContext.Provider value={state}>
      {children}
    </TicketsContext.Provider>
  );
};
