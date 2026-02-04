import React, { useContext, useMemo } from 'react';
import { TicketsContext } from '../../contexts/TicketsContext';
import {
  Typography,
  Alert,
  Box,
  CircularProgress,
  Grid,
  Paper,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import moment from 'moment';

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    let current = 0;
    const step = value / 40;

    const timer = setInterval(() => {
      current += step;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, 20);

    return () => clearInterval(timer);
  }, [value]);

  return <>{display.toLocaleString()}</>;
};

const TicketStats = () => {
  const {
    totalTicketsWeekly = 0,
    totalTicketsMonthly = 0,
    totalRevenueWeekly = 0,
    totalRevenueMonthly = 0,
    dailyTicketSales,
    dailyRevenue,
    yearlyTicketTrend,
    yearlyRevenueTrend,
    loading,
    error,
  } = useContext(TicketsContext) || {};

  /* ===== Normalize Daily ===== */
  const dailyTicketsData = useMemo(
    () =>
      dailyTicketSales.map(d => ({
        date: moment(d.date).format('DD MMM'),
        tickets: d.totalTickets,
      })),
    [dailyTicketSales]
  );

  const dailyRevenueData = useMemo(
    () =>
      dailyRevenue.map(d => ({
        date: moment(d.date).format('DD MMM'),
        revenue: d.totalRevenue,
      })),
    [dailyRevenue]
  );

  /* ===== Normalize Yearly ===== */
  const yearlyTicketsData = useMemo(
    () =>
      yearlyTicketTrend.map(d => ({
        month: moment().month(d.month - 1).format('MMM'),
        tickets: d.totalTickets,
      })),
    [yearlyTicketTrend]
  );

  const yearlyRevenueData = useMemo(
    () =>
      yearlyRevenueTrend.map(d => ({
        month: moment().month(d.month - 1).format('MMM'),
        revenue: d.totalRevenue,
      })),
    [yearlyRevenueTrend]
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* ===== Animated Stat Cards ===== */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="caption">Weekly Tickets</Typography>
            <Typography variant="h4">
              <AnimatedNumber value={totalTicketsWeekly} />
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="caption">Monthly Tickets</Typography>
            <Typography variant="h4">
              <AnimatedNumber value={totalTicketsMonthly} />
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="caption">Weekly Revenue</Typography>
            <Typography variant="h4">
              KES <AnimatedNumber value={totalRevenueWeekly} />
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="caption">Monthly Revenue</Typography>
            <Typography variant="h4">
              KES <AnimatedNumber value={totalRevenueMonthly} />
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ===== Daily Charts ===== */}
      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Daily Tickets Sold</Typography>
            <ResponsiveContainer height={300}>
                <LineChart data={dailyTicketsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line dataKey="tickets" strokeWidth={3} />
                </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Daily Revenue</Typography>
            <ResponsiveContainer height={300}>
                <LineChart data={dailyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="revenue" strokeWidth={3} />
                </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* ===== Yearly Charts ===== */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Yearly Tickets Trend</Typography>
            <ResponsiveContainer height={300}>
                <BarChart data={yearlyTicketsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="tickets" fill= "#1976d2" />
                </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Yearly Revenue Trend</Typography>
            <ResponsiveContainer height={300}>
                <BarChart data={yearlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill= "#1976d2" />
                </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TicketStats;
