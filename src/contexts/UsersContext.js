import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const USERS_API_URL = `${API_URL}/api/users`;

export const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [dailyActiveUsers, setDailyActiveUsers] = useState(0);
  const [weeklyActiveUsers, setWeeklyActiveUsers] = useState(0);
  const [monthlyActiveUsers, setMonthlyActiveUsers] = useState(0);
  const [highestSellingUsers, setHighestSellingUsers] = useState([]);

  useEffect(() => {
    // Fetch total users
    const fetchTotalUsers = async () => {
      try {
        const response = await axios.get(`${USERS_API_URL}/total`);
        setTotalUsers(response.data.count);
      } catch (error) {
        console.error('Error fetching total users:', error);
      }
    }; 

    // Fetch daily active users
    const fetchDailyActiveUsers = async () => {
      try {
        const response = await axios.get(`${USERS_API_URL}/active/daily`);
        setDailyActiveUsers(response.data.count);
      } catch (error) {
        console.error('Error fetching daily active users:', error);
      }
    };

    // Fetch weekly active users
    const fetchWeeklyActiveUsers = async () => {
      try {
        const response = await axios.get(`${USERS_API_URL}/active/weekly`);
        setWeeklyActiveUsers(response.data.count);
      } catch (error) {
        console.error('Error fetching weekly active users:', error);
      }
    };

    // Fetch monthly active users
    const fetchMonthlyActiveUsers = async () => {
      try {
        const response = await axios.get(`${USERS_API_URL}/active/monthly`);
        setMonthlyActiveUsers(response.data.count);
      } catch (error) {
        console.error('Error fetching monthly active users:', error);
      }
    };

    // Fetch highest selling users
    const fetchHighestSellingUsers = async () => {
      try {
        const response = await axios.get(`${USERS_API_URL}/highest-selling`);
        setHighestSellingUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching highest selling users:', error);
      }
    };

    fetchTotalUsers();
    fetchDailyActiveUsers();
    fetchWeeklyActiveUsers();
    fetchMonthlyActiveUsers();
    fetchHighestSellingUsers();
  }, []);

  return (
    <UsersContext.Provider
      value={{
        totalUsers,
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        highestSellingUsers,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};
