import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const USERS_API_URL = `${API_URL}/api/users`;

export const UsersContext = createContext();

/* ===== Helpers ===== */
const toNumber = (v) => Number(v) || 0;
const toArray = (v) => (Array.isArray(v) ? v : []);

export const UsersProvider = ({ children }) => {
  const [state, setState] = useState({
    totalUsers: 0,
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0,

    dailyTrend: [],
    weeklyTrend: [],
    monthlyTrend: [],

    highestSellingUsers: [],

    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        setState(s => ({ ...s, loading: true, error: null }));

        const [
          total,
          daily,
          weekly,
          monthly,
          dailyTrend,
          weeklyTrend,
          monthlyTrend,
          highestSelling,
        ] = await Promise.all([
          axios.get(`${USERS_API_URL}/total`),
          axios.get(`${USERS_API_URL}/active/daily`),
          axios.get(`${USERS_API_URL}/active/weekly`),
          axios.get(`${USERS_API_URL}/active/monthly`),
          axios.get(`${USERS_API_URL}/active/daily-trend`),
          axios.get(`${USERS_API_URL}/active/weekly-trend`),
          axios.get(`${USERS_API_URL}/active/monthly-trend`),
          axios.get(`${USERS_API_URL}/highest-selling`),
        ]);

        if (!mounted) return;

        setState({
          totalUsers: toNumber(total.data?.count),
          dailyActiveUsers: toNumber(daily.data?.count),
          weeklyActiveUsers: toNumber(weekly.data?.count),
          monthlyActiveUsers: toNumber(monthly.data?.count),

          dailyTrend: toArray(dailyTrend.data),
          weeklyTrend: toArray(weeklyTrend.data),
          monthlyTrend: toArray(monthlyTrend.data),

          highestSellingUsers: toArray(highestSelling.data?.users),

          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('UsersContext error:', err);
        if (!mounted) return;

        setState(s => ({
          ...s,
          loading: false,
          error: 'Failed to load user statistics',
        }));
      }
    };

    fetchAll();
    return () => { mounted = false; };
  }, []);

  return (
    <UsersContext.Provider value={state}>
      {children}
    </UsersContext.Provider>
  );
};
