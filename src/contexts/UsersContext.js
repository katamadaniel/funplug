import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';

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
    const adminToken = localStorage.getItem('adminToken');
    let mounted = true;

    const fetchAll = async () => {
      try {
        // Only fetch if admin is logged in
        if (!adminToken) {
          if (mounted) {
            setState(s => ({
              ...s,
              loading: false,
              error: null,
            }));
          }
          return;
        }

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
          axiosInstance.get(`${USERS_API_URL}/total`),
          axiosInstance.get(`${USERS_API_URL}/active/daily`),
          axiosInstance.get(`${USERS_API_URL}/active/weekly`),
          axiosInstance.get(`${USERS_API_URL}/active/monthly`),
          axiosInstance.get(`${USERS_API_URL}/active/daily-trend`),
          axiosInstance.get(`${USERS_API_URL}/active/weekly-trend`),
          axiosInstance.get(`${USERS_API_URL}/active/monthly-trend`),
          axiosInstance.get(`${USERS_API_URL}/highest-selling`),
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
  }, [localStorage.getItem('adminToken')]);

  return (
    <UsersContext.Provider value={state}>
      {children}
    </UsersContext.Provider>
  );
};
