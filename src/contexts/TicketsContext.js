import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

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
    let mounted = true;

    const fetchTicketsData = async () => {
      try {
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
          axios.get(`${TICKET_PURCHASES_API_URL}/total/weekly?paymentStatus=Success`),
          axios.get(`${TICKET_PURCHASES_API_URL}/total/monthly?paymentStatus=Success`),
          axios.get(`${TICKET_PURCHASES_API_URL}/total/daily?paymentStatus=Success`),
          axios.get(`${TICKET_PURCHASES_API_URL}/trend/yearly?paymentStatus=Success`),

          axios.get(`${TICKET_PURCHASES_API_URL}/revenue/weekly?paymentStatus=Success`),
          axios.get(`${TICKET_PURCHASES_API_URL}/revenue/monthly?paymentStatus=Success`),
          axios.get(`${TICKET_PURCHASES_API_URL}/revenue/daily?paymentStatus=Success`),
          axios.get(`${TICKET_PURCHASES_API_URL}/revenue/trend/yearly?paymentStatus=Success`),
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
  }, []);

  return (
    <TicketsContext.Provider value={state}>
      {children}
    </TicketsContext.Provider>
  );
};
