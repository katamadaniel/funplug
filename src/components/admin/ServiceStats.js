import React, { useContext, useMemo } from 'react';
import { ServicesContext } from '../../contexts/ServicesContext';
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

const SERVICE_TYPE_COLORS = {
  Hall: '#1976d2',
  Outdoor: '#2e7d32',
  Stadium: '#ef6c00',
  Conference: '#9c27b0',
  default: '#607d8b',
};

const ServiceStats = () => {
  const {
    totalBookings,
    mostBookedServices,
    totalBookingAmount,
    serviceTypeMonthlyBookings,
    loading,
    error,
  } = useContext(ServicesContext);

  /**
   * Normalize chart data:
   * One row per month, serviceTypes stacked side-by-side
   */
  const serviceTypeChartData = useMemo(() => {
    if (!serviceTypeMonthlyBookings?.length) return [];

    const grouped = {};

    serviceTypeMonthlyBookings.forEach(item => {
      const monthLabel = moment()
        .month(item.month - 1)
        .format('MMM');

      if (!grouped[monthLabel]) grouped[monthLabel] = { month: monthLabel };

      grouped[monthLabel][item.serviceType] = item.bookingCount;
    });

    return Object.values(grouped);
  }, [serviceTypeMonthlyBookings]);

  const serviceTypes = useMemo(() => {
    if (!serviceTypeMonthlyBookings?.length) return [];
    return [...new Set(serviceTypeMonthlyBookings.map(s => s.serviceType))];
  }, [serviceTypeMonthlyBookings]);

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
      <Typography variant="h5">Total Service Bookings</Typography>
      <Typography variant="h4" color="primary">{totalBookings}</Typography>

      <Typography variant="h5" mt={2}>Total Booking Amount</Typography>
      <Typography variant="h4" color="secondary">
        Ksh.{(totalBookingAmount || 0).toLocaleString()}
      </Typography>

      {/* ===== Chart ===== */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" mb={2}>
          Monthly Bookings by Service Type
        </Typography>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={serviceTypeChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            {serviceTypes.map(type => (
              <Bar
                key={type}
                dataKey={type}
                fill={SERVICE_TYPE_COLORS[type] || SERVICE_TYPE_COLORS.default}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* ===== Most Booked Services ===== */}
      <Typography variant="h5" mt={4}>
        Top 10 Most Booked Services
      </Typography>

      <List>
        {mostBookedServices.map((service, index) => (
          <React.Fragment key={service._id}>
            <ListItem>
              <ListItemText
                primary={`${index + 1}. ${service.name} (${service.serviceType})`}
                secondary={`Bookings: ${service.bookingCount} | Amount: Ksh.${(service.totalAmount || 0).toLocaleString()}`}
              />
            </ListItem>
            {index < mostBookedServices.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default ServiceStats;
