import React, { useContext, useMemo } from 'react';
import { PerformanceContext } from '../../contexts/PerformanceContext';
import {
  Typography,
  CircularProgress,
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import moment from 'moment';

const ART_TYPE_COLORS = {
  Hall: '#1976d2',
  Outdoor: '#2e7d32',
  Stadium: '#ef6c00',
  Conference: '#9c27b0',
  default: '#607d8b',
};

const PerformanceStats = () => {
  const {
    totalBookings,
    mostBookedCards,
    totalBookingAmount,
    artTypeMonthlyBookings,
    loading,
    error,
  } = useContext(PerformanceContext);

  /**
   * Normalize chart data:
   * One row per month, artTypes stacked side-by-side
   */
  const artTypeChartData = useMemo(() => {
    if (!artTypeMonthlyBookings?.length) return[];
    
    const grouped = {};

    artTypeMonthlyBookings.forEach(item => {
      const monthLabel = moment()
        .month(item.month - 1)
        .format('MMM');

      if (!grouped[monthLabel]) grouped[monthLabel] = { month: monthLabel };

      grouped[monthLabel][item.artType] = item.bookingCount;
    });

    return Object.values(grouped);
  }, [artTypeMonthlyBookings]);

  const artTypes = useMemo(() => {
    if (!artTypeMonthlyBookings?.length) return [];
    return [...new Set(artTypeMonthlyBookings.map(c => c.artType))];
  }, [artTypeMonthlyBookings]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
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
    <Box mt={4}>
      {/* ===== Summary ===== */}
      <Typography variant="h5">Total Card Bookings</Typography>
      <Typography variant="h4" color="primary">{totalBookings}</Typography>

      <Typography variant="h5" mt={2}>Total Booking Amount</Typography>
      <Typography variant="h4" color="secondary">
        Ksh.{(totalBookingAmount || 0).toLocaleString()}
      </Typography>

      {/* ===== Chart ===== */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" mb={2}>
          Monthly Bookings by Art Type
        </Typography>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={artTypeChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            {artTypes.map(type => (
              <Bar
                key={type}
                dataKey={type}
                fill={ART_TYPE_COLORS[type] || ART_TYPE_COLORS.default}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* ===== Most Booked Cards ===== */}
      <Typography variant="h5" mt={4}>
        Top 10 Most Booked Cards
      </Typography>

      <List>
        {mostBookedCards.map((card, index) => (
          <React.Fragment key={card._id}>
            <ListItem>
              <ListItemText
                primary={`${index + 1}. ${card.name} (${card.artType})`}
                secondary={`Bookings: ${card.bookingCount} | Amount: Ksh.${(card.totalAmount || 0).toLocaleString()}`}
              />
            </ListItem>
            {index < mostBookedCards.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default PerformanceStats;
